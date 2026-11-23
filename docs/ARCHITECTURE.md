# Rahsaz v0.10.0

- `src/data/learn.ts` — academy content (lessons, prompt bank, glossary), bilingual `{fa,en}` blocks.
- `src/components/LearnView.tsx` — academy UI; progress in localStorage key `rahsaz.learn.v1`.
- `src/data/demo.ts` — sample project + control-log generator.
- Publish readiness is derived from discovery, files, a *fresh* test report, and QA.
- ZIP export uses a store-only ZIP writer in `src/zip.ts` (UTF-8 names).
