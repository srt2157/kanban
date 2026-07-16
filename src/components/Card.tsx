import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ActionItem } from '../types';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDueDate(dueDate: string): { label: string; isOverdue: boolean } {
  const date = new Date(dueDate + 'T00:00:00');
  const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const isOverdue = date.getTime() < new Date(new Date().toDateString()).getTime();
  return { label, isOverdue };
}

interface CardProps {
  task: ActionItem;
  onClick: () => void;
}

export function Card({ task, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const due = task.dueDate ? formatDueDate(task.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab touch-none rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="inline-flex max-w-full items-center truncate rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
          {task.sourceMeetingTitle}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {task.assignee ? (
          <span
            title={task.assignee}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          >
            {initials(task.assignee)}
          </span>
        ) : (
          <span />
        )}

        {due && (
          <span
            className={`rounded px-1.5 py-0.5 text-xs ${
              due.isOverdue
                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {due.label}
          </span>
        )}
      </div>
    </div>
  );
}
