const TABS = [
  { id: 'feed', label: 'News Feed' },
  { id: 'knowledge', label: 'Knowledge Base' },
]

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6">
      <div className="flex items-center gap-1">
        <span className="text-sky-500 font-bold text-lg mr-6 py-4">DevDeck</span>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
