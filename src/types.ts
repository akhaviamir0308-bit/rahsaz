/**
 * Core types for RahSaz v0.6.0 — Phase 4 (File & Code Management)
 */

export type Language = 'fa' | 'en'
export type Theme = 'dark' | 'light'

export type ProjectType =
  | 'portfolio' | 'business' | 'store' | 'education'
  | 'blog' | 'booking' | 'community' | 'webapp'

export type ProjectStage =
  | 'discovery' | 'planning' | 'design'
  | 'development' | 'testing' | 'published'

export type ProjectStatus = 'active' | 'archived' | 'completed'

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: string
}

export interface DiscoveryAnswer {
  questionId: string
  value: string
}

export interface DiscoveryData {
  answers: DiscoveryAnswer[]
  notes: string
  confirmed: boolean
  updatedAt: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  label?: string
  createdAt: string
}

export interface AiData {
  messages: AiMessage[]
  updatedAt: string
}

/** Virtual file or folder in the project workspace */
export interface ProjectFile {
  id: string
  /** Path relative to project root, e.g. "src/App.tsx" or "index.html" */
  path: string
  /** "file" or "folder" */
  kind: 'file' | 'folder'
  /** Text content (only for files) */
  content?: string
  updatedAt: string
}

export interface FilesData {
  files: ProjectFile[]
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  type: ProjectType
  description: string
  createdAt: string
  updatedAt: string
  stage: ProjectStage
  status: ProjectStatus
  language?: Language
  tasks?: Task[]
  discovery?: DiscoveryData
  ai?: AiData
  files?: FilesData
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
