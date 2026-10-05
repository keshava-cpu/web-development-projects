import { useEffect, useMemo, useState } from 'react'
import { Search, Sparkles, ArrowUpRight, FileText, NotebookPen, Presentation } from 'lucide-react'
import type { WorkspaceDoc } from '../data/mockWorkspace'
import { fetchWorkspace } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { notifyApp } from '../lib/toast'

export function LibraryPage() {
  const [docs, setDocs] = useState<WorkspaceDoc[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetchWorkspace()
      .then((workspaceDocs) => {
        if (!active) return
        setDocs(workspaceDocs)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError('Unable to load the workspace from the backend. Falling back to cached sample data.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const visibleDocs = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) return docs

    return docs.filter((doc) => {
      const searchable = [doc.title, doc.subtitle, doc.tag, doc.description, ...(doc.metrics?.map((metric) => `${metric.label} ${metric.value}`) ?? [])]
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalized)
    })
  }, [docs, query])

  return (
    <div className="space-y-5 p-1 md:p-2">
      <div className="flex flex-col gap-4 border-b border-[#2a2d31] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#8d97a2] font-semibold">Knowledge base</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#eef3f8]">Library</h1>
        </div>
        <div className="flex w-full max-w-md items-center gap-2 rounded-[6px] border border-[#2a2d31] bg-[#14191d] px-3.5 py-2.5 text-sm">
          <Search className="h-3.5 w-3.5 text-[#8d97a2] shrink-0" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes, books, PDFs..."
            className="border-0 bg-transparent p-0 text-sm text-[#edf1f5] placeholder:text-[#7d8794] focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: 'Documents', count: docs.length, icon: FileText },
          { label: 'Notes', count: docs.filter((doc) => doc.type === 'note').length, icon: NotebookPen },
          { label: 'Exports', count: docs.filter((doc) => doc.type === 'pdf' || doc.type === 'ppt').length, icon: Presentation },
        ].map(({ label, count, icon: Icon }) => (
          <Card key={label} className="overflow-hidden border border-[#2a2d31] bg-[#171b1f]/80 rounded-[10px]">
            <CardContent className="p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#8d97a2] font-semibold">{label}</span>
                <Icon className="h-4 w-4 text-[#5db0ff]" />
              </div>
              <p className="text-3xl font-semibold tracking-[-0.06em] text-[#edf1f5]">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {error ? <div className="rounded-[6px] border border-[#d38a7d] bg-[#2a1c1d] p-3 text-xs text-[#f6d0bf]">⚠️ {error}</div> : null}
      {loading ? <div className="rounded-[6px] border border-[#2a2d31] bg-[#171b1f]/80 p-5 text-xs text-[#8d97a2]">Loading workspace data…</div> : null}
      {!loading && visibleDocs.length === 0 ? <div className="rounded-[6px] border border-[#2a2d31] bg-[#171b1f]/80 p-5 text-xs text-[#8d97a2]">No documents match your search.</div> : null}

      <div className="grid gap-2.5 xl:grid-cols-2">
        {visibleDocs.map((doc) => (
          <Card key={doc.id} className="overflow-hidden border border-[#2a2d31] bg-[#171b1f]/80 rounded-[10px] transition hover:border-[#3a536d]">
            <CardContent className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#8d97a2]">{doc.tag}</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#edf1f5]">{doc.title}</h2>
                </div>
                <span className="rounded-md border border-[#2a2d31] bg-[#12171a] px-2 py-1 text-[9px] uppercase tracking-[0.1em] text-[#8d97a2] shrink-0">
                  {doc.status}
                </span>
              </div>

              <p className="mt-3 text-xs leading-6 text-[#8d97a2]">{doc.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {doc.metrics.map((metric) => (
                  <span key={`${doc.id}-${metric.label}`} className="rounded-full border border-[#2a2d31] bg-[#12171a] px-2 py-0.5 text-[10px] text-[#9aa7b3]">
                    {metric.label}: {metric.value}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#2a2d31] pt-4">
                <span className="text-xs text-[#8d97a2]">Updated {doc.lastUpdated}</span>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-lg gap-1 px-3 py-2 text-[10px] uppercase tracking-[0.1em]"
                  onClick={() => notifyApp('Opened document', `${doc.title} is ready to review.`, 'info')}
                >
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-[#2a2d31] bg-[#171b1f]/80 rounded-[10px]">
        <CardContent className="p-3.5 md:p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[#5db0ff]" />
            <p className="text-xs font-medium text-[#edf1f5]">Smart retrieval is ready for the later phase.</p>
          </div>
          <p className="mt-2 text-xs leading-6 text-[#8d97a2]">
            For the current prototype, the knowledge library keeps track of documents, note context, and export state locally.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
