# Rahsaz architecture — v0.5.0 (Phase 3 complete)

## Phase 3 changes
- AiData / AiMessage models stored on each Project.
- Provider-neutral AI workflow: build prompt → copy → external AI → paste response → save history.
- Six built-in prompt templates with project context injection.
- Custom prompt support.
- Conversation history with delete and clear.
- No API keys, no network calls from the app.

## Acceptance criteria (Phase 3)
- [x] User can generate a context-aware prompt from templates.
- [x] User can copy the prompt to clipboard.
- [x] User can paste and save AI responses.
- [x] History persists per project after refresh.
- [x] Previous data migrates cleanly.
