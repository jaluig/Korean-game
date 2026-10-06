/**
 * Minigame — 발음 변화 · Sound changes: how Korean words really sound when the
 * letters meet: 먹어요 [머거요], 학년 [항년], 좋다 [조타], 같이 [가치]. One rule at
 * a time: its card, then its words, mixed with the rules you've met. Two kinds
 * of question: how is it said (pick the pronunciation), and which spelling
 * did you hear (pick the spelling). After each: hear it, and say it with 🎤.
 *
 * Rules ('pronrule:<id>') are introduced with their card; items ('pron:<id>')
 * have their own spaced-repetition records. They live in content/sound-changes.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.soundChanges;
  const points = () => M.config.points;
  const plain = (t) => String(t).replace(/\s+/g, '');
  const rich = (text) => (ui.richText ? ui.richText(text) : text);
  const voiced = () => M.speech.isReady();

  const itemsOf = (rule) => M.content.soundItems(rule.id);
  const metRules = () => M.content.soundRules().filter((r) => M.srs.isIntroduced(r.id));

  /** The rule to learn next, if it's time for one: none met yet, or every item of the met rules seen. */
  function newRule() {
    const rules = M.content.soundRules();
    const next = rules.find((r) => !M.srs.isIntroduced(r.id) && itemsOf(r).length);
    if (!next) return null;
    const unseen = metRules().flatMap(itemsOf).filter((x) => M.srs.stageOf(x.id) === 0);
    return unseen.length ? null : next;
  }

  /** A round: { rule (a new one, or null), items }: the new rule's items first, then due, unseen and the least grown. */
  function planRound(now = U.now()) {
    const rule = newRule();
    const size = cfg().size;
    const picked = [];
    if (rule) picked.push(...U.shuffle(itemsOf(rule)).slice(0, metRules().length ? cfg().newPerRound : size));
    const pool = metRules().flatMap(itemsOf);
    const due = pool.filter((x) => M.srs.isDue(x.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = pool.filter((x) => M.srs.stageOf(x.id) === 0);
    const rest = U.shuffle(pool.filter((x) => !due.includes(x) && !fresh.includes(x))).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    for (const x of [...due, ...fresh, ...rest]) {
      if (picked.length >= size) break;
      if (!picked.includes(x)) picked.push(x);
    }
    return { rule, items: picked };
  }

  /** Newer items: how is it said? Grown ones: that, or which spelling did you hear. */
  const kindFor = (item) => (M.srs.stageOf(item.id) >= 2 && U.random() < 0.5 ? 'spell' : 'how');

  /** A question: { item, kind, options: [{ text, correct, why }] } (three options). */
  function question(item, kind = kindFor(item)) {
    const rule = M.content.soundRule(item.rule);
    const ruleName = rule ? `${rule.title.ko} (${rule.title.en})` : 'the rule';
    if (kind === 'spell') {
      const wrong = item.spellings.map((s) => ({
        text: s,
        correct: false,
        why:
          plain(s) === plain(item.pron)
            ? `${s} is written the way it sounds, but the word is spelled ${item.ko}: ${ruleName} changes how it sounds.`
            : `${s} isn’t how it’s spelled: “${item.en}” is ${item.ko}, said [${item.pron}].`,
      }));
      return { item, kind, rule, options: U.shuffle([{ text: item.ko, correct: true }, ...wrong]) };
    }
    const wrong = U.sample(item.wrong, 2).map((p) => ({
      text: p,
      correct: false,
      why: plain(p) === plain(item.ko) ? `[${p}] reads it letter by letter, as it’s spelled. With ${ruleName}, it’s said [${item.pron}].` : `Not [${p}]: with ${ruleName}, ${item.ko} is said [${item.pron}].`,
    }));
    return { item, kind, rule, options: U.shuffle([{ text: item.pron, correct: true }, ...wrong]) };
  }

  /** A rule's card: the rule, a note, and examples with a 🔊 each. */
  function ruleCard(rule) {
    return h(
      'div.pron-card',
      h('div.pron-card-head', h('span.pron-card-emoji', { 'aria-hidden': 'true' }, rule.emoji || '👄'), h('h2', ui.bi(rule.title.ko, rule.title.en))),
      h('p.pron-card-text', rich(rule.text)),
      rule.note ? h('p.pron-card-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(rule.note)) : null,
      h(
        'ul.pron-examples',
        (rule.examples || []).map((e) =>
          h(
            'li',
            h('span.pron-ex-ko', { lang: 'ko' }, e.ko),
            h('span.pron-arrow', { 'aria-hidden': 'true' }, '→'),
            h('span.pron-ex-pron', { lang: 'ko' }, `[${e.pron}]`),
            ui.audioButton(e.ko, { size: 'small' }),
            h('span.pron-ex-en', e.en)
          )
        )
      )
    );
  }

  function showRuleCard(rule) {
    if (!rule) return;
    const dialog = ui.modal({
      title: { ko: `${rule.title.ko} · 발음 규칙`, en: `${rule.title.en}: the rule` },
      cls: 'modal-wide',
      body: [ruleCard(rule)],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }

  M.games.register({
    id: 'sound-changes',
    order: 8.5,
    emoji: '👄',
    color: 'butter',
    title: { ko: '발음 변화', en: 'Sound Changes' },
    blurb: { ko: '학년은 [항년]', en: 'How words really sound: 학년 → [항년]' },

    status() {
      const rules = M.content.soundRules();
      if (!rules.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const rule = newRule();
      if (rule) return { ready: true, ko: `새 규칙: ${rule.title.ko}`, en: `New rule: ${rule.title.en}` };
      const due = metRules().flatMap(itemsOf).filter((x) => M.srs.isDue(x.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${due} to review` };
      return { ready: true, ko: '발음 연습', en: 'Practise the sounds' };
    },

    start(host) {
      const plan = planRound();
      if (!plan.items.length) {
        host.empty({ emoji: '👄', ko: '준비 중이에요', en: 'Nothing to practise yet', text: 'The sound-change rules are on their way.' });
        return;
      }
      const steps = [...(plan.rule ? [{ card: plan.rule }] : []), ...plan.items.map((item) => ({ item }))];
      const total = plan.items.length;
      const round = { answers: 0, correct: 0, combo: 0, bestCombo: 0 };
      let index = 0;
      let cleanup = null;
      host.onCleanup(() => cleanup && cleanup());
      next();

      function next() {
        if (cleanup) cleanup();
        cleanup = null;
        M.speech.stop();
        U.clear(host.stage);
        host.setProgress(round.answers, total);
        if (index >= steps.length) return finish();
        const step = steps[index];
        if (step.card) intro(step.card);
        else ask(step.item);
      }

      function advance() {
        index++;
        next();
      }

      /** A new rule: its card, before its words. */
      function intro(rule) {
        M.srs.introduce(rule.id);
        M.store.save();
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-pron-intro', ui.exTag('새 발음 규칙', 'A new sound rule', '✨'), ruleCard(rule), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        host.mascot.say(`${rule.title.ko}!`, `A new rule: ${rule.title.en}`, { duration: 2500 });
        const stopKeys = M.keys.push((event) => {
          if (event.key === 'Enter' && !M.keys.isControl(event)) {
            event.preventDefault();
            done();
          }
        });
        cleanup = stopKeys;
        let finished = false;
        function done() {
          if (finished) return;
          finished = true;
          stopKeys();
          cleanup = null;
          advance();
        }
      }

      function ask(item) {
        const q = question(item);
        let locked = false;
        const listen = q.kind === 'spell';
        const play = () => M.speech.speak(item.ko);
        const prompt = listen
          ? h(
              'div.pron-q-card',
              voiced()
                ? h('button.pron-play', { type: 'button', on: { ...M.keys.noMouseFocus, click: play } }, h('span', { 'aria-hidden': 'true' }, '🔊'), ui.bi('다시 듣기', 'Play it again (R)'))
                : h('div.pron-q-word', { lang: 'ko' }, `[${item.pron}]`),
              h('div.pron-q-en', `“${item.en}”`)
            )
          : h('div.pron-q-card', h('div.pron-q-word', { lang: 'ko' }, item.ko), h('div.pron-q-en', `“${item.en}”`));
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: 'option option-ko', lang: 'ko', on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', listen ? o.text : `[${o.text}]`)
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-pron',
            listen ? ui.exTag(voiced() ? '들은 단어는?' : '어떻게 써요?', voiced() ? 'Which spelling did you hear?' : 'How is it spelled?', '👂') : ui.exTag('어떻게 읽어요?', 'How is it said?', '👄'),
            prompt,
            h('div.options', { role: 'group', 'aria-label': 'Answers' }, buttons),
            q.rule
              ? h('div.speech-card-link', h('button.btn.btn-ghost.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showRuleCard(q.rule) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('규칙 카드', 'The rule')))
              : null
          )
        );
        if (listen && voiced()) M.speech.speakLater(item.ko, 300);
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= buttons.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (listen && M.keys.isReplay(event)) {
            event.preventDefault();
            play();
          }
        });
        cleanup = stopKeys;

        function choose(i) {
          if (locked) return;
          locked = true;
          stopKeys();
          const picked = q.options[i];
          buttons.forEach((b) => (b.disabled = true));
          buttons[i].classList.add(picked.correct ? 'correct' : 'wrong');
          if (!picked.correct) buttons[q.options.findIndex((o) => o.correct)].classList.add('correct');
          onAnswer(q, picked);
        }
      }

      function onAnswer(q, picked) {
        const { item, rule } = q;
        const correct = picked.correct;
        M.srs.review(item.id, correct ? 'good' : 'again');
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().pron;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('pronCorrect');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();
        if (M.store.state.settings.autoPlayAudio) M.speech.speakLater(item.ko, 300, { quiet: true });

        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        const content = [
          h(
            'div.fb-row.fb-answer',
            h('span.fb-label', ui.bi('정답', 'Answer')),
            h('span.fb-ko', { lang: 'ko' }, item.ko, h('span.pron-fb-pron', ` [${item.pron}]`)),
            ui.audioButton(item.ko, { size: 'small' }),
            ui.sayButton ? ui.sayButton(item.ko) : null
          ),
          h('div.fb-en-line', `“${item.en}”`),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), h('span.fb-ko', { lang: 'ko' }, q.kind === 'spell' ? picked.text : `[${picked.text}]`)),
          correct ? null : tip(picked.why),
          tip(item.note),
          rule
            ? h(
                'div.grammar-fb-card',
                h('span.pron-fb-rule', `${rule.emoji || '👄'} `, ui.bi(rule.title.ko, rule.title.en, 'inline')),
                h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: () => showRuleCard(rule) } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('규칙 카드', 'The rule'))
              )
            : null,
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: item.ko, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'sound-changes',
          answers: round.answers,
          correct: round.correct,
          bestCombo: round.bestCombo,
          learned: [],
          mistakes: [],
          perfect: false,
        });
      }
    },
  });

  M.soundChanges = { planRound, newRule, question, kindFor, ruleCard };
})(window.Mallang);
