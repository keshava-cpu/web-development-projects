import { jsPDF } from 'jspdf'
import { parseMarkdownSegments } from './markdown'

type PptxClass = new () => {
  layout: string
  author: string
  company: string
  subject: string
  title: string
  theme: Record<string, unknown>
  addSlide: () => {
    background: { color: string }
    addText: (text: string, config: Record<string, unknown>) => void
  }
  save: (fileName?: string) => void
  writeFile?: (opts: { fileName: string }) => Promise<void>
}

declare global {
  interface Window {
    PptxGenJS?: PptxClass
    gObjPptxShapes?: Record<string, unknown>
    gObjPptxMasters?: Record<string, unknown>
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-pptx-src="${src}"]`) as HTMLScriptElement | null
    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.pptxSrc = src
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
    document.head.appendChild(script)
  })
}

async function ensurePptxLibrary(): Promise<PptxClass> {
  if (typeof window !== 'undefined' && window.PptxGenJS) {
    return window.PptxGenJS
  }

  const shapesUrl = new URL('../../node_modules/pptxgenjs/dist/pptxgen.shapes.js', import.meta.url).href
  const coreUrl = new URL('../../node_modules/pptxgenjs/dist/pptxgen.js', import.meta.url).href

  await Promise.all([loadScript(shapesUrl), loadScript(coreUrl)])

  if (typeof window === 'undefined' || !window.PptxGenJS) {
    throw new Error('PptxGenJS failed to initialize in the browser.')
  }

  return window.PptxGenJS
}

function sanitizeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'document'
}

export function exportMarkdownToPdf(
  markdown: string,
  title = 'Document',
  options: { fontSize?: number; fontColor?: string } = {},
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 48
  const marginTop = 48
  const lineHeight = 18
  const bodyFontSize = options.fontSize ?? 16
  const bodyFontColor = options.fontColor ?? '#111827'
  const titleText = title || 'Document'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor('#111827')
  doc.text(titleText, marginX, marginTop)

  let y = marginTop + 30
  const headingColors = {
    1: '#0f172a',
    2: '#1f2937',
    3: '#334155',
  }

  const rawSegments = parseMarkdownSegments(markdown, bodyFontColor)
  const segments: Array<
    | { type: 'heading'; level: 1 | 2 | 3; text: string; color: string }
    | { type: 'paragraph'; text: string; color: string }
    | { type: 'list'; ordered: boolean; items: string[]; color: string }
    | { type: 'quote'; text: string; color: string }
    | { type: 'code'; text: string; color: string }
    | { type: 'divider'; color: string }
  > = rawSegments.length ? rawSegments : [{ type: 'paragraph', text: 'No content available.', color: bodyFontColor }]
  const width = pageWidth - marginX * 2

  for (const segment of segments) {
    if (y > pageHeight - 60) {
      doc.addPage()
      y = marginTop
    }

    if (segment.type === 'heading') {
      const heading = segment
      const size = heading.level === 1 ? Math.max(bodyFontSize + 16, 22) : heading.level === 2 ? Math.max(bodyFontSize + 8, 18) : Math.max(bodyFontSize + 2, 15)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(size)
      doc.setTextColor(headingColors[heading.level])
      const wrapped = doc.splitTextToSize(heading.text, width)
      for (const line of wrapped) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = marginTop
        }
        doc.text(line, marginX, y)
        y += Math.max(size * 1.2, 18)
      }
      y += 6
      continue
    }

    if (segment.type === 'paragraph') {
      const paragraph = segment
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(paragraph.color)
      const wrapped = doc.splitTextToSize(paragraph.text, width)
      for (const line of wrapped) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = marginTop
        }
        doc.text(line, marginX, y)
        y += lineHeight
      }
      continue
    }

    if (segment.type === 'list') {
      const list = segment
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(bodyFontSize)
      doc.setTextColor(list.color)
      for (let idx = 0; idx < list.items.length; idx += 1) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = marginTop
        }
        const prefix = list.ordered ? `${idx + 1}.` : '•'
        const text = `${prefix} ${list.items[idx]}`
        doc.text(text, marginX + (list.ordered ? 0 : 4), y)
        y += lineHeight
      }
      continue
    }

    if (segment.type === 'quote') {
      const quote = segment
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(bodyFontSize)
      doc.setTextColor('#475569')
      const wrapped = doc.splitTextToSize(`> ${quote.text}`, width)
      for (const line of wrapped) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = marginTop
        }
        doc.text(line, marginX, y)
        y += lineHeight
      }
      continue
    }

    if (segment.type === 'code') {
      const code = segment
      doc.setFont('courier', 'normal')
      doc.setFontSize(Math.max(bodyFontSize - 1, 12))
      doc.setTextColor('#1f2937')
      const wrapped = doc.splitTextToSize(code.text, width)
      for (const line of wrapped) {
        if (y > pageHeight - 40) {
          doc.addPage()
          y = marginTop
        }
        doc.text(line, marginX, y)
        y += 14
      }
      continue
    }

    if (segment.type === 'divider') {
      doc.setDrawColor(203, 213, 225)
      doc.line(marginX, y, pageWidth - marginX, y)
      y += 12
    }
  }

  const fileName = `${sanitizeFilename(titleText)}.pdf`
  doc.save(fileName)
}

export async function exportMarkdownToPpt(
  markdown: string,
  title = 'Deck',
  options: { fontSize?: number; fontColor?: string } = {},
) {
  const PptxGenJS = await ensurePptxLibrary()
  const pptx = new PptxGenJS()
  const bodyFontSize = options.fontSize ?? 22
  const bodyFontColor = options.fontColor ?? '#111827'

  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = 'Cognita'
  pptx.company = 'Local-first workspace'
  pptx.subject = 'Generated prototype deck'
  pptx.title = title
  pptx.theme = {
    colorScheme: {
      accent: '007ACC',
      accent2: '3E3E42',
      accent3: 'D4D4D4',
      accent4: 'FFFFFF',
      accent5: 'F8FAFC',
      accent6: '111827',
      h1: '111827',
      h2: '374151',
      bodyText: bodyFontColor,
      bullet: bodyFontColor,
    },
    fontFace: 'Aptos',
  }

  const blocks = markdown.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
  const slideBlocks = blocks.length ? blocks : ['No content available.']

  slideBlocks.forEach((block, index) => {
    const slide = pptx.addSlide()
    slide.background = { color: 'FFFFFF' }

    const segments = parseMarkdownSegments(block, bodyFontColor)
    const heading = segments.find((segment) => segment.type === 'heading')

    if (heading && heading.type === 'heading') {
      slide.addText(heading.text, {
        x: 0.5,
        y: 0.4,
        w: 12,
        h: 0.8,
        fontSize: heading.level === 1 ? Math.max(bodyFontSize + 12, 26) : heading.level === 2 ? Math.max(bodyFontSize + 6, 24) : Math.max(bodyFontSize + 2, 20),
        bold: true,
        color: heading.color.replace('#', ''),
      })
    } else {
      slide.addText(`Slide ${index + 1}`, {
        x: 0.5,
        y: 0.4,
        w: 12,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: '111827',
      })
    }

    let currentY = 1.3
    const contentSegments = segments.filter((segment) => segment.type !== 'heading')

    contentSegments.forEach((segment) => {
      if (segment.type === 'list') {
        segment.items.forEach((item, itemIndex) => {
          slide.addText(`${segment.ordered ? itemIndex + 1 + '.' : '•'} ${item}`, {
            x: 0.7,
            y: currentY,
            w: 12,
            h: 0.5,
            fontSize: bodyFontSize,
            color: segment.color.replace('#', ''),
            bullet: { indent: 0.2 },
          })
          currentY += 0.34
        })
        return
      }

      if (segment.type === 'paragraph') {
        slide.addText(segment.text, {
          x: 0.7,
          y: currentY,
          w: 12,
          h: 0.7,
          fontSize: bodyFontSize,
          color: segment.color.replace('#', ''),
          margin: 0.05,
          breakLine: true,
          fit: 'shrink',
        })
        currentY += 0.38
        return
      }

      if (segment.type === 'quote') {
        slide.addText(segment.text, {
          x: 0.7,
          y: currentY,
          w: 12,
          h: 0.7,
          fontSize: bodyFontSize,
          color: segment.color.replace('#', ''),
          italic: true,
          margin: 0.05,
          breakLine: true,
          fit: 'shrink',
        })
        currentY += 0.38
        return
      }

      if (segment.type === 'code') {
        slide.addText(segment.text, {
          x: 0.7,
          y: currentY,
          w: 12,
          h: 0.9,
          fontSize: Math.max(bodyFontSize - 2, 16),
          color: '#1f2937',
          fontFace: 'Courier New',
          margin: 0.05,
          breakLine: true,
          fit: 'shrink',
        })
        currentY += 0.42
      }
    })

    if (!contentSegments.length) {
      slide.addText('Generated from the current markdown note.', {
        x: 0.7,
        y: 1.3,
        w: 12,
        h: 0.7,
        fontSize: bodyFontSize,
        color: bodyFontColor.replace('#', ''),
      })
    }
  })

  const fileName = `${sanitizeFilename(title)}.pptx`

  if (typeof pptx.writeFile === 'function') {
    await pptx.writeFile({ fileName })
    return
  }

  pptx.save(fileName)
}
