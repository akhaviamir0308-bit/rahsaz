# Package 1 (new document) — Phases 1–2

## Phase 1
- `docs/AUDIT_v0.19.0.md`

## Phase 2 (started)
- `src/lib/*` now **re-export only** from `src/modules/*` (single source of truth)
- Extracted `ProductPathBanner`, `ProjectStatusCard` to `shared/components`
- `core/errors/AppError.ts` shared error shape
- Deduplicated `pickNextTask` import in App

## Remaining architecture work
- Further split App.tsx (workspace panels)
- Remove reliance on App for module business logic
