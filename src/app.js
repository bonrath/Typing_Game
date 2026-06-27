// Main Application Controller for Khmer & English Typing Master

let englishLessons = [];
let khmerLessons = [];
window.selectedKeyboardLayout = "nida";
window.selectedFontSize = 22;

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize Database
  await Database.init();

  // Load Lessons Datasets
  try {
    const resEn = await fetch("../lessons/english.json");
    englishLessons = await resEn.json();
    const resKh = await fetch("../lessons/khmer.json");
    khmerLessons = await resKh.json();
  } catch (err) {
    console.error("Failed to fetch lessons. Using fallback static lessons.", err);
    englishLessons = getFallbackEnglishLessons();
    khmerLessons = getFallbackKhmerLessons();
  }

  // Setup Event Listeners
  setupEventListeners();

  // Load active profile and apply global preferences
  const activeProfile = Database.getActiveProfile();
  if (activeProfile) {
    applyProfilePreferences(activeProfile);
    switchView("dashboard");
    checkForPendingAchievements();
  } else {
    // Show profile selection screen
    switchView("profiles-selection");
    renderProfilesList();
  }

  // Init Typing and Games Engines
  TypingEngine.init();
  MiniGames.init("game-canvas");
});

function setupEventListeners() {
  // Main view navigation buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.getAttribute("data-view");
      if (viewId) {
        // If gameplay or minigame is active, stop them first
        TypingEngine.stop();
        MiniGames.stop();
        
        switchView(viewId);
      }
    });
  });

  // Profile selection buttons
  const addProfileBtn = document.getElementById("add-profile-card");
  if (addProfileBtn) {
    addProfileBtn.addEventListener("click", () => {
      showModal("profile-modal");
    });
  }

  // Create Profile Modal Submit
  const createProfileForm = document.getElementById("create-profile-form");
  if (createProfileForm) {
    createProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("profile-name-input").value.trim();
      const role = document.getElementById("profile-role-input").value;
      const activeAvatarDot = document.querySelector(".avatar-dot.active");
      const avatar = activeAvatarDot ? activeAvatarDot.getAttribute("data-color") : "#6366f1";

      if (name) {
        const newProfile = await Database.createProfile(name, avatar, role);
        applyProfilePreferences(newProfile);
        hideModal("profile-modal");
        
        // Reset form
        createProfileForm.reset();
        
        switchView("dashboard");
        checkForPendingAchievements();
      }
    });
  }

  // Profile avatar picker clicks
  document.querySelectorAll(".avatar-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".avatar-dot").forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
    });
  });

  // Switch Profiles from badge click
  const profileBadge = document.getElementById("header-profile-badge");
  if (profileBadge) {
    profileBadge.addEventListener("click", () => {
      TypingEngine.stop();
      MiniGames.stop();
      switchView("profiles-selection");
      renderProfilesList();
    });
  }

  // Language selectors in Lessons Map
  document.querySelectorAll(".lessons-header-bar .lang-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".lessons-header-bar .lang-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const lang = tab.getAttribute("data-lang");
      renderLessonsTree(lang);
    });
  });

  // Settings modification listeners
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("change", async (e) => {
      const mode = e.target.checked ? "dark" : "light";
      document.body.classList.toggle("light-mode", mode === "light");
      await Database.updateSettings({ theme: mode });
    });
  }

  const soundToggle = document.getElementById("sound-toggle");
  if (soundToggle) {
    soundToggle.addEventListener("change", async (e) => {
      await Database.updateSettings({ sound: e.target.checked });
    });
  }

  const layoutSelector = document.getElementById("settings-keyboard-layout");
  if (layoutSelector) {
    layoutSelector.addEventListener("change", async (e) => {
      window.selectedKeyboardLayout = e.target.value;
      await Database.updateSettings({ keyboardLayout: e.target.value });
    });
  }

  const fontSelector = document.getElementById("settings-font-size");
  if (fontSelector) {
    fontSelector.addEventListener("change", async (e) => {
      window.selectedFontSize = parseInt(e.target.value);
      await Database.updateSettings({ fontSize: window.selectedFontSize });
    });
  }

  // Gameplay Exit action
  const gameExitBtn = document.getElementById("game-exit-btn");
  if (gameExitBtn) {
    gameExitBtn.addEventListener("click", () => {
      TypingEngine.stop();
      switchView("lessons");
    });
  }

  // Mini Games Tabs
  document.querySelectorAll(".game-card-select").forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".game-card-select").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      
      const gameName = card.getAttribute("data-game");
      const lang = document.getElementById("game-lang-select").value;
      
      setupMiniGame(gameName, lang);
    });
  });

  // Mini Games Controls
  const gameStartBtn = document.getElementById("game-start-btn");
  if (gameStartBtn) {
    gameStartBtn.addEventListener("click", () => {
      const activeCard = document.querySelector(".game-card-select.active");
      if (!activeCard) return;

      const gameName = activeCard.getAttribute("data-game");
      const lang = document.getElementById("game-lang-select").value;
      
      startGameSession(gameName, lang);
    });
  }

  // Game Input focus listener redirect
  const rawGameInput = document.getElementById("typing-raw-input");
  if (rawGameInput) {
    rawGameInput.addEventListener("keypress", (e) => {
      if (MiniGames.activeGame) {
        MiniGames.handleGameKeyPress(e.key, e.code);
      }
    });
    rawGameInput.addEventListener("keydown", (e) => {
      if (MiniGames.activeGame && e.key === "Backspace") {
        MiniGames.handleGameKeyPress("", "Backspace");
      }
      if (MiniGames.activeGame && e.key === "Enter") {
        MiniGames.handleGameKeyPress("", "Enter");
      }
    });
  }

  // Reports view triggers
  const exportCsvBtn = document.getElementById("report-export-csv");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
      const profile = Database.getActiveProfile();
      Exporter.exportHistoryCSV(profile);
    });
  }

  const exportPdfBtn = document.getElementById("report-export-pdf");
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
      const profile = Database.getActiveProfile();
      const stats = Database.getStatsSummary();
      Exporter.exportReportPDF(profile, stats);
    });
  }

  // Teacher Student select listener
  const printStudentReportBtn = document.getElementById("teacher-print-report");
  if (printStudentReportBtn) {
    printStudentReportBtn.addEventListener("click", () => {
      const activeItem = document.querySelector(".student-list-item.active");
      if (!activeItem) return;
      const studentId = activeItem.getAttribute("data-id");
      const profile = Database.getProfiles().find(p => p.id === studentId);
      const stats = Database.getStatsSummary(studentId);
      Exporter.exportReportPDF(profile, stats);
    });
  }
}

