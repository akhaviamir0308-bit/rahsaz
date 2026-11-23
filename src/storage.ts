/**
 * Persistence layer for RahSaz (Phase 1)
 *
 * Current implementation: localStorage with versioned key + simple migration.
 * Designed so we can later swap the backend to IndexedDB without changing callers.
 *
 * Principles:
 * - Never throw to the UI layer; always return StorageResult
 * - Keep data isolated per storage key version
 * - Support basic migration from older formats
 */

import type { Project, StorageResult, Task } from './types'

const STORAGE_KEY = 'rahsaz.projects.v030'
const LEGACY_KEY_021 = 'rahsaz.projects.v021'
const LEGACY_KEY_020 = 'rahsaz.projects.v020'

/** Read raw projects array from localStorage */
function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)

    // Migration from v0.2.1
    const legacy021 = localStorage.getItem(LEGACY_KEY_021)
    if (legacy021) {
      const parsed = JSON.parse(legacy021)
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(migrateProject)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }
    }

    // Migration from v0.2.0
    const legacy020 = localStorage.getItem(LEGACY_KEY_020)
    if (legacy020) {
      const parsed = JSON.parse(legacy020)
      if (Array.isArray(parsed)) {
        const migrated = parsed.map(migrateProject)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }
    }
    return []
  } catch {
    return []
  }
}

/** Migrate any older project shape to the current model */
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

/** Validate and normalize a project object */
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
  }
}

/** Load all projects */
export function loadProjects(): StorageResult<Project[]> {
  try {
    const raw = readRaw()
    if (!Array.isArray(raw)) {
      return { ok: true, data: [] }
    }
    const projects = raw
      .map(normalizeProject)
      .filter((p): p is Project => p !== null)
    return { ok: true, data: projects }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to load projects',
    }
  }
}

/** Persist the full projects list */
export function saveProjects(projects: Project[]): StorageResult<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    return { ok: true, data: undefined }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to save projects',
    }
  }
}

/** Create a new project and return the updated list */
export function createProject(
  input: {
    name: string
    type: Project['type']
    description?: string
    language?: Project['language']
  },
  current: Project[]
): StorageResult<Project[]> {
  const name = input.name.trim()
  if (!name) {
    return { ok: false, error: 'EMPTY_NAME' }
  }

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
  }

  const next = [project, ...current]
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

/** Delete a project by id */
export function deleteProject(
  id: string,
  current: Project[]
): StorageResult<Project[]> {
  const next = current.filter((p) => p.id !== id)
  const saveResult = saveProjects(next)
  if (!saveResult.ok) return saveResult
  return { ok: true, data: next }
}

/** Update an existing project (partial) */
export function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'type' | 'stage' | 'status' | 'language' | 'tasks'>>,
  current: Project[]
): StorageResult<Project[]> {
  const index = current.findIndex((p) => p.id === id)
  if (index === -1) {
    return { ok: false, error: 'PROJECT_NOT_FOUND' }
  }

  const now = new Date().toISOString()
  const updated: Project = {
    ...current[index],
    ...patch,
    updatedAt: now,
  }

  if (patch.name !== undefined && !patch.name.trim()) {
    return { ok: false, error: 'EMPTY_NAME' }
  }
  if (patch.name) updated.name = patch.name.trim()
  if (patch.description !== undefined) updated.description = patch.description.trim()
  if (patch.tasks !== undefined) updated.tasks = patch.tasks

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
