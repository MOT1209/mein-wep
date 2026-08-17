package com.example.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.ai.AiFailure
import com.example.ai.WritingEvaluationResult
import com.example.data.model.*
import com.example.ui.components.AiErrorBanner
import com.example.ui.components.AudioSpeedSelector
import com.example.ui.components.buttons.ButtonSize
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.inputs.LinguaTextField
import com.example.ui.components.navigation.LinguaTopBar
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

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
    writingEvaluationError: AiFailure?,
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
            LinguaTopBar(
                title = skillType.displayName,
                onBack = onBack,
                actions = {
                    AudioSpeedSelector(
                        currentSpeed = audioSpeed,
                        onSpeedSelected = onSetAudioSpeed,
                        modifier = Modifier.padding(end = LinguaVerseDimens.CompactSpacing)
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
                    targetLanguageCode = targetLanguageCode,
                    onSpeakText = onSpeakText
                )
                SkillType.WRITING -> WritingPracticeView(
                    targetLanguageCode = targetLanguageCode,
                    evaluation = writingEvaluation,
                    error = writingEvaluationError,
                    isLoading = isEvaluatingWriting,
                    onEvaluateWriting = onEvaluateWriting
                )
                SkillType.SPEAKING -> SpeakingPracticeView(
                    targetLanguageCode = targetLanguageCode,
                    onSpeakText = onSpeakText
                )
                SkillType.DAILY_PHRASES -> DailyPhrasesView(
                    targetLanguageCode = targetLanguageCode,
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
private fun VocabularyView(
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
            .padding(LinguaVerseDimens.ScreenHorizontalPadding)
    ) {
        LinguaTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = "Search vocabulary...",
            leadingIcon = Icons.Default.Search,
            modifier = Modifier.testTag("vocab_search_field")
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing),
            contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
        ) {
            items(filtered) { vocab ->
                LinguaCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { onSpeakText(vocab.word) }) {
                            Icon(
                                Icons.Default.VolumeUp,
                                contentDescription = stringResource(R.string.play),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = vocab.word, style = MaterialTheme.typography.titleMedium)
                            Text(
                                text = vocab.translation,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (vocab.phonetic.isNotEmpty()) {
                                Text(
                                    text = "[${vocab.phonetic}]",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }

                        IconButton(onClick = { onToggleFavorite(vocab) }) {
                            Icon(
                                imageVector = if (vocab.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = stringResource(R.string.favorite),
                                tint = if (vocab.isFavorite) MaterialTheme.extendedColors.favorite else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun GrammarView(
    grammarRules: List<GrammarRule>,
    onSpeakText: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
        contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
    ) {
        items(grammarRules) { rule ->
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                Text(text = rule.title, style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
                Text(
                    text = rule.summary,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                Text(text = rule.fullRuleText, style = MaterialTheme.typography.bodyMedium)
                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                LinguaCard(
                    backgroundColor = MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.FloatingElevation),
                    borderColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { onSpeakText(rule.exampleSentence) }) {
                            Icon(
                                Icons.Default.VolumeUp,
                                contentDescription = stringResource(R.string.play),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                        Column {
                            Text(text = rule.exampleSentence, style = MaterialTheme.typography.titleMedium)
                            Text(
                                text = rule.exampleTranslation,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FlashcardsView(
    flashcards: List<Flashcard>,
    onSpeakText: (String) -> Unit
) {
    if (flashcards.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                stringResource(R.string.no_flashcards_available_yet),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }

    var currentIndex by remember { mutableIntStateOf(0) }
    var showBack by remember { mutableStateOf(false) }
    val currentCard = flashcards.getOrNull(currentIndex) ?: flashcards.first()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Card ${currentIndex + 1} of ${flashcards.size}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        LinguaCard(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .testTag("flashcard_flip_container")
                .clickable { showBack = !showBack },
            backgroundColor = if (showBack) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.primaryContainer,
            borderColor = if (showBack) MaterialTheme.colorScheme.secondary.copy(alpha = 0.3f) else MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
            shape = MaterialTheme.shapes.extraLarge
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (showBack) currentCard.backTranslation else currentCard.frontWord,
                        style = MaterialTheme.typography.headlineSmall,
                        color = if (showBack) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onPrimaryContainer
                    )

                    if (!showBack && currentCard.phonetic.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                        Text(
                            text = "[${currentCard.phonetic}]",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }

                    if (showBack) {
                        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                        Text(
                            text = currentCard.exampleSentence,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.9f)
                        )
                    }

                    Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

                    IconButton(onClick = { onSpeakText(currentCard.frontWord) }) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = stringResource(R.string.speak),
                            tint = if (showBack) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        LinguaPrimaryButton(
            text = stringResource(R.string.next_card),
            onClick = {
                showBack = false
                currentIndex = (currentIndex + 1) % flashcards.size
            },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun ReadingStoryView(targetLanguageCode: String, onSpeakText: (String) -> Unit) {
    var selectedWord by remember { mutableStateOf<String?>(null) }

    val story = remember(targetLanguageCode) {
        when (targetLanguageCode) {
            "es" -> ReadingStoryData(
                title = "Un día en Madrid",
                content = "Carlos camina por la Plaza Mayor. El sol brilla y hay muchas personas disfrutando de un café. Carlos compra un churro delicioso y sonríe.",
                words = mapOf("camina" to "walks", "Plaza" to "Town Square", "sol" to "Sun", "brilla" to "shines", "churro" to "Churro pastry", "delicioso" to "delicious")
            )
            "en" -> ReadingStoryData(
                title = "A Day in London",
                content = "Emma walks through Hyde Park. The sun shines and many people enjoy a cup of tea. Emma buys a delicious scone and smiles.",
                words = mapOf("walks" to "يتمشى", "Park" to "حديقة", "sun" to "شمس", "shines" to "يتألق", "delicious" to "لذيذ", "scone" to "سكون")
            )
            "fr" -> ReadingStoryData(
                title = "Une journée à Paris",
                content = "Marie marche dans le Jardin du Luxembourg. Le soleil brille et beaucoup de personnes profitent d'un café. Marie achète un croissant délicieux et sourit.",
                words = mapOf("marche" to "walks", "Jardin" to "Garden", "soleil" to "Sun", "brille" to "shines", "délicieux" to "delicious", "croissant" to "Croissant")
            )
            "de" -> ReadingStoryData(
                title = "Ein Tag in Berlin",
                content = "Max geht durch den Tiergarten. Die Sonne scheint und viele Leute genießen einen Kaffee. Max kauft ein leckeres Brötchen und lächelt.",
                words = mapOf("geht" to "walks", "Sonne" to "Sun", "scheint" to "shines", "leckeres" to "delicious", "Brötchen" to "bread roll", "lächelt" to "smiles")
            )
            else -> ReadingStoryData(
                title = "A Day in the City",
                content = "Alex walks through the city park. The sun shines and many people enjoy a coffee. Alex buys something delicious and smiles.",
                words = mapOf("walks" to "يتمشى", "sun" to "شمس", "shines" to "يتألق", "delicious" to "لذيذ", "coffee" to "قهوة", "smiles" to "يبتسم")
            )
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding)
    ) {
        Text(text = story.title, style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

        LinguaCard(modifier = Modifier.fillMaxWidth()) {
            Text(text = story.content, style = MaterialTheme.typography.bodyLarge, lineHeight = MaterialTheme.typography.bodyLarge.lineHeight)
            Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
            LinguaPrimaryButton(
                text = stringResource(R.string.listen_full_story),
                onClick = { onSpeakText(story.content) },
                icon = Icons.Default.VolumeUp
            )
        }

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        Text(
            text = stringResource(R.string.tap_to_translate),
            style = MaterialTheme.typography.titleMedium
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing)) {
            items(story.words.keys.toList()) { word ->
                AssistChip(
                    onClick = { selectedWord = word },
                    label = { Text(word) }
                )
            }
        }

        selectedWord?.let { word ->
            Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
            LinguaCard(
                backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                borderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Translate, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                    Text(
                        text = stringResource(R.string.word_translation, word, story.words[word] ?: stringResource(R.string.meaning_in_context)),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

private data class ReadingStoryData(
    val title: String,
    val content: String,
    val words: Map<String, String>
)

@Composable
private fun WritingPracticeView(
    targetLanguageCode: String,
    evaluation: WritingEvaluationResult?,
    error: AiFailure?,
    isLoading: Boolean,
    onEvaluateWriting: (String, String) -> Unit
) {
    var textInput by remember { mutableStateOf("") }

    val prompt = remember(targetLanguageCode) {
        val langName = when (targetLanguageCode) {
            "es" -> "Spanish"; "en" -> "English"; "fr" -> "French"; "de" -> "German"
            "ar" -> "Arabic"; "tr" -> "Turkish"; "it" -> "Italian"; "pt" -> "Portuguese"
            "ru" -> "Russian"; "ja" -> "Japanese"; "ko" -> "Korean"; "zh" -> "Chinese"
            else -> targetLanguageCode
        }
        "Write 2-3 sentences describing your favorite daily hobby in $langName."
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding)
    ) {
        Text(text = stringResource(R.string.ai_writing_lab), style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))

        LinguaCard(modifier = Modifier.fillMaxWidth()) {
            Text(text = stringResource(R.string.prompt), style = MaterialTheme.typography.titleMedium)
            Text(text = prompt, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

        OutlinedTextField(
            value = textInput,
            onValueChange = { textInput = it },
            placeholder = { Text(stringResource(R.string.escribe_aqu_tu_respuesta)) },
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp)
                .testTag("writing_lab_input"),
            shape = MaterialTheme.shapes.small
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))

        LinguaPrimaryButton(
            text = stringResource(R.string.analyze_writing_with_ai),
            onClick = { onEvaluateWriting(textInput, prompt) },
            enabled = textInput.length >= 5 && !isLoading,
            loading = isLoading,
            icon = Icons.Default.AutoAwesome,
            modifier = Modifier.fillMaxWidth()
        )

        if (error != null) {
            Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
            AiErrorBanner(failure = error)
        }

        evaluation?.let { eval ->
            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))
            LinguaCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = MaterialTheme.colorScheme.secondaryContainer,
                borderColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
            ) {
                Text(text = "Score: ${eval.score}/100", style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                Text(text = "Corrected Version:", style = MaterialTheme.typography.titleMedium)
                Text(text = eval.correctedText, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                Text(text = stringResource(R.string.ai_feedback), style = MaterialTheme.typography.titleMedium)
                Text(text = eval.feedback, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

@Composable
private fun SpeakingPracticeView(targetLanguageCode: String, onSpeakText: (String) -> Unit) {
    val targetSentence = remember(targetLanguageCode) {
        when (targetLanguageCode) {
            "es" -> "Me gusta aprender nuevos idiomas todos los días."
            "en" -> "I like to learn new languages every day."
            "fr" -> "J'aime apprendre de nouvelles langues tous les jours."
            "de" -> "Ich lerne gerne jeden Tag neue Sprachen."
            "ar" -> "أحب تعلم لغات جديدة كل يوم."
            "tr" -> "Her gün yeni dil öğrenmeyi seviyorum."
            "it" -> "Mi piace imparare nuove lingue ogni giorno."
            "pt" -> "Gosto de aprender novas línguas todos os dias."
            "ru" -> "Мне нравится изучать новые языки каждый день."
            "ja" -> "毎日新しい言語を学ぶのが好きです."
            "ko" -> "매일 새로운 언어를 배우는 것을 좋아합니다."
            "zh" -> "我喜欢每天学习新的语言."
            else -> "I like to learn new languages every day."
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = stringResource(R.string.speaking_practice), style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        LinguaCard(modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = targetSentence, style = MaterialTheme.typography.titleLarge)
                Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                IconButton(onClick = { onSpeakText(targetSentence) }) {
                    Icon(
                        Icons.Default.VolumeUp,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(LinguaVerseDimens.IconLarge)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

        LinguaPrimaryButton(
            text = stringResource(R.string.play_again),
            onClick = { onSpeakText(targetSentence) },
            icon = Icons.Default.VolumeUp,
            modifier = Modifier.fillMaxWidth().testTag("speaking_replay_button")
        )

        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
        Text(
            text = stringResource(R.string.speaking_instruction),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun DailyPhrasesView(targetLanguageCode: String, onSpeakText: (String) -> Unit) {
    val phrases = remember(targetLanguageCode) {
        when (targetLanguageCode) {
            "es" -> listOf(
                "¿Dónde está el baño?" to "Where is the bathroom?",
                "¿Cuánto cuesta esto?" to "How much does this cost?",
                "No entiendo, ¿puede repetir?" to "I don't understand, can you repeat?",
                "Un café con leche, por favor." to "A coffee with milk, please.",
                "¡Mucho gusto en conocerte!" to "Nice to meet you!"
            )
            "en" -> listOf(
                "Where is the bathroom?" to "أين الحمام؟",
                "How much does this cost?" to "كم يكلف هذا؟",
                "I don't understand, can you repeat?" to "لا أفهم، هل يمكنك التكرار؟",
                "A coffee with milk, please." to "قهوة مع حليب، من فضلك.",
                "Nice to meet you!" to "تشرفت بمعرفتك!"
            )
            "fr" -> listOf(
                "Où sont les toilettes ?" to "Where is the bathroom?",
                "Combien ça coûte ?" to "How much does this cost?",
                "Je ne comprends pas, pouvez-vous répéter ?" to "I don't understand, can you repeat?",
                "Un café avec du lait, s'il vous plaît." to "A coffee with milk, please.",
                "Enchanté de vous rencontrer !" to "Nice to meet you!"
            )
            "de" -> listOf(
                "Wo ist die Toilette?" to "Where is the bathroom?",
                "Wie viel kostet das?" to "How much does this cost?",
                "Ich verstehe nicht, können Sie wiederholen?" to "I don't understand, can you repeat?",
                "Einen Kaffee mit Milch, bitte." to "A coffee with milk, please.",
                "Freut mich, Sie kennenzulernen!" to "Nice to meet you!"
            )
            "ar" -> listOf(
                "أين الحمام؟" to "Where is the bathroom?",
                "كم يكلف هذا؟" to "How much does this cost?",
                "لا أفهم، هل يمكنك التكرار؟" to "I don't understand, can you repeat?",
                "قهوة مع حليب، من فضلك." to "A coffee with milk, please.",
                "تشرفت بمعرفتك!" to "Nice to meet you!"
            )
            else -> listOf(
                "Hello, how are you?" to "مرحباً، كيف حالك؟",
                "Thank you very much" to "شكراً جزيلاً",
                "Excuse me" to "عفواً",
                "Please" to "من فضلك",
                "Goodbye" to "مع السلامة"
            )
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.CompactSpacing),
        contentPadding = PaddingValues(bottom = LinguaVerseDimens.SectionSpacing)
    ) {
        items(phrases) { (phrase, translation) ->
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { onSpeakText(phrase) }) {
                        Icon(
                            Icons.Default.VolumeUp,
                            contentDescription = stringResource(R.string.play),
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                    Column {
                        Text(text = phrase, style = MaterialTheme.typography.titleMedium)
                        Text(
                            text = translation,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun GenericSkillView(
    skillType: SkillType,
    vocabularies: List<Vocabulary>,
    onSpeakText: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(LinguaVerseDimens.ScreenHorizontalPadding),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            Icons.Default.School,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
        Text(
            text = "${skillType.displayName} Practice",
            style = MaterialTheme.typography.titleLarge
        )
        Text(
            text = "Interactive modules ready for practice.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
