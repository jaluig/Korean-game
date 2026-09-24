/**
 * Small helpers shared by every part of the game: randomness, dates, text
 * normalisation and a tiny DOM builder.
 */
(function (M) {
  'use strict';

  const U = {};

  /* ---------- Randomness (tests can swap U.random for a seeded one) ---------- */

  U.random = () => Math.random();
  U.randInt = (n) => Math.floor(U.random() * n);
  U.pick = (list) => list[U.randInt(list.length)];
  U.shuffle = (list) => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = U.randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (list, n) => U.shuffle(list).slice(0, n);
  U.clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  U.uniqueBy = (list, keyFn) => {
    const seen = new Set();
    return list.filter((x) => {
      const key = keyFn(x);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  /* ---------- Time ---------- */

  U.now = () => Date.now();

  const pad = (n) => String(n).padStart(2, '0');

  /** Local calendar day as "YYYY-MM-DD" — streaks follow the learner's own midnight. */
  U.dayKey = (time = U.now()) => {
    const d = new Date(time);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  /** Shift a day key by n calendar days (safe across daylight-saving changes). */
  U.addDays = (key, n) => {
    const [y, m, d] = key.split('-').map(Number);
    return U.dayKey(new Date(y, m - 1, d + n, 12).getTime());
  };

  /** The last n day keys, oldest first, ending today. */
  U.recentDays = (n, time = U.now()) => {
    const today = U.dayKey(time);
    return Array.from({ length: n }, (_, i) => U.addDays(today, i - n + 1));
  };

  /** Weekday of a day key: 0 = Sunday. */
  U.weekday = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d, 12).getDay();
  };

  /** "in 3 days"-style label for a future time, as { ko, en }. */
  U.relativeTime = (target, time = U.now()) => {
    const { MINUTE, HOUR, DAY } = M.config.time;
    const diff = target - time;
    if (diff <= MINUTE) return { ko: '지금', en: 'now' };
    if (diff < HOUR) {
      const n = Math.round(diff / MINUTE);
      return { ko: `${n}분 후`, en: `in ${n} min` };
    }
    if (diff < DAY) {
      const n = Math.round(diff / HOUR);
      return { ko: `${n}시간 후`, en: `in ${n} hour${n === 1 ? '' : 's'}` };
    }
    const n = Math.round(diff / DAY);
    return { ko: `${n}일 후`, en: `in ${n} day${n === 1 ? '' : 's'}` };
  };

  /* ---------- Text ---------- */

  /** Normalise an answer for comparison: NFC, punctuation removed, single spaces. */
  U.normalize = (text) =>
    String(text ?? '')
      .normalize('NFC')
      .replace(/[.,!?~…"'“”‘’()[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  U.noSpaces = (text) => String(text ?? '').replace(/\s+/g, '');

  /** Edit distance between two strings or arrays. */
  U.levenshtein = (a, b) => {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  };

  U.plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  /* ---------- DOM ---------- */

  /**
   * Create an element: h('button.btn.primary', { on: { click: fn } }, 'Label').
   * Classes can follow the tag name after dots. Props may be: class, text, on,
   * style (object), dataset, or any attribute/property. Children may be nodes,
   * strings, numbers, arrays, or null/false (skipped).
   */
  U.h = (tag, props, ...children) => {
    const [name, ...classes] = tag.split('.');
    const el = document.createElement(name || 'div');
    if (classes.length) el.className = classes.join(' ');

    const isProps = props && typeof props === 'object' && !(props instanceof Node) && !Array.isArray(props);
    if (!isProps) children.unshift(props);
    else {
      for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === 'class') el.className = [el.className, value].filter(Boolean).join(' ');
        else if (key === 'text') el.textContent = value;
        else if (key === 'on') for (const [evt, fn] of Object.entries(value)) el.addEventListener(evt, fn);
        else if (key === 'style' && typeof value === 'object') {
          for (const [prop, v] of Object.entries(value)) {
            if (prop.startsWith('--')) el.style.setProperty(prop, v);
            else el.style[prop] = v;
          }
        }
        else if (key === 'dataset') Object.assign(el.dataset, value);
        else if (key in el && typeof value !== 'string') el[key] = value;
        else el.setAttribute(key, value === true ? '' : value);
      }
    }
    append(el, children);
    return el;
  };

  function append(el, children) {
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }

  U.clear = (el) => {
    while (el.firstChild) el.removeChild(el.firstChild);
    return el;
  };

  /** Politely announce a message to screen readers. */
  U.announce = (text) => {
    const el = document.getElementById('announcer');
    if (el) el.textContent = text;
  };

  M.utils = U;
})(window.Mallang);