// Router
function switchView(viewId) {
  // Handle visibility transitions
  document.querySelectorAll(".view-panel").forEach(panel => {
    panel.classList.remove("active");
  });

  const targetPanel = document.getElementById(`view-${viewId}`);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  // Update Nav highlighting
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-view") === viewId) {
      btn.classList.add("active");
    }
  });

  // Exclude menu navigation if profile selection page
  const header = document.querySelector(".app-header");
  if (viewId === "profiles-selection") {
    header.style.display = "none";
  } else {
    header.style.display = "flex";
  }

  // View specific initialization loaders
  if (viewId === "dashboard") {
    renderDashboard();
  } else if (viewId === "lessons") {
    const activeTab = document.querySelector(".lessons-header-bar .lang-tab.active") || { getAttribute: () => "en" };
    renderLessonsTree(activeTab.getAttribute("data-lang"));
  } else if (viewId === "leaderboard") {
    renderLeaderboard();
  } else if (viewId === "reports") {
    renderReports();
  } else if (viewId === "teacher") {
    renderTeacherDashboard();
  } else if (viewId === "settings") {
    renderSettingsView();
  }
}

// Modals
function showModal(id) {
  document.getElementById(id).classList.add("active");
}
function hideModal(id) {
  document.getElementById(id).classList.remove("active");
}

// Apply visual variables from loaded profile
function applyProfilePreferences(profile) {
  const isLight = profile.settings.theme === "light";
  document.body.classList.toggle("light-mode", isLight);

  window.selectedKeyboardLayout = profile.settings.keyboardLayout;
  window.selectedFontSize = profile.settings.fontSize;

  // Header Avatar
  const badgeAvatar = document.getElementById("header-badge-avatar");
  const badgeName = document.getElementById("header-badge-name");
  
  if (badgeAvatar) {
    badgeAvatar.style.backgroundColor = profile.avatar;
    badgeAvatar.textContent = profile.name.charAt(0).toUpperCase();
  }
  if (badgeName) {
    badgeName.textContent = profile.name;
  }

  // Hide Teacher Dashboard nav button if profile is student
  const teacherNavBtn = document.querySelector(".nav-btn[data-view='teacher']");
  if (teacherNavBtn) {
    teacherNavBtn.style.display = profile.role === "teacher" ? "flex" : "none";
  }
}

