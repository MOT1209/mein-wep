package com.example.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.SkillType
import com.example.ui.theme.extendedColors

data class SkillCategoryInfo(
    val type: SkillType,
    val icon: ImageVector,
    val description: String,
    /** Index into MaterialTheme.extendedColors.skillPalette, so the accent adapts to the theme. */
    val paletteIndex: Int
)

@Composable
fun SkillsHubScreen(
    onSelectSkill: (SkillType) -> Unit,
    modifier: Modifier = Modifier
) {
    val skillCategories = listOf(
        SkillCategoryInfo(SkillType.AI_CHAT, Icons.Default.SmartToy, "Interactive AI Teacher Chat", 0),
        SkillCategoryInfo(SkillType.LISTENING, Icons.Default.Hearing, "Audio Speed & Comprehension", 1),
        SkillCategoryInfo(SkillType.SPEAKING, Icons.Default.Mic, "Speech Recognition & Pronunciation", 2),
        SkillCategoryInfo(SkillType.READING, Icons.Default.Book, "Stories & Tap Dictionary", 3),
        SkillCategoryInfo(SkillType.WRITING, Icons.Default.Edit, "Free Writing & AI Correction", 4),
        SkillCategoryInfo(SkillType.VOCABULARY, Icons.Default.Translate, "Word Deck & Pronunciation", 5),
        SkillCategoryInfo(SkillType.GRAMMAR, Icons.Default.Rule, "CEFR Rules & Examples", 6),
        SkillCategoryInfo(SkillType.FLASHCARDS, Icons.Default.Style, "Spaced Repetition Cards", 7),
        SkillCategoryInfo(SkillType.QUIZZES, Icons.Default.Quiz, "Multi-Format Practice Tests", 8),
        SkillCategoryInfo(SkillType.DAILY_PHRASES, Icons.Default.ChatBubbleOutline, "Categorized Phrasebook", 9),
        SkillCategoryInfo(SkillType.CONVERSATION, Icons.Default.Forum, "Scenario Roleplaying", 10),
        SkillCategoryInfo(SkillType.PRONUNCIATION, Icons.Default.RecordVoiceOver, "Phonetics & Voice Feedback", 11),
        SkillCategoryInfo(SkillType.TRANSLATION, Icons.Default.SwapHoriz, "Sentence Translation Challenges", 12),
        SkillCategoryInfo(SkillType.REVIEW, Icons.Default.Replay, "Smart Weak Point Practice", 13)
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp)
            .testTag("skills_hub_screen")
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Language Skill Hub",
            fontSize = 24.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Text(
            text = "Master all 15 core linguistic competencies with AI assistance",
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(skillCategories) { skill ->
                val palette = MaterialTheme.extendedColors.skillPalette
                val accent = palette[skill.paletteIndex % palette.size]
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("skill_card_${skill.type.name}")
                        .clickable { onSelectSkill(skill.type) },
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Surface(
                            color = accent.copy(alpha = 0.15f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                imageVector = skill.icon,
                                contentDescription = skill.type.displayName,
                                tint = accent,
                                modifier = Modifier
                                    .padding(10.dp)
                                    .size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = skill.type.displayName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = skill.description,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 2
                        )
                    }
                }
            }
        }
    }
}
