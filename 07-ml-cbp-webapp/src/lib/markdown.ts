export type MarkdownRenderOptions = {
  fontSize?: number
  fontColor?: string
  darkMode?: boolean
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatInline(value: string) {
  let safe = escapeHtml(value)

  safe = safe.replace(/\[(.+?)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
  safe = safe.replace(/`([^`]+)`/g, '<code style="padding:2px 6px;border-radius:4px;background:rgba(148,163,184,0.16);font-family:ui-monospace,Menlo,monospace;font-size:0.9em;">$1</code>')
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>')
  safe = safe.replace(/~~(.+?)~~/g, '<del>$1</del>')
  safe = safe.replace(/_([^_]+)_/g, '<em>$1</em>')
  return safe
}

function renderInlineHtml(value: string, baseFontSize: number, baseColor: string): string {
  const chunks = value.split(/(<span\s+style="[^"]*">.*?<\/span>)/g)

  return chunks
    .map((chunk) => {
      const match = chunk.match(/^<span\s+style="([^"]*)">([\s\S]*?)<\/span>$/)
      if (!match) {
        return formatInline(chunk)
      }

      const style = match[1]
      const inner: string = renderInlineHtml(match[2], baseFontSize, baseColor)
      return `<span style="${style}">${inner}</span>`
    })
    .join('')
}

export function renderMarkdownToHtml(markdown: string, options: MarkdownRenderOptions = {}) {
  const fontSize = options.fontSize ?? 16
  const fontColor = options.fontColor ?? '#111827'
  const darkMode = options.darkMode ?? false
  const headingColors = {
    h1: darkMode ? '#f8fafc' : '#0f172a',
    h2: darkMode ? '#e2e8f0' : '#1f2937',
    h3: darkMode ? '#cbd5e1' : '#334155',
  }

  const html: string[] = []
  const lines = markdown.split(/\r?\n/)
  let paragraphLines: string[] = []
  let listItems: Array<{ type: 'ul' | 'ol'; depth: number; text: string }> = []
  let quotedLines: string[] = []
  let codeFence: string[] | null = null

  const flushParagraph = () => {
    if (!paragraphLines.length) return
    const value = paragraphLines.join(' ')
    html.push(`<p style="margin:0 0 12px;color:${fontColor};font-size:${fontSize}px;line-height:1.65;">${renderInlineHtml(value, fontSize, fontColor)}</p>`)
    paragraphLines = []
  }

  const flushQuote = () => {
    if (!quotedLines.length) return
    const body = quotedLines
      .map((line) => line.replace(/^>\s*/, '').trim())
      .filter(Boolean)
      .map((line) => `<div style="margin:0 0 8px;color:${darkMode ? '#e2e8f0' : '#374151'};font-size:${fontSize}px;line-height:1.6;">${renderInlineHtml(line, fontSize, darkMode ? '#e2e8f0' : '#374151')}</div>`)
      .join('')
    html.push(`<blockquote style="margin:0 0 12px;padding:10px 12px;border-left:3px solid ${darkMode ? '#60a5fa' : '#2563eb'};background:${darkMode ? 'rgba(15,23,42,0.5)' : 'rgba(239,246,255,0.8)'};border-radius:8px;">${body}</blockquote>`)
    quotedLines = []
  }

  const flushList = () => {
    if (!listItems.length) return
    const tag = listItems[0].type
    const listHtml = listItems
      .map((item) => {
        const indent = item.depth * 18
        return `<li style="margin-left:${indent}px;margin-bottom:6px;color:${fontColor};font-size:${fontSize}px;line-height:1.6;">${renderInlineHtml(item.text, fontSize, fontColor)}</li>`
      })
      .join('')
    html.push(`<${tag} style="margin:0 0 12px 0;padding-left:1.1rem;">${listHtml}</${tag}>`)
    listItems = []
  }

  const flushCodeFence = () => {
    if (!codeFence) return
    const value = codeFence.join('\n')
    html.push(`<pre style="margin:0 0 12px;padding:12px 14px;border-radius:8px;background:${darkMode ? '#0f172a' : '#f8fafc'};border:1px solid ${darkMode ? '#334155' : '#e2e8f0'};overflow:auto;color:${darkMode ? '#e2e8f0' : '#111827'};font-size:${Math.max(fontSize - 1, 12)}px;line-height:1.5;">${escapeHtml(value)}</pre>`)
    codeFence = null
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushList()
      flushQuote()
      if (!codeFence) {
        codeFence = []
      } else {
        flushCodeFence()
      }
      continue
    }

    if (codeFence) {
      codeFence.push(rawLine)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      flushQuote()
      continue
    }

    if (/^>\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      quotedLines.push(trimmed)
      continue
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      flushQuote()
      const level = Math.min(trimmed.match(/^#+/)?.[0].length ?? 1, 3)
      const text = trimmed.replace(/^#{1,3}\s+/, '')
      const size = level === 1 ? Math.max(fontSize + 18, 28) : level === 2 ? Math.max(fontSize + 10, 22) : Math.max(fontSize + 4, 18)
      const color = level === 1 ? headingColors.h1 : level === 2 ? headingColors.h2 : headingColors.h3
      html.push(`<h${level} style="margin:0 0 12px;color:${color};font-size:${size}px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;">${renderInlineHtml(text, size, color)}</h${level}>`)
      continue
    }

    if (/^(?:[-*+]\s+|\d+\.\s+)/.test(trimmed)) {
      flushParagraph()
      flushQuote()
      const isOrdered = /^\d+\.\s+/.test(trimmed)
      const depth = Math.min(Math.floor((rawLine.length - rawLine.trimStart().length) / 2), 6)
      const text = trimmed.replace(/^(?:[-*+]\s+|\d+\.\s+)/, '')
      listItems.push({ type: isOrdered ? 'ol' : 'ul', depth, text })
      continue
    }

    if (/^---+$|^\*\*\*+$/.test(trimmed)) {
      flushParagraph()
      flushList()
      flushQuote()
      html.push(`<hr style="border:0;border-top:1px solid ${darkMode ? '#334155' : '#cbd5e1'};margin:16px 0;" />`)
      continue
    }

    if (/^\[( |x|X)\]\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      const checked = /^[\[](x|X)\]/.test(trimmed)
      const taskText = trimmed.replace(/^\[(?: |x|X)\]\s+/, '')
      html.push(`<div style="display:flex;align-items:center;gap:8px;margin:0 0 8px;color:${fontColor};font-size:${fontSize}px;line-height:1.5;">${checked ? '☑' : '☐'} <span>${renderInlineHtml(taskText, fontSize, fontColor)}</span></div>`)
      continue
    }

    paragraphLines.push(trimmed)
  }

  flushParagraph()
  flushList()
  flushQuote()
  flushCodeFence()

  return html.join('')
}

export type MarkdownSegment =
  | { type: 'heading'; level: 1 | 2 | 3; text: string; color: string }
  | { type: 'paragraph'; text: string; color: string }
  | { type: 'list'; ordered: boolean; items: string[]; color: string }
  | { type: 'quote'; text: string; color: string }
  | { type: 'code'; text: string; color: string }
  | { type: 'divider'; color: string }

export function parseMarkdownSegments(markdown: string, defaultColor = '#111827'): MarkdownSegment[] {
  const lines = markdown.split(/\r?\n/)
  const segments: MarkdownSegment[] = []
  let buffer: string[] = []
  let inCodeFence = false

  const flushParagraph = () => {
    if (!buffer.length) return
    const text = buffer.join(' ').trim()
    if (text) {
      segments.push({ type: 'paragraph', text, color: defaultColor })
    }
    buffer = []
  }

  const flushQuote = () => {
    if (!buffer.length) return
    const text = buffer.join(' ').trim()
    if (text) {
      segments.push({ type: 'quote', text, color: '#475569' })
    }
    buffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!inCodeFence && line.startsWith('```')) {
      flushParagraph()
      if (buffer.length) flushQuote()
      inCodeFence = true
      continue
    }

    if (inCodeFence) {
      if (line.startsWith('```')) {
        const codeContent = buffer.join('\n').trim()
        if (codeContent) {
          segments.push({ type: 'code', text: codeContent, color: defaultColor })
        }
        buffer = []
        inCodeFence = false
        continue
      }
      buffer.push(rawLine)
      continue
    }

    if (!line) {
      flushParagraph()
      continue
    }

    if (/^#{1,3}\s+/.test(line)) {
      flushParagraph()
      const level = Math.min(line.match(/^#+/)?.[0].length ?? 1, 3) as 1 | 2 | 3
      const text = line.replace(/^#{1,3}\s+/, '').trim()
      const color = level === 1 ? '#0f172a' : level === 2 ? '#1f2937' : '#334155'
      segments.push({ type: 'heading', level, text, color })
      continue
    }

    if (/^>\s+/.test(line)) {
      flushParagraph()
      buffer.push(line.replace(/^>\s+/, '').trim())
      continue
    }

    if (/^---+$|^\*\*\*+$/.test(line)) {
      flushParagraph()
      segments.push({ type: 'divider', color: '#cbd5e1' })
      continue
    }

    if (/^(?:[-*+]\s+)/.test(line)) {
      flushParagraph()
      const text = line.replace(/^[-*+]\s+/, '').trim()
      const pending = segments[segments.length - 1]
      if (pending && pending.type === 'list' && !pending.ordered) {
        pending.items.push(text)
      } else {
        const prior = segments.slice().reverse().find((segment) => segment.type === 'list')
        if (prior && prior.type === 'list' && !prior.ordered) {
          prior.items.push(text)
        } else {
          segments.push({ type: 'list', ordered: false, items: [text], color: defaultColor })
        }
      }
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph()
      const text = line.replace(/^\d+\.\s+/, '').trim()
      const pending = segments[segments.length - 1]
      if (pending && pending.type === 'list' && pending.ordered) {
        pending.items.push(text)
      } else {
        const prior = segments.slice().reverse().find((segment) => segment.type === 'list')
        if (prior && prior.type === 'list' && prior.ordered) {
          prior.items.push(text)
        } else {
          segments.push({ type: 'list', ordered: true, items: [text], color: defaultColor })
        }
      }
      continue
    }

    buffer.push(line)
  }

  flushParagraph()
  flushQuote()

  if (buffer.length) {
    const text = buffer.join(' ').trim()
    if (text) segments.push({ type: 'paragraph', text, color: defaultColor })
  }

  return segments
}

export function markdownToPlainText(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('```')) return ''

      if (/^#{1,6}\s+/.test(trimmed)) return trimmed.replace(/^#{1,6}\s+/, '')
      if (/^(?:[-*+]\s+|\d+\.\s+)/.test(trimmed)) return `• ${trimmed.replace(/^(?:[-*+]\s+|\d+\.\s+)/, '')}`
      if (/^>\s+/.test(trimmed)) return `> ${trimmed.replace(/^>\s+/, '')}`
      if (/^\[( |x|X)\]\s+/.test(trimmed)) return `• ${trimmed.replace(/^\[(?: |x|X)\]\s+/, '')}`

      return trimmed.replace(/\[(.+?)\]\(([^)]+)\)/g, '$1')
    })
    .filter(Boolean)
    .join('\n')
}
