package com.example.data.model

data class ReadingStory(
    val id: String,
    val title: String,
    val level: CefrLevel,
    val content: String,
    val translation: String,
    val vocabularyMap: Map<String, String>
)

data class LeaderboardEntry(
    val rank: Int,
    val username: String,
    val avatarEmoji: String,
    val xp: Int,
    val isCurrentUser: Boolean = false,
    val badge: String = "Bronze"
)