// Views Render Engines

// 1. Profile Selection Screen
function renderProfilesList() {
  const container = document.getElementById("profiles-scroller");
  if (!container) return;

  // Clear existing items but preserve Add Profile Card
  const listItems = container.querySelectorAll(".profile-card:not(.new-profile-card)");
  listItems.forEach(el => el.remove());

  const profiles = Database.getProfiles();
  const addCard = document.getElementById("add-profile-card");

  profiles.forEach(p => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.addEventListener("click", () => {
      Database.setActiveProfile(p.id);
      applyProfilePreferences(p);
      switchView("dashboard");
      checkForPendingAchievements();
    });

    const avatar = document.createElement("div");
    avatar.className = "profile-card-avatar";
    avatar.style.backgroundColor = p.avatar;
    avatar.textContent = p.name.charAt(0).toUpperCase();
    card.appendChild(avatar);

    const name = document.createElement("div");
    name.className = "profile-card-name";
    name.textContent = p.name;
    card.appendChild(name);

    const role = document.createElement("div");
    role.className = "profile-card-role";
    role.textContent = p.role.toUpperCase();
    card.appendChild(role);

    // Delete badge
    const del = document.createElement("div");
    del.className = "profile-card-delete";
    del.innerHTML = "✕";
    del.addEventListener("click", async (e) => {
      e.stopPropagation(); // prevent card click select
      if (confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
        await Database.deleteProfile(p.id);
        renderProfilesList();
      }
    });
    card.appendChild(del);

    // Insert before the Add profile card
    container.insertBefore(card, addCard);
  });
}

// 2. Dashboard View Loader
function renderDashboard() {
  const profile = Database.getActiveProfile();
  if (!profile) return;

  const stats = Database.getStatsSummary();

  // Populate quick metrics
  document.getElementById("dash-total-games").textContent = stats.totalGames;
  document.getElementById("dash-best-wpm").textContent = `${stats.bestWpm} WPM`;
  document.getElementById("dash-accuracy").textContent = `${stats.avgAccuracy}%`;
  document.getElementById("dash-hours").textContent = stats.totalHours;

  // Set Profile banner details
  document.getElementById("dash-welcome-name").textContent = profile.name;
  document.getElementById("dash-welcome-role").textContent = profile.role === "teacher" ? "Instructor Dashboard" : "Student Progress Dashboard";

  // Daily Challenge setup
  const challenge = Database.getDailyChallenge(englishLessons, khmerLessons);
  const titleEl = document.getElementById("dash-challenge-title");
  const descEl = document.getElementById("dash-challenge-desc");
  const playBtn = document.getElementById("dash-challenge-btn-play");

  if (titleEl) titleEl.textContent = challenge.title;
  if (descEl) descEl.textContent = challenge.description;
  
  if (playBtn) {
    // Clone play button to clear old event listeners
    const newPlayBtn = playBtn.cloneNode(true);
    playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
    newPlayBtn.addEventListener("click", () => {
      startTypingGameplay(challenge.lessonId, challenge.title, challenge.text, challenge.language, "practice");
    });
  }

  // Populate recent history list
  const historyList = document.getElementById("dash-recent-history-list");
  if (historyList) {
    historyList.innerHTML = "";
    
    if (stats.recentScores.length === 0) {
      historyList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">No sessions completed yet. Go to Lessons tab to start!</div>`;
    } else {
      stats.recentScores.forEach(h => {
        const item = document.createElement("div");
        item.className = "history-item";

        const titleArea = document.createElement("div");
        titleArea.className = "history-title-area";
        
        const name = document.createElement("div");
        name.className = "history-name";
        name.textContent = `${h.language.toUpperCase()} | ${h.lessonTitle}`;
        titleArea.appendChild(name);

        const meta = document.createElement("div");
        meta.className = "history-meta";
        meta.textContent = `${h.mode.toUpperCase()} • ${new Date(h.date).toLocaleDateString()}`;
        titleArea.appendChild(meta);

        item.appendChild(titleArea);

        const metrics = document.createElement("div");
        metrics.className = "history-metrics";

        const wpmPill = document.createElement("div");
        wpmPill.className = "metric-pill";
        wpmPill.innerHTML = `<span class="metric-pill-val">${h.wpm}</span><span class="metric-pill-label">WPM</span>`;
        metrics.appendChild(wpmPill);

        const accPill = document.createElement("div");
        accPill.className = "metric-pill";
        accPill.innerHTML = `<span class="metric-pill-val">${h.accuracy}%</span><span class="metric-pill-label">ACC</span>`;
        metrics.appendChild(accPill);

        item.appendChild(metrics);
        historyList.appendChild(item);
      });
    }
  }

  // Populate unlocked achievements lists
  const achievementsList = document.getElementById("dash-achievements-list");
  if (achievementsList) {
    achievementsList.innerHTML = "";
    const list = Database.getAchievementsList();
    const currentUnlocked = profile.achievements || [];

    list.slice(0, 3).forEach(ach => {
      const isUnlocked = currentUnlocked.includes(ach.id);
      const card = document.createElement("div");
      card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
      
      card.innerHTML = `
        <span class="achievement-icon">${ach.icon}</span>
        <div class="achievement-meta">
          <span class="achievement-name">${ach.title}</span>
          <span class="achievement-desc">${ach.desc}</span>
        </div>
      `;
      achievementsList.appendChild(card);
    });
  }
}

