import type { ArchitectureData, Project, RequirementsData, Task, ProjectStage } from '../shared/types'
import { uid } from '../core/uid'

/**
 * Generate an actionable task plan with stages and light dependencies (Package C).
 */
export function buildPlanTasks(
  _project: Project,
  req?: RequirementsData,
  arch?: ArchitectureData,
  isFa?: boolean,
): Task[] {
  const fa = Boolean(isFa)
  const now = new Date().toISOString()
  const tasks: Task[] = []

  const add = (
    title: string,
    priority: 1 | 2 | 3,
    stage: ProjectStage,
    opts?: { description?: string; requirementIds?: string[]; dependsOn?: string[] },
  ) => {
    const id = uid()
    tasks.push({
      id,
      title,
      done: false,
      createdAt: now,
      priority,
      description: opts?.description,
      source: 'planning',
      stage,
      requirementIds: opts?.requirementIds,
      dependsOn: opts?.dependsOn,
    })
    return id
  }

  const tReq = add(fa ? 'تأیید نهایی نیازمندی‌ها' : 'Confirm requirements document', 1, 'planning')
  const tArch = add(fa ? 'تأیید رویکرد و استک فنی' : 'Confirm architecture and stack', 1, 'planning', {
    dependsOn: [tReq],
  })

  const pages = arch?.pages?.length ? arch.pages : (fa ? ['صفحه اصلی', 'تماس'] : ['Home', 'Contact'])
  let prevPage: string | undefined
  for (const p of pages.slice(0, 8)) {
    prevPage = add(fa ? `ایجاد و تکمیل صفحه: ${p}` : `Build page: ${p}`, 1, 'development', {
      dependsOn: prevPage ? [tArch, prevPage] : [tArch],
    })
  }

  const functionals = (req?.items || []).filter(i => i.kind === 'functional').slice(0, 8)
  for (const item of functionals) {
    add(fa ? `پیاده‌سازی: ${item.title}` : `Implement: ${item.title}`, item.priority, 'development', {
      description: item.description,
      requirementIds: [item.id],
      dependsOn: [tArch],
    })
  }

  if (arch?.needsBackend) {
    add(fa ? 'مشخص‌کردن مرز Frontend/Backend' : 'Define frontend/backend boundary', 1, 'design', {
      dependsOn: [tArch],
      description: fa ? 'چه چیزی سمت کلاینت است و چه API لازم است.' : 'What stays on client vs required APIs.',
    })
  }

  const tStyle = add(fa ? 'یکپارچه‌سازی استایل و منو' : 'Unify layout, styles, and navigation', 2, 'design')
  const tPrev = add(fa ? 'پیش‌نمایش دسکتاپ و موبایل' : 'Preview on desktop and mobile', 1, 'testing', {
    dependsOn: [tStyle],
  })
  const tTest = add(fa ? 'اجرای بررسی‌ها و رفع خطاهای بحرانی' : 'Run checks and fix critical issues', 1, 'testing', {
    dependsOn: [tPrev],
  })
  const tSnap = add(fa ? 'ثبت نسخه (snapshot) قبل از انتشار' : 'Take snapshot before publish', 2, 'testing', {
    dependsOn: [tTest],
  })
  add(fa ? 'خروجی ZIP و انتشار' : 'Export ZIP and publish', 1, 'published', {
    dependsOn: [tSnap],
  })

  const seen = new Set<string>()
  return tasks.filter(t => {
    if (seen.has(t.title)) return false
    seen.add(t.title)
    return true
  })
}

/** Next recommended task id from open tasks + dependencies */
export function pickNextTask(tasks: Task[]): Task | null {
  const open = tasks.filter(t => !t.done)
  for (const t of open) {
    const deps = t.dependsOn || []
    const blocked = deps.some(id => {
      const d = tasks.find(x => x.id === id)
      return d ? !d.done : false
    })
    if (!blocked) return t
  }
  return open[0] || null
}
