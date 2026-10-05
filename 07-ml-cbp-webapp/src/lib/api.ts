import type { WorkspaceDoc } from '../data/mockWorkspace'

const mockFallback: WorkspaceDoc[] = [
  {
    id: 'book-1',
    type: 'book',
    title: 'Dynamic Programming Essentials',
    subtitle: 'Algorithms and practice workbook',
    tag: 'book',
    lastUpdated: '2 hours ago',
    status: 'active',
    description: 'Core reading notes for optimization, DP strategies, and worked examples across greedy and knapsack problems.',
    metrics: [
      { label: 'Exercises', value: '18' },
      { label: 'Highlights', value: '42' },
      { label: 'Saved queries', value: '134' },
    ],
    highlights: [
      { id: 'exercise-1', title: 'Exercise 1 start', kind: 'exercise start', targetId: 'exercise-1', confidence: 98 },
      { id: 'exercise-6', title: '0/1 Knapsack DP', kind: 'illustration', targetId: 'exercise-6', confidence: 96 },
    ],
    sections: [
      { id: 'intro', heading: 'Intro', body: 'Dynamic programming helps break complex problems into reusable subproblems.' },
      { id: 'exercise-6', heading: '0/1 Knapsack', body: 'Use a DP table by item and capacity to track the best value.' },
    ],
  },
  {
    id: 'note-1',
    type: 'note',
    title: 'Project Brainstorm',
    subtitle: 'planning and product direction',
    tag: 'notes',
    lastUpdated: '1 day ago',
    status: 'draft',
    description: 'A living knowledge base of product requirements, architecture decisions, and working theory around context windows and agentic retrieval.',
    metrics: [
      { label: 'Ideas', value: '27' },
      { label: 'Action items', value: '9' },
    ],
  },
  {
    id: 'pdf-1',
    type: 'pdf',
    title: 'Research Packet',
    subtitle: 'compiled manuscript export',
    tag: 'pdf',
    lastUpdated: '5 days ago',
    status: 'active',
    description: 'Markdown-to-PDF export workspace with comments and export presets.',
    metrics: [
      { label: 'Pages', value: '28' },
      { label: 'Export presets', value: '6' },
    ],
  },
]

export async function fetchWorkspace(): Promise<WorkspaceDoc[]> {
  const response = await fetch('/api/workspace')

  if (!response.ok) {
    return mockFallback
  }

  const data = await response.json()
  return Array.isArray(data?.docs) ? data.docs : mockFallback
}

export async function searchWorkspace(query: string) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    return { query, results: mockFallback }
  }

  return response.json()
}

export async function askRag(query: string) {
  const response = await fetch('/api/rag/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    return {
      answer: 'The backend is currently unavailable. Local fallback: start from the book sections and summarize the relevant chapter before exporting.',
      sourceDocId: 'book-1',
      highlights: ['exercise-1'],
      model: 'fallback',
      confidence: 0.78,
    }
  }

  return response.json()
}
