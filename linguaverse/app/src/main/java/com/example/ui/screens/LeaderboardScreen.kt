package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.data.model.LeaderboardEntry
import com.example.ui.components.display.LinguaAvatar
import com.example.ui.components.display.LinguaBadge
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.display.LinguaDivider
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

@Composable
fun LeaderboardScreen(
    currentUsername: String,
    currentUserXp: Int,
    modifier: Modifier = Modifier
) {
    val leaderboard = remember(currentUsername, currentUserXp) {
        val others = listOf(
            LeaderboardEntry(0, "Sofia Garcia", "\uD83E\uDD47", 1420, false, "Diamond"),
            LeaderboardEntry(0, "Marco Rossi", "\uD83E\uDD48", 1280, false, "Diamond"),
            LeaderboardEntry(0, "Yuki Tanaka", "\uD83E\uDD49", 1150, false, "Gold"),
            LeaderboardEntry(0, "Emma Watson", "\uD83C\uDF1F", 420, false, "Gold"),
            LeaderboardEntry(0, "Lucas Schmidt", "\uD83D\uDD25", 380, false, "Silver"),
            LeaderboardEntry(0, "Aisha Ahmed", "\u2728", 310, false, "Silver")
        )
        val allEntries = others + LeaderboardEntry(0, currentUsername, "\u26A1", currentUserXp, true, "Gold")
        allEntries.sortedByDescending { it.xp }.mapIndexed { index, entry ->
            entry.copy(rank = index + 1, badge = when {
                entry.xp >= 1000 -> "Diamond"
                entry.xp >= 300 -> "Gold"
                entry.xp >= 100 -> "Silver"
                else -> "Bronze"
            })
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            .testTag("leaderboard_screen")
    ) {
        Spacer(modifier = Modifier.height(LinguaVerseDimens.ScreenVerticalPadding))

        // ── Header ──────────────────────────────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = stringResource(R.string.weekly_league),
                    style = MaterialTheme.typography.headlineSmall
                )
                Text(
                    text = stringResource(R.string.league_promote_text),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            LinguaBadge(
                text = stringResource(R.string.s_3_days_left),
                containerColor = MaterialTheme.extendedColors.xpContainer,
                contentColor = MaterialTheme.extendedColors.onXpContainer,
                icon = {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = null,
                        tint = MaterialTheme.extendedColors.xp,
                        modifier = Modifier.size(LinguaVerseDimens.IconSmall)
                    )
                }
            )
        }

        Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))

        Text(
            text = stringResource(R.string.league_simulated_note),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

        // ── Leaderboard List ────────────────────────────────────────────────
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing),
            contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
        ) {
            itemsIndexed(leaderboard) { _, entry ->
                LinguaCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = if (entry.isCurrentUser) {
                        MaterialTheme.colorScheme.primaryContainer
                    } else {
                        MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.CardElevation)
                    },
                    borderColor = if (entry.isCurrentUser) {
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                    } else {
                        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f)
                    }
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "#${entry.rank}",
                            style = MaterialTheme.typography.titleMedium,
                            color = if (entry.rank <= 3) MaterialTheme.extendedColors.xp else MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))

                        LinguaAvatar(
                            initials = entry.avatarEmoji,
                            size = LinguaVerseDimens.AvatarMedium,
                            backgroundColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                            contentColor = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (entry.isCurrentUser) "${entry.username} (You)" else entry.username,
                                style = MaterialTheme.typography.titleMedium,
                                color = if (entry.isCurrentUser) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = stringResource(R.string.badge_league, entry.badge),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        LinguaBadge(
                            text = "${entry.xp} XP",
                            containerColor = MaterialTheme.extendedColors.xpContainer,
                            contentColor = MaterialTheme.extendedColors.onXpContainer,
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.Stars,
                                    contentDescription = null,
                                    tint = MaterialTheme.extendedColors.xp,
                                    modifier = Modifier.size(LinguaVerseDimens.IconSmall)
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}
