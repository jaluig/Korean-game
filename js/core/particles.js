/**
 * Particles (조사) for the Particle Lab: find the particle inside a sentence
 * tile (커피를 = 커피 + 를), pick the right form after a consonant or a vowel,
 * and offer wrong-but-tempting particles, each with the reason it's wrong.
 *
 * Wrong options are chosen conservatively: only particles that are clearly
 * wrong in that slot. 은/는 vs 이/가, or 도, are often both fine, so they are
 * never offered as each other's wrong answers.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const H = M.hangul;

  /** Particles, longest forms first (에서 before 에). Two forms = [after a consonant, after a vowel]. */
  const PARTICLES = [
    { id: 'eseo', forms: ['에서'], role: 'place-action', desc: 'marks the place where an action happens (or where something comes from)' },
    { id: 'ege', forms: ['에게'], role: 'to-person', desc: 'means “to” a person' },
    { id: 'hante', forms: ['한테'], role: 'to-person', desc: 'means “to” a person (spoken)' },
    { id: 'buteo', forms: ['부터'], role: 'from', desc: 'means “from” (a time)' },
    { id: 'kkaji', forms: ['까지'], role: 'until', desc: 'means “until” (a time) or “as far as / to” (a place)' },
    { id: 'euro', forms: ['으로', '로'], role: 'means', desc: 'means “by” (bus, card…) or “toward” (a direction)' },
    { id: 'hago', forms: ['하고'], role: 'and', desc: 'means “and / with”' },
    { id: 'irang', forms: ['이랑', '랑'], role: 'and', desc: 'means “and / with” (casual)' },
    { id: 'eul', forms: ['을', '를'], role: 'object', desc: 'marks the object: what the action is done to' },
    { id: 'eun', forms: ['은', '는'], role: 'topic', desc: 'marks the topic: what the sentence is about' },
    { id: 'i', forms: ['이', '가'], role: 'subject', desc: 'marks the subject: who or what does something, or is described' },
    { id: 'gwa', forms: ['과', '와'], role: 'and', desc: 'means “and” between two nouns, or “with”' },
    { id: 'e', forms: ['에'], role: 'place-time', desc: 'marks where you go, where something is, or when something happens' },
    { id: 'do', forms: ['도'], role: 'also', desc: 'means “also / too”' },
    { id: 'ui', forms: ['의'], role: 'possessive', desc: 'means “’s” (belonging to)' },
  ];
  const byId = Object.fromEntries(PARTICLES.map((p) => [p.id, p]));
  const ALL_FORMS = PARTICLES.flatMap((p) => p.forms.map((form) => ({ form, particle: p }))).sort((a, b) => b.form.length - a.form.length);

  // Which particles are safe wrong answers for each job. (Particles missing from a
  // role, like 은/는 for subjects, can also be right there, so they're never offered.)
  const WRONG_FOR = {
    object: ['i', 'eseo'],
    subject: ['eul', 'e'],
    topic: ['eseo'],
    'place-time': ['eseo', 'i'],
    'place-action': ['e', 'eul'],
    'to-person': ['e', 'eul'],
    means: ['eul', 'eseo'],
    and: ['eseo'],
    from: ['kkaji', 'eul'],
    until: ['buteo', 'eul'],
  };
  // Roles worth drilling (도 and 의 rarely have one clear wrong alternative).
  const DRILLED = new Set(Object.keys(WRONG_FOR));

  // 제가 / 내가 / 네가 are 저 / 나 / 너 changed before 가: not "제 + 가".
  const CHANGED_STEMS = new Set(['제', '내', '네']);
  const TIME_WORDS = new Set([
    '아침', '점심', '저녁', '밤', '낮', '주말', '오전', '오후', '새벽', '봄', '여름', '가을', '겨울', '방학', '생일', '평일',
    '휴가', '연말', '다음 주', '지난주', '작년', '내년', '올해', '어젯밤', '크리스마스', '장마', '계절', '시', '분', '반',
  ]);
  const isTimeWord = (stem) => TIME_WORDS.has(stem) || /요일$/.test(stem);

  const core = (tile) => stripPunct(tile).core;
  const tilesAfter = (sentence, index) => sentence.tiles.slice(index + 1).map(core);

  // Verbs of going and coming, in every form the game uses (가요, 갔어요, 갈, 가 주세요, 가세요…).
  const MOTION_VERBS = [
    '가다', '오다', '다니다', '도착하다', '출발하다', '들어가다', '들어오다', '나가다', '나오다', '돌아가다', '돌아오다',
    '올라가다', '내려가다', '내려오다', '다녀오다', '걸어가다', '걸어오다',
  ];
  let motionWords = null;
  function motionForms() {
    if (motionWords) return motionWords;
    motionWords = new Set();
    const helpers = new Set(['거예요', '주세요', '싶어요']);
    for (const dict of MOTION_VERBS) {
      for (const f of M.conjugate.FORMS) {
        if (f.id === 'negative') continue; // 안 가요 → 가요 is already there
        const r = M.conjugate.conjugate(dict, f.id);
        if (!r) continue;
        for (const text of [r.text, ...r.variants]) for (const word of text.split(' ')) if (!helpers.has(core(word))) motionWords.add(core(word));
      }
      motionWords.add(`${dict.slice(0, -1)}세요`); // polite requests: 가세요, 오세요
    }
    return motionWords;
  }
  /** Is someone going or coming after this tile? (It can be in a later clause.) */
  const motionAfter = (sentence, index) => tilesAfter(sentence, index).some((t) => motionForms().has(t));

  /** 에서 as “from”: 집에서 멀어요, 집에서 학교까지, 영국에서 왔어요. */
  const FROM_PREDICATE = /^(멀|가까|가깝|와요|왔|올|오세요|출발)/;
  const isFrom = (sentence, index) =>
    /\bfrom\b/i.test(sentence.en) || tilesAfter(sentence, index).some((t) => /까지$/.test(t) || FROM_PREDICATE.test(t));
  /** 한테/에게 as “from”: 친구한테 받았어요, 선생님한테 배워요. */
  const FROM_PERSON = /^(받|배우|배워|배웠|배울|들었)/;

  const HERE = {
    object: (stem) => `${stem} is the object (what the action is done to)`,
    subject: (stem) => `${stem} is the subject (who or what does something, or is described)`,
    topic: (stem) => `${stem} is the topic (what the sentence is about)`,
    'place-action': (stem) => `${stem} is where the action happens`,
    'to-person': (stem) => `${stem} is the person it goes to`,
    means: (stem) => `${stem} is how you do it (by bus, by card…) or the direction you go`,
    and: (stem) => `${stem} goes together with the next word (“and” / “with”)`,
    from: (stem) => `${stem} is the starting point`,
    until: (stem) => `${stem} is the end point`,
  };

  /** What this word is doing in this sentence, in plain words. */
  function whatItIs(stem, role, sentence, index) {
    if (role === 'place-time') {
      if (isTimeWord(stem)) return `${stem} is when it happens`;
      if (motionAfter(sentence, index)) return `${stem} is the destination (where someone goes)`;
      return `${stem} is where something is`;
    }
    if (role === 'place-action' && isFrom(sentence, index)) return `${stem} is the starting point (“from”)`;
    if (role === 'to-person' && tilesAfter(sentence, index).some((t) => FROM_PERSON.test(t))) return `${stem} is the person it comes from`;
    if (role === 'object' && motionAfter(sentence, index)) return `${stem} is the activity you go for, like 여행을 가요 (go on a trip; a place would take 에)`;
    return HERE[role](stem);
  }

  /* ---------- Recognising particles ---------- */

  let known = null;
  /** Every word's Korean form (without ?), so 사과 isn't mistaken for 사 + 과. */
  function knownWords() {
    if (!known) known = new Set(M.content.words().map((w) => U.normalize(w.ko)));
    return known;
  }

  const stripPunct = (tile) => {
    const m = String(tile).match(/^(.*?)([.,!?~]*)$/);
    return { core: m[1], punct: m[2] };
  };

  /** The right form of a particle after this word: 커피 + eul → 를, 지하철 + euro → 로. */
  function rightForm(stem, particle) {
    const p = typeof particle === 'string' ? byId[particle] : particle;
    if (p.forms.length === 1) return p.forms[0];
    const [afterConsonant, afterVowel] = p.forms;
    if (p.id === 'euro') return H.particle(stem, '으로/로');
    return H.hasFinal(stem) ? afterConsonant : afterVowel;
  }

  /**
   * '커피를' → { stem: '커피', form: '를', particle, punct: '' }. null when the
   * tile has no particle, is itself a word (사과), or its stem is unknown.
   */
  function split(tile) {
    const { core, punct } = stripPunct(tile);
    if (!core || knownWords().has(core)) return null;
    for (const { form, particle } of ALL_FORMS) {
      if (!core.endsWith(form)) continue;
      const stem = core.slice(0, -form.length).trim();
      if (!stem || !knownWords().has(stem) || CHANGED_STEMS.has(stem)) continue;
      if (rightForm(stem, particle) !== form) return null; // e.g. 제가 (저 + 가): not the textbook form
      return { stem, form, particle, punct };
    }
    return null;
  }

  /* ---------- Wrong options with reasons ---------- */

  function allomorphWhy(stem, right, wrong, particle) {
    if (particle.id === 'euro') {
      const last = H.decompose([...stem].pop());
      if (last && last.final === 'ㄹ') return `After ㄹ, use 로 (not 으로): ${stem}로.`;
      return H.hasFinal(stem)
        ? `${stem} ends in a consonant (받침), so it takes 으로. 로 goes after vowels (and ㄹ).`
        : `${stem} ends in a vowel, so it takes 로. 으로 goes after consonants.`;
    }
    return H.hasFinal(stem)
      ? `${stem} ends in a consonant (받침), so it takes ${right}. ${wrong} goes after vowels.`
      : `${stem} ends in a vowel, so it takes ${right}. ${wrong} goes after consonants.`;
  }

  /** Why this form of a two-form particle: '커피 ends in a vowel, so it takes 를 (을 goes after consonants).' */
  function formRule(stem, particle) {
    const p = typeof particle === 'string' ? byId[particle] : particle;
    if (!p || p.forms.length < 2) return null;
    const right = rightForm(stem, p);
    const other = p.forms.find((f) => f !== right);
    return allomorphWhy(stem, right, other, p);
  }

  /**
   * The particle drills a sentence offers: one per tile with a drillable
   * particle. Each is { index, stem, answer, punct, options: [{ text, correct, why }] }.
   */
  function drills(sentence) {
    const out = [];
    if (sentence.drill === false) return out; // opted out in the content
    const skipCross = /싶어요|싶었어요|수 있|수 없/.test(sentence.ko); // 물이/물을 마시고 싶어요 are both fine
    sentence.tiles.forEach((tile, index) => {
      const found = split(tile);
      if (!found || !DRILLED.has(found.particle.role)) return;
      const { stem, form, particle, punct } = found;
      const role = particle.role;
      // Before 되다 / 아니다, 이/가 marks a complement (의사가 돼요), not the subject: no fair question there.
      if (role === 'subject' && /^(아니|되|돼|됐|될)/.test(core(sentence.tiles[index + 1] || ''))) return;
      // With verbs of going, spoken Korean also marks the goal with 을/를 (회사를 가요), so it's never a wrong option there.
      const motion = motionAfter(sentence, index);
      const here = whatItIs(stem, role, sentence, index);
      const options = [{ text: form, correct: true, why: `${form} ${particle.desc}.` }];
      const add = (text, why) => {
        if (text && text !== form && !options.some((o) => o.text === text)) options.push({ text, correct: false, why });
      };

      // Hand-written traps on the same word come first: they have the best explanations.
      for (const trap of sentence.traps || []) {
        const t = split(trap.tile);
        if (t && t.stem === stem) add(t.form, trap.why);
      }
      if (particle.forms.length > 1) {
        const other = particle.forms.find((f) => f !== form);
        add(other, allomorphWhy(stem, form, other, particle));
      }
      for (const id of WRONG_FOR[role]) {
        if (skipCross && ((role === 'object' && id === 'i') || (role === 'subject' && id === 'eul'))) continue;
        if (motion && id === 'eul' && role !== 'object') continue;
        const wrong = byId[id];
        const text = rightForm(stem, wrong);
        add(text, `${text} ${wrong.desc}. Here, ${here}, so it takes ${form}.`);
      }
      if (options.length < 3) return; // not enough clearly-wrong options to make a fair question
      out.push({ index, stem, answer: form, punct, role, particle: particle.id, options: options.slice(0, 4) });
    });
    return out;
  }

  /** Reset the word cache (tests add content after loading). */
  const reset = () => {
    known = null;
  };

  M.particles = { PARTICLES, WRONG_FOR, rightForm, formRule, split, drills, reset };
})(window.Mallang);
