const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMallang } = require('./helpers/load');

const M = loadMallang();
const C = M.conjugate;

// Checked by hand. Columns: present · past · future · want · negative · suggest · please ('' = not tested, null = doesn't apply).
const V = 'verb';
const A = 'adjective';
const TABLE = [
  ['가다', V, '가요', '갔어요', '갈 거예요', '가고 싶어요', '안 가요', '갈까요?', '가 주세요'],
  ['먹다', V, '먹어요', '먹었어요', '먹을 거예요', '먹고 싶어요', '안 먹어요', '먹을까요?', null],
  ['마시다', V, '마셔요', '마셨어요', '마실 거예요', '마시고 싶어요', '안 마셔요', '마실까요?', null],
  ['보다', V, '봐요', '봤어요', '볼 거예요', '보고 싶어요', '안 봐요', '볼까요?', '봐 주세요'],
  ['오다', V, '와요', '왔어요', '올 거예요', '오고 싶어요', '안 와요', '올까요?', '와 주세요'],
  ['주다', V, '줘요', '줬어요', '줄 거예요', '', '안 줘요', '줄까요?', ''],
  ['배우다', V, '배워요', '배웠어요', '배울 거예요', '배우고 싶어요', '안 배워요', '배울까요?', ''],
  ['하다', V, '해요', '했어요', '할 거예요', '하고 싶어요', '안 해요', '할까요?', '해 주세요'],
  ['공부하다', V, '공부해요', '공부했어요', '공부할 거예요', '공부하고 싶어요', '공부 안 해요', '공부할까요?', null],
  ['운동하다', V, '운동해요', '운동했어요', '운동할 거예요', '운동하고 싶어요', '운동 안 해요', '운동할까요?', ''],
  ['좋아하다', V, '좋아해요', '좋아했어요', '좋아할 거예요', null, '안 좋아해요', null, null],
  ['피곤하다', A, '피곤해요', '피곤했어요', '피곤할 거예요', null, '안 피곤해요', null, null],
  ['듣다', V, '들어요', '들었어요', '들을 거예요', '듣고 싶어요', '안 들어요', '들을까요?', '들어 주세요'],
  ['걷다', V, '걸어요', '걸었어요', '걸을 거예요', '걷고 싶어요', '안 걸어요', '걸을까요?', ''],
  ['묻다', V, '물어요', '물었어요', '물을 거예요', '묻고 싶어요', '', '물을까요?', ''],
  ['받다', V, '받아요', '받았어요', '받을 거예요', '받고 싶어요', '안 받아요', '받을까요?', ''],
  ['닫다', V, '닫아요', '닫았어요', '닫을 거예요', '', '안 닫아요', '닫을까요?', '닫아 주세요'],
  ['춥다', A, '추워요', '추웠어요', '추울 거예요', null, '안 추워요', null, null],
  ['덥다', A, '더워요', '더웠어요', '더울 거예요', null, '안 더워요', null, null],
  ['맵다', A, '매워요', '매웠어요', '매울 거예요', null, '안 매워요', null, null],
  ['어렵다', A, '어려워요', '어려웠어요', '어려울 거예요', null, '안 어려워요', null, null],
  ['가깝다', A, '가까워요', '가까웠어요', '가까울 거예요', null, '안 가까워요', null, null],
  ['고맙다', A, '고마워요', '고마웠어요', '', null, '', null, null],
  ['돕다', V, '도와요', '도왔어요', '도울 거예요', '돕고 싶어요', '안 도와요', '도울까요?', '도와주세요'],
  ['굽다', V, '구워요', '구웠어요', '구울 거예요', '굽고 싶어요', '안 구워요', '구울까요?', '구워 주세요'],
  ['곱다', A, '고와요', '고왔어요', '고울 거예요', null, '', null, null],
  ['결혼하다', V, '결혼해요', '결혼했어요', '결혼할 거예요', '결혼하고 싶어요', '결혼 안 해요', '', ''],
  ['빌리다', V, '빌려요', '빌렸어요', '빌릴 거예요', '빌리고 싶어요', '안 빌려요', '빌릴까요?', '빌려주세요'],
  ['입다', V, '입어요', '입었어요', '입을 거예요', '입고 싶어요', '안 입어요', '입을까요?', ''],
  ['눕다', V, '누워요', '누웠어요', '누울 거예요', '눕고 싶어요', '', '', ''],
  ['낫다', V, '나아요', '나았어요', '나을 거예요', null, '', null, null],
  ['짓다', V, '지어요', '지었어요', '지을 거예요', '짓고 싶어요', '안 지어요', '지을까요?', ''],
  ['웃다', V, '웃어요', '웃었어요', '웃을 거예요', '웃고 싶어요', '안 웃어요', null, ''],
  ['울다', V, '울어요', '울었어요', '울 거예요', '울고 싶어요', '안 울어요', null, ''],
  ['씻다', V, '씻어요', '씻었어요', '씻을 거예요', '씻고 싶어요', '안 씻어요', null, ''],
  ['걱정되다', V, '걱정돼요', '걱정됐어요', '걱정될 거예요', null, '걱정 안 돼요', null, null],
  ['춤추다', V, '춤춰요', '춤췄어요', '춤출 거예요', '춤추고 싶어요', '춤 안 춰요', '춤출까요?', ''],
  ['떨리다', V, '떨려요', '떨렸어요', '떨릴 거예요', null, '안 떨려요', null, null],
  ['신나다', V, '신나요', '신났어요', '신날 거예요', null, '안 신나요', null, null],
  ['사랑하다', V, '사랑해요', '사랑했어요', '사랑할 거예요', null, null, null, null],
  ['모르다', V, '몰라요', '몰랐어요', '모를 거예요', null, null, null, null],
  ['부르다', V, '불러요', '불렀어요', '부를 거예요', '부르고 싶어요', '안 불러요', '부를까요?', '불러 주세요'],
  ['고르다', V, '골라요', '골랐어요', '고를 거예요', '고르고 싶어요', '안 골라요', '고를까요?', '골라 주세요'],
  ['빠르다', A, '빨라요', '빨랐어요', '빠를 거예요', null, '안 빨라요', null, null],
  ['다르다', A, '달라요', '달랐어요', '다를 거예요', null, '안 달라요', null, null],
  ['목마르다', A, '목말라요', '목말랐어요', '목마를 거예요', null, null, null, null],
  ['따르다', V, '따라요', '따랐어요', '따를 거예요', '', '', '', ''],
  ['들르다', V, '들러요', '들렀어요', '들를 거예요', '들르고 싶어요', '', '들를까요?', ''],
  ['쓰다', V, '써요', '썼어요', '쓸 거예요', '쓰고 싶어요', '안 써요', '쓸까요?', '써 주세요'],
  ['끄다', V, '꺼요', '껐어요', '끌 거예요', '', '안 꺼요', '끌까요?', '꺼 주세요'],
  ['크다', A, '커요', '컸어요', '클 거예요', null, '안 커요', null, null],
  ['바쁘다', A, '바빠요', '바빴어요', '바쁠 거예요', null, '안 바빠요', null, null],
  ['예쁘다', A, '예뻐요', '예뻤어요', '예쁠 거예요', null, '안 예뻐요', null, null],
  ['아프다', A, '아파요', '아팠어요', '아플 거예요', null, '안 아파요', null, null],
  ['슬프다', A, '슬퍼요', '슬펐어요', '슬플 거예요', null, '안 슬퍼요', null, null],
  ['기쁘다', A, '기뻐요', '기뻤어요', '기쁠 거예요', null, '', null, null],
  ['배고프다', A, '배고파요', '배고팠어요', '배고플 거예요', null, null, null, null],
  ['모으다', V, '모아요', '모았어요', '모을 거예요', '모으고 싶어요', '', '모을까요?', ''],
  ['살다', V, '살아요', '살았어요', '살 거예요', '살고 싶어요', '안 살아요', '살까요?', null],
  ['만들다', V, '만들어요', '만들었어요', '만들 거예요', '만들고 싶어요', '안 만들어요', '만들까요?', '만들어 주세요'],
  ['알다', V, '알아요', '알았어요', '알 거예요', null, null, null, null],
  ['놀다', V, '놀아요', '놀았어요', '놀 거예요', '놀고 싶어요', '안 놀아요', '놀까요?', ''],
  ['열다', V, '열어요', '열었어요', '열 거예요', '열고 싶어요', '안 열어요', '열까요?', '열어 주세요'],
  ['멀다', A, '멀어요', '멀었어요', '멀 거예요', null, '안 멀어요', null, null],
  ['달다', A, '달아요', '달았어요', '달 거예요', null, '안 달아요', null, null],
  ['그렇다', A, '그래요', '그랬어요', '그럴 거예요', null, '안 그래요', null, null],
  ['빨갛다', A, '빨개요', '빨갰어요', '빨갈 거예요', null, '', null, null],
  ['하얗다', A, '하얘요', '하얬어요', '하얄 거예요', null, '', null, null],
  ['어떻다', A, '어때요', '어땠어요', '어떨 거예요', null, '', null, null],
  ['좋다', A, '좋아요', '좋았어요', '좋을 거예요', null, '안 좋아요', null, null],
  ['괜찮다', A, '괜찮아요', '괜찮았어요', '괜찮을 거예요', null, '안 괜찮아요', null, null],
  ['많다', A, '많아요', '많았어요', '많을 거예요', null, '안 많아요', null, null],
  ['싫다', A, '싫어요', '싫었어요', '싫을 거예요', null, '', null, null],
  ['있다', A, '있어요', '있었어요', '있을 거예요', null, '없어요', null, null],
  ['맛있다', A, '맛있어요', '맛있었어요', '맛있을 거예요', null, '맛없어요', null, null],
  ['재미있다', A, '재미있어요', '재미있었어요', '재미있을 거예요', null, '재미없어요', null, null],
  ['읽다', V, '읽어요', '읽었어요', '읽을 거예요', '읽고 싶어요', '안 읽어요', '읽을까요?', '읽어 주세요'],
  ['앉다', V, '앉아요', '앉았어요', '앉을 거예요', '앉고 싶어요', '안 앉아요', '앉을까요?', ''],
  ['되다', V, '돼요', '됐어요', '될 거예요', null, '안 돼요', null, null],
  ['쉬다', V, '쉬어요', '쉬었어요', '쉴 거예요', '쉬고 싶어요', '안 쉬어요', '쉴까요?', ''],
  ['기다리다', V, '기다려요', '기다렸어요', '기다릴 거예요', '기다리고 싶어요', '안 기다려요', '기다릴까요?', '기다려 주세요'],
  ['보내다', V, '보내요', '보냈어요', '보낼 거예요', '보내고 싶어요', '안 보내요', '보낼까요?', '보내 주세요'],
  ['세다', V, '세요', '셌어요', '셀 거예요', '', '', '셀까요?', ''],
  ['켜다', V, '켜요', '켰어요', '켤 거예요', '켜고 싶어요', '안 켜요', '켤까요?', '켜 주세요'],
  ['서다', V, '서요', '섰어요', '설 거예요', '', '', '', ''],
  ['건너다', V, '건너요', '건넜어요', '건널 거예요', '건너고 싶어요', '안 건너요', '건널까요?', null],
  ['만나다', V, '만나요', '만났어요', '만날 거예요', '만나고 싶어요', '안 만나요', '만날까요?', ''],
  ['일어나다', V, '일어나요', '일어났어요', '일어날 거예요', '일어나고 싶어요', '안 일어나요', '일어날까요?', ''],
  ['타다', V, '타요', '탔어요', '탈 거예요', '타고 싶어요', '안 타요', '탈까요?', ''],
  ['사다', V, '사요', '샀어요', '살 거예요', '사고 싶어요', '안 사요', '살까요?', '사 주세요'],
  ['비싸다', A, '비싸요', '비쌌어요', '비쌀 거예요', null, '안 비싸요', null, null],
  ['가르치다', V, '가르쳐요', '가르쳤어요', '가르칠 거예요', '가르치고 싶어요', '안 가르쳐요', '가르칠까요?', '가르쳐 주세요'],
  ['다니다', V, '다녀요', '다녔어요', '다닐 거예요', '다니고 싶어요', '안 다녀요', '다닐까요?', ''],
  ['내리다', V, '내려요', '내렸어요', '내릴 거예요', '내리고 싶어요', '안 내려요', '내릴까요?', ''],
  ['나오다', V, '나와요', '나왔어요', '나올 거예요', '', '안 나와요', '', ''],
  ['화나다', V, '화나요', '화났어요', '화날 거예요', null, null, null, null],
];
const FORMS = ['present', 'past', 'future', 'want', 'negative', 'suggest', 'please'];

