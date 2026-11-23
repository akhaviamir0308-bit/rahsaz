import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Compass, FolderKanban, Settings, Plus, Sun, Moon,
  Languages, Sparkles, ArrowUpLeft, Trash2, X, Layers3,
  WandSparkles, Code2, Rocket, PanelLeftClose, AlertTriangle,
  CheckCircle2, Circle, ListTodo, Info, ChevronLeft, ClipboardList,
  Bot, Copy, Check, MessageSquare, FileCode2, FolderPlus, FilePlus2, Eye,
  History, FlaskConical, RotateCcw, Upload, Download, GraduationCap, HelpCircle, ArrowLeft, FileText
} from 'lucide-react'
import type {
  Language, Project, ProjectType, ProjectStage, ProjectStatus,
  Theme, Task, DiscoveryData, DiscoveryAnswer, AiData, AiMessage, FilesData, ProjectFile, QaData,
  TestReport, TestCheck, VersionsData, VersionSnapshot
} from './types'
import {
  getTranslations, type TranslationKeys, DISCOVERY_QUESTIONS, PROMPT_TEMPLATES
} from './data/translations'

import {
  QA_KEYS,
  TAB_HELP,
  buildProjectContext,
  buildPromptFromTemplate,
  computeNextStep,
  type WorkspaceTab,
} from './lib/workspaceMeta'
import {
  loadProjects, createProject as storageCreate,
  deleteProject as storageDelete, updateProject as storageUpdate, storageInfo,
  importProject as storageImport, storageUsage,
} from './storage'
import { buildZip, downloadBlob } from './zip'
import { uid, lsGet, lsSet } from './uid'
import PreviewPane from './components/PreviewPane'
import { findBrokenRefs, listPages } from './preview'
import LearnView from './components/LearnView'
import { ProjectCard } from './components/ProjectCard'
import type { ActionId } from './data/learn'
import { buildDemo, buildControlDocs } from './data/demo'

const projectTypes: ProjectType[] = [
  'portfolio', 'business', 'store', 'education',
  'blog', 'booking', 'community', 'webapp'
]
const stages: ProjectStage[] = [
  'discovery', 'planning', 'design', 'development', 'testing', 'published'
]
const statuses: ProjectStatus[] = ['active', 'archived', 'completed']

type PageId = 'overview' | 'projects' | 'guide' | 'settings'

