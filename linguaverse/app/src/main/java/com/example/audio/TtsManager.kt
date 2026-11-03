package com.example.audio

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

class TtsManager(context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isInitialized = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true
        } else {
            Log.e("TtsManager", "TTS Initialization failed with status: $status")
        }
    }

    fun speak(text: String, languageCode: String, speedRate: Float = 1.0f) {
        if (!isInitialized || tts == null) return

        val locale = getLocaleForLanguageCode(languageCode)
        val result = tts?.isLanguageAvailable(locale)
        if (result == null || result < TextToSpeech.LANG_AVAILABLE) {
            Log.w("TtsManager", "Language not available: $languageCode (result=$result)")
            return
        }
        @Suppress("DEPRECATION")
        tts?.language = locale
        tts?.setSpeechRate(speedRate)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "linguaverse_tts_id")
    }

    fun stop() {
        tts?.stop()
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }

    private fun getLocaleForLanguageCode(code: String): Locale {
        return when (code.lowercase()) {
            "ar" -> Locale("ar")
            "en" -> Locale.ENGLISH
            "de" -> Locale.GERMANY
            "fr" -> Locale.FRANCE
            "es" -> Locale("es", "ES")
            "tr" -> Locale("tr", "TR")
            "it" -> Locale.ITALY
            "pt" -> Locale("pt", "PT")
            "ru" -> Locale("ru", "RU")
            "ja" -> Locale.JAPAN
            "ko" -> Locale.KOREA
            "zh" -> Locale.CHINA
            else -> Locale.ENGLISH
        }
    }
}