test('the conjugation engine matches the hand-checked table', () => {
  for (const [dict, pos, ...expected] of TABLE) {
    FORMS.forEach((form, i) => {
      const want = expected[i];
      if (want === '') return;
      const got = C.conjugate(dict, form, { pos });
      if (want === null) assert.equal(got, null, `${dict} ${form} should not apply`);
      else assert.equal(got && got.text, want, `${dict} ${form}`);
    });
  }
});

test('every form comes with an explanation', () => {
  for (const [dict, pos] of TABLE) {
    for (const form of FORMS) {
      const got = C.conjugate(dict, form, { pos });
      if (!got) continue;
      assert.ok(got.steps.length && got.steps.every((s) => typeof s === 'string' && s.length > 10), `${dict} ${form}`);
    }
  }
  assert.match(C.conjugate('듣다', 'present').steps[0], /ㄷ-irregular/);
  assert.match(C.conjugate('춥다', 'present', { pos: A }).steps[0], /ㅂ-irregular/);
  assert.match(C.conjugate('마시다', 'present').steps[0], /ㅣ \+ ㅓ merge into ㅕ/);
});

test('unmerged spellings are accepted only where they are standard', () => {
  assert.deepEqual(C.conjugate('마시다', 'present').variants, ['마시어요']);
  assert.deepEqual(C.conjugate('되다', 'past').variants, ['되었어요']);
  assert.deepEqual(C.conjugate('보다', 'present').variants, ['보아요']);
  assert.deepEqual(C.conjugate('오다', 'present').variants, [], '오다 is always 와요');
  assert.deepEqual(C.conjugate('가다', 'present').variants, []);
  assert.deepEqual(C.conjugate('켜다', 'present').variants, []);
});

