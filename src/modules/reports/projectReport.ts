import type { Project } from '../../shared/types'
import { buildQualityReport, type QualityReport } from '../quality/qualityReport'
import { detectProjectKind } from '../preview/projectKind'
import { pickNextTask } from '../planning/planningEngine'

export interface ProjectStatusReport {
  projectId: string
  name: string
  stage: string
  status: string
  progressPct: number
  tasksDone: number
  tasksTotal: number
  requirementsTotal: number
  requirementsConfirmed: boolean
  architectureConfirmed: boolean
  filesCount: number
  snapshotsCount: number
  testPass: number
  testTotal: number
  quality: QualityReport
  projectKind: string
  nextTaskTitle: string | null
  warnings: string[]
}

export function buildProjectStatusReport(
  project: Project,
  qaDone: number,
  qaTotal: number,
  isFa: boolean,
): ProjectStatusReport {
  const tasks = project.tasks || []
  const tasksDone = tasks.filter(t => t.done).length
  const tasksTotal = tasks.length
  const progressPct = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100)
  const files = project.files?.files || []
  const filesCount = files.filter(f => f.kind === 'file').length
  const checks = project.testReport?.checks || []
  const quality = buildQualityReport(project, project.testReport, qaDone, qaTotal)
  const kind = detectProjectKind(files)
  const next = pickNextTask(tasks)

  const warnings: string[] = []
  if (!project.discovery?.confirmed) {
    warnings.push(isFa ? 'نیازسنجی تأیید نشده' : 'Discovery not confirmed')
  }
  if (!project.requirements?.confirmed) {
    warnings.push(isFa ? 'نیازمندی‌ها تأیید نشده' : 'Requirements not confirmed')
  }
  if (!project.architecture?.confirmed) {
    warnings.push(isFa ? 'معماری تأیید نشده' : 'Architecture not confirmed')
  }
  if (filesCount === 0) {
    warnings.push(isFa ? 'هنوز فایلی در پروژه نیست' : 'No project files yet')
  }
  if (quality.publishBlocked) {
    warnings.push(isFa ? 'انتشار فعلاً توصیه نمی‌شود' : 'Publishing not recommended yet')
  }
  for (const c of quality.critical) {
    warnings.push(isFa ? `بحرانی تست: ${c}` : `Critical test: ${c}`)
  }

  return {
    projectId: project.id,
    name: project.name,
    stage: project.stage,
    status: project.status,
    progressPct,
    tasksDone,
    tasksTotal,
    requirementsTotal: project.requirements?.items?.length || 0,
    requirementsConfirmed: Boolean(project.requirements?.confirmed),
    architectureConfirmed: Boolean(project.architecture?.confirmed),
    filesCount,
    snapshotsCount: project.versions?.snapshots?.length || 0,
    testPass: checks.filter(c => c.ok).length,
    testTotal: checks.length,
    quality,
    projectKind: kind.kind,
    nextTaskTitle: next?.title || null,
    warnings,
  }
}

export function projectReportToMarkdown(r: ProjectStatusReport, isFa: boolean): string {
  const lines = [
    isFa ? `# گزارش پروژه — ${r.name}` : `# Project report — ${r.name}`,
    '',
    isFa ? `مرحله: ${r.stage} · وضعیت: ${r.status}` : `Stage: ${r.stage} · Status: ${r.status}`,
    isFa ? `پیشرفت وظایف: ${r.progressPct}% (${r.tasksDone}/${r.tasksTotal})` : `Task progress: ${r.progressPct}% (${r.tasksDone}/${r.tasksTotal})`,
    isFa ? `نیازمندی‌ها: ${r.requirementsTotal} · تأیید: ${r.requirementsConfirmed ? 'بله' : 'خیر'}` : `Requirements: ${r.requirementsTotal} · confirmed: ${r.requirementsConfirmed ? 'yes' : 'no'}`,
    isFa ? `معماری تأیید: ${r.architectureConfirmed ? 'بله' : 'خیر'}` : `Architecture confirmed: ${r.architectureConfirmed ? 'yes' : 'no'}`,
    isFa ? `فایل‌ها: ${r.filesCount} · نسخه‌ها: ${r.snapshotsCount}` : `Files: ${r.filesCount} · snapshots: ${r.snapshotsCount}`,
    isFa ? `تست: ${r.testPass}/${r.testTotal}` : `Tests: ${r.testPass}/${r.testTotal}`,
    isFa ? `کیفیت: ${r.quality.score}/100 — ${r.quality.levelLabelFa}` : `Quality: ${r.quality.score}/100 — ${r.quality.levelLabelEn}`,
    isFa ? `نوع پروژه: ${r.projectKind}` : `Kind: ${r.projectKind}`,
  ]
  if (r.nextTaskTitle) {
    lines.push(isFa ? `اقدام بعدی: ${r.nextTaskTitle}` : `Next action: ${r.nextTaskTitle}`)
  }
  if (r.warnings.length) {
    lines.push('', isFa ? '## هشدارها' : '## Warnings')
    for (const w of r.warnings) lines.push(`- ${w}`)
  }
  return lines.join('\n')
}
