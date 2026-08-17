import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // 1. CEFR Levels (static reference data)
  // ============================================================
  const levels = await Promise.all([
    prisma.cefrLevel.upsert({
      where: { code: 'A1' },
      update: {},
      create: { code: 'A1', sortOrder: 1, title: 'Beginner', description: 'Can understand and use familiar everyday expressions' },
    }),
    prisma.cefrLevel.upsert({
      where: { code: 'A2' },
      update: {},
      create: { code: 'A2', sortOrder: 2, title: 'Elementary', description: 'Can understand sentences on familiar topics' },
    }),
    prisma.cefrLevel.upsert({
      where: { code: 'B1' },
      update: {},
      create: { code: 'B1', sortOrder: 3, title: 'Intermediate', description: 'Can deal with most travel situations' },
    }),
    prisma.cefrLevel.upsert({
      where: { code: 'B2' },
      update: {},
      create: { code: 'B2', sortOrder: 4, title: 'Upper Intermediate', description: 'Can interact with fluency and spontaneity' },
    }),
    prisma.cefrLevel.upsert({
      where: { code: 'C1' },
      update: {},
      create: { code: 'C1', sortOrder: 5, title: 'Advanced', description: 'Can use language flexibly for social and professional purposes' },
    }),
    prisma.cefrLevel.upsert({
      where: { code: 'C2' },
      update: {},
      create: { code: 'C2', sortOrder: 6, title: 'Mastery', description: 'Can understand virtually everything heard or read' },
    }),
  ]);
  console.log('✅ CEFR levels seeded');

  // ============================================================
  // 2. Languages
  // ============================================================
  const arabic = await prisma.language.upsert({
    where: { code: 'ar' },
    update: {},
    create: {
      code: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'RTL',
      status: 'active',
      flagEmoji: '🇸🇦',
      totalLevels: 6,
    },
  });

  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'LTR',
      status: 'active',
      flagEmoji: '🇬🇧',
      totalLevels: 6,
    },
  });

  const spanish = await prisma.language.upsert({
    where: { code: 'es' },
    update: {},
    create: {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'LTR',
      status: 'active',
      flagEmoji: '🇪🇸',
      totalLevels: 6,
    },
  });
  console.log('✅ Languages seeded: Arabic, English, Spanish');

  // ============================================================
  // 3. Units for Arabic A1
  // ============================================================
  const arA1U1 = await prisma.unit.create({
    data: {
      languageId: arabic.id,
      levelId: levels[0].id,
      code: 'U1',
      title: 'Basic Greetings',
      description: 'Learn essential Arabic greetings and introductions',
      sortOrder: 1,
    },
  });

  const arA1U2 = await prisma.unit.create({
    data: {
      languageId: arabic.id,
      levelId: levels[0].id,
      code: 'U2',
      title: 'Numbers & Counting',
      description: 'Learn Arabic numbers from 1 to 100',
      sortOrder: 2,
    },
  });

  // ============================================================
  // 4. Lessons for Arabic A1 Unit 1
  // ============================================================
  const lesson1 = await prisma.lesson.create({
    data: {
      languageId: arabic.id,
      levelId: levels[0].id,
      unitId: arA1U1.id,
      title: 'Hello & Goodbye',
      description: 'Common Arabic greetings',
      category: 'Greetings',
      xpReward: 20,
      orderIndex: 1,
      isPublished: true,
      tags: ['greetings', 'basics'],
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      languageId: arabic.id,
      levelId: levels[0].id,
      unitId: arA1U1.id,
      title: 'Introducing Yourself',
      description: 'How to say your name and ask others',
      category: 'Greetings',
      xpReward: 25,
      orderIndex: 2,
      isPublished: true,
      tags: ['introduction', 'basics'],
    },
  });

  // ============================================================
  // 5. Exercises for Lesson 1
  // ============================================================
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson1.id,
        type: 'vocabulary',
        prompt: 'What does "مرحبا" mean?',
        targetText: 'مرحبا',
        correctAnswer: 'Hello',
        optionsJson: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        explanation: 'مرحبا (marhaba) means "Hello" in Arabic',
        sortOrder: 1,
        xpReward: 10,
        isPublished: true,
      },
      {
        lessonId: lesson1.id,
        type: 'vocabulary',
        prompt: 'How do you say "Goodbye" in Arabic?',
        targetText: 'مع السلامة',
        correctAnswer: 'مع السلامة',
        optionsJson: ['مرحبا', 'مع السلامة', 'شكرا', 'من فضلك'],
        explanation: 'مع السلامة (ma\'a as-salama) means "Goodbye"',
        sortOrder: 2,
        xpReward: 10,
        isPublished: true,
      },
      {
        lessonId: lesson1.id,
        type: 'listening',
        prompt: 'Listen and select the correct greeting',
        audioUrl: '',
        correctAnswer: 'السلام عليكم',
        optionsJson: ['مرحبا', 'السلام عليكم', 'صباح الخير', 'مساء الخير'],
        explanation: 'السلام عليكم is the formal Islamic greeting',
        sortOrder: 3,
        xpReward: 15,
        isPublished: true,
      },
      {
        lessonId: lesson1.id,
        type: 'writing',
        prompt: 'Write "Good morning" in Arabic',
        correctAnswer: 'صباح الخير',
        explanation: 'صباح الخير (sabah al-khayr) = Good morning',
        sortOrder: 4,
        xpReward: 15,
        isPublished: true,
      },
    ],
  });

  // ============================================================
  // 6. Exercises for Lesson 2
  // ============================================================
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: lesson2.id,
        type: 'vocabulary',
        prompt: 'How do you say "My name is..." in Arabic?',
        targetText: 'اسمي',
        correctAnswer: 'اسمي',
        optionsJson: ['اسمي', 'أنا', 'هل', 'كيف'],
        explanation: 'اسمI (ismi) = My name is',
        sortOrder: 1,
        xpReward: 10,
        isPublished: true,
      },
      {
        lessonId: lesson2.id,
        type: 'conversation',
        prompt: 'Complete the dialogue:\nA: ما اسمك؟ (What is your name?)\nB: ______',
        correctAnswer: 'اسمي أحمد',
        explanation: 'اسمي + your name = My name is...',
        sortOrder: 2,
        xpReward: 20,
        isPublished: true,
      },
    ],
  });

  // ============================================================
  // 7. Vocabulary for Arabic
  // ============================================================
  await prisma.vocabulary.createMany({
    data: [
      { languageId: arabic.id, word: 'مرحبا', translation: 'Hello', phonetic: 'marhaba', category: 'Greetings', exampleSentence: 'مرحبا، كيف حالك؟', exampleTranslation: 'Hello, how are you?' },
      { languageId: arabic.id, word: 'شكرا', translation: 'Thank you', phonetic: 'shukran', category: 'Courtesy', exampleSentence: 'شكرا جزيلا', exampleTranslation: 'Thank you very much' },
      { languageId: arabic.id, word: 'من فضلك', translation: 'Please', phonetic: 'min fadlak', category: 'Courtesy', exampleSentence: 'من فضلك، افتح الباب', exampleTranslation: 'Please, open the door' },
      { languageId: arabic.id, word: 'نعم', translation: 'Yes', phonetic: 'na\'am', category: 'Basics', exampleSentence: 'نعم، أنا جاهز', exampleTranslation: 'Yes, I am ready' },
      { languageId: arabic.id, word: 'لا', translation: 'No', phonetic: 'la', category: 'Basics', exampleSentence: 'لا، شكرا', exampleTranslation: 'No, thank you' },
      { languageId: arabic.id, word: 'صباح الخير', translation: 'Good morning', phonetic: 'sabah al-khayr', category: 'Greetings', exampleSentence: 'صباح الخير يا أستاذ', exampleTranslation: 'Good morning, teacher' },
      { languageId: arabic.id, word: 'مساء الخير', translation: 'Good evening', phonetic: 'masa al-khayr', category: 'Greetings', exampleSentence: 'مساء الخير، كيف حالك؟', exampleTranslation: 'Good evening, how are you?' },
      { languageId: arabic.id, word: 'مع السلامة', translation: 'Goodbye', phonetic: 'ma\'a as-salama', category: 'Greetings', exampleSentence: 'مع السلامة، إلى اللقاء', exampleTranslation: 'Goodbye, see you later' },
    ],
  });

  // ============================================================
  // 8. Flashcards for Arabic
  // ============================================================
  await prisma.flashcard.createMany({
    data: [
      { languageId: arabic.id, frontWord: 'مرحبا', backTranslation: 'Hello', phonetic: 'marhaba', exampleSentence: 'مرحبا بك في منزلي' },
      { languageId: arabic.id, frontWord: 'شكرا', backTranslation: 'Thank you', phonetic: 'shukran', exampleSentence: 'شكرا على مساعدتك' },
      { languageId: arabic.id, frontWord: 'من فضلك', backTranslation: 'Please', phonetic: 'min fadlak', exampleSentence: 'هل يمكنك مساعدتي من فضلك؟' },
    ],
  });

  // ============================================================
  // 9. Grammar Rules for Arabic A1
  // ============================================================
  await prisma.grammarRule.createMany({
    data: [
      {
        languageId: arabic.id,
        levelId: levels[0].id,
        title: 'Definite Article ال (Al)',
        summary: 'Arabic uses the prefix ال (al-) to make nouns definite',
        fullRuleText: 'In Arabic, the definite article is ال (al-). It is attached to the beginning of nouns. Example: كتاب (kitab) = a book → الكتاب (al-kitab) = the book.',
        exampleSentence: 'الكتاب جميل',
        exampleTranslation: 'The book is beautiful',
        category: 'Grammar Basics',
      },
      {
        languageId: arabic.id,
        levelId: levels[0].id,
        title: 'Personal Pronouns',
        summary: 'Arabic personal pronouns for subjects',
        fullRuleText: 'Arabic pronouns: أنا (ana) = I, أنت (anta) = you (m), أنتِ (anti) = you (f), هو (huwa) = he, هي (hiya) = she, نحن (nahnu) = we, أنتم (antum) = you (pl m), هم (hum) = they.',
        exampleSentence: 'أنا أدرس العربية',
        exampleTranslation: 'I study Arabic',
        category: 'Pronouns',
      },
    ],
  });

  // ============================================================
  // 10. Units for English A1
  // ============================================================
  const enA1U1 = await prisma.unit.create({
    data: {
      languageId: english.id,
      levelId: levels[0].id,
      code: 'U1',
      title: 'Introduction to English',
      description: 'Basic English greetings and introductions',
      sortOrder: 1,
    },
  });

  const enLesson1 = await prisma.lesson.create({
    data: {
      languageId: english.id,
      levelId: levels[0].id,
      unitId: enA1U1.id,
      title: 'Greetings in English',
      description: 'Common English greetings',
      category: 'Greetings',
      xpReward: 20,
      orderIndex: 1,
      isPublished: true,
      tags: ['greetings', 'basics'],
    },
  });

  await prisma.exercise.createMany({
    data: [
      {
        lessonId: enLesson1.id,
        type: 'vocabulary',
        prompt: 'What does "Hello" mean?',
        targetText: 'Hello',
        correctAnswer: 'مرحبا',
        optionsJson: ['مرحبا', 'وداعا', 'شكرا', 'من فضلك'],
        explanation: 'Hello is the most common English greeting',
        sortOrder: 1,
        xpReward: 10,
        isPublished: true,
      },
    ],
  });

  // ============================================================
  // 11. Units for Spanish A1
  // ============================================================
  const esA1U1 = await prisma.unit.create({
    data: {
      languageId: spanish.id,
      levelId: levels[0].id,
      code: 'U1',
      title: 'Hola, Español',
      description: 'Basic Spanish greetings',
      sortOrder: 1,
    },
  });

  const esLesson1 = await prisma.lesson.create({
    data: {
      languageId: spanish.id,
      levelId: levels[0].id,
      unitId: esA1U1.id,
      title: 'Saludos',
      description: 'Common Spanish greetings',
      category: 'Greetings',
      xpReward: 20,
      orderIndex: 1,
      isPublished: true,
      tags: ['greetings', 'basics'],
    },
  });

  await prisma.exercise.createMany({
    data: [
      {
        lessonId: esLesson1.id,
        type: 'vocabulary',
        prompt: 'What does "Hola" mean?',
        targetText: 'Hola',
        correctAnswer: 'Hello',
        optionsJson: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        explanation: 'Hola is the most common Spanish greeting',
        sortOrder: 1,
        xpReward: 10,
        isPublished: true,
      },
    ],
  });

  // ============================================================
  // 12. Achievements
  // ============================================================
  await prisma.achievement.createMany({
    data: [
      { title: 'First Steps', description: 'Complete your first lesson', iconName: 'star', rewardXp: 50, conditionType: 'lessons_completed', conditionValue: 1 },
      { title: 'Word Collector', description: 'Learn 10 vocabulary words', iconName: 'book', rewardXp: 100, conditionType: 'words_learned', conditionValue: 10 },
      { title: 'Streak Master', description: 'Maintain a 7-day streak', iconName: 'flame', rewardXp: 200, conditionType: 'streak', conditionValue: 7 },
      { title: 'Century Club', description: 'Earn 100 XP', iconName: 'trophy', rewardXp: 50, conditionType: 'xp_total', conditionValue: 100 },
      { title: 'Polyglot', description: 'Start learning 3 languages', iconName: 'globe', rewardXp: 300, conditionType: 'languages_started', conditionValue: 3 },
    ],
  });
  console.log('✅ Achievements seeded');

  // ============================================================
  // 13. Demo User
  // ============================================================
  const passwordHash = await bcrypt.hash('demo1234', 12);
  await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@linguaverse.com',
      passwordHash,
      xp: 450,
      coins: 120,
      streakCount: 5,
      dailyGoalXp: 50,
      todayXp: 30,
    },
  });
  console.log('✅ Demo user seeded (username: demo, password: demo1234)');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
