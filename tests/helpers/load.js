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
  'js/core/numbers.js',
  'js/core/conjugate.js',
  'js/core/grammar.js',
  'js/core/storage.js',
  'js/core/content.js',
  'js/core/srs.js',
  'js/core/progress.js',
  'js/core/topik.js',
  'js/core/distractors.js',
  'js/core/particles.js',
  'js/core/answers.js',
  'js/core/mic.js',
];
const CONTENT = [
  'content/cafe.js',
  'content/my-day.js',
  'content/people.js',
  'content/numbers.js',
  'content/shopping.js',
  'content/directions.js',
  'content/past.js',
  'content/hobbies.js',
  'content/feelings.js',
  'content/weather.js',
  'content/travel.js',
  'content/health.js',
  'content/work.js',
  'content/sounds.js',
  'content/grammar.js',
  'content/dialogues.js',
  'content/reading.js',
  'content/speech-levels.js',
  'content/stories.js',
  'content/honorifics.js',
  'content/topik.js',
  'content/replies.js',
  'content/sound-changes.js',
];
// Minigames only touch the DOM when a round starts, so their round-building logic can be tested.
const GAMES = [
  'js/games/balloon-pop.js',
  'js/games/particle-lab.js',
  'js/games/verb-magic.js',
  'js/games/number-shop.js',
  'js/games/sound-twins.js',
  'js/games/sound-changes.js',
  'js/games/grammar-cards.js',
  'js/games/dialogues.js',
  'js/games/replies.js',
  'js/games/reading.js',
  'js/games/speech-levels.js',
  'js/games/shadowing.js',
  'js/games/honorifics.js',
  'js/games/stories.js',
  'js/games/word-cards.js',
  'js/games/weekly-review.js',
];

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
function loadMallang({ content = true, games = false } = {}) {
  global.window = global;
  global.localStorage = fakeStorage();
  for (const file of [...CORE, ...(content ? CONTENT : []), ...(games ? GAMES : [])]) require(path.join(ROOT, file));
  global.Mallang.store.load();
  return global.Mallang;
}

/** A fixed "now" (local noon) so tests don't depend on the clock. */
const NOON = new Date(2026, 8, 24, 12, 0, 0).getTime();

module.exports = { loadMallang, NOON, ROOT };
