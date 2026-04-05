import { useState } from 'react';
import { fetchJson } from '../lib/api';
import { SyncRun, AppLog } from '../types/dashboard';
import { toast } from 'sonner';

export function useRunDetails() {
  const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);
  const [runLogs, setRunLogs] = useState<AppLog[]>([]);
  const [runLogsLoading, setRunLogsLoading] = useState(false);

  const fetchRunLogs = async (runId: string) => {
    setRunLogsLoading(true);
    try {
      const data = await fetchJson(`/api/v1/logs?syncRunId=${runId}&limit=1000`);
      if (data.success) {
        setRunLogs(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch run logs:", error);
      toast.error("Failed to fetch logs for this run");
    } finally {
      setRunLogsLoading(false);
    }
  };

  const openRunDetails = (run: SyncRun) => {
    setSelectedRun(run);
    fetchRunLogs(run.id);
  };

  return { selectedRun, setSelectedRun, runLogs, runLogsLoading, openRunDetails };
}
