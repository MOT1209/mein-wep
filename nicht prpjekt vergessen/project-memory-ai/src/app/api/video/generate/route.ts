import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, duration = 4, aspectRatio = '16:9', imageUrl } = await req.json()

    if (!prompt && !imageUrl) {
      return NextResponse.json({ error: 'No prompt or image provided' }, { status: 400 })
    }

    const falKey = process.env.FAL_AI_KEY
    
    if (!falKey) {
      return NextResponse.json({ error: 'FAL_AI_KEY not configured' }, { status: 500 })
    }

    let endpoint = ''
    let requestBody: Record<string, unknown> = {}

    // Choose endpoint based on whether we have image or just prompt
    if (imageUrl) {
      // Image to Video
      endpoint = 'https://fal.run/fal-ai/pika/v2.2/image-to-video'
      requestBody = {
        image_url: imageUrl,
        prompt: prompt || 'Make this image move',
        aspect_ratio: aspectRatio || '16:9',
        resolution: '720p',
        duration: Math.min(duration, 5)
      }
    } else {
      // Text to Video
      endpoint = 'https://fal.run/fal-ai/pika/v2.2/text-to-video'
      requestBody = {
        prompt,
        aspect_ratio: aspectRatio || '16:9',
        resolution: '720p',
        duration: Math.min(duration, 5)
      }
    }

    const falResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${falKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!falResponse.ok) {
      const errorData = await falResponse.json().catch(() => ({}))
      return NextResponse.json({ 
        error: errorData.detail || `Pika API error: ${falResponse.status}`,
        provider: 'pika.fal.ai'
      }, { status: falResponse.status })
    }

    const data = await falResponse.json()
    
    // If it's an async request, return the request_id
    if (data.request_id) {
      const requestId = data.request_id
      let result = null
      let attempts = 0
      
      while (!result && attempts < 60) {
        await new Promise(r => setTimeout(r, 3000))
        
        try {
          const statusRes = await fetch(`https://queue.fal.run/fal-ai/pika/v2.2/requests/${requestId}`, {
            headers: { 'Authorization': `Key ${falKey}` }
          })
          
          if (statusRes.ok) {
            const statusData = await statusRes.json()
            if (statusData.status === 'COMPLETED') {
              result = statusData
            } else if (statusData.status === 'FAILED') {
              return NextResponse.json({ 
                error: 'Video generation failed',
                details: statusData
              }, { status: 500 })
            }
          }
        } catch (e) {
          console.log('Polling error:', e)
        }
        
        attempts++
      }
      
      if (result?.video?.url) {
        return NextResponse.json({
          videoUrl: result.video.url,
          provider: 'pika.fal.ai'
        })
      }
      
      return NextResponse.json({
        status: 'processing',
        requestId,
        message: 'Video is being generated...'
      })
    }

    // If synchronous, return directly
    if (data.video?.url) {
      return NextResponse.json({
        videoUrl: data.video.url,
        provider: 'pika.fal.ai'
      })
    }

    return NextResponse.json({
      error: 'No video returned from API',
      data
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    provider: 'Pika (fal.ai)',
    website: 'https://fal.ai',
    endpoints: [
      { name: 'text-to-video', path: '/fal-ai/pika/v2.2/text-to-video' },
      { name: 'image-to-video', path: '/fal-ai/pika/v2.2/image-to-video' }
    ],
    status: 'ready'
  })
}