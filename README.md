# Rahsaz — v0.10.2

Local-first, bilingual (fa/en) website-building workspace with AI-assisted workflow, academy, file tree, preview, versioning, and publish export.

## Maintenance release (0.10.2)
- Storage key updated to `rahsaz.projects.v0102` (migrates from older keys)
- `@vitejs/plugin-react` moved to `devDependencies`
- Stale `package-lock.json` removed (run `npm install` to regenerate)
- `ProjectCard` extracted to `src/components/ProjectCard.tsx`
- Prompt / next-step helpers moved to `src/lib/workspaceMeta.ts`
- Types and storage headers updated to current version

## Structure
```
src/
  App.tsx                 # shell: dashboard + workspace orchestration
  components/
    LearnView.tsx
    PreviewPane.tsx
    ProjectCard.tsx
  lib/
    workspaceMeta.ts      # prompts, QA keys, next-step coach
  data/                   # translations, learn content, demo
  storage.ts              # localStorage + migrations
  preview.ts / zip.ts     # preview builder + ZIP export
```

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Note on architecture
Further splits (FilesPanel, DiscoveryForm, AiAssistant as standalone components and a `useProjects` hook) are the recommended next refactor. Preview and Learn are already modular.
