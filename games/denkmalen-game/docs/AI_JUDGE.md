# 🤖 AI Judge - Gemini 2.5 Flash Integration

## Overview

The AI Judge feature uses Google Gemini 2.5 Flash to evaluate drawings after each round, providing fair and unbiased scoring alongside player votes.

## How It Works

### Evaluation Flow

1. **Player submits drawing** → Canvas data sent to API
2. **AI analyzes drawing** → Gemini evaluates against the secret word
3. **Score returned** → Accuracy, creativity, clarity scores
4. **Final score calculated** → 70% player votes + 30% AI score

### Score Breakdown

| Component | Weight | Description |
|-----------|--------|-------------|
| Player Votes | 70% | Anonymous voting from other players |
| AI Score | 30% | Gemini's evaluation of the drawing |

### AI Evaluation Criteria

- **Accuracy (0-100)**: How well does the drawing represent the word?
- **Creativity (0-100)**: How creative and unique is the interpretation?
- **Clarity (0-100)**: How clear and recognizable is the drawing?
- **Overall Score (0-100)**: Combined quality considering all factors

## API Endpoint

### POST /api/evaluate

**Request Body:**
```json
{
  "word": "Apple",
  "drawingData": "data:image/png;base64,...",
  "category": "food",
  "drawingTime": 60
}
```

**Response:**
```json
{
  "score": 75,
  "accuracy": 80,
  "creativity": 70,
  "clarity": 72,
  "comment": "Great effort! The apple is clearly recognizable with nice use of color! 🍎"
}
```

## Features

### ✅ Smart Evaluation
- Detects if drawing matches the word
- Rewards creative interpretations
- Considers drawing time (less time = more forgiving)

### ✅ Encouraging Feedback
- Always positive and supportive
- Short, friendly comments
- Never harsh or discouraging

### ✅ Graceful Fallback
- Works without API key (mock evaluations)
- Handles API failures without stopping the game
- Returns reasonable default scores

### ✅ Performance
- Evaluations happen asynchronously
- Shows loading animation while processing
- Parallel evaluation for multiple drawings

## Environment Variables

```env
# Required for AI Judge — server-side only, never expose this with a
# NEXT_PUBLIC_ prefix (that would bundle the key into client-side JS).
GEMINI_API_KEY=your_gemini_api_key_here
```

## Setup

1. Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Add the key to `.env.local`
3. Install dependencies: `npm install @google/generative-ai`
4. Restart the development server

## Scoring Examples

### Exceptional Drawing (90-100)
> "Exceptional work! The drawing is instantly recognizable with fantastic detail and creativity! ⭐"

### Great Drawing (70-89)
> "Great job! I can clearly see what you were drawing. Nice use of colors! 🎨"

### Good Drawing (50-69)
> "Good effort! I can see what you were going for. Keep practicing! 💪"

### Fair Drawing (30-49)
> "Nice try! Every drawing tells a story. Keep it up! 🌟"

### Needs Work (0-29)
> "Good start! Drawing takes practice. You'll get better! 🎭"

## Technical Details

### Gemini Model
- Model: `gemini-2.5-flash`
- Temperature: 0.7 (for varied responses)
- Max tokens: 200 (for concise feedback)

### Image Processing
- Accepts base64 encoded PNG images
- Converts to Gemini API format automatically
- Handles various image sizes

### Error Handling
- API failures return mock evaluations
- Game continues even if AI is unavailable
- Logging for debugging

## Future Enhancements

- [ ] Batch evaluation for all drawings at once
- [ ] Caching for repeated evaluations
- [ ] Custom evaluation prompts per category
- [ ] Historical score tracking
- [ ] AI difficulty settings

---

**Powered by Google Gemini 2.5 Flash** 🚀
