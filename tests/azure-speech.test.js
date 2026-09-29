const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { loadMallang, ROOT } = require('./helpers/load');

// A browser voice (the fallback), fake audio playback and a fake Azure.
const spoken = [];
global.speechSynthesis = {
  speaking: false,
  pending: false,
  getVoices: () => [{ name: 'Yuna', lang: 'ko-KR', voiceURI: 'yuna' }],
  speak: (u) => {
    spoken.push(u.text);
    setTimeout(() => u.onend && u.onend(), 0);
  },
  cancel: () => {},
  addEventListener: () => {},
};
global.SpeechSynthesisUtterance = function (text) {
  this.text = text;
};
class FakeAudio {
  constructor() {
    this.listeners = {};
    FakeAudio.all.push(this);
  }
  play() {
    this.playing = true;
    setTimeout(() => this.listeners.playing && this.listeners.playing(), 0);
    return Promise.resolve();
  }
  pause() {
    this.playing = false;
  }
  addEventListener(type, fn) {
    this.listeners[type] = fn;
  }
  end() {
    this.playing = false;
    if (this.onended) this.onended();
  }
}
FakeAudio.all = [];
global.Audio = FakeAudio;

let calls = [];
let answer = () => ({ status: 200, body: 'mp3' });
global.fetch = async (url, options) => {
  calls.push({ url, options });
  const { status, body, throws, type = 'audio/mpeg', delay = 0 } = answer(url, options);
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  if (throws) throw new TypeError('Failed to fetch');
  return { ok: status >= 200 && status < 300, status, headers: { get: () => type }, blob: async () => new Blob([body || ''], { type }) };
};

const M = loadMallang({ content: false });
require(path.join(ROOT, 'js/core/speech.js'));
require(path.join(ROOT, 'js/core/azure-speech.js'));
const A = M.azureSpeech;
const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));
const KEY = 'not-a-real-key-just-for-tests';

function reset() {
  A.forget();
  calls = [];
  spoken.length = 0;
  FakeAudio.all.length = 0;
  answer = () => ({ status: 200, body: 'mp3' });
}

test('without a key nothing changes: the browser voice speaks', async () => {
  reset();
  M.speech.init();
  assert.equal(A.configured(), false);
  assert.equal(M.speech.status(), 'ready');
  M.speech.speak('안녕하세요');
  await tick();
  assert.deepEqual(spoken, ['안녕하세요']);
  assert.equal(calls.length, 0, 'Azure is never asked');
});

test('the key is kept apart from the progress: never in a backup', () => {
  reset();
  A.save({ key: `  ${KEY} `, region: 'Korea Central', voice: 'ko-KR-InJoonNeural' });
  assert.deepEqual(A.settings(), { key: KEY, region: 'koreacentral', voice: 'ko-KR-InJoonNeural' });
  assert.ok(localStorage.getItem(A.STORAGE_KEY).includes(KEY));
  M.store.save();
  assert.ok(!localStorage.getItem(M.config.storageKey).includes(KEY), 'not in the saved progress');
  assert.ok(!M.store.exportJson().includes(KEY), 'not in a backup file');
  A.save({ key: KEY, region: 'koreacentral', voice: 'not-a-voice' });
  assert.equal(A.mainVoice(), M.config.azureSpeech.female, 'an unknown voice falls back to the default');
  A.forget();
  assert.equal(localStorage.getItem(A.STORAGE_KEY), null);
  assert.equal(A.configured(), false);
});

