/**
 * Minigame 10 — 대화 듣기 · Dialogues: listen to a short conversation (at the
 * café, in a shop, making plans…) with the script hidden, then answer a few
 * questions about it. After each answer you see the line that holds it; at
 * the end, the whole script with translations and a 🔊 for every line.
 * The two speakers sound different: a male and a female Korean voice when the
 * browser has both, otherwise the male speaker a little lower (the female one
 * keeps the natural pitch). Without a Korean voice it becomes reading practice.
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

  // Korean voices with a male name (Edge, Windows) or labelled male (not "female").
  const MALE = /injoon|hyunsu|bongjin|gookmin|minsu|(^|[^a-z])male|남성/i;
  const isMale = (voice) => !!voice && MALE.test(voice.name || '');

  /**
   * Each speaker's voice. The "high" speaker gets a female voice and the "low"
   * one a male voice when the browser has both (starting from the voice chosen
   * in Settings); with a single voice, the low speaker is pitched down a little.
   */
  function voicesFor(dialogue) {
    const main = M.speech.voice();
    const other = (test) => M.speech.voices().find((v) => v !== main && test(v)) || null;
    let high = main;
    let low = main;
    if (isMale(main)) high = other((v) => !isMale(v)) || main;
    else low = other(isMale) || main;
    const shared = high === low;
    const out = {};
    for (const [key, s] of Object.entries(dialogue.speakers)) {
      const voice = s.voice === 'low' ? low : high;
      out[key] = { voice, pitch: shared ? cfg().pitch[s.voice] || 1 : 1 };
      // With Azure voices (Settings): a woman's voice and a man's voice, at their natural pitch (the above is the fallback).
      if (M.azureSpeech && M.azureSpeech.configured()) out[key].azure = M.azureSpeech.voiceFor(s.voice === 'low' ? 'male' : 'female');
    }
    return out;
  }

  /** "Slowly" is always slower than the speed chosen in Settings. */
  const slowRate = () => Math.min(cfg().slowRate, (M.store.state.settings.speechRate || 0.9) * 0.75);

  /** Generous: a line that never reports its end still moves on, without cutting a slow voice short. */
  const safetyMs = (text, rate) => [...text].length * 350 * (0.9 / (rate || 0.9)) + 4000;

  /**
   * Plays a dialogue's lines one after another, with a short pause between
   * speakers. onLine(i) is called as line i starts, and onLine(-1) when the
   * playback ends: finished, stopped, or cut off by other audio.
   * `voices` (speaker → { voice, pitch }) replaces the usual choice (Reading uses one narrator).
   */
  /** onLine(i) as each line starts; onLine(-1) when playback stops, with a second argument `true` when it simply got to the end. */
  function player(dialogue, onLine = () => {}, { voices: chosen } = {}) {
    const voices = chosen || voicesFor(dialogue);
    let token = 0;
    let timer = null;

    function say(i, { rate, onEnd, onCut }) {
      const line = dialogue.lines[i];
      const v = voices[line.who];
      return M.speech.speak(line.ko, {
        quiet: true,
        rate,
        pitch: v.pitch,
        voice: v.voice,
        azure: v.azure,
        onEnd,
        onError: (code) => (code === 'interrupted' || code === 'canceled' ? onCut() : onEnd()),
      });
    }

    function stop() {
      token++;
      clearTimeout(timer);
      M.speech.stop();
      onLine(-1);
    }

    /** lines: the line numbers to play, in order (all of them by default). */
    function play({ lines = dialogue.lines.map((_, i) => i), slow = false } = {}) {
      stop();
      const mine = ++token;
      const rate = slow ? slowRate() : undefined;
      const step = (k) => {
        if (mine !== token) return;
        if (k >= lines.length) {
          onLine(-1, true);
          return;
        }
        const i = lines[k];
        let ended = false;
        const next = () => {
          if (ended || mine !== token) return;
          ended = true;
          clearTimeout(timer);
          timer = setTimeout(() => step(k + 1), cfg().linePause);
        };
        // Other audio took over (a 🔊 button, another player): this playback is over.
        const cut = () => {
          if (ended || mine !== token) return;
          ended = true;
          token++;
          clearTimeout(timer);
          onLine(-1);
        };
        onLine(i);
        if (!say(i, { rate, onEnd: next, onCut: cut })) {
          stop();
          return;
        }
        clearTimeout(timer);
        timer = setTimeout(next, safetyMs(dialogue.lines[i].ko, rate || 0.9));
      };
      step(0);
    }

    return { play, stop, line: (i, slow) => play({ lines: [i], slow }) };
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
      let current = null; // the player of the screen on show
      let left = false; // left the game: nothing may play after that
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
      /** Each screen has its own player; the one before it stops. */
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

      let di = 0;

      function nextDialogue() {
        if (current) current.stop();
        if (di >= list.length) return finish();
        listen(list[di]);
      }

      function screen(...children) {
        release();
        if (M.mic) M.mic.stop(); // a 🎤 still listening on the screen before
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
          root.querySelectorAll('.dlg-line, .rp-line').forEach((el) => el.classList.toggle('playing', Number(el.dataset.line) === i));
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
        // Voices often arrive just after the page loads: wait for them in listening mode.
        const loading = M.speech.status() === 'loading';
        const listening = M.speech.isReady() || loading;
        const state = { read: false, wrong: 0, listening }; // the mode stays the same for the whole dialogue
        const root = h('div.ex.ex-dialogue');
        const play = takeOver(player(dialogue, follow(root, dialogue)));
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
        if (listening && !loading && M.store.state.settings.autoPlayAudio) later(() => current === play && play.play(), 500);
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            ask(dialogue, state, 0);
          } else if (listening && M.keys.isReplay(event)) play.play();
        });
        if (loading) offVoices = M.events.on('speech:status', () => later(() => current === play && listen(dialogue), 0));
        if (!listening) host.mascot.say('읽기 모드예요', 'Reading mode', { duration: 3000 });
      }

      function ask(dialogue, state, k) {
        const q = dialogue.questions[k];
        // No Korean voice after all (it was still loading): read the conversation instead.
        if (state.listening && !M.speech.isReady() && M.speech.status() !== 'loading') state.listening = false;
        const { listening } = state;
        const options = U.shuffle(q.options.map((o, i) => ({ ...o, correct: i === q.answer })));
        const root = h('div.ex.ex-dialogue.ex-dialogue-q');
        const replay = takeOver(player(dialogue, follow(root, dialogue)));
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
        const { listening } = state;
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
        if (listening && M.store.state.settings.autoPlayAudio) later(() => current === play && play.play({ lines }), 300);
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
        showScript(dialogue, state);
      }

      /** On to the next dialogue (once). */
      function proceed(state) {
        if (state.done) return;
        state.done = true;
        di++;
        nextDialogue();
      }

      const nextButton = (state) => {
        const last = di + 1 >= list.length;
        return ui.button({ ko: last ? '끝내기' : '다음 대화', en: last ? 'Finish' : 'Next dialogue', variant: 'primary', size: 'big', onClick: () => proceed(state) });
      };

      /** The whole script with translations; from here, a role-play or the next dialogue. */
      function showScript(dialogue, state) {
        const { listening } = state;
        const root = h('div.ex.ex-dialogue.ex-dialogue-review');
        const play = takeOver(player(dialogue, follow(root, dialogue)));
        const button = nextButton(state);
        const rolePlayButton = listening && canRolePlay() ? ui.button({ icon: '🎭', ko: '역할극', en: 'Role-play', variant: 'soft', size: 'big', onClick: () => chooseRole(dialogue, state) }) : null;
        root.append(
          ui.exTag('대본', 'The whole conversation', '📜'),
          h(
            'div.dlg-card',
            h('div.dlg-title', h('span.dlg-scene', { 'aria-hidden': 'true' }, dialogue.scene || '💬'), ui.bi(dialogue.title.ko, dialogue.title.en)),
            listening ? playControls(play) : null,
            scriptList(dialogue, play, { english: true, audio: listening })
          ),
          rolePlayButton ? h('p.rp-hint', ui.bi('🎭 역할극: 한 사람의 대사를 소리 내어 말해 봐요', '🎭 Role-play: take one part and say its lines out loud')) : null,
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), rolePlayButton, button)
        );
        screen(root);
        button.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            proceed(state);
          } else if (listening && M.keys.isReplay(event)) play.play();
        });
      }

      /* ---------- 🎭 Role-play: take one part; the other is played, you say yours with 🎤 ---------- */

      const canRolePlay = () => M.mic.supported() && M.store.state.settings.speaking;
      const title = (dialogue) => h('div.dlg-title', h('span.dlg-scene', { 'aria-hidden': 'true' }, dialogue.scene || '💬'), ui.bi(dialogue.title.ko, dialogue.title.en));

      function chooseRole(dialogue, state) {
        if (current) current.stop();
        current = null;
        const root = h('div.ex.ex-dialogue.ex-roleplay');
        const parts = Object.entries(dialogue.speakers);
        const pick = parts.map(([key, s], i) => {
          const lines = dialogue.lines.filter((l) => l.who === key).length;
          return h(
            'button.rp-choice',
            { type: 'button', on: { click: () => rolePlay(dialogue, state, key) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.rp-choice-emoji', { 'aria-hidden': 'true' }, s.emoji),
            h('span.rp-choice-name', ui.bi(s.name, s.en)),
            h('span.rp-choice-count', ui.bi(`${lines}줄`, U.plural(lines, 'line')))
          );
        });
        const back = ui.button({ icon: '📜', ko: '대본으로', en: 'Back to the script', variant: 'soft', onClick: () => showScript(dialogue, state) });
        root.append(
          ui.exTag('역할극', 'Role-play', '🎭'),
          h(
            'div.dlg-card',
            title(dialogue),
            h('p.rp-intro', ui.bi('누구의 역할을 할까요?', 'Whose part will you take? You say those lines out loud with 🎤; the other part is played for you.')),
            h('div.rp-choices', pick)
          ),
          h('div.ex-actions', back)
        );
        screen(root);
        window.scrollTo(0, 0); // (coming from the long script)
        pick[0].focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          const n = Number(event.key);
          if (n >= 1 && n <= parts.length && !event.repeat) {
            event.preventDefault();
            rolePlay(dialogue, state, parts[n - 1][0]);
          }
        });
      }

      function rolePlay(dialogue, state, me) {
        const root = h('div.ex.ex-dialogue.ex-roleplay');
        const lit = follow(root, dialogue);
        let waitFor = null; // the other part's line being played; the next line comes when it ends
        let playing = null;
        const play = takeOver(
          player(dialogue, (n, ended) => {
            lit(n);
            if (n >= 0) playing = n;
            else if (ended && waitFor !== null && playing === waitFor) {
              const at = waitFor;
              waitFor = null;
              later(() => current === play && i === at && waitFor === null && advance(), 300);
            }
          })
        );
        /** 🔊 and R: hearing a line again only moves on when it's the other part's current line. */
        const replay = {
          line: (n, slow) => {
            M.mic.stop(); // (it would hear the voice)
            waitFor = n === i && dialogue.lines[n].who !== me ? n : null;
            playing = null;
            play.line(n, slow);
          },
        };
        const chat = h('ol.rp-chat', { 'aria-live': 'polite' });
        const skip = ui.button({ ko: '건너뛰기', en: 'Skip', variant: 'soft', size: 'big', onClick: () => advance() });
        const go = ui.button({ ko: '다음', en: 'Next', variant: 'primary', size: 'big', onClick: () => advance() });
        [skip, go].forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));
        go.hidden = true;
        const you = dialogue.speakers[me];
        root.append(
          ui.exTag('역할극', `Role-play: you are ${you.en}`, '🎭'),
          h('div.dlg-card.dlg-card-small', title(dialogue), cast(dialogue)),
          chat,
          h('div.ex-actions', h('span.key-hint', ui.bi('M 말하기 · 엔터', 'M to speak · Enter ↵')), skip, go)
        );
        screen(root);
        window.scrollTo(0, 0);
        root.querySelector(`.dlg-speaker.who-${me}`).classList.add('rp-me');

        let i = -1;
        let mine = 0;
        let good = 0;
        let mic = null; // the 🎤 of your current line
        const scored = new Set();
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            advance();
          } else if (event.code === 'KeyM' && mic && !event.repeat) {
            event.preventDefault();
            mic.click();
          } else if (M.keys.isReplay(event) && i >= 0) replay.line(i);
        });
        advance();

        function advance() {
          M.mic.stop(); // a 🎤 still listening would hear the next line
          if (waitFor !== null) {
            waitFor = null;
            play.stop();
          }
          i++;
          if (i >= dialogue.lines.length) return result();
          const line = dialogue.lines[i];
          const yours = line.who === me;
          const bubble = h(
            'li',
            { class: `rp-line who-${line.who} ${yours ? 'rp-mine' : 'rp-theirs'}`, dataset: { line: i } },
            speakerTag(dialogue.speakers[line.who]),
            h('div.dlg-line-text', h('span.dlg-line-ko', { lang: 'ko' }, line.ko, lineButton(replay, i)), h('span.dlg-line-en', line.en))
          );
          chat.append(bubble);
          mic = null;
          skip.hidden = false;
          go.hidden = true;
          if (yours) {
            mine++;
            const n = i;
            const say = ui.sayButton(line.ko, { size: 'big', reward: false, onResult: (r) => said(n, line, r) });
            if (say) {
              bubble.append(h('div.rp-say', say));
              mic = say.querySelector('.say-btn');
            }
          } else {
            waitFor = i;
            playing = null;
            play.line(i);
          }
          keepInView();
        }

        /** The new line, its 🎤 and the buttons under it stay in view (on phones they'd drop below the screen). */
        function keepInView() {
          const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          root.querySelector('.ex-actions').scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
        }

        /** A line said well earns points (once a day per line), like the other 🎤 buttons. */
        function said(n, line, { tone }) {
          if (tone !== 'miss' && !scored.has(n)) {
            scored.add(n);
            good++;
            if (M.progress.rewardSpeech(line.ko, U.now(), { points: false })) {
              M.progress.bump('rolePlayGood');
              host.award(points().rolePlay);
            }
            M.store.save();
          }
          if (n === i) {
            skip.hidden = true;
            go.hidden = false;
            keepInView();
          }
        }

        function result() {
          if (current) current.stop();
          current = null;
          const tone = mine && good === mine ? 'great' : good * 2 >= mine ? 'close' : 'miss';
          const [ko, en] = { great: ['완벽해요!', 'You said all your lines well!'], close: ['잘했어요!', 'Nicely done!'], miss: ['다시 해 봐요!', 'Give it another go?'] }[tone];
          const other = Object.keys(dialogue.speakers).find((k) => k !== me);
          const again = ui.button({ icon: '🔁', ko: '다른 역할', en: 'Swap parts', variant: 'soft', onClick: () => rolePlay(dialogue, state, other) });
          const button = nextButton(state);
          const end = h(
            'div.ex.ex-dialogue.ex-roleplay',
            ui.exTag('역할극', 'Role-play', '🎭'),
            h(
              'div.dlg-card',
              title(dialogue),
              h('div.rp-score', h('span.rp-score-num', `${good} / ${mine}`), ui.bi('잘 말한 대사', 'lines said well')),
              h('p.rp-intro', ui.bi(ko, en))
            ),
            h('div.ex-actions', again, button)
          );
          screen(end);
          window.scrollTo(0, 0);
          button.focus({ preventScroll: true });
          host.mascot.say(ko, en, { duration: 3000 });
          stopKeys = M.keys.push((event) => {
            if (event.key === 'Enter' && !M.keys.isControl(event)) {
              event.preventDefault();
              proceed(state);
            }
          });
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

      nextDialogue(); // (last, once every helper above exists)
    },
  });

  M.dialogues = { pickRound, nextLocked, isUnlocked, voicesFor, player };
})(window.Mallang);
