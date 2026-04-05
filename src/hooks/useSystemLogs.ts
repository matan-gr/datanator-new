import { useState, useEffect, useRef } from 'react';
import type { AppLog } from '../types/dashboard';
import { fetchJson } from '../lib/api';

export function useSystemLogs() {
  const [debugLogs, setDebugLogs] = useState<AppLog[]>([]);
  const [debugPage, setDebugPage] = useState(1);
  const [debugTotal, setDebugTotal] = useState(0);
  const [debugLevel, setDebugLevel] = useState('ALL');
  const [debugSearch, setDebugSearch] = useState('');
  const [debugLoading, setDebugLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AppLog | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const debugScrollRef = useRef<HTMLDivElement>(null);

  const fetchDebugLogs = async () => {
    try {
      setDebugLoading(true);
      const queryParams = new URLSearchParams({
        page: debugPage.toString(),
        limit: '100',
        ...(debugLevel !== 'ALL' && { level: debugLevel }),
        ...(debugSearch && { search: debugSearch })
      });
      const data = await fetchJson(`/api/v1/logs?${queryParams}`);
      if (data.success) {
        setDebugLogs(data.logs || []);
        setDebugTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching debug logs:', error);
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugLogs();
  }, [debugPage, debugLevel, debugSearch]);

  useEffect(() => {
    if (autoScroll && debugScrollRef.current) {
      debugScrollRef.current.scrollTop = debugScrollRef.current.scrollHeight;
    }
  }, [debugLogs, autoScroll]);

  return {
    debugLogs,
    debugPage,
    setDebugPage,
    debugTotal,
    debugLevel,
    setDebugLevel,
    debugSearch,
    setDebugSearch,
    debugLoading,
    selectedLog,
    setSelectedLog,
    autoScroll,
    setAutoScroll,
    debugScrollRef,
    refreshLogs: fetchDebugLogs
  };
}

export function useNetworkLogs() {
  const [networkLogs, setNetworkLogs] = useState<AppLog[]>([]);
  const [networkPage, setNetworkPage] = useState(1);
  const [networkTotal, setNetworkTotal] = useState(0);
  const [networkSearch, setNetworkSearch] = useState('');
  const [networkLoading, setNetworkLoading] = useState(false);
  const [selectedNetworkLog, setSelectedNetworkLog] = useState<AppLog | null>(null);

  const fetchNetworkLogs = async () => {
    try {
      setNetworkLoading(true);
      const queryParams = new URLSearchParams({
        page: networkPage.toString(),
        limit: '100',
        type: 'NETWORK',
        ...(networkSearch && { search: networkSearch })
      });
      const data = await fetchJson(`/api/v1/logs?${queryParams}`);
      if (data.success) {
        setNetworkLogs(data.logs || []);
        setNetworkTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching network logs:', error);
    } finally {
      setNetworkLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkLogs();
  }, [networkPage, networkSearch]);

  return {
    networkLogs,
    networkPage,
    setNetworkPage,
    networkTotal,
    networkSearch,
    setNetworkSearch,
    networkLoading,
    selectedNetworkLog,
    setSelectedNetworkLog,
    refreshNetworkLogs: fetchNetworkLogs
  };
}