// 3. Lessons View Tree Loader
function renderLessonsTree(language) {
  const container = document.getElementById("lessons-map-scroller");
  if (!container) return;

  container.innerHTML = "";
  const lessons = language === "en" ? englishLessons : khmerLessons;
  const profile = Database.getActiveProfile();
  if (!profile) return;

  const unlockedId = language === "en" ? profile.progress.enLevelUnlocked : profile.progress.khLevelUnlocked;
  
  // Convert unlocked id suffix to number for lock evaluations
  const unlockedNum = parseInt(unlockedId.split("-")[1]);

  lessons.forEach(lesson => {
    const currentNum = parseInt(lesson.id.split("-")[1]);
    const isLocked = currentNum > unlockedNum;

    const node = document.createElement("div");
    node.className = `lesson-node ${isLocked ? 'locked' : ''}`;

    const info = document.createElement("div");
    info.className = "node-info-area";

    const circle = document.createElement("div");
    circle.className = "node-status-circle";
    
    // Check stars earned
    const starsEarned = profile.progress.stars[lesson.id] || 0;
    
    if (isLocked) {
      circle.innerHTML = "🔒";
    } else if (starsEarned > 0) {
      node.classList.add("completed");
      circle.innerHTML = "✓";
    } else {
      circle.innerHTML = currentNum;
    }
    info.appendChild(circle);

    const meta = document.createElement("div");
    meta.className = "node-meta";

    const title = document.createElement("div");
    title.className = "node-title";
    title.textContent = lesson.title;
    meta.appendChild(title);

    const desc = document.createElement("div");
    desc.className = "node-desc";
    desc.textContent = lesson.description;
    meta.appendChild(desc);

    // Stars display if completed
    if (starsEarned > 0) {
      const stars = document.createElement("div");
      stars.className = "node-stars";
      let starStr = "";
      for (let s = 0; s < 3; s++) starStr += (s < starsEarned ? "★" : "☆");
      stars.textContent = starStr;
      meta.appendChild(stars);
    }
    info.appendChild(meta);
    node.appendChild(info);

    // Action button
    const actions = document.createElement("div");
    actions.className = "node-actions";

    const btn = document.createElement("button");
    btn.className = "btn btn-primary lesson-btn-start";
    btn.textContent = isLocked ? "Locked" : (starsEarned > 0 ? "Retake" : "Start");
    btn.disabled = isLocked;

    btn.addEventListener("click", () => {
      // Direct gameplay routing
      startTypingGameplay(lesson.id, lesson.title, lesson.text, language, "story");
    });

    actions.appendChild(btn);
    node.appendChild(actions);

    container.appendChild(node);
  });

  // Append Exam Mode button at bottom of lessons list
  const examContainer = document.createElement("div");
  examContainer.style.marginTop = "30px";
  examContainer.style.textAlign = "center";
  
  const examBtn = document.createElement("button");
  examBtn.className = "btn btn-primary";
  examBtn.style.background = "linear-gradient(135deg, #db2777 0%, #6366f1 100%)";
  examBtn.style.padding = "14px 28px";
  examBtn.style.fontSize = "14px";
  
  if (language === "kh") {
    examBtn.textContent = "🏆 ប្រលងវាស់ស្ទង់សមត្ថភាពអក្សរខ្មែរ (Exam Mode)";
    examBtn.addEventListener("click", () => {
      // Select a hard paragraph for exam
      const examText = "ភាសាខ្មែរ គឺជាអត្តសញ្ញាណជាតិរបស់យើងទាំងអស់គ្នា។ ការប្រើប្រាស់ក្ដារចុចខ្មែរឱ្យបានត្រឹមត្រូវ និងរហ័ស ជួយសម្រួលដល់ការងារប្រចាំថ្ងៃ និងលើកស្ទួយអក្សរសាស្ត្រជាតិក្នុងសម័យឌីជីថល។";
      startTypingGameplay("kh-exam", "Khmer Unicode Typing Exam", examText, "kh", "exam", 120); // 2 minute limit
    });
  } else {
    examBtn.textContent = "🏆 Take English Typing Exam (Exam Mode)";
    examBtn.addEventListener("click", () => {
      const examText = "Professional typing requires strict adherence to proper techniques, maintaining focus on the monitor while ensuring high kinetic movement across keyboard boundaries. Perfect speed coupled with immaculate accuracy represents supreme skill.";
      startTypingGameplay("en-exam", "English Typing Exam", examText, "en", "exam", 120); // 2 minute limit
    });
  }

  examContainer.appendChild(examBtn);
  container.appendChild(examContainer);
}

