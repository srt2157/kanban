export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO date
  attendees: string[];
  summary: string;
  notes: string; // raw notes text, source for extraction
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  assignee?: string;
  dueDate?: string; // ISO date
  createdAt: string; // ISO datetime
  updatedAt?: string;
}
