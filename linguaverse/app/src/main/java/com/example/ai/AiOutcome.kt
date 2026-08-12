package com.example.ai

/**
 * Result of a call to the AI tutor.
 *
 * The service used to swallow every exception and return a hard-coded, cheerful
 * "tutor reply" instead. That made a total outage indistinguishable from a real
 * answer, both to the user and to anyone testing the app. Failures are now
 * explicit so the UI can say what went wrong.
 */
sealed interface AiOutcome<out T> {
    data class Success<T>(val value: T) : AiOutcome<T>
    data class Failure(val reason: AiFailure) : AiOutcome<Nothing>
}

enum class AiFailure {
    /** No usable API key is bundled, so no request was attempted. */
    NOT_CONFIGURED,

    /** The request could not reach the API, or the API rejected/failed it. */
    UNREACHABLE,

    /** The API answered, but with no usable content. */
    EMPTY_RESPONSE
}
