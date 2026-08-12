package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ai.WritingEvaluationResult
import com.example.data.model.*
import com.example.ui.components.AudioSpeedSelector

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SkillDetailScreen(
    skillType: SkillType,
    targetLanguageCode: String,
    vocabularies: List<Vocabulary>,
    grammarRules: List<GrammarRule>,
    flashcards: List<Flashcard>,
    audioSpeed: Float,
    writingEvaluation: WritingEvaluationResult?,
    isEvaluatingWriting: Boolean,
    onSpeakText: (String) -> Unit,
    onSetAudioSpeed: (Float) -> Unit,
    onEvaluateWriting: (String, String) -> Unit,
    onToggleFavoriteVocab: (Vocabulary) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = skillType.displayName,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    AudioSpeedSelector(
                        currentSpeed = audioSpeed,
                        onSpeedSelected = onSetAudioSpeed,
                        modifier = Modifier.padding(end = 12.dp)
                    )
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (skillType) {
                SkillType.VOCABULARY -> VocabularyView(
                    vocabularies = vocabularies,
                    onSpeakText = onSpeakText,
                    onToggleFavorite = onToggleFavoriteVocab
                )
                SkillType.GRAMMAR -> GrammarView(
                    grammarRules = grammarRules,
                    onSpeakText = onSpeakText
                )
                SkillType.FLASHCARDS -> FlashcardsView(
                    flashcards = flashcards,
                    onSpeakText = onSpeakText
                )
                SkillType.READING -> ReadingStoryView(
                    onSpeakText = onSpeakText
                )
                SkillType.WRITING -> WritingPracticeView(
                    evaluation = writingEvaluation,
                    isLoading = isEvaluatingWriting,
                    onEvaluateWriting = onEvaluateWriting
                )
                SkillType.SPEAKING -> SpeakingPracticeView(
                    onSpeakText = onSpeakText
                )
                SkillType.DAILY_PHRASES -> DailyPhrasesView(
                    onSpeakText = onSpeakText
                )
                else -> GenericSkillView(
                    skillType = skillType,
                    vocabularies = vocabularies,
                    onSpeakText = onSpeakText
                )
            }
        }
    }
}

