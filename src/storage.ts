/**
 * Persistence layer for RahSaz (Phase 3)
 */

import type { Project, StorageResult, Task, DiscoveryData, AiData, AiMessage } from './types'

const STORAGE_KEY = 'rahsaz.projects.v050'
const LEGACY_KEYS = [
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
    id: typeof p.id === 'string' ? p.id : crypto.randomUUID(),
    name: typeof p.name === 'string' ? p.name : 'Untitled',
    type: p.type || 'portfolio',
    description: typeof p.description === 'string' ? p.description : '',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : now,
    updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : (p.createdAt || now),
    stage: p.stage || 'discovery',
    status: p.status || 'active',
    language: p.language === 'en' || p.language === 'fa' ? p.language : undefined,
    tasks: Array.isArray(p.tasks) ? p.tasks.map(normalizeTask).filter(Boolean) as Task[] : [],
    discovery: normalizeDiscovery(p.discovery),
    ai: normalizeAi(p.ai),
  }
}

function normalizeTask(t: any): Task | null {
  if (!t || typeof t !== 'object' || typeof t.id !== 'string' || typeof t.title !== 'string') return null
  return {
    id: t.id,
    title: t.title,
    done: Boolean(t.done),
    createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
  }
}

function normalizeDiscovery(d: any): DiscoveryData | undefined {
  if (!d || typeof d !== 'object') return undefined
  return {
    answers: Array.isArray(d.answers)
      ? d.answers
          .filter((a: any) => a && typeof a.questionId === 'string' && typeof a.value === 'string')
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
    tasks: Array.isArray(p.tasks) ? p.tasks.map(normalizeTask).filter(Boolean) as Task[] : [],
    discovery: normalizeDiscovery(p.discovery),
    ai: normalizeAi(p.ai),
  }
}

export function loadProjects(): StorageResult<Project[]> {
  try {
    const raw = readRaw()
    if (!Array.isArray(raw)) return { ok: true, data: [] }
    const projects = raw.map(normalizeProject).filter((p): p is Project => p !== null)
    return { ok: true, data: projects }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to load projects' }
  }
}

export function saveProjects(projects: Project[]): StorageResult<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    return { ok: true, data: undefined }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to save projects' }
  }
}

export function createProject(
  input: { name: string; type: Project['type']; description?: string; language?: Project['language'] },
  current: Project[]
): StorageResult<Project[]> {
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'EMPTY_NAME' }

  const now = new Date().toISOString()
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    type: input.type,
    description: (input.description || '').trim(),
    createdAt: now,
    updatedAt: now,
    stage: 'discovery',
    status: 'active',
    language: input.language,
    tasks: [],
    discovery: { answers: [], notes: '', confirmed: false, updatedAt: now },
    ai: { messages: [], updatedAt: now },
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
  patch: Partial<Pick<Project, 'name' | 'description' | 'type' | 'stage' | 'status' | 'language' | 'tasks' | 'discovery' | 'ai'>>,
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
  if (patch.ai !== undefined) updated.ai = patch.ai

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
