import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom'
import {
  BookOpen,
  BrainCircuit,
  ChevronRight,
  FileText,
  FolderKanban,
  FolderOpen,
  NotebookPen,
  Presentation,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { LibraryPage } from './pages/LibraryPage'
import { NoteWorkspacePage } from './pages/NoteWorkspacePage'
import { PdfWorkspacePage } from './pages/PdfWorkspacePage'
import { PptWorkspacePage } from './pages/PptWorkspacePage'
import { RagPage } from './pages/RagPage'
import { Button } from './components/ui/button'
import { notifyApp, type AppToast } from './lib/toast'
import { cn } from './lib/utils'

const navItems = [
  { path: '/', label: 'Library', icon: BookOpen },
  { path: '/notes', label: 'Notes', icon: NotebookPen },
  { path: '/pdf', label: 'PDF', icon: FileText },
  { path: '/ppt', label: 'PPT', icon: Presentation },
  { path: '/rag', label: 'RAG', icon: BrainCircuit },
]

const projectTree = [
  {
    label: 'Project workspace',
    open: true,
    items: [
      { label: 'Notes', children: ['Project brief', 'Meeting notes', 'Research loop'] },
      { label: 'Books', children: ['Dynamic Programming Essentials', 'Design patterns'] },
      { label: 'PDFs', children: ['Research packet.pdf', 'Lecture notes.pdf'] },
      { label: 'PPTs', children: ['Quarterly review', 'Prototype deck'] },
      { label: 'Handwritten', children: ['Lecture scan', 'Formula sheet'] },
    ],
  },
]

function ToastRegion() {
  const [toasts, setToasts] = useState<AppToast[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToast>
      const nextToast = customEvent.detail
      setToasts((current) => [...current, nextToast])

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== nextToast.id))
      }, 2200)
    }

    window.addEventListener('app:toast', handleToast)
    return () => window.removeEventListener('app:toast', handleToast)
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-md border border-slate-700 bg-slate-900/95 p-3',
            toast.tone === 'success' && 'border-emerald-500/40 bg-emerald-500/10',
            toast.tone === 'info' && 'border-slate-700 bg-slate-900/95',
          )}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-100">{toast.message}</p>
        </div>
      ))}
    </div>
  )
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({
    'Notes': true,
    'Books': false,
    'PDFs': false,
    'PPTs': false,
    'Handwritten': false,
  })

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      <ToastRegion />
      <div className="min-h-screen bg-[#0d1117] text-[#e5e7eb] flex flex-col">
      <div className="border-b border-[#394956] bg-[#12181d]/95">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-3 py-2.5 md:px-4 md:py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f1f5f9] text-[#111827]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[1rem] font-semibold tracking-[-0.04em] text-[#f3f4f6]">Cognita</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-[5px] border border-[#394956] bg-[#171d22] p-0.5 md:flex">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-[4px] px-2.5 py-1.25 text-[0.64rem] font-medium tracking-[0.08em] uppercase transition-colors',
                    isActive ? 'text-[#edf3f8] bg-[#212b32] border border-[#465a68]' : 'text-[#8f97a3] hover:text-[#edf2f7] hover:bg-[#1d2429]',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-md border border-[#394956] bg-[#171d22] px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.08em] text-[#97a3b1] md:flex">
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Local-first</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-[4px] px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.08em] border-[#394956] bg-[#171d22] text-[#edf2f7] hover:bg-[#1d2429]"
              onClick={() => notifyApp('Workspace', 'Project workspace is ready for the next draft.', 'info')}
            >
              Workspace
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-2 md:gap-1 max-w-[1800px] mx-auto w-full md:p-2 p-0 md:overflow-hidden">
        <aside
          className={cn(
            'soft-panel flex flex-col border border-[#394956] bg-[#141b20]/95 transition-all duration-300 md:rounded-[10px]',
            collapsed ? 'hidden md:flex md:w-[72px]' : 'w-full md:w-[220px]',
            collapsed && 'md:h-fit',
          )}
        >
          <div className="flex items-center justify-between border-b border-[#394956] px-3 py-3">
            <div className={cn('flex items-center gap-2 min-w-0', collapsed && 'hidden')}>
              <FolderOpen className="h-4 w-4 text-[#9aa7b3] shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#8d97a2] font-semibold">Project</p>
                <p className="text-sm font-medium text-[#edf1f5] truncate">Neon research</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed((value) => !value)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#8d97a2] hover:text-[#edf1f5] hover:bg-[#1d2125] ml-auto shrink-0 transition border border-transparent hover:border-[#465a68]"
              aria-label="Toggle sidebar"
            >
              <ChevronRight className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </button>
          </div>

          <div className={cn('flex-1 overflow-y-auto px-0 py-2.5', collapsed && 'hidden')}>
            <div className="px-3 pb-2 pt-1 text-[9px] uppercase text-[#a9b7c5] font-semibold tracking-[0.12em]">Explorer</div>
            {projectTree.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#dfe7ef]">
                  <FolderOpen className="h-4 w-4 text-[#5db0ff] shrink-0" />
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <div
                        onClick={() => toggleExpanded(item.label)}
                        className="mx-1.5 flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-sm text-[#d8dfe9] hover:bg-[#1d2125] cursor-pointer transition border border-transparent hover:border-[#465a68]"
                      >
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform shrink-0 text-[#8d97a2]',
                            expandedItems[item.label] && 'rotate-90',
                          )}
                        />
                        <FolderKanban className="h-4 w-4 text-[#8d97a2] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {expandedItems[item.label] &&
                        item.children?.map((child) => (
                          <div
                            key={child}
                            onClick={() => notifyApp('File opened', `${child} is ready for review.`, 'info')}
                            className="mx-1.5 flex items-center gap-3 rounded-[6px] px-6 py-1.5 text-sm text-[#8d97a2] hover:text-[#edf1f5] hover:bg-[#1d2125] cursor-pointer transition border border-transparent hover:border-[#465a68]"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{child}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={cn('border-t border-[#394956] px-2.5 py-3 space-y-1.5 mt-auto', collapsed && 'hidden')}>
            <div className="flex items-center gap-3 px-1.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a8fe8] text-white text-xs font-bold shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#edf1f5] truncate">Arjun</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#8d97a2]">Owner</p>
              </div>
            </div>
            <button
              onClick={() => notifyApp('Settings', 'Workspace settings panel opened.', 'info')}
              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm text-[#8d97a2] hover:text-[#edf1f5] hover:bg-[#1d2125] transition border border-transparent hover:border-[#465a68]"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => notifyApp('Signed out', 'You have been logged out.', 'success')}
              className="flex w-full items-center gap-2 rounded-[6px] px-2.5 py-2 text-sm text-[#8d97a2] hover:text-red-400 hover:bg-[#1d2125] transition border border-transparent hover:border-[#465a68]"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="soft-panel flex-1 bg-[#141b20]/95 p-3 md:p-0 rounded-[10px] md:rounded-[10px] overflow-hidden border border-[#394956]">
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/notes" element={<NoteWorkspacePage />} />
            <Route path="/pdf" element={<PdfWorkspacePage />} />
            <Route path="/ppt" element={<PptWorkspacePage />} />
            <Route path="/rag" element={<RagPage />} />
          </Routes>
        </main>
      </div>
    </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
