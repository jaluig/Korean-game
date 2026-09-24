/**
 * Exercise: build the word from syllable tiles. The decoys are look-alike
 * syllables (딸 / 달 / 탈), so it trains careful spelling, not guessing.
 * Click a tile to place it, click a placed tile (or Backspace) to take it back.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const H = M.hangul;

  M.exercises.register({
    id: 'tiles',

    /** ctx: { el, item: word, answer(result) } → cleanup */
    render({ el, item: word, answer }) {
      const target = U.normalize(word.ko); // e.g. '아이스 아메리카노'
      const groups = target.split(' ').map((part) => [...part].length); // slots per word
      const slotCount = groups.reduce((a, b) => a + b, 0);
      const tiles = M.distractors.syllableTiles(word).map((t, id) => ({ ...t, id, used: false }));
      const placed = []; // tile ids, in slot order
      let locked = false;

      const slotsEl = h('div.slots', { 'aria-label': 'Your answer' });
      const bankEl = h('div.bank', { role: 'group', 'aria-label': 'Syllable tiles' });
      const checkBtn = ui.button({ ko: '확인', en: 'Check', variant: 'primary', size: 'big', onClick: check, disabled: true });

      el.append(
        h(
          'div.ex.ex-tiles',
          ui.exTag('단어를 만들어 보세요', 'Build the word', '🧱'),
          h('div.prompt', h('div.prompt-emoji', { 'aria-hidden': 'true' }, word.emoji), h('div.prompt-en', word.en)),
          slotsEl,
          bankEl,
          h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), checkBtn)
        )
      );

      function draw() {
        U.clear(slotsEl);
        let i = 0;
        for (const size of groups) {
          const group = h('div.slot-group');
          for (let k = 0; k < size; k++, i++) {
            const tileId = placed[i];
            const index = i;
            group.append(
              tileId == null
                ? h('span.slot', { 'aria-hidden': 'true' })
                : h(
                    'button.slot.filled',
                    { type: 'button', lang: 'ko', 'aria-label': `Remove ${tiles[tileId].text}`, on: { click: () => unplace(index) } },
                    tiles[tileId].text
                  )
            );
          }
          slotsEl.append(group);
        }
        U.clear(bankEl);
        for (const tile of tiles) {
          bankEl.append(
            h(
              'button',
              { type: 'button', class: `tile ${tile.used ? 'used' : ''}`.trim(), lang: 'ko', disabled: tile.used || locked, on: { click: () => place(tile) } },
              tile.text
            )
          );
        }
        checkBtn.disabled = locked || placed.length !== slotCount;
      }

      function place(tile) {
        if (locked || tile.used || placed.length >= slotCount) return;
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

      function givenText() {
        const parts = [];
        let i = 0;
        for (const size of groups) {
          parts.push(placed.slice(i, i + size).map((id) => tiles[id].text).join(''));
          i += size;
        }
        return parts.join(' ');
      }

      function check() {
        if (locked || placed.length !== slotCount) return;
        locked = true;
        stopKeys();
        const given = givenText();
        const correct = U.noSpaces(given) === U.noSpaces(target);
        draw();
        slotsEl.classList.add(correct ? 'correct' : 'wrong');
        const diff = correct ? null : H.explainDifference(target, given);
        answer({ correct, grade: correct ? 'good' : 'again', given, diff, tip: diff ? diff.tip : null });
      }

      const stopKeys = M.keys.push((event) => {
        if (event.repeat || locked) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          check();
        } else if (event.key === 'Backspace' && placed.length) {
          event.preventDefault();
          unplace(placed.length - 1);
        }
      });

      draw();
      return stopKeys;
    },
  });
})(window.Mallang);
