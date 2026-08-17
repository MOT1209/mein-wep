package com.example.ui

import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.BuildConfig
import com.example.data.model.SkillType
import com.example.ui.components.navigation.LinguaBottomBar
import com.example.ui.components.navigation.NavigationItem
import com.example.ui.screens.*
import com.example.ui.viewmodel.MainViewModel
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.outlined.SmartToy
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.outlined.EmojiEvents
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Person

/** Destinations shown in the bottom navigation bar. */
enum class MainDestination(
    val route: String,
    val title: String,
    val selectedIcon: androidx.compose.ui.graphics.vector.ImageVector,
    val unselectedIcon: androidx.compose.ui.graphics.vector.ImageVector
) {
    HOME("home", "Home", androidx.compose.material.icons.Icons.Filled.Home, androidx.compose.material.icons.Icons.Outlined.Home),
    SKILLS("skills", "Skill Hub", androidx.compose.material.icons.Icons.Filled.GridView, androidx.compose.material.icons.Icons.Outlined.GridView),
    AI_CHAT("ai_chat", "AI Tutor", androidx.compose.material.icons.Icons.Filled.SmartToy, androidx.compose.material.icons.Icons.Outlined.SmartToy),
    LEADERBOARD("leaderboard", "Leagues", androidx.compose.material.icons.Icons.Filled.EmojiEvents, androidx.compose.material.icons.Icons.Outlined.EmojiEvents),
    PROFILE("profile", "Profile", androidx.compose.material.icons.Icons.Filled.Person, androidx.compose.material.icons.Icons.Outlined.Person)
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

    val navigationItems = MainDestination.entries.map { dest ->
        NavigationItem(
            route = dest.route,
            label = dest.title,
            selectedIcon = dest.selectedIcon,
            unselectedIcon = dest.unselectedIcon
        )
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                LinguaBottomBar(
                    items = navigationItems,
                    currentRoute = currentRoute?.route,
                    onItemSelected = { route -> navController.navigateToTab(MainDestination.entries.first { it.route == route }) },
                    modifier = Modifier
                        .windowInsetsPadding(WindowInsets.navigationBars)
                        .testTag("main_navigation_bar")
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = MainDestination.HOME.route,
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding),
            enterTransition = {
                slideInHorizontally(initialOffsetX = { it / 5 }) + fadeIn()
            },
            exitTransition = {
                slideOutHorizontally(targetOffsetX = { -it / 5 }) + fadeOut()
            },
            popEnterTransition = {
                slideInHorizontally(initialOffsetX = { -it / 5 }) + fadeIn()
            },
            popExitTransition = {
                slideOutHorizontally(targetOffsetX = { it / 5 }) + fadeOut()
            }
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
                    achievements = achievements,
                    targetLanguageName = languages.find { it.code == userProfile.targetLanguageCode }?.name
                        ?: userProfile.targetLanguageCode,
                    onOpenSettings = { navController.navigate("settings") }
                )
            }

            composable("settings") {
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
                        targetLanguageName = languages.find { it.code == userProfile.targetLanguageCode }?.name
                            ?: userProfile.targetLanguageCode,
                        onSpeakText = { viewModel.speakText(it) },
                        onSetAudioSpeed = { viewModel.setAudioSpeed(it) },
                        onSubmitAnswer = { viewModel.submitExerciseAnswer(it) },
                        onNextExercise = { viewModel.nextExercise() },
                        onCloseLesson = exitLesson
                    )
                }
            }

            composable(Routes.ADMIN) {
                if (BuildConfig.DEBUG) {
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
                } else {
                    LaunchedEffect(Unit) { navController.popBackStack() }
                }
            }
        }
    }
}

private fun NavHostController.navigateToTab(destination: MainDestination) {
    navigate(destination.route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
