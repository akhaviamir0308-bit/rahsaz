import { FolderKanban, Trash2 } from 'lucide-react'
import type { Project } from '../types'
import type { TranslationKeys } from '../data/translations'

export function ProjectCard({ project, t, isFa, onOpen, onDelete }: {
  project: Project; t: TranslationKeys; isFa: boolean; onOpen: () => void; onDelete: () => void
}) {
  const stageLabel = t[project.stage] || t.discovery
  const taskCount = project.tasks?.length || 0
  const doneCount = project.tasks?.filter(tk => tk.done).length || 0
  const discCount = project.discovery?.answers?.length || 0
  const aiCount = project.ai?.messages?.length || 0

  return (
    <article className="project-card" onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div className="project-card-top">
        <div className="project-icon"><FolderKanban size={19} /></div>
        <button className="delete-button" title={t.delete} onClick={e => { e.stopPropagation(); onDelete() }}>
          <Trash2 size={16} />
        </button>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description || t[project.type]}</p>
      <div className="project-card-footer">
        <span className="stage-tag">{stageLabel}</span>
        {discCount > 0 && <small style={{ marginInlineEnd: 6 }}>{discCount}Q</small>}
        {aiCount > 0 && <small style={{ marginInlineEnd: 6 }}>AI:{aiCount}</small>}
        {taskCount > 0 && <small style={{ marginInlineEnd: 8 }}>{doneCount}/{taskCount}</small>}
        <small>{new Date(project.updatedAt || project.createdAt).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</small>
      </div>
    </article>
  )
}
