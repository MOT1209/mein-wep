import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req)
  const { allowed, resetTime } = checkRateLimit(clientId, {
    windowMs: 60 * 1000,
    maxRequests: 10,
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
    const { prompt, model = 'gemma-4-27b-at', type = 'chat', temperature = 0.7, max_tokens = 1000 } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 })
    }

    let endpoint = ''
    let requestBody: Record<string, unknown> = {}

    switch (type) {
      case 'chat':
        endpoint = 'https://openrouter.ai/api/v1/chat/completions'
        requestBody = {
          model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens,
          stream: false
        }
        break
      
      case 'image':
        const { model: imageModel = 'stabilityai/sd-xl' } = await req.json()
        endpoint = 'https://openrouter.ai/api/v1/images/generations'
        requestBody = {
          model: imageModel,
          prompt,
          size: '1024x1024',
          steps: 20,
          guidance_scale: 7.5
        }
        break
      
      case 'video':
        endpoint = 'https://openrouter.ai/api/v1/videos/generations'
        requestBody = {
          model: 'runway-gen-2',
          prompt,
          duration: 5,
          aspect_ratio: '16:9'
        }
        break
      
      case 'tts':
        const { voice = 'arabic' } = await req.json()
        const voiceSettings: Record<string, string> = {
          'arabic': 'arabic',
          'english': 'english',
          'male': 'male_speaker',
          'female': 'female_speaker',
        }
        endpoint = 'https://openrouter.ai/api/v1/audio/speech'
        requestBody = {
          model: 'suno/bark',
          input: prompt.slice(0, 1000),
          voice: voiceSettings[voice] || 'arabic',
          response_format: 'mp3'
        }
        break

      default:
        return NextResponse.json({ error: 'Unsupported type. Use "chat", "image", "video", or "tts"' }, { status: 400 })
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://termin77-app.netlify.app',
        'X-Title': 'AlKing Dashboard'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ 
        error: errorData.error || `OpenRouter API error: ${response.status}`,
        details: errorData
      }, { status: response.status })
    }

    const data = await response.json()

    // Handle different response types
    if (type === 'chat') {
      const content = data.choices?.[0]?.message?.content
      return NextResponse.json({ 
        content,
        model: data.model,
        usage: data.usage
      })
    } else if (type === 'image') {
      const imageUrl = data.data?.[0]?.url
      return NextResponse.json({ 
        imageUrl,
        model: data.model
      })
    } else if (type === 'video') {
      const videoUrl = data.video?.url
      return NextResponse.json({ 
        videoUrl,
        model: data.model,
        status: data.status
      })
    } else if (type === 'tts') {
        const audioBuffer = await response.arrayBuffer()
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        })
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    provider: 'OpenRouter',
    website: 'https://openrouter.ai',
    models: {
      text: [
        { id: 'gemma-4-27b-at', name: 'Gemma 4 27B (Arabic)', description: 'مدعوم باللغة العربية' },
        { id: 'gemma-4-27b', name: 'Gemma 4 27B', description: 'مدعم باللغة الإنجليزية' },
        { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'نموذج متقدم للنصوص' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'نموذج متقدم من OpenAI' }
      ],
      image: [
        { id: 'stabilityai/sd-xl', name: 'Stability AI XL', description: 'توليد صور عالية الجودة' }
      ],
      video: [
        { id: 'runway-gen-2', name: 'Runway Gen-2', description: 'توليد فيديو عالي الجودة' }
      ],
      tts: [
        { id: 'suno/bark', name: 'Bark', description: 'نص لكلام عالي الجودة - مجاني!' }
      ]
    },
    voices: [
      { id: 'arabic', name: 'Arabic', description: 'صوت عربي' },
      { id: 'english', name: 'English', description: 'صوت إنجليزي' },
      { id: 'male', name: 'Male', description: 'صوت ذكر' },
      { id: 'female', name: 'Female', description: 'صوت أنثى' }
    ],
    supported_types: ['chat', 'image', 'video', 'tts'],
    status: 'ready'
  })
}