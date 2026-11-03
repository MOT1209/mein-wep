package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryIndigoDark,
    onPrimary = Color(0xFF1B1B3A),
    primaryContainer = Color(0xFF373080),
    onPrimaryContainer = Color(0xFFE2E1FF),
    secondary = SecondaryEmeraldDark,
    onSecondary = Color(0xFF00382A),
    secondaryContainer = Color(0xFF00513D),
    onSecondaryContainer = Color(0xFF9AF7D0),
    tertiary = TertiaryAmberDark,
    onTertiary = Color(0xFF402D00),
    tertiaryContainer = Color(0xFF5D4300),
    onTertiaryContainer = Color(0xFFFFDEA0),
    error = ErrorRedLight,
    onError = Color(0xFF601410),
    errorContainer = Color(0xFF8C1D18),
    onErrorContainer = Color(0xFFFFDAD6),
    background = SurfaceDark,
    onBackground = Color(0xFFE4E7F4),
    surface = SurfaceContainerDark,
    onSurface = Color(0xFFE4E7F4),
    surfaceTint = PrimaryIndigoDark,
    surfaceVariant = SurfaceContainerHighDark,
    onSurfaceVariant = Color(0xFFBDC3D7),
    outline = Color(0xFF8B91A7),
    outlineVariant = Color(0xFF41485F),
    inverseSurface = SurfaceContainerHighestDark,
    inverseOnSurface = Color(0xFF2B3756),
    inversePrimary = PrimaryIndigo,
    scrim = ScrimDark
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryIndigo,
    onPrimary = White,
    primaryContainer = Color(0xFFE3E2FF),
    onPrimaryContainer = Color(0xFF15134C),
    secondary = SecondaryEmerald,
    onSecondary = White,
    secondaryContainer = Color(0xFFB7F2DA),
    onSecondaryContainer = Color(0xFF002117),
    tertiary = TertiaryAmber,
    onTertiary = White,
    tertiaryContainer = Color(0xFFFFE4B4),
    onTertiaryContainer = Color(0xFF2B1A00),
    error = ErrorRed,
    onError = White,
    errorContainer = Color(0xFFFEE2E2),
    onErrorContainer = Color(0xFF7F1D1D),
    background = SurfaceLight,
    onBackground = Color(0xFF171923),
    surface = SurfaceContainerLight,
    onSurface = Color(0xFF171923),
    surfaceTint = PrimaryIndigo,
    surfaceVariant = SurfaceContainerHighLight,
    onSurfaceVariant = Color(0xFF5D6070),
    outline = Color(0xFF77798A),
    outlineVariant = Color(0xFFD9D9E5),
    inverseSurface = SurfaceContainerHighestLight,
    inverseOnSurface = Color(0xFFF0F1F8),
    inversePrimary = PrimaryIndigoLight,
    scrim = ScrimLight
)

@Composable
fun LinguaVerseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    CompositionLocalProvider(
        LocalExtendedColors provides if (darkTheme) DarkExtendedColors else LightExtendedColors
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = LinguaVerseTypography,
            shapes = LinguaVerseShapes,
            content = content
        )
    }
}
