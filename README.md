# Kanban — Meeting Action Items

A Kanban board (To Do / In Progress / Done) for turning meeting-notes action items into a to-do list. Cards are meant to be extracted from [Granola](https://www.granola.ai/) meeting notes via its MCP integration.

Live Granola MCP access isn't authorized in this environment yet, so the app currently runs against a realistic, hand-authored mock dataset (`public/data/meetings.json`, `public/data/tasks.json`). The data layer is deliberately built so a real Granola sync can drop in later without any app code changes — see [Architecture](#architecture) below.

## Tech stack, and why

| Choice | Why |
|---|---|
| **React + TypeScript + Vite** | Fastest local dev loop with zero-config TypeScript and HMR. This is a single-user local tool, not a project that needs SSR/routing/deployment infrastructure, so a plain Vite SPA is the least amount of machinery that gets the job done. |
| **Tailwind CSS v4** (via `@tailwindcss/vite`) | Lets a polished, responsive kanban UI (columns, cards, drag states, modal) get built quickly without hand-rolled CSS files. v4's Vite plugin also drops the old `tailwind.config.js`/`postcss.config.js` boilerplate in favor of a single `@import "tailwindcss"` in `src/index.css`. |
| **@dnd-kit** (`core` + `sortable` + `utilities`) | Purpose-built for multi-container sortable drag-and-drop like a kanban board, and actively maintained — unlike `react-beautiful-dnd`, which is unmaintained. It also has built-in keyboard-sensor support, which matters for accessible drag interactions. |
| **zustand** (+ `persist` middleware) | Task state needs to be read and written from multiple sibling components (the board, individual cards, the detail modal, the sync button) that aren't in a simple parent-child chain. Plain `useState` in `App` would mean prop-drilling update callbacks several levels deep. Zustand gives a single `useTasksStore()` hook callable from anywhere, and its `persist` middleware handles `localStorage` sync in a few lines instead of a hand-written `useEffect`. This was the one deliberate deviation from "just use React state." |
| **No backend / database** | Single local user, no auth, no deployment target — `localStorage` plus two static JSON files fully cover persistence needs. Adding a server would be unjustified complexity for what this tool actually needs to do. |
| **Node via `nvm`, pinned in `.nvmrc`** | The system's global Node (v14.17.3) predates what Vite requires. Rather than upgrading Node globally (which could break other projects on the same machine), `nvm` installs an isolated LTS Node scoped to this project via `.nvmrc`, leaving the global Node untouched. |

## Getting started

This project pins its Node version via `.nvmrc`. In a fresh shell:

```bash
export NVM_DIR="$HOME/.nvm"
source "/usr/local/opt/nvm/nvm.sh"   # or wherever nvm.sh lives on your machine
nvm use
```

Then:

```bash
npm install
npm run dev       # start the dev server at localhost:5173
npm run build     # type-check (tsc -b) and build for production
npm run lint       # oxlint
npm run preview    # preview the production build
```

There is no test suite configured in this project.

## Architecture

Cards are `ActionItem`s, each tied back to the `Meeting` they came from:

```ts
type TaskStatus = 'todo' | 'in_progress' | 'done';
interface Meeting { id, title, date, attendees[], summary, notes }
interface ActionItem { id, title, description?, status, sourceMeetingId, sourceMeetingTitle, assignee?, dueDate?, createdAt, updatedAt? }
```

`public/data/meetings.json` and `public/data/tasks.json` are fetched at runtime (not bundled), which is what makes the Granola integration seam real: a human or a Claude Code session can call the Granola MCP tools, map the results into the shapes above, and overwrite those two files in place — the running app picks up the change on next load or "Sync from Granola" click, with no code changes required.

The "Sync from Granola" button re-fetches both files, runs a heuristic note parser (`src/lib/extraction.ts`) over any meetings with zero represented tasks, and merges everything into the store by task **id** (`src/lib/mergeTasks.ts`) — so re-syncing is idempotent and never clobbers local edits (status changes, assignee/due-date edits made in the UI).

See [`CLAUDE.md`](./CLAUDE.md) for a more detailed breakdown of the state management, drag-and-drop wiring, and sync/merge flow.
