const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang, NOON } = require('./helpers/load');

const M = loadMallang({ games: true });
const { DAY } = M.config.time;
const SL = M.speechLevels;
const LEVELS = ['formal', 'polite', 'casual'];

function learnWords() {
  M.store.reset();
  M.utils.random = Math.random;
  for (const w of M.content.words()) M.srs.introduce(w.id, NOON - 3 * DAY);
}

test('the speech-level sentences are well-formed, with a scene for every level', () => {
  const items = M.content.speechLevels();
  assert.ok(items.length >= 30, `${items.length} sentences`);
  assert.deepEqual(M.content.check().filter((p) => p.includes('speech')), []);
  for (const level of [1, 2, 3]) assert.ok(items.some((it) => it.level === level), `level ${level}`);
  for (const to of LEVELS) assert.ok(M.content.speechScenes().some((s) => s.to === to), `a scene for ${to}`);
  assert.deepEqual(M.content.speechCard().levels.map((l) => l.to), LEVELS);
  for (const it of items) for (const id of it.needs) assert.ok(M.content.word(id).level <= it.level, `${it.id}: ${id} is harder than the sentence`);
});

test('Speech Levels opens once the key words are known: due sentences first, a few new ones a round', () => {
  M.store.reset();
  assert.equal(SL.pickRound(NOON).length, 0, 'nothing before any words are learned');
  learnWords();
  const first = SL.pickRound(NOON);
  assert.equal(first.length, M.config.session.speechLevels.newPerRound, 'a few new sentences at a time');
  assert.ok(first.every((it) => it.level === 1), 'the easiest first');
  const known = M.content.speechLevels().find((it) => it.level === 2);
  M.srs.introduce(known.id, NOON - 3 * DAY);
  assert.ok(M.srs.isDue(known.id, NOON));
  assert.equal(SL.pickRound(NOON)[0].id, known.id, 'a due sentence comes first');
});

test('a short round asks the new sentences twice: which level first, then a harder question', () => {
  learnWords();
  const steps = SL.planRound(NOON);
  const ids = steps.map((s) => s.item.id);
  assert.ok(steps.length > new Set(ids).size, 'some sentences come back');
  for (const id of new Set(ids)) {
    const kinds = steps.filter((s) => s.item.id === id).map((s) => s.kind);
    assert.equal(kinds[0], 'which', `${id}: which level first`);
    if (kinds[1]) assert.ok(['scene', 'casual'].includes(kinds[1]), `${id}: then ${kinds[1]}`);
  }
});

test('questions get harder as a sentence grows', () => {
  const it = M.content.speechLevels().find((x) => x.scenes.length);
  assert.equal(SL.kindFor(it, 0), 'which');
  assert.equal(SL.kindFor(it, 1), 'scene');
  for (let i = 0; i < 20; i++) assert.ok(['casual', 'formal'].includes(SL.kindFor(it, 4)));
});

test('every question has exactly one right option, and every wrong one is explained', () => {
  learnWords();
  for (let round = 0; round < 5; round++) {
    for (const it of M.content.speechLevels()) {
      const questions = [
        ...LEVELS.map((to) => SL.question(it, 'which', { shown: to })),
        ...it.scenes.map((id) => SL.question(it, 'scene', { sceneId: id })),
        SL.question(it, 'casual'),
        SL.question(it, 'formal'),
      ];
      for (const q of questions) {
        const label = `${it.id} ${q.kind}${q.scene ? ` (${q.scene.id})` : ''}`;
        assert.equal(q.options.length, 3, `${label}: three options`);
        assert.equal(q.options.filter((o) => o.correct).length, 1, `${label}: one right option`);
        assert.equal(new Set(q.options.map((o) => o.text || o.to)).size, 3, `${label}: three different options`);
        for (const o of q.options.filter((x) => !x.correct)) assert.ok(o.why, `${label}: "${o.text || o.to}" is explained`);
        const right = q.options.find((o) => o.correct);
        if (q.kind === 'which') assert.equal(right.to, q.to, label);
        else assert.equal(right.text, it[q.to], `${label}: the right sentence`);
      }
    }
  }
});

test('the Speech Levels badge counts right answers', () => {
  M.store.reset();
  const badge = M.progress.BADGES.find((b) => b.id === 'speech-50');
  assert.equal(badge.earned(M.store.state), false);
  M.progress.bump('speechCorrect', 50);
  assert.equal(badge.earned(M.store.state), true);
});

test('the checker catches a broken sentence', () => {
  M.content.registerSpeechLevels({
    items: [{ id: 'broken', level: 1, en: 'I go.', formal: '갑니다.', polite: '가요.', casual: '가요.', words: ['cafe:nothing'], scenes: ['nowhere'], traps: [{ to: 'casual', text: '가요.', why: 'x' }, { to: 'casual', text: '가.', why: 'y' }, { to: 'casual', text: '가.', why: 'z' }] }],
  });
  const problems = M.content.check().filter((p) => p.includes('speech:broken'));
  for (const expected of [/must differ/, /doesn't end like casual/, /unknown word/, /unknown scene/, /trap for formal/, /one of the right sentences/, /two casual traps are the same/]) {
    assert.ok(problems.some((p) => expected.test(p)), `reports ${expected}`);
  }
});
