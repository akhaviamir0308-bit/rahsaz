/**
 * Persistence layer for RahSaz v0.15.0 (Package B)
 * - localStorage: fast sync cache + legacy migration
 * - IndexedDB: durable store for full project payloads (via idb.ts)
 */

import { uid } from '../uid'
import type {
  Project, StorageResult, Task, DiscoveryData, AiData, AiMessage, FilesData, ProjectFile, QaData,
  TestReport, VersionsData, VersionSnapshot, TestCheck,
  RequirementsData, RequirementItem, ArchitectureData, ActivityEntry, PublishData,
} from '../../shared/types'
import { DATA_SCHEMA_VERSION } from '../../shared/types'
import { idbLoadProjects, idbSaveProjects } from './idb'

const STORAGE_KEY = 'rahsaz.projects.v0150'
const LEGACY_KEYS = [
  'rahsaz.projects.v0110',
  'rahsaz.projects.v0102',
  'rahsaz.projects.v080',
  'rahsaz.projects.v070',
  'rahsaz.projects.v060',
  'rahsaz.projects.v050',
  'rahsaz.projects.v040',
  'rahsaz.projects.v030',
  'rahsaz.projects.v021',
  'rahsaz.projects.v020',
]

function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key)
      if (legacy) {
        const parsed = JSON.parse(legacy)
        if (Array.isArray(parsed)) {
          const migrated = parsed.map(migrateProject)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
          return migrated
        }
      }
    }
    return []
  } catch {
    return []
  }
}

function migrateProject(p: any): Project {
  const now = new Date().toISOString()
  return {
    id: typeof p.id === 'string' ? p.id : uid(),
    name: typeof p.name === 'string' ? p.name : 'Untitled',
    type: p.type || 'portfolio',
    description: typeof p.description === 'string' ? p.description : '',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : (p.createdAt || now),
    stage: p.stage || 'discovery',
    status: p.status || 'active',
    language: p.language === 'en' || p.language === 'fa' ? p.language : undefined,
    skillLevel: p.skillLevel === 'beginner' || p.skillLevel === 'intermediate' || p.skillLevel === 'advanced'
      ? p.skillLevel
      : 'intermediate',
    tasks: Array.isArray(p.tasks) ? p.tasks.map(normalizeTask).filter(Boolean) as Task[] : [],
    discovery: normalizeDiscovery(p.discovery),
    requirements: normalizeRequirements(p.requirements),
    architecture: normalizeArchitecture(p.architecture),
    ai: normalizeAi(p.ai),
    files: normalizeFiles(p.files),
    qa: normalizeQa(p.qa),
    testReport: normalizeTestReport(p.testReport),
    versions: normalizeVersions(p.versions),
    schemaVersion: typeof p.schemaVersion === 'number' ? p.schemaVersion : DATA_SCHEMA_VERSION,
    activity: Array.isArray(p.activity)
      ? p.activity.filter((a: any) => a && typeof a.id === 'string').map((a: any) => ({
          id: a.id,
          at: typeof a.at === 'string' ? a.at : now,
          kind: typeof a.kind === 'string' ? a.kind : 'note',
          message: typeof a.message === 'string' ? a.message : '',
        })) as ActivityEntry[]
      : undefined,
    publish: p.publish && typeof p.publish === 'object'
      ? {
          status: ['not_ready','ready','published'].includes(p.publish.status) ? p.publish.status : 'not_ready',
          target: typeof p.publish.target === 'string' ? p.publish.target : undefined,
          lastPublishedAt: typeof p.publish.lastPublishedAt === 'string' ? p.publish.lastPublishedAt : undefined,
          notes: typeof p.publish.notes === 'string' ? p.publish.notes : undefined,
          updatedAt: typeof p.publish.updatedAt === 'string' ? p.publish.updatedAt : now,
        } as PublishData
      : undefined,
  }
}

function normalizeTask(t: any): Task | null {
  if (!t || typeof t !== 'object' || typeof t.id !== 'string' || typeof t.title !== 'string') return null
  return {
    id: t.id,
    title: t.title,
    done: Boolean(t.done),
    createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
    priority: t.priority === 2 || t.priority === 3 ? t.priority : t.priority === 1 ? 1 : undefined,
    description: typeof t.description === 'string' ? t.description : undefined,
    source: t.source === 'planning' || t.source === 'ai' || t.source === 'manual' ? t.source : undefined,
  }
}

