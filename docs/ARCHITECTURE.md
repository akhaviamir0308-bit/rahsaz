# Rahsaz architecture — v0.4.0 (Phase 2 complete)

## Phase 2 changes
- DiscoveryData model (answers, notes, confirmed, updatedAt) attached to Project.
- Discovery questionnaire with 8 standard questions + free notes.
- Progress tracking and requirements summary view.
- Confirm action advances project stage from discovery → planning.
- Full migration from v0.3.0 and earlier storage keys.

## Acceptance criteria (Phase 2)
- [x] User can answer structured discovery questions inside a project.
- [x] Answers persist after refresh.
- [x] Progress is visible (count + percentage).
- [x] Requirements summary appears on Overview.
- [x] Confirming requirements moves stage to Planning.
- [x] Previous project data migrates cleanly.
