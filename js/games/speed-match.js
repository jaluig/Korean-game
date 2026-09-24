/**
 * Minigame 3 — 번개 짝꿍 · Speed Match: match Korean words to their meanings
 * against the clock. Quick-fire recall builds speed; tricky and due words show
 * up first, and any word you mismatch is sent back to Word Cards for review.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const points = () => M.config.points;

  M.games.register({
    id: 'speed-match',
    order: 3,
    emoji: '⚡️',
    color: 'butter',
    title: { ko: '번개 짝꿍', en: 'Speed Match' },
    blurb: { ko: '60초 짝 맞추기', en: '60-second matching' },

    status(topicId) {
      const min = M.config.session.speedMatch.minWords;
      const known = M.srs.matchPool(topicId).length;
      if (known < min) {
        const left = min - known;
        return { ready: false, ko: `단어 ${left}개 더 배워요`, en: `Learn ${left} more word${left === 1 ? '' : 's'} to unlock` };
      }
      const best = M.store.state.totals.bestMatch;
      return { ready: true, ko: best ? `최고 기록 ${best}` : '도전해 보세요!', en: best ? `Best: ${best} matches` : 'Beat the clock' };
    },

    start(host) {
      const cfg = M.config.session.speedMatch;
      const pool = M.srs.matchPool(host.topicId);
      if (pool.length < cfg.minWords) {
        host.empty({
          emoji: '🔒',
          ko: '단어가 더 필요해요',
          en: 'A few more words needed',
          text: `Speed Match uses words you have learned. Learn at least ${cfg.minWords} words in Word Cards to unlock it.`,
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const total = cfg.seconds * 1000;
      const size = Math.min(cfg.pairsOnBoard, pool.length);
      const left = Array(size).fill(null); // word ids of the Korean column
      const right = Array(size).fill(null); // word ids of the English column
      const busy = new Set();
      const round = { matches: 0, misses: 0, combo: 0, bestCombo: 0, mistakes: new Set() };
      let queue = pool.slice(); // urgent words first, then everything else
      let selected = null; // { side, index }
      let running = false;
      let remaining = total;
      let lastFrame = 0;
      let frame = 0;
      let endTimer = 0;

      /** The next word to bring onto the board — never one already there, and not the one just matched. */
      const nextWord = (justMatched) => {
        const onBoard = new Set(left.filter(Boolean));
        const fits = (w) => !onBoard.has(w.id) && w.id !== justMatched;
        let i = queue.findIndex(fits);
        if (i < 0) {
          queue = U.shuffle(pool.filter(fits));
          i = queue.length ? 0 : -1;
        }
        return i >= 0 ? queue.splice(i, 1)[0] : M.content.word(justMatched);
      };

      /* ---------- Layout ---------- */

      const timerFill = h('div.timer-fill');
      const timeText = h('span.timer-text', String(cfg.seconds));
      const timer = h('div.timer', { role: 'timer', 'aria-label': 'Time left' }, h('span', { 'aria-hidden': 'true' }, '⏱'), h('div.timer-track', timerFill), timeText);
      const matchesText = h('b', '0');
      const comboText = h('b', '0');
      const hud = h(
        'div.match-hud',
        timer,
        h('span.hud-chip', { title: 'Matches' }, '✔ ', matchesText),
        h('span.hud-chip.combo', { title: 'Combo' }, '🔥 ', comboText)
      );

      const makeTile = (side, index) =>
        h('button', { type: 'button', class: `match-tile ${side}`, lang: side === 'left' ? 'ko' : 'en', on: { click: () => pick(side, index) } });
      const leftBtns = left.map((_, i) => makeTile('left', i));
      const rightBtns = right.map((_, i) => makeTile('right', i));
      const board = h('div.match-board', h('div.match-col', leftBtns), h('div.match-col', rightBtns));

      const startBtn = ui.button({ icon: '⚡️', ko: '시작!', en: 'Start', variant: 'primary', size: 'big', onClick: begin });
      const intro = h(
        'div.match-intro',
        h('div.match-intro-card',
          h('div.big-emoji', { 'aria-hidden': 'true' }, '⚡️'),
          h('h2', ui.bi('준비됐어요?', 'Ready?')),
          h('p', `Match each Korean word with its meaning. You have ${cfg.seconds} seconds — every 5 in a row earns a bonus!`),
          startBtn)
      );

      host.stage.append(h('div.ex.ex-match', hud, h('div.match-area', board, intro)));
      startBtn.focus();
      const stopKeys = M.keys.push((event) => {
        if (!running && event.key === 'Enter' && !event.repeat) {
          event.preventDefault();
          begin();
        }
      });
      host.onCleanup(() => {
        running = false;
        cancelAnimationFrame(frame);
        clearTimeout(endTimer);
        stopKeys();
        M.store.save();
      });

      function fillBoard() {
        const words = Array.from({ length: size }, () => nextWord());
        U.shuffle(words).forEach((w, i) => (left[i] = w.id));
        U.shuffle(words).forEach((w, i) => (right[i] = w.id));
        left.forEach((_, i) => drawTile('left', i));
        right.forEach((_, i) => drawTile('right', i));
      }

      function drawTile(side, index) {
        const id = (side === 'left' ? left : right)[index];
        const word = M.content.word(id);
        const btn = (side === 'left' ? leftBtns : rightBtns)[index];
        btn.textContent = side === 'left' ? word.ko : word.en;
        btn.className = `match-tile ${side} enter`;
      }

      function begin() {
        if (running) return;
        stopKeys();
        intro.remove();
        fillBoard();
        running = true;
        lastFrame = 0;
        frame = requestAnimationFrame(tick);
        M.sfx.play('pop');
      }

      function tick(time) {
        if (!running) return;
        if (lastFrame) remaining -= Math.min(time - lastFrame, 100); // a hidden tab doesn't eat your time
        lastFrame = time;
        timerFill.style.width = `${Math.max(0, remaining / total) * 100}%`;
        timeText.textContent = String(Math.max(0, Math.ceil(remaining / 1000)));
        timer.classList.toggle('hurry', remaining <= 10000);
        if (remaining <= 0) return end();
        frame = requestAnimationFrame(tick);
      }

      function pick(side, index) {
        if (!running || busy.has(`${side}${index}`)) return;
        if (!selected || selected.side === side) {
          if (selected) (selected.side === 'left' ? leftBtns : rightBtns)[selected.index].classList.remove('selected');
          selected = { side, index };
          (side === 'left' ? leftBtns : rightBtns)[index].classList.add('selected');
          if (side === 'left' && M.store.state.settings.autoPlayAudio) M.speech.speak(M.content.word(left[index]).ko, { quiet: true });
          return;
        }
        const l = side === 'left' ? index : selected.index;
        const r = side === 'right' ? index : selected.index;
        leftBtns[l].classList.remove('selected');
        rightBtns[r].classList.remove('selected');
        selected = null;
        resolve(l, r);
      }

      function resolve(l, r) {
        const id = left[l];
        const correct = id === right[r];
        M.progress.recordAnswer(correct);
        if (correct) {
          M.srs.practice(id, true);
          round.matches++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          let earned = points().match;
          if (round.combo % points().comboEvery === 0) {
            earned += points().comboBonus;
            host.mascot.react('combo');
          }
          host.award(earned, leftBtns[l]);
          M.sfx.play('pop');
          busy.add(`left${l}`).add(`right${r}`);
          leftBtns[l].classList.add('matched');
          rightBtns[r].classList.add('matched');
          setTimeout(() => replace(l, r), 260);
        } else {
          M.srs.practice(id, false);
          round.misses++;
          round.combo = 0;
          round.mistakes.add(id);
          M.sfx.play('wrong');
          for (const btn of [leftBtns[l], rightBtns[r]]) {
            btn.classList.remove('miss');
            void btn.offsetWidth;
            btn.classList.add('miss');
          }
        }
        matchesText.textContent = String(round.matches);
        comboText.textContent = String(round.combo);
        M.store.save();
      }

      function replace(l, r) {
        busy.delete(`left${l}`);
        busy.delete(`right${r}`);
        if (!running) return;
        const matched = left[l];
        left[l] = null;
        right[r] = null;
        const word = nextWord(matched);
        left[l] = word.id;
        // The new meaning goes into a random right-hand slot (that slot's tile moves into
        // the free one), so a new pair never simply sits in the two slots just cleared.
        const isSelected = (j) => selected && selected.side === 'right' && selected.index === j;
        const slots = right.map((_, j) => j).filter((j) => j === r || (!busy.has(`right${j}`) && !isSelected(j)));
        const j = U.pick(slots);
        if (j !== r) {
          right[r] = right[j];
          drawTile('right', r);
        }
        right[j] = word.id;
        drawTile('left', l);
        drawTile('right', j);
      }

      function end() {
        running = false;
        cancelAnimationFrame(frame);
        M.progress.best('bestMatch', round.matches);
        M.store.save();
        board.classList.add('over');
        host.stage.querySelector('.match-area').append(h('div.match-over', h('span', ui.bi('시간 끝!', "Time's up!"))));
        M.sfx.play('complete');
        endTimer = setTimeout(
          () =>
            host.finish({
              gameId: 'speed-match',
              answers: round.matches + round.misses,
              correct: round.matches,
              matches: round.matches,
              misses: round.misses,
              bestCombo: round.bestCombo,
              learned: [],
              mistakes: [...round.mistakes],
              perfect: false,
            }),
          1200
        );
      }
    },
  });
})(window.Mallang);
