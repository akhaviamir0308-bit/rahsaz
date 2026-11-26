/**
 * Workspace helpers: prompts, next-step coach, tab help, QA keys.
 */
import type { Project } from '../shared/types'
import type { TranslationKeys } from '../data/translations'

export type WorkspaceTab =
  | 'learn' | 'overview' | 'discovery' | 'requirements' | 'architecture'
  | 'ai' | 'files' | 'preview' | 'versions' | 'publish' | 'tasks' | 'settings'

export function buildProjectContext(project: Project, t: TranslationKeys, isFa: boolean): string {
  const lines: string[] = []
  lines.push(isFa ? `نام پروژه: ${project.name}` : `Project name: ${project.name}`)
  lines.push(isFa ? `نوع: ${t[project.type]}` : `Type: ${t[project.type]}`)
  if (project.description) {
    lines.push(isFa ? `توضیح: ${project.description}` : `Description: ${project.description}`)
  }
  lines.push(isFa ? `مرحله فعلی: ${t[project.stage]}` : `Current stage: ${t[project.stage]}`)

  const answers = project.discovery?.answers || []
  if (answers.length > 0) {
    lines.push('')
    lines.push(isFa ? '--- پاسخ‌های نیازسنجی ---' : '--- Discovery answers ---')
    for (const a of answers) {
      const qLabel = t[a.questionId as keyof TranslationKeys] || a.questionId
      lines.push(`${qLabel}`)
      lines.push(`  → ${a.value}`)
    }
  }
  if (project.discovery?.notes) {
    lines.push('')
    lines.push(isFa ? `یادداشت‌ها: ${project.discovery.notes}` : `Notes: ${project.discovery.notes}`)
  }
  return lines.join('\n')
}

export function buildPromptFromTemplate(
  templateId: string,
  project: Project,
  t: TranslationKeys,
  isFa: boolean
): string {
  const ctx = buildProjectContext(project, t, isFa)
  const header = isFa
    ? 'تو یک مشاور حرفه‌ای طراحی و توسعه وب‌سایت هستی. بر اساس اطلاعات پروژه زیر پاسخ بده.\n\n'
    : 'You are a professional website design and development consultant. Answer based on the project information below.\n\n'

  const instructions: Record<string, { fa: string; en: string }> = {
    structure: {
      fa: 'ساختار صفحات و منوی پیشنهادی این وب‌سایت را به‌صورت فهرست واضح بنویس. برای هر صفحه یک جمله توضیح بده.',
      en: 'Propose a clear page structure and navigation for this website. Add a one-sentence description for each page.',
    },
    features: {
      fa: 'قابلیت‌های ضروری و اختیاری را در دو فهرست جداگانه اولویت‌بندی کن و دلیل هر مورد را کوتاه بنویس.',
      en: 'List essential vs optional features in two separate prioritized lists and briefly justify each item.',
    },
    copy: {
      fa: 'پیش‌نویس متن صفحه اصلی (عنوان، زیرعنوان، بخش‌های اصلی) را به زبان فارسی و لحن مناسب مخاطب بنویس.',
      en: 'Draft homepage copy (headline, subheadline, main sections) in a tone suitable for the audience.',
    },
    tech: {
      fa: 'یک استک فنی مناسب (frontend، backend در صورت نیاز، میزبانی) پیشنهاد بده و دلیل انتخاب را توضیح بده. سطح پیچیدگی را با محدودیت‌های پروژه هماهنگ کن.',
      en: 'Suggest a suitable tech stack (frontend, backend if needed, hosting) and explain why. Match complexity to project constraints.',
    },
    tasks: {
      fa: 'نیازمندی‌ها را به یک لیست وظایف قابل اجرا و اولویت‌بندی‌شده تبدیل کن (حداکثر ۱۵ مورد).',
      en: 'Turn the requirements into a prioritized, actionable task list (max 15 items).',
    },
    review: {
      fa: 'نقاط ضعف یا کمبود اطلاعات در نیازسنجی را مشخص کن و ۳ تا ۵ سؤال تکمیلی پیشنهاد بده.',
      en: 'Identify gaps in the discovery answers and suggest 3–5 follow-up questions.',
    },
  }

  const instr = instructions[templateId]
  const body = instr ? (isFa ? instr.fa : instr.en) : (isFa ? 'بر اساس اطلاعات پروژه راهنمایی کن.' : 'Provide guidance based on the project information.')

  return `${header}${ctx}\n\n---\n\n${body}`
}



export const QA_KEYS = ['qa_responsive', 'qa_content', 'qa_links', 'qa_images', 'qa_lang'] as const

