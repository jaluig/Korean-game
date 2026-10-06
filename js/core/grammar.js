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
 * -(으)ㄴ 적이 있어요/없어요.
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
  };

  // 있다/없다 and the words built on them take 는, not (으)ㄴ, as modifiers (있는), so no 후에 form here.
  const IT_EOP = /(있|없)다$/;
  // These have their own polite words (드세요, 주무세요, 계세요) or are polite already: no -(으)세요 / -(으)셨어요.
  const OWN_POLITE = /^(먹다|자다|있다|드시다|계시다|주무시다)$/;

  /** Can this ending be used on this word (and in this tense)? */
  function applies(dict, id, { pos = 'verb', tense = 'present' } = {}) {
    const e = ENDINGS[id];
    if (!e) return false;
    if (!/[가-힣]다$/.test(String(dict)) || /\s/.test(dict)) return false;
    if (dict === '이다' || dict === '아니다') return false;
    if (e.verbOnly && pos !== 'verb') return false;
    if (tense === 'past' && !e.past) return false;
    if ((id === 'hue' || id === 'jeogi' || id === 'jeogiNot') && IT_EOP.test(dict)) return false;
    if (id === 'goIt' && IT_EOP.test(dict)) return false; // 있고 있어요 isn't said
    if ((id === 'boseyo' || id === 'bwasseoyo') && dict === '보다') return false; // 봐 보세요 is awkward
    if ((id === 'seyo' || id === 'si') && OWN_POLITE.test(dict)) return false;
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
        variants: [],
        rule: 'past',
      };
    }

    if (e.base === 'stem') {
      const text = `${stem}${e.tail}`;
      return {
        text,
        steps: [`${e.name} goes straight onto the stem (the dictionary form without 다): ${stem} + ${e.tail.trim()} → ${text}.`],
        variants: also(text),
        rule: 'stem',
      };
    }
    if (e.base === 'inf') {
      const inf = C.infinitive(stem);
      const text = `${inf.text}${e.tail}`;
      return {
        text,
        steps: [inf.why, `For ${e.name}, take ${inf.text}요, drop the 요 and add ${e.tail.trim()} → ${text}.`],
        variants: [...inf.variants.flatMap((v) => [`${v}${e.tail}`, ...(e.alsoOk || []).map((alt) => `${v}${alt}`)]), ...also(text)],
        rule: infRule(stem, inf),
      };
    }
    if (e.base === 'eu') {
      const s = euStem(stem, e.tail);
      const variants = id === 'si' ? [`${s.text}시었어요`] : []; // 가시었어요: the long, rare form of 가셨어요
      return { text: `${s.text}${e.tail}`, steps: [s.why], variants, rule: s.rule };
    }
    if (e.base === 'neunde') return neundeForm(dict, stem, pos, e);
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
      if (['jiman', 'nikka', 'neunde'].includes(id)) add(form(dict, id, { pos }).text, `It happened in the past, so ${e.name} takes the past too: ${right.text}.`);
      return out;
    }

    if (e.base === 'stem') {
      if (inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes straight onto the stem, not the 아/어 form: ${stem} + ${e.tail.trim()} → ${right.text}.`); // 먹어지만
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
      // (not for verbs where -아/어 있어요 is right too: 가 있어요, 앉아 있어요, 살아 있어요…)
      if (id === 'goIt' && !/(가다|오다|앉다|서다|눕다|살다|남다|붙다)$/.test(dict)) add(`${inf.text} 있어요`, `-아/어 있어요 describes a state after something has happened (앉아 있어요 = is seated). For an action in progress, it’s -고 있어요: ${right.text}.`); // 먹어 있어요
    }

    if (e.base === 'inf') {
      const shape = (x) => `${x}${e.tail}`;
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
    }

    if (e.base === 'eu') {
      // The wrong one of "with 으" / "without 으" (and the irregular change missed): 먹면, 가으면, 살으면, 살니까, 듣으면, 춥으면.
      add(`${stem}${e.tail}`, right.steps[0]);
      add(`${stem}으${e.tail}`, right.steps[0]);
      if (['reo', 'ryeogo', 'myeonseo'].includes(id) && inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes on the stem, not the 아/어 form: ${right.text}.`); // 먹어러, 먹어려고
      if (id === 'ryeogo') add(`${C.futureStem(stem).text}려고`, `People often say [${C.futureStem(stem).text}려고], but it’s written ${right.text}: no extra ㄹ.`); // 먹을려고
      if ((id === 'seyo' || id === 'si') && inf.text !== stem) add(`${inf.text}${e.tail}`, `${e.name} goes on the stem, not the 아/어 form. ${right.steps[0]}`); // 앉아세요, 해세요
      if (id === 'si') add(`${pastStem(dict, pos)}으${e.tail}`, `In the polite past, 시 comes first and the past after it (시 + 었 → 셨): ${right.text}.`); // 갔으셨어요
    }

    if (e.base === 'future') {
      add(`${stem}을${e.tail}`, C.futureStem(stem).why); // 가을 때, 살을 때, 듣을 수 있어요, 가을게요
      const noun = e.tail.trim().split(' ')[0];
      if (verb && !IT_EOP.test(dict) && id !== 'lgeyo') add(`${presentModifier(stem)}${e.tail}`, `${noun} takes the (으)ㄹ form: ${right.text}.`); // 먹는 때, 먹는 수 있어요
      if (id === 'lgeyo') add(right.text.replace(/게요$/, '께요'), `It sounds like [께요], but it’s spelled 게요: ${right.text}.`); // 먹을께요
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

    if (e.base === 'modifier') {
      const noun = id === 'hue' ? '후에' : '적';
      add(`${stem}은${e.tail}`, modifierStem(stem).why); // 가은 후에, 살은 후에, 듣은 후에, 가은 적이 있어요
      add(`${presentModifier(stem)}${e.tail}`, `${noun} takes the past-like (으)ㄴ form: ${right.text}.`); // 먹는 후에, 먹는 적이 있어요
      add(`${C.futureStem(stem).text}${e.tail}`, `${noun} takes the (으)ㄴ form, not the (으)ㄹ form: ${right.text}.`); // 먹을 후에, 먹을 적이 있어요
      if (id === 'hue') add(`${stem}기${e.tail}`, `기 goes with 전에 (before). “After” is (으)ㄴ 후에: ${right.text}.`); // 먹기 후에
    }
    return out;
  }

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

  M.grammar = { ENDINGS, applies, form, slips, contrast, table, question, euStem, modifierStem };
})(window.Mallang);
