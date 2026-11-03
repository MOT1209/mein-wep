package com.example.ui.components.display

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

// ── LinguaCard ──────────────────────────────────────────────────────────────────

@Composable
fun LinguaCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    backgroundColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    borderColor: Color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f),
    shape: Shape = RoundedCornerShape(LinguaVerseDimens.CardRadius),
    showBorder: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    val cardModifier = if (onClick != null) {
        modifier.clickable(
            interactionSource = remember { MutableInteractionSource() },
            indication = null
        ) { onClick() }
    } else {
        modifier
    }

    Surface(
        modifier = cardModifier
            .clip(shape)
            .then(
                if (showBorder) Modifier.border(1.dp, borderColor, shape)
                else Modifier
            ),
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

// ── LinguaChip ──────────────────────────────────────────────────────────────────

@Composable
fun LinguaChip(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    selectedColor: Color = MaterialTheme.colorScheme.primary,
    onSelectedColor: Color = MaterialTheme.colorScheme.onPrimary,
    unselectedColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    onUnselectedColor: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    icon: @Composable (() -> Unit)? = null
) {
    val bgColor by animateColorAsState(
        targetValue = if (selected) selectedColor else unselectedColor,
        animationSpec = tween(LinguaVerseDimens.MotionFast),
        label = "chip_bg"
    )
    val contentClr by animateColorAsState(
        targetValue = if (selected) onSelectedColor else onUnselectedColor,
        animationSpec = tween(LinguaVerseDimens.MotionFast),
        label = "chip_content"
    )
    val borderAlpha by animateDpAsState(
        targetValue = if (selected) 0.dp else 1.dp,
        animationSpec = tween(LinguaVerseDimens.MotionFast),
        label = "chip_border"
    )

    Surface(
        modifier = modifier
            .heightIn(min = LinguaVerseDimens.MinimumTouchTarget)
            .clip(MaterialTheme.shapes.extraSmall)
            .clickable(onClick = onClick),
        color = bgColor,
        shape = MaterialTheme.shapes.extraSmall,
        border = if (borderAlpha > 0.dp) {
            androidx.compose.foundation.BorderStroke(borderAlpha, contentClr.copy(alpha = 0.3f))
        } else null
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (icon != null) {
                icon()
                Spacer(modifier = Modifier.width(LinguaVerseDimens.InlineSpacing))
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge,
                color = contentClr,
                maxLines = 1
            )
        }
    }
}

// ── LinguaBadge ─────────────────────────────────────────────────────────────────

@Composable
fun LinguaBadge(
    text: String,
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.extendedColors.xpContainer,
    contentColor: Color = MaterialTheme.extendedColors.onXpContainer,
    icon: @Composable (() -> Unit)? = null,
    shape: Shape = RoundedCornerShape(LinguaVerseDimens.ControlRadius)
) {
    Surface(
        modifier = modifier.heightIn(min = 32.dp),
        color = containerColor,
        shape = shape
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (icon != null) {
                icon()
                Spacer(modifier = Modifier.width(6.dp))
            }
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge,
                color = contentColor
            )
        }
    }
}

// ── LinguaAvatar ────────────────────────────────────────────────────────────────

@Composable
fun LinguaAvatar(
    initials: String,
    modifier: Modifier = Modifier,
    size: Dp = LinguaVerseDimens.AvatarMedium,
    backgroundColor: Color = MaterialTheme.colorScheme.primaryContainer,
    contentColor: Color = MaterialTheme.colorScheme.onPrimaryContainer
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(backgroundColor),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = initials,
            style = MaterialTheme.typography.labelLarge,
            color = contentColor,
            fontWeight = FontWeight.Bold
        )
    }
}

// ── LinguaDivider ───────────────────────────────────────────────────────────────

@Composable
fun LinguaDivider(
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.outlineVariant,
    thickness: Dp = LinguaVerseDimens.DividerThickness
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(thickness)
            .background(color)
    )
}
