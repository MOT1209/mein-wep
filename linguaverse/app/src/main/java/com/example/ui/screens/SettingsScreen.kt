package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.BuildConfig
import com.example.data.model.Language
import com.example.ui.components.AudioSpeedSelector
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.display.LinguaDivider
import com.example.ui.theme.LinguaVerseDimens

@Composable
fun SettingsScreen(
    isDarkTheme: Boolean,
    audioSpeed: Float,
    languages: List<Language>,
    targetLanguageCode: String,
    onToggleDarkTheme: () -> Unit,
    onSetAudioSpeed: (Float) -> Unit,
    onSelectLanguage: (String) -> Unit,
    onOpenAdminPanel: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isOfflineDownloaded by remember { mutableStateOf(true) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding)
            .testTag("settings_screen"),
        contentPadding = PaddingValues(
            top = LinguaVerseDimens.ScreenVerticalPadding,
            bottom = LinguaVerseDimens.SectionSpacing
        ),
        verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing)
    ) {
        item {
            Text(
                text = stringResource(R.string.settings_title),
                style = MaterialTheme.typography.headlineSmall
            )
        }

        // ── Appearance ──────────────────────────────────────────────────────
        item {
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                SettingsSectionHeader(
                    icon = Icons.Default.Palette,
                    title = stringResource(R.string.appearance)
                )
                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                SettingsToggleRow(
                    icon = Icons.Default.DarkMode,
                    title = stringResource(R.string.dark_mode),
                    checked = isDarkTheme,
                    onToggle = { onToggleDarkTheme() },
                    testTag = "dark_mode_switch"
                )
            }
        }

        // ── Audio & Speech ──────────────────────────────────────────────────
        item {
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                SettingsSectionHeader(
                    icon = Icons.Default.GraphicEq,
                    title = stringResource(R.string.audio_pronunciation)
                )
                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Speed,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                        Text(
                            text = stringResource(R.string.default_audio_speed),
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                    AudioSpeedSelector(
                        currentSpeed = audioSpeed,
                        onSpeedSelected = onSetAudioSpeed
                    )
                }
            }
        }

        // ── Storage & Offline ───────────────────────────────────────────────
        item {
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                SettingsSectionHeader(
                    icon = Icons.Default.CloudDownload,
                    title = stringResource(R.string.offline_content)
                )
                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                SettingsToggleRow(
                    icon = Icons.Default.Storage,
                    title = stringResource(R.string.offline_mode_packs),
                    subtitle = stringResource(R.string.offline_description),
                    checked = isOfflineDownloaded,
                    onToggle = { isOfflineDownloaded = !isOfflineDownloaded }
                )
            }
        }

        // ── Admin Panel (Debug only) ────────────────────────────────────────
        if (BuildConfig.DEBUG) item {
            LinguaCard(
                modifier = Modifier.fillMaxWidth().testTag("open_admin_panel_card"),
                onClick = { onOpenAdminPanel() },
                backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                borderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AdminPanelSettings,
                        contentDescription = stringResource(R.string.admin),
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(LinguaVerseDimens.IconLarge)
                    )
                    Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = stringResource(R.string.admin_panel),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = stringResource(R.string.admin_description),
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

// ── Reusable Settings Helpers ───────────────────────────────────────────────────

@Composable
private fun SettingsSectionHeader(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(LinguaVerseDimens.IconMedium)
        )
        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium
        )
    }
}

@Composable
private fun SettingsToggleRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String? = null,
    checked: Boolean,
    onToggle: () -> Unit,
    testTag: String? = null
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(LinguaVerseDimens.IconMedium)
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
            if (subtitle != null) {
                Column {
                    Text(text = title, style = MaterialTheme.typography.bodyLarge)
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                Text(text = title, style = MaterialTheme.typography.bodyLarge)
            }
        }
        Switch(
            checked = checked,
            onCheckedChange = { onToggle() },
            modifier = testTag?.let { Modifier.testTag(it) } ?: Modifier
        )
    }
}
