const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;

function learnWords() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('every dialogue is well-formed: two voices, questions that point at their line', () => {
  const list = M.content.dialogues();
  assert.ok(list.length >= 12, `${list.length} dialogues`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('dialogue')), []);
  for (const topic of M.content.topics()) assert.ok(list.some((d) => d.topic === topic.id), `no dialogue for ${topic.id}`);
  for (const d of list) {
    const voices = Object.values(d.speakers).map((s) => s.voice).sort();
    assert.deepEqual(voices, ['high', 'low'], `${d.id}: one high and one low voice`);
    assert.ok(d.needs.length >= 1, `${d.id}: key words`);
    assert.ok([1, 2, 3].includes(d.level), `${d.id}: level`);
    for (const q of d.questions) {
      assert.equal(q.options.length, 3, `${d.id}: three options`);
      assert.ok(q.why, `${d.id}: explanation`);
    }
  }
});

test('Dialogues opens once the key words are known, due and new ones first', () => {
  M.store.reset();
  assert.deepEqual(M.dialogues.pickRound('all', NOON), []);
  assert.ok(M.dialogues.nextLocked());
  learnWords();
  const size = M.config.session.dialogues.perRound;
  const first = M.dialogues.pickRound('all', NOON);
  assert.equal(first.length, size);
  assert.ok(first.every((d) => d.level === 1), 'the easiest first');
  // Hear them: the next round brings others, unless one is due again.
  for (const d of first) M.srs.review(d.id, 'good', NOON);
  const second = M.dialogues.pickRound('all', NOON + 1000);
  assert.ok(second.every((d) => !first.includes(d)));
  M.srs.review(first[0].id, 'again', NOON + 2000);
  assert.equal(M.dialogues.pickRound('all', NOON + 3000)[0], first[0], 'a missed one comes back first');
});

test('Dialogues prefers the focus topic', () => {
  learnWords();
  const topic = 'shopping';
  const picked = M.dialogues.pickRound(topic, NOON);
  assert.ok(picked.length);
  assert.equal(picked[0].topic, topic);
});

test('the two speakers sound different: a second voice if there is one, else the pitch', () => {
  const d = M.content.dialogues()[0];
  const low = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'low');
  const high = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'high');
  const yuna = { name: 'Yuna', voiceURI: 'yuna', lang: 'ko-KR' };
  const injoon = { name: 'Microsoft InJoon Online (Natural)', voiceURI: 'injoon', lang: 'ko-KR' };
  M.speech = { voice: () => yuna, voices: () => [yuna] };
  let v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, yuna);
  assert.ok(v[high].pitch > 1 && v[low].pitch < 1);
  M.speech = { voice: () => yuna, voices: () => [yuna, { name: 'Sora', voiceURI: 'sora' }, injoon] };
  v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, injoon, 'a male voice for the low speaker when there is one');
  assert.equal(v[high].voice, yuna);
});

test('voices: a male main voice speaks for the low speaker, and "female" is not male', () => {
  const d = M.content.dialogues()[0];
  const low = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'low');
  const high = Object.keys(d.speakers).find((k) => d.speakers[k].voice === 'high');
  const injoon = { name: 'Microsoft InJoon Online (Natural)', voiceURI: 'injoon' };
  const sunhi = { name: 'Microsoft SunHi Online (Natural)', voiceURI: 'sunhi' };
  M.speech = { voice: () => injoon, voices: () => [injoon, sunhi] };
  let v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, injoon);
  assert.equal(v[high].voice, sunhi);
  const female = { name: 'Korean+female1', voiceURI: 'f1' };
  const other = { name: 'Korean+female2', voiceURI: 'f2' };
  M.speech = { voice: () => female, voices: () => [female, other] };
  v = M.dialogues.voicesFor(d);
  assert.equal(v[low].voice, female, 'no male voice: the same voice, a lower pitch');
  assert.ok(v[low].pitch < v[high].pitch);
});

/** A fake speech engine: each line "ends" when the test says so. */
function fakeSpeech() {
  const said = [];
  const voice = { name: 'Yuna', voiceURI: 'yuna' };
  M.speech = {
    voice: () => voice,
    voices: () => [voice],
    speak: (text, opts) => {
      said.push({ text, ...opts });
      return true;
    },
    stop: () => {},
  };
  return said;
}
const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));

test('the player plays only the lines asked for, then reports the end', async () => {
  M.config.session.dialogues.linePause = 1;
  const d = M.content.dialogues().find((x) => x.lines.length >= 4);
  const said = fakeSpeech();
  const seen = [];
  const p = M.dialogues.player(d, (i) => seen.push(i));
  p.play({ lines: [1, 3] });
  assert.equal(said.length, 1);
  assert.equal(said[0].text, d.lines[1].ko);
  said[0].onEnd();
  await tick();
  assert.equal(said.length, 2);
  assert.equal(said[1].text, d.lines[3].ko);
  said[1].onEnd();
  await tick();
  assert.equal(said.length, 2, 'line 2 is skipped');
  assert.deepEqual(seen.filter((i) => i >= 0), [1, 3]);
  assert.equal(seen[seen.length - 1], -1);
});

test('the player stops when other audio cuts it off, and after stop()', async () => {
  M.config.session.dialogues.linePause = 1;
  const d = M.content.dialogues()[0];
  let said = fakeSpeech();
  const p = M.dialogues.player(d);
  p.play();
  said[0].onError('interrupted');
  await tick();
  said[0].onEnd(); // a late "end" from the same line changes nothing
  await tick();
  assert.equal(said.length, 1, 'cut off: no more lines');
  said = fakeSpeech();
  const q = M.dialogues.player(d);
  q.play();
  q.stop();
  said[0].onEnd();
  await tick();
  assert.equal(said.length, 1, 'stopped: no more lines');
  // A real error (not an interruption) moves on to the next line.
  said = fakeSpeech();
  const r = M.dialogues.player(d);
  r.play();
  said[0].onError('synthesis-failed');
  await tick();
  assert.equal(said.length, 2);
  r.stop();
});
