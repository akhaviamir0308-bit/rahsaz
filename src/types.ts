/**
 * Core types for RahSaz v0.5.0 — Phase 3 (AI Assistant Layer)
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

/** One message in the AI conversation log */
export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  /** Optional label e.g. "Page structure", "Copy prompt" */
  label?: string
  createdAt: string
}

/** AI workspace data stored on the project */
export interface AiData {
  messages: AiMessage[]
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
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/** Built-in prompt template */
export interface PromptTemplate {
  id: string
  titleKey: string
  descriptionKey: string
  /** Stage this template is most useful for */
  stages: ProjectStage[]
}
