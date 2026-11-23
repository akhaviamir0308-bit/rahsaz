# Rahsaz architecture — v0.3.0 (Phase 1 complete)

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
- **Project domain**: typed Project model (id, name, type, description, createdAt, updatedAt, stage, status, tasks).
- **Persistence**: dedicated `storage.ts` module (localStorage backend, versioned key, migration from 0.2.x, Result-based API).

## Phase 1 changes
- Project Workspace with three tabs (Overview / Tasks / Settings).
- Task model added to Project (`tasks?: Task[]`).
- Visual stage progress indicator.
- Update project fields (name, description, type, stage, status).
- Task CRUD (add, toggle done, delete).
- Migration path from v0.2.0 and v0.2.1.

## Planned modules (next)
- Project discovery: structured questionnaire, goals, audience, content, constraints.
- Architecture planner: recommends a stack based on website type and complexity.
- Design workspace: pages, navigation, components, design tokens.
- AI workspace: provider-neutral prompt workflow and optional provider adapters.
- File workspace: project files, change history, restore points.
- Quality assurance: checklists, manual test cases, issue tracking.
- Publishing: export and provider-specific deployment guides.

## Acceptance criteria (Phase 1)
- [x] User can open a project into a dedicated workspace.
- [x] User can view project overview with stage and progress.
- [x] User can add, complete, and delete tasks.
- [x] User can edit project name, description, type, stage, and status.
- [x] Changes persist after page refresh.
- [x] Migration from previous versions works.
- [x] Layout remains usable on desktop and mobile.
