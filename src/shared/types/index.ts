/**
 * Core types for RahSaz v0.11.0
 * Aligned with product document (first practical version).
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
  /** optional priority 1 high – 3 low */
  priority?: 1 | 2 | 3
  /** optional description */
  description?: string
  /** source: manual | planning | ai */
  source?: 'manual' | 'planning' | 'ai'
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

/** Structured requirement item derived from discovery */
export interface RequirementItem {
  id: string
  title: string
  description: string
  kind: 'functional' | 'non_functional' | 'constraint' | 'open_question'
  priority: 1 | 2 | 3
  sourceQuestionIds: string[]
}

export interface RequirementsData {
  items: RequirementItem[]
  summary: string
  confirmed: boolean
  updatedAt: string
}

/** Architecture / tech recommendation */
export interface ArchitectureData {
  approach: 'static' | 'dynamic' | 'webapp' | 'store' | 'booking' | 'content'
  approachLabel: string
  stack: string[]
  rationale: string
  pages: string[]
  confirmed: boolean
  updatedAt: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  label?: string
  createdAt: string
  /** optional link to task or file path */
  linkedTaskId?: string
  linkedFilePath?: string
}

export interface AiData {
  messages: AiMessage[]
  updatedAt: string
}

export interface ProjectFile {
  id: string
  path: string
  kind: 'file' | 'folder'
  content?: string
  updatedAt: string
}

export interface FilesData {
  files: ProjectFile[]
  updatedAt: string
}

export interface QaData {
  checks: Record<string, boolean>
  updatedAt: string
}

export interface TestCheck {
  id: string
  labelKey: string
  ok: boolean
  detail: string
}

export interface TestReport {
  checks: TestCheck[]
  ranAt: string
}

export interface VersionSnapshot {
  id: string
  label: string
  note: string
  createdAt: string
  files: ProjectFile[]
  stage: ProjectStage
}

export interface VersionsData {
  snapshots: VersionSnapshot[]
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
  requirements?: RequirementsData
  architecture?: ArchitectureData
  ai?: AiData
  files?: FilesData
  qa?: QaData
  testReport?: TestReport
  versions?: VersionsData
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
