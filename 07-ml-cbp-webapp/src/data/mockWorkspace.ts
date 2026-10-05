export type ChatMessage = {
  role: 'assistant' | 'user'
  text: string
}

export type WorkspaceDoc = {
  id: string
  type: 'book' | 'note' | 'scan' | 'pdf' | 'ppt'
  title: string
  subtitle: string
  tag: string
  lastUpdated: string
  status: 'active' | 'needs-review' | 'draft'
  description: string
  metrics: { label: string; value: string }[]
  highlights?: Array<{
    id: string
    title: string
    kind: string
    targetId: string
    confidence: number
  }>
  sections?: Array<{
    id: string
    heading: string
    body: string
  }>
  conversionStack?: Array<{
    id: string
    label: string
    issue: string
    score: number
    severity: 'low' | 'medium' | 'high'
  }>
}

export const workspaceDocs: WorkspaceDoc[] = [
  {
    id: 'book-1',
    type: 'book',
    title: 'Dynamic Programming Essentials',
    subtitle: 'Algorithms and practice workbook',
    tag: 'book',
    lastUpdated: '2 hours ago',
    status: 'active',
    description:
      'Core reading notes for optimization, DP strategies, and worked examples across greedy and knapsack problems.',
    metrics: [
      { label: 'Exercises', value: '18' },
      { label: 'Highlights', value: '42' },
      { label: 'Saved queries', value: '134' },
    ],
    highlights: [
      { id: 'exercise-1', title: 'Exercise 1 start', kind: 'exercise start', targetId: 'exercise-1', confidence: 98 },
      { id: 'exercise-6', title: '0/1 Knapsack DP', kind: 'illustration', targetId: 'exercise-6', confidence: 96 },
      { id: 'exercise-11', title: 'Shortest path recurrence', kind: 'exercise start', targetId: 'exercise-11', confidence: 92 },
    ],
    sections: [
      {
        id: 'intro',
        heading: 'Intro',
        body:
          'Dynamic programming is a way to structure recursive solutions around overlapping subproblems and optimal substructure. This chapter builds from classic recurrence patterns into weighted state-search problems.',
      },
      {
        id: 'exercise-1',
        heading: 'Exercise 1',
        body:
          'Start with the coin-change recurrence. Define the state as the maximum value achievable with a subset of coins of size k. From there, expand the recurrence to include the current coin and the remaining capacity.',
      },
      {
        id: 'exercise-6',
        heading: '0/1 Knapsack illustration',
        body:
          'The 0/1 knapsack problem is modeled with a DP table where rows represent items and columns represent capacity. Each cell stores the maximum profit for the first i items under remaining capacity c. The diagonal transitions capture the choice to include or exclude an item.',
      },
      {
        id: 'exercise-11',
        heading: 'Exercise 11',
        body:
          'This exercise asks for the shortest path in a directed graph with delayed costs. The recurrence compares moving directly to paying the turn penalty and then taking the shortest known cost from the next state.',
      },
      {
        id: 'summary',
        heading: 'Summary',
        body:
          'The core pattern is to model state, define transitions, and recover the optimal path. Once these are in place, the remainder of the workbook focuses on memory simplifications and table reconstruction.',
      },
    ],
  },
  {
    id: 'note-1',
    type: 'note',
    title: 'Project Brainstorm',
    subtitle: 'meeting notes and research loops',
    tag: 'notes',
    lastUpdated: '1 day ago',
    status: 'draft',
    description:
      'A living knowledge base of product requirements, architecture decisions, and working theory around context windows and agentic retrieval.',
    metrics: [
      { label: 'Ideas', value: '27' },
      { label: 'Action items', value: '9' },
      { label: 'Links', value: '14' },
    ],
  },
  {
    id: 'scan-1',
    type: 'scan',
    title: 'Lecture Scan',
    subtitle: 'handwritten derivations',
    tag: 'handwritten',
    lastUpdated: '3 days ago',
    status: 'needs-review',
    description:
      'A scanned page library of handwritten notes with OCR corrections, formula symbols, and annotation review states.',
    metrics: [
      { label: 'Pages', value: '12' },
      { label: 'Needs edit', value: '4' },
      { label: 'Avg. quality', value: '87%' },
    ],
    conversionStack: [
      { id: 'scan-4', label: 'Derivative 2', issue: 'The integral bounds were misread', score: 71, severity: 'high' },
      { id: 'scan-7', label: 'Probability tree', issue: 'Edge labels shifted during OCR', score: 82, severity: 'medium' },
      { id: 'scan-10', label: 'Matrix factorization', issue: 'Formula symbols need manual confirmation', score: 89, severity: 'low' },
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
    description:
      'Markdown-to-PDF export workspace with comments, page structure tuning, and export prompts for final publication layout.',
    metrics: [
      { label: 'Pages', value: '28' },
      { label: 'Export presets', value: '6' },
      { label: 'Last format', value: 'A4' },
    ],
  },
  {
    id: 'ppt-1',
    type: 'ppt',
    title: 'Quarterly Review',
    subtitle: 'slides draft',
    tag: 'ppt',
    lastUpdated: '1 week ago',
    status: 'draft',
    description:
      'Presentation outline with AI-assisted slide conversion, visual notes, and markdown-to-deck formatting guides.',
    metrics: [
      { label: 'Slides', value: '14' },
      { label: 'Theme', value: 'Nordic' },
      { label: 'Notes', value: '17' },
    ],
  },
]

export const initialChat: ChatMessage[] = [
  {
    role: 'assistant',
    text: 'I can jump to the relevant section in your book, highlight exercises, and even surface handwritten conversion issues that may need review.',
  },
]

export const noteDraft = `# Reading notes

## Objective
- Outline the recurrence pattern for DP problems.
- Link learned examples to the question bank.

## Key observations
1. Start from state definition before writing transitions.
2. Keep the objective function explicit.
3. Reconstruct the answer from the table after optimization.

> The best retrieval setup is a hybrid of semantic recall and section-aware chunking.`
