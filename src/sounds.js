// Web Audio API Synthesizer for Khmer & English Typing Master
// Fully offline, no asset loading required!

const Sounds = {
  ctx: null,

  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  isEnabled() {
    // Check active profile settings
    if (typeof Database !== "undefined") {
      const profile = Database.getActiveProfile();
      if (profile && profile.settings) {
        return profile.settings.sound;
      }
    }
    return true; // Default to enabled
  },

  getVolume() {
    if (typeof Database !== "undefined") {
      const profile = Database.getActiveProfile();
      if (profile && profile.settings) {
        return profile.settings.volume || 0.5;
      }
    }
    return 0.5;
  },

  playClick() {
    if (!this.isEnabled()) return;
    this.initContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Woodblock/Mechanical tap profile
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.getVolume() * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  },

  playBuzz() {
    if (!this.isEnabled()) return;
    this.initContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Buzzing sound profile
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);

    gain.gain.setValueAtTime(this.getVolume() * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  },

  playSuccess() {
    if (!this.isEnabled()) return;
    this.initContext();

    // Play a delightful C-major arpeggio
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(this.getVolume() * 0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }
};

window.Sounds = Sounds;
