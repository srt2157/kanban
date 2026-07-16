import { useState } from 'react';
import type { ActionItem, TaskStatus } from '../types';
import { useTasksStore } from '../state/useTasksStore';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

interface CardDetailModalProps {
  task: ActionItem;
  onClose: () => void;
}

export function CardDetailModal({ task, onClose }: CardDetailModalProps) {
  const updateTask = useTasksStore((state) => state.updateTask);
  const deleteTask = useTasksStore((state) => state.deleteTask);

  const [assignee, setAssignee] = useState(task.assignee ?? '');
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');

  function handleBlurSave() {
    updateTask(task.id, {
      assignee: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
    });
  }

  function handleDelete() {
    deleteTask(task.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {task.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
        )}

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          From {task.sourceMeetingTitle}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Status
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Assignee
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onBlur={handleBlurSave}
              placeholder="Unassigned"
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>

          <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleBlurSave}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleDelete}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
