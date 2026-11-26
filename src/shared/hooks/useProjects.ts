import { useCallback, useEffect, useState } from 'react'
import type { Language, Project, ProjectType } from '../types'
import {
  createProject as storageCreate,
  deleteProject as storageDelete,
  updateProject as storageUpdate,
  hydrateProjectsPreferred,
  saveProjects,
} from '../../core/storage/storage'

/** Project list + persistence (LS cache + IndexedDB durability). */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [storageBackend, setStorageBackend] = useState<'idb' | 'local' | 'unknown'>('unknown')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await hydrateProjectsPreferred()
      if (cancelled) return
      if (result.ok) {
        setProjects(result.data)
        setStorageError(null)
        setStorageBackend(result.data.length >= 0 ? 'idb' : 'local')
      } else {
        setStorageError(result.error)
        setProjects([])
        setStorageBackend('local')
      }
      setStorageReady(true)
    })()
    return () => { cancelled = true }
  }, [])

  const create = useCallback((
    name: string,
    type: ProjectType,
    description: string,
    language: Language,
  ) => {
    const result = storageCreate(
      { name, type, description, language },
      projects,
    )
    if (result.ok) {
      setProjects(result.data)
      setStorageError(null)
      return result.data[0] || null
    }
    setStorageError(result.error)
    return null
  }, [projects])

  const remove = useCallback((id: string) => {
    const result = storageDelete(id, projects)
    if (result.ok) {
      setProjects(result.data)
      setStorageError(null)
      return true
    }
    setStorageError(result.error)
    return false
  }, [projects])

  const update = useCallback((id: string, patch: Parameters<typeof storageUpdate>[1]) => {
    const result = storageUpdate(id, patch, projects)
    if (result.ok) {
      setProjects(result.data)
      setStorageError(null)
      return true
    }
    setStorageError(result.error)
    return false
  }, [projects])

  const persistAll = useCallback((next: Project[]) => {
    const result = saveProjects(next)
    if (result.ok) {
      setProjects(next)
      setStorageError(null)
      return true
    }
    setStorageError(result.error)
    return false
  }, [])

  return {
    projects,
    setProjects,
    storageReady,
    storageError,
    setStorageError,
    storageBackend,
    create,
    remove,
    update,
    persistAll,
  }
}
