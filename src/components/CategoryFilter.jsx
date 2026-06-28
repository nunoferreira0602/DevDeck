const CATEGORIES = ['All', 'AI', 'Tactics', 'Processes', 'Industry']

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Date' },
  { value: 'source', label: 'Source' },
]

export default function CategoryFilter({ category, onCategory, highScoreOnly, onHighScore, sortBy, onSort }) {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-800">
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onCategory(c === 'All' ? 'all' : c)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              (c === 'All' && category === 'all') || category === c
                ? 'bg-sky-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => onHighScore(!highScoreOnly)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            highScoreOnly
              ? 'bg-emerald-700 text-emerald-100'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          Score ≥ 7
        </button>

        <select
          value={sortBy}
          onChange={(e) => onSort(e.target.value)}
          className="bg-gray-800 text-gray-400 text-sm rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-gray-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