function normalizeDiscovery(d: any): DiscoveryData | undefined {
  if (!d || typeof d !== 'object') return undefined
  return {
    answers: Array.isArray(d.answers)
      ? d.answers.filter((a: any) => a && typeof a.questionId === 'string' && typeof a.value === 'string')
          .map((a: any) => ({ questionId: a.questionId, value: a.value }))
      : [],
    notes: typeof d.notes === 'string' ? d.notes : '',
    confirmed: Boolean(d.confirmed),
    updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString(),
  }
}

function normalizeAiMessage(m: any): AiMessage | null {
  if (!m || typeof m !== 'object' || typeof m.id !== 'string' || typeof m.content !== 'string') return null
  if (m.role !== 'user' && m.role !== 'assistant' && m.role !== 'system') return null
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    label: typeof m.label === 'string' ? m.label : undefined,
    createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date().toISOString(),
  }
}

function normalizeAi(a: any): AiData | undefined {
  if (!a || typeof a !== 'object') return undefined
  return {
    messages: Array.isArray(a.messages)
      ? a.messages.map(normalizeAiMessage).filter(Boolean) as AiMessage[]
      : [],
    updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date().toISOString(),
  }
}

function normalizeFile(f: any): ProjectFile | null {
  if (!f || typeof f !== 'object' || typeof f.id !== 'string' || typeof f.path !== 'string') return null
  if (f.kind !== 'file' && f.kind !== 'folder') return null
  return {
    id: f.id,
    path: f.path.replace(/^\/+/, '').replace(/\\/g, '/'),
    kind: f.kind,
    content: f.kind === 'file' ? (typeof f.content === 'string' ? f.content : '') : undefined,
    updatedAt: typeof f.updatedAt === 'string' ? f.updatedAt : new Date().toISOString(),
  }
}


function normalizeTestReport(tr: any): TestReport | undefined {
  if (!tr || typeof tr !== 'object') return undefined
  const checks: TestCheck[] = Array.isArray(tr.checks)
    ? tr.checks.filter((c: any) => c && typeof c.id === 'string').map((c: any) => ({
        id: c.id,
        labelKey: typeof c.labelKey === 'string' ? c.labelKey : c.id,
        ok: Boolean(c.ok),
        detail: typeof c.detail === 'string' ? c.detail : '',
      }))
    : []
  return {
    checks,
    ranAt: typeof tr.ranAt === 'string' ? tr.ranAt : new Date().toISOString(),
  }
}

function normalizeVersions(v: any): VersionsData | undefined {
  if (!v || typeof v !== 'object') return undefined
  const snapshots: VersionSnapshot[] = Array.isArray(v.snapshots)
    ? v.snapshots.filter((s: any) => s && typeof s.id === 'string').map((s: any) => ({
        id: s.id,
        label: typeof s.label === 'string' ? s.label : 'Snapshot',
        note: typeof s.note === 'string' ? s.note : '',
        createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date().toISOString(),
        files: Array.isArray(s.files) ? s.files.map(normalizeFile).filter(Boolean) as ProjectFile[] : [],
        stage: s.stage || 'discovery',
      }))
    : []
  return {
    snapshots,
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : new Date().toISOString(),
  }
}


function normalizeRequirements(r: any): RequirementsData | undefined {
  if (!r || typeof r !== 'object') return undefined
  const items: RequirementItem[] = Array.isArray(r.items)
    ? r.items.filter((i: any) => i && typeof i.id === 'string' && typeof i.title === 'string').map((i: any) => ({
        id: i.id,
        title: i.title,
        description: typeof i.description === 'string' ? i.description : '',
        kind: (['functional','non_functional','constraint','open_question'].includes(i.kind) ? i.kind : 'functional') as RequirementItem['kind'],
        priority: (i.priority === 2 || i.priority === 3 ? i.priority : 1) as 1|2|3,
        sourceQuestionIds: Array.isArray(i.sourceQuestionIds) ? i.sourceQuestionIds.filter((x: any) => typeof x === 'string') : [],
      }))
    : []
  return {
    items,
    summary: typeof r.summary === 'string' ? r.summary : '',
    confirmed: Boolean(r.confirmed),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString(),
  }
}

