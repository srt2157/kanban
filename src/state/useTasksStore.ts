import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActionItem, TaskStatus } from '../types';
import { fetchMeetings, fetchTasks } from '../lib/dataSource';
import { extractAllActionItems } from '../lib/extraction';
import { mergeTasks } from '../lib/mergeTasks';

interface TasksState {
  tasks: ActionItem[];
  hasLoaded: boolean;
  isSyncing: boolean;
  lastSyncMessage: string | null;
  init: () => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => void;
  addTask: (task: ActionItem) => void;
  updateTask: (id: string, patch: Partial<ActionItem>) => void;
  deleteTask: (id: string) => void;
  syncFromSource: () => Promise<void>;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      hasLoaded: false,
      isSyncing: false,
      lastSyncMessage: null,

      init: async () => {
        if (get().hasLoaded) return;
        if (get().tasks.length === 0) {
          try {
            const seedTasks = await fetchTasks();
            set({ tasks: seedTasks, hasLoaded: true });
          } catch (err) {
            console.error('Failed to load seed tasks', err);
            set({ hasLoaded: true });
          }
        } else {
          set({ hasLoaded: true });
        }
      },

      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t,
          ),
        })),

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
          ),
        })),

      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      syncFromSource: async () => {
        set({ isSyncing: true });
        try {
          const [meetings, seedTasks] = await Promise.all([fetchMeetings(), fetchTasks()]);
          const current = get().tasks;
          const representedMeetingIds = new Set(current.map((t) => t.sourceMeetingId));
          const unrepresented = meetings.filter((m) => !representedMeetingIds.has(m.id));
          const extracted = extractAllActionItems(unrepresented);

          const { merged: afterSeed, addedCount: seedAdded } = mergeTasks(current, seedTasks);
          const { merged: final, addedCount: extractedAdded } = mergeTasks(afterSeed, extracted);
          const addedCount = seedAdded + extractedAdded;

          set({
            tasks: final,
            isSyncing: false,
            lastSyncMessage:
              addedCount > 0
                ? `Synced ${addedCount} new action item${addedCount === 1 ? '' : 's'} from Granola.`
                : "No new action items — Granola isn't connected yet, showing mock meeting data.",
          });
        } catch (err) {
          console.error('Sync failed', err);
          set({ isSyncing: false, lastSyncMessage: 'Sync failed. See console for details.' });
        }
      },
    }),
    {
      name: 'kanban:tasks:v1',
      partialize: (state) => ({ tasks: state.tasks }),
    },
  ),
);
