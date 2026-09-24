/**
 * Saving and loading progress in the browser's localStorage.
 *
 * Everything the learner does lives in one plain object (`Mallang.store.state`)
 * that is written back after every answer. It can be exported to / imported
 * from a JSON file as a backup.
 */
(function (M) {
  'use strict';

  const SCHEMA_VERSION = 1;

  function defaultState() {
    return {
      version: SCHEMA_VERSION,
      createdAt: Date.now(),
      profile: {
        onboarded: false,
        startLevel: 1,
      },
      settings: {
        showEnglish: true, // small English subtitles under Korean UI text
        showRomanization: false,
        autoPlayAudio: true,
        speechRate: 0.9,
        voiceURI: '',
        sfx: true,
        typing: true, // typing exercises with the Korean keyboard
        keyHints: true, // show QWERTY letters on the on-screen keyboard
        dailyGoal: M.config.defaultDailyGoal,
        focusTopic: 'all',
      },
      totals: {
        points: 0,
        answers: 0,
        correct: 0,
        rounds: 0,
        perfectRounds: 0,
        typedCorrect: 0,
        sentencesCorrect: 0,
        bestMatch: 0,
      },
      streak: { current: 0, best: 0, lastDay: null },
      days: {}, // 'YYYY-MM-DD' → { points, answers, correct, rounds }
      items: {}, // word/sentence id → spaced-repetition record (see srs.js)
      badges: {}, // badge id → time earned
    };
  }

  const isPlainObject = (x) => x && typeof x === 'object' && !Array.isArray(x);

  /** Deep-merge saved data over defaults so new settings get sensible values. */
  function merge(base, saved) {
    if (!isPlainObject(saved)) return base;
    const out = { ...base };
    for (const [key, value] of Object.entries(saved)) {
      out[key] = isPlainObject(base[key]) && isPlainObject(value) ? merge(base[key], value) : value;
    }
    return out;
  }

  /** Upgrade older saves. Add a step here whenever the shape of the state changes. */
  function migrate(state) {
    // (No older versions yet.)
    state.version = SCHEMA_VERSION;
    return state;
  }

  function canUseStorage() {
    try {
      const probe = '__mallang_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  const key = () => M.config.storageKey;

  M.store = {
    state: defaultState(),
    /** false when the browser blocks storage (progress then lasts until the tab closes). */
    available: true,
    /** true when a damaged save was found and set aside. */
    recovered: false,

    load() {
      this.available = canUseStorage();
      let saved = null;
      if (this.available) {
        const raw = localStorage.getItem(key());
        if (raw) {
          try {
            saved = JSON.parse(raw);
          } catch (err) {
            console.warn('Saved progress could not be read; a copy was kept aside.', err);
            localStorage.setItem(`${key()}/damaged-${Date.now()}`, raw);
            this.recovered = true;
          }
        }
      }
      this.state = migrate(merge(defaultState(), saved));
      return this.state;
    },

    save() {
      if (!this.available) return false;
      try {
        localStorage.setItem(key(), JSON.stringify(this.state));
        return true;
      } catch (err) {
        console.error('Could not save progress', err);
        return false;
      }
    },

    reset() {
      this.state = defaultState();
      this.save();
    },

    exportJson() {
      return JSON.stringify({ app: 'mallang-korean', exportedAt: new Date().toISOString(), ...this.state }, null, 2);
    },

    importJson(text) {
      const data = JSON.parse(text);
      if (!isPlainObject(data) || !isPlainObject(data.items) || !isPlainObject(data.settings)) {
        throw new Error('This file is not a Mallang Korean backup.');
      }
      delete data.app;
      delete data.exportedAt;
      this.state = migrate(merge(defaultState(), data));
      this.save();
    },

    defaultState,
  };
})(window.Mallang);
