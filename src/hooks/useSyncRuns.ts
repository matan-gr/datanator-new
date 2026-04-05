import { useState, useEffect } from 'react';
import type { SyncRun } from '../types/dashboard';
import { fetchJson } from '../lib/api';

export function useSyncRuns() {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [syncRunsPage, setSyncRunsPage] = useState(1);
  const [syncRunsTotal, setSyncRunsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchRuns = async () => {
    try {
      const data = await fetchJson(`/api/v1/sync-runs?page=${syncRunsPage}&limit=10`);
      if (data.success) {
        setRuns(data.data || []);
        setSyncRunsTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async (sourceId?: string, force: boolean = false) => {
    try {
      setSyncing(true);
      const url = sourceId 
        ? `/api/v1/sync/targeted`
        : `/api/v1/sync/monthly`;
        
      const body = sourceId ? JSON.stringify({ sourceId, force }) : JSON.stringify({ force });
      const data = await fetchJson(url, { method: 'POST', body });
      if (data.success) {
        fetchRuns();
      }
    } catch (error) {
      console.error('Error triggering sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [syncRunsPage]);

  return {
    runs,
    syncRunsPage,
    setSyncRunsPage,
    syncRunsTotal,
    loading,
    syncing,
    setSyncing,
    triggerSync,
    refreshRuns: fetchRuns
  };
}
