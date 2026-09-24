/**
 * Reusable UI pieces: bilingual labels, buttons, audio buttons, dialogs,
 * toasts, progress rings/bars, confetti — plus the keyboard-shortcut stack.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = (M.ui = M.ui || {});

  /* ---------- Keyboard shortcuts ---------- */

  // Only the most recently pushed handler receives key presses, so a dialog or
  // the feedback sheet automatically "captures" the keyboard while it is open.
  const keyStack = [];
  document.addEventListener('keydown', (event) => {
    const handler = keyStack[keyStack.length - 1];
    if (handler) handler(event);
  });

  M.keys = {
    /** Start receiving key presses. Returns a function that stops it. */
    push(handler) {
      keyStack.push(handler);
      return () => {
        const i = keyStack.lastIndexOf(handler);
        if (i >= 0) keyStack.splice(i, 1);
      };
    },
    /** Forget every handler (on a screen change, so none can linger). */
    reset() {
      keyStack.length = 0;
    },
    /** True when the key press is meant for a text field or a menu. */
    isTypingTarget(event) {
      const t = event.target;
      return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
    },
  };

  /* ---------- Text ---------- */

  /** Korean text with a small English subtitle underneath (hidden when English hints are off). */
  ui.bi = (ko, en, cls = '') =>
    h('span', { class: `bi ${cls}`.trim() }, h('span.ko', ko), en ? h('span.en', { lang: 'en' }, en) : null);

  /** Plain text with **bold** marks → safe DOM nodes. */
  ui.richText = (text) =>
    String(text)
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => (part.startsWith('**') && part.endsWith('**') ? h('strong', part.slice(2, -2)) : part));

  /* ---------- Buttons ---------- */

  /**
   * A chunky button.
   * { ko, en, icon, variant: 'primary' | 'mint' | 'soft' | 'ghost' | 'danger', size: 'big' | 'small', onClick, disabled, title }
   */
  ui.button = ({ ko, en, icon, variant = 'soft', size = '', onClick, disabled = false, title, cls = '' } = {}) =>
    h(
      'button',
      {
        type: 'button',
        class: `btn btn-${variant} ${size ? `btn-${size}` : ''} ${cls}`.replace(/\s+/g, ' ').trim(),
        disabled,
        title,
        'aria-label': !ko && title ? title : null,
        on: onClick ? { click: onClick } : null,
      },
      icon ? h('span.btn-icon', { 'aria-hidden': 'true' }, icon) : null,
      ko || en ? ui.bi(ko, en) : null
    );

  /** A 🔊 button that speaks Korean text (🐢 = slowly). */
  ui.audioButton = (text, { size = '', slow = false, label } = {}) => {
    const name = label || (slow ? 'Play slowly' : 'Play sound');
    const btn = h(
      'button',
      {
        type: 'button',
        class: `audio-btn ${size} ${slow ? 'slow' : ''}`.trim(),
        title: name,
        'aria-label': name,
        on: {
          click: (event) => {
            event.stopPropagation();
            if (M.speech.speak(text, slow ? { rate: 0.6 } : {})) {
              btn.classList.remove('playing');
              void btn.offsetWidth; // restart the animation
              btn.classList.add('playing');
            }
          },
        },
      },
      h('span', { 'aria-hidden': 'true' }, slow ? '🐢' : '🔊')
    );
    return btn;
  };

  /** Heading chip above an exercise: icon + Korean + English. */
  ui.exTag = (ko, en, icon = '✨') => h('div.ex-tag', h('span.ex-tag-icon', { 'aria-hidden': 'true' }, icon), ui.bi(ko, en));

  /** An example sentence with its own audio button. */
  ui.example = (example) =>
    h(
      'div.example',
      h('div.example-ko', h('span', { lang: 'ko' }, example.ko), ui.audioButton(example.ko, { size: 'small' })),
      h('div.example-en', example.en)
    );

  /* ---------- Progress ---------- */

  /** A horizontal progress bar (value 0–1). */
  ui.bar = (value, { color = 'pink', label = 'Progress' } = {}) => {
    const pct = Math.round(U.clamp(value || 0, 0, 1) * 100);
    const el = h(
      'div',
      { class: `bar bar-${color}`, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': label },
      h('div.bar-fill', { style: { width: `${pct}%` } })
    );
    el.set = (next) => {
      const p = Math.round(U.clamp(next || 0, 0, 1) * 100);
      el.firstChild.style.width = `${p}%`;
      el.setAttribute('aria-valuenow', p);
    };
    return el;
  };

  /** A circular progress ring (value 0–1) with any content in the middle. */
  ui.ring = (value, { size = 120, stroke = 12, color = 'var(--pink)', children = null, label } = {}) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = U.clamp(value || 0, 0, 1);
    const mid = size / 2;
    const wrap = h('div.ring', { style: { width: `${size}px`, height: `${size}px` }, role: 'img', 'aria-label': label });
    wrap.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${mid}" cy="${mid}" r="${r}" fill="none" style="stroke: var(--line)" stroke-width="${stroke}"/>
      <circle class="ring-fill" cx="${mid}" cy="${mid}" r="${r}" fill="none" style="stroke: ${color}"
        stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"
        transform="rotate(-90 ${mid} ${mid})"/>
    </svg>`;
    wrap.append(h('div.ring-center', children));
    return wrap;
  };

  /* ---------- Word garden stages ---------- */

  ui.STAGES = [
    { emoji: '🌰', ko: '씨앗', en: 'Seed', desc: 'Not learned yet' },
    { emoji: '🌱', ko: '새싹', en: 'Sprout', desc: 'Just learned' },
    { emoji: '🌿', ko: '잎', en: 'Leafy', desc: 'Getting familiar' },
    { emoji: '🌷', ko: '꽃', en: 'Bloom', desc: 'You know it' },
    { emoji: '🌻', ko: '활짝', en: 'Full bloom', desc: 'Strong memory' },
    { emoji: '🌳', ko: '나무', en: 'Tree', desc: 'Mastered' },
  ];
  ui.plant = (stage) => ui.STAGES[U.clamp(stage, 0, ui.STAGES.length - 1)].emoji;

  /* ---------- Dialogs ---------- */

  function trapFocus(event, container) {
    const focusable = [...container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.disabled && el.offsetParent !== null
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Show a dialog: { title: {ko, en}, body, actions: [buttons], onClose, dismissable, cls }.
   * Returns { close, el }.
   */
  ui.modal = ({ title, body, actions = [], onClose, dismissable = true, cls = '' } = {}) => {
    const root = document.getElementById('overlay-root') || document.body;
    const previousFocus = document.activeElement;
    const titleId = `dialog-${Math.random().toString(36).slice(2)}`;
    const closeBtn = dismissable
      ? h('button.icon-btn.modal-close', { type: 'button', 'aria-label': 'Close', on: { click: () => close() } }, '✕')
      : null;
    const dialog = h(
      'div',
      { class: `modal ${cls}`.trim(), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': title ? titleId : null },
      closeBtn,
      title ? h('h2.modal-title', { id: titleId }, ui.bi(title.ko, title.en)) : null,
      h('div.modal-body', body),
      actions.length ? h('div.modal-actions', actions) : null
    );
    const backdrop = h('div.modal-backdrop', {
      on: {
        mousedown: (event) => {
          if (event.target === backdrop && dismissable) close();
        },
      },
    }, dialog);
    root.append(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('open'));

    const offKeys = M.keys.push((event) => {
      if (event.key === 'Escape' && dismissable) {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') trapFocus(event, dialog);
    });
    const focusTarget = dialog.querySelector('[autofocus]') || dialog.querySelector('.modal-actions button:last-child') || closeBtn;
    if (focusTarget) focusTarget.focus({ preventScroll: true });

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      openModals.delete(close);
      offKeys();
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.remove(), 180);
      if (previousFocus && previousFocus.focus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
      if (onClose) onClose();
    }
    openModals.add(close);
    return { close, el: dialog };
  };

  const openModals = new Set();
  /** Close every open dialog (used when the screen changes). */
  ui.closeAllModals = () => [...openModals].forEach((close) => close());

  /** Yes/no question as a Promise<boolean>. */
  ui.confirm = ({ title, text, ok = { ko: '네', en: 'Yes' }, cancel = { ko: '아니요', en: 'No' }, danger = false } = {}) =>
    new Promise((resolve) => {
      let answer = false;
      const dialog = ui.modal({
        title,
        body: text ? h('p', text) : null,
        actions: [
          ui.button({ ...cancel, variant: 'soft', onClick: () => dialog.close() }),
          ui.button({
            ...ok,
            variant: danger ? 'danger' : 'primary',
            onClick: () => {
              answer = true;
              dialog.close();
            },
          }),
        ],
        onClose: () => resolve(answer),
      });
    });

  /* ---------- Toasts ---------- */

  /** A small message that slides in and disappears: { icon, ko, en, tone: 'info'|'good'|'warn', duration, action }. */
  ui.toast = ({ icon = '💬', ko, en, tone = 'info', duration = 3500, action } = {}) => {
    let host = document.querySelector('.toasts');
    if (!host) {
      host = h('div.toasts', { role: 'status', 'aria-live': 'polite' });
      document.body.append(host);
    }
    const el = h(
      'div',
      { class: `toast toast-${tone}` },
      h('span.toast-icon', { 'aria-hidden': 'true' }, icon),
      ui.bi(ko, en),
      action
        ? ui.button({
            ko: action.ko,
            en: action.en,
            variant: 'ghost',
            size: 'small',
            onClick: () => {
              action.onClick();
              dismiss();
            },
          })
        : null
    );
    host.append(el);
    requestAnimationFrame(() => el.classList.add('show'));
    const timer = setTimeout(dismiss, duration);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
    }
    return dismiss;
  };

  /* ---------- Celebration ---------- */

  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ui.confetti = ({ count = 40, emojis = ['🌸', '⭐', '💖', '🍓', '🌱', '✨', '🎀'] } = {}) => {
    if (reducedMotion()) return;
    const layer = h('div.confetti', { 'aria-hidden': 'true' });
    for (let i = 0; i < count; i++) {
      layer.append(
        h(
          'span',
          {
            style: {
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.7}s`,
              animationDuration: `${2.4 + Math.random() * 1.8}s`,
              fontSize: `${16 + Math.random() * 18}px`,
              '--drift': `${(Math.random() - 0.5) * 180}px`,
              '--spin': `${(Math.random() - 0.5) * 720}deg`,
            },
          },
          U.pick(emojis)
        )
      );
    }
    document.body.append(layer);
    setTimeout(() => layer.remove(), 5000);
  };

  /** "+10" that floats up from an element. */
  ui.floatPoints = (anchor, amount) => {
    if (!anchor || !(amount > 0) || reducedMotion()) return;
    const rect = anchor.getBoundingClientRect();
    const el = h('div.float-points', { style: { left: `${rect.left + rect.width / 2}px`, top: `${rect.top}px` } }, `+${amount}`);
    document.body.append(el);
    setTimeout(() => el.remove(), 1000);
  };

  /* ---------- Speech fallback ---------- */

  /** How to add a Korean voice, for the dialog and the Settings screen. */
  ui.voiceHelp = () =>
    h(
      'div.voice-help',
      h('p', 'The game speaks Korean using voices built into your browser or computer, and none were found. Everything else works without sound. To add one:'),
      h(
        'ul',
        h('li', h('b', 'Easiest: '), 'open the game in Google Chrome or Microsoft Edge — they include Korean voices (they need an internet connection).'),
        h('li', h('b', 'Windows: '), 'Settings → Time & language → Speech → Manage voices → Add voices → Korean. Then restart your browser.'),
        h('li', h('b', 'macOS: '), 'System Settings → Accessibility → Spoken Content → System voice → Manage Voices… → Korean (e.g. Yuna).'),
        h('li', h('b', 'Linux: '), 'Chrome’s online voices are the simplest option.')
      )
    );

  ui.showVoiceHelp = () => {
    const dialog = ui.modal({
      title: { ko: '한국어 음성이 없어요', en: 'No Korean voice found' },
      body: ui.voiceHelp(),
      actions: [ui.button({ ko: '알겠어요', en: 'Got it', variant: 'primary', onClick: () => dialog.close() })],
    });
    return dialog;
  };

  // Grey out 🔊 buttons when there is no Korean voice, and explain once.
  M.events.on('speech:status', (status) => {
    document.body.classList.toggle('no-voice', status === 'unavailable' || status === 'unsupported');
  });
  let explainedNoVoice = false;
  M.events.on('speech:unavailable', (status) => {
    if (explainedNoVoice || status === 'loading') return;
    explainedNoVoice = true;
    ui.toast({
      icon: '🔇',
      ko: '한국어 음성이 없어요',
      en: 'No Korean voice on this computer — the game works fine without sound.',
      tone: 'warn',
      duration: 7000,
      action: { ko: '도움말', en: 'How to fix', onClick: () => ui.showVoiceHelp() },
    });
  });
})(window.Mallang);
