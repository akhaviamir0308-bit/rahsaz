/** Three-layer product path banner — shows current position when project is open */
import type { ProjectStage } from '../../shared/types'

const STEPS: { id: string; stage?: ProjectStage; fa: string; en: string }[] = [
  { id: 'idea', fa: 'ایده', en: 'Idea' },
  { id: 'discovery', stage: 'discovery', fa: 'نیازسنجی', en: 'Discovery' },
  { id: 'requirements', stage: 'planning', fa: 'نیازمندی', en: 'Requirements' },
  { id: 'architecture', stage: 'planning', fa: 'معماری', en: 'Architecture' },
  { id: 'plan', stage: 'design', fa: 'برنامه', en: 'Plan' },
  { id: 'files', stage: 'development', fa: 'فایل‌ها', en: 'Files' },
  { id: 'preview', stage: 'development', fa: 'پیش‌نمایش', en: 'Preview' },
  { id: 'qa', stage: 'testing', fa: 'تست/کیفیت', en: 'Test/QA' },
  { id: 'publish', stage: 'published', fa: 'انتشار', en: 'Publish' },
]

const STAGE_INDEX: Record<ProjectStage, number> = {
  discovery: 1,
  planning: 3,
  design: 4,
  development: 6,
  testing: 7,
  published: 8,
}

export default function ProductPathBanner({
  isFa,
  stage,
  skillLevel,
}: {
  isFa: boolean
  stage?: ProjectStage
  skillLevel?: 'beginner' | 'intermediate' | 'advanced'
}) {
  const current = stage ? STAGE_INDEX[stage] ?? 0 : -1
  const layerHint =
    skillLevel === 'beginner'
      ? isFa
        ? 'تمرکز شما: لایه ۱ — مسیر آموزشی پروژه‌محور'
        : 'Focus: Layer 1 — project-based learning path'
      : skillLevel === 'advanced'
        ? isFa
          ? 'تمرکز شما: لایه ۳ — ابزارهای تخصصی'
          : 'Focus: Layer 3 — specialist tools'
        : isFa
          ? 'تمرکز شما: لایه ۲ — دستیار و ابزارهای کمکی'
          : 'Focus: Layer 2 — assistant & helpers'

  return (
    <div className="ai-block product-path-banner" style={{ marginBottom: 16 }}>
      <h3 className="ai-block-title">
        {isFa ? 'مسیر محصول راه‌ساز' : 'Rahsaz product path'}
      </h3>
      {skillLevel && (
        <p className="ai-hint" style={{ margin: '0 0 10px', fontSize: 12, opacity: 0.9 }}>
          {layerHint}
        </p>
      )}
      <div className="product-path-steps" role="list">
        {STEPS.map((s, i) => {
          const done = current >= 0 && i < current
          const active = current === i
          return (
            <span
              key={s.id}
              role="listitem"
              className={`path-step${done ? ' done' : ''}${active ? ' active' : ''}`}
              title={isFa ? s.fa : s.en}
            >
              {isFa ? s.fa : s.en}
            </span>
          )
        })}
      </div>
    </div>
  )
}
