/**
 * IndexedDB persistence for project payloads (Package B / Phase 4).
 * Settings stay in localStorage; heavy project data prefers IDB.
 */

import type { Project, StorageResult } from '../../shared/types'

const DB_NAME = 'rahsaz_db'
const DB_VERSION = 1
const STORE = 'projects'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error || new Error('IDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
  })
}

export async function idbIsAvailable(): Promise<boolean> {
  try {
    const db = await openDb()
    db.close()
    return true
  } catch {
    return false
  }
}

export async function idbLoadProjects(): Promise<StorageResult<Project[]>> {
  try {
    const db = await openDb()
    const rows: Project[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const store = tx.objectStore(STORE)
      const req = store.getAll()
      req.onsuccess = () => resolve((req.result || []) as Project[])
      req.onerror = () => reject(req.error || new Error('IDB read failed'))
    })
    db.close()
    return { ok: true, data: rows }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'IDB load failed' }
  }
}

export async function idbSaveProjects(projects: Project[]): Promise<StorageResult<void>> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      // clear + put all (simple full sync)
      const clearReq = store.clear()
      clearReq.onsuccess = () => {
        for (const p of projects) store.put(p)
      }
      clearReq.onerror = () => reject(clearReq.error || new Error('IDB clear failed'))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('IDB write failed'))
    })
    db.close()
    return { ok: true, data: undefined }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'IDB save failed' }
  }
}

export async function idbClearAll(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    /* ignore */
  }
}
