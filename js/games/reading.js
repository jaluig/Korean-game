/**
 * Minigame 11 — 읽기 · Reading: a short text from one of your topics (a diary
 * entry, a text message, a note, a café menu…) with a few questions about
 * it. The text stays on screen while you answer; after each answer the
 * sentence that holds it lights up with its translation, and at the end you
 * get the whole text with translations and a 🔊 for every sentence.
 *
 * Every passage has its own spaced-repetition record ('reading:<id>') and
 * opens once you know its key words. The passages live in content/reading.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.reading;
  const points = () => M.config.points;

  const isUnlocked = (r) => r.needs.every(M.srs.isIntroduced);
  const missingWords = (r) => r.needs.filter((id) => !M.srs.isIntroduced(id));
  const topicOrder = (r) => M.content.topic(r.topic)?.order ?? 99;
  const byCurriculum = (a, b) => a.level - b.level || topicOrder(a) - topicOrder(b) || a.index - b.index;

  /** Due passages first, then new ones (easiest first), then the least grown; the focus topic's first in each group. */
  function pickRound(topicId = 'all', now = U.now()) {
    const open = M.content.readings().filter(isUnlocked);
    const away = (r) => (topicId === 'all' || r.topic === topicId ? 0 : 1);
    const due = open.filter((r) => M.srs.isDue(r.id, now)).sort((a, b) => away(a) - away(b) || M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open.filter((r) => M.srs.stageOf(r.id) === 0).sort((a, b) => away(a) - away(b) || byCurriculum(a, b));
    const rest = U.shuffle(open.filter((r) => !due.includes(r) && !fresh.includes(r))).sort((a, b) => away(a) - away(b) || M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().perRound);
  }

  /** The locked passage closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = M.content.readings().filter((r) => !isUnlocked(r));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || byCurriculum(a, b));
    return locked[0] || null;
  }

  /** Reads a passage aloud, sentence by sentence, in the voice chosen in Settings (the Dialogues player). Digits are read out in Hangul. */
  function reader(passage, onLine) {
    const text = { speakers: { A: { voice: 'high' } }, lines: passage.sentences.map((s) => ({ who: 'A', ko: s.say || M.numbers.readAloud(s.ko) })) };
    return M.dialogues.player(text, onLine, { voices: { A: { voice: M.speech.voice(), pitch: 1 } } });
  }

  M.games.register({
    id: 'reading',
    order: 11,
    emoji: '📖',
    color: 'butter',
    title: { ko: '읽기', en: 'Reading' },
    blurb: { ko: '짧은 글을 읽고 질문에 답해요', en: 'Read a short text, then answer' },

    status() {
      const all = M.content.readings();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((r) => M.srs.isDue(r.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'text')} to read again` };
      const fresh = open.filter((r) => M.srs.stageOf(r.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 글 ${fresh}개`, en: U.plural(fresh, 'new text') };
      return { ready: true, ko: `글 ${open.length}개`, en: `${U.plural(open.length, 'text')} to read again` };
    },

    start(host) {
      const list = pickRound(host.topicId);
      if (!list.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '읽기가 아직 잠겨 있어요',
          en: 'The reading texts are still locked',
          text: words.length
            ? `Each text opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each text opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const total = list.reduce((n, r) => n + r.questions.length, 0);
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      let current = null; // the reader of the screen on show
      let left = false;
      let stopKeys = null;
      let offVoices = null; // waiting for the Korean voices to load
      const timers = new Set();
      const later = (fn, ms) => {
        const t = setTimeout(() => {
          timers.delete(t);
          if (!left) fn();
        }, ms);
        timers.add(t);
      };
      const release = () => {
        if (stopKeys) stopKeys();
        stopKeys = null;
        if (offVoices) offVoices();
        offVoices = null;
      };
      /** Each screen has its own reader; the one before it stops. */
      const takeOver = (play) => {
        if (current && current !== play) current.stop();
        current = play;
        return play;
      };
      host.onCleanup(() => {
        left = true;
        release();
        timers.forEach(clearTimeout);
        if (current) current.stop();
        current = null;
      });

      let pi = 0;

      function nextPassage() {
        if (current) current.stop();
        if (pi >= list.length) return finish();
        read(list[pi]);
      }

      function screen(...children) {
        release();
        U.clear(host.stage);
        host.setProgress(round.answers, total);
        host.stage.append(...children);
      }

      const voiced = () => M.speech.isReady();

      /** The sentence being read aloud lights up. */
      function follow(root) {
        return (i) => {
          root.querySelectorAll('[data-line]').forEach((el) => el.classList.toggle('playing', Number(el.dataset.line) === i));
          root.classList.toggle('is-playing', i >= 0);
        };
      }

      function readControls(play) {
        const buttons = [
          ui.button({ icon: '▶', ko: '듣기', en: 'Listen', variant: 'mint', onClick: () => play.play() }),
          ui.button({ icon: '🐢', ko: '천천히', en: 'Slowly', variant: 'soft', onClick: () => play.play({ slow: true }) }),
          ui.button({ icon: '⏹', ko: '멈추기', en: 'Stop', variant: 'soft', cls: 'dlg-stop', onClick: () => play.stop() }),
        ];
        buttons.forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));
        return h('div.dlg-controls', buttons);
      }

      /** The text as a flowing paragraph; with `english`, one sentence per line with its translation. */
      function passageText(passage, play, { english = false } = {}) {
        if (!english) {
          return h(
            'p.read-text',
            { lang: 'ko' },
            passage.sentences.map((s, i) => [h('span.read-sentence', { dataset: { line: i } }, s.ko), ' '])
          );
        }
        return h(
          'ol.read-lines',
          passage.sentences.map((s, i) =>
            h(
              'li.read-line',
              { dataset: { line: i } },
              h('span.read-line-ko', { lang: 'ko' }, s.ko, voiced() ? sentenceButton(play, i) : null),
              h('span.read-line-en', s.en)
            )
          )
        );
      }

      function sentenceButton(play, i) {
        return h(
          'button',
          { type: 'button', class: 'audio-btn small', title: 'Play this sentence', 'aria-label': 'Play this sentence', on: { ...M.keys.noMouseFocus, click: () => play.line(i) } },
          h('span', { 'aria-hidden': 'true' }, '🔊')
        );
      }

      function header(passage) {
        return [
          h('div.read-kind', h('span', { 'aria-hidden': 'true' }, passage.emoji || '📄'), ui.bi(passage.kind.ko, passage.kind.en, 'inline')),
          h('h2.read-title', ui.bi(passage.title.ko, passage.title.en)),
        ];
      }

      function read(passage, state = { helped: false, wrong: 0 }) {
        const root = h('div.ex.ex-reading');
        const play = takeOver(reader(passage, follow(root)));
        const textBox = h('div.read-text-box', passageText(passage, play, { english: state.helped }));
        // Seeing the English first is allowed, but the answers then count for fewer points.
        const showEnglish = state.helped
          ? null
          : h(
              'button.btn.btn-soft.btn-small.read-show-en',
              { type: 'button', on: { click: () => reveal() } },
              h('span.btn-icon', { 'aria-hidden': 'true' }, '🇬🇧'),
              ui.bi('영어 보기', 'Show the English (fewer points)')
            );
        function reveal() {
          state.helped = true;
          U.clear(textBox).append(passageText(passage, play, { english: true }));
          showEnglish.remove();
        }
        const go = ui.button({ ko: '질문으로', en: 'To the questions', variant: 'primary', size: 'big', onClick: () => ask(passage, state, 0) });
        root.append(
          ui.exTag('읽어 보세요', 'Read the text', '📖'),
          h('div.read-card', header(passage), textBox, voiced() ? readControls(play) : null, showEnglish),
          h('div.ex-actions', h('span.key-hint', ui.bi(voiced() ? 'R 듣기 · 엔터' : '엔터', voiced() ? 'R to listen · Enter ↵' : 'Enter ↵')), go)
        );
        screen(root);
        window.scrollTo(0, 0);
        go.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            ask(passage, state, 0);
          } else if (voiced() && M.keys.isReplay(event)) play.play();
        });
        // Voices often arrive just after the page loads: then the ▶ buttons appear.
        if (!voiced() && M.speech.status() === 'loading') offVoices = M.events.on('speech:status', () => later(() => current === play && read(passage, state), 0));
      }

      function ask(passage, state, k) {
        const q = passage.questions[k];
        const options = U.shuffle(q.options.map((o, i) => ({ ...o, correct: i === q.answer })));
        const root = h('div.ex.ex-reading.ex-reading-q');
        const play = takeOver(reader(passage, follow(root)));
        let locked = false;
        const buttons = options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option dlg-option', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', ui.bi(o.ko, o.en))
          )
        );
        root.append(
          ui.exTag(`질문 ${k + 1}/${passage.questions.length}`, `Question ${k + 1} of ${passage.questions.length}`, '❓'),
          h('div.read-card.read-card-small', header(passage), h('div.read-text-box.read-scroll', passageText(passage, play, { english: state.helped }))),
          h('h3.dlg-question', { lang: 'ko' }, ui.bi(q.q.ko, q.q.en)),
          h('div.options.dlg-options', { role: 'group', 'aria-label': 'Answers' }, buttons)
        );
        screen(root);
        window.scrollTo(0, 0); // the text first
        stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= options.length) {
            event.preventDefault();
            choose(n - 1);
          }
        });

        function choose(i) {
          if (locked) return;
          locked = true;
          release();
          const picked = options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[options.findIndex((o) => o.correct)].classList.add('correct');
          // The sentence(s) with the answer light up in the text.
          for (const n of [].concat(q.line)) root.querySelectorAll(`[data-line="${n}"]`).forEach((el) => el.classList.add('key'));
          onAnswer(passage, state, k, picked, options.find((o) => o.correct), play);
        }
      }

      function onAnswer(passage, state, k, picked, right, play) {
        const q = passage.questions[k];
        const correct = picked.correct;
        M.progress.recordAnswer(correct);
        M.progress.skill('reading', correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = state.helped ? points().readingHelped : points().reading;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('readingsCorrect');
        } else {
          round.combo = 0;
          state.wrong++;
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        const lines = [].concat(q.line);
        if (voiced() && M.store.state.settings.autoPlayAudio) later(() => current === play && play.play({ lines }), 300);
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, right.ko), h('span.fb-en', `= ${right.en}`)),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, picked.ko), h('span.fb-en', ` = ${picked.en}`)),
          h(
            'ol.read-lines.read-lines-fb',
            lines.map((i) =>
              h(
                'li.read-line',
                h('span.read-line-ko', { lang: 'ko' }, passage.sentences[i].ko, voiced() ? sentenceButton(play, i) : null),
                h('span.read-line-en', passage.sentences[i].en)
              )
            )
          ),
          tip(q.why),
        ];
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content: content.filter(Boolean),
          speak: null,
          onContinue: () => {
            if (k + 1 < passage.questions.length) ask(passage, state, k + 1);
            else review(passage, state);
          },
        });
      }

      /** Grade the passage, then show the whole text with translations. */
      function review(passage, state) {
        const n = passage.questions.length;
        const grade = state.wrong === 0 ? (state.helped ? 'hard' : 'good') : state.wrong * 2 >= n ? 'again' : 'hard';
        M.srs.review(passage.id, grade);
        M.progress.bump('readingsDone');
        M.store.save();

        const root = h('div.ex.ex-reading.ex-reading-review');
        const play = takeOver(reader(passage, follow(root)));
        const last = pi + 1 >= list.length;
        const button = ui.button({ ko: last ? '끝내기' : '다음 글', en: last ? 'Finish' : 'Next text', variant: 'primary', size: 'big', onClick: done });
        root.append(
          ui.exTag('전체 글', 'The whole text', '📜'),
          h('div.read-card', header(passage), voiced() ? readControls(play) : null, passageText(passage, play, { english: true })),
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
        );
        screen(root);
        window.scrollTo(0, 0);
        button.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          } else if (voiced() && M.keys.isReplay(event)) play.play();
        });
        let finished = false;
        function done() {
          if (finished) return;
          finished = true;
          pi++;
          nextPassage();
        }
      }

      function finish() {
        release();
        host.finish({
          gameId: 'reading',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }

      nextPassage(); // (last, once every helper above exists)
    },
  });

  M.reading = { pickRound, nextLocked, isUnlocked, reader };
})(window.Mallang);
