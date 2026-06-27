// Virtual Keyboard Engine for Khmer & English Typing Master

const KeyboardLayouts = {
  // English QWERTY Layout
  qwerty: {
    rows: [
      [
        { code: "Backquote", label: "`", shiftLabel: "~" },
        { code: "Digit1", label: "1", shiftLabel: "!" },
        { code: "Digit2", label: "2", shiftLabel: "@" },
        { code: "Digit3", label: "3", shiftLabel: "#" },
        { code: "Digit4", label: "4", shiftLabel: "$" },
        { code: "Digit5", label: "5", shiftLabel: "%" },
        { code: "Digit6", label: "6", shiftLabel: "^" },
        { code: "Digit7", label: "7", shiftLabel: "&" },
        { code: "Digit8", label: "8", shiftLabel: "*" },
        { code: "Digit9", label: "9", shiftLabel: "(" },
        { code: "Digit0", label: "0", shiftLabel: ")" },
        { code: "Minus", label: "-", shiftLabel: "_" },
        { code: "Equal", label: "=", shiftLabel: "+" },
        { code: "Backspace", label: "Backspace", class: "backspace-key" }
      ],
      [
        { code: "Tab", label: "Tab", class: "tab-key" },
        { code: "KeyQ", label: "q", shiftLabel: "Q" },
        { code: "KeyW", label: "w", shiftLabel: "W" },
        { code: "KeyE", label: "e", shiftLabel: "E" },
        { code: "KeyR", label: "r", shiftLabel: "R" },
        { code: "KeyT", label: "t", shiftLabel: "T" },
        { code: "KeyY", label: "y", shiftLabel: "Y" },
        { code: "KeyU", label: "u", shiftLabel: "U" },
        { code: "KeyI", label: "i", shiftLabel: "I" },
        { code: "KeyO", label: "o", shiftLabel: "O" },
        { code: "KeyP", label: "p", shiftLabel: "P" },
        { code: "BracketLeft", label: "[", shiftLabel: "{" },
        { code: "BracketRight", label: "]", shiftLabel: "}" },
        { code: "Backslash", label: "\\", shiftLabel: "|" }
      ],
      [
        { code: "CapsLock", label: "Caps Lock", class: "caps-key" },
        { code: "KeyA", label: "a", shiftLabel: "A" },
        { code: "KeyS", label: "s", shiftLabel: "S" },
        { code: "KeyD", label: "d", shiftLabel: "D" },
        { code: "KeyF", label: "f", shiftLabel: "F" },
        { code: "KeyG", label: "g", shiftLabel: "G" },
        { code: "KeyH", label: "h", shiftLabel: "H" },
        { code: "KeyJ", label: "j", shiftLabel: "J" },
        { code: "KeyK", label: "k", shiftLabel: "K" },
        { code: "KeyL", label: "l", shiftLabel: "L" },
        { code: "Semicolon", label: ";", shiftLabel: ":" },
        { code: "Quote", label: "'", shiftLabel: "\"" },
        { code: "Enter", label: "Enter", class: "enter-key" }
      ],
      [
        { code: "ShiftLeft", label: "Shift", class: "shift-key" },
        { code: "KeyZ", label: "z", shiftLabel: "Z" },
        { code: "KeyX", label: "x", shiftLabel: "X" },
        { code: "KeyC", label: "c", shiftLabel: "C" },
        { code: "KeyV", label: "v", shiftLabel: "V" },
        { code: "KeyB", label: "b", shiftLabel: "B" },
        { code: "KeyN", label: "n", shiftLabel: "N" },
        { code: "KeyM", label: "m", shiftLabel: "M" },
        { code: "Comma", label: ",", shiftLabel: "<" },
        { code: "Period", label: ".", shiftLabel: ">" },
        { code: "Slash", label: "/", shiftLabel: "?" },
        { code: "ShiftRight", label: "Shift", class: "shift-key" }
      ],
      [
        { code: "ControlLeft", label: "Ctrl", class: "ctrl-key" },
        { code: "MetaLeft", label: "Win", class: "win-key" },
        { code: "AltLeft", label: "Alt", class: "alt-key" },
        { code: "Space", label: "", class: "space-key" },
        { code: "AltRight", label: "Alt", class: "alt-key" },
        { code: "ControlRight", label: "Ctrl", class: "ctrl-key" }
      ]
    ]
  },

  // Khmer NIDA Keyboard Layout
  nida: {
    rows: [
      [
        { code: "Backquote", label: "«", shiftLabel: "»" },
        { code: "Digit1", label: "១", shiftLabel: "!" },
        { code: "Digit2", label: "២", shiftLabel: "ៗ" },
        { code: "Digit3", label: "៣", shiftLabel: "៊" },
        { code: "Digit4", label: "៤", shiftLabel: "ុ" },
        { code: "Digit5", label: "៥", shiftLabel: "ូ" },
        { code: "Digit6", label: "៦", shiftLabel: "ួ" },
        { code: "Digit7", label: "៧", shiftLabel: "៌" },
        { code: "Digit8", label: "៨", shiftLabel: "៍" },
        { code: "Digit9", label: "៩", shiftLabel: "៏" },
        { code: "Digit0", label: "០", shiftLabel: "័" },
        { code: "Minus", label: "-", shiftLabel: "ិ" },
        { code: "Equal", label: "=", shiftLabel: "ី" },
        { code: "Backspace", label: "លុប", class: "backspace-key" }
      ],
      [
        { code: "Tab", label: "Tab", class: "tab-key" },
        { code: "KeyQ", label: "ឆ", shiftLabel: "ឈ" },
        { code: "KeyW", label: "ឹ", shiftLabel: "ឺ" },
        { code: "KeyE", label: "េ", shiftLabel: "ែ" },
        { code: "KeyR", label: "រ", shiftLabel: "ឫ" },
        { code: "KeyT", label: "ទ", shiftLabel: "ធ" },
        { code: "KeyY", label: "យ", shiftLabel: "យ" },
        { code: "KeyU", label: "ុ", shiftLabel: "ូ" },
        { code: "KeyI", label: "ិ", shiftLabel: "ី" },
        { code: "KeyO", label: "ោ", shiftLabel: "ៅ" },
        { code: "KeyP", label: "ផ", shiftLabel: "ភ" },
        { code: "BracketLeft", label: "ៀ", shiftLabel: "ឿ" },
        { code: "BracketRight", label: "ើ", shiftLabel: "ើ" },
        { code: "Backslash", label: "ឮ", shiftLabel: "ឡ" }
      ],
      [
        { code: "CapsLock", label: "Caps", class: "caps-key" },
        { code: "KeyA", label: "ា", shiftLabel: "ាំ" },
        { code: "KeyS", label: "ស", shiftLabel: "្ស" },
        { code: "KeyD", label: "ដ", shiftLabel: "ឌ" },
        { code: "KeyF", label: "ថ", shiftLabel: "ឋ" },
        { code: "KeyG", label: "ង", shiftLabel: "ឡ" },
        { code: "KeyH", label: "ហ", shiftLabel: "ះ" },
        { code: "KeyJ", label: "្", shiftLabel: "ញ" }, // Subscript sign in NIDA is on 'j'
        { code: "KeyK", label: "ក", shiftLabel: "គ" },
        { code: "KeyL", label: "ល", shiftLabel: "ឡ" },
        { code: "Semicolon", label: "ើ", shiftLabel: "ឿ" },
        { code: "Quote", label: "ៀ", shiftLabel: "េះ" },
        { code: "Enter", label: "Enter", class: "enter-key" }
      ],
      [
        { code: "ShiftLeft", label: "Shift", class: "shift-key" },
        { code: "KeyZ", label: "ឋ", shiftLabel: "ឌ" },
        { code: "KeyX", label: "ខ", shiftLabel: "ឃ" },
        { code: "KeyC", label: "ច", shiftLabel: "ជ" },
        { code: "KeyV", label: "វ", shiftLabel: "វ" },
        { code: "KeyB", label: "ប", shiftLabel: "ព" },
        { code: "KeyN", label: "ន", shiftLabel: "ណ" },
        { code: "KeyM", label: "ម", shiftLabel: "ំ" },
        { code: "Comma", label: ",", shiftLabel: "«" },
        { code: "Period", label: "៕", shiftLabel: "»" }, // Khmer period
        { code: "Slash", label: "៖", shiftLabel: "?" }, // Khmer colon
        { code: "ShiftRight", label: "Shift", class: "shift-key" }
      ],
      [
        { code: "ControlLeft", label: "Ctrl", class: "ctrl-key" },
        { code: "MetaLeft", label: "Win", class: "win-key" },
        { code: "AltLeft", label: "Alt", class: "alt-key" },
        { code: "Space", label: "", class: "space-key" },
        { code: "AltRight", label: "Alt", class: "alt-key" },
        { code: "ControlRight", label: "Ctrl", class: "ctrl-key" }
      ]
    ]
  },

  // Khmer Standard Keyboard Layout (alternative standard)
  standard: {
    rows: [
      [
        { code: "Backquote", label: "«", shiftLabel: "»" },
        { code: "Digit1", label: "១", shiftLabel: "!" },
        { code: "Digit2", label: "២", shiftLabel: "ៗ" },
        { code: "Digit3", label: "៣", shiftLabel: "៊" },
        { code: "Digit4", label: "៤", shiftLabel: "ុ" },
        { code: "Digit5", label: "៥", shiftLabel: "ូ" },
        { code: "Digit6", label: "៦", shiftLabel: "ួ" },
        { code: "Digit7", label: "៧", shiftLabel: "៌" },
        { code: "Digit8", label: "៨", shiftLabel: "៍" },
        { code: "Digit9", label: "៩", shiftLabel: "៏" },
        { code: "Digit0", label: "០", shiftLabel: "័" },
        { code: "Minus", label: "-", shiftLabel: "ិ" },
        { code: "Equal", label: "=", shiftLabel: "ី" },
        { code: "Backspace", label: "លុប", class: "backspace-key" }
      ],
      [
        { code: "Tab", label: "Tab", class: "tab-key" },
        { code: "KeyQ", label: "ឆ", shiftLabel: "ឈ" },
        { code: "KeyW", label: "ឹ", shiftLabel: "ឺ" },
        { code: "KeyE", label: "េ", shiftLabel: "ែ" },
        { code: "KeyR", label: "រ", shiftLabel: "ឫ" },
        { code: "KeyT", label: "ទ", shiftLabel: "ធ" },
        { code: "KeyY", label: "យ", shiftLabel: "យ" },
        { code: "KeyU", label: "ុ", shiftLabel: "ូ" },
        { code: "KeyI", label: "ិ", shiftLabel: "ី" },
        { code: "KeyO", label: "ោ", shiftLabel: "ៅ" },
        { code: "KeyP", label: "ផ", shiftLabel: "ភ" },
        { code: "BracketLeft", label: "ៀ", shiftLabel: "ឿ" },
        { code: "BracketRight", label: "ើ", shiftLabel: "ើ" },
        { code: "Backslash", label: "ឮ", shiftLabel: "ឡ" }
      ],
      [
        { code: "CapsLock", label: "Caps", class: "caps-key" },
        { code: "KeyA", label: "ា", shiftLabel: "ាំ" },
        { code: "KeyS", label: "ស", shiftLabel: "្ស" },
        { code: "KeyD", label: "ដ", shiftLabel: "ឌ" },
        { code: "KeyF", label: "ថ", shiftLabel: "ឋ" },
        { code: "KeyG", label: "ង", shiftLabel: "ឡ" },
        { code: "KeyH", label: "ហ", shiftLabel: "ះ" },
        { code: "KeyJ", label: "្", shiftLabel: "ញ" }, // Subscript sign
        { code: "KeyK", label: "ក", shiftLabel: "គ" },
        { code: "KeyL", label: "ល", shiftLabel: "ឡ" },
        { code: "Semicolon", label: "ើ", shiftLabel: "ឿ" },
        { code: "Quote", label: "ៀ", shiftLabel: "េះ" },
        { code: "Enter", label: "Enter", class: "enter-key" }
      ],
      [
        { code: "ShiftLeft", label: "Shift", class: "shift-key" },
        { code: "KeyZ", label: "ឋ", shiftLabel: "ឌ" },
        { code: "KeyX", label: "ខ", shiftLabel: "ឃ" },
        { code: "KeyC", label: "ច", shiftLabel: "ជ" },
        { code: "KeyV", label: "វ", shiftLabel: "វ" },
        { code: "KeyB", label: "ប", shiftLabel: "ព" },
        { code: "KeyN", label: "ន", shiftLabel: "ណ" },
        { code: "KeyM", label: "ម", shiftLabel: "ំ" },
        { code: "Comma", label: ",", shiftLabel: "«" },
        { code: "Period", label: "៕", shiftLabel: "»" },
        { code: "Slash", label: "៖", shiftLabel: "?" },
        { code: "ShiftRight", label: "Shift", class: "shift-key" }
      ],
      [
        { code: "ControlLeft", label: "Ctrl", class: "ctrl-key" },
        { code: "MetaLeft", label: "Win", class: "win-key" },
        { code: "AltLeft", label: "Alt", class: "alt-key" },
        { code: "Space", label: "", class: "space-key" },
        { code: "AltRight", label: "Alt", class: "alt-key" },
        { code: "ControlRight", label: "Ctrl", class: "ctrl-key" }
      ]
    ]
  }
};

