const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang({ content: false });
const G = M.grammar;

const V = 'verb';
const A = 'adjective';
const ENDS = ['go', 'jiman', 'aseo', 'myeon', 'nikka', 'reo', 'ttae', 'gijeone', 'hue', 'aya', 'ado', 'su', 'suNot'];
// Checked by hand, in the order of ENDS. '' = not tested, null = doesn't apply.
const TABLE = [
  ['가다', V, '가고', '가지만', '가서', '가면', '가니까', '', '갈 때', '가기 전에', '간 후에', '가야 해요', '가도 돼요', '갈 수 있어요', '갈 수 없어요'],
  ['먹다', V, '먹고', '먹지만', '먹어서', '먹으면', '먹으니까', '먹으러', '먹을 때', '먹기 전에', '먹은 후에', '먹어야 해요', '먹어도 돼요', '먹을 수 있어요', '먹을 수 없어요'],
  ['하다', V, '하고', '하지만', '해서', '하면', '하니까', '하러', '할 때', '하기 전에', '한 후에', '해야 해요', '해도 돼요', '할 수 있어요', '할 수 없어요'],
  ['공부하다', V, '공부하고', '공부하지만', '공부해서', '공부하면', '공부하니까', '공부하러', '공부할 때', '공부하기 전에', '공부한 후에', '공부해야 해요', '공부해도 돼요', '공부할 수 있어요', ''],
  ['마시다', V, '마시고', '마시지만', '마셔서', '마시면', '마시니까', '마시러', '마실 때', '마시기 전에', '마신 후에', '마셔야 해요', '마셔도 돼요', '마실 수 있어요', ''],
  ['보다', V, '보고', '보지만', '봐서', '보면', '보니까', '보러', '볼 때', '보기 전에', '본 후에', '봐야 해요', '봐도 돼요', '볼 수 있어요', ''],
  ['오다', V, '오고', '오지만', '와서', '오면', '오니까', '', '올 때', '오기 전에', '온 후에', '와야 해요', '와도 돼요', '올 수 있어요', '올 수 없어요'],
  ['배우다', V, '배우고', '배우지만', '배워서', '배우면', '배우니까', '배우러', '배울 때', '배우기 전에', '배운 후에', '배워야 해요', '배워도 돼요', '배울 수 있어요', ''],
  ['기다리다', V, '', '', '기다려서', '기다리면', '기다리니까', '', '기다릴 때', '기다리기 전에', '기다린 후에', '기다려야 해요', '기다려도 돼요', '기다릴 수 있어요', ''],
  ['되다', V, '되고', '되지만', '돼서', '되면', '되니까', '', '될 때', '', '된 후에', '돼야 해요', '', '', ''],
  ['일어나다', V, '', '', '일어나서', '일어나면', '', '', '일어날 때', '일어나기 전에', '일어난 후에', '일어나야 해요', '', '', ''],
  ['살다', V, '살고', '살지만', '살아서', '살면', '사니까', '', '살 때', '살기 전에', '산 후에', '살아야 해요', '살아도 돼요', '살 수 있어요', ''],
  ['놀다', V, '놀고', '', '놀아서', '놀면', '노니까', '놀러', '놀 때', '놀기 전에', '논 후에', '', '놀아도 돼요', '놀 수 있어요', ''],
  ['만들다', V, '만들고', '만들지만', '만들어서', '만들면', '만드니까', '만들러', '만들 때', '만들기 전에', '만든 후에', '만들어야 해요', '만들어도 돼요', '만들 수 있어요', '만들 수 없어요'],
  ['듣다', V, '듣고', '듣지만', '들어서', '들으면', '들으니까', '들으러', '들을 때', '듣기 전에', '들은 후에', '들어야 해요', '들어도 돼요', '들을 수 있어요', '들을 수 없어요'],
  ['걷다', V, '걷고', '', '걸어서', '걸으면', '걸으니까', '', '걸을 때', '걷기 전에', '걸은 후에', '걸어야 해요', '걸어도 돼요', '걸을 수 있어요', ''],
  ['돕다', V, '돕고', '돕지만', '도와서', '도우면', '도우니까', '도우러', '도울 때', '돕기 전에', '도운 후에', '도와야 해요', '도와도 돼요', '도울 수 있어요', ''],
  ['짓다', V, '짓고', '', '지어서', '지으면', '지으니까', '지으러', '지을 때', '짓기 전에', '지은 후에', '지어야 해요', '', '', ''],
  ['부르다', V, '부르고', '', '불러서', '부르면', '부르니까', '부르러', '부를 때', '부르기 전에', '부른 후에', '불러야 해요', '불러도 돼요', '부를 수 있어요', ''],
  ['쓰다', V, '쓰고', '쓰지만', '써서', '쓰면', '쓰니까', '쓰러', '쓸 때', '쓰기 전에', '쓴 후에', '써야 해요', '써도 돼요', '쓸 수 있어요', ''],
  ['앉다', V, '앉고', '', '앉아서', '앉으면', '앉으니까', '', '앉을 때', '앉기 전에', '앉은 후에', '앉아야 해요', '앉아도 돼요', '앉을 수 있어요', ''],
  ['읽다', V, '읽고', '읽지만', '읽어서', '읽으면', '읽으니까', '읽으러', '읽을 때', '읽기 전에', '읽은 후에', '읽어야 해요', '읽어도 돼요', '읽을 수 있어요', ''],
  ['씻다', V, '', '', '씻어서', '씻으면', '', '', '씻을 때', '씻기 전에', '씻은 후에', '씻어야 해요', '', '', ''],
  ['입다', V, '', '', '입어서', '입으면', '', '', '입을 때', '', '입은 후에', '', '입어도 돼요', '', ''],
  ['타다', V, '', '', '타서', '타면', '타니까', '타러', '탈 때', '타기 전에', '탄 후에', '타야 해요', '타도 돼요', '탈 수 있어요', ''],
  ['춥다', A, '춥고', '춥지만', '추워서', '추우면', '추우니까', null, '추울 때', null, null, '', null, null, null],
  ['덥다', A, '덥고', '덥지만', '더워서', '더우면', '더우니까', null, '더울 때', null, null, '', null, null, null],
  ['바쁘다', A, '바쁘고', '바쁘지만', '바빠서', '바쁘면', '바쁘니까', null, '바쁠 때', null, null, '', null, null, null],
  ['아프다', A, '아프고', '아프지만', '아파서', '아프면', '아프니까', null, '아플 때', null, null, '', null, null, null],
  ['비싸다', A, '비싸고', '비싸지만', '비싸서', '비싸면', '비싸니까', null, '비쌀 때', null, null, '', null, null, null],
  ['좋다', A, '좋고', '좋지만', '좋아서', '좋으면', '좋으니까', null, '좋을 때', null, null, '', null, null, null],
  ['그렇다', A, '그렇고', '그렇지만', '그래서', '그러면', '그러니까', null, '그럴 때', null, null, '', null, null, null],
  ['있다', A, '있고', '있지만', '있어서', '있으면', '있으니까', null, '있을 때', null, null, '있어야 해요', null, null, null],
  ['없다', A, '', '없지만', '없어서', '없으면', '없으니까', null, '없을 때', null, null, '', null, null, null],
  ['맛있다', A, '맛있고', '맛있지만', '맛있어서', '맛있으면', '맛있으니까', null, '맛있을 때', null, null, '', null, null, null],
];

