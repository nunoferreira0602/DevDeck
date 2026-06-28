import { useState } from 'react'
import TopNav from './components/TopNav'
import Feed from './components/Feed'
import Saved from './components/Saved'
import KnowledgeBase from './components/KnowledgeBase'
import MyProjects from './components/MyProjects'

export default function App() {
  const [activeTab, setActiveTab] = useState('feed')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-0 h-full">
        {activeTab === 'feed' && <Feed />}
        {activeTab === 'saved' && <Saved />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'projects' && <MyProjects />}
      </div>
    </div>
  )
}
