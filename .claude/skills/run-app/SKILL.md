---
name: run-app
description: Start the Splitshot Vite dev server and drive it in a browser to verify UI changes. Use before reporting a frontend change complete.
---

Splitshot is a browser-driven web app (Vite + React). There is no backend,
no auth, and no desktop shell yet — the dev server is the whole app.

## Start

```bash
npm run dev > /tmp/splitshot-dev.log 2>&1 &
disown
```

Wait for it to actually serve instead of sleeping a fixed amount:

```bash
until curl -sf http://localhost:5173 >/dev/null; do sleep 0.5; done
```

Vite's dev server defaults to port **5173**. If that port is already in use,
Vite will pick the next free one (5174, 5175, ...) — check
`/tmp/splitshot-dev.log` for the actual `Local:` URL it prints rather than
assuming 5173.

## Stop

```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```

`npm run dev` forks a `vite` child process; killing the `npm` PID alone
won't free the port, so kill by port, not by PID.

## Drive

This environment exposes browser-driving tools directly (no `chromium-cli`
needed/available here):

- `mcp__client__openBrowserPage` — open `http://localhost:5173` (reuse an
  already-shared page for this host if one exists instead of forcing a new
  one).
- `mcp__client__readPage` — accessibility snapshot of the page; prefer this
  over a screenshot when you need element refs to act on.
- `mcp__client__screenshotPage` — visual proof the page actually rendered
  (a blank frame means it didn't).
- `mcp__client__clickElement` / `mcp__client__typeInPage` / `mcp__client__dragElement`
  — standard interactions, addressed by `ref` (from `readPage`) or a
  Playwright `selector`.
- `mcp__client__runPlaywrightCode` — escape hatch for anything the above
  can't do, e.g. uploading a file into a hidden `<input type="file">`:
  `await page.locator('[aria-label="Choose file for Expected"]').setInputFiles('/path/to/file.png')`.
  Only reach `document`/`window` through `page.evaluate(...)`, never
  directly.

These tools require the user to approve a permission prompt the first time
in a session; if a call comes back "permission request aborted" or
rejected, that's the prompt not being approved — ask the user rather than
retrying blindly.

### One representative interaction

1. Open/reuse the page at `http://localhost:5173`.
2. `readPage` or `screenshotPage` to confirm both slots render: headings
   "Expected" and "Actual", each with a "Paste, drop, or choose a
   screenshot" prompt and a "Choose file" button.
3. Prove image intake works end-to-end: use `runPlaywrightCode` to
   `setInputFiles` a real image onto the slot's hidden file input (selector
   `[aria-label="Choose file for Expected"]` or `[aria-label="Choose file
   for Actual"]`), then `screenshotPage` again — the slot should now show
   the image preview, filename, and a "Clear" button.
4. True OS-level drag-and-drop and clipboard paste can't be driven this
   way; those paths are covered by the Vitest component tests in
   `src/components/ImageSlot.test.tsx` instead of manual browser driving.

## Gotchas

- The file inputs are visually hidden (Tailwind `sr-only`) behind a visible
  "Choose file" button, so `clickElement` on the button won't let you pick a
  file remotely — use `runPlaywrightCode` + `setInputFiles` directly on the
  hidden input instead.
- `npm run dev`'s first boot after a `package.json` change re-optimizes
  dependencies and logs an extra line before `VITE vX ready` — don't treat
  that as a failure.
