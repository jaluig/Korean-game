/**
 * Minigame 16 — 이번 주 복습 · Weekly Review: the words and sentences you
 * missed most in the last seven days, in one round. Every wrong answer (and
 * every slip in the quick games) is remembered for two weeks (srs.logMiss).
 * A round shows the list first, then asks each one the way Word Cards and the
 * Sentence Builder do; one missed again comes back once more at the end of the
 * round. Once gone over, an item leaves the list, unless it was missed again.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.weeklyReview;
  const points = () => M.config.points;
  const WEEK = 7;

  /** A word or a sentence you've met (the review doesn't ask anything new). */
  const reviewable = (id) => (M.content.word(id) || M.content.sentence(id)) && M.srs.isIntroduced(id);

  /**
   * The words and sentences missed most this week: [{ id, count }], most first.
   * In a save's first week of remembering misses, the 🥀 tricky items seen this
   * week are added too (count 0, after the others): they were missed before.
   */
  function pool(now = U.now()) {
    const counts = M.srs.misses(WEEK, now);
    const week = WEEK * M.config.time.DAY;
    if (now - (M.store.state.profile.missLogSince || 0) < week) {
      for (const [id, r] of Object.entries(M.store.state.items)) if (r.flag && r.last >= now - week && !counts.has(id)) counts.set(id, 0);
    }
    return [...counts]
      .filter(([id]) => reviewable(id))
      .map(([id, count]) => ({ id, count, last: M.srs.peek(id).last || 0 }))
      .sort((a, b) => b.count - a.count || b.last - a.last)
      .map(({ id, count }) => ({ id, count }));
  }

  /** The round: the most-missed first, at most `size` of them. */
  const pickRound = (now = U.now()) => pool(now).slice(0, cfg().size);

  M.games.register({
    id: 'weekly-review',
    order: 16,
    emoji: '🗓️',
    color: 'butter',
    title: { ko: '이번 주 복습', en: 'Weekly Review' },
    blurb: { ko: '이번 주에 자주 틀린 것', en: 'What you missed most this week' },

    optional: true, // (the "every game" badge doesn't ask for it: it needs something missed first)

    status() {
      const n = pickRound().length;
      if (!n) return { ready: false, ko: '이번 주는 틀린 게 없어요', en: 'Nothing missed this week' };
      return { ready: true, ko: `복습 ${n}개`, en: `${U.plural(n, 'thing')} to review` };
    },

    start(host) {
      const list = pickRound();
      if (!list.length) {
        host.empty({
          emoji: '🌟',
          ko: '이번 주는 틀린 게 없어요!',
          en: 'Nothing missed this week!',
          text: 'The weekly review collects the words and sentences you got wrong in the last seven days, in any game. There’s nothing to go over right now: keep practising, and come back at the end of the week.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const steps = list.map(({ id }) => ({ id }));
      const retried = new Set();
      const allWords = M.content.words();
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0, grown: [], mistakes: new Set() };
      let index = -1; // -1: the list of this week's misses
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      showList();

      /** This week's misses, most first, before the round starts. */
      function showList() {
        const button = ui.button({ ko: '복습 시작', en: 'Start the review', variant: 'primary', size: 'big', onClick: begin });
        const rows = list.map(({ id, count }) => {
          const item = M.content.item(id);
          const isWord = item.type === 'word';
          return h(
            'li.word-chip.weekly-chip',
            h('span.word-chip-plant', { 'aria-hidden': 'true' }, isWord ? ui.plant(M.srs.stageOf(id)) : '🧩'),
            h('span.word-chip-ko', { lang: 'ko' }, item.ko),
            h('span.word-chip-en', item.en),
            count ? h('span.weekly-count', { title: `Missed ${U.plural(count, 'time')} this week` }, `×${count}`) : h('span.weekly-count.tricky', { title: 'Still tricky' }, '🥀')
          );
        });
        host.stage.append(
          h(
            'div.ex.ex-weekly',
            ui.exTag('이번 주에 자주 틀린 것', 'What you missed most this week', '🗓️'),
            h('div.weekly-card', h('p.weekly-intro', ui.bi(`${list.length}개를 다시 해 봐요`, `${list.length === 1 ? 'One word or sentence' : `${list.length} words and sentences`} from the last seven days, most missed first.`)), h('ul.word-chips.weekly-list', rows)),
            h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)
          )
        );
        button.focus({ preventScroll: true });
        host.setProgress(0, steps.length);
        const stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            begin();
          }
        });
        cleanup = stopKeys;
        let started = false;
        function begin() {
          if (started) return;
          started = true;
          stopKeys();
          cleanup = null;
          index = 0;
          next();
        }
      }

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(index, steps.length);
        if (index >= steps.length) return finish();
        const { id } = steps[index];
        const word = M.content.word(id);
        if (word) {
          const format = M.wordCards.chooseFormat(word);
          cleanup = M.exercises.get(format.type).render({ el: host.stage, item: word, mode: format.mode, pool: allWords, answer: (result) => onAnswer(word, result, format) });
        } else {
          const sentence = M.content.sentence(id);
          cleanup = M.exercises.get('sentence').render({ el: host.stage, item: sentence, stage: M.srs.stageOf(id), answer: (result) => onAnswer(sentence, result, null) });
        }
      }

      function onAnswer(item, result, format) {
        const isWord = item.type === 'word';
        const stageBefore = M.srs.stageOf(item.id);
        M.srs.review(item.id, result.grade);
        M.progress.recordAnswer(result.correct);
        round.answers++;
        let earned = 0;
        if (result.correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          if (isWord) earned = result.grade === 'good' ? points()[format.points] : points().almost;
          else {
            earned = result.grade === 'good' ? points().sentence : points().sentenceWithHint;
            M.progress.bump('sentencesCorrect');
          }
          if (result.grade === 'good' && round.combo % points().comboEvery === 0) earned += points().comboBonus;
          if (isWord && result.typed && result.grade === 'good') M.progress.bump('typedCorrect');
          if (M.srs.stageOf(item.id) > stageBefore && !round.grown.includes(item.id)) round.grown.push(item.id);
        } else {
          round.combo = 0;
          round.mistakes.add(item.id);
          // Once more at the end of the round (the lower stage means an easier format).
          if (!retried.has(item.id)) {
            retried.add(item.id);
            steps.push({ id: item.id, retry: true });
          }
        }
        host.award(earned);
        host.react(result, round.combo);
        M.store.save();
        const heard = isWord ? M.wordCards.heardIt(format) : false;
        if (M.store.state.settings.autoPlayAudio && (!heard || !result.correct)) M.speech.speakLater(item.ko, 250, { quiet: true });
        host.showFeedback({
          tone: result.almost ? 'almost' : result.correct ? 'good' : 'bad',
          points: earned,
          content: isWord ? M.ui.feedback.forWord(item, result) : M.ui.feedback.forSentence(item, result),
          speak: item.ko,
          onContinue: () => {
            index++;
            next();
          },
        });
      }

      function finish() {
        // Gone over: off the list, except what was missed again just now (it stays, once).
        M.srs.clearMisses(list.map((x) => x.id));
        for (const id of round.mistakes) M.srs.logMiss(id);
        const profile = M.store.state.profile;
        const now = U.now();
        profile.lastWeeklyReview = now;
        // The badge counts weeks: a second review the same week doesn't add to it.
        if (now - (profile.weeklyCounted || 0) >= 6 * M.config.time.DAY) {
          M.progress.bump('weeklyReviews');
          profile.weeklyCounted = now;
        }
        M.store.save();
        host.finish({
          gameId: 'weekly-review',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          grown: round.grown,
          mistakes: [...round.mistakes],
          perfect: false,
        });
      }
    },
  });

  M.weeklyReview = { pool, pickRound };
})(window.Mallang);
