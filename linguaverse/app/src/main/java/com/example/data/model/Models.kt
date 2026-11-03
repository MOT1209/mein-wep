package com.example.data.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

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
    val optionsJson: String = "[]",
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
    val sender: String,
    val text: String,
    val correction: String? = null,
    val suggestion: String? = null,
    val grammarExplanation: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
