package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LinguaVerseDao {

    // Languages
    @Query("SELECT * FROM languages")
    fun getAllLanguages(): Flow<List<Language>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLanguages(languages: List<Language>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLanguage(language: Language)

    // User Profile
    @Query("SELECT * FROM user_profile WHERE id = 'user_default'")
    fun getUserProfile(): Flow<UserProfile?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProfile(profile: UserProfile)

    @Update
    suspend fun updateProfile(profile: UserProfile)

    // Lessons
    @Query("SELECT * FROM lessons WHERE languageCode = :langCode ORDER BY orderIndex ASC")
    fun getLessonsByLanguage(langCode: String): Flow<List<Lesson>>

    @Query("SELECT * FROM lessons WHERE id = :lessonId")
    suspend fun getLessonById(lessonId: String): Lesson?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLessons(lessons: List<Lesson>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLesson(lesson: Lesson)

    @Update
    suspend fun updateLesson(lesson: Lesson)

    // Exercises
    @Query("SELECT * FROM exercises WHERE lessonId = :lessonId")
    suspend fun getExercisesForLesson(lessonId: String): List<Exercise>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExercises(exercises: List<Exercise>)

    // Vocabulary
    @Query("SELECT * FROM vocabularies WHERE languageCode = :langCode")
    fun getVocabularies(langCode: String): Flow<List<Vocabulary>>

    @Query("SELECT * FROM vocabularies WHERE languageCode = :langCode AND isFavorite = 1")
    fun getFavoriteVocabularies(langCode: String): Flow<List<Vocabulary>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVocabularies(vocabularies: List<Vocabulary>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVocabulary(vocabulary: Vocabulary)

    @Update
    suspend fun updateVocabulary(vocabulary: Vocabulary)

    // Grammar
    @Query("SELECT * FROM grammar_rules WHERE languageCode = :langCode")
    fun getGrammarRules(langCode: String): Flow<List<GrammarRule>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGrammarRules(rules: List<GrammarRule>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGrammarRule(rule: GrammarRule)

    // Flashcards
    @Query("SELECT * FROM flashcards WHERE languageCode = :langCode")
    fun getFlashcards(langCode: String): Flow<List<Flashcard>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFlashcards(flashcards: List<Flashcard>)

    @Update
    suspend fun updateFlashcard(flashcard: Flashcard)

    // Achievements
    @Query("SELECT * FROM achievements")
    fun getAllAchievements(): Flow<List<Achievement>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAchievements(achievements: List<Achievement>)

    @Update
    suspend fun updateAchievement(achievement: Achievement)

    // Chat
    @Query("SELECT * FROM chat_messages ORDER BY timestamp ASC")
    fun getChatMessages(): Flow<List<ChatMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChatMessage(message: ChatMessage)

    @Query("DELETE FROM chat_messages")
    suspend fun clearChatMessages()
}
