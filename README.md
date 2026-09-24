# 말랑 한국어 · Mallang Korean

A cute, spaced-repetition Korean learning game that runs in your browser.
Meet 말랑이 (Mallang-i), a squishy rice-cake bunny with a sprout on its head:
every Korean word you learn becomes a plant in your **word garden**, and short
practice rounds keep it growing.

- **3 minigames:** 🎴 Word Cards · 🧩 Sentence Builder · ⚡️ Speed Match
- **2 topics:** ☕ 카페에서 *At the café* (35 words, 17 sentences) and 🌞 나의 하루 *My day* (33 words, 18 sentences), each with short lesson notes
- **Built-in Korean keyboard**, so you never need a Korean input method
- **Pronunciation audio** through your browser's own Korean voice
- **Streaks, points, levels, a daily goal and badges**, saved on your computer
- Korean interface with small English subtitles, which you can turn off once you're ready

<p align="center"><img src="docs/screenshots/home.png" alt="Home screen: the mascot, today's practice, the daily goal and the minigames" width="760"></p>

| Meeting a new word | Typing with the built-in keyboard | Feedback that explains the mistake |
| --- | --- | --- |
| ![A new-word card for 맛있어요 with its pronunciation and an example](docs/screenshots/word-intro.png) | ![Typing 학교 on the on-screen Korean keyboard](docs/screenshots/typing.png) | ![Sentence Builder explaining 에서 vs 에](docs/screenshots/sentence-feedback.png) |

## Quick start

1. Download or clone this folder.
2. Double-click **`index.html`**. That's it: no install and no build step.

Google Chrome or Microsoft Edge give the best experience, because they come with Korean voices.

