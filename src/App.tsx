import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Compass, FolderKanban, BookOpen, Settings, Plus, Sun, Moon,
  Languages, Sparkles, ArrowUpLeft, Trash2, X, Layers3,
  WandSparkles, Code2, Rocket, PanelLeftClose, AlertTriangle,
  CheckCircle2, Circle, ListTodo, Info, ChevronLeft, ClipboardList,
  Bot, Copy, Check, MessageSquare, FileCode2, FolderPlus, FilePlus2, Eye, Monitor, Smartphone, Tablet
} from 'lucide-react'
import type {
  Language, Project, ProjectType, ProjectStage, ProjectStatus,
  Theme, Task, DiscoveryData, DiscoveryAnswer, AiData, AiMessage, FilesData, ProjectFile, QaData
} from './types'
import {
  getTranslations, type TranslationKeys, DISCOVERY_QUESTIONS, PROMPT_TEMPLATES
} from './data/translations'
import {
  loadProjects, createProject as storageCreate,
  deleteProject as storageDelete, updateProject as storageUpdate, storageInfo,
} from './storage'

const projectTypes: ProjectType[] = [
  'portfolio', 'business', 'store', 'education',
  'blog', 'booking', 'community', 'webapp'
]
const stages: ProjectStage[] = [
  'discovery', 'planning', 'design', 'development', 'testing', 'published'
]
const statuses: ProjectStatus[] = ['active', 'archived', 'completed']

type PageId = 'overview' | 'projects' | 'guide' | 'settings'
type WorkspaceTab = 'overview' | 'discovery' | 'ai' | 'files' | 'preview' | 'tasks' | 'settings'

/** Build a context block from project + discovery */
function buildProjectContext(project: Project, t: TranslationKeys, isFa: boolean): string {
  const lines: string[] = []
  lines.push(isFa ? `نام پروژه: ${project.name}` : `Project name: ${project.name}`)
  lines.push(isFa ? `نوع: ${t[project.type]}` : `Type: ${t[project.type]}`)
  if (project.description) {
    lines.push(isFa ? `توضیح: ${project.description}` : `Description: ${project.description}`)
  }
  lines.push(isFa ? `مرحله فعلی: ${t[project.stage]}` : `Current stage: ${t[project.stage]}`)

  const answers = project.discovery?.answers || []
  if (answers.length > 0) {
    lines.push('')
    lines.push(isFa ? '--- پاسخ‌های نیازسنجی ---' : '--- Discovery answers ---')
    for (const a of answers) {
      const qLabel = t[a.questionId as keyof TranslationKeys] || a.questionId
      lines.push(`${qLabel}`)
      lines.push(`  → ${a.value}`)
    }
  }
  if (project.discovery?.notes) {
    lines.push('')
    lines.push(isFa ? `یادداشت‌ها: ${project.discovery.notes}` : `Notes: ${project.discovery.notes}`)
  }
  return lines.join('\n')
}

function buildPromptFromTemplate(
  templateId: string,
  project: Project,
  t: TranslationKeys,
  isFa: boolean
): string {
  const ctx = buildProjectContext(project, t, isFa)
  const header = isFa
    ? 'تو یک مشاور حرفه‌ای طراحی و توسعه وب‌سایت هستی. بر اساس اطلاعات پروژه زیر پاسخ بده.\n\n'
    : 'You are a professional website design and development consultant. Answer based on the project information below.\n\n'

  const instructions: Record<string, { fa: string; en: string }> = {
    structure: {
      fa: 'ساختار صفحات و منوی پیشنهادی این وب‌سایت را به‌صورت فهرست واضح بنویس. برای هر صفحه یک جمله توضیح بده.',
      en: 'Propose a clear page structure and navigation for this website. Add a one-sentence description for each page.',
    },
    features: {
      fa: 'قابلیت‌های ضروری و اختیاری را در دو فهرست جداگانه اولویت‌بندی کن و دلیل هر مورد را کوتاه بنویس.',
      en: 'List essential vs optional features in two separate prioritized lists and briefly justify each item.',
    },
    copy: {
      fa: 'پیش‌نویس متن صفحه اصلی (عنوان، زیرعنوان، بخش‌های اصلی) را به زبان فارسی و لحن مناسب مخاطب بنویس.',
      en: 'Draft homepage copy (headline, subheadline, main sections) in a tone suitable for the audience.',
    },
    tech: {
      fa: 'یک استک فنی مناسب (frontend، backend در صورت نیاز، میزبانی) پیشنهاد بده و دلیل انتخاب را توضیح بده. سطح پیچیدگی را با محدودیت‌های پروژه هماهنگ کن.',
      en: 'Suggest a suitable tech stack (frontend, backend if needed, hosting) and explain why. Match complexity to project constraints.',
    },
    tasks: {
      fa: 'نیازمندی‌ها را به یک لیست وظایف قابل اجرا و اولویت‌بندی‌شده تبدیل کن (حداکثر ۱۵ مورد).',
      en: 'Turn the requirements into a prioritized, actionable task list (max 15 items).',
    },
    review: {
      fa: 'نقاط ضعف یا کمبود اطلاعات در نیازسنجی را مشخص کن و ۳ تا ۵ سؤال تکمیلی پیشنهاد بده.',
      en: 'Identify gaps in the discovery answers and suggest 3–5 follow-up questions.',
    },
  }

  const instr = instructions[templateId]
  const body = instr ? (isFa ? instr.fa : instr.en) : (isFa ? 'بر اساس اطلاعات پروژه راهنمایی کن.' : 'Provide guidance based on the project information.')

  return `${header}${ctx}\n\n---\n\n${body}`
}



const QA_KEYS = ['qa_responsive', 'qa_content', 'qa_links', 'qa_images', 'qa_lang'] as const

