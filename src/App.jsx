import { useState } from 'react'
import TopNav from './components/TopNav'
import Feed from './components/Feed'
import KnowledgeBase from './components/KnowledgeBase'

export default function App() {
  const [activeTab, setActiveTab] = useState('feed')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-0">
        {activeTab === 'feed' ? <Feed /> : <KnowledgeBase />}
      </div>
    </div>
  )
}