// 4. Typing Gameplay Trigger
function startTypingGameplay(lessonId, lessonTitle, text, language, mode, timeLimit = 0) {
  // If exam mode, enforce 2 minute limit as default if not specified
  const limit = (mode === "exam" && timeLimit === 0) ? 120 : timeLimit;

  // Visual layout configurations
  document.getElementById("game-title").textContent = lessonTitle;
  document.getElementById("game-mode-pill").textContent = mode.toUpperCase();
  document.getElementById("game-mode-pill").className = `game-stat-value ${mode}-mode`;
  
  // Show gameplay view
  switchView("gameplay");

  TypingEngine.start(
    text,
    language,
    mode,
    limit,
    // On Complete handler
    async (metrics) => {
      // Stop typing engine loop
      TypingEngine.stop();

      // Write results to database
      const profile = Database.getActiveProfile();
      if (profile) {
        await Database.addScoreRecord({
          lessonId,
          lessonTitle,
          language,
          mode,
          wpm: metrics.wpm,
          accuracy: metrics.accuracy,
          timeSpent: metrics.timeSpent,
          score: metrics.score
        });

        // Trigger notifications and animations
        checkForPendingAchievements();
      }

      // Display Completion summary modal or stats overlay
      showGameCompletionOverlay(metrics, lessonId, lessonTitle, language, mode);
    },
    // On Tick handler
    (secondsLeft) => {
      // Tick details if needed
    }
  );
}

