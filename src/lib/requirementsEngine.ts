import type {
  DiscoveryData, Project, ProjectType, RequirementItem, RequirementsData, RequirementKind,
} from '../shared/types'
import { uid } from '../core/uid'

function ans(d: DiscoveryData | undefined, id: string): string {
  return (d?.answers || []).find(a => a.questionId === id)?.value?.trim() || ''
}

function codeFor(kind: RequirementKind, n: number): string {
  const prefix =
    kind === 'functional' ? 'FR'
      : kind === 'non_functional' ? 'NFR'
        : kind === 'security' ? 'SEC'
          : kind === 'constraint' ? 'CON'
            : 'OQ'
  return `${prefix}-${String(n).padStart(3, '0')}`
}

/** Detect simple contradictions / gaps in discovery answers */
export function analyzeDiscovery(project: Project, isFa: boolean): {
  confirmed: string[]
  unknown: string[]
  contradictions: string[]
  openQuestions: string[]
} {
  const d = project.discovery
  const goal = ans(d, 'q_goal')
  const audience = ans(d, 'q_audience')
  const features = ans(d, 'q_features')
  const pages = ans(d, 'q_pages')
  const constraints = ans(d, 'q_constraints')
  const success = ans(d, 'q_success')
  const text = [goal, audience, features, pages, constraints].join(' ').toLowerCase()

  const confirmed: string[] = []
  const unknown: string[] = []
  const contradictions: string[] = []
  const openQuestions: string[] = []

  if (goal) confirmed.push(isFa ? `هدف: ${goal}` : `Goal: ${goal}`)
  else unknown.push(isFa ? 'هدف اصلی مشخص نیست' : 'Primary goal is unclear')

  if (audience) confirmed.push(isFa ? `مخاطب: ${audience}` : `Audience: ${audience}`)
  else unknown.push(isFa ? 'مخاطب هدف مشخص نیست' : 'Target audience is unclear')

  if (features || pages) confirmed.push(isFa ? 'حداقل یک اشاره به قابلیت/صفحه وجود دارد' : 'At least one feature/page signal exists')
  else unknown.push(isFa ? 'صفحات و قابلیت‌ها ناقص است' : 'Pages and features are incomplete')

  if (success) confirmed.push(isFa ? `معیار موفقیت: ${success}` : `Success: ${success}`)
  else openQuestions.push(isFa ? 'معیار موفقیت هنوز تعریف نشده' : 'Success metrics not defined')

  const wantsStore = /فروش|فروشگاه|پرداخت|سبد|shop|store|cart|payment/.test(text)
  const saysStaticOnly = /فقط معرفی|فقط نمایش|بدون خرید|no shop|brochure only/.test(text)
  if (wantsStore && saysStaticOnly) {
    contradictions.push(
      isFa
        ? 'هم اشاره به فروش/پرداخت شده و هم «فقط معرفی» — باید مشخص شود فروش واقعی است یا نمایشی.'
        : 'Both commerce and “brochure only” signals — clarify real checkout vs display-only.',
    )
  }

  const wantsAuth = /ورود|عضویت|حساب کاربری|login|signup|account|auth/.test(text)
  const noBackend = /بدون سرور|بدون بک‌اند|static only|no backend/.test(text)
  if (wantsAuth && noBackend) {
    contradictions.push(
      isFa
        ? 'احراز هویت خواسته شده ولی Backend رد شده — این دو با هم سازگار نیستند مگر راهکار شخص‌ثالث.'
        : 'Auth requested but backend rejected — incompatible unless a third-party auth is planned.',
    )
  }

  if (constraints) confirmed.push(isFa ? `محدودیت ثبت شد` : 'Constraints noted')
  else openQuestions.push(isFa ? 'محدودیت زمانی/بودجه مشخص نشده' : 'Time/budget constraints not stated')

  return { confirmed, unknown, contradictions, openQuestions }
}

/**
 * Build structured requirements from discovery + project type.
 */
