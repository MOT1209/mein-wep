package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.data.model.CefrLevel
import com.example.ui.theme.extendedColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(
    onAddLanguage: (String, String, String, String, String) -> Unit,
    onAddLesson: (String, String, CefrLevel, Int, String, String) -> Unit,
    onAddVocabulary: (String, String, String, String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var activeTab by remember { mutableIntStateOf(0) } // 0: Analytics, 1: Languages, 2: Lessons, 3: Vocab

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.admin_panel_title), fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.back))
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
                .testTag("admin_panel_screen")
        ) {
            SecondaryTabRow(selectedTabIndex = activeTab) {
                Tab(selected = activeTab == 0, onClick = { activeTab = 0 }, text = { Text(stringResource(R.string.tab_analytics)) })
                Tab(selected = activeTab == 1, onClick = { activeTab = 1 }, text = { Text(stringResource(R.string.tab_languages)) })
                Tab(selected = activeTab == 2, onClick = { activeTab = 2 }, text = { Text(stringResource(R.string.tab_lessons)) })
                Tab(selected = activeTab == 3, onClick = { activeTab = 3 }, text = { Text(stringResource(R.string.vocabulary)) })
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (activeTab) {
                0 -> AdminAnalyticsTab()
                1 -> AdminAddLanguageTab(onAddLanguage)
                2 -> AdminAddLessonTab(onAddLesson)
                3 -> AdminAddVocabTab(onAddVocabulary)
            }
        }
    }
}

@Composable
fun AdminAnalyticsTab() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(text = stringResource(R.string.system_overview), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            shape = RoundedCornerShape(18.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(text = stringResource(R.string.active_learners_count), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text(text = stringResource(R.string.supported_languages_text), fontSize = 13.sp)
                Text(text = stringResource(R.string.total_exercises_completed_148_920), fontSize = 13.sp)
                Text(text = stringResource(R.string.ai_server_uptime_99_98), fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun AdminAddLanguageTab(onAddLanguage: (String, String, String, String, String) -> Unit) {
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var nativeName by remember { mutableStateOf("") }
    var flagEmoji by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var showSuccess by remember { mutableStateOf(false) }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text(text = stringResource(R.string.add_new_language), fontWeight = FontWeight.Bold, fontSize = 18.sp) }
        item {
            OutlinedTextField(
                value = code,
                onValueChange = { code = it },
                label = { Text(stringResource(R.string.lang_code_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_lang_code"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.lang_name_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_lang_name"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = nativeName,
                onValueChange = { nativeName = it },
                label = { Text(stringResource(R.string.native_name_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_lang_native"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = flagEmoji,
                onValueChange = { flagEmoji = it },
                label = { Text(stringResource(R.string.flag_emoji_e_g)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_lang_flag"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text(stringResource(R.string.description_hint)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = {
                    if (code.isNotBlank() && name.isNotBlank()) {
                        onAddLanguage(code, name, nativeName, flagEmoji.ifEmpty { "🌐" }, description)
                        showSuccess = true
                        code = ""; name = ""; nativeName = ""; flagEmoji = ""; description = ""
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("admin_submit_lang_button"),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(stringResource(R.string.add_language_btn))
            }
        }
        if (showSuccess) {
            item {
                Text(text = stringResource(R.string.language_added), color = MaterialTheme.extendedColors.success, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AdminAddLessonTab(onAddLesson: (String, String, CefrLevel, Int, String, String) -> Unit) {
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var prompt by remember { mutableStateOf("") }
    var answer by remember { mutableStateOf("") }
    var showSuccess by remember { mutableStateOf(false) }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text(text = stringResource(R.string.create_lesson), fontWeight = FontWeight.Bold, fontSize = 18.sp) }
        item {
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text(stringResource(R.string.lesson_title_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_lesson_title"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = category,
                onValueChange = { category = it },
                label = { Text(stringResource(R.string.category_e_g_travel_food)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = prompt,
                onValueChange = { prompt = it },
                label = { Text(stringResource(R.string.exercise_question_hint)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = answer,
                onValueChange = { answer = it },
                label = { Text(stringResource(R.string.correct_answer_hint)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        onAddLesson(title, category.ifEmpty { "General" }, CefrLevel.A1, 20, prompt, answer)
                        showSuccess = true
                        title = ""; category = ""; prompt = ""; answer = ""
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("admin_submit_lesson_button"),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(stringResource(R.string.save_lesson_btn))
            }
        }
        if (showSuccess) {
            item {
                Text(text = stringResource(R.string.lesson_published), color = MaterialTheme.extendedColors.success, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AdminAddVocabTab(onAddVocabulary: (String, String, String, String) -> Unit) {
    var word by remember { mutableStateOf("") }
    var translation by remember { mutableStateOf("") }
    var example by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var showSuccess by remember { mutableStateOf(false) }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item { Text(text = stringResource(R.string.add_vocabulary_word), fontWeight = FontWeight.Bold, fontSize = 18.sp) }
        item {
            OutlinedTextField(
                value = word,
                onValueChange = { word = it },
                label = { Text(stringResource(R.string.target_word_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_vocab_word"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = translation,
                onValueChange = { translation = it },
                label = { Text(stringResource(R.string.translation_hint)) },
                modifier = Modifier.fillMaxWidth().testTag("admin_vocab_trans"),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            OutlinedTextField(
                value = example,
                onValueChange = { example = it },
                label = { Text(stringResource(R.string.example_sentence_hint)) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp)
            )
        }
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = {
                    if (word.isNotBlank() && translation.isNotBlank()) {
                        onAddVocabulary(word, translation, example, category.ifEmpty { "General" })
                        showSuccess = true
                        word = ""; translation = ""; example = ""; category = ""
                    }
                },
                modifier = Modifier.fillMaxWidth().height(48.dp).testTag("admin_submit_vocab_button"),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(stringResource(R.string.add_word_to_vocabulary))
            }
        }
        if (showSuccess) {
            item {
                Text(text = stringResource(R.string.vocabulary_word_added), color = MaterialTheme.extendedColors.success, fontWeight = FontWeight.Bold)
            }
        }
    }
}
