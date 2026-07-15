/**
 * Word lists for Denkmalen
 * 
 * Each language has its own native word list.
 * Words are NOT translations of each other — they are culturally appropriate
 * words that work well for a drawing game in each language.
 */

import type { Lang } from './i18n'

export interface WordEntry {
  word: string
  emoji: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface CategoryWords {
  [category: string]: WordEntry[]
}

// ── English Words ──────────────────────────────────────────────────
const en: CategoryWords = {
  animals: [
    { word: 'Cat', emoji: '🐱', difficulty: 'easy' },
    { word: 'Dog', emoji: '🐕', difficulty: 'easy' },
    { word: 'Elephant', emoji: '🐘', difficulty: 'medium' },
    { word: 'Giraffe', emoji: '🦒', difficulty: 'medium' },
    { word: 'Penguin', emoji: '🐧', difficulty: 'medium' },
    { word: 'Lion', emoji: '🦁', difficulty: 'easy' },
    { word: 'Turtle', emoji: '🐢', difficulty: 'medium' },
    { word: 'Rabbit', emoji: '🐰', difficulty: 'easy' },
    { word: 'Fish', emoji: '🐟', difficulty: 'easy' },
    { word: 'Bird', emoji: '🐦', difficulty: 'easy' },
  ],
  food: [
    { word: 'Pizza', emoji: '🍕', difficulty: 'easy' },
    { word: 'Burger', emoji: '🍔', difficulty: 'easy' },
    { word: 'Sushi', emoji: '🍣', difficulty: 'medium' },
    { word: 'Ice cream', emoji: '🍦', difficulty: 'easy' },
    { word: 'Cake', emoji: '🎂', difficulty: 'easy' },
    { word: 'Apple', emoji: '🍎', difficulty: 'easy' },
    { word: 'Banana', emoji: '🍌', difficulty: 'easy' },
    { word: 'Coffee', emoji: '☕', difficulty: 'easy' },
    { word: 'Bread', emoji: '🍞', difficulty: 'easy' },
    { word: 'Taco', emoji: '🌮', difficulty: 'medium' },
  ],
  nature: [
    { word: 'Tree', emoji: '🌳', difficulty: 'easy' },
    { word: 'Flower', emoji: '🌸', difficulty: 'easy' },
    { word: 'Mountain', emoji: '⛰️', difficulty: 'medium' },
    { word: 'River', emoji: '🏞️', difficulty: 'medium' },
    { word: 'Sun', emoji: '☀️', difficulty: 'easy' },
    { word: 'Moon', emoji: '🌙', difficulty: 'easy' },
    { word: 'Star', emoji: '⭐', difficulty: 'easy' },
    { word: 'Cloud', emoji: '☁️', difficulty: 'easy' },
    { word: 'Rain', emoji: '🌧️', difficulty: 'easy' },
    { word: 'Snow', emoji: '❄️', difficulty: 'easy' },
  ],
  objects: [
    { word: 'Chair', emoji: '🪑', difficulty: 'easy' },
    { word: 'Table', emoji: '🪑', difficulty: 'easy' },
    { word: 'Lamp', emoji: '💡', difficulty: 'easy' },
    { word: 'Clock', emoji: '🕐', difficulty: 'easy' },
    { word: 'Phone', emoji: '📱', difficulty: 'easy' },
    { word: 'Book', emoji: '📖', difficulty: 'easy' },
    { word: 'Shoe', emoji: '👟', difficulty: 'easy' },
    { word: 'Hat', emoji: '🎩', difficulty: 'easy' },
    { word: 'Key', emoji: '🔑', difficulty: 'easy' },
    { word: 'Bag', emoji: '👜', difficulty: 'easy' },
  ],
  vehicles: [
    { word: 'Car', emoji: '🚗', difficulty: 'easy' },
    { word: 'Bicycle', emoji: '🚲', difficulty: 'easy' },
    { word: 'Airplane', emoji: '✈️', difficulty: 'medium' },
    { word: 'Boat', emoji: '⛵', difficulty: 'easy' },
    { word: 'Train', emoji: '🚂', difficulty: 'easy' },
    { word: 'Bus', emoji: '🚌', difficulty: 'easy' },
    { word: 'Truck', emoji: '🚛', difficulty: 'easy' },
    { word: 'Motorcycle', emoji: '🏍️', difficulty: 'medium' },
    { word: 'Helicopter', emoji: '🚁', difficulty: 'hard' },
    { word: 'Rocket', emoji: '🚀', difficulty: 'medium' },
  ],
  sports: [
    { word: 'Soccer', emoji: '⚽', difficulty: 'easy' },
    { word: 'Basketball', emoji: '🏀', difficulty: 'medium' },
    { word: 'Tennis', emoji: '🎾', difficulty: 'easy' },
    { word: 'Golf', emoji: '⛳', difficulty: 'medium' },
    { word: 'Swimming', emoji: '🏊', difficulty: 'medium' },
    { word: 'Baseball', emoji: '⚾', difficulty: 'easy' },
    { word: 'Volleyball', emoji: '🏐', difficulty: 'medium' },
    { word: 'Hockey', emoji: '🏒', difficulty: 'medium' },
    { word: 'Boxing', emoji: '🥊', difficulty: 'medium' },
    { word: 'Cycling', emoji: '🚴', difficulty: 'medium' },
  ],
  fantasy: [
    { word: 'Dragon', emoji: '🐉', difficulty: 'medium' },
    { word: 'Unicorn', emoji: '🦄', difficulty: 'medium' },
    { word: 'Wizard', emoji: '🧙', difficulty: 'medium' },
    { word: 'Fairy', emoji: '🧚', difficulty: 'medium' },
    { word: 'Ghost', emoji: '👻', difficulty: 'easy' },
    { word: 'Vampire', emoji: '🧛', difficulty: 'hard' },
    { word: 'Mermaid', emoji: '🧜', difficulty: 'hard' },
    { word: 'Phoenix', emoji: '🔥', difficulty: 'hard' },
    { word: 'Goblin', emoji: '👺', difficulty: 'hard' },
    { word: 'Magic', emoji: '✨', difficulty: 'medium' },
  ],
  technology: [
    { word: 'Computer', emoji: '💻', difficulty: 'medium' },
    { word: 'Robot', emoji: '🤖', difficulty: 'medium' },
    { word: 'Camera', emoji: '📷', difficulty: 'easy' },
    { word: 'Drone', emoji: '🚁', difficulty: 'medium' },
    { word: 'Watch', emoji: '⌚', difficulty: 'easy' },
    { word: 'Television', emoji: '📺', difficulty: 'medium' },
    { word: 'Speaker', emoji: '🔊', difficulty: 'medium' },
    { word: 'Keyboard', emoji: '⌨️', difficulty: 'medium' },
    { word: 'Mouse', emoji: '🖱️', difficulty: 'easy' },
    { word: 'Printer', emoji: '🖨️', difficulty: 'medium' },
  ],
  space: [
    { word: 'Planet', emoji: '🪐', difficulty: 'medium' },
    { word: 'Astronaut', emoji: '👨‍🚀', difficulty: 'hard' },
    { word: 'Alien', emoji: '👽', difficulty: 'medium' },
    { word: 'Satellite', emoji: '🛰️', difficulty: 'hard' },
    { word: 'Comet', emoji: '☄️', difficulty: 'hard' },
    { word: 'Asteroid', emoji: '🌑', difficulty: 'hard' },
    { word: 'Galaxy', emoji: '🌌', difficulty: 'hard' },
    { word: 'Telescope', emoji: '🔭', difficulty: 'hard' },
    { word: 'UFO', emoji: '🛸', difficulty: 'medium' },
    { word: 'Space', emoji: '🚀', difficulty: 'easy' },
  ],
}

// ── Arabic Words (Egyptian Colloquial) ─────────────────────────────
const ar: CategoryWords = {
  animals: [
    { word: 'قطة', emoji: '🐱', difficulty: 'easy' },
    { word: 'كلب', emoji: '🐕', difficulty: 'easy' },
    { word: 'فيل', emoji: '🐘', difficulty: 'medium' },
    { word: 'زرافة', emoji: '🦒', difficulty: 'medium' },
    { word: 'بطريق', emoji: '🐧', difficulty: 'medium' },
    { word: 'أسد', emoji: '🦁', difficulty: 'easy' },
    { word: 'سلحفاة', emoji: '🐢', difficulty: 'medium' },
    { word: 'أرنب', emoji: '🐰', difficulty: 'easy' },
    { word: 'سمكة', emoji: '🐟', difficulty: 'easy' },
    { word: 'عصفور', emoji: '🐦', difficulty: 'easy' },
  ],
  food: [
    { word: 'بيتزا', emoji: '🍕', difficulty: 'easy' },
    { word: 'برجر', emoji: '🍔', difficulty: 'easy' },
    { word: 'سوشي', emoji: '🍣', difficulty: 'medium' },
    { word: 'آيس كريم', emoji: '🍦', difficulty: 'easy' },
    { word: 'كيك', emoji: '🎂', difficulty: 'easy' },
    { word: 'تفاحة', emoji: '🍎', difficulty: 'easy' },
    { word: 'موزة', emoji: '🍌', difficulty: 'easy' },
    { word: 'قهوة', emoji: '☕', difficulty: 'easy' },
    { word: 'عيش', emoji: '🍞', difficulty: 'easy' },
    { word: 'طعمية', emoji: '🧆', difficulty: 'medium' },
  ],
  nature: [
    { word: 'شجرة', emoji: '🌳', difficulty: 'easy' },
    { word: 'زهرة', emoji: '🌸', difficulty: 'easy' },
    { word: 'جبل', emoji: '⛰️', difficulty: 'medium' },
    { word: 'نهر', emoji: '🏞️', difficulty: 'medium' },
    { word: 'شمس', emoji: '☀️', difficulty: 'easy' },
    { word: 'قمر', emoji: '🌙', difficulty: 'easy' },
    { word: 'نجمة', emoji: '⭐', difficulty: 'easy' },
    { word: 'سحابة', emoji: '☁️', difficulty: 'easy' },
    { word: 'مطر', emoji: '🌧️', difficulty: 'easy' },
    { word: 'ثلج', emoji: '❄️', difficulty: 'easy' },
  ],
  objects: [
    { word: 'كرسي', emoji: '🪑', difficulty: 'easy' },
    { word: 'ترابيزة', emoji: '🪑', difficulty: 'easy' },
    { word: 'لمبة', emoji: '💡', difficulty: 'easy' },
    { word: 'ساعة', emoji: '🕐', difficulty: 'easy' },
    { word: 'موبايل', emoji: '📱', difficulty: 'easy' },
    { word: 'كتاب', emoji: '📖', difficulty: 'easy' },
    { word: 'جزمة', emoji: '👟', difficulty: 'easy' },
    { word: 'برنيطة', emoji: '🎩', difficulty: 'medium' },
    { word: 'مفتاح', emoji: '🔑', difficulty: 'easy' },
    { word: 'شنتة', emoji: '👜', difficulty: 'easy' },
  ],
  vehicles: [
    { word: 'عربية', emoji: '🚗', difficulty: 'easy' },
    { word: 'عجلة', emoji: '🚲', difficulty: 'easy' },
    { word: 'طائرة', emoji: '✈️', difficulty: 'medium' },
    { word: 'ฟัรعة', emoji: '⛵', difficulty: 'medium' },
    { word: 'قطار', emoji: '🚂', difficulty: 'easy' },
    { word: 'باص', emoji: '🚌', difficulty: 'easy' },
    { word: 'شاحنة', emoji: '🚛', difficulty: 'easy' },
    { word: 'موتور', emoji: '🏍️', difficulty: 'medium' },
    { word: 'هيلكوبتر', emoji: '🚁', difficulty: 'hard' },
    { word: 'صاروخ', emoji: '🚀', difficulty: 'medium' },
  ],
  sports: [
    { word: 'كوره', emoji: '⚽', difficulty: 'easy' },
    { word: 'سلة', emoji: '🏀', difficulty: 'easy' },
    { word: 'تنس', emoji: '🎾', difficulty: 'easy' },
    { word: 'جولف', emoji: '⛳', difficulty: 'medium' },
    { word: 'سباحة', emoji: '🏊', difficulty: 'medium' },
    { word: 'بيسبول', emoji: '⚾', difficulty: 'medium' },
    { word: 'فوليبول', emoji: '🏐', difficulty: 'medium' },
    { word: 'هوكي', emoji: '🏒', difficulty: 'medium' },
    { word: 'ملاكمة', emoji: '🥊', difficulty: 'medium' },
    { word: 'دراجة', emoji: '🚴', difficulty: 'medium' },
  ],
  fantasy: [
    { word: 'تنين', emoji: '🐉', difficulty: 'medium' },
    { word: 'يونيكورن', emoji: '🦄', difficulty: 'hard' },
    { word: 'ساحر', emoji: '🧙', difficulty: 'medium' },
    { word: 'جنية', emoji: '🧚', difficulty: 'medium' },
    { word: 'شبح', emoji: '👻', difficulty: 'easy' },
    { word: 'مصاص دماء', emoji: '🧛', difficulty: 'hard' },
    { word: 'حورية بحر', emoji: '🧜', difficulty: 'hard' },
    { word: 'عنقاء', emoji: '🔥', difficulty: 'hard' },
    { word: 'عفريت', emoji: '👺', difficulty: 'hard' },
    { word: 'سحر', emoji: '✨', difficulty: 'medium' },
  ],
  technology: [
    { word: 'كمبيوتر', emoji: '💻', difficulty: 'medium' },
    { word: 'روبوت', emoji: '🤖', difficulty: 'medium' },
    { word: 'كاميرا', emoji: '📷', difficulty: 'easy' },
    { word: 'درون', emoji: '🚁', difficulty: 'medium' },
    { word: 'ساعة', emoji: '⌚', difficulty: 'easy' },
    { word: 'تلفزيون', emoji: '📺', difficulty: 'medium' },
    { word: 'سبيكر', emoji: '🔊', difficulty: 'medium' },
    { word: 'كيبورد', emoji: '⌨️', difficulty: 'medium' },
    { word: 'ماوس', emoji: '🖱️', difficulty: 'easy' },
    { word: 'برينتر', emoji: '🖨️', difficulty: 'medium' },
  ],
  space: [
    { word: 'كوكب', emoji: '🪐', difficulty: 'medium' },
    { word: 'رائد فضاء', emoji: '👨‍🚀', difficulty: 'hard' },
    { word: 'فضائي', emoji: '👽', difficulty: 'medium' },
    { word: 'قمر صناعي', emoji: '🛰️', difficulty: 'hard' },
    { word: 'مذنب', emoji: '☄️', difficulty: 'hard' },
    { word: 'كويكبات', emoji: '🌑', difficulty: 'hard' },
    { word: 'مجرة', emoji: '🌌', difficulty: 'hard' },
    { word: 'تلسكوب', emoji: '🔭', difficulty: 'hard' },
    { word: 'محلّق طائر', emoji: '🛸', difficulty: 'medium' },
    { word: 'فضاء', emoji: '🚀', difficulty: 'easy' },
  ],
}

// ── German Words ───────────────────────────────────────────────────
const de: CategoryWords = {
  animals: [
    { word: 'Katze', emoji: '🐱', difficulty: 'easy' },
    { word: 'Hund', emoji: '🐕', difficulty: 'easy' },
    { word: 'Elefant', emoji: '🐘', difficulty: 'medium' },
    { word: 'Giraffe', emoji: '🦒', difficulty: 'medium' },
    { word: 'Pinguin', emoji: '🐧', difficulty: 'medium' },
    { word: 'Löwe', emoji: '🦁', difficulty: 'easy' },
    { word: 'Schildkröte', emoji: '🐢', difficulty: 'hard' },
    { word: 'Hase', emoji: '🐰', difficulty: 'easy' },
    { word: 'Fisch', emoji: '🐟', difficulty: 'easy' },
    { word: 'Vogel', emoji: '🐦', difficulty: 'easy' },
  ],
  food: [
    { word: 'Pizza', emoji: '🍕', difficulty: 'easy' },
    { word: 'Burger', emoji: '🍔', difficulty: 'easy' },
    { word: 'Sushi', emoji: '🍣', difficulty: 'medium' },
    { word: 'Eiscreme', emoji: '🍦', difficulty: 'medium' },
    { word: 'Kuchen', emoji: '🎂', difficulty: 'easy' },
    { word: 'Apfel', emoji: '🍎', difficulty: 'easy' },
    { word: 'Banane', emoji: '🍌', difficulty: 'easy' },
    { word: 'Kaffee', emoji: '☕', difficulty: 'easy' },
    { word: 'Brot', emoji: '🍞', difficulty: 'easy' },
    { word: 'Brezn', emoji: '🥨', difficulty: 'medium' },
  ],
  nature: [
    { word: 'Baum', emoji: '🌳', difficulty: 'easy' },
    { word: 'Blume', emoji: '🌸', difficulty: 'easy' },
    { word: 'Berg', emoji: '⛰️', difficulty: 'easy' },
    { word: 'Fluss', emoji: '🏞️', difficulty: 'medium' },
    { word: 'Sonne', emoji: '☀️', difficulty: 'easy' },
    { word: 'Mond', emoji: '🌙', difficulty: 'easy' },
    { word: 'Stern', emoji: '⭐', difficulty: 'easy' },
    { word: 'Wolke', emoji: '☁️', difficulty: 'easy' },
    { word: 'Regen', emoji: '🌧️', difficulty: 'easy' },
    { word: 'Schnee', emoji: '❄️', difficulty: 'easy' },
  ],
  objects: [
    { word: 'Stuhl', emoji: '🪑', difficulty: 'easy' },
    { word: 'Tisch', emoji: '🪑', difficulty: 'easy' },
    { word: 'Lampe', emoji: '💡', difficulty: 'easy' },
    { word: 'Uhr', emoji: '🕐', difficulty: 'easy' },
    { word: 'Telefon', emoji: '📱', difficulty: 'medium' },
    { word: 'Buch', emoji: '📖', difficulty: 'easy' },
    { word: 'Schuh', emoji: '👟', difficulty: 'easy' },
    { word: 'Hut', emoji: '🎩', difficulty: 'easy' },
    { word: 'Schlüssel', emoji: '🔑', difficulty: 'medium' },
    { word: 'Tasche', emoji: '👜', difficulty: 'easy' },
  ],
  vehicles: [
    { word: 'Auto', emoji: '🚗', difficulty: 'easy' },
    { word: 'Fahrrad', emoji: '🚲', difficulty: 'easy' },
    { word: 'Flugzeug', emoji: '✈️', difficulty: 'medium' },
    { word: 'Boot', emoji: '⛵', difficulty: 'easy' },
    { word: 'Zug', emoji: '🚂', difficulty: 'easy' },
    { word: 'Bus', emoji: '🚌', difficulty: 'easy' },
    { word: 'Lastwagen', emoji: '🚛', difficulty: 'medium' },
    { word: 'Motorrad', emoji: '🏍️', difficulty: 'medium' },
    { word: 'Hubschrauber', emoji: '🚁', difficulty: 'hard' },
    { word: 'Rakete', emoji: '🚀', difficulty: 'medium' },
  ],
  sports: [
    { word: 'Fußball', emoji: '⚽', difficulty: 'easy' },
    { word: 'Basketball', emoji: '🏀', difficulty: 'medium' },
    { word: 'Tennis', emoji: '🎾', difficulty: 'easy' },
    { word: 'Golf', emoji: '⛳', difficulty: 'medium' },
    { word: 'Schwimmen', emoji: '🏊', difficulty: 'medium' },
    { word: 'Baseball', emoji: '⚾', difficulty: 'medium' },
    { word: 'Volleyball', emoji: '🏐', difficulty: 'medium' },
    { word: 'Eishockey', emoji: '🏒', difficulty: 'hard' },
    { word: 'Boxen', emoji: '🥊', difficulty: 'medium' },
    { word: 'Radfahren', emoji: '🚴', difficulty: 'medium' },
  ],
  fantasy: [
    { word: 'Drache', emoji: '🐉', difficulty: 'medium' },
    { word: 'Einhorn', emoji: '🦄', difficulty: 'medium' },
    { word: 'Zauberer', emoji: '🧙', difficulty: 'medium' },
    { word: 'Fee', emoji: '🧚', difficulty: 'easy' },
    { word: 'Geist', emoji: '👻', difficulty: 'easy' },
    { word: 'Vampir', emoji: '🧛', difficulty: 'medium' },
    { word: 'Meerjungfrau', emoji: '🧜', difficulty: 'hard' },
    { word: 'Phönix', emoji: '🔥', difficulty: 'hard' },
    { word: 'Goblin', emoji: '👺', difficulty: 'hard' },
    { word: 'Magie', emoji: '✨', difficulty: 'medium' },
  ],
  technology: [
    { word: 'Computer', emoji: '💻', difficulty: 'medium' },
    { word: 'Roboter', emoji: '🤖', difficulty: 'medium' },
    { word: 'Kamera', emoji: '📷', difficulty: 'easy' },
    { word: 'Drohne', emoji: '🚁', difficulty: 'medium' },
    { word: 'Uhr', emoji: '⌚', difficulty: 'easy' },
    { word: 'Fernseher', emoji: '📺', difficulty: 'medium' },
    { word: 'Lautsprecher', emoji: '🔊', difficulty: 'hard' },
    { word: 'Tastatur', emoji: '⌨️', difficulty: 'medium' },
    { word: 'Maus', emoji: '🖱️', difficulty: 'easy' },
    { word: 'Drucker', emoji: '🖨️', difficulty: 'medium' },
  ],
  space: [
    { word: 'Planet', emoji: '🪐', difficulty: 'medium' },
    { word: 'Astronaut', emoji: '👨‍🚀', difficulty: 'hard' },
    { word: 'Außerirdischer', emoji: '👽', difficulty: 'hard' },
    { word: 'Satellit', emoji: '🛰️', difficulty: 'hard' },
    { word: 'Komet', emoji: '☄️', difficulty: 'hard' },
    { word: 'Asteroid', emoji: '🌑', difficulty: 'hard' },
    { word: 'Galaxie', emoji: '🌌', difficulty: 'hard' },
    { word: 'Teleskop', emoji: '🔭', difficulty: 'hard' },
    { word: 'UFO', emoji: '🛸', difficulty: 'medium' },
    { word: 'Weltraum', emoji: '🚀', difficulty: 'medium' },
  ],
}

// ── Export ──────────────────────────────────────────────────────────

const wordLists: Record<Lang, CategoryWords> = { en, ar, de }

export function getWordList(lang: Lang): CategoryWords {
  return wordLists[lang] || wordLists.en
}

export function getRandomWordFromList(lang: Lang, category: string): WordEntry | null {
  const list = getWordList(lang)
  const words = list[category]
  if (!words || words.length === 0) return null
  return words[Math.floor(Math.random() * words.length)]
}

export function getAllCategories(lang: Lang): string[] {
  return Object.keys(getWordList(lang))
}