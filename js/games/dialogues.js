/**
 * Minigame 10 — 대화 듣기 · Dialogues: listen to a short conversation (at the
 * café, in a shop, making plans…) with the script hidden, then answer a few
 * questions about it. After each answer you see the line that holds it; at
 * the end, the whole script with translations and a 🔊 for every line.
 * The two speakers sound different: another pitch, or another Korean voice
 * when the browser has two. Without a Korean voice it becomes reading practice.
 *
 * Every dialogue has its own spaced-repetition record ('dialogue:<id>') and
 * opens once you know its key words. The dialogues live in content/dialogues.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.dialogues;
  const points = () => M.config.points;

  const isUnlocked = (d) => d.needs.every(M.srs.isIntroduced);
  const missingWords = (d) => d.needs.filter((id) => !M.srs.isIntroduced(id));
  const topicOrder = (d) => M.content.topic(d.topic)?.order ?? 99;
  const byCurriculum = (a, b) => a.level - b.level || topicOrder(a) - topicOrder(b) || a.index - b.index;

  /** Due dialogues first, then new ones (easiest first), then the least grown; the focus topic's first in each group. */
  function pickRound(topicId = 'all', now = U.now()) {
    const open = M.content.dialogues().filter(isUnlocked);
    const away = (d) => (topicId === 'all' || d.topic === topicId ? 0 : 1);
    const due = open.filter((d) => M.srs.isDue(d.id, now)).sort((a, b) => away(a) - away(b) || M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open.filter((d) => M.srs.stageOf(d.id) === 0).sort((a, b) => away(a) - away(b) || byCurriculum(a, b));
    const rest = U.shuffle(open.filter((d) => !due.includes(d) && !fresh.includes(d))).sort((a, b) => away(a) - away(b) || M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().perRound);
  }

  /** The locked dialogue closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = M.content.dialogues().filter((d) => !isUnlocked(d));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || byCurriculum(a, b));
    return locked[0] || null;
  }

  /* ---------- Voices ---------- */

  const MALE = /injoon|hyunsu|bongjin|gookmin|male|남성/i;

  /**
   * Each speaker's voice: the "low" speaker gets a second Korean voice when
   * there is one (a male one if possible); otherwise the pitch tells them apart.
   */
  function voicesFor(dialogue) {
    const main = M.speech.voice();
    const others = M.speech.voices().filter((v) => v !== main);
    const second = others.find((v) => MALE.test(v.name || '')) || others[0] || null;
    const out = {};
    for (const [key, s] of Object.entries(dialogue.speakers)) {
      const own = s.voice === 'low' && second;
      out[key] = own ? { voice: second, pitch: 1 } : { voice: main, pitch: cfg().pitch[s.voice] || 1 };
    }
    return out;
  }

  /** Generous: a line that never reports its end still moves on, without cutting a slow voice short. */
  const safetyMs = (text, rate) => [...text].length * 350 * (0.9 / (rate || 0.9)) + 4000;

  /**
   * Plays a dialogue line by line with a short pause between speakers.
   * onLine(i) is called as line i starts, and onLine(-1) when playback ends.
   */
  function player(dialogue, onLine = () => {}) {
    const voices = voicesFor(dialogue);
    let token = 0;
    let timer = null;

    function say(i, { slow = false, onEnd } = {}) {
      const line = dialogue.lines[i];
      const v = voices[line.who];
      const rate = slow ? cfg().slowRate : undefined;
      return M.speech.speak(line.ko, {
        quiet: true,
        rate,
        pitch: v.pitch,
        voice: v.voice,
        onEnd,
        onError: (code) => code !== 'interrupted' && code !== 'canceled' && onEnd && onEnd(),
      });
    }

    function stop() {
      token++;
      clearTimeout(timer);
      M.speech.stop();
      onLine(-1);
    }

    function play({ from = 0, to = dialogue.lines.length - 1, slow = false } = {}) {
      stop();
      const mine = ++token;
      const step = (i) => {
        if (mine !== token) return;
        if (i > to) {
          onLine(-1);
          return;
        }
        let ended = false;
        const next = () => {
          if (ended || mine !== token) return;
          ended = true;
          clearTimeout(timer);
          timer = setTimeout(() => step(i + 1), cfg().linePause);
        };
        onLine(i);
        if (!say(i, { slow, onEnd: next })) {
          stop();
          return;
        }
        clearTimeout(timer);
        timer = setTimeout(next, safetyMs(dialogue.lines[i].ko, slow ? cfg().slowRate : 0.9));
      };
      step(from);
    }

    return { play, stop, line: (i, slow) => play({ from: i, to: i, slow }) };
  }

  /** A 🔊 button for one line, in its speaker's voice. */
  function lineButton(play, i, { slow = false } = {}) {
    const name = slow ? 'Play this line slowly' : 'Play this line';
    return h(
      'button',
      { type: 'button', class: `audio-btn small ${slow ? 'slow' : ''}`.trim(), title: name, 'aria-label': name, on: { mousedown: (e) => e.preventDefault(), click: () => play.line(i, slow) } },
      h('span', { 'aria-hidden': 'true' }, slow ? '🐢' : '🔊')
    );
  }

  const speakerTag = (s) => h('span.dlg-who', h('span.dlg-who-emoji', { 'aria-hidden': 'true' }, s.emoji), h('span.dlg-who-name', { lang: 'ko' }, s.name));

  /** Script lines; `english` adds the translation under each one. */
  function scriptList(dialogue, play, { english = false, audio = true } = {}) {
    return h(
      'ol.dlg-script',
      dialogue.lines.map((line, i) =>
        h(
          'li',
          { class: `dlg-line who-${line.who}`, dataset: { line: i } },
          speakerTag(dialogue.speakers[line.who]),
          h(
            'div.dlg-line-text',
            h('span.dlg-line-ko', { lang: 'ko' }, line.ko, audio ? lineButton(play, i) : null),
            english ? h('span.dlg-line-en', line.en) : null
          )
        )
      )
    );
  }

  M.games.register({
    id: 'dialogues',
    order: 10,
    emoji: '🎧',
    color: 'lilac',
    title: { ko: '대화 듣기', en: 'Dialogues' },
    blurb: { ko: '짧은 대화를 듣고 질문에 답해요', en: 'Listen, then answer questions' },

    status() {
      const all = M.content.dialogues();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      if (!M.speech.isReady() && M.speech.status() !== 'loading') return { ready: true, ko: '읽기 모드', en: 'Reading mode (no Korean voice)' };
      const due = open.filter((d) => M.srs.isDue(d.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'dialogue')} to hear again` };
      const fresh = open.filter((d) => M.srs.stageOf(d.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 대화 ${fresh}개`, en: U.plural(fresh, 'new dialogue') };
      return { ready: true, ko: `대화 ${open.length}개`, en: `${U.plural(open.length, 'dialogue')} to replay` };
    },

    start(host) {
      const list = pickRound(host.topicId);
      if (!list.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '대화가 아직 잠겨 있어요',
          en: 'The dialogues are still locked',
          text: words.length
            ? `Each dialogue opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each dialogue opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const total = list.reduce((n, d) => n + d.questions.length, 0);
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      let current = null; // the dialogue's player, stopped on cleanup
      let stopKeys = null;
      const release = () => {
        if (stopKeys) stopKeys();
        stopKeys = null;
      };
      host.onCleanup(() => {
        release();
        if (current) current.stop();
      });

      let di = 0;
      nextDialogue();

      function nextDialogue() {
        if (current) current.stop();
        if (di >= list.length) return finish();
        listen(list[di]);
      }

      function screen(...children) {
        release();
        U.clear(host.stage);
        host.setProgress(round.answers, total);
        host.stage.append(...children);
      }

      /** The two speakers; the one talking bounces with a speech bubble. */
      function cast(dialogue) {
        return h(
          'div.dlg-cast',
          Object.entries(dialogue.speakers).map(([key, s]) =>
            h(
              'div',
              { class: `dlg-speaker who-${key}`, dataset: { who: key } },
              h('span.dlg-bubble', { 'aria-hidden': 'true' }, '💬'),
              h('span.dlg-speaker-emoji', { 'aria-hidden': 'true' }, s.emoji),
              h('span.dlg-speaker-name', ui.bi(s.name, s.en))
            )
          )
        );
      }

      /** Highlights the speaker (and the script line, when shown) of the line being played. */
      function follow(root, dialogue) {
        return (i) => {
          const who = i >= 0 ? dialogue.lines[i].who : null;
          root.querySelectorAll('.dlg-speaker').forEach((el) => el.classList.toggle('speaking', el.dataset.who === who));
          root.querySelectorAll('.dlg-line').forEach((el) => el.classList.toggle('playing', Number(el.dataset.line) === i));
          root.classList.toggle('is-playing', i >= 0);
        };
      }

      /** Play / slowly / stop. Clicking them doesn't take the focus, so Enter keeps meaning "go on". */
      function playControls(play) {
        const buttons = [
          ui.button({ icon: '▶', ko: '듣기', en: 'Play', variant: 'mint', onClick: () => play.play() }),
          ui.button({ icon: '🐢', ko: '천천히', en: 'Slowly', variant: 'soft', onClick: () => play.play({ slow: true }) }),
          ui.button({ icon: '⏹', ko: '멈추기', en: 'Stop', variant: 'soft', cls: 'dlg-stop', onClick: () => play.stop() }),
        ];
        buttons.forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));
        return h('div.dlg-controls', buttons);
      }

      function listen(dialogue) {
        const listening = M.speech.isReady();
        const state = { read: false, wrong: 0 };
        const root = h('div.ex.ex-dialogue');
        const play = player(dialogue, (i) => follow(root, dialogue)(i));
        current = play;
        // Reading the script first is allowed, but the answers then count for fewer points.
        const scriptBox = h('div.dlg-script-box', { hidden: listening }, scriptList(dialogue, play, { audio: listening }));
        const showScript = listening
          ? h(
              'button.btn.btn-soft.btn-small.dlg-show-script',
              { type: 'button', on: { click: () => reveal() } },
              h('span.btn-icon', { 'aria-hidden': 'true' }, '📜'),
              ui.bi('대본 보기', 'Show the script (fewer points)')
            )
          : null;
        function reveal() {
          if (!scriptBox.hidden) return;
          state.read = true;
          scriptBox.hidden = false;
          showScript.remove();
        }
        const go = ui.button({ ko: '질문으로', en: 'To the questions', variant: 'primary', size: 'big', onClick: () => ask(dialogue, state, 0) });
        root.append(
          listening ? ui.exTag('잘 들어 보세요', 'Listen to the conversation', '🎧') : ui.exTag('대화를 읽어 보세요', 'Read the conversation', '📖'),
          h(
            'div.dlg-card',
            h('div.dlg-title', h('span.dlg-scene', { 'aria-hidden': 'true' }, dialogue.scene || '💬'), ui.bi(dialogue.title.ko, dialogue.title.en)),
            cast(dialogue),
            listening ? playControls(play) : h('p.muted', ui.bi('소리가 없어서 읽기 모드예요', 'No Korean voice here, so read the conversation instead.')),
            showScript,
            scriptBox
          ),
          h('div.ex-actions', h('span.key-hint', ui.bi('R 다시 듣기 · 엔터', listening ? 'R to replay · Enter ↵' : 'Enter ↵')), go)
        );
        screen(root);
        go.focus({ preventScroll: true });
        if (listening && M.store.state.settings.autoPlayAudio) setTimeout(() => current === play && play.play(), 500);
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            ask(dialogue, state, 0);
          } else if (listening && M.keys.isReplay(event)) play.play();
        });
        if (!listening) host.mascot.say('읽기 모드예요', 'Reading mode', { duration: 3000 });
      }

      function ask(dialogue, state, k) {
        const play = current;
        play.stop();
        const q = dialogue.questions[k];
        const listening = M.speech.isReady();
        const options = U.shuffle(q.options.map((o, i) => ({ ...o, correct: i === q.answer })));
        const root = h('div.ex.ex-dialogue.ex-dialogue-q');
        const follower = follow(root, dialogue);
        const replay = player(dialogue, follower);
        current = replay;
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
          ui.exTag(`질문 ${k + 1}/${dialogue.questions.length}`, `Question ${k + 1} of ${dialogue.questions.length}`, '❓'),
          h(
            'div.dlg-card.dlg-card-small',
            h('div.dlg-title', h('span.dlg-scene', { 'aria-hidden': 'true' }, dialogue.scene || '💬'), ui.bi(dialogue.title.ko, dialogue.title.en)),
            cast(dialogue),
            listening ? playControls(replay) : null,
            // The script, once read: folded away on phones so the question stays in view.
            state.read || !listening
              ? h(
                  'details.dlg-script-box',
                  { open: !(window.matchMedia && matchMedia('(max-width: 600px)').matches) },
                  h('summary', ui.bi('대본', 'Script')),
                  scriptList(dialogue, replay, { audio: listening })
                )
              : null
          ),
          h('h3.dlg-question', { lang: 'ko' }, ui.bi(q.q.ko, q.q.en)),
          h('div.options.dlg-options', { role: 'group', 'aria-label': 'Answers' }, buttons)
        );
        screen(root);
        stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= options.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (listening && M.keys.isReplay(event)) replay.play();
        });

        function choose(i) {
          if (locked) return;
          locked = true;
          release();
          replay.stop();
          const picked = options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[options.findIndex((o) => o.correct)].classList.add('correct');
          onAnswer(dialogue, state, k, picked, options.find((o) => o.correct), replay);
        }
      }

      function onAnswer(dialogue, state, k, picked, right, play) {
        const q = dialogue.questions[k];
        const correct = picked.correct;
        const listening = M.speech.isReady();
        M.progress.recordAnswer(correct);
        M.progress.skill('dialogue', correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = state.read ? points().dialogueRead : points().dialogue;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('dialoguesCorrect');
        } else {
          round.combo = 0;
          state.wrong++;
        }
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        const lines = [].concat(q.line);
        if (listening && M.store.state.settings.autoPlayAudio) setTimeout(() => current === play && play.play({ from: lines[0], to: lines[lines.length - 1] }), 300);
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', text)) : null);
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), h('span.fb-ko', { lang: 'ko' }, right.ko), h('span.fb-en', `= ${right.en}`)),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, picked.ko), h('span.fb-en', ` = ${picked.en}`)),
          h(
            'ol.dlg-script.dlg-script-fb',
            lines.map((i) => {
              const line = dialogue.lines[i];
              return h(
                'li.dlg-line',
                speakerTag(dialogue.speakers[line.who]),
                h('div.dlg-line-text', h('span.dlg-line-ko', { lang: 'ko' }, line.ko, listening ? lineButton(play, i) : null), h('span.dlg-line-en', line.en))
              );
            })
          ),
          tip(q.why),
        ];
        host.showFeedback({
          tone: correct ? 'good' : 'bad',
          points: earned,
          content: content.filter(Boolean),
          speak: null,
          onContinue: () => {
            if (k + 1 < dialogue.questions.length) ask(dialogue, state, k + 1);
            else review(dialogue, state);
          },
        });
      }

      /** Grade the dialogue, then show the whole script with translations. */
      function review(dialogue, state) {
        const n = dialogue.questions.length;
        const grade = state.wrong === 0 ? (state.read ? 'hard' : 'good') : state.wrong * 2 >= n ? 'again' : 'hard';
        M.srs.review(dialogue.id, grade);
        M.progress.bump('dialoguesHeard');
        M.store.save();

        const listening = M.speech.isReady();
        const root = h('div.ex.ex-dialogue.ex-dialogue-review');
        const play = player(dialogue, (i) => follow(root, dialogue)(i));
        current = play;
        const last = di + 1 >= list.length;
        const button = ui.button({ ko: last ? '끝내기' : '다음 대화', en: last ? 'Finish' : 'Next dialogue', variant: 'primary', size: 'big', onClick: done });
        root.append(
          ui.exTag('대본', 'The whole conversation', '📜'),
          h(
            'div.dlg-card',
            h('div.dlg-title', h('span.dlg-scene', { 'aria-hidden': 'true' }, dialogue.scene || '💬'), ui.bi(dialogue.title.ko, dialogue.title.en)),
            listening ? playControls(play) : null,
            scriptList(dialogue, play, { english: true, audio: listening })
          ),
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
        );
        screen(root);
        button.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          } else if (listening && M.keys.isReplay(event)) play.play();
        });
        let finished = false;
        function done() {
          if (finished) return;
          finished = true;
          di++;
          nextDialogue();
        }
      }

      function finish() {
        release();
        host.finish({
          gameId: 'dialogues',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }
    },
  });

  M.dialogues = { pickRound, nextLocked, isUnlocked, voicesFor, player };
})(window.Mallang);
