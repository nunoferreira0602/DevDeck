import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockGenerateContent = vi.fn()
const mockUpsert = vi.fn()
const mockFrom = vi.fn()

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent }
    }
  },
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mockFrom }),
}))

const VALID_RESPONSE = JSON.stringify({
  summary: 'A great article about AI tooling.',
  category: 'AI',
  relevance_score: 8,
})

const ARTICLES = [
  { title: 'Test Article', url: 'https://example.com/1', source: 'Test', raw_content: 'content' },
]

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.useFakeTimers()
  mockGenerateContent.mockResolvedValue({ response: { text: () => VALID_RESPONSE } })
  mockUpsert.mockResolvedValue({ error: null })
  mockFrom.mockReturnValue({ upsert: mockUpsert })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('classifyAndStore', () => {
  it('classifies and upserts articles with correct fields', async () => {
    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore(ARTICLES)
    await vi.runAllTimersAsync()
    await promise

    expect(mockUpsert).toHaveBeenCalledOnce()
    const [upserted] = mockUpsert.mock.calls[0][0]
    expect(upserted.summary_ai).toBe('A great article about AI tooling.')
    expect(upserted.category).toBe('AI')
    expect(upserted.relevance_score).toBe(8)
  })

  it('retries on Gemini failure and succeeds on second attempt', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error('rate limit'))
      .mockResolvedValueOnce({ response: { text: () => VALID_RESPONSE } })

    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore(ARTICLES)
    await vi.runAllTimersAsync()
    await promise

    expect(mockGenerateContent).toHaveBeenCalledTimes(2)
    expect(mockUpsert).toHaveBeenCalledOnce()
  })

  it('skips article after all retries fail', async () => {
    mockGenerateContent.mockRejectedValue(new Error('always fails'))

    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore(ARTICLES)
    await vi.runAllTimersAsync()
    await promise

    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('rejects invalid category from Gemini response', async () => {
    const badResponse = JSON.stringify({ summary: 'OK', category: 'Marketing', relevance_score: 5 })
    mockGenerateContent.mockResolvedValue({ response: { text: () => badResponse } })

    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore(ARTICLES)
    await vi.runAllTimersAsync()
    await promise

    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('clamps relevance_score to 1-10 range', async () => {
    const response = JSON.stringify({ summary: 'OK', category: 'AI', relevance_score: 15 })
    mockGenerateContent.mockResolvedValue({ response: { text: () => response } })

    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore(ARTICLES)
    await vi.runAllTimersAsync()
    await promise

    const [upserted] = mockUpsert.mock.calls[0][0]
    expect(upserted.relevance_score).toBe(10)
  })

  it('does nothing when passed an empty array', async () => {
    const { classifyAndStore } = await import('../scripts/classify-with-gemini.js')
    const promise = classifyAndStore([])
    await vi.runAllTimersAsync()
    await promise

    expect(mockGenerateContent).not.toHaveBeenCalled()
    expect(mockUpsert).not.toHaveBeenCalled()
  })
})