function normalizeArchitecture(a: any): ArchitectureData | undefined {
  if (!a || typeof a !== 'object') return undefined
  const approaches = ['static','dynamic','webapp','store','booking','content']
  return {
    approach: approaches.includes(a.approach) ? a.approach : 'static',
    approachLabel: typeof a.approachLabel === 'string' ? a.approachLabel : String(a.approach || 'static'),
    stack: Array.isArray(a.stack) ? a.stack.filter((x: any) => typeof x === 'string') : [],
    rationale: typeof a.rationale === 'string' ? a.rationale : '',
    pages: Array.isArray(a.pages) ? a.pages.filter((x: any) => typeof x === 'string') : [],
    confirmed: Boolean(a.confirmed),
    updatedAt: typeof a.updatedAt === 'string' ? a.updatedAt : new Date().toISOString(),
  }
}

function normalizeQa(q: any): QaData | undefined {
  if (!q || typeof q !== 'object') return undefined
  const checks: Record<string, boolean> = {}
  if (q.checks && typeof q.checks === 'object') {
    for (const [k, v] of Object.entries(q.checks)) {
      checks[k] = Boolean(v)
    }
  }
  return {
    checks,
    updatedAt: typeof q.updatedAt === 'string' ? q.updatedAt : new Date().toISOString(),
  }
}

function normalizeFiles(fd: any): FilesData | undefined {
  if (!fd || typeof fd !== 'object') return undefined
  return {
    files: Array.isArray(fd.files)
      ? fd.files.map(normalizeFile).filter(Boolean) as ProjectFile[]
      : [],
    updatedAt: typeof fd.updatedAt === 'string' ? fd.updatedAt : new Date().toISOString(),
  }
}

function normalizeProject(p: any): Project | null {
  if (!p || typeof p !== 'object') return null
  if (typeof p.id !== 'string' || !p.id) return null
  if (typeof p.name !== 'string') return null
  const now = new Date().toISOString()
  return {
    id: p.id,
    name: p.name.trim() || 'Untitled',
    type: p.type || 'portfolio',
    description: typeof p.description === 'string' ? p.description : '',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : now,
    stage: p.stage || 'discovery',
    status: p.status || 'active',
    language: p.language === 'en' || p.language === 'fa' ? p.language : undefined,
    skillLevel: p.skillLevel === 'beginner' || p.skillLevel === 'intermediate' || p.skillLevel === 'advanced'
      ? p.skillLevel
      : 'intermediate',
    tasks: Array.isArray(p.tasks) ? p.tasks.map(normalizeTask).filter(Boolean) as Task[] : [],
    discovery: normalizeDiscovery(p.discovery),
    requirements: normalizeRequirements(p.requirements),
    architecture: normalizeArchitecture(p.architecture),
    ai: normalizeAi(p.ai),
    files: normalizeFiles(p.files),
    qa: normalizeQa(p.qa),
    testReport: normalizeTestReport(p.testReport),
    versions: normalizeVersions(p.versions),
    schemaVersion: typeof p.schemaVersion === 'number' ? p.schemaVersion : DATA_SCHEMA_VERSION,
    activity: Array.isArray(p.activity)
      ? p.activity.filter((a: any) => a && typeof a.id === 'string').map((a: any) => ({
          id: a.id,
          at: typeof a.at === 'string' ? a.at : now,
          kind: typeof a.kind === 'string' ? a.kind : 'note',
          message: typeof a.message === 'string' ? a.message : '',
        })) as ActivityEntry[]
      : undefined,
    publish: p.publish && typeof p.publish === 'object'
      ? {
          status: ['not_ready','ready','published'].includes(p.publish.status) ? p.publish.status : 'not_ready',
          target: typeof p.publish.target === 'string' ? p.publish.target : undefined,
          lastPublishedAt: typeof p.publish.lastPublishedAt === 'string' ? p.publish.lastPublishedAt : undefined,
          notes: typeof p.publish.notes === 'string' ? p.publish.notes : undefined,
          updatedAt: typeof p.publish.updatedAt === 'string' ? p.publish.updatedAt : now,
        } as PublishData
      : undefined,
  }
}

