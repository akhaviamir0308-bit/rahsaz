import type { DiscoveryData, Project, ProjectType, RequirementItem, RequirementsData } from '../../shared/types'
import { uid } from '../../core/uid'

function ans(d: DiscoveryData | undefined, id: string): string {
  return (d?.answers || []).find(a => a.questionId === id)?.value?.trim() || ''
}

/**
 * Build structured requirements from discovery answers + project meta.
 */
export function buildRequirements(project: Project, isFa: boolean): RequirementsData {
  const d = project.discovery
  const items: RequirementItem[] = []
  const push = (
    title: string,
    description: string,
    kind: RequirementItem['kind'],
    priority: 1 | 2 | 3,
    sourceQuestionIds: string[],
  ) => {
    items.push({
      id: uid(),
      title,
      description,
      kind,
      priority,
      sourceQuestionIds,
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

  if (goal) {
    push(
      isFa ? 'هدف اصلی محصول' : 'Primary product goal',
      goal,
      'functional',
      1,
      ['q_goal'],
    )
  }
  if (audience) {
    push(
      isFa ? 'مخاطب هدف' : 'Target audience',
      audience,
      'functional',
      1,
      ['q_audience'],
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
    )
  }
  if (content) {
    push(
      isFa ? 'منبع محتوا' : 'Content source',
      content,
      'non_functional',
      2,
      ['q_content'],
    )
  }
  if (design) {
    push(
      isFa ? 'سبک ظاهری' : 'Visual style',
      design,
      'non_functional',
      2,
      ['q_design'],
    )
  }
  if (constraints) {
    push(
      isFa ? 'محدودیت‌ها' : 'Constraints',
      constraints,
      'constraint',
      1,
      ['q_constraints'],
    )
  }
  if (success) {
    push(
      isFa ? 'معیار موفقیت' : 'Success metrics',
      success,
      'non_functional',
      2,
      ['q_success'],
    )
  }

  // Type-based baseline requirements
  const typeDefaults: Record<ProjectType, string[]> = {
    portfolio: isFa
      ? ['نمایش نمونه‌کارها', 'صفحه درباره', 'راه تماس']
      : ['Showcase work', 'About page', 'Contact path'],
    business: isFa
      ? ['معرفی خدمات', 'اعتمادسازی', 'دعوت به تماس']
      : ['Present services', 'Build trust', 'Clear CTA'],
    store: isFa
      ? ['فهرست محصول', 'سبد خرید یا مسیر سفارش', 'اطلاعات پرداخت/ارسال']
      : ['Product listing', 'Cart or order path', 'Payment/shipping info'],
    education: isFa
      ? ['فهرست دوره/محتوا', 'صفحه جزئیات', 'ثبت‌نام یا تماس']
      : ['Course/content list', 'Detail page', 'Signup or contact'],
    blog: isFa
      ? ['فهرست مطالب', 'صفحه تک‌مطلب', 'دسته‌بندی یا برچسب']
      : ['Post list', 'Single post', 'Categories or tags'],
    booking: isFa
      ? ['انتخاب خدمت/زمان', 'فرم رزرو', 'تأیید درخواست']
      : ['Service/time selection', 'Booking form', 'Confirmation'],
    community: isFa
      ? ['عضویت', 'فهرست موضوعات', 'قوانین جامعه']
      : ['Membership', 'Topic list', 'Community rules'],
    webapp: isFa
      ? ['ورود یا شناسایی کاربر', 'داشبورد اصلی', 'ذخیره داده کاربر']
      : ['Auth or identity', 'Main dashboard', 'User data persistence'],
  }
  for (const t of typeDefaults[project.type] || []) {
    const exists = items.some(i => i.description.includes(t) || i.title.includes(t))
    if (!exists) {
      push(
        isFa ? `پایه نوع «${project.type}»` : `Baseline for ${project.type}`,
        t,
        'functional',
        2,
        [],
      )
    }
  }

  if (!goal) {
    push(
      isFa ? 'هدف پروژه هنوز مبهم است' : 'Project goal is still unclear',
      isFa ? 'در نیازسنجی هدف اصلی را دقیق‌تر بنویسید.' : 'Clarify the main goal in Discovery.',
      'open_question',
      1,
      ['q_goal'],
    )
  }
  if (!features && !pages) {
    push(
      isFa ? 'صفحات و قابلیت‌ها ناقص است' : 'Pages and features are incomplete',
      isFa ? 'حداقل صفحات یا قابلیت‌های ضروری را مشخص کنید.' : 'Specify at least essential pages or features.',
      'open_question',
      1,
      ['q_features', 'q_pages'],
    )
  }

  const summary = isFa
    ? `پروژه «${project.name}» از نوع ${project.type}. ${items.filter(i => i.kind === 'functional').length} نیاز عملکردی، ${items.filter(i => i.kind === 'constraint').length} محدودیت، ${items.filter(i => i.kind === 'open_question').length} سؤال باز.`
    : `Project “${project.name}” (${project.type}). ${items.filter(i => i.kind === 'functional').length} functional, ${items.filter(i => i.kind === 'constraint').length} constraints, ${items.filter(i => i.kind === 'open_question').length} open questions.`

  return {
    items,
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
      lines.push(`### ${item.title}`)
      lines.push(item.description)
      lines.push('')
    }
  }
  return lines.join('\n')
}
