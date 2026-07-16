# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project pins Node via `.nvmrc` (Node LTS, installed under `nvm` — the system global Node is v14.17.3 and too old for this stack). In a fresh shell, activate the right Node version first:

```bash
export NVM_DIR="$HOME/.nvm"
source "/usr/local/opt/nvm/nvm.sh"
nvm use
```

Then:

```bash
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # tsc -b type-check, then vite build (fails on type errors)
npm run lint      # oxlint
npm run preview   # preview the production build
```

There is no test suite configured in this project.

## Architecture

This is a Kanban board (To Do / In Progress / Done) whose cards are action items meant to be extracted from Granola meeting notes. It's a client-only app: React + TypeScript + Vite, Tailwind CSS v4 (via the `@tailwindcss/vite` plugin — no `tailwind.config.js`/`postcss.config.js`, config lives in `vite.config.ts` and the `@import "tailwindcss"` in `src/index.css`), `@dnd-kit` for drag-and-drop, and `zustand` (+ `persist`) for state. There is no backend; state lives in `localStorage`.

### The Granola integration seam

The Granola MCP is not currently connected/authorized in this environment, so the app runs against hand-authored mock data in `public/data/meetings.json` and `public/data/tasks.json`. These files are fetched at runtime (`fetch('/data/...')`), not bundled — this is deliberate: it's what lets real Granola-derived data drop in later without any app code changes.

The intended integration pattern (not yet implemented, since a running web app can't call Granola MCP tools itself): a human or a Claude Code session periodically calls the Granola MCP tools, maps the output into the `Meeting[]`/`ActionItem[]` shapes below, and overwrites the two JSON files in place. The app's own "Sync from Granola" button just re-fetches those files and merges — it doesn't know or care whether the data behind them is mock or real.

### Data model (`src/types/index.ts`)

```ts
type TaskStatus = 'todo' | 'in_progress' | 'done';
interface Meeting { id, title, date, attendees[], summary, notes }
interface ActionItem { id, title, description?, status, sourceMeetingId, sourceMeetingTitle, assignee?, dueDate?, createdAt, updatedAt? }
```

### Sync/merge flow (`src/state/useTasksStore.ts`)

`syncFromSource()` fetches both JSON files, determines which meetings have zero tasks already represented in the store, runs `extractActionItems()` (`src/lib/extraction.ts`) only on those unrepresented meetings, then merges the fetched seed tasks and the newly extracted tasks into the store via `mergeTasks()` (`src/lib/mergeTasks.ts`).

`mergeTasks` dedupes **by task `id` only** — not by title-matching. This was a deliberate choice: the heuristic extractor's generated titles don't exactly match the hand-authored mock titles (e.g. differing on small words like "the"), so title-based dedup produced false "new item" duplicates on every sync. ID-based merge is what makes `syncFromSource()` idempotent and what preserves local edits (a task already in the store, by id, is never overwritten by a re-fetched version).

`extractActionItems()` is a regex/heuristic line parser (matches `- [ ]`, `- [x]`, `TODO:`, `Action: @Name to ...` patterns in `Meeting.notes`) with a deterministic hash-based id (`{meetingId}-extract-{hash}`) so re-running extraction on unchanged notes never produces duplicate ids.

### State (`src/state/useTasksStore.ts`)

Single zustand store, `persist`-backed to `localStorage` under key `kanban:tasks:v1` (only `tasks` is persisted via `partialize`; `hasLoaded`/`isSyncing`/`lastSyncMessage` are transient). On first load (empty localStorage), `init()` seeds `tasks` from `public/data/tasks.json`. All card mutations (`moveTask`, `updateTask`, `deleteTask`, `addTask`) go through this store — components never touch localStorage directly.

### Drag-and-drop (`src/components/Board.tsx`, `Column.tsx`, `Card.tsx`)

Standard dnd-kit multi-container pattern: `Board` owns the single `DndContext` (`PointerSensor` + `KeyboardSensor`) and `DragOverlay`; each `Column` is both a `useDroppable` (id = the column's `TaskStatus`) and a `SortableContext` over its own cards; `Card` uses `useSortable`. `Board.handleDragEnd` resolves the destination status either directly from `over.id` (dropped on an empty column) or by looking up the status of the task under `over.id` (dropped on another card), then calls `moveTask`. Only cross-column status changes are persisted — there's no manual in-column reordering/ordering logic; column order always follows the underlying `tasks` array order.

**Testing drag-and-drop:** dnd-kit's `PointerSensor` require genuine trusted browser pointer events (it calls `setPointerCapture`, which silently no-ops for untrusted synthetic events but the surrounding activation logic still needs real, timed `pointermove` events to register distance and resolve collisions). A single instantaneous synthetic `PointerEvent` sequence dispatched via JS, or a raw CDP mouse-only drag without accompanying pointer events, will not reliably trigger it. If you need to script a drag for testing, dispatch a `pointerdown` → several delayed (~50-60ms apart) `pointermove` steps → `pointerup` sequence via real `PointerEvent`s.

### Component structure

```
src/
  types/index.ts             # Meeting, ActionItem, TaskStatus
  lib/
    extraction.ts              # heuristic note-line parser -> ActionItem[]
    dataSource.ts               # fetchMeetings(), fetchTasks()
    mergeTasks.ts                # id-based idempotent merge
  state/useTasksStore.ts     # zustand store + persist + init/sync
  components/
    Header.tsx, SyncButton.tsx
    Board.tsx                 # DndContext, sensors, onDragEnd, DragOverlay
    Column.tsx                # useDroppable + SortableContext per status
    Card.tsx                  # useSortable; title/meeting badge/assignee/due-date chip
    CardDetailModal.tsx       # edit status/assignee/dueDate, delete
```
