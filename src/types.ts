/**
 * Core types for RahSaz v0.2.1
 * Expanded in Phase 0 for better data model and future modules.
 */

export type Language = 'fa' | 'en'
export type Theme = 'dark' | 'light'

/** Supported website / project types */
export type ProjectType =
  | 'portfolio'
  | 'business'
  | 'store'
  | 'education'
  | 'blog'
  | 'booking'
  | 'community'
  | 'webapp'

/** High-level development stage of a project */
export type ProjectStage =
  | 'discovery'   // نیازسنجی
  | 'planning'    // برنامه‌ریزی و معماری
  | 'design'      // طراحی
  | 'development' // توسعه و کدنویسی
  | 'testing'     // آزمایش
  | 'published'   // منتشر شده

/** Overall status of a project */
export type ProjectStatus = 'active' | 'archived' | 'completed'

/**
 * Main Project entity.
 * All related data (requirements, files, conversations, ...) will reference this id.
 */
export interface Project {
  id: string
  name: string
  type: ProjectType
  description: string
  createdAt: string   // ISO string
  updatedAt: string   // ISO string
  stage: ProjectStage
  status: ProjectStatus
  /** Optional language preference for the generated website content */
  language?: Language
}

/** Result shape for storage operations */
export type StorageResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
