# Rahsaz v0.11.1 — Architecture notes

Local-first React + TypeScript + Vite app. All data lives in `localStorage` (`rahsaz.projects.v0110`, migrating from older keys).

## Data flow (matches the module matrix of the product document)
Discovery → **Requirements** → **Architecture** → **Plan (tasks)** → AI prompts → Files → Preview → Tests/QA → Publish

| Module | File | Notes |
|---|---|---|
| Requirements | `lib/requirementsEngine.ts` | `buildRequirements`, `discoveryHash` (outdated detection), `splitList`, `parsePages`, Markdown export |
| Architecture | `lib/architectureAdvisor.ts` | keyword rules, word-bounded, negation-aware; suggestion only |
| Planning | `lib/planningEngine.ts` | keeps `done` of regenerated tasks; skips meta items |
| Coach / prompts | `lib/workspaceMeta.ts` | next step, tab help, prompt templates |
| Preview | `preview.ts`, `components/PreviewPane.tsx` | real-width sandboxed iframe, path resolving, error bridge |
| Academy | `data/learn.ts`, `components/LearnView.tsx` | bilingual lessons, prompt bank, glossary |
| Storage | `storage.ts` | normalisers per entity, legacy-key migration, import/export |

## Invariants
- A project never moves backwards in `stage` automatically.
- Existing user work (edited requirements, confirmed architecture) is never overwritten without confirmation.
- Test reports are valid only if newer than the last file change.

## Known limits (honest)
Local-only storage (~5 MB), text-only files, no direct AI connection, no real build/test runner for user code, publishing is manual (ZIP → Netlify/Cloudflare).
