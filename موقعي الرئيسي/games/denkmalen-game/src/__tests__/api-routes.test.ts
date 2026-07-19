// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
    method: init?.method || 'GET',
    headers: new Map(Object.entries(init?.headers || {})),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      status: init?.status || 200,
      json: jest.fn().mockResolvedValue(body),
      body,
    })),
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('API Routes', () => {
  describe('evaluate route', () => {
    it('handles evaluate request', async () => {
      // Mock Gemini API response
      ;(fetch as jest.fn).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  score: 85,
                  feedback: 'Great drawing!',
                  details: { accuracy: 80, creativity: 90, overall: 85 }
                })
              }]
            }
          }]
        }),
      })

      const { POST } = await import('@/app/api/evaluate/route')
      
      const request = {
        json: jest.fn().mockResolvedValue({
          image: 'data:image/png;base64,abc',
          word: 'cat',
        }),
      } as any

      const response = await POST(request)
      expect(response).toBeDefined()
    })

    it('handles missing image', async () => {
      const { POST } = await import('@/app/api/evaluate/route')
      
      const request = {
        json: jest.fn().mockResolvedValue({
          word: 'cat',
        }),
      } as any

      const response = await POST(request)
      expect(response).toBeDefined()
    })
  })

  describe('generate-word route', () => {
    it('handles word generation request', async () => {
      ;(fetch as jest.fn).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({ word: 'elephant' })
              }]
            }
          }]
        }),
      })

      const { POST } = await import('@/app/api/generate-word/route')
      
      const request = {
        json: jest.fn().mockResolvedValue({
          category: 'animals',
          language: 'en',
        }),
      } as any

      const response = await POST(request)
      expect(response).toBeDefined()
    })
  })

  describe('hints route', () => {
    it('handles hints request', async () => {
      ;(fetch as jest.fn).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  hints: ['Has four legs', 'Can be fluffy', 'Says meow']
                })
              }]
            }
          }]
        }),
      })

      const { POST } = await import('@/app/api/hints/route')
      
      const request = {
        json: jest.fn().mockResolvedValue({
          word: 'cat',
          language: 'en',
        }),
      } as any

      const response = await POST(request)
      expect(response).toBeDefined()
    })
  })
})
