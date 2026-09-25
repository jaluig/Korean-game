/**
 * Service worker: keeps a copy of the whole game so it opens and works
 * offline once it has been loaded from a web address (see js/pwa.js).
 *
 * Files come from the network first, so an update shows up on the next
 * visit; the copy is used when there's no connection (or it's very slow).
 * The web fonts are kept too, so offline play looks the same.
 * Every file the game loads must be listed in FILES (a unit test checks it).
 */
'use strict';

const VERSION = '0.3.0'; // keep in step with Mallang.version (js/core/namespace.js)
const CACHE = `mallang-${VERSION}`;
const FONT_CACHE = 'mallang-fonts';
const SLOW_MS = 4000; // after this long without an answer, use the copy if there is one

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'css/base.css',
  'css/components.css',
  'css/screens.css',
  'css/games.css',
  'css/minigames.css',
  'css/phone.css',
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
  'js/core/distractors.js',
  'js/core/particles.js',
  'js/core/answers.js',
  'js/core/speech.js',
  'js/core/mic.js',
  'js/core/sfx.js',
  'content/cafe.js',
  'content/my-day.js',
  'content/people.js',
  'content/numbers.js',
  'content/shopping.js',
  'content/directions.js',
  'content/past.js',
  'content/feelings.js',
  'content/weather.js',
  'content/hobbies.js',
  'content/sounds.js',
  'content/grammar.js',
  'content/dialogues.js',
  'js/ui/components.js',
  'js/ui/mascot.js',
  'js/ui/keyboard.js',
  'js/ui/speaking.js',
  'js/ui/feedback.js',
  'js/exercises/intro.js',
  'js/exercises/choice.js',
  'js/exercises/tiles.js',
  'js/exercises/typing.js',
  'js/exercises/sentence.js',
  'js/exercises/dictation.js',
  'js/games/word-cards.js',
  'js/games/sentence-builder.js',
  'js/games/speed-match.js',
  'js/games/balloon-pop.js',
  'js/games/particle-lab.js',
  'js/games/verb-magic.js',
  'js/games/number-shop.js',
  'js/games/sound-twins.js',
  'js/games/grammar-cards.js',
  'js/games/dialogues.js',
  'js/screens/onboarding.js',
  'js/screens/home.js',
  'js/screens/garden.js',
  'js/screens/stats.js',
  'js/screens/settings.js',
  'js/screens/play.js',
  'js/screens/summary.js',
  'js/pwa.js',
  'js/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES.map((file) => new Request(file, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('mallang-') && key !== CACHE && key !== FONT_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

/** The saved copy of a request (for a page: the game itself). */
async function fromCache(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;
  return request.mode === 'navigate' ? cache.match('index.html') : undefined;
}

/** Network first; the copy when offline or when the network is very slow. */
function networkFirst(request) {
  return new Promise((resolve) => {
    let done = false;
    const answer = (response) => {
      if (done || !response) return false;
      done = true;
      resolve(response);
      return true;
    };
    const timer = setTimeout(() => fromCache(request).then(answer), SLOW_MS);
    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        answer(response);
      })
      .catch(() => {
        clearTimeout(timer);
        fromCache(request).then((hit) => answer(hit || Response.error()));
      });
  });
}

/** Web fonts never change: the copy first, the network only the first time. */
async function cacheFirst(request) {
  const cache = await caches.open(FONT_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) event.respondWith(networkFirst(request));
  else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') event.respondWith(cacheFirst(request));
});
