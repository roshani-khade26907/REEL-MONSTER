package com.reelmonster.data

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.dataStore by preferencesDataStore(name = "reel_monster_prefs")

enum class OperatingLevel {
    LEVEL_1_MANUAL,
    LEVEL_2_AUTOMATIC
}

class MonsterPreferences(private val context: Context) {

    private object PreferencesKeys {
        val OPERATING_LEVEL = stringPreferencesKey("operating_level")
        val OVERLAY_ENABLED = booleanPreferencesKey("overlay_enabled")
        val OVERLAY_X = intPreferencesKey("overlay_pos_x")
        val OVERLAY_Y = intPreferencesKey("overlay_pos_y")
        val MONSTER_SCALE_SENSITIVITY = floatPreferencesKey("monster_scale_sensitivity")
        val SPEECH_BUBBLES_ENABLED = booleanPreferencesKey("speech_bubbles_enabled")
        val HAPTIC_ENABLED = booleanPreferencesKey("haptic_enabled")
        val COOLDOWN_MS = longPreferencesKey("cooldown_ms")
    }

    val operatingLevelFlow: Flow<OperatingLevel> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) emit(emptyPreferences()) else throw exception
        }
        .map { preferences ->
            val levelName = preferences[PreferencesKeys.OPERATING_LEVEL] ?: OperatingLevel.LEVEL_1_MANUAL.name
            try {
                OperatingLevel.valueOf(levelName)
            } catch (e: Exception) {
                OperatingLevel.LEVEL_1_MANUAL
            }
        }

    val overlayEnabledFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[PreferencesKeys.OVERLAY_ENABLED] ?: false }

    val speechBubblesEnabledFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[PreferencesKeys.SPEECH_BUBBLES_ENABLED] ?: true }

    val hapticEnabledFlow: Flow<Boolean> = context.dataStore.data
        .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
        .map { it[PreferencesKeys.HAPTIC_ENABLED] ?: true }

    suspend fun setOperatingLevel(level: OperatingLevel) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.OPERATING_LEVEL] = level.name
        }
    }

    suspend fun setOverlayEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.OVERLAY_ENABLED] = enabled
        }
    }

    suspend fun saveOverlayPosition(x: Int, y: Int) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.OVERLAY_X] = x
            preferences[PreferencesKeys.OVERLAY_Y] = y
        }
    }

    suspend fun setSpeechBubblesEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.SPEECH_BUBBLES_ENABLED] = enabled
        }
    }

    suspend fun setHapticEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.HAPTIC_ENABLED] = enabled
        }
    }
}
