package com.example.data.repository

import com.example.ai.AiTeacherReply
import com.example.data.db.LinguaVerseDao
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull

class LinguaVerseRepository(private val dao: LinguaVerseDao) {

    val allLanguages: Flow<List<Language>> = dao.getAllLanguages()
    val userProfile: Flow<UserProfile?> = dao.getUserProfile()
    val achievements: Flow<List<Achievement>> = dao.getAllAchievements()
    val chatMessages: Flow<List<ChatMessage>> = dao.getChatMessages()

    fun getLessonsByLanguage(langCode: String): Flow<List<Lesson>> = dao.getLessonsByLanguage(langCode)
    fun getVocabularies(langCode: String): Flow<List<Vocabulary>> = dao.getVocabularies(langCode)
    fun getFavoriteVocabularies(langCode: String): Flow<List<Vocabulary>> = dao.getFavoriteVocabularies(langCode)
    fun getGrammarRules(langCode: String): Flow<List<GrammarRule>> = dao.getGrammarRules(langCode)
    fun getFlashcards(langCode: String): Flow<List<Flashcard>> = dao.getFlashcards(langCode)

    suspend fun getExercisesForLesson(lessonId: String): List<Exercise> = dao.getExercisesForLesson(lessonId)

    suspend fun initializeSeedData() {
        // Seed languages if empty
        val existingLanguages = allLanguages.firstOrNull() ?: emptyList()
        if (existingLanguages.isEmpty()) {
            val defaultLanguages = listOf(
                Language("es", "Spanish", "Español", "🇪🇸", true, 36, "Master Spanish with conversational fluency"),
                Language("en", "English", "English", "🇺🇸", true, 48, "Global English communication"),
                Language("fr", "French", "Français", "🇫🇷", true, 32, "Elegant French grammar & culture"),
                Language("de", "German", "Deutsch", "🇩🇪", true, 30, "Structured German vocabulary & cases"),
                Language("ar", "Arabic", "العربية", "🇸🇦", true, 28, "Modern Standard Arabic & phonetics"),
                Language("tr", "Turkish", "Türkçe", "🇹🇷", true, 24, "Turkish vowel harmony & phrases"),
                Language("it", "Italian", "Italiano", "🇮🇹", true, 28, "Expressive Italian conversation"),
                Language("pt", "Portuguese", "Português", "🇧🇷", true, 26, "Brazilian & European Portuguese"),
                Language("ru", "Russian", "Русский", "🇷🇺", true, 24, "Cyrillic alphabet & grammar cases"),
                Language("ja", "Japanese", "日本語", "🇯🇵", true, 30, "Hiragana, Katakana, Kanji & conversation"),
                Language("ko", "Korean", "한국어", "🇰🇷", true, 28, "Hangul script & daily dialogue"),
                Language("zh", "Chinese", "中文", "🇨🇳", true, 30, "Mandarin Pinyin, Tones & Characters")
            )
            dao.insertLanguages(defaultLanguages)
        }

        // Seed profile if empty
        val existingProfile = userProfile.firstOrNull()
        if (existingProfile == null) {
            dao.insertOrUpdateProfile(
                UserProfile(
                    id = "user_default",
                    username = "Alex Learner",
                    nativeLanguageCode = "en",
                    targetLanguageCode = "es",
                    xp = 480,
                    coins = 150,
                    streakCount = 7,
                    currentLevel = CefrLevel.A1,
                    todayXp = 35
                )
            )
        }

        // Seed sample lessons for Spanish
        seedSpanishContent()

        // Seed achievements if empty
        val existingAchievements = achievements.firstOrNull() ?: emptyList()
        if (existingAchievements.isEmpty()) {
            val defaultAchievements = listOf(
                Achievement("ach_1", "First Steps", "Complete your first lesson", "school", true, 1, 1, 50),
                Achievement("ach_2", "On Fire!", "Maintain a 7-day learning streak", "local_fire_department", true, 7, 7, 100),
                Achievement("ach_3", "Vocab Master", "Learn 50 new words", "book", false, 32, 50, 150),
                Achievement("ach_4", "Polyglot", "Practice 3 different languages", "public", false, 1, 3, 200),
                Achievement("ach_5", "AI Conversationalist", "Have 10 chats with AI Teacher", "smart_toy", false, 4, 10, 200)
            )
            dao.insertAchievements(defaultAchievements)
        }
    }

