import type { ArchitectureData, Project, ProjectType } from '../../shared/types'

function typeApproach(t: ProjectType): ArchitectureData['approach'] {
  switch (t) {
    case 'store': return 'store'
    case 'booking': return 'booking'
    case 'blog': return 'content'
    case 'webapp': return 'webapp'
    case 'community': return 'dynamic'
    case 'education': return 'content'
    case 'business': return 'static'
    case 'portfolio': return 'static'
    default: return 'static'
  }
}

/**
 * Recommend architecture and stack from project type + discovery signals.
 */
export function suggestArchitecture(project: Project, isFa: boolean): ArchitectureData {
  const answers = project.discovery?.answers || []
  const text = answers.map(a => a.value).join(' ').toLowerCase()
  const features = (answers.find(a => a.questionId === 'q_features')?.value || '').toLowerCase()
  const pagesRaw = answers.find(a => a.questionId === 'q_pages')?.value || ''

  let approach = typeApproach(project.type)
  if (/پرداخت|payment|cart|سبد|shop|فروش/.test(text + features)) approach = 'store'
  if (/رزرو|booking|نوبت|appointment/.test(text + features)) approach = 'booking'
  if (/ورود|login|dashboard|پنل|account|کاربر/.test(text + features)) approach = 'webapp'
  if (/api|دیتابیس|database|real-time|realtime/.test(text + features)) approach = 'dynamic'

  const stackByApproach: Record<ArchitectureData['approach'], { stack: string[]; fa: string; en: string }> = {
    static: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'سایت عمدتاً محتوایی/معرفی است؛ شروع با HTML/CSS/JS ساده سریع‌ترین مسیر تا انتشار است.',
      en: 'Mostly content/marketing site; plain HTML/CSS/JS is the fastest path to publish.',
    },
    content: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'سایت محتوایی؛ ساختار چندصفحه‌ای استاتیک کافی است مگر بعداً CMS لازم شود.',
      en: 'Content site; multi-page static structure is enough unless a CMS is needed later.',
    },
    store: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'برای نسخه اول، کاتالوگ و فرم سفارش استاتیک؛ پرداخت کامل را به فاز بعد موکول کنید مگر ابزار آماده داشته باشید.',
      en: 'For v1 use static catalog + order form; full payment can wait unless you already have a provider.',
    },
    booking: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'رزرو اولیه با فرم و تأیید دستی؛ تقویم پیشرفته در نسخه بعد.',
      en: 'Initial booking via form + manual confirm; advanced calendar later.',
    },
    dynamic: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'نیاز پویا مطرح شده؛ فعلاً رابط را استاتیک بسازید و API را مرحله بعد اضافه کنید.',
      en: 'Dynamic needs noted; build static UI first, add API in a later phase.',
    },
    webapp: {
      stack: ['HTML', 'CSS', 'JavaScript'],
      fa: 'وب‌اپ نیاز به هویت کاربر دارد؛ نسخه اول می‌تواند رابط و جریان‌ها را شبیه‌سازی کند.',
      en: 'Web app needs identity; v1 can simulate UI flows before real auth.',
    },
  }

  const conf = stackByApproach[approach]
  const pages = pagesRaw
    .split(/[،,\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
  if (pages.length === 0) {
    pages.push(
      ...(isFa
        ? ['صفحه اصلی', 'درباره', 'تماس']
        : ['Home', 'About', 'Contact']),
    )
  }

  return {
    approach,
    approachLabel: isFa
      ? ({
          static: 'وب‌سایت استاتیک',
          dynamic: 'وب‌سایت پویا',
          webapp: 'وب‌اپلیکیشن',
          store: 'فروشگاهی (نسخه اول سبک)',
          booking: 'رزرو و نوبت‌دهی',
          content: 'محتوایی / آموزشی',
        } as const)[approach]
      : ({
          static: 'Static website',
          dynamic: 'Dynamic website',
          webapp: 'Web application',
          store: 'Store (lightweight v1)',
          booking: 'Booking',
          content: 'Content / education',
        } as const)[approach],
    stack: conf.stack,
    rationale: isFa ? conf.fa : conf.en,
    pages,
    confirmed: false,
    updatedAt: new Date().toISOString(),
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
    isFa ? '## استک پیشنهادی' : '## Suggested stack',
    ...arch.stack.map(s => `- ${s}`),
    '',
    isFa ? '## صفحات' : '## Pages',
    ...arch.pages.map(p => `- ${p}`),
    '',
  ]
  return lines.join('\n')
}
