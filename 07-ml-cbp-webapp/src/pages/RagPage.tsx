import { useState } from 'react'
import { BrainCircuit, Search } from 'lucide-react'
import { askRag, searchWorkspace } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'

export function RagPage() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('Ask a question about your documents, notes, or highlighted exercises to surface the most relevant section.')
  const [results, setResults] = useState<Array<{ id: string; title: string; tag: string }>>([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)

    try {
      const [rag, found] = await Promise.all([askRag(trimmed), searchWorkspace(trimmed)])
      setAnswer(rag.answer)
      setResults((found?.results ?? []).slice(0, 4).map((item: any) => ({ id: item.id, title: item.title, tag: item.tag })))
    } catch {
      setAnswer('The local retrieval layer could not answer that query. Try a more specific topic such as “knapsack”, “notes”, or “handwritten”.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#3e3e42] bg-[#252526] rounded-[8px]">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#007acc]">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-[#858585] font-semibold tracking-wider">Knowledge retrieval</p>
              <h1 className="mt-1 text-2xl font-bold text-[#d4d4d4]">RAG Workspace</h1>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr] lg:grid-cols-1">
        <Card className="border-[#3e3e42] rounded-[8px]">
          <CardContent className="p-5">
            <div className="flex gap-3 rounded-[6px] border border-[#3e3e42] bg-[#1e1e1e] p-3 mb-5">
              <Search className="mt-0.5 h-4 w-4 text-[#858585] flex-shrink-0" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about your notes, books, PDFs..."
                className="border-0 bg-transparent p-0 text-[#d4d4d4] text-xs placeholder:text-[#858585] focus-visible:ring-0"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleAsk()
                }}
              />
              <Button onClick={handleAsk} disabled={loading} className="rounded-lg text-xs px-2 py-1 h-6" size="sm">
                {loading ? '...' : 'Search'}
              </Button>
            </div>

            <div className="rounded-[6px] border border-[#3e3e42] bg-[#1e1e1e] p-4 text-xs leading-6 text-[#d4d4d4]">
              <div className="mb-3 flex items-center gap-2 text-[#007acc] font-bold">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Answer</span>
              </div>
              {answer}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#3e3e42] rounded-[8px]">
          <CardContent className="p-5">
            <h2 className="text-xs font-bold text-[#d4d4d4] uppercase mb-4 tracking-wider">Results</h2>
            <div className="space-y-3">
              {results.length === 0 ? (
                <p className="text-xs text-[#858585]">Search for a topic to see related documents.</p>
              ) : (
                results.map((item) => (
                  <div key={item.id} className="rounded-[6px] border border-[#3e3e42] bg-[#1e1e1e] p-3">
                    <p className="text-[10px] uppercase text-[#858585] font-semibold">{item.tag}</p>
                    <p className="mt-2 text-xs font-semibold text-[#d4d4d4]">{item.title}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
