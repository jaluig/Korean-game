/**
 * Stories, heard in the Stories game (js/games/stories.js): a short story or a
 * podcast-style talk in two to four parts, read by one narrator, with questions
 * after each part. It's longer listening than the dialogues: the learner hears a
 * part (its script can be shown for fewer points), answers its questions, then
 * hears the next part; at the end comes the whole story with translations.
 *
 * Numbers in the lines are written in Hangul (세 시, 만 오천 원): the narrator
 * reads them. Digits are fine in the options (7시, 3,000원).
 *
 * Fields: id, topic (a topic id), level (1–3), emoji, kind { ko, en } (이야기,
 *         팟캐스트, 라디오…), title { ko, en }, voice ('high' = a woman's voice,
 *         'low' = a man's), words (2–4 vocabulary refs, 'topic:id': the story
 *         opens once they're learned),
 *         parts [{ lines [{ ko, en, say }], questions [{ q { ko, en }, options
 *                  (3 × { ko, en }), answer (index of the right option; the game
 *                  shuffles them), line (0-based index of the line of this part
 *                  with the answer, or a list), why (shown after answering) }] }].
 */
Mallang.content.registerStories([
  {
    id: 'day-late',
    topic: 'day',
    level: 1,
    emoji: '⏰',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '늦었어요!', en: 'I’m late!' },
    voice: 'low',
    words: ['day:morning', 'day:friend', 'day:eat'],
    parts: [
      {
        lines: [
          { ko: '저는 매일 여덟 시에 일어나요.', en: 'I get up at eight every day.' },
          { ko: '그런데 어제는 아홉 시에 일어났어요!', en: 'But yesterday I woke up at nine!' },
          { ko: '월요일에는 아홉 시 반에 한국어 수업이 있어요.', en: 'On Mondays I have a Korean class at half past nine.' },
          { ko: '저는 아침도 안 먹고 빨리 학교에 갔어요.', en: 'I rushed off to school without even having breakfast.' },
        ],
        questions: [
          { q: { ko: '이 사람은 어제 몇 시에 일어났어요?', en: 'What time did he get up yesterday?' },
            options: [{ ko: '9시', en: '9:00' }, { ko: '8시', en: '8:00' }, { ko: '9시 30분', en: '9:30' }],
            answer: 0, line: 1,
            why: 'He says 어제는 아홉 시에 일어났어요: yesterday he got up at nine (아홉 시). He usually gets up at eight (여덟 시), and 아홉 시 반 (9:30) is when his class starts.' },
        ],
      },
      {
        lines: [
          { ko: '그런데 학교에 학생이 한 명도 없었어요.', en: 'But there wasn’t a single student at school.' },
          { ko: '교실에 선생님도 없었어요.', en: 'There was no teacher in the classroom, either.' },
          { ko: '저는 친구 예나한테 전화했어요.', en: 'I phoned my friend Yena.' },
          { ko: '예나가 “오늘은 일요일이야!”라고 했어요.', en: 'Yena said, “It’s Sunday today!”' },
        ],
        questions: [
          { q: { ko: '어제는 무슨 요일이었어요?', en: 'What day of the week was it yesterday?' },
            options: [{ ko: '일요일', en: 'Sunday' }, { ko: '월요일', en: 'Monday' }, { ko: '토요일', en: 'Saturday' }],
            answer: 0, line: 3,
            why: 'Yena says 오늘은 일요일이야 (casual for 일요일이에요, the way close friends talk): it was Sunday (일요일), so there was no class. He thought it was Monday (월요일), the day of his Korean class.' },
        ],
      },
      {
        lines: [
          { ko: '예나 집은 학교 바로 앞이에요.', en: 'Yena lives right in front of the school.' },
          { ko: '그래서 우리는 카페에서 같이 아침을 먹었어요.', en: 'So we had breakfast together at a café.' },
          { ko: '저는 샌드위치를 먹고, 예나는 빵을 먹었어요.', en: 'I had a sandwich, and Yena had some bread.' },
          { ko: '그리고 저는 집에 와서 또 잤어요!', en: 'And then I went home and went back to sleep!' },
        ],
        questions: [
          { q: { ko: '이 사람은 카페에서 뭘 먹었어요?', en: 'What did he eat at the café?' },
            options: [{ ko: '샌드위치', en: 'a sandwich' }, { ko: '빵', en: 'some bread' }, { ko: '케이크', en: 'some cake' }],
            answer: 0, line: 2,
            why: '저는 샌드위치를 먹고, 예나는 빵을 먹었어요: he had a sandwich (샌드위치), and the bread (빵) was Yena’s.' },
        ],
      },
    ],
  },
  {
    id: 'people-hyung-oppa',
    topic: 'people',
    level: 2,
    emoji: '📻',
    kind: { ko: '라디오', en: 'A radio show' },
    title: { ko: '형이에요, 오빠예요?', en: 'Hyung or oppa?' },
    voice: 'high',
    words: ['people:hyung', 'people:oppa', 'people:nuna', 'people:unni'],
    parts: [
      {
        lines: [
          { ko: '안녕하세요, 여러분! 말랑 라디오의 나래예요.', en: 'Hello, everyone! This is Narae on Mallang Radio.' },
          { ko: '오늘은 미국 사람 엠마 씨가 메시지를 보내 주셨어요.', en: 'Today we have a message from Emma, who’s American.' },
          { ko: '엠마 씨는 지난 주말에 친구 준서 씨 집에 갔어요.', en: 'Last weekend Emma went to her friend Junseo’s house.' },
          { ko: '준서 씨는 부모님, 형하고 같이 살아요.', en: 'Junseo lives with his parents and his older brother.' },
          { ko: '그날 엠마 씨는 준서 씨 가족하고 저녁을 먹었어요.', en: 'That day Emma had dinner with Junseo’s family.' },
        ],
        questions: [
          { q: { ko: '준서 씨는 누구하고 같이 살아요?', en: 'Who does Junseo live with?' },
            options: [
              { ko: '부모님하고 형', en: 'his parents and his older brother' },
              { ko: '부모님하고 누나', en: 'his parents and his older sister' },
              { ko: '형하고 동생', en: 'his older brother and a younger sibling' },
            ],
            answer: 0, line: 3,
            why: '준서 씨는 부모님, 형하고 같이 살아요: Junseo lives with his parents (부모님) and his older brother (형).' },
        ],
      },
      {
        lines: [
          { ko: '준서 씨가 “형, 김치 좀 줘!”라고 했어요.', en: 'Junseo said, “Hyung, pass me the kimchi!”' },
          { ko: '그래서 엠마 씨도 “형, 물 좀 주세요!”라고 했어요.', en: 'So Emma, too, said, “Hyung, could you pass me the water?”' },
          { ko: '그런데 가족들이 모두 웃었어요.', en: 'But the whole family laughed.' },
          { ko: '엠마 씨는 “왜 웃어요?”라고 물어봤어요.', en: 'Emma asked, “Why are you laughing?”' },
          { ko: '여러분도 한번 생각해 보세요!', en: 'Have a think about it too, everyone!' },
        ],
        questions: [
          { q: { ko: '엠마 씨는 준서 씨 형을 뭐라고 불렀어요?', en: 'What did Emma call Junseo’s older brother?' },
            options: [{ ko: '형', en: '“hyung”' }, { ko: '오빠', en: '“oppa”' }, { ko: '누나', en: '“nuna”' }],
            answer: 0, line: [0, 1],
            why: 'Junseo says 형, 김치 좀 줘, so Emma copies him: 형, 물 좀 주세요. She calls the older brother 형.' },
        ],
      },
      {
        lines: [
          { ko: '엠마 씨, “형”은 남자만 써요.', en: 'Emma, only men use “hyung.”' },
          { ko: '여자는 “오빠”라고 해요.', en: 'Women say “oppa.”' },
          { ko: '“누나”도 남자만 쓰고, 여자는 “언니”라고 해요.', en: '“Nuna” is also only for men; women say “unni.”' },
          { ko: '그러니까 다음에는 “오빠”라고 불러 보세요!', en: 'So next time, try calling him “oppa”!' },
          { ko: '그럼 노래 한 곡 듣고 올게요!', en: 'Now let’s listen to a song, and I’ll be right back!' },
        ],
        questions: [
          { q: { ko: '엠마 씨는 준서 씨 형을 뭐라고 불러야 해요?', en: 'What should Emma call Junseo’s older brother?' },
            options: [{ ko: '오빠', en: '“oppa”' }, { ko: '형', en: '“hyung”' }, { ko: '언니', en: '“unni”' }],
            answer: 0, line: [0, 1, 3],
            why: '“형”은 남자만 써요, and 여자는 “오빠”라고 해요: men say 형, women say 오빠. So Narae tells Emma 다음에는 “오빠”라고 불러 보세요: next time, call him 오빠 (부르다 = call).' },
          { q: { ko: '“누나”는 누가 써요?', en: 'Who uses the word “nuna”?' },
            options: [{ ko: '남자만', en: 'only men' }, { ko: '여자만', en: 'only women' }, { ko: '남자하고 여자', en: 'both men and women' }],
            answer: 0, line: 2,
            why: '“누나”도 남자만 쓰고: just like 형, only men use the word 누나 (쓰다 = use; 남자만 = only men). Women say 언니.' },
        ],
      },
    ],
  },
  {
    id: 'shopping-socks',
    topic: 'shopping',
    level: 2,
    emoji: '🧦',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '양말 사러 갔어요', en: 'I went to buy socks' },
    voice: 'low',
    words: ['shopping:socks', 'shopping:trousers', 'shopping:hat', 'shopping:market'],
    parts: [
      {
        lines: [
          { ko: '지난 토요일에 저는 양말을 사러 시장에 갔어요.', en: 'Last Saturday I went to the market to buy socks.' },
          { ko: '시장 앞에 작은 옷 가게가 있었어요.', en: 'There was a small clothes shop in front of the market.' },
          { ko: '거기에서 예쁜 흰색 티셔츠를 봤어요.', en: 'There I saw a pretty white T-shirt.' },
          { ko: '티셔츠는 칠천 원이었어요.', en: 'The T-shirt was 7,000 won.' },
          { ko: '정말 싸서 바로 샀어요!', en: 'It was so cheap that I bought it right away!' },
        ],
        questions: [
          { q: { ko: '이 사람은 왜 시장에 갔어요?', en: 'Why did he go to the market?' },
            options: [{ ko: '양말을 사러', en: 'to buy socks' }, { ko: '티셔츠를 사러', en: 'to buy a T-shirt' }, { ko: '모자를 사러', en: 'to buy a hat' }],
            answer: 0, line: 0,
            why: '저는 양말을 사러 시장에 갔어요: he went to the market to buy socks (-(으)러 = in order to). The T-shirt wasn’t part of the plan.' },
        ],
      },
      {
        lines: [
          { ko: '옆 가게에서는 바지를 세일하고 있었어요.', en: 'The shop next door was having a sale on trousers.' },
          { ko: '바지는 구천 원이었어요.', en: 'The trousers were 9,000 won.' },
          { ko: '저는 바지를 입어 보고 그것도 샀어요.', en: 'I tried the trousers on and bought them, too.' },
          { ko: '그리고 빨간색 모자도 오천 원에 샀어요.', en: 'And I bought a red hat for 5,000 won as well.' },
          { ko: '쇼핑은 정말 재미있었어요!', en: 'Shopping was so much fun!' },
        ],
        questions: [
          { q: { ko: '바지는 얼마였어요?', en: 'How much were the trousers?' },
            options: [{ ko: '9,000원', en: '9,000 won' }, { ko: '7,000원', en: '7,000 won' }, { ko: '5,000원', en: '5,000 won' }],
            answer: 0, line: 1,
            why: '바지는 구천 원이었어요: the trousers were 9,000 won (구천 원). 칠천 원 (7,000 won) was the T-shirt, and 오천 원 (5,000 won) the hat.' },
          { q: { ko: '모자는 무슨 색이에요?', en: 'What colour is the hat?' },
            options: [{ ko: '빨간색', en: 'red' }, { ko: '흰색', en: 'white' }, { ko: '검은색', en: 'black' }],
            answer: 0, line: 3,
            why: '빨간색 모자도 오천 원에 샀어요: the hat is red (빨간색). The white one (흰색) was the T-shirt.' },
        ],
      },
      {
        lines: [
          { ko: '저녁에 집에 와서 가방 안을 봤어요.', en: 'In the evening I got home and looked in my bag.' },
          { ko: '티셔츠, 바지, 빨간색 모자가 있었어요.', en: 'There were the T-shirt, the trousers and the red hat.' },
          { ko: '그런데 양말은 없었어요!', en: 'But there were no socks!' },
          { ko: '저는 양말만 안 샀어요!', en: 'The socks were the only thing I didn’t buy!' },
          { ko: '다음 날, 저는 양말 가게에 제일 먼저 갔어요.', en: 'The next day, I went to the sock shop before anything else.' },
        ],
        questions: [
          { q: { ko: '이 사람은 시장에서 뭘 안 샀어요?', en: 'What didn’t he buy at the market?' },
            options: [{ ko: '양말', en: 'socks' }, { ko: '모자', en: 'a hat' }, { ko: '바지', en: 'trousers' }],
            answer: 0, line: [1, 2, 3],
            why: '저는 양말만 안 샀어요: the socks (양말) were the only thing (만 = only) he didn’t buy. He came home with a T-shirt, trousers and a hat, but 양말은 없었어요.' },
        ],
      },
    ],
  },
  {
    id: 'travel-surprise-trip',
    topic: 'travel',
    level: 3,
    emoji: '🚄',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '깜짝 여행', en: 'A surprise trip' },
    voice: 'high',
    words: ['travel:train', 'travel:ticket', 'travel:book', 'travel:depart'],
    parts: [
      {
        lines: [
          { ko: '제 친구 서윤이는 부산에 살아요.', en: 'My friend Seoyun lives in Busan.' },
          { ko: '우리는 일 년 동안 못 만났어요.', en: 'We hadn’t seen each other for a year.' },
          { ko: '그래서 서윤이한테 말 안 하고 기차표를 예약했어요.', en: 'So I booked a train ticket without telling Seoyun.' },
          { ko: '토요일 아침 아홉 시에 출발하는 기차였어요.', en: 'It was a train leaving at nine on Saturday morning.' },
          { ko: '창가 좌석에 앉아서 계속 웃었어요.', en: 'I sat in a window seat and couldn’t stop smiling.' },
          { ko: '서윤이를 빨리 보고 싶었어요!', en: 'I couldn’t wait to see Seoyun!' },
        ],
        questions: [
          { q: { ko: '이 사람은 서윤이한테 여행 이야기를 했어요?', en: 'Did she tell Seoyun about the trip?' },
            options: [{ ko: '아니요, 안 했어요', en: 'No, she didn’t' }, { ko: '네, 전화로 했어요', en: 'Yes, on the phone' }, { ko: '네, 문자로 했어요', en: 'Yes, by text' }],
            answer: 0, line: 2,
            why: '서윤이한테 말 안 하고 기차표를 예약했어요: she booked the ticket without telling Seoyun (말 안 하고 = without saying anything). It was going to be a surprise.' },
        ],
      },
      {
        lines: [
          { ko: '열두 시쯤 부산역에 도착했어요.', en: 'I got to Busan Station at about twelve.' },
          { ko: '기차에서 내린 후에 바로 서윤이한테 전화했어요.', en: 'As soon as I got off the train, I called Seoyun.' },
          { ko: '“서윤아, 나 지금 부산역이야!”라고 했어요.', en: 'I said, “Seoyun, I’m at Busan Station right now!”' },
          { ko: '그런데 서윤이가 아무 말도 안 했어요.', en: 'But Seoyun didn’t say anything.' },
          { ko: '그리고 조금 후에 크게 웃었어요.', en: 'Then, after a moment, she burst out laughing.' },
          { ko: '서윤이는 “나 지금 서울역이야!”라고 했어요.', en: 'Seoyun said, “I’m at Seoul Station right now!”' },
        ],
        questions: [
          { q: { ko: '서윤이는 그때 어디에 있었어요?', en: 'Where was Seoyun at that moment?' },
            options: [{ ko: '서울역', en: 'at Seoul Station' }, { ko: '부산역', en: 'at Busan Station' }, { ko: '서윤이 집', en: 'at home' }],
            answer: 0, line: 5,
            why: 'Seoyun says 나 지금 서울역이야: she was at Seoul Station (서울역), not in Busan. The narrator was the one at Busan Station (부산역).' },
        ],
      },
      {
        lines: [
          { ko: '서윤이도 저한테 말 안 하고 서울에 왔어요.', en: 'Seoyun had come to Seoul without telling me, too!' },
          { ko: '우리는 똑같은 생각을 했어요!', en: 'We’d had exactly the same idea!' },
          { ko: '대전은 서울하고 부산 사이에 있어요.', en: 'Daejeon is between Seoul and Busan.' },
          { ko: '그래서 우리는 둘 다 대전에 가는 기차를 탔어요.', en: 'So we both caught a train to Daejeon.' },
          { ko: '오후 세 시에 대전역에서 드디어 만났어요.', en: 'At three in the afternoon, we finally met at Daejeon Station.' },
          { ko: '막차 시간까지 이야기를 많이 했어요.', en: 'We talked and talked until it was time for the last train.' },
        ],
        questions: [
          { q: { ko: '두 사람은 어디에서 만났어요?', en: 'Where did the two friends meet in the end?' },
            options: [{ ko: '대전역', en: 'at Daejeon Station' }, { ko: '서울역', en: 'at Seoul Station' }, { ko: '부산역', en: 'at Busan Station' }],
            answer: 0, line: 4,
            why: '오후 세 시에 대전역에서 드디어 만났어요: they finally (드디어) met at Daejeon Station (대전역).' },
          { q: { ko: '왜 대전에서 만났어요?', en: 'Why did they meet in Daejeon?' },
            options: [
              { ko: '서울하고 부산 사이에 있어서', en: 'It’s between Seoul and Busan' },
              { ko: '서윤이가 대전에 살아서', en: 'Seoyun lives in Daejeon' },
              { ko: '대전에 친구가 있어서', en: 'They have a friend in Daejeon' },
            ],
            answer: 0, line: [2, 3],
            why: '대전은 서울하고 부산 사이에 있어요: Daejeon is between (사이) Seoul and Busan, so they both took a train there. Seoyun lives in Busan (부산에 살아요), not Daejeon.' },
        ],
      },
    ],
  },
  {
    id: 'work-presentation',
    topic: 'work',
    level: 3,
    emoji: '🎙️',
    kind: { ko: '팟캐스트', en: 'A podcast' },
    title: { ko: '컴퓨터가 안 돼요!', en: 'The computer isn’t working!' },
    voice: 'low',
    words: ['work:presentation', 'work:boss', 'work:overtime', 'work:memorise'],
    parts: [
      {
        lines: [
          { ko: '안녕하세요, 여러분! 말랑 퇴근길의 주원이에요.', en: 'Hello, everyone! This is Juwon on “Mallang After Work.”' },
          { ko: '오늘도 수고하셨습니다!', en: 'Thank you for all your hard work today!' },
          { ko: '오늘은 제 발표 이야기를 해 볼게요.', en: 'Today I’ll tell you the story of my presentation.' },
          { ko: '저는 지난주 목요일에 회사에서 큰 발표가 있었어요.', en: 'Last Thursday I had a big presentation at work.' },
          { ko: '그래서 일주일 동안 매일 야근을 했어요.', en: 'So for a week I worked late every day.' },
          { ko: '발표 전날 밤에는 너무 떨려서 잠을 못 잤어요.', en: 'The night before, I was so nervous I couldn’t sleep.' },
        ],
        questions: [
          { q: { ko: '주원 씨는 일주일 동안 매일 뭐 했어요?', en: 'What did Juwon do every day for a week?' },
            options: [{ ko: '야근을 했어요', en: 'He worked late' }, { ko: '출장을 갔어요', en: 'He went on business trips' }, { ko: '회식을 했어요', en: 'He went to staff dinners' }],
            answer: 0, line: 4,
            why: '그래서 일주일 동안 매일 야근을 했어요: to get ready for the presentation, he worked late (야근) every day for a week.' },
        ],
      },
      {
        lines: [
          { ko: '드디어 목요일 아침이었어요.', en: 'Finally, it was Thursday morning.' },
          { ko: '회의실에는 사장님하고 동료 스무 명이 있었어요.', en: 'In the meeting room were the boss and twenty colleagues.' },
          { ko: '그런데 컴퓨터가 갑자기 안 됐어요!', en: 'But suddenly the computer stopped working!' },
          { ko: '발표 파일은 다 그 컴퓨터에 있었어요.', en: 'All my presentation files were on that computer.' },
          { ko: '모두 저를 보고 있었어요.', en: 'Everyone was looking at me.' },
          { ko: '저는 아무 말도 못 했어요.', en: 'I couldn’t say a word.' },
        ],
        questions: [
          { q: { ko: '발표 날 아침에 무슨 문제가 있었어요?', en: 'What went wrong on the morning of the presentation?' },
            options: [{ ko: '컴퓨터가 안 됐어요', en: 'The computer didn’t work' }, { ko: '사장님이 늦으셨어요', en: 'The boss was late' }, { ko: '회의실에 사람이 없었어요', en: 'Nobody was in the meeting room' }],
            answer: 0, line: 2,
            why: '컴퓨터가 갑자기 안 됐어요: suddenly the computer stopped working (안 되다 = not work), and his presentation files were on it.' },
          { q: { ko: '회의실에 동료가 몇 명 있었어요?', en: 'How many colleagues were in the meeting room?' },
            options: [{ ko: '20명', en: '20 people' }, { ko: '2명', en: '2 people' }, { ko: '12명', en: '12 people' }],
            answer: 0, line: 1,
            why: '사장님하고 동료 스무 명이 있었어요: there were twenty colleagues (스무 명: 스물 becomes 스무 before a counter), and the boss.' },
        ],
      },
      {
        lines: [
          { ko: '그때 사장님이 “그냥 말로 해 보세요”라고 하셨어요.', en: 'Then the boss said, “Just try talking us through it.”' },
          { ko: '저는 컴퓨터 없이 발표를 시작했어요.', en: 'I started my presentation without the computer.' },
          { ko: '일주일 동안 연습을 많이 해서 다 외웠어요.', en: 'I’d practised a lot all week, so I knew it all by heart.' },
          { ko: '발표가 끝난 후에 모두 박수를 쳤어요.', en: 'When the presentation was over, everyone clapped.' },
          { ko: '그러니까 여러분, 발표하기 전에 꼭 많이 연습하세요!', en: 'So, everyone: before a presentation, make sure you practise a lot!' },
          { ko: '그럼 우리 내일 또 만나요!', en: 'Well then, see you again tomorrow!' },
        ],
        questions: [
          { q: { ko: '주원 씨는 왜 컴퓨터 없이 발표할 수 있었어요?', en: 'Why could Juwon give the presentation without the computer?' },
            options: [{ ko: '다 외워서', en: 'He knew it all by heart' }, { ko: '발표가 짧아서', en: 'The presentation was short' }, { ko: '동료가 도와줘서', en: 'A colleague helped him' }],
            answer: 0, line: 2,
            why: '일주일 동안 연습을 많이 해서 다 외웠어요: he had practised a lot all week, so he knew it all by heart (외웠어요, from 외우다 = memorise).' },
        ],
      },
    ],
  },
  // ---------- cafe · level 1 · a story ----------
  {
    id: 'cafe-new-menu',
    topic: 'cafe',
    level: 1,
    emoji: '🥪',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '아빠의 새 메뉴', en: 'Dad’s new menu item' },
    voice: 'high',
    words: ['cafe:cafe', 'cafe:kimchi', 'cafe:sandwich'],
    parts: [
      {
        lines: [
          { ko: '우리 아빠는 작은 카페를 해요.', en: 'My dad runs a small café.' },
          { ko: '아빠 커피는 정말 맛있어요.', en: 'Dad’s coffee is really good.' },
          { ko: '그런데 지난달에는 카페에 사람이 없었어요.', en: 'But last month, there was nobody in the café.' },
          { ko: '아빠는 좀 슬펐어요.', en: 'Dad was a little sad.' },
        ],
        questions: [
          { q: { ko: '지난달에 아빠 카페는 어땠어요?', en: 'What was Dad’s café like last month?' },
            options: [{ ko: '사람이 없었어요', en: 'There was nobody there' }, { ko: '사람이 많았어요', en: 'It was full of people' }, { ko: '커피가 맛없었어요', en: 'The coffee wasn’t good' }],
            answer: 0, line: 2, why: '그런데 지난달에는 카페에 사람이 없었어요: last month there was nobody (사람이 없었어요) in the café. It wasn’t the coffee: 아빠 커피는 정말 맛있어요.' },
        ],
      },
      {
        lines: [
          { ko: '어느 날 아빠가 새 메뉴를 만들었어요.', en: 'One day, Dad came up with something new for the menu.' },
          { ko: '김치 샌드위치였어요!', en: 'It was a kimchi sandwich!' },
          { ko: '저는 김치가 싫었어요. 그래도 조금 먹었어요.', en: 'I didn’t like kimchi, but I had a little anyway.' },
          { ko: '와, 정말 맛있었어요!', en: 'Wow, it was really good!' },
        ],
        questions: [
          { q: { ko: '아빠의 새 메뉴는 뭐였어요?', en: 'What was the new item on Dad’s menu?' },
            options: [{ ko: '김치 샌드위치', en: 'A kimchi sandwich' }, { ko: '김치 케이크', en: 'A kimchi cake' }, { ko: '초콜릿 샌드위치', en: 'A chocolate sandwich' }],
            answer: 0, line: [0, 1], why: 'Dad made something new (새 메뉴를 만들었어요), and 김치 샌드위치였어요!: “It was a kimchi sandwich!”' },
        ],
      },
      {
        lines: [
          { ko: '지금은 카페에 사람이 정말 많아요.', en: 'Now the café is full of people.' },
          { ko: '사람들이 김치 샌드위치를 많이 사요.', en: 'People buy lots of kimchi sandwiches.' },
          { ko: '아빠는 바쁘지만 행복해요.', en: 'Dad is busy, but he’s happy.' },
          { ko: '그리고 저도 이제 김치가 좋아요!', en: 'And now I like kimchi too!' },
        ],
        questions: [
          { q: { ko: '이 사람은 이제 김치를 좋아해요?', en: 'Does the speaker like kimchi now?' },
            options: [{ ko: '네, 좋아해요', en: 'Yes, she likes it' }, { ko: '아니요, 싫어해요', en: 'No, she doesn’t like it' }, { ko: '아니요, 안 먹어요', en: 'No, she doesn’t eat it' }],
            answer: 0, line: 3, why: '그리고 저도 이제 김치가 좋아요!: “And now I like kimchi too!” Before the sandwich it was 저는 김치가 싫었어요, “I didn’t like kimchi.”' },
        ],
      },
    ],
  },

  // ---------- feelings · level 2 · a story ----------
  {
    id: 'feelings-big-dog',
    topic: 'feelings',
    level: 2,
    emoji: '🐕',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '콩이가 무서워요', en: 'Kongi scares me' },
    voice: 'low',
    words: ['feelings:scared', 'feelings:worried', 'feelings:glad'],
    parts: [
      {
        lines: [
          { ko: '저는 지난달에 새 집으로 이사했어요.', en: 'Last month, I moved to a new house.' },
          { ko: '그런데 옆집에 아주 큰 개가 있었어요.', en: 'But there was a really big dog next door.' },
          { ko: '이름은 콩이예요.', en: 'His name is Kongi.' },
          { ko: '저는 개가 정말 무서워요.', en: 'I’m really scared of dogs.' },
          { ko: '그래서 콩이가 밖에 있으면 집에서 기다렸어요.', en: 'So whenever Kongi was outside, I waited at home.' },
        ],
        questions: [
          { q: { ko: '콩이는 누구예요?', en: 'Who is Kongi?' },
            options: [{ ko: '옆집 개', en: 'The dog next door' }, { ko: '이 사람의 개', en: 'The speaker’s dog' }, { ko: '옆집 아이', en: 'The child next door' }],
            answer: 0, line: [1, 2], why: '옆집에 아주 큰 개가 있었어요. 이름은 콩이예요: Kongi is the big dog (개) next door (옆집).' },
          { q: { ko: '콩이가 밖에 있으면 이 사람은 어떻게 했어요?', en: 'What did the speaker do when Kongi was outside?' },
            options: [{ ko: '집에서 기다렸어요', en: 'He waited at home' }, { ko: '콩이하고 놀았어요', en: 'He played with Kongi' }, { ko: '공원에 갔어요', en: 'He went to the park' }],
            answer: 0, line: [3, 4], why: 'He’s scared of dogs (개가 정말 무서워요), so 콩이가 밖에 있으면 집에서 기다렸어요: whenever (-(으)면) Kongi was outside, he waited at home.' },
        ],
      },
      {
        lines: [
          { ko: '지난 토요일에 저는 공원에서 산책했어요.', en: 'Last Saturday, I went for a walk in the park.' },
          { ko: '그런데 저녁에 보니까 핸드폰이 없었어요!', en: 'But that evening, I noticed my phone was gone!' },
          { ko: '너무 걱정돼서 다시 공원에 갔어요.', en: 'I was so worried that I went back to the park.' },
          { ko: '그때 콩이가 저한테 뛰어왔어요!', en: 'Just then, Kongi came running at me!' },
          { ko: '저는 너무 무서웠어요.', en: 'I was terrified.' },
        ],
        questions: [
          { q: { ko: '이 사람은 왜 다시 공원에 갔어요?', en: 'Why did the speaker go back to the park?' },
            options: [{ ko: '핸드폰이 없어서', en: 'His phone was gone' }, { ko: '콩이를 보고 싶어서', en: 'He wanted to see Kongi' }, { ko: '또 산책하고 싶어서', en: 'He wanted another walk' }],
            answer: 0, line: [1, 2], why: '그런데 저녁에 보니까 핸드폰이 없었어요!: that evening he saw (보니까) his phone was gone. 너무 걱정돼서 다시 공원에 갔어요: he was so worried (걱정돼서) that he went back.' },
        ],
      },
      {
        lines: [
          { ko: '그런데 콩이 입에 제 핸드폰이 있었어요!', en: 'But Kongi had my phone in his mouth!' },
          { ko: '콩이가 공원에서 핸드폰을 찾았어요.', en: 'Kongi had found my phone in the park.' },
          { ko: '저는 너무 기뻐서 “고마워, 콩이야!”라고 했어요.', en: 'I was so happy that I said, “Thank you, Kongi!”' },
          { ko: '이제 콩이는 하나도 안 무서워요.', en: 'Now Kongi doesn’t scare me at all.' },
          { ko: '주말마다 콩이하고 같이 산책해요!', en: 'Every weekend, Kongi and I go for a walk together!' },
        ],
        questions: [
          { q: { ko: '콩이는 핸드폰을 어디에서 찾았어요?', en: 'Where did Kongi find the phone?' },
            options: [{ ko: '공원에서', en: 'In the park' }, { ko: '옆집에서', en: 'Next door' }, { ko: '집 앞에서', en: 'In front of the house' }],
            answer: 0, line: 1, why: '콩이가 공원에서 핸드폰을 찾았어요: Kongi found it in the park, where the speaker had gone for a walk.' },
          { q: { ko: '이 사람은 이제 주말마다 뭐 해요?', en: 'What does the speaker do every weekend now?' },
            options: [{ ko: '콩이하고 산책해요', en: 'He walks with Kongi' }, { ko: '집에서 기다려요', en: 'He waits at home' }, { ko: '혼자 공원에 가요', en: 'He goes to the park alone' }],
            answer: 0, line: [3, 4], why: '주말마다 콩이하고 같이 산책해요!: every weekend (주말마다) they walk together. He used to wait at home when Kongi was outside, but now 콩이는 하나도 안 무서워요.' },
        ],
      },
    ],
  },

  // ---------- weather · level 2 · a radio show ----------
  {
    id: 'weather-first-snow',
    topic: 'weather',
    level: 2,
    emoji: '❄️',
    kind: { ko: '라디오', en: 'A radio show' },
    title: { ko: '첫눈이 왔어요!', en: 'The first snow is here!' },
    voice: 'high',
    words: ['weather:snowing', 'weather:belowzero', 'weather:degrees'],
    parts: [
      {
        lines: [
          { ko: '안녕하세요, 여러분! 말랑 라디오의 미나예요.', en: 'Hello, everyone! It’s Mina on Mallang Radio.' },
          { ko: '오늘 아침 서울에 첫눈이 왔어요!', en: 'The first snow fell in Seoul this morning!' },
          { ko: '지금 밖은 영하 삼 도예요. 따뜻하게 입으세요!', en: 'Right now it’s minus three degrees outside, so dress warmly!' },
          { ko: '그리고 길이 미끄러워요. 천천히 걸으세요.', en: 'And the roads are slippery, so walk slowly.' },
          { ko: '그런데 저는 오늘 아침에 회사에 늦었어요!', en: 'By the way, I was late for work this morning!' },
        ],
        questions: [
          { q: { ko: '지금 밖은 몇 도예요?', en: 'What’s the temperature outside right now?' },
            options: [{ ko: '영하 3도', en: '−3°C' }, { ko: '3도', en: '3°C' }, { ko: '영하 4도', en: '−4°C' }],
            answer: 0, line: 2, why: '지금 밖은 영하 삼 도예요: 영하 means “below zero”, so 영하 삼 도 is minus three degrees.' },
        ],
      },
      {
        lines: [
          { ko: '저는 눈을 정말 좋아해요.', en: 'I really love snow.' },
          { ko: '그래서 오늘 아침 일찍 나가서 눈사람을 만들었어요.', en: 'So this morning I went out early and made a snowman.' },
          { ko: '작은 눈사람이었지만 정말 귀여웠어요.', en: 'It was a small snowman, but it was really cute.' },
          { ko: '사진도 많이 찍었어요. 그래서 십 분 늦었어요!', en: 'I took lots of photos of it, too. That’s why I was ten minutes late!' },
          { ko: '자, 이제 여러분의 메시지를 읽을게요!', en: 'Now, let’s read your messages!' },
        ],
        questions: [
          { q: { ko: '미나 씨는 왜 회사에 늦었어요?', en: 'Why was Mina late for work?' },
            options: [{ ko: '눈사람을 만들어서', en: 'She made a snowman' }, { ko: '늦게 일어나서', en: 'She got up late' }, { ko: '길이 미끄러워서', en: 'The roads were slippery' }],
            answer: 0, line: [1, 3], why: 'She went out early (일찍) and 눈사람을 만들었어요, and 사진도 많이 찍었어요. 그래서 십 분 늦었어요!: that’s why (그래서) she was ten minutes late.' },
        ],
      },
      {
        lines: [
          { ko: '대전에서 하준 씨 메시지가 왔어요.', en: 'We’ve got a message from Hajun in Daejeon.' },
          { ko: '하준 씨는 친구하고 약속을 했어요.', en: 'He and a friend made a promise.' },
          { ko: '첫눈이 오는 날 같이 영화를 볼 거예요.', en: 'They’re going to see a movie together on the day of the first snow.' },
          { ko: '그런데 대전에는 아직 눈이 안 왔어요.', en: 'But it hasn’t snowed in Daejeon yet.' },
          { ko: '하준 씨, 걱정 마세요! 대전도 오후에 눈이 와요.', en: 'Don’t worry, Hajun! Daejeon is getting snow this afternoon, too.' },
        ],
        questions: [
          { q: { ko: '첫눈이 오면 하준 씨는 뭐 해요?', en: 'What will Hajun do when the first snow falls?' },
            options: [{ ko: '친구하고 영화를 봐요', en: 'See a movie with a friend' }, { ko: '친구하고 눈사람을 만들어요', en: 'Make a snowman with a friend' }, { ko: '친구하고 사진을 찍어요', en: 'Take photos with a friend' }],
            answer: 0, line: [1, 2], why: '첫눈이 오는 날 같이 영화를 볼 거예요: on the day the first snow falls (첫눈이 오는 날), Hajun and his friend are going to (-(으)ㄹ 거예요) see a movie together. The snowman and the photos were Mina’s.' },
          { q: { ko: '대전에는 언제 눈이 와요?', en: 'When will it snow in Daejeon?' },
            options: [{ ko: '오늘 오후', en: 'This afternoon' }, { ko: '오늘 아침', en: 'This morning' }, { ko: '내일 아침', en: 'Tomorrow morning' }],
            answer: 0, line: [3, 4], why: '대전에는 아직 눈이 안 왔어요 (it hasn’t snowed there yet), but 대전도 오후에 눈이 와요: this afternoon. This morning’s snow (오늘 아침) was in Seoul.' },
        ],
      },
    ],
  },

  // ---------- hobbies · level 3 · a story ----------
  {
    id: 'hobbies-guitar',
    topic: 'hobbies',
    level: 3,
    emoji: '🎸',
    kind: { ko: '이야기', en: 'A story' },
    title: { ko: '밤마다 기타 연습', en: 'Guitar practice every night' },
    voice: 'low',
    words: ['hobbies:playpiano', 'hobbies:practise', 'hobbies:sing', 'hobbies:learn'],
    parts: [
      {
        lines: [
          { ko: '작년 가을에 저는 기타를 샀어요.', en: 'Last autumn, I bought a guitar.' },
          { ko: '여자 친구 생일에 노래를 불러 주고 싶었어요.', en: 'I wanted to sing my girlfriend a song on her birthday.' },
          { ko: '그런데 저는 기타를 한 번도 안 쳐 봤어요.', en: 'But I’d never played the guitar before.' },
          { ko: '회사 일이 바빠서 수업을 들을 시간도 없었어요.', en: 'I was so busy at work that I didn’t even have time for lessons.' },
          { ko: '그래서 퇴근한 후에 혼자 영상을 보고 연습했어요.', en: 'So after work, I practised on my own with videos.' },
          { ko: '보통 밤 열한 시부터 한 시간쯤 쳤어요.', en: 'I usually played from eleven at night for about an hour.' },
        ],
        questions: [
          { q: { ko: '이 사람은 누구한테 노래를 불러 주고 싶었어요?', en: 'Who did the speaker want to sing for?' },
            options: [{ ko: '여자 친구', en: 'His girlfriend' }, { ko: '회사 동료', en: 'A co-worker' }, { ko: '여동생', en: 'His younger sister' }],
            answer: 0, line: 1, why: '여자 친구 생일에 노래를 불러 주고 싶었어요: he wanted to sing for (노래를 불러 주다) his girlfriend on her birthday.' },
          { q: { ko: '이 사람은 보통 몇 시부터 기타를 쳤어요?', en: 'What time did he usually start playing?' },
            options: [{ ko: '밤 11시', en: '11 p.m.' }, { ko: '밤 12시', en: 'Midnight' }, { ko: '새벽 1시', en: '1 a.m.' }],
            answer: 0, line: 5, why: '보통 밤 열한 시부터 한 시간쯤 쳤어요: from eleven at night (열한 시부터), for about an hour. 한 시간 is “one hour”, not one o’clock (한 시).' },
        ],
      },
      {
        lines: [
          { ko: '그런데 어느 날 밤, 누가 문을 두드렸어요.', en: 'Then one night, someone knocked on my door.' },
          { ko: '아래층 할아버지였어요.', en: 'It was the old man from downstairs.' },
          { ko: '저는 “죄송합니다! 밤에는 안 칠게요”라고 했어요.', en: 'I said, “I’m sorry! I won’t play at night any more.”' },
          { ko: '그런데 할아버지는 화를 안 내고 웃으셨어요.', en: 'But he didn’t get angry. He smiled.' },
          { ko: '그리고 “옛날에 기타 선생님이었어요”라고 하셨어요.', en: 'And he said, “I used to be a guitar teacher.”' },
          { ko: '할아버지는 왜 오셨을까요?', en: 'So why had he come?' },
        ],
        questions: [
          { q: { ko: '할아버지는 옛날에 무슨 일을 하셨어요?', en: 'What did the old man use to do?' },
            options: [{ ko: '기타 선생님', en: 'He was a guitar teacher' }, { ko: '피아노 선생님', en: 'He was a piano teacher' }, { ko: '회사원', en: 'He was an office worker' }],
            answer: 0, line: 4, why: '“옛날에 기타 선생님이었어요”: long ago (옛날에) he was (이었어요) a guitar teacher.' },
        ],
      },
      {
        lines: [
          { ko: '할아버지는 매일 밤 제 기타 소리를 들으셨어요.', en: 'He’d been hearing my guitar every night.' },
          { ko: '그런데 제가 항상 같은 곳에서 틀렸어요.', en: 'And I always went wrong in the same place.' },
          { ko: '“그래서 가르쳐 주고 싶었어요!”라고 하셨어요.', en: '“So I wanted to teach you!” he said.' },
          { ko: '그 후에 토요일마다 할아버지한테 기타를 배웠어요.', en: 'After that, I had guitar lessons with him every Saturday.' },
          { ko: '그리고 여자 친구 생일에 노래를 불러 줬어요.', en: 'And on my girlfriend’s birthday, I sang her a song.' },
          { ko: '이번에는 하나도 안 틀렸어요!', en: 'This time, I didn’t make a single mistake!' },
        ],
        questions: [
          { q: { ko: '할아버지는 왜 이 사람 집에 오셨어요?', en: 'Why did the old man come to his door?' },
            options: [{ ko: '기타를 가르쳐 주고 싶어서', en: 'He wanted to teach him' }, { ko: '기타 소리가 시끄러워서', en: 'The guitar was too loud' }, { ko: '기타를 배우고 싶어서', en: 'He wanted to learn the guitar' }],
            answer: 0, line: [1, 2], why: 'The speaker always went wrong in the same place (항상 같은 곳에서 틀렸어요), so the old man said “그래서 가르쳐 주고 싶었어요!” He wasn’t angry about the noise: 화를 안 내고 웃으셨어요.' },
          { q: { ko: '여자 친구 생일에 이 사람은 어땠어요?', en: 'How did he do on his girlfriend’s birthday?' },
            options: [{ ko: '하나도 안 틀렸어요', en: 'He didn’t make a single mistake' }, { ko: '같은 곳에서 틀렸어요', en: 'He went wrong in the same place' }, { ko: '노래를 못 불렀어요', en: 'He couldn’t sing' }],
            answer: 0, line: [4, 5], why: '이번에는 하나도 안 틀렸어요!: this time (이번에는) there wasn’t a single mistake (하나도 안 = not even one).' },
        ],
      },
    ],
  },

  // ---------- health · level 3 · a podcast ----------
  {
    id: 'health-back-pain',
    topic: 'health',
    level: 3,
    emoji: '🎙️',
    kind: { ko: '팟캐스트', en: 'A podcast' },
    title: { ko: '윤서의 건강 이야기', en: 'Health talk with Yunseo' },
    voice: 'high',
    words: ['health:back', 'health:hurt', 'health:painkiller', 'health:liedown'],
    parts: [
      {
        lines: [
          { ko: '안녕하세요, 여러분! 말랑 건강 팟캐스트의 윤서예요.', en: 'Hello, everyone! It’s Yunseo, on the Mallang Health podcast.' },
          { ko: '저는 약국에서 일하는 약사예요.', en: 'I’m a pharmacist; I work at a pharmacy.' },
          { ko: '오늘은 허리 건강 이야기를 할게요.', en: 'Today I’m going to talk about looking after your back.' },
          { ko: '오래 앉아 있으면 허리가 아파요.', en: 'If you sit for a long time, your back hurts.' },
          { ko: '그러니까 한 시간에 한 번 일어나서 조금 걸으세요.', en: 'So once an hour, get up and walk around a little.' },
          { ko: '그런데 사실 저도 지난주에 허리를 다쳤어요.', en: 'But actually, I hurt my back last week, too.' },
        ],
        questions: [
          { q: { ko: '한 시간에 한 번 뭘 해야 해요?', en: 'What should you do once an hour?' },
            options: [{ ko: '일어나서 걸어야 해요', en: 'Get up and walk' }, { ko: '누워서 쉬어야 해요', en: 'Lie down and rest' }, { ko: '진통제를 먹어야 해요', en: 'Take a painkiller' }],
            answer: 0, line: [3, 4], why: '오래 앉아 있으면 허리가 아파요, so: 한 시간에 한 번 일어나서 조금 걸으세요, “once an hour, get up and (-아서) walk a little.”' },
        ],
      },
      {
        lines: [
          { ko: '지난 토요일에 친구가 이사를 했어요.', en: 'Last Saturday, a friend of mine moved house.' },
          { ko: '저는 하루 종일 무거운 짐을 옮겼어요.', en: 'I carried heavy stuff all day.' },
          { ko: '그날은 허리가 괜찮았어요.', en: 'That day, my back was fine.' },
          { ko: '그런데 다음 날 아침에 양말을 신을 때였어요.', en: 'But the next morning, as I was putting on my socks…' },
          { ko: '갑자기 허리가 너무 아팠어요!', en: 'Suddenly my back hurt terribly!' },
          { ko: '그래서 일요일에는 하루 종일 누워 있었어요.', en: 'So I spent all of Sunday lying down.' },
        ],
        questions: [
          { q: { ko: '윤서 씨는 언제 갑자기 허리가 아팠어요?', en: 'When did Yunseo’s back suddenly start hurting?' },
            options: [{ ko: '양말을 신을 때', en: 'Putting on her socks' }, { ko: '무거운 짐을 옮길 때', en: 'Carrying heavy stuff' }, { ko: '오래 앉아 있을 때', en: 'Sitting for a long time' }],
            answer: 0, line: [2, 3, 4], why: 'Carrying the heavy stuff was fine (그날은 허리가 괜찮았어요). The next morning, 양말을 신을 때 (while putting on her socks), 갑자기 허리가 너무 아팠어요: her back suddenly hurt terribly.' },
        ],
      },
      {
        lines: [
          { ko: '오늘은 대학생 은채 씨가 메시지를 보내 주셨어요.', en: 'Today’s message is from Eunchae, a university student.' },
          { ko: '은채 씨는 시험이 있어서 요즘 매일 열 시간 공부해요.', en: 'Eunchae has exams, so these days she studies ten hours a day.' },
          { ko: '그런데 공부할 때 허리하고 목이 아파요.', en: 'But when she studies, her back and neck hurt.' },
          { ko: '그래서 매일 진통제를 먹어요.', en: 'So she takes painkillers every day.' },
          { ko: '은채 씨, 진통제는 너무 자주 먹지 마세요.', en: 'Eunchae, don’t take painkillers too often.' },
          { ko: '한 시간 공부한 후에는 꼭 걸으세요. 빨리 나으세요!', en: 'After studying for an hour, be sure to walk around. Get well soon!' },
        ],
        questions: [
          { q: { ko: '윤서 씨하고 은채 씨는 둘 다 어디가 아팠어요?', en: 'Where did both Yunseo and Eunchae have pain?' },
            options: [{ ko: '허리', en: 'In the back' }, { ko: '목', en: 'In the neck' }, { ko: '다리', en: 'In the legs' }],
            answer: 0, line: 2, why: 'Yunseo hurt her back last week (허리를 다쳤어요), and Eunchae says 공부할 때 허리하고 목이 아파요. Only Eunchae has a sore neck (목).' },
          { q: { ko: '윤서 씨는 은채 씨한테 뭐라고 했어요?', en: 'What did Yunseo tell Eunchae?' },
            options: [{ ko: '진통제를 너무 자주 먹지 마세요', en: 'Don’t take painkillers too often' }, { ko: '진통제를 매일 드세요', en: 'Take a painkiller every day' }, { ko: '하루 종일 누워 계세요', en: 'Stay lying down all day' }],
            answer: 0, line: 4, why: '은채 씨, 진통제는 너무 자주 먹지 마세요: don’t (-지 마세요) take painkillers too often. Instead, 한 시간 공부한 후에는 꼭 걸으세요.' },
        ],
      },
    ],
  },
]);
