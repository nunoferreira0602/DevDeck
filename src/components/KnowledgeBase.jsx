import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { SECTIONS } from '../data/knowledgeIndex'

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n?/, '')
}

export default function KnowledgeBase() {
  const firstEntry = SECTIONS[0].entries[0]
  const [selectedId, setSelectedId] = useState(firstEntry.id)

  const allEntries = SECTIONS.flatMap((s) => s.entries)
  const selected = allEntries.find((e) => e.id === selectedId) ?? firstEntry

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 overflow-y-auto">
        <nav className="py-4">
          {SECTIONS.map((section) => (
            <div key={section.id} className="mb-4">
              <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                {section.label}
              </p>
              {section.entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedId === entry.id
                      ? 'bg-gray-800 text-sky-400 border-r-2 border-sky-500'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  {entry.title}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <article className="max-w-3xl mx-auto prose-kb">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-100 mb-6 pb-3 border-b border-gray-700">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-gray-100 mt-8 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1 pl-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1 pl-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-gray-300 leading-relaxed">{children}</li>,
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-gray-800 text-sky-300 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <code className="block bg-gray-800 text-gray-200 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4 whitespace-pre">
                    {children}
                  </code>
                ),
              pre: ({ children }) => <>{children}</>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-sky-600 pl-4 text-gray-400 italic mb-4">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-100">{children}</strong>
              ),
              hr: () => <hr className="border-gray-700 my-6" />,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm text-gray-300 border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="text-gray-400">{children}</thead>,
              th: ({ children }) => (
                <th className="text-left px-3 py-2 border-b border-gray-700 font-semibold text-gray-300">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 border-b border-gray-800">{children}</td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {stripFrontmatter(selected.content)}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
