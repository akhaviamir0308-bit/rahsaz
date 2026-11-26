import type { Project } from '../types'
import { buildProjectStatusReport, projectReportToMarkdown } from '../../modules/reports/projectReport'
import { QA_KEYS } from '../../modules/workspace/workspaceMeta'

export default function ProjectStatusCard({
  project,
  qaChecks,
  isFa,
  onCopied,
}: {
  project: Project
  qaChecks: Record<string, boolean>
  isFa: boolean
  onCopied: (msg: string) => void
}) {
  const qaDone = QA_KEYS.filter(k => qaChecks[k]).length
  const report = buildProjectStatusReport(project, qaDone, QA_KEYS.length, isFa)
  return (
    <div className="ai-block" style={{ marginTop: 16 }}>
      <h3 className="ai-block-title">{isFa ? 'گزارش وضعیت پروژه' : 'Project status report'}</h3>
      <p>
        <strong>{report.quality.score}/100</strong>
        {' — '}
        {isFa ? report.quality.levelLabelFa : report.quality.levelLabelEn}
      </p>
      <p className="ai-hint">
        {isFa ? 'فایل' : 'Files'}: {report.filesCount}
        {' · '}
        {isFa ? 'تست' : 'Tests'}: {report.testPass}/{report.testTotal}
        {' · '}
        {isFa ? 'نسخه' : 'Snapshots'}: {report.snapshotsCount}
      </p>
      {report.nextTaskTitle && (
        <p className="ai-hint">
          {isFa ? 'اقدام بعدی: ' : 'Next: '}
          <strong>{report.nextTaskTitle}</strong>
        </p>
      )}
      {report.warnings.slice(0, 4).map((w, i) => (
        <p key={i} className="ai-hint">• {w}</p>
      ))}
      <button
        type="button"
        className="secondary-button"
        style={{ marginTop: 8 }}
        onClick={() => {
          void navigator.clipboard.writeText(projectReportToMarkdown(report, isFa))
          onCopied(isFa ? 'گزارش کپی شد' : 'Report copied')
        }}
      >
        {isFa ? 'کپی گزارش' : 'Copy report'}
      </button>
    </div>
  )
}
