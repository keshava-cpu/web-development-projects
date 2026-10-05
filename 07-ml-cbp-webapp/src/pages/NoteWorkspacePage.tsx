import { useEffect, useMemo, useRef, useState } from 'react'
import { Bold, ChevronRight, Code2, FileText, Heading1, Heading2, Italic, List, ListOrdered, Quote, Redo2, Save, Undo2, Wand2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { exportMarkdownToPdf, exportMarkdownToPpt } from '../lib/exporters'
import { renderMarkdownToHtml } from '../lib/markdown'
import { notifyApp } from '../lib/toast'
import { defaultNotes, readNotes, writeNotes, type NoteItem } from '../lib/storage'
import { useUndoRedo } from '../lib/useUndoRedo'

const toolbarActions = [
  { label: 'H1', value: 'heading1', icon: Heading1 },
  { label: 'H2', value: 'heading2', icon: Heading2 },
  { label: 'B', value: 'bold', icon: Bold },
  { label: 'I', value: 'italic', icon: Italic },
  { label: 'List', value: 'bullet', icon: List },
  { label: 'Num', value: 'numbered', icon: ListOrdered },
  { label: 'Quote', value: 'quote', icon: Quote },
  { label: 'Code', value: 'code', icon: Code2 },
]

export function NoteWorkspacePage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [notes, setNotes] = useState<NoteItem[]>(defaultNotes)
  const [selectedId, setSelectedId] = useState('note-1')
  const [title, setTitle] = useState('Project Brainstorm')
  const { value: content, setValue: setContent, undo, redo, canUndo, canRedo } = useUndoRedo(defaultNotes[0]?.content ?? '')
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }
      if ((event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [redo, undo])

  useEffect(() => {
    const stored = readNotes()
    setNotes(stored)
    if (stored[0]) {
      setSelectedId(stored[0].id)
      setTitle(stored[0].title)
      setContent(stored[0].content)
    }
  }, [])

  const activeNote = notes.find((note) => note.id === selectedId) ?? notes[0]

  const handleSelect = (note: NoteItem) => {
    setSelectedId(note.id)
    setTitle(note.title)
    setContent(note.content)
  }

  const handleSave = () => {
    const safeTitle = title.trim() || 'Untitled note'
    const safeContent = content.trim() || 'Start writing your notes here.'
    const nextNotes = notes.map((note) =>
      note.id === selectedId ? { ...note, title: safeTitle, content: safeContent, updatedAt: new Date().toISOString() } : note,
    )

    if (!nextNotes.some((note) => note.id === selectedId)) {
      nextNotes.unshift({
        id: crypto.randomUUID(),
        title: safeTitle,
        content: safeContent,
        updatedAt: new Date().toISOString(),
      })
    }

    setNotes(nextNotes)
    writeNotes(nextNotes)
    notifyApp('Note saved', `${safeTitle} was saved to your local project.`, 'success')
  }

  const handleNewNote = () => {
    const nextId = crypto.randomUUID()
    const created = {
      id: nextId,
      title: 'Untitled note',
      content: '## New note\n\nCapture the next idea here.',
      updatedAt: new Date().toISOString(),
    }

    const nextNotes = [created, ...notes]
    setNotes(nextNotes)
    setSelectedId(nextId)
    setTitle(created.title)
    setContent(created.content)
    writeNotes(nextNotes)
    notifyApp('New note', 'A fresh note was created in the workspace.', 'info')
  }

  const handleAutoFormat = () => {
    const trimmed = content.trim()
    const formatted = trimmed
      ? trimmed
          .replace(/\n{3,}/g, '\n\n')
          .replace(/^/gm, '')
      : '## Draft\n\nWrite your summary here.'

    setContent(formatted)
    notifyApp('Auto-format', 'The note was lightly cleaned up for easier reading.', 'info')
  }

  const breadcrumbs = [
    { label: 'Projects', path: '/' },
    { label: 'Neon research', path: '/project' },
    { label: 'Notes', path: '/notes' },
    { label: title, path: null },
  ]

  const previewHtml = useMemo(() => renderMarkdownToHtml(content, { fontSize: 15, fontColor: '#e2e8f0', darkMode: true }), [content])

  const applyFormat = (type: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end) || 'text'

    let insert = selected
    if (type === 'heading1') insert = `# ${selected}`
    if (type === 'heading2') insert = `## ${selected}`
    if (type === 'bold') insert = `**${selected}**`
    if (type === 'italic') insert = `*${selected}*`
    if (type === 'bullet') insert = `- ${selected}`
    if (type === 'numbered') insert = `1. ${selected}`
    if (type === 'quote') insert = `> ${selected}`
    if (type === 'code') insert = `\n\`\`\`${selected}\n\`\`\`\n`

    const next = content.slice(0, start) + insert + content.slice(end)
    setContent(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const nextCursor = start + insert.length
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const handleExportPdf = () => {
    try {
      exportMarkdownToPdf(content, title || 'Project note')
      notifyApp('PDF exported', `${title || 'Document'} was exported as a PDF.`, 'success')
    } catch (error) {
      notifyApp('PDF export failed', 'The PDF generator could not finish this export.', 'info')
      console.error(error)
    }
  }

  const handleExportPpt = async () => {
    try {
      await exportMarkdownToPpt(content, title || 'Project deck')
      notifyApp('PPT exported', `${title || 'Deck'} was exported as a PowerPoint.`, 'success')
    } catch (error) {
      notifyApp('PPT export failed', 'The PPT generator could not finish this export.', 'info')
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#858585] px-2">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {crumb.path ? (
              <button
                onClick={() => notifyApp('Navigated', `Opened ${crumb.label}`, 'info')}
                className="text-[#007acc] hover:text-[#0098ff] font-semibold transition"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-[#d4d4d4] font-semibold">{crumb.label}</span>
            )}
            {idx < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-[#858585]" />}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] grid-cols-1">
        <Card className="p-3 bg-[#252526] border-[#3e3e42] rounded-[8px]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#d4d4d4] uppercase tracking-wide">NOTES</h2>
            <Button variant="secondary" size="sm" className="rounded-[5px]" onClick={handleNewNote}>
              + New
            </Button>
          </div>

          <div className="space-y-2">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => handleSelect(note)}
                className={selectedId === note.id ? 'w-full rounded-[5px] p-2 text-left bg-[#2d2d30] border border-[#007acc] transition' : 'w-full rounded-[5px] p-2 text-left border border-[#3e3e42] hover:bg-[#2d2d30] transition'}
              >
                <p className="text-xs font-semibold text-[#d4d4d4]">{note.title}</p>
                <p className="mt-1 text-[10px] text-[#858585]">{new Date(note.updatedAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden bg-[#252526] border-[#3e3e42] rounded-[8px]">
          <CardContent className="p-3">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-[#858585]">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold">MARKDOWN EDITOR</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="gap-2 rounded-[5px]" onClick={handleAutoFormat}>
                  <Wand2 className="h-4 w-4 text-violet-300" />
                  Auto-format
                </Button>
                <Button variant="secondary" className="gap-2 rounded-[5px]" onClick={handleExportPdf}>
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="secondary" className="gap-2 rounded-[5px]" onClick={() => void handleExportPpt()}>
                  <FileText className="h-4 w-4" />
                  PPT
                </Button>
                <Button onClick={handleSave} className="gap-2 rounded-[5px]">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2 rounded-[6px] border border-[#3e3e42] bg-[#1b1d20] p-2">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex items-center gap-1 rounded-[4px] border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex items-center gap-1 rounded-[4px] border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Redo2 className="h-3 w-3" />
                Redo
              </button>
              {toolbarActions.map(({ label, value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => applyFormat(value)}
                  className="inline-flex items-center gap-1 rounded-[4px] border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280]"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setContent((current) => `${current}\n\n## New section\n- Key point\n- Supporting detail\n- Final note`)}
                className="inline-flex items-center gap-1 rounded-[4px] border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280]"
              >
                <Wand2 className="h-3 w-3" />
                Add block
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <Button
                variant={viewMode === 'edit' ? 'default' : 'secondary'}
                size="sm"
                className="rounded-[5px]"
                onClick={() => setViewMode('edit')}
              >
                Edit
              </Button>
              <Button
                variant={viewMode === 'preview' ? 'default' : 'secondary'}
                size="sm"
                className="rounded-[5px]"
                onClick={() => setViewMode('preview')}
              >
                Preview
              </Button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 w-full rounded-[5px] border border-[#3e3e42] bg-[#1e1e1e] px-3 py-2 text-base font-semibold text-[#d4d4d4] outline-none focus:border-[#007acc] transition"
            />

            {viewMode === 'edit' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={22}
                className="w-full resize-none rounded-[5px] border border-[#3e3e42] bg-[#1e1e1e] p-3 text-sm leading-6 text-[#d4d4d4] outline-none focus:border-[#007acc] font-mono transition"
              />
            ) : (
              <div
                className="min-h-[420px] w-full rounded-[5px] border border-[#3e3e42] bg-[#1e1e1e] p-4 text-sm leading-7 text-[#d4d4d4] [&_h1]:mt-0 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Preview is empty.</p>' }}
              />
            )}

            <div className="mt-3 rounded-[5px] border border-[#3e3e42] bg-[#1e1e1e] p-2.5 text-xs text-[#858585]">
              {activeNote ? `Last saved: ${new Date(activeNote.updatedAt).toLocaleString()}` : 'No note saved yet'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