    private suspend fun seedSpanishContent() {
        val lessons = listOf(
            Lesson("les_es_1", "es", CefrLevel.A1, "Greetings & Basics", "Learn essential greetings and introductions", "Vocabulary", 20, isCompleted = true, isLocked = false, orderIndex = 1),
            Lesson("les_es_2", "es", CefrLevel.A1, "Ordering Food & Drinks", "Café vocabulary and polite requests", "Conversation", 25, isCompleted = true, isLocked = false, orderIndex = 2),
            Lesson("les_es_3", "es", CefrLevel.A1, "Numbers & Prices", "Count 1 to 100 and ask 'How much?'", "Grammar", 25, isCompleted = false, isLocked = false, orderIndex = 3),
            Lesson("les_es_4", "es", CefrLevel.A2, "Daily Routines", "Present tense verbs and daily schedules", "Writing", 30, isCompleted = false, isLocked = false, orderIndex = 4),
            Lesson("les_es_5", "es", CefrLevel.B1, "Travel & Directions", "Navigating cities, transit, and asking directions", "Listening", 35, isCompleted = false, isLocked = true, orderIndex = 5),
            Lesson("les_es_6", "es", CefrLevel.B2, "Opinion & Debate", "Expressing agreements, nuances, and arguments", "Speaking", 40, isCompleted = false, isLocked = true, orderIndex = 6)
        )
        dao.insertLessons(lessons)

        // Exercises for Lesson 3
        val exercisesLesson3 = listOf(
            Exercise(
                id = "ex_es_3_1",
                lessonId = "les_es_3",
                type = ExerciseType.VOCABULARY,
                prompt = "Select the correct translation for 'How much is it?'",
                targetText = "¿Cuánto cuesta?",
                translation = "How much is it?",
                optionsJson = "[\"¿Cuánto cuesta?\", \"¿Cómo estás?\", \"¿Dónde está?\", \"¿Qué hora es?\"]",
                correctAnswer = "¿Cuánto cuesta?",
                phoneticText = "kwan-to kwes-ta",
                explanation = "'¿Cuánto cuesta?' is used when asking the price of an item."
            ),
            Exercise(
                id = "ex_es_3_2",
                lessonId = "les_es_3",
                type = ExerciseType.LISTENING,
                prompt = "Listen to the audio and select what you hear:",
                targetText = "Son veinte euros, por favor.",
                translation = "It is twenty euros, please.",
                optionsJson = "[\"Son veinte euros, por favor.\", \"Son diez euros, por favor.\", \"Son cincuenta euros, por favor.\", \"Son cinco euros, por favor.\"]",
                correctAnswer = "Son veinte euros, por favor.",
                explanation = "'Veinte' means 20 in Spanish."
            ),
            Exercise(
                id = "ex_es_3_3",
                lessonId = "les_es_3",
                type = ExerciseType.SPEAKING,
                prompt = "Speak this sentence out loud:",
                targetText = "Me gustaría la cuenta, por favor.",
                translation = "I would like the check, please.",
                phoneticText = "meh goos-ta-ree-ah lah kwen-tah por fah-bor",
                explanation = "Focus on rolling the 'r' gently in 'por favor'."
            ),
            Exercise(
                id = "ex_es_3_4",
                lessonId = "les_es_3",
                type = ExerciseType.WRITING,
                prompt = "Type in Spanish: 'The bill, please.'",
                targetText = "La cuenta, por favor.",
                translation = "The bill, please.",
                correctAnswer = "La cuenta, por favor.",
                explanation = "Use 'por favor' for polite requests."
            ),
            Exercise(
                id = "ex_es_3_5",
                lessonId = "les_es_3",
                type = ExerciseType.QUIZ,
                prompt = "Match the number: 50 -> ?",
                targetText = "Cincuenta",
                translation = "Fifty",
                optionsJson = "[\"Cincuenta\", \"Treinta\", \"Cuarenta\", \"Sesenta\"]",
                correctAnswer = "Cincuenta",
                explanation = "Cincuenta is 50, Treinta is 30, Cuarenta is 40."
            )
        )
        dao.insertExercises(exercisesLesson3)

        // Seed Vocabulary
        val vocabs = listOf(
            Vocabulary("v_1", "es", "Hola", "Hello", "Hola, ¿cómo estás?", "Hello, how are you?", "oh-lah", "Greetings", true),
            Vocabulary("v_2", "es", "Gracias", "Thank you", "Muchas gracias por tu ayuda.", "Thank you very much for your help.", "grah-syahs", "Common", true),
            Vocabulary("v_3", "es", "Por favor", "Please", "Un café, por favor.", "A coffee, please.", "por fah-bor", "Common", false),
            Vocabulary("v_4", "es", "Amigo", "Friend", "Él es mi mejor amigo.", "He is my best friend.", "ah-mee-goh", "People", false),
            Vocabulary("v_5", "es", "Comida", "Food", "La comida mexicana es deliciosa.", "Mexican food is delicious.", "koh-mee-dah", "Food", true),
            Vocabulary("v_6", "es", "Agua", "Water", "Quiero un vaso de agua.", "I want a glass of water.", "ah-gwah", "Food", false)
        )
        dao.insertVocabularies(vocabs)

        // Seed Grammar Rules
        val grammar = listOf(
            GrammarRule("g_1", "es", CefrLevel.A1, "Nouns & Gender", "Nouns in Spanish are masculine or feminine.", "Nouns ending in -o are typically masculine (el libro), while those ending in -a are feminine (la mesa).", "El libro es grande.", "The book is big."),
            GrammarRule("g_2", "es", CefrLevel.A1, "Present Tense Regular Verbs", "Conjugate -ar, -er, -ir verbs in present tense.", "For -ar verbs like hablar: yo hablo, tú hablas, él habla, nosotros hablamos, ellos hablan.", "Yo hablo español.", "I speak Spanish."),
            GrammarRule("g_3", "es", CefrLevel.A2, "Ser vs Estar", "Two ways to say 'To Be' in Spanish.", "'Ser' is used for permanent characteristics, origin, and identity. 'Estar' is used for temporary states, emotions, and locations.", "Ella está feliz hoy.", "She is happy today.")
        )
        dao.insertGrammarRules(grammar)

        // Seed Flashcards
        val flashcards = listOf(
            Flashcard("fc_1", "es", "El mercado", "The market", "Voy al mercado por la mañana.", "el mair-kah-doh"),
            Flashcard("fc_2", "es", "La biblioteca", "The library", "Estudio en la biblioteca.", "lah bee-blee-oh-teh-kah"),
            Flashcard("fc_3", "es", "Hermoso", "Beautiful", "El lugar es muy hermoso.", "air-moh-soh"),
            Flashcard("fc_4", "es", "Entender", "To understand", "No entiendo la pregunta.", "en-ten-dair")
        )
        dao.insertFlashcards(flashcards)
    }