If your browser won't save progress when the page is opened as a file (some browsers
restrict storage for `file://` pages), start a tiny local server in this folder instead:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npx serve
```

## How it teaches

The game follows a few well-established ideas about learning vocabulary:

| Idea | How the game does it |
| --- | --- |
| **Spaced repetition** | Each word has a review date. Get it right and it waits longer (10 min → 1 day → 3 days → 1 week → 16 days → months). |
| **Missed words come back sooner** | A wrong answer drops the word two stages, makes it due right away and lowers its "ease", so it keeps returning until it sticks. It is also asked again a few cards later in the same round. Words you missed recently are marked 🥀 *tricky*. |
| **Active recall, step by step** | How you're asked depends on how well you know the word: 🌱 recognise it → 🌿 pick or hear the Korean → 🌷 build it from syllable tiles → 🌻 type it from memory. |
| **New + old, mixed** | Each Word Cards round mixes due reviews with a few new words. The number of new words shrinks when many reviews are waiting, and there's a daily cap (15), so reviews never pile up. |
| **Your starting level** | You pick your level at the start (A1 / low A2 / A2). Words below it aren't thrown away: they come up as quick checks, 8 a day. Miss one and it goes back into your learning queue, so the gaps in what you know get found and filled. |
| **Immediate feedback that explains** | After every answer you see the correct answer, what you gave, and why it's wrong: e.g. *"ㄸ is tense: a tight sound with no puff of air"*, *"커피 ends in a vowel, so it takes 를"*, *"Working is something you do there, so the place takes 에서"*. |
| **Sentences only with words you know** | A sentence unlocks once you've learned all of its words. |

### The minigames

- **🎴 단어 카드 · Word Cards**: the main loop. New words get an introduction card (audio, pronunciation notes like `[감사함니다]`, dictionary form, an example sentence), then they're quizzed a few cards later. Keys: `1`–`4` pick an answer, `Enter` continues, `R` replays audio.
- **🧩 문장 만들기 · Sentence Builder**: tap word tiles in order to build a Korean sentence. The decoy tiles are real traps: wrong particles (`커피을`), 에 vs 에서, 둘 vs 두 before a counter. Well-known sentences switch to listening mode ("build what you hear").
- **⚡️ 번개 짝꿍 · Speed Match**: match Korean words to their meanings against a 60-second clock. Tricky and due words appear first; a mismatch sends that word back to Word Cards for a proper review. It unlocks after you've learned 6 words.

## Typing Korean

Typing exercises use the on-screen **2-set (두벌식)** keyboard, the standard Korean layout.
You can click the keys, or use your **own keyboard as it is**: the game reads the key
*positions*, so no Korean input method is needed. **R** is ㄱ, **K** is ㅏ, **Shift + R** is ㄲ, and so on. The letters
combine into syllables automatically (ㄱ + ㅏ + ㄴ → 간), and Backspace removes one letter at a time.
The small Latin letters on the keys can be hidden in Settings.

## Audio

Pronunciation uses the browser's built-in speech synthesis (`speechSynthesis`) with a Korean voice,
picking the most natural one it can find. You can choose a voice and the speed in **Settings**.

If no Korean voice is installed, the game keeps working without sound: 🔊 buttons turn grey,
and the game explains how to add a voice:

- **Easiest:** use Chrome or Edge, which include online Korean voices.
- **Windows:** Settings → Time & language → Speech → Manage voices → Add voices → Korean, then restart the browser.
- **macOS:** System Settings → Accessibility → Spoken Content → System voice → Manage Voices… → Korean (e.g. Yuna).

## Your progress

Everything (garden, streak, points, badges, settings) is saved automatically in your browser's
`localStorage`. In **Settings → Your data** you can download a backup file, restore it (for example
on another computer), or reset everything.

## Adding content

Each topic is one file in `content/`. To add a topic:

1. Copy `content/cafe.js` to e.g. `content/weather.js` and change the `id`, title and words.
2. Add `<script src="content/weather.js"></script>` next to the other topics in `index.html`.
3. Run the tests (below): they catch most authoring mistakes.

```js
Mallang.content.registerTopic({
  id: 'weather',                       // ids are namespaced automatically: 'weather:rain'
  order: 3,
  emoji: '☔', color: 'sky',           // colours: pink, mint, butter, sky, lilac
  title: { ko: '날씨', en: 'Weather' },
  description: { ko: '날씨 이야기', en: 'Talk about the weather' },
  notes: [
    { title: { ko: '-네요', en: 'Noticing something' },
      text: 'Add **-네요** when you notice something: 춥네요! (It’s cold!)',
      examples: [{ ko: '비가 오네요.', en: 'Oh, it’s raining.' }] },
  ],
  words: [
    { id: 'rain', ko: '비', en: 'rain', level: 1, pos: 'noun', emoji: '🌧️', rom: 'bi',
      example: { ko: '비가 와요.', en: 'It’s raining.' } },
    { id: 'cold', ko: '추워요', en: "it's cold", level: 1, pos: 'adjective', emoji: '🥶', rom: 'chuwoyo',
      dict: '춥다', note: 'ㅂ-irregular: 춥 + 어요 → 추워요.',
      example: { ko: '오늘 추워요.', en: 'It’s cold today.' } },
  ],
  sentences: [
    { id: 's-rain', en: 'It is raining today.', ko: '오늘 비가 와요.',
      tiles: ['오늘', '비가', '와요'], gloss: ['today', 'rain (subject)', 'comes'],
      words: ['rain', 'day:today', 'day:come'],   // other topics' words: 'topic:id'
      traps: [{ tile: '비를', why: 'Rain is the subject here, so it takes 가: 비가 와요.' }] },
  ],
});
```

**Word fields:** `id`, `ko`, `en` and `level` (1 = A1, 2 = low A2, 3 = A2) are required. Optional:
`pos`, `emoji`, `rom` (romanization), `pron` (pronunciation in Hangul when it differs from the spelling),
`dict` (dictionary form of a verb), `note`, `example`, `accept` (other answers to accept when typing),
`avoid` (ids of words so close in meaning that they must never be offered as this word's wrong answers,
e.g. 차 "tea" and 녹차 "green tea").

**Sentence fields:** `en`, `ko`, `tiles` (the answer, in order), `words` (the words it uses; it unlocks
once they're learned). Optional: `gloss` (English for each tile), `traps` (tempting wrong tiles with an
explanation), `alts` (other correct word orders). Particle traps like `커피을` for `커피를` are generated
automatically.

## Adding a minigame

A minigame is one file in `js/games/` that registers itself; add its `<script>` tag in `index.html`
and it appears on the home screen.

```js
Mallang.games.register({
  id: 'my-game',
  order: 4,
  emoji: '🎯', color: 'sky',
  title: { ko: '내 게임', en: 'My Game' },
  blurb: { ko: '설명', en: 'What it does' },
  status(topicId) {           // shown on the home card
    return { ready: true, ko: '도전!', en: 'Try it' };
  },
  start(host) {
    // host.stage             element to draw into
    // host.topicId           the chosen topic ('all' or a topic id)
    // host.setProgress(d, t) progress bar
    // host.award(points)     add points (updates goal, streak, level)
    // host.react(result)     sound + mascot reaction to { correct, almost }
    // host.showFeedback({ tone, points, content, onContinue })
    // host.empty({ emoji, ko, en, text })   friendly "nothing to do / locked" card
    // host.onCleanup(fn)     called when the player leaves
    // host.finish(result)    end of round → summary screen
  },
});
```

Games can reuse the exercise types in `js/exercises/` (`intro`, `choice`, `tiles`, `typing`,
`sentence`) and the spaced-repetition helpers in `js/core/srs.js`. `js/games/word-cards.js` is a
good example to copy.

## Project structure

```
index.html            loads everything (plain <script> tags, so it runs from file://)
css/                  base (tokens, layout), components, screens, games
content/              one file per topic: words, sentences, lesson notes
js/core/              no UI: config, Hangul engine, storage, spaced repetition,
                      progress & badges, distractor picking, speech, sound effects
js/ui/                components, mascot, Korean keyboard, feedback sheet
js/exercises/         intro · choice · tiles · typing · sentence
js/games/             word-cards · sentence-builder · speed-match
js/screens/           onboarding · home · garden · stats · settings · play · summary
js/app.js             start-up and routing (#/home, #/play/word-cards…)
tests/                unit tests for the core and the content (Node's built-in runner)
```

All tunable numbers (review intervals, round sizes, points, daily goals) are in `js/core/config.js`.

## Tests

The core logic and the content have unit tests that use Node's built-in test runner (Node 18+), with no packages to install:

```bash
npm test          # or: node --test tests/*.test.js
```

They cover the Hangul typing engine, spaced-repetition scheduling and round building, streaks and
levels, saving/loading, and they check every topic for authoring mistakes.

## Why plain JavaScript?

The game should open straight from a file with no setup. Modern JavaScript *modules*
are blocked on `file://` pages in Chrome and Firefox, so the game uses classic `<script>` tags that
each add a piece to one global `Mallang` object. It's still organised into small modules with
registries for content, exercises and games, so it can grow without a framework or a build step.
The only external resource is an optional web font (Jua + Nunito from Google Fonts). Offline, your
system fonts are used and everything still works.

## Ideas for next steps

- More topics: numbers & time, past tense (어제 뭐 했어요?), shopping, directions, feelings
- A Hangul reading warm-up for tricky letter pairs (ㅓ/ㅗ, ㄱ/ㅋ/ㄲ)
- Listening dictation of whole sentences, and speaking practice with the browser's speech recognition
- A dark theme and more badges
