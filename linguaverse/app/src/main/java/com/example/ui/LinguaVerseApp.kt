package com.example.ui

import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.SkillType
import com.example.ui.screens.*
import com.example.ui.viewmodel.MainViewModel

enum class MainDestination(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    HOME("home", "Home", Icons.Filled.Home, Icons.Outlined.Home),
    SKILLS("skills", "Skill Hub", Icons.Filled.GridView, Icons.Outlined.GridView),
    AI_CHAT("ai_chat", "AI Tutor", Icons.Filled.SmartToy, Icons.Outlined.SmartToy),
    LEADERBOARD("leaderboard", "Leagues", Icons.Filled.EmojiEvents, Icons.Outlined.EmojiEvents),
    PROFILE("profile", "Profile", Icons.Filled.Person, Icons.Outlined.Person),
    SETTINGS("settings", "Settings", Icons.Filled.Settings, Icons.Outlined.Settings)
}

@Composable
fun LinguaVerseApp(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    var currentDestination by remember { mutableStateOf(MainDestination.HOME) }
    var selectedSkillType by remember { mutableStateOf<SkillType?>(null) }
    var showAdminPanel by remember { mutableStateOf(false) }

    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val languages by viewModel.languages.collectAsStateWithLifecycle()
    val currentLessons by viewModel.currentLessons.collectAsStateWithLifecycle()
    val vocabularies by viewModel.vocabularies.collectAsStateWithLifecycle()
    val grammarRules by viewModel.grammarRules.collectAsStateWithLifecycle()
    val flashcards by viewModel.flashcards.collectAsStateWithLifecycle()
    val achievements by viewModel.achievements.collectAsStateWithLifecycle()
    val chatMessages by viewModel.chatMessages.collectAsStateWithLifecycle()

    val activeLesson by viewModel.activeLesson.collectAsStateWithLifecycle()
    val activeExercises by viewModel.activeExercises.collectAsStateWithLifecycle()
    val currentExerciseIndex by viewModel.currentExerciseIndex.collectAsStateWithLifecycle()
    val lessonCompleted by viewModel.lessonCompleted.collectAsStateWithLifecycle()

    val isAiChatLoading by viewModel.isAiChatLoading.collectAsStateWithLifecycle()
    val writingEvaluation by viewModel.writingEvaluation.collectAsStateWithLifecycle()
    val isEvaluatingWriting by viewModel.isEvaluatingWriting.collectAsStateWithLifecycle()
    val audioSpeed by viewModel.audioSpeed.collectAsStateWithLifecycle()
    val isDarkTheme by viewModel.isDarkTheme.collectAsStateWithLifecycle()

    // Active Lesson Execution Mode
    if (activeLesson != null) {
        LessonScreen(
            lesson = activeLesson!!,
            exercises = activeExercises,
            currentIndex = currentExerciseIndex,
            isCompleted = lessonCompleted,
            audioSpeed = audioSpeed,
            onSpeakText = { viewModel.speakText(it) },
            onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
            onSubmitAnswer = { viewModel.submitExerciseAnswer(it) },
            onNextExercise = { viewModel.nextExercise() },
            onCloseLesson = { viewModel.startLesson(activeLesson!!) /* resets or closes */ ; viewModel.nextExercise() }
        )
        return
    }

    // Admin Panel Mode
    if (showAdminPanel) {
        AdminPanelScreen(
            onAddLanguage = { code, name, nativeName, flag, desc ->
                viewModel.addNewLanguage(code, name, nativeName, flag, desc)
            },
            onAddLesson = { title, cat, level, xp, prompt, ans ->
                viewModel.addNewLesson(title, cat, level, xp, prompt, ans)
            },
            onAddVocabulary = { word, trans, ex, cat ->
                viewModel.addNewVocabulary(word, trans, ex, cat)
            },
            onBack = { showAdminPanel = false }
        )
        return
    }

    // Detail Skill Mode
    if (selectedSkillType != null) {
        SkillDetailScreen(
            skillType = selectedSkillType!!,
            targetLanguageCode = userProfile.targetLanguageCode,
            vocabularies = vocabularies,
            grammarRules = grammarRules,
            flashcards = flashcards,
            audioSpeed = audioSpeed,
            writingEvaluation = writingEvaluation,
            isEvaluatingWriting = isEvaluatingWriting,
            onSpeakText = { viewModel.speakText(it) },
            onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
            onEvaluateWriting = { text, prompt -> viewModel.evaluateWritingSubmission(text, prompt) },
            onToggleFavoriteVocab = { viewModel.toggleFavoriteVocabulary(it) },
            onBack = { selectedSkillType = null }
        )
        return
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("main_navigation_bar")
            ) {
                listOf(
                    MainDestination.HOME,
                    MainDestination.SKILLS,
                    MainDestination.AI_CHAT,
                    MainDestination.LEADERBOARD,
                    MainDestination.PROFILE,
                    MainDestination.SETTINGS
                ).forEach { destination ->
                    val isSelected = currentDestination == destination
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentDestination = destination },
                        icon = {
                            Icon(
                                imageVector = if (isSelected) destination.selectedIcon else destination.unselectedIcon,
                                contentDescription = destination.title
                            )
                        },
                        label = {
                            Text(
                                text = destination.title,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentDestination) {
                MainDestination.HOME -> HomeScreen(
                    userProfile = userProfile,
                    languages = languages,
                    lessons = currentLessons,
                    achievements = achievements,
                    onSelectLanguage = { viewModel.setTargetLanguage(it) },
                    onStartLesson = { viewModel.startLesson(it) },
                    onNavigateToSkills = { currentDestination = MainDestination.SKILLS },
                    onNavigateToAiChat = { currentDestination = MainDestination.AI_CHAT }
                )
                MainDestination.SKILLS -> SkillsHubScreen(
                    onSelectSkill = { skill ->
                        if (skill == SkillType.AI_CHAT) {
                            currentDestination = MainDestination.AI_CHAT
                        } else {
                            selectedSkillType = skill
                        }
                    }
                )
                MainDestination.AI_CHAT -> AiChatScreen(
                    messages = chatMessages,
                    isLoading = isAiChatLoading,
                    currentLevel = userProfile.currentLevel,
                    onSendMessage = { viewModel.sendAiChatMessage(it) },
                    onSpeakText = { viewModel.speakText(it) },
                    onBack = { currentDestination = MainDestination.HOME }
                )
                MainDestination.LEADERBOARD -> LeaderboardScreen(
                    currentUsername = userProfile.username,
                    currentUserXp = userProfile.xp
                )
                MainDestination.PROFILE -> ProfileScreen(
                    userProfile = userProfile,
                    achievements = achievements
                )
                MainDestination.SETTINGS -> SettingsScreen(
                    isDarkTheme = isDarkTheme,
                    audioSpeed = audioSpeed,
                    languages = languages,
                    targetLanguageCode = userProfile.targetLanguageCode,
                    onToggleDarkTheme = { viewModel.toggleDarkTheme() },
                    onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
                    onSelectLanguage = { viewModel.setTargetLanguage(it) },
                    onOpenAdminPanel = { showAdminPanel = true }
                )
            }
        }
    }
}