    suspend fun completeLesson(lessonId: String, xpEarned: Int) {
        val lesson = dao.getLessonById(lessonId) ?: return
        val updatedLesson = lesson.copy(isCompleted = true)
        dao.updateLesson(updatedLesson)

        val profile = userProfile.firstOrNull() ?: return
        val newXp = profile.xp + xpEarned
        val newTodayXp = profile.todayXp + xpEarned
        val newCompletedCount = profile.totalCompletedLessons + 1
        val newCoins = profile.coins + (xpEarned / 2)

        dao.updateProfile(
            profile.copy(
                xp = newXp,
                todayXp = newTodayXp,
                totalCompletedLessons = newCompletedCount,
                coins = newCoins
            )
        )
    }

    suspend fun updateTargetLanguage(langCode: String) {
        val profile = userProfile.firstOrNull() ?: return
        dao.updateProfile(profile.copy(targetLanguageCode = langCode))
    }

    suspend fun toggleFavoriteVocab(vocabulary: Vocabulary) {
        dao.updateVocabulary(vocabulary.copy(isFavorite = !vocabulary.isFavorite))
    }

    suspend fun addCustomLanguage(language: Language) {
        dao.insertLanguage(language)
    }

    suspend fun addCustomLesson(lesson: Lesson, exercises: List<Exercise>) {
        dao.insertLesson(lesson)
        dao.insertExercises(exercises)
    }

    suspend fun addCustomVocabulary(vocabulary: Vocabulary) {
        dao.insertVocabulary(vocabulary)
    }

    suspend fun addCustomGrammarRule(rule: GrammarRule) {
        dao.insertGrammarRule(rule)
    }

    suspend fun sendChatMessage(userText: String, aiReply: AiTeacherReply) {
        dao.insertChatMessage(
            ChatMessage(sender = "user", text = userText)
        )
        dao.insertChatMessage(
            ChatMessage(
                sender = "ai",
                text = aiReply.replyText,
                correction = aiReply.correction,
                suggestion = aiReply.suggestion,
                grammarExplanation = aiReply.grammarExplanation
            )
        )
    }
}
