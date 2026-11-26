/**
 * Core types for RahSaz v0.15.0 — Package B (data model + storage)
 * Schema version is stored on each project for future migrations.
 */

export type Language = 'fa' | 'en'
export type Theme = 'dark' | 'light'

/** Bump when persisted shape changes in a breaking way */
export const DATA_SCHEMA_VERSION = 15

export type ProjectType =
  | 'portfolio' | 'business' | 'store' | 'education'
  | 'blog' | 'booking' | 'community' | 'webapp'

export type ProjectStage =
  | 'discovery' | 'planning' | 'design'
  | 'development' | 'testing' | 'published'

export type ProjectStatus = 'active' | 'archived' | 'completed'

export type RequirementKind =
  | 'functional' | 'non_functional' | 'constraint' | 'open_question' | 'security'

export type RequirementStatus = 'draft' | 'confirmed' | 'rejected' | 'implemented' | 'tested'

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: string
  completedAt?: string
  priority?: 1 | 2 | 3
  description?: string
  source?: 'manual' | 'planning' | 'ai'
  /** related requirement ids */
  requirementIds?: string[]
  /** blocked by other task ids */
  dependsOn?: string[]
  stage?: ProjectStage
  estimateMinutes?: number
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

export interface RequirementItem {
  id: string
  /** e.g. FR-001 */
  code?: string
  title: string
  description: string
  kind: RequirementKind
  priority: 1 | 2 | 3
  status?: RequirementStatus
  sourceQuestionIds: string[]
  acceptanceCriteria?: string
  dependsOn?: string[]
  updatedAt?: string
}

export interface RequirementsData {
  items: RequirementItem[]
  summary: string
  confirmed: boolean
  updatedAt: string
}

export interface ArchitectureData {
  approach: 'static' | 'dynamic' | 'webapp' | 'store' | 'booking' | 'content'
  approachLabel: string
  stack: string[]
  rationale: string
  pages: string[]
  confirmed: boolean
  updatedAt: string
  needsBackend?: boolean
  needsAuth?: boolean
  needsDatabase?: boolean
  deployHints?: string[]
  risks?: string[]
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  label?: string
  createdAt: string
  linkedTaskId?: string
  linkedFilePath?: string
  provider?: string
  model?: string
  reviewed?: boolean
  applied?: boolean
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
  size?: number
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

/** Lightweight activity for reports (Package B model) */
export interface ActivityEntry {
  id: string
  at: string
  kind: string
  message: string
}

/** Publish metadata stub for later phases */
export interface PublishData {
  status: 'not_ready' | 'ready' | 'published'
  target?: string
  lastPublishedAt?: string
  notes?: string
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
  /** data schema version at last save */
  schemaVersion?: number
  tasks?: Task[]
  discovery?: DiscoveryData
  requirements?: RequirementsData
  architecture?: ArchitectureData
  ai?: AiData
  files?: FilesData
  qa?: QaData
  testReport?: TestReport
  versions?: VersionsData
  activity?: ActivityEntry[]
  publish?: PublishData
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export interface UserSettings {
  language: Language
  theme: Theme
  schemaVersion: number
}