/** Build a context block from project + discovery */
export default function App() {
  const [language, setLanguage] = useState<Language>(
    () => (lsGet('rahsaz.language') === 'en' ? 'en' : 'fa')
  )
  const [theme, setTheme] = useState<Theme>(
    () => (lsGet('rahsaz.theme') === 'light' ? 'light' : 'dark')
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
  const [previewKey, setPreviewKey] = useState(0)
  const [qaChecks, setQaChecks] = useState<Record<string, boolean>>({})
  const [snapLabel, setSnapLabel] = useState('')
  const [snapNote, setSnapNote] = useState('')
  const [importMsg, setImportMsg] = useState('')
  const [learnLesson, setLearnLesson] = useState<string | undefined>(undefined)

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
    lsSet('rahsaz.language', language)
  }, [language, isFa])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    lsSet('rahsaz.theme', theme)
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
    setPreviewKey(k => k + 1)
    const qc: Record<string, boolean> = {}
    if (project.qa?.checks) {
      for (const [k, v] of Object.entries(project.qa.checks)) qc[k] = Boolean(v)
    }
    setQaChecks(qc)
    setSnapLabel('')
    setSnapNote('')
  }, [])

  const closeProject = useCallback(() => {
    if (editorDirty && !window.confirm(t.confirmDiscardEdits)) return
    setEditorDirty(false)
    setActiveProjectId(null)
    setActivePage('projects')
  }, [editorDirty, t])

  useEffect(() => {
    if (!editorDirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [editorDirty])

  // Esc closes modals
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setShowCreate(false); setDeleteTarget(null) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const handleCreate = useCallback(() => {
    setFormError('')
    const result = storageCreate({ name, type, description, language }, projects)
    if (!result.ok) {
      if (result.error === 'EMPTY_NAME') setFormError(t.emptyName)
      else { setFormError(t.storageError); setStorageError(result.error) }
      return
    }
    setProjects(result.data)
    setName(''); setDescription(''); setType('portfolio'); setShowCreate(false)
    const created = result.data[0]
    if (created) openProject(created)
  }, [name, type, description, language, projects, t, openProject])

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
      if (result.error === 'EMPTY_NAME') { setSaveMessage(t.emptyName); setTimeout(() => setSaveMessage(''), 2500) }
      else setStorageError(result.error)
    }
  }, [activeProject, editName, editDesc, editType, editStage, editStatus, projects, t])

  const handleAddTask = useCallback(() => {
    if (!activeProject || !newTaskTitle.trim()) return
    const task: Task = { id: uid(), title: newTaskTitle.trim(), done: false, createdAt: new Date().toISOString() }
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
          id: uid(),
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
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
      ta.remove()
    }
  }, [generatedPrompt, handleBuildPrompt, activeProject, selectedTemplate, customPrompt, t, isFa, projects])

  const handleSaveResponse = useCallback(() => {
    if (!activeProject || !pasteText.trim()) return
    const msg: AiMessage = {
      id: uid(),
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

  const persistFiles = useCallback((files: ProjectFile[]): boolean => {
    if (!activeProject) return false
    const data: FilesData = { files, updatedAt: new Date().toISOString() }
    const result = storageUpdate(activeProject.id, { files: data }, projects)
    if (result.ok) { setProjects(result.data); return true }
    setStorageError(result.error)
    return false
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
    // a path cannot be both a file and a folder prefix
    const segs = path.split('/')
    const parents = segs.slice(0, -1).map((_, i) => segs.slice(0, i + 1).join('/'))
    if (parents.some(pp => files.some(f => f.path === pp && f.kind === 'file')) ||
        files.some(f => f.path.startsWith(path + '/') && kind === 'file')) {
      setFileError(t.pathExists)
      return
    }
    if (/[<>:"|?*\x00-\x1f]/.test(path) || path.endsWith('/') || segs.some(sg => sg === '.' || sg === '')) {
      setFileError(t.invalidPath)
      return
    }
    const now = new Date().toISOString()
    const entry: ProjectFile = {
      id: uid(),
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
    if (editorDirty && file.id !== selectedFileId && !window.confirm(t.confirmDiscardEdits)) return
    setSelectedFileId(file.id)
    setEditorContent(file.content || '')
    setEditorDirty(false)
    setFileError('')
  }, [editorDirty, selectedFileId, t])

  const handleSaveFile = useCallback(() => {
    if (!activeProject || !selectedFileId) return
    const files = getFiles().map(f =>
      f.id === selectedFileId
        ? { ...f, content: editorContent, updatedAt: new Date().toISOString() }
        : f
    )
    if (!persistFiles(files)) return
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
    const safeName = activeProject.name.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string))
    const lang = activeProject.language || language
    const mk = (path: string, content: string): ProjectFile => ({ id: uid(), path, kind: 'file', content, updatedAt: now })
    const starters: ProjectFile[] = [
      mk('index.html', `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'fa' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>${safeName}</h1>
    <p>${lang === 'fa' ? 'شروع پروژه' : 'Project starter'}</p>
  </main>
  <script src="main.js"></script>
</body>
</html>
`),
      mk('styles.css', `* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
main { padding: 2rem; }
`),
      mk('main.js', `console.log("Rahsaz starter");
`),
      mk('README.md', `# ${activeProject.name}

Created with Rahsaz.
`),
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


  const runFileTests = useCallback((): TestReport => {
    const files = getFiles().filter(f => f.kind === 'file')
    const checks: TestCheck[] = []
    const hasIndex = files.some(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
    checks.push({
      id: 'hasIndex',
      labelKey: 'tc_hasIndex',
      ok: hasIndex,
      detail: hasIndex ? 'tc_hasIndex_ok' : 'tc_hasIndex_fail',
    })
    const emptyFiles = files.filter(f => (f.content || '').trim() === '')
    checks.push({
      id: 'notEmpty',
      labelKey: 'tc_notEmpty',
      ok: emptyFiles.length === 0,
      detail: emptyFiles.length === 0 ? 'tc_notEmpty_ok' : 'tc_notEmpty_fail',
    })
    const hasCss = files.some(f => f.path.endsWith('.css'))
    checks.push({
      id: 'hasCss',
      labelKey: 'tc_hasCss',
      ok: hasCss,
      detail: hasCss ? 'tc_hasCss_ok' : 'tc_hasCss_fail',
    })
    const pages = listPages(getFiles())
    if (pages.length > 0) {
      const all = getFiles()
      const missing = [...new Set(pages.flatMap(pg => findBrokenRefs(all, pg)))]
      const critical = missing.filter(r => !/\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|mp4|webm|mp3|pdf)$/i.test(r.replace(/[?#].*$/, '')))
      checks.push({
        id: 'brokenRefs',
        labelKey: 'tc_brokenRefs',
        ok: critical.length === 0,
        detail: critical.length === 0 ? 'tc_brokenRefs_ok' : critical.slice(0, 5).join(', '),
      })
    }
    checks.push({
      id: 'fileCount',
      labelKey: 'tc_fileCount',
      ok: files.length > 0,
      detail: String(files.length),
    })
    return { checks, ranAt: new Date().toISOString() }
  }, [getFiles])

  const handleRunTests = useCallback(() => {
    if (!activeProject) return
    const report = runFileTests()
    const result = storageUpdate(activeProject.id, { testReport: report }, projects)
    if (result.ok) {
      setProjects(result.data)
      setSaveMessage(t.testsTitle)
      setTimeout(() => setSaveMessage(''), 2000)
    } else setStorageError(result.error)
  }, [activeProject, runFileTests, projects, t])

  const handleCreateSnapshot = useCallback(() => {
    if (!activeProject) return
    const label = snapLabel.trim() || new Date().toLocaleString()
    const snap: VersionSnapshot = {
      id: uid(),
      label,
      note: snapNote.trim(),
      createdAt: new Date().toISOString(),
      files: getFiles().map(f => ({ ...f, content: f.content })),
      stage: activeProject.stage,
    }
    const prev = activeProject.versions?.snapshots || []
    const versions: VersionsData = {
      snapshots: [snap, ...prev].slice(0, 20),
      updatedAt: new Date().toISOString(),
    }
    const result = storageUpdate(activeProject.id, { versions }, projects)
    if (result.ok) {
      setProjects(result.data)
      setSnapLabel('')
      setSnapNote('')
      setSaveMessage(t.snapshotSaved)
      setTimeout(() => setSaveMessage(''), 2000)
    } else setStorageError(result.error)
  }, [activeProject, snapLabel, snapNote, getFiles, projects, t])

  const handleRestoreSnapshot = useCallback((snap: VersionSnapshot) => {
    if (!activeProject) return
    if (!window.confirm(t.confirmRestore)) return
    // safety net: keep the current state as a snapshot so a restore can itself be undone
    const backup: VersionSnapshot = {
      id: uid(), label: (isFa ? 'پیش از بازیابی — ' : 'Before restore — ') + new Date().toLocaleString(isFa ? 'fa-IR' : 'en-US'),
      note: '', createdAt: new Date().toISOString(), files: getFiles().map(f => ({ ...f })), stage: activeProject.stage,
    }
    const keep = [backup, ...(activeProject.versions?.snapshots || [])].slice(0, 20)
    const filesData: FilesData = {
      files: snap.files.map(f => ({ ...f })),
      updatedAt: new Date().toISOString(),
    }
    const result = storageUpdate(
      activeProject.id,
      { files: filesData, stage: snap.stage, versions: { snapshots: keep, updatedAt: new Date().toISOString() } },
      projects
    )
    if (result.ok) {
      setProjects(result.data)
      setSelectedFileId(null)
      setEditorContent('')
      setEditorDirty(false)
      setEditStage(snap.stage)
      setPreviewKey(k => k + 1)
      setSaveMessage(t.snapshotRestored)
      setTimeout(() => setSaveMessage(''), 2500)
    } else setStorageError(result.error)
  }, [activeProject, projects, t, isFa, getFiles])

  const handleDeleteSnapshot = useCallback((id: string) => {
    if (!activeProject) return
    if (!window.confirm(t.confirmDeleteSnapshot)) return
    const prev = activeProject.versions?.snapshots || []
    const versions: VersionsData = {
      snapshots: prev.filter(s => s.id !== id),
      updatedAt: new Date().toISOString(),
    }
    const result = storageUpdate(activeProject.id, { versions }, projects)
    if (result.ok) setProjects(result.data)
    else setStorageError(result.error)
  }, [activeProject, projects, t])


  const handleExportZip = useCallback(() => {
    if (!activeProject) return
    const files = getFiles().filter(f => f.kind === 'file')
    if (files.length === 0) {
      setFileError(t.noFilesExport)
      return
    }
    const blob = buildZip(files.map(f => ({ path: f.path, content: f.content || '' })))
    const safe = activeProject.name.replace(/[^\w\u0600-\u06FF\-]+/g, '_').slice(0, 40) || 'project'
    downloadBlob(safe + '.zip', blob)
    setSaveMessage(t.exportDone)
    setTimeout(() => setSaveMessage(''), 2000)
  }, [activeProject, getFiles, t])

  const handleExportBackup = useCallback(() => {
    if (!activeProject) return
    const json = JSON.stringify(activeProject, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const safe = activeProject.name.replace(/[^\w\u0600-\u06FF\-]+/g, '_').slice(0, 40) || 'project'
    downloadBlob(safe + '-backup.json', blob)
    setSaveMessage(t.exportDone)
    setTimeout(() => setSaveMessage(''), 2000)
  }, [activeProject, t])

  const handleMarkPublished = useCallback(() => {
    if (!activeProject) return
    const result = storageUpdate(activeProject.id, { stage: 'published', status: 'completed' }, projects)
    if (result.ok) {
      setProjects(result.data)
      setEditStage('published')
      setEditStatus('completed')
      setSaveMessage(t.markedPublished)
      setTimeout(() => setSaveMessage(''), 2500)
    } else setStorageError(result.error)
  }, [activeProject, projects, t])

  const handleImportBackup = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const raw = JSON.parse(await file.text())
      const result = storageImport(raw, projects)
      if (!result.ok) { setImportMsg(isFa ? 'فایل پشتیبان معتبر نیست.' : 'Invalid backup file.'); return }
      setProjects(result.data)
      setImportMsg(isFa ? 'پروژه درون‌ریزی شد.' : 'Project imported.')
    } catch {
      setImportMsg(isFa ? 'فایل پشتیبان معتبر نیست.' : 'Invalid backup file.')
    }
    setTimeout(() => setImportMsg(''), 3500)
  }, [projects, isFa])

  const handleControlDocs = useCallback(() => {
    if (!activeProject) return
    const docs = buildControlDocs(activeProject, k => (t[k as keyof TranslationKeys] as string) || k, isFa)
    const now = new Date().toISOString()
    let files = [...getFiles()]
    for (const d of docs) {
      const existing = files.find(f => f.path === d.path)
      if (existing) {
        // never overwrite hand-edited spec/decisions; status is regenerated
        if (d.path === 'docs/status.txt') files = files.map(f => f.id === existing.id ? { ...f, content: d.content, updatedAt: now } : f)
      } else {
        files.push({ id: uid(), path: d.path, kind: 'file', content: d.content, updatedAt: now })
      }
    }
    persistFiles(files.sort((a, b) => a.path.localeCompare(b.path)))
    setSaveMessage(isFa ? 'دفتر کنترل پروژه ساخته شد' : 'Control log created')
    setTimeout(() => setSaveMessage(''), 2500)
  }, [activeProject, getFiles, persistFiles, t, isFa])

  const openTab = useCallback((tab: WorkspaceTab) => {
    const target = activeProject || projects[0]
    if (!target) { setActivePage('projects'); setShowCreate(true); return }
    if (!activeProject) openProject(target)
    setWorkspaceTab(tab)
    window.scrollTo({ top: 0 })
  }, [activeProject, projects, openProject])

  const handleAcademyAction = useCallback((id: ActionId) => {
    if (id === 'newProject') {
      setActiveProjectId(null); setActivePage('projects'); setShowCreate(true); return
    }
    if (id === 'demo') {
      const demo = buildDemo(language)
      const existing = projects.find(p => p.name === demo.name)
      if (existing) { openProject(existing); return }
      const created = storageCreate({ name: demo.name, type: 'portfolio', description: demo.description, language }, projects)
      if (!created.ok) { setStorageError(created.error); return }
      const id0 = created.data[0].id
      const now = new Date().toISOString()
      const upd = storageUpdate(id0, {
        discovery: { answers: demo.answers, notes: demo.notes, confirmed: false, updatedAt: now },
        files: { files: demo.files, updatedAt: now },
        tasks: demo.tasks,
      }, created.data)
      if (!upd.ok) { setStorageError(upd.error); return }
      setProjects(upd.data)
      const proj = upd.data.find(p => p.id === id0)
      if (proj) openProject(proj)
      return
    }
    if (id.startsWith('goto:')) openTab(id.slice(5) as WorkspaceTab)
  }, [language, projects, openProject, openTab])

  const nav = [
    { id: 'overview' as const, label: t.overview, icon: Compass },
    { id: 'projects' as const, label: t.projects, icon: FolderKanban },
    { id: 'guide' as const, label: t.guide, icon: GraduationCap },
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
              { id: 'versions' as const, label: t.projectVersions, icon: History },
              { id: 'publish' as const, label: t.projectPublish, icon: Upload },
              { id: 'tasks' as const, label: t.projectTasks, icon: ListTodo },
              { id: 'settings' as const, label: t.projectSettings, icon: Settings },
              { id: 'learn' as const, label: isFa ? 'آموزش' : 'Academy', icon: GraduationCap },
            ].map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={`nav-item ${workspaceTab === item.id ? 'active' : ''}`}
                  onClick={() => { if (item.id === 'learn') setLearnLesson(undefined); setWorkspaceTab(item.id) }}
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
                  : workspaceTab === 'versions' ? t.projectVersions
                  : workspaceTab === 'publish' ? t.projectPublish
                  : workspaceTab === 'tasks' ? t.projectTasks
                  : workspaceTab === 'learn' ? (isFa ? 'آموزش' : 'Academy')
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
            {workspaceTab !== 'overview' && workspaceTab !== 'learn' && TAB_HELP[workspaceTab] && (
              <details className="tab-help" open={false}>
                <summary><HelpCircle size={16} />{isFa ? 'این بخش چیست و چطور کار می‌کند؟' : 'What is this section and how does it work?'}</summary>
                <div className="tab-help-body">
                  <p style={{ margin: '0 0 10px' }}>{isFa ? TAB_HELP[workspaceTab].fa : TAB_HELP[workspaceTab].en}</p>
                  <button type="button" className="text-button" onClick={() => { setLearnLesson(TAB_HELP[workspaceTab].lesson); setWorkspaceTab('learn') }}>
                    <GraduationCap size={15} />{isFa ? 'آموزش کامل این بخش' : 'Full lesson on this section'}
                  </button>
                </div>
              </details>
            )}

            {workspaceTab === 'learn' && (
              <LearnView lang={language} initialLesson={learnLesson} onAction={handleAcademyAction} />
            )}

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

                {(() => {
                  const ns = computeNextStep(activeProject, QA_KEYS.filter(k => qaChecks[k]).length)
                  return (
                    <div className="next-step">
                      <div>
                        <small>{isFa ? 'قدم بعدی پیشنهادی' : 'SUGGESTED NEXT STEP'}</small>
                        <strong>{isFa ? ns.fa : ns.en}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" className="primary-button" onClick={() => setWorkspaceTab(ns.tab)}>
                          {isFa ? 'برو' : 'Go'}<ArrowLeft size={15} style={{ transform: isFa ? undefined : 'scaleX(-1)' }} />
                        </button>
                        <button type="button" className="secondary-button" onClick={() => { setLearnLesson(undefined); setWorkspaceTab('learn') }}>
                          <GraduationCap size={15} />{isFa ? 'آموزش' : 'Academy'}
                        </button>
                      </div>
                    </div>
                  )
                })()}

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
                  <button type="button" className="secondary-button" onClick={handleControlDocs} title={isFa ? 'ساخت docs/spec.txt، decisions.txt و status.txt از اطلاعات پروژه' : 'Create docs/spec.txt, decisions.txt and status.txt from project data'}>
                    <FileText size={16} />{isFa ? 'دفتر کنترل پروژه' : 'Project control log'}
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
                          onKeyDown={e => {
                            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                              e.preventDefault()
                              if (editorDirty) handleSaveFile()
                            }
                          }}
                          dir="ltr"
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

                <PreviewPane files={getFiles()} dirty={editorDirty} isFa={isFa} resetKey={previewKey} />

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

            
            {/* VERSIONS & TESTS */}
            {workspaceTab === 'versions' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectVersions}</div>
                    <h1>{t.versionsTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.versionsSubtitle}</p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                <div className="ai-block">
                  <div className="page-title-row" style={{ marginBottom: 12 }}>
                    <h3 className="ai-block-title" style={{ margin: 0 }}>{t.testsTitle}</h3>
                    <button type="button" className="primary-button" onClick={handleRunTests}>
                      <FlaskConical size={16} />
                      {t.runTests}
                    </button>
                  </div>
                  {!(activeProject.testReport && activeProject.testReport.checks && activeProject.testReport.checks.length) ? (
                    <p className="ai-hint">{t.noTestsYet}</p>
                  ) : (
                    <div className="qa-list">
                      {activeProject.testReport.checks.map(c => (
                        <div key={c.id} className={'qa-item ' + (c.ok ? 'done' : '')}>
                          <span>{c.ok ? 'OK' : '!'}</span>
                          <span>{t[c.labelKey as keyof TranslationKeys] || c.labelKey}</span>
                          <small>
                            {c.id === 'fileCount'
                              ? c.detail
                              : (t[c.detail as keyof TranslationKeys] || c.detail)}
                            {' · '}
                            {c.ok ? t.testPass : t.testFail}
                          </small>
                        </div>
                      ))}
                      <small className="ai-hint">
                        {new Date(activeProject.testReport.ranAt).toLocaleString(isFa ? 'fa-IR' : 'en-US')}
                      </small>
                    </div>
                  )}
                </div>

                <div className="ai-block">
                  <h3 className="ai-block-title">{t.createSnapshot}</h3>
                  <div className="settings-form">
                    <label>
                      <span>{t.snapshotLabel}</span>
                      <input
                        value={snapLabel}
                        onChange={e => setSnapLabel(e.target.value)}
                        placeholder={t.snapshotLabelPh}
                      />
                    </label>
                    <label>
                      <span>{t.snapshotNote}</span>
                      <input
                        value={snapNote}
                        onChange={e => setSnapNote(e.target.value)}
                      />
                    </label>
                    <button type="button" className="primary-button" onClick={handleCreateSnapshot}>
                      <History size={16} />
                      {t.createSnapshot}
                    </button>
                  </div>
                </div>

                <div className="ai-block">
                  <h3 className="ai-block-title">{t.snapshotsList}</h3>
                  {(activeProject.versions && activeProject.versions.snapshots && activeProject.versions.snapshots.length) ? (
                    <div className="snap-list">
                      {activeProject.versions.snapshots.map(snap => (
                        <div key={snap.id} className="snap-card">
                          <div>
                            <strong>{snap.label}</strong>
                            <p className="ai-hint" style={{ margin: '4px 0' }}>
                              {new Date(snap.createdAt).toLocaleString(isFa ? 'fa-IR' : 'en-US')}
                              {' · '}{t[snap.stage]}
                              {' · '}{snap.files.length} files
                            </p>
                            {snap.note ? <p style={{ margin: 0, fontSize: 13 }}>{snap.note}</p> : null}
                          </div>
                          <div className="snap-actions">
                            <button type="button" className="secondary-button" onClick={() => handleRestoreSnapshot(snap)}>
                              <RotateCcw size={14} />
                              {t.restoreSnapshot}
                            </button>
                            <button type="button" className="delete-button" onClick={() => handleDeleteSnapshot(snap.id)} title={t.deleteSnapshot}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ai-hint">{t.noSnapshots}</p>
                  )}
                </div>
              </section>
            )}


            {/* PUBLISH */}
            {workspaceTab === 'publish' && (
              <section className="page-section">
                <div className="page-title-row">
                  <div>
                    <div className="eyebrow">{t.projectPublish}</div>
                    <h1>{t.publishTitle}</h1>
                    <p style={{ color: 'var(--muted)' }}>{t.publishSubtitle}</p>
                  </div>
                  {saveMessage && <span className="save-toast">{saveMessage}</span>}
                </div>

                {(() => {
                  const files = getFiles().filter(f => f.kind === 'file')
                  const hasIndex = files.some(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
                  const discoveryOk = Boolean(activeProject.discovery?.confirmed)
                  const tests = activeProject.testReport?.checks || []
                  const filesUpdated = activeProject.files?.updatedAt || ''
                  const reportFresh = Boolean(activeProject.testReport) && (activeProject.testReport!.ranAt >= filesUpdated)
                  const criticalOk = reportFresh && tests.length > 0 && tests.filter(c => c.id === 'hasIndex' || c.id === 'notEmpty' || c.id === 'brokenRefs').every(c => c.ok)
                  const qaKeys = ['qa_responsive', 'qa_content', 'qa_links', 'qa_images', 'qa_lang']
                  const qaDone = qaKeys.filter(k => qaChecks[k]).length
                  const qaOk = qaDone >= Math.ceil(qaKeys.length / 2)
                  const items: { key: 'rd_discovery' | 'rd_index' | 'rd_files' | 'rd_tests' | 'rd_qa'; ok: boolean }[] = [
                    { key: 'rd_discovery', ok: discoveryOk },
                    { key: 'rd_index', ok: hasIndex },
                    { key: 'rd_files', ok: files.length > 0 },
                    { key: 'rd_tests', ok: criticalOk },
                    { key: 'rd_qa', ok: qaOk },
                  ]
                  const score = items.filter(i => i.ok).length

                  return (
                    <>
                      <div className="ai-block">
                        <h3 className="ai-block-title">{t.readiness}</h3>
                        <div className="qa-progress">{score} / {items.length}</div>
                        <div className="qa-list">
                          {items.map(item => (
                            <div key={item.key} className={'qa-item ' + (item.ok ? 'done' : '')}>
                              <span>{item.ok ? 'OK' : '!'}</span>
                              <span>{t[item.key]}</span>
                              <small>{item.ok ? t.readyYes : t.readyNo}</small>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ai-block">
                        <h3 className="ai-block-title">{t.publishChecklist}</h3>
                        <div className="discovery-actions">
                          <button type="button" className="primary-button" onClick={handleExportZip}>
                            <Download size={16} />
                            {t.exportZip}
                          </button>
                          <button type="button" className="secondary-button" onClick={handleExportBackup}>
                            <Download size={16} />
                            {t.exportBackup}
                          </button>
                          <button type="button" className="secondary-button" onClick={handleMarkPublished}>
                            <Upload size={16} />
                            {t.markPublished}
                          </button>
                        </div>
                        {fileError ? <div className="form-error" style={{ marginTop: 10 }}>{fileError}</div> : null}
                      </div>

                      <div className="ai-block">
                        <h3 className="ai-block-title">{t.deployGuide}</h3>
                        <p className="ai-hint">{t.deployNote}</p>
                        <div className="req-summary">
                          <div className="req-item">
                            <strong>GitHub Pages</strong>
                            <p>{t.deployGh}</p>
                          </div>
                          <div className="req-item">
                            <strong>Netlify / Cloudflare</strong>
                            <p>{t.deployNetlify}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
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
                  <>
                    <div className="empty-state">
                      <div className="empty-icon"><FolderKanban size={25} /></div>
                      <strong>{t.noProjects}</strong>
                      <button className="secondary-button" onClick={() => setShowCreate(true)}>{t.createFirst}</button>
                    </div>
                    <div className="onboard">
                      <h3><GraduationCap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginInlineEnd: 6 }} />{isFa ? 'اولین بار است؟ از اینجا شروع کنید' : 'First time here? Start here'}</h3>
                      <p>{isFa ? 'آکادمی راه‌ساز همه چیز را از صفر توضیح می‌دهد. یا یک پروژه نمونه آماده (سایت رزومه) بسازید و ابزارها را روی آن امتحان کنید.' : 'The Rahsaz Academy explains everything from zero. Or create a ready sample project (résumé site) and try the tools on it.'}</p>
                      <div className="onboard-actions">
                        <button className="primary-button" onClick={() => { setLearnLesson('what'); setActivePage('guide') }}>{isFa ? 'شروع آموزش' : 'Start the Academy'}</button>
                        <button className="secondary-button" onClick={() => handleAcademyAction('demo')}>{isFa ? 'ساخت پروژه نمونه' : 'Create sample project'}</button>
                      </div>
                    </div>
                  </>
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
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label className="secondary-button" style={{ cursor: 'pointer' }}>
                    <Upload size={16} />{isFa ? 'درون‌ریزی پشتیبان' : 'Import backup'}
                    <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportBackup} />
                  </label>
                  <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17} />{t.newProject}</button>
                </div>
              </div>
              {importMsg && <div className="save-toast" style={{ display: 'inline-block', marginBottom: 14 }}>{importMsg}</div>}
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
            <LearnView lang={language} initialLesson={learnLesson} onAction={handleAcademyAction} />
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
              {(() => {
                const u = storageUsage()
                const pct = Math.min(100, Math.round((u.bytes / u.limit) * 100))
                return (
                  <div className="settings-panel" style={{ display: 'block' }}>
                    <strong>{isFa ? 'فضای ذخیره‌سازی مرورگر' : 'Browser storage used'}</strong>
                    <p>{(u.bytes / 1024).toFixed(0)} KB / ~{(u.limit / 1024 / 1024).toFixed(0)} MB ({pct}%) {pct >= 70 ? (isFa ? '— نزدیک پر شدن است؛ پشتیبان بگیرید و نسخه‌های قدیمی را پاک کنید.' : '— almost full; export a backup and delete old snapshots.') : ''}</p>
                    <div className="discovery-progress-bar" style={{ margin: '6px 0 0', height: 8 }}><div className="discovery-progress-fill" style={{ width: pct + '%' }} /></div>
                  </div>
                )
              })()}
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
            <label><span>{t.projectName}</span><input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreate() }} placeholder={isFa ? 'مثلاً فروشگاه شخصی' : 'e.g. Personal store'} /></label>
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
