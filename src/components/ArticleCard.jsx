const CATEGORY_COLORS = {
  AI: 'bg-violet-900 text-violet-300',
  Tactics: 'bg-sky-900 text-sky-300',
  Processes: 'bg-emerald-900 text-emerald-300',
  Industry: 'bg-amber-900 text-amber-300',
}

const SCORE_COLOR = (score) => {
  if (score >= 8) return 'text-emerald-400'
  if (score >= 5) return 'text-yellow-400'
  return 'text-gray-500'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ArticleCard({ article }) {
  const { title, url, source, published_at, summary_ai, category, relevance_score } = article

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-gray-100 font-medium leading-snug hover:text-sky-400 transition-colors"
        >
          {title}
        </a>
        {relevance_score != null && (
          <span className={`shrink-0 text-sm font-bold ${SCORE_COLOR(relevance_score)}`}>
            {relevance_score}/10
          </span>
        )}
      </div>

      {summary_ai && (
        <p className="text-gray-400 text-sm leading-relaxed mb-3">{summary_ai}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {category && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[category] ?? 'bg-gray-700 text-gray-300'}`}>
            {category}
          </span>
        )}
        <span className="text-xs text-gray-500">{source}</span>
        {published_at && (
          <span className="text-xs text-gray-600">{formatDate(published_at)}</span>
        )}
      </div>
    </div>
  )
}
