import type { ArchitectureData, Project, RequirementsData, Task } from '../../shared/types'
import { uid } from '../../core/uid'

/**
 * Generate an actionable task list from requirements + architecture.
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
  const add = (title: string, priority: 1 | 2 | 3, description?: string) => {
    tasks.push({
      id: uid(),
      title,
      done: false,
      createdAt: now,
      priority,
      description,
      source: 'planning',
    })
  }

  add(fa ? 'تأیید نهایی نیازمندی‌ها' : 'Confirm requirements document', 1)
  add(fa ? 'تأیید رویکرد و استک فنی' : 'Confirm architecture and stack', 1)

  const pages = arch?.pages?.length
    ? arch.pages
    : (fa ? ['صفحه اصلی', 'تماس'] : ['Home', 'Contact'])
  for (const p of pages.slice(0, 8)) {
    add(fa ? `ایجاد و تکمیل صفحه: ${p}` : `Build page: ${p}`, 1)
  }

  const functionals = (req?.items || []).filter(i => i.kind === 'functional').slice(0, 6)
  for (const item of functionals) {
    add(fa ? `پیاده‌سازی: ${item.title}` : `Implement: ${item.title}`, item.priority, item.description)
  }

  add(fa ? 'یکپارچه‌سازی استایل و منو' : 'Unify layout, styles, and navigation', 2)
  add(fa ? 'پیش‌نمایش دسکتاپ و موبایل' : 'Preview on desktop and mobile', 1)
  add(fa ? 'اجرای بررسی‌ها و رفع خطاهای بحرانی' : 'Run checks and fix critical issues', 1)
  add(fa ? 'ثبت نسخه (snapshot) قبل از انتشار' : 'Take snapshot before publish', 2)
  add(fa ? 'خروجی ZIP و انتشار' : 'Export ZIP and publish', 1)

  // de-dupe by title
  const seen = new Set<string>()
  return tasks.filter(t => {
    if (seen.has(t.title)) return false
    seen.add(t.title)
    return true
  })
}
