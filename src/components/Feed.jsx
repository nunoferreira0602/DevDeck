import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ArticleCard from './ArticleCard'
import CategoryFilter from './CategoryFilter'

function sortArticles(articles, sortBy) {
  const sorted = [...articles]
  if (sortBy === 'relevance') {
    sorted.sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
  } else if (sortBy === 'date') {
    sorted.sort((a, b) => new Date(b.published_at ?? 0) - new Date(a.published_at ?? 0))
  } else if (sortBy === 'source') {
    sorted.sort((a, b) => a.source.localeCompare(b.source))
  }
  return sorted
}

export default function Feed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [category, setCategory] = useState('all')
  const [highScoreOnly, setHighScoreOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('articles')
        .select('*')
        .order('relevance_score', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(100)

      const { data, error: err } = await query
      if (err) {
        setError(err.message)
      } else {
        setArticles(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = articles
    .filter((a) => category === 'all' || a.category === category)
    .filter((a) => !highScoreOnly || (a.relevance_score ?? 0) >= 7)

  const sorted = sortArticles(filtered, sortBy)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading articles...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        Failed to load articles: {error}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <CategoryFilter
        category={category}
        onCategory={setCategory}
        highScoreOnly={highScoreOnly}
        onHighScore={setHighScoreOnly}
        sortBy={sortBy}
        onSort={setSortBy}
      />

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg font-medium text-gray-400">No articles yet</p>
          <p className="text-sm mt-2">
            Run <code className="bg-gray-800 px-1 rounded text-sky-400">node scripts/fetch-feeds.js | node scripts/classify-with-gemini.js</code> to populate the feed.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xs text-gray-600">{sorted.length} articles</p>
          {sorted.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