// Character helper map to find which keycode and shift state matches a target character
const CharToKeyMap = {
  // Built dynamically at startup for English and Khmer layouts
};

const VirtualKeyboard = {
  containerId: "virtual-keyboard",
  currentLayoutName: "qwerty",
  isShiftActive: false,
  isCapsActive: false,

  init(containerId) {
    if (containerId) this.containerId = containerId;
    this.buildCharLookupMaps();
    this.render();
  },

  setLayout(layoutName) {
    if (KeyboardLayouts[layoutName]) {
      this.currentLayoutName = layoutName;
      this.render();
    }
  },

  setShift(active) {
    if (this.isShiftActive !== active) {
      this.isShiftActive = active;
      this.updateKeyLabels();
    }
  },

  setCapsLock(active) {
    if (this.isCapsActive !== active) {
      this.isCapsActive = active;
      this.updateKeyLabels();
    }
  },

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = "";
    const layout = KeyboardLayouts[this.currentLayoutName];

    layout.rows.forEach(row => {
      const rowEl = document.createElement("div");
      rowEl.className = "keyboard-layout-row";

      row.forEach(key => {
        const keyEl = document.createElement("div");
        keyEl.className = `kbd-key ${key.class || ""}`;
        keyEl.id = `key-${key.code}`;
        keyEl.setAttribute("data-code", key.code);

        // Core Labels
        const primaryLabel = document.createElement("span");
        primaryLabel.className = "kbd-primary-label";
        keyEl.appendChild(primaryLabel);

        // Sub label for shifts
        const subLabel = document.createElement("span");
        subLabel.className = "kbd-sub-label";
        keyEl.appendChild(subLabel);

        rowEl.appendChild(keyEl);
      });

      container.appendChild(rowEl);
    });

    this.updateKeyLabels();
  },

  updateKeyLabels() {
    const layout = KeyboardLayouts[this.currentLayoutName];
    layout.rows.forEach(row => {
      row.forEach(key => {
        const keyEl = document.getElementById(`key-${key.code}`);
        if (!keyEl) return;

        const primarySpan = keyEl.querySelector(".kbd-primary-label");
        const subSpan = keyEl.querySelector(".kbd-sub-label");

        let displayLabel = key.label;
        let displaySub = key.shiftLabel || "";

        if (this.currentLayoutName === "qwerty") {
          const shiftState = this.isShiftActive !== this.isCapsActive;
          if (key.code.startsWith("Key")) {
            displayLabel = shiftState ? key.shiftLabel : key.label;
            displaySub = "";
          } else {
            // Numbers or symbols
            if (this.isShiftActive) {
              displayLabel = key.shiftLabel;
              displaySub = key.label;
            } else {
              displayLabel = key.label;
              displaySub = key.shiftLabel || "";
            }
          }
        } else {
          // Khmer layouts (NIDA / Standard)
          if (this.isShiftActive) {
            displayLabel = key.shiftLabel || key.label;
            displaySub = key.label;
          } else {
            displayLabel = key.label;
            displaySub = key.shiftLabel || "";
          }
        }

        primarySpan.textContent = displayLabel;
        subSpan.textContent = displaySub;

        // Visual toggle for shift and caps lock on the keyboard itself
        if (key.code === "ShiftLeft" || key.code === "ShiftRight") {
          keyEl.classList.toggle("key-active", this.isShiftActive);
        }
        if (key.code === "CapsLock") {
          keyEl.classList.toggle("key-active", this.isCapsActive);
        }
      });
    });
  },

  pressKey(code) {
    const keyEl = document.getElementById(`key-${code}`);
    if (keyEl) {
      keyEl.classList.add("key-active");
      setTimeout(() => {
        if (code !== "ShiftLeft" && code !== "ShiftRight" && code !== "CapsLock") {
          keyEl.classList.remove("key-active");
        } else {
          // Shift and Caps Lock are handled by setShift / setCapsLock
          this.updateKeyLabels();
        }
      }, 100);
    }
  },

  releaseKey(code) {
    const keyEl = document.getElementById(`key-${code}`);
    if (keyEl) {
      if (code !== "ShiftLeft" && code !== "ShiftRight" && code !== "CapsLock") {
        keyEl.classList.remove("key-active");
      }
    }
  },

  highlightTargetKey(char, language) {
    // First, clear any previous targets
    document.querySelectorAll(".kbd-key.key-target").forEach(el => {
      el.classList.remove("key-target");
    });

    if (!char) return;

    // Handle space explicitly
    if (char === " " || char === "​") { // normal space or zero-width space
      const spaceEl = document.getElementById("key-Space");
      if (spaceEl) spaceEl.classList.add("key-target");
      return;
    }

    // Find layout name to query
    const layoutName = language === "en" ? "qwerty" : this.currentLayoutName;
    const lookupKey = `${layoutName}_${char}`;
    const keyMatch = CharToKeyMap[lookupKey];

    if (keyMatch) {
      const targetEl = document.getElementById(`key-${keyMatch.code}`);
      if (targetEl) {
        targetEl.classList.add("key-target");
        
        // If the target key requires shift, highlight the shift keys as well!
        if (keyMatch.requiresShift) {
          const shiftL = document.getElementById("key-ShiftLeft");
          const shiftR = document.getElementById("key-ShiftRight");
          if (shiftL) shiftL.classList.add("key-target");
          if (shiftR) shiftR.classList.add("key-target");
        }
      }
    }
  },

  buildCharLookupMaps() {
    // Generate reverse-lookup character mapping so we can highlight keys by character
    Object.keys(KeyboardLayouts).forEach(layoutName => {
      const layout = KeyboardLayouts[layoutName];
      layout.rows.forEach(row => {
        row.forEach(key => {
          if (!key.code.startsWith("Key") && !key.code.startsWith("Digit") && 
              key.code !== "Minus" && key.code !== "Equal" && key.code !== "BracketLeft" &&
              key.code !== "BracketRight" && key.code !== "Backslash" && key.code !== "Semicolon" &&
              key.code !== "Quote" && key.code !== "Comma" && key.code !== "Period" && 
              key.code !== "Slash" && key.code !== "Backquote") {
            return; // Skip modifier keys like Tab, Caps, Enter, etc.
          }

          // Unshifted character
          if (key.label) {
            CharToKeyMap[`${layoutName}_${key.label}`] = { code: key.code, requiresShift: false };
          }
          // Shifted character
          if (key.shiftLabel) {
            CharToKeyMap[`${layoutName}_${key.shiftLabel}`] = { code: key.code, requiresShift: true };
          }
        });
      });
    });
  }
};

window.VirtualKeyboard = VirtualKeyboard;
