/**
 * Exercise: dictation. Hear a whole sentence and write it down with the
 * Korean keyboard. Spaces and punctuation don't count, and a slip of a letter
 * or two in a long sentence counts as "almost". Used for sentences you
 * already know well (see the Sentence Builder).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const H = M.hangul;

  M.exercises.register({
    id: 'dictation',

    /** ctx: { el, item: sentence, answer(result) } → cleanup */
    render({ el, item: sentence, answer }) {
      const settings = M.store.state.settings;
      const target = U.normalize(sentence.ko);
      let hintUsed = false;
      let locked = false;

      const textEl = h('span.type-text', { lang: 'ko' });
      const display = h('div.type-display.dictation-display', { role: 'textbox', 'aria-readonly': 'true', 'aria-label': 'Your answer' }, textEl, h('span.caret', { 'aria-hidden': 'true' }));
      const keyboard = ui.createKeyboard({ onChange: showText, onEnter: check, hints: settings.keyHints });
      const hintBtn = ui.button({ icon: '💡', ko: '첫 단어', en: 'First word', variant: 'ghost', size: 'small', onClick: hint });
      const skipBtn = ui.button({ ko: '모르겠어요', en: "I don't know", variant: 'ghost', size: 'small', onClick: giveUp });
      const checkBtn = ui.button({ ko: '확인', en: 'Check', variant: 'primary', size: 'big', onClick: check });
      [hintBtn, skipBtn, checkBtn].forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));

      el.append(
        h(
          'div.ex.ex-dictation',
          ui.exTag('듣고 받아써요', 'Listen and write the whole sentence', '✍️'),
          h('div.prompt.prompt-listen', ui.audioButton(sentence.ko, { size: 'huge', label: 'Play the sentence' }), ui.audioButton(sentence.ko, { size: 'big', slow: true })),
          display,
          h('div.type-tools', hintBtn, skipBtn),
          keyboard.el,
          h('p.type-tip', ui.bi('띄어쓰기는 괜찮아요', 'Spaces and punctuation don’t matter. Play it again with 🔊 (🐢 = slowly).')),
          h('div.ex-actions', checkBtn)
        )
      );
      showText('');
      const timer = setTimeout(() => M.speech.speak(sentence.ko, { quiet: true }), 350);

      function showText(text) {
        textEl.textContent = text;
        display.classList.toggle('empty', !text);
        display.dataset.placeholder = '들리는 대로 써요 · write what you hear';
      }

      function hint() {
        if (locked || hintUsed) return;
        hintUsed = true;
        hintBtn.disabled = true;
        keyboard.setKeys(H.toKeys(`${sentence.tiles[0]} `));
      }

      function giveUp() {
        if (locked) return;
        locked = true;
        keyboard.setDisabled(true);
        answer({ correct: false, grade: 'again', given: '', gaveUp: true, typed: true, dictation: true, reasons: [] });
      }

      function check() {
        if (locked) return;
        const given = U.normalize(keyboard.value());
        if (!given) {
          display.classList.remove('nudge');
          void display.offsetWidth;
          display.classList.add('nudge');
          return;
        }
        locked = true;
        keyboard.setDisabled(true);
        [hintBtn, skipBtn, checkBtn].forEach((b) => (b.disabled = true));
        const exact = U.noSpaces(given) === U.noSpaces(target);
        const distance = exact ? 0 : H.spellingDistance(target, given);
        const long = H.toKeys(U.noSpaces(target)).length >= 8;
        const almost = !exact && distance <= (long ? 2 : 1) && H.toKeys(U.noSpaces(target)).length >= 4;
        let grade = exact ? 'good' : almost ? 'hard' : 'again';
        if (grade === 'good' && hintUsed) grade = 'hard';
        display.classList.add(exact ? 'correct' : almost ? 'almost' : 'wrong');
        const note = exact && given !== target ? `Correct! Just note the spacing: ${sentence.ko}` : null;
        answer({ correct: exact || almost, almost, grade, given, note, typed: true, dictation: true, hintUsed, listening: true, reasons: [] });
      }

      return () => {
        clearTimeout(timer);
        keyboard.destroy();
      };
    },
  });
})(window.Mallang);
