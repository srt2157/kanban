import type { ActionItem, Meeting } from '../types';

export async function fetchMeetings(): Promise<Meeting[]> {
  const res = await fetch('/data/meetings.json');
  if (!res.ok) throw new Error(`Failed to fetch meetings: ${res.status}`);
  return res.json();
}

export async function fetchTasks(): Promise<ActionItem[]> {
  const res = await fetch('/data/tasks.json');
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.status}`);
  return res.json();
}
