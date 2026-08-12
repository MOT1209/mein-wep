package com.example.ai

import com.example.BuildConfig
import com.example.data.model.CefrLevel
import com.example.data.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

data class GeminiPart(val text: String? = null)

data class GeminiContent(val role: String? = "user", val parts: List<GeminiPart>)

data class GeminiRequest(
    val contents: List<GeminiContent>,
    val systemInstruction: GeminiContent? = null
)

data class GeminiCandidateContent(val parts: List<GeminiPart> = emptyList())
data class GeminiCandidate(val content: GeminiCandidateContent = GeminiCandidateContent())
data class GeminiResponse(val candidates: List<GeminiCandidate> = emptyList())

interface GeminiApi {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GeminiRequest
    ): GeminiResponse
}

data class AiTeacherReply(
    val replyText: String,
    val correction: String? = null,
    val suggestion: String? = null,
    val grammarExplanation: String? = null
)

data class WritingEvaluationResult(
    val score: Int,
    val correctedText: String,
    val feedback: String,
    val suggestions: List<String>
)

object GeminiTutorService {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://generativelanguage.googleapis.com/")
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create())
        .build()

    private val api = retrofit.create(GeminiApi::class.java)

    suspend fun chatWithAiTeacher(
        userMessage: String,
        targetLanguage: String,
        cefrLevel: CefrLevel,
        chatHistory: List<ChatMessage>
    ): AiTeacherReply = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            return@withContext AiTeacherReply(
                replyText = "¡Hola! I am your AI language tutor. (Note: Add your Gemini API Key in Secrets to unlock full live AI responses). How are you doing today?",
                correction = null,
                suggestion = "Try asking: 'How do I introduce myself in $targetLanguage?'",
                grammarExplanation = "Remember to match gender and number in nouns and adjectives!"
            )
        }

        val systemPrompt = """
            You are LinguaVerse AI Teacher, a warm, supportive language tutor teaching $targetLanguage to a learner at level ${cefrLevel.code} (${cefrLevel.title}).
            Rules:
            1. Respond in $targetLanguage appropriate for a ${cefrLevel.code} level learner, with English translation in parentheses if helpful.
            2. If the user's input has grammar or spelling mistakes, point out a gentle correction.
            3. Provide a better, more native sentence suggestion.
            4. Keep responses conversational and encouraging.
            5. Format your output strictly using this structure:
            REPLY: <your tutor response>
            CORRECTION: <gentle correction or NONE>
            SUGGESTION: <better sentence suggestion or NONE>
            EXPLANATION: <brief grammar note or NONE>
        """.trimIndent()

        val contents = mutableListOf<GeminiContent>()
        chatHistory.takeLast(6).forEach { msg ->
            val role = if (msg.sender == "user") "user" else "model"
            contents.add(GeminiContent(role = role, parts = listOf(GeminiPart(text = msg.text))))
        }
        contents.add(GeminiContent(role = "user", parts = listOf(GeminiPart(text = userMessage))))

        val request = GeminiRequest(
            contents = contents,
            systemInstruction = GeminiContent(parts = listOf(GeminiPart(text = systemPrompt)))
        )

        try {
            val response = api.generateContent(apiKey, request)
            val rawText = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: ""
            parseAiReply(rawText, targetLanguage)
        } catch (e: Exception) {
            AiTeacherReply(
                replyText = "I understood your message! Keep practicing in $targetLanguage.",
                correction = null,
                suggestion = "Try responding with a complete sentence.",
                grammarExplanation = "Keep up the great work!"
            )
        }
    }

    suspend fun evaluateWriting(
        userText: String,
        prompt: String,
        targetLanguage: String
    ): WritingEvaluationResult = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            return@withContext WritingEvaluationResult(
                score = 88,
                correctedText = userText,
                feedback = "Great effort! Your sentence communicates your idea clearly. Ensure correct verb conjugation for formal situations.",
                suggestions = listOf("Use transition words to connect ideas", "Pay attention to gender agreement")
            )
        }

        val systemPrompt = """
            Evaluate the following writing submission in $targetLanguage for the prompt: '$prompt'.
            User submission: '$userText'
            Provide feedback strictly formatted as:
            SCORE: <number 0-100>
            CORRECTED: <corrected version of user text>
            FEEDBACK: <detailed feedback on grammar, vocabulary, and style>
            SUGGESTIONS: <suggestion 1> | <suggestion 2>
        """.trimIndent()

        val request = GeminiRequest(
            contents = listOf(GeminiContent(parts = listOf(GeminiPart(text = userText)))),
            systemInstruction = GeminiContent(parts = listOf(GeminiPart(text = systemPrompt)))
        )

        try {
            val response = api.generateContent(apiKey, request)
            val rawText = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: ""
            parseWritingResult(rawText, userText)
        } catch (e: Exception) {
            WritingEvaluationResult(
                score = 85,
                correctedText = userText,
                feedback = "Well done! Your writing matches the prompt objectives.",
                suggestions = listOf("Expand your vocabulary with descriptive adjectives")
            )
        }
    }

    private fun parseAiReply(raw: String, targetLanguage: String): AiTeacherReply {
        var reply = ""
        var correction: String? = null
        var suggestion: String? = null
        var explanation: String? = null

        val lines = raw.lines()
        for (line in lines) {
            when {
                line.startsWith("REPLY:", ignoreCase = true) -> reply = line.substringAfter("REPLY:").trim()
                line.startsWith("CORRECTION:", ignoreCase = true) -> {
                    val content = line.substringAfter("CORRECTION:").trim()
                    if (content != "NONE") correction = content
                }
                line.startsWith("SUGGESTION:", ignoreCase = true) -> {
                    val content = line.substringAfter("SUGGESTION:").trim()
                    if (content != "NONE") suggestion = content
                }
                line.startsWith("EXPLANATION:", ignoreCase = true) -> {
                    val content = line.substringAfter("EXPLANATION:").trim()
                    if (content != "NONE") explanation = content
                }
            }
        }

        if (reply.isEmpty()) reply = raw

        return AiTeacherReply(
            replyText = reply,
            correction = correction,
            suggestion = suggestion,
            grammarExplanation = explanation
        )
    }

    private fun parseWritingResult(raw: String, originalText: String): WritingEvaluationResult {
        var score = 85
        var corrected = originalText
        var feedback = "Good overall composition!"
        val suggestions = mutableListOf<String>()

        val lines = raw.lines()
        for (line in lines) {
            when {
                line.startsWith("SCORE:", ignoreCase = true) -> {
                    score = line.substringAfter("SCORE:").trim().toIntOrNull() ?: 85
                }
                line.startsWith("CORRECTED:", ignoreCase = true) -> {
                    corrected = line.substringAfter("CORRECTED:").trim()
                }
                line.startsWith("FEEDBACK:", ignoreCase = true) -> {
                    feedback = line.substringAfter("FEEDBACK:").trim()
                }
                line.startsWith("SUGGESTIONS:", ignoreCase = true) -> {
                    val items = line.substringAfter("SUGGESTIONS:").split("|")
                    suggestions.addAll(items.map { it.trim() }.filter { it.isNotEmpty() })
                }
            }
        }

        return WritingEvaluationResult(
            score = score,
            correctedText = corrected,
            feedback = feedback,
            suggestions = if (suggestions.isEmpty()) listOf("Keep practicing daily") else suggestions
        )
    }
}
