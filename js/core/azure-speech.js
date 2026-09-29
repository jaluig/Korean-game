/**
 * Optional Korean voices from Azure Speech (text to speech), which sound more
 * natural than most browsers' own. You paste the key of your own Azure Speech
 * resource into Settings. It is kept only in this browser, apart from your
 * progress (so it's never in a backup, and never in the game's files), and it
 * is sent only to Azure. A web page can't hide a key it uses, though: anyone
 * using this browser could read it in the developer tools.
 *
 * Each word or sentence is fetched once, as MP3, and kept (in memory, and in
 * the browser's cache storage where there is one), so replays cost nothing
 * and work offline. Slow and fast playback reuse the same audio. When Azure
 * can't answer (offline, a wrong key, the free tier's limit), the browser's
 * voice speaks instead, and without a key nothing changes at all.
 */
(function (M) {
  'use strict';

  const cfg = () => M.config.azureSpeech;
  const STORAGE_KEY = 'mallang-korean/azure-speech'; // apart from the progress (M.config.storageKey)
  const AUDIO_CACHE = 'azure-voice/mallang-korean'; // (not "mallang-…": the service worker clears those on updates)
  const IN_MEMORY = 300; // clips kept in memory
  const ON_DISK = 3000; // clips kept in cache storage
  const TEST_TEXT = '안녕하세요! 반가워요.';
  const REGION = /^[a-z0-9]+$/;
  // A moment of silence, played on the first tap so the <audio> may play later without one (iPhones ask for that).
  const SILENCE = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

  const emitStatus = () => M.events.emit('speech:status', M.speech ? M.speech.status() : 'ready');

  /* ---------- Settings: { key, region, voice }, in this browser only ---------- */

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
      return { key: String(data.key || ''), region: String(data.region || ''), voice: String(data.voice || '') };
    } catch {
      return { key: '', region: '', voice: '' };
    }
  }

  let saved = read();
  let rejected = false; // Azure refused this key (401/403): it doesn't count as a voice until that changes

  const cleanRegion = (region) => String(region || '').trim().toLowerCase().replace(/\s+/g, ''); // "Korea Central" → koreacentral
  const configured = () => !!saved.key && REGION.test(saved.region);
  const online = () => typeof navigator === 'undefined' || navigator.onLine !== false;
  /** Can Azure speak now? (With a key it wasn't refused, and a connection.) */
  const usable = () => configured() && !rejected && online();
  const voiceInfo = (name) => cfg().voices.find((v) => v.name === name) || null;
  const mainVoice = () => (voiceInfo(saved.voice) ? saved.voice : cfg().female);

  /** Save the settings (an empty key forgets them). The game then speaks with Azure, or with the browser again. */
  function save({ key = '', region = '', voice = '' } = {}) {
    saved = { key: String(key).trim(), region: cleanRegion(region), voice: voiceInfo(voice) ? voice : '' };
    try {
      if (saved.key) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage blocked: the settings last until the tab closes
    }
    changed();
  }

  /** The settings changed (here, or in another tab): start afresh. */
  function changed() {
    rejected = false;
    backoffUntil = 0;
    lastError = null;
    emitStatus();
  }

  /** Forget the key and every stored clip. */
  function forget() {
    cut();
    generation++; // (a clip still on its way isn't stored)
    save({});
    memory.clear();
    if (hasDisk()) caches.delete(AUDIO_CACHE).catch(() => {});
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    // Another tab (or the installed app) saved or removed the key: follow it, so a removed key stays removed.
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      cut();
      saved = read();
      if (!saved.key) {
        generation++;
        memory.clear();
      }
      changed();
    });
    window.addEventListener('online', emitStatus);
    window.addEventListener('offline', emitStatus);
  }

  /** The voice for a woman or a man in a dialogue: the chosen voice when it fits, else the default of that kind. */
  function voiceFor(kind) {
    const main = voiceInfo(mainVoice());
    const female = kind !== 'male';
    if (main && main.female === female) return main.name;
    return female ? cfg().female : cfg().male;
  }

  /* ---------- Asking Azure ---------- */

  const MESSAGES = {
    key: 'Azure didn’t accept the key. Check the key and the region: both are on your Speech resource’s “Keys and Endpoint” page.',
    forbidden: 'Azure refused the request (403). Check that the key belongs to a Speech resource that is turned on.',
    limit: 'Azure’s limit was reached (the free tier allows 20 requests a minute and 0.5 million characters a month).',
    request: 'Azure couldn’t read this with that voice (400). Try another voice, or check the region.',
    server: 'Azure had a problem on its side. It will be tried again in a moment.',
    network: 'Azure couldn’t be reached: you may be offline, the region may be misspelt, or the network blocks it.',
    timeout: 'Azure took too long to answer.',
    http: 'Azure answered with an error.',
    empty: 'Azure sent no audio.',
    audio: 'The browser couldn’t play Azure’s audio.',
    'not-allowed': 'The browser only plays Azure’s audio after you tap or click on the page.',
  };
  // After a failure the browser's voice speaks for a while, instead of asking Azure again for every word.
  const BACKOFF = { key: 600000, forbidden: 600000, request: 60000, limit: 60000, server: 30000, network: 30000, timeout: 30000, http: 30000, empty: 30000 };

  function failure(code, status) {
    const err = new Error(MESSAGES[code] || MESSAGES.http);
    err.code = code;
    if (status) err.status = status;
    return err;
  }

  const codeFor = (status) =>
    status === 401 ? 'key' : status === 403 ? 'forbidden' : status === 429 ? 'limit' : status === 400 ? 'request' : status >= 500 ? 'server' : 'http';

  const escapeXml = (text) => String(text).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

  /** The request body. Azure bills the text inside <voice> (with any other markup), so there's nothing else: speed is set when playing. */
  const ssml = (text, voice) => `<speak version='1.0' xml:lang='ko-KR'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;

  const endpoint = (region) => `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  /** Azure's audio for `text` (a Blob). Rejects with an Error whose `code` says what went wrong. */
  async function synthesize(text, voice, { key = saved.key, region = saved.region } = {}) {
    if (!key || !REGION.test(region)) throw failure('key');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => controller && controller.abort(), cfg().timeout);
    try {
      const response = await fetch(endpoint(region), {
        method: 'POST',
        headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': cfg().format },
        body: ssml(text, voice),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller ? controller.signal : undefined,
      });
      if (!response.ok) throw failure(codeFor(response.status), response.status);
      // (anything but audio, e.g. a network's login page, is not kept)
      const type = (response.headers && response.headers.get && response.headers.get('content-type')) || '';
      if (!/^audio\//i.test(type)) throw failure('http', response.status);
      const blob = await response.blob();
      if (!blob.size) throw failure('empty');
      if (rejected) {
        rejected = false; // the key works after all (e.g. the resource was turned back on)
        emitStatus();
      }
      return blob;
    } catch (err) {
      if (err && err.code) throw err;
      throw failure(err && err.name === 'AbortError' ? 'timeout' : 'network');
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- Keeping the clips ---------- */

  const memory = new Map(); // `${voice}|${text}` → Blob, oldest first
  const asking = new Map(); // clips being fetched: one request even if asked for twice

  function remember(id, blob) {
    memory.delete(id);
    memory.set(id, blob);
    while (memory.size > IN_MEMORY) memory.delete(memory.keys().next().value);
  }

  const hasDisk = () => {
    try {
      return typeof caches !== 'undefined' && !!caches && typeof caches.open === 'function';
    } catch {
      return false; // (file:// pages can't use cache storage)
    }
  };
  const diskUrl = (id) => `https://azure-voice.invalid/${encodeURIComponent(id)}`;

  async function fromDisk(id) {
    if (!hasDisk()) return null;
    try {
      const hit = await (await caches.open(AUDIO_CACHE)).match(diskUrl(id));
      return hit ? await hit.blob() : null;
    } catch {
      return null;
    }
  }

  let stored = 0;
  function toDisk(id, blob) {
    if (!hasDisk()) return;
    caches
      .open(AUDIO_CACHE)
      .then(async (cache) => {
        await cache.put(diskUrl(id), new Response(blob, { headers: { 'Content-Type': blob.type || 'audio/mpeg' } }));
        if (++stored % 100 === 0) {
          const keys = await cache.keys(); // oldest first
          for (const old of keys.slice(0, Math.max(0, keys.length - ON_DISK))) await cache.delete(old);
        }
      })
      .catch(() => {});
  }

  let backoffUntil = 0;
  let lastError = null;
  let generation = 0;

  /** The clip for `text` in `voice`: from memory, from cache storage, or from Azure. */
  function audioFor(text, voice) {
    const id = `${voice}|${text}`;
    if (memory.has(id)) {
      const blob = memory.get(id);
      remember(id, blob);
      return Promise.resolve(blob);
    }
    if (asking.has(id)) return asking.get(id);
    const since = generation;
    const request = (async () => {
      let blob = await fromDisk(id);
      if (!blob) {
        if (!online()) throw failure('offline');
        if (Date.now() < backoffUntil) throw failure('waiting'); // (already explained)
        blob = await synthesize(text, voice);
        if (since === generation) toDisk(id, blob);
      }
      if (since === generation) remember(id, blob);
      return blob;
    })();
    asking.set(id, request);
    const done = () => asking.delete(id);
    request.then(done, done);
    return request;
  }

  /** A failure: wait a little before asking Azure again, and let the UI say why (once per kind). */
  function note(err) {
    const code = err && err.code;
    if (!code || code === 'offline' || code === 'waiting') return;
    lastError = { code, message: err.message, status: err.status || 0, at: Date.now() };
    if (BACKOFF[code]) backoffUntil = Date.now() + BACKOFF[code];
    if ((code === 'key' || code === 'forbidden') && !rejected) {
      rejected = true;
      emitStatus();
    }
    M.events.emit('speech:azure-error', lastError);
  }

  /* ---------- Playing ---------- */

  // One <audio> for every clip: once a tap has let it play, it may keep playing (Safari on iPhones asks for that).
  let player = null;
  let unlocked = false;
  function audioElement() {
    if (!player) {
      player = new Audio();
      player.preservesPitch = true; // slower or faster, never lower or higher
    }
    return player;
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    const unlock = () => {
      if (unlocked || !configured()) return;
      unlocked = true;
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);
      const audio = audioElement();
      if (job && job.audio) return; // (a clip is already playing)
      audio.src = SILENCE;
      const started = audio.play();
      if (started && typeof started.catch === 'function') started.catch(() => {});
    };
    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);
  }

  let job = null; // what Azure is fetching or playing for the last speak(): { audio, url, onError }

  function release(j) {
    if (j.audio) {
      j.audio.onended = null;
      j.audio.onerror = null;
      try {
        j.audio.pause();
      } catch {
        // already stopped
      }
    }
    if (j.url && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(j.url);
    j.audio = null;
    j.url = null;
  }

  /** Stop what Azure is saying (or about to say). Its caller hears 'interrupted', as with the browser's voice. */
  function cut() {
    const was = job;
    job = null;
    if (!was) return;
    release(was);
    if (was.onError) setTimeout(() => was.onError('interrupted'), 0);
  }

  const speed = (rate) => Math.min(2, Math.max(0.5, rate || M.store.state.settings.speechRate || 0.9));

  function play(mine, blob, rate, onEnd, fail) {
    const audio = audioElement();
    const url = URL.createObjectURL(blob);
    audio.onended = null;
    audio.onerror = null;
    audio.src = url;
    audio.defaultPlaybackRate = speed(rate);
    audio.playbackRate = speed(rate);
    mine.audio = audio;
    mine.url = url;
    const finish = (then) => () => {
      if (job !== mine) return;
      job = null;
      release(mine);
      then();
    };
    audio.onended = finish(() => onEnd && onEnd());
    audio.onerror = finish(() => fail(failure('audio')));
    const started = audio.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (job !== mine) return; // (cut off while starting)
        job = null;
        release(mine);
        fail(failure(err && err.name === 'NotAllowedError' ? 'not-allowed' : 'audio'));
      });
    }
  }

  /**
   * Say `text` with Azure; the sound comes a moment later, so it always returns true.
   * `fallback()` says it with the browser's voice instead, when Azure can't (it returns
   * false if there's no browser voice either). Options as for M.speech.speak(), plus
   * `azure`: a voice name, instead of the chosen one.
   */
  function speak(text, { rate, onEnd, onError, azure } = {}, fallback = () => false) {
    cut();
    const voice = voiceInfo(azure) ? azure : mainVoice();
    const mine = { onError };
    job = mine;
    const fail = (err) => {
      note(err);
      if (!fallback() && onError) onError('synthesis-failed');
    };
    audioFor(text, voice).then(
      (blob) => {
        if (job === mine) play(mine, blob, rate, onEnd, fail);
      },
      (err) => {
        if (job !== mine) {
          note(err); // (cut off meanwhile: still wait before asking Azure again)
          return;
        }
        job = null;
        fail(err);
      }
    );
    return true;
  }

  /** "Save and test": say a sample with these settings, straight from Azure. Resolves once it plays; rejects with the reason. */
  async function test({ key = saved.key, region = saved.region, voice = mainVoice() } = {}) {
    let blob;
    try {
      blob = await synthesize(TEST_TEXT, voiceInfo(voice) ? voice : cfg().female, { key: String(key).trim(), region: cleanRegion(region) });
    } catch (err) {
      note(err);
      throw err;
    }
    backoffUntil = 0;
    lastError = null;
    if (M.speech) M.speech.stop();
    return new Promise((resolve, reject) => {
      const mine = { onError: () => resolve(true) }; // (cut off by another sound: Azure did answer)
      job = mine;
      play(mine, blob, undefined, () => {}, reject);
      if (mine.audio) mine.audio.addEventListener('playing', () => resolve(true), { once: true });
    });
  }

  M.azureSpeech = {
    configured,
    usable,
    rejected: () => rejected,
    settings: () => ({ ...saved }),
    save,
    forget,
    voiceFor,
    mainVoice,
    speak,
    stop: cut,
    test,
    lastError: () => lastError,
    // (for the tests)
    ssml,
    endpoint,
    STORAGE_KEY,
  };
})(window.Mallang);
