import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ActionItem, TaskStatus } from '../types';
import { Card } from './Card';

interface ColumnProps {
  status: TaskStatus;
  title: string;
  tasks: ActionItem[];
  onCardClick: (task: ActionItem) => void;
}

export function Column({ status, title, tasks, onCardClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-gray-50 dark:bg-gray-900/60">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-2 transition-colors ${
          isOver ? 'bg-purple-50 dark:bg-purple-500/10' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
              No action items
            </p>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} task={task} onClick={() => onCardClick(task)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