function showGameCompletionOverlay(metrics, lessonId, lessonTitle, language, mode) {
  const overlay = document.createElement("div");
  overlay.className = "game-overlay-screen";
  overlay.id = "gameplay-completion-overlay";

  const container = document.createElement("div");
  container.className = "grid-card";
  container.style.width = "400px";
  container.style.padding = "30px";
  container.style.alignItems = "center";
  container.style.textAlign = "center";
  container.style.background = "var(--bg-gradient)";
  container.style.boxShadow = "var(--shadow-lg)";

  const title = document.createElement("h2");
  title.style.marginBottom = "15px";
  title.style.color = "var(--accent-secondary)";
  title.textContent = "Exercise Completed!";
  container.appendChild(title);

  const statsGrid = document.createElement("div");
  statsGrid.className = "quick-stats-row";
  statsGrid.style.width = "100%";
  statsGrid.style.gridTemplateColumns = "1fr 1fr";
  statsGrid.style.marginBottom = "24px";

  statsGrid.innerHTML = `
    <div class="quick-stat-box">
      <div class="quick-stat-label">Speed</div>
      <div class="quick-stat-val" style="color:var(--accent-secondary);">${metrics.wpm} WPM</div>
    </div>
    <div class="quick-stat-box">
      <div class="quick-stat-label">Accuracy</div>
      <div class="quick-stat-val" style="color:var(--accent-success);">${metrics.accuracy}%</div>
    </div>
  `;
  container.appendChild(statsGrid);

  // If this was exam mode, display Certificate Print prompt!
  const profile = Database.getActiveProfile();
  if (mode === "exam" && metrics.accuracy >= 90 && metrics.wpm >= 30) {
    const passAlert = document.createElement("div");
    passAlert.className = "exam-pass-alert";
    passAlert.innerHTML = `
      <div style="font-weight:700; color:var(--accent-success); margin-bottom:4px;">🎉 Exam Passed!</div>
      <div style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">You qualified for the Typing Master Certificate!</div>
      <button class="btn btn-primary" id="btn-print-certificate" style="font-size:11px; padding:6px 12px;">Download Certificate</button>
    `;
    container.appendChild(passAlert);
    
    // Add certificate print binding
    setTimeout(() => {
      const printBtn = document.getElementById("btn-print-certificate");
      if (printBtn) {
        printBtn.addEventListener("click", () => {
          const dateStr = new Date().toLocaleDateString();
          Exporter.saveCertificate(profile.name, metrics.wpm, metrics.accuracy, dateStr);
        });
      }
    }, 100);
  }

  const actions = document.createElement("div");
  actions.className = "modal-actions";
  actions.style.width = "100%";
  actions.style.justifyContent = "center";

  const retryBtn = document.createElement("button");
  retryBtn.className = "btn btn-secondary";
  retryBtn.textContent = "Retry";
  retryBtn.addEventListener("click", () => {
    overlay.remove();
    startTypingGameplay(lessonId, lessonTitle, TypingEngine.textToType, language, mode);
  });
  actions.appendChild(retryBtn);

  const doneBtn = document.createElement("button");
  doneBtn.className = "btn btn-primary";
  doneBtn.textContent = "Continue";
  doneBtn.addEventListener("click", () => {
    overlay.remove();
    switchView("lessons");
  });
  actions.appendChild(doneBtn);

  container.appendChild(actions);
  overlay.appendChild(container);

  // Append overlay inside gameplay view
  document.getElementById("view-gameplay").appendChild(overlay);
}

// 5. Leaderboard View
function renderLeaderboard() {
  const list = Database.getLeaderboard();
  const tbody = document.getElementById("leaderboard-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No records registered in the leaderboard yet.</td></tr>`;
    return;
  }

  list.forEach((score, idx) => {
    const tr = document.createElement("tr");

    // Rank
    const rankTd = document.createElement("td");
    const rankBadge = document.createElement("span");
    rankBadge.className = `rank-badge rank-${idx + 1}`;
    rankBadge.textContent = idx + 1;
    rankTd.appendChild(rankBadge);
    tr.appendChild(rankTd);

    // Profile Name
    const nameTd = document.createElement("td");
    nameTd.style.fontWeight = "600";
    nameTd.textContent = score.profileName;
    tr.appendChild(nameTd);

    // Exercise
    const lessonTd = document.createElement("td");
    lessonTd.textContent = `${score.language.toUpperCase()} | ${score.lessonTitle}`;
    tr.appendChild(lessonTd);

    // WPM
    const wpmTd = document.createElement("td");
    wpmTd.style.fontWeight = "700";
    wpmTd.style.color = "var(--accent-secondary)";
    wpmTd.textContent = `${score.wpm} WPM`;
    tr.appendChild(wpmTd);

    // Accuracy
    const accTd = document.createElement("td");
    accTd.textContent = `${score.accuracy}%`;
    tr.appendChild(accTd);

    // Date
    const dateTd = document.createElement("td");
    dateTd.style.color = "var(--text-muted)";
    dateTd.textContent = new Date(score.date).toLocaleDateString();
    tr.appendChild(dateTd);

    tbody.appendChild(tr);
  });
}

