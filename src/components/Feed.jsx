import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchFeed } from '../lib/fetchFeed'
import ArticleCard from './ArticleCard'
import feeds from '../../scripts/feeds.json'

function buildFeedUrl(feedUrl, search) {
  if (!search.trim()) return feedUrl
  if (feedUrl.includes('hnrss.org')) {
    const u = new URL(feedUrl)
    u.searchParams.set('q', search.trim())
    return u.toString()
  }
  return feedUrl
}

const PAGE_SIZE = 5

function FeedSection({ feed, savedUrls, onSaved }) {
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetched, setFetched] = useState(false)
  const [page, setPage] = useState(1)
  const searchTimeout = useRef(null)
  const isHN = feed.url.includes('hnrss.org')

  useEffect(() => {
    if (!fetched) doFetch()
  }, [])

  useEffect(() => {
    if (!fetched) return
    if (!isHN) return
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(doFetch, 500)
    return () => clearTimeout(searchTimeout.current)
  }, [search])

  async function doFetch() {
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      const url = buildFeedUrl(feed.url, search)
      const items = await fetchFeed(url)
      setArticles(items)
      setFetched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(article) {
    if (savedUrls.has(article.url)) return
    const { error: err } = await supabase
      .from('saved_articles')
      .insert({ ...article })
    if (!err) onSaved(article.url)
  }

  const filtered =
    search.trim() && !isHN
      ? articles.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.raw_content ?? '').toLowerCase().includes(search.toLowerCase()),
        )
      : articles

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={isHN ? 'Search HN…' : 'Filter by keyword…'}
          className="flex-1 bg-gray-800 text-gray-300 text-sm rounded px-3 py-2 border border-gray-700 placeholder-gray-600 focus:outline-none focus:border-sky-600"
        />
        <button
          onClick={doFetch}
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Fetching…' : 'Refresh'}
        </button>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Fetching articles…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48 text-red-400 text-sm">
          Failed to fetch: {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No articles found.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-600">{filtered.length} articles</p>
            {paginated.map((article) => (
              <ArticleCard
                key={article.url}
                article={article}
                onSave={handleSave}
                saved={savedUrls.has(article.url)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-4 py-1.5 rounded text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-4 py-1.5 rounded text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Feed() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visitedTabs, setVisitedTabs] = useState(new Set([0]))
  const [savedUrls, setSavedUrls] = useState(new Set())

  useEffect(() => {
    supabase
      .from('saved_articles')
      .select('url')
      .then(({ data }) => {
        if (data) setSavedUrls(new Set(data.map((r) => r.url)))
      })
  }, [])

  function handleTabChange(i) {
    setActiveIndex(i)
    setVisitedTabs((prev) => new Set([...prev, i]))
  }

  function handleSaved(url) {
    setSavedUrls((prev) => new Set([...prev, url]))
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="flex gap-1 mb-6 border-b border-gray-800 pb-0">
        {feeds.map((feed, i) => (
          <button
            key={feed.url}
            onClick={() => handleTabChange(i)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeIndex === i
                ? 'bg-gray-800 text-gray-100 border border-b-0 border-gray-700'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {feed.name}
          </button>
        ))}
      </div>

      {feeds.map((feed, i) =>
        visitedTabs.has(i) ? (
          <div key={feed.url} className={activeIndex === i ? '' : 'hidden'}>
            <FeedSection feed={feed} savedUrls={savedUrls} onSaved={handleSaved} />
          </div>
        ) : null,
      )}
    </div>
  )
}