/** Build srcdoc HTML from virtual files (index.html + inline css/js when referenced) */
function buildPreviewHtml(files: ProjectFile[]): string | null {
  const list = files.filter(f => f.kind === 'file')
  const byPath: Record<string, string> = {}
  for (const f of list) {
    byPath[f.path] = f.content || ''
  }
  let html = byPath['index.html']
  if (html === undefined) {
    // try any html file
    const htmlFile = list.find(f => f.path.endsWith('.html'))
    if (!htmlFile) return null
    html = htmlFile.content || ''
  }
  // Inline local CSS linked as href="styles.css" or similar relative
  html = html.replace(
    /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi,
    (match: string, href: string): string => {
      const key = href.replace(/^\.\//, '')
      const css = byPath[key]
      if (css === undefined) return match
      return '<style>\n' + css + '\n</style>'
    }
  )
  // Inline local JS
  html = html.replace(
    /<script[^>]+src=["']([^"']+\.js)["'][^>]*>\s*<\/script>/gi,
    (match: string, src: string): string => {
      const key = src.replace(/^\.\//, '')
      const js = byPath[key]
      if (js === undefined) return match
      return '<script>\n' + js + '\n</script>'
    }
  )
  return html
}


export default function App() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('rahsaz.language') as Language) || 'fa'
  )
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('rahsaz.theme') as Theme) || 'dark'
  )
  const [projects, setProjects] = useState<Project[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [activePage, setActivePage] = useState<PageId>('overview')
  const [name, setName] = useState('')
  const [type, setType] = useState<ProjectType>('portfolio')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('overview')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editType, setEditType] = useState<ProjectType>('portfolio')
  const [editStage, setEditStage] = useState<ProjectStage>('discovery')
  const [editStatus, setEditStatus] = useState<ProjectStatus>('active')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  // Discovery
  const [discAnswers, setDiscAnswers] = useState<Record<string, string>>({})
  const [discNotes, setDiscNotes] = useState('')

  // AI
  const [selectedTemplate, setSelectedTemplate] = useState<string>('structure')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [copied, setCopied] = useState(false)

  // Files
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorDirty, setEditorDirty] = useState(false)
  const [newPath, setNewPath] = useState('')
  const [fileError, setFileError] = useState('')

  // Preview / QA
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewKey, setPreviewKey] = useState(0)
  const [qaChecks, setQaChecks] = useState<Record<string, boolean>>({})

  const t = useMemo(() => getTranslations(language), [language])
  const isFa = language === 'fa'

  const activeProject = useMemo(
    () => projects.find(p => p.id === activeProjectId) || null,
    [projects, activeProjectId]
  )

  useEffect(() => {
    const result = loadProjects()
    if (result.ok) { setProjects(result.data); setStorageError(null) }
    else { setStorageError(result.error); setProjects([]) }
    setStorageReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = isFa ? 'rtl' : 'ltr'
    localStorage.setItem('rahsaz.language', language)
  }, [language, isFa])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rahsaz.theme', theme)
  }, [theme])

  const openProject = useCallback((project: Project) => {
    setActiveProjectId(project.id)
    setWorkspaceTab('overview')
    setEditName(project.name)
    setEditDesc(project.description)
    setEditType(project.type)
    setEditStage(project.stage)
    setEditStatus(project.status)
    setSaveMessage('')
    setNewTaskTitle('')
    const map: Record<string, string> = {}
    for (const a of project.discovery?.answers || []) map[a.questionId] = a.value
    setDiscAnswers(map)
    setDiscNotes(project.discovery?.notes || '')
    setSelectedTemplate('structure')
    setCustomPrompt('')
    setGeneratedPrompt('')
    setPasteText('')
    setCopied(false)
    setSelectedFileId(null)
    setEditorContent('')
    setEditorDirty(false)
    setNewPath('')
    setFileError('')
    setViewport('desktop')
    setPreviewKey(k => k + 1)
    const qc: Record<string, boolean> = {}
    if (project.qa?.checks) {
      for (const [k, v] of Object.entries(project.qa.checks)) qc[k] = Boolean(v)
    }
    setQaChecks(qc)
  }, [])

  const closeProject = useCallback(() => {
    setActiveProjectId(null)
    setActivePage('projects')
  }, [])

  const handleCreate = useCallback(() => {
    setFormError('')
    const result = storageCreate({ name, type, description }, projects)
    if (!result.ok) {
      if (result.error === 'EMPTY_NAME') setFormError(t.emptyName)
      else { setFormError(t.storageError); setStorageError(result.error) }
      return
    }
    setProjects(result.data)
    setName(''); setDescription(''); setType('portfolio'); setShowCreate(false)
    const created = result.data[0]
    if (created) openProject(created)
  }, [name, type, description, projects, t, openProject])

  const requestDelete = useCallback((project: Project) => setDeleteTarget(project), [])

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    const result = storageDelete(deleteTarget.id, projects)
    if (result.ok) {
      setProjects(result.data)
      if (activeProjectId === deleteTarget.id) setActiveProjectId(null)
      setDeleteTarget(null)
    } else { setStorageError(result.error); setDeleteTarget(null) }
  }, [deleteTarget, projects, activeProjectId])

  const handleSaveProject = useCallback(() => {
    if (!activeProject) return
    const result = storageUpdate(
      activeProject.id,
      { name: editName, description: editDesc, type: editType, stage: editStage, status: editStatus },
      projects
    )
    if (result.ok) {
      setProjects(result.data)
      setSaveMessage(t.changesSaved)
      setTimeout(() => setSaveMessage(''), 2500)
    } else {
      if (result.error === 'EMPTY_NAME') setFormError(t.emptyName)
      else setStorageError(result.error)
    }
  }, [activeProject, editName, editDesc, editType, editStage, editStatus, projects, t])

  const handleAddTask = useCallback(() => {
    if (!activeProject || !newTaskTitle.trim()) return
    const task: Task = { id: crypto.randomUUID(), title: newTaskTitle.trim(), done: false, createdAt: new Date().toISOString() }
    const tasks = [...(activeProject.tasks || []), task]
    const result = storageUpdate(activeProject.id, { tasks }, projects)
    if (result.ok) { setProjects(result.data); setNewTaskTitle('') }
    else setStorageError(result.error)
  }, [activeProject, newTaskTitle, projects])

  const handleToggleTask = useCallback((taskId: string) => {
    if (!activeProject) return
    const tasks = (activeProject.tasks || []).map(tk => tk.id === taskId ? { ...tk, done: !tk.done } : tk)
    const result = storageUpdate(activeProject.id, { tasks }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects])

  const handleDeleteTask = useCallback((taskId: string) => {
    if (!activeProject) return
    const tasks = (activeProject.tasks || []).filter(tk => tk.id !== taskId)
    const result = storageUpdate(activeProject.id, { tasks }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects])

  const buildDiscoveryData = useCallback((confirmed: boolean): DiscoveryData => {
    const answers: DiscoveryAnswer[] = DISCOVERY_QUESTIONS
      .filter(qid => (discAnswers[qid] || '').trim())
      .map(qid => ({ questionId: qid, value: discAnswers[qid].trim() }))
    return { answers, notes: discNotes.trim(), confirmed, updatedAt: new Date().toISOString() }
  }, [discAnswers, discNotes])

  const handleSaveDiscovery = useCallback(() => {
    if (!activeProject) return
    const discovery = buildDiscoveryData(activeProject.discovery?.confirmed || false)
    const result = storageUpdate(activeProject.id, { discovery }, projects)
    if (result.ok) {
      setProjects(result.data)
      setSaveMessage(t.changesSaved)
      setTimeout(() => setSaveMessage(''), 2500)
    } else setStorageError(result.error)
  }, [activeProject, buildDiscoveryData, projects, t])

  const handleConfirmDiscovery = useCallback(() => {
    if (!activeProject) return
    const discovery = buildDiscoveryData(true)
    const result = storageUpdate(activeProject.id, { discovery, stage: 'planning' }, projects)
    if (result.ok) {
      setProjects(result.data)
      setEditStage('planning')
      setSaveMessage(t.requirementsConfirmed)
      setTimeout(() => setSaveMessage(''), 3000)
      setWorkspaceTab('overview')
    } else setStorageError(result.error)
  }, [activeProject, buildDiscoveryData, projects, t])

  // AI handlers
  const handleBuildPrompt = useCallback(() => {
    if (!activeProject) return
    if (customPrompt.trim()) {
      const ctx = buildProjectContext(activeProject, t, isFa)
      const header = isFa
        ? 'تو یک مشاور حرفه‌ای طراحی و توسعه وب‌سایت هستی. بر اساس اطلاعات پروژه زیر پاسخ بده.\n\n'
        : 'You are a professional website design and development consultant. Answer based on the project information below.\n\n'
      setGeneratedPrompt(`${header}${ctx}\n\n---\n\n${customPrompt.trim()}`)
    } else {
      setGeneratedPrompt(buildPromptFromTemplate(selectedTemplate, activeProject, t, isFa))
    }
  }, [activeProject, selectedTemplate, customPrompt, t, isFa])

  const handleCopyPrompt = useCallback(async () => {
    if (!generatedPrompt) handleBuildPrompt()
    const text = generatedPrompt || (activeProject
      ? buildPromptFromTemplate(selectedTemplate, activeProject, t, isFa)
      : '')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      // Also save as user message in history
      if (activeProject) {
        const msg: AiMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: text,
          label: customPrompt.trim()
            ? t.customPrompt
            : t[PROMPT_TEMPLATES.find(p => p.id === selectedTemplate)?.titleKey as keyof TranslationKeys] || selectedTemplate,
          createdAt: new Date().toISOString(),
        }
        const messages = [...(activeProject.ai?.messages || []), msg]
        const ai: AiData = { messages, updatedAt: new Date().toISOString() }
        const result = storageUpdate(activeProject.id, { ai }, projects)
        if (result.ok) setProjects(result.data)
      }
    } catch {
      // fallback: select text
    }
  }, [generatedPrompt, handleBuildPrompt, activeProject, selectedTemplate, customPrompt, t, isFa, projects])

  const handleSaveResponse = useCallback(() => {
    if (!activeProject || !pasteText.trim()) return
    const msg: AiMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: pasteText.trim(),
      createdAt: new Date().toISOString(),
    }
    const messages = [...(activeProject.ai?.messages || []), msg]
    const ai: AiData = { messages, updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { ai }, projects)
    if (result.ok) {
      setProjects(result.data)
      setPasteText('')
      setSaveMessage(t.responseSaved)
      setTimeout(() => setSaveMessage(''), 2500)
    } else setStorageError(result.error)
  }, [activeProject, pasteText, projects, t])

  const handleDeleteMessage = useCallback((msgId: string) => {
    if (!activeProject) return
    const messages = (activeProject.ai?.messages || []).filter(m => m.id !== msgId)
    const ai: AiData = { messages, updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { ai }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects])

  const handleClearHistory = useCallback(() => {
    if (!activeProject) return
    const ai: AiData = { messages: [], updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { ai }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects])


  // Files handlers
  const getFiles = useCallback((): ProjectFile[] => {
    return activeProject?.files?.files || []
  }, [activeProject])

  const persistFiles = useCallback((files: ProjectFile[]) => {
    if (!activeProject) return
    const data: FilesData = { files, updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { files: data }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects])

  const normalizePath = (raw: string) =>
    raw.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/')

  const handleCreateFile = useCallback((kind: 'file' | 'folder') => {
    if (!activeProject) return
    setFileError('')
    const path = normalizePath(newPath)
    if (!path || path.includes('..')) {
      setFileError(t.invalidPath)
      return
    }
    const files = getFiles()
    if (files.some(f => f.path === path)) {
      setFileError(t.pathExists)
      return
    }
    const now = new Date().toISOString()
    const entry: ProjectFile = {
      id: crypto.randomUUID(),
      path,
      kind,
      content: kind === 'file' ? '' : undefined,
      updatedAt: now,
    }
    const next = [...files, entry].sort((a, b) => a.path.localeCompare(b.path))
    persistFiles(next)
    setNewPath('')
    if (kind === 'file') {
      setSelectedFileId(entry.id)
      setEditorContent('')
      setEditorDirty(false)
    }
  }, [activeProject, newPath, getFiles, persistFiles, t])

  const handleSelectFile = useCallback((file: ProjectFile) => {
    if (file.kind !== 'file') return
    setSelectedFileId(file.id)
    setEditorContent(file.content || '')
    setEditorDirty(false)
    setFileError('')
  }, [])

  const handleSaveFile = useCallback(() => {
    if (!activeProject || !selectedFileId) return
    const files = getFiles().map(f =>
      f.id === selectedFileId
        ? { ...f, content: editorContent, updatedAt: new Date().toISOString() }
        : f
    )
    persistFiles(files)
    setEditorDirty(false)
    setSaveMessage(t.fileSaved)
    setTimeout(() => setSaveMessage(''), 2000)
  }, [activeProject, selectedFileId, editorContent, getFiles, persistFiles, t])

  const handleDeleteFile = useCallback((id: string) => {
    if (!activeProject) return
    if (!window.confirm(t.confirmDeleteFile)) return
    const target = getFiles().find(f => f.id === id)
    let files = getFiles().filter(f => f.id !== id)
    // If folder, also remove nested paths
    if (target?.kind === 'folder') {
      const prefix = target.path.endsWith('/') ? target.path : target.path + '/'
      files = files.filter(f => !f.path.startsWith(prefix))
    }
    persistFiles(files)
    if (selectedFileId === id) {
      setSelectedFileId(null)
      setEditorContent('')
      setEditorDirty(false)
    }
  }, [activeProject, getFiles, persistFiles, selectedFileId, t])

  const handleSeedStarter = useCallback(() => {
    if (!activeProject) return
    const now = new Date().toISOString()
    const existing = new Set(getFiles().map(f => f.path))
    const starters: ProjectFile[] = [
      { id: crypto.randomUUID(), path: 'index.html', kind: 'file' as const, content: '<!DOCTYPE html>\\n<html lang=\"fa\" dir=\"rtl\">\\n<head>\\n  <meta charset=\"UTF-8\" />\\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\\n  <title>' + activeProject.name + '</title>\\n  <link rel=\"stylesheet\" href=\"styles.css\" />\\n</head>\\n<body>\\n  <main>\\n    <h1>' + activeProject.name + '</h1>\\n    <p>شروع پروژه</p>\\n  </main>\\n  <script src=\"main.js\"></script>\\n</body>\\n</html>\\n', updatedAt: now },
      { id: crypto.randomUUID(), path: 'styles.css', kind: 'file' as const, content: '* { box-sizing: border-box; }\\nbody { margin: 0; font-family: system-ui, sans-serif; }\\nmain { padding: 2rem; }\\n', updatedAt: now },
      { id: crypto.randomUUID(), path: 'main.js', kind: 'file' as const, content: 'console.log(\"Rahsaz starter\");\\n', updatedAt: now },
      { id: crypto.randomUUID(), path: 'README.md', kind: 'file' as const, content: '# ' + activeProject.name + '\\n\\nCreated with Rahsaz.\\n', updatedAt: now },
    ].filter(f => !existing.has(f.path))
    if (starters.length === 0) return
    const next = [...getFiles(), ...starters].sort((a, b) => a.path.localeCompare(b.path))
    persistFiles(next)
  }, [activeProject, getFiles, persistFiles])



  const handleToggleQa = useCallback((key: string) => {
    if (!activeProject) return
    const next = { ...qaChecks, [key]: !qaChecks[key] }
    setQaChecks(next)
    const qa: QaData = { checks: next, updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { qa }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, qaChecks, projects])

  const nav = [
    { id: 'overview' as const, label: t.overview, icon: Compass },
    { id: 'projects' as const, label: t.projects, icon: FolderKanban },
    { id: 'guide' as const, label: t.guide, icon: BookOpen },
    { id: 'settings' as const, label: t.settings, icon: Settings },
  ]

  if (!storageReady) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--muted)' }}>{isFa ? 'در حال بارگذاری...' : 'Loading...'}</p>
      </div>
    )
  }

  // ========== PROJECT WORKSPACE ==========
  if (activeProject) {
    const tasks = activeProject.tasks || []
    const doneCount = tasks.filter(tk => tk.done).length
    const progressPct = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100)
    const answeredCount = DISCOVERY_QUESTIONS.filter(qid => (discAnswers[qid] || '').trim()).length
    const discoveryPct = Math.round((answeredCount / DISCOVERY_QUESTIONS.length) * 100)
    const isConfirmed = activeProject.discovery?.confirmed
    const aiMessages = activeProject.ai?.messages || []

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand-mark"><WandSparkles size={21} /></div>
            <div>
              <div className="brand-name">{t.brand}</div>
              <div className="brand-caption">PROJECT WORKSPACE</div>
            </div>
          </div>

          <button className="secondary-button back-btn" onClick={closeProject} style={{ width: '100%', marginBottom: 20 }}>
            <ChevronLeft size={16} />
            {t.backToProjects}
          </button>

          <div className="nav-label">{t.projectWorkspace}</div>
          <nav className="nav-list">
            {[
              { id: 'overview' as const, label: t.projectOverview, icon: Info },
              { id: 'discovery' as const, label: t.projectDiscovery, icon: ClipboardList },
              { id: 'ai' as const, label: t.projectAi, icon: Bot },
              { id: 'files' as const, label: t.projectFiles, icon: FileCode2 },
              { id: 'preview' as const, label: t.projectPreview, icon: Eye },
              { id: 'tasks' as const, label: t.projectTasks, icon: ListTodo },
              { id: 'settings' as const, label: t.projectSettings, icon: Settings },
            ].map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={`nav-item ${workspaceTab === item.id ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab(item.id)}
                >
                  <Icon size={18} /><span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="sidebar-bottom">
            <div className="help-card">
              <Sparkles size={18} />
              <strong>{activeProject.name}</strong>
              <p>{t[activeProject.stage]} · {t[`status${activeProject.status.charAt(0).toUpperCase() + activeProject.status.slice(1)}` as keyof TranslationKeys] || activeProject.status}</p>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="breadcrumb">
              {t.brand}<span>/</span>
              <strong>{activeProject.name}</strong>
              <span>/</span>
              <span>
                {workspaceTab === 'overview' ? t.projectOverview
                  : workspaceTab === 'discovery' ? t.projectDiscovery
                  : workspaceTab === 'ai' ? t.projectAi
                  : workspaceTab === 'files' ? t.projectFiles
                  : workspaceTab === 'preview' ? t.projectPreview
                  : workspaceTab === 'tasks' ? t.projectTasks
                  : t.projectSettings}
              </span>
            </div>
            <div className="top-actions">
              <button className="icon-button" title={t.language} onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}>
                <Languages size={18} /><span>{language === 'fa' ? 'EN' : 'فا'}</span>
              </button>
              <button className="icon-button" title={t.theme} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </header>

          {storageError && (
            <div className="storage-error-banner" role="alert">
              <AlertTriangle size={16} />
              <span>{t.storageError}</span>
              <button onClick={() => setStorageError(null)} aria-label="Dismiss">×</button>
            </div>
          )}

          <div className="content">
            {/* OVERVIEW */}
            {workspaceTab === 'overview' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectInfo}</div>
                    <h1>{activeProject.name}</h1>
                    <p style={{ color: 'var(--muted)', marginTop: 6 }}>
                      {activeProject.description || t[activeProject.type]}
                    </p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                <div className="stats-grid" style={{ marginTop: 24 }}>
                  <div className="stat-card">
                    <span>{t.stage}</span>
                    <strong style={{ fontSize: 16 }}>{t[activeProject.stage]}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t.discoveryProgress}</span>
                    <strong style={{ fontSize: 16 }}>{discoveryPct}%</strong>
                    <small>{answeredCount} {t.answeredOf} {DISCOVERY_QUESTIONS.length}</small>
                  </div>
                  <div className="stat-card">
                    <span>{t.progress}</span>
                    <strong style={{ fontSize: 16 }}>{progressPct}%</strong>
                    <small>{doneCount} / {tasks.length} {t.tasksCompleted}</small>
                  </div>
                </div>

                <div className="section-block" style={{ marginTop: 28 }}>
                  <div className="section-heading">
                    <div>
                      <h2>{t.howItWorks}</h2>
                    </div>
                  </div>
                  <div className="steps-grid">
                    {stages.map((s, i) => {
                      const active = activeProject.stage === s
                      const passed = stages.indexOf(activeProject.stage) > i
                      return (
                        <div key={s} className={`step-card ${active ? 'step-active' : ''} ${passed ? 'step-passed' : ''}`}>
                          <div className="step-top">
                            <span>0{i + 1}</span>
                            {passed || active ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                          </div>
                          <strong>{t[s]}</strong>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {answeredCount > 0 && (
                  <div className="section-block" style={{ marginTop: 28 }}>
                    <div className="section-heading">
                      <div>
                        <h2>{t.requirementsSummary}</h2>
                        {isConfirmed && (
                          <p style={{ color: 'var(--green)' }}>
                            <CheckCircle2 size={14} style={{ display: 'inline', marginInlineEnd: 4 }} />
                            {t.requirementsConfirmed}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="req-summary">
                      {DISCOVERY_QUESTIONS.filter(qid => (discAnswers[qid] || '').trim()).map(qid => (
                        <div key={qid} className="req-item">
                          <strong>{t[qid]}</strong>
                          <p>{discAnswers[qid]}</p>
                        </div>
                      ))}
                      {discNotes.trim() && (
                        <div className="req-item">
                          <strong>{t.discoveryNotes}</strong>
                          <p>{discNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="meta-row" style={{ marginTop: 24, color: 'var(--muted)', fontSize: 13 }}>
                  <span>{t.createdAt}: {new Date(activeProject.createdAt).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</span>
                  <span style={{ marginInline: 12 }}>·</span>
                  <span>{t.lastUpdated}: {new Date(activeProject.updatedAt).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</span>
                </div>
              </section>
            )}

            {/* DISCOVERY */}
            {workspaceTab === 'discovery' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectDiscovery}</div>
                    <h1>{t.discoveryTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.discoverySubtitle}</p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                <div className="discovery-progress-bar">
                  <div className="discovery-progress-fill" style={{ width: `${discoveryPct}%` }} />
                  <span>{answeredCount} / {DISCOVERY_QUESTIONS.length}</span>
                </div>

                <div className="discovery-form">
                  {DISCOVERY_QUESTIONS.map((qid, idx) => (
                    <label key={qid} className="discovery-question">
                      <div className="dq-header">
                        <span className="dq-num">{idx + 1}</span>
                        <div>
                          <strong>{t[qid]}</strong>
                          <small>{t[`${qid}_hint` as keyof TranslationKeys]}</small>
                        </div>
                      </div>
                      <textarea
                        value={discAnswers[qid] || ''}
                        onChange={e => setDiscAnswers(prev => ({ ...prev, [qid]: e.target.value }))}
                        rows={2}
                        placeholder={t.notAnswered}
                      />
                    </label>
                  ))}
                  <label className="discovery-question">
                    <div className="dq-header">
                      <span className="dq-num">+</span>
                      <div><strong>{t.discoveryNotes}</strong></div>
                    </div>
                    <textarea
                      value={discNotes}
                      onChange={e => setDiscNotes(e.target.value)}
                      rows={3}
                      placeholder={t.discoveryNotesPlaceholder}
                    />
                  </label>
                </div>

                <div className="discovery-actions">
                  <button className="secondary-button" onClick={handleSaveDiscovery}>{t.saveDiscovery}</button>
                  <button
                    className="primary-button"
                    onClick={handleConfirmDiscovery}
                    disabled={answeredCount < 3}
                  >
                    <CheckCircle2 size={16} />
                    {t.confirmRequirements}
                  </button>
                </div>
              </section>
            )}

            {/* AI ASSISTANT — redesigned clear flow */}
            {workspaceTab === 'ai' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectAi}</div>
                    <h1>{t.aiTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.aiSubtitle}</p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                <div className="ai-steps-bar">
                  <div className="ai-step-chip">{t.aiStep1}</div>
                  <div className="ai-step-chip">{t.aiStep2}</div>
                  <div className="ai-step-chip">{t.aiStep3}</div>
                </div>

                {answeredCount === 0 && (
                  <div className="ai-warn">
                    <AlertTriangle size={16} />
                    <span>{t.noDiscoveryWarn}</span>
                  </div>
                )}

                {/* Step 1: pick help */}
                <div className="ai-block">
                  <h3 className="ai-block-title">{t.aiPickHelp}</h3>
                  <div className="help-grid">
                    {PROMPT_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        className={`help-card ${selectedTemplate === tpl.id && !customPrompt ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedTemplate(tpl.id)
                          setCustomPrompt('')
                          setGeneratedPrompt(buildPromptFromTemplate(tpl.id, activeProject, t, isFa))
                          setCopied(false)
                        }}
                      >
                        <strong>{t[tpl.titleKey as keyof TranslationKeys]}</strong>
                        <span>{t[tpl.descriptionKey as keyof TranslationKeys]}</span>
                      </button>
                    ))}
                  </div>

                  <label className="ai-custom" style={{ marginTop: 14 }}>
                    <span>{t.customPrompt}</span>
                    <textarea
                      value={customPrompt}
                      onChange={e => {
                        setCustomPrompt(e.target.value)
                        setGeneratedPrompt('')
                        setCopied(false)
                      }}
                      rows={2}
                      placeholder={t.customPromptPlaceholder}
                    />
                  </label>
                  {customPrompt.trim() && (
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ marginTop: 8 }}
                      onClick={() => {
                        const ctx = buildProjectContext(activeProject, t, isFa)
                        const header = isFa
                          ? 'تو یک مشاور حرفه‌ای طراحی و توسعه وب‌سایت هستی. بر اساس اطلاعات پروژه زیر پاسخ بده.\n\n'
                          : 'You are a professional website design and development consultant. Answer based on the project information below.\n\n'
                        setGeneratedPrompt(`${header}${ctx}\n\n---\n\n${customPrompt.trim()}`)
                        setCopied(false)
                      }}
                    >
                      {t.buildPrompt}
                    </button>
                  )}
                </div>

                {/* Step 2: ready prompt */}
                <div className="ai-block">
                  <h3 className="ai-block-title">{t.aiReadyPrompt}</h3>
                  {!generatedPrompt ? (
                    <p className="ai-empty-hint">{t.aiEmptyPick}</p>
                  ) : (
                    <>
                      <p className="ai-hint">{t.aiUseInTool}</p>
                      <pre className="prompt-preview">{generatedPrompt}</pre>
                      <button type="button" className="primary-button" style={{ marginTop: 12 }} onClick={handleCopyPrompt}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? t.promptCopied : t.copyPrompt}
                      </button>
                    </>
                  )}
                </div>

                {/* Step 3: paste answer */}
                <div className="ai-block">
                  <h3 className="ai-block-title">{t.pasteResponse}</h3>
                  <textarea
                    className="paste-area"
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    rows={6}
                    placeholder={t.pastePlaceholder}
                  />
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSaveResponse}
                    disabled={!pasteText.trim()}
                    style={{ marginTop: 10 }}
                  >
                    {t.saveResponse}
                  </button>
                </div>

                {/* Saved answers */}
                <div className="ai-block">
                  <div className="ai-history-header">
                    <h3 className="ai-block-title" style={{ margin: 0 }}>{t.aiHistory}</h3>
                    {aiMessages.length > 0 && (
                      <button type="button" className="text-button" onClick={handleClearHistory}>{t.clearHistory}</button>
                    )}
                  </div>
                  {aiMessages.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: 12 }}>
                      <div className="empty-icon"><MessageSquare size={22} /></div>
                      <strong>{t.aiNoHistory}</strong>
                    </div>
                  ) : (
                    <div className="ai-messages">
                      {[...aiMessages].reverse().map(msg => (
                        <div key={msg.id} className={`ai-msg ai-msg-${msg.role}`}>
                          <div className="ai-msg-head">
                            <span className="ai-msg-role">
                              {msg.role === 'user' ? t.aiPromptLabel : t.aiResultLabel}
                              {msg.label ? ` · ${msg.label}` : ''}
                            </span>
                            <button type="button" className="delete-button" onClick={() => handleDeleteMessage(msg.id)} title={t.deleteMessage}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <pre className="ai-msg-body">{msg.content}</pre>
                          <small className="ai-msg-time">
                            {new Date(msg.createdAt).toLocaleString(isFa ? 'fa-IR' : 'en-US')}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            
            {/* FILES */}
            {workspaceTab === 'files' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectFiles}</div>
                    <h1>{t.filesTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.filesSubtitle}</p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                <div className="files-toolbar">
                  <input
                    type="text"
                    value={newPath}
                    onChange={e => setNewPath(e.target.value)}
                    placeholder={t.fileNamePlaceholder}
                    className="files-path-input"
                  />
                  <button type="button" className="secondary-button" onClick={() => handleCreateFile('file')}>
                    <FilePlus2 size={16} />{t.createFile}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => handleCreateFile('folder')}>
                    <FolderPlus size={16} />{t.createFolder}
                  </button>
                  <button type="button" className="secondary-button" onClick={handleSeedStarter} title={t.seedStarterDesc}>
                    {t.seedStarter}
                  </button>
                </div>
                {fileError && <div className="form-error" style={{ marginBottom: 12 }}>{fileError}</div>}

                <div className="files-layout">
                  <div className="files-tree">
                    <h3>{t.fileTree}</h3>
                    {getFiles().length === 0 ? (
                      <div className="empty-state" style={{ marginTop: 12 }}>
                        <div className="empty-icon"><FileCode2 size={22} /></div>
                        <strong>{t.noFiles}</strong>
                      </div>
                    ) : (
                      <ul className="file-list">
                        {getFiles().map(f => (
                          <li key={f.id} className={`file-row ${selectedFileId === f.id ? 'active' : ''}`}>
                            <button
                              type="button"
                              className="file-open"
                              onClick={() => handleSelectFile(f)}
                              disabled={f.kind === 'folder'}
                            >
                              {f.kind === 'folder' ? '📁' : '📄'} {f.path}
                            </button>
                            <button type="button" className="delete-button" onClick={() => handleDeleteFile(f.id)} title={t.deleteFile}>
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="files-editor">
                    {!selectedFileId ? (
                      <div className="empty-state">
                        <div className="empty-icon"><FileCode2 size={22} /></div>
                        <strong>{t.emptyEditor}</strong>
                      </div>
                    ) : (
                      <>
                        <div className="editor-bar">
                          <span className="editor-path">
                            {getFiles().find(f => f.id === selectedFileId)?.path}
                            {editorDirty ? ` · ${t.unsaved}` : ''}
                          </span>
                          <button type="button" className="primary-button" onClick={handleSaveFile} disabled={!editorDirty}>
                            {t.saveFile}
                          </button>
                        </div>
                        <textarea
                          className="code-editor"
                          value={editorContent}
                          onChange={e => { setEditorContent(e.target.value); setEditorDirty(true) }}
                          spellCheck={false}
                        />
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}

            
            {/* PREVIEW & QA */}
            {workspaceTab === 'preview' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectPreview}</div>
                    <h1>{t.previewTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.previewSubtitle}</p>
                  </div>
                </div>

                <div className="preview-toolbar">
                  <span className="preview-label">{t.previewViewport}</span>
                  <div className="segmented">
                    <button type="button" className={viewport === 'desktop' ? 'selected' : ''} onClick={() => setViewport('desktop')}>
                      <Monitor size={14} /> {t.viewportDesktop}
                    </button>
                    <button type="button" className={viewport === 'tablet' ? 'selected' : ''} onClick={() => setViewport('tablet')}>
                      <Tablet size={14} /> {t.viewportTablet}
                    </button>
                    <button type="button" className={viewport === 'mobile' ? 'selected' : ''} onClick={() => setViewport('mobile')}>
                      <Smartphone size={14} /> {t.viewportMobile}
                    </button>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => setPreviewKey(k => k + 1)}>
                    {t.refreshPreview}
                  </button>
                </div>
                <p className="ai-hint">{t.previewSandboxNote}</p>

                {(() => {
                  const html = buildPreviewHtml(getFiles())
                  if (!html) {
                    return (
                      <div className="empty-state" style={{ marginTop: 16 }}>
                        <div className="empty-icon"><Eye size={22} /></div>
                        <strong>{t.noHtmlPreview}</strong>
                      </div>
                    )
                  }
                  const width = viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : '100%'
                  return (
                    <div className="preview-frame-wrap">
                      <iframe
                        key={previewKey}
                        title="preview"
                        className="preview-frame"
                        style={{ width }}
                        sandbox="allow-scripts"
                        srcDoc={html}
                      />
                    </div>
                  )
                })()}

                <div className="ai-block" style={{ marginTop: 28 }}>
                  <h3 className="ai-block-title">{t.qaTitle}</h3>
                  <p className="ai-hint">{t.qaSubtitle}</p>
                  <div className="qa-progress">
                    {t.qaProgress}: {QA_KEYS.filter(k => qaChecks[k]).length} / {QA_KEYS.length}
                  </div>
                  <div className="qa-list">
                    {QA_KEYS.map(key => (
                      <label key={key} className={`qa-item ${qaChecks[key] ? 'done' : ''}`}>
                        <input
                          type="checkbox"
                          checked={Boolean(qaChecks[key])}
                          onChange={() => handleToggleQa(key)}
                        />
                        <span>{t[key]}</span>
                        <small>{qaChecks[key] ? t.qa_done : t.qa_todo}</small>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TASKS */}
            {workspaceTab === 'tasks' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectTasks}</div>
                    <h1>{t.projectTasks}</h1>
                    <p style={{ color: 'var(--muted)' }}>{doneCount} / {tasks.length} {t.tasksCompleted}</p>
                  </div>
                </div>
                <div className="task-add-row">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder={t.taskPlaceholder}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTask() }}
                  />
                  <button className="primary-button" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                    <Plus size={16} />{t.addTask}
                  </button>
                </div>
                {tasks.length === 0 ? (
                  <div className="empty-state" style={{ marginTop: 32 }}>
                    <div className="empty-icon"><ListTodo size={25} /></div>
                    <strong>{t.noTasks}</strong>
                  </div>
                ) : (
                  <div className="task-list">
                    {tasks.map(task => (
                      <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                        <button className="task-check" onClick={() => handleToggleTask(task.id)}>
                          {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <span className="task-title">{task.title}</span>
                        <button className="delete-button" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* SETTINGS */}
            {workspaceTab === 'settings' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectSettings}</div>
                    <h1>{t.editProject}</h1>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>
                <div className="settings-form">
                  <label>
                    <span>{t.projectName}</span>
                    <input value={editName} onChange={e => setEditName(e.target.value)} />
                  </label>
                  <label>
                    <span>{t.description}</span>
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
                  </label>
                  <label>
                    <span>{t.projectType}</span>
                    <select value={editType} onChange={e => setEditType(e.target.value as ProjectType)}>
                      {projectTypes.map(pt => <option key={pt} value={pt}>{t[pt]}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{t.stage}</span>
                    <select value={editStage} onChange={e => setEditStage(e.target.value as ProjectStage)}>
                      {stages.map(s => <option key={s} value={s}>{t[s]}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{t.status}</span>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value as ProjectStatus)}>
                      {statuses.map(s => (
                        <option key={s} value={s}>
                          {t[`status${s.charAt(0).toUpperCase() + s.slice(1)}` as keyof TranslationKeys]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
                    <button className="primary-button" onClick={handleSaveProject}>{t.saveChanges}</button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    )
  }

  // ========== MAIN DASHBOARD (same as before) ==========
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><WandSparkles size={21} /></div>
          <div>
            <div className="brand-name">{t.brand}</div>
            <div className="brand-caption">WEBSITE CREATION STUDIO</div>
          </div>
        </div>
        <button className="new-project-button" onClick={() => setShowCreate(true)}>
          <Plus size={18} />{t.newProject}
        </button>
        <div className="nav-label">{isFa ? 'فضای کاری' : 'WORKSPACE'}</div>
        <nav className="nav-list">
          {nav.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
                <Icon size={18} /><span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={18} />
            <strong>{isFa ? 'همراه ساخت وب‌سایتت' : 'Your website co-pilot'}</strong>
            <p>{isFa ? 'ایده‌هایت را به قدم‌های روشن و قابل اجرا تبدیل کن.' : 'Turn your ideas into clear, actionable steps.'}</p>
          </div>
          <div className="user-chip">
            <div className="avatar">R</div>
            <div>
              <strong>{isFa ? 'فضای شخصی' : 'Personal workspace'}</strong>
              <small>{t.versionLabel}</small>
            </div>
            <PanelLeftClose size={17} className="muted-icon" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            {t.brand}<span>/</span>
            <strong>{nav.find(n => n.id === activePage)?.label}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button" title={t.language} onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}>
              <Languages size={18} /><span>{language === 'fa' ? 'EN' : 'فا'}</span>
            </button>
            <button className="icon-button" title={t.theme} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="status-pill">
              <span className="status-dot" />
              {isFa ? 'ذخیره محلی فعال' : 'Local save active'}
            </div>
          </div>
        </header>

        {storageError && (
          <div className="storage-error-banner" role="alert">
            <AlertTriangle size={16} />
            <span>{t.storageError}</span>
            <button onClick={() => setStorageError(null)}>×</button>
          </div>
        )}

        <div className="content">
          {activePage === 'overview' && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow"><Sparkles size={15} />{isFa ? 'فضای ساخت وب‌سایت با هوش مصنوعی' : 'AI-ASSISTED WEBSITE WORKSPACE'}</div>
                  <h1>{t.welcome}</h1>
                  <p>{t.welcomeText}</p>
                  <button className="primary-button" onClick={() => setShowCreate(true)}>
                    {t.startHere}<ArrowUpLeft size={17} />
                  </button>
                </div>
                <div className="hero-art">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="art-core"><WandSparkles size={38} /></div>
                  <div className="float-card float-top"><Layers3 size={17} /><span>{isFa ? 'معماری پروژه' : 'Project architecture'}</span></div>
                  <div className="float-card float-bottom"><Code2 size={17} /><span>{isFa ? 'توسعه گام‌به‌گام' : 'Step-by-step build'}</span></div>
                </div>
              </section>
              <section className="stats-grid">
                <div className="stat-card"><span>{t.projectCount}</span><strong>{projects.length.toLocaleString(isFa ? 'fa-IR' : 'en-US')}</strong><small>{isFa ? 'در فضای کاری فعلی' : 'In this workspace'}</small></div>
                <div className="stat-card"><span>{isFa ? 'روش کار' : 'Workflow'}</span><strong>{isFa ? 'ترکیبی' : 'Hybrid'}</strong><small>{isFa ? 'راهنمایی + کنترل حرفه‌ای' : 'Guidance + advanced control'}</small></div>
                <div className="stat-card"><span>{isFa ? 'حریم خصوصی' : 'Privacy'}</span><strong>{isFa ? 'محلی' : 'Local'}</strong><small>{isFa ? 'بدون حساب کاربری اجباری' : 'No account required'}</small></div>
              </section>
              <section className="section-block">
                <div className="section-heading"><div><h2>{t.howItWorks}</h2><p>{isFa ? 'مسیر کلی که هر پروژه طی خواهد کرد' : 'The high-level path every project follows'}</p></div></div>
                <div className="steps-grid">
                  {[
                    { n: '01', title: t.step1, icon: Compass },
                    { n: '02', title: t.step2, icon: Layers3 },
                    { n: '03', title: t.step3, icon: Code2 },
                    { n: '04', title: t.step4, icon: Rocket },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div className="step-card" key={s.n}>
                        <div className="step-top"><span>{s.n}</span><Icon size={19} /></div>
                        <strong>{s.title}</strong>
                      </div>
                    )
                  })}
                </div>
              </section>
              <section className="section-block">
                <div className="section-heading">
                  <div><h2>{t.activeProjects}</h2><p>{isFa ? 'به پروژه‌های در حال ساختت دسترسی داشته باش' : 'Pick up where you left off'}</p></div>
                  <button className="text-button" onClick={() => setActivePage('projects')}>{isFa ? 'مشاهده همه' : 'View all'} <ArrowUpLeft size={15} /></button>
                </div>
                {projects.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><FolderKanban size={25} /></div>
                    <strong>{t.noProjects}</strong>
                    <button className="secondary-button" onClick={() => setShowCreate(true)}>{t.createFirst}</button>
                  </div>
                ) : (
                  <div className="project-grid">
                    {projects.slice(0, 4).map(p => (
                      <ProjectCard key={p.id} project={p} t={t} isFa={isFa} onOpen={() => openProject(p)} onDelete={() => requestDelete(p)} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === 'projects' && (
            <section className="page-section">
              <div className="page-title-row">
                <div><div className="eyebrow">{isFa ? 'مدیریت پروژه‌ها' : 'PROJECT MANAGEMENT'}</div><h1>{t.projects}</h1></div>
                <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17} />{t.newProject}</button>
              </div>
              {projects.length > 0 ? (
                <div className="project-grid">
                  {projects.map(p => (
                    <ProjectCard key={p.id} project={p} t={t} isFa={isFa} onOpen={() => openProject(p)} onDelete={() => requestDelete(p)} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon"><FolderKanban size={25} /></div>
                  <strong>{t.noProjects}</strong>
                  <button className="secondary-button" onClick={() => setShowCreate(true)}>{t.createFirst}</button>
                </div>
              )}
            </section>
          )}

          {activePage === 'guide' && (
            <section className="page-section">
              <div className="eyebrow">{isFa ? 'شروع سریع' : 'QUICK START'}</div>
              <h1>{t.guide}</h1>
              <p>{t.modeText}</p>
              <div className="guide-list">
                {[t.step1, t.step2, t.step3, t.step4].map((s, i) => (
                  <div className="guide-row" key={s}>
                    <span>0{i + 1}</span>
                    <strong>{s}</strong>
                    <small>{isFa ? 'در فازهای بعدی فعال می‌شود' : 'Will be enabled in upcoming phases'}</small>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activePage === 'settings' && (
            <section className="page-section">
              <div className="eyebrow">{isFa ? 'شخصی‌سازی' : 'PERSONALIZATION'}</div>
              <h1>{t.settings}</h1>
              <div className="settings-panel">
                <div><strong>{t.language}</strong><p>{isFa ? 'زبان و جهت نمایش محیط' : 'Interface language and direction'}</p></div>
                <div className="segmented">
                  <button className={language === 'fa' ? 'selected' : ''} onClick={() => setLanguage('fa')}>فارسی</button>
                  <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}>English</button>
                </div>
              </div>
              <div className="settings-panel">
                <div><strong>{t.theme}</strong><p>{isFa ? 'حالت نمایش دلخواهت را انتخاب کن' : 'Choose your preferred appearance'}</p></div>
                <div className="segmented">
                  <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}>{t.light}</button>
                  <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}>{t.dark}</button>
                </div>
              </div>
              <div className="settings-panel">
                <div><strong>{isFa ? 'نسخه و ذخیره‌سازی' : 'Version & storage'}</strong><p>{t.localNotice}</p></div>
                <div style={{ textAlign: isFa ? 'left' : 'right', color: 'var(--muted)', fontSize: 13 }}>
                  <div>{t.versionLabel}</div>
                  <div>{storageInfo.backend}</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {showCreate && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
          <section className="modal" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div><div className="eyebrow">{isFa ? 'شروع جدید' : 'NEW START'}</div><h2>{t.newProject}</h2></div>
              <button className="icon-button" onClick={() => setShowCreate(false)}><X size={19} /></button>
            </div>
            <label><span>{t.projectName}</span><input value={name} onChange={e => setName(e.target.value)} placeholder={isFa ? 'مثلاً فروشگاه شخصی' : 'e.g. Personal store'} /></label>
            <label>
              <span>{t.projectType}</span>
              <select value={type} onChange={e => setType(e.target.value as ProjectType)}>
                {projectTypes.map(pt => <option key={pt} value={pt}>{t[pt]}</option>)}
              </select>
            </label>
            <label><span>{t.description}</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} /></label>
            {formError && <div className="form-error">{formError}</div>}
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setShowCreate(false)}>{t.cancel}</button>
              <button className="primary-button" onClick={handleCreate}>{t.create}</button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <section className="modal modal-danger" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <div className="eyebrow" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginInlineEnd: 4 }} />
                  {isFa ? 'عملیات غیرقابل بازگشت' : 'IRREVERSIBLE ACTION'}
                </div>
                <h2>{t.confirmDeleteTitle}</h2>
              </div>
              <button className="icon-button" onClick={() => setDeleteTarget(null)}><X size={19} /></button>
            </div>
            <p style={{ margin: '12px 0 20px', lineHeight: 1.6, color: 'var(--muted)' }}>{t.confirmDeleteMessage}</p>
            <p style={{ marginBottom: 20, fontWeight: 600 }}>«{deleteTarget.name}»</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setDeleteTarget(null)}>{t.cancel}</button>
              <button className="danger-button" onClick={confirmDelete}><Trash2 size={16} />{t.confirmDeleteButton}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project, t, isFa, onOpen, onDelete }: {
  project: Project; t: TranslationKeys; isFa: boolean; onOpen: () => void; onDelete: () => void
}) {
  const stageLabel = t[project.stage] || t.discovery
  const taskCount = project.tasks?.length || 0
  const doneCount = project.tasks?.filter(tk => tk.done).length || 0
  const discCount = project.discovery?.answers?.length || 0
  const aiCount = project.ai?.messages?.length || 0

  return (
    <article className="project-card" onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div className="project-card-top">
        <div className="project-icon"><FolderKanban size={19} /></div>
        <button className="delete-button" title={t.delete} onClick={e => { e.stopPropagation(); onDelete() }}>
          <Trash2 size={16} />
        </button>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description || t[project.type]}</p>
      <div className="project-card-footer">
        <span className="stage-tag">{stageLabel}</span>
        {discCount > 0 && <small style={{ marginInlineEnd: 6 }}>{discCount}Q</small>}
        {aiCount > 0 && <small style={{ marginInlineEnd: 6 }}>AI:{aiCount}</small>}
        {taskCount > 0 && <small style={{ marginInlineEnd: 8 }}>{doneCount}/{taskCount}</small>}
        <small>{new Date(project.updatedAt || project.createdAt).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</small>
      </div>
    </article>
  )
}