test('with a key, Azure is asked once per clip, with the key only in its header', async () => {
  reset();
  let status = null;
  const off = M.events.on('speech:status', (s) => (status = s));
  A.save({ key: KEY, region: 'koreacentral', voice: 'ko-KR-SunHiNeural' });
  off();
  assert.equal(status, 'ready');
  assert.equal(M.speech.isReady(), true);
  let ended = 0;
  assert.equal(M.speech.speak('커피 & 차 <주세요>', { onEnd: () => ended++ }), true);
  await tick();
  assert.equal(calls.length, 1);
  const { url, options } = calls[0];
  assert.equal(url, 'https://koreacentral.tts.speech.microsoft.com/cognitiveservices/v1');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers['Ocp-Apim-Subscription-Key'], KEY);
  assert.equal(options.headers['Content-Type'], 'application/ssml+xml');
  assert.equal(options.headers['X-Microsoft-OutputFormat'], M.config.azureSpeech.format);
  assert.ok(!url.includes(KEY) && !options.body.includes(KEY), 'the key is only in the header');
  assert.equal(options.body, "<speak version='1.0' xml:lang='ko-KR'><voice name='ko-KR-SunHiNeural'>커피 &amp; 차 &lt;주세요&gt;</voice></speak>");
  const audio = FakeAudio.all[0];
  assert.ok(audio.playing);
  assert.equal(audio.playbackRate, M.store.state.settings.speechRate, 'the speed from Settings');
  audio.end();
  assert.equal(ended, 1);
  assert.equal(spoken.length, 0, 'the browser voice stayed quiet');
  // The same clip again: no new request, and a slower speed reuses it (on the same <audio>).
  M.speech.speak('커피 & 차 <주세요>', { rate: 0.7 });
  await tick();
  assert.equal(calls.length, 1);
  assert.equal(FakeAudio.all.length, 1, 'one <audio> for every clip');
  assert.equal(audio.playbackRate, 0.7);
  // Another voice is another clip.
  M.speech.speak('커피 & 차 <주세요>', { azure: 'ko-KR-InJoonNeural' });
  await tick();
  assert.equal(calls.length, 2);
  assert.ok(calls[1].options.body.includes("name='ko-KR-InJoonNeural'"));
});

test('a newer line or stop() cuts the one playing, as with the browser voice', async () => {
  reset();
  A.save({ key: KEY, region: 'eastus' });
  const errors = [];
  M.speech.speak('하나', { onError: (code) => errors.push(`one:${code}`) });
  await tick();
  M.speech.speak('둘', { onError: (code) => errors.push(`two:${code}`) });
  await tick();
  assert.deepEqual(errors, ['one:interrupted']);
  M.speech.stop();
  await tick();
  assert.deepEqual(errors, ['one:interrupted', 'two:interrupted']);
});

test('when Azure refuses, the browser voice speaks, and Azure rests for a while', async () => {
  reset();
  M.speech.init();
  A.save({ key: 'wrong', region: 'koreacentral' });
  answer = () => ({ status: 401 });
  const problems = [];
  const off = M.events.on('speech:azure-error', (e) => problems.push(e.code));
  let ended = 0;
  M.speech.speak('사과', { onEnd: () => ended++ });
  await tick(20);
  assert.deepEqual(spoken, ['사과'], 'the browser voice said it');
  assert.equal(ended, 1, 'and the caller heard the end');
  assert.deepEqual(problems, ['key']);
  M.speech.speak('바나나');
  await tick(20);
  assert.equal(calls.length, 1, 'no new request right after a refusal');
  assert.deepEqual(spoken, ['사과', '바나나']);
  // The free tier's limit, and no connection at all.
  reset();
  A.save({ key: KEY, region: 'koreacentral' });
  answer = () => ({ status: 429 });
  M.speech.speak('딸기');
  await tick(20);
  answer = () => ({ throws: true });
  A.save({ key: KEY, region: 'koreacentral' }); // (saving again ends the rest)
  M.speech.speak('포도');
  await tick(20);
  off();
  assert.deepEqual(problems, ['key', 'limit', 'network']);
  assert.deepEqual(spoken, ['딸기', '포도']);
});

