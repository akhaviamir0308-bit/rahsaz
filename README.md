# Rahsaz — v0.10.0

## New in 0.10.0 — Rahsaz Academy ("from 0 to 100")
- **Academy** (nav item "آموزش"/"Academy", also a tab inside every project): 23 bilingual lessons in 5 modules — mindset & prerequisites, a tour of every Rahsaz tool, a full 5-step résumé-site project, troubleshooting, privacy and next steps. Progress is saved locally.
- **Prompt bank** (13 ready prompts, one-click copy) and **glossary** (20 terms).
- **Sample project**: one click creates a ready résumé site (discovery answers, files, tasks) to explore every tool.
- **Contextual help** on every project tab + a **"Suggested next step"** card in the project overview.
- **Project control log** button in Files: generates `docs/spec.txt`, `docs/decisions.txt`, `docs/status.txt`.
- First-run onboarding card on the empty dashboard.

Content is based on the "Step-by-step: build a website with AI" guide.

## 0.9.1 — stabilization

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
