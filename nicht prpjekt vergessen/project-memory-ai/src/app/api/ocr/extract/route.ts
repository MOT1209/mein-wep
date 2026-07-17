import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File | null

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld'
    const language = req.nextUrl.searchParams.get('lang') || 'auto'

    const bytes = await image.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: JSON.stringify({
        base64Image: `data:${image.type};base64,${base64Image}`,
        language: language,
        isOverlayRequired: false,
        detectOrientation: true,
        scale: true,
        OCREngine: 2,
      }),
    })

    const data = await response.json()

    if (data.IsErroredOnProcessing) {
      return NextResponse.json({ error: data.ErrorMessage[0] }, { status: 500 })
    }

    const text = data.ParsedResults?.[0]?.ParsedText || ''
    const confidence = data.ParsedResults?.[0]?.TextOverlay?.MeanConfidence || 0

    return NextResponse.json({
      text,
      confidence,
      provider: 'ocr.space',
      parsedResults: data.ParsedResults
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    provider: 'OCR.space',
    website: 'https://ocr.space',
    free: true,
    limits: '500 requests/day (free key: helloworld)',
    languages: ['auto', 'eng', 'ara', 'spa', 'fre', 'ger', 'ita', 'por', 'rus', 'chi_sim', 'chi_tra', 'jpn', 'kor']
  })
}