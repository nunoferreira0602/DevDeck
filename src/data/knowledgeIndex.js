import claudeTips from './knowledge/ai-assistants/claude-tips.md?raw'
import cursorRules from './knowledge/ai-assistants/cursor-rules.md?raw'
import aiProjectStarter from './knowledge/project-recipes/ai-project-starter.md?raw'
import dailyWorkflow from './knowledge/productivity/daily-workflow.md?raw'

export const SECTIONS = [
  {
    id: 'ai-assistants',
    label: 'AI Assistants',
    entries: [
      { id: 'claude-tips', title: 'Claude Tips & Structures', content: claudeTips },
      { id: 'cursor-rules', title: 'Cursor Rules & Workflows', content: cursorRules },
    ],
  },
  {
    id: 'project-recipes',
    label: 'Project Recipes',
    entries: [
      { id: 'ai-project-starter', title: 'AI Project Starter', content: aiProjectStarter },
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity',
    entries: [
      { id: 'daily-workflow', title: 'Daily SE Workflow', content: dailyWorkflow },
    ],
  },
]