// 6. Reports & Analytics View
function renderReports() {
  const profile = Database.getActiveProfile();
  if (!profile) return;

  const stats = Database.getStatsSummary();

  // Draw line graph of last 10 session WPM speeds
  const lastSessions = profile.history.slice(-10);
  const wpmData = lastSessions.map(h => h.wpm);
  const wpmLabels = lastSessions.map((h, i) => `#${i + 1}`);

  Charts.renderLineChart("reports-wpm-chart", wpmData, wpmLabels, {
    lineColor: "#6366f1",
    fillColorStart: "rgba(99, 102, 241, 0.25)",
    fillColorStop: "rgba(99, 102, 241, 0.0)"
  });

  // Draw accuracy distribution bar graph
  const accData = lastSessions.map(h => h.accuracy);
  const accLabels = lastSessions.map((h, i) => `#${i + 1}`);
  
  Charts.renderBarChart("reports-accuracy-chart", accData, accLabels, {
    barColor: "#06b6d4"
  });
}

// 7. Teacher Dashboard Loader
function renderTeacherDashboard() {
  const container = document.getElementById("teacher-students-list");
  if (!container) return;

  container.innerHTML = "";
  const profiles = Database.getProfiles();

  if (profiles.length === 0) {
    container.innerHTML = `<div style="padding:16px; text-align:center; color:var(--text-muted);">No student profiles registered.</div>`;
    return;
  }

  profiles.forEach(p => {
    const item = document.createElement("div");
    item.className = "student-list-item";
    item.setAttribute("data-id", p.id);

    const avatar = document.createElement("div");
    avatar.className = "badge-avatar";
    avatar.style.backgroundColor = p.avatar;
    avatar.textContent = p.name.charAt(0).toUpperCase();
    item.appendChild(avatar);

    const info = document.createElement("div");
    info.className = "node-meta";
    
    const name = document.createElement("div");
    name.className = "node-title";
    name.textContent = p.name;
    info.appendChild(name);

    const role = document.createElement("div");
    role.className = "node-desc";
    role.textContent = p.role.toUpperCase();
    info.appendChild(role);

    item.appendChild(info);

    // Event listener to view details
    item.addEventListener("click", () => {
      document.querySelectorAll(".student-list-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      loadTeacherStudentDetails(p.id);
    });

    container.appendChild(item);
  });

  // Select first student by default
  const firstItem = container.querySelector(".student-list-item");
  if (firstItem) firstItem.click();
}

function loadTeacherStudentDetails(studentId) {
  const profile = Database.getProfiles().find(p => p.id === studentId);
  if (!profile) return;

  const stats = Database.getStatsSummary(studentId);

  // Populate student info cards
  document.getElementById("teacher-student-name").textContent = profile.name;
  document.getElementById("teacher-student-lessons").textContent = stats.totalGames;
  document.getElementById("teacher-student-wpm").textContent = `${stats.bestWpm} WPM`;
  document.getElementById("teacher-student-accuracy").textContent = `${stats.avgAccuracy}%`;
  document.getElementById("teacher-student-hours").textContent = stats.totalHours;

  // Render recent history list
  const historyList = document.getElementById("teacher-student-history-list");
  if (historyList) {
    historyList.innerHTML = "";
    if (profile.history.length === 0) {
      historyList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">This student has not completed any exercises yet.</div>`;
    } else {
      profile.history.slice(-10).reverse().forEach(h => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.innerHTML = `
          <div class="history-title-area">
            <div class="history-name">${h.language.toUpperCase()} | ${h.lessonTitle}</div>
            <div class="history-meta">${h.mode.toUpperCase()} • ${new Date(h.date).toLocaleDateString()}</div>
          </div>
          <div class="history-metrics">
            <div class="metric-pill">
              <span class="metric-pill-val">${h.wpm}</span>
              <span class="metric-pill-label">WPM</span>
            </div>
            <div class="metric-pill">
              <span class="metric-pill-val">${h.accuracy}%</span>
              <span class="metric-pill-label">ACC</span>
            </div>
          </div>
        `;
        historyList.appendChild(item);
      });
    }
  }
}

