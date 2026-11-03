package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.model.*
import com.example.ui.components.*
import com.example.ui.components.buttons.ButtonSize
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.display.LinguaChip
import com.example.ui.components.display.LinguaBadge
import com.example.ui.components.display.LinguaDivider
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    userProfile: UserProfile,
    languages: List<Language>,
    lessons: List<Lesson>,
    achievements: List<Achievement>,
    onSelectLanguage: (String) -> Unit,
    onStartLesson: (Lesson) -> Unit,
    onNavigateToSkills: () -> Unit,
    onNavigateToAiChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showLanguageDropdown by remember { mutableStateOf(false) }
    val currentLang = languages.find { it.code == userProfile.targetLanguageCode } ?: languages.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("home_screen_column"),
        contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
    ) {
        // ── Top Header ──────────────────────────────────────────────────────
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(
                        horizontal = LinguaVerseDimens.ScreenHorizontalPadding,
                        vertical = LinguaVerseDimens.ScreenVerticalPadding
                    ),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Language Selector
                Box {
                    LinguaCard(
                        modifier = Modifier.testTag("language_selector_button"),
                        onClick = { showLanguageDropdown = true },
                        showBorder = false
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = currentLang?.flagEmoji ?: "\uD83C\uDDEA\uD83C\uDDF8")
                            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                            Text(
                                text = currentLang?.name ?: "Spanish",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = stringResource(R.string.select_language),
                                modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = showLanguageDropdown,
                        onDismissRequest = { showLanguageDropdown = false }
                    ) {
                        languages.forEach { lang ->
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(text = lang.flagEmoji)
                                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                                        Text(text = lang.name, style = MaterialTheme.typography.bodyLarge)
                                    }
                                },
                                onClick = {
                                    onSelectLanguage(lang.code)
                                    showLanguageDropdown = false
                                }
                            )
                        }
                    }
                }

                // Badges
                Row(horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing)) {
                    StreakBadge(streakCount = userProfile.streakCount)
                    XpBadge(xp = userProfile.xp)
                }
            }
        }

        // ── Hero Banner ─────────────────────────────────────────────────────
        item {
            val nextLesson = lessons.find { !it.isCompleted } ?: lessons.firstOrNull()

            LinguaCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
                    .testTag("hero_banner_card"),
                backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                borderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                shape = MaterialTheme.shapes.extraLarge
            ) {
                Box(modifier = Modifier.fillMaxWidth()) {
                    // Background Image
                    Image(
                        painter = painterResource(id = R.drawable.img_hero_banner_1786457489092),
                        contentDescription = stringResource(R.string.hero_banner_desc),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        contentScale = ContentScale.Crop,
                        alpha = 0.25f
                    )

                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            LinguaBadge(
                                text = stringResource(R.string.continue_learning),
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary,
                                shape = MaterialTheme.shapes.extraSmall
                            )
                            if (nextLesson != null) {
                                LevelChip(level = nextLesson.level)
                            }
                        }

                        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                        Text(
                            text = nextLesson?.title ?: "Greetings & Basics",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )

                        Text(
                            text = nextLesson?.description ?: "Master fundamental conversations in ${currentLang?.name}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )

                        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

                        LinguaPrimaryButton(
                            text = stringResource(R.string.start_lesson_xp, nextLesson?.xpReward ?: 20),
                            onClick = { nextLesson?.let { onStartLesson(it) } },
                            modifier = Modifier.fillMaxWidth().testTag("continue_lesson_button"),
                            icon = Icons.Default.PlayArrow,
                            size = ButtonSize.Large
                        )
                    }
                }
            }
        }

        // ── Daily Goal & AI Chat Quick Bar ──────────────────────────────────
        item {
            FlowRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(
                        horizontal = LinguaVerseDimens.ScreenHorizontalPadding,
                        vertical = LinguaVerseDimens.CompactSpacing
                    ),
                horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
                verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
                maxItemsInEachRow = 2
            ) {
                // Daily Goal Card
                LinguaCard(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing)
                    ) {
                        DailyGoalProgressRing(
                            currentXp = userProfile.todayXp,
                            goalXp = userProfile.dailyGoalXp
                        )
                        Column {
                            Text(
                                text = stringResource(R.string.daily_goal),
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                text = if (userProfile.todayXp >= userProfile.dailyGoalXp) "Goal Reached!" else "${userProfile.dailyGoalXp - userProfile.todayXp} XP remaining",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // AI Chat Quick Button
                LinguaCard(
                    modifier = Modifier.weight(1f).testTag("ai_chat_quick_card"),
                    onClick = { onNavigateToAiChat() },
                    backgroundColor = MaterialTheme.colorScheme.secondaryContainer,
                    borderColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.SmartToy,
                            contentDescription = stringResource(R.string.ai_teacher),
                            tint = MaterialTheme.colorScheme.onSecondaryContainer,
                            modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                        Text(
                            text = stringResource(R.string.ai_tutor),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
                    Text(
                        text = stringResource(R.string.ai_chat_feedback),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                    )
                }
            }
        }

        // ── Skill Practice Header ───────────────────────────────────────────
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.skill_practice_15_modules),
                    style = MaterialTheme.typography.titleLarge
                )
                TextButton(onClick = onNavigateToSkills) {
                    Text(
                        text = stringResource(R.string.view_all),
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }

        // ── Skill Quick Chips ───────────────────────────────────────────────
        item {
            val quickSkills = listOf(
                "AI Chat" to Icons.Default.SmartToy,
                "Speaking" to Icons.Default.Mic,
                "Listening" to Icons.Default.Hearing,
                "Reading" to Icons.Default.Book,
                "Writing" to Icons.Default.Edit,
                "Flashcards" to Icons.Default.Style,
                "Quizzes" to Icons.Default.Quiz
            )

            LazyRow(
                contentPadding = PaddingValues(horizontal = LinguaVerseDimens.ScreenHorizontalPadding),
                horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing)
            ) {
                items(quickSkills) { (name, icon) ->
                    LinguaChip(
                        text = name,
                        onClick = {
                            if (name == "AI Chat") onNavigateToAiChat() else onNavigateToSkills()
                        },
                        icon = {
                            Icon(
                                imageVector = icon,
                                contentDescription = name,
                                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
                            )
                        }
                    )
                }
            }
        }

        // ── Course Curriculum Header ────────────────────────────────────────
        item {
            Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
            Text(
                text = stringResource(R.string.course_curriculum),
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            )
        }

        // ── Lessons List ────────────────────────────────────────────────────
        items(lessons) { lesson ->
            LessonItemCard(
                lesson = lesson,
                onStartLesson = { onStartLesson(lesson) },
                modifier = Modifier.padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            )
        }
    }
}

