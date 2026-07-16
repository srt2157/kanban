import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTasksStore } from '../state/useTasksStore';
import type { ActionItem, TaskStatus } from '../types';
import { Column } from './Column';
import { Card } from './Card';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

interface BoardProps {
  onCardClick: (task: ActionItem) => void;
}

export function Board({ onCardClick }: BoardProps) {
  const tasks = useTasksStore((state) => state.tasks);
  const moveTask = useTasksStore((state) => state.moveTask);
  const [activeTask, setActiveTask] = useState<ActionItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overStatus = COLUMNS.some((c) => c.status === over.id)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status;

    if (overStatus && overStatus !== activeTaskItem.status) {
      moveTask(activeTaskItem.id, overStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid flex-1 grid-cols-1 gap-4 overflow-x-auto p-4 sm:grid-cols-3">
        {COLUMNS.map(({ status, title }) => (
          <Column
            key={status}
            status={status}
            title={title}
            tasks={tasks.filter((t) => t.status === status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <Card task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