// 8. Settings View Loader
function renderSettingsView() {
  const profile = Database.getActiveProfile();
  if (!profile) return;

  const themeToggle = document.getElementById("theme-toggle");
  const soundToggle = document.getElementById("sound-toggle");
  const layoutSelect = document.getElementById("settings-keyboard-layout");
  const fontSelect = document.getElementById("settings-font-size");

  if (themeToggle) themeToggle.checked = profile.settings.theme === "dark";
  if (soundToggle) soundToggle.checked = profile.settings.sound;
  if (layoutSelect) layoutSelect.value = profile.settings.keyboardLayout;
  if (fontSelect) fontSelect.value = profile.settings.fontSize;
}

// Mini Games Management
function setupMiniGame(gameName, language) {
  // Clear canvas overlay screens
  const canvasContainer = document.getElementById("game-canvas-container");
  const overlay = canvasContainer.querySelector(".game-overlay-screen");
  if (overlay) overlay.style.display = "flex";

  // Hide custom overlay prompts
  const restartBtn = document.getElementById("game-restart-btn");
  if (restartBtn) restartBtn.style.display = "none";

  // Hide race HTML overlay
  const raceContainer = document.getElementById("game-race-text-container");
  if (raceContainer) raceContainer.style.display = "none";
}

function startGameSession(gameName, language) {
  const canvasContainer = document.getElementById("game-canvas-container");
  const overlay = canvasContainer.querySelector(".game-overlay-screen");
  if (overlay) overlay.style.display = "none";

  // Setup restart buttons
  const restartBtn = document.getElementById("game-restart-btn");
  if (restartBtn) {
    restartBtn.style.display = "inline-block";
    const newBtn = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newBtn, restartBtn);
    newBtn.addEventListener("click", () => {
      startGameSession(gameName, language);
    });
  }

  // Focus raw input catcher
  const rawInput = document.getElementById("typing-raw-input");
  if (rawInput) {
    rawInput.value = "";
    rawInput.focus();
  }

  MiniGames.start(gameName, language, async (finalScore) => {
    // Game over callback: Write score to database
    const profile = Database.getActiveProfile();
    if (profile) {
      await Database.addScoreRecord({
        lessonId: `game-${gameName}`,
        lessonTitle: `Game: ${gameName.toUpperCase()}`,
        language: language,
        mode: "minigame",
        wpm: Math.round(finalScore / 10), // mock WPM representation from score
        accuracy: 90,
        timeSpent: 45, // default session timing
        score: finalScore
      });

      checkForPendingAchievements();
    }
  });
}

// Achievements Banner Checker
function checkForPendingAchievements() {
  const profile = Database.getActiveProfile();
  if (!profile || !profile.pendingAchievementAlerts || profile.pendingAchievementAlerts.length === 0) return;

  const alert = profile.pendingAchievementAlerts.shift(); // take the first alert
  Database.save(); // save shifted state

  showAchievementPopup(alert);

  // Set timeout to check for more alerts sequentially
  setTimeout(() => {
    checkForPendingAchievements();
  }, 4500);
}

function showAchievementPopup(alert) {
  const popup = document.getElementById("achievement-alert-popup");
  if (!popup) return;

  const iconEl = popup.querySelector(".achievement-icon");
  const titleEl = popup.querySelector(".achievement-name");
  const descEl = popup.querySelector(".achievement-desc");

  if (iconEl) iconEl.textContent = alert.icon;
  if (titleEl) titleEl.textContent = alert.title;
  if (descEl) descEl.textContent = alert.desc;

  popup.classList.add("active");

  // Slide out after 3.5 seconds
  setTimeout(() => {
    popup.classList.remove("active");
  }, 3500);
}

// Fallback Lessons datasets if fetch fails
function getFallbackEnglishLessons() {
  return [
    {
      id: "en-1",
      title: "Home Row Keys",
      description: "Practice home row keys: a s d f j k l ;",
      difficulty: "easy",
      type: "words",
      text: "asdf jkl; asdf jkl; a s d f j k l ; asdfjkl;"
    }
  ];
}

function getFallbackKhmerLessons() {
  return [
    {
      id: "kh-1",
      title: "ព្យញ្ជនៈគ្រឹះ (Core Consonants)",
      description: "ព្យញ្ជនៈគ្រឹះ៖ ក ខ គ ឃ ង ច ឆ ជ ឈ ញ",
      difficulty: "easy",
      type: "words",
      text: "ក ខ គ ឃ ង ច ឆ ជ ឈ ញ កខគឃង ចឆជឈញ"
    }
  ];
}
