import type { DiscoveryData, Project, ProjectType, RequirementItem, RequirementsData } from '../types'
import { uid } from '../uid'

function ans(d: DiscoveryData | undefined, id: string): string {
  return (d?.answers || []).find(a => a.questionId === id)?.value?.trim() || ''
}

/** Split a free-text list on commas / newlines / "؛" while ignoring separators inside (...) */
export function splitList(raw: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of raw) {
    if (ch === '(' || ch === '（' || ch === '[') depth++
    if (ch === ')' || ch === '）' || ch === ']') depth = Math.max(0, depth - 1)
    if (depth === 0 && /[،,\n؛;]/.test(ch)) { out.push(cur); cur = '' } else cur += ch
  }
  out.push(cur)
  return out.map(s => s.trim().replace(/^[-•*\d.)\s]+(?=\S)/, '')).filter(Boolean)
}

/** "یک صفحه با پنج بخش: Hero، درباره من" → ["Hero", "درباره من"] */
export function parsePages(raw: string): string[] {
  let text = raw.trim()
  const m = /^([^:：\n]{3,80})[:：]\s*(.+)$/s.exec(text)
  if (m && !/[،,]/.test(m[1])) text = m[2]
  return splitList(text)
}

/** Stable fingerprint of the discovery answers (detects "requirements are outdated"). */
export function discoveryHash(project: Project): string {
  const a = [...(project.discovery?.answers || [])]
    .sort((x, y) => x.questionId.localeCompare(y.questionId))
    .map(x => `${x.questionId}=${x.value.trim()}`)
    .join('|')
  let h = 5381
  for (let i = 0; i < a.length; i++) h = ((h << 5) + h + a.charCodeAt(i)) | 0
  return String(h >>> 0)
}

const TYPE_LABEL: Record<ProjectType, { fa: string; en: string }> = {
  portfolio: { fa: 'نمونه‌کار / رزومه', en: 'portfolio' },
  business: { fa: 'کسب‌وکار', en: 'business' },
  store: { fa: 'فروشگاه', en: 'store' },
  education: { fa: 'آموزشی', en: 'education' },
  blog: { fa: 'وبلاگ', en: 'blog' },
  booking: { fa: 'رزرو', en: 'booking' },
  community: { fa: 'انجمن', en: 'community' },
  webapp: { fa: 'وب‌اپ', en: 'web app' },
}

