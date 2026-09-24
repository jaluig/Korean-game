/**
 * Sound Twins: sets of real words that differ in just one sound — the pairs
 * English speakers find hardest to hear: plain / aspirated / tense consonants
 * (ㄷ ㅌ ㄸ), close vowels (ㅓ ㅗ, ㅜ ㅡ) and final consonants (ㄴ ㅇ ㅁ).
 * The game works out which letter differs and explains it.
 * Word fields: ko, en, emoji, rom (romanization, for reading mode).
 */
Mallang.content.registerSoundSets([
  // ---- Plain, aspirated (with a puff of air) and tense (tight) consonants ----
  { id: 'bul', words: [
    { ko: '불', en: 'fire', emoji: '🔥', rom: 'bul' },
    { ko: '풀', en: 'grass', emoji: '🌿', rom: 'pul' },
    { ko: '뿔', en: 'horn', emoji: '🦏', rom: 'ppul' },
  ] },
  { id: 'dal', words: [
    { ko: '달', en: 'moon', emoji: '🌙', rom: 'dal' },
    { ko: '탈', en: 'mask', emoji: '🎭', rom: 'tal' },
    { ko: '딸', en: 'daughter', emoji: '👧', rom: 'ttal' },
  ] },
  { id: 'jada', words: [
    { ko: '자다', en: 'to sleep', emoji: '😴', rom: 'jada' },
    { ko: '차다', en: 'to kick', emoji: '⚽', rom: 'chada' },
    { ko: '짜다', en: 'to be salty', emoji: '🧂', rom: 'jjada' },
  ] },
  { id: 'bang', words: [
    { ko: '방', en: 'room', emoji: '🛏️', rom: 'bang' },
    { ko: '빵', en: 'bread', emoji: '🍞', rom: 'ppang' },
  ] },
  { id: 'gul', words: [
    { ko: '굴', en: 'oyster', emoji: '🦪', rom: 'gul' },
    { ko: '꿀', en: 'honey', emoji: '🍯', rom: 'kkul' },
  ] },
  { id: 'bal', words: [
    { ko: '발', en: 'foot', emoji: '🦶', rom: 'bal' },
    { ko: '팔', en: 'arm', emoji: '💪', rom: 'pal' },
  ] },
  { id: 'sada', words: [
    { ko: '사다', en: 'to buy', emoji: '🛍️', rom: 'sada' },
    { ko: '싸다', en: 'to be cheap', emoji: '🏷️', rom: 'ssada' },
  ] },
  { id: 'gong', words: [
    { ko: '공', en: 'ball', emoji: '⚽', rom: 'gong' },
    { ko: '콩', en: 'bean', emoji: '🫘', rom: 'kong' },
  ] },
  { id: 'bi', words: [
    { ko: '비', en: 'rain', emoji: '🌧️', rom: 'bi' },
    { ko: '피', en: 'blood', emoji: '🩸', rom: 'pi' },
  ] },
  { id: 'cha', words: [
    { ko: '차', en: 'car / tea', emoji: '🚗', rom: 'cha' },
    { ko: '자', en: 'ruler', emoji: '📏', rom: 'ja' },
  ] },
  { id: 'tokki', words: [
    { ko: '토끼', en: 'rabbit', emoji: '🐰', rom: 'tokki' },
    { ko: '도끼', en: 'axe', emoji: '🪓', rom: 'dokki' },
  ] },
  { id: 'kkori', words: [
    { ko: '꼬리', en: 'tail', emoji: '🦊', rom: 'kkori' },
    { ko: '고리', en: 'ring / loop', emoji: '⭕', rom: 'gori' },
  ] },
  { id: 'bada', words: [
    { ko: '바다', en: 'sea', emoji: '🌊', rom: 'bada' },
    { ko: '파다', en: 'to dig', emoji: '⛏️', rom: 'pada' },
  ] },
  { id: 'si', words: [
    { ko: '시', en: 'poem / o’clock', emoji: '📜', rom: 'si' },
    { ko: '씨', en: 'seed / Mr. or Ms.', emoji: '🌱', rom: 'ssi' },
  ] },

  // ---- Vowels that sound close ----
  { id: 'geogi', words: [
    { ko: '거기', en: 'there', emoji: '👉', rom: 'geogi' },
    { ko: '고기', en: 'meat', emoji: '🥩', rom: 'gogi' },
  ] },
  { id: 'beol', words: [
    { ko: '벌', en: 'bee', emoji: '🐝', rom: 'beol' },
    { ko: '볼', en: 'cheek', emoji: '😊', rom: 'bol' },
  ] },
  { id: 'seom', words: [
    { ko: '섬', en: 'island', emoji: '🏝️', rom: 'seom' },
    { ko: '솜', en: 'cotton', emoji: '☁️', rom: 'som' },
  ] },
  { id: 'geoul', words: [
    { ko: '거울', en: 'mirror', emoji: '🪞', rom: 'geoul' },
    { ko: '겨울', en: 'winter', emoji: '☃️', rom: 'gyeoul' },
  ] },
  { id: 'ori', words: [
    { ko: '오리', en: 'duck', emoji: '🦆', rom: 'ori' },
    { ko: '요리', en: 'cooking', emoji: '🍳', rom: 'yori' },
  ] },
  { id: 'gol', words: [
    { ko: '골', en: 'goal', emoji: '🥅', rom: 'gol' },
    { ko: '굴', en: 'oyster', emoji: '🦪', rom: 'gul' },
  ] },
  { id: 'deul', words: [
    { ko: '들', en: 'field', emoji: '🌾', rom: 'deul' },
    { ko: '둘', en: 'two', emoji: '2️⃣', rom: 'dul' },
  ] },
  { id: 'geul', words: [
    { ko: '글', en: 'writing', emoji: '✍️', rom: 'geul' },
    { ko: '굴', en: 'oyster', emoji: '🦪', rom: 'gul' },
  ] },

  // ---- Final consonants (받침) ----
  { id: 'ban', words: [
    { ko: '반', en: 'half', emoji: '🌓', rom: 'ban' },
    { ko: '방', en: 'room', emoji: '🛏️', rom: 'bang' },
    { ko: '밤', en: 'night', emoji: '🌙', rom: 'bam' },
  ] },
  { id: 'san', words: [
    { ko: '산', en: 'mountain', emoji: '⛰️', rom: 'san' },
    { ko: '상', en: 'prize', emoji: '🏆', rom: 'sang' },
    { ko: '삼', en: 'three', emoji: '3️⃣', rom: 'sam' },
  ] },
  { id: 'gam', words: [
    { ko: '감', en: 'persimmon', emoji: '🟠', rom: 'gam' },
    { ko: '강', en: 'river', emoji: '🏞️', rom: 'gang' },
  ] },
  { id: 'gom', words: [
    { ko: '곰', en: 'bear', emoji: '🐻', rom: 'gom' },
    { ko: '공', en: 'ball', emoji: '⚽', rom: 'gong' },
  ] },
  { id: 'jip', words: [
    { ko: '집', en: 'house', emoji: '🏠', rom: 'jip' },
    { ko: '짐', en: 'luggage', emoji: '🧳', rom: 'jim' },
  ] },
  { id: 'mul', words: [
    { ko: '물', en: 'water', emoji: '💧', rom: 'mul' },
    { ko: '문', en: 'door', emoji: '🚪', rom: 'mun' },
  ] },
  { id: 'bap', words: [
    { ko: '밥', en: 'rice / meal', emoji: '🍚', rom: 'bap' },
    { ko: '밖', en: 'outside', emoji: '🌳', rom: 'bak' },
  ] },
]);
