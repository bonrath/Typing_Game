/**
 * Khmer & English Multi-Game Typing Center - Logic
 * Manages game loops, physics engines for 4 typing games, dual-language visual keyboards,
 * QWERTY mappings, Web Audio API sound synthesizers, and scoring dashboards.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Dual Word Library ---
    const wordDatabase = {
        km: {
            easy: ["សាលា", "កាល", "កល", "ដាល", "សកល", "សារ", "ការ", "កាស", "លលា", "សាល", "ដី", "ដូង", "ងងុយ", "លលក", "កាឡា", "សហការ"],
            medium: ["ភាសា", "អក្សរ", "រៀន", "សរសេរ", "អាន", "ខ្មែរ", "កម្ពុជា", "សិស្ស", "ទឹកដី", "មេឃ", "ផ្កា", "សាលារៀន", "ដកឃ្លា", "សំណេរ"],
            hard: ["ប្រជាជន", "វប្បធម៌", "ប្រវត្តិសាស្ត្រ", "សេដ្ឋកិច្ច", "នយោបាយ", "អភិវឌ្ឍន៍", "បច្ចេកវិទ្យា", "សុភមង្គល", "ឯករាជ្យ", "សន្តិភាព"]
        },
        en: {
            easy: ["cat", "dog", "sun", "tree", "blue", "hand", "code", "game", "fast", "book", "word", "keys", "fire", "ship", "gold", "star"],
            medium: ["purple", "keyboard", "computer", "monitor", "science", "physics", "english", "typing", "tutor", "rocket", "laser", "galaxy", "window"],
            hard: ["architecture", "development", "technology", "independence", "sovereignty", "happiness", "democracy", "philosophy", "environment", "civilization"]
        }
    };

    // --- Racer Mode Paragraph Library ---
    const paragraphDatabase = {
        km: [
            "ភាសាខ្មែរជាភាសាជាតិរបស់ប្រទេសកម្ពុជា។ យើងទាំងអស់គ្នាត្រូវតែស្រឡាញ់ ការពារ និងអភិរក្សអក្សរសាស្ត្រជាតិឲ្យបានគង់វង្សល្អសម្រាប់កូនចៅជំនាន់ក្រោយ។",
            "ការរៀនវាយអក្សរខ្មែរតាមប្រព័ន្ធយូនីកូដគឺពិតជាមានសារៈសំខាន់ខ្លាំងណាស់សម្រាប់សិស្ស និស្សិត និងបុគ្គលិកគ្រប់រូបដើម្បីបង្កើនល្បឿនការងារប្រចាំថ្ងៃ។",
            "កម្ពុជាមាតុភូមិខ្ញុំជាដែនដីដ៏អស្ចារ្យ សម្បូរទៅដោយសម្បត្តិវប្បធម៌ ប្រាសាទបុរាណ និងធនធានធម្មជាតិជាច្រើនដែលទាក់ទាញភ្ញៀវទេសចរមកពីគ្រប់ទិសទី។"
        ],
        en: [
            "The quick brown fox jumps over the lazy dog. Typing is an essential skill in the modern digital era, allowing professionals to communicate instantly.",
            "Synthwave aesthetics combine retro-futuristic visuals with electronic synthesizer beats, taking inspiration from nineteen eighties video game soundtracks.",
            "Practice makes perfect when learning a new keyboard layout. Focus on accuracy first, and typing speed will naturally develop over consecutive runs."
        ]
    };

    // --- QWERTY Physical Codes to Khmer NiDA Map ---
    const keyMap = {
        "Digit1": { normal: "១", shift: "!" },
        "Digit2": { normal: "២", shift: "ៗ" },
        "Digit3": { normal: "៣", shift: "៌" },
        "Digit4": { normal: "៤", shift: "៍" },
        "Digit5": { normal: "៥", shift: "ឲ" },
        "Digit6": { normal: "៦", shift: "័" },
        "Digit7": { normal: "៧", shift: "៏" },
        "Digit8": { normal: "៨", shift: "៌" },
        "Digit9": { normal: "៩", shift: "(" },
        "Digit0": { normal: "០", shift: ")" },
        "Minus": { normal: "-", shift: "ះ" },
        "Equal": { normal: "=", shift: "+" },
        "KeyQ": { normal: "ឆ", shift: "ឈ" },
        "KeyW": { normal: "ឹ", shift: "ឺ" },
        "KeyE": { normal: "េ", shift: "ែ" },
        "KeyR": { normal: "រ", shift: "ឫ" },
        "KeyT": { normal: "ទ", shift: "ធ" },
        "KeyY": { normal: "យ", shift: "ួ" },
        "KeyU": { normal: "ុ", shift: "ូ" },
        "KeyI": { normal: "ិ", shift: "ី" },
        "KeyO": { normal: "ោ", shift: "ៅ" },
        "KeyP": { normal: "ភ", shift: "ផ" },
        "BracketLeft": { normal: "ៀ", shift: "ឿ" },
        "BracketRight": { normal: "ឿ", shift: "ឧ" },
        "Backslash": { normal: "ឮ", shift: "ឡ" },
        "KeyA": { normal: "ា", shift: "អ" },
        "KeyS": { normal: "ស", shift: "ស្" },
        "KeyD": { normal: "ដ", shift: "ឌ" },
        "KeyF": { normal: "ថ", shift: "ធ" },
        "KeyG": { normal: "ង", shift: "អ្" },
        "KeyH": { normal: "ហ", shift: "ហ្" },
        "KeyJ": { normal: "្", shift: "ញ" },
        "KeyK": { normal: "ក", shift: "គ" },
        "KeyL": { normal: "ល", shift: "ឡ" },
        "Semicolon": { normal: "ើ", shift: "េះ" },
        "Quote": { normal: "់", shift: "ោះ" },
        "KeyZ": { normal: "ឋ", shift: "ឍ" },
        "KeyX": { normal: "ខ", shift: "ឃ" },
        "KeyC": { normal: "ច", shift: "ជ" },
        "KeyV": { normal: "វ", shift: "វ" },
        "KeyB": { normal: "ប", shift: "ភ" },
        "KeyN": { normal: "ន", shift: "ណ" },
        "KeyM": { normal: "ម", shift: "ម្" },
        "Comma": { normal: "ឡ", shift: "ឡ" },
        "Period": { normal: "។", shift: "៕" },
        "Slash": { normal: "៊", shift: "៖" },
        "Space": { normal: " ", shift: " " }
    };

    // --- DOM Elements ---
    const gameArena = document.getElementById('gameArena');
    const activeWordBuffer = document.getElementById('activeWordBuffer');
    const startScreen = document.getElementById('startScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const playBtn = document.getElementById('playBtn');
    const retryBtn = document.getElementById('retryBtn');
    const gameTipBar = document.getElementById('gameTipBar');
    
    // Spaceship & Racer tracks
    const spaceship = document.getElementById('spaceship');
    const synthwaveTrack = document.getElementById('synthwaveTrack');
    const racerPrompt = document.getElementById('racerPrompt');
    const raceCar = document.getElementById('raceCar');
    
    // Sidebar & Header selectors
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const diffButtons = document.querySelectorAll('.btn-diff');
    const modeButtons = document.querySelectorAll('.btn-mode');
    const langButtons = document.querySelectorAll('.btn-lang');
    
    // Dashboards
    const gameScore = document.getElementById('gameScore');
    const gameLevel = document.getElementById('gameLevel');
    const gameCombo = document.getElementById('gameCombo');
    const livesContainer = document.getElementById('livesContainer');
    const headerHighScore = document.getElementById('headerHighScore');
    const livesDashItem = document.getElementById('livesDashItem');
    
    // GameOver Stats & overlays
    const finalScore = document.getElementById('finalScore');
    const finalWpm = document.getElementById('finalWpm');
    const finalAccuracy = document.getElementById('finalAccuracy');
    const gameOverMsg = document.getElementById('gameOverMsg');
    const modeOverlayIcon = document.getElementById('modeOverlayIcon');
    const modeOverlayTitle = document.getElementById('modeOverlayTitle');
    const modeOverlayDesc = document.getElementById('modeOverlayDesc');

    // --- Audio Synth engine ---
    let audioCtx = null;
    let soundEnabled = true;

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800 + Math.random() * 300, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.002);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.04);
            } else if (type === 'error') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.13);
            } else if (type === 'blast') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.2);
            } else if (type === 'damage') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.4);
            } else if (type === 'levelUp') {
                osc.type = 'sine';
                const time = audioCtx.currentTime;
                osc.frequency.setValueAtTime(523.25, time); // C5
                osc.frequency.setValueAtTime(659.25, time + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, time + 0.2); // G5
                osc.frequency.setValueAtTime(1046.50, time + 0.3); // C6
                
                gain.gain.setValueAtTime(0.001, time);
                gain.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
                osc.start(time);
                osc.stop(time + 0.55);
            } else if (type === 'laser') {
                // Laser blaster sweep
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.002);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.18);
            } else if (type === 'slash') {
                // Ninja sweep blade sound (white noise style filter sweep)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.13);
            }
        } catch (error) {
            console.warn("Sound play failed", error);
        }
    }

    // --- State Management ---
    let isGameRunning = false;
    let score = 0;
    let level = 1;
    let combo = 1;
    let lives = 3;
    let highScores = { km: 0, en: 0 };
    
    // Stats
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let maxWpm = 0;
    let gameStartTime = 0;
    
    // Spawning items
    let ghosts = []; // Acts as meteor / ninja array too
    let particles = [];
    let lockedGhost = null; 
    let lastSpawnTime = 0;
    let spawnInterval = 3200; 
    let baseSpeed = 0.5;

    // Racer specific state
    let racerText = "";
    let racerIndex = 0;
    let racerTimeLimit = 60; // 60 seconds racer limit

    // Physics constants
    const gravity = 0.16; // ninja mode gravity drop

    // Options
    let activeGameMode = 'ghost'; // ghost, meteor, racer, ninja
    let activeLang = 'km'; // km, en
    let difficulty = 'easy'; // easy, medium, hard
    let currentTheme = 'light';
    let currentFont = "'Noto Sans Khmer', sans-serif";

    // --- Init ---
    function init() {
        loadPreferences();
        setupEvents();
        updateThemeToggleIcons();
        updateLanguageMode();
        updateModeOverlayDetails();
    }

    function loadPreferences() {
        const savedScores = localStorage.getItem('kgt_highscores_multi');
        if (savedScores) {
            highScores = JSON.parse(savedScores);
        } else {
            // Migration support from old key
            const oldScore = localStorage.getItem('kgt_highscore');
            if (oldScore) highScores.km = parseInt(oldScore, 10);
        }
        updateHighScoreDisplay();

        const savedTheme = localStorage.getItem('kgt_theme');
        if (savedTheme) {
            currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', currentTheme);
        }

        const savedFont = localStorage.getItem('kgt_font');
        if (savedFont) {
            currentFont = savedFont;
            fontFamilySelect.value = currentFont;
            gameArena.style.fontFamily = currentFont;
        }

        const savedSound = localStorage.getItem('kgt_sound');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
            updateSoundIcon();
        }

        const savedLang = localStorage.getItem('kgt_lang');
        if (savedLang) {
            activeLang = savedLang;
            langButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === activeLang);
            });
        }
    }

    function savePreferences() {
        localStorage.setItem('kgt_theme', currentTheme);
        localStorage.setItem('kgt_font', currentFont);
        localStorage.setItem('kgt_sound', soundEnabled.toString());
        localStorage.setItem('kgt_lang', activeLang);
        localStorage.setItem('kgt_highscores_multi', JSON.stringify(highScores));
    }

    function updateHighScoreDisplay() {
        const currentLangScore = highScores[activeLang] || 0;
        headerHighScore.textContent = currentLangScore;
    }

    // --- Spawner Engine ---
    function startGame() {
        isGameRunning = true;
        score = 0;
        level = 1;
        combo = 1;
        lives = 3;
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        maxWpm = 0;
        ghosts = [];
        particles = [];
        lockedGhost = null;
        lastSpawnTime = Date.now();
        gameStartTime = Date.now();
        
        // Hide standard components
        spaceship.style.display = 'none';
        synthwaveTrack.style.display = 'none';
        livesDashItem.style.display = 'flex';
        
        // Settings based on difficulty
        const diffCoeff = difficulty === 'easy' ? 1.0 : difficulty === 'medium' ? 0.8 : 0.65;
        spawnInterval = 3200 * diffCoeff;
        baseSpeed = difficulty === 'easy' ? 0.45 : difficulty === 'medium' ? 0.65 : 0.85;

        // Custom Mode Adjustments
        if (activeGameMode === 'meteor') {
            spaceship.style.display = 'block';
            spaceship.style.left = '50%';
        } else if (activeGameMode === 'racer') {
            synthwaveTrack.style.display = 'flex';
            livesDashItem.style.display = 'none'; // Racer uses timer instead of lives
            racerIndex = 0;
            
            // Fetch paragraph
            const paragraphs = paragraphDatabase[activeLang];
            racerText = paragraphs[Math.floor(Math.random() * paragraphs.length)];
            racerTimeLimit = activeLang === 'en' ? 45 : 75; // Time limits
            
            renderRacerPrompt();
            raceCar.style.left = '8%';
        }

        // Clean UI
        updateDashboard();
        gameArena.querySelectorAll('.ghost, .meteor, .ninja-word, .particle, .laser-beam, .ninja-slash').forEach(el => el.remove());
        activeWordBuffer.style.display = 'none';
        
        startScreen.classList.remove('active');
        gameOverScreen.classList.remove('active');
        gameArena.focus();
        
        showToast('Game Started!');
        
        requestAnimationFrame(updateGameEngine);
    }

    function updateGameEngine() {
        if (!isGameRunning) return;

        const currentTime = Date.now();
        const arenaHeight = gameArena.clientHeight;
        const speed = baseSpeed + (level * 0.08);

        // --- Multi-Game Dispatcher ---
        if (activeGameMode === 'ghost' || activeGameMode === 'meteor') {
            // A. Ghost / Space Invaders Meteor Modes
            if (currentTime - lastSpawnTime > spawnInterval) {
                spawnGhostOrMeteor();
                lastSpawnTime = currentTime;
                spawnInterval = Math.max(1200, spawnInterval - 50);
            }

            for (let i = ghosts.length - 1; i >= 0; i--) {
                const item = ghosts[i];
                item.y += speed;
                item.element.style.top = `${item.y}px`;

                // Danger zone highlight (bottom 25%)
                if (item.y > arenaHeight * 0.72 && !item.element.classList.contains('danger')) {
                    item.element.classList.add('danger');
                }

                // Breach check
                if (item.y >= arenaHeight - 40) {
                    handleBreach(item);
                    ghosts.splice(i, 1);
                    continue;
                }
            }
        } 
        else if (activeGameMode === 'racer') {
            // B. Synthwave Racer Mode (Time tracker check)
            const durationSecs = (currentTime - gameStartTime) / 1000;
            const remaining = Math.max(0, Math.ceil(racerTimeLimit - durationSecs));
            statTimeText(remaining);

            if (remaining <= 0) {
                // Time's up
                triggerGameOver(false, "Time is up / អស់ពេលវេលា!");
            }
        }
        else if (activeGameMode === 'ninja') {
            // C. Word Ninja Mode (Gravity Arcs)
            if (currentTime - lastSpawnTime > spawnInterval) {
                spawnNinjaWord();
                lastSpawnTime = currentTime;
                spawnInterval = Math.max(1300, spawnInterval - 30);
            }

            for (let i = ghosts.length - 1; i >= 0; i--) {
                const item = ghosts[i];
                
                // Physics formulas (gravity drops velocity)
                item.vy += gravity;
                item.x += item.vx;
                item.y += item.vy;
                item.rotation += item.rotSpeed;

                item.element.style.left = `${item.x}px`;
                item.element.style.top = `${item.y}px`;
                item.element.style.transform = `rotate(${item.rotation}deg)`;

                // Breaches (falls past bottom screen border)
                // We check if it is falling downwards (vy > 0) and is past height
                if (item.vy > 0 && item.y > arenaHeight + 40) {
                    handleBreach(item);
                    ghosts.splice(i, 1);
                    continue;
                }
            }
        }

        // 3. Render common particles
        updateParticles();

        // 4. Keyboard highlights
        highlightVisualKeyboardKeys();

        requestAnimationFrame(updateGameEngine);
    }

    function statTimeText(sec) {
        statTimeDisplay = document.getElementById('statTimeText') || null;
        if (!statTimeDisplay) {
            // Add a dynamic time display on racer dashboard
            const timeCardVal = document.getElementById('statTime') || null;
            if (timeCardVal) {
                timeCardVal.textContent = `${sec}s`;
            }
        }
    }

    // Spawning Helpers
    function spawnGhostOrMeteor() {
        const words = wordDatabase[activeLang][difficulty];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const xPos = Math.random() * 65 + 18; // 18% to 83% width offset
        
        const el = document.createElement('div');
        el.className = activeGameMode === 'ghost' ? 'ghost' : 'meteor';
        el.style.left = `${xPos}%`;
        el.style.top = `0px`;
        const elId = 'e_' + Math.random().toString(36).substr(2, 5);
        el.id = elId;

        let wordHtml = "";
        for (let i = 0; i < randomWord.length; i++) {
            wordHtml += `<span class="char-remaining">${randomWord[i]}</span>`;
        }

        if (activeGameMode === 'ghost') {
            el.innerHTML = `
                <div class="ghost-icon">👻</div>
                <div class="ghost-word">${wordHtml}</div>
            `;
        } else {
            el.innerHTML = `
                <div class="meteor-icon">☄️</div>
                <div class="meteor-word">${wordHtml}</div>
            `;
        }

        gameArena.appendChild(el);
        ghosts.push({
            id: elId,
            word: randomWord,
            x: xPos,
            y: 0,
            typedLength: 0,
            element: el
        });
    }

    function spawnNinjaWord() {
        const words = wordDatabase[activeLang][difficulty];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        
        const arenaWidth = gameArena.clientWidth;
        const arenaHeight = gameArena.clientHeight;

        const startX = Math.random() * (arenaWidth - 160) + 80;
        const startY = arenaHeight + 10;
        
        // Physics velocities
        // Shoots upwards: vy must be negative (-6 to -10 depending on height)
        const vy = -6.5 - Math.random() * 2.5;
        // Moves left/right slightly towards center
        const centerOffset = (arenaWidth / 2 - startX) / (arenaWidth / 2);
        const vx = centerOffset * (1.2 + Math.random() * 1.5);
        
        const el = document.createElement('div');
        el.className = 'ninja-word';
        el.style.left = `${startX}px`;
        el.style.top = `${startY}px`;
        const elId = 'n_' + Math.random().toString(36).substr(2, 5);
        el.id = elId;

        let wordHtml = "";
        for (let i = 0; i < randomWord.length; i++) {
            wordHtml += `<span class="char-remaining">${randomWord[i]}</span>`;
        }
        el.innerHTML = wordHtml;
        gameArena.appendChild(el);

        ghosts.push({
            id: elId,
            word: randomWord,
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            rotation: Math.random() * 45 - 22,
            rotSpeed: Math.random() * 2 - 1, // rotation delta per frame
            typedLength: 0,
            element: el
        });
    }

    // Racer Prompt Renderer
    function renderRacerPrompt() {
        racerPrompt.innerHTML = "";
        for (let i = 0; i < racerText.length; i++) {
            const span = document.createElement('span');
            span.className = 'char-remaining';
            if (racerText[i] === ' ') {
                span.innerHTML = '&nbsp;';
                span.classList.add('char-space');
            } else {
                span.textContent = racerText[i];
            }
            if (i === 0) {
                span.className = 'char-active';
            }
            racerPrompt.appendChild(span);
        }
    }

    // --- Typing Evaluator ---
    function handleKeyboardInput(e) {
        if (!isGameRunning) return;

        if (e.key === " " || e.key === "Backspace") {
            e.preventDefault();
        }

        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key.length > 1 && e.key !== "Space" && e.key !== " ") {
            if (e.key === "Escape" && lockedGhost) {
                unlockTarget();
                showToast("Target cleared", "info");
            }
            return;
        }

        totalKeystrokes++;

        // 1. Resolve key input based on Language settings
        let typedChar = e.key;
        if (activeLang === 'km') {
            // Translate QWERTY code to Khmer
            const mapped = keyMap[e.code];
            if (mapped) {
                typedChar = e.shiftKey ? mapped.shift : mapped.normal;
            }
        }

        // 2. Dispatch Game Mode matching
        if (activeGameMode === 'racer') {
            // racer mode uses direct linear typing
            const targetChar = racerText[racerIndex];
            const charSpans = racerPrompt.querySelectorAll('span');
            const activeSpan = charSpans[racerIndex];

            // Match evaluation
            if (e.key === targetChar || typedChar === targetChar) {
                correctKeystrokes++;
                playSound('click');
                activeSpan.className = 'char-typed';
                
                // Scrolling road grid animation visual hook
                synthwaveTrack.classList.add('active-scroll');
                
                racerIndex++;
                
                // Move car progress
                const progress = racerIndex / racerText.length;
                const carLeft = 8 + progress * 74; // range from 8% to 82%
                raceCar.style.left = `${carLeft}%`;

                if (racerIndex < racerText.length) {
                    charSpans[racerIndex].className = 'char-active';
                } else {
                    // Completed Racer track!
                    handleRacerWin();
                }
            } else {
                playSound('error');
                activeSpan.className = 'char-incorrect';
                combo = 1;
                synthwaveTrack.classList.remove('active-scroll');
            }
        } 
        else {
            // Ghost, Meteor, Ninja matching logic (with Lock-on)
            if (lockedGhost) {
                const targetChar = lockedGhost.word[lockedGhost.typedLength];
                
                if (e.key === targetChar || typedChar === targetChar) {
                    // Match correct
                    correctKeystrokes++;
                    playSound('click');
                    lockedGhost.typedLength++;

                    // Highlight letter
                    const spans = lockedGhost.element.querySelectorAll('span');
                    spans[lockedGhost.typedLength - 1].className = 'char-correct';
                    
                    updateActiveWordBuffer();

                    // Check victory
                    if (lockedGhost.typedLength === lockedGhost.word.length) {
                        defeatActiveGhost(lockedGhost);
                    }
                } else {
                    // Typo
                    playSound('error');
                    combo = 1;
                    gameCombo.textContent = `x${combo}`;
                    
                    lockedGhost.element.classList.add('shake-incorrect');
                    lockedGhost.element.addEventListener('animationend', () => {
                        lockedGhost.element.classList.remove('shake-incorrect');
                    }, { once: true });
                }
            } else {
                // Find matching start letter
                let matchedItem = null;
                
                if (activeGameMode === 'ghost' || activeGameMode === 'meteor') {
                    // Prioritize items closest to bottom (highest Y)
                    let highestY = -1;
                    for (const item of ghosts) {
                        const first = item.word[0];
                        if ((e.key === first || typedChar === first) && item.y > highestY) {
                            matchedItem = item;
                            highestY = item.y;
                        }
                    }
                } else if (activeGameMode === 'ninja') {
                    // Ninja mode: select items closest to apex/top or lowest depending on choice.
                    // Prioritize highest Y coordinates (which is lowest on screen, closest to breach)
                    let highestY = -1;
                    for (const item of ghosts) {
                        const first = item.word[0];
                        if ((e.key === first || typedChar === first) && item.y > highestY) {
                            matchedItem = item;
                            highestY = item.y;
                        }
                    }
                }

                if (matchedItem) {
                    correctKeystrokes++;
                    playSound('click');
                    lockedGhost = matchedItem;
                    lockedGhost.typedLength = 1;

                    lockedGhost.element.classList.add('locked');
                    const spans = lockedGhost.element.querySelectorAll('span');
                    spans[0].className = 'char-correct';

                    // Space ship visual slide triggers
                    if (activeGameMode === 'meteor') {
                        // Slide spaceship left center offset
                        alignSpaceshipWithTarget();
                    }

                    updateActiveWordBuffer();
                } else {
                    playSound('error');
                    combo = 1;
                    gameCombo.textContent = `x${combo}`;
                }
            }
        }

        updateDashboard();
    }

    function alignSpaceshipWithTarget() {
        if (!lockedGhost) return;
        
        // Move spaceship element horizontally
        spaceship.style.left = `${lockedGhost.x}%`;
    }

    function defeatActiveGhost(ghost) {
        const rect = ghost.element.getBoundingClientRect();
        const arenaRect = gameArena.getBoundingClientRect();
        const xPos = rect.left - arenaRect.left + rect.width / 2;
        const yPos = rect.top - arenaRect.top + rect.height / 2;

        // Custom action highlights
        if (activeGameMode === 'meteor') {
            // 1. Space Invaders laser beam shoot
            playSound('laser');
            drawLaserBeam(xPos);
            
            setTimeout(() => {
                playSound('blast');
                createExplosionParticles(xPos, yPos);
                ghost.element.remove();
            }, 80);
        } 
        else if (activeGameMode === 'ninja') {
            // 2. Ninja sword blade sweep slash
            playSound('slash');
            drawSwordSlash(xPos, yPos, ghost.rotation);
            
            setTimeout(() => {
                playSound('blast');
                createExplosionParticles(xPos, yPos);
                ghost.element.remove();
            }, 60);
        } 
        else {
            // 3. Ghost standard blast
            playSound('blast');
            createExplosionParticles(xPos, yPos);
            ghost.element.remove();
        }

        // Remove from database
        ghosts = ghosts.filter(g => g.id !== ghost.id);

        // Scoring
        const baseScore = ghost.word.length * 10;
        score += baseScore * combo;
        
        // Combos
        combo = Math.min(10, combo + 1);

        // Level progressions
        const nextLevel = Math.floor(score / 800) + 1;
        if (nextLevel > level) {
            level = nextLevel;
            playSound('levelUp');
            showToast(`Level Up! Speed Mode: Level ${level}`);
        }

        unlockTarget();
    }

    function drawLaserBeam(targetX) {
        const laser = document.createElement('div');
        laser.className = 'laser-beam';
        
        // Spaceship center coordinates
        const shipRect = spaceship.getBoundingClientRect();
        const arenaRect = gameArena.getBoundingClientRect();
        
        const startX = shipRect.left - arenaRect.left + shipRect.width / 2;
        const startY = shipRect.top - arenaRect.top;
        
        laser.style.left = `${startX - 1}px`;
        laser.style.top = `0px`;
        laser.style.height = `${startY}px`;
        
        // Make laser align with target X
        laser.style.transform = `skewX(${((targetX - startX) / startY) * 30}deg)`;

        gameArena.appendChild(laser);
        
        setTimeout(() => laser.remove(), 180);
    }

    function drawSwordSlash(x, y, angle) {
        const slash = document.createElement('div');
        slash.className = 'ninja-slash';
        slash.style.left = `${x - 60}px`;
        slash.style.top = `${y}px`;
        slash.style.width = `120px`;
        slash.style.transform = `rotate(${angle + 35}deg)`;

        gameArena.appendChild(slash);
        
        setTimeout(() => slash.remove(), 250);
    }

    function unlockTarget() {
        if (lockedGhost && lockedGhost.element) {
            lockedGhost.element.classList.remove('locked');
        }
        lockedGhost = null;
        activeWordBuffer.style.display = 'none';
    }

    function handleBreach(item) {
        playSound('damage');
        lives--;
        combo = 1;

        // Screen shake
        gameArena.parentElement.classList.add('shake-arena');
        setTimeout(() => {
            gameArena.parentElement.classList.remove('shake-arena');
        }, 300);

        item.element.remove();
        showToast('Castle breached! Life lost.', 'info');

        if (lockedGhost && lockedGhost.id === item.id) {
            unlockTarget();
        }

        if (lives <= 0) {
            triggerGameOver(false);
        }

        updateDashboard();
    }

    function handleRacerWin() {
        isGameRunning = false;
        playSound('levelUp');
        synthwaveTrack.classList.remove('active-scroll');
        
        // Bonus WPM score
        const durationSecs = (Date.now() - gameStartTime) / 1000;
        const wpmCalc = Math.round((correctKeystrokes / 5) / (durationSecs / 60));
        score += wpmCalc * 15;

        triggerGameOver(true);
    }

    function triggerGameOver(hasWon = false, customMsg = "") {
        isGameRunning = false;
        unlockTarget();
        synthwaveTrack.classList.remove('active-scroll');

        // High Score
        if (score > highScores[activeLang]) {
            highScores[activeLang] = score;
            savePreferences();
            updateHighScoreDisplay();
            showToast('New Personal High Score! 🎉');
        }

        // Stats summary calculation
        const durationSecs = (Date.now() - gameStartTime) / 1000;
        const finalWpmCalc = durationSecs > 0 ? Math.round((correctKeystrokes / 5) / (durationSecs / 60)) : 0;
        const accuracyCalc = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;

        finalScore.textContent = score;
        finalWpm.textContent = finalWpmCalc;
        finalAccuracy.textContent = `${accuracyCalc}%`;

        if (hasWon) {
            gameOverMsg.textContent = "Congratulations! You finished the Synthwave track! 🎉";
            gameOverMsg.className = "text-success";
        } else {
            gameOverMsg.textContent = customMsg || "The ghosts have breached your defenses.";
            gameOverMsg.className = "text-danger";
        }

        gameOverScreen.classList.add('active');
        retryBtn.focus();
    }

    // --- Dashboard & Screen Updates ---
    function updateDashboard() {
        gameScore.textContent = score.toString().padStart(6, '0');
        gameLevel.textContent = `Level ${level}`;
        gameCombo.textContent = `x${combo}`;

        // Sidebar WPM / Accuracy
        const durationSecs = (Date.now() - gameStartTime) / 1000;
        const wpmCalc = durationSecs > 0 ? Math.round((correctKeystrokes / 5) / (durationSecs / 60)) : 0;
        statWpm.textContent = `${wpmCalc} WPM`;
        
        const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
        statAccuracy.textContent = `${accuracy}%`;

        // Lives updates
        livesContainer.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart';
            heart.textContent = i < lives ? '❤️' : '🖤';
            livesContainer.appendChild(heart);
        }
    }

    function updateActiveWordBuffer() {
        if (!lockedGhost) return;
        
        activeWordBuffer.style.display = 'flex';
        const correct = lockedGhost.word.substring(0, lockedGhost.typedLength);
        const remaining = lockedGhost.word.substring(lockedGhost.typedLength);
        
        activeWordBuffer.querySelector('.typed-correct').textContent = correct;
        activeWordBuffer.querySelector('.typed-remaining').textContent = remaining;
    }

    // --- On-Screen Virtual Keyboard Guides ---
    function highlightVisualKeyboardKeys() {
        // Clear all prompts
        document.querySelectorAll('.key.prompt, .key.prompt-shift').forEach(el => {
            el.classList.remove('prompt', 'prompt-shift');
        });

        if (!isGameRunning) return;

        let charactersToHighlight = [];

        if (activeGameMode === 'racer') {
            // Linear typing: highlight the next character in the paragraph
            if (racerIndex < racerText.length) {
                charactersToHighlight.push(racerText[racerIndex]);
            }
        } 
        else {
            if (lockedGhost) {
                // Lock on: highlight next character of active word
                charactersToHighlight.push(lockedGhost.word[lockedGhost.typedLength]);
            } else {
                // Not locked: highlight starting characters of all floating items
                ghosts.forEach(ghost => {
                    if (ghost.word) charactersToHighlight.push(ghost.word[0]);
                });
            }
        }

        // Highlight visual keys matching resolved targets
        charactersToHighlight.forEach(nextChar => {
            let targetCode = null;
            let isShiftRequired = false;

            if (activeLang === 'km') {
                // Search translation keyMap
                for (const [code, mapping] of Object.entries(keyMap)) {
                    if (mapping.normal === nextChar) {
                        targetCode = code;
                        break;
                    } else if (mapping.shift === nextChar) {
                        targetCode = code;
                        isShiftRequired = true;
                        break;
                    }
                }
            } else {
                // English mode: Match key directly using QWERTY character mappings
                const charLower = nextChar.toLowerCase();
                for (const [code, mapping] of Object.entries(keyMap)) {
                    if (code.startsWith('Key') && code.charAt(3).toLowerCase() === charLower) {
                        targetCode = code;
                        // Determine shift requirements based on case
                        if (nextChar !== charLower) {
                            isShiftRequired = true;
                        }
                        break;
                    } else if (mapping.normal === nextChar || mapping.shift === nextChar) {
                        targetCode = code;
                        if (mapping.shift === nextChar) {
                            isShiftRequired = true;
                        }
                        break;
                    }
                }
                
                // Handle Spacebar
                if (nextChar === ' ') {
                    targetCode = "Space";
                }
            }

            if (targetCode) {
                const keyEl = document.querySelector(`.key[data-key="${targetCode}"]`);
                if (keyEl) keyEl.classList.add('prompt');
                
                if (isShiftRequired) {
                    const shiftLeftEl = document.querySelector('.key[data-key="ShiftLeft"]');
                    const shiftRightEl = document.querySelector('.key[data-key="ShiftRight"]');
                    if (shiftLeftEl) shiftLeftEl.classList.add('prompt-shift');
                    if (shiftRightEl) shiftRightEl.classList.add('prompt-shift');
                }
            }
        });
    }

    // --- Particle Explosions ---
    function createExplosionParticles(x, y) {
        // Match theme accent colors
        const colors = activeGameMode === 'meteor' 
            ? ['#f59e0b', '#ef4444', '#f87171', '#fb7185', '#ffffff'] // Space meteor fire
            : activeGameMode === 'ninja'
            ? ['#06b6d4', '#0891b2', '#0ea5e9', '#ffffff'] // Blade sparks
            : ['#6366f1', '#818cf8', '#10b981', '#34d399', '#ffffff']; // Ghost magic dust
            
        const count = 18;

        for (let i = 0; i < count; i++) {
            const pEl = document.createElement('div');
            pEl.className = 'particle';
            pEl.style.left = `${x}px`;
            pEl.style.top = `${y}px`;
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            pEl.style.backgroundColor = color;
            pEl.style.boxShadow = `0 0 6px ${color}`;

            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4.5;
            
            const p = {
                element: pEl,
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03
            };

            gameArena.appendChild(pEl);
            particles.push(p);
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;
            p.element.style.opacity = p.alpha;

            if (p.alpha <= 0) {
                p.element.remove();
                particles.splice(i, 1);
            }
        }
    }

    // --- Mode overlays details updates ---
    function updateModeOverlayDetails() {
        const visualKeyboard = document.getElementById('visualKeyboard');
        
        if (activeGameMode === 'ghost') {
            modeOverlayIcon.textContent = "👻";
            modeOverlayTitle.textContent = "Ghost Typing / កម្ចាត់ខ្មោច";
            modeOverlayDesc.textContent = "Defend the castle from falling ghosts by typing in " + (activeLang === 'km' ? 'Khmer' : 'English') + "!";
            gameTipBar.textContent = "Type falling ghosts before they hit the bottom! Press Esc to unlock.";
        } 
        else if (activeGameMode === 'meteor') {
            modeOverlayIcon.textContent = "☄️";
            modeOverlayTitle.textContent = "Meteor Laser / កម្ទេចអាចម៍ផ្កាយ";
            modeOverlayDesc.textContent = "Aim your laser spaceship and blast incoming meteors before they hit earth!";
            gameTipBar.textContent = "Spaceship slides horizontally to align lasers with typed targets.";
        }
        else if (activeGameMode === 'racer') {
            modeOverlayIcon.textContent = "🏎️";
            modeOverlayTitle.textContent = "Synthwave Racer / ប្រណាំងឡាន";
            modeOverlayDesc.textContent = "Drive your race car across the finish line before the timer runs out by typing paragraphs!";
            gameTipBar.textContent = "Scroll background activates as you type. Watch out for the clock!";
        }
        else if (activeGameMode === 'ninja') {
            modeOverlayIcon.textContent = "⚔️";
            modeOverlayTitle.textContent = "Word Ninja / អ្នកកាប់អក្សរ";
            modeOverlayDesc.textContent = "Toss words in gravity arcs and slice them in half like a true Word Ninja!";
            gameTipBar.textContent = "Slice targets in mid-air. Don't let them fall back down the screen!";
        }
    }

    function updateLanguageMode() {
        const visualKeyboard = document.getElementById('visualKeyboard');
        
        if (activeLang === 'km') {
            visualKeyboard.classList.remove('lang-en');
            visualKeyboard.classList.add('lang-km');
            
            // Adjust options labels in selects
            fontFamilySelect.style.display = 'block';
        } else {
            visualKeyboard.classList.remove('lang-km');
            visualKeyboard.classList.add('lang-en');
        }
        updateHighScoreDisplay();
    }

    // --- Global Controls Setup ---
    function setupEvents() {
        playBtn.addEventListener('click', startGame);
        retryBtn.addEventListener('click', startGame);
        gameArena.addEventListener('keydown', handleKeyboardInput);

        // Language toggle
        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                activeLang = button.dataset.lang;
                updateLanguageMode();
                updateModeOverlayDetails();
                savePreferences();
                showToast(`Language switched to ${activeLang === 'km' ? 'Khmer' : 'English'}`, 'info');
                
                if (isGameRunning) triggerGameOver(false);
            });
        });

        // Game mode options
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                activeGameMode = button.dataset.mode;
                updateModeOverlayDetails();
                
                if (isGameRunning) triggerGameOver(false);
                
                // Set menus visible
                startScreen.classList.add('active');
                gameOverScreen.classList.remove('active');
            });
        });

        // Diff settings
        diffButtons.forEach(button => {
            button.addEventListener('click', () => {
                diffButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                difficulty = button.dataset.diff;
                showToast(`Difficulty level: ${difficulty}`, 'info');
                
                if (isGameRunning) triggerGameOver(false);
            });
        });

        // Theme
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Sound
        soundToggleBtn.addEventListener('click', toggleSound);

        // Fonts
        fontFamilySelect.addEventListener('change', (e) => {
            currentFont = e.target.value;
            gameArena.style.fontFamily = currentFont;
            savePreferences();
        });

        // Visual click highlight feedback for keyboard rows
        window.addEventListener('keydown', (e) => {
            let code = e.code;
            if (e.key === 'Shift') {
                if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    code = e.code;
                }
            }

            const keyEl = document.querySelector(`.key[data-key="${code}"]`);
            if (keyEl) keyEl.classList.add('active');

            // Quick Hotkeys
            if (!startScreen.classList.contains('active') && !gameOverScreen.classList.contains('active')) {
                if (e.key.toLowerCase() === 'm' && document.activeElement !== gameArena) {
                    toggleSound();
                }
                if (e.key.toLowerCase() === 't' && document.activeElement !== gameArena) {
                    toggleTheme();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            let code = e.code;
            const keyEl = document.querySelector(`.key[data-key="${code}"]`);
            if (keyEl) keyEl.classList.remove('active');
        });
    }

    // --- Sound Controller ---
    function toggleSound() {
        soundEnabled = !soundEnabled;
        updateSoundIcon();
        savePreferences();
        showToast(soundEnabled ? 'Chiptune sound effects enabled' : 'Sound muted', 'info');
    }

    function updateSoundIcon() {
        const soundOn = soundToggleBtn.querySelector('.icon-sound-on');
        const soundOff = soundToggleBtn.querySelector('.icon-sound-off');
        if (soundEnabled) {
            soundOn.style.display = 'block';
            soundOff.style.display = 'none';
        } else {
            soundOn.style.display = 'none';
            soundOff.style.display = 'block';
        }
    }

    // --- Theme Controller ---
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeToggleIcons();
        savePreferences();
        showToast(`Theme switched to ${currentTheme}`, 'info');
    }

    function updateThemeToggleIcons() {
        const sunIcon = themeToggleBtn.querySelector('.icon-sun');
        const moonIcon = themeToggleBtn.querySelector('.icon-moon');
        if (currentTheme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--success)">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
        } else {
            iconHtml = `
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--primary)">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            `;
        }

        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 2500);
    }

    // Start Engine
    init();
});
