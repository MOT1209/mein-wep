package com.example.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

enum class CefrLevel(val code: String, val title: String, val description: String) {
    A1("A1", "Beginner", "Basic phrases & simple interactions"),
    A2("A2", "Elementary", "Routine tasks & direct information"),
    B1("B1", "Intermediate", "Main points on familiar topics"),
    B2("B2", "Upper-Intermediate", "Complex topics & fluent interaction"),
    C1("C1", "Advanced", "Express ideas fluently & spontaneously"),
    C2("C2", "Mastery", "Understand with ease & native nuance")
}

enum class SkillType(val id: String, val displayName: String, val iconName: String) {
    LISTENING("listening", "Listening", "hearing"),
    SPEAKING("speaking", "Speaking", "mic"),
    READING("reading", "Reading", "book"),
    WRITING("writing", "Writing", "edit"),
    VOCABULARY("vocabulary", "Vocabulary", "translate"),
    GRAMMAR("grammar", "Grammar", "rule"),
    PRONUNCIATION("pronunciation", "Pronunciation", "record_voice_over"),
    CONVERSATION("conversation", "Conversation", "forum"),
    TRANSLATION("translation", "Translation", "swap_horiz"),
    DAILY_PHRASES("daily_phrases", "Daily Phrases", "chat_bubble_outline"),
    QUIZZES("quizzes", "Quizzes", "quiz"),
    REVIEW("review", "Review", "replay"),
    AI_CHAT("ai_chat", "AI Chat", "smart_toy"),
    FLASHCARDS("flashcards", "Flashcards", "style")
}

enum class ExerciseType {
    VOCABULARY,
    GRAMMAR,
    LISTENING,
    READING,
    WRITING,
    SPEAKING,
    CONVERSATION,
    QUIZ,
    FLASHCARD
}

@Entity(tableName = "languages")
data class Language(
    @PrimaryKey val code: String,
    val name: String,
    val nativeName: String,
    val flagEmoji: String,
    val isDefault: Boolean = true,
    val totalLessonsCount: Int = 24,
    val description: String = ""
)

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: String = "user_default",
    val username: String = "Alex Learner",
    val avatarUri: String = "",
    val nativeLanguageCode: String = "en",
    val targetLanguageCode: String = "es",
    val xp: Int = 450,
    val coins: Int = 120,
    val streakCount: Int = 5,
    val lastActiveDate: String = "",
    val currentLevel: CefrLevel = CefrLevel.A1,
    val speakingScore: Int = 78,
    val listeningScore: Int = 85,
    val grammarScore: Int = 72,
    val vocabularyScore: Int = 90,
    val readingScore: Int = 88,
    val writingScore: Int = 75,
    val totalCompletedLessons: Int = 8,
    val dailyGoalXp: Int = 50,
    val todayXp: Int = 30
)

@Entity(
    tableName = "lessons",
    indices = [Index("languageCode"), Index("languageCode", "orderIndex")]
)
data class Lesson(
    @PrimaryKey val id: String,
    val languageCode: String,
    val level: CefrLevel,
    val title: String,
    val description: String,
    val category: String,
    val xpReward: Int = 20,
    val isCompleted: Boolean = false,
    val isLocked: Boolean = false,
    val orderIndex: Int = 0
)

@Entity(
    tableName = "exercises",
    indices = [Index("lessonId")]
)
data class Exercise(
    @PrimaryKey val id: String,
    val lessonId: String,
    val type: ExerciseType,
    val prompt: String,
    val targetText: String = "",
    val translation: String = "",
    val optionsJson: String = "[]", // List of String
    val correctAnswer: String = "",
    val audioUrl: String = "",
    val phoneticText: String = "",
    val explanation: String = "",
    val passageText: String = "",
    val imageResName: String = ""
)

@Entity(
    tableName = "vocabularies",
    indices = [Index("languageCode"), Index("languageCode", "isFavorite")]
)
data class Vocabulary(
    @PrimaryKey val id: String,
    val languageCode: String,
    val word: String,
    val translation: String,
    val exampleSentence: String,
    val exampleTranslation: String,
    val phonetic: String = "",
    val category: String = "General",
    val isFavorite: Boolean = false,
    val needsReview: Boolean = false
)

@Entity(
    tableName = "grammar_rules",
    indices = [Index("languageCode")]
)
data class GrammarRule(
    @PrimaryKey val id: String,
    val languageCode: String,
    val level: CefrLevel,
    val title: String,
    val summary: String,
    val fullRuleText: String,
    val exampleSentence: String,
    val exampleTranslation: String
)

@Entity(
    tableName = "flashcards",
    indices = [Index("languageCode")]
)
data class Flashcard(
    @PrimaryKey val id: String,
    val languageCode: String,
    val frontWord: String,
    val backTranslation: String,
    val exampleSentence: String,
    val phonetic: String = "",
    val intervalDays: Int = 1,
    val isMastered: Boolean = false
)

@Entity(tableName = "achievements")
data class Achievement(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val iconName: String,
    val isUnlocked: Boolean = false,
    val progress: Int = 0,
    val maxProgress: Int = 100,
    val rewardXp: Int = 50
)

@Entity(
    tableName = "chat_messages",
    indices = [Index("timestamp")]
)
data class ChatMessage(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sender: String, // "user" or "ai"
    val text: String,
    val correction: String? = null,
    val suggestion: String? = null,
    val grammarExplanation: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

data class ReadingStory(
    val id: String,
    val title: String,
    val level: CefrLevel,
    val content: String,
    val translation: String,
    val vocabularyMap: Map<String, String> // word -> definition
)

data class LeaderboardEntry(
    val rank: Int,
    val username: String,
    val avatarEmoji: String,
    val xp: Int,
    val isCurrentUser: Boolean = false,
    val badge: String = "Bronze"
)

// Converters for Room
class Converters {
    private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
    private val stringListAdapter = moshi.adapter<List<String>>(
        Types.newParameterizedType(List::class.java, String::class.java)
    )

    @TypeConverter
    fun fromCefrLevel(level: CefrLevel): String = level.name

    @TypeConverter
    fun toCefrLevel(name: String): CefrLevel = try {
        CefrLevel.valueOf(name)
    } catch (e: Exception) {
        CefrLevel.A1
    }

    @TypeConverter
    fun fromExerciseType(type: ExerciseType): String = type.name

    @TypeConverter
    fun toExerciseType(name: String): ExerciseType = try {
        ExerciseType.valueOf(name)
    } catch (e: Exception) {
        ExerciseType.VOCABULARY
    }

    @TypeConverter
    fun fromStringList(list: List<String>): String = stringListAdapter.toJson(list)

    @TypeConverter
    fun toStringList(json: String): List<String> = try {
        stringListAdapter.fromJson(json) ?: emptyList()
    } catch (e: Exception) {
        emptyList()
    }
}
