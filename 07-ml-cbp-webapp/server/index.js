import express from 'express'
import cors from 'cors'

const app = express()
const port = 4000

app.use(cors())
app.use(express.json())

const workspace = {
  docs: [
    {
      id: 'book-1',
      type: 'book',
      title: 'Dynamic Programming Essentials',
      subtitle: 'Algorithms and practice workbook',
      tag: 'book',
      description:
        'Core reading notes for optimization, DP strategies, and worked examples across greedy and knapsack problems.',
      metrics: [
        { label: 'Exercises', value: '18' },
        { label: 'Highlights', value: '42' },
        { label: 'Saved queries', value: '134' },
      ],
      highlights: [
        { id: 'exercise-1', title: 'Exercise 1 start', kind: 'exercise start', targetId: 'exercise-1', confidence: 98 },
        { id: 'exercise-6', title: '0/1 knapsack DP', kind: 'illustration', targetId: 'exercise-6', confidence: 96 },
        { id: 'exercise-11', title: 'Shortest path recurrence', kind: 'exercise start', targetId: 'exercise-11', confidence: 92 },
      ],
      sections: [
        {
          id: 'intro',
          heading: 'Intro',
          body:
            'Dynamic programming is a way to structure recursive solutions around overlapping subproblems and optimal substructure.',
        },
        {
          id: 'exercise-1',
          heading: 'Exercise 1',
          body:
            'Start with the coin-change recurrence. Define the state as the maximum value achievable with a subset of coins of size k.',
        },
        {
          id: 'exercise-6',
          heading: '0/1 Knapsack illustration',
          body:
            'The 0/1 knapsack problem is modeled with a DP table where rows represent items and columns represent capacity. The diagonal transitions capture the choice to include or exclude an item.',
        },
        {
          id: 'exercise-11',
          heading: 'Exercise 11',
          body:
            'This exercise asks for the shortest path in a directed graph with delayed costs. The recurrence compares moving directly to taking the shortest known cost from the next state.',
        },
      ],
    },
    {
      id: 'scan-1',
      type: 'scan',
      title: 'Lecture Scan',
      subtitle: 'handwritten derivations',
      tag: 'handwritten',
      description: 'Handwritten derivations and formula extraction queue.',
      metrics: [
        { label: 'Pages', value: '12' },
        { label: 'Needs edit', value: '4' },
        { label: 'Avg. quality', value: '87%' },
      ],
      conversionStack: [
        { id: 'scan-4', label: 'Derivative 2', issue: 'The integral bounds were misread', score: 71, severity: 'high' },
        { id: 'scan-7', label: 'Probability tree', issue: 'Edge labels shifted during OCR', score: 82, severity: 'medium' },
        { id: 'scan-10', label: 'Matrix factorization', issue: 'Formula symbols need confirmation', score: 89, severity: 'low' },
      ],
    },
  ],
}

const queryRules = [
  {
    pattern: /exercise|starting point|start/i,
    answer:
      'I found the exercise starting points in the workbook. The first relevant section is Exercise 1, and I can jump directly to the next highlighted sections from the sidebar.',
    sourceDocId: 'book-1',
    highlights: ['exercise-1', 'exercise-11'],
  },
  {
    pattern: /knapsack|dynamic programming|illustration/i,
    answer:
      'The 0/1 knapsack illustration is in the DP table section, and it is marked as a high-confidence highlight in the book viewer. You can click the sidebar marker or use the next action to jump there.',
    sourceDocId: 'book-1',
    highlights: ['exercise-6'],
  },
  {
    pattern: /handwritten|ocr|conversion|scan|formula/i,
    answer:
      'The handwritten conversion review queue is sorted by confidence and severity. The highest-priority items are the derivative bounds and the probability tree labels, which are ready for a quick human correction.',
    sourceDocId: 'scan-1',
    highlights: ['scan-4', 'scan-7'],
  },
]

function findBestMatch(query) {
  const normalized = query.toLowerCase()
  return queryRules.find((rule) => rule.pattern.test(normalized)) ?? {
    answer:
      'I found a strong match in your workspace and can help you navigate to the most relevant section. Try narrowing the query to a topic, chapter, or concept name.',
    sourceDocId: 'book-1',
    highlights: ['exercise-1'],
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Knowledge workspace backend is live.' })
})

app.get('/api/workspace', (_req, res) => {
  res.json(workspace)
})

app.post('/api/search', (req, res) => {
  const query = (req.body?.query || '').toLowerCase()
  const matches = workspace.docs.filter((doc) => {
    const target = `${doc.title} ${doc.subtitle} ${doc.description} ${doc.tag}`.toLowerCase()
    return target.includes(query)
  })

  res.json({
    query,
    results: matches,
  })
})

app.post('/api/rag/answer', (req, res) => {
  const query = String(req.body?.query || '')
  const match = findBestMatch(query)

  res.json({
    answer: match.answer,
    sourceDocId: match.sourceDocId,
    highlights: match.highlights,
    model: 'local-retrieval-fallback',
    confidence: 0.92,
  })
})

app.get('/api/local-model-status', (_req, res) => {
  res.json({
    enabled: false,
    provider: 'ollama',
    message: 'Local model integration is ready to be connected through an Ollama or similar endpoint.',
  })
})

app.listen(port, () => {
  console.log(`Knowledge workspace backend listening on http://localhost:${port}`)
})
