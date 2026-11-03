package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.data.model.SkillType
import com.example.ui.components.display.LinguaCard
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

data class SkillCategoryInfo(
    val type: SkillType,
    val icon: ImageVector,
    val description: String,
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
            .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            .testTag("skills_hub_screen")
    ) {
        Spacer(modifier = Modifier.height(LinguaVerseDimens.ScreenVerticalPadding))

        Text(
            text = stringResource(R.string.skill_hub_title),
            style = MaterialTheme.typography.headlineSmall
        )
        Text(
            text = stringResource(R.string.skill_hub_subtitle),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        LazyVerticalGrid(
            columns = GridCells.Adaptive(minSize = 156.dp),
            horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
            verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
            contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
        ) {
            items(skillCategories) { skill ->
                val palette = MaterialTheme.extendedColors.skillPalette
                val accent = palette[skill.paletteIndex % palette.size]

                LinguaCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("skill_card_${skill.type.name}"),
                    onClick = { onSelectSkill(skill.type) }
                ) {
                    Surface(
                        color = accent.copy(alpha = 0.15f),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Icon(
                            imageVector = skill.icon,
                            contentDescription = skill.type.displayName,
                            tint = accent,
                            modifier = Modifier.padding(LinguaVerseDimens.CompactSpacing).size(LinguaVerseDimens.IconLarge)
                        )
                    }

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                    Text(
                        text = skill.type.displayName,
                        style = MaterialTheme.typography.titleMedium
                    )

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))

                    Text(
                        text = skill.description,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2
                    )
                }
            }
        }
    }
}
