import { useTasksStore } from '../state/useTasksStore';

export function SyncButton() {
  const isSyncing = useTasksStore((state) => state.isSyncing);
  const syncFromSource = useTasksStore((state) => state.syncFromSource);

  return (
    <button
      onClick={() => syncFromSource()}
      disabled={isSyncing}
      className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSyncing ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Syncing…
        </>
      ) : (
        'Sync from Granola'
      )}
    </button>
  );
}
