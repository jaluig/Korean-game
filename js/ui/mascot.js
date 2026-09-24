/**
 * 말랑이 (Mallang-i) — a squishy rice-cake bunny with a sprout on its head,
 * who tends your word garden. Drawn as inline SVG; moods swap the face.
 */
(function (M) {
  'use strict';

  const U = M.utils;
  const { h } = U;

  const INK = '#5a4545';

  // Elements tagged data-show="…" are only visible in those moods (see mascot CSS).
  const SVG = `
<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <g class="m-ears">
    <g class="m-ear-left">
      <ellipse cx="41" cy="30" rx="10.5" ry="22" transform="rotate(-14 41 30)" fill="#fffdf9" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="41.5" cy="32" rx="4.8" ry="14" transform="rotate(-14 41.5 32)" fill="#ffc2d1"/>
    </g>
    <g class="m-ear-right">
      <ellipse cx="79" cy="30" rx="10.5" ry="22" transform="rotate(14 79 30)" fill="#fffdf9" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="78.5" cy="32" rx="4.8" ry="14" transform="rotate(14 78.5 32)" fill="#ffc2d1"/>
    </g>
  </g>
  <g class="m-sprout">
    <path d="M60 46 Q59 39 60 33" stroke="#5fae6e" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M60 36 Q52 28 45 32 Q52 39 60 36 Z" fill="#8fd89c" stroke="#5fae6e" stroke-width="1.5"/>
    <path d="M60 34 Q68 25 76 29 Q69 37 60 34 Z" fill="#8fd89c" stroke="#5fae6e" stroke-width="1.5"/>
  </g>
  <path class="m-body" d="M13 87 C13 60 33 44 60 44 C87 44 107 60 107 87 C107 102 93 109 60 109 C27 109 13 102 13 87 Z"
        fill="#fffdf9" stroke="${INK}" stroke-width="3"/>
  <ellipse class="m-shine" cx="36" cy="62" rx="7" ry="4" transform="rotate(-25 36 62)" fill="#ffffff" opacity=".9"/>
  <g class="m-cheeks">
    <ellipse cx="35" cy="86" rx="7.5" ry="4.5" fill="#ffb3c6"/>
    <ellipse cx="85" cy="86" rx="7.5" ry="4.5" fill="#ffb3c6"/>
  </g>
  <g fill="${INK}" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
    <!-- eyes -->
    <g data-show="idle talk">
      <circle cx="46" cy="77" r="4.6" stroke="none"/><circle cx="74" cy="77" r="4.6" stroke="none"/>
      <circle cx="47.6" cy="75.3" r="1.6" fill="#fff" stroke="none"/><circle cx="75.6" cy="75.3" r="1.6" fill="#fff" stroke="none"/>
    </g>
    <g data-show="happy" fill="none" stroke-width="3">
      <path d="M40.5 78 Q46 71 51.5 78"/><path d="M68.5 78 Q74 71 79.5 78"/>
    </g>
    <g data-show="oops">
      <path d="M40 70 L50 72.5" fill="none" stroke-width="2.6"/><path d="M80 70 L70 72.5" fill="none" stroke-width="2.6"/>
      <circle cx="46" cy="79" r="4" stroke="none"/><circle cx="74" cy="79" r="4" stroke="none"/>
    </g>
    <g data-show="think">
      <circle cx="47.5" cy="74.5" r="4.4" stroke="none"/><circle cx="75.5" cy="74.5" r="4.4" stroke="none"/>
      <circle cx="48.8" cy="73" r="1.4" fill="#fff" stroke="none"/><circle cx="76.8" cy="73" r="1.4" fill="#fff" stroke="none"/>
    </g>
    <g data-show="sleepy" fill="none" stroke-width="3">
      <path d="M40.5 77 Q46 81 51.5 77"/><path d="M68.5 77 Q74 81 79.5 77"/>
    </g>
    <!-- mouths -->
    <path data-show="idle sleepy" d="M53.5 85 Q56.8 89 60 85 Q63.2 89 66.5 85" fill="none" stroke-width="2.6"/>
    <path data-show="happy talk" d="M53 84 Q60 96 67 84 Z" fill="#e8738f" stroke-width="2.4"/>
    <path data-show="oops" d="M53 89 Q56.5 85.5 60 89 Q63.5 92.5 67 89" fill="none" stroke-width="2.6"/>
    <path data-show="think" d="M56 88 Q61 86 65 87.5" fill="none" stroke-width="2.6"/>
  </g>
  <g data-show="happy" class="m-sparkles" fill="#ffd66b" stroke="none">
    <path d="M14 46 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5z"/>
    <path d="M104 40 l2 4.5 4.5 2 -4.5 2 -2 4.5 -2 -4.5 -4.5 -2 4.5 -2z"/>
  </g>
  <g data-show="oops" class="m-drop"><path d="M99 60 Q104 68 99 71 Q94 68 99 60 Z" fill="#9fd3ff" stroke="${INK}" stroke-width="1.5"/></g>
  <g data-show="sleepy" class="m-zzz" fill="${INK}" font-family="Jua, Nunito, sans-serif" font-size="12">
    <text x="92" y="50">z</text><text x="100" y="40" font-size="15">Z</text>
  </g>
  <g data-show="think" class="m-dots" fill="${INK}">
    <circle cx="94" cy="56" r="2.4"/><circle cx="101" cy="48" r="3"/><circle cx="109" cy="38" r="3.8"/>
  </g>
  <!-- outfits: only the one named in data-outfit (on .mascot or .brand-mascot) is shown -->
  <g class="m-outfit m-outfit-scarf" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M19 97 Q60 110 101 97 L102.5 104.5 Q60 118 17.5 104.5 Z" fill="#8fc7ff"/>
    <path d="M76 104 L73 119 L83 119 L84 103 Z" fill="#8fc7ff"/>
    <path d="M35 101.5 L37 108 M50 104 L51 111 M68 104 L67 111 M86 101 L84 108" stroke="#ffffff" fill="none" stroke-linecap="round"/>
  </g>
  <g class="m-outfit m-outfit-glasses" stroke="${INK}" stroke-width="2.4" fill="none">
    <circle cx="46" cy="77" r="9.5" fill="rgba(255,255,255,0.3)"/><circle cx="74" cy="77" r="9.5" fill="rgba(255,255,255,0.3)"/>
    <path d="M55.5 76 Q60 72.5 64.5 76"/><path d="M36.6 75 L27 70.5"/><path d="M83.4 75 L93 70.5"/>
  </g>
  <g class="m-outfit m-outfit-bow" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M86 45 L74 36.5 Q71.5 45 74 53.5 Z" fill="#ff8fb0"/><path d="M86 45 L98 36.5 Q100.5 45 98 53.5 Z" fill="#ff8fb0"/>
    <circle cx="86" cy="45" r="4.4" fill="#ff5c8a"/>
  </g>
  <g class="m-outfit m-outfit-flower" stroke="${INK}" stroke-width="1.8">
    <circle cx="34" cy="41" r="4.6" fill="#fff3a8"/><circle cx="40.7" cy="45.8" r="4.6" fill="#fff3a8"/><circle cx="38.1" cy="53.7" r="4.6" fill="#fff3a8"/>
    <circle cx="29.9" cy="53.7" r="4.6" fill="#fff3a8"/><circle cx="27.3" cy="45.8" r="4.6" fill="#fff3a8"/><circle cx="34" cy="48" r="3.8" fill="#ffb347"/>
  </g>
  <g class="m-outfit m-outfit-beret" stroke="${INK}" stroke-width="2.4">
    <ellipse cx="45" cy="48" rx="17" ry="7" transform="rotate(-16 45 48)" fill="#b89cf0"/><circle cx="43" cy="40.6" r="2.6" fill="#b89cf0"/>
  </g>
  <g class="m-outfit m-outfit-crown" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">
    <path d="M49 50 L50 41.5 L55 46.5 L60 40.5 L65 46.5 L70 41.5 L71 50 Z" fill="#ffd66b"/>
    <circle cx="60" cy="46.8" r="2" fill="#ff7aa2" stroke="none"/><circle cx="53.6" cy="47.8" r="1.5" fill="#8fd89c" stroke="none"/><circle cx="66.4" cy="47.8" r="1.5" fill="#8fc7ff" stroke="none"/>
  </g>
</svg>`;

  /** Outfits unlock as you level up (level 1 = none). Choose one in the wardrobe (Stats). */
  const OUTFITS = [
    { id: '', level: 1, emoji: '🐰', ko: '기본', en: 'Just me' },
    { id: 'bow', level: 2, emoji: '🎀', ko: '리본', en: 'Ribbon' },
    { id: 'glasses', level: 3, emoji: '👓', ko: '안경', en: 'Glasses' },
    { id: 'flower', level: 5, emoji: '🌼', ko: '꽃', en: 'Flower' },
    { id: 'scarf', level: 7, emoji: '🧣', ko: '목도리', en: 'Scarf' },
    { id: 'beret', level: 9, emoji: '🎨', ko: '베레모', en: 'Beret' },
    { id: 'crown', level: 12, emoji: '👑', ko: '왕관', en: 'Crown' },
  ];
  const outfit = () => M.store.state.profile.outfit || '';

  /** Short Korean phrases (with English) the mascot says. */
  const PHRASES = {
    correct: [
      ['잘했어요!', 'Well done!'],
      ['맞아요!', "That's right!"],
      ['대박!', 'Awesome!'],
      ['최고예요!', "You're the best!"],
      ['완벽해요!', 'Perfect!'],
      ['좋아요!', 'Nice!'],
    ],
    almost: [
      ['거의 다 왔어요!', 'Almost there!'],
      ['아까워요!', 'So close!'],
    ],
    wrong: [
      ['괜찮아요!', "It's okay!"],
      ['다시 해 봐요!', "Let's try again!"],
      ['천천히 해요.', 'Take your time.'],
      ['실수해도 괜찮아요.', "It's okay to make mistakes."],
    ],
    combo: [
      ['물이 올랐어요!', "You're on a roll!"],
      ['멈출 수 없어요!', 'Unstoppable!'],
      ['천재예요!', "You're a genius!"],
    ],
  };

  const phrase = (kind) => {
    const [ko, en] = U.pick(PHRASES[kind] || PHRASES.correct);
    return { ko, en };
  };

  /** A greeting that fits the time of day. */
  function greeting(now = new Date()) {
    const hour = now.getHours();
    if (hour >= 5 && hour < 11) return { ko: '좋은 아침이에요!', en: 'Good morning!' };
    if (hour >= 11 && hour < 17) return { ko: '안녕하세요!', en: 'Hello!' };
    if (hour >= 17 && hour < 23) return { ko: '오늘 하루 어땠어요?', en: 'How was your day?' };
    return { ko: '아직 안 자요?', en: 'Still up?' };
  }

  /**
   * Create a mascot. { size, mood, bubble } → { el, setMood, say, react, squish }.
   * With bubble: true it can show a speech bubble (Korean + English).
   */
  function create({ size = 120, mood = 'idle', bubble = false, idle = true } = {}) {
    const figure = h('div.mascot', { style: { width: `${size}px`, height: `${size}px` }, dataset: { mood, outfit: outfit() } });
    figure.innerHTML = SVG;
    if (idle) figure.classList.add('breathing');
    const bubbleEl = bubble ? h('div.bubble', { hidden: true }) : null;
    const el = h('div.mascot-wrap', bubbleEl, figure);
    let moodTimer = null;
    let bubbleTimer = null;

    const setMood = (next) => {
      figure.dataset.mood = next;
    };

    const animate = (name) => {
      figure.classList.remove('squish', 'wobble', 'hop');
      void figure.offsetWidth;
      figure.classList.add(name);
    };

    /** Show a speech bubble for a while. duration 0 = keep it. */
    const say = (ko, en, { duration = 2600 } = {}) => {
      if (!bubbleEl) return;
      clearTimeout(bubbleTimer);
      U.clear(bubbleEl).append(M.ui.bi(ko, en));
      bubbleEl.hidden = false;
      bubbleEl.classList.remove('pop');
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add('pop');
      if (duration) bubbleTimer = setTimeout(() => (bubbleEl.hidden = true), duration);
    };

    /** React to an answer: 'correct' | 'almost' | 'wrong' | 'combo' | 'cheer'. */
    const react = (kind) => {
      clearTimeout(moodTimer);
      const faces = { correct: 'happy', combo: 'happy', cheer: 'happy', almost: 'think', wrong: 'oops' };
      setMood(faces[kind] || 'idle');
      animate(kind === 'wrong' ? 'wobble' : kind === 'almost' ? 'squish' : 'hop');
      if (kind !== 'cheer') {
        const p = phrase(kind === 'combo' ? 'combo' : kind);
        say(p.ko, p.en);
      }
      moodTimer = setTimeout(() => setMood(mood), 2200);
    };

    figure.addEventListener('click', () => {
      animate('squish');
      M.sfx.play('pop');
    });

    return { el, figure, setMood, say, react, squish: () => animate('squish') };
  }

  M.mascot = { create, phrase, greeting, svg: () => SVG, OUTFITS, outfit };
})(window.Mallang);
