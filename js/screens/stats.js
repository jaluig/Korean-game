/**
 * Stats: level, streaks, accuracy, the last two weeks of practice and badges.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  function tile(icon, value, ko, en) {
    return h('div.stat', h('div.stat-value', h('span', { 'aria-hidden': 'true' }, icon), ' ', String(value)), h('div.stat-label', ui.bi(ko, en)));
  }

  function activityChart(days, goal) {
    const max = Math.max(goal * 1.15, ...days.map((d) => d.points), 1);
    return h(
      'div.chart',
      { role: 'img', 'aria-label': `Points per day for the last ${days.length} days` },
      h(
        'div.chart-bars',
        h('div.chart-goal', { style: { bottom: `${(goal / max) * 100}%` } }, h('span', `🎯 ${goal}`)),
        days.map((d) =>
          h(
            'div',
            { class: `chart-col ${d.today ? 'today' : ''}`.trim(), title: `${d.key}: ${d.points} points` },
            h('div', { class: `chart-bar ${d.goalMet ? 'met' : ''}`.trim(), style: { height: d.points ? `max(4px, ${(d.points / max) * 100}%)` : '0' } })
          )
        )
      ),
      h('div.chart-days', days.map((d) => h('span', { class: d.today ? 'today' : '' }, WEEKDAYS[U.weekday(d.key)])))
    );
  }

  /** 말랑이's wardrobe: outfits unlock with levels; pick any unlocked one. */
  function wardrobe(level, levelMascot) {
    const section = h('section.card.wardrobe');
    const draw = () => {
      const current = M.mascot.outfit();
      const outfits = M.mascot.OUTFITS;
      U.clear(section).append(
        h('h2.card-title', ui.bi('말랑이 옷장', '말랑이’s wardrobe'), h('span.card-count', `${outfits.filter((o) => o.level <= level).length} / ${outfits.length}`)),
        h(
          'div.wardrobe-grid',
          outfits.map((o) => {
            const open = o.level <= level;
            const mini = M.mascot.create({ size: 70, mood: open ? 'happy' : 'sleepy', idle: false });
            mini.figure.dataset.outfit = o.id;
            return h(
              'button',
              {
                type: 'button',
                class: `wardrobe-item ${o.id === current ? 'selected' : ''} ${open ? '' : 'locked'}`.replace(/\s+/g, ' ').trim(),
                disabled: !open,
                'aria-pressed': String(o.id === current),
                title: open ? o.en : `Unlocks at level ${o.level}`,
                dataset: { focus: `outfit-${o.id || 'none'}` },
                on: {
                  click: () => {
                    M.store.state.profile.outfit = o.id;
                    M.store.save();
                    M.events.emit('settings');
                    levelMascot.figure.dataset.outfit = o.id;
                    levelMascot.react('cheer');
                    M.sfx.play('pop');
                    ui.keepFocus(draw);
                  },
                },
              },
              mini.figure,
              h('span.wardrobe-name', ui.bi(`${o.emoji} ${o.ko}`, o.en)),
              open ? null : h('span.wardrobe-lock', `🔒 Lv ${o.level}`)
            );
          })
        )
      );
    };
    draw();
    return section;
  }

  M.screens.register({
    id: 'stats',

    render(view) {
      const s = M.store.state;
      const P = M.progress;
      const level = P.levelInfo();
      const words = M.srs.summary('all');
      const accuracy = s.totals.answers ? Math.round((s.totals.correct / s.totals.answers) * 100) : 0;
      const daysPractised = Object.values(s.days).filter((d) => d.points > 0).length;
      const mascot = M.mascot.create({ size: 96, mood: 'happy' });

      view.append(
        h(
          'div.stats',
          h('div.page-head', h('h1', ui.bi('나의 기록', 'My progress'))),
          h(
            'section.card.level-card',
            mascot.el,
            h(
              'div.level-main',
              h('div.level-num', ui.bi(`레벨 ${level.level}`, `Level ${level.level}`)),
              ui.bar(level.progress, { color: 'lilac', label: 'Progress to the next level' }),
              h('div.level-next', `${level.points} ⭐ · ${level.toNext} more to level ${level.level + 1}`)
            )
          ),
          h(
            'div.stat-grid',
            tile('🔥', P.currentStreak(), '연속 학습', 'day streak'),
            tile('🏅', s.streak.best, '최고 연속', 'best streak'),
            tile('⭐', s.totals.points, '총 점수', 'total points'),
            tile('🎯', `${accuracy}%`, '정확도', 'accuracy'),
            tile('🌿', words.grown, '자란 단어', 'words growing (🌿+)'),
            tile('🌳', words.mastered, '마스터', 'mastered'),
            tile('🥀', words.tricky, '어려운 단어', 'tricky right now'),
            tile('📅', daysPractised, '연습한 날', 'days practised')
          ),
          h('section.card', h('h2.card-title', ui.bi('최근 2주', 'Last two weeks')), activityChart(P.recentActivity(14), P.dailyGoal())),
          wardrobe(level.level, mascot),
          h(
            'section.card',
            h('h2.card-title', ui.bi('배지', 'Badges'), h('span.card-count', `${Object.keys(s.badges).length} / ${P.BADGES.length}`)),
            h(
              'div.badge-grid',
              P.BADGES.map((b) => {
                const earned = s.badges[b.id];
                return h(
                  'div',
                  { class: `badge ${earned ? 'earned' : 'locked'}`, title: earned ? `Earned ${new Date(earned).toLocaleDateString()}` : 'Not earned yet' },
                  h('div.badge-emoji', { 'aria-hidden': 'true' }, earned ? b.emoji : '🔒'),
                  h('div.badge-name', ui.bi(b.ko, b.en)),
                  h('div.badge-desc', b.desc)
                );
              })
            )
          )
        )
      );
      return null;
    },
  });
})(window.Mallang);
