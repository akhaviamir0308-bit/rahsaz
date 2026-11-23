# Rahsaz v0.10.2 architecture

## Storage
- Key: `rahsaz.projects.v0102`
- Migrates from v080, v070, … v020
- Backend: localStorage (quota-limited; large file trees should move to IndexedDB later)

## Modules
- `preview.ts` — path resolve, CSS/JS inline, preview document
- `zip.ts` — store-only ZIP for export
- `lib/workspaceMeta.ts` — AI prompt builders, tab help, next-step suggestions
- `components/*` — LearnView, PreviewPane, ProjectCard

## Known follow-ups
- Split remaining workspace tabs out of App.tsx
- CodeMirror for file editing
- ESLint/Prettier + tests for resolveRef / migrations / zip
