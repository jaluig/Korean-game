/**
 * On-screen Korean keyboard (standard 2-set / 두벌식 layout).
 *
 * It also listens to your physical keyboard *by key position* and builds the
 * Hangul itself, so typing works even without any Korean input method set up:
 * press R for ㄱ, K for ㅏ, Shift+R for ㄲ… (exactly like a Korean keyboard).
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const H = M.hangul;

  /**
   * createKeyboard({ onChange(text), onEnter(), hints }) →
   *   { el, value(), setKeys(keys), clear(), setDisabled(bool), destroy() }
   * `hints` shows the matching QWERTY letter on each key.
   */
  function createKeyboard({ onChange, onEnter, hints = true } = {}) {
    let keys = [];
    let shift = false; // on-screen Shift: applies to the next key only
    let disabled = false;
    const buttons = new Map(); // KeyboardEvent.code → button

    const emit = () => onChange && onChange(H.assemble(keys), keys.slice());

    function press(letter) {
      if (disabled) return;
      keys.push(letter);
      if (shift) setShift(false);
      M.sfx.play('tap');
      emit();
    }

    function backspace() {
      if (disabled || !keys.length) return;
      keys.pop();
      emit();
    }

    function setShift(on) {
      shift = on;
      root.classList.toggle('shifted', on);
      shiftBtn.setAttribute('aria-pressed', String(on));
      for (const [code, btn] of buttons) {
        const letter = H.letterForKey(code, on);
        if (letter) btn.querySelector('.kb-letter').textContent = letter;
      }
    }

    function flash(code) {
      const btn = buttons.get(code);
      if (!btn) return;
      btn.classList.remove('pressed');
      void btn.offsetWidth;
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 140);
    }

    // Keep focus where it is when clicking keys (no text field needed).
    const keepFocus = { mousedown: (event) => event.preventDefault() };

    function letterKey(code) {
      const [plain, shifted] = H.LAYOUT[code];
      const btn = h(
        'button',
        {
          type: 'button',
          class: `kb-key ${H.isVowel(plain) ? 'vowel' : 'consonant'} ${shifted ? 'has-shift' : ''}`.trim(),
          dataset: { code },
          'aria-label': shifted ? `${plain} (Shift: ${shifted})` : plain,
          on: { ...keepFocus, click: () => press(H.letterForKey(code, shift)) },
        },
        shifted ? h('span.kb-shifted', { 'aria-hidden': 'true' }, shifted) : null,
        h('span.kb-letter', plain),
        hints ? h('span.kb-hint', { 'aria-hidden': 'true' }, code.slice(3).toLowerCase()) : null
      );
      buttons.set(code, btn);
      return btn;
    }

    const shiftBtn = h(
      'button.kb-key.kb-wide.kb-shift',
      { type: 'button', 'aria-label': 'Shift (double consonants ㄲ ㄸ ㅃ ㅆ ㅉ)', 'aria-pressed': 'false', on: { ...keepFocus, click: () => setShift(!shift) } },
      h('span.kb-letter', '⇧')
    );
    const backBtn = h(
      'button.kb-key.kb-wide.kb-back',
      { type: 'button', 'aria-label': 'Backspace', on: { ...keepFocus, click: backspace } },
      h('span.kb-letter', '⌫')
    );
    const spaceBtn = h(
      'button.kb-key.kb-space',
      { type: 'button', 'aria-label': 'Space', on: { ...keepFocus, click: () => press(' ') } },
      h('span.kb-letter', '띄어쓰기'),
      h('span.kb-hint', { 'aria-hidden': 'true' }, 'space')
    );
    buttons.set('Backspace', backBtn);
    buttons.set('Space', spaceBtn);
    buttons.set('ShiftLeft', shiftBtn);
    buttons.set('ShiftRight', shiftBtn);

    const [row1, row2, row3] = H.LAYOUT_ROWS;
    const root = h(
      'div.keyboard',
      { role: 'group', 'aria-label': 'Korean keyboard' },
      h('div.kb-row', row1.map(letterKey)),
      h('div.kb-row.kb-row-2', row2.map(letterKey)),
      h('div.kb-row', shiftBtn, row3.map(letterKey), backBtn),
      h('div.kb-row', spaceBtn)
    );

    // Physical keyboard, by key position (works with any OS layout or input method).
    function onKey(event) {
      if (disabled || event.ctrlKey || event.metaKey || event.altKey || M.keys.isTypingTarget(event)) return;
      if (event.key === 'Enter') {
        if (event.repeat) return;
        event.preventDefault();
        if (onEnter) onEnter();
        return;
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        backspace();
        flash('Backspace');
        return;
      }
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        press(' ');
        flash('Space');
        return;
      }
      let letter = H.letterForKey(event.code, event.shiftKey);
      if (!letter && event.key && event.key.length === 1 && H.isJamo(event.key)) letter = event.key;
      if (letter) {
        event.preventDefault();
        if (shift) setShift(false);
        press(letter);
        flash(event.code);
      }
    }
    const stopListening = M.keys.push(onKey);

    return {
      el: root,
      value: () => H.assemble(keys),
      setKeys(next) {
        keys = next.slice();
        emit();
      },
      clear() {
        keys = [];
        emit();
      },
      setDisabled(on) {
        disabled = on;
        root.classList.toggle('disabled', on);
        root.querySelectorAll('button').forEach((b) => (b.disabled = on));
      },
      destroy: stopListening,
    };
  }

  M.ui.createKeyboard = createKeyboard;
})(window.Mallang);
