import type { Project, ProjectFile, TestCheck, TestReport } from '../../shared/types'
import { findBrokenRefs, listPages } from '../preview/preview'
import { detectProjectKind } from '../preview/projectKind'

/**
 * Multi-layer lightweight tests (Package E / Phase 13).
 * These are structural/static checks — not a full browser E2E suite.
 */
export function runProjectTests(project: Project, filesAll: ProjectFile[]): TestReport {
  const files = filesAll.filter(f => f.kind === 'file')
  const checks: TestCheck[] = []
  const kind = detectProjectKind(filesAll)

  const hasIndex = files.some(f => f.path === 'index.html' || f.path.endsWith('/index.html'))
  checks.push({
    id: 'hasIndex',
    labelKey: 'tc_hasIndex',
    ok: hasIndex || kind.kind === 'react_vite',
    detail: hasIndex ? 'tc_hasIndex_ok' : (kind.kind === 'react_vite' ? 'tc_hasIndex_ok' : 'tc_hasIndex_fail'),
  })

  const emptyFiles = files.filter(f => (f.content || '').trim() === '')
  checks.push({
    id: 'notEmpty',
    labelKey: 'tc_notEmpty',
    ok: emptyFiles.length === 0,
    detail: emptyFiles.length === 0 ? 'tc_notEmpty_ok' : 'tc_notEmpty_fail',
  })

  const hasCss = files.some(f => f.path.endsWith('.css'))
  checks.push({
    id: 'hasCss',
    labelKey: 'tc_hasCss',
    ok: hasCss || kind.kind === 'react_vite',
    detail: hasCss || kind.kind === 'react_vite' ? 'tc_hasCss_ok' : 'tc_hasCss_fail',
  })

  const pages = listPages(filesAll)
  if (pages.length > 0) {
    const missing = [...new Set(pages.flatMap(pg => findBrokenRefs(filesAll, pg)))]
    const critical = missing.filter(r =>
      !/\.(png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|otf|mp4|webm|mp3|pdf)$/i.test(r.replace(/[?#].*$/, '')),
    )
    checks.push({
      id: 'brokenRefs',
      labelKey: 'tc_brokenRefs',
      ok: critical.length === 0,
      detail: critical.length === 0 ? 'tc_brokenRefs_ok' : critical.slice(0, 5).join(', '),
    })
  }

  checks.push({
    id: 'fileCount',
    labelKey: 'tc_fileCount',
    ok: files.length > 0,
    detail: String(files.length),
  })

  // Layer: requirements coverage signal
  const reqCount = project.requirements?.items?.length || 0
  const reqConfirmed = Boolean(project.requirements?.confirmed)
  checks.push({
    id: 'requirements',
    labelKey: 'tc_requirements',
    ok: reqCount > 0 && reqConfirmed,
    detail: reqConfirmed ? `tc_req_ok:${reqCount}` : (reqCount ? 'tc_req_unconfirmed' : 'tc_req_missing'),
  })

  // Layer: architecture confirmed
  checks.push({
    id: 'architecture',
    labelKey: 'tc_architecture',
    ok: Boolean(project.architecture?.confirmed),
    detail: project.architecture?.confirmed ? 'tc_arch_ok' : 'tc_arch_missing',
  })

  // Layer: security — no obvious secrets in text files
  const secretHit = files.some(f =>
    /(?:api[_-]?key|secret|password|BEGIN PRIVATE KEY)\s*[:=]/i.test(f.content || ''),
  )
  checks.push({
    id: 'noSecrets',
    labelKey: 'tc_noSecrets',
    ok: !secretHit,
    detail: secretHit ? 'tc_noSecrets_fail' : 'tc_noSecrets_ok',
  })

  // Layer: snapshots recommended before publish
  const snaps = project.versions?.snapshots?.length || 0
  checks.push({
    id: 'hasSnapshot',
    labelKey: 'tc_hasSnapshot',
    ok: snaps > 0,
    detail: snaps > 0 ? `tc_snap_ok:${snaps}` : 'tc_snap_missing',
  })

  // Pro project entry
  if (kind.kind === 'react_vite') {
    const hasEntry = files.some(f =>
      /^(src\/)?main\.(t|j)sx?$/.test(f.path) || f.path === 'src/App.tsx',
    )
    checks.push({
      id: 'reactEntry',
      labelKey: 'tc_reactEntry',
      ok: hasEntry,
      detail: hasEntry ? 'tc_react_ok' : 'tc_react_missing',
    })
  }

  return { checks, ranAt: new Date().toISOString() }
}
