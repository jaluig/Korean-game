/**
 * Pronunciation audio with the browser's built-in speech synthesis.
 *
 * It looks for a Korean voice (Chrome/Edge ship online ones; Windows and macOS
 * can install offline ones). If none exists, speak() does nothing and reports
 * "unavailable", and the UI explains how to add a voice — the game never breaks.
 */
(function (M) {
  'use strict';

  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voices = [];
  let status = synth ? 'loading' : 'unsupported'; // loading | ready | unavailable | unsupported
  let current = null; // keep a reference: Chrome can garbage-collect a speaking utterance

  const isKorean = (voice) => /^ko([-_]|$)/i.test(voice.lang || '') || /korean|한국/i.test(voice.name || '');

  /** Prefer natural-sounding voices: Edge "Natural", Google, macOS premium… */
  function quality(voice) {
    const name = (voice.name || '').toLowerCase();
    let score = 0;
    if (/natural|neural/.test(name)) score += 40;
    if (/online/.test(name)) score += 10;
    if (/google/.test(name)) score += 25;
    if (/premium|enhanced/.test(name)) score += 15;
    if (/yuna|sunhi|injoon|heami|sora|minsu/.test(name)) score += 5;
    return score;
  }

  function setStatus(next) {
    if (status === next) return;
    status = next;
    M.events.emit('speech:status', status);
  }

  function refresh() {
    if (!synth) return;
    let list = [];
    try {
      list = synth.getVoices() || [];
    } catch {
      list = [];
    }
    voices = list.filter(isKorean).sort((a, b) => quality(b) - quality(a));
    if (voices.length) setStatus('ready');
  }

  function init() {
    if (!synth) return;
    refresh();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refresh);
    else synth.onvoiceschanged = refresh;
    // Some browsers load voices late and never say so: check a few times, then give up.
    let tries = 0;
    const timer = setInterval(() => {
      refresh();
      tries++;
      if (status === 'ready' || tries >= 16) {
        clearInterval(timer);
        if (status !== 'ready') setStatus('unavailable');
      }
    }, 250);
  }

  /** The chosen Korean voice (from Settings), or the best one found. */
  function voice() {
    const wanted = M.store.state.settings.voiceURI;
    return voices.find((v) => v.voiceURI === wanted) || voices[0] || null;
  }

  /**
   * Say Korean text. Returns false when no Korean voice exists — and, unless
   * `quiet` (used for automatic playback), emits 'speech:unavailable' so the UI
   * can explain how to add one. Options: { rate, onEnd, quiet }.
   */
  function speak(text, { rate, onEnd, quiet = false } = {}) {
    if (status !== 'ready' || !text) {
      if (status !== 'ready' && !quiet) M.events.emit('speech:unavailable', status);
      return false;
    }
    try {
      const v = voice();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = v;
      utterance.lang = v?.lang || 'ko-KR';
      utterance.rate = rate || M.store.state.settings.speechRate || 0.9;
      utterance.onend = () => {
        if (current === utterance) current = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = (event) => {
        if (current === utterance) current = null;
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('Speech failed:', event.error);
          M.events.emit('speech:error', event.error);
        }
      };
      current = utterance;
      if (synth.speaking || synth.pending) {
        synth.cancel();
        // Chrome sometimes drops an utterance queued in the same tick as cancel().
        setTimeout(() => synth.speak(utterance), 60);
      } else {
        synth.speak(utterance);
      }
      return true;
    } catch (err) {
      console.warn('Speech failed:', err);
      return false;
    }
  }

  function stop() {
    if (synth && (synth.speaking || synth.pending)) synth.cancel();
  }

  M.speech = {
    init,
    speak,
    stop,
    voice,
    voices: () => voices.slice(),
    status: () => status,
    isReady: () => status === 'ready',
  };
})(window.Mallang);
