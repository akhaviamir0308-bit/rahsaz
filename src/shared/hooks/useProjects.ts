import { useCallback, useEffect, useState } from 'react'
import type { Language, Project, ProjectType } from '../types'
import {
  loadProjects,
  createProject as storageCreate,
  deleteProject as storageDelete,
  updateProject as storageUpdate,
} from '../../core/storage/storage'

/** Project list + persistence — keeps storage out of pure UI. */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    const result = loadProjects()
    if (result.ok) {
      setProjects(result.data)
      setStorageError(null)
    } else {
      setStorageError(result.error)
      setProjects([])
    }
    setStorageReady(true)
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

  return {
    projects,
    setProjects,
    storageReady,
    storageError,
    setStorageError,
    create,
    remove,
    update,
  }
}
