import type { ArchitectureData, Project, ProjectType } from '../../shared/types'

function typeApproach(t: ProjectType): ArchitectureData['approach'] {
  switch (t) {
    case 'store': return 'store'
    case 'booking': return 'booking'
    case 'blog':
    case 'education': return 'content'
    case 'webapp': return 'webapp'
    case 'community': return 'dynamic'
    default: return 'static'
  }
}

/**
 * Architecture suggestion from type + discovery signals (Package C).
 */
export function suggestArchitecture(project: Project, isFa: boolean): ArchitectureData {
  const answers = project.discovery?.answers || []
  const text = answers.map(a => a.value).join(' ').toLowerCase()
  const features = (answers.find(a => a.questionId === 'q_features')?.value || '').toLowerCase()
  const pagesRaw = answers.find(a => a.questionId === 'q_pages')?.value || ''
  const constraints = (answers.find(a => a.questionId === 'q_constraints')?.value || '').toLowerCase()

  let approach = typeApproach(project.type)
  if (/پرداخت|payment|cart|سبد|shop|فروش/.test(text + features)) approach = 'store'
  if (/رزرو|booking|نوبت|appointment/.test(text + features)) approach = 'booking'
  if (/ورود|login|dashboard|پنل|account|کاربر/.test(text + features)) approach = 'webapp'
  if (/api|دیتابیس|database|real-time|realtime|backend|بک‌اند/.test(text + features)) approach = 'dynamic'

  const needsAuth = /ورود|login|signup|عضویت|حساب|auth/.test(text + features) || approach === 'webapp'
  const needsDatabase = /دیتابیس|database|ذخیره کاربر|order|سفارش|محصول/.test(text + features) || approach === 'store' || approach === 'booking'
  const needsBackend = needsAuth || needsDatabase || approach === 'dynamic' || approach === 'webapp' || approach === 'store' || approach === 'booking'

  const stackStatic = ['HTML', 'CSS', 'JavaScript']
  const stackPro = ['HTML', 'CSS', 'JavaScript', 'Optional: React + Vite for larger UI']

  const conf: Record<ArchitectureData['approach'], { stack: string[]; fa: string; en: string }> = {
    static: {
      stack: stackStatic,
      fa: 'سایت عمدتاً محتوایی/معرفی است؛ HTML/CSS/JS سریع‌ترین مسیر تا انتشار است.',
      en: 'Mostly content/marketing; plain HTML/CSS/JS is the fastest path to publish.',
    },
    content: {
      stack: stackStatic,
      fa: 'سایت محتوایی چندصفحه‌ای؛ استاتیک کافی است مگر بعداً CMS لازم شود.',
      en: 'Multi-page content site; static is enough unless a CMS is needed later.',
    },
    store: {
      stack: needsBackend ? stackPro : stackStatic,
      fa: needsBackend
        ? 'فروشگاه واقعی به فهرست محصول، سفارش و ترجیحاً Backend/سرویس پرداخت نیاز دارد. نسخه اول می‌تواند کاتالوگ + فرم سفارش باشد.'
        : 'برای ویترین سبک، کاتالوگ استاتیک + فرم سفارش کافی است؛ پرداخت کامل را جدا کنید.',
      en: needsBackend
        ? 'A real store needs catalog, orders, and preferably backend/payment. v1 can be catalog + order form.'
        : 'For a light showcase, static catalog + order form is enough; treat full payment separately.',
    },
    booking: {
      stack: stackPro,
      fa: 'رزرو واقعی نیاز به مدیریت ظرفیت دارد؛ نسخه اول: فرم + تأیید دستی، سپس تقویم/Backend.',
      en: 'Real booking needs capacity control; v1: form + manual confirm, then calendar/backend.',
    },
    dynamic: {
      stack: stackPro,
      fa: 'نیاز پویا مطرح است؛ UI را اول بسازید، API و داده را در فاز بعد اضافه کنید.',
      en: 'Dynamic needs noted; build UI first, add API/data in a later phase.',
    },
    webapp: {
      stack: stackPro,
      fa: 'وب‌اپ به هویت و حالت کاربر نیاز دارد؛ نسخه اول می‌تواند جریان UI را شبیه‌سازی کند.',
      en: 'Web app needs identity and state; v1 can simulate UI flows before real auth.',
    },
  }

  const pages = pagesRaw.split(/[،,\n]+/).map(s => s.trim()).filter(Boolean)
  if (pages.length === 0) {
    pages.push(...(isFa ? ['صفحه اصلی', 'درباره', 'تماس'] : ['Home', 'About', 'Contact']))
  }

  const risks: string[] = []
  if (needsBackend && /بدون سرور|no backend|static only/.test(constraints + text)) {
    risks.push(isFa ? 'تداخل: Backend لازم است ولی محدودیت «بدون سرور» گفته شده.' : 'Conflict: backend needed but “no server” constraint stated.')
  }
  if (approach === 'store') {
    risks.push(isFa ? 'پرداخت واقعی با پرداخت نمایشی فرق دارد.' : 'Real payment differs from demo checkout.')
  }

  const deployHints = needsBackend
    ? (isFa ? ['بستر Frontend جدا', 'API و دیتابیس جدا', 'متغیر محیطی برای کلیدها'] : ['Separate frontend host', 'Separate API/DB', 'Env vars for secrets'])
    : (isFa ? ['GitHub Pages یا Netlify برای استاتیک', 'خروجی ZIP'] : ['GitHub Pages or Netlify for static', 'ZIP export'])

  const block = conf[approach]
  return {
    approach,
    approachLabel: isFa
      ? ({
          static: 'وب‌سایت استاتیک',
          dynamic: 'وب‌سایت پویا',
          webapp: 'وب‌اپلیکیشن',
          store: 'فروشگاهی',
          booking: 'رزرو و نوبت‌دهی',
          content: 'محتوایی / آموزشی',
        } as const)[approach]
      : ({
          static: 'Static website',
          dynamic: 'Dynamic website',
          webapp: 'Web application',
          store: 'Store',
          booking: 'Booking',
          content: 'Content / education',
        } as const)[approach],
    stack: block.stack,
    rationale: isFa ? block.fa : block.en,
    pages,
    confirmed: false,
    updatedAt: new Date().toISOString(),
    needsBackend,
    needsAuth,
    needsDatabase,
    deployHints,
    risks,
  }
}

