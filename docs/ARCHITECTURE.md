# Rahsaz architecture — v0.2.1 (Phase 0 complete)

## Product principles
1. The user remains the website creator and decision-maker; Rahsaz guides and organizes the work.
2. No creator-owned API key or paid backend is required.
3. Manual AI workflow (copy prompt, use any AI tool, paste response back) is the baseline.
4. Direct AI-provider connections are optional and must use the end user's own credentials.
5. Local-first storage is the default for the early release.
6. Website architecture must be selected per project; not every website is a single HTML file.

## Current application layers
- **Presentation**: React components and responsive CSS.
- **Localization**: translation dictionaries and document `lang`/`dir` attributes.
- **Preferences**: language and theme in localStorage.
- **Project domain**: typed Project model (id, name, type, description, createdAt, updatedAt, stage, status).
- **Persistence**: dedicated `storage.ts` module (localStorage backend, versioned key, migration from 0.2.0, Result-based API). Ready for IndexedDB swap.

## Phase 0 changes
- Expanded Project interface.
- Extracted all read/write logic into `src/storage.ts`.
- Added two-step delete confirmation.
- Surface storage errors to the user.
- Automatic one-time migration of old projects.

## Planned modules (next)
- Project discovery: structured questionnaire, goals, audience, content, constraints.
- Architecture planner: recommends a stack based on website type and complexity.
- Design workspace: pages, navigation, components, design tokens.
- AI workspace: provider-neutral prompt workflow and optional provider adapters.
- File workspace: project files, change history, restore points.
- Quality assurance: checklists, manual test cases, issue tracking.
- Publishing: export and provider-specific deployment guides.

## Planned storage evolution
Current localStorage is intentionally temporary. Move project records and larger artifacts to IndexedDB. Add export/import backups. Keep secrets out of persistent browser storage by default; API keys should be session-only where feasible and clearly disclosed.

## Security and privacy boundaries
- Browser-local storage is not a secure vault.
- Data sent to an AI provider is governed by that provider's terms and privacy policy.
- Never ship a developer-owned API key in public client code.
- GitHub Pages is static hosting; it does not provide a private server or shared database.

## Acceptance criteria (Phase 0)
- [x] User can switch Persian/English; page direction changes with language.
- [x] User can switch light/dark appearance.
- [x] User can create projects with the new data model.
- [x] User can delete a project only after explicit confirmation.
- [x] Project list persists after page refresh in the same browser profile.
- [x] Old v0.2.0 projects are migrated automatically.
- [x] Storage errors are reported instead of failing silently.
- [x] Layout remains usable on desktop and mobile.
