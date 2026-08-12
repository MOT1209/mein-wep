package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ai.AiFailure
import com.example.data.model.CefrLevel

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = MaterialTheme.colorScheme.surfaceContainerHigh.copy(alpha = 0.85f),
    borderColor: Color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f),
    shape: RoundedCornerShape = RoundedCornerShape(20.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = modifier
            .clip(shape)
            .border(1.dp, borderColor, shape),
        color = backgroundColor,
        shape = shape,
        tonalElevation = 2.dp,
        shadowElevation = 4.dp
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = content
        )
    }
}

@Composable
fun XpBadge(
    xp: Int,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.testTag("xp_badge"),
        color = Color(0xFFFEF3C7),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.Stars,
                contentDescription = "XP Points",
                tint = Color(0xFFD97706),
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "$xp XP",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = Color(0xFFB45309)
            )
        }
    }
}

@Composable
fun StreakBadge(
    streakCount: Int,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.testTag("streak_badge"),
        color = Color(0xFFFFEDD5),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.LocalFireDepartment,
                contentDescription = "Streak",
                tint = Color(0xFFEA580C),
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "$streakCount Days",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = Color(0xFFC2410C)
            )
        }
    }
}

@Composable
fun LevelChip(
    level: CefrLevel,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (level) {
        CefrLevel.A1, CefrLevel.A2 -> Color(0xFFDCFCE7) to Color(0xFF15803D)
        CefrLevel.B1, CefrLevel.B2 -> Color(0xFFE0E7FF) to Color(0xFF4338CA)
        CefrLevel.C1, CefrLevel.C2 -> Color(0xFFF3E8FF) to Color(0xFF6B21A8)
    }

    Surface(
        modifier = modifier.testTag("level_chip"),
        color = bgColor,
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = level.code,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 12.sp,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun AudioSpeedSelector(
    currentSpeed: Float,
    onSpeedSelected: (Float) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceContainerHighest)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        val speeds = listOf(0.5f, 0.8f, 1.0f)
        speeds.forEach { speed ->
            val isSelected = currentSpeed == speed
            val bgColor = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
            val textColor = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant

            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(bgColor)
                    .clickable { onSpeedSelected(speed) }
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "${speed}x",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = textColor
                )
            }
        }
    }
}

/**
 * Tells the user plainly that an AI request failed. The app used to present a
 * hard-coded reply in this situation, so an outage looked like a working tutor.
 */
@Composable
fun AiErrorBanner(
    failure: AiFailure,
    modifier: Modifier = Modifier
) {
    val message = when (failure) {
        AiFailure.NOT_CONFIGURED ->
            "AI tutor is not set up. Add a Gemini API key to enable live responses."
        AiFailure.UNREACHABLE ->
            "Couldn't reach the AI tutor. Check your connection and try again."
        AiFailure.EMPTY_RESPONSE ->
            "The AI tutor didn't return an answer. Please try again."
    }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("ai_error_banner"),
        color = MaterialTheme.colorScheme.errorContainer
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Filled.ErrorOutline,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onErrorContainer,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = message,
                fontSize = 13.sp,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
        }
    }
}

@Composable
fun DailyGoalProgressRing(
    currentXp: Int,
    goalXp: Int,
    modifier: Modifier = Modifier
) {
    val progress = (currentXp.toFloat() / goalXp.toFloat()).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 800),
        label = "progress"
    )

    Box(
        modifier = modifier.size(64.dp),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            progress = { animatedProgress },
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF10B981),
            strokeWidth = 6.dp,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "$currentXp",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "/$goalXp",
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
