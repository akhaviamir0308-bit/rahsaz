# Package B — Phase 3 (Data model) + Phase 4 (Storage)

## Data model (v15)
- `DATA_SCHEMA_VERSION = 15`
- Extended: requirement codes/status, task dependencies, activity log, publish stub
- Backward-compatible normalization for older projects

## Storage
- **localStorage** key `rahsaz.projects.v0150` (sync cache + legacy migration from v0110…)
- **IndexedDB** `rahsaz_db` / store `projects` (durable full payloads)
- On boot: `hydrateProjectsPreferred()` loads IDB first; if empty, migrates from LS → IDB
- On save: write LS + async IDB

## Limits still open (later phases)
- Per-file versioning store
- Quota UI and corruption repair wizard
- Full entity separation (files outside project JSON) for very large trees
