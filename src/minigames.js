// Mini-Games Engine for Khmer & English Typing Master

const MiniGames = {
  activeGame: null, // "falling", "zombie", "race", "memory"
  language: "en",
  canvasId: "game-canvas",
  canvas: null,
  ctx: null,
  
  // Game loops
  animationFrameId: null,
  gameState: {},
  
  // Word banks
  wordsEn: ["master", "typing", "keyboard", "unicode", "speed", "accuracy", "practice", "challenge", "lesson", "computer", "engine", "zombie", "desktop", "window", "light", "dark", "sound", "leaderboard", "achievement", "report"],
  wordsKh: ["កម្ពុជា", "អក្សរ", "ភាសា", "សាលា", "សន្តិភាព", "អភិវឌ្ឍ", "ស្រឡាញ់", "ចំណេះដឹង", "បច្ចេកវិទ្យា", "កុំព្យូទ័រ", "ម្រាមដៃ", "ស្ទាត់ជំនាញ", "ល្បឿន", "ពិន្ទុ", "ជោគជ័យ", "ព្យាយាម", "ក្ដារចុច", "សិស្ស", "គ្រូបង្រៀន", "សៀវភៅ"],

  init(canvasId) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    // Listen for window resize to scale canvas
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  },

  start(gameName, language, onGameOver) {
    this.stop();
    this.activeGame = gameName;
    this.language = language;
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      inputBuffer: "",
      entities: [],
      spawnTimer: 0,
      gameOverCallback: onGameOver,
      isFinished: false,
      speedMultiplier: 1.0,
      lastSpawnTime: 0
    };

    this.resizeCanvas();

    if (gameName === "falling") {
      this.initFallingWords();
    } else if (gameName === "zombie") {
      this.initZombieShooter();
    } else if (gameName === "race") {
      this.initTypingRace();
    } else if (gameName === "memory") {
      this.initMemoryTyping();
    }

    this.gameLoop();
  },

  stop() {
    this.activeGame = null;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Hide overlay when stopped
    const container = document.getElementById("game-race-text-container");
    if (container) {
      container.style.display = "none";
    }

    // Clear keyboard highlights
    if (typeof VirtualKeyboard !== "undefined") {
      document.querySelectorAll(".kbd-key.key-target").forEach(el => {
        el.classList.remove("key-target");
      });
    }
  },

  gameLoop() {
    if (!this.activeGame || this.gameState.isFinished) return;

    this.update();
    this.draw();

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  },

  // GAME 1: Falling Words
  initFallingWords() {
    const diffSelect = document.getElementById("game-diff-select");
    const difficulty = diffSelect ? diffSelect.value : "normal";
    
    if (difficulty === "easy") {
      this.gameState.spawnRate = 3000;
      this.gameState.fallSpeed = 0.5;
    } else if (difficulty === "hard") {
      this.gameState.spawnRate = 1600;
      this.gameState.fallSpeed = 1.2;
    } else {
      this.gameState.spawnRate = 2200;
      this.gameState.fallSpeed = 0.8;
    }
  },

  updateFallingWords() {
    const now = Date.now();
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // Spawn new word
    if (now - this.gameState.lastSpawnTime > this.gameState.spawnRate) {
      const wordList = this.language === "en" ? this.wordsEn : this.wordsKh;
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      
      this.gameState.entities.push({
        text: randomWord,
        x: Math.random() * (w - 150) + 75,
        y: -20,
        speed: (Math.random() * 0.4 + 0.6) * this.gameState.fallSpeed
      });
      this.gameState.lastSpawnTime = now;
      
      // Speed up slowly
      this.gameState.fallSpeed += 0.02;
      this.gameState.spawnRate = Math.max(900, this.gameState.spawnRate - 50);
    }

    // Update positions
    this.gameState.entities.forEach((entity, idx) => {
      entity.y += entity.speed;

      // Check boundary hit
      if (entity.y > h - 30) {
        this.gameState.entities.splice(idx, 1);
        this.gameState.lives--;
        if (typeof Sounds !== "undefined") Sounds.playBuzz();

        if (this.gameState.lives <= 0) {
          this.endGame();
        }
      }
    });
  },

  drawFallingWords() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    
    // Clear and draw background
    this.ctx.fillStyle = "#020617";
    this.ctx.fillRect(0, 0, w, h);

    // Grid lines for styling
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }

    // Draw words
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = this.language === "kh" ? "bold 20px 'Kantumruy Pro'" : "bold 18px 'Inter'";

    this.gameState.entities.forEach(entity => {
      const typed = this.gameState.inputBuffer.trim();
      if (typed && entity.text.startsWith(typed)) {
        const matched = typed;
        const remaining = entity.text.substring(typed.length);

        const matchedWidth = this.ctx.measureText(matched).width;
        const remainingWidth = this.ctx.measureText(remaining).width;
        const totalWidth = matchedWidth + remainingWidth;
        const startX = entity.x - totalWidth / 2;

        this.ctx.textAlign = "left";

        // Draw matched prefix (green)
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#10b981";
        this.ctx.fillStyle = "#10b981";
        this.ctx.fillText(matched, startX, entity.y);

        // Draw remaining characters (cyan)
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#06b6d4";
        this.ctx.fillStyle = "#06b6d4";
        this.ctx.fillText(remaining, startX + matchedWidth, entity.y);
      } else {
        // Normal rendering (cyan)
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#06b6d4";
        this.ctx.fillStyle = "#06b6d4";
        this.ctx.textAlign = "center";
        this.ctx.fillText(entity.text, entity.x, entity.y);
      }
      this.ctx.shadowBlur = 0; // reset
      this.ctx.textAlign = "center"; // restore
    });

    // Draw bottom danger line
    this.ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h - 30);
    this.ctx.lineTo(w, h - 30);
    this.ctx.stroke();

    this.drawStatsOverlay(w, h);
  },

  // GAME 2: Zombie Shooter
  initZombieShooter() {
    const diffSelect = document.getElementById("game-diff-select");
    const difficulty = diffSelect ? diffSelect.value : "normal";
    
    if (difficulty === "easy") {
      this.gameState.spawnRate = 4000;
      this.gameState.zombieSpeed = 0.3;
    } else if (difficulty === "hard") {
      this.gameState.spawnRate = 2000;
      this.gameState.zombieSpeed = 0.8;
    } else {
      this.gameState.spawnRate = 3000;
      this.gameState.zombieSpeed = 0.5;
    }
  },

  updateZombieShooter() {
    const now = Date.now();
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // Spawn new zombie on right edge
    if (now - this.gameState.lastSpawnTime > this.gameState.spawnRate) {
      const wordList = this.language === "en" ? this.wordsEn : this.wordsKh;
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      
      this.gameState.entities.push({
        text: randomWord,
        x: w + 20,
        y: Math.random() * (h - 180) + 80,
        speed: (Math.random() * 0.3 + 0.7) * this.gameState.zombieSpeed,
        isDying: false,
        deathTimer: 0
      });
      this.gameState.lastSpawnTime = now;
      this.gameState.zombieSpeed += 0.015;
      this.gameState.spawnRate = Math.max(1200, this.gameState.spawnRate - 80);
    }

    // Update positions
    this.gameState.entities.forEach((entity, idx) => {
      if (entity.isDying) {
        entity.deathTimer += 0.05;
        if (entity.deathTimer >= 1.0) {
          this.gameState.entities.splice(idx, 1);
        }
        return;
      }

      entity.x -= entity.speed;

      // Check defense barrier hit (left edge at x = 80)
      if (entity.x < 80) {
        this.gameState.entities.splice(idx, 1);
        this.gameState.lives--;
        if (typeof Sounds !== "undefined") Sounds.playBuzz();

        if (this.gameState.lives <= 0) {
          this.endGame();
        }
      }
    });

    // Update projectiles
    if (this.gameState.projectiles) {
      this.gameState.projectiles.forEach((proj, idx) => {
        proj.x += proj.vx;
        proj.y += proj.vy;

        // Collision check
        const target = proj.target;
        const dx = target.x - proj.x;
        const dy = target.y - proj.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 15) {
          target.isDying = true;
          this.gameState.projectiles.splice(idx, 1);
          if (typeof Sounds !== "undefined") Sounds.playSuccess();
        }
      });
    }
  },

  drawZombieShooter() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.fillStyle = "#090d16";
    this.ctx.fillRect(0, 0, w, h);

    // Draw Left Defense Tower/Gate
    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(0, 0, 70, h);
    this.ctx.strokeStyle = "#334155";
    this.ctx.lineWidth = 3;
    ctxDrawLine(this.ctx, 70, 0, 70, h);

    // Laser battery indicators
    this.ctx.fillStyle = "#ef4444";
    this.ctx.beginPath();
    this.ctx.arc(60, h/2 - 50, 6, 0, Math.PI*2);
    this.ctx.arc(60, h/2 + 50, 6, 0, Math.PI*2);
    this.ctx.fill();

    // Draw Zombies (Represented as red glowing boxes with text labels)
    this.gameState.entities.forEach(zombie => {
      if (zombie.isDying) {
        // Explosion particle drawing
        this.ctx.fillStyle = `rgba(239, 68, 68, ${1 - zombie.deathTimer})`;
        this.ctx.beginPath();
        this.ctx.arc(zombie.x, zombie.y, zombie.deathTimer * 40 + 10, 0, Math.PI*2);
        this.ctx.fill();
        return;
      }

      // Draw Zombie rectangle body
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = "#ef4444";
      this.ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
      this.ctx.fillRect(zombie.x - 20, zombie.y - 20, 40, 40);
      
      // Zombie eyes glow
      this.ctx.fillStyle = "#f59e0b";
      this.ctx.fillRect(zombie.x - 12, zombie.y - 8, 6, 6);
      this.ctx.fillRect(zombie.x + 6, zombie.y - 8, 6, 6);
      
      this.ctx.shadowBlur = 0;

      const typed = this.gameState.inputBuffer.trim();
      this.ctx.font = this.language === "kh" ? "bold 16px 'Kantumruy Pro'" : "bold 15px 'Inter'";
      
      if (typed && zombie.text.startsWith(typed)) {
        const matched = typed;
        const remaining = zombie.text.substring(typed.length);

        const matchedWidth = this.ctx.measureText(matched).width;
        const remainingWidth = this.ctx.measureText(remaining).width;
        const totalWidth = matchedWidth + remainingWidth;
        const startX = zombie.x - totalWidth / 2;

        this.ctx.textAlign = "left";
        
        // Draw matched prefix (green)
        this.ctx.fillStyle = "#10b981";
        this.ctx.fillText(matched, startX, zombie.y - 30);

        // Draw remaining characters (white)
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText(remaining, startX + matchedWidth, zombie.y - 30);
      } else {
        // Normal rendering
        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.fillText(zombie.text, zombie.x, zombie.y - 30);
      }
      this.ctx.textAlign = "center"; // restore
    });

    // Draw projectiles
    if (this.gameState.projectiles) {
      this.ctx.strokeStyle = "#38bdf8";
      this.ctx.lineWidth = 3;
      this.gameState.projectiles.forEach(proj => {
        this.ctx.beginPath();
        this.ctx.moveTo(proj.x - 15, proj.y);
        this.ctx.lineTo(proj.x, proj.y);
        this.ctx.stroke();
      });
    }

    this.drawStatsOverlay(w, h);
  },

  // GAME 3: Typing Race
  initTypingRace() {
    const paragraphsEn = [
      "Typing is a critical modern skill that bridges the gap between human thought and digital action. Practice daily to master it.",
      "A quick brown fox jumps over the lazy dog. This classic sentence contains every letter in the English alphabet.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep pushing your limits.",
      "The digital era requires rapid communication. Fast typing allows you to express ideas clearly and efficiently.",
      "Practice makes perfect when learning any new skill. Consistent typing practice builds muscle memory over time."
    ];

    const paragraphsKh = [
      "ការវាយអក្សរគឺជាជំនាញដ៏សំខាន់មួយក្នុងយុគសម័យឌីជីថល ដែលជួយសម្រួលដល់ការប្រាស្រ័យទាក់ទងគ្នា និងការងារប្រចាំថ្ងៃឱ្យកាន់តែមានប្រសិទ្ធភាពខ្ពស់។",
      "ប្រាសាទអង្គរវត្តគឺជាអច្ឆរិយវត្ថុដ៏ល្បីល្បាញរបស់ប្រទេសកម្ពុជា ដែលតំណាងឱ្យវប្បធម៌ និងអរិយធម៌ដ៏រុងរឿងរបស់បុព្វបុរសខ្មែរគ្រប់ជំនាន់។",
      "ការហ្វឹកហាត់ជារៀងរាល់ថ្ងៃធ្វើឱ្យម្រាមដៃរបស់អ្នកកាន់តែស្ទាត់ជំនាញ និងបង្កើនល្បឿននៃការវាយអក្សរបានលឿនជាងមុនដោយមិនចាំបាច់មើលក្ដារចុច។",
      "ចំណេះដឹងគឺជាទ្រព្យសម្បត្តិដ៏មានតម្លៃបំផុតដែលគ្មាននរណាម្នាក់អាចលួចយកបានឡើយ ចូរខិតខំរៀនសូត្រដើម្បីអនាគតដ៏ភ្លឺស្វាងរបស់អ្នក។"
    ];

    const list = this.language === "kh" ? paragraphsKh : paragraphsEn;
    this.gameState.paragraphs = list;
    this.gameState.raceText = list[Math.floor(Math.random() * list.length)];
    this.gameState.playerProgress = 0;
    this.gameState.aiProgress1 = 0;
    this.gameState.aiProgress2 = 0;
    this.gameState.currentIndex = 0;
    this.gameState.typedHistory = [];

    const diffSelect = document.getElementById("game-diff-select");
    const difficulty = diffSelect ? diffSelect.value : "normal";

    if (difficulty === "easy") {
      this.gameState.aiSpeed1 = 0.015; // ~22 WPM
      this.gameState.aiSpeed2 = 0.020; // ~29 WPM
    } else if (difficulty === "hard") {
      this.gameState.aiSpeed1 = 0.050; // ~72 WPM
      this.gameState.aiSpeed2 = 0.060; // ~86 WPM
    } else {
      this.gameState.aiSpeed1 = 0.028; // ~40 WPM
      this.gameState.aiSpeed2 = 0.035; // ~50 WPM
    }
    
    this.gameState.startTime = Date.now();

    // Show HTML typing race overlay
    const container = document.getElementById("game-race-text-container");
    if (container) {
      container.style.display = "block";
      if (this.language === "kh") {
        container.className = "game-race-text-display khmer-font";
      } else {
        container.className = "game-race-text-display";
      }
      
      // Adjust font size based on settings, but make it slightly larger
      const userFontSize = window.selectedFontSize || 22;
      container.style.fontSize = `${userFontSize + 4}px`;

      this.renderRaceText();
    }
  },

  updateTypingRace() {
    if (this.gameState.isFinished) return;

    // AI Cars advance at steady rate
    const elapsed = (Date.now() - this.gameState.startTime) / 1000;
    this.gameState.aiProgress1 = Math.min(1.0, elapsed * this.gameState.aiSpeed1);
    this.gameState.aiProgress2 = Math.min(1.0, elapsed * this.gameState.aiSpeed2);

    // Win/Lose check
    if (this.gameState.playerProgress >= 1.0) {
      this.gameState.isFinished = true;
      this.gameState.winner = "Player";
      
      // Calculate WPM based on actual elapsed time
      const elapsedSeconds = (Date.now() - this.gameState.startTime) / 1000;
      const minutes = Math.max(0.01, elapsedSeconds / 60);
      const words = this.gameState.raceText.length / 5;
      const wpm = Math.round(words / minutes) || 0;
      this.gameState.score = wpm * 10; // app.js records wpm = score / 10

      if (typeof Sounds !== "undefined") Sounds.playSuccess();
      this.endGame();
    } else if (this.gameState.aiProgress1 >= 1.0 || this.gameState.aiProgress2 >= 1.0) {
      this.gameState.isFinished = true;
      this.gameState.winner = this.gameState.aiProgress2 >= 1.0 ? "Red AI" : "Blue AI";
      
      // Calculate partial WPM at moment of defeat
      const elapsedSeconds = (Date.now() - this.gameState.startTime) / 1000;
      const minutes = Math.max(0.01, elapsedSeconds / 60);
      const correctPrefixLen = Math.floor(this.gameState.playerProgress * this.gameState.raceText.length);
      const words = correctPrefixLen / 5;
      const wpm = Math.round(words / minutes) || 0;
      this.gameState.score = wpm * 10;

      if (typeof Sounds !== "undefined") Sounds.playBuzz();
      this.endGame();
    }
  },

  drawTypingRace() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.fillStyle = "#1e293b";
    this.ctx.fillRect(0, 0, w, h);

    // Draw Lanes
    const laneHeight = h / 4;
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 4;
    for (let i = 1; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.setLineDash([15, 15]);
      this.ctx.moveTo(0, laneHeight * i);
      this.ctx.lineTo(w, laneHeight * i);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // Reset

    // Draw Finish Line
    this.ctx.strokeStyle = "#e2e8f0";
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();
    this.ctx.moveTo(w - 60, 0);
    this.ctx.lineTo(w - 60, h);
    this.ctx.stroke();

    // Finish checkered pattern
    this.ctx.fillStyle = "#000";
    for (let y = 0; y < h; y += 20) {
      this.ctx.fillRect(w - 60, y + (y % 40 === 0 ? 0 : 10), 10, 10);
    }

    // Draw Cars (represented as rectangles with labels)
    // Lane 1: Player
    this.drawCar(80 + (w - 180) * this.gameState.playerProgress, laneHeight * 0.5, "Green Player", "#10b981");

    // Lane 2: AI 1
    this.drawCar(80 + (w - 180) * this.gameState.aiProgress1, laneHeight * 1.5, "Blue Bot", "#3b82f6");

    // Lane 3: AI 2
    this.drawCar(80 + (w - 180) * this.gameState.aiProgress2, laneHeight * 2.5, "Red Bot", "#ef4444");

    // Display Prompt background at bottom lane (text is handled by HTML overlay)
    this.ctx.fillStyle = "rgba(0,0,0,0.4)";
    this.ctx.fillRect(0, laneHeight * 3, w, laneHeight);
  },

  renderRaceText() {
    const container = document.getElementById("game-race-text-container");
    if (!container) return;

    container.innerHTML = "";

    const text = this.gameState.raceText || "";
    const currentIndex = this.gameState.currentIndex || 0;
    const typedHistory = this.gameState.typedHistory || [];

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];

      if (i < currentIndex) {
        if (typedHistory[i] === text[i]) {
          span.className = "char-correct";
        } else {
          span.className = "char-incorrect";
        }
      } else if (i === currentIndex) {
        span.className = "char-current";
      }

      container.appendChild(span);
    }

    // Scroll current character into view if container overflows
    const currentEl = container.querySelector(".char-current");
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: "auto", block: "nearest" });
    }

    // Highlight target key on virtual keyboard
    if (typeof VirtualKeyboard !== "undefined") {
      const nextChar = text[currentIndex] || "";
      VirtualKeyboard.highlightTargetKey(nextChar, this.language);
    }
  },

  drawCar(x, y, label, color) {
    // Car Body
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - 30, y - 15, 60, 30);
    
    // Wheels
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(x - 22, y - 20, 12, 5);
    this.ctx.fillRect(x + 10, y - 20, 12, 5);
    this.ctx.fillRect(x - 22, y + 15, 12, 5);
    this.ctx.fillRect(x + 10, y + 15, 12, 5);

    // Label
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 10px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(label, x, y);
  },

  // GAME 4: Memory Typing Challenge
  initMemoryTyping() {
    const wordList = this.language === "en" ? this.wordsEn : this.wordsKh;
    // Assemble 3 random words for memory sequence
    const words = [];
    for (let i = 0; i < 3; i++) {
      words.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }
    this.gameState.targetSentence = words.join(" ");
    
    const diffSelect = document.getElementById("game-diff-select");
    const difficulty = diffSelect ? diffSelect.value : "normal";
    
    this.gameState.initialShowTime = (difficulty === "easy" ? 6.0 : (difficulty === "hard" ? 2.0 : 4.0));
    this.gameState.showTime = this.gameState.initialShowTime;
    this.gameState.phase = "memorize"; // "memorize" or "type"
    this.gameState.startTime = Date.now();
  },

  updateMemoryTyping() {
    if (this.gameState.phase === "memorize") {
      const elapsed = (Date.now() - this.gameState.startTime) / 1000;
      this.gameState.showTime = Math.max(0, this.gameState.initialShowTime - elapsed);
      if (this.gameState.showTime <= 0) {
        this.gameState.phase = "type";
        this.gameState.inputBuffer = "";
        // Focus the hidden raw input
        const rawInput = document.getElementById("typing-raw-input");
        if (rawInput) {
          rawInput.value = "";
          rawInput.focus();
        }
      }
    }
  },

  drawMemoryTyping() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    if (this.gameState.phase === "memorize") {
      this.ctx.fillStyle = "#f59e0b";
      this.ctx.font = "bold 18px 'Inter'";
      this.ctx.fillText(`MEMORIZE THE WORDS: (${Math.ceil(this.gameState.showTime)}s remaining)`, w / 2, h / 2 - 40);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = this.language === "kh" ? "bold 26px 'Kantumruy Pro'" : "bold 24px 'Inter'";
      this.ctx.fillText(this.gameState.targetSentence, w / 2, h / 2 + 10);
    } else {
      this.ctx.fillStyle = "#38bdf8";
      this.ctx.font = "bold 18px 'Inter'";
      this.ctx.fillText("TYPE THE SENTENCE FROM MEMORY:", w / 2, h / 2 - 40);

      this.ctx.font = this.language === "kh" ? "bold 24px 'Kantumruy Pro'" : "bold 22px 'Inter'";
      
      const typed = this.gameState.inputBuffer;
      const target = this.gameState.targetSentence;
      
      let typedMask = "";
      for (let i = 0; i < typed.length; i++) {
        typedMask += (typed[i] === " " ? " " : "*");
      }
      
      let remainingMask = "";
      for (let i = typed.length; i < target.length; i++) {
        remainingMask += (target[i] === " " ? " " : "_");
      }
      
      // Calculate start coordinate for left alignment
      const typedWidth = this.ctx.measureText(typedMask).width;
      const remainingWidth = this.ctx.measureText(remainingMask).width;
      const totalWidth = typedWidth + remainingWidth;
      const startX = w / 2 - totalWidth / 2;
      
      this.ctx.textAlign = "left";
      
      // Typed part (green matching prefix)
      this.ctx.fillStyle = "#10b981";
      this.ctx.fillText(typedMask, startX, h / 2 + 10);
      
      // Remaining part (slate placeholders)
      this.ctx.fillStyle = "#475569";
      this.ctx.fillText(remainingMask, startX + typedWidth, h / 2 + 10);
      
      this.ctx.textAlign = "center"; // restore

      // Helper guide
      this.ctx.fillStyle = "#64748b";
      this.ctx.font = "12px sans-serif";
      this.ctx.fillText("Press Enter when complete to check your accuracy!", w / 2, h / 2 + 60);
    }
  },

  // Helper overlays for stats
  drawStatsOverlay(w, h) {
    this.ctx.fillStyle = "rgba(0,0,0,0.5)";
    this.ctx.fillRect(0, 0, w, 50);

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 13px sans-serif";
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 25);

    // Draw Hearts for lives
    this.ctx.textAlign = "right";
    let heartStr = "";
    for (let i = 0; i < this.gameState.lives; i++) heartStr += "❤️ ";
    this.ctx.fillText(heartStr, w - 20, 25);
  },

  // Input listener routing for active games
  handleGameKeyPress(key, code) {
    if (!this.activeGame || this.gameState.isFinished) return;

    if (this.activeGame === "falling") {
      this.gameState.inputBuffer += key;
      const buffer = this.gameState.inputBuffer.trim();

      // Check matches
      this.gameState.entities.forEach((entity, idx) => {
        if (entity.text === buffer) {
          // Explode / Destroy
          this.gameState.entities.splice(idx, 1);
          this.gameState.score += buffer.length * 10;
          this.gameState.inputBuffer = "";
          if (typeof Sounds !== "undefined") Sounds.playSuccess();
        }
      });

      // Clear buffer if it doesn't match prefix of any entity
      let matchesAny = false;
      this.gameState.entities.forEach(entity => {
        if (entity.text.startsWith(buffer)) matchesAny = true;
      });

      if (!matchesAny) {
        this.gameState.inputBuffer = ""; // reset wrong keys
      }
    } else if (this.activeGame === "zombie") {
      this.gameState.inputBuffer += key;
      const buffer = this.gameState.inputBuffer.trim();

      // Check matches
      this.gameState.entities.forEach(zombie => {
        if (!zombie.isDying && zombie.text === buffer) {
          // Fire project from left tower
          if (!this.gameState.projectiles) this.gameState.projectiles = [];
          
          const yStart = zombie.y > this.canvas.height/2 ? this.canvas.height/2 + 50 : this.canvas.height/2 - 50;
          
          const dx = zombie.x - 70;
          const dy = zombie.y - yStart;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const speed = 12;

          this.gameState.projectiles.push({
            x: 70,
            y: yStart,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            target: zombie
          });

          this.gameState.score += buffer.length * 10;
          this.gameState.inputBuffer = "";
        }
      });

      // Check prefix matching
      let matchesAny = false;
      this.gameState.entities.forEach(zombie => {
        if (!zombie.isDying && zombie.text.startsWith(buffer)) matchesAny = true;
      });

      if (!matchesAny) {
        this.gameState.inputBuffer = "";
      }
    } else if (this.activeGame === "race") {
      const text = this.gameState.raceText;
      const totalLen = text.length;

      if (code === "Backspace") {
        if (this.gameState.currentIndex > 0) {
          this.gameState.currentIndex--;
          this.gameState.typedHistory[this.gameState.currentIndex] = undefined;

          // Re-calculate progress based on correct prefix length
          let correctPrefixLen = 0;
          while (correctPrefixLen < this.gameState.currentIndex && 
                 this.gameState.typedHistory[correctPrefixLen] === this.gameState.raceText[correctPrefixLen]) {
            correctPrefixLen++;
          }
          this.gameState.playerProgress = correctPrefixLen / totalLen;
          this.renderRaceText();
        }
      } else if (key && key.length === 1) {
        const targetChar = text[this.gameState.currentIndex];
        this.gameState.typedHistory[this.gameState.currentIndex] = key;

        if (key === targetChar) {
          if (typeof Sounds !== "undefined") Sounds.playClick();
        } else {
          if (typeof Sounds !== "undefined") Sounds.playBuzz();
        }

        this.gameState.currentIndex++;

        // Re-calculate progress based on correct prefix length
        let correctPrefixLen = 0;
        while (correctPrefixLen < this.gameState.currentIndex && 
               this.gameState.typedHistory[correctPrefixLen] === this.gameState.raceText[correctPrefixLen]) {
          correctPrefixLen++;
        }
        this.gameState.playerProgress = correctPrefixLen / totalLen;

        this.renderRaceText();
      }
    } else if (this.activeGame === "memory") {
      if (this.gameState.phase === "type") {
        if (code === "Enter") {
          // Complete memory match check
          const score = this.checkMemoryMatch();
          this.gameState.score = score;
          this.gameState.isFinished = true;
          this.endGame();
        } else if (code === "Backspace") {
          this.gameState.inputBuffer = this.gameState.inputBuffer.slice(0, -1);
        } else if (key.length === 1) { // normal char
          this.gameState.inputBuffer += key;
        }
      }
    }
  },

  checkMemoryMatch() {
    const target = this.gameState.targetSentence.trim();
    const typed = this.gameState.inputBuffer.trim();

    if (target === typed) {
      if (typeof Sounds !== "undefined") Sounds.playSuccess();
      return 100;
    } else {
      // Calculate basic char match score
      let correct = 0;
      const minLen = Math.min(target.length, typed.length);
      for (let i = 0; i < minLen; i++) {
        if (target[i] === typed[i]) correct++;
      }
      const score = Math.round((correct / target.length) * 100);
      if (typeof Sounds !== "undefined") Sounds.playBuzz();
      return score;
    }
  },

  endGame() {
    const gameName = this.activeGame; // Cache the active game type before stop() sets it to null
    this.gameState.isFinished = true;
    this.stop();
    
    // Draw Game Over overlay
    if (this.ctx && this.canvas) {
      const w = this.canvas.width / (window.devicePixelRatio || 1);
      const h = this.canvas.height / (window.devicePixelRatio || 1);
      
      this.ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      this.ctx.fillRect(0, 0, w, h);

      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      let titleText = "GAME OVER";
      let titleColor = "#ef4444"; // Red

      if (gameName === "race") {
        if (this.gameState.winner === "Player") {
          titleText = "🏆 VICTORY!";
          titleColor = "#10b981"; // Green
        } else {
          titleText = "🏳️ YOU LOSE";
          titleColor = "#ef4444"; // Red
        }
      }

      this.ctx.fillStyle = titleColor;
      this.ctx.font = "bold 32px 'Inter'";
      this.ctx.fillText(titleText, w / 2, h / 2 - 40);

      this.ctx.fillStyle = "#fff";
      this.ctx.font = "16px sans-serif";
      
      if (gameName === "race") {
        const wpm = Math.round(this.gameState.score / 10);
        this.ctx.fillText(`Winner: ${this.gameState.winner}! (Speed: ${wpm} WPM)`, w / 2, h / 2 + 10);
      } else {
        this.ctx.fillText(`Final Score: ${this.gameState.score}`, w / 2, h / 2 + 10);
      }

      this.ctx.fillStyle = "#94a3b8";
      this.ctx.font = "12px sans-serif";
      this.ctx.fillText("Click 'Restart' or select a different game", w / 2, h / 2 + 50);
    }

    if (this.gameState.gameOverCallback) {
      this.gameState.gameOverCallback(this.gameState.score);
    }
  },

  update() {
    if (this.activeGame === "falling") {
      this.updateFallingWords();
    } else if (this.activeGame === "zombie") {
      this.updateZombieShooter();
    } else if (this.activeGame === "race") {
      this.updateTypingRace();
    } else if (this.activeGame === "memory") {
      this.updateMemoryTyping();
    }
  },

  draw() {
    if (this.activeGame === "falling") {
      this.drawFallingWords();
    } else if (this.activeGame === "zombie") {
      this.drawZombieShooter();
    } else if (this.activeGame === "race") {
      this.drawTypingRace();
    } else if (this.activeGame === "memory") {
      this.drawMemoryTyping();
    }
  }
};

function ctxDrawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

window.MiniGames = MiniGames;
