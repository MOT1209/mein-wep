package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.ui.components.buttons.ButtonSize
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.components.buttons.LinguaSecondaryButton
import com.example.ui.components.buttons.LinguaTextButton
import com.example.ui.components.display.LinguaAvatar
import com.example.ui.components.display.LinguaBadge
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.display.LinguaChip
import com.example.ui.components.display.LinguaDivider
import com.example.ui.components.feedback.LinguaSnackbar
import com.example.ui.components.feedback.SnackbarType
import com.example.ui.components.inputs.LinguaTextField
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.LinguaVerseTheme
import com.example.ui.theme.extendedColors

/**
 * Complete design-system sticker sheet — every reusable component in one view.
 *
 * Use this composable to visually verify the entire system at a glance.
 * Access via Compose Preview or navigate to a debug-only route.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DesignSystemStickerSheet() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.SectionSpacing)
    ) {
        // ── Header ─────────────────────────────────────────────────────────────
        Text(
            text = "LinguaVerse Design System",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            text = "Sticker Sheet — All Components",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        // ── Color Palette ──────────────────────────────────────────────────────
        SectionTitle("Color Palette")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ColorSwatch("Primary", MaterialTheme.colorScheme.primary)
            ColorSwatch("Secondary", MaterialTheme.colorScheme.secondary)
            ColorSwatch("Tertiary", MaterialTheme.colorScheme.tertiary)
            ColorSwatch("Error", MaterialTheme.colorScheme.error)
            ColorSwatch("Success", MaterialTheme.extendedColors.success)
            ColorSwatch("Warning", MaterialTheme.extendedColors.warning)
            ColorSwatch("XP", MaterialTheme.extendedColors.xp)
            ColorSwatch("Streak", MaterialTheme.extendedColors.streak)
            ColorSwatch("Favorite", MaterialTheme.extendedColors.favorite)
            ColorSwatch("Info", MaterialTheme.extendedColors.info)
        }

        LinguaDivider()

        // ── Typography ─────────────────────────────────────────────────────────
        SectionTitle("Typography")
        Text(text = "displaySmall", style = MaterialTheme.typography.displaySmall)
        Text(text = "headlineSmall", style = MaterialTheme.typography.headlineSmall)
        Text(text = "titleLarge", style = MaterialTheme.typography.titleLarge)
        Text(text = "titleMedium", style = MaterialTheme.typography.titleMedium)
        Text(text = "bodyLarge", style = MaterialTheme.typography.bodyLarge)
        Text(text = "bodyMedium", style = MaterialTheme.typography.bodyMedium)
        Text(text = "labelLarge", style = MaterialTheme.typography.labelLarge)
        Text(text = "labelMedium", style = MaterialTheme.typography.labelMedium)
        Text(text = "labelSmall", style = MaterialTheme.typography.labelSmall)

        LinguaDivider()

        // ── Buttons ────────────────────────────────────────────────────────────
        SectionTitle("Buttons")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LinguaPrimaryButton(text = "Primary", onClick = {})
            LinguaSecondaryButton(text = "Secondary", onClick = {})
            LinguaTextButton(text = "Text Button", onClick = {})
        }
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LinguaPrimaryButton(text = "Small", onClick = {}, size = ButtonSize.Small)
            LinguaPrimaryButton(text = "Medium", onClick = {}, size = ButtonSize.Medium)
            LinguaPrimaryButton(text = "Large", onClick = {}, size = ButtonSize.Large)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            LinguaPrimaryButton(text = "Loading", onClick = {}, loading = true)
            LinguaPrimaryButton(text = "Disabled", onClick = {}, enabled = false)
        }
        LinguaPrimaryButton(
            text = "With Icon",
            onClick = {},
            icon = Icons.Filled.Star
        )

        LinguaDivider()

        // ── Inputs ─────────────────────────────────────────────────────────────
        SectionTitle("Inputs")
        LinguaTextField(
            value = "",
            onValueChange = {},
            label = "Email",
            placeholder = "you@example.com",
            leadingIcon = Icons.Filled.Face
        )
        LinguaTextField(
            value = "Search...",
            onValueChange = {},
            placeholder = "Search",
            leadingIcon = Icons.Filled.Search
        )

        LinguaDivider()

        // ── Cards ──────────────────────────────────────────────────────────────
        SectionTitle("Cards")
        LinguaCard {
            Text(
                text = "Default Card",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "This is a standard card with default padding and elevation.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        LinguaCard(onClick = { /* clickable card */ }) {
            Text(
                text = "Clickable Card",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }

        LinguaDivider()

        // ── Chips ──────────────────────────────────────────────────────────────
        SectionTitle("Chips")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LinguaChip(text = "Unselected", onClick = {}, selected = false)
            LinguaChip(text = "Selected", onClick = {}, selected = true)
            LinguaChip(
                text = "With Icon",
                onClick = {},
                selected = true,
                icon = { androidx.compose.material3.Icon(Icons.Filled.Star, null, Modifier.size(16.dp)) }
            )
        }

        // ── Badges ─────────────────────────────────────────────────────────────
        SectionTitle("Badges")
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LinguaBadge(text = "150 XP", containerColor = MaterialTheme.extendedColors.xpContainer, contentColor = MaterialTheme.extendedColors.onXpContainer)
            LinguaBadge(text = "7 Days", containerColor = MaterialTheme.extendedColors.streakContainer, contentColor = MaterialTheme.extendedColors.onStreakContainer)
            LinguaBadge(text = "A1", containerColor = MaterialTheme.extendedColors.levelBeginnerContainer, contentColor = MaterialTheme.extendedColors.levelBeginner)
            LinguaBadge(text = "B2", containerColor = MaterialTheme.extendedColors.levelIntermediateContainer, contentColor = MaterialTheme.extendedColors.levelIntermediate)
            LinguaBadge(text = "C1", containerColor = MaterialTheme.extendedColors.levelAdvancedContainer, contentColor = MaterialTheme.extendedColors.levelAdvanced)
        }

        LinguaDivider()

        // ── Avatars ────────────────────────────────────────────────────────────
        SectionTitle("Avatars")
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            LinguaAvatar(initials = "JD", size = LinguaVerseDimens.AvatarSmall)
            LinguaAvatar(initials = "JD", size = LinguaVerseDimens.AvatarMedium)
            LinguaAvatar(initials = "JD", size = LinguaVerseDimens.AvatarLarge)
            LinguaAvatar(initials = "JD", size = LinguaVerseDimens.AvatarExtraLarge)
        }

        LinguaDivider()

        // ── Snackbar ───────────────────────────────────────────────────────────
        SectionTitle("Snackbars")
        LinguaSnackbar(message = "This is an info message", type = SnackbarType.Info)
        Spacer(modifier = Modifier.height(4.dp))
        LinguaSnackbar(message = "Lesson completed!", type = SnackbarType.Success)
        Spacer(modifier = Modifier.height(4.dp))
        LinguaSnackbar(message = "Check your answer", type = SnackbarType.Warning)
        Spacer(modifier = Modifier.height(4.dp))
        LinguaSnackbar(message = "Something went wrong", type = SnackbarType.Error)

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleLarge,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onBackground
    )
}

@Composable
private fun ColorSwatch(name: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = name,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// ── Previews ────────────────────────────────────────────────────────────────────

@Preview(showBackground = true, name = "Sticker Sheet — Light")
@Composable
private fun StickerSheetLightPreview() {
    LinguaVerseTheme(darkTheme = false) {
        DesignSystemStickerSheet()
    }
}

@Preview(showBackground = true, name = "Sticker Sheet — Dark", uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES)
@Composable
private fun StickerSheetDarkPreview() {
    LinguaVerseTheme(darkTheme = true) {
        DesignSystemStickerSheet()
    }
}
