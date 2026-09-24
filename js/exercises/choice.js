/**
 * Exercise: multiple choice (4 options, keys 1–4).
 * Modes:
 *   'ko-en'     see the Korean word → pick its meaning
 *   'en-ko'     see the meaning → pick the Korean word (look-alike options)
 *   'listen-ko' hear it → pick the Korean word
 *   'listen-en' hear it → pick its meaning
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const H = M.hangul;

  const TAGS = {
    'ko-en': ['무슨 뜻이에요?', 'What does it mean?', '🤔'],
    'en-ko': ['한국어로 뭐예요?', 'Which one is it in Korean?', '🔎'],
    'listen-ko': ['잘 듣고 고르세요', 'Listen and pick the word', '👂'],
    'listen-en': ['잘 듣고 뜻을 고르세요', 'Listen and pick the meaning', '👂'],
  };

  M.exercises.register({
    id: 'choice',

    /** ctx: { el, item: word, mode, pool: words for wrong options, answer(result) } → cleanup */
    render({ el, item: word, mode = 'ko-en', pool, answer }) {
      const koreanOptions = mode === 'en-ko' || mode === 'listen-ko';
      const listening = mode.startsWith('listen');
      const wrong = koreanOptions ? M.distractors.formOptions(word, pool, 3) : M.distractors.meaningOptions(word, pool, 3);
      const options = U.shuffle([word, ...wrong]);

      let prompt;
      if (mode === 'ko-en') {
        prompt = h('div.prompt', h('div.prompt-ko', h('span.ko-word', { lang: 'ko' }, word.ko), ui.audioButton(word.ko)));
      } else if (mode === 'en-ko') {
        prompt = h('div.prompt', h('div.prompt-emoji', { 'aria-hidden': 'true' }, word.emoji), h('div.prompt-en', word.en));
      } else {
        prompt = h(
          'div.prompt.prompt-listen',
          ui.audioButton(word.ko, { size: 'huge', label: 'Play the word' }),
          ui.audioButton(word.ko, { size: 'big', slow: true })
        );
      }

      let locked = false;
      const buttons = options.map((option, i) =>
        h(
          'button',
          {
            type: 'button',
            class: `option ${koreanOptions ? 'option-ko' : 'option-en'}`,
            lang: koreanOptions ? 'ko' : 'en',
            on: { click: () => choose(i) },
          },
          h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
          h('span.option-text', koreanOptions ? option.ko : option.en)
        )
      );

      el.append(h('div', { class: `ex ex-choice ex-${mode}` }, ui.exTag(...TAGS[mode]), prompt, h('div.options', { role: 'group' }, buttons)));

      const autoPlay = listening || (mode === 'ko-en' && M.store.state.settings.autoPlayAudio);
      const timer = autoPlay ? setTimeout(() => M.speech.speak(word.ko, { quiet: true }), 300) : null;

      const stopKeys = M.keys.push((event) => {
        if (event.repeat || locked) return;
        const n = Number(event.key);
        if (n >= 1 && n <= options.length) {
          event.preventDefault();
          choose(n - 1);
        } else if (M.keys.isReplay(event) && mode !== 'en-ko') {
          M.speech.speak(word.ko);
        }
      });

      function choose(i) {
        if (locked) return;
        locked = true;
        stopKeys();
        const picked = options[i];
        const correct = picked.id === word.id;
        buttons.forEach((b) => (b.disabled = true));
        buttons[i].classList.add(correct ? 'correct' : 'wrong');
        if (!correct) buttons[options.indexOf(word)].classList.add('correct');
        // Mixed up two similar-looking words? Explain the letter that differs.
        const diff = !correct && H.spellingDistance(word.ko, picked.ko) <= 2 ? H.explainDifference(word.ko, picked.ko) : null;
        answer({
          correct,
          grade: correct ? 'good' : 'again',
          given: koreanOptions ? picked.ko : picked.en,
          givenWord: correct ? null : picked,
          tip: diff ? diff.tip : null,
        });
      }

      return () => {
        clearTimeout(timer);
        stopKeys();
      };
    },
  });
})(window.Mallang);