test('the grammar engine matches the hand-checked table', () => {
  for (const [dict, pos, ...expected] of TABLE) {
    ENDS.forEach((id, i) => {
      const want = expected[i];
      if (want === '') return;
      const got = G.form(dict, id, { pos });
      if (want === null) assert.equal(got, null, `${dict} ${id} should not apply`);
      else assert.equal(got && got.text, want, `${dict} ${id}`);
    });
  }
});

test('past tense before -고, -지만, -(으)니까 and -(으)ㄹ 때, and nowhere else', () => {
  const past = (dict, id, pos = V) => (G.form(dict, id, { pos, tense: 'past' }) || {}).text;
  assert.equal(past('오다', 'jiman'), '왔지만');
  assert.equal(past('먹다', 'go'), '먹었고');
  assert.equal(past('하다', 'nikka'), '했으니까');
  assert.equal(past('가다', 'ttae'), '갔을 때');
  assert.equal(past('춥다', 'jiman', A), '추웠지만');
  assert.equal(past('듣다', 'nikka'), '들었으니까');
  for (const id of ['aseo', 'myeon', 'reo', 'gijeone', 'hue', 'aya', 'ado', 'su']) assert.equal(G.form('가다', id, { tense: 'past' }), null, id);
});

test('other correct spellings are accepted, never offered as wrong', () => {
  assert.ok(G.form('마시다', 'aseo').variants.includes('마시어서'));
  assert.ok(G.form('가다', 'aya').variants.includes('가야 돼요'));
  assert.ok(G.form('먹다', 'ado').variants.includes('먹어도 괜찮아요'));
  assert.ok(G.form('되다', 'aseo').variants.includes('되어서'));
  assert.deepEqual(G.form('오다', 'aseo').variants, [], '오아서 is not standard');
});

