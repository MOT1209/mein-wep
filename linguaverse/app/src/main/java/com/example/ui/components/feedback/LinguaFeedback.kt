package com.example.ui.components.feedback

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircleOutline
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.components.buttons.LinguaSecondaryButton
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

enum class SnackbarType { Info, Success, Warning, Error }

// ── LinguaSnackbar ──────────────────────────────────────────────────────────────

@Composable
fun LinguaSnackbar(
    message: String,
    type: SnackbarType = SnackbarType.Info,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    onDismiss: (() -> Unit)? = null,
    visible: Boolean = true
) {
    val (containerColor, icon, iconTint) = when (type) {
        SnackbarType.Info -> Triple(
            MaterialTheme.colorScheme.inverseSurface,
            Icons.Filled.Info,
            MaterialTheme.colorScheme.inverseOnSurface
        )
        SnackbarType.Success -> Triple(
            MaterialTheme.extendedColors.successContainer,
            Icons.Filled.CheckCircleOutline,
            MaterialTheme.extendedColors.onSuccessContainer
        )
        SnackbarType.Warning -> Triple(
            MaterialTheme.extendedColors.warningContainer,
            Icons.Filled.Warning,
            MaterialTheme.extendedColors.onWarningContainer
        )
        SnackbarType.Error -> Triple(
            MaterialTheme.colorScheme.errorContainer,
            Icons.Filled.ErrorOutline,
            MaterialTheme.colorScheme.onErrorContainer
        )
    }
    val textColor = when (type) {
        SnackbarType.Info -> MaterialTheme.colorScheme.inverseOnSurface
        SnackbarType.Success -> MaterialTheme.extendedColors.onSuccessContainer
        SnackbarType.Warning -> MaterialTheme.extendedColors.onWarningContainer
        SnackbarType.Error -> MaterialTheme.colorScheme.onErrorContainer
    }

    AnimatedVisibility(
        visible = visible,
        enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
        exit = slideOutVertically(targetOffsetY = { it }) + fadeOut(),
        modifier = modifier
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.small,
            color = containerColor,
            shadowElevation = LinguaVerseDimens.FloatingElevation
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = textColor,
                    modifier = Modifier.weight(1f)
                )
                if (actionLabel != null && onAction != null) {
                    TextButton(onClick = onAction) {
                        Text(
                            text = actionLabel,
                            style = MaterialTheme.typography.labelLarge,
                            color = textColor
                        )
                    }
                }
            }
        }
    }
}

// ── LinguaDialog ────────────────────────────────────────────────────────────────

@Composable
fun LinguaDialog(
    title: String,
    message: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    confirmLabel: String = "OK",
    onConfirm: (() -> Unit)? = null,
    dismissLabel: String = "Cancel",
    icon: ImageVector? = null,
    iconTint: Color = MaterialTheme.colorScheme.primary
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = if (icon != null) {
            { Icon(imageVector = icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(32.dp)) }
        } else null,
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center
            )
        },
        text = {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
        },
        confirmButton = {
            LinguaPrimaryButton(
                text = confirmLabel,
                onClick = { onConfirm?.invoke() ?: onDismiss() }
            )
        },
        dismissButton = {
            if (onConfirm != null) {
                LinguaSecondaryButton(
                    text = dismissLabel,
                    onClick = onDismiss
                )
            }
        },
        shape = MaterialTheme.shapes.large,
        containerColor = MaterialTheme.colorScheme.surface
    )
}

// ── LoadingIndicator ────────────────────────────────────────────────────────────

@Composable
fun LoadingIndicator(
    modifier: Modifier = Modifier,
    message: String = "",
    size: Int = 40
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator(
            modifier = Modifier.size(size.dp),
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 3.dp
        )
        if (message.isNotEmpty()) {
            Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

// ── EmptyState ──────────────────────────────────────────────────────────────────

@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(LinguaVerseDimens.SectionSpacing),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        if (actionLabel != null && onAction != null) {
            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))
            LinguaPrimaryButton(
                text = actionLabel,
                onClick = onAction
            )
        }
    }
}