export function loadProjects(): StorageResult<Project[]> {
  try {
    const raw = readRaw()
    if (!Array.isArray(raw)) return { ok: true, data: [] }
    return { ok: true, data: raw.map(normalizeProject).filter((p): p is Project => p !== null) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to load projects' }
  }
}

export function saveProjects(projects: Project[]): StorageResult<void> {
  try {
    const stamped = projects.map(p => ({
      ...p,
      schemaVersion: DATA_SCHEMA_VERSION,
      updatedAt: p.updatedAt || new Date().toISOString(),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped))
    // Durable copy in IndexedDB (async; does not block UI)
    void idbSaveProjects(stamped)
    return { ok: true, data: undefined }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save projects' }
  }
}

function emptyFiles(): FilesData {
  return { files: [], updatedAt: new Date().toISOString() }
}

export function createProject(
  input: {
    name: string
    type: Project['type']
    description?: string
    language?: Project['language']
    skillLevel?: Project['skillLevel']
  },
  current: Project[]
): StorageResult<Project[]> {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'EMPTY_NAME' }
  const now = new Date().toISOString()
  const project: Project = {
    id: uid(),
    name,
    type: input.type,
    description: (input.description || '').trim(),
    createdAt: now,
    updatedAt: now,
    stage: 'discovery',
    status: 'active',
    language: input.language,
    skillLevel: input.skillLevel || 'intermediate',
    schemaVersion: DATA_SCHEMA_VERSION,
    tasks: [],
    discovery: { answers: [], notes: '', confirmed: false, updatedAt: now },
    ai: { messages: [], updatedAt: now },
    files: emptyFiles(),
  }
  const next = [project, ...current]
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

export function deleteProject(id: string, current: Project[]): StorageResult<Project[]> {
  const next = current.filter((p) => p.id !== id)
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

export function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'type' | 'stage' | 'status' | 'language' | 'skillLevel' | 'tasks' | 'discovery' | 'requirements' | 'architecture' | 'ai' | 'files' | 'qa' | 'testReport' | 'versions'>>,
  current: Project[]
): StorageResult<Project[]> {
  const index = current.findIndex((p) => p.id === id)
  if (index === -1) return { ok: false, error: 'PROJECT_NOT_FOUND' }
  const now = new Date().toISOString()
  const updated: Project = { ...current[index], ...patch, updatedAt: now }
  if (patch.name !== undefined && !patch.name.trim()) return { ok: false, error: 'EMPTY_NAME' }
  if (patch.name) updated.name = patch.name.trim()
  if (patch.description !== undefined) updated.description = patch.description.trim()
  if (patch.tasks !== undefined) updated.tasks = patch.tasks
  if (patch.discovery !== undefined) updated.discovery = patch.discovery
  if (patch.requirements !== undefined) updated.requirements = patch.requirements
  if (patch.architecture !== undefined) updated.architecture = patch.architecture
  if (patch.ai !== undefined) updated.ai = patch.ai
  if (patch.files !== undefined) updated.files = patch.files
  if (patch.qa !== undefined) updated.qa = patch.qa
  if (patch.testReport !== undefined) updated.testReport = patch.testReport
  if (patch.versions !== undefined) updated.versions = patch.versions
  const next = [...current]
  next[index] = updated
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

export const storageInfo = {
  backend: 'localStorage' as const,
  key: STORAGE_KEY,
  supportsIndexedDB: typeof indexedDB !== 'undefined',
}

/** Import a project from a JSON backup (a single project or an array). New ids avoid clashes. */
export function importProject(raw: unknown, current: Project[]): StorageResult<Project[]> {
  const items = Array.isArray(raw) ? raw : [raw]
  const imported: Project[] = []
  for (const it of items) {
    const p = normalizeProject(it)
    if (!p) continue
    imported.push({ ...p, id: uid(), name: p.name, updatedAt: new Date().toISOString() })
  }
  if (imported.length === 0) return { ok: false, error: 'INVALID_BACKUP' }
  const next = [...imported, ...current]
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

/** Approximate localStorage usage of Rahsaz data (UTF-16 → 2 bytes/char). */
export function storageUsage(): { bytes: number; limit: number } {
  let bytes = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('rahsaz.')) bytes += (k.length + (localStorage.getItem(k) || '').length) * 2
    }
  } catch { /* unavailable */ }
  return { bytes, limit: 5 * 1024 * 1024 }
}


/**
 * Prefer IndexedDB data when available and non-empty; otherwise localStorage.
 * Migrates LS → IDB when IDB is empty.
 */
export async function hydrateProjectsPreferred(): Promise<StorageResult<Project[]>> {
  const idb = await idbLoadProjects()
  if (idb.ok && idb.data.length > 0) {
    const normalized = idb.data.map(normalizeProject).filter((p): p is Project => p !== null)
    // keep LS cache warm
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    } catch { /* quota */ }
    return { ok: true, data: normalized }
  }
  const ls = loadProjects()
  if (ls.ok && ls.data.length > 0) {
    void idbSaveProjects(ls.data)
  }
  return ls
}
