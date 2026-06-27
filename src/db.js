// Local JSON/LocalStorage Database Manager for Khmer & English Typing Master
const DB_VERSION = "1.0.0";

const defaultDB = {
  version: DB_VERSION,
  profiles: [],
  activeProfileId: null
};

const defaultSettings = {
  theme: "dark",
  sound: true,
  keyboardLayout: "nida", // "nida" or "standard" (Khmer), "qwerty" (English)
  fontSize: 22, // in px
  volume: 0.5
};

let dbData = { ...defaultDB };

const AchievementsList = [
  { id: "first-game", title: "🏆 First Game", desc: "Complete your first typing exercise or game.", icon: "🎯" },
  { id: "speed-50", title: "⚡ 50 WPM Speedster", desc: "Reach 50 Words Per Minute in any mode.", icon: "⚡" },
  { id: "speed-80", title: "🚀 80 WPM Guru", desc: "Reach 80 Words Per Minute in any mode.", icon: "🚀" },
  { id: "accuracy-100", title: "💯 Perfect Precision", desc: "Achieve 100% typing accuracy on an exercise.", icon: "💯" },
  { id: "games-100", title: "🔥 100 Games Played", desc: "Complete a total of 100 sessions.", icon: "🔥" },
  { id: "typing-master", title: "👑 Khmer Typing Master", desc: "Pass the Khmer Exam Mode with 40+ WPM and 95%+ accuracy.", icon: "👑" }
];

