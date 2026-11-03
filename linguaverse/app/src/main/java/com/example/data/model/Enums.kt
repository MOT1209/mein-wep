package com.example.data.model

enum class CefrLevel(val code: String, val title: String, val description: String) {
    A1("A1", "Beginner", "Basic phrases & simple interactions"),
    A2("A2", "Elementary", "Routine tasks & direct information"),
    B1("B1", "Intermediate", "Main points on familiar topics"),
    B2("B2", "Upper-Intermediate", "Complex topics & fluent interaction"),
    C1("C1", "Advanced", "Express ideas fluently & spontaneously"),
    C2("C2", "Mastery", "Understand with ease & native nuance")
}

enum class SkillType(val id: String, val displayName: String, val iconName: String) {
    LISTENING("listening", "Listening", "hearing"),
    SPEAKING("speaking", "Speaking", "mic"),
    READING("reading", "Reading", "book"),
    WRITING("writing", "Writing", "edit"),
    VOCABULARY("vocabulary", "Vocabulary", "translate"),
    GRAMMAR("grammar", "Grammar", "rule"),
    PRONUNCIATION("pronunciation", "Pronunciation", "record_voice_over"),
    CONVERSATION("conversation", "Conversation", "forum"),
    TRANSLATION("translation", "Translation", "swap_horiz"),
    DAILY_PHRASES("daily_phrases", "Daily Phrases", "chat_bubble_outline"),
    QUIZZES("quizzes", "Quizzes", "quiz"),
    REVIEW("review", "Review", "replay"),
    AI_CHAT("ai_chat", "AI Chat", "smart_toy"),
    FLASHCARDS("flashcards", "Flashcards", "style")
}

enum class ExerciseType {
    VOCABULARY,
    GRAMMAR,
    LISTENING,
    READING,
    WRITING,
    SPEAKING,
    CONVERSATION,
    QUIZ,
    FLASHCARD
}