test('typical slips are offered, each explained, and never a correct form', () => {
  const has = (dict, id, text, pos = V) => assert.ok(G.slips(dict, id, { pos }).some((s) => s.text === text), `${dict} ${id}: ${text}`);
  has('먹다', 'aseo', '먹아서');
  has('먹다', 'aseo', '먹었어서');
  has('듣다', 'aseo', '듣어서');
  has('춥다', 'aseo', '춥어서', A);
  has('가다', 'aseo', '가아서');
  has('되다', 'aseo', '되서');
  has('공부하다', 'aseo', '공부하서');
  has('오다', 'aseo', '오아서');
  has('짓다', 'aseo', '져서');
  has('모르다', 'aseo', '모라서');
  has('바쁘다', 'aseo', '바뻐서', A);
  has('먹다', 'myeon', '먹면');
  has('가다', 'myeon', '가으면');
  has('살다', 'myeon', '살으면');
  has('듣다', 'myeon', '듣으면');
  has('춥다', 'myeon', '춥으면', A);
  has('살다', 'nikka', '살니까');
  has('살다', 'nikka', '살으니까');
  has('놀다', 'reo', '놀으러');
  has('먹다', 'reo', '먹러');
  has('먹다', 'reo', '먹어러');
  has('가다', 'ttae', '가을 때');
  has('살다', 'ttae', '살을 때');
  has('먹다', 'ttae', '먹는 때');
  has('먹다', 'jiman', '먹어지만');
  has('듣다', 'go', '들고');
  has('먹다', 'gijeone', '먹었기 전에');
  has('먹다', 'gijeone', '먹은 전에');
  has('가다', 'hue', '가은 후에');
  has('먹다', 'hue', '먹는 후에');
  has('먹다', 'hue', '먹기 후에');
  has('살다', 'hue', '살은 후에');
  has('듣다', 'hue', '듣은 후에');
  has('먹다', 'aya', '먹아야 해요');
  has('가다', 'aya', '가아야 해요');
  has('먹다', 'ado', '먹도 돼요');
  has('가다', 'su', '가을 수 있어요');
  has('먹다', 'su', '먹는 수 있어요');

  const squash = (t) => t.replace(/\s+/g, '');
  for (const [dict, pos] of TABLE) {
    for (const id of ENDS) {
      for (const tense of ['present', 'past']) {
        const right = G.form(dict, id, { pos, tense });
        if (!right) continue;
        const ok = new Set([right.text, ...right.variants].map(squash));
        for (const s of G.slips(dict, id, { pos, tense })) {
          assert.ok(!ok.has(squash(s.text)), `${dict} ${id} ${tense}: ${s.text} is correct`);
          assert.ok(s.why && s.why.length > 15, `${dict} ${id}: ${s.text} needs a reason`);
        }
      }
    }
  }
});

test('the past of -지만 and -(으)니까 is required when it happened in the past', () => {
  assert.ok(G.slips('오다', 'jiman', { tense: 'past' }).some((s) => s.text === '오지만'));
  assert.ok(G.slips('먹다', 'nikka', { tense: 'past' }).some((s) => s.text === '먹으니까'));
});

