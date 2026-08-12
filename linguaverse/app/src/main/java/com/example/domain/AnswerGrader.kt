package com.example.domain

import com.example.data.model.Exercise

/**
 * Grades a learner's answer for a single exercise.
 *
 * This is deliberately a pure function with no Android or Room dependency so the
 * rules can be unit tested. It previously lived inline in MainViewModel, where it
 * accepted any writing answer longer than three characters as correct.
 */
object AnswerGrader {

    /**
     * Some exercises are practice prompts rather than questions: speaking drills
     * carry a sentence to say out loud, with no options and no expected answer.
     * They must not be graded, and the UI must still offer a way to move on.
     */
    fun isPracticeOnly(exercise: Exercise): Boolean =
        exercise.correctAnswer.isBlank() && parseOptions(exercise.optionsJson).isEmpty()

    fun isCorrect(exercise: Exercise, userAnswer: String): Boolean {
        if (isPracticeOnly(exercise)) return true

        val expected = exercise.correctAnswer.ifBlank { exercise.targetText }
        if (expected.isBlank()) return false

        return normalize(userAnswer) == normalize(expected)
    }

    /**
     * Compares on meaningful content only: case, surrounding whitespace, repeated
     * inner whitespace and trailing sentence punctuation should not fail a learner
     * who typed the right words. Accents are significant and are preserved.
     */
    private fun normalize(text: String): String =
        text.trim()
            .lowercase()
            .replace(WHITESPACE, " ")
            .trimEnd(*TRAILING_PUNCTUATION)
            .trim()

    private val WHITESPACE = Regex("\\s+")
    private val TRAILING_PUNCTUATION = charArrayOf('.', '!', '?', ',', ';', ':')

    /**
     * Options are stored as a JSON string array. Parsed without pulling in a JSON
     * library so this stays a dependency-free domain function; the format is a
     * flat array of strings written by the app itself.
     */
    fun parseOptions(optionsJson: String): List<String> {
        val trimmed = optionsJson.trim()
        if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return emptyList()
        val body = trimmed.substring(1, trimmed.length - 1).trim()
        if (body.isEmpty()) return emptyList()

        val options = mutableListOf<String>()
        val current = StringBuilder()
        var inString = false
        var escaped = false
        for (char in body) {
            when {
                escaped -> {
                    current.append(if (char == 'n') '\n' else char)
                    escaped = false
                }
                char == '\\' && inString -> escaped = true
                char == '"' -> {
                    if (inString) options.add(current.toString())
                    current.setLength(0)
                    inString = !inString
                }
                inString -> current.append(char)
            }
        }
        return options
    }
}
