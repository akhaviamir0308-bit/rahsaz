# Architecture — v0.15.0

## Package A
Modular folders under `core/`, `modules/`, `shared/`.

## Package B
- Types: `shared/types` schema v15
- Storage: `core/storage/storage.ts` + `core/storage/idb.ts`
- Boot: IndexedDB preferred, localStorage cache/legacy

## Next (Package C)
Discovery → Planning engines depth (phases 5–8).
