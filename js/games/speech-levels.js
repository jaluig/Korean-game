/**
 * Minigame 12 — 말투 · Speech Levels: the same sentence in 합니다체 (formal),
 * 해요체 (polite) and 반말 (casual), and when to use each. The very first
 * round opens with the card: the three levels, who each is for and what
 * changes (저 → 나, 네 → 응, 이에요 → 이야…). Then each question is about one
 * sentence: which level is it, which one fits the person you're talking to,
 * or say it in 반말 or 합니다체 next to the slips learners really make
 * (저는 학생이야, 학생야, 갑습니다), every option explained.
 *
 * Each sentence has its own spaced-repetition record ('speech:<id>') and opens
 * once its key words are known; its questions get harder as it grows. The
 * sentences, the scenes and the card live in content/speech-levels.js.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;
  const ui = M.ui;
  const cfg = () => M.config.session.speechLevels;
  const points = () => M.config.points;
  const LEVELS = M.content.LEVELS; // formal, polite, casual

  const items = () => M.content.speechLevels();
  const isUnlocked = (it) => it.needs.every(M.srs.isIntroduced);
  const missingWords = (it) => it.needs.filter((id) => !M.srs.isIntroduced(id));
  const scene = (id) => M.content.speechScenes().find((s) => s.id === id) || null;
  /** A level as the card describes it: { to, ko: '반말', en: 'Casual', emoji, ending, when, example }. */
  const level = (to) => (M.content.speechCard()?.levels || []).find((l) => l.to === to) || { to, ko: to, en: to, emoji: '💬', ending: '', when: '' };
  const rich = (text) => ui.richText(text || '');
  /** A 해요체 sentence offered as the answer to "say it in 반말 / 합니다체" hasn't changed level. */
  const STILL_POLITE = {
    casual: 'That’s still 해요체: in 반말 the 요 goes.',
    formal: 'That’s still 해요체: 합니다체 ends in -ㅂ니다 / -습니다.',
  };

  /** Due sentences first, then a few new ones (easiest first), then the least grown. */
  function pickRound(now = U.now()) {
    const open = items().filter(isUnlocked);
    const due = open.filter((it) => M.srs.isDue(it.id, now)).sort((a, b) => M.srs.peek(a.id).due - M.srs.peek(b.id).due);
    const fresh = open
      .filter((it) => M.srs.stageOf(it.id) === 0)
      .sort((a, b) => a.level - b.level || a.index - b.index)
      .slice(0, cfg().newPerRound);
    const rest = U.shuffle(open.filter((it) => !due.includes(it) && M.srs.stageOf(it.id) > 0)).sort((a, b) => M.srs.stageOf(a.id) - M.srs.stageOf(b.id));
    return [...due, ...fresh, ...rest].slice(0, cfg().size);
  }

  /** The sentence closest to opening (for the "locked" message). */
  function nextLocked() {
    const locked = items().filter((it) => !isUnlocked(it));
    locked.sort((a, b) => missingWords(a).length - missingWords(b).length || a.level - b.level || a.index - b.index);
    return locked[0] || null;
  }

  /** Easier questions while a sentence is new, harder as it grows; `again`: its second question this round. */
  function kindFor(item, stage = M.srs.stageOf(item.id), { again = false } = {}) {
    const scenes = item.scenes.some(scene);
    if (again || stage === 1) return scenes ? 'scene' : 'casual';
    if (stage === 0) return 'which';
    if (stage === 2) return U.random() < 0.6 || !scenes ? 'casual' : 'scene';
    return U.random() < 0.5 ? 'formal' : 'casual';
  }

  /** A round: one question per sentence; while few are open, the new ones come back once more, a step harder. */
  function planRound(now = U.now()) {
    const list = pickRound(now);
    const steps = U.shuffle(list).map((item) => ({ item, kind: kindFor(item) }));
    for (const item of list.filter((it) => M.srs.stageOf(it.id) === 0)) {
      if (steps.length >= cfg().size) break;
      steps.push({ item, kind: kindFor(item, 0, { again: true }) });
    }
    return steps;
  }

  /**
   * One question about a sentence. Options: { text (a sentence) or to (a level),
   * correct, why }; exactly one is right.
   *   which:  one of its sentences → which level is it?
   *   scene:  who you're talking to → which of its three sentences fits?
   *   casual / formal: its 해요체 sentence → say it in 반말 / 합니다체 (next to the typical slips).
   */
  function question(item, kind, { shown, sceneId } = {}) {
    const card = M.content.speechCard() || {};
    const wrong = (picked, wanted) => card.wrong?.[picked]?.[wanted] || '';
    if (kind === 'which') {
      const to = shown || U.pick(LEVELS);
      const options = LEVELS.map((l) => ({
        to: l,
        correct: l === to,
        why: l === to ? '' : `${level(l).ko} would end in ${level(l).ending}.`,
      }));
      return { kind, item, to, text: item[to], options };
    }
    if (kind === 'scene') {
      const place = scene(sceneId) || scene(U.pick(item.scenes.filter(scene)));
      const options = U.shuffle(LEVELS.map((l) => ({ to: l, text: item[l], correct: l === place.to, why: l === place.to ? '' : wrong(l, place.to) })));
      return { kind, item, scene: place, to: place.to, options };
    }
    // Say it in 반말 / 합니다체: the right sentence, its slips, then the other levels.
    const to = kind;
    const other = to === 'casual' ? 'formal' : 'casual';
    const slips = U.shuffle(item.traps.filter((t) => t.to === to)).map((t) => ({ text: t.text, why: t.why }));
    const others = [
      { to: other, text: item[other], why: wrong(other, to) },
      { to: 'polite', text: item.polite, why: STILL_POLITE[to] },
    ];
    const options = U.shuffle([{ to, text: item[to], correct: true, why: '' }, ...[...slips, ...others].slice(0, 2).map((o) => ({ ...o, correct: false }))]);
    return { kind, item, to, options };
  }

  /* ---------- The card (the first round, and the 📖 button) ---------- */

  function speechCard() {
    const card = M.content.speechCard();
    if (!card) return null;
    return h(
      'div.speech-card',
      h(
        'div.grammar-card-head',
        h('span.grammar-card-emoji', { 'aria-hidden': 'true' }, '🙇'),
        h('div', h('h2.speech-card-title', { lang: 'ko' }, card.title.ko), h('div.grammar-card-en', card.title.en))
      ),
      h('p.speech-card-text', rich(card.text)),
      h(
        'div.speech-levels',
        card.levels.map((l) =>
          h(
            `div.speech-level.speech-${l.to}`,
            h(
              'div.speech-level-head',
              h('span.speech-level-emoji', { 'aria-hidden': 'true' }, l.emoji),
              h('span.speech-level-name', ui.bi(l.ko, l.en)),
              h('span.speech-level-ending', { lang: 'ko' }, l.ending)
            ),
            h('p.speech-level-when', rich(l.when)),
            ui.example(l.example)
          )
        )
      ),
      h(
        'div.speech-table-wrap',
        h(
          'table.speech-table',
          h('thead', h('tr', h('th', h('span.sr-only', 'Meaning')), LEVELS.map((to) => h(`th.speech-${to}`, { scope: 'col', lang: 'ko' }, level(to).ko)))),
          h('tbody', card.table.map((row) => h('tr', h('th', { scope: 'row' }, row.en), LEVELS.map((to) => h('td', { lang: 'ko' }, row[to])))))
        )
      ),
      card.note ? h('p.grammar-note', h('span', { 'aria-hidden': 'true' }, '💡 '), rich(card.note)) : null
    );
  }

  function showSpeechCard() {
    const body = speechCard();
    if (!body) return;
    const dialog = ui.modal({
      cls: 'modal-wide modal-grammar modal-speech',
      body: [body],
      actions: [ui.button({ ko: '닫기', en: 'Close', variant: 'primary', onClick: () => dialog.close() })],
    });
  }
  if (ui) ui.showSpeechCard = showSpeechCard; // (the unit tests load the games without the UI)

  /** The sentence in all three levels, the one asked about highlighted (in the feedback). */
  function formsTable(item, lit) {
    return h(
      'div.speech-forms',
      LEVELS.map((to) =>
        h(
          `div.speech-form.speech-${to}${to === lit ? '.lit' : ''}`,
          h('span.speech-form-level', ui.bi(level(to).ko, level(to).en)),
          h('span.speech-form-text', { lang: 'ko' }, item[to]),
          ui.audioButton(item[to], { size: 'small' })
        )
      )
    );
  }

  M.games.register({
    id: 'speech-levels',
    order: 12,
    emoji: '🙇',
    color: 'lilac',
    title: { ko: '말투', en: 'Speech Levels' },
    blurb: { ko: '합니다 · 해요 · 반말', en: 'Formal, polite or casual?' },

    status() {
      const all = items();
      if (!all.length) return { ready: false, ko: '준비 중', en: 'Coming soon' };
      const open = all.filter(isUnlocked);
      if (!open.length) return { ready: false, ko: '단어를 더 배우면 열려요', en: 'Learn a few more words to open' };
      const due = open.filter((it) => M.srs.isDue(it.id)).length;
      if (due) return { ready: true, ko: `복습 ${due}개`, en: `${U.plural(due, 'sentence')} to review` };
      const fresh = open.filter((it) => M.srs.stageOf(it.id) === 0).length;
      if (fresh) return { ready: true, ko: `새 문장 ${fresh}개`, en: U.plural(fresh, 'new sentence') };
      return { ready: true, ko: `문장 ${open.length}개`, en: `${U.plural(open.length, 'sentence')} to practise` };
    },

    start(host) {
      const steps = planRound();
      if (!steps.length) {
        const locked = nextLocked();
        const words = locked ? missingWords(locked).map((id) => M.content.word(id)).filter(Boolean) : [];
        host.empty({
          emoji: '🔒',
          ko: '말투 연습이 아직 잠겨 있어요',
          en: 'Speech Levels is still locked',
          text: words.length
            ? `Each sentence opens once you know its key words. The next one needs: ${words.map((w) => `${w.ko} (${w.en})`).join(', ')}.`
            : 'Each sentence opens once you know its key words. Learn a few more in Word Cards.',
          actions: [{ ko: '단어 카드 하기', en: 'Play Word Cards', href: '#/play/word-cards' }],
        });
        return;
      }
      // The very first round starts with the card.
      if (!items().some((it) => M.srs.isIntroduced(it.id)) && M.content.speechCard()) steps.unshift({ kind: 'card' });

      const total = steps.filter((s) => s.item).length;
      const lastStep = new Map(steps.map((s, i) => [s.item && s.item.id, i]));
      const tally = new Map(); // sentence id → { right, wrong } this round
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
        if (step.kind === 'card') intro();
        else ask(step);
      }

      function advance() {
        index++;
        next();
      }

      function intro() {
        const button = ui.button({ ko: '알겠어요!', en: 'Got it', variant: 'primary', size: 'big', onClick: done });
        host.stage.append(h('div.ex.ex-speech-intro', ui.exTag('말투', 'Speech levels', '✨'), speechCard(), h('div.ex-actions', h('span.key-hint', ui.bi('엔터', 'Enter ↵')), button)));
        button.focus({ preventScroll: true });
        host.mascot.say('말투를 배워요!', 'Three ways to say it!', { duration: 2500 });
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

      function ask(step) {
        const q = question(step.item, step.kind);
        const { item } = q;
        let locked = false;
        const tag = {
          which: ui.exTag('어떤 말투예요?', 'Which level is this?', '🔍'),
          scene: ui.exTag('누구한테 말해요?', 'Who are you talking to?', '🗣️'),
          casual: ui.exTag('반말로 말해요', 'Say it in 반말', level('casual').emoji),
          formal: ui.exTag('합니다체로 말해요', 'Say it in 합니다체', level('formal').emoji),
        }[q.kind];
        const english = h('div.grammar-en', `“${item.en}”`);
        let prompt;
        if (q.kind === 'which') prompt = [h('div.speech-sentence', { lang: 'ko' }, q.text, ui.audioButton(q.text, { size: 'small' })), english];
        else if (q.kind === 'scene') prompt = [h('div.speech-scene', h('span.speech-scene-emoji', { 'aria-hidden': 'true' }, q.scene.emoji), ui.bi(q.scene.ko, q.scene.en)), english];
        else {
          prompt = [
            h('div.speech-from', h('span.speech-from-level', ui.bi('해요체', 'Polite')), h('span.speech-sentence', { lang: 'ko' }, item.polite, ui.audioButton(item.polite, { size: 'small' }))),
            english,
            h('div.speech-arrow', { 'aria-hidden': 'true' }, '↓'),
            h(`div.speech-want.speech-${q.to}`, level(q.to).emoji, ' ', ui.bi(`${level(q.to).ko}로`, `in ${level(q.to).en.toLowerCase()} speech`, 'inline')),
          ];
        }
        const buttons = q.options.map((o, i) =>
          h(
            'button',
            { type: 'button', class: `option ${o.text ? 'option-ko' : 'option-level'}`, lang: o.text ? 'ko' : null, on: { click: () => choose(i) } },
            h('span.option-num', { 'aria-hidden': 'true' }, i + 1),
            h('span.option-text', o.text ? o.text : [h('span.speech-level-emoji', { 'aria-hidden': 'true' }, level(o.to).emoji), ui.bi(level(o.to).ko, level(o.to).en)])
          )
        );
        host.stage.append(
          h(
            'div.ex.ex-speech',
            tag,
            h('div.speech-q-card', prompt),
            h(`div.options.speech-options.speech-options-${q.kind}`, { role: 'group', 'aria-label': 'Answers' }, buttons),
            h('div.speech-card-link', h('button.btn.btn-ghost.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: showSpeechCard } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('말투 카드', 'The three levels')))
          )
        );
        if (q.kind === 'which' && M.store.state.settings.autoPlayAudio) M.speech.speakLater(q.text, 300, { quiet: true });
        const stopKeys = M.keys.push((event) => {
          if (event.repeat || locked) return;
          const n = Number(event.key);
          if (n >= 1 && n <= buttons.length) {
            event.preventDefault();
            choose(n - 1);
          } else if (q.kind === 'which' && M.keys.isReplay(event)) M.speech.speak(q.text);
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
          onAnswer(step, q, picked);
        }
      }

      function onAnswer(step, q, picked) {
        const { item } = q;
        const correct = picked.correct;
        const t = tally.get(item.id) || { right: 0, wrong: 0 };
        t[correct ? 'right' : 'wrong']++;
        tally.set(item.id, t);
        if (lastStep.get(item.id) === index) M.srs.review(item.id, t.wrong ? 'again' : 'good');
        M.progress.recordAnswer(correct);
        round.answers++;
        let earned = 0;
        if (correct) {
          round.correct++;
          round.combo++;
          round.bestCombo = Math.max(round.bestCombo, round.combo);
          earned = points().speech;
          if (round.combo % points().comboEvery === 0) earned += points().comboBonus;
          M.progress.bump('speechCorrect');
          M.sfx.play('bubble');
        } else round.combo = 0;
        host.award(earned);
        host.react({ correct }, round.combo);
        host.setProgress(round.answers, total);
        M.store.save();

        const right = q.options.find((o) => o.correct);
        const say = right.text || q.text; // the sentence to hear
        const tip = (text) => (text ? h('div.fb-row.fb-tip', h('span.fb-tip-icon', { 'aria-hidden': 'true' }, '💡'), h('span', rich(text))) : null);
        const lv = level(q.to);
        const answer = right.text
          ? [h('span.fb-ko', { lang: 'ko' }, right.text), ui.audioButton(right.text, { size: 'small' }), ui.sayButton ? ui.sayButton(right.text) : null]
          : [h('span.fb-ko', ui.bi(lv.ko, lv.en, 'inline'))];
        const given = picked.text ? h('span.fb-ko', { lang: 'ko' }, picked.text) : h('span.fb-ko', ui.bi(level(picked.to).ko, level(picked.to).en, 'inline'));
        const because = {
          which: `${lv.ko} (${lv.ending}): ${lv.when}`,
          scene: q.scene ? `${q.scene.emoji} ${q.scene.en}: ${lv.ko}. ${lv.when}` : '',
          casual: item.note,
          formal: item.note,
        }[q.kind];
        const content = [
          h('div.fb-row.fb-answer', h('span.fb-label', ui.bi('정답', 'Answer')), ...answer.filter(Boolean)),
          h('div.fb-en-line', `“${item.en}”`),
          correct ? null : h('div.fb-row.fb-given', h('span.fb-label', ui.bi('내 답', 'You')), given),
          correct ? null : tip(picked.why),
          tip(because),
          formsTable(item, q.to),
          h(
            'div.grammar-fb-card',
            h('button.btn.btn-soft.btn-small', { type: 'button', on: { ...M.keys.noMouseFocus, click: showSpeechCard } }, h('span.btn-icon', { 'aria-hidden': 'true' }, '📖'), ui.bi('말투 카드', 'The three levels'))
          ),
        ];
        host.showFeedback({ tone: correct ? 'good' : 'bad', points: earned, content: content.filter(Boolean), speak: say, onContinue: advance });
      }

      function finish() {
        host.finish({
          gameId: 'speech-levels',
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

  M.speechLevels = { pickRound, planRound, question, kindFor, nextLocked, isUnlocked };
})(window.Mallang);
