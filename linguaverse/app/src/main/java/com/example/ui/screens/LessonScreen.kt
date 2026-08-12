package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.res.stringResource
import com.example.R
import com.example.data.model.*
import com.example.domain.AnswerGrader
import com.example.ui.components.AudioSpeedSelector
import com.example.ui.theme.extendedColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonScreen(
    lesson: Lesson,
    exercises: List<Exercise>,
    currentIndex: Int,
    isCompleted: Boolean,
    audioSpeed: Float,
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
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = lesson.title,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Question ${currentIndex + 1} of ${exercises.size}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onCloseLesson) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = stringResource(R.string.close))
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
        },
        bottomBar = {
            Surface(
                tonalElevation = 8.dp,
                color = when {
                    !answerChecked -> MaterialTheme.colorScheme.surface
                    isAnswerCorrect -> MaterialTheme.extendedColors.successContainer
                    else -> MaterialTheme.colorScheme.errorContainer
                }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    if (answerChecked) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (isAnswerCorrect) Icons.Default.CheckCircle else Icons.Default.Cancel,
                                contentDescription = null,
                                tint = if (isAnswerCorrect) MaterialTheme.extendedColors.success else MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = when {
                                        isPracticeOnly -> "Nice practice!"
                                        isAnswerCorrect -> "Excellent!"
                                        else -> "Not quite right"
                                    },
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = if (isAnswerCorrect) MaterialTheme.extendedColors.success else MaterialTheme.colorScheme.error
                                )
                                Text(
                                    text = when {
                                        isPracticeOnly -> currentExercise.explanation
                                            .ifBlank { "Keep going." }
                                        isAnswerCorrect -> "Correct answer!"
                                        else -> "Correct: ${currentExercise.correctAnswer}"
                                    },
                                    fontSize = 13.sp,
                                    color = if (isAnswerCorrect) MaterialTheme.extendedColors.onSuccessContainer else MaterialTheme.colorScheme.onErrorContainer
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    Button(
                        onClick = {
                            if (!answerChecked) {
                                val answer = if (currentExercise.type == ExerciseType.WRITING) userTextInput else selectedOption
                                isAnswerCorrect = onSubmitAnswer(answer)
                                answerChecked = true
                            } else {
                                onNextExercise()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("submit_exercise_button"),
                        enabled = answerChecked || isPracticeOnly ||
                            selectedOption.isNotEmpty() || userTextInput.isNotEmpty(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (answerChecked) {
                                if (isAnswerCorrect) MaterialTheme.extendedColors.success else MaterialTheme.colorScheme.error
                            } else MaterialTheme.colorScheme.primary
                        ),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Text(
                            text = when {
                                answerChecked -> "Continue"
                                isPracticeOnly -> "I practiced this"
                                else -> "Check Answer"
                            },
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(20.dp)
        ) {
            // Linear Progress Bar
            LinearProgressIndicator(
                progress = { (currentIndex + 1).toFloat() / exercises.size.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(CircleShape),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Exercise Prompt Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerHigh)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = currentExercise.prompt,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    if (currentExercise.targetText.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = { onSpeakText(currentExercise.targetText) },
                                modifier = Modifier
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primaryContainer)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.VolumeUp,
                                    contentDescription = stringResource(R.string.speak_text),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = currentExercise.targetText,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                if (currentExercise.phoneticText.isNotEmpty()) {
                                    Text(
                                        text = "[${currentExercise.phoneticText}]",
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Exercise Input Area
            if (isPracticeOnly) {
                PracticePromptCard(exercise = currentExercise)
            } else if (currentExercise.type == ExerciseType.WRITING) {
                OutlinedTextField(
                    value = userTextInput,
                    onValueChange = { userTextInput = it },
                    label = { Text("Type your answer in Spanish") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("writing_input_field"),
                    shape = RoundedCornerShape(16.dp)
                )
            } else {
                // Parse Options JSON
                val options = AnswerGrader.parseOptions(currentExercise.optionsJson)
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    options.forEach { option ->
                        val isSelected = selectedOption == option
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("exercise_option_$option")
                                .border(
                                    width = if (isSelected) 2.dp else 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
                                    shape = RoundedCornerShape(16.dp)
                                )
                                .clickable { selectedOption = option },
                            color = if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(
                                alpha = 0.5f
                            ) else MaterialTheme.colorScheme.surface,
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = isSelected,
                                    onClick = { selectedOption = option }
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = option,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Shown for exercises that carry a prompt to practise rather than a question to
 * answer, such as speaking drills. Without this the screen rendered an empty
 * option list and the submit button stayed disabled, leaving the lesson stuck.
 */
@Composable
private fun PracticePromptCard(
    exercise: Exercise,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.RecordVoiceOver,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSecondaryContainer
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = stringResource(R.string.practice_out_loud),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSecondaryContainer
                )
                Text(
                    text = exercise.translation.ifBlank { "Take your time, then continue." },
                    fontSize = 13.sp,
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
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp)
        ) {
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = stringResource(R.string.success),
                tint = MaterialTheme.extendedColors.warning,
                modifier = Modifier.size(96.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Lesson Completed!",
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onBackground
            )

            Text(
                text = "You completed '${lesson.title}'",
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Surface(
                    color = MaterialTheme.extendedColors.xpContainer,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Stars,
                            contentDescription = null,
                            tint = MaterialTheme.extendedColors.xp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "+${lesson.xpReward} XP",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.extendedColors.onXpContainer
                        )
                    }
                }

                Surface(
                    color = MaterialTheme.extendedColors.successContainer,
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.MonetizationOn,
                            contentDescription = null,
                            tint = MaterialTheme.extendedColors.success
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "+${lesson.xpReward / 2} Coins",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.extendedColors.onSuccessContainer
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(40.dp))

            Button(
                onClick = onCloseLesson,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("finish_lesson_button"),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(
                    text = "Return to Dashboard",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}

