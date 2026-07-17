import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const VALID_VOICES = [
  'pNInz6obbfDQGcgMyIGD', // Adam
  'EXAVITQu4vr4xnSDxMaL',  // Sarah
  '2EiwWnXFnvU5JabPnv8n',  // Tarik
  'ErXwobaYiN019PkySvjV',  // Antoni
]

const DEFAULT_VOICE = 'pNInz6obbfDQGcgMyIGD'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, voiceId, stability = 0.5, similarity = 0.75 } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided or invalid text format' }, { status: 400 })
    }

    const finalVoiceId = voiceId && VALID_VOICES.includes(voiceId) ? voiceId : DEFAULT_VOICE

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}?optimize_latency=4`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: Number(stability) || 0.5,
          similarity_boost: Number(similarity) || 0.75,
          style: 0.0,
          use_speaker_boost: false,
        },
      }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('Content-Type')
      let errorMessage = `ElevenLabs API error: ${response.status}`
      
      try {
        if (contentType?.includes('application/json')) {
          const error = await response.json()
          errorMessage = error.detail?.message || error.error?.message || error.message || errorMessage
        } else {
          const textError = await response.text()
          if (textError) errorMessage = textError
        }
      } catch (e) {
        console.error('Error parsing ElevenLabs response:', e)
      }
      
      console.error('ElevenLabs API error:', errorMessage, 'Status:', response.status)
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })

  } catch (error: any) {
    console.error('TTS Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 })
  }
}
