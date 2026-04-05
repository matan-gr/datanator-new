import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Play, Database, RefreshCw, Activity, FileText, Settings, ShieldCheck, Sparkles, Moon, Sun, BookOpen, X, Cloud, AlertTriangle, Zap, Calendar, Hash } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import mermaid from 'mermaid';
import { StatusBadge, StatusChip } from './ui-parts/StatusBadge';

import { useSyncRuns } from '../hooks/useSyncRuns';
import { useSystemLogs, useNetworkLogs } from '../hooks/useSystemLogs';
import { useDataSources } from '../hooks/useDataSources';
import { useMetrics } from '../hooks/useMetrics';

import { useDashboardData } from '../hooks/useDashboardData';
import { useGeminiBrief } from '../hooks/useGeminiBrief';
import { useRunDetails } from '../hooks/useRunDetails';


// Dashboard.css import removed as styles are now in index.css

import { OverviewTab } from './tabs/OverviewTab';
import { GeminiTab } from './tabs/GeminiTab';
import { SourcesTab } from './tabs/SourcesTab';
import { FilesTab } from './tabs/FilesTab';
import { ConsoleTab } from './tabs/ConsoleTab';
import { NetworkTab } from './tabs/NetworkTab';
import { SettingsTab } from './tabs/SettingsTab';

import { OverviewTab } from './tabs/OverviewTab';

