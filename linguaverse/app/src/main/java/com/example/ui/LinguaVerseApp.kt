package com.example.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.data.model.SkillType
import com.example.ui.screens.*
import com.example.ui.viewmodel.MainViewModel

/** Destinations shown in the bottom navigation bar. */
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

/** Full-screen destinations pushed on top of the bottom-bar destinations. */
private object Routes {
    const val SKILL_DETAIL = "skill_detail/{skillType}"
    const val LESSON = "lesson/{lessonId}"
    const val ADMIN = "admin"

    fun skillDetail(skill: SkillType) = "skill_detail/${skill.name}"
    fun lesson(lessonId: String) = "lesson/$lessonId"
}

@Composable
fun LinguaVerseApp(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val languages by viewModel.languages.collectAsStateWithLifecycle()
    val currentLessons by viewModel.currentLessons.collectAsStateWithLifecycle()
    val vocabularies by viewModel.vocabularies.collectAsStateWithLifecycle()
    val grammarRules by viewModel.grammarRules.collectAsStateWithLifecycle()
    val flashcards by viewModel.flashcards.collectAsStateWithLifecycle()
    val achievements by viewModel.achievements.collectAsStateWithLifecycle()
    val chatMessages by viewModel.chatMessages.collectAsStateWithLifecycle()

    val isAiChatLoading by viewModel.isAiChatLoading.collectAsStateWithLifecycle()
    val aiChatError by viewModel.aiChatError.collectAsStateWithLifecycle()
    val writingEvaluation by viewModel.writingEvaluation.collectAsStateWithLifecycle()
    val writingEvaluationError by viewModel.writingEvaluationError.collectAsStateWithLifecycle()
    val isEvaluatingWriting by viewModel.isEvaluatingWriting.collectAsStateWithLifecycle()
    val audioSpeed by viewModel.audioSpeed.collectAsStateWithLifecycle()

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination
    val showBottomBar = MainDestination.entries.any { destination ->
        currentRoute?.hierarchy?.any { it.route == destination.route } == true
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    modifier = Modifier
                        .windowInsetsPadding(WindowInsets.navigationBars)
                        .testTag("main_navigation_bar")
                ) {
                    MainDestination.entries.forEach { destination ->
                        val isSelected =
                            currentRoute?.hierarchy?.any { it.route == destination.route } == true
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { navController.navigateToTab(destination) },
                            icon = {
                                Icon(
                                    imageVector = if (isSelected) {
                                        destination.selectedIcon
                                    } else {
                                        destination.unselectedIcon
                                    },
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
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = MainDestination.HOME.route,
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable(MainDestination.HOME.route) {
                HomeScreen(
                    userProfile = userProfile,
                    languages = languages,
                    lessons = currentLessons,
                    achievements = achievements,
                    onSelectLanguage = { viewModel.setTargetLanguage(it) },
                    onStartLesson = { navController.navigate(Routes.lesson(it.id)) },
                    onNavigateToSkills = { navController.navigateToTab(MainDestination.SKILLS) },
                    onNavigateToAiChat = { navController.navigateToTab(MainDestination.AI_CHAT) }
                )
            }

            composable(MainDestination.SKILLS.route) {
                SkillsHubScreen(
                    onSelectSkill = { skill ->
                        if (skill == SkillType.AI_CHAT) {
                            navController.navigateToTab(MainDestination.AI_CHAT)
                        } else {
                            navController.navigate(Routes.skillDetail(skill))
                        }
                    }
                )
            }

            composable(MainDestination.AI_CHAT.route) {
                AiChatScreen(
                    messages = chatMessages,
                    isLoading = isAiChatLoading,
                    error = aiChatError,
                    currentLevel = userProfile.currentLevel,
                    onSendMessage = { viewModel.sendAiChatMessage(it) },
                    onSpeakText = { viewModel.speakText(it) },
                    onBack = { navController.navigateToTab(MainDestination.HOME) }
                )
            }

            composable(MainDestination.LEADERBOARD.route) {
                LeaderboardScreen(
                    currentUsername = userProfile.username,
                    currentUserXp = userProfile.xp
                )
            }

            composable(MainDestination.PROFILE.route) {
                ProfileScreen(
                    userProfile = userProfile,
                    achievements = achievements
                )
            }

            composable(MainDestination.SETTINGS.route) {
                SettingsScreen(
                    isDarkTheme = viewModel.isDarkTheme.collectAsStateWithLifecycle().value,
                    audioSpeed = audioSpeed,
                    languages = languages,
                    targetLanguageCode = userProfile.targetLanguageCode,
                    onToggleDarkTheme = { viewModel.toggleDarkTheme() },
                    onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
                    onSelectLanguage = { viewModel.setTargetLanguage(it) },
                    onOpenAdminPanel = { navController.navigate(Routes.ADMIN) }
                )
            }

            composable(Routes.SKILL_DETAIL) { entry ->
                val skillType = entry.arguments
                    ?.getString("skillType")
                    ?.let { name -> SkillType.entries.firstOrNull { it.name == name } }

                if (skillType == null) {
                    // Unknown skill in the route: go back rather than crash.
                    LaunchedEffect(Unit) { navController.popBackStack() }
                } else {
                    SkillDetailScreen(
                        skillType = skillType,
                        targetLanguageCode = userProfile.targetLanguageCode,
                        vocabularies = vocabularies,
                        grammarRules = grammarRules,
                        flashcards = flashcards,
                        audioSpeed = audioSpeed,
                        writingEvaluation = writingEvaluation,
                        writingEvaluationError = writingEvaluationError,
                        isEvaluatingWriting = isEvaluatingWriting,
                        onSpeakText = { viewModel.speakText(it) },
                        onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
                        onEvaluateWriting = { text, prompt ->
                            viewModel.evaluateWritingSubmission(text, prompt)
                        },
                        onToggleFavoriteVocab = { viewModel.toggleFavoriteVocabulary(it) },
                        onBack = { navController.popBackStack() }
                    )
                }
            }

            composable(Routes.LESSON) { entry ->
                val lessonId = entry.arguments?.getString("lessonId").orEmpty()
                LaunchedEffect(lessonId) { viewModel.startLessonById(lessonId) }

                val activeLesson by viewModel.activeLesson.collectAsStateWithLifecycle()
                val activeExercises by viewModel.activeExercises.collectAsStateWithLifecycle()
                val currentExerciseIndex by viewModel.currentExerciseIndex.collectAsStateWithLifecycle()
                val lessonCompleted by viewModel.lessonCompleted.collectAsStateWithLifecycle()

                val lesson = activeLesson
                if (lesson == null) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                } else {
                    val exitLesson = {
                        viewModel.closeLesson()
                        navController.popBackStack()
                        Unit
                    }
                    LessonScreen(
                        lesson = lesson,
                        exercises = activeExercises,
                        currentIndex = currentExerciseIndex,
                        isCompleted = lessonCompleted,
                        audioSpeed = audioSpeed,
                        onSpeakText = { viewModel.speakText(it) },
                        onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
                        onSubmitAnswer = { viewModel.submitExerciseAnswer(it) },
                        onNextExercise = { viewModel.nextExercise() },
                        onCloseLesson = exitLesson
                    )
                }
            }

            composable(Routes.ADMIN) {
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
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}

/**
 * Standard bottom-bar behaviour: one entry per tab on the back stack, state kept
 * per tab, and system back returning to the start destination.
 */
private fun NavHostController.navigateToTab(destination: MainDestination) {
    navigate(destination.route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