export function buildRequirements(project: Project, isFa: boolean): RequirementsData {
  const d = project.discovery
  const items: RequirementItem[] = []
  const counters: Record<RequirementKind, number> = {
    functional: 0,
    non_functional: 0,
    constraint: 0,
    open_question: 0,
    security: 0,
  }

  const push = (
    title: string,
    description: string,
    kind: RequirementKind,
    priority: 1 | 2 | 3,
    sourceQuestionIds: string[],
    acceptanceCriteria?: string,
  ) => {
    counters[kind] += 1
    items.push({
      id: uid(),
      code: codeFor(kind, counters[kind]),
      title,
      description,
      kind,
      priority,
      status: 'draft',
      sourceQuestionIds,
      acceptanceCriteria,
      updatedAt: new Date().toISOString(),
    })
  }

  const goal = ans(d, 'q_goal')
  const audience = ans(d, 'q_audience')
  const features = ans(d, 'q_features')
  const pages = ans(d, 'q_pages')
  const content = ans(d, 'q_content')
  const design = ans(d, 'q_design')
  const constraints = ans(d, 'q_constraints')
  const success = ans(d, 'q_success')
  const analysis = analyzeDiscovery(project, isFa)

  if (goal) {
    push(
      isFa ? 'هدف اصلی محصول' : 'Primary product goal',
      goal,
      'functional',
      1,
      ['q_goal'],
      isFa ? 'کاربر هدف را در صفحه اصلی یا معرفی می‌فهمد.' : 'A visitor understands the goal from the home/intro page.',
    )
  }
  if (audience) {
    push(
      isFa ? 'مخاطب هدف' : 'Target audience',
      audience,
      'functional',
      1,
      ['q_audience'],
      isFa ? 'پیام و محتوای سایت با مخاطب هم‌خوان است.' : 'Site messaging matches the audience.',
    )
  }
  if (features) {
    const parts = features.split(/[،,\n]+/).map(s => s.trim()).filter(Boolean)
    if (parts.length > 1) {
      parts.forEach((p, i) =>
        push(
          isFa ? `قابلیت: ${p}` : `Feature: ${p}`,
          p,
          'functional',
          i < 3 ? 1 : 2,
          ['q_features'],
          isFa ? `قابلیت «${p}» در رابط قابل استفاده است.` : `Feature “${p}” is usable in the UI.`,
        ),
      )
    } else {
      push(isFa ? 'قابلیت‌های ضروری' : 'Essential features', features, 'functional', 1, ['q_features'])
    }
  }
  if (pages) {
    push(
      isFa ? 'صفحات مورد نیاز' : 'Required pages',
      pages,
      'functional',
      1,
      ['q_pages'],
      isFa ? 'هر صفحهٔ نام‌برده مسیر مشخص دارد.' : 'Each named page has a reachable path.',
    )
  }
  if (content) {
    push(isFa ? 'منبع محتوا' : 'Content source', content, 'non_functional', 2, ['q_content'])
  }
  if (design) {
    push(isFa ? 'سبک ظاهری' : 'Visual style', design, 'non_functional', 2, ['q_design'])
  }
  if (constraints) {
    push(isFa ? 'محدودیت‌ها' : 'Constraints', constraints, 'constraint', 1, ['q_constraints'])
  }
  if (success) {
    push(isFa ? 'معیار موفقیت' : 'Success metrics', success, 'non_functional', 2, ['q_success'])
  }

  const typeDefaults: Record<ProjectType, string[]> = {
    portfolio: isFa ? ['نمایش نمونه‌کارها', 'صفحه درباره', 'راه تماس'] : ['Showcase work', 'About page', 'Contact path'],
    business: isFa ? ['معرفی خدمات', 'اعتمادسازی', 'دعوت به تماس'] : ['Present services', 'Build trust', 'Clear CTA'],
    store: isFa ? ['فهرست محصول', 'مسیر سفارش', 'اطلاعات پرداخت/ارسال'] : ['Product listing', 'Order path', 'Payment/shipping info'],
    education: isFa ? ['فهرست محتوا', 'صفحه جزئیات', 'ثبت‌نام یا تماس'] : ['Content list', 'Detail page', 'Signup or contact'],
    blog: isFa ? ['فهرست مطالب', 'صفحه تک‌مطلب', 'دسته‌بندی'] : ['Post list', 'Single post', 'Categories'],
    booking: isFa ? ['انتخاب خدمت/زمان', 'فرم رزرو', 'تأیید درخواست'] : ['Service/time selection', 'Booking form', 'Confirmation'],
    community: isFa ? ['عضویت', 'فهرست موضوعات', 'قوانین'] : ['Membership', 'Topic list', 'Rules'],
    webapp: isFa ? ['هویت کاربر', 'داشبورد', 'ذخیره داده'] : ['User identity', 'Dashboard', 'Data persistence'],
  }
  for (const line of typeDefaults[project.type] || []) {
    if (!items.some(i => i.description.includes(line) || i.title.includes(line))) {
      push(isFa ? `پایه نوع «${project.type}»` : `Baseline for ${project.type}`, line, 'functional', 2, [])
    }
  }

  // Security defaults when signals present
  const blob = [goal, features, pages, constraints].join(' ').toLowerCase()
  if (/ورود|login|پرداخت|payment|حساب|account|کاربر|user/.test(blob) || project.type === 'store' || project.type === 'webapp') {
    push(
      isFa ? 'حفاظت از داده کاربر' : 'Protect user data',
      isFa ? 'اطلاعات حساس نباید در خروجی عمومی یا پیش‌نمایش نشت کند.' : 'Sensitive data must not leak in public output or preview.',
      'security',
      1,
      [],
      isFa ? 'هیچ راز یا کلید در فایل کلاینت نیست.' : 'No secrets or keys in client files.',
    )
  }

  for (const u of analysis.unknown) {
    push(u, u, 'open_question', 1, [])
  }
  for (const c of analysis.contradictions) {
    push(isFa ? 'تناقض نیازسنجی' : 'Discovery contradiction', c, 'open_question', 1, [])
  }

  // de-dupe by title+description
  const seen = new Set<string>()
  const unique = items.filter(i => {
    const k = `${i.title}::${i.description}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  const summary = isFa
    ? `پروژه «${project.name}» (${project.type}). ${unique.filter(i => i.kind === 'functional').length} نیاز عملکردی، ${unique.filter(i => i.kind === 'security').length} امنیتی، ${unique.filter(i => i.kind === 'open_question').length} سؤال باز. ${analysis.contradictions.length ? 'تناقض شناسایی شد.' : ''}`
    : `Project “${project.name}” (${project.type}). ${unique.filter(i => i.kind === 'functional').length} functional, ${unique.filter(i => i.kind === 'security').length} security, ${unique.filter(i => i.kind === 'open_question').length} open. ${analysis.contradictions.length ? 'Contradictions found.' : ''}`

  return {
    items: unique,
    summary,
    confirmed: false,
    updatedAt: new Date().toISOString(),
  }
}

export function requirementsToMarkdown(project: Project, req: RequirementsData, isFa: boolean): string {
  const lines: string[] = []
  lines.push(isFa ? `# سند نیازمندی‌ها — ${project.name}` : `# Requirements — ${project.name}`)
  lines.push('')
  lines.push(req.summary)
  lines.push('')
  const groups: RequirementItem['kind'][] = ['functional', 'non_functional', 'constraint', 'security', 'open_question']
  const labels: Record<RequirementItem['kind'], string> = isFa
    ? { functional: 'عملکردی', non_functional: 'غیرفعالکردی', constraint: 'محدودیت', security: 'امنیتی', open_question: 'سؤال باز' }
    : { functional: 'Functional', non_functional: 'Non-functional', constraint: 'Constraints', security: 'Security', open_question: 'Open questions' }
  for (const g of groups) {
    const list = req.items.filter(i => i.kind === g)
    if (!list.length) continue
    lines.push(`## ${labels[g]}`)
    lines.push('')
    for (const item of list) {
      lines.push(`### ${item.code ? item.code + ' — ' : ''}${item.title}`)
      lines.push(item.description)
      if (item.acceptanceCriteria) {
        lines.push(isFa ? `**معیار پذیرش:** ${item.acceptanceCriteria}` : `**Acceptance:** ${item.acceptanceCriteria}`)
      }
      lines.push('')
    }
  }
  return lines.join('\n')
}
