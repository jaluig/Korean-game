/**
 * End-of-round summary: points, accuracy, the daily goal, streak, new badges,
 * the words you learned and the ones to practise again.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  function wordChip(id) {
    const item = M.content.item(id);
    if (!item) return null;
    const isWord = item.type === 'word';
    return h(
      'li.word-chip',
      h('span.word-chip-plant', { 'aria-hidden': 'true' }, isWord ? ui.plant(M.srs.stageOf(id)) : '🧩'),
      h('span.word-chip-ko', { lang: 'ko' }, item.ko),
      ui.audioButton(item.ko, { size: 'small' }),
      h('span.word-chip-en', item.en)
    );
  }

  /** Sound Twins sets you mixed up: each word with its own 🔊, to compare. */
  function soundList(ids) {
    const sets = (ids || []).map((id) => M.content.soundSet(id)).filter(Boolean);
    if (!sets.length) return null;
    return h(
      'section.summary-list.mistakes',
      h('h3', ui.bi('다시 들어 볼 소리', 'Sounds to listen to again')),
      h(
        'ul.word-chips',
        sets.map((set) =>
          h('li.word-chip', set.words.map((w) => [h('span.word-chip-ko', { lang: 'ko' }, w.ko), ui.audioButton(w.ko, { size: 'small', label: `Play ${w.ko}` })]))
        )
      )
    );
  }

  /** Grammar patterns met or missed in Grammar Cards: click one to see its card again. */
  function patternList(title, ids, cls) {
    const patterns = (ids || []).map((id) => M.content.grammarPattern(id)).filter(Boolean);
    if (!patterns.length) return null;
    return h(
      'section',
      { class: `summary-list ${cls}` },
      h('h3', ui.bi(title.ko, title.en)),
      h(
        'ul.word-chips',
        patterns.map((g) =>
          h(
            'li.word-chip',
            h('span.word-chip-plant', { 'aria-hidden': 'true' }, g.emoji || '🔗'),
            h('button.chip-link', { type: 'button', on: { click: () => ui.showGrammar(g) } }, h('span.word-chip-ko', { lang: 'ko' }, g.title.ko), h('span.word-chip-en', g.title.en))
          )
        )
      )
    );
  }

  function wordList(title, ids, cls) {
    const items = ids.map(wordChip).filter(Boolean);
    if (!items.length) return null;
    return h('section', { class: `summary-list ${cls}` }, h('h3', ui.bi(title.ko, title.en)), h('ul.word-chips', items));
  }

  M.screens.register({
    id: 'summary',

    render(view) {
      const r = M.session.lastResult;
      if (!r) {
        location.hash = '#/home';
        return null;
      }
      const game = M.games.get(r.gameId);
      const accuracy = r.answers ? Math.round((r.correct / r.answers) * 100) : 0;
      const goal = M.progress.dailyGoal();
      const today = M.progress.todayPoints();
      const streak = M.progress.currentStreak();

      const mascot = M.mascot.create({ size: 130, mood: 'happy' });
      let headline = { ko: '수고했어요!', en: 'Great work!' };
      if (r.perfect) headline = { ko: '완벽해요!', en: 'A perfect round!' };
      else if (r.answers && accuracy < 60) headline = { ko: '잘하고 있어요!', en: 'You’re doing well!' };

      const stats = [
        { icon: '⭐', value: `+${r.points}`, ko: '점수', en: 'points' },
        r.mainStat ||
          (r.gameId === 'speed-match'
            ? { icon: '✔', value: r.matches, ko: '짝', en: 'matches' }
            : { icon: '🎯', value: `${accuracy}%`, ko: '정확도', en: 'accuracy' }),
        { icon: '🔥', value: r.bestCombo || 0, ko: '최고 콤보', en: 'best combo' },
      ];

      const celebrations = [];
      if (r.levelUp) celebrations.push(h('div.banner.banner-lilac', '🎉 ', ui.bi(`레벨 ${r.levelUp} 달성!`, `You reached level ${r.levelUp}!`)));
      const outfit = r.levelUp && M.mascot.OUTFITS.find((o) => o.id && o.level === r.levelUp);
      if (outfit) celebrations.push(h('div.banner.banner-pink', `${outfit.emoji} `, ui.bi(`말랑이에게 선물이 왔어요: ${outfit.ko}!`, `A present for 말랑이: ${outfit.en}! Change outfits in the wardrobe (Stats).`)));
      if (r.goalReached) celebrations.push(h('div.banner.banner-mint', '🏆 ', ui.bi('오늘의 목표 달성!', 'Daily goal complete!')));

      const badges = (r.badges || []).map((b) =>
        h('div.badge.earned.pop-in', h('div.badge-emoji', { 'aria-hidden': 'true' }, b.emoji), h('div.badge-name', ui.bi(b.ko, b.en)), h('div.badge-desc', b.desc))
      );

      const again = ui.button({ icon: '↻', ko: '한 번 더', en: 'Play again', variant: 'primary', size: 'big', onClick: () => (location.hash = `#/play/${r.gameId}`) });
      const home = ui.button({ ko: '홈으로', en: 'Home', variant: 'soft', size: 'big', onClick: () => (location.hash = '#/home') });

      // Suggest a different game that has something to do.
      const suggestion = M.games
        .list()
        .filter((g) => g.id !== r.gameId)
        .map((g) => ({ g, s: g.status(r.topicId) }))
        .find(({ s }) => s.ready);

      view.append(
        h(
          'div.summary',
          h('div.summary-hero', mascot.el, h('div', h('h1', ui.bi(headline.ko, headline.en)), h('p.summary-game', game ? `${game.emoji} ${game.title.en}` : ''))),
          celebrations,
          h(
            'div.summary-stats',
            stats.map((s) => h('div.stat', h('div.stat-value', h('span', { 'aria-hidden': 'true' }, s.icon), ' ', String(s.value)), h('div.stat-label', ui.bi(s.ko, s.en))))
          ),
          h(
            'div.summary-goal',
            ui.ring(today / goal, { size: 84, stroke: 10, color: 'var(--mint-deep)', label: `Daily goal ${today} of ${goal}`, children: h('span.ring-emoji', today >= goal ? '🏆' : '⭐') }),
            h(
              'div',
              h('div.summary-goal-text', ui.bi('오늘의 목표', 'Daily goal')),
              h('div.summary-goal-num', `${Math.min(today, goal)} / ${goal} ⭐`),
              h('div.summary-streak', `🔥 `, ui.bi(`${streak}일 연속`, `${streak}-day streak`, 'inline'))
            )
          ),
          badges.length ? h('section.summary-badges', h('h3', ui.bi('새 배지!', 'New badge!')), h('div.badge-grid', badges)) : null,
          wordList({ ko: '새로 배운 단어', en: 'New words' }, r.learned || [], 'learned'),
          wordList({ ko: '쑥쑥 자랐어요', en: 'Words that grew a stage' }, (r.grown || []).filter((id) => !(r.learned || []).includes(id)), 'grown'),
          wordList({ ko: '새로 배운 문장', en: 'New sentences' }, r.sentencesLearned || [], 'learned'),
          wordList({ ko: '다시 연습할 것', en: 'To practise again — they’ll come back soon' }, r.mistakes || [], 'mistakes'),
          soundList(r.soundMistakes),
          patternList({ ko: '새로 배운 문법', en: 'New grammar' }, r.grammarLearned, 'learned'),
          patternList({ ko: '다시 볼 문법', en: 'Grammar to look at again — it’ll come back soon' }, r.grammarMistakes, 'mistakes'),
          h(
            'div.summary-actions',
            home,
            suggestion ? ui.button({ icon: suggestion.g.emoji, ko: suggestion.g.title.ko, en: `Try ${suggestion.g.title.en}`, variant: 'mint', size: 'big', onClick: () => (location.hash = `#/play/${suggestion.g.id}`) }) : null,
            again
          )
        )
      );

      again.focus({ preventScroll: true });
      M.sfx.play(r.levelUp ? 'levelup' : 'complete');
      if (r.perfect || r.goalReached || r.levelUp || badges.length) ui.confetti();
      mascot.react('cheer');
      return null;
    },
  });
})(window.Mallang);
