/**
 * Little sound effects, synthesised with the Web Audio API (no audio files).
 * They can be switched off in Settings.
 */
(function (M) {
  'use strict';

  let ctx = null;

  function audio() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** One soft note: frequency in Hz, start offset and duration in seconds. */
  function tone(freq, start, duration, { type = 'sine', volume = 0.12, slideTo } = {}) {
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + start;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  const SOUNDS = {
    // A combo raises the pitch a little with every correct answer in a row.
    correct: ({ combo = 0 } = {}) => {
      const lift = 2 ** (Math.min(combo, 12) / 24);
      tone(784 * lift, 0, 0.12); // G5
      tone(1047 * lift, 0.09, 0.22); // C6
    },
    almost: () => {
      tone(659, 0, 0.12);
      tone(784, 0.09, 0.16);
    },
    wrong: () => tone(311, 0, 0.22, { type: 'triangle', volume: 0.1, slideTo: 220 }),
    pop: () => tone(520, 0, 0.09, { slideTo: 900, volume: 0.1 }),
    tap: () => tone(1100, 0, 0.04, { volume: 0.04 }),
    complete: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.26)),
    levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.3, { type: 'triangle' })),
    balloon: () => {
      tone(880, 0, 0.05, { type: 'square', volume: 0.05 });
      tone(420, 0.02, 0.14, { slideTo: 1400, volume: 0.1 });
    },
    whoosh: () => tone(600, 0, 0.35, { type: 'triangle', volume: 0.07, slideTo: 200 }),
    wave: () => [659, 880, 1175].forEach((f, i) => tone(f, i * 0.07, 0.18, { type: 'triangle', volume: 0.09 })),
    coin: () => {
      tone(1319, 0, 0.07, { type: 'square', volume: 0.05 });
      tone(1760, 0.06, 0.16, { type: 'square', volume: 0.05 });
    },
    magic: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.05, 0.22, { volume: 0.08 })),
    bubble: () => [0, 0.07, 0.13].forEach((t, i) => tone(500 + i * 220, t, 0.08, { slideTo: 900 + i * 200, volume: 0.07 })),
  };

  M.sfx = {
    play(name, options) {
      if (!M.store.state.settings.sfx || !SOUNDS[name]) return;
      try {
        SOUNDS[name](options);
      } catch {
        // Sound is a nice-to-have; never let it break the game.
      }
    },
  };
})(window.Mallang);
