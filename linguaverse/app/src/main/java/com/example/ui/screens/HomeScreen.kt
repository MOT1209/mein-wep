package com.example.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.data.model.*
import com.example.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
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
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        // Top Header
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Language Selector
                Box {
                    Surface(
                        modifier = Modifier
                            .testTag("language_selector_button")
                            .clickable { showLanguageDropdown = true },
                        color = MaterialTheme.colorScheme.surfaceContainerHighest,
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentLang?.flagEmoji ?: "🇪🇸",
                                fontSize = 20.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = currentLang?.name ?: "Spanish",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = "Select Language",
                                modifier = Modifier.size(20.dp)
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
                                        Text(text = lang.flagEmoji, fontSize = 18.sp)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(text = lang.name, fontWeight = FontWeight.SemiBold)
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
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    StreakBadge(streakCount = userProfile.streakCount)
                    XpBadge(xp = userProfile.xp)
                }
            }
        }

        // Hero Banner "Continue Learning"
        item {
            val nextLesson = lessons.find { !it.isCompleted } ?: lessons.firstOrNull()

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
                    .testTag("hero_banner_card"),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
            ) {
                Box(modifier = Modifier.fillMaxWidth()) {
                    // Background Image
                    Image(
                        painter = painterResource(id = R.drawable.img_hero_banner_1786457489092),
                        contentDescription = "Hero Banner",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        contentScale = ContentScale.Crop,
                        alpha = 0.25f
                    )

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Surface(
                                color = MaterialTheme.colorScheme.primary,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = "CONTINUE LEARNING",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }

                            if (nextLesson != null) {
                                LevelChip(level = nextLesson.level)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = nextLesson?.title ?: "Greetings & Basics",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )

                        Text(
                            text = nextLesson?.description ?: "Master fundamental conversations in ${currentLang?.name}",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = { nextLesson?.let { onStartLesson(it) } },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("continue_lesson_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(imageVector = Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Start Lesson (+${nextLesson?.xpReward ?: 20} XP)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            }
        }

        // Daily Goal & AI Chat Quick Bar
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Daily Goal Card
                GlassCard(
                    modifier = Modifier.weight(1f)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        DailyGoalProgressRing(
                            currentXp = userProfile.todayXp,
                            goalXp = userProfile.dailyGoalXp
                        )
                        Column {
                            Text(
                                text = "Daily Goal",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = if (userProfile.todayXp >= userProfile.dailyGoalXp) "Goal Reached!" else "${userProfile.dailyGoalXp - userProfile.todayXp} XP remaining",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // AI Chat Quick Button
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .testTag("ai_chat_quick_card")
                        .clickable { onNavigateToAiChat() },
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.SmartToy,
                                contentDescription = "AI Teacher",
                                tint = MaterialTheme.colorScheme.onSecondaryContainer,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "AI Tutor",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Practice conversation with AI feedback",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }
        }

        // Skill Practice Shortcut Bar
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Skill Practice (15 Modules)",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 18.sp
                )

                TextButton(onClick = onNavigateToSkills) {
                    Text(text = "View All", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Skill Quick Chips Row
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
                contentPadding = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(quickSkills) { (name, icon) ->
                    Surface(
                        modifier = Modifier
                            .testTag("skill_chip_$name")
                            .clickable {
                                if (name == "AI Chat") onNavigateToAiChat() else onNavigateToSkills()
                            },
                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = icon,
                                contentDescription = name,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }

        // Recommended Lessons Title
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Course Curriculum",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 18.sp,
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
            )
        }

        // Lessons List
        items(lessons) { lesson ->
            LessonItemCard(
                lesson = lesson,
                onStartLesson = { onStartLesson(lesson) },
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)
            )
        }
    }
}

@Composable
fun LessonItemCard(
    lesson: Lesson,
    onStartLesson: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("lesson_card_${lesson.id}")
            .clickable(enabled = !lesson.isLocked) { onStartLesson() },
        color = if (lesson.isCompleted) MaterialTheme.colorScheme.surfaceContainerLow else MaterialTheme.colorScheme.surfaceContainerHigh,
        shape = RoundedCornerShape(18.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            lesson.isCompleted -> Color(0xFF10B981)
                            lesson.isLocked -> MaterialTheme.colorScheme.outlineVariant
                            else -> MaterialTheme.colorScheme.primary
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when {
                        lesson.isCompleted -> Icons.Default.Check
                        lesson.isLocked -> Icons.Default.Lock
                        else -> Icons.Default.PlayArrow
                    },
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    LevelChip(level = lesson.level)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = lesson.category,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = lesson.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )

                Text(
                    text = lesson.description,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "+${lesson.xpReward} XP",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = Color(0xFFD97706)
            )
        }
    }
}
