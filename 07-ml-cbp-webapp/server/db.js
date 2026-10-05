import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'

const dataDir = path.join(process.cwd(), 'data')
fs.mkdirSync(dataDir, { recursive: true })

const dbPath = path.join(dataDir, 'knowledge.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    tag TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    metadata TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS exports (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

const seedNotes = [
  {
    id: 'note-1',
    title: 'Project Brainstorm',
    content: '# Project Brainstorm\n\n- Keep local-first storage for v1.\n- Use notebooks, export flows, and search as the proving ground.\n- Defer advanced book ingestion later.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Research Summary',
    content: '## Summary\n\nDocument structure matters more than raw AI power in the first iteration.',
    updated_at: new Date().toISOString(),
  },
]

const seedDocuments = [
  {
    id: 'doc-1',
    type: 'book',
    title: 'Dynamic Programming Essentials',
    subtitle: 'Algorithms and practice workbook',
    tag: 'book',
    description: 'A study workbook for exercises and recurrence-driven problem solving.',
    status: 'active',
    metadata: JSON.stringify({ metrics: ['18 exercises', '42 highlights'] }),
  },
  {
    id: 'doc-2',
    type: 'note',
    title: 'Project Brainstorm',
    subtitle: 'Planning and product direction',
    tag: 'notes',
    description: 'Core requirements and product decisions for the workspace app.',
    status: 'draft',
    metadata: JSON.stringify({ metrics: ['12 ideas', '5 tasks'] }),
  },
]

const noteInsert = db.prepare(`INSERT OR IGNORE INTO notes (id, title, content, updated_at) VALUES (@id, @title, @content, @updated_at)`)
for (const note of seedNotes) noteInsert.run(note)

const docInsert = db.prepare(`INSERT OR IGNORE INTO documents (id, type, title, subtitle, tag, description, status, metadata) VALUES (@id, @type, @title, @subtitle, @tag, @description, @status, @metadata)`)
for (const document of seedDocuments) docInsert.run(document)

export function getDb() {
  return db
}