test('typical mistakes are offered as wrong answers, and never the right one', () => {
  const has = (dict, form, text, pos = V) => assert.ok(C.mistakes(dict, form, { pos }).some((m) => m.text === text), `${dict} ${form}: ${text}`);
  has('듣다', 'present', '듣어요');
  has('춥다', 'present', '춥어요', A);
  has('돕다', 'present', '도워요');
  has('짓다', 'present', '짓어요');
  has('짓다', 'present', '져요');
  has('모르다', 'present', '모라요');
  has('쓰다', 'present', '쓰어요');
  has('바쁘다', 'present', '바뻐요', A);
  has('먹다', 'present', '먹아요');
  has('앉다', 'present', '앉어요');
  has('마시다', 'present', '마시요');
  has('되다', 'present', '되요');
  has('되다', 'past', '됬어요');
  has('가다', 'present', '가아요');
  has('가다', 'future', '가을 거예요');
  has('살다', 'future', '살을 거예요');
  has('듣다', 'future', '듣을 거예요');
  has('먹다', 'want', '먹어요 싶어요');
  has('공부하다', 'negative', '안 공부해요');
  has('있다', 'negative', '안 있어요', A);
  assert.ok(!C.mistakes('맛있다', 'negative', { pos: A }).some((m) => m.text === '안 맛있어요'), '안 맛있어요 is also heard');
  assert.ok(C.conjugate('맛있다', 'negative', { pos: A }).variants.includes('안 맛있어요'));
  assert.ok(C.conjugate('재미있다', 'present', { pos: A }).variants.includes('재밌어요'));
  assert.ok(!C.mistakes('가다', 'suggest').some((m) => m.text === '가요'), 'in 해요체, 가요 can also mean “let’s go”');
  has('먹다', 'negative', '못 먹어요');
  has('먹다', 'past', '먹어요');
  has('공부하다', 'present', '공부하요');
  has('가다', 'future', '갈 거에요');
  has('걱정되다', 'present', '걱정되요');
  assert.ok(!C.mistakes('걱정되다', 'negative').some((m) => m.text === '안 걱정돼요'), 'heard in speech, so not offered as wrong');
  assert.ok(!C.mistakes('떨리다', 'negative').some((m) => m.text.startsWith('못')), '못 needs something you do on purpose');

  const squash = (t) => t.replace(/\s+/g, '');
  for (const [dict, pos] of TABLE) {
    for (const form of FORMS) {
      const right = C.conjugate(dict, form, { pos });
      if (!right) continue;
      const ok = new Set([right.text, ...right.variants].map(squash));
      const wrong = C.mistakes(dict, form, { pos });
      assert.ok(wrong.length >= 3, `${dict} ${form} has enough wrong answers`);
      for (const m of wrong) {
        assert.ok(!ok.has(squash(m.text)), `${dict} ${form}: ${m.text} is actually right`);
        assert.ok(m.why, `${dict} ${form}: ${m.text} needs a reason`);
      }
    }
  }
});

test('content verbs agree with the engine', () => {
  const squash = (t) => M.utils.normalize(t).replace(/\s+/g, '');
  let checked = 0;
  for (const w of M.content.words()) {
    if (!w.dict || !['verb', 'adjective'].includes(w.pos) || w.id === 'cafe:please') continue; // 주세요 is a request form
    const form = w.form || 'present';
    if (form === 'present' && (/\s/.test(w.ko) || !/요$/.test(w.ko))) continue; // describing forms (뜨거운), phrases
    const got = C.conjugate(w.dict, form, { pos: w.pos });
    assert.ok(got, `${w.id}: ${w.dict} has no ${form} form`);
    assert.equal(squash(got.text), squash(w.ko), `${w.id}: ${w.dict} → ${got.text}`);
    checked++;
  }
  assert.ok(checked >= 15, `checked ${checked} verbs`);
});
