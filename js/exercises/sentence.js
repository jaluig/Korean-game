/**
 * Exercise: build a Korean sentence from word tiles.
 * Decoys include "traps" (a wrong particle like 커피을, 에 vs 에서, 둘 vs 두)
 * whose explanations appear if you fall for them. The number of decoys grows
 * as a sentence grows; well-known sentences can switch to listening mode.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const ORDER_TIP = 'All the right words — just not in the right order. The verb comes last in Korean, and time words usually come first.';

  M.exercises.register({
    id: 'sentence',

    /** ctx: { el, item: sentence, stage, answer(result) } → cleanup */
    render({ el, item: sentence, stage = 0, answer }) {
      const listening = stage >= 3 && M.speech.isReady() && U.random() < 0.5;
      const decoys = stage === 0 ? 1 : stage <= 2 ? 2 : 3;
      const knownWords = M.content.words().filter((w) => M.srs.isIntroduced(w.id));
      const { tiles: defs } = M.distractors.sentenceTiles(sentence, { decoys, knownWords });
      const tiles = defs.map((t, id) => ({ ...t, id, used: false }));
      const placed = [];
      let hintUsed = false;
      let locked = false;

      const strip = h('div.strip', { 'aria-label': 'Your sentence' });
      const bank = h('div.bank.bank-words', { role: 'group', 'aria-label': 'Word tiles' });
      const hintBtn = ui.button({ icon: '💡', ko: '힌트', en: 'Hint', variant: 'ghost', size: 'small', onClick: hint });
      const clearBtn = ui.button({ icon: '↺', ko: '지우기', en: 'Clear', variant: 'ghost', size: 'small', onClick: clearAll });
      const checkBtn = ui.button({ ko: '확인', en: 'Check', variant: 'primary', size: 'big', onClick: check, disabled: true });

      const prompt = listening
        ? h(
            'div.prompt.prompt-listen',
            ui.audioButton(sentence.ko, { size: 'huge', label: 'Play the sentence' }),
            ui.audioButton(sentence.ko, { size: 'big', slow: true })
          )
        : h('div.prompt', h('div.prompt-sentence', sentence.en), stage === 0 ? h('span.new-badge', ui.bi('새 문장', 'new sentence')) : null);

      el.append(
        h(
          'div.ex.ex-sentence',
          listening ? ui.exTag('듣고 문장을 만드세요', 'Build the sentence you hear', '👂') : ui.exTag('문장을 만들어 보세요', 'Build the sentence in Korean', '🧩'),
          prompt,
          strip,
          bank,
          h('div.type-tools', hintBtn, clearBtn),
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), checkBtn)
        )
      );
      const timer = listening ? setTimeout(() => M.speech.speak(sentence.ko, { quiet: true }), 300) : null;

      function draw() {
        U.clear(strip);
        if (!placed.length) strip.append(h('span.strip-placeholder', ui.bi('여기에 단어를 놓으세요', 'Tap the words below in order')));
        placed.forEach((id, index) =>
          strip.append(
            h('button.word-tile.placed', { type: 'button', lang: 'ko', disabled: locked, on: { click: () => unplace(index) } }, tiles[id].text)
          )
        );
        U.clear(bank);
        for (const tile of tiles) {
          bank.append(
            h(
              'button',
              { type: 'button', class: `word-tile ${tile.used ? 'used' : ''}`.trim(), lang: 'ko', disabled: tile.used || locked, on: { click: () => place(tile) } },
              tile.text
            )
          );
        }
        checkBtn.disabled = locked || !placed.length;
        hintBtn.disabled = locked;
        clearBtn.disabled = locked || !placed.length;
      }

      function place(tile) {
        if (locked || tile.used) return;
        tile.used = true;
        placed.push(tile.id);
        M.sfx.play('tap');
        draw();
      }

      function unplace(index) {
        if (locked) return;
        const [id] = placed.splice(index, 1);
        tiles[id].used = false;
        draw();
      }

      function clearAll() {
        if (locked) return;
        placed.splice(0).forEach((id) => (tiles[id].used = false));
        draw();
      }

      /** Keep the correct beginning, then add the next right tile. */
      function hint() {
        if (locked) return;
        const target = sentence.tiles;
        let keep = 0;
        while (keep < placed.length && tiles[placed[keep]].text === target[keep]) keep++;
        if (keep >= target.length) return;
        placed.splice(keep).forEach((id) => (tiles[id].used = false));
        const next = tiles.find((t) => !t.used && t.answer && t.text === target[keep]);
        if (next) {
          hintUsed = true;
          next.used = true;
          placed.push(next.id);
        }
        draw();
      }

      function explain(given) {
        const reasons = [];
        for (const id of placed) {
          const tile = tiles[id];
          if (tile.trap) reasons.push(tile.trap.why);
          else if (tile.word) reasons.push(`${tile.word.ko} means “${tile.word.en}” — it doesn't belong in this sentence.`);
        }
        if (!reasons.length) {
          const sameTiles = [...given].sort().join('|') === [...sentence.tiles].sort().join('|');
          if (sameTiles) reasons.push(ORDER_TIP);
          else {
            const missing = sentence.tiles.filter((t) => !given.includes(t));
            if (missing.length) reasons.push(`Something's missing: ${missing.join(', ')}.`);
          }
        }
        return U.uniqueBy(reasons, (r) => r);
      }

      function check() {
        if (locked || !placed.length) return;
        locked = true;
        stopKeys();
        const given = placed.map((id) => tiles[id].text);
        const correct = [sentence.tiles, ...sentence.alts].some((ans) => ans.length === given.length && ans.every((t, i) => t === given[i]));
        draw();
        strip.classList.add(correct ? 'correct' : 'wrong');
        answer({
          correct,
          grade: correct ? (hintUsed ? 'hard' : 'good') : 'again',
          given: given.join(' '),
          reasons: correct ? [] : explain(given),
          listening,
          hintUsed,
        });
      }

      const stopKeys = M.keys.push((event) => {
        if (event.repeat || locked) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          check();
        } else if (event.key === 'Backspace' && placed.length) {
          event.preventDefault();
          unplace(placed.length - 1);
        } else if ((event.key === 'r' || event.key === 'R') && listening) {
          M.speech.speak(sentence.ko);
        }
      });

      draw();
      return () => {
        clearTimeout(timer);
        stopKeys();
      };
    },
  });
})(window.Mallang);
