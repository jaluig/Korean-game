/**
 * Loads the game's plain browser scripts into Node for unit tests.
 * Only the non-UI parts are loaded (core + content), with a fake localStorage.
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const CORE = [
  'js/core/namespace.js',
  'js/core/config.js',
  'js/core/utils.js',
  'js/core/hangul.js',
  'js/core/storage.js',
  'js/core/content.js',
  'js/core/srs.js',
  'js/core/progress.js',
  'js/core/distractors.js',
];
const CONTENT = ['content/cafe.js', 'content/my-day.js'];

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    keys: () => [...data.keys()],
  };
}

/** Each test file runs in its own process, so loading once per file is enough. */
function loadMallang({ content = true } = {}) {
  global.window = global;
  global.localStorage = fakeStorage();
  for (const file of [...CORE, ...(content ? CONTENT : [])]) require(path.join(ROOT, file));
  global.Mallang.store.load();
  return global.Mallang;
}

/** A fixed "now" (local noon) so tests don't depend on the clock. */
const NOON = new Date(2026, 8, 24, 12, 0, 0).getTime();

module.exports = { loadMallang, NOON, ROOT };
