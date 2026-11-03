package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Semantic colours Material 3 does not define: success, warning, destructive,
 * and the reward accents (XP, streak), plus the categorical palette used for
 * skill cards.
 */
@Immutable
data class ExtendedColors(
    // ── Success ────────────────────────────────────────────────────────────
    val success: Color,
    val successContainer: Color,
    val onSuccessContainer: Color,
    // ── Warning ────────────────────────────────────────────────────────────
    val warning: Color,
    val warningContainer: Color,
    val onWarningContainer: Color,
    // ── Destructive (beyond M3 error — for delete actions) ─────────────────
    val destructive: Color,
    val destructiveContainer: Color,
    val onDestructiveContainer: Color,
    // ── XP reward ──────────────────────────────────────────────────────────
    val xp: Color,
    val xpContainer: Color,
    val onXpContainer: Color,
    // ── Streak ─────────────────────────────────────────────────────────────
    val streak: Color,
    val streakContainer: Color,
    val onStreakContainer: Color,
    // ── Favorite ───────────────────────────────────────────────────────────
    val favorite: Color,
    // ── CEFR Level badges ──────────────────────────────────────────────────
    val levelBeginner: Color,
    val levelBeginnerContainer: Color,
    val levelIntermediate: Color,
    val levelIntermediateContainer: Color,
    val levelAdvanced: Color,
    val levelAdvancedContainer: Color,
    // ── Info ───────────────────────────────────────────────────────────────
    val info: Color,
    val infoContainer: Color,
    val onInfoContainer: Color,
    // ── Disabled states ────────────────────────────────────────────────────
    val disabledForeground: Color,
    val disabledContainer: Color,
    // ── Categorical accents for skill cards ────────────────────────────────
    val skillPalette: List<Color>
)

private val LightSkillPalette = listOf(
    Color(0xFF4F46E5), Color(0xFF0284C7), Color(0xFF059669), Color(0xFFD97706),
    Color(0xFF7C3AED), Color(0xFFDB2777), Color(0xFF4338CA), Color(0xFF0D9488),
    Color(0xFFEA580C), Color(0xFF2563EB), Color(0xFF65A30D), Color(0xFF9333EA),
    Color(0xFFC026D3), Color(0xFF0891B2)
)

private val DarkSkillPalette = listOf(
    Color(0xFF818CF8), Color(0xFF38BDF8), Color(0xFF34D399), Color(0xFFFBBF24),
    Color(0xFFA78BFA), Color(0xFFF472B6), Color(0xFF818CF8), Color(0xFF2DD4BF),
    Color(0xFFFB923C), Color(0xFF60A5FA), Color(0xFFA3E635), Color(0xFFC084FC),
    Color(0xFFE879F9), Color(0xFF22D3EE)
)

val LightExtendedColors = ExtendedColors(
    success = Color(0xFF15803D),
    successContainer = Color(0xFFDCFCE7),
    onSuccessContainer = Color(0xFF166534),
    warning = Color(0xFFD97706),
    warningContainer = Color(0xFFFEF3C7),
    onWarningContainer = Color(0xFFB45309),
    destructive = Color(0xFFDC2626),
    destructiveContainer = Color(0xFFFEE2E2),
    onDestructiveContainer = Color(0xFF7F1D1D),
    xp = Color(0xFFD97706),
    xpContainer = Color(0xFFFEF3C7),
    onXpContainer = Color(0xFFB45309),
    streak = Color(0xFFEA580C),
    streakContainer = Color(0xFFFFEDD5),
    onStreakContainer = Color(0xFFC2410C),
    favorite = Color(0xFFEF4444),
    levelBeginner = Color(0xFF15803D),
    levelBeginnerContainer = Color(0xFFDCFCE7),
    levelIntermediate = Color(0xFF4338CA),
    levelIntermediateContainer = Color(0xFFE0E7FF),
    levelAdvanced = Color(0xFF6B21A8),
    levelAdvancedContainer = Color(0xFFF3E8FF),
    info = Color(0xFF1E40AF),
    infoContainer = Color(0xFFEFF6FF),
    onInfoContainer = Color(0xFF1E3A5F),
    disabledForeground = Color(0xFFB0B3BF),
    disabledContainer = Color(0xFFF1F2F7),
    skillPalette = LightSkillPalette
)

val DarkExtendedColors = ExtendedColors(
    success = Color(0xFF4ADE80),
    successContainer = Color(0xFF14532D),
    onSuccessContainer = Color(0xFFBBF7D0),
    warning = Color(0xFFFBBF24),
    warningContainer = Color(0xFF4A2E05),
    onWarningContainer = Color(0xFFFDE68A),
    destructive = Color(0xFFF87171),
    destructiveContainer = Color(0xFF4A1515),
    onDestructiveContainer = Color(0xFFFECACA),
    xp = Color(0xFFFBBF24),
    xpContainer = Color(0xFF4A2E05),
    onXpContainer = Color(0xFFFDE68A),
    streak = Color(0xFFFB923C),
    streakContainer = Color(0xFF4A1D05),
    onStreakContainer = Color(0xFFFED7AA),
    favorite = Color(0xFFF87171),
    levelBeginner = Color(0xFF4ADE80),
    levelBeginnerContainer = Color(0xFF14532D),
    levelIntermediate = Color(0xFFA5B4FC),
    levelIntermediateContainer = Color(0xFF1E1B4B),
    levelAdvanced = Color(0xFFD8B4FE),
    levelAdvancedContainer = Color(0xFF2E1065),
    info = Color(0xFF93C5FD),
    infoContainer = Color(0xFF172554),
    onInfoContainer = Color(0xFFBFDBFE),
    disabledForeground = Color(0xFF5A5E6E),
    disabledContainer = Color(0xFF1E2538),
    skillPalette = DarkSkillPalette
)

val LocalExtendedColors = staticCompositionLocalOf { LightExtendedColors }

/** `MaterialTheme.extendedColors.success` reads naturally alongside `colorScheme`. */
val MaterialTheme.extendedColors: ExtendedColors
    @Composable
    @ReadOnlyComposable
    get() = LocalExtendedColors.current
