---
name: vite-conventions
description: Vite best practices and design patterns for this project — env vars, asset handling, code splitting, aliases, plugin config. Use before editing vite.config.ts, adding env vars, importing assets, or adding a build/dev dependency.
---

Splitshot's `vite.config.ts` doubles as the Vitest config (`defineConfig` from `vitest/config`,
not plain `vite`) so the React and Tailwind plugins are shared between dev, build, and test.
Keep it that way — don't split out a separate `vitest.config.ts`.

## Env vars

- Only variables prefixed `VITE_` are exposed to client code, via `import.meta.env.VITE_X` —
  never `process.env` (there is no Node process in the browser bundle).
- Use `.env.local` for anything developer-specific or secret; it's gitignored by the Vite
  scaffold. Never commit a real secret into `.env` / `.env.production`.
- Don't branch logic on `import.meta.env.DEV`/`PROD` unless genuinely unavoidable (e.g. a dev
  only debug overlay) — code should behave the same in `dev` and `build` so bugs show up before
  shipping.

## Static assets

- Import assets from `src/` (e.g. `import icon from './icon.svg'`) so Vite fingerprints,
  optimizes, and bundles them. This is the default for anything referenced from component code.
- Use `public/` only for files that must be served at an exact, stable URL verbatim
  (`favicon.ico`, `robots.txt`) — files there are copied as-is, not processed or hashed.

## Code splitting

- Prefer a dynamic `import()` for a heavy or rarely-used path (e.g. an export/encode pipeline)
  over importing it eagerly at the top of a module — Vite automatically creates a separate
  chunk and lazy-loads it. Don't hand-roll chunk config in `build.rollupOptions` unless a
  profiled bundle-size problem actually calls for it.

## Path aliases

If you introduce a path alias, declare it in both places or the two tools disagree:
- `tsconfig.app.json` → `compilerOptions.paths`
- `vite.config.ts` → `resolve.alias`

## Plugin config

- Current plugin order in `vite.config.ts` is `[react(), tailwindcss()]`. Keep new plugins
  justified by a concrete need (a specific transform/feature), not added speculatively — more
  plugins mean more things that can reorder or conflict during the transform pipeline.
- `react()` enables Fast Refresh. Don't export non-component values (hooks, constants, pure
  functions) from a file that also exports a component — that pattern breaks Fast Refresh and
  forces a full reload. Keep those in `src/lib` instead.

## Testing

Vitest runs through the same Vite pipeline (`environment: 'jsdom'`, `setupFiles:
['./src/test/setup.ts']` in `vite.config.ts`). There is no `canvas` package installed, so
anything that needs a real `<canvas>` 2D context (Konva's `Stage`) cannot mount under this
setup — see the Konva/canvas exception in the project `CLAUDE.md`.
