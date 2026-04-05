import { useState, useEffect } from 'react';
import { fetchJson } from '../lib/api';
import { OutputFile } from '../types/dashboard';

export function useDashboardData() {
  const [files, setFiles] = useState<OutputFile[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await fetchJson('/api/v1/files');
      if (res.success) setFiles(res.data);
    } catch (e) {
      console.error('Failed to fetch files', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetchJson('/api/v1/analytics');
      if (res.success) setAnalytics(res.data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  };

  const fetchReadme = async () => {
    try {
      const res = await fetchJson('/api/v1/readme');
      if (res.success) setReadmeContent(res.content);
    } catch (e) {
      console.error('Failed to fetch readme', e);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await fetchJson('/api/v1/system/status');
      if (res.success) setSystemStatus(res.data);
    } catch (e) {
      console.error('Failed to fetch system status', e);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetchJson('/api/v1/system/settings');
      if (res.success) setSettings(res.data);
    } catch (e) {
      console.error('Failed to fetch settings', e);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchAllDashboardData = async () => {
    await Promise.all([
      fetchFiles(),
      fetchAnalytics(),
      fetchReadme(),
      fetchSystemStatus(),
      fetchSettings()
    ]);
  };

  return {
    files,
    analytics,
    readmeContent,
    systemStatus,
    settings,
    settingsLoading,
    fetchFiles,
    fetchAnalytics,
    fetchReadme,
    fetchSystemStatus,
    fetchSettings,
    fetchAllDashboardData
  };
}