const markdownComponents = {
  img: ({ node: _node, ...props }: any) => (
    <img 
      {...props} 
      referrerPolicy="no-referrer" 
      className="max-w-full rounded-md border border-border shadow-sm my-6"
    />
  )
};

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { runs, syncRunsPage, setSyncRunsPage, syncRunsTotal, loading, syncing, triggerSync, refreshRuns: fetchRuns } = useSyncRuns();
  const { debugLogs, debugPage, setDebugPage, debugTotal, debugLevel, setDebugLevel, debugSearch, setDebugSearch, debugLoading, selectedLog, setSelectedLog, autoScroll, setAutoScroll, debugScrollRef, refreshLogs: fetchDebugLogs } = useSystemLogs();
  const { networkLogs, networkPage, setNetworkPage, networkTotal, networkSearch, setNetworkSearch, networkLoading, selectedNetworkLog, setSelectedNetworkLog, refreshNetworkLogs: fetchNetworkLogs } = useNetworkLogs();
  const { dataSources, sourceToDelete, setSourceToDelete, showAddSourceDialog, setShowAddSourceDialog, showEditSourceDialog, setShowEditSourceDialog, newSource, setNewSource, editingSource, setEditingSource, refreshSources: fetchDataSources, testConnection, addSource, updateSource, deleteSource, toggleSourceActive } = useDataSources();
  const { metrics, refreshMetrics: fetchMetrics } = useMetrics();

  const { files, analytics, readmeContent, systemStatus, settings, settingsLoading, fetchAllDashboardData, fetchSettings, fetchSystemStatus } = useDashboardData();
  const { geminiBrief, geminiLoading, geminiError, fetchGeminiBrief } = useGeminiBrief();
  const { selectedRun, setSelectedRun, runLogs, runLogsLoading, openRunDetails } = useRunDetails();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [purging, setPurging] = useState(false);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const fetchAllData = async () => {
    await Promise.all([
      fetchRuns(),
      fetchMetrics(),
      fetchDataSources(),
      fetchAllDashboardData(),
      fetchDebugLogs(),
      fetchNetworkLogs()
    ]);
  };



 // GCS Export State
 const [isGCSDialogOpen, setIsGCSDialogOpen] = useState(false);
 const [gcsProjectId, setGcsProjectId] = useState('');
 const [gcsBucketName, setGcsBucketName] = useState('');
 const [gcsAuthCode, setGcsAuthCode] = useState('');
 const [isExporting, setIsExporting] = useState(false);

 const handleConnectGCS = async () => {
  try {
  const response = await fetch('/api/v1/gcs/auth-url', {
 headers: {
 'Accept': 'application/json'
 }
 });
  if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || 'Failed to get auth URL');
  }
  const { url } = await response.json();

  const authWindow = window.open(
  url,
  'oauth_popup',
  'width=600,height=700'
  );

  if (!authWindow) {
  toast.error('Please allow popups for this site to connect your account.');
  }
  } catch (error: any) {
  console.error('OAuth error:', error);
  toast.error(error.message || 'Failed to initiate OAuth flow');
  }
 };

 useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
  const origin = event.origin;
  if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
  return;
  }
  if (event.data?.type === 'GCS_OAUTH_SUCCESS') {
  setGcsAuthCode(event.data.code);
  toast.success('Successfully authenticated with Google Cloud');
  }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
 }, []);

 const handleGCSExport = async () => {
 if (!gcsProjectId || !gcsBucketName || !gcsAuthCode) {
 toast.error('Project ID, Bucket Name, and Auth Code are required');
 return;
 }

 setIsExporting(true);
 try {
 const result = await fetchJson('/api/v1/files-export-gcs', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 projectId: gcsProjectId,
 bucketName: gcsBucketName,
 authCode: gcsAuthCode
 })
 });
 if (result.success) {
 toast.success(result.message);
 setIsGCSDialogOpen(false);
 // Reset form
 setGcsAuthCode('');
 } else {
 toast.error(result.error || 'Export failed');
 }
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to export to GCS');
 console.error(error);
 } finally {
 setIsExporting(false);
 }
 };

  const handleDownloadAll = () => {
 window.open('/api/v1/files-download-all', '_blank');
 };

 const fetchJson = async (url: string, options?: RequestInit, retries = 3) => {
 let lastError: any;
 for (let i = 0; i < retries; i++) {
 try {
 const res = await fetch(url, {
 ...options,
 headers: {
 'Accept': 'application/json',
 ...options?.headers,
 }
 });
 
 // Handle rate limiting (429) with exponential backoff
 if (res.status === 429) {
 const delay = Math.pow(2, i) * 2000;
 await new Promise(resolve => setTimeout(resolve, delay));
 continue;
 }

 if (!res.ok) {
 const contentType = res.headers.get('content-type');
 if (contentType && contentType.includes('application/json')) {
 const errData = await res.json().catch(() => null);
 throw new Error(errData?.error || `HTTP error! status: ${res.status}`);
 }
 throw new Error(`HTTP error! status: ${res.status}`);
 }

 const contentType = res.headers.get('content-type');
 if (!contentType || !contentType.includes('application/json')) {
 const text = await res.text();
 console.error(`Expected JSON response but received ${contentType || 'unknown content'}:`, text.substring(0, 100));
 throw new Error(`Expected JSON response but received ${contentType || 'unknown content'}. This often happens if the API route is missing or returning an HTML error page.`);
 }

 return await res.json();
 } catch (error) {
 lastError = error;
 // If it's a 429, we already handled it with 'continue'
 // For other errors, we retry unless it's the last attempt
 if (i === retries - 1) throw error;
 await new Promise(resolve => setTimeout(resolve, 1000));
 }
 }
 throw lastError;
 };

 
   const updateSetting = async (key: string, value: string) => {
 try {
 const res = await fetchJson('/api/v1/system/settings', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ key, value })
 });
 if (res.success) {
 toast.success(`Setting ${key} updated`);
 fetchSettings();
 } else {
 toast.error(res.error || 'Failed to update setting');
 }
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to update setting');
 }
 };

 const purgeSystem = async () => {
 setShowPurgeDialog(false);
 try {
 setPurging(true);
 const res = await fetchJson('/api/v1/system/purge', {
 method: 'POST'
 });
 if (res.success) {
 toast.success('System purged successfully');
 fetchAllData();
 fetchSystemStatus();
 fetchDebugLogs();
 fetchNetworkLogs();
 } else {
 toast.error(res.error || 'Failed to purge system');
 }
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to purge system');
 } finally {
 setPurging(false);
 }
 };

 const resetSettings = async () => {
 setShowResetDialog(false);
 try {
 const res = await fetchJson('/api/v1/system/reset', {
 method: 'POST'
 });
 if (res.success) {
 toast.success('Settings reset successfully');
 fetchSettings();
 } else {
 toast.error(res.error || 'Failed to reset settings');
 }
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to reset settings');
 }
 };

  useEffect(() => {
 fetchAllData();
 const interval = setInterval(fetchAllData, 2000); // Poll every 2s for live refresh
 return () => clearInterval(interval);
 }, [syncRunsPage]);

      useEffect(() => {
 const timer = setTimeout(() => {
 fetchDebugLogs();
 }, 300);
 return () => clearTimeout(timer);
 }, [debugPage, debugLevel, debugSearch]);

 useEffect(() => {
 const timer = setTimeout(() => {
 fetchNetworkLogs();
 }, 300);
 return () => clearTimeout(timer);
 }, [networkPage, networkSearch]);

 // Real-time polling for logs when on the debug tab
 useEffect(() => {
 if (activeTab === 'debug') {
 const interval = setInterval(() => {
 fetchDebugLogs();
 fetchNetworkLogs();
 }, 2000);
 return () => clearInterval(interval);
 }
 }, [activeTab, debugPage, debugLevel, debugSearch, networkPage, networkSearch]);

 useEffect(() => {
 if (autoScroll && debugScrollRef.current) {
 const scrollElement = debugScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
 if (scrollElement) {
 scrollElement.scrollTop = scrollElement.scrollHeight;
 }
 }
 }, [debugLogs, autoScroll]);

 useEffect(() => {
 if (activeTab === 'settings') {
 fetchSettings();
 fetchSystemStatus();
 }
 }, [activeTab]);

 return (
 <div className="dashboard-container">
 <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-screen">
 <header className="dashboard-header">
 <div className="max-w-[1920px] mx-auto w-full flex items-center justify-between">
 <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('overview')}>
 <div className="dashboard-logo-box group-hover:scale-110 transition-transform duration-500">
 <Database className="w-6 h-6 text-[var(--gh-header-fg)]" />
 </div>
 <div className="flex flex-col">
 <div className="flex items-center gap-2">
 <span className="dashboard-title group-hover:opacity-80 transition-opacity">GCP Datanator</span>
 <span className="dashboard-version">v{__APP_VERSION__}</span>
 </div>
 <span className="text-xs font-mono text-[var(--gh-header-muted)]">ETL Engine</span>
 </div>
 </div>

 <div className="flex items-center gap-6">
 <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[var(--gh-header-muted)] mr-4">
 <Tooltip>
 <TooltipTrigger render={<div className="flex items-center gap-2 hover:text-[var(--gh-header-fg)] transition-colors cursor-pointer" />}>
 <Activity className="w-4 h-4" />
 <span>{analytics?.successRate || 0}% Uptime</span>
 </TooltipTrigger>
 <TooltipContent>System Availability</TooltipContent>
 </Tooltip>
 <Tooltip>
 <TooltipTrigger render={<div className="flex items-center gap-2 hover:text-[var(--gh-header-fg)] transition-colors cursor-pointer" />}>
 <Database className="w-4 h-4" />
 <span>{analytics?.totalItems ? (analytics.totalItems / 1000).toFixed(1) + 'k' : '0'} Records</span>
 </TooltipTrigger>
 <TooltipContent>Total Processed Records</TooltipContent>
 </Tooltip>
 </div>
 <div className="h-8 w-[1px] bg-[var(--gh-header-muted)] opacity-30 hidden md:block" />
 <div className="flex items-center gap-3">
 <Tooltip>
 <TooltipTrigger
 render={
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
 className="h-8 w-8 text-[var(--gh-header-muted)] hover:bg-white/10 hover:text-[var(--gh-header-fg)] rounded-md transition-all"
 />
 }
 >
 <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
 <Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
 </TooltipTrigger>
 <TooltipContent>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</TooltipContent>
 </Tooltip>
 </div>
 </div>
 </div>
 </header>

 {/* Repository Header Style */}
 <div className="bg-muted/30 border-b border-border pt-6">
 <div className="content-container py-0">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
 <div className="space-y-2">
 <div className="flex items-center gap-3 text-xl font-semibold">
 <Database className="w-6 h-6 text-primary" />
 <span className="text-primary hover:text-primary/80 transition-colors cursor-pointer">google-cloud</span>
 <span className="text-muted-foreground/30">/</span>
 <span className="text-foreground hover:text-primary transition-colors cursor-pointer">gcp-datanator</span>
 <Badge variant="outline" className="ml-2 rounded-full text-xs font-medium px-2 py-0.5 border-primary/20 text-primary bg-primary/5">Production</Badge>
 </div>
 <p className="text-muted-foreground text-sm max-w-2xl">
 High-performance ETL pipeline for Google Cloud technical intelligence. Automated synthesis and high-density data lake management.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button 
 onClick={() => triggerSync(undefined, true)} 
 disabled={syncing}
 className="github-btn github-btn-primary"
 >
 {syncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
 {syncing ? 'Syncing Pipeline...' : 'Trigger Sync Cycle'}
 </Button>
 </div>
 </div>

 <TabsList className="nav-tabs-list">
 <TabsTrigger value="overview">
 <BookOpen className="w-4 h-4" />
 Overview
 </TabsTrigger>
 <TabsTrigger value="gemini">
 <Sparkles className="w-4 h-4" />
 Intelligence
 </TabsTrigger>
 <TabsTrigger value="sources">
 <Activity className="w-4 h-4" />
 Data Sources
 </TabsTrigger>
 <TabsTrigger value="files">
 <FileText className="w-4 h-4" />
 Artifacts
 </TabsTrigger>
 <TabsTrigger value="debug">
 <ShieldCheck className="w-4 h-4" />
 System Logs
 </TabsTrigger>
 <TabsTrigger value="network">
 <Activity className="w-4 h-4" />
 Network
 </TabsTrigger>
 <TabsTrigger value="settings">
 <Settings className="w-4 h-4" />
 Settings
 </TabsTrigger>
 </TabsList>
 </div>
 </div>

 <main className="content-container">
 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 >
 
              <OverviewTab 
                runs={runs} 
                metrics={metrics} 
                readmeContent={readmeContent} 
                analytics={analytics} 
                setActiveTab={setActiveTab} 
                openRunDetails={openRunDetails} 
                markdownComponents={markdownComponents} 
              />
              <GeminiTab 
                geminiLoading={geminiLoading} 
                geminiError={geminiError} 
                geminiBrief={geminiBrief} 
                analytics={analytics} 
                metricsLength={metrics.length} 
                fetchGeminiBrief={fetchGeminiBrief} 
              />
              <SourcesTab 
                dataSources={dataSources} 
                metrics={metrics} 
                loading={loading} 
                setShowAddSourceDialog={setShowAddSourceDialog} 
                refreshSources={fetchAllData} 
                setEditingSource={setEditingSource} 
                setShowEditSourceDialog={setShowEditSourceDialog} 
                setSourceToDelete={setSourceToDelete} 
                testConnection={testConnection} 
                triggerSync={triggerSync} 
              />
              <FilesTab 
                files={files} 
                loading={loading} 
                handleDownloadAll={handleDownloadAll} 
                setIsGCSDialogOpen={setIsGCSDialogOpen} 
                refreshFiles={fetchAllData} 
              />
              <ConsoleTab 
                debugLogs={debugLogs} 
                debugPage={debugPage} 
                setDebugPage={setDebugPage} 
                debugTotal={debugTotal} 
                debugLevel={debugLevel} 
                setDebugLevel={setDebugLevel} 
                debugSearch={debugSearch} 
                setDebugSearch={setDebugSearch} 
                selectedLog={selectedLog} 
                setSelectedLog={setSelectedLog} 
                autoScroll={autoScroll} 
                setAutoScroll={setAutoScroll} 
                debugScrollRef={debugScrollRef} 
              />
              <NetworkTab 
                networkLogs={networkLogs} 
                networkPage={networkPage} 
                setNetworkPage={setNetworkPage} 
                networkTotal={networkTotal} 
                networkSearch={networkSearch} 
                setNetworkSearch={setNetworkSearch} 
                networkLoading={networkLoading} 
                selectedNetworkLog={selectedNetworkLog} 
                setSelectedNetworkLog={setSelectedNetworkLog} 
                refreshNetworkLogs={fetchAllData} 
              />
              <SettingsTab 
                settings={settings} 
                updateSetting={updateSetting} 
                systemStatus={systemStatus} 
                purging={purging} 
                setShowPurgeDialog={setShowPurgeDialog} 
                setShowResetDialog={setShowResetDialog} 
                appVersion={__APP_VERSION__} 
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </Tabs>

 <Dialog open={showAddSourceDialog} onOpenChange={setShowAddSourceDialog}>
 <DialogContent className="max-w-md bg-card border-border">
 <DialogHeader>
 <DialogTitle>Add Data Source</DialogTitle>
 <DialogDescription>Add a new RSS, Atom, or JSON feed to monitor.</DialogDescription>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label>Name</Label>
 <Input 
 value={newSource.name} 
 onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} 
 placeholder="e.g. My Custom Feed" 
 />
 </div>
 <div className="space-y-2">
 <Label>URL</Label>
 <Input 
 value={newSource.url} 
 onChange={(e) => setNewSource({ ...newSource, url: e.target.value })} 
 placeholder="https://..." 
 />
 </div>
 <div className="space-y-2">
 <Label>Type</Label>
 <Select value={newSource.type} onValueChange={(val) => setNewSource({ ...newSource, type: val })}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="rss">RSS</SelectItem>
 <SelectItem value="atom">Atom</SelectItem>
 <SelectItem value="json">JSON</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="flex justify-end gap-2">
 <Button variant="outline" onClick={() => setShowAddSourceDialog(false)}>Cancel</Button>
 <Button onClick={async () => {
 try {
 await fetchJson('/api/v1/sources', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newSource)
 });
 toast.success('Source added successfully');
 setShowAddSourceDialog(false);
 setNewSource({ name: '', url: '', type: 'rss' });
 fetchAllData();
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to add source');
 }
 }}>Add Source</Button>
 </div>
 </DialogContent>
 </Dialog>

 <Dialog open={showEditSourceDialog} onOpenChange={setShowEditSourceDialog}>
 <DialogContent className="max-w-md bg-card border-border">
 <DialogHeader>
 <DialogTitle>Edit Data Source</DialogTitle>
 <DialogDescription>Modify the details of this data source.</DialogDescription>
 </DialogHeader>
 {editingSource && (
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label>Name</Label>
 <Input 
 value={editingSource.name} 
 onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })} 
 />
 </div>
 <div className="space-y-2">
 <Label>URL</Label>
 <Input 
 value={editingSource.url} 
 onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })} 
 />
 </div>
 <div className="space-y-2">
 <Label>Type</Label>
 <Select value={editingSource.type} onValueChange={(val) => setEditingSource({ ...editingSource, type: val })}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="rss">RSS</SelectItem>
 <SelectItem value="atom">Atom</SelectItem>
 <SelectItem value="json">JSON</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 )}
 <div className="flex justify-end gap-2">
 <Button variant="outline" onClick={() => setShowEditSourceDialog(false)}>Cancel</Button>
 <Button onClick={async () => {
 try {
 await fetchJson(`/api/v1/sources/${editingSource.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(editingSource)
 });
 toast.success('Source updated successfully');
 setShowEditSourceDialog(false);
 setEditingSource(null);
 fetchAllData();
 } catch (error) {
 toast.error(error instanceof Error ? error.message : 'Failed to update source');
 }
 }}>Save Changes</Button>
 </div>
 </DialogContent>
 </Dialog>

 <AlertDialog open={!!sourceToDelete} onOpenChange={(open) => !open && setSourceToDelete(null)}>
 <AlertDialogContent className="bg-card border-border">
 <AlertDialogHeader>
 <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
 <AlertDialogDescription>
 Are you sure you want to delete this data source? This action cannot be undone.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className="github-btn github-btn-secondary">Cancel</AlertDialogCancel>
 <AlertDialogAction onClick={async () => {
 if (sourceToDelete) {
 try {
 await fetchJson(`/api/v1/sources/${sourceToDelete}`, { method: 'DELETE' });
 toast.success('Source deleted successfully');
 fetchAllData();
 } catch (_error) {
 toast.error('Failed to delete source');
 }
 }
 setSourceToDelete(null);
 }} className="github-btn github-btn-primary bg-error hover:bg-error/90 text-white border-error">
 Delete
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
 <DialogContent className="max-w-[98vw] sm:max-w-[98vw] w-[98vw] h-[96vh] max-h-[96vh] flex flex-col bg-card border-border p-0 overflow-hidden">
 <div className="github-card-header border-b border-border bg-muted/30 pr-12">
 <div className="flex items-center gap-3">
 <Activity className="w-4 h-4 text-primary" />
 <span className="text-sm font-semibold">Sync Run Details</span>
 </div>
 </div>
 
 {selectedRun && (
 <div className="flex flex-col flex-1 overflow-hidden">
 <div className="p-6 border-b border-border bg-card">
 <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
 <div className="space-y-4 flex-1">
 <div>
 <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
 Execution Report
 <StatusBadge status={selectedRun.status} />
 </h3>
 <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3">
 <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedRun.timestamp).toLocaleString()}</span>
 <span className="text-border">•</span>
 <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Trigger: <span className="font-semibold text-foreground">{selectedRun.triggerType}</span></span>
 <span className="text-border">•</span>
 <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID: <span className="font-mono text-foreground">{selectedRun.id.substring(0, 8)}</span></span>
 </div>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
 <div className="p-4 bg-muted/30 border border-border rounded-lg shadow-sm flex flex-col justify-center">
 <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Items Parsed</div>
 <div className="text-2xl font-mono font-semibold text-foreground">{selectedRun.totalItemsParsed}</div>
 </div>
 <div className="p-4 bg-muted/30 border border-border rounded-lg shadow-sm flex flex-col justify-center">
 <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Files Generated</div>
 <div className="text-2xl font-mono font-semibold text-foreground">{selectedRun.totalFilesGenerated}</div>
 </div>
 <div className="p-4 bg-muted/30 border border-border rounded-lg shadow-sm flex flex-col justify-center">
 <div className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Status</div>
 <div className="mt-1"><StatusBadge status={selectedRun.status} /></div>
 </div>
 </div>
 </div>
 </div>

 {selectedRun.errorSummary && (
 <div className="mt-6 p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm shadow-sm flex gap-3 items-start">
 <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
 <div>
 <span className="font-semibold block mb-1">Error Summary</span>
 <div className="font-mono text-xs leading-relaxed opacity-90">{selectedRun.errorSummary}</div>
 </div>
 </div>
 )}
 </div>

 <div className="flex-1 flex flex-col overflow-hidden">
 <div className="px-4 py-2 border-b border-border bg-muted/50 flex justify-between items-center">
 <span className="text-xs font-semibold text-muted-foreground">Execution Logs</span>
 {runLogsLoading && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
 </div>
 <div className="flex-1 overflow-y-auto bg-card text-foreground border-t border-border">
 <div className="p-6 font-mono text-[11px] leading-relaxed">
 {runLogsLoading ? (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-50" />
 <p className="text-muted-foreground font-mono animate-pulse">Fetching execution logs...</p>
 </div>
 ) : runLogs.length === 0 ? (
 <div className="text-muted-foreground italic text-center py-10">No execution logs recorded for this run.</div>
 ) : (
 <div className="space-y-1.5">
 {runLogs.map((log) => (
 <div key={log.id} className="flex gap-4 px-2 py-1 hover:bg-muted/50 rounded transition-colors group">
 <span className="text-muted-foreground shrink-0 w-[70px]">{new Date(log.timestamp).toISOString().split('T')[1].replace('Z', '')}</span>
 <span className={`shrink-0 w-[45px] font-semibold ${
 log.level === 'ERROR' ? 'text-error' : 
 log.level === 'WARN' ? 'text-warning' : 
 'text-primary'
 }`}>
 {log.level}
 </span>
 <span className="break-all text-muted-foreground group-hover:text-foreground transition-colors">{log.message}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}
 </DialogContent>
 </Dialog>

 <Dialog open={isGCSDialogOpen} onOpenChange={setIsGCSDialogOpen}>
 <DialogContent className="max-w-md bg-card border-border p-0 overflow-hidden">
 <div className="github-card-header border-b border-border bg-muted/30">
 <div className="flex items-center gap-3">
 <Cloud className="w-4 h-4 text-primary" />
 <span className="text-sm font-semibold">Export to GCS</span>
 </div>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsGCSDialogOpen(false)}>
 <X className="h-3 w-3" />
 </Button>
 </div>
 
 <div className="p-6 space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="projectId" className="text-xs font-semibold text-muted-foreground">Google Cloud Project ID</Label>
 <Input 
 id="projectId" 
 placeholder="e.g. my-awesome-project" 
 value={gcsProjectId} 
 onChange={(e) => setGcsProjectId(e.target.value)}
 className="bg-muted/30 border-border font-mono text-sm"
 />
 </div>
 
 <div className="space-y-2">
 <Label htmlFor="bucketName" className="text-xs font-semibold text-muted-foreground">Destination Bucket Name</Label>
 <Input 
 id="bucketName" 
 placeholder="e.g. gcp-datanator-backups" 
 value={gcsBucketName} 
 onChange={(e) => setGcsBucketName(e.target.value)}
 className="bg-muted/30 border-border font-mono text-sm"
 />
 </div>
 
 <div className="space-y-2">
  <div className="flex justify-between items-center">
  <Label htmlFor="authCode" className="text-xs font-semibold text-muted-foreground">OAuth Authorization Code</Label>
  <Button 
  variant="ghost"
  onClick={handleConnectGCS}
  className="h-auto p-0 text-[10px] text-primary hover:underline font-semibold bg-transparent hover:bg-transparent"
  >
  Connect to Google
  </Button>
  </div>
  <Input 
  id="authCode" 
  placeholder="Code will appear here after connecting..." 
  value={gcsAuthCode} 
  readOnly
  className="bg-muted/30 border-border font-mono text-sm opacity-70"
  />
  <p className="text-[10px] text-muted-foreground italic">
  Note: You need to authenticate to grant GCS write permissions.
  </p>
  </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
 <Button onClick={() => setIsGCSDialogOpen(false)} className="github-btn github-btn-secondary">
 Cancel
 </Button>
 <Button 
 onClick={handleGCSExport} 
 disabled={isExporting || !gcsProjectId || !gcsBucketName || !gcsAuthCode}
 className="github-btn github-btn-primary"
 >
 {isExporting ? (
 <>
 <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
 Exporting...
 </>
 ) : (
 <>
 <Cloud className="w-3 h-3 mr-2" />
 Start Export
 </>
 )}
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 <AlertDialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
 <AlertDialogContent className="github-card border-error/20 max-w-md">
 <AlertDialogHeader>
 <div className="w-12 h-12 rounded-md bg-error/10 flex items-center justify-center mb-4 border border-error/20">
 <AlertTriangle className="w-6 h-6 text-error" />
 </div>
 <AlertDialogTitle className="text-lg font-semibold text-foreground">Confirm System Purge</AlertDialogTitle>
 <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
 This action will permanently delete all synchronization runs, telemetry logs, and generated artifacts. This cannot be undone. Are you absolutely sure?
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-8 gap-3">
 <AlertDialogCancel className="github-btn github-btn-secondary">
 Cancel Operation
 </AlertDialogCancel>
 <AlertDialogAction 
 onClick={purgeSystem} 
 className="github-btn github-btn-primary bg-error hover:bg-error/90 text-white border-error"
 >
 {purging ? 'Purging...' : 'Confirm Full Purge'}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
 <AlertDialogContent className="github-card border-warning/20 max-w-md">
 <AlertDialogHeader>
 <div className="w-12 h-12 rounded-md bg-warning/10 flex items-center justify-center mb-4 border border-warning/20">
 <RefreshCw className="w-6 h-6 text-warning" />
 </div>
 <AlertDialogTitle className="text-lg font-semibold text-foreground">Reset Settings?</AlertDialogTitle>
 <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
 Are you sure you want to reset all configuration settings to their default values? This will revert retention policies and security levels.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-8 gap-3">
 <AlertDialogCancel className="github-btn github-btn-secondary">
 Cancel
 </AlertDialogCancel>
 <AlertDialogAction 
 onClick={resetSettings} 
 className="github-btn github-btn-primary bg-warning hover:bg-warning/90 text-white border-warning"
 >
 Reset Settings
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 );
}
