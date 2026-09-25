/**
 * Grammar patterns, practised in Grammar Cards (js/games/grammar-cards.js):
 * the endings that join two ideas (-고, -지만, -아서/어서, -(으)면…) and the
 * helper endings for "can", "must" and "may".
 *
 * Each pattern has an intro card (meaning, how to make it, a note, examples;
 * the table of forms is built by the grammar engine) and questions: a sentence
 * with one word blanked out, to be filled with the right form.
 *
 * A question only names the word and its ending — the grammar engine
 * (js/core/grammar.js) makes the form, checks `answer` against it, and builds
 * the wrong options with their explanations:
 *   contrast: other endings that give the sentence a different meaning (the
 *             English shows which one is meant). Never list one that could
 *             also be right here: -(으)면/-(으)ㄹ 때, -아서/-(으)니까,
 *             -아서/-고, -(으)ㄴ 후에/-고/-아서, -(으)ㄹ 수 있어요/-아도 돼요.
 *   traps:    hand-written wrong options, each with its reason.
 *   meaning:  what the ending means in this sentence, if it's not the usual one.
 * Fields: id, ko, en, answer (the form as it appears in ko), dict, pos
 * ('verb' | 'adjective'), tense ('past' for -고, -지만, -(으)니까, -(으)ㄹ 때),
 * form (another ending of this pattern), words (vocabulary refs, 'topic:id':
 * questions whose words you know come first).
 */
Mallang.content.registerGrammar([
  {
    id: 'go',
    order: 1,
    level: 1,
    emoji: '➕',
    form: 'go',
    title: { ko: '-고', en: 'and' },
    meaning: 'Joins two actions or two facts: “and”. With actions, it also means “and then”.',
    how: 'Put **고** straight onto the stem (the dictionary form without 다): 먹다 → **먹고**, 가다 → **가고**, 춥다 → **춥고**. No 아/어, no 으, and irregular words don’t change.',
    note: 'Usually only the last verb shows the tense: 어제 점심을 **먹고** 산책했어요 = Yesterday I had lunch and then took a walk. To say how you travel, Korean uses -고 too: 버스를 **타고** 가요 = I go by bus.',
    examples: [
      { ko: '이 카페는 싸고 맛있어요.', en: 'This café is cheap and tasty.' },
      { ko: '저녁에 운동하고 샤워해요.', en: 'In the evening I work out and then shower.' },
      { ko: '어제 친구하고 영화를 보고 밥을 먹었어요.', en: 'Yesterday I watched a movie with a friend and then had a meal.' },
    ],
    questions: [
      {
        id: 'shower',
        ko: '아침에 샤워하고 커피를 마셔요.',
        en: 'In the morning I shower and then drink coffee.',
        answer: '샤워하고',
        dict: '샤워하다',
        words: ['day:morning', 'day:shower', 'cafe:coffee', 'day:drink'],
        contrast: ['jiman', 'myeon'],
      },
      {
        id: 'cheap',
        ko: '이 가게는 싸고 좋아요.',
        en: 'This shop is cheap and good.',
        answer: '싸고',
        dict: '싸다',
        pos: 'adjective',
        words: ['shopping:shop', 'shopping:cheap', 'feelings:good'],
        contrast: ['jiman', 'myeon'],
        traps: [{ text: '싸서', why: '싸서 is -아서/어서: “it’s cheap, so it’s good”. The sentence just adds two facts: cheap and good → 싸고.' }],
      },
      {
        id: 'exercise',
        ko: '저녁에 운동하고 샤워해요.',
        en: 'In the evening I work out and then shower.',
        answer: '운동하고',
        dict: '운동하다',
        words: ['day:evening', 'day:exercise', 'day:shower'],
        contrast: ['jiman', 'myeon'],
      },
      {
        id: 'clear',
        ko: '오늘은 날씨가 맑고 따뜻해요.',
        en: 'Today the weather is clear and warm.',
        answer: '맑고',
        dict: '맑다',
        pos: 'adjective',
        words: ['day:today', 'weather:weather', 'weather:clear', 'weather:warm'],
        contrast: ['jiman', 'myeon'],
      },
      {
        id: 'lunch',
        ko: '점심을 먹고 산책해요.',
        en: 'I have lunch and then take a walk.',
        answer: '먹고',
        dict: '먹다',
        words: ['day:lunch', 'day:eat', 'hobbies:stroll'],
        contrast: ['jiman', 'myeon'],
      },
      {
        id: 'cold',
        ko: '어제는 춥고 흐렸어요.',
        en: 'Yesterday it was cold and cloudy.',
        answer: '춥고',
        dict: '춥다',
        pos: 'adjective',
        words: ['day:yesterday', 'weather:cold', 'weather:cloudy'],
        contrast: ['jiman', 'myeon'],
      },
      {
        id: 'bus',
        ko: '저는 버스를 타고 학교에 가요.',
        en: 'I go to school by bus.',
        answer: '타고',
        dict: '타다',
        words: ['directions:bus', 'directions:ride', 'day:school', 'day:go'],
        contrast: ['jiman', 'myeon'],
        traps: [{ text: '타서', why: 'To say how you travel, Korean uses -고: 버스를 타고 가요 = I go by bus. -아서/어서 gives a reason or the next step, not the way you go.' }],
      },
      {
        id: 'music',
        ko: '주말에 음악을 듣고 책을 읽었어요.',
        en: 'On the weekend I listened to music and read a book.',
        answer: '듣고',
        dict: '듣다',
        words: ['day:weekend', 'hobbies:music', 'hobbies:listen', 'day:book', 'day:read'],
        contrast: ['jiman', 'myeon'],
      },
    ],
  },
]);
