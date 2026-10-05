export type NoteItem = {
  id: string
  title: string
  content: string
  updatedAt: string
}

const NOTES_KEY = 'knowledge-workspace-notes-v1'

export const defaultNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Project Brainstorm',
    content: '# Project Brainstorm\n\n## Objective\n- Build a personal knowledge workspace.\n- Keep notes, PDFs and deck exports in one place.\n\n## Notes\n- Search should become a fast gateway into knowledge.\n- Local-first storage is the best foundation for now.\n- Avoid paid AI in the first prototype.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Research Summary',
    content: '## Summary\n\nDocument ingestion, retrieval, and section-aware navigation should happen after the prototype is stable.\n\nFocus on note editing and export flows first.',
    updatedAt: new Date().toISOString(),
  },
]

export function readNotes(): NoteItem[] {
  if (typeof window === 'undefined') return defaultNotes

  try {
    const raw = localStorage.getItem(NOTES_KEY)
    if (!raw) return defaultNotes
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : defaultNotes
  } catch {
    return defaultNotes
  }
}

export function writeNotes(notes: NoteItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}
