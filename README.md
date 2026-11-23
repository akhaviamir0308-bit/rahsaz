# Rahsaz — v0.10.1

## 0.10.1 — bug-fix round (preview rewrite)
- **Preview rewritten** (`src/preview.ts`, `src/components/PreviewPane.tsx`):
  - renders at the *real* width (desktop 1280 / tablet 768 / mobile 390) and scales to fit — before, "desktop" was ~960px wide and 480px tall, so media queries and layout differed from the real site;
  - fixed: clicking any `#anchor` link loaded Rahsaz itself inside the preview;
  - paths now resolve properly (`css/main.css`, `./x`, `../x`, `/abs`, `?query`); local SVG images and CSS `url()` are inlined;
  - multi-page sites: links between `.html` pages work, plus a page selector;
  - runtime JS errors are shown in a panel; "Open in new tab" shows the page in a real browser tab;
  - warns when the editor has unsaved changes.
- **Restore** now keeps an automatic "before restore" snapshot (restore is undoable).
- **Import backup** (JSON) on the Projects page — backups can finally be restored.
- File save no longer reports success when storage failed; unsaved-edit guard on leaving a project / closing the tab.
- File creation rejects a file inside a file, invalid characters, empty segments.
- App no longer crashes when `localStorage` is blocked or when `crypto.randomUUID` is unavailable (plain-http hosting).
- Storage usage meter in Settings; Esc closes dialogs; Enter creates a project; clipboard fallback.
- Test "local links valid" now resolves paths correctly and ignores not-yet-added images.


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
