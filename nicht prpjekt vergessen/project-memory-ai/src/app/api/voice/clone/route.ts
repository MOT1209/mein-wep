import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    const name = formData.get('name') as string || 'Custom Voice'
    const description = formData.get('description') as string || ''

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate audio file
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg']
    if (!validTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Invalid audio format. Use MP3, WAV, or WebM' },
        { status: 400 }
      )
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum 10MB allowed' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Convert audio to base64
    const audioBytes = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(audioBytes).toString('base64')

    // Create voice using ElevenLabs Voice Cloning API
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        name: name,
        description: description || `Cloned voice: ${name}`,
        files: [
          {
            file_name: audioFile.name,
            file_data: `data:${audioFile.type};base64,${base64Audio}`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail?.message || 'Voice cloning failed' },
        { status: response.status }
      )
    }

    const voiceData = await response.json()

    return NextResponse.json({
      success: true,
      voiceId: voiceData.voice_id,
      name: voiceData.name,
      category: voiceData.category,
      description: voiceData.description
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// List all voices
export async function GET(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}