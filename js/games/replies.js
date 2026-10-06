/**
 * Minigame — 대답 고르기 · Choose your reply: you're in the conversation. They
 * speak (read aloud), then you pick your reply from three, or say it with the
 * 🎤. After a wrong one they react the way a real person would, it's
 * explained, and you try again; the right line is read in a second voice and
 * the conversation goes on. At the end, the whole conversation with its
 * translations, and a 🎤 for each of your lines.
 *
 * Every conversation has its own spaced-repetition record ('reply:<id>') and
 * opens once you know its key words. They live in content/replies.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.replies;
  const points = () => M.config.points;

  const isUnlocked = (r) => r.needs.every(M.srs.isIntroduced);
  const missingWords = (r) => r.needs.filter((id) => !M.srs.isIntroduced(id));
  const topicOrder = (r) => M.content.topic(r.topic)?.order ?? 99;
  const byCurriculum = (a, b) => a.level - b.level || topicOrder(a) - topicOrder(b) || a.index - b.index;
  const turnsOf = (r) => r.steps.filter((st) => st.you).length;

  /** English with *emphasis* (and **bold**) marks → safe DOM nodes. */
  const emph = (text) =>
    String(text)
      .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
      .filter(Boolean)
      .map((part) => (/^\*\*.+\*\*$/.test(part) ? h('strong', part.slice(2, -2)) : /^\*.+\*$/.test(part) ? h('em', part.slice(1, -1)) : part));

  /** Due conversations first, then new ones (easiest first), then the least grown; the focus topic's first in each group. */
  function pickRound(topicId = 'all', now = U.now()) {
    const open = M.content.replies().filter(isUnlocked);
    const away = (r) => (topicId === 'all' || r.topic === topicId ? 0 : 1);
    const due = open.filter((r) => M.srs.isDue(r.id, now)).sort((a, b) => away(a) - away(b) || M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open.filter((r) => M.srs.stageOf(r.id) === 0).sort((a, b) => away(a) - away(b) || byCurriculum(a, b));
    const rest = U.shuffle(open.filter((r) => !due.includes(r) && !fresh.includes(r))).sort((a, b) => away(a) - away(b) || M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().perRound);
  }

  /** The locked conversation closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = M.content.replies().filter((r) => !isUnlocked(r));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || byCurriculum(a, b));
    return locked[0] || null;
  }

  /** How a conversation went: no slips → good, one → hard, more → again. */
  const gradeFor = (slips) => (slips === 0 ? 'good' : slips === 1 ? 'hard' : 'again');

  /**
   * Which option did the learner say? The option closest to what the 🎤 heard,
   * when it's close enough and clearly closer than the others; otherwise null.
   * The recogniser's guesses come most likely first: the first one that clearly
   * points at one option decides.
   */
  function heardOption(options, alternatives, { min = 0.6, margin = 0.08 } = {}) {
    for (const heard of alternatives) {
      const [best, second] = options.map((o, i) => [M.mic.similarity(o.ko, heard), i]).sort((a, b) => b[0] - a[0]);
      if (best && best[0] >= min && (!second || best[0] - second[0] >= margin)) return best[1];
    }
    return null;
  }

  /** Their voice and yours (the other one): 'T' and 'Y'. */
  const speakersOf = (r) => ({ T: { voice: r.them.voice }, Y: { voice: r.them.voice === 'high' ? 'low' : 'high' } });

  M.games.register({
    id: 'replies',
    order: 10.5,
    emoji: '💬',
    color: 'lilac',
    title: { ko: '대답 고르기', en: 'Choose Your Reply' },
    blurb: { ko: '내가 할 말을 골라요', en: 'You’re in the conversation: pick what to say' },

    status() {
      const all = M.content.replies();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((r) => M.srs.isDue(r.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'conversation')} to try again` };
      const fresh = open.filter((r) => M.srs.stageOf(r.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 대화 ${fresh}개`, en: `${U.plural(fresh, 'new conversation')}` };
      return { ready: true, ko: `대화 ${open.length}개`, en: `${U.plural(open.length, 'conversation')} to try again` };
    },

    start(host) {
      const list = pickRound(host.topicId);
      if (!list.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '대화가 아직 잠겨 있어요',
          en: 'The conversations are still locked',
          text: words.length
            ? `Each conversation opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each conversation opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }

      const total = list.reduce((n, r) => n + turnsOf(r), 0);
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      let left = false;
      let player = null;
      let stopKeys = null;
      let stopMic = null;
      const timers = new Set();
      const later = (fn, ms) => {
        const t = setTimeout(() => {
          timers.delete(t);
          if (!left) fn();
        }, ms);
        timers.add(t);
      };
      const release = () => {
        if (stopKeys) stopKeys();
        stopKeys = null;
        if (stopMic) stopMic();
        stopMic = null;
      };
      host.onCleanup(() => {
        left = true;
        release();
        timers.forEach(clearTimeout);
        if (player) player.stop();
        M.mic.stop();
      });

      let current = null; // the line being read, and what the conversation waits to do once it's over

      /**
       * Read one line in their voice ('T') or yours ('Y'); then(): when it's over (at once without a voice).
       * A line read over another (R, 🔊) takes over what that one was still waiting to do, so replaying
       * never skips the conversation ahead. `force`: play even with auto-play off (R and 🔊 do).
       */
      function say(r, who, x, then = null, { force = false } = {}) {
        const waiting = current && current.then;
        current = null;
        if (player) player.stop();
        player = null;
        M.mic.stop(); // a 🎤 still listening would hear the voice
        const after = waiting && then ? () => (waiting(), then()) : waiting || then;
        if (!M.speech.isReady() || (!force && !M.store.state.settings.autoPlayAudio)) {
          if (after) later(after, 450);
          return;
        }
        const dialogue = { speakers: speakersOf(r), lines: [{ who, ko: x.say || M.numbers.readAloud(x.ko) }] };
        const me = { then: after };
        let begun = false; // play() first stops whatever was playing
        const mine = M.dialogues.player(
          dialogue,
          (i) => {
            if (i >= 0) {
              begun = true;
              return;
            }
            if (!begun || current !== me) return; // not started yet, or another line took over
            current = null;
            if (player === mine) player = null;
            if (me.then) later(me.then, 250);
          },
          { voices: M.dialogues.voicesFor(dialogue) }
        );
        current = me;
        player = mine;
        mine.play();
      }

      /** A 🔊 for one line, in its speaker's voice. */
      function lineButton(r, who, x) {
        return h(
          'button',
          {
            type: 'button',
            class: 'audio-btn small',
            title: 'Play this line',
            'aria-label': 'Play this line',
            on: { ...M.keys.noMouseFocus, click: () => M.speech.isReady() && say(r, who, x, null, { force: true }) },
          },
          h('span', { 'aria-hidden': 'true' }, '🔊')
        );
      }

      /** Bring an element into view (smoothly, unless the learner prefers less motion). */
      function reveal(el) {
        if (!el || !el.scrollIntoView) return;
        const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
      }

      /** A chat bubble: theirs on the left (English on request), yours on the right. */
      function bubble(r, who, x, { cls = '', english = who === 'Y' } = {}) {
        const en = h('span.reply-en', { hidden: !english }, emph(x.en));
        const peek =
          english || !x.en
            ? null
            : h(
                'button.reply-en-toggle',
                {
                  type: 'button',
                  title: 'Show the English',
                  on: {
                    ...M.keys.noMouseFocus,
                    click: (event) => {
                      en.hidden = false;
                      event.currentTarget.remove();
                    },
                  },
                },
                'EN'
              );
        return h(
          'div',
          { class: `reply-bubble ${who === 'T' ? 'them' : 'you'} ${cls}`.trim() },
          h('span.reply-avatar', { 'aria-hidden': 'true' }, who === 'T' ? r.them.emoji : '🙋'),
          h('div.reply-body', h('span.reply-ko', { lang: 'ko' }, x.ko), lineButton(r, who, x), peek, en)
        );
      }

      function screen(...children) {
        release();
        current = null;
        if (player) player.stop();
        player = null;
        M.mic.stop(); // e.g. a 🎤 from the last conversation's transcript
        U.clear(host.stage);
        host.stage.append(...children);
      }

      /* ---------- One conversation ---------- */

      function play(n) {
        if (n >= list.length) return finish();
        const r = list[n];
        let slips = 0;
        let step = 0;
        const chat = h('div.reply-chat', { 'aria-live': 'polite' });
        const turn = h('div.reply-turn');
        const goal = h('div.reply-goal', h('span', { 'aria-hidden': 'true' }, '🎯 '), ui.bi(r.goal.ko, r.goal.en, 'inline'));

        // The scene first: who you are, who you talk to, what you want.
        const go = ui.button({ ko: '시작', en: 'Start', variant: 'primary', size: 'big', onClick: begin });
        screen(
          h(
            'div.ex.ex-reply',
            ui.exTag('대답 고르기', list.length > 1 ? `Conversation ${n + 1} of ${list.length}` : 'Choose your reply', '💬'),
            h(
              'div.reply-intro',
              h('div.reply-scene', { 'aria-hidden': 'true' }, r.scene || '💬'),
              h('h2.reply-title', ui.bi(r.title.ko, r.title.en)),
              h(
                'div.reply-cast',
                h('span.reply-who', '🙋 ', ui.bi(`나: ${r.role.ko}`, `You: ${r.role.en}`, 'inline')),
                h('span.reply-who', `${r.them.emoji} `, ui.bi(r.them.name, r.them.en, 'inline'))
              ),
              goal.cloneNode(true)
            ),
            h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), go)
          )
        );
        go.focus({ preventScroll: true });
        stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            begin();
          }
        });
        let begun = false;

        function begin() {
          if (begun) return;
          begun = true;
          screen(h('div.ex.ex-reply', h('div.reply-head', h('span.reply-head-scene', { 'aria-hidden': 'true' }, r.scene || '💬'), h('span.reply-head-title', ui.bi(r.title.ko, r.title.en, 'inline')), goal), chat, turn));
          stopKeys = M.keys.push(onKey);
          advance();
        }

        let options = null; // this turn's buttons, while it's your turn
        let lastThem = null;

        function onKey(event) {
          if (event.repeat || M.keys.isTypingTarget(event)) return;
          const k = Number(event.key);
          if (options && k >= 1 && k <= options.length) {
            event.preventDefault();
            options[k - 1].click();
          } else if (M.keys.isReplay(event) && lastThem) {
            event.preventDefault();
            say(r, 'T', lastThem, null, { force: true });
          } else if (options && options.mic && (event.code === 'KeyM' || event.key === 'm' || event.key === 'M')) {
            event.preventDefault();
            options.mic.click();
          }
        }

        /** The next step: their line, or your turn; after the last one, the summary. */
        function advance() {
          if (left) return;
          if (step >= r.steps.length) return done();
          const st = r.steps[step];
          step++;
          if (!st.them) {
            yourTurn(st.you);
            return;
          }
          lastThem = st.them;
          chat.append(bubble(r, 'T', st.them));
          scrollDown();
          // Your turn shows as their line starts (you can read while it plays); their next line, or the end, waits for it.
          const after = step >= r.steps.length ? 'end' : r.steps[step].them ? 'them' : 'you';
          if (after === 'you') {
            say(r, 'T', st.them);
            later(advance, 350);
          } else say(r, 'T', st.them, () => later(advance, after === 'end' ? 500 : 0));
        }

        function scrollDown() {
          reveal(chat.lastElementChild);
        }

        function yourTurn(choices) {
          const shown = U.shuffle(choices.map((o, i) => ({ ...o, index: i })));
          let first = true;
          let tries = 0;
          const hint = h('div.reply-hint', { 'aria-live': 'polite' });
          const buttons = shown.map((o, i) =>
            h(
              'button',
              { type: 'button', class: 'option option-ko reply-option', lang: 'ko', on: { ...M.keys.noMouseFocus, click: () => pick(o, buttons[i]) } },
              h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
              h('span.option-text', o.ko)
            )
          );
          options = buttons;
          options.mic = micButton();
          U.clear(turn).append(
            h('p.reply-ask', ui.bi('어떻게 대답할까요?', 'What do you say?')),
            h('div.options.reply-options', { role: 'group', 'aria-label': 'Your reply' }, buttons),
            options.mic ? h('div.reply-say', options.mic, hint) : hint,
            h('div.ex-actions.reply-keys', h('span.key-hint', ui.bi(options.mic ? '1–3 · R 다시 듣기 · M 말하기' : '1–3 · R 다시 듣기', options.mic ? '1–3 to choose · R to replay · M to speak' : '1–3 to choose · R to replay')))
          );
          turn.hidden = false;
          reveal(turn);

          function micButton() {
            if (!M.mic.supported() || !M.store.state.settings.speaking) return null;
            const btn = h(
              'button.btn.btn-soft.btn-small.reply-mic',
              { type: 'button', title: 'Say your reply (M)', on: { ...M.keys.noMouseFocus, click: listen } },
              h('span.btn-icon', { 'aria-hidden': 'true' }, '🎤'),
              ui.bi('말해서 고르기', 'Say it')
            );
            function listen() {
              if (stopMic) {
                stopMic();
                return;
              }
              if (player) player.stop();
              btn.classList.add('listening');
              hint.className = 'reply-hint';
              hint.textContent = '듣고 있어요… listening';
              stopMic = M.mic.listen({
                onResult: (alternatives) => {
                  const open = shown.filter((o, i) => !buttons[i].disabled);
                  const k = heardOption(open, alternatives);
                  if (k === null) {
                    hint.className = 'reply-hint miss';
                    hint.textContent = `I heard “${alternatives[0] || '…'}”, which isn’t close to one of the replies. Try again, or tap one.`;
                    return;
                  }
                  hint.textContent = `I heard “${alternatives[0]}”.`;
                  const i = shown.indexOf(open[k]);
                  pick(shown[i], buttons[i]);
                },
                onError: (code) => {
                  hint.className = 'reply-hint miss';
                  hint.textContent = ui.sayError(code);
                },
                onEnd: () => {
                  btn.classList.remove('listening');
                  stopMic = null;
                },
              });
            }
            return btn;
          }

          function pick(o, button) {
            if (button.disabled || left) return;
            if (stopMic) stopMic();
            if (player) player.stop();
            const right = !!o.right;
            tries++;
            if (first) {
              M.progress.recordAnswer(right);
              round.answers++;
              host.setProgress(round.answers, total);
            }
            if (right) {
              // Full points the first time, a few the second, none when it's the last one left.
              let earned = first ? points().reply : tries === 2 ? points().replyRetry : 0;
              if (first) {
                round.correct++;
                round.combo++;
                round.bestCombo = Math.max(round.bestCombo, round.combo);
                if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
                M.progress.bump('repliesRight');
              }
              host.award(earned, button);
              host.react({ correct: true }, round.combo);
              buttons.forEach((b) => (b.disabled = true));
              button.classList.add('correct');
              options = null;
              const mine = bubble(r, 'Y', o, { cls: 'right' });
              if (o.note) mine.append(h('div.reply-note', h('span', { 'aria-hidden': 'true' }, '💡 '), emph(o.note)));
              chat.append(mine);
              turn.hidden = true;
              scrollDown();
              M.store.save();
              say(r, 'Y', o, advance);
              return;
            }
            // A slip: they react, it's explained, and you try again.
            slips++;
            if (first) round.combo = 0;
            first = false;
            host.react({ correct: false }, 0);
            button.disabled = true;
            button.classList.add('wrong');
            chat.append(bubble(r, 'Y', o, { cls: 'wrong' }), bubble(r, 'T', o.react, { cls: 'react' }), h('div.reply-why', h('span', { 'aria-hidden': 'true' }, '💡 '), emph(o.why)));
            scrollDown();
            M.store.save();
            say(r, 'T', o.react);
          }
        }

        /** The end of the conversation: how it went, and the whole of it with translations. */
        function done() {
          release();
          M.srs.review(r.id, gradeFor(slips));
          M.progress.bump('repliesDone');
          M.store.save();
          const lines = [];
          for (const st of r.steps) {
            if (st.them) lines.push(['T', st.them]);
            else lines.push(['Y', st.you.find((o) => o.right)]);
          }
          const last = n + 1 >= list.length;
          const next = ui.button({ ko: last ? '끝내기' : '다음 대화', en: last ? 'Finish' : 'Next conversation', variant: 'primary', size: 'big', onClick: () => play(n + 1) });
          screen(
            h(
              'div.ex.ex-reply',
              ui.exTag('대화 끝!', 'Conversation complete', slips ? '💬' : '🎉'),
              h(
                'div.reply-intro.reply-summary',
                h('h2.reply-title', ui.bi(r.title.ko, r.title.en)),
                h('p.reply-result', slips ? ui.bi(`실수 ${slips}번`, slips === 1 ? 'One slip: it’ll come back soon to try again.' : `${slips} slips: it’ll come back soon to try again.`) : ui.bi('완벽해요!', 'Every reply right the first time.')),
                h(
                  'div.reply-transcript',
                  lines.map(([who, x]) => {
                    const b = bubble(r, who, x, { english: true });
                    if (who === 'Y' && ui.sayButton) {
                      const say2 = ui.sayButton(x.ko);
                      if (say2) b.querySelector('.reply-body').append(say2);
                    }
                    return b;
                  })
                )
              ),
              h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), next)
            )
          );
          next.focus({ preventScroll: true });
          window.scrollTo(0, 0);
          stopKeys = M.keys.push((event) => {
            if (event.key === 'Enter' && !M.keys.isControl(event)) {
              event.preventDefault();
              next.click();
            }
          });
        }
      }

      function finish() {
        host.finish({
          gameId: 'replies',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }

      play(0);
    },
  });

  M.replies = { pickRound, nextLocked, isUnlocked, gradeFor, heardOption, emph };
})(window.Mallang);
