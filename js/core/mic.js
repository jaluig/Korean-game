/**
 * Speaking practice with the browser's speech recognition (Chrome and Edge).
 * It listens in Korean and says how close you were. Chrome sends the audio
 * to its online speech service; where recognition isn't available, the 🎤
 * buttons simply don't appear.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  let active = null;

  const supported = () => !!Recognition;

  function stop() {
    if (!active) return;
    try {
      active.abort();
    } catch {
      // already stopped
    }
    active = null;
  }

  /**
   * Listen once, in Korean. Calls onResult(alternatives), onError(code) and
   * onEnd(). Returns a function that stops listening.
   */
  function listen({ onResult, onError, onEnd, lang = 'ko-KR' } = {}) {
    if (!Recognition) {
      if (onError) onError('unsupported');
      return () => {};
    }
    stop();
    const rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 5;
    let settled = false;
    rec.onresult = (event) => {
      settled = true;
      const result = event.results[0];
      onResult && onResult([...result].map((alt) => alt.transcript));
    };
    rec.onerror = (event) => {
      settled = true;
      if (event.error !== 'aborted' && onError) onError(event.error);
    };
    rec.onend = () => {
      if (active === rec) active = null;
      if (!settled && onError) onError('no-speech');
      if (onEnd) onEnd();
    };
    try {
      rec.start();
      active = rec;
    } catch {
      if (onError) onError('busy');
    }
    return () => {
      if (active === rec) stop();
    };
  }

  /** How close is what was heard to the target? 0–1, letter by letter (spaces and punctuation ignored). */
  function similarity(target, heard) {
    const a = M.hangul.toKeys(U.noSpaces(U.normalize(target)));
    const b = M.hangul.toKeys(U.noSpaces(U.normalize(heard)));
    if (!a.length || !b.length) return 0;
    return Math.max(0, 1 - U.levenshtein(a, b) / Math.max(a.length, b.length));
  }

  /** The alternative closest to the target: { heard, score }. */
  function best(target, alternatives) {
    let top = { heard: alternatives[0] || '', score: 0 };
    for (const heard of alternatives) {
      const score = similarity(target, heard);
      if (score > top.score) top = { heard, score };
    }
    return top;
  }

  M.mic = { supported, listen, stop, similarity, best };
})(window.Mallang);
