/**
 * Spaced repetition: when should each word or sentence come back?
 *
 * Every item grows through stages, shown as plants in the Word Garden:
 *   0 🌰 not learned yet → 1 🌱 just learned → 2 🌿 → 3 🌷 → 4 🌻 → 5 🌳 mastered
 * A correct answer grows it one stage and it waits longer before the next
 * review (10 min, 1 day, 3 days, 1 week, 16 days, then longer and longer).
 * A wrong answer drops it two stages, makes it due right away and lowers its
 * "ease", so words you struggle with come back more often.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const cfg = () => M.config.srs;
  const items = () => M.store.state.items;

  function blank() {
    return {
      stage: 0,
      due: 0,
      interval: 0,
      ease: cfg().startEase,
      seen: 0,
      correct: 0,
      wrong: 0,
      lapses: 0,
      streak: 0, // correct answers in a row
      flag: false, // "tricky": missed recently; cleared after two correct answers in a row
      last: 0,
      introduced: 0,
      assumed: false, // skipped because of the starting level; not checked yet
    };
  }

  /** The saved record for an item, created on first use. */
  const record = (id) => items()[id] || (items()[id] = blank());
  /** Read-only: the record, or null if the item was never seen. */
  const peek = (id) => items()[id] || null;

  const stageOf = (id) => peek(id)?.stage || 0;
  const isIntroduced = (id) => stageOf(id) >= 1;
  const isTricky = (id) => !!peek(id)?.flag;
  const isDue = (id, now = U.now()) => {
    const r = peek(id);
    return !!r && r.stage >= 1 && r.due <= now;
  };

  function nextInterval(r, stage) {
    const { intervals, startEase, fuzz } = cfg();
    if (stage <= 1) return intervals[1];
    const jitter = 1 + (U.random() * 2 - 1) * fuzz;
    return Math.round(intervals[stage] * (r.ease / startEase) * jitter);
  }

  /** Mark a brand-new word as met (after its introduction card). */
  function introduce(id, now = U.now()) {
    const r = record(id);
    if (r.stage === 0) {
      r.stage = 1;
      r.introduced = now;
      r.interval = cfg().intervals[1];
      r.due = now + r.interval;
    }
    r.last = now;
    return r;
  }

  /**
   * Update an item after a graded answer.
   *   'good'  — correct: grows one stage and waits longer.
   *   'hard'  — almost right / needed a hint: keeps its stage, comes back sooner.
   *   'again' — wrong: drops two stages and is due again right away.
   * Answering long before a review is due still counts for stats, but doesn't
   * grow the word — only spaced-out recall makes memories stick.
   */
  function review(id, grade, now = U.now()) {
    const c = cfg();
    const r = record(id);
    if (r.stage === 0) {
      r.stage = 1;
      r.introduced = r.introduced || now;
    }
    const scheduledAt = r.due - r.interval;
    const wasDue = r.stage <= 1 || r.due <= now || now - scheduledAt >= r.interval / 2;
    r.seen++;
    r.last = now;

    if (grade === 'again') {
      r.wrong++;
      r.lapses++;
      r.streak = 0;
      r.flag = true;
      r.assumed = false;
      r.stage = Math.max(1, r.stage - 2);
      r.ease = Math.max(c.minEase, r.ease - 0.2);
      r.interval = 0;
      r.due = now;
      return r;
    }

    r.correct++;
    if (grade === 'hard') {
      r.streak = 0;
      r.ease = Math.max(c.minEase, r.ease - 0.1);
      if (wasDue) {
        r.interval = Math.max(c.intervals[1], Math.round(nextInterval(r, r.stage) / 2));
        r.due = now + r.interval;
      }
      return r;
    }

    // 'good'
    r.streak++;
    if (r.flag && r.streak >= 2) r.flag = false;
    if (!wasDue) return r;
    r.assumed = false;
    if (r.stage < c.maxStage) {
      r.stage++;
      r.interval = nextInterval(r, r.stage);
    } else {
      r.interval = Math.min(c.maxInterval, Math.round(Math.max(r.interval, c.intervals[c.maxStage]) * r.ease));
    }
    r.due = now + r.interval;
    r.ease = Math.min(c.maxEase, r.ease + 0.03); // slowly recovers after a lapse
    return r;
  }

  /**
   * Light update from quick recognition games (Speed Match). A miss marks the
   * word as tricky and due now, so Word Cards brings it back for a proper check.
   */
  function practice(id, correct, now = U.now()) {
    const r = peek(id);
    if (!r || r.stage === 0) return null;
    r.seen++;
    r.last = now;
    if (correct) {
      r.correct++;
      return r;
    }
    r.wrong++;
    r.streak = 0;
    r.flag = true;
    r.due = Math.min(r.due, now);
    return r;
  }

  const topicOrder = (item) => M.content.topic(item.topicId)?.order ?? 99;

  /** Curriculum order: easier levels first, one topic at a time (so sentences unlock sooner). */
  const byCurriculum = (a, b) => a.level - b.level || topicOrder(a) - topicOrder(b) || a.index - b.index;

  /**
   * Starting level: words below it count as "probably known". They skip the
   * introduction and get checked a few per day; missing one sends it back to
   * the learning queue, so gaps get found and filled. Practised words are kept.
   */
  function applyStartLevel(level, now = U.now()) {
    const c = cfg();
    const { DAY } = M.config.time;
    let n = 0;
    for (const w of M.content.words().sort(byCurriculum)) {
      const r = peek(w.id);
      if (r && r.seen > 0) continue;
      if (w.level < level) {
        const day = Math.floor(n / c.assumedChecksPerDay);
        items()[w.id] = {
          ...blank(),
          stage: 2,
          assumed: true,
          introduced: 0, // never introduced as a new word, so it doesn't use up today's new-word allowance
          interval: c.intervals[2],
          due: now + day * DAY + n, // + n keeps the curriculum order among equals
        };
        n++;
      } else if (r) {
        delete items()[w.id];
      }
    }
    M.store.state.profile.startLevel = level;
  }

  /**
   * Content added after onboarding (new topics, new words): words below the
   * starting level that have no record yet become quick checks too, queued
   * after the checks already waiting. Returns how many were added.
   */
  function syncStartLevel(now = U.now()) {
    const c = cfg();
    const { DAY } = M.config.time;
    const level = M.store.state.profile.startLevel || 1;
    const missing = M.content.words().filter((w) => w.level < level && !peek(w.id)).sort(byCurriculum);
    let n = Object.values(items()).filter((r) => r.assumed).length;
    for (const w of missing) {
      const day = Math.floor(n / c.assumedChecksPerDay);
      items()[w.id] = { ...blank(), stage: 2, assumed: true, introduced: 0, interval: c.intervals[2], due: now + day * DAY + n };
      n++;
    }
    return missing.length;
  }

  /** How many brand-new words were introduced today. */
  function newToday(now = U.now()) {
    const today = U.dayKey(now);
    let count = 0;
    for (const [id, r] of Object.entries(items())) {
      if (!r.assumed && r.introduced && M.content.word(id) && U.dayKey(r.introduced) === today) count++;
    }
    return count;
  }

  const newWordsPerDay = () => M.store.state.settings.newWordsPerDay || M.config.session.newWordsPerDay;
  const newWordsLeftToday = (now) => Math.max(0, newWordsPerDay() - newToday(now));

  /** Most urgent first: tricky, then most overdue, then least grown. */
  function byUrgency(now) {
    const overdue = (r) => (now - r.due) / Math.max(r.interval, M.config.time.DAY);
    return (a, b) => {
      const ra = peek(a.id);
      const rb = peek(b.id);
      if (ra.flag !== rb.flag) return ra.flag ? -1 : 1;
      const diff = overdue(rb) - overdue(ra);
      if (Math.abs(diff) > 0.25) return diff;
      return ra.stage - rb.stage || byCurriculum(a, b);
    };
  }

  /** For extra practice: least grown first, then the ones due soonest. */
  const byWeakest = (a, b) => {
    const ra = peek(a.id);
    const rb = peek(b.id);
    return ra.stage - rb.stage || ra.due - rb.due;
  };

  /**
   * Order a session: open with a review, then introduce each new word and
   * quiz it a couple of steps later (after something else), mixing in reviews.
   */
  function interleave(reviews, freshIds, gap = 2) {
    const out = [];
    const waiting = []; // quizzes for new words, released after `gap` other steps
    const queue = reviews.slice();
    const emit = (step) => {
      out.push(step);
      waiting.forEach((w) => w.wait--);
    };
    const releaseReady = () => {
      const i = waiting.findIndex((w) => w.wait <= 0);
      if (i < 0) return false;
      emit(waiting.splice(i, 1)[0].step);
      return true;
    };

    if (queue.length) emit(queue.shift());
    for (const id of freshIds) {
      emit({ kind: 'intro', id });
      waiting.push({ step: { kind: 'quiz', id, fresh: true }, wait: gap });
      for (let k = 0; k < 2; k++) if (!releaseReady() && queue.length) emit(queue.shift());
    }
    while (queue.length || waiting.length) {
      if (releaseReady()) continue;
      emit(queue.length ? queue.shift() : waiting.shift().step);
    }
    return out;
  }

  /* ---------- Word sessions ---------- */

  function planNewWords(words, dueCount, now) {
    const opts = M.config.session.wordCards;
    const unseen = words.filter((w) => stageOf(w.id) === 0).sort(byCurriculum);
    const practised = words.filter((w) => stageOf(w.id) >= 1).length;
    let count = Math.min(opts.maxNew, unseen.length, newWordsLeftToday(now));
    // A fresh garden with nothing to review gets a slightly bigger first handful.
    if (dueCount === 0 && practised < opts.maxNewWhenEmpty) {
      count = Math.min(opts.maxNewWhenEmpty, unseen.length, newWordsLeftToday(now));
    }
    if (dueCount >= opts.size) count = Math.min(count, 1);
    else if (dueCount >= opts.size / 2) count = Math.min(count, 2);
    return unseen.slice(0, count);
  }

  /** What a Word Cards round would contain right now (for the home screen). */
  function wordPreview(topicId = 'all', now = U.now()) {
    const words = M.content.words(topicId);
    const due = words.filter((w) => isDue(w.id, now)).length;
    return {
      total: words.length,
      due,
      fresh: planNewWords(words, due, now).length,
      unseen: words.filter((w) => stageOf(w.id) === 0).length,
      known: words.filter((w) => isIntroduced(w.id)).length,
      newLeftToday: newWordsLeftToday(now),
    };
  }

  /** Build a Word Cards round: due reviews + a few new words (+ extra practice). */
  function buildWordSession({ topicId = 'all', now = U.now() } = {}) {
    const opts = M.config.session.wordCards;
    const words = M.content.words(topicId);
    const due = words.filter((w) => isDue(w.id, now)).sort(byUrgency(now));
    const fresh = planNewWords(words, due.length, now).map((w) => w.id);
    const slots = Math.max(0, opts.size - fresh.length * 2);
    const reviews = due.slice(0, slots).map((w) => ({ kind: 'quiz', id: w.id }));
    const dueCount = reviews.length;
    if (reviews.length < slots) {
      words
        .filter((w) => isIntroduced(w.id) && !isDue(w.id, now))
        .sort(byWeakest)
        .slice(0, slots - reviews.length)
        .forEach((w) => reviews.push({ kind: 'quiz', id: w.id, extra: true }));
    }
    return { steps: interleave(reviews, fresh), freshIds: fresh, dueCount, extraCount: reviews.length - dueCount };
  }

  /* ---------- Sentence sessions ---------- */

  /** A sentence opens up once all of its words have been learned. */
  const isUnlocked = (sentence) => sentence.needs.every(isIntroduced);
  const missingWords = (sentence) => sentence.needs.filter((id) => !isIntroduced(id));

  function sentencePreview(topicId = 'all', now = U.now()) {
    const all = M.content.sentences(topicId);
    const open = all.filter(isUnlocked);
    return {
      total: all.length,
      unlocked: open.length,
      due: open.filter((s) => isDue(s.id, now)).length,
      fresh: open.filter((s) => stageOf(s.id) === 0).length,
    };
  }

  /**
   * The locked sentence closest to opening: fewest missing words from other
   * topics (Word Cards on this topic can't teach those), then fewest missing words.
   */
  function nextLockedSentence(topicId = 'all') {
    const locked = M.content.sentences(topicId).filter((s) => !isUnlocked(s));
    const elsewhere = (s) => missingWords(s).filter((id) => topicId !== 'all' && M.content.word(id).topicId !== topicId).length;
    locked.sort((a, b) => elsewhere(a) - elsewhere(b) || missingWords(a).length - missingWords(b).length || byCurriculum(a, b));
    return locked[0] || null;
  }

  function buildSentenceSession({ topicId = 'all', now = U.now() } = {}) {
    const opts = M.config.session.sentences;
    const open = M.content.sentences(topicId).filter(isUnlocked);
    const due = open.filter((s) => isDue(s.id, now)).sort(byUrgency(now));
    const fresh = open.filter((s) => stageOf(s.id) === 0).sort(byCurriculum);
    const newCount = Math.min(fresh.length, due.length >= opts.size ? 1 : opts.maxNew);

    const reviews = due.slice(0, opts.size - newCount);
    const newOnes = fresh.slice(0, newCount);
    const picked = [];
    // Alternate reviews and new sentences, starting with a review when possible.
    while (reviews.length || newOnes.length) {
      if (reviews.length) picked.push(reviews.shift());
      if (newOnes.length) picked.push(newOnes.shift());
    }
    if (picked.length < opts.size) {
      const extra = open.filter((s) => isIntroduced(s.id) && !isDue(s.id, now)).sort(byWeakest);
      picked.push(...extra.slice(0, opts.size - picked.length));
    }
    if (picked.length < opts.size) picked.push(...fresh.slice(newCount, newCount + opts.size - picked.length));
    return { steps: picked.map((s) => ({ kind: 'sentence', id: s.id })) };
  }

  /* ---------- Speed Match ---------- */

  /** Tricky and due words first (shuffled), then everything else already learned. */
  function matchPool(topicId = 'all', now = U.now()) {
    const known = M.content.words(topicId).filter((w) => isIntroduced(w.id));
    const urgent = known.filter((w) => isTricky(w.id) || isDue(w.id, now));
    const rest = known.filter((w) => !urgent.includes(w));
    return [...U.shuffle(urgent), ...U.shuffle(rest)];
  }

  /* ---------- Overview for the garden and stats ---------- */

  function summary(topicId = 'all', now = U.now()) {
    const words = M.content.words(topicId);
    const byStage = Array(cfg().maxStage + 1).fill(0);
    let due = 0;
    let tricky = 0;
    let growth = 0;
    for (const w of words) {
      const r = peek(w.id);
      const stage = r ? r.stage : 0;
      byStage[stage]++;
      growth += stage;
      if (r && r.stage >= 1 && r.due <= now) due++;
      if (r && r.flag) tricky++;
    }
    return {
      total: words.length,
      byStage,
      due,
      tricky,
      started: words.length - byStage[0],
      grown: words.filter((w) => stageOf(w.id) >= 2).length,
      mastered: byStage[cfg().maxStage],
      growth: words.length ? growth / (words.length * cfg().maxStage) : 0,
    };
  }

  M.srs = {
    blank,
    record,
    peek,
    stageOf,
    isIntroduced,
    isDue,
    isTricky,
    introduce,
    review,
    practice,
    applyStartLevel,
    syncStartLevel,
    newToday,
    interleave,
    wordPreview,
    buildWordSession,
    isUnlocked,
    missingWords,
    sentencePreview,
    nextLockedSentence,
    buildSentenceSession,
    matchPool,
    summary,
  };
})(window.Mallang);
