/**
 * 🎤 "Say it" buttons: say a word or sentence out loud and the browser's
 * speech recognition checks it. Shown only where recognition exists and
 * speaking practice is switched on in Settings.
 */
(function (M) {
  'use strict';

  const { h } = M.utils;
  const ui = M.ui;

  const ERRORS = {
    'not-allowed': 'The microphone is blocked. Allow it with the icon in the address bar, then try again.',
    'service-not-allowed': 'The microphone is blocked. Allow it with the icon in the address bar, then try again.',
    'no-speech': 'I didn’t hear anything. Try again, a little louder.',
    'audio-capture': 'No microphone was found.',
    network: 'Speech recognition needs an internet connection.',
    'language-not-supported': 'This browser can’t recognise Korean speech.',
  };

  /** A 🎤 button for `text`, or null when speaking practice isn't available. */
  ui.sayButton = (text, { size = 'small' } = {}) => {
    if (!M.mic.supported() || !M.store.state.settings.speaking) return null;
    const result = h('span.say-result', { 'aria-live': 'polite' });
    let stopListening = null;
    let rewarded = false;
    const btn = h(
      'button',
      {
        type: 'button',
        class: `say-btn ${size}`.trim(),
        title: 'Say it out loud',
        'aria-label': 'Say it out loud',
        on: { ...M.keys.noMouseFocus, click: toggle },
      },
      h('span', { 'aria-hidden': 'true' }, '🎤')
    );

    function toggle(event) {
      event.stopPropagation();
      if (stopListening) {
        stopListening();
        return;
      }
      M.speech.stop();
      btn.classList.add('listening');
      result.className = 'say-result';
      result.textContent = '듣고 있어요… listening';
      stopListening = M.mic.listen({
        onResult: (alternatives) => show(M.mic.best(text, alternatives)),
        onError: (code) => {
          result.className = 'say-result miss';
          result.textContent = ERRORS[code] || 'I couldn’t listen just now. Try again.';
        },
        onEnd: () => {
          btn.classList.remove('listening');
          stopListening = null;
        },
      });
    }

    function show({ heard, score }) {
      const tone = score >= 0.9 ? 'great' : score >= 0.7 ? 'close' : 'miss';
      const label = { great: '👏 완벽해요!', close: '👍 거의 맞아요!', miss: '🔁 다시 해 봐요' }[tone];
      result.className = `say-result ${tone}`;
      result.textContent = `${label} I heard “${heard}”`;
      if (tone !== 'miss' && !rewarded) {
        rewarded = true;
        M.progress.bump('spokenGood');
        M.progress.addPoints(M.config.points.spoken);
        M.store.save();
      }
      M.sfx.play(tone === 'miss' ? 'almost' : 'correct');
    }

    return h('span.say-wrap', btn, result);
  };
})(window.Mallang);
