package com.example.ui.components.buttons

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonColors
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.ProvideTextStyle
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

enum class ButtonSize { Small, Medium, Large }

// ── Primary Button ──────────────────────────────────────────────────────────────

@Composable
fun LinguaPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    icon: ImageVector? = null,
    size: ButtonSize = ButtonSize.Medium
) {
    val containerColor by animateColorAsState(
        targetValue = if (enabled) MaterialTheme.colorScheme.primary
        else MaterialTheme.colorScheme.surfaceVariant,
        animationSpec = tween(LinguaVerseDimens.MotionFast),
        label = "btn_container"
    )
    val contentColor by animateColorAsState(
        targetValue = if (enabled) MaterialTheme.colorScheme.onPrimary
        else MaterialTheme.extendedColors.disabledForeground,
        animationSpec = tween(LinguaVerseDimens.MotionFast),
        label = "btn_content"
    )

    Button(
        onClick = { if (!loading) onClick() },
        modifier = modifier
            .defaultMinSize(
                minHeight = when (size) {
                    ButtonSize.Small -> LinguaVerseDimens.ButtonHeightSmall
                    ButtonSize.Medium -> LinguaVerseDimens.ButtonHeightMedium
                    ButtonSize.Large -> LinguaVerseDimens.ButtonHeightLarge
                }
            ),
        enabled = enabled && !loading,
        shape = MaterialTheme.shapes.small,
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor
        ),
        contentPadding = PaddingValues(
            horizontal = LinguaVerseDimens.ButtonHorizontalPadding,
            vertical = LinguaVerseDimens.CompactSpacing
        )
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                strokeWidth = 2.dp,
                color = contentColor
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
        } else if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
        }
        ProvideTextStyle(
            value = when (size) {
                ButtonSize.Small -> MaterialTheme.typography.labelMedium
                ButtonSize.Medium -> MaterialTheme.typography.labelLarge
                ButtonSize.Large -> MaterialTheme.typography.titleMedium
            }
        ) {
            Text(text = text)
        }
    }
}

// ── Secondary (Outlined) Button ─────────────────────────────────────────────────

@Composable
fun LinguaSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null,
    size: ButtonSize = ButtonSize.Medium
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .defaultMinSize(
                minHeight = when (size) {
                    ButtonSize.Small -> LinguaVerseDimens.ButtonHeightSmall
                    ButtonSize.Medium -> LinguaVerseDimens.ButtonHeightMedium
                    ButtonSize.Large -> LinguaVerseDimens.ButtonHeightLarge
                }
            ),
        enabled = enabled,
        shape = MaterialTheme.shapes.small,
        border = ButtonDefaults.outlinedButtonBorder(enabled = enabled),
        contentPadding = PaddingValues(
            horizontal = LinguaVerseDimens.ButtonHorizontalPadding,
            vertical = LinguaVerseDimens.CompactSpacing
        )
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
        }
        ProvideTextStyle(
            value = when (size) {
                ButtonSize.Small -> MaterialTheme.typography.labelMedium
                ButtonSize.Medium -> MaterialTheme.typography.labelLarge
                ButtonSize.Large -> MaterialTheme.typography.titleMedium
            }
        ) {
            Text(text = text)
        }
    }
}

// ── Text Button ─────────────────────────────────────────────────────────────────

@Composable
fun LinguaTextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null
) {
    TextButton(
        onClick = onClick,
        modifier = modifier.defaultMinSize(minHeight = LinguaVerseDimens.ButtonHeightSmall),
        enabled = enabled,
        shape = MaterialTheme.shapes.small,
        contentPadding = PaddingValues(
            horizontal = LinguaVerseDimens.CompactSpacing,
            vertical = LinguaVerseDimens.InlineSpacing
        )
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(LinguaVerseDimens.IconSmall)
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.InlineSpacing))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.SemiBold
        )
    }
}
