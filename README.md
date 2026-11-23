# Rahsaz — v0.2.1

A bilingual (Persian/English), theme-switchable starter for an AI-assisted website creation workspace.

## What changed in 0.2.1 (Phase 0 – Core Stabilization)

- **Stronger Project model**: added `updatedAt`, `status`, expanded `stage`
- **Dedicated storage layer** (`src/storage.ts`) with:
  - Clean load / create / delete / update API
  - Automatic migration from v0.2.0 localStorage key
  - Result-based error handling (no silent failures)
- **Two-step delete confirmation** modal (prevents accidental data loss)
- **Better error surface**: storage errors shown to the user
- **Version badge** and storage backend info in Settings
- Code structure prepared for future IndexedDB swap and project workspace

## Current scope
- Persian/English interface with automatic RTL/LTR direction
- Dark/light theme
- Responsive dashboard
- Project creation and deletion (with confirmation)
- Browser-local persistence
- Initial architecture for future guided and professional workflows

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
See the technical roadmap document for Phase 1 (Project Workspace) and beyond.
