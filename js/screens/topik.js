/**
 * TOPIK I practice (route: #/topik, or #/topik/<kind> to start one straight
 * away): a short mock test in the style of the real one. Like on the day,
 * nothing is marked until the answers are handed in; then the score, the level
 * it stands for, and every question again with its script or text, the English
 * and why. The test itself is built and scored in js/core/topik.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const CIRCLED = ['①', '②', '③', '④'];
  const ORDER_LABELS = ['(가)', '(나)', '(다)', '(라)'];
  const SECTIONS = {
    listening: { ko: '듣기', en: 'Listening', emoji: '🎧' },
    reading: { ko: '읽기', en: 'Reading', emoji: '📖' },
  };
  const WHO = {
    m: { ko: '남자', en: 'man', emoji: '👨' },
    w: { ko: '여자', en: 'woman', emoji: '👩' },
  };
  const LEVELS = {
    2: { ko: '2급 수준', en: 'Level 2', emoji: '🌟' },
    1: { ko: '1급 수준', en: 'Level 1', emoji: '⭐' },
    0: { ko: '1급까지 조금 더', en: 'Not level 1 yet', emoji: '🌱' },
  };
  const TONES = { listening: 'sky', reading: 'mint', full: 'lilac' };

  const kindOf = (kind) => M.topik.KINDS[kind];
  const needsVoice = (kind) => kindOf(kind).sections.includes('listening');
  const optionText = (o) => (typeof o === 'string' ? o : o.ko);
  const cfg = () => M.config.session.topik;

  /** 12:05 */
  function clock(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  /** The instruction of an item's kind of question, as on the real test. */
  function instruction(item) {
    const spec = M.content.TOPIK_TYPES[item.section][item.type];
    const who = WHO[item.whose] || WHO.w;
    return { ko: spec.ko.replace('{whose}', who.ko), en: spec.en.replace('{whose}', who.en) };
  }

  /** Korean text with its blank (    ), a blank ( ㉠ ) and the places (㉠)…(㉣) drawn as boxes. */
  function richKo(text) {
    return String(text)
      .split(/(\(\s+\)|\(\s+[㉠㉡㉢㉣]\s+\)|\([㉠㉡㉢㉣]\))/)
      .filter(Boolean)
      .map((part) => {
        if (/^\(\s+\)$/.test(part)) return h('span.topik-blank', { 'aria-label': 'blank' });
        const blank = part.match(/^\(\s+([㉠㉡㉢㉣])\s+\)$/);
        if (blank) return h('span.topik-blank', blank[1]);
        const mark = part.match(/^\(([㉠㉡㉢㉣])\)$/);
        if (mark) return h('span.topik-mark', mark[1]);
        return part;
      });
  }

  const english = (x, show) => (show && x.en ? h('span.topik-en', x.en) : null);

  /** A notice, an ad, a message, a ticket, a list or a sign. */
  function noticeCard(n, { en = false } = {}) {
    return h(
      'div',
      { class: `topik-notice kind-${n.kind}` },
      h('div.topik-notice-title', n.emoji ? h('span.topik-notice-emoji', { 'aria-hidden': 'true' }, n.emoji) : null, h('span', h('span', { lang: 'ko' }, n.title.ko), english(n.title, en))),
      h(
        'ul.topik-notice-lines',
        n.lines.map((l) => h('li', h('span', { lang: 'ko' }, l.ko), english(l, en)))
      )
    );
  }

  /** What there is to read; with `en`, sentence by sentence with the English. */
  function readingBox(item, { en = false } = {}) {
    if (item.type === 'notice') return noticeCard(item.notice, { en });
    if (item.type === 'order') {
      return h(
        'ol.topik-order',
        item.text.map((l, i) => h('li', h('span.topik-order-label', ORDER_LABELS[i]), h('span', h('span', { lang: 'ko' }, richKo(l.ko)), english(l, en))))
      );
    }
    if (en) return h('div.topik-text.with-en', item.text.map((l) => h('p', h('span', { lang: 'ko' }, richKo(l.ko)), english(l, true))));
    return h('div.topik-text', h('p', { lang: 'ko' }, item.text.map((l, i) => [i ? ' ' : '', ...richKo(l.ko)])));
  }

  /** A listening item as the dialogue player reads it: a man's and a woman's voice. */
  function dialogueOf(item) {
    return {
      speakers: { m: { voice: 'low' }, w: { voice: 'high' } },
      lines: item.script.map((l) => ({ who: l.who, ko: l.say || M.numbers.readAloud(l.ko) })),
    };
  }

  function newPlayer(item, onLine) {
    const dialogue = dialogueOf(item);
    return M.dialogues.player(dialogue, onLine, { voices: M.dialogues.voicesFor(dialogue) });
  }

  /** Who speaks in a listening item, in order of appearance. */
  const speakersOf = (item) => [...new Set(item.script.map((l) => l.who))];

  /** [1~2], [5]: the question numbers an instruction covers. */
  const range = (from, to) => (from === to ? `[${from}]` : `[${from}~${to}]`);

  /** Consecutive pages of the same kind share an instruction (each set has its own), as on the real test. */
  function groupPages(pages) {
    let i = 0;
    while (i < pages.length) {
      const first = pages[i].item;
      let j = i;
      if (first.type !== 'set') while (j + 1 < pages.length && pages[j + 1].item.type === first.type && pages[j + 1].item.section === first.section) j++;
      const from = pages[i].questions[0].number;
      const last = pages[j].questions;
      for (let k = i; k <= j; k++) Object.assign(pages[k], { from, to: last[last.length - 1].number });
      i = j + 1;
    }
  }

  function levelNote(outcome) {
    const share = Math.round((100 * outcome.score) / outcome.max);
    const what = outcome.max === 200 ? `${outcome.score} of 200` : `${share}% of the points`;
    const guide = 'This practice test is shorter than the real one, so take it as a rough guide.';
    if (outcome.level === 2) return `${what}: that’s level 2 on the real test (140 of 200 and up). ${guide}`;
    if (outcome.level === 1) return `${what}: that’s level 1 on the real test (80 of 200 and up); level 2 starts at 140. ${guide}`;
    return `${what}: level 1 on the real test starts at 80 of 200 (40%). Go through the questions below, and try again soon.`;
  }

  M.screens.register({
    id: 'topik',

    render(view, arg) {
      let cleanups = [];
      let left = false;
      const release = () => {
        cleanups.forEach((fn) => fn());
        cleanups = [];
        M.speech.stop();
      };
      const show = (draw) => {
        release();
        document.body.classList.remove('playing');
        document.querySelectorAll('.confetti').forEach((el) => el.remove());
        U.clear(view);
        draw();
        window.scrollTo(0, 0);
      };
      const later = (fn, ms) => {
        const t = setTimeout(() => !left && fn(), ms);
        cleanups.push(() => clearTimeout(t));
      };

      /** Can a test of this kind start now? Returns why not, or null. */
      function lockOf(kind) {
        if (!M.topik.ready(kind)) return { ko: '준비 중', en: 'Coming soon' };
        if (needsVoice(kind) && !M.speech.isReady()) {
          return M.speech.status() === 'loading'
            ? { ko: '목소리를 준비하고 있어요…', en: 'Getting the voice ready…' }
            : { ko: '한국어 음성이 필요해요', en: 'Needs a Korean voice: see Settings → Sound' };
        }
        return null;
      }

      /* ---------- The start page ---------- */

      function home() {
        const cards = Object.keys(M.topik.KINDS).map((kind) => {
          const k = kindOf(kind);
          const { questions, minutes } = M.topik.size(kind);
          const best = M.topik.best(kind);
          const max = 100 * k.sections.length;
          const lock = lockOf(kind);
          return h(
            'button',
            {
              type: 'button',
              class: `card topik-kind tone-${TONES[kind]}${lock ? ' locked' : ''}`,
              disabled: !!lock,
              dataset: { kind },
              on: { click: () => show(() => run(kind)) },
            },
            h('span.topik-kind-emoji', { 'aria-hidden': 'true' }, k.emoji),
            h('span.topik-kind-title', ui.bi(k.ko, k.en)),
            h('span.topik-kind-meta', ui.bi(`${questions}문제 · 약 ${minutes}분`, `${questions} questions · about ${minutes} min`)),
            h('span.topik-kind-best', best != null ? ui.bi(`최고 ${best}점 / ${max}점`, `best: ${best} of ${max}`) : ui.bi('아직 안 풀었어요', 'not taken yet')),
            lock ? h('span.topik-kind-lock', '🔒 ', ui.bi(lock.ko, lock.en, 'inline')) : h('span.btn.btn-primary.btn-small.topik-kind-go', ui.bi('시작', 'Start'))
          );
        });
        const history = M.topik.history().slice(0, 8);
        view.append(
          h(
            'div.topik-home',
            h(
              'div.page-head',
              h('h1', ui.bi('TOPIK I 모의시험', 'TOPIK I practice test')),
              h('p.page-sub', 'A short practice test in the style of TOPIK I, the Test of Proficiency in Korean for levels 1 and 2. Like on the day, nothing is marked until you hand it in; then you see your score and go through every question with the script and the English.')
            ),
            h('div.topik-kinds', cards),
            h(
              'section.card.topik-about',
              h('h2.card-title', ui.bi('TOPIK I은?', 'About TOPIK I')),
              h(
                'ul.topik-about-list',
                h('li', h('span', { 'aria-hidden': 'true' }, '🎧'), h('span', 'The real test: listening (듣기), 30 questions in 40 minutes, and reading (읽기), 40 questions in 60 minutes. Each is out of 100 points.')),
                h('li', h('span', { 'aria-hidden': 'true' }, '🏅'), h('span', 'Level 1 (1급) from 80 of the 200 points, level 2 (2급) from 140.')),
                h('li', h('span', { 'aria-hidden': 'true' }, '📝'), h('span', `This practice test is shorter (10 questions a section) but has the same kinds of questions, in the same order. You hear each listening item at most ${cfg().plays} times, as on the real test.`)),
                h('li', h('span', { 'aria-hidden': 'true' }, '✍️'), h('span', 'The questions are written for this game, in the style of the real test. Each right answer earns ⭐ for your daily goal.'))
              )
            ),
            history.length
              ? h(
                  'section.card.topik-history',
                  h('h2.card-title', ui.bi('지난 결과', 'Your results')),
                  h(
                    'ol.topik-history-list',
                    history.map((r) =>
                      h(
                        'li',
                        h('span.topik-history-date', new Date(r.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                        h('span.topik-history-kind', `${kindOf(r.kind).emoji} `, ui.bi(kindOf(r.kind).ko, kindOf(r.kind).en, 'inline')),
                        h('span.topik-history-score', `${r.score} / ${r.max}`),
                        h('span', { class: `topik-level small level-${r.level}` }, `${LEVELS[r.level].emoji} `, ui.bi(LEVELS[r.level].ko, LEVELS[r.level].en, 'inline'))
                      )
                    )
                  )
                )
              : null
          )
        );
        // While the voices load, the listening tests wait.
        if (M.speech.status() === 'loading') cleanups.push(M.events.on('speech:status', () => later(() => show(home), 0)));
      }

      /* ---------- The test ---------- */

      function run(kind) {
        document.body.classList.add('playing');
        const test = M.topik.build(kind);
        const pages = test.sections.flatMap((s) => s.pages);
        const questions = pages.flatMap((p) => p.questions);
        groupPages(pages);
        const { minutes } = M.topik.size(kind);
        const plays = new Map(); // page → times heard
        let index = 0;
        let player = null;
        let playing = false;
        let done = false;

        const quitBtn = h('button.icon-btn.play-quit', { type: 'button', title: '그만하기 · Quit', 'aria-label': 'Quit the test', on: { click: quit } }, '✕');
        const progress = ui.bar(0, { color: TONES[kind], label: 'Questions answered' });
        const timeEl = h('div.topik-timer', { title: `About ${minutes} minutes at the real test’s pace` });
        const nav = h('nav.topik-nav', { 'aria-label': 'Questions' });
        const stage = h('div.topik-stage');
        view.append(
          h(
            'div',
            { class: `topik-test tone-${TONES[kind]}` },
            h(
              'div.play-top',
              quitBtn,
              h('div.play-title', h('span', { 'aria-hidden': 'true' }, '📝'), ui.bi(`TOPIK I · ${kindOf(kind).ko}`, `TOPIK I practice · ${kindOf(kind).en}`)),
              h('div.play-progress', progress),
              timeEl
            ),
            nav,
            stage
          )
        );

        const tick = () => {
          const ms = U.now() - test.started;
          timeEl.textContent = `⏱ ${clock(ms)} / ${minutes}:00`;
          timeEl.classList.toggle('over', ms > minutes * 60 * 1000);
        };
        tick();
        const timer = setInterval(tick, 1000);
        cleanups.push(() => clearInterval(timer));
        cleanups.push(() => {
          done = true;
          stopAudio();
          M.store.save();
        });
        cleanups.push(M.keys.push(onKey));

        function stopAudio() {
          const current = player;
          player = null;
          if (current) current.stop();
          playing = false;
        }

        /* Listening: the ▶ button, and the speakers lighting up as they talk. */
        function playsLeft(p) {
          return cfg().plays - (plays.get(p) || 0);
        }

        function refreshListen(p) {
          if (!p.view) return;
          const n = playsLeft(p);
          const ready = M.speech.isReady();
          p.view.button.disabled = playing || n <= 0 || !ready;
          p.view.button.classList.toggle('is-playing', playing);
          U.clear(p.view.label).append(
            playing
              ? ui.bi('듣는 중…', 'Playing…')
              : !ready
                ? ui.bi('목소리를 준비하고 있어요…', 'Getting the voice ready…')
                : n > 0
                  ? ui.bi(`듣기 (${n}번 남았어요)`, n === cfg().plays ? `Play · you can hear it ${n} times` : `Play again · ${n} left`)
                  : ui.bi('두 번 다 들었어요', 'Heard twice')
          );
        }

        function playItem(p) {
          if (done || pages[index] !== p || playing || playsLeft(p) <= 0 || !M.speech.isReady()) return;
          stopAudio();
          const used = plays.get(p) || 0;
          plays.set(p, used + 1);
          playing = true;
          let begun = false; // play() first stops whatever was playing
          const mine = newPlayer(p.item, (i) => {
            if (i >= 0) {
              begun = true;
              const who = p.item.script[i].who;
              if (p.view) p.view.speakers.querySelectorAll('[data-who]').forEach((el) => el.classList.toggle('talking', el.dataset.who === who));
              return;
            }
            if (!begun || player !== mine) return;
            player = null;
            playing = false;
            if (p.view) p.view.speakers.querySelectorAll('[data-who]').forEach((el) => el.classList.remove('talking'));
            refreshListen(p);
          });
          player = mine;
          refreshListen(p);
          mine.play();
        }

        function listenBox(p) {
          const label = h('span.topik-play-label');
          const button = h(
            'button',
            { type: 'button', class: 'topik-play', on: { ...M.keys.noMouseFocus, click: () => playItem(p) } },
            h('span.topik-play-icon', { 'aria-hidden': 'true' }, '▶︎'),
            label
          );
          const speakers = h(
            'div.topik-speakers',
            { 'aria-hidden': 'true' },
            speakersOf(p.item).map((who) => h('span.topik-speaker', { dataset: { who } }, WHO[who].emoji))
          );
          p.view = { button, label, speakers };
          refreshListen(p);
          return h('div.topik-listen', speakers, button);
        }

        /* Questions: four options ①–④; choosing one can be changed until the test is handed in. */
        function choose(x, i) {
          x.chosen = i;
          (x.buttons || []).forEach((b, k) => {
            b.classList.toggle('selected', k === i);
            b.setAttribute('aria-checked', String(k === i));
          });
          M.sfx.play('tap');
          drawNav();
        }

        function questionBlock(x) {
          x.buttons = x.order.map((k, i) =>
            h(
              'button',
              {
                type: 'button',
                role: 'radio',
                'aria-checked': String(x.chosen === i),
                class: `topik-option${x.chosen === i ? ' selected' : ''}`,
                dataset: { focus: `q${x.number}-${i}` },
                on: { ...M.keys.noMouseFocus, click: () => choose(x, i) }, // (a click leaves the focus on 다음, so Enter goes on)
              },
              h('span.topik-option-num', { 'aria-hidden': 'true' }, CIRCLED[i]),
              h('span.topik-option-text', { lang: 'ko' }, optionText(x.q.options[k]))
            )
          );
          return h(
            'div.topik-question',
            h('p.topik-q', h('span.topik-q-num', `${x.number}.`), x.q.q ? h('span', { lang: 'ko' }, x.q.q.ko) : null),
            x.q.quote ? h('blockquote.topik-quote', { lang: 'ko' }, x.q.quote.ko) : null,
            h('div.topik-options', { role: 'radiogroup', 'aria-label': `Question ${x.number}` }, x.buttons)
          );
        }

        function drawNav() {
          U.clear(nav);
          for (const s of test.sections) {
            const info = SECTIONS[s.section];
            nav.append(
              h(
                'div.topik-nav-section',
                h('span.topik-nav-label', `${info.emoji} `, ui.bi(info.ko, info.en, 'inline')),
                h(
                  'ol.topik-nav-list',
                  s.pages.flatMap((p) =>
                    p.questions.map((x) =>
                      h(
                        'li',
                        h(
                          'button',
                          {
                            type: 'button',
                            class: `topik-nav-dot${x.chosen != null ? ' answered' : ''}${pages[index] === p ? ' current' : ''}`,
                            'aria-label': `Question ${x.number}${x.chosen != null ? ', answered' : ''}`,
                            'aria-current': pages[index] === p ? 'step' : null,
                            on: { ...M.keys.noMouseFocus, click: () => go(pages.indexOf(p)) },
                          },
                          String(x.number)
                        )
                      )
                    )
                  )
                )
              )
            );
          }
          nav.append(ui.button({ ko: '제출', en: 'Hand in', variant: 'soft', size: 'small', cls: 'topik-nav-submit', onClick: submit }));
          progress.set(questions.filter((x) => x.chosen != null).length / questions.length);
        }

        function go(i) {
          if (i < 0 || i >= pages.length || done) return;
          stopAudio();
          if (pages[index] && pages[index].view) pages[index].view = null;
          index = i;
          drawNav();
          drawPage();
        }

        function drawPage() {
          const p = pages[index];
          const item = p.item;
          M.topik.markSeen(item);
          const inst = instruction(item);
          const info = SECTIONS[item.section];
          const section = test.sections.find((s) => s.section === item.section);
          const first = section.pages[0].questions[0].number;
          const lastPage = section.pages[section.pages.length - 1].questions;
          const last = index === pages.length - 1;
          const back = ui.button({ ko: '이전', en: 'Back', variant: 'soft', disabled: index === 0, onClick: () => go(index - 1) });
          const next = last
            ? ui.button({ ko: '제출하기', en: 'Hand in', variant: 'primary', size: 'big', onClick: submit })
            : ui.button({ ko: '다음', en: 'Next', variant: 'primary', size: 'big', onClick: () => go(index + 1) });
          U.clear(stage).append(
            h(
              'div',
              { class: `topik-page section-${item.section}` },
              ui.exTag(`${info.ko} (${first}~${lastPage[lastPage.length - 1].number}번)`, `${info.en} · questions ${first}–${lastPage[lastPage.length - 1].number}`, info.emoji),
              h(
                'div.topik-paper',
                h('p.topik-instruction', h('span.topik-range', `※ ${range(p.from, p.to)}`), ui.bi(richKo(inst.ko), inst.en)),
                item.section === 'listening' ? listenBox(p) : readingBox(item),
                p.questions.map(questionBlock)
              ),
              h(
                'div.topik-actions',
                back,
                h('span.key-hint', ui.bi(item.section === 'listening' ? '1–4 · R 다시 듣기 · 엔터' : '1–4 · 엔터', item.section === 'listening' ? '1–4 to choose · R to replay · Enter ↵' : '1–4 to choose · Enter ↵')),
                next
              )
            )
          );
          window.scrollTo(0, 0);
          next.focus({ preventScroll: true });
          // A listening item plays by itself the first time, as on the real test.
          if (item.section === 'listening' && !plays.get(p)) {
            if (M.speech.isReady()) later(() => playItem(p), 600);
            else if (M.speech.status() === 'loading') {
              const off = M.events.on('speech:status', () => {
                refreshListen(p);
                if (M.speech.isReady() && !plays.get(p)) later(() => playItem(p), 300);
              });
              cleanups.push(off);
            }
          }
        }

        function onKey(event) {
          if (M.keys.isTypingTarget(event)) return;
          const p = pages[index];
          if (event.key === 'Escape') {
            quit();
          } else if (/^[1-4]$/.test(event.key)) {
            event.preventDefault();
            const x = p.questions.find((q) => q.chosen == null) || p.questions[p.questions.length - 1];
            choose(x, Number(event.key) - 1);
          } else if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            if (index === pages.length - 1) submit();
            else go(index + 1);
          } else if (event.key === 'ArrowRight') {
            go(index + 1);
          } else if (event.key === 'ArrowLeft') {
            go(index - 1);
          } else if (M.keys.isReplay(event) && p.item.section === 'listening') {
            playItem(p);
          }
        }

        async function quit() {
          if (done) return;
          if (questions.some((x) => x.chosen != null)) {
            const ok = await ui.confirm({
              title: { ko: '시험을 그만할까요?', en: 'Stop the test?' },
              text: 'Your answers so far won’t be scored.',
              ok: { ko: '그만하기', en: 'Stop' },
              cancel: { ko: '계속 풀기', en: 'Keep going' },
            });
            if (!ok || left || done) return;
          }
          show(home);
        }

        async function submit() {
          if (done) return;
          const open = questions.filter((x) => x.chosen == null).map((x) => x.number);
          if (open.length) {
            const ok = await ui.confirm({
              title: { ko: '제출할까요?', en: 'Hand in your answers?' },
              text: `${open.length === 1 ? 'Question' : 'Questions'} ${open.join(', ')} ${open.length === 1 ? 'has' : 'have'} no answer yet, and will count as wrong.`,
              ok: { ko: '제출하기', en: 'Hand in' },
              cancel: { ko: '계속 풀기', en: 'Keep going' },
            });
            if (!ok || left || done) return;
          }
          finish();
        }

        function finish() {
          done = true;
          stopAudio();
          const now = U.now();
          const outcome = M.topik.score(test);
          const happened = { goal: false, levelUp: 0 };
          const offGoal = M.events.on('goal', () => (happened.goal = true));
          const offLevel = M.events.on('levelup', (level) => (happened.levelUp = level));
          for (const x of questions) M.progress.recordAnswer(x.chosen === x.answer, now);
          M.topik.record(test, outcome, now);
          const earned = outcome.correct * M.config.points.topik;
          M.progress.addPoints(earned, now);
          const badges = M.progress.finishRound({ gameId: 'topik', answers: outcome.total, correct: outcome.correct }, now);
          offGoal();
          offLevel();
          show(() => result(test, outcome, { earned, badges, ms: now - test.started, minutes, ...happened }));
        }

        drawNav();
        drawPage();
      }

      /* ---------- The result, and every question again ---------- */

      function result(test, outcome, extras) {
        const k = kindOf(test.kind);
        const level = LEVELS[outcome.level];
        const pages = test.sections.flatMap((s) => s.pages);
        groupPages(pages);
        const mascot = M.mascot.create({ size: 120, mood: 'happy' });
        let reader = null; // the listening item being played in the review
        cleanups.push(() => reader && reader.stop());

        const celebrations = [];
        if (extras.levelUp) celebrations.push(h('div.banner.banner-lilac', '🎉 ', ui.bi(`레벨 ${extras.levelUp} 달성!`, `You reached level ${extras.levelUp}!`)));
        if (extras.goal) celebrations.push(h('div.banner.banner-mint', '🏆 ', ui.bi('오늘의 목표 달성!', 'Daily goal complete!')));
        const badges = extras.badges.map((b) =>
          h('div.badge.earned.pop-in', h('div.badge-emoji', { 'aria-hidden': 'true' }, b.emoji), h('div.badge-name', ui.bi(b.ko, b.en)), h('div.badge-desc', b.desc))
        );

        function playLines(item, root, lines) {
          if (reader) reader.stop();
          let begun = false; // play() first stops whatever was playing
          const mine = newPlayer(item, (i) => {
            if (i >= 0) begun = true;
            else if (!begun) return;
            root.querySelectorAll('[data-line]').forEach((el) => el.classList.toggle('playing', i >= 0 && Number(el.dataset.line) === i));
            if (i < 0 && reader === mine) reader = null;
          });
          reader = mine;
          mine.play(lines ? { lines } : undefined);
        }

        function scriptView(item) {
          const voiced = M.speech.isReady();
          const root = h(
            'ol.topik-script',
            item.script.map((l, i) =>
              h(
                'li',
                { class: `topik-script-line who-${l.who}`, dataset: { line: i } },
                h('span.topik-script-who', { title: WHO[l.who].en }, WHO[l.who].emoji, ' ', h('span', { lang: 'ko' }, WHO[l.who].ko)),
                h(
                  'span.topik-script-text',
                  h('span', { lang: 'ko' }, l.ko),
                  voiced
                    ? h(
                        'button',
                        { type: 'button', class: 'audio-btn small', title: 'Play this line', 'aria-label': 'Play this line', on: { ...M.keys.noMouseFocus, click: () => playLines(item, root, [i]) } },
                        h('span', { 'aria-hidden': 'true' }, '🔊')
                      )
                    : null,
                  h('span.topik-en', l.en)
                )
              )
            )
          );
          return h(
            'div.topik-script-box',
            voiced ? ui.button({ icon: '▶', ko: '다시 듣기', en: 'Hear it again', variant: 'mint', size: 'small', onClick: () => playLines(item, root) }) : null,
            root
          );
        }

        function reviewQuestion(x) {
          return h(
            'div.topik-question.review',
            h('p.topik-q', h('span.topik-q-num', `${x.number}.`), x.q.q ? ui.bi(x.q.q.ko, x.q.q.en) : null),
            x.q.quote ? h('blockquote.topik-quote', h('span', { lang: 'ko' }, x.q.quote.ko), h('span.topik-en', x.q.quote.en)) : null,
            h(
              'ol.topik-review-options',
              x.order.map((k, i) => {
                const o = x.q.options[k];
                const right = i === x.answer;
                const mine = i === x.chosen;
                return h(
                  'li',
                  { class: `${right ? 'right' : ''}${mine && !right ? ' wrong' : ''}`.trim() },
                  h('span.topik-option-num', { 'aria-hidden': 'true' }, CIRCLED[i]),
                  h('span.topik-option-text', h('span', { lang: 'ko' }, optionText(o)), typeof o === 'string' ? null : h('span.topik-en', o.en)),
                  right ? h('span.topik-tag.right', ui.bi(mine ? '정답 ✓' : '정답', mine ? 'yours: right' : 'the answer', 'inline')) : mine ? h('span.topik-tag.wrong', ui.bi('내 답', 'yours', 'inline')) : null
                );
              })
            ),
            x.chosen == null ? h('p.topik-unanswered', ui.bi('답을 안 골랐어요', 'No answer was chosen.')) : null,
            h('p.topik-why', h('span', { 'aria-hidden': 'true' }, '💡 '), x.q.why)
          );
        }

        function reviewItem(p) {
          const item = p.item;
          const right = p.questions.filter((x) => x.chosen === x.answer).length;
          const inst = instruction(item);
          return h(
            'article',
            { class: `card topik-review-item ${right === p.questions.length ? 'all-right' : 'missed'}` },
            h(
              'div.topik-review-top',
              h('span.topik-review-mark', { 'aria-label': right === p.questions.length ? 'right' : 'missed' }, right === p.questions.length ? '✓' : '✗'),
              h('p.topik-instruction', h('span.topik-range', `${SECTIONS[item.section].emoji} ${range(p.questions[0].number, p.questions[p.questions.length - 1].number)}`), ui.bi(richKo(inst.ko), inst.en))
            ),
            item.section === 'listening' ? scriptView(item) : readingBox(item, { en: true }),
            p.questions.map(reviewQuestion)
          );
        }

        const list = h('div.topik-review-list');
        let onlyMissed = false;
        const missed = pages.filter((p) => p.questions.some((x) => x.chosen !== x.answer));
        const toggle = ui.button({
          ko: '틀린 문제만',
          en: `Only the ones I missed (${missed.length})`,
          variant: 'soft',
          size: 'small',
          disabled: !missed.length,
          onClick: () => {
            onlyMissed = !onlyMissed;
            toggle.classList.toggle('active', onlyMissed);
            toggle.setAttribute('aria-pressed', String(onlyMissed));
            drawList();
          },
        });
        toggle.setAttribute('aria-pressed', 'false');
        function drawList() {
          if (reader) reader.stop();
          U.clear(list).append(...(onlyMissed ? missed : pages).map(reviewItem));
        }
        drawList();

        const again = ui.button({ icon: '↻', ko: '새 시험', en: 'A new test', variant: 'primary', size: 'big', disabled: !!lockOf(test.kind), onClick: () => show(() => run(test.kind)) });
        view.append(
          h(
            'div',
            { class: `topik-result tone-${TONES[test.kind]}` },
            h('div.summary-hero', mascot.el, h('div', h('h1', ui.bi('수고했어요!', 'Test handed in!')), h('p.summary-game', `📝 TOPIK I practice · ${k.en}`))),
            h(
              'section.card.topik-score',
              h(
                'div.topik-score-main',
                h('div.topik-score-num', String(outcome.score), h('span.topik-score-max', ` / ${outcome.max}`)),
                h('div', { class: `topik-level level-${outcome.level}` }, `${level.emoji} `, ui.bi(level.ko, level.en, 'inline'))
              ),
              h(
                'div.topik-parts',
                outcome.parts.map((part) =>
                  h(
                    'div.topik-part',
                    h('span.topik-part-name', `${SECTIONS[part.section].emoji} `, ui.bi(SECTIONS[part.section].ko, SECTIONS[part.section].en, 'inline')),
                    h('span.topik-part-score', `${part.score} / 100`),
                    h('span.topik-part-count', `${part.correct} of ${part.total} right`)
                  )
                )
              ),
              h('p.topik-score-note', levelNote(outcome)),
              h(
                'div.topik-score-meta',
                h('span', `⏱ ${clock(extras.ms)}`, h('span.muted', ` (at the real test’s pace: about ${extras.minutes} min)`)),
                h('span', `⭐ +${extras.earned}`)
              )
            ),
            celebrations,
            badges.length ? h('section.summary-badges', h('h3', ui.bi('새 배지!', 'New badge!')), h('div.badge-grid', badges)) : null,
            h(
              'div.summary-actions',
              ui.button({ ko: '홈으로', en: 'Home', variant: 'soft', size: 'big', onClick: () => (location.hash = '#/home') }),
              ui.button({ icon: '📝', ko: '다른 시험', en: 'All tests', variant: 'soft', size: 'big', onClick: () => show(home) }),
              again
            ),
            h(
              'section.topik-review',
              h('div.topik-review-head', h('h2.section-title', ui.bi('문제 다시 보기', 'Go through the questions')), toggle),
              list
            )
          )
        );
        const score = view.querySelector('.topik-score');
        score.tabIndex = -1;
        score.focus({ preventScroll: true });
        M.sfx.play(extras.levelUp ? 'levelup' : 'complete');
        if (outcome.level > 0 || extras.goal || extras.levelUp || badges.length) ui.confetti();
        mascot.react('cheer');
      }

      if (arg && Object.prototype.hasOwnProperty.call(M.topik.KINDS, arg) && !lockOf(arg)) show(() => run(arg));
      else show(home);

      return () => {
        left = true;
        release();
        document.body.classList.remove('playing');
      };
    },
  });
})(window.Mallang);
