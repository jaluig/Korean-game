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
    correct: () => {
      tone(784, 0, 0.12); // G5
      tone(1047, 0.09, 0.22); // C6
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
  };

  M.sfx = {
    play(name) {
      if (!M.store.state.settings.sfx || !SOUNDS[name]) return;
      try {
        SOUNDS[name]();
      } catch {
        // Sound is a nice-to-have; never let it break the game.
      }
    },
  };
})(window.Mallang);