export function architectureToMarkdown(project: Project, arch: ArchitectureData, isFa: boolean): string {
  const lines = [
    isFa ? `# معماری — ${project.name}` : `# Architecture — ${project.name}`,
    '',
    isFa ? `## رویکرد: ${arch.approachLabel}` : `## Approach: ${arch.approachLabel}`,
    '',
    arch.rationale,
    '',
    isFa ? `Backend: ${arch.needsBackend ? 'بله' : 'خیر'} · Auth: ${arch.needsAuth ? 'بله' : 'خیر'} · DB: ${arch.needsDatabase ? 'بله' : 'خیر'}`
      : `Backend: ${arch.needsBackend ? 'yes' : 'no'} · Auth: ${arch.needsAuth ? 'yes' : 'no'} · DB: ${arch.needsDatabase ? 'yes' : 'no'}`,
    '',
    isFa ? '## استک' : '## Stack',
    ...arch.stack.map(s => `- ${s}`),
    '',
    isFa ? '## صفحات' : '## Pages',
    ...arch.pages.map(p => `- ${p}`),
    '',
  ]
  if (arch.deployHints?.length) {
    lines.push(isFa ? '## استقرار' : '## Deploy', ...arch.deployHints.map(x => `- ${x}`), '')
  }
  if (arch.risks?.length) {
    lines.push(isFa ? '## ریسک‌ها' : '## Risks', ...arch.risks.map(x => `- ${x}`), '')
  }
  return lines.join('\n')
}
