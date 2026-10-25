/**
 * Word families (js/games/word-families.js): words built from the same Sino-Korean
 * syllable with the same meaning, so the words you know help you guess new ones
 * (학 學 “study”: 학교, 학생, 방학 → 학원?). A family opens once two of its words
 * are learned.
 *
 * Fields: id, syllable (one Hangul syllable), hanja (the Chinese character it stands
 *         for here), meaning (short: offered as an answer), level (1–3),
 *         words (2+ game words 'topic:id' with the syllable in this meaning),
 *         note (the card's tip, Korean in **bold**),
 *         guess (2–4 new words to guess: { ko, en, hint, wrong: [two], why }),
 *         lookalikes (0–3 words with the same syllable and another meaning:
 *           { ko, en, hanja (or null for a native Korean word), why }),
 *         avoid (optional: ids of families whose meaning is too close to be
 *           offered as the wrong answer for this one).
 */
Mallang.content.registerWordFamilies([
  // ── Places, things, food and jobs ──
  {
    id: 'sil-room',
    syllable: '실',
    hanja: '室',
    meaning: 'room',
    level: 1,
    words: ['work:classroom', 'work:office', 'directions:toilet', 'shopping:fittingroom', 'work:breakroom', 'health:er'],
    note: 'A room for doing something is that thing + **실**: **교실** (teaching room), **사무실** (office-work room), **화장실** (make-up room!).',
    guess: [
      { ko: '회의실', en: 'meeting room', hint: '회의 = a meeting', wrong: ['meeting time', 'meeting notes'], why: '회의 (meeting) + 실 (room): the room where meetings are held.' },
      { ko: '침실', en: 'bedroom', hint: '침 as in 침대, a bed', wrong: ['bed sheet', 'sleeping pill'], why: '침 (sleeping, as in 침대, a bed) + 실 (room): the room you sleep in.' },
      { ko: '대기실', en: 'waiting room', hint: '대기 = waiting', wrong: ['waiting time', 'waiting list'], why: '대기 (waiting) + 실 (room): where you wait, at a hospital or a TV studio.' },
    ],
    lookalikes: [
      { ko: '실수', en: 'a mistake', hanja: '失', why: 'This 실 is 失, “lose”: 실수 is a mistake, nothing to do with rooms.' },
      { ko: '실례합니다', en: 'excuse me', hanja: '失', why: 'The same 失 “lose” (실례, a lapse in manners): it has nothing to do with rooms.' },
    ],
  },
  {
    id: 'jang-place',
    syllable: '장',
    hanja: '場',
    meaning: 'place',
    level: 3,
    words: ['shopping:market', 'directions:busstop'],
    note: '**장** is a place for something: **시장** is a market place, and **정류장** a place for stopping (정류), a bus stop.',
    guess: [
      { ko: '주차장', en: 'car park / parking lot', hint: '주차 = parking (a car)', wrong: ['parking fee', 'parking ticket'], why: '주차 (parking) + 장 (place): the place where you park. (주차’s 차 is the 車 of 자동차.)' },
      { ko: '수영장', en: 'swimming pool', hint: '수영 = swimming (as in 수영해요)', wrong: ['swimsuit', 'swimming lesson'], why: '수영 (swimming) + 장 (place): the place where you swim.' },
      { ko: '야구장', en: 'baseball stadium', hint: '야구 = baseball', wrong: ['baseball bat', 'baseball team'], why: '야구 (baseball) + 장 (place): a baseball stadium. A football pitch is a 축구장.' },
    ],
    lookalikes: [
      { ko: '사장님', en: 'the boss (company president)', hanja: '長', why: 'This 장 is 長, “head, chief”: the 사장님 is the head of a company, not a place.' },
      { ko: '장미', en: 'rose', hanja: '薔', why: 'This 장 is 薔, from the rose’s name 薔薇: no place in it.' },
      { ko: '가장', en: 'the most', hanja: null, why: '가장 is a native Korean word: 가장 좋아해요, I like it the most.' },
    ],
    // A shop, a room, a school or a country is a place too: don't offer one as the wrong answer for the other
    // ("place" fits 한국 and 외국인 as well as "country" does: 국 國).
    avoid: ['jeom-shop', 'sil-room', 'gyo-school', 'guk-country'],
  },
  {
    id: 'jeom-shop',
    syllable: '점',
    hanja: '店',
    meaning: 'shop',
    level: 3,
    words: ['directions:convenience', 'shopping:deptstore'],
    note: '**점** is a shop: a **편의점** is a convenience shop (편의 = convenience), and a **백화점** a “hundred-goods shop” (백 = a hundred).',
    guess: [
      { ko: '서점', en: 'bookshop', hint: '서 = book, as in 도서관 (a library)', wrong: ['bookshelf', 'bookmark'], why: '서 (book, as in 도서관) + 점 (shop): a shop that sells books.' },
      { ko: '음식점', en: 'restaurant', hint: '음식 = food', wrong: ['food delivery', 'food poisoning'], why: '음식 (food) + 점 (shop): a shop that serves food, a restaurant (식당, in everyday talk).' },
      { ko: '면세점', en: 'duty-free shop', hint: '면세 = tax-free', wrong: ['tax refund', 'tax office'], why: '면세 (free of tax) + 점 (shop): a duty-free shop, at the airport or in town.' },
    ],
    lookalikes: [
      { ko: '점심', en: 'lunch', hanja: '點', why: 'This 점 is 點, “dot”: 점심 (點心) is lunch, written with the same characters as dim sum!' },
      { ko: '점수', en: 'score / marks', hanja: '點', why: 'This 점 is 點, “point”: 점수 is your score, the number of points.' },
      { ko: '점점', en: 'more and more, gradually', hanja: '漸', why: 'This 점 is 漸, “gradually”: 점점 추워요, it’s getting colder and colder.' },
    ],
    avoid: ['jang-place'],
  },
  {
    id: 'cha-vehicle',
    syllable: '차',
    hanja: '車',
    meaning: 'vehicle',
    level: 1,
    words: ['travel:car', 'travel:train', 'travel:lasttrain', 'travel:firsttrain'],
    note: '**차** (車) is a vehicle, and on its own it often means a car: **자동차** is a “self-moving vehicle”, **기차** a “steam vehicle”. The same 車 is read **거** in 자전거, a bicycle!',
    guess: [
      { ko: '경찰차', en: 'police car', hint: '경찰 = the police', wrong: ['police station', 'police officer'], why: '경찰 (police) + 차 (vehicle): a police car. (The police station is the 경찰서.)' },
      { ko: '구급차', en: 'ambulance', hint: '구급 = emergency first aid', wrong: ['first-aid kit', 'emergency room'], why: '구급 (emergency aid) + 차 (vehicle): an ambulance. In Korea you call 119 for one.' },
      { ko: '세차', en: 'washing a car', hint: '세 = washing, as in 세수 (washing your face)', wrong: ['washing machine', 'doing the laundry'], why: '세 (washing, as in 세수) + 차 (vehicle): washing the car. A car wash is a 세차장 (장 = place).' },
    ],
    lookalikes: [
      { ko: '차가운', en: 'cold', hanja: null, why: '차가운 (cold, from 차갑다) is native Korean: no vehicle in it.' },
      { ko: '차례', en: 'turn / order', hanja: '次', why: 'This 차 is 次, “next, order”: 차례 is your turn (제 차례예요, it’s my turn).' },
    ],
    // A vehicle is a machine, and it moves (자동차 is in the 동 動 "move" family too).
    avoid: ['gi-machine', 'dong-move'],
  },
  {
    id: 'cha-tea',
    syllable: '차',
    hanja: '茶',
    meaning: 'tea',
    level: 2,
    words: ['cafe:tea', 'cafe:greentea', 'cafe:blacktea'],
    note: '**차** (茶) is tea: **녹차** is “green tea”, and **홍차** is “red tea”, the one English calls black tea!',
    guess: [
      { ko: '보리차', en: 'barley tea', hint: '보리 = barley', wrong: ['barley rice', 'barley field'], why: '보리 (barley) + 차 (tea): roasted barley tea. Many Korean homes drink it instead of plain water.' },
      { ko: '유자차', en: 'yuja (yuzu) tea', hint: '유자 = yuja (yuzu), a fragrant citrus fruit', wrong: ['yuja tree', 'yuja cake'], why: '유자 (yuja, a citrus fruit) + 차 (tea): hot yuja tea, made with yuja preserved in honey or sugar: a winter favourite.' },
      { ko: '인삼차', en: 'ginseng tea', hint: '인삼 = ginseng', wrong: ['ginseng field', 'ginseng chicken soup'], why: '인삼 (ginseng) + 차 (tea): ginseng tea.' },
    ],
    lookalikes: [
      { ko: '차가운', en: 'cold', hanja: null, why: '차가운 (cold, from 차갑다) is native Korean, not tea, though a 차가운 차 is a cold tea!' },
    ],
  },
  {
    id: 'sik-food',
    syllable: '식',
    hanja: '食',
    meaning: 'eating, food',
    level: 3,
    words: ['health:aftermeals', 'work:staffdinner'],
    note: '**식** is eating, or food: **식후** is “after eating” (you’ll see it on medicine packets), and **회식** is “eating together”, the staff dinner.',
    guess: [
      { ko: '식당', en: 'restaurant / canteen', hint: '당 = a hall', wrong: ['dining table', 'mealtime'], why: '식 (eating) + 당 (hall): an eating hall, a restaurant, or the canteen at school or work.' },
      { ko: '외식', en: 'eating out', hint: '외 = outside, as in 외국인 (a foreigner)', wrong: ['going abroad', 'going outside'], why: '외 (outside) + 식 (eating): eating out, at a restaurant instead of at home. 오늘 외식할까요? Shall we eat out today?' },
      { ko: '야식', en: 'late-night snack', hint: '야 = night, as in 야근 (working late)', wrong: ['night shift', 'night bus'], why: '야 (night, as in 야근) + 식 (eating): food eaten late at night, like fried chicken at 11 pm.' },
    ],
    lookalikes: [
      { ko: '결혼식', en: 'wedding', hanja: '式', why: 'This 식 is 式, “ceremony”: 결혼식 is a wedding ceremony (결혼 = marriage), and 졸업식 a graduation.' },
      { ko: '식물', en: 'plant', hanja: '植', why: 'This 식 is 植, “to plant”: 식물 is a plant (and its 물 is 物, “thing”, not water).' },
      { ko: '휴식', en: 'a rest, a break', hanja: '息', why: 'This 식 is 息, “breath, rest”: 휴식 is a rest, a break.' },
    ],
    // 식후 (after meals) is in the 후 後 "after" family too: "after" would look right for 식, and "eating" for 후.
    avoid: ['hu-after'],
  },
  {
    id: 'yak-medicine',
    syllable: '약',
    hanja: '藥',
    meaning: 'medicine',
    level: 2,
    words: ['health:medicine', 'directions:pharmacy', 'health:coldmedicine'],
    note: '**약** is medicine: **감기약** is cold medicine, and you buy it at a **약국** (국 = an office, as in 우체국, the post office).',
    guess: [
      { ko: '치약', en: 'toothpaste', hint: '치 = tooth, as in 치과 (the dentist’s)', wrong: ['toothbrush', 'toothache'], why: '치 (tooth, as in 치과) + 약 (medicine): “tooth medicine”, toothpaste!' },
      { ko: '안약', en: 'eye drops', hint: '안 = eye, as in 안경 (glasses)', wrong: ['eye doctor', 'glasses case'], why: '안 (eye, as in 안경) + 약 (medicine): medicine for your eyes, eye drops.' },
      { ko: '물약', en: 'liquid medicine (syrup)', hint: '물 = water, liquid', wrong: ['drinking water', 'water bottle'], why: '물 (water, liquid) + 약 (medicine): medicine you drink, like a cough syrup. A pill is an 알약.' },
    ],
    lookalikes: [
      { ko: '약속', en: 'a promise / plans to meet', hanja: '約', why: 'This 약 is 約, “promise, agree”: 약속 is a promise, or plans to meet up.' },
      { ko: '예약', en: 'booking / reservation', hanja: '約', why: 'The 約 of 약속 again: a 예약 is a promise made ahead (예 = in advance), a booking.' },
      { ko: '약해요', en: 'it’s weak', hanja: '弱', why: 'This 약 is 弱, “weak”: 약해요, it’s weak (the opposite of 강해요, it’s strong).' },
    ],
  },
  {
    id: 'sa-professional',
    syllable: '사',
    hanja: '師',
    meaning: 'a professional',
    level: 3,
    words: ['people:doctor', 'health:nurse'],
    note: '**사** (師, “master”) ends many job names: **의사** is a doctor (의 = healing), and **간호사** a nurse (간호 = nursing care).',
    guess: [
      { ko: '약사', en: 'pharmacist', hint: '약 = medicine, as in 약국', wrong: ['pharmacy', 'prescription'], why: '약 (medicine) + 사 (professional): the pharmacist at the 약국.' },
      { ko: '요리사', en: 'cook / chef', hint: '요리 = cooking (as in 요리해요)', wrong: ['recipe', 'kitchen'], why: '요리 (cooking) + 사 (professional): a cook or a chef.' },
      { ko: '교사', en: 'teacher (the job)', hint: '교 = teaching, as in 교실 (a classroom)', wrong: ['textbook', 'lesson'], why: '교 (teaching, as in 교실) + 사 (professional): a teacher. You call your teacher 선생님, but the job is 교사.' },
      { ko: '미용사', en: 'hairdresser', hint: '미용 = hair and beauty care', wrong: ['hair salon', 'hair dryer'], why: '미용 (hair and beauty care) + 사 (professional): a hairdresser, who works at a 미용실 (hair salon).' },
    ],
    lookalikes: [
      { ko: '회사', en: 'company', hanja: '社', why: 'This 사 is 社, “company, society”: 회사 is the company itself (the person who works there is a 회사원).' },
      { ko: '사진', en: 'photo', hanja: '寫', why: 'This 사 is 寫, “copy”: 사진 (寫眞) is a “copy of the real thing”, a photo.' },
      { ko: '사거리', en: 'crossroads', hanja: '四', why: 'This 사 is 四, “four”: 사거리 is where four roads (거리, streets) meet.' },
    ],
    // Doctors and nurses are medical: "medicine" would look right for 사.
    avoid: ['yak-medicine'],
  },
  {
    id: 'gi-machine',
    syllable: '기',
    hanja: '機',
    meaning: 'machine',
    level: 2,
    words: ['travel:plane', 'weather:fan'],
    note: '**기** is a machine: a **비행기** is a “flying machine” (비행 = flying), and a **선풍기** a machine for fanning a breeze.',
    guess: [
      { ko: '청소기', en: 'vacuum cleaner', hint: '청소 = cleaning (as in 청소해요)', wrong: ['cleaning time', 'broom'], why: '청소 (cleaning) + 기 (machine): a cleaning machine, a vacuum cleaner.' },
      { ko: '계산기', en: 'calculator', hint: '계산 = calculating (as in 계산해요)', wrong: ['the bill', 'maths homework'], why: '계산 (calculating) + 기 (machine): a calculator.' },
      { ko: '세탁기', en: 'washing machine', hint: '세탁 = doing the laundry', wrong: ['laundry basket', 'dry cleaner’s'], why: '세탁 (laundry) + 기 (machine): a washing machine. (A 세탁소 is a dry cleaner’s.)' },
    ],
    lookalikes: [
      { ko: '기분', en: 'mood, feeling', hanja: '氣', why: 'This 기 is 氣, “air, energy”: 기분 is your mood (감기, a cold, has the same 氣).' },
      { ko: '기념품', en: 'souvenir', hanja: '紀', why: 'This 기 is 紀, “record”: 기념 is remembering an event, and a 기념품 is a thing to remember it by.' },
      { ko: '여기', en: 'here', hanja: null, why: '여기 (here) is native Korean: no machine in it.' },
    ],
    // Planes and fans move, and 선풍기 is an "electric fan": 전 電 and 동 動 would look right too.
    avoid: ['cha-vehicle', 'jeon-electricity', 'dong-move'],
  },
  {
    id: 'gyo-school',
    syllable: '교',
    hanja: '校',
    meaning: 'school',
    level: 2,
    words: ['day:school', 'work:university'],
    note: '**교** (校) is a school: **학교** is a “study school”, **대학교** a “big study school”, a university. Careful: **교실** has another 교 (敎, “teach”): it’s a “teaching room”.',
    guess: [
      { ko: '교복', en: 'school uniform', hint: '복 = clothes, as in 한복 (Korean traditional dress)', wrong: ['school bag', 'clothes shop'], why: '교 (school) + 복 (clothes, as in 한복): a school uniform.' },
      { ko: '교장', en: 'head teacher / principal', hint: '장 = head, chief, as in 사장님 (the boss)', wrong: ['schoolyard', 'class leader'], why: '교 (school) + 장 (head, as in 사장님): the head of a school, called 교장 선생님.' },
      { ko: '교문', en: 'school gate', hint: '문 = a door, a gate', wrong: ['school bell', 'door lock'], why: '교 (school) + 문 (gate): the school gate.' },
    ],
    lookalikes: [
      // Not 교실 (敎室): a classroom is about school too, so its 敎 can't be told from 校 by meaning (the note warns instead).
      { ko: '교통카드', en: 'transport card', hanja: '交', why: 'This 교 is 交, “cross, exchange”: 교통 is traffic, getting around.' },
      { ko: '교회', en: 'church', hanja: '敎', why: 'This 교 is 敎, “teaching” (here: religion), and 회 is a gathering: 교회 is a church.' },
      { ko: '교환', en: 'exchange (swapping an item)', hanja: '交', why: 'The 交 of 교통카드 again, “exchange”: 교환 is swapping something you bought, like a shirt for a bigger size.' },
    ],
    // A school is a place too; and 학교 is 학 + 교, so 학 學 "study" and "school" each look right for the other.
    avoid: ['jang-place', 'hak-study'],
  },
  // ── Time ──
  {
    id: 'il-day',
    syllable: '일',
    hanja: '日',
    meaning: 'day',
    level: 2,
    // Not 일요일 (日曜日: its first 일 is the sun) or 일주일 (一週日: its first 일 is "one").
    words: ['numbers:birthday', 'day:everyday', 'day:tomorrow', 'day:weekday', 'numbers:monday', 'numbers:saturday'],
    note: '**일** is 日, the sun, and so a day: **생일** is your birth day, **매일** every day, and the days of the week all end in **요일**. **일요일** has it twice, sun and day, like English Sunday.',
    guess: [
      { ko: '휴일', en: 'a day off', hint: '휴 = rest, as in 휴게실 (a break room)', wrong: ['a coffee break', 'a nap'], why: '휴 (rest) + 일 (day): a day of rest, like a Sunday or a public holiday (공휴일).' },
      { ko: '기념일', en: 'an anniversary', hint: '기념 as in 기념품 (a souvenir): remembering', wrong: ['a souvenir shop', 'a diary'], why: '기념 (remembering, as in 기념품) + 일 (day): a day to remember, like a wedding anniversary (결혼기념일).' },
      { ko: '출발일', en: 'the departure date', hint: '출발 as in 출발해요 (to set off)', wrong: ['the departure gate', 'the arrival date'], why: '출발 (departure) + 일 (day): the day you leave, as on a ticket or a booking.' },
    ],
    lookalikes: [
      { ko: '일해요', en: 'work', hanja: null, why: 'This 일 is a native Korean word, “work”: 일해요 means “I work”.' },
      { ko: '일어나요', en: 'get up', hanja: null, why: '일어나요 (get up) is a native Korean verb: its 일 has nothing to do with days.' },
      { ko: '일등', en: 'first place', hanja: '一', why: 'This 일 is 一, “one”: 일등 is first place, number one.' },
    ],
  },
  {
    id: 'ju-week',
    syllable: '주',
    hanja: '週',
    meaning: 'week',
    level: 2,
    words: ['day:weekend', 'past:lastweek', 'numbers:week', 'hobbies:nextweek'],
    note: '**주** is 週, a week: **주말** is the week’s end (말, 末), and **지난주** the week that’s gone by. In **일주일** (a week), the first 일 is 一, “one”, and the last is 日, “day”: two different 일s!',
    guess: [
      { ko: '매주', en: 'every week', hint: '매 as in 매일 (every day): every', wrong: ['every day', 'every month'], why: '매 (every) + 주 (week): 매주 토요일 = every Saturday.' },
      { ko: '이번 주', en: 'this week', hint: '이번 = this, this time', wrong: ['this time', 'this month'], why: '이번 (this) + 주 (week). Last week is 지난주, and next week is 다음 주.' },
      { ko: '주급', en: 'weekly pay', hint: '급 as in 월급 (monthly pay): pay', wrong: ['a monthly salary', 'a weekend job'], why: '주 (week) + 급 (pay, as in 월급): pay for each week of work.' },
    ],
    lookalikes: [
      { ko: '주세요', en: 'please give me', hanja: null, why: '주세요 comes from the native verb 주다, “to give”: no weeks here.' },
      { ko: '주로', en: 'mostly, mainly', hanja: '主', why: 'This 주 is 主, “main”: 주로 means mainly.' },
      { ko: '주문해요', en: 'order', hanja: '注', why: 'This 주 is another character, 注: 주문 is an order, at a café or online.' },
    ],
  },
  {
    id: 'nyeon-year',
    syllable: '년',
    hanja: '年',
    meaning: 'year',
    level: 2,
    words: ['past:lastyear', 'hobbies:nextyear', 'numbers:year'],
    note: '**년** is 年, a year: **작년** is last year, **내년** next year, and **십 년** ten years. At the start of a word it’s spelled **연**: **연말** is the year’s end.',
    guess: [
      { ko: '매년', en: 'every year', hint: '매 as in 매일 (every day): every', wrong: ['every week', 'every day'], why: '매 (every) + 년 (year): 매년 여름 = every summer.' },
      { ko: '학년', en: 'a school year, a grade', hint: '학 as in 학교 and 학생: study', wrong: ['the school holidays', 'a student’s age'], why: '학 (study) + 년 (year): your year at school. 몇 학년이에요? = What year are you in?' },
      { ko: '중년', en: 'middle age', hint: '중 = middle (中)', wrong: ['the middle of the month', 'middle school'], why: '중 (middle) + 년 (years): the middle years of life, around your forties and fifties.' },
    ],
    // 年 is the only common 년 (the other 년 is a vulgar native word), and 연 words (연필, 연습) don't contain 년:
    // no look-alikes, so this family gets a second guess instead of "which word belongs?".
    lookalikes: [],
  },
  {
    id: 'nae-coming',
    syllable: '내',
    hanja: '來',
    meaning: 'coming, next',
    level: 3,
    words: ['day:tomorrow', 'hobbies:nextyear'],
    note: '**내** is 來, “come”: **내일** is the day that’s coming and **내년** the year that’s coming. Inside a word it’s read **래**: **미래** (the future) is what hasn’t come yet.',
    guess: [
      { ko: '내후년', en: 'the year after next', hint: '후 = after (as in 오후), 년 = year', wrong: ['the year before last', 'after the New Year'], why: '내 (coming) + 후 (after) + 년 (year): the year after the coming one. 내년, then 내후년.' },
      { ko: '내주', en: 'next week', hint: '주 = week (as in 주말, the weekend)', wrong: ['last week', 'every week'], why: '내 (coming) + 주 (week): next week. You hear it on the news; in conversation, people say 다음 주.' },
      { ko: '내한', en: 'a visit to Korea (by a foreign star)', hint: '한 = Korea (as in 한국)', wrong: ['leaving Korea', 'a Korean star'], why: '내 (coming) + 한 (Korea): coming to Korea. Posters for foreign singers’ concerts say 내한 공연.' },
    ],
    lookalikes: [
      { ko: '내려요', en: 'get off', hanja: null, why: '내려요 (get off, from 내리다) is native Korean: nothing is coming, you’re getting off.' },
      { ko: '막내', en: 'the youngest', hanja: null, why: '막내 (the youngest in a family) is a native Korean word.' },
      { ko: '시내', en: 'downtown', hanja: '內', why: 'This 내 is 內, “inside”: 시내 is inside the city (시, 市), downtown.' },
    ],
    // "After" would look right here: 내일 is the day after today.
    avoid: ['hu-after'],
  },
  {
    id: 'hu-after',
    syllable: '후',
    hanja: '後',
    meaning: 'after',
    level: 3,
    words: ['numbers:pm', 'health:aftermeals'],
    note: '**후** is 後, “after”: **오후** is after noon (오, 午) and **식후** after a meal (식, 食). Before is **전** (前), as in **오전**, before noon.',
    guess: [
      { ko: '후식', en: 'dessert', hint: '식 = food, a meal (as in 식후)', wrong: ['leftovers', 'a late-night snack'], why: '후 (after) + 식 (food): what comes after the meal. Flip it and you get 식후, after a meal!' },
      { ko: '후반', en: 'the second half', hint: '반 = half (as in 세 시 반, half past three)', wrong: ['half past', 'half price'], why: '후 (after) + 반 (half): the later half, of a match or of your twenties (20대 후반, your late twenties).' },
      { ko: '후배', en: 'a junior (at school or work)', hint: '배 = fellows, a generation (輩)', wrong: ['a senior', 'a classmate'], why: '후 (after) + 배 (fellow): someone who started school or work after you. Someone who started before you is your 선배.' },
    ],
    lookalikes: [
      { ko: '기후', en: 'climate', hanja: '候', why: 'This 후 is 候, “season, weather”: 기후 is the climate.' },
      { ko: '후련해요', en: 'I feel relieved', hanja: null, why: '후련해요 (I feel relieved, a weight off my mind) is a native Korean word.' },
    ],
  },
  {
    id: 'si-time',
    syllable: '시',
    hanja: '時',
    meaning: 'time, hour',
    level: 1,
    words: ['numbers:hour', 'numbers:clock', 'numbers:oclock', 'numbers:whattime'],
    note: '**시** is 時, time or the hour: **세 시** is three o’clock, **시간** is time (or hours), and a **시계** measures time (계, 計, as in **계산**, counting).',
    guess: [
      { ko: '시급', en: 'hourly pay', hint: '급 as in 월급 (monthly pay): pay', wrong: ['a monthly salary', 'a time limit'], why: '시 (hour) + 급 (pay): pay per hour, the usual way part-time jobs (아르바이트) are paid.' },
      { ko: '시차', en: 'the time difference, jet lag', hint: '차 = difference (差): not a car, not tea!', wrong: ['a train timetable', 'tea time'], why: '시 (time) + 차 (difference): the time difference between countries, and the jet lag it brings.' },
      { ko: '동시', en: 'the same time', hint: '동 = same (同), as in 동료 (a colleague)', wrong: ['all the time', 'on time'], why: '동 (same) + 시 (time): 동시에 = at the same time.' },
    ],
    lookalikes: [
      { ko: '시험', en: 'exam', hanja: '試', why: 'This 시 is 試, “test, try”: 시험 is an exam.' },
      { ko: '시장', en: 'market', hanja: '市', why: 'This 시 is 市, “market, city”: a 시장 is a market.' },
      { ko: '시작해요', en: 'start', hanja: '始', why: 'This 시 is 始, “begin”: 시작 is the start. It sounds like time, but it’s another character.' },
    ],
  },

  // ── People and language ──
  {
    id: 'hak-study',
    syllable: '학',
    hanja: '學',
    meaning: 'study, learning',
    level: 2,
    words: ['day:school', 'people:student', 'work:university', 'hobbies:vacation', 'work:entrance'],
    note: '**학** is 學, “study”: a **학생** is a student, a **대학교** a big (대, 大) school of study, and **방학** is when study is let out (방, 放): the school holidays!',
    guess: [
      { ko: '학원', en: 'a private academy (after-school classes)', hint: '원 as in 병원 (a hospital): an institution', wrong: ['a university hospital', 'a school dormitory'], why: '학 (study) + 원 (院, an institution, as in 병원): a private academy. Many Korean children go to one or two after school.' },
      { ko: '수학', en: 'maths', hint: '수 = number (as in 점수, a score)', wrong: ['swimming lessons', 'a test score'], why: '수 (number) + 학 (study): the study of numbers, mathematics.' },
      { ko: '유학', en: 'studying abroad', hint: '유 = staying away from home (留)', wrong: ['a study group', 'the school holidays'], why: '유 (staying) + 학 (study): staying in another country to study. A student from abroad is a 유학생.' },
    ],
    // 學 is nearly the only 학: the crane is the one common exception.
    lookalikes: [
      { ko: '종이학', en: 'a paper crane', hanja: '鶴', why: 'This 학 is 鶴, a crane (the bird): a 종이학 is a crane folded from paper (종이).' },
      { ko: '학', en: 'a crane (the bird)', hanja: '鶴', why: 'The same 鶴: on its own, 학 is the crane, the bird on the 500-won coin.' },
    ],
  },
  {
    id: 'saeng-birth',
    syllable: '생',
    hanja: '生',
    meaning: 'birth, being born',
    level: 2,
    // Not 학생: its 生 means a young learner, not birth.
    words: ['numbers:birthday', 'people:teacher', 'people:sibling'],
    note: '**생** is 生, being born: **생일** is your birth day, and **동생** someone born of the same (동, 同) parents. **선생님** comes from 先生, “born before you”: an elder, and so a teacher.',
    guess: [
      { ko: '생년월일', en: 'date of birth', hint: '년 = year, 월 = month, 일 = day', wrong: ['a birthday party', 'a calendar'], why: '생 (birth) + 년 (year) + 월 (month) + 일 (day): the date you were born, asked for on every form.' },
      { ko: '출생', en: 'birth', hint: '출 = out (as in 출구, an exit)', wrong: ['death', 'leaving home'], why: '출 (out) + 생 (being born): coming out into the world. Your birthplace is your 출생지.' },
      { ko: '생후', en: 'after birth (a baby’s age)', hint: '후 = after (as in 오후)', wrong: ['before birth', 'a birthday'], why: '생 (birth) + 후 (after): counted from birth. 생후 100일 = 100 days old, a day Korean families celebrate (백일).' },
    ],
    // Not 잘생겼어요: 생기다 (“to come about”) is close to 生 in meaning, and some trace it to 生.
    lookalikes: [
      { ko: '생각', en: 'a thought', hanja: null, why: '생각 (a thought, an idea) is a native Korean word: no birth in it.' },
      { ko: '생략', en: 'leaving out, skipping', hanja: '省', why: 'This 생 is 省, “leave out”: 생략 is skipping or leaving something out.' },
    ],
  },
  {
    id: 'nam-man',
    syllable: '남',
    hanja: '男',
    meaning: 'man, male',
    level: 3,
    words: ['people:man', 'people:husband', 'people:boyfriend'],
    note: '**남** is 男, a man or male: **남자** is a man, and **남편** a husband. The character is a field (田) over strength (力).',
    guess: [
      { ko: '남학생', en: 'a male student, a schoolboy', hint: '학생 = a student', wrong: ['a boys’ school', 'a student’s boyfriend'], why: '남 (male) + 학생 (student). A female student is a 여학생.' },
      { ko: '남녀', en: 'men and women', hint: '녀 = woman (女): the 여 of 여자', wrong: ['a boyfriend', 'a girlfriend'], why: '남 (man) + 녀 (woman): men and women. 女 is 녀, but 여 at the start of a word (여자).' },
      { ko: '장남', en: 'the eldest son', hint: '장 = eldest, head (長), as in 사장님 (the boss)', wrong: ['a tall man', 'the boss’s son'], why: '장 (eldest) + 남 (male): the eldest son. The eldest daughter is the 장녀.' },
    ],
    lookalikes: [
      { ko: '남쪽', en: 'south', hanja: '南', why: 'This 남 is 南, “south”: 남쪽 is the south side.' },
      { ko: '남산', en: 'Namsan (a mountain in Seoul)', hanja: '南', why: 'The same 南: 남산 is the “south mountain” in Seoul, with N Seoul Tower on top.' },
      { ko: '남아요', en: 'there’s some left', hanja: null, why: '남아요 comes from the native verb 남다, “to be left over”.' },
    ],
  },
  {
    id: 'han-korea',
    syllable: '한',
    hanja: '韓',
    meaning: 'Korea, Korean',
    level: 1,
    words: ['travel:korea', 'day:korean'],
    note: '**한** is 韓, Korea: **한국** is the country (국) of Korea and **한국어** its language (어). The country’s full name, **대한민국**, has it too.',
    guess: [
      { ko: '한식', en: 'Korean food', hint: '식 = food, a meal (as in 식후, after meals)', wrong: ['the Korean language', 'Korean clothes'], why: '한 (Korea) + 식 (food): Korean food. A Korean restaurant is a 한식당.' },
      { ko: '한복', en: 'hanbok (traditional Korean clothes)', hint: '복 = clothes (服)', wrong: ['Korean food', 'a Korean house'], why: '한 (Korea) + 복 (clothes): traditional Korean dress, worn on holidays like 설날 and 추석.' },
      { ko: '한우', en: 'Korean beef', hint: '우 = cow (牛), as in 우유 (milk)', wrong: ['Korean milk', 'a Korean farm'], why: '한 (Korea) + 우 (cow, as in 우유, cow’s milk): beef from Korean cattle, pricey and prized.' },
    ],
    lookalikes: [
      { ko: '한 잔', en: 'one cup', hanja: null, why: 'This 한 is the native number one (하나 becomes 한 before a counter): 커피 한 잔 = one coffee.' },
      { ko: '한강', en: 'the Han River', hanja: '漢', why: 'This 한 is another character, 漢: 한강 is the big river that runs through Seoul.' },
      { ko: '한자', en: 'hanja (Chinese characters)', hanja: '漢', why: 'This 한 is 漢, “Chinese” (after the Han dynasty): 한자 are Chinese characters, like the small ones on these cards.' },
    ],
    // Both families have 한국 and 한국어: "country" would look right for 한, and "Korea" for 국 (avoid works both ways).
    avoid: ['guk-country'],
  },
  {
    id: 'guk-country',
    syllable: '국',
    hanja: '國',
    meaning: 'country',
    level: 1,
    words: ['travel:korea', 'people:foreigner', 'day:korean'],
    note: '**국** is 國, a country: **한국** is the country of Korea (한), and an **외국인** is a person (인) from an outside (외) country.',
    guess: [
      { ko: '입국', en: 'entering a country', hint: '입 as in 입구 (an entrance): in', wrong: ['leaving the country', 'a domestic flight'], why: '입 (in) + 국 (country): coming into a country. At the airport, 입국 심사 is immigration.' },
      { ko: '출국', en: 'leaving a country', hint: '출 as in 출구 (an exit): out', wrong: ['entering the country', 'a foreign country'], why: '출 (out) + 국 (country): leaving the country. At the airport, departures is 출국장.' },
      { ko: '중국', en: 'China', hint: '중 = middle (中)', wrong: ['the city centre', 'the countryside'], why: '중 (middle) + 국 (country): the “Middle Kingdom”, China. Chinese is 중국어.' },
    ],
    lookalikes: [
      { ko: '약국', en: 'pharmacy', hanja: '局', why: 'This 국 is 局, an office or shop: a 약국 sells medicine (약), it’s not a country.' },
      { ko: '우체국', en: 'post office', hanja: '局', why: 'The same 局, an office: 우체국 is the post office.' },
      { ko: '미역국', en: 'seaweed soup', hanja: null, why: '국 on its own is native Korean for soup: 미역국 is the seaweed soup Koreans eat on their birthday.' },
    ],
  },
  {
    id: 'eo-language',
    syllable: '어',
    hanja: '語',
    meaning: 'language, words',
    level: 1,
    words: ['day:korean', 'work:word'],
    note: '**어** is 語, language or words: **한국어** is the language of Korea (한국), and a **단어** is a single (단, 單) word.',
    guess: [
      { ko: '영어', en: 'English (the language)', hint: '영 = Britain, England (as in 영국, the UK)', wrong: ['England', 'a British person'], why: '영 (England, as in 영국) + 어 (language): English.' },
      { ko: '외국어', en: 'a foreign language', hint: '외국 as in 외국인 (a foreigner): a foreign country', wrong: ['a foreigner', 'a foreign country'], why: '외국 (foreign country) + 어 (language): a language from another country. For you, 한국어 is one!' },
      { ko: '모국어', en: 'your mother tongue', hint: '모국 = your mother (모, as in 부모님) country (국)', wrong: ['your home country', 'your mother’s advice'], why: '모 (mother) + 국 (country) + 어 (language): the language of your mother country, your first language.' },
    ],
    lookalikes: [
      { ko: '어디', en: 'where', hanja: null, why: '어디 (where) is a native Korean word: no language in it.' },
      { ko: '어제', en: 'yesterday', hanja: null, why: '어제 (yesterday) is a native Korean word.' },
      { ko: '연어', en: 'salmon', hanja: '魚', why: 'This 어 is 魚, “fish”: 연어 is salmon.' },
    ],
  },

  // ── Going in and out ──
  {
    id: 'chul-out',
    syllable: '출',
    hanja: '出',
    meaning: 'out, going out',
    level: 3,
    words: ['directions:exit', 'travel:depart', 'day:gotowork', 'work:businesstrip'],
    note: '**출** is 出, “out”: an **출구** is a way out (구, 口, a mouth or opening), **출발** is setting out, and **출근** going out to work. Its opposite is **입** (入, in): **입구** is the way in.',
    guess: [
      { ko: '외출', en: 'going out (for a while)', hint: '외 = outside (as in 외국인, a foreigner)', wrong: ['a trip abroad', 'the outside of a building'], why: '외 (outside) + 출 (out): stepping out of the house or office for a while. 외출 중 = out right now.' },
      { ko: '일출', en: 'sunrise', hint: '일 = the sun (日), as in 일요일 (Sunday)', wrong: ['sunset', 'a day out'], why: '일 (the sun) + 출 (coming out): the sun coming out. Many Koreans watch the first 일출 of the year on New Year’s Day.' },
      { ko: '출금', en: 'taking money out (a withdrawal)', hint: '금 = money (as in 현금, cash)', wrong: ['a gold medal', 'a bank account'], why: '출 (out) + 금 (money): taking money out of your account or a cash machine.' },
    ],
    lookalikes: [
      { ko: '출출해요', en: 'I’m a bit peckish', hanja: null, why: '출출해요 (I could eat something) is a native Korean word: nothing goes out.' },
      { ko: '출렁다리', en: 'a swaying suspension bridge', hanja: null, why: '출렁 is native Korean for swaying or sloshing: a 출렁다리 is a wobbly footbridge (다리), found at many Korean beauty spots.' },
    ],
    // 출발, 출근 and 출장 all mean moving somewhere: "move" would look right here.
    avoid: ['dong-move'],
  },
  {
    id: 'ip-in',
    syllable: '입',
    hanja: '入',
    meaning: 'in, entering',
    level: 3,
    words: ['directions:entrance', 'work:entrance'],
    note: '**입** is 入, “in”: an **입구** is a way in (구, 口, an opening), and **입학** is getting into a school (학, 學). Doors for both say **출입구**.',
    guess: [
      { ko: '입원', en: 'going into hospital (as a patient)', hint: '원 as in 병원 (a hospital)', wrong: ['a hospital entrance', 'leaving hospital'], why: '입 (in) + 원 (院, as in 병원): being admitted to hospital. Leaving it is 퇴원.' },
      { ko: '입사', en: 'joining a company', hint: '사 as in 회사 (a company)', wrong: ['an office worker', 'leaving a company'], why: '입 (in) + 사 (company, as in 회사): starting work at a company. Leaving it for good is 퇴사.' },
      { ko: '입금', en: 'paying money in (a deposit)', hint: '금 = money (as in 현금, cash)', wrong: ['taking money out', 'a piggy bank'], why: '입 (in) + 금 (money): money going into a bank account. 입금했어요 = I’ve paid it (by bank transfer).' },
    ],
    lookalikes: [
      { ko: '입어요', en: 'wear', hanja: null, why: '입어요 comes from the native verb 입다, “to put on (clothes)”: you don’t go in anywhere.' },
      { ko: '입술', en: 'lips', hanja: null, why: '입술 (lips) is native Korean, from 입, “mouth”.' },
    ],
  },
  {
    id: 'jeon-electricity',
    syllable: '전',
    hanja: '電',
    meaning: 'electricity',
    level: 2,
    words: ['day:call', 'numbers:phone', 'past:called'],
    note: '**전** is 電, which first meant lightning (see the rain, 雨, on top): a **전화** (telephone) is “electric talk” (화, 話).',
    guess: [
      { ko: '정전', en: 'a power cut', hint: '정 = stopping (as in 정류장, a bus stop)', wrong: ['a phone call', 'a tram stop'], why: '정 (stop) + 전 (electricity): the electricity stops.' },
      { ko: '전철', en: 'an electric train', hint: '철 = iron, rails (as in 지하철, the subway)', wrong: ['an electric iron', 'a power line'], why: '전 (electric) + 철 (iron, rails): an electric railway. In Seoul, people say 전철 and 지하철 for the same trains.' },
      { ko: '충전', en: 'charging (a battery)', hint: '충 = filling up (充)', wrong: ['a power cut', 'an electric shock'], why: '충 (filling) + 전 (electricity): filling up with electricity. A charger is a 충전기.' },
    ],
    lookalikes: [
      { ko: '오전', en: 'a.m. (before noon)', hanja: '前', why: 'This 전 is 前, “before”: 오전 is before noon (오, 午).' },
      { ko: '전부', en: 'all, in total', hanja: '全', why: 'This 전 is 全, “all, whole”: 전부 means all of it.' },
      { ko: '자전거', en: 'bicycle', hanja: '轉', why: 'This 전 is 轉, “turn”: a 자전거 is a “self-turning vehicle” (자, 自 + 전 + 거, 車), no electricity needed.' },
    ],
  },
  {
    id: 'dong-move',
    syllable: '동',
    hanja: '動',
    meaning: 'move, moving',
    level: 1,
    words: ['hobbies:sport', 'travel:car', 'day:exercise'],
    note: '**동** is 動, “move”: **운동** (sport, exercise) is literally movement, and a **자동차** is a vehicle (차, 車) that moves by itself (자, 自).',
    guess: [
      { ko: '동물', en: 'an animal', hint: '물 = a thing (物), as in 선물 and 건물: not water!', wrong: ['a river', 'a plant'], why: '동 (moving) + 물 (thing): a thing that moves, an animal. A plant, which stays put, is 식물.' },
      { ko: '동영상', en: 'a video', hint: '영상 = a picture on a screen (영 as in 영화, a movie)', wrong: ['a photo', 'a cinema'], why: '동 (moving) + 영상 (picture): a moving picture, a video.' },
      { ko: '감동', en: 'being moved (touched)', hint: '감 = feeling (感)', wrong: ['a cold', 'a workout'], why: '감 (feeling) + 동 (moving): your feelings are moved, just like in English. 감동했어요 = I was so moved.' },
    ],
    lookalikes: [
      { ko: '동생', en: 'younger sibling', hanja: '同', why: 'This 동 is 同, “same”: a 동생 was born (생) of the same parents.' },
      { ko: '동안', en: 'during, for (a time)', hanja: null, why: '동안 (during: 한 시간 동안 = for an hour) is a native Korean word.' },
      { ko: '동쪽', en: 'east', hanja: '東', why: 'This 동 is 東, “east”: 동쪽 is the east side.' },
    ],
  },
  {
    id: 'san-mountain',
    syllable: '산',
    hanja: '山',
    meaning: 'mountain',
    level: 3,
    words: ['travel:mountain', 'hobbies:hiking'],
    note: '**산** is 山, a picture of three peaks. **등산** is climbing (등, 登) one, a hugely popular hobby in a land that’s about 70% mountains.',
    guess: [
      { ko: '화산', en: 'a volcano', hint: '화 = fire (火), as in 화요일 (Tuesday)', wrong: ['a forest fire', 'a hot spring'], why: '화 (fire) + 산 (mountain): a fire mountain. 한라산 on Jeju is one.' },
      { ko: '빙산', en: 'an iceberg', hint: '빙 = ice (氷), as in 빙수 (shaved ice)', wrong: ['a ski slope', 'an ice rink'], why: '빙 (ice) + 산 (mountain): a mountain of ice. 빙산의 일각 = the tip of the iceberg.' },
      { ko: '산길', en: 'a mountain path', hint: '길 = a road, a way (native Korean)', wrong: ['a mountain village', 'a motorway'], why: '산 (mountain) + 길 (road): a path or road through the mountains.' },
    ],
    lookalikes: [
      { ko: '우산', en: 'umbrella', hanja: '傘', why: 'This 산 is 傘, “umbrella”: 우산 is a rain (우, 雨) umbrella.' },
      { ko: '산책해요', en: 'take a walk', hanja: '散', why: 'This 산 is 散, “scatter, wander”: 산책 is a stroll, no mountain needed.' },
      { ko: '계산해요', en: 'pay, calculate', hanja: '算', why: 'This 산 is 算, “count”: 계산 is counting up, or paying the bill.' },
    ],
  },
]);
