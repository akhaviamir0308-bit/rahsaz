/**
 * Project Guidance Engine — experimental core of Rahsaz vision.
 */
import type { Project, ProjectStage } from '../../shared/types'
import { pickNextTask } from '../planning/planningEngine'

export type GateStatus =
  | 'locked'
  | 'not_started'
  | 'in_progress'
  | 'waiting_for_user'
  | 'completed'
  | 'blocked'

export interface StageGate {
  id: string
  stage: ProjectStage | 'design' | 'ai' | 'quality'
  titleFa: string
  titleEn: string
  status: GateStatus
  reasonsFa: string[]
  reasonsEn: string[]
  tab: string
}

export interface GuidanceResult {
  stages: StageGate[]
  currentFocus: StageGate
  nextActionFa: string
  nextActionEn: string
  nextTab: string
  progressPct: number
  canPublish: boolean
  blockersFa: string[]
  blockersEn: string[]
}

function fileCount(p: Project): number {
  return (p.files?.files || []).filter(f => f.kind === 'file').length
}

export function evaluateGuidance(project: Project, qaDone: number, qaTotal: number): GuidanceResult {
  const answers = project.discovery?.answers?.filter(a => a.value?.trim()).length || 0
  const discoveryConfirmed = Boolean(project.discovery?.confirmed)
  const reqItems = project.requirements?.items?.length || 0
  const reqConfirmed = Boolean(project.requirements?.confirmed)
  const archOk = Boolean(project.architecture?.confirmed && project.architecture?.stack?.length)
  const tasks = project.tasks || []
  const planTasks = tasks.filter(t => t.source === 'planning')
  const tasksDone = tasks.filter(t => t.done).length
  const files = fileCount(project)
  const hasAi = (project.ai?.messages?.length || 0) > 0
  const snaps = project.versions?.snapshots?.length || 0
  const tests = project.testReport?.checks || []
  const testsRan = tests.length > 0
  const designPages = project.design?.pages?.length || project.architecture?.pages?.length || 0
  const designConfirmed = Boolean(project.design?.confirmed)

  const stages: StageGate[] = []

  // Discovery
  {
    let status: GateStatus = 'not_started'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (answers === 0) {
      status = 'not_started'
      reasonsFa.push('هنوز پاسخی ثبت نشده')
      reasonsEn.push('No answers recorded')
    } else if (!discoveryConfirmed) {
      status = answers >= 3 ? 'waiting_for_user' : 'in_progress'
      if (answers < 3) {
        reasonsFa.push(`حداقل ۳ پاسخ لازم است (الان ${answers})`)
        reasonsEn.push(`At least 3 answers required (now ${answers})`)
      }
      reasonsFa.push('نیازسنجی باید تأیید شود')
      reasonsEn.push('Discovery must be confirmed')
    } else {
      status = 'completed'
      reasonsFa.push('نیازسنجی تأیید شده')
      reasonsEn.push('Discovery confirmed')
    }
    stages.push({
      id: 'discovery', stage: 'discovery', titleFa: 'نیازسنجی', titleEn: 'Discovery',
      status, reasonsFa, reasonsEn, tab: 'discovery',
    })
  }

  // Requirements
  {
    let status: GateStatus = discoveryConfirmed ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!discoveryConfirmed) {
      reasonsFa.push('اول نیازسنجی را تمام کنید')
      reasonsEn.push('Finish discovery first')
    } else if (reqItems === 0) {
      status = 'not_started'
      reasonsFa.push('سند نیازمندی هنوز ساخته نشده')
      reasonsEn.push('Requirements not generated')
    } else if (!reqConfirmed) {
      status = 'waiting_for_user'
      reasonsFa.push('نیازمندی‌ها را بررسی و تأیید کنید')
      reasonsEn.push('Review and confirm requirements')
    } else {
      status = 'completed'
      reasonsFa.push(`${reqItems} نیازمندی تأییدشده`)
      reasonsEn.push(`${reqItems} requirements confirmed`)
    }
    stages.push({
      id: 'requirements', stage: 'planning', titleFa: 'نیازمندی‌ها', titleEn: 'Requirements',
      status, reasonsFa, reasonsEn, tab: 'requirements',
    })
  }

  // Architecture
  {
    let status: GateStatus = reqConfirmed ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!reqConfirmed) {
      reasonsFa.push('اول نیازمندی‌ها را تأیید کنید')
      reasonsEn.push('Confirm requirements first')
    } else if (!project.architecture?.stack?.length) {
      status = 'not_started'
      reasonsFa.push('معماری هنوز پیشنهاد نشده')
      reasonsEn.push('Architecture not suggested yet')
    } else if (!archOk) {
      status = 'waiting_for_user'
      reasonsFa.push('معماری را تأیید کنید')
      reasonsEn.push('Confirm architecture')
    } else {
      status = 'completed'
      reasonsFa.push(project.architecture!.approachLabel)
      reasonsEn.push(project.architecture!.approachLabel)
    }
    stages.push({
      id: 'architecture', stage: 'design', titleFa: 'معماری', titleEn: 'Architecture',
      status, reasonsFa, reasonsEn, tab: 'architecture',
    })
  }

  // Design
  {
    let status: GateStatus = archOk ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!archOk) {
      reasonsFa.push('اول معماری را تأیید کنید')
      reasonsEn.push('Confirm architecture first')
    } else if (designPages === 0) {
      status = 'not_started'
      reasonsFa.push('صفحات طراحی مشخص نشده')
      reasonsEn.push('Design pages not set')
    } else if (!designConfirmed) {
      status = 'waiting_for_user'
      reasonsFa.push('طرح صفحات را تأیید کنید')
      reasonsEn.push('Confirm page design')
    } else {
      status = 'completed'
      reasonsFa.push(`${designPages} صفحه`)
      reasonsEn.push(`${designPages} pages`)
    }
    stages.push({
      id: 'design', stage: 'design', titleFa: 'طراحی UI/UX', titleEn: 'UI/UX Design',
      status, reasonsFa, reasonsEn, tab: 'design',
    })
  }

  // Planning
  {
    let status: GateStatus = archOk ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!archOk) {
      reasonsFa.push('اول معماری را تأیید کنید')
      reasonsEn.push('Confirm architecture first')
    } else if (planTasks.length === 0) {
      status = 'not_started'
      reasonsFa.push('برنامه وظایف ساخته نشده')
      reasonsEn.push('Task plan not generated')
    } else {
      status = tasksDone >= tasks.length && tasks.length > 0 ? 'completed' : 'in_progress'
      reasonsFa.push(`${tasksDone}/${tasks.length} وظیفه`)
      reasonsEn.push(`${tasksDone}/${tasks.length} tasks`)
    }
    stages.push({
      id: 'planning', stage: 'development', titleFa: 'برنامه‌ریزی و توسعه', titleEn: 'Planning & build',
      status, reasonsFa, reasonsEn, tab: 'tasks',
    })
  }

  // AI
  {
    let status: GateStatus = archOk ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!archOk) {
      reasonsFa.push('پس از معماری فعال می‌شود')
      reasonsEn.push('Unlocks after architecture')
    } else if (!hasAi) {
      status = 'not_started'
      reasonsFa.push('هنوز پاسخ AI ذخیره نشده (حالت دستی)')
      reasonsEn.push('No AI response saved yet (manual mode)')
    } else {
      status = 'completed'
      reasonsFa.push('حداقل یک پاسخ AI ثبت شده')
      reasonsEn.push('At least one AI response recorded')
    }
    stages.push({
      id: 'ai', stage: 'ai', titleFa: 'هوش مصنوعی (دستی)', titleEn: 'AI (manual)',
      status, reasonsFa, reasonsEn, tab: 'ai',
    })
  }

  // Quality
  {
    let status: GateStatus = archOk ? 'not_started' : 'locked'
    const reasonsFa: string[] = []
    const reasonsEn: string[] = []
    if (!archOk) {
      reasonsFa.push('قفل تا تأیید معماری')
      reasonsEn.push('Locked until architecture is confirmed')
    } else if (files === 0) {
      status = 'not_started'
      reasonsFa.push('فایلی در پروژه نیست')
      reasonsEn.push('No project files')
    } else if (!testsRan || qaDone < Math.ceil(qaTotal / 2)) {
      status = 'in_progress'
      reasonsFa.push(`فایل: ${files} · تست: ${testsRan ? 'بله' : 'خیر'} · QA: ${qaDone}/${qaTotal}`)
      reasonsEn.push(`Files: ${files} · tests: ${testsRan ? 'yes' : 'no'} · QA: ${qaDone}/${qaTotal}`)
    } else {
      status = 'completed'
      reasonsFa.push('فایل + تست + QA')
      reasonsEn.push('Files + tests + QA')
    }
    stages.push({
      id: 'quality', stage: 'quality', titleFa: 'فایل، تست و کیفیت', titleEn: 'Files, tests & quality',
      status, reasonsFa, reasonsEn, tab: files === 0 ? 'files' : 'preview',
    })
  }

  // Publish
  {
    const blockersFa: string[] = []
    const blockersEn: string[] = []
    if (!discoveryConfirmed) { blockersFa.push('نیازسنجی'); blockersEn.push('discovery') }
    if (!reqConfirmed) { blockersFa.push('نیازمندی'); blockersEn.push('requirements') }
    if (!archOk) { blockersFa.push('معماری'); blockersEn.push('architecture') }
    if (files === 0) { blockersFa.push('فایل'); blockersEn.push('files') }
    if (!testsRan) { blockersFa.push('تست'); blockersEn.push('tests') }
    if (snaps === 0) { blockersFa.push('snapshot'); blockersEn.push('snapshot') }

    let status: GateStatus = blockersFa.length ? 'locked' : 'waiting_for_user'
    if (project.stage === 'published') status = 'completed'

    stages.push({
      id: 'publish', stage: 'published', titleFa: 'انتشار', titleEn: 'Publish',
      status,
      reasonsFa: blockersFa.length ? blockersFa.map(b => `مانع: ${b}`) : ['آماده راهنمای انتشار'],
      reasonsEn: blockersEn.length ? blockersEn.map(b => `Blocked by: ${b}`) : ['Ready for publish guide'],
      tab: 'publish',
    })
  }

  const incomplete = stages.find(s => s.status !== 'completed' && s.status !== 'locked')
    || stages.find(s => s.status === 'locked')
    || stages[stages.length - 1]

  const completedCount = stages.filter(s => s.status === 'completed').length
  const progressPct = Math.round((completedCount / stages.length) * 100)

  const nextTask = pickNextTask(tasks)
  let nextActionFa = incomplete.reasonsFa[0] || 'ادامه بده'
  let nextActionEn = incomplete.reasonsEn[0] || 'Continue'
  if (incomplete.id === 'planning' && nextTask) {
    nextActionFa = `وظیفه بعدی: ${nextTask.title}`
    nextActionEn = `Next task: ${nextTask.title}`
  }

  const publishGate = stages.find(s => s.id === 'publish')!
  const canPublish = publishGate.status === 'waiting_for_user' || publishGate.status === 'completed'

  return {
    stages,
    currentFocus: incomplete,
    nextActionFa,
    nextActionEn,
    nextTab: incomplete.tab,
    progressPct,
    canPublish,
    blockersFa: publishGate.reasonsFa.filter(r => r.startsWith('مانع')),
    blockersEn: publishGate.reasonsEn.filter(r => r.startsWith('Blocked')),
  }
}
