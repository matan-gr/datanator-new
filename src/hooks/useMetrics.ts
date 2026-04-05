import { useState, useEffect } from 'react';
import type { SourceMetric } from '../types/dashboard';
import { fetchJson } from '../lib/api';

export function useMetrics() {
  const [metrics, setMetrics] = useState<SourceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const data = await fetchJson('/api/v1/source-metrics');
      if (data.success) {
        setMetrics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    refreshMetrics: fetchMetrics
  };
}
