package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.example.R
import com.example.data.model.*
import com.example.domain.AnswerGrader
import com.example.ui.components.AudioSpeedSelector
import com.example.ui.components.buttons.ButtonSize
import com.example.ui.components.buttons.LinguaPrimaryButton
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.navigation.LinguaTopBar
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonScreen(
    lesson: Lesson,
    exercises: List<Exercise>,
    currentIndex: Int,
    isCompleted: Boolean,
    audioSpeed: Float,
    targetLanguageName: String,
    onSpeakText: (String) -> Unit,
    onSetAudioSpeed: (Float) -> Unit,
    onSubmitAnswer: (String) -> Boolean,
    onNextExercise: () -> Unit,
    onCloseLesson: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (isCompleted) {
        LessonCompletionView(
            lesson = lesson,
            onCloseLesson = onCloseLesson,
            modifier = modifier
        )
        return
    }

    if (exercises.isEmpty()) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val currentExercise = exercises.getOrNull(currentIndex) ?: return
    val isPracticeOnly = AnswerGrader.isPracticeOnly(currentExercise)
    var selectedOption by remember(currentIndex) { mutableStateOf("") }
    var userTextInput by remember(currentIndex) { mutableStateOf("") }
    var answerChecked by remember(currentIndex) { mutableStateOf(false) }
    var isAnswerCorrect by remember(currentIndex) { mutableStateOf(false) }

    Scaffold(
        topBar = {
            LinguaTopBar(
                title = lesson.title,
                onBack = onCloseLesson,
                actions = {
                    AudioSpeedSelector(
                        currentSpeed = audioSpeed,
                        onSpeedSelected = onSetAudioSpeed,
                        modifier = Modifier.padding(end = LinguaVerseDimens.CompactSpacing)
                    )
                }
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = LinguaVerseDimens.FloatingElevation,
                color = when {
                    !answerChecked -> MaterialTheme.colorScheme.surface
                    isAnswerCorrect -> MaterialTheme.extendedColors.successContainer
                    else -> MaterialTheme.colorScheme.errorContainer
                }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(LinguaVerseDimens.ScreenHorizontalPadding)
                ) {
                    if (answerChecked) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isAnswerCorrect) Icons.Default.CheckCircle else Icons.Default.Cancel,
                                contentDescription = null,
                                tint = if (isAnswerCorrect) MaterialTheme.extendedColors.success else MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(LinguaVerseDimens.IconLarge)
                            )
                            Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                            Column {
                                Text(
                                    text = when {
                                        isPracticeOnly -> stringResource(R.string.nice_practice)
                                        isAnswerCorrect -> stringResource(R.string.excellent)
                                        else -> stringResource(R.string.not_quite_right)
                                    },
                                    style = MaterialTheme.typography.titleMedium,
                                    color = if (isAnswerCorrect) MaterialTheme.extendedColors.success else MaterialTheme.colorScheme.error
                                )
                                Text(
                                    text = when {
                                        isPracticeOnly -> currentExercise.explanation
                                            .ifBlank { stringResource(R.string.keep_going) }
                                        isAnswerCorrect -> stringResource(R.string.correct_answer)
                                        else -> stringResource(R.string.correct_answer_feedback, currentExercise.correctAnswer)
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (isAnswerCorrect) MaterialTheme.extendedColors.onSuccessContainer else MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                    }

                    LinguaPrimaryButton(
                        text = when {
                            answerChecked -> stringResource(R.string.continue_action)
                            isPracticeOnly -> stringResource(R.string.practiced_this)
                            else -> stringResource(R.string.check_answer)
                        },
                        onClick = {
                            if (!answerChecked) {
                                val answer = if (currentExercise.type == ExerciseType.WRITING) userTextInput else selectedOption
                                isAnswerCorrect = onSubmitAnswer(answer)
                                answerChecked = true
                            } else {
                                onNextExercise()
                            }
                        },
                        enabled = answerChecked || isPracticeOnly ||
                                selectedOption.isNotEmpty() || userTextInput.isNotEmpty(),
                        modifier = Modifier.fillMaxWidth().testTag("submit_exercise_button"),
                        size = ButtonSize.Large
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(LinguaVerseDimens.ScreenHorizontalPadding)
        ) {
            // Progress Bar
            LinearProgressIndicator(
                progress = { (currentIndex + 1).toFloat() / exercises.size.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(CircleShape),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

            // Exercise Prompt Card
            LinguaCard(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = currentExercise.prompt,
                    style = MaterialTheme.typography.titleLarge
                )

                if (currentExercise.targetText.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(LinguaVerseDimens.ComponentSpacing))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = CircleShape,
                            modifier = Modifier.size(LinguaVerseDimens.ButtonHeightMedium)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                IconButton(onClick = { onSpeakText(currentExercise.targetText) }) {
                                    Icon(
                                        imageVector = Icons.Default.VolumeUp,
                                        contentDescription = stringResource(R.string.speak_text),
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(LinguaVerseDimens.IconMedium)
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                        Column {
                            Text(
                                text = currentExercise.targetText,
                                style = MaterialTheme.typography.headlineSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                            if (currentExercise.phoneticText.isNotEmpty()) {
                                Text(
                                    text = "[${currentExercise.phoneticText}]",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

            // Exercise Input Area
            if (isPracticeOnly) {
                PracticePromptCard(exercise = currentExercise)
            } else if (currentExercise.type == ExerciseType.WRITING) {
                OutlinedTextField(
                    value = userTextInput,
                    onValueChange = { userTextInput = it },
                    label = { Text(stringResource(R.string.type_answer_in_language, targetLanguageName)) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("writing_input_field"),
                    shape = MaterialTheme.shapes.small
                )
            } else {
                val options = AnswerGrader.parseOptions(currentExercise.optionsJson)
                Column(verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing)) {
                    options.forEach { option ->
                        val isSelected = selectedOption == option
                        LinguaCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("exercise_option_$option")
                                .border(
                                    width = if (isSelected) 2.dp else 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                                    shape = MaterialTheme.shapes.small
                                )
                                .clickable { selectedOption = option },
                            backgroundColor = if (isSelected) {
                                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                            } else {
                                MaterialTheme.colorScheme.surface
                            },
                            borderColor = if (isSelected) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.outlineVariant
                            }
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = { selectedOption = option }
                                )
                                Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                                Text(
                                    text = option,
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PracticePromptCard(
    exercise: Exercise,
    modifier: Modifier = Modifier
) {
    LinguaCard(
        modifier = modifier.fillMaxWidth(),
        backgroundColor = MaterialTheme.colorScheme.secondaryContainer,
        borderColor = MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.RecordVoiceOver,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSecondaryContainer
            )
            Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
            Column {
                Text(
                    text = stringResource(R.string.practice_out_loud),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSecondaryContainer
                )
                Text(
                    text = exercise.translation.ifBlank { "Take your time, then continue." },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.85f)
                )
            }
        }
    }
}

@Composable
fun LessonCompletionView(
    lesson: Lesson,
    onCloseLesson: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(LinguaVerseDimens.SectionSpacing)
        ) {
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = stringResource(R.string.success),
                tint = MaterialTheme.extendedColors.warning,
                modifier = Modifier.size(96.dp)
            )

            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

            Text(
                text = stringResource(R.string.lesson_completed),
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.onBackground
            )

            Text(
                text = stringResource(R.string.you_completed_title, lesson.title),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(LinguaVerseDimens.SectionSpacing))

            Row(horizontalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing)) {
                LinguaCard(
                    backgroundColor = MaterialTheme.extendedColors.xpContainer,
                    borderColor = MaterialTheme.extendedColors.xp.copy(alpha = 0.3f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Stars,
                            contentDescription = null,
                            tint = MaterialTheme.extendedColors.xp
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                        Text(
                            text = stringResource(R.string.xp_reward, lesson.xpReward),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.extendedColors.onXpContainer
                        )
                    }
                }

                LinguaCard(
                    backgroundColor = MaterialTheme.extendedColors.successContainer,
                    borderColor = MaterialTheme.extendedColors.success.copy(alpha = 0.3f)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MonetizationOn,
                            contentDescription = null,
                            tint = MaterialTheme.extendedColors.success
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                        Text(
                            text = stringResource(R.string.coins_reward, lesson.xpReward / 2),
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.extendedColors.onSuccessContainer
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(LinguaVerseDimens.ScreenHorizontalPadding))

            LinguaPrimaryButton(
                text = stringResource(R.string.return_to_dashboard),
                onClick = onCloseLesson,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("finish_lesson_button"),
                size = ButtonSize.Large
            )
        }
    }
}
