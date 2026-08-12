package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ai.AiFailure
import com.example.ai.AiOutcome
import com.example.ai.GeminiTutorService
import com.example.ai.WritingEvaluationResult
import com.example.audio.TtsManager
import com.example.data.db.AppDatabase
import com.example.data.model.*
import com.example.data.repository.LinguaVerseRepository
import com.example.domain.AnswerGrader
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    val repository = LinguaVerseRepository(db.linguaVerseDao())
    val ttsManager = TtsManager(application)

    // User Profile State
    val userProfile: StateFlow<UserProfile> = repository.userProfile
        .filterNotNull()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserProfile()
        )

    // Languages State
    val languages: StateFlow<List<Language>> = repository.allLanguages
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Current Target Language
    val targetLanguageCode: StateFlow<String> = userProfile
        .map { it.targetLanguageCode }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = "es"
        )

    // Lessons for current target language
    val currentLessons: StateFlow<List<Lesson>> = targetLanguageCode
        .flatMapLatest { langCode -> repository.getLessonsByLanguage(langCode) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Vocabulary for current target language
    val vocabularies: StateFlow<List<Vocabulary>> = targetLanguageCode
        .flatMapLatest { langCode -> repository.getVocabularies(langCode) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Grammar Rules
    val grammarRules: StateFlow<List<GrammarRule>> = targetLanguageCode
        .flatMapLatest { langCode -> repository.getGrammarRules(langCode) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Flashcards
    val flashcards: StateFlow<List<Flashcard>> = targetLanguageCode
        .flatMapLatest { langCode -> repository.getFlashcards(langCode) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Achievements
    val achievements: StateFlow<List<Achievement>> = repository.achievements
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Chat Messages
    val chatMessages: StateFlow<List<ChatMessage>> = repository.chatMessages
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Active Lesson Execution State
    private val _activeLesson = MutableStateFlow<Lesson?>(null)
    val activeLesson: StateFlow<Lesson?> = _activeLesson.asStateFlow()

    private val _activeExercises = MutableStateFlow<List<Exercise>>(emptyList())
    val activeExercises: StateFlow<List<Exercise>> = _activeExercises.asStateFlow()

    private val _currentExerciseIndex = MutableStateFlow(0)
    val currentExerciseIndex: StateFlow<Int> = _currentExerciseIndex.asStateFlow()

    private val _lessonCompleted = MutableStateFlow(false)
    val lessonCompleted: StateFlow<Boolean> = _lessonCompleted.asStateFlow()

    // AI Chatting Loading state
    private val _isAiChatLoading = MutableStateFlow(false)
    val isAiChatLoading: StateFlow<Boolean> = _isAiChatLoading.asStateFlow()

    /** Non-null when the last AI tutor request failed. Cleared on the next attempt. */
    private val _aiChatError = MutableStateFlow<AiFailure?>(null)
    val aiChatError: StateFlow<AiFailure?> = _aiChatError.asStateFlow()

    // Writing Evaluation State
    private val _writingEvaluation = MutableStateFlow<WritingEvaluationResult?>(null)
    val writingEvaluation: StateFlow<WritingEvaluationResult?> = _writingEvaluation.asStateFlow()

    private val _isEvaluatingWriting = MutableStateFlow(false)
    val isEvaluatingWriting: StateFlow<Boolean> = _isEvaluatingWriting.asStateFlow()

    /** Non-null when the last writing evaluation failed. Cleared on the next attempt. */
    private val _writingEvaluationError = MutableStateFlow<AiFailure?>(null)
    val writingEvaluationError: StateFlow<AiFailure?> = _writingEvaluationError.asStateFlow()

    // Audio Speed Preference
    private val _audioSpeed = MutableStateFlow(1.0f)
    val audioSpeed: StateFlow<Float> = _audioSpeed.asStateFlow()

    // Dark Theme Preference
    private val _isDarkTheme = MutableStateFlow(false)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeSeedData()
        }
    }

    fun setTargetLanguage(langCode: String) {
        viewModelScope.launch {
            repository.updateTargetLanguage(langCode)
        }
    }

    fun startLesson(lesson: Lesson) {
        viewModelScope.launch {
            _activeLesson.value = lesson
            val exercises = repository.getExercisesForLesson(lesson.id)
            _activeExercises.value = exercises
            _currentExerciseIndex.value = 0
            _lessonCompleted.value = false
        }
    }

    fun submitExerciseAnswer(userAnswer: String): Boolean {
        val exercise = _activeExercises.value.getOrNull(_currentExerciseIndex.value) ?: return false
        return AnswerGrader.isCorrect(exercise, userAnswer)
    }

    /** Leaves lesson mode and returns to the tab that was showing before. */
    fun closeLesson() {
        _activeLesson.value = null
        _activeExercises.value = emptyList()
        _currentExerciseIndex.value = 0
        _lessonCompleted.value = false
    }

    fun nextExercise() {
        val exercises = _activeExercises.value
        val currentIndex = _currentExerciseIndex.value
        if (currentIndex < exercises.size - 1) {
            _currentExerciseIndex.value = currentIndex + 1
        } else {
            // Lesson completed!
            _lessonCompleted.value = true
            val lesson = _activeLesson.value
            if (lesson != null) {
                viewModelScope.launch {
                    repository.completeLesson(lesson.id, lesson.xpReward)
                }
            }
        }
    }

    fun speakText(text: String) {
        ttsManager.speak(text, targetLanguageCode.value, _audioSpeed.value)
    }

    fun setAudioSpeed(speed: Float) {
        _audioSpeed.value = speed
    }

    fun toggleDarkTheme() {
        _isDarkTheme.value = !_isDarkTheme.value
    }

    fun sendAiChatMessage(userText: String) {
        if (userText.isBlank()) return

        viewModelScope.launch {
            _isAiChatLoading.value = true
            _aiChatError.value = null
            val profile = userProfile.value

            when (
                val outcome = GeminiTutorService.chatWithAiTeacher(
                    userMessage = userText,
                    targetLanguage = profile.targetLanguageCode,
                    cefrLevel = profile.currentLevel,
                    chatHistory = chatMessages.value
                )
            ) {
                // Only a real answer is persisted. A failed request must not leave
                // an invented tutor message in the user's chat history.
                is AiOutcome.Success -> repository.sendChatMessage(userText, outcome.value)
                is AiOutcome.Failure -> _aiChatError.value = outcome.reason
            }
            _isAiChatLoading.value = false
        }
    }

    fun evaluateWritingSubmission(userText: String, prompt: String) {
        if (userText.isBlank()) return

        viewModelScope.launch {
            _isEvaluatingWriting.value = true
            _writingEvaluationError.value = null
            _writingEvaluation.value = null

            when (
                val outcome = GeminiTutorService.evaluateWriting(
                    userText = userText,
                    prompt = prompt,
                    targetLanguage = targetLanguageCode.value
                )
            ) {
                is AiOutcome.Success -> _writingEvaluation.value = outcome.value
                is AiOutcome.Failure -> _writingEvaluationError.value = outcome.reason
            }
            _isEvaluatingWriting.value = false
        }
    }

    fun toggleFavoriteVocabulary(vocabulary: Vocabulary) {
        viewModelScope.launch {
            repository.toggleFavoriteVocab(vocabulary)
        }
    }

    // Admin Operations
    fun addNewLanguage(code: String, name: String, nativeName: String, flag: String, description: String) {
        viewModelScope.launch {
            val lang = Language(code, name, nativeName, flag, isDefault = false, totalLessonsCount = 10, description = description)
            repository.addCustomLanguage(lang)
        }
    }

    fun addNewLesson(title: String, category: String, level: CefrLevel, xpReward: Int, promptText: String, answerText: String) {
        viewModelScope.launch {
            val langCode = targetLanguageCode.value
            val lessonId = "les_${langCode}_${System.currentTimeMillis()}"
            val lesson = Lesson(
                id = lessonId,
                languageCode = langCode,
                level = level,
                title = title,
                description = "Custom lesson created via Admin Panel",
                category = category,
                xpReward = xpReward,
                isCompleted = false,
                isLocked = false,
                orderIndex = (currentLessons.value.size + 1)
            )

            val exercise = Exercise(
                id = "ex_${lessonId}_1",
                lessonId = lessonId,
                type = ExerciseType.VOCABULARY,
                prompt = promptText,
                targetText = answerText,
                correctAnswer = answerText,
                explanation = "Custom exercise created by administrator."
            )

            repository.addCustomLesson(lesson, listOf(exercise))
        }
    }

    fun addNewVocabulary(word: String, translation: String, example: String, category: String) {
        viewModelScope.launch {
            val langCode = targetLanguageCode.value
            val vocab = Vocabulary(
                id = "v_${System.currentTimeMillis()}",
                languageCode = langCode,
                word = word,
                translation = translation,
                exampleSentence = example,
                exampleTranslation = "Example translation",
                category = category
            )
            repository.addCustomVocabulary(vocab)
        }
    }

    override fun onCleared() {
        super.onCleared()
        ttsManager.shutdown()
    }
}
