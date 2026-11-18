# Splitshot

A macOS desktop GUI app for QA teams: paste or drop two screenshots, normalize them to the
same size, annotate the differences, and export a single side-by-side PNG for a bug ticket.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Konva / react-konva for the canvas and annotations

## Development

```bash
npm install
npm run dev
```

The web app runs standalone in the browser during development. A desktop shell (Electron)
will be added later as a separate package.
