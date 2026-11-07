/**
 * Grammar patterns: the connecting and helper endings of A2 Korean, built on
 * the conjugation engine (conjugate.js).
 *
 *   form('듣다', 'myeon') → { text: '들으면', steps: ['듣다 is ㄷ-irregular: …'], variants: [], rule: 'ㄷ → ㄹ' }
 *   slips('듣다', 'myeon') → [{ text: '듣으면', why: '…' }, …]   typical wrong forms, each explained
 *
 * Endings: -고, -지만, -아서/어서, -(으)면, -(으)니까, -(으)러, -(으)ㄹ 때,
 * -기 전에, -(으)ㄴ 후에, -아/어야 해요, -아/어도 돼요, -(으)ㄹ 수 있어요/없어요,
 * -고 있어요, -아/어 보세요, -아/어 봤어요, -(으)ㄹ게요, -는데/-(으)ㄴ데,
 * the polite -(으)세요 and -(으)셨어요, -지 마세요, -(으)려고, -(으)면서 and
 * -(으)ㄴ 적이 있어요/없어요; the forms that describe a noun: 예쁜 꽃,
 * 지금 보는 영화, 어제 본 영화, 내일 볼 영화; the chatty endings that
 * say how you mean a sentence: -네요, -죠, -잖아요, -거든요; "it seems":
 * -는 / -(으)ㄴ / -(으)ㄹ 것 같아요; rules and advice: -(으)면 안 돼요 and
 * -는 게 좋겠어요; and asking nicely: -아/어 주시겠어요? and -(으)ㄹ 수 있을까요?
 * The patterns themselves (explanations, example and question sentences)
 * live in content/grammar.js and are practised in Grammar Cards.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const H = M.hangul;
  const C = M.conjugate;

  const chars = (text) => [...text];
  const lastChar = (text) => chars(text).slice(-1)[0];
  const allButLast = (text) => chars(text).slice(0, -1).join('');
  const parts = (ch) => H.decompose(ch);
  const withFinal = (ch, final) => {
    const p = parts(ch);
    return H.compose(p.initial, p.vowel, final);
  };
  const squash = (text) => String(text).replace(/\s+/g, '');

  /**
   * Every ending: its name and meaning (shown when it's the wrong choice), what
   * it attaches to, and whether it can follow the past tense or an adjective.
   *   base: 'stem'     straight onto the stem (먹 + 지만)
   *         'inf'      onto the 아/어 form (먹어 + 서)
   *         'eu'       onto the stem, with 으 after a consonant (먹으 + 면)
   *         'future'   onto the -(으)ㄹ form (먹을 + 때)
   *         'modifier' onto the -(으)ㄴ form (먹은 + 후에)
   *         'neunde'   verbs: the -는 form (먹는 + 데); adjectives: the -(으)ㄴ form (추운 + 데)
   * and, before a noun (the form is the whole answer: 예쁜 꽃, 보는 영화):
   *         'adjMod'   adjectives: -(으)ㄴ (예쁜, 작은, 추운, 긴); 있다/없다 words: -는 (맛있는)
   *         'nowMod'   verbs, now or usually: -는 (보는, 먹는, 사는)
   *         'pastMod'  verbs, already done: -(으)ㄴ (본, 먹은, 산, 들은)
   *         'futMod'   verbs, still to come: -(으)ㄹ (볼, 먹을, 살, 들을)
   * and "it seems", the form before a noun + 것 같아요 (것, “thing”, is a noun):
   *         'seemNow'  verbs -는, adjectives -(으)ㄴ (오는 / 비싼 것 같아요)
   *         'seemPast' verbs -(으)ㄴ (온 것 같아요)
   *         'seemFut'  verbs and adjectives -(으)ㄹ (올 / 추울 것 같아요)
   * and advice, the -는 form + 게 좋겠어요 (게 is short for 것이, “the thing”):
   *         'better'   verbs -는 (가는 / 만드는 게 좋겠어요)
   */
  const ENDINGS = {
    go: { name: '-고', meaning: '“and” (also “and then”)', base: 'stem', tail: '고', past: true },
    jiman: { name: '-지만', meaning: '“but”', base: 'stem', tail: '지만', past: true },
    aseo: { name: '-아서/어서', meaning: '“so / because” (a reason) or “and then” (the next step)', base: 'inf', tail: '서' },
    myeon: { name: '-(으)면', meaning: '“if / when”', base: 'eu', tail: '면' },
    nikka: { name: '-(으)니까', meaning: '“because / since”', base: 'eu', tail: '니까', past: true },
    reo: { name: '-(으)러', meaning: '“(go or come) to do …”', base: 'eu', tail: '러', verbOnly: true },
    ttae: { name: '-(으)ㄹ 때', meaning: '“when …”', base: 'future', tail: ' 때', past: true },
    gijeone: { name: '-기 전에', meaning: '“before …”', base: 'stem', tail: '기 전에', verbOnly: true },
    hue: { name: '-(으)ㄴ 후에', meaning: '“after …”', base: 'modifier', tail: ' 후에', verbOnly: true },
    aya: { name: '-아/어야 해요 (or 돼요)', meaning: '“have to / must”', base: 'inf', tail: '야 해요', alsoOk: ['야 돼요'] },
    ado: { name: '-아/어도 돼요 (or 괜찮아요)', meaning: '“may / it’s okay to”', base: 'inf', tail: '도 돼요', alsoOk: ['도 괜찮아요'], verbOnly: true },
    su: { name: '-(으)ㄹ 수 있어요', meaning: '“can”', base: 'future', tail: ' 수 있어요', verbOnly: true },
    suNot: { name: '-(으)ㄹ 수 없어요', meaning: '“can’t”', base: 'future', tail: ' 수 없어요', verbOnly: true },
    goIt: { name: '-고 있어요', meaning: '“am / is / are …-ing” (going on now, or these days)', base: 'stem', tail: '고 있어요', verbOnly: true },
    boseyo: { name: '-아/어 보세요', meaning: '“try …-ing” (please try it)', base: 'inf', tail: ' 보세요', verbOnly: true },
    bwasseoyo: { name: '-아/어 봤어요', meaning: '“have tried / have (ever) …”', base: 'inf', tail: ' 봤어요', verbOnly: true },
    lgeyo: { name: '-(으)ㄹ게요', meaning: '“I’ll …” (a promise or a decision, told to someone)', base: 'future', tail: '게요', verbOnly: true },
    neunde: { name: '-는데 / -(으)ㄴ데', meaning: '“…, and / but / so …”: it sets the scene for what comes next', base: 'neunde', tail: '데', past: true },
    seyo: { name: '-(으)세요', meaning: '“please …” (a polite request), or the polite present about someone you respect', base: 'eu', tail: '세요' },
    si: { name: '-(으)셨어요', meaning: '“did / was …” (the polite past, about someone you respect)', base: 'eu', tail: '셨어요' },
    jimaseyo: { name: '-지 마세요', meaning: '“please don’t …”', base: 'stem', tail: '지 마세요', verbOnly: true },
    ryeogo: { name: '-(으)려고', meaning: '“(in order) to …”, “so that I can …” (what you do something for)', base: 'eu', tail: '려고', verbOnly: true },
    myeonseo: { name: '-(으)면서', meaning: '“while …” (two things at the same time)', base: 'eu', tail: '면서' },
    jeogi: { name: '-(으)ㄴ 적이 있어요', meaning: '“have (ever) …” (something you’ve done at least once)', base: 'modifier', tail: ' 적이 있어요', verbOnly: true },
    jeogiNot: { name: '-(으)ㄴ 적이 없어요', meaning: '“have never …”', base: 'modifier', tail: ' 적이 없어요', verbOnly: true },
    adjN: { name: '-(으)ㄴ + noun', meaning: 'an adjective describing the noun after it (예쁜 꽃, a pretty flower)', base: 'adjMod', tail: '', adjOnly: true },
    nowN: { name: '-는 + noun', meaning: '“the … that … (does)”: a verb describing the noun after it, now or usually (지금 보는 영화, the film I’m watching)', base: 'nowMod', tail: '', verbOnly: true },
    pastN: { name: '-(으)ㄴ + noun (done)', meaning: '“the … that … did”: something that already happened (어제 본 영화, the film I saw yesterday)', base: 'pastMod', tail: '', verbOnly: true },
    futN: { name: '-(으)ㄹ + noun', meaning: '“the … that … will …, the … to …”: something still to come (내일 볼 영화, the film I’ll see tomorrow)', base: 'futMod', tail: '', verbOnly: true },
    // Chatty endings: they end the sentence, and say how you mean it.
    neyo: { name: '-네요', meaning: '“Oh, …!”: something you’ve just noticed or found out (와, 맛있네요!)', base: 'stem', tail: '네요', past: true },
    jyo: { name: '-죠 (-지요)', meaning: '“…, right?” or “of course …”: something you both know, or expect them to agree with', base: 'stem', tail: '죠', past: true },
    janayo: { name: '-잖아요', meaning: '“…, you know”, “remember?”: reminding them of something they already know', base: 'stem', tail: '잖아요', past: true },
    geodeunyo: { name: '-거든요', meaning: '“(it’s because) …, you see”: a reason or background they don’t know yet', base: 'stem', tail: '거든요', past: true },
    // It seems: a guess, from what you see or hear, and the soft way to say what you think.
    seemNow: { name: '-는 / -(으)ㄴ 것 같아요', meaning: '“it seems …”, “I think …”: a guess about now, from what you see or hear (비가 오는 것 같아요)', base: 'seemNow', tail: ' 것 같아요' },
    seemPast: { name: '-(으)ㄴ 것 같아요 (done)', meaning: '“it seems … (has) …”: a guess about something that already happened (비가 온 것 같아요)', base: 'seemPast', tail: ' 것 같아요', verbOnly: true },
    seemFut: { name: '-(으)ㄹ 것 같아요', meaning: '“it looks like … will …”, “I think … will …”: a guess about what’s coming (비가 올 것 같아요)', base: 'seemFut', tail: ' 것 같아요' },
    // Rules and advice: what you mustn't do, and what you'd better do.
    mustNot: { name: '-(으)면 안 돼요', meaning: '“must not”, “you’re not allowed to …”: a rule (여기서 사진을 찍으면 안 돼요)', base: 'eu', tail: '면 안 돼요' },
    hadBetter: { name: '-는 게 좋겠어요', meaning: '“had better …”, “it’d be best to …”: advice (우산을 가져가는 게 좋겠어요)', base: 'better', tail: ' 게 좋겠어요', verbOnly: true },
    // Asking nicely, to staff or a stranger: a favour, or whether something is possible (they end in a question mark).
    couldYou: { name: '-아/어 주시겠어요?', meaning: '“could you … (for me), please?”: asking someone to do something for you (사진 좀 찍어 주시겠어요?)', base: 'inf', tail: ' 주시겠어요', verbOnly: true },
    possible: { name: '-(으)ㄹ 수 있을까요?', meaning: '“could I …?”, “would it be possible to …?”: asking whether you can (자리를 바꿀 수 있을까요?)', base: 'future', tail: ' 수 있을까요', verbOnly: true },
  };
  const CHATTY = new Set(['neyo', 'jyo', 'janayo', 'geodeunyo']);
  /** Other correct spellings: 죠 is short for 지요 (먹지요); after ㅎ-irregular adjectives, -네요 may drop the ㅎ (그러네요). */
  function chattyVariants(id, text, stem) {
    if (id === 'jyo') return [text.replace(/죠$/, '지요')];
    if (id === 'neyo' && C.irregularType(stem) === 'ㅎ' && text === `${stem}네요`) return [`${allButLast(stem)}${withFinal(lastChar(stem), '')}네요`];
    return [];
  }
  // The endings whose form goes before a noun (the answer is the whole word: 예쁜, 보는).
  const BEFORE_NOUN = new Set(['adjMod', 'nowMod', 'pastMod', 'futMod']);
  // "It seems": which form before a noun comes before 것 같아요 (verbs and adjectives differ only for now).
  const SEEM = { seemNow: (pos) => (pos === 'verb' ? 'nowMod' : 'adjMod'), seemPast: () => 'pastMod', seemFut: () => 'futMod' };
  // Rules and advice (찍으면 안 돼요, 가는 게 좋겠어요) and asking nicely, whose answer ends a question
  // (사진 좀 찍어 주시겠어요?): the answer is the whole ending, a word of its own.
  const RULES = new Set(['mustNot', 'hadBetter']);
  const ASKING = new Set(['couldYou', 'possible']);

  // 있다/없다 and the words built on them take 는, not (으)ㄴ, as modifiers (있는), so no 후에 form here.
  const IT_EOP = /(있|없)다$/;
  // Adjectives that are verbs too, so their -는 form is right as a verb (크는 아이, a growing child; 낫는, healing).
  const ALSO_VERB = /^(크다|늦다|밝다|낫다)$/;
  // These have their own polite words (드세요, 주무세요, 계세요) or are polite already: no -(으)세요 / -(으)셨어요.
  const OWN_POLITE = /^(먹다|자다|있다|드시다|계시다|주무시다)$/;
  // 도와주다 and 도와드리다 are words of their own in the dictionary, so they're written as one: 도와주시겠어요.
  const tailOf = (dict, id) => (id === 'couldYou' && dict === '돕다' ? ENDINGS[id].tail.trim() : ENDINGS[id].tail);

  /** Can this ending be used on this word (and in this tense)? */
  function applies(dict, id, { pos = 'verb', tense = 'present' } = {}) {
    const e = ENDINGS[id];
    if (!e) return false;
    if (!/[가-힣]다$/.test(String(dict)) || /\s/.test(dict)) return false;
    if (dict === '이다' || dict === '아니다') return false;
    if (e.verbOnly && pos !== 'verb') return false;
    if (e.adjOnly && pos !== 'adjective') return false;
    if (tense === 'past' && !e.past) return false;
    if ((id === 'hue' || id === 'jeogi' || id === 'jeogiNot' || id === 'pastN' || id === 'seemPast') && IT_EOP.test(dict)) return false;
    if (id === 'seemPast' && /^(알다|모르다)$/.test(dict)) return false; // (안 / 모른 것 같아요 isn't said: 몰랐던 것 같아요)
    if (id === 'goIt' && IT_EOP.test(dict)) return false; // 있고 있어요 isn't said
    if ((id === 'boseyo' || id === 'bwasseoyo') && dict === '보다') return false; // 봐 보세요 is awkward
    if ((id === 'seyo' || id === 'si') && OWN_POLITE.test(dict)) return false;
    if (id === 'couldYou' && /(주다|드리다)$/.test(dict)) return false; // 빌려주시겠어요, not 빌려줘 주시겠어요: use the verb without 주다
    return !!C.conjugate(dict, 'present', { pos }); // e.g. rare 러-irregular verbs aren't supported
  }

  /* ---------- The stem each kind of ending attaches to ---------- */

  /** Before -(으)면, -(으)니까, -(으)러: 가, 먹으, 살 / 사, 들으, 추우, 나으, 그러. */
  function euStem(stem, tail) {
    const type = C.irregularType(stem);
    const last = lastChar(stem);
    const head = allButLast(stem);
    const bare = `${head}${withFinal(last, '')}`;
    const dict = `${stem}다`;
    switch (type) {
      case 'ㅂ':
        return { text: `${bare}우`, rule: 'ㅂ → 우', why: `${dict} is ㅂ-irregular: ㅂ turns into 우 → ${bare}우${tail}.` };
      case 'ㄷ': {
        const l = `${head}${withFinal(last, 'ㄹ')}`;
        return { text: `${l}으`, rule: 'ㄷ → ㄹ', why: `${dict} is ㄷ-irregular: before 으, ㄷ turns into ㄹ → ${l}으${tail}.` };
      }
      case 'ㅅ':
        return { text: `${bare}으`, rule: 'ㅅ drops', why: `${dict} is ㅅ-irregular: the ㅅ drops before 으 → ${bare}으${tail}.` };
      case 'ㅎ':
        return { text: bare, rule: 'ㅎ drops', why: `${dict} is ㅎ-irregular: the ㅎ drops, and there’s no 으 → ${bare}${tail}.` };
      case 'ㄹ': {
        // ㄹ drops before ㄴ, ㅅ and ㅂ: 사니까, 사세요, 사셨어요 (but 살면, 놀러).
        const next = parts(tail.trim().charAt(0)).initial;
        if (['ㄴ', 'ㅅ', 'ㅂ'].includes(next)) return { text: bare, rule: 'ㄹ drops', why: `${dict} ends in ㄹ, and ㄹ drops before ${next} → ${bare}${tail}.` };
        return { text: stem, rule: 'ㄹ stem', why: `${dict} ends in ㄹ, which takes ${tail} directly (no 으) → ${stem}${tail}.` };
      }
      default:
        break;
    }
    if (parts(last).final) return { text: `${stem}으`, rule: 'after a consonant', why: `${dict} ends in a consonant (받침), so it takes 으${tail} → ${stem}으${tail}.` };
    return { text: stem, rule: 'after a vowel', why: `${dict} ends in a vowel, so it takes ${tail} (no 으) → ${stem}${tail}.` };
  }

  /** The -(으)ㄴ form of a verb, as before 후에: 간, 먹은, 산, 들은, 도운, 지은. */
  function modifierStem(stem) {
    const type = C.irregularType(stem);
    const last = lastChar(stem);
    const head = allButLast(stem);
    const bare = `${head}${withFinal(last, '')}`;
    const dict = `${stem}다`;
    switch (type) {
      case 'ㅂ':
        return { text: `${bare}운`, rule: 'ㅂ → 우', why: `${dict} is ㅂ-irregular: ㅂ turns into 우, then ㄴ is added → ${bare}운.` };
      case 'ㄷ': {
        const l = `${head}${withFinal(last, 'ㄹ')}`;
        return { text: `${l}은`, rule: 'ㄷ → ㄹ', why: `${dict} is ㄷ-irregular: before 은, ㄷ turns into ㄹ → ${l}은.` };
      }
      case 'ㅅ':
        return { text: `${bare}은`, rule: 'ㅅ drops', why: `${dict} is ㅅ-irregular: the ㅅ drops before 은 → ${bare}은.` };
      case 'ㅎ':
      case 'ㄹ': {
        const text = `${head}${withFinal(last, 'ㄴ')}`;
        const what = type === 'ㄹ' ? 'the ㄹ drops before ㄴ' : 'the ㅎ drops and ㄴ goes under the syllable';
        return { text, rule: type === 'ㄹ' ? 'ㄹ drops' : 'ㅎ drops', why: `${dict}: ${what} → ${text}.` };
      }
      default:
        break;
    }
    if (parts(last).final) return { text: `${stem}은`, rule: 'after a consonant', why: `${dict} ends in a consonant (받침), so it takes 은 → ${stem}은.` };
    const text = `${head}${withFinal(last, 'ㄴ')}`;
    return { text, rule: 'after a vowel', why: `${dict} ends in a vowel, so ㄴ goes under the last syllable → ${text}.` };
  }

  /** A short label for how the 아/어 form is made (for the tables on the intro cards). */
  function infRule(stem, inf) {
    const type = C.irregularType(stem);
    const labels = { 하: '하다 → 해', ㅂ: 'ㅂ → 우', ㄷ: 'ㄷ → ㄹ', ㅅ: 'ㅅ drops', ㅎ: 'ㅎ drops', 르: '르 → ㄹㄹ', ㅡ: 'ㅡ drops' };
    if (type === 'ㅂ' && inf.text.endsWith('와')) return 'ㅂ → 오'; // 돕다 → 도와, 곱다 → 고와
    if (labels[type]) return labels[type];
    const p = parts(lastChar(stem));
    if (p.final) return inf.text.endsWith('아') ? '+ 아 (ㅏ/ㅗ)' : '+ 어';
    return 'vowels merge';
  }

  /** The past stem, before an ending: 갔, 먹었, 했, 들었, 추웠. */
  function pastStem(dict, pos) {
    const past = C.conjugate(dict, 'past', { pos });
    return past ? past.text.replace(/어요$/, '') : null;
  }

  /* ---------- Forms ---------- */

  /**
   * The form of an ending on a word: { text, steps, variants, rule }, or null.
   * `variants` are other correct answers (마시어서, 가야 돼요) — never offered as wrong.
   * tense: 'present' | 'past' (only for -고, -지만, -(으)니까, -(으)ㄹ 때).
   */
  function form(dict, id, { pos = 'verb', tense = 'present' } = {}) {
    if (!applies(dict, id, { pos, tense })) return null;
    const e = ENDINGS[id];
    const stem = C.stemOf(dict);
    const also = (text) => (e.alsoOk || []).map((alt) => text.replace(e.tail, alt));

    if (tense === 'past') {
      const ps = pastStem(dict, pos);
      const past = C.conjugate(dict, 'past', { pos }).text;
      const glue = { eu: '으', future: '을', neunde: '는' }[e.base] || '';
      const text = `${ps}${glue}${e.tail}`;
      return {
        text,
        steps: [`It happened in the past: ${past} → ${ps}, then add ${(glue + e.tail).trim()} → ${text}.`],
        variants: chattyVariants(id, text, stem),
        rule: 'past',
      };
    }

    if (e.base === 'stem') {
      // ㄹ drops before ㄴ: 살다 → 사네요, 멀다 → 머네요 (but 살고, 살죠).
      if (C.irregularType(stem) === 'ㄹ' && parts(e.tail.charAt(0)).initial === 'ㄴ') {
        const bare = `${allButLast(stem)}${withFinal(lastChar(stem), '')}`;
        const text = `${bare}${e.tail}`;
        return { text, steps: [`${dict} ends in ㄹ, which drops before ㄴ: ${bare} + ${e.tail.trim()} → ${text}.`], variants: [], rule: 'ㄹ drops' };
      }
      const text = `${stem}${e.tail}`;
      return {
        text,
        steps: [`${e.name} goes straight onto the stem (the dictionary form without 다): ${stem} + ${e.tail.trim()} → ${text}.`],
        variants: [...also(text), ...chattyVariants(id, text, stem)],
        rule: 'stem',
      };
    }
    if (e.base === 'inf') {
      const inf = C.infinitive(stem);
      const text = `${inf.text}${tailOf(dict, id)}`;
      return {
        text,
        steps: [inf.why, `For ${e.name}, take ${inf.text}요, drop the 요 and add ${e.tail.trim()} → ${text}.`],
        variants: [...inf.variants.flatMap((v) => [`${v}${tailOf(dict, id)}`, ...(e.alsoOk || []).map((alt) => `${v}${alt}`)]), ...also(text)],
        rule: infRule(stem, inf),
      };
    }
    if (e.base === 'eu') {
      const s = euStem(stem, e.tail);
      const variants = id === 'si' ? [`${s.text}시었어요`] : []; // 가시었어요: the long, rare form of 가셨어요
      return { text: `${s.text}${e.tail}`, steps: [s.why], variants, rule: s.rule };
    }
    if (e.base === 'neunde') return neundeForm(dict, stem, pos, e);
    if (BEFORE_NOUN.has(e.base)) return nounForm(dict, stem, e.base);
    if (SEEM[e.base]) {
      const kind = SEEM[e.base](pos);
      const m = nounForm(dict, stem, kind, pos);
      const text = `${m.text}${e.tail}`;
      // Verbs and adjectives share the -는 / -(으)ㄴ table: say which is which (as for -는데).
      let rule = m.rule;
      if (kind === 'nowMod') rule = m.rule === 'stem + 는' ? 'verb' : `verb, ${m.rule}`;
      else if (kind === 'adjMod' && !IT_EOP.test(dict)) rule = m.rule.startsWith('after') ? 'adjective' : `adjective, ${m.rule}`;
      // (People say 거 for 것: 올 거 같아요.)
      return { text, steps: [...m.steps, `것 (“thing”) is a noun, so that form goes before it: ${text}.`], variants: [`${m.text} 거 같아요`], rule };
    }
    if (e.base === 'better') {
      const m = presentModifier(stem);
      const text = `${m}${e.tail}`;
      const dropped = C.irregularType(stem) === 'ㄹ';
      const how = dropped ? `${dict} ends in ㄹ, which drops before ㄴ: ${allButLast(stem)}${withFinal(lastChar(stem), '')} + 는 → ${m}.` : `A verb takes 는 on the stem: ${stem} + 는 → ${m}.`;
      return {
        text,
        steps: [how, `Then add 게 좋겠어요 (게 is short for 것이, “the thing”: “doing it would be best”) → ${text}.`],
        variants: [`${m} 것이 좋겠어요`],
        rule: dropped ? 'ㄹ drops' : 'stem + 는',
      };
    }
    if (e.base === 'future') {
      const f = C.futureStem(stem);
      const text = `${f.text}${e.tail}`;
      return { text, steps: [f.why, `Then add ${e.tail.trim()} → ${text}.`], variants: [], rule: futureRule(stem) };
    }
    const m = modifierStem(stem);
    const text = `${m.text}${e.tail}`;
    const tried = id === 'jeogi' || id === 'jeogiNot' ? [`${C.infinitive(stem).text} 본${e.tail}`] : []; // 먹어 본 적이 있어요
    return { text, steps: [m.why, `Then add ${e.tail.trim()} → ${text}.`], variants: tried, rule: m.rule };
  }

  /** -는데 after verbs and 있다/없다 words (먹는데, 사는데, 맛있는데); -(으)ㄴ데 after adjectives (비싼데, 추운데). */
  function neundeForm(dict, stem, pos, e) {
    if (pos === 'verb' || IT_EOP.test(dict)) {
      const text = `${presentModifier(stem)}${e.tail}`;
      if (C.irregularType(stem) === 'ㄹ') return { text, steps: [`${dict} ends in ㄹ, which drops before ㄴ: ${allButLast(stem)}${withFinal(lastChar(stem), '')} + 는데 → ${text}.`], variants: [], rule: 'verb, ㄹ drops' };
      const kind = pos === 'verb' ? 'Verbs take 는데 on the stem' : `${dict} ends in ${IT_EOP.exec(dict)[1]}다, so it takes 는데, like a verb`;
      return { text, steps: [`${kind}: ${stem} + 는데 → ${text}.`], variants: [], rule: pos === 'verb' ? 'verb' : '있다/없다' };
    }
    const m = modifierStem(stem);
    const text = `${m.text}${e.tail}`;
    const rule = m.rule.startsWith('after') ? 'adjective' : `adjective, ${m.rule}`;
    return { text, steps: [`${dict} is an adjective, so it takes (으)ㄴ데. ${m.why}`, `Then add 데 → ${text}.`], variants: [], rule };
  }

  /** The forms before a noun: 예쁜, 맛있는 (adjectives); 보는, 본, 볼 (verbs). */
  function nounForm(dict, stem, base, pos = 'verb') {
    const ㄹ = C.irregularType(stem) === 'ㄹ';
    if (base === 'nowMod' || (base === 'adjMod' && IT_EOP.test(dict))) {
      const text = presentModifier(stem);
      if (base === 'adjMod') return { text, steps: [`${dict} ends in ${IT_EOP.exec(dict)[1]}다, so before a noun it takes 는, like a verb: ${stem} + 는 → ${text}.`], variants: [], rule: '있다/없다 + 는' };
      if (ㄹ) return { text, steps: [`For what happens now (or usually), a verb takes 는. ${dict} ends in ㄹ, which drops before ㄴ: ${text}.`], variants: [], rule: 'ㄹ drops' };
      return { text, steps: [`For what happens now (or usually), a verb takes 는 on the stem: ${stem} + 는 → ${text}.`], variants: [], rule: 'stem + 는' };
    }
    if (base === 'futMod') {
      const f = C.futureStem(stem);
      return { text: f.text, steps: [`For what’s still to come, ${pos === 'verb' ? 'a verb' : 'an adjective'} takes (으)ㄹ. ${f.why}`], variants: [], rule: futureRule(stem) };
    }
    const m = modifierStem(stem);
    const lead = base === 'adjMod' ? `${dict} is an adjective, so before a noun it takes (으)ㄴ.` : 'For what already happened, a verb takes (으)ㄴ.';
    return { text: m.text, steps: [`${lead} ${m.why}`], variants: [], rule: m.rule };
  }

  function futureRule(stem) {
    const type = C.irregularType(stem);
    const labels = { ㅂ: 'ㅂ → 우', ㄷ: 'ㄷ → ㄹ', ㅅ: 'ㅅ drops', ㅎ: 'ㅎ drops', ㄹ: 'ㄹ stem' };
    if (labels[type]) return labels[type];
    return parts(lastChar(stem)).final ? 'after a consonant' : 'after a vowel';
  }

  /* ---------- Typical slips, each with the reason it's wrong ---------- */

  const BRIGHT = new Set(['ㅏ', 'ㅗ', 'ㅑ', 'ㅘ', 'ㅛ']);
  const harmony = (ch) => (BRIGHT.has(parts(ch).vowel) ? '아' : '어');

  /** The present modifier (-는) of a verb: 먹는, 사는 (ㄹ drops before ㄴ). */
  function presentModifier(stem) {
    if (C.irregularType(stem) === 'ㄹ') return `${allButLast(stem)}${withFinal(lastChar(stem), '')}는`;
    return `${stem}는`;
  }

  /**
   * Wrong forms learners really produce for form(dict, id), each { text, why }:
   * a missed irregular change, 아/어 mixed up, 으 added or forgotten, the past
   * where it can't go, 는 or (으)ㄹ instead of (으)ㄴ… Never a correct form.
   */
  function slips(dict, id, { pos = 'verb', tense = 'present' } = {}) {
    const right = form(dict, id, { pos, tense });
    if (!right) return [];
    const e = ENDINGS[id];
    const stem = C.stemOf(dict);
    const type = C.irregularType(stem);
    const last = lastChar(stem);
    const head = allButLast(stem);
    const final = parts(last).final;
    const ok = new Set([right.text, ...right.variants].map(squash));
    const out = [];
    const add = (text, why) => {
      if (!text || !why || ok.has(squash(text)) || out.some((s) => squash(s.text) === squash(text))) return;
      out.push({ text, why });
    };
    const inf = C.infinitive(stem);
    const verb = pos === 'verb';

    if (tense === 'past') {
      // The same ending without the past: wrong when the English is about the past.
      if (['jiman', 'nikka', 'neunde'].includes(id) || CHATTY.has(id)) add(form(dict, id, { pos }).text, `It happened in the past, so ${e.name} takes the past too: ${right.text}.`);
      if (id === 'janayo') janayoSlip(add, right.text); // 갔자나요
      if (id === 'neyo') add(right.text.replace(/네요$/, '내요'), spelledNe(right.text)); // 갔내요
      if (id === 'jyo') add(`${right.text}요`, jyoHasYo(right.text)); // 갔죠요
      if (CHATTY.has(id)) {
        const past = C.conjugate(dict, 'past', { pos }).text;
        add(`${past.replace(/요$/, '')}${e.tail}`, `For the past, ${e.name} goes straight onto the past stem (${past} without 어요): ${pastStem(dict, pos)} + ${e.tail} → ${right.text}.`); // 갔어거든요
      }
      return out;
    }

    if (e.base === 'stem') {
      const onto = right.rule === 'ㄹ drops' ? `${head}${withFinal(last, '')} + ${e.tail.trim()} (the ㄹ drops before ㄴ)` : `${stem} + ${e.tail.trim()}`;
      if (inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes straight onto the stem, not the 아/어 form: ${onto} → ${right.text}.`); // 먹어지만, 멀어네요
      if (type === 'ㄷ') add(`${head}${withFinal(last, 'ㄹ')}${e.tail}`, `${dict}’s ㄷ only turns into ㄹ before a vowel. Before ${e.tail.trim().charAt(0)}, it stays ㄷ: ${right.text}.`); // 들지만
      if (id === 'gijeone') {
        add(`${pastStem(dict, pos)}${e.tail}`, `기 전에 never takes the past. Even for the past, say ${right.text}: the verb at the end shows the tense.`); // 먹었기 전에
        add(`${modifierStem(stem).text} 전에`, `The (으)ㄴ form goes with 후에 (after). “Before” is 기 전에: ${right.text}.`); // 먹은 전에
      }
      if (id === 'jimaseyo') {
        add(`${stem}지 말세요`, `말다 drops its ㄹ before 세요: 마세요, so ${right.text}.`); // 먹지 말세요
        // Not for noun + 하다 verbs: their 안 goes before 하다 (걱정 안 하세요, not 안 걱정하세요); a question can add that as a trap.
        if (!(head && last === '하')) add(`안 ${euStem(stem, '세요').text}세요`, `안 …(으)세요 just says someone isn’t doing it. To ask someone not to, use -지 마세요: ${right.text}.`); // 안 먹으세요
      }
      if (CHATTY.has(id) && type === 'ㄹ') {
        if (id === 'neyo') add(`${stem}${e.tail}`, `${dict} ends in ㄹ, and ㄹ drops before ㄴ: ${right.text}.`); // 살네요
        else add(`${head}${withFinal(last, '')}${e.tail}`, `${dict}’s ㄹ only drops before ㄴ, ㅂ and ㅅ. Before ${parts(e.tail.charAt(0)).initial}, it stays: ${right.text}.`); // 사죠 (for 살다)
      }
      if (id === 'janayo') janayoSlip(add, right.text); // 먹자나요
      if (id === 'neyo') add(right.text.replace(/네요$/, '내요'), spelledNe(right.text)); // 가내요
      if (id === 'jyo') add(`${right.text}요`, jyoHasYo(right.text)); // 가죠요
      // (not for verbs where -아/어 있어요 is right too: 가 있어요, 앉아 있어요, 살아 있어요…)
      if (id === 'goIt' && !/(가다|오다|앉다|서다|눕다|살다|남다|붙다)$/.test(dict)) add(`${inf.text} 있어요`, `-아/어 있어요 describes a state after something has happened (앉아 있어요 = is seated). For an action in progress, it’s -고 있어요: ${right.text}.`); // 먹어 있어요
    }

    if (e.base === 'inf') {
      const shape = (x) => `${x}${tailOf(dict, id)}`;
      const rightWhy = `${inf.why} So: ${right.text}.`;
      if (['ㅂ', 'ㄷ', 'ㅅ', 'ㅎ'].includes(type)) add(shape(`${stem}${harmony(last)}`), rightWhy); // 듣어서, 춥어서, 짓어서
      if (type === 'ㅅ') {
        const merged = { ㅣ: 'ㅕ', ㅏ: 'ㅏ', ㅓ: 'ㅓ', ㅜ: 'ㅝ', ㅡ: 'ㅓ' }[parts(last).vowel];
        if (merged) add(shape(`${head}${H.compose(parts(last).initial, merged, '')}`), `After the ㅅ drops, the vowels don’t merge: ${right.text}.`); // 져서
      }
      if (type === '르') add(shape(`${head}${H.compose(parts(last).initial, inf.text.endsWith('라') ? 'ㅏ' : 'ㅓ', '')}`), rightWhy); // 모라서
      if (type === 'ㅡ') {
        if (head) add(shape(`${head}${H.compose(parts(last).initial, harmony(lastChar(head)) === '아' ? 'ㅓ' : 'ㅏ', '')}`), rightWhy); // 바뻐서
        else add(shape(`${stem}어`), rightWhy); // 쓰어서
      }
      if ((!type || type === 'ㄹ') && final) {
        add(shape(`${stem}${harmony(last) === '아' ? '어' : '아'}`), rightWhy); // 먹아서, 살어서
        add(`${stem}${e.tail}`, `After a consonant, the 아/어 can’t be left out: ${right.text}.`); // 먹서
      }
      if (type === '하') add(`${stem}${e.tail}`, `하다 always becomes 해 here: ${right.text}.`); // 공부하서
      if (!type && !final && inf.text !== stem) add(`${stem}${e.tail}`, rightWhy); // 마시서, 되서
      if (!type && !final && ['ㅏ', 'ㅓ', 'ㅕ'].includes(parts(last).vowel)) add(shape(`${stem}${harmony(last)}`), `${stem} + ${harmony(last)} always merge: ${right.text}.`); // 가아서
      if (last === '오' && !final) add(shape(`${stem}아`), `오 + 아 always merge into 와: ${right.text}.`); // 오아서
      if (id === 'aseo') add(`${pastStem(dict, pos)}어서`, `-아서/어서 never takes the past tense. Even for the past, say ${right.text}: the verb at the end shows the tense.`); // 먹었어서
      if (id === 'couldYou') {
        const gap = tailOf(dict, id) === e.tail ? ' ' : '';
        add(`${inf.text}${gap}주겠어요`, `주겠어요 has no 시, so it doesn’t honour the person you’re asking: it’s how a boss might ask a junior. To staff or a stranger, ask with 주시겠어요: ${right.text}.`); // 찍어 주겠어요
        add(`${inf.text}${gap}드리겠어요`, `드리다 (the polite 주다) is for doing something for someone else: ${inf.text}${gap}드릴게요 means “I’ll do it for you”. To ask them to do it for you, it’s 주시겠어요: ${right.text}.`); // 찍어 드리겠어요
      }
    }

    if (e.base === 'eu') {
      // The wrong one of "with 으" / "without 으" (and the irregular change missed): 먹면, 가으면, 살으면, 살니까, 듣으면, 춥으면.
      add(`${stem}${e.tail}`, right.steps[0]);
      add(`${stem}으${e.tail}`, right.steps[0]);
      if (['reo', 'ryeogo', 'myeonseo'].includes(id) && inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes on the stem, not the 아/어 form: ${right.text}.`); // 먹어러, 먹어려고
      if (id === 'ryeogo') add(`${C.futureStem(stem).text}려고`, `People often say [${C.futureStem(stem).text}려고], but it’s written ${right.text}: no extra ㄹ.`); // 먹을려고
      if ((id === 'seyo' || id === 'si') && inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes on the stem, not the 아/어 form. ${right.steps[0]}`); // 앉아세요, 해세요
      if (id === 'si') add(`${pastStem(dict, pos)}으${e.tail}`, `In the polite past, 시 comes first and the past after it (시 + 었 → 셨): ${right.text}.`); // 갔으셨어요
      if (id === 'mustNot') {
        if (inf.text !== stem) add(`${inf.text}${e.tail}`, `-(으)면 goes on the stem, not the 아/어 form (that’s for -아/어도 돼요, “may”). ${right.steps[0]}`); // 먹어면 안 돼요
        // 안 before the verb changes the meaning: -(으)면 돼요 is “it’s enough if …”. (Only for action verbs:
        // noun + 하다 verbs put 안 before 하다, 공부 안 하면 돼요; 있다's opposite is 없다, and 알다's is 모르다.)
        const enough = right.text.replace(/ 안 돼요$/, ' 돼요');
        if (verb && !IT_EOP.test(dict) && dict !== '알다' && !(head && last === '하')) add(`안 ${enough}`, `안 ${enough} means “you just have to not …” (-(으)면 돼요 is “it’s enough if …”). For “must not”, 안 goes before 돼요: ${right.text}.`); // 안 먹으면 돼요
        add(right.text.replace(/돼요$/, '되요'), `돼요 is short for 되어요; it’s never spelled 되요: ${right.text}.`); // 먹으면 안 되요
      }
    }

    if (e.base === 'future') {
      add(`${stem}을${e.tail}`, C.futureStem(stem).why); // 가을 때, 살을 때, 듣을 수 있어요, 가을게요
      const noun = e.tail.trim().split(' ')[0];
      if (verb && !IT_EOP.test(dict) && id !== 'lgeyo') add(`${presentModifier(stem)}${e.tail}`, `${noun} takes the (으)ㄹ form: ${right.text}.`); // 먹는 때, 먹는 수 있어요
      if (id === 'lgeyo') add(right.text.replace(/게요$/, '께요'), `It sounds like [께요], but it’s spelled 게요: ${right.text}.`); // 먹을께요
      if (id === 'possible') add(`${stem}${e.tail}`, `수 needs the (으)ㄹ form before it. ${C.futureStem(stem).why} So: ${right.text}.`); // 가 수 있을까요, 먹 수 있을까요
    }

    if (e.base === 'neunde') {
      if (verb || IT_EOP.test(dict)) {
        if (IT_EOP.test(dict)) add(`${stem}은${e.tail}`, `Words ending in 있다/없다 take 는데, like verbs: ${right.text}.`); // 맛있은데
        else add(`${modifierStem(stem).text}${e.tail}`, `${dict} is a verb, so it takes 는데 (the (으)ㄴ데 form is for adjectives): ${right.text}.`); // 먹은데
        if (type === 'ㄹ') add(`${stem}는${e.tail}`, `ㄹ drops before ㄴ: ${right.text}.`); // 살는데
      } else {
        add(`${stem}는${e.tail}`, `${dict} is an adjective, so it takes (으)ㄴ데, not 는데: ${right.text}.`); // 비싸는데
        add(`${stem}은${e.tail}`, `${modifierStem(stem).why} So: ${right.text}.`); // 비싸은데, 춥은데, 멀은데
      }
    }

    if (BEFORE_NOUN.has(e.base)) {
      const present = C.conjugate(dict, 'present', { pos });
      const sentenceEnd = (text) => `${text} ends a sentence. Before a noun, ${dict} takes ${right.text}.`;
      add(dict, `The dictionary form (${dict}) never goes before a noun: ${right.text}.`); // 예쁘다 꽃, 보다 영화
      if (e.base === 'adjMod') {
        if (IT_EOP.test(dict)) add(`${stem}은`, `Words ending in 있다/없다 take 는 before a noun, like verbs: ${right.text}.`); // 맛있은
        else {
          if (!ALSO_VERB.test(dict)) add(`${stem}는`, `는 is for verbs (and words ending in 있다/없다). ${dict} is an adjective, so it takes (으)ㄴ: ${right.text}.`); // 예쁘는
          add(`${stem}은`, `${modifierStem(stem).why}`); // 예쁘은, 춥은, 길은
        }
        if (present) add(present.text, sentenceEnd(present.text)); // 예뻐요 꽃
      }
      if (e.base === 'nowMod') {
        if (type === 'ㄹ') add(`${stem}는`, `ㄹ drops before ㄴ: ${right.text}.`); // 살는, 만들는
        if (type === 'ㄷ') add(`${head}${withFinal(last, 'ㄹ')}는`, `${dict}’s ㄷ only turns into ㄹ before a vowel. Before 는, it stays: ${right.text}.`); // 들는
        if (present) add(present.text, sentenceEnd(present.text)); // 봐요 영화
      }
      if (e.base === 'pastMod') {
        add(`${stem}은`, modifierStem(stem).why); // 가은, 살은, 듣은, 돕은
        const ps = pastStem(dict, pos);
        if (ps) add(`${ps}은`, `The (으)ㄴ form already says it happened, so it never takes 었/았: ${right.text}.`); // 먹었은, 갔은
        const past = C.conjugate(dict, 'past', { pos });
        if (past) add(past.text, sentenceEnd(past.text)); // 봤어요 영화
      }
      if (e.base === 'futMod') {
        add(`${stem}을`, C.futureStem(stem).why); // 가을, 살을, 듣을
        const future = C.conjugate(dict, 'future', { pos });
        if (future) add(future.text, sentenceEnd(future.text)); // 볼 거예요 영화
      }
      return out;
    }

    if (SEEM[e.base]) {
      const kind = SEEM[e.base](pos);
      const t = (x) => `${x}${e.tail}`;
      add(t(dict), `The dictionary form (${dict}) never goes before a noun, and 것 is a noun: ${right.text}.`); // 오다 것 같아요
      const polite = C.conjugate(dict, 'present', { pos });
      if (polite) add(t(polite.text), `${polite.text} ends a sentence. Before 것 (a noun), ${dict} takes the form before a noun: ${right.text}.`); // 와요 것 같아요
      if (kind === 'adjMod') {
        if (IT_EOP.test(dict)) add(t(`${stem}은`), `Words ending in 있다/없다 take 는, like verbs: ${right.text}.`); // 맛있은 것 같아요
        else {
          if (!ALSO_VERB.test(dict)) add(t(`${stem}는`), `는 is for verbs (and words ending in 있다/없다). ${dict} is an adjective, so it takes (으)ㄴ: ${right.text}.`); // 비싸는 것 같아요
          add(t(`${stem}은`), `${modifierStem(stem).why} So: ${right.text}.`); // 비싸은, 춥은, 길은 것 같아요
        }
      }
      if (kind === 'nowMod') {
        if (type === 'ㄹ') add(t(`${stem}는`), `ㄹ drops before ㄴ: ${right.text}.`); // 살는 것 같아요
        if (type === 'ㄷ') add(t(`${head}${withFinal(last, 'ㄹ')}는`), `${dict}’s ㄷ only turns into ㄹ before a vowel. Before 는, it stays: ${right.text}.`); // 들는 것 같아요
      }
      if (kind === 'pastMod') {
        add(t(`${stem}은`), `${modifierStem(stem).why} So: ${right.text}.`); // 가은, 살은, 듣은 것 같아요
        const ps = pastStem(dict, pos);
        if (ps) {
          add(t(`${ps}은`), `The (으)ㄴ form already says it happened, so it never takes 었/았: ${right.text}.`); // 먹었은 것 같아요
          add(t(`${ps}는`), `For something that already happened, it’s the (으)ㄴ form, not 었 + 는: ${right.text}.`); // 먹었는 것 같아요
        }
      }
      if (kind === 'futMod') {
        add(t(`${stem}을`), `${C.futureStem(stem).why} So: ${right.text}.`); // 가을, 살을, 춥을 것 같아요
        // 는 on an adjective is wrong for what's coming too (not for 크다/늦다/밝다, verbs as well).
        if (!verb && !IT_EOP.test(dict) && !ALSO_VERB.test(dict)) add(t(`${stem}는`), `는 is for verbs (and words ending in 있다/없다). ${dict} is an adjective, and for what’s still to come it takes (으)ㄹ: ${right.text}.`); // 비싸는, 춥는 것 같아요
      }
      return out;
    }

    if (e.base === 'better') {
      const t = (x) => `${x}${e.tail}`;
      const m = presentModifier(stem);
      const done = modifierStem(stem).text;
      add(t(dict), `The dictionary form (${dict}) never goes before a noun, and 게 is short for 것이 (“the thing”): ${right.text}.`); // 가다 게 좋겠어요
      add(`${m} 좋겠어요`, `${m} is the form before a noun, so a noun has to follow: 게 (short for 것이, “the thing”): ${right.text}.`); // 가는 좋겠어요
      add(t(done), IT_EOP.test(dict) ? `${dict} takes 는, like other verbs: ${right.text}.` : `${done} is the (으)ㄴ form, for what already happened. Advice about what to do takes 는: ${right.text}.`); // 간 게 좋겠어요
      add(t(C.futureStem(stem).text), `게 좋겠어요 takes the 는 form, even for what you’d better do later: ${right.text}.`); // 갈 게 좋겠어요
      if (type === 'ㄹ') add(t(`${stem}는`), `ㄹ drops before ㄴ: ${right.text}.`); // 만들는 게 좋겠어요
      if (type === 'ㄷ') add(t(`${head}${withFinal(last, 'ㄹ')}는`), `${dict}’s ㄷ only turns into ㄹ before a vowel. Before 는, it stays: ${right.text}.`); // 들는 게 좋겠어요
      if (type === 'ㅂ') add(t(`${head}${withFinal(last, '')}우는`), `${dict}’s ㅂ only turns into 우 before a vowel. Before 는, it stays: ${right.text}.`); // 도우는 게 좋겠어요
      return out;
    }

    if (e.base === 'modifier') {
      const noun = id === 'hue' ? '후에' : '적';
      add(`${stem}은${e.tail}`, modifierStem(stem).why); // 가은 후에, 살은 후에, 듣은 후에, 가은 적이 있어요
      add(`${presentModifier(stem)}${e.tail}`, `${noun} takes the past-like (으)ㄴ form: ${right.text}.`); // 먹는 후에, 먹는 적이 있어요
      add(`${C.futureStem(stem).text}${e.tail}`, `${noun} takes the (으)ㄴ form, not the (으)ㄹ form: ${right.text}.`); // 먹을 후에, 먹을 적이 있어요
      if (id === 'hue') add(`${stem}기${e.tail}`, `기 goes with 전에 (before). “After” is (으)ㄴ 후에: ${right.text}.`); // 먹기 후에
    }
    return out;
  }

  /**
   * -잖아요 sounds like [자나요] after a vowel or ㄹ, [짜나요] after other consonants, so
   * learners write 자나요. (Not after ㅎ: 좋잖아요 is [조차나요], and no one writes 좋자나요.)
   */
  function janayoSlip(add, text) {
    const before = text.slice(0, -'잖아요'.length);
    const final = before ? parts(lastChar(before)).final : '';
    if (/[ㅎㄶㅀ]/.test(final)) return;
    const sound = !final || final === 'ㄹ' ? '자나요' : '짜나요';
    add(`${before}자나요`, `It sounds like [${sound}], but it’s spelled 잖아요: it comes from -지 않아요. So: ${text}.`);
  }

  /** ㅔ and ㅐ sound the same, so learners write 가내요. */
  const spelledNe = (text) => `네 and 내 sound the same, but the ending is spelled 네요 (with ㅔ): ${text}.`;
  /** 죠 is 지요 already, so learners who add the polite 요 again write 가죠요. */
  const jyoHasYo = (text) => `죠 is short for 지요, so it already has its 요: ${text}.`;

  /** The same word with another ending: correct Korean, but a different meaning. */
  function contrast(dict, otherId, { pos = 'verb', tense = 'present' } = {}) {
    const other = ENDINGS[otherId];
    if (!other) return null;
    const t = tense === 'past' && other.past ? 'past' : 'present';
    const f = form(dict, otherId, { pos, tense: t });
    return f ? { text: f.text, id: otherId, name: other.name, meaning: other.meaning } : null;
  }

  // Sample words for the "how to make it" table on each pattern's intro card.
  const SAMPLES = {
    go: [['가다'], ['먹다'], ['듣다'], ['춥다', 'adjective']],
    jiman: [['가다'], ['먹다'], ['춥다', 'adjective'], ['비싸다', 'adjective']],
    aseo: [['가다'], ['먹다'], ['하다'], ['마시다'], ['듣다'], ['춥다', 'adjective']],
    myeon: [['가다'], ['먹다'], ['살다'], ['듣다'], ['춥다', 'adjective']],
    nikka: [['가다'], ['먹다'], ['살다'], ['듣다'], ['춥다', 'adjective']],
    reo: [['보다'], ['먹다'], ['놀다'], ['듣다']],
    ttae: [['가다'], ['먹다'], ['살다'], ['듣다'], ['춥다', 'adjective']],
    gijeone: [['가다'], ['먹다'], ['자다']],
    hue: [['가다'], ['먹다'], ['살다'], ['듣다']],
    aya: [['가다'], ['먹다'], ['하다'], ['마시다']],
    ado: [['가다'], ['먹다'], ['하다'], ['앉다']],
    su: [['가다'], ['먹다'], ['만들다'], ['듣다']],
    suNot: [['가다'], ['먹다'], ['만들다'], ['듣다']],
    goIt: [['가다'], ['먹다'], ['듣다'], ['공부하다']],
    boseyo: [['가다'], ['먹다'], ['하다'], ['듣다']],
    bwasseoyo: [['가다'], ['먹다'], ['입다'], ['듣다']],
    lgeyo: [['가다'], ['먹다'], ['만들다'], ['듣다']],
    neunde: [['가다'], ['먹다'], ['살다'], ['비싸다', 'adjective'], ['춥다', 'adjective'], ['맛있다', 'adjective']],
    seyo: [['가다'], ['앉다'], ['만들다'], ['듣다'], ['돕다']],
    si: [['가다'], ['읽다'], ['만들다'], ['듣다']],
    jimaseyo: [['가다'], ['먹다'], ['만들다'], ['듣다']],
    ryeogo: [['가다'], ['먹다'], ['만들다'], ['듣다'], ['돕다']],
    myeonseo: [['가다'], ['먹다'], ['살다'], ['듣다'], ['싸다', 'adjective']],
    jeogi: [['가다'], ['먹다'], ['만들다'], ['듣다'], ['돕다']],
    jeogiNot: [['가다'], ['먹다'], ['만들다'], ['듣다'], ['돕다']],
    adjN: [['크다', 'adjective'], ['작다', 'adjective'], ['춥다', 'adjective'], ['길다', 'adjective'], ['맛있다', 'adjective']],
    nowN: [['보다'], ['먹다'], ['살다'], ['듣다']],
    pastN: [['보다'], ['먹다'], ['살다'], ['듣다'], ['돕다']],
    futN: [['보다'], ['먹다'], ['살다'], ['듣다'], ['돕다']],
    neyo: [['가다'], ['먹다'], ['살다'], ['좋다', 'adjective'], ['멀다', 'adjective']],
    jyo: [['가다'], ['먹다'], ['살다'], ['춥다', 'adjective']],
    janayo: [['가다'], ['먹다'], ['알다'], ['바쁘다', 'adjective']],
    geodeunyo: [['가다'], ['먹다'], ['살다'], ['아프다', 'adjective']],
    seemNow: [['가다'], ['먹다'], ['살다'], ['비싸다', 'adjective'], ['춥다', 'adjective'], ['맛있다', 'adjective']],
    seemPast: [['가다'], ['먹다'], ['살다'], ['듣다']],
    seemFut: [['가다'], ['먹다'], ['살다'], ['춥다', 'adjective'], ['비싸다', 'adjective']],
    mustNot: [['가다'], ['찍다'], ['만들다'], ['듣다'], ['눕다']],
    hadBetter: [['가다'], ['먹다'], ['만들다'], ['듣다'], ['쉬다']],
    couldYou: [['찍다'], ['닫다'], ['기다리다'], ['말하다'], ['쓰다'], ['부르다']],
    possible: [['가다'], ['앉다'], ['만들다'], ['듣다'], ['돕다']],
  };

  /** Rows for an intro card: [{ dict, text, rule }]. */
  function table(id) {
    return (SAMPLES[id] || [])
      .map(([dict, pos = 'verb']) => {
        const f = form(dict, id, { pos });
        return f ? { dict, text: f.text, rule: f.rule } : null;
      })
      .filter(Boolean);
  }

  /**
   * A Grammar Cards question from a content question q (see content/grammar.js):
   * the sentence around the blank and `size` options — the right form, the same
   * word with other endings (a different meaning), typical slips and hand-written
   * traps — each { text, correct, why }. Traps come first; then at least one other
   * meaning and one wrong spelling, when there are any.
   */
  function question(q, { size = 4 } = {}) {
    const e = ENDINGS[q.form];
    const right = form(q.dict, q.form, { pos: q.pos, tense: q.tense });
    if (!e || !right) return null;
    const at = q.ko.indexOf(q.answer);
    const here = q.meaning || e.meaning;
    const seen = new Set([right.text, ...right.variants].map(squash));
    // The sentence may use an accepted variant (가야 돼요, 앉아도 괜찮아요): then that's the right
    // option, and the slips and explanations end the same way, so the ending gives nothing away.
    const said = seen.has(squash(q.answer)) ? q.answer : right.text;
    const altTail = said === right.text ? null : (e.alsoOk || []).find((alt) => squash(said).endsWith(squash(alt)));
    const follow = (text) => {
      const t = said === right.text ? text : text.split(right.text).join(said);
      return altTail && t.endsWith(e.tail) ? `${t.slice(0, -e.tail.length)}${altTail}` : t;
    };
    const pool = { traps: [], contrasts: [], slips: [] };
    const push = (list, text, why, kind) => {
      if (!text || seen.has(squash(text))) return;
      seen.add(squash(text));
      list.push({ text, why, kind, correct: false });
    };
    for (const t of q.traps || []) push(pool.traps, t.text, t.why, 'trap');
    const contrasts = (q.contrast || []).map((id) => contrast(q.dict, id, { pos: q.pos, tense: q.tense })).filter(Boolean);
    for (const c of U.shuffle(contrasts)) {
      push(pool.contrasts, c.text, `${c.text} is ${c.name}: ${c.meaning}. This sentence needs ${e.name}, ${here}: ${said}.`, 'contrast');
    }
    for (const s of U.shuffle(slips(q.dict, q.form, { pos: q.pos, tense: q.tense }))) push(pool.slips, follow(s.text), follow(s.why), 'slip');

    const wrong = pool.traps.slice(0, size - 1);
    const take = (list) => {
      if (wrong.length < size - 1 && list.length) wrong.push(list.shift());
    };
    while (wrong.length < size - 1 && (pool.contrasts.length || pool.slips.length)) {
      take(pool.contrasts);
      take(pool.slips);
    }
    const answer = { text: said, correct: true, kind: 'answer', why: `${said} = ${e.name}: ${here}.` };
    return {
      before: q.ko.slice(0, at),
      after: q.ko.slice(at + q.answer.length),
      answer: said,
      options: U.shuffle([answer, ...wrong]),
      // How it's made, ending the way the sentence does (…add 야 돼요 → 일어나야 돼요).
      steps: altTail ? right.steps.map((s) => follow(s).split(`add ${e.tail.trim()}`).join(`add ${altTail.trim()}`)) : right.steps,
      ending: e,
      here,
    };
  }

  M.grammar = { ENDINGS, BEFORE_NOUN, CHATTY, SEEM, RULES, ASKING, applies, form, slips, contrast, table, question, euStem, modifierStem };
})(window.Mallang);
