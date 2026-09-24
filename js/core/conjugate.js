/**
 * Verb and adjective endings in the polite 해요 style.
 *
 *   conjugate('마시다', 'past') → { text: '마셨어요', steps: ['마시다 → 마시 + 어요: …', '…'] }
 *
 * Handles vowel harmony (아/어), vowels merging (마시 + 어 → 마셔), 하다 → 해,
 * and the common irregular verbs (ㅂ ㄷ ㅅ ㅎ 르 ㅡ ㄹ). Irregular verbs can't
 * be recognised from their spelling alone (입다 is regular, 춥다 isn't), so
 * they are listed below. `mistakes()` returns the wrong forms learners
 * typically produce, each with the reason it's wrong.
 */
(function (M) {
  'use strict';

  const H = M.hangul;

  /** The forms the game teaches. `verbOnly`: adjectives don't take them (✗ 춥고 싶어요). */
  const FORMS = [
    { id: 'present', ko: '현재', en: 'present', hint: '-아요/어요', sample: '해요' },
    { id: 'past', ko: '과거', en: 'past', hint: '-았어요/었어요', sample: '했어요' },
    { id: 'future', ko: '미래', en: 'future (will)', hint: '-(으)ㄹ 거예요', sample: '할 거예요' },
    { id: 'negative', ko: '부정', en: "negative (not / don't)", hint: '안 + verb', sample: '안 해요' },
    { id: 'want', ko: '희망', en: 'want to', hint: '-고 싶어요', sample: '하고 싶어요', verbOnly: true },
    { id: 'suggest', ko: '제안', en: 'shall I / shall we …?', hint: '-(으)ㄹ까요?', sample: '할까요?', verbOnly: true },
    { id: 'please', ko: '부탁', en: 'please do (for me)', hint: '-아/어 주세요', sample: '해 주세요', verbOnly: true },
  ];

  // Irregular stems. A stem is irregular when it ends with one of these.
  const IRREGULAR = {
    ㅂ: ['춥', '덥', '맵', '쉽', '어렵', '가깝', '무겁', '가볍', '귀엽', '즐겁', '반갑', '고맙', '아름답', '더럽', '차갑', '뜨겁',
      '부럽', '무섭', '싱겁', '눕', '굽', '돕', '곱', '외롭', '시끄럽', '부끄럽', '새롭', '두껍', '밉', '괴롭', '어지럽', '부드럽', '놀랍', '아깝',
      '미끄럽', '간지럽', '스럽'],
    ㄷ: ['듣', '걷', '묻', '싣', '깨닫'],
    ㅅ: ['낫', '짓', '붓', '잇', '긋', '젓'],
    ㅎ: ['그렇', '이렇', '저렇', '어떻', '빨갛', '파랗', '노랗', '하얗', '까맣', '동그랗', '커다랗', '조그맣'],
  };
  // Stems ending in 르 that simply drop ㅡ (따라요, 들러요) instead of doubling the ㄹ.
  const REGULAR_REU = ['따르', '치르', '들르'];
  // X하다 verbs where X is a noun: the negative is X 안 해요 (공부 안 해요), not 안 X해요.
  const NOUN_HADA = new Set([
    '공부', '운동', '요리', '일', '청소', '쇼핑', '전화', '산책', '수영', '여행', '노래', '숙제', '준비', '샤워', '이야기',
    '게임', '등산', '빨래', '설거지', '세수', '출발', '도착', '시작', '연습', '걱정', '생각', '주문', '계산', '포장', '운전',
    '구경', '외식', '이사', '출근', '퇴근', '말', '대답', '질문', '약속', '인사', '낚시', '캠핑', '요가', '독서', '데이트',
    '결혼', '설명', '확인', '연락', '안내', '추천', '대화', '사용', '노력', '결정', '초대', '예약', '취소', '소개', '졸업',
    '입학', '방문', '외출', '등록', '검색', '수업', '회의', '출장', '면접', '산책', '빨래', '목욕',
  ]);
  // Verbs with their own opposite instead of 안 + verb.
  const OWN_NEGATIVE = { 있다: '없다', 맛있다: '맛없다', 재미있다: '재미없다' };
  // Negatives that are fine but not the only natural choice (배 안 고파요 / 안 배고파요): not drilled.
  const NO_NEGATIVE = new Set(['알다', '배고프다', '목마르다', '화나다', '사랑하다', '모르다', '없다', '맛없다', '재미없다']);
  // 러-irregular verbs (이르러요, 푸르러요) are rare and not handled.
  const UNSUPPORTED = new Set(['이르다', '푸르다']);
  // Things that happen to you rather than things you do: no "want to", "shall we?" or "please".
  const NOT_VOLITIONAL = new Set([
    '모르다', '알다', '화나다', '좋아하다', '싫어하다', '있다', '없다', '걸리다', '나다', '사랑하다', '되다', '낫다',
    '걱정되다', '떨리다', '신나다', '놀라다',
  ]);
  // "Shall we…?" sounds odd with these (✗ 울까요?), though "want to" is fine (울고 싶어요).
  const NO_SUGGEST = new Set(['웃다', '울다', '씻다']);
  // …and "want to" is odd with these (✗ 돌고 싶어요).
  const NO_WANT = new Set(['출근하다', '돌다']);
  // Verbs whose "for me" form is a single dictionary word (도와주다, 빌려주다): 도와주세요, no space.
  const ONE_WORD_PLEASE = new Set(['돕다', '빌리다']);
  // Standard short forms, accepted when typed: 재미있어요 → 재밌어요.
  const CONTRACTIONS = [['재미있', '재밌']];
  // Noun + verb compounds where 안 goes inside, like X하다: 걱정 안 돼요, 춤 안 춰요.
  const SPLIT_NEGATIVE = { 걱정되다: '걱정', 춤추다: '춤' };
  // "Please do it (for me)" only where it's something you'd really ask for.
  const PLEASE_OK = new Set([
    // (Not 먹다/마시다: asking someone to eat or drink is 드세요. Not 건너다: "cross the road" is 건너세요.)
    '가다', '오다', '보다', '기다리다', '돕다', '말하다', '읽다', '쓰다', '가르치다', '열다', '닫다', '켜다',
    '끄다', '만들다', '사다', '보내다', '앉다', '듣다', '부르다', '고르다', '찍다', '빌리다', '바꾸다', '알리다', '계산하다',
    '포장하다', '전화하다', '주문하다', '설명하다', '확인하다', '청소하다', '요리하다', '준비하다', '연락하다', '들어오다',
    '내리다', '멈추다', '세우다', '깎다', '보이다', '넣다', '빼다', '가져오다', '노래하다', '싸다',
    '하다', '굽다', '안내하다', '추천하다',
  ]);

  const BRIGHT = new Set(['ㅏ', 'ㅗ', 'ㅑ', 'ㅘ', 'ㅛ']);

  const chars = (text) => [...text];
  const lastChar = (text) => chars(text).slice(-1)[0];
  const allButLast = (text) => chars(text).slice(0, -1).join('');
  const parts = (ch) => H.decompose(ch);
  const withFinal = (ch, final) => {
    const p = parts(ch);
    return H.compose(p.initial, p.vowel, final);
  };
  const withVowel = (ch, vowel, final = '') => H.compose(parts(ch).initial, vowel, final);

  const stemOf = (dict) => (String(dict).endsWith('다') ? String(dict).slice(0, -1) : String(dict));

  /** Which kind of stem: '하', 'ㅂ', 'ㄷ', 'ㅅ', 'ㅎ', '르', 'ㅡ', 'ㄹ' or null (regular). */
  function irregularType(stem) {
    if (!stem) return null;
    const last = lastChar(stem);
    const p = parts(last);
    if (!p) return null;
    if (last === '하') return '하';
    const listed = (kind) => IRREGULAR[kind].some((s) => stem.endsWith(s));
    if (p.final === 'ㅂ' && listed('ㅂ')) return 'ㅂ';
    if (p.final === 'ㄷ' && listed('ㄷ')) return 'ㄷ';
    if (p.final === 'ㅅ' && listed('ㅅ')) return 'ㅅ';
    if (p.final === 'ㅎ' && listed('ㅎ')) return 'ㅎ';
    if (p.final === 'ㄹ') return 'ㄹ';
    if (!p.final && last === '르' && chars(stem).length > 1 && !REGULAR_REU.some((s) => stem.endsWith(s))) return '르';
    if (!p.final && p.vowel === 'ㅡ') return 'ㅡ';
    return null;
  }

  /** 아 or 어, going by the vowel of a syllable. */
  const harmony = (ch) => (BRIGHT.has(parts(ch).vowel) ? '아' : '어');
  const vowelName = (ch) => parts(ch).vowel;

  // Vowel + 아/어 merging, for stems that end in a vowel.
  const MERGE = {
    ㅏ: { vowel: 'ㅏ', why: 'the two ㅏ sounds merge' },
    ㅓ: { vowel: 'ㅓ', why: 'the two ㅓ sounds merge' },
    ㅕ: { vowel: 'ㅕ', why: 'ㅕ swallows the 어' },
    ㅐ: { vowel: 'ㅐ', why: 'ㅐ swallows the 어' },
    ㅔ: { vowel: 'ㅔ', why: 'ㅔ swallows the 어' },
    ㅗ: { vowel: 'ㅘ', why: 'ㅗ + ㅏ merge into ㅘ' },
    ㅜ: { vowel: 'ㅝ', why: 'ㅜ + ㅓ merge into ㅝ' },
    ㅣ: { vowel: 'ㅕ', why: 'ㅣ + ㅓ merge into ㅕ' },
    ㅚ: { vowel: 'ㅙ', why: 'ㅚ + ㅓ merge into ㅙ' },
  };
  // ㅣ-stems that keep 어 separate.
  const NO_MERGE = new Set(['비']);

  /**
   * The 아/어 form ("infinitive") that the present, past and 주세요 forms are
   * built on: 마시다 → 마셔, 듣다 → 들어, 하다 → 해. Returns { text, why, variants }.
   * `variants` are other acceptable spellings (마시어 for 마셔), accepted when typing.
   */
  function infinitive(stem) {
    const type = irregularType(stem);
    const last = lastChar(stem);
    const head = allButLast(stem);
    const p = parts(last);
    const dict = `${stem}다`;

    switch (type) {
      case '하':
        return { text: `${head}해`, why: `${dict}: every 하다 becomes 해요.`, variants: [] };
      case 'ㅂ': {
        const bare = withFinal(last, '');
        if (/[돕곱]$/.test(stem)) {
          return { text: `${head}${bare}와`, why: `${dict} is ㅂ-irregular: before a vowel, ㅂ turns into 오 → ${head}${bare}와요.`, variants: [] };
        }
        return { text: `${head}${bare}워`, why: `${dict} is ㅂ-irregular: before a vowel, ㅂ turns into 우 → ${head}${bare}우 + 어요 → ${head}${bare}워요.`, variants: [] };
      }
      case 'ㄷ': {
        const l = withFinal(last, 'ㄹ');
        const end = harmony(last);
        return { text: `${head}${l}${end}`, why: `${dict} is ㄷ-irregular: before a vowel, ㄷ turns into ㄹ → ${head}${l} + ${end}요.`, variants: [] };
      }
      case 'ㅅ': {
        const bare = withFinal(last, '');
        const end = harmony(last);
        return { text: `${head}${bare}${end}`, why: `${dict} is ㅅ-irregular: before a vowel, the ㅅ drops (and the vowels don't merge) → ${head}${bare}${end}요.`, variants: [] };
      }
      case 'ㅎ': {
        const vowel = p.vowel === 'ㅑ' ? 'ㅒ' : 'ㅐ';
        const text = `${head}${withVowel(last, vowel)}`;
        return { text, why: `${dict} is ㅎ-irregular: the ㅎ drops and the vowel becomes ${vowel} → ${text}요.`, variants: [] };
      }
      case '르': {
        const prev = lastChar(head);
        const end = harmony(prev) === '아' ? '라' : '러';
        const text = `${allButLast(head)}${withFinal(prev, 'ㄹ')}${end}`;
        return { text, why: `${dict} is 르-irregular: 르 turns into ㄹ${end} → ${text}요.`, variants: [] };
      }
      case 'ㅡ': {
        if (!head) {
          const text = withVowel(last, 'ㅓ');
          return { text, why: `${dict}: the ㅡ drops before 어 → ${text}요.`, variants: [] };
        }
        const vowel = harmony(lastChar(head)) === '아' ? 'ㅏ' : 'ㅓ';
        const text = `${head}${withVowel(last, vowel)}`;
        return { text, why: `${dict}: the ㅡ drops and it follows the vowel before it (${vowelName(lastChar(head))}) → ${text}요.`, variants: [] };
      }
      default:
        break;
    }

    // Regular (and ㄹ) stems ending in a consonant: just add 아 or 어.
    if (p.final) {
      const end = harmony(last);
      const reason = end === '아' ? `the last vowel is ${p.vowel}, so it takes 아` : `the last vowel is ${p.vowel} (not ㅏ or ㅗ), so it takes 어`;
      return { text: `${stem}${end}`, why: `${dict} → ${stem} + ${end}요: ${reason}.`, variants: [] };
    }

    // Stems ending in a vowel: the vowels merge.
    const merge = !NO_MERGE.has(stem) && MERGE[p.vowel];
    if (merge) {
      const text = `${head}${withVowel(last, merge.vowel)}`;
      const end = harmony(last);
      // Unmerged spellings (마시어, 보아, 주어, 되어, 보내어) are also standard, just rare in
      // speech. After ㅏ, ㅓ, ㅕ, and for 오다 (와), merging is required.
      const optional = ['ㅗ', 'ㅜ', 'ㅣ', 'ㅚ', 'ㅐ', 'ㅔ'].includes(p.vowel) && last !== '오';
      return { text, why: `${dict} → ${stem} + ${end}요 → ${text}요: ${merge.why}.`, variants: optional ? [`${stem}${end}`] : [] };
    }
    const end = harmony(last);
    return { text: `${stem}${end}`, why: `${dict} → ${stem} + ${end}요: ${p.vowel} doesn't merge with ${end}.`, variants: [] };
  }

  /** The stem used before -(으)ㄹ and -(으)ㄹ까요: 먹을, 갈, 살, 추울, 들을, 나을, 그럴. */
  function futureStem(stem) {
    const type = irregularType(stem);
    const last = lastChar(stem);
    const head = allButLast(stem);
    const dict = `${stem}다`;
    switch (type) {
      case 'ㅂ': {
        const bare = `${head}${withFinal(last, '')}`;
        return { text: `${bare}울`, why: `${dict} is ㅂ-irregular: ㅂ turns into 우, then ㄹ is added → ${bare}울.` };
      }
      case 'ㄷ': {
        const l = `${head}${withFinal(last, 'ㄹ')}`;
        return { text: `${l}을`, why: `${dict} is ㄷ-irregular: ㄷ turns into ㄹ before a vowel → ${l} + 을.` };
      }
      case 'ㅅ': {
        const bare = `${head}${withFinal(last, '')}`;
        return { text: `${bare}을`, why: `${dict} is ㅅ-irregular: the ㅅ drops before a vowel → ${bare} + 을.` };
      }
      case 'ㅎ': {
        const text = `${head}${withFinal(last, 'ㄹ')}`;
        return { text, why: `${dict} is ㅎ-irregular: the ㅎ drops and ㄹ is added → ${text}.` };
      }
      case 'ㄹ':
        return { text: stem, why: `${dict}: the stem already ends in ㄹ, so nothing is added → ${stem}.` };
      default:
        break;
    }
    if (parts(last).final) return { text: `${stem}을`, why: `${dict}: after a consonant, add 을 → ${stem}을.` };
    const text = `${head}${withFinal(last, 'ㄹ')}`;
    return { text, why: `${dict}: after a vowel, ㄹ goes under the last syllable → ${text}.` };
  }

  /** Put ㅆ under the last syllable of the 아/어 form: 마셔 → 마셨. */
  const pastBase = (inf) => `${allButLast(inf)}${withFinal(lastChar(inf), 'ㅆ')}`;

  const isVerbOnly = (form) => !!(FORMS.find((f) => f.id === form) || {}).verbOnly;

  /** Can this form be made from this word? (Adjectives don't "want", 알다's negative isn't drilled…) */
  function applies(dict, form, { pos = 'verb' } = {}) {
    if (!/[가-힣]다$/.test(String(dict)) || /\s/.test(dict)) return false;
    if (!FORMS.some((f) => f.id === form)) return false;
    if (pos !== 'verb' && isVerbOnly(form)) return false;
    if (isVerbOnly(form) && NOT_VOLITIONAL.has(dict)) return false;
    if (form === 'suggest' && NO_SUGGEST.has(dict)) return false;
    if (form === 'want' && NO_WANT.has(dict)) return false;
    if (form === 'please' && !PLEASE_OK.has(dict)) return false;
    if (form === 'negative' && NO_NEGATIVE.has(dict)) return false;
    if (dict === '이다' || dict === '아니다' || UNSUPPORTED.has(dict)) return false;
    return true;
  }

  /**
   * Conjugate a dictionary form. Returns { text, steps, variants } or null
   * when the form doesn't apply. pos: 'verb' | 'adjective'.
   */
  function conjugate(dict, form, { pos = 'verb' } = {}) {
    const result = build(dict, form, { pos });
    if (!result) return null;
    // Standard short forms are accepted too (재밌어요 for 재미있어요).
    for (const [long, short] of CONTRACTIONS) {
      if (result.text.includes(long)) result.variants = [...result.variants, result.text.replace(long, short)];
    }
    return result;
  }

  function build(dict, form, { pos = 'verb' } = {}) {
    if (!applies(dict, form, { pos })) return null;
    const stem = stemOf(dict);
    const inf = infinitive(stem);

    if (form === 'present') {
      return { text: `${inf.text}요`, steps: [inf.why], variants: inf.variants.map((v) => `${v}요`) };
    }
    if (form === 'past') {
      const text = `${pastBase(inf.text)}어요`;
      return {
        text,
        steps: [inf.why, `Past: take ${inf.text} (drop 요), put ㅆ under its last syllable → ${pastBase(inf.text)}, then add 어요 → ${pastBase(inf.text)}어요.`],
        variants: inf.variants.map((v) => `${pastBase(v)}어요`),
      };
    }
    if (form === 'future') {
      const f = futureStem(stem);
      return { text: `${f.text} 거예요`, steps: [f.why, `Then add 거예요 → ${f.text} 거예요.`], variants: [`${f.text}거예요`] };
    }
    if (form === 'suggest') {
      const f = futureStem(stem);
      return { text: `${f.text}까요?`, steps: [f.why, `Then add 까요? → ${f.text}까요?`], variants: [] };
    }
    if (form === 'want') {
      return { text: `${stem}고 싶어요`, steps: [`Add 고 싶어요 straight to the stem: ${stem} + 고 싶어요. The verb itself doesn't change.`], variants: [] };
    }
    if (form === 'please' && ONE_WORD_PLEASE.has(dict)) {
      return {
        text: `${inf.text}주세요`,
        steps: [inf.why, `${inf.text}주다 is one word (“to do something for someone”), so: ${inf.text}주세요.`],
        variants: [`${inf.text} 주세요`],
      };
    }
    if (form === 'please') {
      return {
        text: `${inf.text} 주세요`,
        steps: [inf.why, `For “please do it (for me)”, drop the 요 and add 주세요 → ${inf.text} 주세요.`],
        variants: [`${inf.text}주세요`, ...inf.variants.map((v) => `${v} 주세요`)],
      };
    }
    // Negative
    if (OWN_NEGATIVE[dict]) {
      const opposite = conjugate(OWN_NEGATIVE[dict], 'present', { pos }).text;
      if (dict === '있다') {
        return { text: opposite, steps: [`For “there is / I have”, the opposite of 있다 is its own word, 없다 → ${opposite}. (Not 안 있어요.)`], variants: [] };
      }
      // 안 맛있어요 is also heard (a milder “not very tasty”), so it's accepted when typed.
      return {
        text: opposite,
        steps: [`${dict} has its own opposite: ${OWN_NEGATIVE[dict]} → ${opposite}. (안 ${inf.text}요 is also heard, but ${opposite} is the usual word.)`],
        variants: [`안 ${inf.text}요`],
      };
    }
    const present = `${inf.text}요`;
    if (SPLIT_NEGATIVE[dict]) {
      const head = SPLIT_NEGATIVE[dict];
      const rest = `${stem.slice(head.length)}다`;
      const restPresent = conjugate(rest, 'present', { pos }).text;
      return {
        text: `${head} 안 ${restPresent}`,
        steps: [`${dict} is ${head} (a noun) + ${rest}, so 안 goes right before ${restPresent} → ${head} 안 ${restPresent}.`],
        variants: [],
      };
    }
    const noun = stem.endsWith('하') ? stem.slice(0, -1) : null;
    if (pos === 'verb' && noun && NOUN_HADA.has(noun)) {
      return {
        text: `${noun} 안 해요`,
        steps: [`${dict} is ${noun} (a noun) + 하다, so 안 goes right before 해요 → ${noun} 안 해요.`],
        variants: [],
      };
    }
    return { text: `안 ${present}`, steps: [`Put 안 in front of the ${pos === 'verb' ? 'verb' : 'adjective'}: 안 + ${present} → 안 ${present}.`], variants: [] };
  }

  /* ---------- Wrong forms that learners really produce ---------- */

  const FORM_NAMES = {
    present: 'the present tense',
    past: 'the past tense',
    future: 'the future (“will”)',
    negative: 'the negative (“not / don’t”)',
    want: '“want to”',
    suggest: '“shall I / shall we…?”',
    please: '“please do it (for me)”',
  };

  /**
   * Wrong answers for conjugate(dict, form), each { text, why }: the same verb
   * in another form (right Korean, wrong meaning) and typical slips (irregular
   * rule missed, 아/어 mixed up, 안 in the wrong place…).
   */
  function mistakes(dict, form, { pos = 'verb' } = {}) {
    const right = conjugate(dict, form, { pos });
    if (!right) return [];
    const stem = stemOf(dict);
    const type = irregularType(stem);
    const last = lastChar(stem);
    const p = parts(last);
    const accepted = new Set([right.text, ...right.variants].map((t) => t.replace(/\s+/g, '')));
    const out = [];
    const add = (text, why, kind) => {
      if (!text || accepted.has(text.replace(/\s+/g, '')) || out.some((m) => m.text === text)) return;
      out.push({ text, why, kind });
    };
    const rightWhy = right.steps[0];

    // Slips inside the form asked for.
    if (form === 'present' || form === 'past' || form === 'please') {
      const shape = (inf) => (form === 'present' ? `${inf}요` : form === 'past' ? `${pastBase(inf)}어요` : `${inf} 주세요`);
      const head = allButLast(stem);
      const bare = withFinal(last, '');
      if (['ㅂ', 'ㄷ', 'ㅅ', 'ㅎ'].includes(type)) add(shape(`${stem}${harmony(last)}`), rightWhy, 'irregular'); // 춥어요, 듣어요, 낫아요
      if (type === 'ㅂ' && /[돕곱]$/.test(stem)) add(shape(`${head}${bare}워`), rightWhy, 'irregular'); // 도워요
      if (type === 'ㅅ') {
        // The vowels don't merge once the ㅅ is gone: 지어요, not 져요.
        const m = MERGE[parts(last).vowel];
        if (m) add(shape(`${head}${withVowel(last, m.vowel)}`), rightWhy, 'merge');
      }
      if (type === '르') add(shape(`${head}${withVowel(last, harmony(lastChar(head)) === '아' ? 'ㅏ' : 'ㅓ')}`), rightWhy, 'irregular'); // 모라요
      if (type === 'ㅡ') {
        if (head) {
          // 바쁘다 → ✗바뻐요: after the ㅡ drops, the vowel follows the syllable before it.
          add(shape(`${head}${withVowel(last, harmony(lastChar(head)) === '아' ? 'ㅓ' : 'ㅏ')}`), rightWhy, 'harmony');
        } else {
          add(shape(`${stem}어`), rightWhy, 'irregular'); // 쓰어요
        }
      }
      if ((!type || type === 'ㄹ') && p.final) add(shape(`${stem}${harmony(last) === '아' ? '어' : '아'}`), rightWhy, 'harmony'); // 먹아요
      if (!type && !p.final) {
        if (['ㅏ', 'ㅓ', 'ㅕ'].includes(p.vowel)) add(shape(`${stem}${harmony(last)}`), `${rightWhy} (${stem}${harmony(last)}요 is never written.)`, 'merge'); // 가아요
        else if (form === 'present') add(`${stem}요`, rightWhy, 'merge'); // 마시요, 되요
        else if (form === 'past') add(`${head}${withFinal(last, 'ㅆ')}어요`, rightWhy, 'merge'); // 마싰어요, 됬어요
      }
      if (form === 'past') add(`${pastBase(infinitive(stem).text)}요`, 'The past tense ends in ㅆ + 어요, not just ㅆ요.', 'ending'); // 마셨요
      if (form === 'present' && type === '하') add(`${stem}요`, rightWhy, 'ending'); // 공부하요
    }
    if (form === 'future' || form === 'suggest') {
      // 가을 거예요, 살을 거예요, 춥을 거예요: 을 only follows a consonant that stays.
      const tail = form === 'future' ? ' 거예요' : '까요?';
      const why = futureStem(stem).why;
      if (['ㄹ', 'ㅂ', 'ㄷ', 'ㅅ', 'ㅎ'].includes(type) || (!type && !p.final)) add(`${stem}을${tail}`, why, type ? 'irregular' : 'ending');
      // 르 and ㅡ only change before 아/어: ✗몰를 거예요, ✗배고팔 거예요.
      const head = allButLast(stem);
      const change = `The change in ${infinitive(stem).text}요 only happens before 아/어. ${why}`;
      if (type === '르') add(`${allButLast(head)}${withFinal(lastChar(head), 'ㄹ')}를${tail}`, change, 'irregular');
      if (type === 'ㅡ') {
        const vowel = head && harmony(lastChar(head)) === '아' ? 'ㅏ' : 'ㅓ';
        add(`${head}${withVowel(last, vowel, 'ㄹ')}${tail}`, change, 'irregular');
      }
      // A very common misspelling, even among Koreans: 거에요 for 거예요.
      if (form === 'future') add(`${futureStem(stem).text} 거에요`, 'It’s spelled 거예요 (거 + 이에요 → 거예요). 거에요 is a common misspelling.', 'spelling');
    }
    if (form === 'want') {
      add(`${infinitive(stem).text}요 싶어요`, '고 싶어요 goes straight onto the stem. Don’t conjugate the verb first.', 'ending');
      add(`${stem}고 싶다요`, 'The polite ending is 싶어요 (싶다 → 싶어요).', 'ending');
    }
    if (form === 'negative') {
      const present = conjugate(dict, 'present', { pos }).text;
      if (dict === '있다') add(`안 ${present}`, rightWhy, 'negative');
      else if (OWN_NEGATIVE[dict]) {
        // 안 맛있어요 is also heard, so it's never offered as wrong.
      } else if (right.text.includes(' 안 ') && !SPLIT_NEGATIVE[dict]) add(`안 ${present}`, rightWhy, 'negative'); // 안 공부해요
      else add(`${present} 안`, `안 comes before the ${pos === 'verb' ? 'verb' : 'adjective'}, not after it.`, 'negative');
      // 못 (can't) only makes sense with things you do on purpose.
      if (pos === 'verb' && !OWN_NEGATIVE[dict] && !SPLIT_NEGATIVE[dict] && !NOT_VOLITIONAL.has(dict)) {
        add(right.text.replace('안 ', '못 '), '못 means “can’t”. For “don’t”, use 안.', 'negative');
      }
    }

    // The same verb in other forms: real Korean, but not the form asked for.
    // (Not the present for "shall we?": in 해요체, 가요 can also mean "let's go".)
    for (const f of FORMS) {
      if (f.id === form || !applies(dict, f.id, { pos })) continue;
      if (form === 'suggest' && f.id === 'present') continue;
      const other = conjugate(dict, f.id, { pos });
      add(other.text, `${other.text} is ${FORM_NAMES[f.id]}.`, 'other-form');
    }
    return out;
  }

  M.conjugate = { FORMS, NOUN_HADA, irregularType, stemOf, infinitive, futureStem, applies, conjugate, mistakes };
})(window.Mallang);
