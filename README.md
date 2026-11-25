# Rahsaz — v0.11.0

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
