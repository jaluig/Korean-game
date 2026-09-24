/**
 * The play screen hosts any minigame (route: #/play/<game id>).
 *
 * It draws the shared frame — quit button, progress bar, points, mascot — and
 * hands the game a `host` object. See README → "Adding a minigame".
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;

  M.screens.register({
    id: 'play',

    render(view, gameId) {
      const game = M.games.get(gameId);
      if (!game) {
        location.hash = '#/home';
        return null;
      }
      const topicId = M.store.state.settings.focusTopic;
      const cleanups = [];
      const happened = { goal: false, levelUp: 0 };
      cleanups.push(M.events.on('goal', () => (happened.goal = true)));
      cleanups.push(M.events.on('levelup', (level) => (happened.levelUp = level)));

      let roundPoints = 0;
      let finished = false;
      const progress = ui.bar(0, { color: game.color, label: 'Round progress' });
      const pointsNum = h('span.play-points-num', '0');
      const pointsEl = h('div.play-points', { title: 'Points this round' }, h('span', { 'aria-hidden': 'true' }, '⭐'), pointsNum);
      const quitBtn = h('button.icon-btn.play-quit', { type: 'button', title: '그만하기 · Quit', 'aria-label': 'Quit this round', on: { click: quit } }, '✕');
      const stage = h('div.play-stage');
      const feedbackRoot = h('div.play-feedback');
      const mascot = M.mascot.create({ size: 84, bubble: true });
      const topic = M.content.topic(topicId);

      view.append(
        h(
          'div',
          { class: `play game-${game.id} tone-${game.color}` },
          h(
            'div.play-top',
            quitBtn,
            h('div.play-title', h('span', { 'aria-hidden': 'true' }, game.emoji), ui.bi(game.title.ko, topic ? `${game.title.en} · ${topic.title.en}` : game.title.en)),
            h('div.play-progress', progress),
            pointsEl
          ),
          stage,
          h('div.play-mascot', mascot.el),
          feedbackRoot
        )
      );

      const host = {
        game,
        topicId,
        stage,
        mascot,

        setProgress(done, total) {
          progress.set(total ? done / total : 0);
        },

        /** Add points to this round and to the learner's total. */
        award(amount, anchor) {
          if (!(amount > 0)) return;
          roundPoints += amount;
          pointsNum.textContent = String(roundPoints);
          pointsEl.classList.remove('bump');
          void pointsEl.offsetWidth;
          pointsEl.classList.add('bump');
          ui.floatPoints(anchor || pointsEl, amount);
          M.progress.addPoints(amount);
        },

        /** Sound + mascot reaction to an answer. */
        react(result, combo = 0) {
          if (!result.correct) {
            M.sfx.play('wrong');
            mascot.react('wrong');
          } else if (result.almost) {
            M.sfx.play('almost');
            mascot.react('almost');
          } else {
            M.sfx.play('correct');
            mascot.react(combo && combo % M.config.points.comboEvery === 0 ? 'combo' : 'correct');
          }
        },

        showFeedback(options) {
          return ui.feedback.show(feedbackRoot, options);
        },

        /** Replace the game area with a friendly message (nothing to do, locked…). */
        empty({ emoji = '🌱', ko, en, text, actions = [] }) {
          U.clear(stage);
          progress.set(0);
          stage.append(
            h(
              'div.empty-card',
              h('div.big-emoji', { 'aria-hidden': 'true' }, emoji),
              h('h2', ui.bi(ko, en)),
              text ? h('p', text) : null,
              h(
                'div.empty-actions',
                actions.map((a) => h('a.btn.btn-primary', { href: a.href }, ui.bi(a.ko, a.en))),
                h('a.btn.btn-soft', { href: '#/home' }, ui.bi('홈으로', 'Home'))
              )
            )
          );
          mascot.setMood('think');
        },

        onCleanup(fn) {
          cleanups.push(fn);
        },

        /** The round is over: record it and show the summary. */
        finish(result) {
          if (finished) return;
          finished = true;
          const badges = M.progress.finishRound(result);
          M.session.lastResult = {
            ...result,
            points: roundPoints,
            badges,
            goalReached: happened.goal,
            levelUp: happened.levelUp,
            topicId,
          };
          location.hash = '#/summary';
        },
      };

      async function quit() {
        if (finished) return;
        if (roundPoints > 0) {
          const ok = await ui.confirm({
            title: { ko: '그만할까요?', en: 'Stop this round?' },
            text: 'Your answers so far are already saved.',
            ok: { ko: '그만하기', en: 'Stop' },
            cancel: { ko: '계속하기', en: 'Keep going' },
          });
          if (!ok) return;
        }
        location.hash = '#/home';
      }

      // Esc asks to quit (unless a dialog is open — it handles Esc itself).
      const onEscape = (event) => {
        if (event.key === 'Escape' && !document.querySelector('.modal-backdrop')) quit();
      };
      document.addEventListener('keydown', onEscape);
      cleanups.push(() => document.removeEventListener('keydown', onEscape));

      document.body.classList.add('playing');
      try {
        game.start(host);
      } catch (err) {
        console.error(err);
        host.empty({ emoji: '😵', ko: '앗, 문제가 생겼어요', en: 'Oops — something went wrong', text: String(err && err.message) });
      }

      return () => {
        document.body.classList.remove('playing');
        cleanups.forEach((fn) => fn());
        M.speech.stop();
      };
    },
  });
})(window.Mallang);
