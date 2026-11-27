# Rahsaz — v0.11.1

## 0.11.1 — review & fixes of 0.11.0
Fixes found while checking 0.11.0 against the product document:
- **Requirements** are now editable (edit text, kind, priority, delete, add manual items); any edit clears the confirmation. Kind labels are translated (were raw `functional · P1`); typo «غیرفعالکردی» → «غیرعملکردی»; baseline items no longer show the raw type key.
- **Re-confirming discovery no longer overwrites** an existing/edited requirements document; instead an *outdated* warning appears when discovery answers changed (fingerprint `sourceHash`). Regenerating asks before replacing manual work.
- **Architecture advisor**: removed false positives — the word «کاربر» turned every project into a web app and `api` matched inside other words. Rules are now word-bounded, negated phrases («بدون پرداخت», «no login») are ignored, and the page list parser understands «یک صفحه با پنج بخش: Hero، …».
- **Planning**: goal / audience / pages are no longer turned into "Implement: …" tasks, no doubled "قابلیت:" prefix, open questions become "Clarify" tasks, regenerating keeps completed tasks and manual tasks; tasks show priority and description.
- **Stage never regresses**: confirming requirements or generating a plan only advances `discovery → planning`.
- **Next-step coach** no longer forces the planning documents on projects that already have files.
- Academy: new lesson *Requirements, architecture and the task plan* (24 lessons), updated path text, help banners for the two new tabs.


Closer alignment with the product document: requirements engine, architecture advisor, planning engine, and guided next steps.

## New in 0.11.0
- **Requirements tab**: generate structured requirements from discovery, confirm, export `docs/requirements.md`
- **Architecture tab**: suggest approach + stack + pages, confirm, export `docs/ARCHITECTURE.md`
- **Planning**: generate prioritized tasks from requirements + architecture
- **Workflow coach** updated for the full path: Discovery → Requirements → Architecture → Plan → AI → Files → Preview → Publish
- Storage key `rahsaz.projects.v0110` (migrates from older keys)

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Note
This is still local-first (browser storage). Full document vision (real CI for user apps, hosted deploy APIs, IndexedDB scale) remains incremental.
