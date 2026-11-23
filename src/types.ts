/**
 * Core types for RahSaz v0.4.0 — Phase 2 (Smart Discovery)
 */

export type Language = 'fa' | 'en'
export type Theme = 'dark' | 'light'

export type ProjectType =
  | 'portfolio'
  | 'business'
  | 'store'
  | 'education'
  | 'blog'
  | 'booking'
  | 'community'
  | 'webapp'

export type ProjectStage =
  | 'discovery'
  | 'planning'
  | 'design'
  | 'development'
  | 'testing'
  | 'published'

export type ProjectStatus = 'active' | 'archived' | 'completed'

export interface Task {
  id: string
  title: string
  done: boolean
  createdAt: string
}

/** Single answer in the discovery questionnaire */
export interface DiscoveryAnswer {
  questionId: string
  value: string
}

/** Full discovery / requirements data for a project */
export interface DiscoveryData {
  answers: DiscoveryAnswer[]
  /** Free-text notes from the user */
  notes: string
  /** Whether the user has confirmed the requirements */
  confirmed: boolean
  /** ISO timestamp of last update */
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
  /** Phase 2: structured discovery answers */
  discovery?: DiscoveryData
}

export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
