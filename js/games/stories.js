/**
 * Minigame 15 — 이야기 듣기 · Stories: longer listening. A short story or a
 * podcast-style talk in two or three parts, read by one narrator, with
 * questions after each part. ▶ replays the part (🐢 slowly), and its script
 * can be shown for fewer points. After each answer the line that holds it is
 * shown with its translation; at the end, the whole story with translations
 * and a 🔊 for every line. Without a Korean voice it becomes reading practice.
 *
 * Every story has its own spaced-repetition record ('story:<id>') and opens
 * once its key words are known. The stories live in content/stories.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.stories;
  const points = () => M.config.points;

  const isUnlocked = (st) => st.needs.every(M.srs.isIntroduced);
  const missingWords = (st) => st.needs.filter((id) => !M.srs.isIntroduced(id));
  const topicOrder = (st) => M.content.topic(st.topic)?.order ?? 99;
  const byCurriculum = (a, b) => a.level - b.level || topicOrder(a) - topicOrder(b) || a.index - b.index;
  const questionCount = (st) => st.parts.reduce((n, part) => n + part.questions.length, 0);
  const storiesText = (n) => (n === 1 ? '1 story' : `${n} stories`);

  /** Due stories first, then new ones (easiest first), then the least grown; the focus topic's first in each group. */
  function pickRound(topicId = 'all', now = U.now()) {
    const open = M.content.stories().filter(isUnlocked);
    const away = (st) => (topicId === 'all' || st.topic === topicId ? 0 : 1);
    const due = open.filter((st) => M.srs.isDue(st.id, now)).sort((a, b) => away(a) - away(b) || M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open.filter((st) => M.srs.stageOf(st.id) === 0).sort((a, b) => away(a) - away(b) || byCurriculum(a, b));
    const rest = U.shuffle(open.filter((st) => !due.includes(st) && !fresh.includes(st))).sort((a, b) => away(a) - away(b) || M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().perRound);
  }

  /** The locked story closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = M.content.stories().filter((st) => !isUnlocked(st));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || byCurriculum(a, b));
    return locked[0] || null;
  }

  /**
   * Reads lines aloud in the narrator's voice (a woman's or a man's, chosen the
   * way the dialogues choose them), always at its natural pitch. Digits are read
   * out in Hangul. onLine(i) as line i starts, onLine(-1) at the end. The voice
   * is chosen at each ▶ (the voices may have arrived since the screen opened).
   */
  function reader(story, lines, onLine) {
    const text = { speakers: { N: { voice: story.voice } }, lines: lines.map((l) => ({ who: 'N', ko: l.say || M.numbers.readAloud(l.ko) })) };
    let player = null;
    const fresh = () => {
      if (player) player.stop();
      const voices = M.dialogues.voicesFor(text);
      voices.N.pitch = 1;
      player = M.dialogues.player(text, onLine, { voices });
      return player;
    };
    return {
      play: (options) => fresh().play(options),
      line: (i, slow) => fresh().line(i, slow),
      stop: () => player && player.stop(),
    };
  }

  M.games.register({
    id: 'stories',
    order: 15,
    emoji: '📻',
    color: 'sky',
    title: { ko: '이야기 듣기', en: 'Stories' },
    blurb: { ko: '긴 이야기를 듣고 답해요', en: 'Longer listening, part by part' },

    status() {
      const all = M.content.stories();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((st) => M.srs.isDue(st.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${storiesText(due)} to hear again` };
      const fresh = open.filter((st) => M.srs.stageOf(st.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 이야기 ${fresh}개`, en: fresh === 1 ? '1 new story' : `${fresh} new stories` };
      return { ready: true, ko: `이야기 ${open.length}개`, en: `${storiesText(open.length)} to hear again` };
    },

    start(host) {
      const list = pickRound(host.topicId);
      if (!list.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '이야기가 아직 잠겨 있어요',
          en: 'The stories are still locked',
          text: words.length
            ? `Each story opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each story opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const story = list[0];
      const total = questionCount(story);
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      const state = { read: new Set(), wrong: 0 }; // read: the parts whose script was shown before answering
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

      const voiced = () => M.speech.isReady();
      // Listening, unless there's no Korean voice at all (while the voices load, the script stays hidden too).
      const listeningMode = () => voiced() || M.speech.status() === 'loading';

      function screen(...children) {
        release();
        U.clear(host.stage);
        host.setProgress(round.answers, total);
        host.stage.append(...children);
      }

      /** The line being read lights up, and the narrator bounces. */
      function follow(root, offset = 0) {
        return (i) => {
          root.querySelectorAll('[data-line]').forEach((el) => el.classList.toggle('playing', i >= 0 && Number(el.dataset.line) === i + offset));
          root.classList.toggle('is-playing', i >= 0);
        };
      }

      function controls(play) {
        const buttons = [
          ui.button({ icon: '▶', ko: '듣기', en: 'Play', variant: 'mint', onClick: () => play.play() }),
          ui.button({ icon: '🐢', ko: '천천히', en: 'Slowly', variant: 'soft', onClick: () => play.play({ slow: true }) }),
          ui.button({ icon: '⏹', ko: '멈추기', en: 'Stop', variant: 'soft', cls: 'dlg-stop', onClick: () => play.stop() }),
        ];
        buttons.forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));
        return h('div.dlg-controls', buttons);
      }

      function lineButton(play, i) {
        return h(
          'button',
          { type: 'button', class: 'audio-btn small', title: 'Play this line', 'aria-label': 'Play this line', on: { ...M.keys.noMouseFocus, click: () => play.line(i) } },
          h('span', { 'aria-hidden': 'true' }, '🔊')
        );
      }

      /** Lines with a 🔊 each (when there's a voice); `first` numbers them across the story. */
      function script(lines, play, { english = false, first = 0 } = {}) {
        return h(
          'ol.story-script',
          lines.map((l, i) =>
            h(
              'li.story-line',
              { dataset: { line: first + i } },
              h('span.story-line-ko', { lang: 'ko' }, l.ko, voiced() ? lineButton(play, first + i) : null),
              english ? h('span.story-line-en', l.en) : null
            )
          )
        );
      }

      /** The story's title, kind and parts (the one on now highlighted). */
      function head(p) {
        return [
          h(
            'div.story-head',
            h('span.story-emoji', { 'aria-hidden': 'true' }, story.emoji || '📻'),
            h('div', h('div.story-kind', ui.bi(story.kind.ko, story.kind.en, 'inline')), h('h2.story-title', ui.bi(story.title.ko, story.title.en)))
          ),
          h(
            'ol.story-parts',
            { 'aria-label': 'Parts' },
            story.parts.map((_, i) => h('li', { class: `story-part-dot${i === p ? ' now' : i < p ? ' done' : ''}` }, `${i + 1}부`, h('span.sr-only', ` (part ${i + 1}${i === p ? ', now' : ''})`)))
          ),
        ];
      }

      function partScreen(p) {
        const part = story.parts[p];
        const root = h('div.ex.ex-story');
        const play = takeOver(reader(story, part.lines, follow(root)));
        const listening = listeningMode();
        const loading = !voiced() && listening;
        const scriptBox = h('div.story-script-box', { hidden: listening }, script(part.lines, play));
        // Reading the script first is allowed, but this part's answers then count for fewer points.
        const showScript = listening
          ? h(
              'button.btn.btn-soft.btn-small.story-show-script',
              { type: 'button', on: { click: () => reveal() } },
              h('span.btn-icon', { 'aria-hidden': 'true' }, '📜'),
              ui.bi('대본 보기', 'Show the script (fewer points)')
            )
          : null;
        function reveal() {
          state.read.add(p);
          scriptBox.hidden = false;
          showScript.remove();
        }
        const go = ui.button({ ko: '질문으로', en: 'To the questions', variant: 'primary', size: 'big', onClick: () => ask(p, 0) });
        const narrator = h(
          'div.story-narrator',
          h('span.story-narrator-emoji', { 'aria-hidden': 'true' }, story.voice === 'low' ? '👨' : '👩'),
          ui.bi(`${p + 1}부를 들어 보세요`, `Listen to part ${p + 1} of ${story.parts.length}`)
        );
        root.append(
          listening ? ui.exTag('잘 들어 보세요', 'Listen to the story', '🎧') : ui.exTag('읽어 보세요', 'Read the story', '📖'),
          h(
            'div.story-card',
            head(p),
            listening ? narrator : null,
            listening && !loading ? controls(play) : h('p.muted', loading ? ui.bi('목소리를 준비하고 있어요…', 'Getting the voice ready…') : ui.bi('소리가 없어서 읽기 모드예요', 'No Korean voice here, so read it instead.')),
            scriptBox,
            showScript
          ),
          h('div.ex-actions', h('span.key-hint', ui.bi(listening ? 'R 다시 듣기 · 엔터' : '엔터', listening ? 'R to replay · Enter ↵' : 'Enter ↵')), go)
        );
        screen(root);
        window.scrollTo(0, 0);
        go.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            ask(p, 0);
          } else if (voiced() && M.keys.isReplay(event)) play.play();
        });
        if (voiced() && M.store.state.settings.autoPlayAudio) later(() => current === play && play.play(), 500);
        // Voices often arrive just after the page loads: then the part is played (or, with none, shown to read).
        if (loading) offVoices = M.events.on('speech:status', () => later(() => current === play && partScreen(p), 0));
      }

      function ask(p, k) {
        const part = story.parts[p];
        const q = part.questions[k];
        const options = U.shuffle(q.options.map((o, i) => ({ ...o, correct: i === q.answer })));
        const root = h('div.ex.ex-story.ex-story-q');
        const play = takeOver(reader(story, part.lines, follow(root)));
        const listening = listeningMode();
        const loading = !voiced() && listening;
        const seeScript = !listening || state.read.has(p);
        let locked = false;
        const buttons = options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option dlg-option', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', ui.bi(o.ko, o.en))
          )
        );
        const n = part.questions.length;
        root.append(
          ui.exTag(`${p + 1}부 · 질문 ${k + 1}/${n}`, `Part ${p + 1} · question ${k + 1} of ${n}`, '❓'),
          h('div.story-card.story-card-small', head(p), voiced() ? controls(play) : null, seeScript ? h('div.read-scroll', script(part.lines, play)) : null),
          h('h3.dlg-question', { lang: 'ko' }, ui.bi(q.q.ko, q.q.en)),
          h('div.options.dlg-options', { role: 'group', 'aria-label': 'Answers' }, buttons)
        );
        screen(root);
        window.scrollTo(0, 0);
        stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const num = Number(event.key);
          if (num >= 1 && num <= options.length) {
            event.preventDefault();
            choose(num - 1);
          } else if (voiced() && M.keys.isReplay(event)) play.play();
        });
        // The voices arrived (or turned out to be missing): the same question again, with ▶ (or the script).
        if (loading) offVoices = M.events.on('speech:status', () => later(() => current === play && !locked && ask(p, k), 0));

        function choose(i) {
          if (locked) return;
          locked = true;
          release();
          const picked = options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[options.findIndex((o) => o.correct)].classList.add('correct');
          onAnswer(p, k, picked, options.find((o) => o.correct), play);
        }
      }

      function onAnswer(p, k, picked, right, play) {
        const part = story.parts[p];
        const q = part.questions[k];
        const correct = picked.correct;
        M.progress.recordAnswer(correct);
        M.progress.skill('stories', correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = state.read.has(p) ? points().storyRead : points().story;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
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
            lines.map((i) => h('li.read-line', h('span.read-line-ko', { lang: 'ko' }, part.lines[i].ko, voiced() ? lineButton(play, i) : null), h('span.read-line-en', part.lines[i].en)))
          ),
          tip(q.why),
        ];
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content: content.filter(Boolean),
          speak: null,
          onContinue: () => {
            if (k + 1 < part.questions.length) ask(p, k + 1);
            else if (p + 1 < story.parts.length) partScreen(p + 1);
            else review();
          },
        });
      }

      /** Grade the story, then show all of it with translations. */
      function review() {
        const grade = state.wrong === 0 ? (state.read.size ? 'hard' : 'good') : state.wrong * 2 >= total ? 'again' : 'hard';
        M.srs.review(story.id, grade);
        M.progress.bump('storiesHeard');
        M.store.save();

        const root = h('div.ex.ex-story.ex-story-review');
        const all = story.parts.flatMap((part) => part.lines);
        const play = takeOver(reader(story, all, follow(root)));
        const button = ui.button({ ko: '끝내기', en: 'Finish', variant: 'primary', size: 'big', onClick: done });
        let first = 0;
        const parts = story.parts.map((part, p) => {
          const box = [h('h3.story-part-title', ui.bi(`${p + 1}부`, `Part ${p + 1}`)), script(part.lines, play, { english: true, first })];
          first += part.lines.length;
          return box;
        });
        root.append(
          ui.exTag('전체 이야기', 'The whole story', '📜'),
          h('div.story-card', head(story.parts.length), voiced() ? controls(play) : null, parts),
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
        );
        screen(root);
        window.scrollTo(0, 0);
        button.focus({ preventScroll: true });
        host.mascot.say('끝까지 들었어요!', 'You heard the whole story!', { duration: 2500 });
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
          finish();
        }
      }

      function finish() {
        release();
        if (current) current.stop();
        current = null;
        host.finish({
          gameId: 'stories',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }

      partScreen(0); // (last, once every helper above exists)
    },
  });

  M.stories = { pickRound, nextLocked, isUnlocked, reader, questionCount };
})(window.Mallang);
