/**
 * Exercise: meet a new word. Shows the word with audio, meaning, pronunciation
 * notes and an example sentence. Not graded — the quiz comes a few steps later.
 */
(function (M) {
  'use strict';

  const { h } = M.utils;
  const ui = M.ui;

  M.exercises.register({
    id: 'intro',

    /** ctx: { el, item: word, onDone } → cleanup function */
    render({ el, item: word, onDone }) {
      const settings = M.store.state.settings;
      const card = h(
        'div.intro-card',
        h('div.intro-emoji', { 'aria-hidden': 'true' }, word.emoji),
        h('div.intro-word', h('span.ko-word', { lang: 'ko' }, word.ko), ui.audioButton(word.ko, { size: 'big' })),
        word.pron ? h('div.intro-pron', { title: 'How it is pronounced' }, `[${word.pron}]`) : null,
        settings.showRomanization && word.rom ? h('div.intro-rom', word.rom) : null,
        h('div.intro-meaning', word.en),
        word.dict ? h('div.intro-dict', ui.bi('기본형', 'dictionary form'), h('b', { lang: 'ko' }, word.dict)) : null,
        word.note ? h('p.intro-note', h('span', { 'aria-hidden': 'true' }, '💡 '), word.note) : null,
        word.example ? ui.example(word.example) : null
      );

      const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
      el.append(
        h(
          'div.ex.ex-intro',
          ui.exTag('새 단어', 'New word', '✨'),
          card,
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
        )
      );
      button.focus({ preventScroll: true });

      const timer = settings.autoPlayAudio ? setTimeout(() => M.speech.speak(word.ko, { quiet: true }), 350) : null;
      // Enter continues (a focused button, like "Got it" or 🔊, handles Enter itself).
      const stopKeys = M.keys.push((event) => {
        if (event.key === 'Enter' && !M.keys.isControl(event)) {
          event.preventDefault();
          done();
        } else if (M.keys.isReplay(event)) M.speech.speak(word.ko);
      });

      let finished = false;
      function cleanup() {
        clearTimeout(timer);
        stopKeys();
      }
      function done() {
        if (finished) return;
        finished = true;
        cleanup();
        onDone();
      }
      return cleanup;
    },
  });
})(window.Mallang);
