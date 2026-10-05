import { useEffect, useMemo, useRef, useState } from 'react'
import { Bold, Download, Italic, List, ListOrdered, Presentation, Redo2, Undo2 } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { exportMarkdownToPpt } from '../lib/exporters'
import { renderMarkdownToHtml } from '../lib/markdown'
import { notifyApp } from '../lib/toast'
import { useUndoRedo } from '../lib/useUndoRedo'

const defaultPptMarkdown = `# Knowledge Deck

## This presentation captures the major milestones, priorities, and actions for the workstream.

- Strong content structure
- Fast, clear exports
- Clean, readable slide design`

const markdownQuickActions = [
  { label: 'H1', value: '# ' },
  { label: 'H2', value: '## ' },
  { label: 'B', value: '**text**' },
  { label: 'I', value: '*text*' },
  { label: 'List', value: '- item' },
  { label: 'Num', value: '1. item' },
] as const

function parseSlides(markdown: string) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block) => {
    const lines = block.split(/\r?\n/).filter(Boolean)
    const headingLine = lines.find((line) => /^#{1,3}\s+/.test(line.trim())) ?? lines[0] ?? 'Slide'
    const heading = headingLine.replace(/^#{1,3}\s+/, '').trim() || 'Slide'
    const bullets = lines
      .filter((line) => !/^#{1,3}\s+/.test(line.trim()))
      .map((line) => line.replace(/^[-*+]\s+/, '').trim())
      .filter(Boolean)

    return { heading, bullets }
  })
}

export function PptWorkspacePage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [title, setTitle] = useState('Knowledge Deck')
  const { value: content, setValue: setContent, undo, redo, canUndo, canRedo } = useUndoRedo(defaultPptMarkdown)
  const [activeSlide, setActiveSlide] = useState(0)
  const [fontSize, setFontSize] = useState(22)
  const [fontColor, setFontColor] = useState('#111827')
  const [selectionFontSize, setSelectionFontSize] = useState(22)
  const [selectionColor, setSelectionColor] = useState('#007acc')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [selectionPanelPosition, setSelectionPanelPosition] = useState<{ left: number; top: number } | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)

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

  const slides = useMemo(() => parseSlides(content), [content])

  const slidePreviewHtml = useMemo(() => renderMarkdownToHtml(content, { fontSize, fontColor, darkMode: false }), [content, fontSize, fontColor])

  const updateSelectionPanelPosition = () => {
    const textarea = textareaRef.current
    if (!textarea || !selectionRange) {
      setSelectionPanelPosition(null)
      return
    }

    const styles = window.getComputedStyle(textarea)
    const font = `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize}/${styles.lineHeight} ${styles.fontFamily}`
    const context = document.createElement('canvas').getContext('2d')
    if (!context) {
      setSelectionPanelPosition(null)
      return
    }

    context.font = font

    const textBeforeSelection = textarea.value.slice(0, selectionRange.end)
    const lastLine = textBeforeSelection.split('\n').at(-1) ?? ''
    const lineCount = textBeforeSelection.split('\n').length - 1
    const paddingLeft = Number.parseFloat(styles.paddingLeft || '0')
    const paddingTop = Number.parseFloat(styles.paddingTop || '0')
    const lineHeight = Number.parseFloat(styles.lineHeight || '20')
    const x = textarea.offsetLeft + paddingLeft + context.measureText(lastLine).width + 16
    const y = textarea.offsetTop + paddingTop + lineCount * lineHeight + lineHeight * 0.8

    setSelectionPanelPosition({ left: x, top: y })
  }

  const syncSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setSelectionRange(start === end ? null : { start, end })
    requestAnimationFrame(updateSelectionPanelPosition)
  }

  const applySelectionStyle = () => {
    const textarea = textareaRef.current
    if (!textarea || !selectionRange) return
    const { start, end } = selectionRange
    const selected = content.slice(start, end)
    if (!selected) return

    const wrapped = `<span style="color:${selectionColor};font-size:${selectionFontSize}px;">${selected}</span>`
    const next = content.slice(0, start) + wrapped + content.slice(end)
    setContent(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const nextCursor = start + wrapped.length
      textarea.setSelectionRange(nextCursor, nextCursor)
      updateSelectionPanelPosition()
    })
  }

  const applyFormat = (template: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end) || 'text'

    let insert = template
    if (template === '# ') insert = `# ${selected}`
    if (template === '## ') insert = `## ${selected}`
    if (template === '**text**') insert = `**${selected}**`
    if (template === '*text*') insert = `*${selected}*`
    if (template === '- item') insert = `- ${selected}`
    if (template === '1. item') insert = `1. ${selected}`

    const next = content.slice(0, start) + insert + content.slice(end)
    setContent(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const nextCursor = start + insert.length
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  const handleExport = async () => {
    try {
      await exportMarkdownToPpt(content, title, { fontSize, fontColor })
      notifyApp('PPT exported', `${title} was generated and downloaded.`, 'success')
      setIsExportOpen(false)
    } catch (error) {
      notifyApp('PPT export failed', 'Unable to generate the PowerPoint from the current content.', 'info')
      console.error(error)
    }
  }

  return (
    <>
      {isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[12px] border border-[#3e3e42] bg-[#1e1e1e] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8b949e]">Export config</p>
                <h3 className="mt-2 text-lg font-semibold text-[#f3f4f6]">PPT export</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="rounded-[6px] border border-[#3e3e42] bg-[#111417] px-2 py-1 text-xs text-[#d4d4d4]"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#858585]">Presentation title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="soft-input w-full rounded-[6px] bg-[#111417] px-3 py-2 text-xs text-[#d4d4d4] outline-none focus:border-[#007acc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#858585]">Font size</label>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={fontSize}
                    onChange={(event) => setFontSize(Number(event.target.value) || 16)}
                    className="soft-input w-full rounded-[6px] bg-[#111417] px-3 py-2 text-xs text-[#d4d4d4] outline-none focus:border-[#007acc]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#858585]">Font color</label>
                  <div className="flex items-center gap-2 rounded-[6px] border border-[#3e3e42] bg-[#111417] px-3 py-2">
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(event) => setFontColor(event.target.value)}
                      className="h-6 w-10 rounded border-none bg-transparent p-0"
                    />
                    <span className="text-xs text-[#d4d4d4]">{fontColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#858585]">Theme</label>
                <select
                  value="Clean white"
                  onChange={() => undefined}
                  className="soft-input w-full rounded-[6px] bg-[#111417] px-3 py-2 text-xs text-[#d4d4d4] outline-none focus:border-[#007acc]"
                >
                  <option>Clean white</option>
                  <option>Dark contrast</option>
                  <option>Minimal gray</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExportOpen(false)}
                className="rounded-[6px] border border-[#3e3e42] bg-[#111417] px-3 py-2 text-xs text-[#d4d4d4]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleExport()}
                className="rounded-[6px] bg-[#007acc] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0098ff]"
              >
                Export PPT
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.9fr)_260px] lg:grid-cols-1">
        <Card className="soft-panel bg-[#252526]/90 rounded-[10px] border-[#3e3e42]">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#858585]">
                <Presentation className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Deck Editor</span>
              </div>
              <button
                onClick={() => setIsExportOpen(true)}
                className="inline-flex items-center gap-2 rounded-[6px] border border-[#3e3e42] bg-[#1e1e1e]/80 px-3 py-2 text-xs text-[#d4d4d4] hover:border-[#5b7280] transition"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#858585]">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="soft-input flex-1 rounded-[6px] bg-[#1e1e1e] px-3 py-2 text-xs text-[#d4d4d4] outline-none focus:border-[#007acc]"
              />
            </div>

            <div className="mb-4 flex flex-wrap gap-2 rounded-[6px] border border-[#3e3e42] bg-[#1b1d20] p-2">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex items-center gap-1 rounded-lg border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex items-center gap-1 rounded-lg border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Redo2 className="h-3 w-3" />
                Redo
              </button>
              {markdownQuickActions.map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyFormat(value)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#3e3e42] bg-[#111417] px-2 py-1 text-[10px] font-medium text-[#d4d4d4] hover:border-[#5b7280]"
                >
                  {label === 'B' ? <Bold className="h-3 w-3" /> : label === 'I' ? <Italic className="h-3 w-3" /> : label === 'List' ? <List className="h-3 w-3" /> : label === 'Num' ? <ListOrdered className="h-3 w-3" /> : null}
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-3 rounded-[6px] border border-[#3e3e42] bg-[#12181d] p-2 text-[10px] text-[#a7b0bb]">
              <span className="font-semibold uppercase tracking-[0.22em] text-[#d4d4d4]">Markdown</span>
              <div className="mt-2 space-y-1">
                <div># Heading</div>
                <div>## Subheading</div>
                <div>- bullet</div>
                <div>**bold** and *italic*</div>
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value)
                  requestAnimationFrame(updateSelectionPanelPosition)
                }}
                onSelect={syncSelection}
                rows={12}
                className="soft-input w-full resize-none rounded-[8px] bg-[#1e1e1e] p-4 text-xs leading-6 text-[#d4d4d4] outline-none focus:border-[#007acc] font-mono"
              />

              {selectionRange && selectionPanelPosition && (
                <div
                  className="pointer-events-auto absolute z-20 w-max rounded-[8px] border border-[#2d6cdf] bg-[#111a2d] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
                  style={{ left: selectionPanelPosition.left, top: selectionPanelPosition.top }}
                >
                  <div className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#9bb9ff]">Selected text style</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectionColor}
                      onChange={(event) => setSelectionColor(event.target.value)}
                      className="h-8 w-10 rounded border border-[#3e3e42] bg-transparent p-0"
                    />
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={selectionFontSize}
                      onChange={(event) => setSelectionFontSize(Number(event.target.value) || 16)}
                      className="w-16 rounded-[6px] border border-[#3e3e42] bg-[#1b1d20] px-2 py-1 text-xs text-[#d4d4d4] outline-none"
                    />
                    <button
                      type="button"
                      onClick={applySelectionStyle}
                      className="ml-auto rounded-[6px] bg-[#2d6cdf] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="soft-panel bg-[#252526]/90 rounded-[10px] border-[#3e3e42]">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#858585]">
                <Presentation className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Slide preview</span>
              </div>
              <button
                onClick={() => setIsExportOpen(true)}
                className="inline-flex items-center gap-2 rounded-[6px] bg-[#007acc] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0098ff] transition"
              >
                <Presentation className="h-3.5 w-3.5" />
                Generate deck
              </button>
            </div>

            <div className="mx-auto aspect-video max-w-225 rounded-[12px] border border-[#dfe7ef] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
              <div className="slide-editor-preview" dangerouslySetInnerHTML={{ __html: slidePreviewHtml || '<p>Start writing to see the slide preview.</p>' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="soft-panel bg-[#252526]/90 rounded-[10px] border-[#3e3e42]">
          <CardContent className="p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#9ca9b8]">Slides</div>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.heading}-${index}`}
                  onClick={() => setActiveSlide(index)}
                  className={index === activeSlide ? 'w-full rounded-[6px] border border-[#007acc] bg-[#14242b] p-2 text-left' : 'w-full rounded-[6px] border border-[#3e3e42] bg-[#171b1f] p-2 text-left hover:border-[#5b7280]'}
                >
                  <div className="mb-1 text-[9px] uppercase tracking-[0.14em] text-[#9ca9b8]">Slide {index + 1}</div>
                  <div className="line-clamp-2 text-xs font-medium text-[#edf2f7]">{slide.heading}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
