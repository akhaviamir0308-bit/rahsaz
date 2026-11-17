# Rahsaz — v0.2.0

A bilingual (Persian/English), theme-switchable starter for an AI-assisted website creation workspace.

## Current scope
- Persian/English interface with automatic RTL/LTR direction
- Dark/light theme
- Responsive dashboard
- Project creation and deletion
- Browser-local persistence using localStorage
- Initial architecture for future guided and professional workflows

## Requirements
- Node.js LTS (includes npm)
- A modern browser

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## GitHub Pages
The Vite `base` is currently set to `/rahsaz/`. If your GitHub repository has a different name, update `base` in `vite.config.ts` to `/<repository-name>/`.

A GitHub Actions workflow for deployment will be added in the publishing phase.

## Important limitations
This is an early foundation, not the complete product. Project data is stored only in the current browser profile. There is no shared backend, authentication, AI provider connection, code editor, or real deployment engine yet. Do not put private information or API keys into this version.
