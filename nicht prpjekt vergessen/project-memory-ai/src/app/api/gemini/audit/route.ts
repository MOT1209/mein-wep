import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code, filename } = await req.json()

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const prompt = `
You are an elite code auditor. Analyze the following code and return ONLY a valid JSON object.

File: ${filename || 'unknown'}

Code:
\`\`\`
${code}
\`\`\`

Return this exact JSON structure (no markdown, no explanation, just JSON):
{
  "score": <number 0-100>,
  "language": "<detected language>",
  "summary": "<2 sentence summary>",
  "security": [
    {
      "id": "SEC001",
      "severity": "critical|high|medium|low",
      "title": "<issue title>",
      "description": "<what the issue is>",
      "line": <line number or null>,
      "fix": "<how to fix it>"
    }
  ],
  "performance": [
    {
      "id": "PERF001",
      "severity": "high|medium|low",
      "title": "<issue title>",
      "description": "<what the issue is>",
      "line": <line number or null>,
      "fix": "<how to fix it>"
    }
  ],
  "logic": [
    {
      "id": "LOG001",
      "severity": "high|medium|low",
      "title": "<issue title>",
      "description": "<what the issue is>",
      "line": <line number or null>,
      "fix": "<how to fix it>"
    }
  ]
}
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Strip markdown fences if present
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const report = JSON.parse(cleaned)

    return NextResponse.json(report)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
  }
}
