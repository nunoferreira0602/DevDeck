import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ArticleCard from './ArticleCard'

const PAGE_SIZE = 5
const FILTERS = ['all', 'unread', 'read']

function SidebarSection({ title, articles }) {
  if (articles.length === 0) return null
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title} ({articles.length})
      </p>
      <ul className="flex flex-col gap-1">
        {articles.map((a) => (
          <li key={a.id}>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 hover:text-sky-400 transition-colors leading-snug line-clamp-2 block"
            >
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Saved() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('saved_articles')
      .select('*')
      .order('saved_at', { ascending: false })
    if (err) setError(err.message)
    else setArticles(data ?? [])
    setLoading(false)
  }

  async function handleDelete(article) {
    const { error: err } = await supabase
      .from('saved_articles')
      .delete()
      .eq('id', article.id)
    if (!err) setArticles((prev) => prev.filter((a) => a.id !== article.id))
  }

  async function handleToggleRead(article) {
    const newRead = !article.read
    const { error: err } = await supabase
      .from('saved_articles')
      .update({ read: newRead })
      .eq('id', article.id)
    if (!err)
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, read: newRead } : a)),
      )
  }

  function handleFilter(f) {
    setFilter(f)
    setPage(1)
  }

  const unread = articles.filter((a) => !a.read)
  const read = articles.filter((a) => a.read)
  const filtered = filter === 'unread' ? unread : filter === 'read' ? read : articles
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading saved articles…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        Failed to load: {error}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg font-medium text-gray-400">Nothing saved yet</p>
        <p className="text-sm mt-2">Star articles in the News Feed to save them here.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 px-6 py-6 max-w-6xl mx-auto w-full">
      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                filter === f
                  ? 'bg-sky-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {f === 'all' ? `All (${articles.length})` : f === 'unread' ? `Unread (${unread.length})` : `Read (${read.length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            No {filter} articles.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {paginated.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onDelete={handleDelete}
                  onToggleRead={handleToggleRead}
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

      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-l border-gray-800 pl-6 pt-1">
        <SidebarSection title="Unread" articles={unread} />
        <SidebarSection title="Read" articles={read} />
      </aside>
    </div>
  )
}
