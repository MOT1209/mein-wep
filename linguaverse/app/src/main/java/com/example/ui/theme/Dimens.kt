package com.example.ui.theme

import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LinguaVerseDimens {
    // ── Screen & Layout ────────────────────────────────────────────────────
    val ScreenHorizontalPadding = 20.dp
    val ScreenVerticalPadding = 16.dp
    val SectionSpacing = 24.dp
    val ComponentSpacing = 12.dp
    val CompactSpacing = 8.dp
    val InlineSpacing = 4.dp

    // ── Cards ──────────────────────────────────────────────────────────────
    val CardPadding = 18.dp
    val CardRadius = 20.dp
    val LargeCardRadius = 26.dp
    val CardElevation = 2.dp
    val FloatingElevation = 6.dp

    // ── Controls (Buttons, Inputs) ─────────────────────────────────────────
    val ControlRadius = 14.dp
    val PillRadius = 100.dp
    val MinimumTouchTarget = 48.dp

    val ButtonHeightSmall = 36.dp
    val ButtonHeightMedium = 48.dp
    val ButtonHeightLarge = 56.dp
    val ButtonHorizontalPadding = 24.dp
    val ButtonIconPadding = 12.dp

    val InputHeight = 56.dp
    val InputRadius = 14.dp
    val InputPaddingHorizontal = 16.dp
    val InputPaddingVertical = 12.dp

    // ── Icons ──────────────────────────────────────────────────────────────
    val IconSmall = 18.dp
    val IconMedium = 24.dp
    val IconLarge = 32.dp

    // ── Avatars ────────────────────────────────────────────────────────────
    val AvatarSmall = 32.dp
    val AvatarMedium = 48.dp
    val AvatarLarge = 64.dp
    val AvatarExtraLarge = 96.dp

    // ── Dividers ───────────────────────────────────────────────────────────
    val DividerThickness = 1.dp

    // ── Bottom Navigation ──────────────────────────────────────────────────
    val BottomBarHeight = 80.dp
    val BottomBarIconSize = 24.dp

    // ── Motion (milliseconds) ─────────────────────────────────────────────
    const val MotionFast = 180
    const val MotionStandard = 280
    const val MotionSlow = 400
    const val MotionCelebration = 700

    // ── Typography extras (for easy access in composables) ─────────────────
    val ExtraSmallFontSize = 11.sp
    val SmallFontSize = 12.sp
    val MediumFontSize = 14.sp
    val LargeFontSize = 16.sp
}
