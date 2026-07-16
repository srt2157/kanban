import type { ActionItem } from '../types';

export function mergeTasks(
  existing: ActionItem[],
  incoming: ActionItem[],
): { merged: ActionItem[]; addedCount: number } {
  const existingIds = new Set(existing.map((t) => t.id));
  const newItems = incoming.filter((t) => !existingIds.has(t.id));
  return { merged: [...existing, ...newItems], addedCount: newItems.length };
}
