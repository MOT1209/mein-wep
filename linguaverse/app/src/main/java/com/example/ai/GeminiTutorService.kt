package com.example.ai

import android.util.Log
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
import retrofit2.http.Path
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
    @POST("v1beta/models/{model}:generateContent")
    suspend fun generateContent(
        @Path("model") model: String,
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

    private const val TAG = "GeminiTutorService"

    /**
     * The previous value, "gemini-3.5-flash", is not a model that exists, so every
     * live call returned 404 and fell through to the hard-coded reply. No live AI
     * response was ever produced by this app.
     */
    private const val MODEL = "gemini-2.5-flash"

    private const val PLACEHOLDER_API_KEY = "MY_GEMINI_API_KEY"

    private val apiKey: String
        get() = BuildConfig.GEMINI_API_KEY

    private fun hasUsableApiKey(): Boolean =
        apiKey.isNotBlank() && apiKey != PLACEHOLDER_API_KEY

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
    ): AiOutcome<AiTeacherReply> = withContext(Dispatchers.IO) {
        if (!hasUsableApiKey()) {
            return@withContext AiOutcome.Failure(AiFailure.NOT_CONFIGURED)
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
            val response = api.generateContent(MODEL, apiKey, request)
            val rawText = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text.orEmpty()
            if (rawText.isBlank()) {
                AiOutcome.Failure(AiFailure.EMPTY_RESPONSE)
            } else {
                AiOutcome.Success(parseAiReply(rawText))
            }
        } catch (e: Exception) {
            Log.w(TAG, "AI tutor chat request failed", e)
            AiOutcome.Failure(AiFailure.UNREACHABLE)
        }
    }

    suspend fun evaluateWriting(
        userText: String,
        prompt: String,
        targetLanguage: String
    ): AiOutcome<WritingEvaluationResult> = withContext(Dispatchers.IO) {
        if (!hasUsableApiKey()) {
            return@withContext AiOutcome.Failure(AiFailure.NOT_CONFIGURED)
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
            val response = api.generateContent(MODEL, apiKey, request)
            val rawText = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text.orEmpty()
            if (rawText.isBlank()) {
                AiOutcome.Failure(AiFailure.EMPTY_RESPONSE)
            } else {
                AiOutcome.Success(parseWritingResult(rawText, userText))
            }
        } catch (e: Exception) {
            Log.w(TAG, "Writing evaluation request failed", e)
            AiOutcome.Failure(AiFailure.UNREACHABLE)
        }
    }

    private fun parseAiReply(raw: String): AiTeacherReply {
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
