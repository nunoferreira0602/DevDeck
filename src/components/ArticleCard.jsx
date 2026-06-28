function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function truncate(text, max = 180) {
  if (!text || text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export default function ArticleCard({ article, onSave, onDelete, onToggleRead, saved }) {
  const { title, url, source, published_at, raw_content, read } = article

  return (
    <div className={`border rounded-lg p-5 transition-colors ${
      read
        ? 'bg-gray-900 border-gray-800 hover:border-gray-700'
        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`font-medium leading-snug hover:text-sky-400 transition-colors ${
            read ? 'text-gray-400' : 'text-gray-100'
          }`}
        >
          {title}
        </a>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleRead && (
            <button
              onClick={() => onToggleRead(article)}
              title={read ? 'Mark as unread' : 'Mark as read'}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                read
                  ? 'border-emerald-700 text-emerald-500 hover:border-emerald-500'
                  : 'border-gray-600 text-gray-500 hover:border-emerald-600 hover:text-emerald-500'
              }`}
            >
              {read ? '✓ Read' : 'Unread'}
            </button>
          )}

          {onSave && (
            <button
              onClick={() => onSave(article)}
              title={saved ? 'Already saved' : 'Save article'}
              className={`text-lg transition-colors ${
                saved ? 'text-yellow-400 cursor-default' : 'text-gray-600 hover:text-yellow-400'
              }`}
            >
              {saved ? '★' : '☆'}
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(article)}
              title="Remove from saved"
              className="text-gray-600 hover:text-red-400 transition-colors text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {raw_content && (
        <p className="text-gray-400 text-sm leading-relaxed mb-3">
          {truncate(raw_content)}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">{source}</span>
        {published_at && (
          <span className="text-xs text-gray-600">{formatDate(published_at)}</span>
        )}
      </div>
    </div>
  )
}
