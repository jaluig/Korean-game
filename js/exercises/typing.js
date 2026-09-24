/**
 * Exercise: type the word in Korean — full recall — with the built-in keyboard
 * (click the keys, or use your physical keyboard: R = ㄱ, K = ㅏ …).
 * Modes: 'en' (see the meaning) or 'audio' (hear it and write it down).
 * A single-letter slip on a longer word counts as "almost".
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const H = M.hangul;

  M.exercises.register({
    id: 'typing',

    /** ctx: { el, item: word, mode, answer(result) } → cleanup */
    render({ el, item: word, mode = 'en', answer }) {
      const settings = M.store.state.settings;
      const target = U.normalize(word.ko);
      const accepted = [target, ...(word.accept || []).map(U.normalize)];
      const audioMode = mode === 'audio';
      let hintUsed = false;
      let locked = false;

      const textEl = h('span.type-text', { lang: 'ko' });
      const display = h('div.type-display', { role: 'textbox', 'aria-readonly': 'true', 'aria-label': 'Your answer' }, textEl, h('span.caret', { 'aria-hidden': 'true' }));

      const keyboard = ui.createKeyboard({ onChange: showText, onEnter: check, hints: settings.keyHints });
      const hintBtn = ui.button({ icon: '💡', ko: '힌트', en: 'Hint', variant: 'ghost', size: 'small', onClick: hint });
      const skipBtn = ui.button({ ko: '모르겠어요', en: "I don't know", variant: 'ghost', size: 'small', onClick: giveUp });
      const checkBtn = ui.button({ ko: '확인', en: 'Check', variant: 'primary', size: 'big', onClick: check });

      const prompt = audioMode
        ? h('div.prompt.prompt-listen', ui.audioButton(word.ko, { size: 'huge', label: 'Play the word' }), ui.audioButton(word.ko, { size: 'big', slow: true }))
        : h('div.prompt', h('div.prompt-emoji', { 'aria-hidden': 'true' }, word.emoji), h('div.prompt-en', word.en));

      el.append(
        h(
          'div.ex.ex-typing',
          audioMode ? ui.exTag('듣고 써 보세요', 'Listen and type it', '👂') : ui.exTag('한국어로 써 보세요', 'Type it in Korean', '⌨️'),
          prompt,
          display,
          h('div.type-tools', hintBtn, skipBtn),
          keyboard.el,
          h('p.type-tip', ui.bi('키보드로도 칠 수 있어요', 'Tip: your own keyboard works too — R = ㄱ, K = ㅏ, Shift + R = ㄲ')),
          h('div.ex-actions', checkBtn)
        )
      );
      showText('');
      const timer = audioMode ? setTimeout(() => M.speech.speak(word.ko, { quiet: true }), 300) : null;

      function showText(text) {
        textEl.textContent = text;
        display.classList.toggle('empty', !text);
        if (!text) textEl.textContent = '';
        display.dataset.placeholder = '여기에 써요 · type here';
      }

      function hint() {
        if (locked || hintUsed) return;
        hintUsed = true;
        hintBtn.disabled = true;
        const first = [...U.noSpaces(target)][0];
        keyboard.setKeys(H.toKeys(first));
      }

      function giveUp() {
        if (locked) return;
        locked = true;
        keyboard.setDisabled(true);
        answer({ correct: false, grade: 'again', given: '', gaveUp: true, typed: true });
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

        const exact = accepted.includes(given);
        const spacingOnly = !exact && accepted.some((a) => U.noSpaces(a) === U.noSpaces(given));
        const correct = exact || spacingOnly;
        // "Almost": one letter off inside a word of the right shape (same number of syllables).
        const sameShape = [...U.noSpaces(target)].length === [...U.noSpaces(given)].length;
        const almost = !correct && sameShape && H.spellingDistance(target, given) === 1 && H.toKeys(U.noSpaces(target)).length >= 4;

        let grade = correct ? 'good' : almost ? 'hard' : 'again';
        if (grade === 'good' && hintUsed) grade = 'hard';
        const diff = correct ? null : H.explainDifference(target, given);
        display.classList.add(correct ? 'correct' : almost ? 'almost' : 'wrong');

        let note = null;
        if (spacingOnly) note = `Correct! Just note the spacing: ${word.ko}`;
        else if (exact && given !== target) note = `Also correct. The form taught here is ${word.ko}.`;
        answer({ correct: correct || almost, almost, grade, given, diff, tip: diff ? diff.tip : null, note, typed: true, hintUsed });
      }

      return () => {
        clearTimeout(timer);
        keyboard.destroy();
      };
    },
  });
})(window.Mallang);
