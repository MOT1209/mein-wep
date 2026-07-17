import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req)
  const { allowed, resetTime } = checkRateLimit(clientId, {
    windowMs: 60 * 1000,
    maxRequests: 5,
  })

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
        },
      }
    )
  }

  try {
    const { prompt, type = 'script' } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const systemPrompt = type === 'script' 
      ? "You are a viral content creator. Generate a high-energy video script based on the following topic. Include visual cues in [brackets]." 
      : "You are an expert SEO blogger. Create a long-form, engaging blog post based on the following topic."

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nTopic: ${prompt}` }]
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', errorData)
      return NextResponse.json({ 
        error: errorData.error?.message || `Gemini API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({ content })

  } catch (error: any) {
    console.error('Gemini generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