@Composable
private fun LessonItemCard(
    lesson: Lesson,
    onStartLesson: () -> Unit,
    modifier: Modifier = Modifier
) {
    LinguaCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("lesson_card_${lesson.id}"),
        onClick = if (!lesson.isLocked) ({ onStartLesson() }) else null,
        backgroundColor = if (lesson.isCompleted) {
            MaterialTheme.colorScheme.surfaceColorAtElevation(0.dp)
        } else {
            MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.CardElevation)
        }
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Status Icon
            Surface(
                color = when {
                    lesson.isCompleted -> MaterialTheme.extendedColors.success
                    lesson.isLocked -> MaterialTheme.colorScheme.outlineVariant
                    else -> MaterialTheme.colorScheme.primary
                },
                shape = MaterialTheme.shapes.extraSmall,
                modifier = Modifier.size(LinguaVerseDimens.ButtonHeightMedium)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = when {
                            lesson.isCompleted -> Icons.Default.Check
                            lesson.isLocked -> Icons.Default.Lock
                            else -> Icons.Default.PlayArrow
                        },
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.surface,
                        modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                    )
                }
            }

            Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LevelChip(level = lesson.level)
                    Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                    Text(
                        text = lesson.category,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))

                Text(
                    text = lesson.title,
                    style = MaterialTheme.typography.titleMedium
                )

                Text(
                    text = lesson.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }

            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))

            LinguaBadge(
                text = stringResource(R.string.xp_reward, lesson.xpReward),
                containerColor = MaterialTheme.extendedColors.xpContainer,
                contentColor = MaterialTheme.extendedColors.onXpContainer
            )
        }
    }
}
