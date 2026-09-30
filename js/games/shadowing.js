/**
 * Minigame 13 — 따라 말하기 · Shadowing: hear a sentence you know and say it
 * straight back, three times, a little faster each time (🐢 → 🚶 → 🐇).
 * Where the browser has speech recognition (Chrome, Edge) and speaking
 * practice is on, the 🎤 opens as soon as the voice stops and says how close
 * you were; elsewhere you say it out loud and tick it off yourself. It needs
 * a Korean voice. The sentences are the topics' sentences whose words you
 * know: the ones you've built in the Sentence Builder and the focus topic's first.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.shadowing;
  const points = () => M.config.points;
  const SPEEDS = [
    { emoji: '🐢', ko: '천천히', en: 'Slow' },
    { emoji: '🚶', ko: '보통', en: 'Normal' },
    { emoji: '🐇', ko: '빠르게', en: 'Fast' },
  ];

  /** The 🎤 checks what you say (Chrome, Edge, with speaking practice on); otherwise you tick it off yourself. */
  const canListen = () => M.mic.supported() && !!M.store.state.settings.speaking;
  /** 🎤 errors that won't go away by trying again: the rest of the round is ticked off by hand. */
  const PERMANENT = ['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported', 'network'];
  const NO_VOICE = 'Shadowing plays each sentence aloud, so it needs a Korean voice. Settings → Sound shows how to add one.';
  const hasVoice = () => ['ready', 'loading'].includes(M.speech.status());
  const isOpen = (s) => s.needs.every(M.srs.isIntroduced);
  const pool = () => M.content.sentences().filter(isOpen);
  let recent = new Set(); // the last round's sentences, so the next round picks others first

  /** The focus topic's sentences first, then the ones you've built, then the ones not said last round. */
  function pickRound(topicId = 'all') {
    const away = (s) => (topicId === 'all' || s.topicId === topicId ? 0 : 1);
    const unbuilt = (s) => (M.srs.stageOf(s.id) >= 1 ? 0 : 1);
    const score = (s) => away(s) * 4 + unbuilt(s) * 2 + (recent.has(s.id) ? 3 : 0) + U.random() * 2;
    return pool()
      .map((s) => ({ s, k: score(s) }))
      .sort((a, b) => a.k - b.k)
      .slice(0, cfg().size)
      .map((x) => x.s);
  }

  /** How close a try was: 'great', 'close' or 'miss' (the same bar as the 🎤 buttons). */
  const tone = (score) => (score >= cfg().great ? 'great' : score >= cfg().close ? 'close' : 'miss');

  /** Generous: a sentence that never reports its end still moves on (Azure's audio may take a while to come). */
  const safetyMs = (text, rate) => [...text].length * 350 * (0.9 / rate) + 4000 + (M.azureSpeech && M.azureSpeech.configured() ? M.config.azureSpeech.timeout : 0);

  M.games.register({
    id: 'shadowing',
    order: 13,
    emoji: '🦜',
    color: 'mint',
    title: { ko: '따라 말하기', en: 'Shadowing' },
    blurb: { ko: '듣고 바로 따라 말해요', en: 'Hear it, say it straight back' },
    needsVoice: true, // (the "every game" badge doesn't ask for it where there's no Korean voice)

    status() {
      if (!hasVoice()) return { ready: false, ko: '한국어 목소리가 필요해요', en: 'Needs a Korean voice' };
      const n = pool().length;
      if (n < cfg().minSentences) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      return { ready: true, ko: `문장 ${n}개`, en: `${U.plural(n, 'sentence')} to say` };
    },

    start(host) {
      if (!hasVoice()) {
        host.empty({
          emoji: '🔇',
          ko: '한국어 목소리가 없어요',
          en: 'No Korean voice here',
          text: NO_VOICE,
          actions: [{ ko: '설정', en: 'Settings', href: '#/settings' }],
        });
        return;
      }
      const list = pickRound(host.topicId);
      if (list.length < cfg().minSentences) {
        host.empty({
          emoji: '🔒',
          ko: '문장이 더 필요해요',
          en: 'A few more sentences needed',
          text: 'Shadowing uses sentences made of words you know. Learn a few more in Word Cards, and build some in the Sentence Builder.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }
      recent = new Set(list.map((s) => s.id));

      const rates = cfg().rates;
      let listening = canListen();
      const total = list.length * rates.length;
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, passes: 0 };
      let left = false;
      let stopKeys = null;
      let offVoices = null;
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
      host.onCleanup(() => {
        left = true;
        release();
        timers.forEach(clearTimeout);
        M.speech.stop();
        M.mic.stop();
      });

      let si = 0;
      let started = false;
      const begin = () => {
        if (started) return;
        started = true;
        release();
        if (!M.speech.isReady()) {
          host.empty({ emoji: '🔇', ko: '한국어 목소리가 없어요', en: 'No Korean voice here', text: NO_VOICE, actions: [{ ko: '설정', en: 'Settings', href: '#/settings' }] });
          return;
        }
        nextSentence();
      };
      if (M.speech.status() === 'loading') {
        // The voices often arrive just after the page loads (if they don't come, the round doesn't start).
        host.stage.append(h('div.ex.ex-shadow', h('p.muted', ui.bi('목소리를 준비하고 있어요…', 'Getting the voice ready…'))));
        offVoices = M.events.on('speech:status', () => M.speech.isReady() && later(begin, 0));
        later(begin, 5000);
      } else begin();

      function nextSentence() {
        if (si >= list.length) return finish();
        shadow(list[si]);
      }

      function shadow(sentence) {
        let pass = 0;
        let token = 0; // one per playback or 🎤: a late "ended" or answer from an older one is ignored
        let stopMic = null;
        let state = 'playing'; // playing | listening | turn (say it, then tick it off) | heard | done
        const results = []; // per pass: 'great' | 'close' | 'self' | 'miss'

        const chips = SPEEDS.slice(0, rates.length).map((s, i) =>
          h('li.shadow-speed', { dataset: { pass: i } }, h('span.shadow-speed-emoji', { 'aria-hidden': 'true' }, s.emoji), ui.bi(s.ko, s.en), h('span.shadow-speed-mark', { 'aria-hidden': 'true' }))
        );
        const status = h('div.shadow-status', { 'aria-live': 'polite' });
        const again = ui.button({ icon: '🔁', ko: '다시 듣기', en: 'Hear it again', variant: 'soft', size: 'small', onClick: () => play() });
        const mic = ui.button({ icon: '🎤', ko: '말하기', en: 'Speak', variant: 'mint', size: 'big', onClick: () => listen() });
        const said = ui.button({ icon: '😊', ko: '말했어요', en: 'I said it', variant: 'mint', size: 'big', onClick: () => tick() });
        const go = ui.button({ ko: '다음', en: 'Next', variant: 'primary', size: 'big', onClick: () => moveOn() });
        [again, mic, said, go].forEach((b) => b.addEventListener('mousedown', M.keys.noMouseFocus.mousedown));
        const hint = h('span.key-hint');
        const root = h(
          'div.ex.ex-shadow',
          ui.exTag('듣고 바로 따라 말해요', 'Hear it, then say it straight back', '🦜'),
          h(
            'div.shadow-card',
            h('div.shadow-count', `${si + 1} / ${list.length}`),
            h('div.shadow-ko', { lang: 'ko' }, sentence.ko),
            h('div.shadow-en', `“${sentence.en}”`),
            h('ol.shadow-speeds', { 'aria-label': 'Speeds' }, chips),
            again
          ),
          status,
          h('div.ex-actions', hint, mic, said, go)
        );
        release();
        M.mic.stop();
        U.clear(host.stage);
        host.setProgress(round.passes, total);
        host.stage.append(root);
        window.scrollTo(0, 0);
        stopKeys = M.keys.push((event) => {
          if (event.repeat) return;
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            if (state === 'turn') tick();
            else if (['heard', 'error', 'done', 'listening'].includes(state)) moveOn();
          } else if (M.keys.isReplay(event) && state !== 'playing') {
            if (state === 'done') M.speech.speak(sentence.ko, { rate: rates[pass] }); // (just hear it: the speeds are done)
            else play();
          }
          else if (event.code === 'KeyM' && listening && state !== 'playing' && state !== 'listening' && state !== 'done') {
            event.preventDefault();
            listen();
          }
        });
        play();

        /** What the screen offers in each state. */
        function show(next, { ko = '', en = '', cls = '' } = {}) {
          state = next;
          status.className = `shadow-status ${cls}`.trim();
          U.clear(status).append(ko || en ? ui.bi(ko, en) : '');
          chips.forEach((c, i) => {
            c.classList.toggle('now', i === pass && state !== 'done');
            c.classList.toggle('ok', ['great', 'close', 'self'].includes(results[i]));
            c.classList.toggle('miss', results[i] === 'miss');
            c.querySelector('.shadow-speed-mark').textContent = results[i] === 'miss' ? '✗' : results[i] ? '✓' : '';
          });
          root.classList.toggle('is-listening', state === 'listening');
          again.hidden = state === 'playing' || state === 'done';
          mic.hidden = !listening || !['heard', 'error'].includes(state);
          said.hidden = state !== 'turn';
          go.hidden = !['heard', 'error', 'done', 'listening'].includes(state);
          const nextLabel = state === 'done' ? (si + 1 < list.length ? ['다음 문장', 'Next sentence'] : ['끝', 'Finish']) : state === 'listening' ? ['건너뛰기', 'Skip'] : ['다음', 'Next'];
          U.clear(go).append(ui.bi(...nextLabel));
          go.className = `btn ${state === 'listening' ? 'btn-soft' : 'btn-primary'} btn-big`;
          // Only the keys that do something now.
          const keys = state === 'playing' ? [] : [['R 다시 듣기', 'R to hear it again']];
          if (!mic.hidden) keys.push(['M 말하기', 'M to speak']);
          if (state === 'turn') keys.push(['엔터', 'Enter when you’ve said it']);
          else if (state !== 'playing') keys.push(['엔터', 'Enter ↵']);
          U.clear(hint).append(keys.length ? ui.bi(keys.map((k) => k[0]).join(' · '), keys.map((k) => k[1]).join(' · ')) : '');
          if (!go.hidden && (state === 'heard' || state === 'done')) go.focus({ preventScroll: true });
          else if (!said.hidden) said.focus({ preventScroll: true });
        }

        /** Play the sentence at this pass's speed; your turn comes as soon as it ends. */
        function play() {
          if (stopMic) stopMic();
          stopMic = null;
          M.mic.stop();
          const mine = ++token;
          const rate = rates[pass];
          show('playing', { ko: `${SPEEDS[pass].emoji} 잘 들어 보세요`, en: `${SPEEDS[pass].en}: listen…`, cls: 'playing' });
          let ended = false;
          const yourTurn = () => {
            if (ended || mine !== token || left) return;
            ended = true;
            later(() => mine === token && (listening ? listen() : show('turn', { ko: '지금 따라 말해요!', en: 'Now say it out loud!', cls: 'turn' })), listening ? cfg().listenGap : 0);
          };
          const spoke = M.speech.speak(sentence.ko, { rate, onEnd: yourTurn, onError: (code) => (code === 'interrupted' || code === 'canceled' ? null : yourTurn()) });
          if (!spoke) {
            show('error', { ko: '소리를 낼 수 없어요', en: 'The voice couldn’t play. Check Settings → Sound.', cls: 'miss' });
            return;
          }
          later(yourTurn, safetyMs(sentence.ko, rate));
        }

        /** The 🎤: listen once, right after the voice. */
        function listen() {
          M.speech.stop();
          const mine = ++token; // (a late "ended" from the voice mustn't start another turn)
          const current = () => mine === token && !left && root.isConnected;
          show('listening', { ko: '🎤 지금 말해요!', en: 'Your turn: say it now', cls: 'listening' });
          let answered = false;
          stopMic = M.mic.listen({
            onResult: (alternatives) => {
              if (!current()) return;
              answered = true;
              // Recognition often writes numbers in digits (2잔): compare them read aloud too (두 잔).
              judge(M.mic.best(sentence.ko, alternatives.flatMap((a) => [a, M.numbers.readAloud(a)])));
            },
            onError: (code) => {
              if (!current()) return;
              answered = true;
              const why = ui.sayError ? ui.sayError(code) : 'I couldn’t listen just now.';
              if (PERMANENT.includes(code)) {
                listening = false; // for the rest of the round: say it, then tick it off
                show('turn', { ko: '지금 따라 말해요!', en: `${why} Say it out loud, then press 😊.`, cls: 'turn' });
              } else show('error', { ko: '다시 해 봐요', en: why, cls: 'miss' });
            },
            onEnd: () => {
              if (mine !== token) return;
              stopMic = null;
              if (!answered && state === 'listening' && root.isConnected) show('error', { ko: '다시 해 봐요', en: 'Press 🎤 and say it again.', cls: 'miss' });
            },
          });
        }

        /** A try with the 🎤. A speed that already went well can be tried again, but it scores only once (the better result stays). */
        function judge({ heard, score }) {
          if (state !== 'listening') return;
          const t = tone(score);
          const already = results[pass] === 'great' || results[pass] === 'close';
          if (t === 'miss') {
            if (!already) {
              round.answers++;
              round.combo = 0;
              results[pass] = 'miss';
              host.react({ correct: false }, 0);
            } else M.sfx.play('almost');
            show('heard', { ko: '🔁 다시 해 봐요', en: `I heard “${heard}”. Hear it again (R) or try once more (M).`, cls: 'miss' });
            return;
          }
          if (!already) {
            round.answers++;
            scored(points().shadow);
            if (M.progress.rewardSpeech(sentence.ko, U.now(), { points: false })) M.store.save();
          } else M.sfx.play('correct');
          if (!already || t === 'great') results[pass] = t;
          show('heard', { ko: t === 'great' ? '👏 완벽해요!' : '👍 거의 맞아요!', en: `I heard “${heard}”`, cls: t });
          const mine = token;
          later(() => mine === token && state === 'heard' && moveOn(), 1100);
        }

        /** No speech recognition: you said it, so on to the next speed. */
        function tick() {
          if (state !== 'turn') return;
          round.answers++;
          results[pass] = 'self';
          scored(points().shadowSelf);
          moveOn();
        }

        function scored(earned) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('shadowGood');
          host.award(earned);
          host.react({ correct: true }, round.combo); // (with its sound)
          M.store.save();
        }

        /** The next speed, or the next sentence. */
        function moveOn() {
          token++; // whatever was still playing or listening no longer counts
          if (stopMic) stopMic();
          stopMic = null;
          if (state === 'done') {
            si++;
            nextSentence();
            return;
          }
          round.passes++;
          host.setProgress(round.passes, total);
          if (pass + 1 < rates.length) {
            pass++;
            play();
            return;
          }
          const good = results.filter((r) => r && r !== 'miss').length;
          const [ko, en] = good === rates.length ? ['완벽해요!', 'All three speeds!'] : good ? ['잘했어요!', 'Nicely done!'] : ['다음에 또 해 봐요!', 'Try it again next time!'];
          host.mascot.say(ko, en, { duration: 2500 });
          show('done', { ko: `${good} / ${rates.length} ${ko}`, en, cls: good === rates.length ? 'great' : good ? 'close' : 'miss' });
        }
      }

      function finish() {
        release();
        host.finish({
          gameId: 'shadowing',
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

  M.shadowing = { pickRound, pool, tone, canListen };
})(window.Mallang);
