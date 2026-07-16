import { useEffect, useState } from 'react';
import { useTasksStore } from './state/useTasksStore';
import type { ActionItem } from './types';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { CardDetailModal } from './components/CardDetailModal';

function App() {
  const hasLoaded = useTasksStore((state) => state.hasLoaded);
  const init = useTasksStore((state) => state.init);
  const tasks = useTasksStore((state) => state.tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, [init]);

  const selectedTask = selectedTaskId ? (tasks.find((t) => t.id === selectedTaskId) ?? null) : null;

  if (!hasLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading meeting action items…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <Header />
      <Board onCardClick={(task: ActionItem) => setSelectedTaskId(task.id)} />
      {selectedTask && (
        <CardDetailModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  );
}

export default App;
