package com.example.ui.components

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.ai.AiFailure
import com.example.data.model.CefrLevel
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

// ── Legacy GlassCard — kept for backward compatibility ──────────────────────────
// Prefer LinguaCard from display/LinguaDisplay.kt for new code.

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.CardElevation),
    borderColor: Color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f),
    shape: Shape = RoundedCornerShape(LinguaVerseDimens.CardRadius),
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier
            .animateContentSize(animationSpec = tween(LinguaVerseDimens.MotionStandard))
            .clip(shape)
            .border(1.dp, borderColor, shape),
        color = backgroundColor,
        shape = shape,
        tonalElevation = LinguaVerseDimens.CardElevation,
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier.padding(LinguaVerseDimens.CardPadding),
            content = content
        )
    }
}

// ── XpBadge — kept, now backed by LinguaBadge semantics ─────────────────────────

@Composable
fun XpBadge(xp: Int, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.heightIn(min = LinguaVerseDimens.MinimumTouchTarget),
        color = MaterialTheme.extendedColors.xpContainer,
        shape = RoundedCornerShape(LinguaVerseDimens.ControlRadius)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.Stars,
                contentDescription = stringResource(R.string.xp_points),
                tint = MaterialTheme.extendedColors.xp,
                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "$xp XP",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.extendedColors.onXpContainer
            )
        }
    }
}

// ── StreakBadge ─────────────────────────────────────────────────────────────────

@Composable
fun StreakBadge(streakCount: Int, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.heightIn(min = LinguaVerseDimens.MinimumTouchTarget),
        color = MaterialTheme.extendedColors.streakContainer,
        shape = RoundedCornerShape(LinguaVerseDimens.ControlRadius)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.LocalFireDepartment,
                contentDescription = stringResource(R.string.streak),
                tint = MaterialTheme.extendedColors.streak,
                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "$streakCount Days",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.extendedColors.onStreakContainer
            )
        }
    }
}

// ── LevelChip — uses new levelBeginner color from ExtendedColors ────────────────

@Composable
fun LevelChip(level: CefrLevel, modifier: Modifier = Modifier) {
    val (background, content) = when (level) {
        CefrLevel.A1, CefrLevel.A2 -> MaterialTheme.extendedColors.levelBeginnerContainer to MaterialTheme.extendedColors.levelBeginner
        CefrLevel.B1, CefrLevel.B2 -> MaterialTheme.extendedColors.levelIntermediateContainer to MaterialTheme.extendedColors.levelIntermediate
        CefrLevel.C1, CefrLevel.C2 -> MaterialTheme.extendedColors.levelAdvancedContainer to MaterialTheme.extendedColors.levelAdvanced
    }

    Surface(
        modifier = modifier.heightIn(min = 28.dp),
        color = background,
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = level.code,
            style = MaterialTheme.typography.labelMedium,
            color = content,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp)
        )
    }
}

// ── AudioSpeedSelector ──────────────────────────────────────────────────────────

@Composable
fun AudioSpeedSelector(
    currentSpeed: Float,
    onSpeedSelected: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        listOf(0.5f, 0.8f, 1.0f).forEach { speed ->
            val selected = currentSpeed == speed
            Surface(
                modifier = Modifier
                    .heightIn(min = 40.dp)
                    .clip(CircleShape)
                    .clickable { onSpeedSelected(speed) },
                color = if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
                shape = CircleShape
            ) {
                Box(
                    modifier = Modifier.padding(horizontal = 11.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "${speed}x",
                        style = MaterialTheme.typography.labelMedium,
                        color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

// ── AiErrorBanner ───────────────────────────────────────────────────────────────

@Composable
fun AiErrorBanner(failure: AiFailure, modifier: Modifier = Modifier) {
    val message = when (failure) {
        AiFailure.NOT_CONFIGURED -> "AI tutor is not set up. Add a Gemini API key to enable live responses."
        AiFailure.UNREACHABLE -> "Couldn't reach the AI tutor. Check your connection and try again."
        AiFailure.EMPTY_RESPONSE -> "The AI tutor didn't return an answer. Please try again."
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.errorContainer,
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.ErrorOutline,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer,
                modifier = Modifier.size(LinguaVerseDimens.IconMedium)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

// ── DailyGoalProgressRing ───────────────────────────────────────────────────────

@Composable
fun DailyGoalProgressRing(
    currentXp: Int,
    goalXp: Int,
    modifier: Modifier = Modifier
) {
    val progress = if (goalXp > 0) (currentXp.toFloat() / goalXp).coerceIn(0f, 1f) else 0f
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = LinguaVerseDimens.MotionCelebration),
        label = "daily_goal_progress"
    )

    Box(
        modifier = modifier.size(64.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            progress = { animatedProgress },
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.extendedColors.success,
            strokeWidth = 6.dp,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$currentXp",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "/$goalXp",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