test('a refused key stops counting as a voice; a line cut off while Azure fails still makes it wait', async () => {
  reset();
  A.save({ key: 'wrong', region: 'koreacentral' });
  assert.equal(A.usable(), true);
  answer = () => ({ status: 401, delay: 20 });
  M.speech.speak('하나');
  M.speech.speak('둘'); // (cuts off 하나 while Azure is still answering)
  await tick(60);
  assert.equal(A.rejected(), true);
  assert.equal(A.usable(), false, 'games no longer count on Azure');
  const asked = calls.length;
  M.speech.speak('셋');
  await tick(30);
  assert.equal(calls.length, asked, 'no request while it waits');
  A.save({ key: KEY, region: 'koreacentral' });
  assert.equal(A.rejected(), false, 'new settings: a fresh start');
});

test('the fallback never cancels a newer line, and only audio is kept', async () => {
  reset();
  A.save({ key: KEY, region: 'koreacentral' });
  answer = () => ({ status: 500, delay: 20 });
  const errors = [];
  M.speech.speak('사과', { onError: (code) => errors.push(code) });
  M.speech.speakLater('배', 40); // a newer line, waiting
  await tick(120);
  assert.ok(!spoken.includes('사과'), 'the older line gave way');
  assert.ok(spoken.includes('배'), 'the newer one was said');
  assert.deepEqual(errors, ['interrupted']);
  // A page that isn't audio (e.g. a network's login page) is not played or kept.
  reset();
  A.save({ key: KEY, region: 'koreacentral' });
  answer = () => ({ status: 200, body: '<html>', type: 'text/html' });
  M.speech.speak('포도');
  await tick(20);
  assert.deepEqual(spoken, ['포도'], 'the browser voice said it');
  answer = () => ({ status: 200, body: 'mp3' });
  A.save({ key: KEY, region: 'koreacentral' });
  M.speech.speak('포도');
  await tick(20);
  assert.equal(calls.length, 2, 'asked again: the page was not kept');
});

test('dialogues get a woman’s and a man’s Azure voice', () => {
  reset();
  const { female, male } = M.config.azureSpeech;
  A.save({ key: KEY, region: 'koreacentral', voice: 'ko-KR-JiMinNeural' });
  assert.equal(A.voiceFor('female'), 'ko-KR-JiMinNeural', 'the chosen voice when it fits');
  assert.equal(A.voiceFor('male'), male);
  A.save({ key: KEY, region: 'koreacentral', voice: 'ko-KR-HyunsuNeural' });
  assert.equal(A.voiceFor('male'), 'ko-KR-HyunsuNeural');
  assert.equal(A.voiceFor('female'), female);
  for (const v of M.config.azureSpeech.voices) assert.match(v.name, /^ko-KR-[A-Za-z]+(Neural|:DragonHDLatestNeural)$/);
  // The HD voice: its own name format, and a woman's voice in dialogues.
  const hd = 'ko-KR-SunHi:DragonHDLatestNeural';
  A.save({ key: KEY, region: 'westeurope', voice: hd });
  assert.equal(A.mainVoice(), hd);
  assert.equal(A.voiceFor('female'), hd);
  assert.equal(A.voiceFor('male'), male);
  assert.equal(A.ssml('안녕', hd), "<speak version='1.0' xml:lang='ko-KR'><voice name='ko-KR-SunHi:DragonHDLatestNeural'>안녕</voice></speak>");
});

test('"Save and test" asks Azure with the settings given, and says why it failed', async () => {
  reset();
  answer = () => ({ status: 200, body: 'mp3' });
  assert.equal(await A.test({ key: KEY, region: 'westeurope', voice: 'ko-KR-SunHiNeural' }), true);
  assert.equal(calls[0].url, 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1');
  answer = () => ({ status: 401 });
  await assert.rejects(A.test({ key: 'nope', region: 'westeurope' }), (err) => err.code === 'key' && /Keys and Endpoint/.test(err.message));
  await assert.rejects(A.test({ key: KEY, region: 'not a region!' }), (err) => err.code === 'key');
});
