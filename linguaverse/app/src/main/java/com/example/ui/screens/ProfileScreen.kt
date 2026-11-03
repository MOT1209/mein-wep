package com.example.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.data.model.Achievement
import com.example.data.model.UserProfile
import com.example.ui.components.LevelChip
import com.example.ui.components.display.LinguaAvatar
import com.example.ui.components.display.LinguaBadge
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.display.LinguaDivider
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

@Composable
fun ProfileScreen(
    userProfile: UserProfile,
    achievements: List<Achievement>,
    targetLanguageName: String,
    onOpenSettings: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            .testTag("profile_screen"),
        contentPadding = PaddingValues(
            top = LinguaVerseDimens.ScreenVerticalPadding,
            bottom = LinguaVerseDimens.SectionSpacing
        ),
        verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing)
    ) {
        // ── Header ──────────────────────────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.learning_profile),
                    style = MaterialTheme.typography.headlineSmall
                )
                IconButton(onClick = onOpenSettings) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = stringResource(R.string.open_settings)
                    )
                }
            }
        }

        // ── Avatar Card ─────────────────────────────────────────────────────
        item {
            LinguaCard(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.extraLarge
            ) {
                Column(
                    modifier = Modifier.padding(LinguaVerseDimens.CardPadding),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    LinguaAvatar(
                        initials = userProfile.username.take(2).uppercase(),
                        size = LinguaVerseDimens.AvatarExtraLarge
                    )

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                    Text(
                        text = userProfile.username,
                        style = MaterialTheme.typography.headlineSmall
                    )

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = stringResource(R.string.current_level),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.InlineSpacing))
                        LevelChip(level = userProfile.currentLevel)
                    }

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        ProfileStatItem(
                            title = "Total XP",
                            value = "${userProfile.xp}",
                            icon = Icons.Default.Stars,
                            color = MaterialTheme.extendedColors.xp
                        )
                        ProfileStatItem(
                            title = "Streak",
                            value = "${userProfile.streakCount} days",
                            icon = Icons.Default.LocalFireDepartment,
                            color = MaterialTheme.extendedColors.streak
                        )
                        ProfileStatItem(
                            title = "Lessons",
                            value = "${userProfile.totalCompletedLessons}",
                            icon = Icons.Default.School,
                            color = MaterialTheme.extendedColors.skillPalette[9]
                        )
                    }
                }
            }
        }

        // ── Competency Breakdown ────────────────────────────────────────────
        item {
            Text(
                text = stringResource(R.string.competency_breakdown),
                style = MaterialTheme.typography.titleLarge
            )
        }

        item {
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(LinguaVerseDimens.CardPadding),
                    verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing)
                ) {
                    SkillScoreBar("Vocabulary", userProfile.vocabularyScore, MaterialTheme.extendedColors.skillPalette[5])
                    SkillScoreBar("Reading", userProfile.readingScore, MaterialTheme.extendedColors.xp)
                    SkillScoreBar("Listening", userProfile.listeningScore, MaterialTheme.extendedColors.skillPalette[1])
                    SkillScoreBar("Speaking", userProfile.speakingScore, MaterialTheme.extendedColors.skillPalette[2])
                    SkillScoreBar("Writing", userProfile.writingScore, MaterialTheme.extendedColors.skillPalette[4])
                    SkillScoreBar("Grammar", userProfile.grammarScore, MaterialTheme.extendedColors.skillPalette[6])
                }
            }
        }

        // ── CEFR Certificate ────────────────────────────────────────────────
        item {
            LinguaCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = MaterialTheme.colorScheme.tertiaryContainer,
                borderColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.3f)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.WorkspacePremium,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                    Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                    Text(
                        text = stringResource(R.string.cefr_certificate_ready),
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onTertiaryContainer
                    )
                }

                Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))

                Text(
                    text = stringResource(
                        R.string.certificate_text,
                        userProfile.currentLevel.code,
                        userProfile.currentLevel.title,
                        targetLanguageName
                    ),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onTertiaryContainer.copy(alpha = 0.85f)
                )

                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                LinguaPrimaryButton(
                    text = stringResource(R.string.view_official_certificate),
                    onClick = {},
                    icon = Icons.Default.CardMembership,
                    size = com.example.ui.components.buttons.ButtonSize.Small
                )
            }
        }

        // ── Achievements ────────────────────────────────────────────────────
        item {
            Text(
                text = stringResource(R.string.achievements_title),
                style = MaterialTheme.typography.titleLarge
            )
        }

        items(achievements) { ach ->
            LinguaCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.CardElevation),
                showBorder = false
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    LinguaAvatar(
                        initials = if (ach.isUnlocked) "\uD83C\uDFC6" else "\uD83D\uDD12",
                        size = LinguaVerseDimens.AvatarMedium,
                        backgroundColor = if (ach.isUnlocked) MaterialTheme.extendedColors.xpContainer else MaterialTheme.colorScheme.surfaceContainerHighest,
                        contentColor = if (ach.isUnlocked) MaterialTheme.extendedColors.xp else MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = ach.title,
                            style = MaterialTheme.typography.titleMedium
                        )
                        Text(
                            text = ach.description,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    LinguaBadge(
                        text = "+${ach.rewardXp} XP",
                        containerColor = MaterialTheme.extendedColors.xpContainer,
                        contentColor = MaterialTheme.extendedColors.onXpContainer
                    )
                }
            }
        }
    }
}

// ── Reusable Helpers ────────────────────────────────────────────────────────────

@Composable
private fun ProfileStatItem(
    title: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = color,
            modifier = Modifier.size(LinguaVerseDimens.IconMedium)
        )
        Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
        Text(text = value, style = MaterialTheme.typography.titleMedium)
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SkillScoreBar(label: String, score: Int, color: Color) {
    val animatedScore by animateFloatAsState(
        targetValue = (score / 100f).coerceIn(0f, 1f),
        label = "${label}_score"
    )
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, style = MaterialTheme.typography.labelMedium)
            Text(
                text = "$score%",
                style = MaterialTheme.typography.labelMedium,
                color = color
            )
        }
        Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
        LinearProgressIndicator(
            progress = { animatedScore },
            modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(CircleShape),
            color = color,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}
