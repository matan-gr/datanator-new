import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Database, RefreshCw, FileText, Clock, Zap, Pencil, XCircle, CheckCircle2, X, Activity, Play, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import type { SourceMetric } from '../../types/dashboard';
import { fetchJson } from '../../lib/api';
import { toast } from 'sonner';

interface SourcesTabProps {
  dataSources: any[];
  metrics: SourceMetric[];
  loading: boolean;
  setShowAddSourceDialog: (show: boolean) => void;
  refreshSources: () => void;
  setEditingSource: (source: any) => void;
  setShowEditSourceDialog: (show: boolean) => void;
  setSourceToDelete: (id: string) => void;
  testConnection: (id: string) => void;
  triggerSync: (id: string, force: boolean) => void;
}

export function SourcesTab({
  dataSources,
  metrics,
  loading,
  setShowAddSourceDialog,
  refreshSources,
  setEditingSource,
  setShowEditSourceDialog,
  setSourceToDelete,
  testConnection,
  triggerSync
}: SourcesTabProps) {
  return (
    <TabsContent value="sources" className="mt-0">
      <div className="github-card">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Data Source Matrix</span>
              <span className="text-[10px] text-muted-foreground">Active Ingestion Nodes</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-muted-foreground mr-4">
              <span className="text-foreground">{metrics.length}</span> Nodes Online
            </div>
            <Button onClick={() => setShowAddSourceDialog(true)} className="github-btn github-btn-primary">
              Add New Source
            </Button>
            <Button onClick={refreshSources} className="github-btn github-btn-secondary h-9 px-4">
              <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Matrix
            </Button>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="github-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Source Entity</th>
                <th>Origin</th>
                <th>Health Status</th>
                <th>Last Ingestion</th>
                <th className="text-right">Throughput</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((ds) => {
                const m = metrics.find(metric => metric.id === ds.id);
                const isFailing = ds.circuitOpen || ds.consecutiveFailures > 0 || (m && m.healthStatus !== 'HEALTHY');
                return (
                  <tr key={ds.id} className={`group hover:bg-muted/50 transition-all duration-300 ${!ds.isActive ? 'opacity-40' : ''}`}>
                    <td className="w-8 pl-6 pr-1">
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </td>
                    <td className="font-mono text-[13px] text-foreground group-hover:text-primary transition-colors py-4">
                      {ds.name}
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px] group-hover:text-foreground transition-colors mt-1">{ds.url}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${ds.origin === 'SYSTEM' ? 'bg-primary' : 'bg-purple'}`} />
                        <span className={`text-xs font-semibold ${ds.origin === 'SYSTEM' ? 'text-primary' : 'text-purple'}`}>
                          {ds.origin}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ring-4 ring-opacity-20 ${!ds.isActive ? 'bg-muted ring-muted' : ds.circuitOpen ? 'bg-error ring-error animate-pulse' : isFailing ? 'bg-warning ring-warning' : 'bg-success ring-success'}`} />
                          <span className="text-xs font-semibold text-foreground">
                            {!ds.isActive ? 'INACTIVE' : ds.circuitOpen ? 'CIRCUIT OPEN' : m?.healthStatus || 'UNKNOWN'}
                          </span>
                        </div>
                        {ds.consecutiveFailures > 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-error/10 border border-error/20 w-fit">
                            <AlertCircle className="w-2.5 h-2.5 text-error" />
                            <span className="text-[10px] text-error font-mono font-semibold">{ds.consecutiveFailures} Failures</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-[11px] text-muted-foreground font-medium py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-muted-foreground/50" />
                          <span>{m?.lastSyncTimestamp ? new Date(m.lastSyncTimestamp).toLocaleString() : 'NEVER'}</span>
                        </div>
                        {m?.lastTriggerType && (
                          <span className="text-xs text-muted-foreground/70 font-semibold ml-5">{m.lastTriggerType}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right pr-8 py-4">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-foreground">{m?.itemsParsedLastSync || 0}</span>
                          <Zap className="w-3 h-3 text-warning" />
                        </div>
                        <span className="text-xs text-muted-foreground font-semibold">Ingested</span>
                      </div>
                    </td>
                    <td className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        {ds.circuitOpen && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={async () => {
                              await fetchJson(`/api/v1/sources/${ds.id}/reset-circuit`, { method: 'POST' });
                              refreshSources();
                              toast.success('Circuit reset');
                            }} 
                            className="h-8 px-3 text-xs font-semibold text-error border border-error/20 hover:bg-error/10 rounded-md"
                          >
                            Reset Circuit
                          </Button>
                        )}
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setEditingSource(ds);
                                setShowEditSourceDialog(true);
                              }}
                              className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                            />
                          }>
                            <Pencil className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent>Edit Source</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={async () => {
                                await fetchJson(`/api/v1/sources/${ds.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...ds, isActive: !ds.isActive })
                                });
                                refreshSources();
                              }}
                              className={`h-9 w-9 rounded-md transition-all ${ds.isActive ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                            />
                          }>
                            {ds.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </TooltipTrigger>
                          <TooltipContent>{ds.isActive ? 'Deactivate Source' : 'Activate Source'}</TooltipContent>
                        </Tooltip>
                        {ds.origin === 'USER' && (
                          <Tooltip>
                            <TooltipTrigger render={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSourceToDelete(ds.id)}
                                className="h-9 w-9 text-error hover:bg-error/10 rounded-md transition-all"
                              />
                            }>
                              <X className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>Delete Source</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => testConnection(ds.id)}
                              className="h-8 w-8 text-primary hover:bg-primary/10 rounded-md"
                            />
                          }>
                            <Activity className="w-3.5 h-3.5" />
                          </TooltipTrigger>
                          <TooltipContent>Test Connection</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => triggerSync(ds.id, true)} 
                              disabled={!ds.isActive || ds.circuitOpen} 
                              className="h-8 w-8 text-success hover:bg-success/10 rounded-md disabled:opacity-20"
                            />
                          }>
                            <Play className="w-3.5 h-3.5" />
                          </TooltipTrigger>
                          <TooltipContent>Trigger Sync</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TabsContent>
  );
}