test('contrasts are the same word with another ending', () => {
  assert.deepEqual({ ...G.contrast('오다', 'myeon'), meaning: undefined }, { text: '오면', id: 'myeon', name: '-(으)면', meaning: undefined });
  assert.equal(G.contrast('오다', 'jiman', { tense: 'past' }).text, '왔지만');
  assert.equal(G.contrast('오다', 'aseo', { tense: 'past' }).text, '와서', '-아서 has no past: the present form is shown');
});

test('intro tables show how each ending attaches', () => {
  for (const id of ENDS) assert.ok(G.table(id).length >= 3, id);
  assert.deepEqual(G.table('myeon').map((r) => r.text), ['가면', '먹으면', '살면', '들으면', '추우면']);
  for (const id of ENDS) for (const row of G.table(id)) assert.ok(row.rule, `${id} ${row.dict}`);
});

test('question(): the blank, the right form and three explained wrong options', () => {
  const q = { ko: '배가 고프면 이거 먹어요.', en: 'If you’re hungry, eat this.', answer: '고프면', dict: '고프다', pos: 'adjective', form: 'myeon', contrast: ['jiman', 'aseo'], traps: [] };
  for (let i = 0; i < 20; i++) {
    const built = G.question(q);
    assert.equal(built.before, '배가 ');
    assert.equal(built.after, ' 이거 먹어요.');
    assert.equal(built.answer, '고프면');
    assert.equal(built.options.length, 4);
    assert.equal(built.options.filter((o) => o.correct).length, 1);
    assert.equal(new Set(built.options.map((o) => o.text)).size, 4);
    for (const o of built.options) assert.ok(o.why && o.why.length > 10, o.text);
    const kinds = built.options.map((o) => o.kind);
    assert.ok(kinds.includes('contrast') && kinds.includes('slip'), kinds.join());
    assert.ok(!built.options.some((o) => !o.correct && ['고프면'].includes(o.text)));
  }
});

test('question(): hand-written traps come first, and a variant in the sentence is the answer', () => {
  const trap = { text: '와서', why: 'For a request, use -(으)니까.' };
  const q = { ko: '비가 오니까 우산을 가져가세요.', en: 'It’s raining, so take an umbrella.', answer: '오니까', dict: '오다', form: 'nikka', contrast: ['myeon'], traps: [trap] };
  const built = G.question(q);
  assert.ok(built.options.some((o) => o.kind === 'trap' && o.text === '와서' && o.why === trap.why));
  assert.equal(built.options.length, 4);

  const v = { ko: '내일 일찍 가야 돼요.', en: 'I have to go early tomorrow.', answer: '가야 돼요', dict: '가다', form: 'aya', contrast: ['su'], traps: [] };
  const b2 = G.question(v);
  assert.equal(b2.answer, '가야 돼요');
  assert.ok(b2.options.some((o) => o.correct && o.text === '가야 돼요'));
  assert.ok(!b2.options.some((o) => !o.correct && o.text === '가야 해요'));

  const past = { ko: '어제는 바빴지만 재미있었어요.', en: 'I was busy yesterday, but it was fun.', answer: '바빴지만', dict: '바쁘다', pos: 'adjective', tense: 'past', form: 'jiman', contrast: ['go', 'aseo'], traps: [] };
  const b3 = G.question(past);
  assert.equal(b3.answer, '바빴지만');
  assert.ok(b3.options.some((o) => !o.correct && o.text === '바쁘지만'), b3.options.map((o) => o.text).join());
});

test('question(): with a variant ending (가야 돼요), the slips and explanations end the same way', () => {
  const q = { ko: '내일 아침 일찍 일어나야 돼요.', en: 'I have to get up early tomorrow morning.', answer: '일어나야 돼요', dict: '일어나다', form: 'aya', contrast: ['su'], traps: [] };
  for (let i = 0; i < 10; i++) {
    const built = G.question(q);
    assert.equal(built.answer, '일어나야 돼요');
    const slips = built.options.filter((o) => o.kind === 'slip');
    assert.ok(slips.length, 'there are slips');
    for (const s of slips) {
      assert.ok(s.text.endsWith('야 돼요'), s.text);
      assert.ok(!s.why.includes('일어나야 해요'), s.why);
    }
  }
  assert.ok(G.form('내리다', 'aya').variants.includes('내리어야 돼요'), 'unmerged forms with 돼요 are accepted too');
});
