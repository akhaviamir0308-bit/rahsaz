# Rahsaz — v0.3.0

A bilingual (Persian/English), theme-switchable workspace for AI-assisted website creation.

## What changed in 0.3.0 (Phase 1 – Project Workspace)

- **Dedicated Project Workspace**: click any project to enter its private workspace
- **Three workspace tabs**:
  - Overview — stage progress, status, task completion percentage
  - Tasks — add, complete, and delete simple tasks
  - Settings — edit name, description, type, stage, and status
- **Stage visualization**: six development stages with visual progress
- **Auto-open** newly created projects
- **Task progress** shown on project cards
- Migration from v0.2.0 and v0.2.1 localStorage data

## Current scope
- Persian/English interface with automatic RTL/LTR direction
- Dark/light theme
- Responsive dashboard
- Project creation, opening, editing, and deletion (with confirmation)
- Simple task management per project
- Browser-local persistence
- Foundation for future guided discovery, AI, and file modules

## Requirements
- Node.js LTS (includes npm)
- A modern browser

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Important limitations
This is still an early foundation. Project data is stored only in the current browser profile. There is no shared backend, authentication, AI provider connection, code editor, or real deployment engine yet. Do not put private information or API keys into this version.

## Next phases
- Phase 2: Smart discovery / requirements questionnaire
- Phase 3: AI assistant integration layer
- Phase 4: File & code management
