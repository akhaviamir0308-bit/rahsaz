import type { ArchitectureData, Project, RequirementsData, Task } from '../types'
import { uid } from '../uid'

/** Source questions that describe the project rather than a thing to build. */
const META_SOURCES = new Set(['q_goal', 'q_audience', 'q_pages'])

/**
 * Generate an actionable task list from requirements + architecture.
 * Progress is preserved: a regenerated task with the same title keeps its "done" state.
 */
export function buildPlanTasks(
  project: Project,
  req?: RequirementsData,
  arch?: ArchitectureData,
  isFa?: boolean,
): Task[] {
  const fa = Boolean(isFa)
  const now = new Date().toISOString()
  const previous = new Map((project.tasks || []).filter(t => t.source === 'planning').map(t => [t.title, t]))
  const tasks: Task[] = []
  const add = (title: string, priority: 1 | 2 | 3, description?: string) => {
    const old = previous.get(title)
    tasks.push({ id: old?.id || uid(), title, done: old?.done || false, createdAt: old?.createdAt || now, priority, description, source: 'planning' })
  }

  if (!req?.confirmed) add(fa ? 'تأیید نهایی نیازمندی‌ها' : 'Confirm requirements document', 1)
  if (!arch?.confirmed) add(fa ? 'تأیید رویکرد و استک فنی' : 'Confirm architecture and stack', 1)

  const pages = arch?.pages?.length ? arch.pages : (fa ? ['صفحه اصلی', 'تماس'] : ['Home', 'Contact'])
  for (const p of pages.slice(0, 10)) add(fa ? `ساخت صفحه/بخش: ${p}` : `Build page/section: ${p}`, 1)

  const features = (req?.items || []).filter(i =>
    i.kind === 'functional' && !i.sourceQuestionIds.some(q => META_SOURCES.has(q)))
  for (const item of features.slice(0, 8)) {
    add(fa ? `پیاده‌سازی: ${item.title}` : `Implement: ${item.title}`, item.priority, item.description !== item.title ? item.description : undefined)
  }
  for (const item of (req?.items || []).filter(i => i.kind === 'open_question')) {
    add(fa ? `روشن‌کردن: ${item.title}` : `Clarify: ${item.title}`, 1, item.description)
  }

  add(fa ? 'یکپارچه‌سازی استایل و منو' : 'Unify layout, styles, and navigation', 2)
  add(fa ? 'پیش‌نمایش دسکتاپ و موبایل' : 'Preview on desktop and mobile', 1)
  add(fa ? 'اجرای بررسی‌ها و رفع خطاهای بحرانی' : 'Run checks and fix critical issues', 1)
  add(fa ? 'ثبت نسخه (snapshot) قبل از انتشار' : 'Take snapshot before publish', 2)
  add(fa ? 'خروجی ZIP و انتشار' : 'Export ZIP and publish', 1)

  const seen = new Set<string>()
  const manualTitles = new Set((project.tasks || []).filter(t => t.source !== 'planning').map(t => t.title))
  return tasks.filter(t => {
    if (seen.has(t.title) || manualTitles.has(t.title)) return false
    seen.add(t.title)
    return true
  })
}