@Composable
fun VocabularyView(
    vocabularies: List<Vocabulary>,
    onSpeakText: (String) -> Unit,
    onToggleFavorite: (Vocabulary) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    val filtered = vocabularies.filter {
        it.word.contains(searchQuery, ignoreCase = true) ||
                it.translation.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search vocabulary...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("vocab_search_field"),
            shape = RoundedCornerShape(16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(filtered) { vocab ->
                Surface(
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { onSpeakText(vocab.word) }) {
                            Icon(Icons.Default.VolumeUp, contentDescription = "Play", tint = MaterialTheme.colorScheme.primary)
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = vocab.word, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            Text(text = vocab.translation, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (vocab.phonetic.isNotEmpty()) {
                                Text(text = "[${vocab.phonetic}]", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                            }
                        }

                        IconButton(onClick = { onToggleFavorite(vocab) }) {
                            Icon(
                                imageVector = if (vocab.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (vocab.isFavorite) Color(0xFFEF4444) else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun GrammarView(
    grammarRules: List<GrammarRule>,
    onSpeakText: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 80.dp)
    ) {
        items(grammarRules) { rule ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(text = rule.title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = rule.summary, fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = rule.fullRuleText, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerHighest,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { onSpeakText(rule.exampleSentence) }) {
                                Icon(Icons.Default.VolumeUp, contentDescription = "Play", tint = MaterialTheme.colorScheme.primary)
                            }
                            Column {
                                Text(text = rule.exampleSentence, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(text = rule.exampleTranslation, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FlashcardsView(
    flashcards: List<Flashcard>,
    onSpeakText: (String) -> Unit
) {
    if (flashcards.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No flashcards available yet.")
        }
        return
    }

    var currentIndex by remember { mutableStateOf(0) }
    var showBack by remember { mutableStateOf(false) }
    val currentCard = flashcards.getOrNull(currentIndex) ?: flashcards.first()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Card ${currentIndex + 1} of ${flashcards.size}",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .testTag("flashcard_flip_container")
                .clickable { showBack = !showBack },
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (showBack) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (showBack) currentCard.backTranslation else currentCard.frontWord,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (showBack) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onPrimaryContainer
                    )

                    if (!showBack && currentCard.phonetic.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "[${currentCard.phonetic}]",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }

                    if (showBack) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = currentCard.exampleSentence,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.9f)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    IconButton(onClick = { onSpeakText(currentCard.frontWord) }) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Speak",
                            tint = if (showBack) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(
                onClick = {
                    showBack = false
                    currentIndex = (currentIndex + 1) % flashcards.size
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text("Next Card")
            }
        }
    }
}

@Composable
fun ReadingStoryView(onSpeakText: (String) -> Unit) {
    var selectedWord by remember { mutableStateOf<String?>(null) }
    val storyTitle = "Un día en Madrid"
    val storyContent = "Carlos camina por la Plaza Mayor. El sol brilla y hay muchas personas disfrutando de un café. Carlos compra un churro delicioso y sonríe."

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(text = storyTitle, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = storyContent, fontSize = 18.sp, lineHeight = 28.sp)

                Spacer(modifier = Modifier.height(16.dp))

                Row {
                    Button(onClick = { onSpeakText(storyContent) }) {
                        Icon(Icons.Default.VolumeUp, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Listen Full Story")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(text = "Tap any word to translate:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        val words = listOf("camina", "Plaza", "sol", "brilla", "churro", "delicioso")
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(words) { word ->
                AssistChip(
                    onClick = { selectedWord = word },
                    label = { Text(word) }
                )
            }
        }

        selectedWord?.let { word ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Translate, contentDescription = null)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(text = "'$word' -> Translation: ${wordTranslationMap[word] ?: "Meaning in context"}")
                }
            }
        }
    }
}

private val wordTranslationMap = mapOf(
    "camina" to "walks",
    "Plaza" to "Town Square",
    "sol" to "Sun",
    "brilla" to "shines",
    "churro" to "Churro pastry",
    "delicioso" to "delicious"
)

@Composable
fun WritingPracticeView(
    evaluation: WritingEvaluationResult?,
    isLoading: Boolean,
    onEvaluateWriting: (String, String) -> Unit
) {
    var textInput by remember { mutableStateOf("") }
    val prompt = "Write 2-3 sentences describing your favorite daily hobby in Spanish."

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(text = "AI Writing Lab", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Prompt:", fontWeight = FontWeight.Bold)
                Text(text = prompt, fontSize = 14.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = textInput,
            onValueChange = { textInput = it },
            placeholder = { Text("Escribe aquí tu respuesta...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .testTag("writing_lab_input"),
            shape = RoundedCornerShape(16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { onEvaluateWriting(textInput, prompt) },
            enabled = textInput.length >= 5 && !isLoading,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
            } else {
                Icon(Icons.Default.AutoAwesome, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Analyze Writing with AI")
            }
        }

        evaluation?.let { eval ->
            Spacer(modifier = Modifier.height(20.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                shape = RoundedCornerShape(18.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "Score: ${eval.score}/100", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "Corrected Version:", fontWeight = FontWeight.Bold)
                    Text(text = eval.correctedText, fontSize = 14.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(text = "AI Feedback:", fontWeight = FontWeight.Bold)
                    Text(text = eval.feedback, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun SpeakingPracticeView(onSpeakText: (String) -> Unit) {
    var isRecording by remember { mutableStateOf(false) }
    var score by remember { mutableStateOf<Int?>(null) }
    val targetSentence = "Me gusta aprender nuevos idiomas todos los días."

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Speaking Practice", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(20.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = targetSentence, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))
                IconButton(onClick = { onSpeakText(targetSentence) }) {
                    Icon(Icons.Default.VolumeUp, contentDescription = "Listen", tint = MaterialTheme.colorScheme.primary)
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        IconButton(
            onClick = {
                isRecording = !isRecording
                if (!isRecording) score = 92
            },
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(if (isRecording) Color(0xFFEF4444) else MaterialTheme.colorScheme.primary)
        ) {
            Icon(
                imageVector = if (isRecording) Icons.Default.Stop else Icons.Default.Mic,
                contentDescription = "Record",
                tint = Color.White,
                modifier = Modifier.size(36.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = if (isRecording) "Listening... Speak now!" else "Tap microphone to speak",
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        score?.let { s ->
            Spacer(modifier = Modifier.height(24.dp))
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFDCFCE7))) {
                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "Pronunciation Score: $s%", fontWeight = FontWeight.Bold, color = Color(0xFF15803D))
                    Text(text = "Word Accuracy: 95% | Accent Balance: Natural", fontSize = 12.sp, color = Color(0xFF166534))
                }
            }
        }
    }
}

@Composable
fun DailyPhrasesView(onSpeakText: (String) -> Unit) {
    val phrases = listOf(
        "¿Dónde está el baño?" to "Where is the bathroom?",
        "¿Cuánto cuesta esto?" to "How much does this cost?",
        "No entiendo, ¿puede repetir?" to "I don't understand, can you repeat?",
        "Un café con leche, por favor." to "A coffee with milk, please.",
        "¡Mucho gusto en conocerte!" to "Nice to meet you!"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(phrases) { (spanish, english) ->
            Surface(
                color = MaterialTheme.colorScheme.surfaceContainerHigh,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { onSpeakText(spanish) }) {
                        Icon(Icons.Default.VolumeUp, contentDescription = "Play", tint = MaterialTheme.colorScheme.primary)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(text = spanish, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(text = english, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
fun GenericSkillView(
    skillType: SkillType,
    vocabularies: List<Vocabulary>,
    onSpeakText: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.School, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "${skillType.displayName} Practice", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text(text = "Interactive modules ready for practice.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
