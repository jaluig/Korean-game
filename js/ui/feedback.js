/**
 * The feedback sheet that slides up after every answer: correct / almost /
 * not quite, the right answer, what you gave, and a short explanation of the
 * mistake — then "Continue" (or Enter).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const TITLES = {
    good: [
      ['정답이에요!', 'Correct!'],
      ['맞아요!', "That's right!"],
      ['잘했어요!', 'Well done!'],
      ['완벽해요!', 'Perfect!'],
    ],
    almost: [
      ['거의 맞았어요!', 'Almost!'],
      ['아까워요!', 'So close!'],
    ],
    bad: [
      ['아쉬워요!', 'Not quite'],
      ['괜찮아요!', "It's okay — let's learn it"],
    ],
  };
  const ICONS = { good: '✓', almost: '≈', bad: '✗' };

  /**
   * Show the sheet inside `container`.
   * { tone: 'good'|'almost'|'bad', points, content: [nodes], speak: text for the R key, onContinue }
   */
  function show(container, { tone, points = 0, content = [], speak, onContinue }) {
    const [ko, en] = U.pick(TITLES[tone]);
    const button = ui.button({ ko: '계속', en: 'Continue', variant: tone === 'bad' ? 'danger' : tone === 'almost' ? 'butter' : 'mint', size: 'big', onClick: done });
    const panel = h(
      'section',
      { class: `feedback feedback-${tone}`, 'aria-live': 'assertive', 'aria-label': en },
      h(
        'div.feedback-inner',
        h(
          'div.feedback-head',
          h('span.feedback-icon', { 'aria-hidden': 'true' }, ICONS[tone]),
          h('h3.feedback-title', ui.bi(ko, en)),
          points > 0 ? h('span.feedback-points', `+${points} ⭐`) : null
        ),
        h('div.feedback-body', content),
        h('div.feedback-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
      )
    );
    container.append(panel);
    requestAnimationFrame(() => panel.classList.add('open'));
    button.focus({ preventScroll: true });

    // Enter continues (a focused button, like "Continue" or 🔊, handles Enter itself).
    const stopKeys = M.keys.push((event) => {
      if (event.key === 'Enter' && !M.keys.isControl(event)) {
        event.preventDefault();
        done();
      } else if (speak && M.keys.isReplay(event)) {
        M.speech.speak(speak);
      }
    });

    let finished = false;
    function done() {
      if (finished) return;
      finished = true;
      stopKeys();
      panel.remove();
      if (onContinue) onContinue();
    }
    return { close: done, el: panel };
  }

  /* ---------- Content for word answers ---------- */

  const label = (ko, en) => h('span.fb-label', ui.bi(ko, en));

  function answerRow(word) {
    const s = M.store.state.settings;
    return h(
      'div.fb-row.fb-answer',
      label('정답', 'Answer'),
      h('span.fb-ko', { lang: 'ko' }, word.ko),
      ui.audioButton(word.ko, { size: 'small' }),
      word.pron ? h('span.fb-pron', `[${word.pron}]`) : null,
      s.showRomanization && word.rom ? h('span.fb-rom', word.rom) : null,
      h('span.fb-en', `= ${word.en}`)
    );
  }

  /** What the learner gave, with the first wrong syllable highlighted. */
  function givenRow(result) {
    if (result.gaveUp) return null;
    let text;
    if (result.givenWord) {
      text = [h('span.fb-ko', { lang: 'ko' }, result.givenWord.ko), h('span.fb-en', ` = ${result.givenWord.en}`)];
    } else if (result.given) {
      const chars = [...U.noSpaces(U.normalize(result.given))];
      const bad = result.diff ? result.diff.index : -1;
      text = h('span.fb-ko', { lang: 'ko' }, chars.map((ch, i) => (i === bad ? h('mark', ch) : ch)));
    } else return null;
    return h('div.fb-row.fb-given', label('내 답', 'You'), text);
  }

  const tipRow = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);

  /** Rows for a word exercise result. */
  function forWord(word, result) {
    if (result.grade === 'good' && !result.almost) {
      return [answerRow(word), result.note ? tipRow(result.note) : null];
    }
    const rows = [answerRow(word), givenRow(result), tipRow(result.tip), tipRow(result.note)];
    if (result.grade === 'again') {
      if (word.note && word.note !== result.tip) rows.push(tipRow(word.note));
      if (word.example) rows.push(ui.example(word.example));
      rows.push(h('p.fb-again', '🔁 ', ui.bi('곧 다시 나와요', "You'll see this one again soon.")));
    }
    return rows;
  }

  /* ---------- Content for sentence answers ---------- */

  /** The sentence split into tiles, each with its English meaning underneath. */
  function gloss(sentence) {
    return h(
      'div.gloss',
      sentence.tiles.map((tile, i) =>
        h('span.gloss-item', h('span.gloss-ko', { lang: 'ko' }, tile), sentence.gloss ? h('span.gloss-en', sentence.gloss[i]) : null)
      )
    );
  }

  function forSentence(sentence, result) {
    const answer = h(
      'div.fb-row.fb-answer',
      label('정답', 'Answer'),
      h('span.fb-ko', { lang: 'ko' }, sentence.ko),
      ui.audioButton(sentence.ko, { size: 'small' })
    );
    const rows = [answer];
    if (result.listening || !result.correct) rows.push(h('div.fb-en-line', `“${sentence.en}”`));
    rows.push(gloss(sentence));
    if (!result.correct) {
      if (result.given) rows.push(h('div.fb-row.fb-given', label('내 답', 'You'), h('span.fb-ko', { lang: 'ko' }, result.given)));
      for (const reason of result.reasons || []) rows.push(tipRow(reason));
    }
    if (result.hintUsed && result.correct) rows.push(tipRow('You used a hint, so this one will come back a little sooner.'));
    return rows;
  }

  M.ui.feedback = { show, forWord, forSentence, gloss };
})(window.Mallang);
