package com.example.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
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
import com.example.data.model.ChatMessage
import com.example.ui.components.AiErrorBanner
import com.example.ui.components.LevelChip
import com.example.ui.components.display.LinguaAvatar
import com.example.ui.components.display.LinguaCard
import com.example.ui.components.feedback.LinguaSnackbar
import com.example.ui.components.feedback.SnackbarType
import com.example.data.model.CefrLevel
import com.example.ui.theme.LinguaVerseDimens
import com.example.ui.theme.extendedColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiChatScreen(
    messages: List<ChatMessage>,
    isLoading: Boolean,
    error: AiFailure?,
    currentLevel: CefrLevel,
    onSendMessage: (String) -> Unit,
    onSpeakText: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        LinguaAvatar(
                            initials = "AI",
                            size = LinguaVerseDimens.AvatarSmall,
                            backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                            contentColor = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(LinguaVerseDimens.ComponentSpacing))
                        Column {
                            Text(
                                text = stringResource(R.string.ai_teacher_tutor),
                                style = MaterialTheme.typography.titleMedium
                            )
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = stringResource(R.string.level),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.width(LinguaVerseDimens.InlineSpacing))
                                LevelChip(level = currentLevel)
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                }
            )
        },
        bottomBar = {
            Surface(
                tonalElevation = LinguaVerseDimens.FloatingElevation,
                color = MaterialTheme.colorScheme.surface
            ) {
                Column {
                    if (error != null) {
                        AiErrorBanner(failure = error)
                    }
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(
                                horizontal = LinguaVerseDimens.ScreenHorizontalPadding,
                                vertical = LinguaVerseDimens.ComponentSpacing
                            ),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text(stringResource(R.string.ai_chat_input_placeholder)) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("ai_chat_input_field"),
                            shape = MaterialTheme.shapes.extraLarge,
                            maxLines = 3
                        )

                        Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))

                        IconButton(
                            onClick = {
                                if (inputText.isNotBlank() && !isLoading) {
                                    onSendMessage(inputText)
                                    inputText = ""
                                }
                            },
                            modifier = Modifier
                                .size(LinguaVerseDimens.ButtonHeightMedium)
                                .testTag("send_ai_message_button"),
                            colors = IconButtonDefaults.iconButtonColors(
                                containerColor = if (inputText.isNotBlank() && !isLoading) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.surfaceVariant
                                },
                                contentColor = if (inputText.isNotBlank() && !isLoading) {
                                    MaterialTheme.colorScheme.onPrimary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                }
                            )
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(LinguaVerseDimens.IconSmall),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Send,
                                    contentDescription = stringResource(R.string.send_message)
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            state = listState,
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = LinguaVerseDimens.ScreenHorizontalPadding),
            verticalArrangement = Arrangement.spacedBy(LinguaVerseDimens.ComponentSpacing),
            contentPadding = PaddingValues(
                top = LinguaVerseDimens.ComponentSpacing,
                bottom = LinguaVerseDimens.ComponentSpacing
            )
        ) {
            // Empty state
            if (messages.isEmpty()) {
                item {
                    LinguaCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = LinguaVerseDimens.ComponentSpacing),
                        backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                        borderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(LinguaVerseDimens.CompactSpacing))
                            Text(
                                text = stringResource(R.string.start_conversation),
                                style = MaterialTheme.typography.titleMedium
                            )
                        }
                        Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                        Text(
                            text = stringResource(R.string.ai_chat_desc),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.85f)
                        )
                    }
                }
            }

            // Messages
            items(messages) { message ->
                val isUser = message.sender == "user"

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                ) {
                    Surface(
                        color = if (isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceColorAtElevation(LinguaVerseDimens.CardElevation),
                        shape = MaterialTheme.shapes.large.copy(
                            topStart = MaterialTheme.shapes.extraLarge.topStart,
                            topEnd = MaterialTheme.shapes.extraLarge.topEnd,
                            bottomStart = if (isUser) MaterialTheme.shapes.extraLarge.topStart else MaterialTheme.shapes.extraSmall.topStart,
                            bottomEnd = if (isUser) MaterialTheme.shapes.extraSmall.topEnd else MaterialTheme.shapes.extraLarge.topEnd
                        ),
                        modifier = Modifier.widthIn(max = 300.dp)
                    ) {
                        Column(modifier = Modifier.padding(LinguaVerseDimens.CardPadding)) {
                            Text(
                                text = message.text,
                                style = MaterialTheme.typography.bodyLarge,
                                color = if (isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                            )

                            if (!isUser) {
                                Spacer(modifier = Modifier.height(LinguaVerseDimens.CompactSpacing))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End
                                ) {
                                    IconButton(
                                        onClick = { onSpeakText(message.text) },
                                        modifier = Modifier.size(LinguaVerseDimens.AvatarSmall)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.VolumeUp,
                                            contentDescription = stringResource(R.string.listen),
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(LinguaVerseDimens.IconSmall)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Correction chip
                    if (!isUser) {
                        message.correction?.let { corr ->
                            Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
                            LinguaSnackbar(
                                message = stringResource(R.string.ai_correction, corr),
                                type = SnackbarType.Error,
                                visible = true
                            )
                        }
                        message.suggestion?.let { sug ->
                            Spacer(modifier = Modifier.height(LinguaVerseDimens.InlineSpacing))
                            LinguaSnackbar(
                                message = stringResource(R.string.ai_suggestion, sug),
                                type = SnackbarType.Info,
                                visible = true
                            )
                        }
                    }
                }
            }
        }
    }
}
