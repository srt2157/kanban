import { useTasksStore } from '../state/useTasksStore';
import { SyncButton } from './SyncButton';

export function Header() {
  const lastSyncMessage = useTasksStore((state) => state.lastSyncMessage);

  return (
    <header className="flex flex-col gap-1 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Meeting Action Items
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Action items extracted from your Granola meeting notes
          </p>
        </div>
        <SyncButton />
      </div>
      {lastSyncMessage && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{lastSyncMessage}</p>
      )}
    </header>
  );
}
