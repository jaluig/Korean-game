/**
 * Minigame 4 — 풍선 터뜨리기 · Balloon Pop: Korean words float across the sky
 * as balloons. Type the English meaning to pop one before it reaches the left
 * side. It starts gently and gets faster with every wave; three balloons that
 * get away end the round. Reverse mode shows the English and you type the
 * Korean on the built-in keyboard.
 *
 * Popped words count as practice. A word that gets away is marked tricky and
 * comes back in Word Cards.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const A = M.answers;
  const cfg = () => M.config.session.balloonPop;
  const points = () => M.config.points;

  const TONES = ['pink', 'mint', 'butter', 'sky', 'lilac'];
  // Typing Korean takes longer, so reverse mode is a little slower.
  const REVERSE_SLOWER = 1.35;

  const answersOf = (word, reverse) => (reverse ? [word.ko, ...(word.accept || [])].map((k) => U.noSpaces(U.normalize(k))) : A.englishAnswers(word));
  const typedKey = (text, reverse) => (reverse ? U.noSpaces(U.normalize(text)) : A.clean(text));

  M.games.register({
    id: 'balloon-pop',
    order: 4,
    emoji: '🎈',
    color: 'sky',
    title: { ko: '풍선 터뜨리기', en: 'Balloon Pop' },
    blurb: { ko: '뜻을 입력해서 풍선을 터뜨려요', en: 'Type the meaning to pop it' },

    status(topicId) {
      const min = cfg().minWords;
      const known = M.srs.matchPool(topicId).length;
      if (known < min) {
        const left = min - known;
        return { ready: false, ko: `단어 ${left}개 더 배워요`, en: `Learn ${left} more word${left === 1 ? '' : 's'} to unlock` };
      }
      const best = M.store.state.totals.bestBalloon;
      return { ready: true, ko: best ? `최고 기록 ${best}개` : '몇 개 터뜨릴까요?', en: best ? `Best: ${best} balloons` : 'How many can you pop?' };
    },

    start(host) {
      const c = cfg();
      const pool = M.srs.matchPool(host.topicId);
      if (pool.length < c.minWords) {
        host.empty({
          emoji: '🔒',
          ko: '단어가 더 필요해요',
          en: 'A few more words needed',
          text: `Balloon Pop uses words you have learned. Learn at least ${c.minWords} words in Word Cards to unlock it.`,
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const settings = M.store.state.settings;
      let reverse = settings.balloonMode === 'en';
      const round = { pops: 0, combo: 0, bestCombo: 0, escaped: [], spawned: 0 };
      const balloons = []; // { word, el, progress, travel, top }
      let queue = pool.slice();
      let running = false;
      let over = false;
      let frame = 0;
      let last = 0;
      let lives = c.lives;
      let wave = 1;
      let wavePops = 0;
      let travel = c.travel;
      let spawnEvery = c.spawn;
      let onScreen = c.onScreen;
      let sinceSpawn = 0;
      let cleared = false; // the last wave is done: no new balloons
      const timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));

      /* ---------- Layout ---------- */

      const hearts = h('span.balloon-hearts', { role: 'img', 'aria-label': `${lives} lives left` });
      const waveText = h('span.hud-chip', { title: 'Wave' });
      const popsText = h('b', '0');
      const hud = h('div.balloon-hud', hearts, waveText, h('span.hud-chip', { title: 'Balloons popped' }, '🎈 ', popsText));
      const sky = h('div.balloon-sky', h('div.sky-cloud.c1', { 'aria-hidden': 'true' }), h('div.sky-cloud.c2', { 'aria-hidden': 'true' }), h('div.sky-cloud.c3', { 'aria-hidden': 'true' }), h('div.sky-edge', { 'aria-hidden': 'true' }));
      const answerRow = h('div.balloon-answer');
      const tip = h('p.balloon-tip');
      const area = h('div.ex.ex-balloon', hud, sky, answerRow, tip);
      host.stage.append(area);

      let input = null; // English mode: a text field
      let keyboard = null; // reverse mode: the Korean keyboard
      let typedKeys = []; // reverse mode: the keystrokes typed so far
      let typedEl = null;

      function drawHud() {
        hearts.textContent = '❤️'.repeat(Math.max(0, lives)) + '🤍'.repeat(Math.max(0, c.lives - lives));
        hearts.setAttribute('aria-label', `${lives} lives left`);
        waveText.textContent = `${wave}단계 · Wave ${wave}`;
        popsText.textContent = String(round.pops);
      }
      drawHud();

      /* ---------- Start screen: choose the mode ---------- */

      function modeButton(isReverse, badge, ko, en) {
        return h(
          'button',
          {
            type: 'button',
            class: `balloon-mode ${reverse === isReverse ? 'selected' : ''}`.trim(),
            'aria-pressed': String(reverse === isReverse),
            on: {
              click: () => {
                reverse = isReverse;
                settings.balloonMode = reverse ? 'en' : 'ko';
                M.store.save();
                showIntro();
              },
            },
          },
          h('span.balloon-mode-badge', { 'aria-hidden': 'true' }, badge),
          ui.bi(ko, en)
        );
      }

      let intro = null;
      function showIntro() {
        if (intro) intro.remove();
        const startBtn = ui.button({ icon: '🎈', ko: '시작!', en: 'Start', variant: 'primary', size: 'big', onClick: begin });
        intro = h(
          'div.match-intro.balloon-intro',
          h(
            'div.match-intro-card',
            h('div.big-emoji', { 'aria-hidden': 'true' }, '🎈'),
            h('h2', ui.bi('풍선을 터뜨려요!', 'Pop the balloons!')),
            h(
              'p',
              reverse
                ? 'English words float across the sky. Type them in Korean on the keyboard below (your own keyboard works too: R = ㄱ, K = ㅏ) before they reach the left side.'
                : 'Korean words float across the sky. Type what they mean in English before they reach the left side. Exact answers pop by themselves; Enter also accepts a small typo.'
            ),
            h('div.balloon-modes', { role: 'group', 'aria-label': 'Mode' }, modeButton(false, '가 → A', '한국어 풍선', 'Korean balloons, type English'), modeButton(true, 'A → 가', '영어 풍선', 'English balloons, type Korean')),
            h('p.balloon-rules', `❤️ × ${c.lives} · every ${c.popsPerWave} pops the wind gets stronger · ${c.waves} waves to clear the sky`),
            startBtn
          )
        );
        sky.classList.add('waiting');
        sky.append(intro);
        startBtn.focus({ preventScroll: true });
      }

      // Before the start, Enter starts. During the game (English mode), keys typed
      // while the text field isn't focused are sent to it.
      const stopKeys = M.keys.push((event) => {
        if (!running) {
          if (!over && event.key === 'Enter' && !event.repeat && !M.keys.isControl(event)) {
            event.preventDefault();
            begin();
          }
          return;
        }
        if (reverse || !input || event.target === input) return;
        if (event.key.length === 1 && !event.repeat && !M.keys.isControl(event)) input.focus({ preventScroll: true });
      });
      showIntro();

      /* ---------- Answer input ---------- */

      function buildInput() {
        U.clear(answerRow);
        area.classList.toggle('reverse', reverse);
        if (reverse) {
          typedEl = h('span.type-text', { lang: 'ko' });
          const display = h('div.type-display.balloon-typed', { role: 'textbox', 'aria-readonly': 'true', 'aria-label': 'Your answer' }, typedEl, h('span.caret', { 'aria-hidden': 'true' }));
          keyboard = ui.createKeyboard({
            hints: settings.keyHints,
            onChange: (text, keys) => {
              typedKeys = keys.filter((k) => k !== ' ');
              typedEl.textContent = text;
              display.classList.toggle('empty', !text);
              tryPop(text, { exactOnly: true });
            },
            onEnter: () => submit(keyboard.value()),
          });
          display.classList.add('empty');
          display.dataset.placeholder = '한국어로 써요 · type in Korean';
          answerRow.append(display, keyboard.el);
          tip.textContent = 'Tip: a word pops as soon as it’s spelled right. Enter accepts a one-letter slip.';
        } else {
          input = h('input.balloon-input', {
            type: 'text',
            autocomplete: 'off',
            autocapitalize: 'off',
            spellcheck: false,
            lang: 'en',
            placeholder: 'Type the meaning… (Enter)',
            'aria-label': 'Type the English meaning',
            on: {
              input: () => {
                const hangul = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(input.value);
                tip.textContent = hangul
                  ? '⌨️ Your keyboard is typing Hangul. Switch it to English (the 한/영 key, or Alt + Shift / Win + Space).'
                  : 'Tip: exact answers pop by themselves. Press Enter to accept a small typo.';
                tip.classList.toggle('warn', hangul);
                tryPop(input.value, { exactOnly: true });
              },
              keydown: (event) => {
                if (event.key === 'Enter' && !event.repeat) {
                  event.preventDefault();
                  submit(input.value);
                }
              },
            },
          });
          answerRow.append(input);
          tip.textContent = 'Tip: exact answers pop by themselves. Press Enter to accept a small typo.';
          input.focus({ preventScroll: true });
          sky.addEventListener('mousedown', (event) => {
            event.preventDefault();
            input.focus({ preventScroll: true });
          });
        }
      }

      function clearTyped() {
        if (input) input.value = '';
        if (keyboard) keyboard.clear();
      }

      /* ---------- Balloons ---------- */

      function nextWord() {
        const flying = new Set(balloons.map((b) => b.word.id));
        let i = queue.findIndex((w) => !flying.has(w.id));
        if (i < 0) {
          queue = U.shuffle(pool.filter((w) => !flying.has(w.id)));
          i = queue.length ? 0 : -1;
        }
        return i >= 0 ? queue.splice(i, 1)[0] : null;
      }

      /** How many lanes fit in the sky: balloons two lanes apart must never touch. */
      function laneCount() {
        const body = reverse ? 70 : 80; // balloon height (see css/minigames.css)
        const room = Math.max(0, sky.clientHeight - 124);
        return U.clamp(Math.floor((1.75 * room) / body + 0.75), 1, 4);
      }

      /**
       * Where a new balloon can appear (it enters at the right edge) without
       * touching one that is still near the edge: { lane, topPx } or null.
       */
      function spawnSpot() {
        const lanes = laneCount();
        const height = reverse ? 70 : 80;
        const width = sky.clientWidth;
        for (const lane of U.shuffle(Array.from({ length: lanes }, (_, i) => i))) {
          // Lanes are spread over the sky, leaving room for the balloon and its string.
          const topPx = (sky.clientHeight - 124) * ((lane + U.random() * 0.25) / (lanes - 1 + 0.25)) + 4;
          const blocked = balloons.some((b) => Math.abs(b.topPx - topPx) < height + 8 && (1 - b.progress) * width + b.el.offsetWidth + 24 > width);
          if (!blocked) return { lane, topPx };
        }
        return null;
      }

      function spawn() {
        const spot = spawnSpot();
        const word = spot ? nextWord() : null;
        if (!word) return false;
        const tone = TONES[round.spawned % TONES.length];
        round.spawned++;
        const el = h(
          'div',
          { class: `balloon tone-${tone}`, 'aria-hidden': 'true', style: { top: `${spot.topPx.toFixed(1)}px`, '--bob': `${2 + U.random() * 1.2}s` } },
          h('div.balloon-body', h('span.balloon-text', { lang: reverse ? 'en' : 'ko' }, reverse ? word.en : word.ko)),
          h('div.balloon-knot'),
          h('div.balloon-string')
        );
        sky.append(el);
        U.announce(reverse ? word.en : word.ko); // the balloons themselves are hidden from screen readers
        const factor = reverse ? REVERSE_SLOWER : 1;
        balloons.push({ word, el, topPx: spot.topPx, progress: 0, travel: travel * factor });
        place(balloons[balloons.length - 1]);
        return true;
      }

      function place(b) {
        const x = (1 - b.progress) * sky.clientWidth;
        b.el.style.transform = `translateX(${x.toFixed(1)}px)`;
      }

      function remove(b) {
        const i = balloons.indexOf(b);
        if (i >= 0) balloons.splice(i, 1);
      }

      /** Is what's typed the start of a longer answer on screen? Then wait for more (or Enter). */
      function couldGoOn(key, except) {
        if (reverse) {
          // Hangul passes through other syllables as you type (역 on the way to 여기), so compare keystrokes.
          return balloons.some(
            (b) =>
              b !== except &&
              answersOf(b.word, true).some((a) => {
                const keys = M.hangul.toKeys(a);
                return keys.length > typedKeys.length && typedKeys.every((k, i) => k === keys[i]);
              })
          );
        }
        return balloons.some((b) => b !== except && answersOf(b.word, false).some((a) => a.length > key.length && a.startsWith(key)));
      }

      /** Pop the balloon the text matches (the one nearest the edge first). */
      function tryPop(text, { exactOnly }) {
        if (!running || !text.trim()) return false;
        const key = typedKey(text, reverse);
        const matches = [];
        for (const b of balloons) {
          if (reverse) {
            const answers = answersOf(b.word, true);
            if (answers.includes(key)) matches.push({ b, exact: true });
            else if (!exactOnly && answers.some((a) => M.hangul.spellingDistance(a, key) === 1 && M.hangul.toKeys(a).length >= 4)) matches.push({ b, exact: false });
          } else {
            const m = A.matchEnglish(b.word, text);
            if (m.exact || (!exactOnly && m.ok)) matches.push({ b, exact: m.exact });
          }
        }
        if (!matches.length) return false;
        matches.sort((x, y) => Number(y.exact) - Number(x.exact) || y.b.progress - x.b.progress);
        const { b, exact } = matches[0];
        if (exactOnly && couldGoOn(key, b)) return false;
        pop(b, { almost: !exact });
        return true;
      }

      function submit(text) {
        if (!running) return;
        if (!String(text).trim()) return;
        if (tryPop(text, { exactOnly: false })) return;
        // Nothing matched: a little shake, and the combo resets.
        round.combo = 0;
        host.combo(0);
        M.sfx.play('almost');
        answerRow.classList.remove('nudge');
        void answerRow.offsetWidth;
        answerRow.classList.add('nudge');
      }

      function burst(b, label) {
        const rect = b.el.getBoundingClientRect();
        const box = sky.getBoundingClientRect();
        const x = rect.left - box.left + rect.width / 2;
        const y = rect.top - box.top + 26;
        const bits = h('div.pop-bits', { style: { left: `${x}px`, top: `${y}px` } }, Array.from({ length: 8 }, (_, i) => h('span', { style: { '--a': `${i * 45}deg` } })));
        const reveal = h('div.balloon-reveal', { style: { left: `${x}px`, top: `${y}px` } }, label);
        sky.append(bits, reveal);
        later(() => bits.remove(), 700);
        later(() => reveal.remove(), 1500);
      }

      function pop(b, { almost = false } = {}) {
        remove(b);
        U.announce(`🎈 ${b.word.ko} = ${b.word.en}`);
        M.srs.practice(b.word.id, true);
        M.progress.recordAnswer(true);
        round.pops++;
        round.combo++;
        round.bestCombo = Math.max(round.bestCombo, round.combo);
        let earned = reverse ? points().balloonReverse : points().balloon;
        if (almost) earned = Math.ceil(earned / 2);
        if (round.combo % points().comboEvery === 0) {
          earned += points().comboBonus;
          host.mascot.react('combo');
        }
        host.award(earned, b.el);
        host.combo(round.combo);
        M.sfx.play('balloon');
        burst(b, almost ? `${b.word.ko} ≈ ${b.word.en}` : `${b.word.ko} = ${b.word.en}`);
        b.el.classList.add('popped');
        later(() => b.el.remove(), 350);
        clearTyped();
        if (settings.autoPlayAudio) M.speech.speak(b.word.ko, { quiet: true });
        M.store.save();
        drawHud();
        wavePops++;
        if (wavePops >= c.popsPerWave) nextWave();
      }

      function escape(b) {
        remove(b);
        lives--;
        U.announce(`Missed: ${b.word.ko} = ${b.word.en}. ${Math.max(0, lives)} ${lives === 1 ? 'life' : 'lives'} left.`);
        M.srs.practice(b.word.id, false);
        M.progress.recordAnswer(false);
        if (!round.escaped.includes(b.word.id)) round.escaped.push(b.word.id);
        round.combo = 0;
        host.combo(0);
        M.sfx.play('whoosh');
        host.mascot.react('wrong');
        host.mascot.say(`${b.word.ko} = ${b.word.en}`, null, { duration: 3000 });
        b.el.classList.add('escaped');
        later(() => b.el.remove(), 700);
        sky.classList.remove('ouch');
        void sky.offsetWidth;
        sky.classList.add('ouch');
        M.store.save();
        drawHud();
        if (lives <= 0) end(false);
      }

      function banner(ko, en) {
        const el = h('div.balloon-banner', ui.bi(ko, en));
        sky.append(el);
        later(() => el.remove(), 1800);
      }

      function nextWave() {
        wavePops = 0;
        if (wave >= c.waves) {
          // Sky cleared: the balloons still flying stop at once and pop by themselves.
          cleared = true;
          const left = balloons.splice(0);
          left.forEach((b, i) =>
            later(() => {
              burst(b, '✨');
              b.el.classList.add('popped');
              later(() => b.el.remove(), 350);
            }, i * 120)
          );
          later(() => end(true), 700 + left.length * 120);
          return;
        }
        wave++;
        travel = Math.max(c.minTravel, travel * c.speedUp);
        spawnEvery = Math.max(c.minSpawn, spawnEvery * c.speedUp);
        if (wave % 2 === 1) onScreen = Math.min(c.maxOnScreen, onScreen + 1);
        M.sfx.play('wave');
        banner(`${wave}단계!`, wave >= c.waves ? 'Last wave!' : 'Faster!');
        drawHud();
      }

      /* ---------- Loop ---------- */

      function begin() {
        if (running || over) return;
        intro.remove();
        sky.classList.remove('waiting');
        buildInput();
        window.scrollTo(0, 0);
        running = true;
        last = 0;
        sinceSpawn = spawnEvery * 0.8; // the first balloon comes quickly
        M.sfx.play('pop');
        frame = requestAnimationFrame(tick);
      }

      function tick(time) {
        if (!running) return;
        // A hidden tab doesn't count, and nothing moves while a dialog ("Stop this round?") is open.
        const dt = last && !ui.dialogOpen() ? Math.min(time - last, 100) : 0;
        last = time;
        sinceSpawn += dt * (reverse ? 1 / REVERSE_SLOWER : 1);
        if (!cleared && sinceSpawn >= spawnEvery && balloons.length < onScreen) {
          if (spawn()) sinceSpawn = 0;
        }
        if (!cleared && !balloons.length && sinceSpawn < spawnEvery * 0.6) sinceSpawn = spawnEvery * 0.6; // never an empty sky for long
        for (const b of balloons.slice()) {
          b.progress += dt / b.travel;
          if (b.progress >= 1) escape(b);
          else place(b);
          if (!running) return;
        }
        frame = requestAnimationFrame(tick);
      }

      function end(won) {
        if (over) return;
        over = true;
        running = false;
        cancelAnimationFrame(frame);
        if (keyboard) keyboard.setDisabled(true);
        if (input) input.disabled = true;
        M.progress.best('bestBalloon', round.pops);
        M.progress.bump('balloonsPopped', round.pops);
        if (won) M.progress.bump('skyCleared');
        M.store.save();
        balloons.slice().forEach((b) => b.el.classList.add('escaped'));
        sky.append(h('div.match-over', h('span', won ? ui.bi('하늘이 맑아졌어요!', 'Sky cleared! 🎉') : ui.bi('게임 끝!', 'Game over'))));
        M.sfx.play(won ? 'levelup' : 'complete');
        if (won) ui.confetti({ emojis: ['🎈', '✨', '🌸', '⭐'] });
        later(
          () =>
            host.finish({
              gameId: 'balloon-pop',
              answers: round.pops + round.escaped.length,
              correct: round.pops,
              bestCombo: round.bestCombo,
              learned: [],
              mistakes: round.escaped,
              perfect: false,
              mainStat: { icon: '🎈', value: round.pops, ko: '터뜨린 풍선', en: `balloons popped · wave ${wave}` },
            }),
          1600
        );
      }

      host.onCleanup(() => {
        running = false;
        over = true;
        cancelAnimationFrame(frame);
        timers.forEach(clearTimeout);
        stopKeys();
        if (keyboard) keyboard.destroy();
        M.store.save();
      });
    },
  });
})(window.Mallang);
