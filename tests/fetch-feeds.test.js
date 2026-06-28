import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('rss-parser', () => {
  return {
    default: class {
      async parseURL(url) {
        if (url === 'https://bad.feed/') throw new Error('Network error')
        return {
          items: [
            { title: 'Article One', link: 'https://example.com/1', pubDate: '2024-01-01', contentSnippet: 'snippet one' },
            { title: 'Article Two', link: 'https://example.com/2', pubDate: '2024-01-02', contentSnippet: 'snippet two' },
          ],
        }
      }
    },
  }
})

const mockIn = vi.fn()
const mockSelect = vi.fn(() => ({ in: mockIn }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mockFrom }),
}))

const TEST_FEEDS = [
  { name: 'Good Feed', url: 'https://good.feed/' },
  { name: 'Bad Feed', url: 'https://bad.feed/' },
]

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  mockIn.mockResolvedValue({ data: [], error: null })
  mockSelect.mockReturnValue({ in: mockIn })
  mockFrom.mockReturnValue({ select: mockSelect })
})

describe('fetchNewArticles', () => {
  it('returns only articles not already in the database', async () => {
    mockIn.mockResolvedValueOnce({
      data: [{ url: 'https://example.com/1' }],
      error: null,
    })

    const { fetchNewArticles } = await import('../scripts/fetch-feeds.js')
    const result = await fetchNewArticles(TEST_FEEDS)

    expect(result).toHaveLength(1)
    expect(result[0].url).toBe('https://example.com/2')
  })

  it('skips a feed that throws and continues with others', async () => {
    const { fetchNewArticles } = await import('../scripts/fetch-feeds.js')
    const result = await fetchNewArticles(TEST_FEEDS)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((a) => a.source === 'Good Feed')).toBe(true)
  })

  it('maps article fields correctly', async () => {
    const { fetchNewArticles } = await import('../scripts/fetch-feeds.js')
    const [first] = await fetchNewArticles([{ name: 'Good Feed', url: 'https://good.feed/' }])

    expect(first).toMatchObject({
      title: 'Article One',
      url: 'https://example.com/1',
      source: 'Good Feed',
      raw_content: 'snippet one',
    })
    expect(first.published_at).toBeTruthy()
  })

  it('throws if Supabase query fails', async () => {
    mockIn.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const { fetchNewArticles } = await import('../scripts/fetch-feeds.js')
    await expect(fetchNewArticles(TEST_FEEDS)).rejects.toThrow('Supabase query failed')
  })
})