/** Build structured requirements from discovery answers + project meta. */
export function buildRequirements(project: Project, isFa: boolean): RequirementsData {
  const d = project.discovery
  const items: RequirementItem[] = []
  const push = (title: string, description: string, kind: RequirementItem['kind'], priority: 1 | 2 | 3, sourceQuestionIds: string[]) => {
    items.push({ id: uid(), title, description, kind, priority, sourceQuestionIds })
  }

  const goal = ans(d, 'q_goal')
  const audience = ans(d, 'q_audience')
  const features = ans(d, 'q_features')
  const pages = ans(d, 'q_pages')
  const content = ans(d, 'q_content')
  const design = ans(d, 'q_design')
  const constraints = ans(d, 'q_constraints')
  const success = ans(d, 'q_success')

  if (goal) push(isFa ? 'هدف اصلی محصول' : 'Primary product goal', goal, 'functional', 1, ['q_goal'])
  if (audience) push(isFa ? 'مخاطب هدف' : 'Target audience', audience, 'functional', 1, ['q_audience'])
  if (features) {
    const parts = splitList(features)
    if (parts.length > 1) {
      parts.forEach((p, i) => push(p, p, 'functional', i < 3 ? 1 : 2, ['q_features']))
    } else {
      push(isFa ? 'قابلیت‌های ضروری' : 'Essential features', features, 'functional', 1, ['q_features'])
    }
  }
  if (pages) push(isFa ? 'صفحات مورد نیاز' : 'Required pages', pages, 'functional', 1, ['q_pages'])
  if (content) push(isFa ? 'منبع محتوا' : 'Content source', content, 'non_functional', 2, ['q_content'])
  if (design) push(isFa ? 'سبک ظاهری' : 'Visual style', design, 'non_functional', 2, ['q_design'])
  if (constraints) push(isFa ? 'محدودیت‌ها' : 'Constraints', constraints, 'constraint', 1, ['q_constraints'])
  if (success) push(isFa ? 'معیار موفقیت' : 'Success metrics', success, 'non_functional', 2, ['q_success'])

  // Type-based baseline requirements (skipped when the user's own answers already cover them)
  const typeDefaults: Record<ProjectType, string[]> = {
    portfolio: isFa ? ['نمایش نمونه‌کارها', 'صفحه درباره', 'راه تماس'] : ['Showcase work', 'About page', 'Contact path'],
    business: isFa ? ['معرفی خدمات', 'اعتمادسازی', 'دعوت به تماس'] : ['Present services', 'Build trust', 'Clear CTA'],
    store: isFa ? ['فهرست محصول', 'سبد خرید یا مسیر سفارش', 'اطلاعات پرداخت/ارسال'] : ['Product listing', 'Cart or order path', 'Payment/shipping info'],
    education: isFa ? ['فهرست دوره/محتوا', 'صفحه جزئیات', 'ثبت‌نام یا تماس'] : ['Course/content list', 'Detail page', 'Signup or contact'],
    blog: isFa ? ['فهرست مطالب', 'صفحه تک‌مطلب', 'دسته‌بندی یا برچسب'] : ['Post list', 'Single post', 'Categories or tags'],
    booking: isFa ? ['انتخاب خدمت/زمان', 'فرم رزرو', 'تأیید درخواست'] : ['Service/time selection', 'Booking form', 'Confirmation'],
    community: isFa ? ['عضویت', 'فهرست موضوعات', 'قوانین جامعه'] : ['Membership', 'Topic list', 'Community rules'],
    webapp: isFa ? ['ورود یا شناسایی کاربر', 'داشبورد اصلی', 'ذخیره داده کاربر'] : ['Auth or identity', 'Main dashboard', 'User data persistence'],
  }
  const answered = (features + ' ' + pages + ' ' + goal).toLowerCase()
  const baseTitle = isFa ? `پایه نوع «${TYPE_LABEL[project.type]?.fa || project.type}»` : `Baseline for ${TYPE_LABEL[project.type]?.en || project.type}`
  for (const t of typeDefaults[project.type] || []) {
    // cheap overlap test: any meaningful word (≥3 chars) of the baseline already mentioned by the user
    const words = t.toLowerCase().split(/[\s/]+/).filter(w => w.length >= 3)
    if (words.some(w => answered.includes(w))) continue
    push(baseTitle, t, 'functional', 2, [])
  }

  if (!goal) push(isFa ? 'هدف پروژه هنوز مبهم است' : 'Project goal is still unclear', isFa ? 'در نیازسنجی هدف اصلی را دقیق‌تر بنویسید.' : 'Clarify the main goal in Discovery.', 'open_question', 1, ['q_goal'])
  if (!features && !pages) push(isFa ? 'صفحات و قابلیت‌ها ناقص است' : 'Pages and features are incomplete', isFa ? 'حداقل صفحات یا قابلیت‌های ضروری را مشخص کنید.' : 'Specify at least essential pages or features.', 'open_question', 1, ['q_features', 'q_pages'])
  if (!audience) push(isFa ? 'مخاطب مشخص نیست' : 'Audience is unclear', isFa ? 'مشخص کنید سایت برای چه کسانی ساخته می‌شود.' : 'State who the site is for.', 'open_question', 2, ['q_audience'])

  return { items, summary: summarize(project, items, isFa), confirmed: false, updatedAt: new Date().toISOString(), sourceHash: discoveryHash(project) }
}

export function summarize(project: Project, items: RequirementItem[], isFa: boolean): string {
  const n = (k: RequirementItem['kind']) => items.filter(i => i.kind === k).length
  return isFa
    ? `پروژه «${project.name}». ${n('functional')} نیاز عملکردی، ${n('non_functional')} غیرعملکردی، ${n('constraint')} محدودیت، ${n('open_question')} سؤال باز.`
    : `Project “${project.name}”. ${n('functional')} functional, ${n('non_functional')} non-functional, ${n('constraint')} constraints, ${n('open_question')} open questions.`
}

export const KIND_LABELS: Record<RequirementItem['kind'], { fa: string; en: string }> = {
  functional: { fa: 'عملکردی', en: 'Functional' },
  non_functional: { fa: 'غیرعملکردی', en: 'Non-functional' },
  constraint: { fa: 'محدودیت', en: 'Constraint' },
  open_question: { fa: 'سؤال باز', en: 'Open question' },
}

export function requirementsToMarkdown(project: Project, req: RequirementsData, isFa: boolean): string {
  const lines: string[] = []
  lines.push(isFa ? `# سند نیازمندی‌ها — ${project.name}` : `# Requirements — ${project.name}`, '', req.summary, '')
  const groups: RequirementItem['kind'][] = ['functional', 'non_functional', 'constraint', 'open_question']
  for (const g of groups) {
    const list = req.items.filter(i => i.kind === g)
    if (!list.length) continue
    lines.push(`## ${isFa ? KIND_LABELS[g].fa : KIND_LABELS[g].en}`, '')
    for (const item of list) {
      lines.push(`### ${item.title} (P${item.priority})`, item.description, '')
    }
  }
  return lines.join('\n')
}
