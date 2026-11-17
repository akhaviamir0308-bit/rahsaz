export type Language = 'fa' | 'en'
export type Theme = 'dark' | 'light'
export type ProjectType = 'portfolio' | 'business' | 'store' | 'education' | 'blog' | 'booking' | 'community' | 'webapp'

export interface Project {
  id: string
  name: string
  type: ProjectType
  description: string
  createdAt: string
  stage: 'discovery'
}
