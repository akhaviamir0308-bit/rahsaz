# Rahsaz — v0.9.1

Phase 7 (Publish & handoff) — stabilization release.

## Changes in 0.9.1
- **Fix:** `npm run build` failed (missing `src/vite-env.d.ts`).
- **Fix:** "Starter files" produced one-line files containing a literal `\n`; now real multi-line files (language/direction follow the project, name is HTML-escaped).
- **Fix:** ZIP export now sets the UTF-8 filename flag (Persian file names) and a valid timestamp.
- **New test:** broken local links in `index.html` (e.g. missing `styles.css`).
- **Publish readiness:** test report must be newer than the last file change.
- **Editor:** Ctrl/Cmd+S saves; warning before switching files with unsaved edits; LTR code area.
- **Settings:** empty project name now shows an error instead of failing silently.
- **Dependencies pinned** (no more `latest`).

## Run
```bash
npm install
npm run dev      # http://localhost:5173/rahsaz/
```

## Build
```bash
npm run build
```
