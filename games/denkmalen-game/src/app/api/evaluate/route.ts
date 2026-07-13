// API Route for AI Drawing Evaluation
// This server-side route handles Gemini API calls to keep the API key secure

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// System prompt for the AI Judge
const JUDGE_PROMPT = `You are a friendly and encouraging art judge for a drawing game called "Draw Battle".

Your task is to evaluate a player's drawing based on:
1. The secret word they were supposed to draw
2. The category of the word
3. How much time they had to draw

EVALUATION CRITERIA:
- ACCURACY (0-100): How well does the drawing represent the word?
- CREATIVITY (0-100): How creative and unique is the interpretation?
- CLARITY (0-100): How clear and recognizable is the drawing?
- OVERALL SCORE (0-100): Combined quality considering all factors

SCORING GUIDELINES:
- 90-100: Exceptional - instantly recognizable, creative, detailed
- 70-89: Great - clearly represents the word, good effort
- 50-69: Good - somewhat recognizable, decent attempt
- 30-49: Fair - hard to recognize but shows effort
- 0-29: Needs work - doesn't clearly represent the word

IMPORTANT RULES:
- Be encouraging and positive, even for poor drawings
- Focus on effort and creativity, not just accuracy
- Give constructive feedback
- Consider the drawing time (less time = more forgiving)
- Never be harsh or discouraging
- If the drawing is completely unrelated, score it low but kindly

RESPONSE FORMAT (JSON only, no markdown, no code blocks):
{"score": <number 0-100>, "accuracy": <number 0-100>, "creativity": <number 0-100>, "clarity": <number 0-100>, "comment": "<short encouraging feedback, 1-2 sentences>"}`

interface EvaluationRequest {
  word: string
  drawingData: string
  category: string
  drawingTime: number
}

interface AIEvaluation {
  score: number
  accuracy: number
  creativity: number
  clarity: number
  comment: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json()
    const { word, drawingData, category, drawingTime } = body

    // Validate request
    if (!word || !drawingData) {
      return NextResponse.json(
        { error: 'Missing required fields: word, drawingData' },
        { status: 400 }
      )
    }

    // If no API key, return mock evaluation
    if (!genAI || !API_KEY) {
      console.warn('Gemini API key not configured, using mock evaluation')
      return NextResponse.json(getMockEvaluation(word))
    }

    // Initialize model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    })

    // Convert base64 to parts
    const base64 = drawingData.replace(/^data:image\/\w+;base64,/, '')
    const imageParts = [{
      inlineData: {
        mimeType: 'image/png',
        data: base64
      }
    }]

    const prompt = `${JUDGE_PROMPT}

WORD TO DRAW: "${word}"
CATEGORY: ${category}
TIME TO DRAW: ${drawingTime} seconds

Evaluate this drawing and return ONLY the JSON response:`

    // Call Gemini API
    const result = await model.generateContent([prompt, ...imageParts])
    const response = result.response
    const text = response.text()

    // Parse response
    const evaluation = parseAIResponse(text)
    
    return NextResponse.json(evaluation)

  } catch (error) {
    console.error('AI Evaluation error:', error)
    
    // Return mock evaluation on error
    const body = await request.json().catch(() => ({}))
    return NextResponse.json(getMockEvaluation(body.word || 'unknown'))
  }
}

function parseAIResponse(text: string): AIEvaluation {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        score: clamp(parsed.score || 50, 0, 100),
        accuracy: clamp(parsed.accuracy || 50, 0, 100),
        creativity: clamp(parsed.creativity || 50, 0, 100),
        clarity: clamp(parsed.clarity || 50, 0, 100),
        comment: typeof parsed.comment === 'string' ? parsed.comment : 'Good effort! 🎨'
      }
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e)
  }
  return getMockEvaluation()
}

function getMockEvaluation(word?: string): AIEvaluation {
  const baseScore = 60 + Math.floor(Math.random() * 20)
  return {
    score: baseScore,
    accuracy: baseScore - 5 + Math.floor(Math.random() * 10),
    creativity: baseScore + Math.floor(Math.random() * 15),
    clarity: baseScore - 10 + Math.floor(Math.random() * 20),
    comment: getRandomEncouragement()
  }
}

function getRandomEncouragement(): string {
  const comments = [
    "Great effort! Keep drawing! 🎨",
    "Nice try! I can see what you were going for! ✨",
    "Creative interpretation! Well done! 🌟",
    "Good job! Every drawing tells a story! 🎭",
    "Keep it up! You're improving! 💪",
    "That's a fun take on it! 🎉",
    "I love the creativity! 🎨",
    "Well done! The effort shows! ⭐",
  ]
  return comments[Math.floor(Math.random() * comments.length)]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
