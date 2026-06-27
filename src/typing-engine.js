// Core Typing Gameplay Engine for Khmer & English Typing Master

const TypingEngine = {
  textToType: "",
  language: "en", // "en" or "kh"
  mode: "practice", // "practice", "timeattack", "story", "exam"
  
  // State variables
  currentIndex: 0,
  correctChars: 0,
  incorrectChars: 0,
  totalTyped: 0,
  errorsCount: 0, // accumulated unique errors for accuracy
  typedHistory: [], // Track what user typed at each index
  
  startTime: null,
  timerInterval: null,
  timeLeft: 0,
  totalTimeLimit: 0, // in seconds
  
  isActive: false,
  isPaused: false,
  noBackspace: false, // strict exam mode constraint

  // Callback events
  onCompleteCallback: null,
  onTickCallback: null,
  onProgressCallback: null,

  init() {
    const rawInput = document.getElementById("typing-raw-input");
    if (!rawInput) return;

    // Listen to input events (handles keyboard inputs + native OS Unicode compositions!)
    rawInput.addEventListener("input", (e) => this.handleInput(e));
    
    // Focus catcher to keep hidden input focused when clicking display
    const display = document.getElementById("typing-text-display");
    if (display) {
      display.addEventListener("click", () => {
        if (this.isActive && !this.isPaused) {
          rawInput.focus();
        }
      });
    }

    // Keydown for modifier tracking (Shift/CapsLock) on virtual keyboard
    window.addEventListener("keydown", (e) => {
      if (!this.isActive || this.isPaused) return;
      if (e.key === "Shift") {
        VirtualKeyboard.setShift(true);
      }
      if (e.key === "CapsLock") {
        VirtualKeyboard.setCapsLock(e.getModifierState("CapsLock"));
      }
      VirtualKeyboard.pressKey(e.code);

      // Play click sound
      if (typeof Sounds !== "undefined") {
        Sounds.playClick();
      }

      if (e.key === "Backspace") {
        this.handleBackspace(e);
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        VirtualKeyboard.setShift(false);
      }
      VirtualKeyboard.releaseKey(e.code);
    });
  },

  start(text, language, mode, timeLimit = 0, onComplete = null, onTick = null) {
    this.textToType = text.trim();
    this.language = language;
    this.mode = mode;
    this.onCompleteCallback = onComplete;
    this.onTickCallback = onTick;
    
    this.currentIndex = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;
    this.totalTyped = 0;
    this.errorsCount = 0;
    this.typedHistory = [];
    
    this.startTime = null;
    this.isActive = true;
    this.isPaused = false;
    this.timeLeft = timeLimit;
    this.totalTimeLimit = timeLimit;
    
    // Exam mode constraints: no backspace allowed
    this.noBackspace = (mode === "exam");

    const rawInput = document.getElementById("typing-raw-input");
    if (rawInput) {
      rawInput.value = "";
      rawInput.focus();
    }

    // Initialize virtual keyboard layout
    if (typeof VirtualKeyboard !== "undefined") {
      VirtualKeyboard.setLayout(language === "en" ? "qwerty" : (window.selectedKeyboardLayout || "nida"));
      VirtualKeyboard.setShift(false);
    }

    this.renderDisplay();
    this.updateStats();

    // Start timer interval if timeLimit is set
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (timeLimit > 0) {
      this.timerInterval = setInterval(() => this.tick(), 1000);
    }
  },

  stop() {
    this.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const rawInput = document.getElementById("typing-raw-input");
    if (rawInput) rawInput.blur();
  },

  tick() {
    if (!this.isActive || this.isPaused) return;

    this.timeLeft--;
    this.updateStats();

    if (this.onTickCallback) {
      this.onTickCallback(this.timeLeft);
    }

    if (this.timeLeft <= 0) {
      this.stop();
      this.complete();
    }
  },

  handleInput(event) {
    if (!this.isActive || this.isPaused) return;

    // Initialize start time on first keypress
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const rawInput = document.getElementById("typing-raw-input");
    const typedText = rawInput.value;
    
    if (typedText.length > 0) {
      for (let i = 0; i < typedText.length; i++) {
        const typedChar = typedText[i];
        const expectedChar = this.textToType[this.currentIndex];
        
        this.totalTyped++;
        this.typedHistory[this.currentIndex] = typedChar;

        if (typedChar === expectedChar) {
          // Correct character typed
          this.correctChars++;
          this.currentIndex++;
        } else {
          // Incorrect character
          this.incorrectChars++;
          this.errorsCount++;
          
          // Play buzz sound
          if (typeof Sounds !== "undefined") {
            Sounds.playBuzz();
          }

          // If not in Exam mode (which blocks backspace/allows errors), we can let them continue
          if (!this.noBackspace) {
            this.currentIndex++;
          }
        }

        // Check if finished
        if (this.currentIndex >= this.textToType.length) {
          break;
        }
      }

      rawInput.value = ""; // clear buffer for next character check
      this.renderDisplay();
      this.updateStats();

      // Check if finished
      if (this.currentIndex >= this.textToType.length) {
        this.stop();
        this.complete();
      }
    }
  },

  handleBackspace(event) {
    if (this.noBackspace) {
      event.preventDefault();
      return;
    }

    if (this.currentIndex > 0) {
      event.preventDefault();
      this.currentIndex--;
      
      const deletedChar = this.typedHistory[this.currentIndex];
      const expectedChar = this.textToType[this.currentIndex];

      if (deletedChar === expectedChar) {
        this.correctChars = Math.max(0, this.correctChars - 1);
      } else {
        this.incorrectChars = Math.max(0, this.incorrectChars - 1);
      }

      this.typedHistory[this.currentIndex] = undefined;

      this.renderDisplay();
      this.updateStats();
    }
  },

  renderDisplay() {
    const display = document.getElementById("typing-text-display");
    if (!display) return;

    // Apply appropriate font styling
    if (this.language === "kh") {
      display.className = "typing-text-display khmer-font";
    } else {
      display.className = "typing-text-display";
    }

    display.innerHTML = "";

    // Adjust font size based on settings
    const fontSize = window.selectedFontSize || 22;
    display.style.fontSize = `${fontSize}px`;

    // Render characters
    for (let i = 0; i < this.textToType.length; i++) {
      const span = document.createElement("span");
      span.textContent = this.textToType[i];

      if (i < this.currentIndex) {
        // Style character depending on correctness in history
        if (this.typedHistory[i] === this.textToType[i]) {
          span.className = "char-correct";
        } else {
          span.className = "char-incorrect";
        }
      } else if (i === this.currentIndex) {
        span.className = "char-current";
      }

      display.appendChild(span);
    }

    // Scroll display to keep the current character visible
    const currentEl = display.querySelector(".char-current");
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: "auto", block: "nearest" });
    }

    // Highlight target key on virtual keyboard
    if (typeof VirtualKeyboard !== "undefined") {
      const nextChar = this.textToType[this.currentIndex] || "";
      VirtualKeyboard.highlightTargetKey(nextChar, this.language);
    }
  },

  updateStats() {
    const metrics = this.getMetrics();

    // Update gameplay UI metrics
    const wpmEl = document.getElementById("game-wpm");
    const accEl = document.getElementById("game-accuracy");
    const timeEl = document.getElementById("game-time");

    if (wpmEl) wpmEl.textContent = metrics.wpm;
    if (accEl) accEl.textContent = `${metrics.accuracy}%`;
    
    if (timeEl) {
      if (this.totalTimeLimit > 0) {
        timeEl.textContent = `${this.timeLeft}s`;
      } else {
        // Show elapsed time in practice mode
        const elapsed = this.getElapsedTime();
        timeEl.textContent = `${Math.round(elapsed)}s`;
      }
    }
  },

  getElapsedTime() {
    if (!this.startTime) return 0;
    return (Date.now() - this.startTime) / 1000; // in seconds
  },

  getMetrics() {
    const elapsedSeconds = this.totalTimeLimit > 0 
      ? (this.totalTimeLimit - this.timeLeft) 
      : this.getElapsedTime();
    
    const elapsedMinutes = elapsedSeconds / 60 || 0.001; // avoid divide by zero

    // WPM = (correct characters / 5) / time_in_minutes
    const wpm = elapsedSeconds > 1 
      ? Math.round((this.correctChars / 5) / elapsedMinutes) 
      : 0;

    // Accuracy = (correct keys / total keys typed) * 100
    const accuracy = this.totalTyped > 0 
      ? Math.round(((this.totalTyped - this.errorsCount) / this.totalTyped) * 100) 
      : 100;

    // Cap accuracy at 0-100
    const clampedAccuracy = Math.max(0, Math.min(100, accuracy));

    // Calculate score
    const score = Math.round(wpm * 10 + this.correctChars * 2 - this.errorsCount * 5);

    return {
      wpm,
      accuracy: clampedAccuracy,
      timeSpent: Math.round(elapsedSeconds),
      score: Math.max(0, score)
    };
  },

  complete() {
    const metrics = this.getMetrics();
    
    // Play success sound
    if (typeof Sounds !== "undefined") {
      Sounds.playSuccess();
    }

    // Trigger confetti effects for high accuracy
    if (metrics.accuracy >= 90) {
      this.triggerConfetti();
    }

    if (this.onCompleteCallback) {
      this.onCompleteCallback(metrics);
    }
  },

  triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#db2777"];
    const particles = [];

    // Create 100 particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * -100 - 20,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    let angle = 0;
    const animationLoop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let finished = true;
      particles.forEach(p => {
        angle += 0.01;
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(angle);
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle - p.r/2) * 8;

        if (p.y < window.innerHeight) {
          finished = false;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (!finished) {
        requestAnimationFrame(animationLoop);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    animationLoop();
  }
};

window.TypingEngine = TypingEngine;
