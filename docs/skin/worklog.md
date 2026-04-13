# Worklog


## What belongs here

- **Only the current to-do** and short working notes.
- When an item is **done**, move a brief record to **`archive/`** at the project root, with a **numbered filename** (e.g. `01-topic.md`, `02-topic.md`, in order of creation). Remove the item from this file.
- Keep **worklog** small; long specs live in other project docs (`README.md`, `BOILERPLATE.md`, …) or under `archive/`.

## Development rules

### Layout and files

- Follow this layout: **`app/`** (routes, layout, globals), **`components/`** (shell and UI), **`src/`** (theme, CSS, `experiments/`), **`public/`** (static assets).
- **Split large components**: extract pieces into their own modules under `components/` or into focused routes under `app/`.
- **Reusable helpers** (formatting, small pure functions) live in dedicated files (e.g. under `src/` or a local `lib/` if you add one); avoid copy-paste.

### Documentation

- Update project markdown when behavior or setup changes.
- Do not use this file as a full spec; put details in the right doc.

### Language

- **Code comments** — **English**.
- **Markdown you add or substantially edit** in this project — **English**, unless a file is intentionally kept in another language. 
- **Symbols, file names, commit messages** — clear, usually English.

### Technical debt and risk

- Prefer **small steps** that keep local dev and production build green.
- Mark **temporary or prototype-only** choices in code or docs so they are easy to revisit.

### Tests

- Prefer **small, testable helpers** for non-trivial logic. Use **Vitest** and colocate **`*.test.ts`** next to the module, consistent with how you set up this project.

---

## To-do

<!-- On completion: add archive/NN-topic.md and remove the item here. -->
