# Splitshot

A/B screenshot comparison tool. See the implementation handoff doc for product spec and build order.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Konva/`react-konva` for
the canvas, Zustand for state, Vitest + Testing Library for tests, oxlint for linting.

## Project structure

- `src/lib/` — framework-free logic (pure functions, hooks with no JSX). Fully unit tested.
- `src/store/` — one Zustand store per concern (`imageSlots`, `layoutMode`, ...). State must
  stay plain/serializable (data URLs, primitives) — no `HTMLImageElement`/DOM handles in a
  store, so undo/redo and project save/load stay possible later.
- `src/components/` — React components. Keep Konva-rendering components thin (props in,
  primitives out); put any real logic in `src/lib` where it's unit-testable.

## TDD workflow

Write the failing test first, confirm it fails for the expected reason, then implement until
it passes. This applies by default to everything in `src/lib` and `src/store`.

**Konva/canvas exception:** jsdom has no canvas backend installed (no `canvas` /
`@napi-rs/canvas`), so mounting a real `<Stage>` under Vitest throws
(`HTMLCanvasElement.getContext` isn't implemented). Don't add one just to make Konva
components testable — it matches the project's own testing-approach doc, which scopes
automated tests to the resize/layout function and state logic and leaves rendering fidelity to
manual checks. Instead:
- Keep the Konva-rendering component (e.g. `ComparisonCanvas`) a thin wrapper with no branching
  logic of its own — the logic it calls (`computeLayout`, stores, hooks) is unit tested
  directly.
- Test a component that *wraps* a Konva component by mocking the child
  (`vi.mock('./ComparisonCanvas', ...)`) so plain-DOM siblings (selects, labels) stay testable
  with Testing Library.
- Verify the actual canvas rendering by eye using the `run-app` skill in a real browser.

## Commands

- `npm run dev` — Vite dev server
- `npm test` — `vitest run` (one-shot); `npm run test:watch` for watch mode
- `npm run lint` — oxlint
- `npx tsc -b` — typecheck
- `npm run build` — typecheck + production build

Before calling frontend work done: tests green, lint clean, typecheck clean, and the change
verified in-browser via the `run-app` skill.

## Vite conventions

See the `vite-conventions` skill before touching `vite.config.ts`, env vars, asset imports, or
build/plugin setup.