const Database = {
  isElectron: false,

  async init() {
    this.isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
    
    if (this.isElectron) {
      try {
        const response = await window.electronAPI.loadDatabase();
        if (response.success && response.data) {
          dbData = response.data;
        } else {
          dbData = { ...defaultDB };
          await this.save();
        }
      } catch (err) {
        console.error("Failed to load Electron DB, falling back to LocalStorage:", err);
        this.loadFromLocalStorage();
      }
    } else {
      this.loadFromLocalStorage();
    }

    // If no active profile, and profiles exist, set active to the first
    if (!dbData.activeProfileId && dbData.profiles.length > 0) {
      dbData.activeProfileId = dbData.profiles[0].id;
    }
  },

  loadFromLocalStorage() {
    const raw = localStorage.getItem("typing_master_db");
    if (raw) {
      try {
        dbData = JSON.parse(raw);
      } catch (e) {
        dbData = { ...defaultDB };
      }
    } else {
      dbData = { ...defaultDB };
      this.saveToLocalStorage();
    }
  },

  async save() {
    if (this.isElectron) {
      try {
        const res = await window.electronAPI.saveDatabase(dbData);
        if (!res.success) {
          console.error("Failed to save to Electron disk, writing to LocalStorage:", res.error);
          this.saveToLocalStorage();
        }
      } catch (err) {
        console.error("Electron save failed, fallback to LocalStorage:", err);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  },

  saveToLocalStorage() {
    localStorage.setItem("typing_master_db", JSON.stringify(dbData));
  },

  // Profiles API
  getProfiles() {
    return dbData.profiles || [];
  },

  getActiveProfile() {
    if (!dbData.activeProfileId) return null;
    return dbData.profiles.find(p => p.id === dbData.activeProfileId) || null;
  },

  async setActiveProfile(id) {
    dbData.activeProfileId = id;
    await this.save();
  },

  async createProfile(name, avatar, role = "student") {
    const newId = "profile_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    const newProfile = {
      id: newId,
      name: name,
      avatar: avatar || "#3b82f6", // Default blue hex
      role: role, // "student", "teacher"
      createdAt: new Date().toISOString(),
      settings: { ...defaultSettings },
      progress: {
        enLevelUnlocked: "en-1",
        khLevelUnlocked: "kh-1",
        stars: {} // { lessonId: 1/2/3 }
      },
      history: [],
      achievements: [] // string array of unlocked IDs
    };

    dbData.profiles.push(newProfile);
    dbData.activeProfileId = newId;
    await this.save();
    return newProfile;
  },

  async deleteProfile(id) {
    dbData.profiles = dbData.profiles.filter(p => p.id !== id);
    if (dbData.activeProfileId === id) {
      dbData.activeProfileId = dbData.profiles.length > 0 ? dbData.profiles[0].id : null;
    }
    await this.save();
  },

  // History & Statistics API
  async addScoreRecord(record) {
    const profile = this.getActiveProfile();
    if (!profile) return null;

    const newRecord = {
      id: "score_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString(),
      ...record // { lessonId, lessonTitle, language, mode, wpm, accuracy, timeSpent, score }
    };

    profile.history.push(newRecord);

    // Track statistics and check achievements
    await this.checkAchievements(profile, newRecord);

    // Update Story Mode unlock levels if applicable
    if (newRecord.mode === "story" && newRecord.accuracy >= 80) {
      const isEnglish = newRecord.language === "en";
      const parts = newRecord.lessonId.split("-");
      const currentLevelNum = parseInt(parts[1]);
      
      const nextLevelId = `${isEnglish ? "en" : "kh"}-${currentLevelNum + 1}`;
      
      // We will unlock next level
      if (isEnglish) {
        const currentUnlockedNum = parseInt(profile.progress.enLevelUnlocked.split("-")[1]);
        if (currentLevelNum >= currentUnlockedNum && currentLevelNum < 7) {
          profile.progress.enLevelUnlocked = nextLevelId;
        }
      } else {
        const currentUnlockedNum = parseInt(profile.progress.khLevelUnlocked.split("-")[1]);
        if (currentLevelNum >= currentUnlockedNum && currentLevelNum < 7) {
          profile.progress.khLevelUnlocked = nextLevelId;
        }
      }

      // Stars calculation
      let stars = 1;
      if (newRecord.accuracy >= 98 && newRecord.wpm >= 40) stars = 3;
      else if (newRecord.accuracy >= 90 && newRecord.wpm >= 25) stars = 2;

      const prevStars = profile.progress.stars[newRecord.lessonId] || 0;
      if (stars > prevStars) {
        profile.progress.stars[newRecord.lessonId] = stars;
      }
    }

    await this.save();
    return newRecord;
  },

  async updateSettings(settings) {
    const profile = this.getActiveProfile();
    if (!profile) return;
    profile.settings = { ...profile.settings, ...settings };
    await this.save();
  },

  async checkAchievements(profile, lastRecord) {
    const currentUnlocked = profile.achievements || [];
    const newUnlocks = [];

    // 1. First Game
    if (!currentUnlocked.includes("first-game")) {
      newUnlocks.push("first-game");
    }

    // 2. 50 WPM
    if (lastRecord.wpm >= 50 && !currentUnlocked.includes("speed-50")) {
      newUnlocks.push("speed-50");
    }

    // 3. 80 WPM
    if (lastRecord.wpm >= 80 && !currentUnlocked.includes("speed-80")) {
      newUnlocks.push("speed-80");
    }

    // 4. 100% Accuracy
    if (lastRecord.accuracy === 100 && !currentUnlocked.includes("accuracy-100")) {
      newUnlocks.push("accuracy-100");
    }

    // 5. 100 Games Played
    const totalSessions = profile.history.length;
    if (totalSessions >= 100 && !currentUnlocked.includes("games-100")) {
      newUnlocks.push("games-100");
    }

    // 6. Khmer Typing Master
    if (
      lastRecord.mode === "exam" &&
      lastRecord.language === "kh" &&
      lastRecord.wpm >= 40 &&
      lastRecord.accuracy >= 95 &&
      !currentUnlocked.includes("typing-master")
    ) {
      newUnlocks.push("typing-master");
    }

    if (newUnlocks.length > 0) {
      profile.achievements = [...currentUnlocked, ...newUnlocks];
      // Store dynamic alerts to display on main view
      if (!profile.pendingAchievementAlerts) {
        profile.pendingAchievementAlerts = [];
      }
      newUnlocks.forEach(id => {
        const item = AchievementsList.find(a => a.id === id);
        if (item) {
          profile.pendingAchievementAlerts.push(item);
        }
      });
    }
  },

  getAchievementsList() {
    return AchievementsList;
  },

  // Leaderboard retrieval
  getLeaderboard() {
    const allScores = [];
    dbData.profiles.forEach(p => {
      p.history.forEach(h => {
        allScores.push({
          profileName: p.name,
          profileAvatar: p.avatar,
          wpm: h.wpm,
          accuracy: h.accuracy,
          mode: h.mode,
          language: h.language,
          lessonTitle: h.lessonTitle,
          score: h.score,
          date: h.date
        });
      });
    });

    // Sort by WPM (descending), then accuracy, then date
    return allScores.sort((a, b) => {
      if (b.wpm !== a.wpm) return b.wpm - a.wpm;
      return b.accuracy - a.accuracy;
    }).slice(0, 15); // Top 15 highscores
  },

  // Calculate statistics summary for a profile
  getStatsSummary(profileId = null) {
    const pid = profileId || dbData.activeProfileId;
    const profile = dbData.profiles.find(p => p.id === pid);
    if (!profile || profile.history.length === 0) {
      return {
        totalGames: 0,
        bestWpm: 0,
        avgWpm: 0,
        bestAccuracy: 0,
        avgAccuracy: 0,
        totalHours: "0.0",
        recentScores: []
      };
    }

    const history = profile.history;
    const totalGames = history.length;
    const bestWpm = Math.max(...history.map(h => h.wpm));
    const avgWpm = Math.round(history.reduce((sum, h) => sum + h.wpm, 0) / totalGames);
    const bestAccuracy = Math.max(...history.map(h => h.accuracy));
    const avgAccuracy = Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / totalGames);
    
    // Total hours calculated from timeSpent (seconds)
    const totalSeconds = history.reduce((sum, h) => sum + h.timeSpent, 0);
    const totalHours = (totalSeconds / 3600).toFixed(1);

    const recentScores = [...history]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalGames,
      bestWpm,
      avgWpm,
      bestAccuracy,
      avgAccuracy,
      totalHours,
      recentScores
    };
  },

  // Get daily challenge content
  getDailyChallenge(lessonsListEn, lessonsListKh) {
    // Generate deterministic index based on today's date
    const dateStr = new Date().toISOString().split("T")[0];
    const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const isEnglish = hash % 2 === 0;
    const lessonsList = isEnglish ? lessonsListEn : lessonsListKh;
    const lessonIndex = hash % lessonsList.length;
    const lesson = lessonsList[lessonIndex];

    return {
      id: "daily-challenge",
      title: `Daily Challenge: ${lesson.title}`,
      description: `Today's featured exercise (${isEnglish ? 'English' : 'Khmer'}). Complete it to claim your highscore!`,
      difficulty: lesson.difficulty,
      language: isEnglish ? "en" : "kh",
      lessonId: lesson.id,
      text: lesson.text
    };
  }
};

// Export to window
window.Database = Database;
