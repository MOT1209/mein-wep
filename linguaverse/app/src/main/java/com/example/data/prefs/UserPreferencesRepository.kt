package com.example.data.prefs

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.preferencesDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "linguaverse_preferences"
)

data class UserPreferences(
    val isDarkTheme: Boolean = false,
    val audioSpeed: Float = DEFAULT_AUDIO_SPEED
) {
    companion object {
        const val DEFAULT_AUDIO_SPEED = 1.0f
    }
}

/**
 * Persists the settings the user chooses. These were previously held only in
 * MutableStateFlow inside the ViewModel, so dark mode and audio speed silently
 * reset to their defaults every time the app was restarted.
 */
class UserPreferencesRepository(context: Context) {

    private val dataStore = context.applicationContext.preferencesDataStore

    val preferences: Flow<UserPreferences> = dataStore.data
        .catch { throwable ->
            // A corrupt preferences file must not take the app down; fall back
            // to defaults instead.
            if (throwable is IOException) emit(emptyPreferences()) else throw throwable
        }
        .map { prefs ->
            UserPreferences(
                isDarkTheme = prefs[KEY_DARK_THEME] ?: false,
                audioSpeed = prefs[KEY_AUDIO_SPEED] ?: UserPreferences.DEFAULT_AUDIO_SPEED
            )
        }

    suspend fun setDarkTheme(enabled: Boolean) {
        dataStore.edit { it[KEY_DARK_THEME] = enabled }
    }

    suspend fun setAudioSpeed(speed: Float) {
        dataStore.edit { it[KEY_AUDIO_SPEED] = speed }
    }

    private companion object {
        val KEY_DARK_THEME = booleanPreferencesKey("dark_theme")
        val KEY_AUDIO_SPEED = floatPreferencesKey("audio_speed")
    }
}
