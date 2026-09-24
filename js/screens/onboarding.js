/**
 * First-run setup: meet the mascot, choose a starting level and a daily goal,
 * and check that Korean audio works.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  M.screens.register({
    id: 'onboarding',

    render(view) {
      const choices = { level: M.store.state.profile.startLevel || 1, goal: M.store.state.settings.dailyGoal };
      let step = 0;
      let offStatus = null;

      function finish(goTo) {
        M.srs.applyStartLevel(choices.level);
        M.store.state.settings.dailyGoal = choices.goal;
        M.store.state.profile.onboarded = true;
        M.store.save();
        M.events.emit('settings');
        location.hash = goTo;
      }

      function frame(content, { back = true } = {}) {
        const dots = h('ol.steps-dots', { 'aria-label': `Step ${step + 1} of 4` }, [0, 1, 2, 3].map((i) => h('li', { class: i === step ? 'on' : i < step ? 'done' : '' })));
        return h(
          'div.onboarding',
          h(
            'div.card.onboarding-card',
            back && step > 0
              ? h('button.icon-btn.onboarding-back', { type: 'button', 'aria-label': 'Back', on: { click: () => go(step - 1) } }, '←')
              : null,
            dots,
            content
          )
        );
      }

      const steps = [
        // 0 — Welcome
        () => {
          const mascot = M.mascot.create({ size: 170, mood: 'happy' });
          return frame(
            [
              h('div.onboarding-mascot', mascot.el),
              h('h1', ui.bi('안녕하세요! 저는 말랑이예요.', "Hi! I'm Mallang-i.")),
              h(
                'p.lead',
                'A squishy rice-cake bunny with a sprout on my head 🌱 Every Korean word you learn becomes a plant in your garden — and I’ll help you keep them growing with short, fun practice rounds.'
              ),
              ui.button({ ko: '시작하기', en: "Let's start", variant: 'primary', size: 'big', onClick: () => go(1) }),
            ],
            { back: false }
          );
        },

        // 1 — Starting level
        () =>
          frame([
            h('h1', ui.bi('어디서부터 시작할까요?', 'Where should we start?')),
            h(
              'div.level-options',
              { role: 'radiogroup' },
              M.config.startLevels.map((l) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'radio',
                    'aria-checked': String(choices.level === l.level),
                    class: `level-option ${choices.level === l.level ? 'selected' : ''}`.trim(),
                    on: {
                      click: () => {
                        choices.level = l.level;
                        go(1);
                      },
                    },
                  },
                  h('span.level-emoji', { 'aria-hidden': 'true' }, l.emoji),
                  h('span.level-text', h('span.level-name', ui.bi(l.ko, `${l.en} · ${l.cefr}`)), h('span.level-desc', l.desc))
                )
              )
            ),
            h('p.hint', '🌱 Words below your level aren’t skipped for good: they pop up as quick checks, a few a day. Miss one and it goes back into your learning queue — so gaps get filled.'),
            ui.button({ ko: '다음', en: 'Next', variant: 'primary', size: 'big', onClick: () => go(2) }),
          ]),

        // 2 — Daily goal
        () =>
          frame([
            h('h1', ui.bi('하루 목표를 정해요', 'Pick a daily goal')),
            h(
              'div.goal-options',
              { role: 'radiogroup' },
              M.config.dailyGoals.map((g) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'radio',
                    'aria-checked': String(choices.goal === g.points),
                    class: `goal-option ${choices.goal === g.points ? 'selected' : ''}`.trim(),
                    on: {
                      click: () => {
                        choices.goal = g.points;
                        go(2);
                      },
                    },
                  },
                  h('span.goal-points', `${g.points} ⭐`),
                  ui.bi(g.ko, g.en),
                  h('span.goal-minutes', `about ${g.minutes} min a day`)
                )
              )
            ),
            h('p.hint', '🔥 Your streak grows every day you practise at all — even one short round counts.'),
            ui.button({ ko: '다음', en: 'Next', variant: 'primary', size: 'big', onClick: () => go(3) }),
          ]),

        // 3 — Sound check
        () => {
          const status = M.speech.status();
          let message;
          if (status === 'ready') {
            const v = M.speech.voice();
            message = h('div.notice.notice-good', '✅ ', ui.bi('한국어 음성을 찾았어요!', `Korean voice found: ${v ? v.name : ''}`, 'inline'));
          } else if (status === 'loading') {
            message = h('div.notice', '⏳ ', ui.bi('음성을 찾는 중…', 'Looking for a Korean voice…', 'inline'));
          } else {
            message = h('div.notice.notice-warn', h('b', '🔇 No Korean voice found. '), ui.voiceHelp());
          }
          return frame([
            h('h1', ui.bi('소리를 확인해요', "Let's check the sound")),
            h('p.lead', 'Hearing words is a big part of learning them. Press the button — you should hear “안녕하세요!”'),
            h(
              'div.sound-check',
              ui.button({ icon: '🔊', ko: '들어 보기', en: 'Play a test sound', variant: 'mint', size: 'big', onClick: () => M.speech.speak('안녕하세요! 반가워요.') })
            ),
            message,
            h(
              'div.onboarding-actions',
              ui.button({ ko: '홈으로', en: 'Go to home', variant: 'soft', size: 'big', onClick: () => finish('#/home') }),
              ui.button({ icon: '▶\uFE0E', ko: '첫 연습 시작!', en: 'Start my first round', variant: 'primary', size: 'big', onClick: () => finish('#/play/word-cards') })
            ),
          ]);
        },
      ];

      function go(next) {
        step = next;
        U.clear(view).append(steps[step]());
        const primary = view.querySelector('.level-option.selected, .goal-option.selected, .btn-primary');
        if (primary) primary.focus({ preventScroll: true });
      }

      offStatus = M.events.on('speech:status', () => {
        if (step === 3) go(3);
      });
      go(0);
      return () => offStatus && offStatus();
    },
  });
})(window.Mallang);