export const TAB_HELP: Record<string, { lesson: string; fa: string; en: string }> = {
  discovery: { lesson: 't-discovery', fa: 'به ۸ سؤال کلیدی جواب بدهید (حداقل ۳ پاسخ برای تأیید). پاسخ‌ها خودکار وارد پرامپت‌های دستیار AI می‌شوند. «ذخیره» فقط ذخیره می‌کند؛ «تأیید» پروژه را به مرحله برنامه‌ریزی می‌برد.', en: 'Answer the 8 key questions (at least 3 to confirm). Answers flow into the AI assistant prompts. "Save" only saves; "Confirm" moves the project to Planning.' },
  ai: { lesson: 't-ai', fa: 'یک کارت انتخاب کنید ← پرامپت را کپی کنید ← در ChatGPT/Claude بچسبانید ← پاسخ را اینجا ذخیره کنید. راه‌ساز مستقیم به هوش مصنوعی وصل نیست؛ مسیر و حافظه کار را نگه می‌دارد.', en: 'Pick a card → copy the prompt → paste it in ChatGPT/Claude → save the answer here. Rahsaz is not directly connected to an AI; it keeps the path and memory of the work.' },
  files: { lesson: 't-files', fa: 'فایل index.html بسازید یا «ایجاد ساختار اولیه» را بزنید، کد AI را بچسبانید و Ctrl+S بزنید. فایل‌ها فقط متنی‌اند. «دفتر کنترل پروژه» سه فایل مستند می‌سازد.', en: 'Create index.html or click "Create starter structure", paste AI code and press Ctrl+S. Files are text only. "Project control log" creates three documentation files.' },
  preview: { lesson: 't-preview', fa: 'سایت را در دسکتاپ، تبلت و موبایل ببینید و چک‌لیست کیفیت را تیک بزنید. پیش‌نمایش ایزوله است؛ بازشدن لینک در تب جدید و ارسال فرم را روی نسخه آنلاین تست کنید.', en: 'See the site on desktop, tablet and mobile and tick the QA list. The preview is sandboxed; test links opening in new tabs and form submission on the live site.' },
  versions: { lesson: 't-versions', fa: 'قبل از هر تغییر بزرگ یک نسخه بگیرید تا اگر خراب شد برگردید. تست‌ها فقط ساختار فایل‌ها را بررسی می‌کنند، نه درستی ظاهر را.', en: 'Take a snapshot before every big change so you can roll back. Tests only check file structure, not whether it looks right.' },
  publish: { lesson: 't-publish', fa: 'همه موارد آمادگی را سبز کنید، ZIP بگیرید و روی Netlify Drop یا Cloudflare Pages آپلود کنید. دکمه «علامت‌گذاری منتشرشده» فقط وضعیت را عوض می‌کند و سایت را آنلاین نمی‌کند.', en: 'Make every readiness item green, export the ZIP and upload it to Netlify Drop or Cloudflare Pages. "Mark as published" only changes status; it does not put the site online.' },
  tasks: { lesson: 't-tasks', fa: 'کارهای کوچک را اینجا بنویسید و تیک بزنید؛ درصد پیشرفت در نمای کلی دیده می‌شود.', en: 'Write small jobs here and tick them off; progress shows in the overview.' },
  settings: { lesson: 't-tasks', fa: 'نام، توضیح، نوع، مرحله و وضعیت پروژه را اینجا تغییر دهید.', en: 'Change the project name, description, type, stage and status here.' },
}

export interface NextStep { tab: WorkspaceTab; fa: string; en: string }
export function computeNextStep(p: Project, qaDone: number): NextStep {
  const answers = p.discovery?.answers?.length || 0
  const files = (p.files?.files || []).filter(f => f.kind === 'file')
  const filesUpdated = p.files?.updatedAt || ''
  if (p.stage === 'published') return { tab: 'tasks', fa: 'پروژه منتشر شده است. برای قابلیت بعدی یک کار جدید بنویسید یا پروژه دوم را شروع کنید.', en: 'This project is published. Add a task for the next feature or start a second project.' }
  if (answers < 3) return { tab: 'discovery', fa: 'در نیازسنجی حداقل ۳ سؤال را جواب بدهید.', en: 'Answer at least 3 questions in Discovery.' }
  if (!p.discovery?.confirmed) return { tab: 'discovery', fa: 'نیازسنجی را تأیید کنید.', en: 'Confirm discovery answers.' }
  if (!p.requirements?.items?.length) return { tab: 'requirements', fa: 'سند نیازمندی‌ها را از روی نیازسنجی بسازید و بررسی کنید.', en: 'Generate and review the requirements document from discovery.' }
  if (!p.requirements?.confirmed) return { tab: 'requirements', fa: 'سند نیازمندی‌ها را تأیید کنید.', en: 'Confirm the requirements document.' }
  if (!p.architecture?.stack?.length) return { tab: 'architecture', fa: 'پیشنهاد معماری و استک را ببینید و تأیید کنید.', en: 'Review and confirm architecture and stack.' }
  if (!p.architecture?.confirmed) return { tab: 'architecture', fa: 'معماری پیشنهادی را تأیید کنید.', en: 'Confirm the suggested architecture.' }
  const planTasks = (p.tasks || []).filter(t => t.source === 'planning')
  if (planTasks.length === 0) return { tab: 'tasks', fa: 'برنامه وظایف را از روی نیازمندی و معماری بسازید.', en: 'Generate the task plan from requirements and architecture.' }
  if (!(p.ai?.messages?.length)) return { tab: 'ai', fa: 'از دستیار AI یک پرامپت بسازید و پاسخ را ذخیره کنید (مثلاً ساختار صفحات).', en: 'Build a prompt in the AI assistant and save the answer (e.g. page structure).' }
  if (files.length === 0) return { tab: 'files', fa: 'فایل index.html را بسازید و کد را وارد کنید.', en: 'Create index.html and add code.' }
  if (!(p.versions?.snapshots?.length)) return { tab: 'versions', fa: 'یک نسخه سالم از وضعیت فعلی بگیرید.', en: 'Take a known-good snapshot of the current state.' }
  if (!p.testReport || p.testReport.ranAt < filesUpdated) return { tab: 'versions', fa: 'تست‌ها را اجرا کنید (فایل‌ها از آخرین تست تغییر کرده‌اند).', en: 'Run the tests (files changed since the last test).' }
  if (qaDone < 3) return { tab: 'preview', fa: 'سایت را در پیش‌نمایش ببینید و چک‌لیست کیفیت را کامل کنید.', en: 'View the site in Preview and complete the QA checklist.' }
  return { tab: 'publish', fa: 'همه چیز آماده است: ZIP بگیرید و سایت را آنلاین کنید.', en: 'Everything is ready: export the ZIP and put the site online.' }
}

