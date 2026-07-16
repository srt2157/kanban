import type { ActionItem, Meeting, TaskStatus } from '../types';

const LINE_PATTERNS: { regex: RegExp; status: TaskStatus }[] = [
  { regex: /^-\s*\[x\]\s*(.+)$/i, status: 'done' },
  { regex: /^-\s*\[\s?\]\s*(.+)$/i, status: 'todo' },
  { regex: /^todo:\s*(.+)$/i, status: 'todo' },
  { regex: /^action:\s*(.+)$/i, status: 'todo' },
];

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractAssignee(text: string): { assignee?: string; title: string } {
  const atMatch = text.match(/^@([A-Za-z][\w'-]*)\s+to\s+(.+)$/);
  if (atMatch) {
    return { assignee: atMatch[1], title: capitalize(atMatch[2]) };
  }
  const nameMatch = text.match(
    /^([A-Z][a-zA-Z'-]*(?:\s[A-Z][a-zA-Z'-]*)?)\s+(?:to\s+|already\s+)?(.+)$/,
  );
  if (nameMatch) {
    return { assignee: nameMatch[1], title: capitalize(nameMatch[2]) };
  }
  return { title: capitalize(text) };
}

// Deterministic id so re-running extraction on the same notes never creates duplicates.
function hashId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function extractActionItems(meeting: Meeting): ActionItem[] {
  const now = new Date().toISOString();
  const items: ActionItem[] = [];

  for (const rawLine of meeting.notes.split('\n')) {
    const line = rawLine.trim();
    for (const { regex, status } of LINE_PATTERNS) {
      const match = line.match(regex);
      if (!match) continue;
      const { assignee, title } = extractAssignee(match[1].trim());
      items.push({
        id: `${meeting.id}-extract-${hashId(match[1])}`,
        title,
        status,
        sourceMeetingId: meeting.id,
        sourceMeetingTitle: meeting.title,
        assignee,
        createdAt: now,
      });
      break;
    }
  }

  return items;
}

export function extractAllActionItems(meetings: Meeting[]): ActionItem[] {
  return meetings.flatMap(extractActionItems);
}
