import type { Project, TestReport } from '../../shared/types'

export type QualityLevel = 'blocked' | 'needs_work' | 'almost' | 'ready'

export interface QualityReport {
  score: number
  level: QualityLevel
  levelLabelFa: string
  levelLabelEn: string
  critical: string[]
  warnings: string[]
  strengths: string[]
  publishBlocked: boolean
}

/**
 * Evidence-based quality summary (Package E / Phase 14).
 * Score is weighted; critical failures can block publish.
 */
export function buildQualityReport(
  project: Project,
  testReport: TestReport | undefined,
  qaDone: number,
  qaTotal: number,
): QualityReport {
  const critical: string[] = []
  const warnings: string[] = []
  const strengths: string[] = []

  const checks = testReport?.checks || []
  const failed = checks.filter(c => !c.ok)
  const passed = checks.filter(c => c.ok)

  for (const c of failed) {
    if (c.id === 'noSecrets' || c.id === 'hasIndex' || c.id === 'notEmpty') {
      critical.push(c.id)
    } else {
      warnings.push(c.id)
    }
  }
  for (const c of passed) strengths.push(c.id)

  if (!project.requirements?.confirmed) warnings.push('requirements_unconfirmed')
  else strengths.push('requirements_confirmed')

  if (!project.architecture?.confirmed) warnings.push('architecture_unconfirmed')
  else strengths.push('architecture_confirmed')

  const openReqs = (project.requirements?.items || []).filter(i => i.kind === 'open_question').length
  if (openReqs > 0) warnings.push(`open_questions:${openReqs}`)

  const testScore = checks.length ? (passed.length / checks.length) * 50 : 0
  const qaScore = qaTotal ? (qaDone / qaTotal) * 25 : 0
  const processScore =
    (project.requirements?.confirmed ? 8 : 0) +
    (project.architecture?.confirmed ? 8 : 0) +
    ((project.versions?.snapshots?.length || 0) > 0 ? 5 : 0) +
    ((project.files?.files || []).some(f => f.kind === 'file') ? 4 : 0)

  let score = Math.round(testScore + qaScore + processScore)
  if (score > 100) score = 100

  const publishBlocked = critical.length > 0 || score < 40

  let level: QualityLevel = 'needs_work'
  if (publishBlocked) level = 'blocked'
  else if (score >= 80) level = 'ready'
  else if (score >= 60) level = 'almost'
  else level = 'needs_work'

  const labels: Record<QualityLevel, { fa: string; en: string }> = {
    blocked: { fa: 'انتشار مسدود (مورد بحرانی)', en: 'Publish blocked (critical issues)' },
    needs_work: { fa: 'نیاز به کار بیشتر', en: 'Needs more work' },
    almost: { fa: 'نزدیک به آمادگی', en: 'Almost ready' },
    ready: { fa: 'آماده انتشار (با بررسی نهایی)', en: 'Ready to publish (final review)' },
  }

  return {
    score,
    level,
    levelLabelFa: labels[level].fa,
    levelLabelEn: labels[level].en,
    critical,
    warnings,
    strengths,
    publishBlocked,
  }
}
