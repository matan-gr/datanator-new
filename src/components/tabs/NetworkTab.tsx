import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Activity, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import type { AppLog } from '../../types/dashboard';

interface NetworkTabProps {
  networkLogs: AppLog[];
  networkPage: number;
  setNetworkPage: React.Dispatch<React.SetStateAction<number>>;
  networkTotal: number;
  networkSearch: string;
  setNetworkSearch: (val: string) => void;
  networkLoading: boolean;
  selectedNetworkLog: AppLog | null;
  setSelectedNetworkLog: (log: AppLog | null) => void;
  refreshNetworkLogs: () => void;
}

export function NetworkTab({
  networkLogs,
  networkPage,
  setNetworkPage,
  networkTotal,
  networkSearch,
  setNetworkSearch,
  networkLoading,
  selectedNetworkLog,
  setSelectedNetworkLog,
  refreshNetworkLogs
}: NetworkTabProps) {
  return (
    <TabsContent value="network" className="mt-0 h-[700px] flex flex-col">
      <div className="github-card flex-1 flex flex-col overflow-hidden">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Network Telemetry</span>
              <span className="text-[10px] text-muted-foreground">HTTP Traffic Monitor</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mr-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Live Monitor
            </div>
            <Button onClick={refreshNetworkLogs} className="github-btn github-btn-secondary h-8 px-3 text-[11px] font-semibold">
              <RefreshCw className={`w-3 h-3 mr-1.5 ${networkLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-border bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter network requests..."
              className="github-input pl-9 h-9 text-sm"
              value={networkSearch}
              onChange={(e) => { setNetworkSearch(e.target.value); setNetworkPage(1); }}
            />
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${selectedNetworkLog ? 'w-2/3 border-r border-border' : 'w-full'}`}>
            <ScrollArea className="flex-1 overflow-hidden min-h-0 bg-card text-foreground">
              <div className="p-4 font-mono text-[11px] leading-relaxed">
                {networkLogs.map((log) => {
                  let meta: any = {};
                  try { meta = JSON.parse(log.metadata || '{}'); } catch { /* ignore */ }
                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedNetworkLog(log)}
                      className={`flex gap-4 px-3 py-1.5 cursor-pointer hover:bg-muted/50 border-l-2 transition-all ${
                        selectedNetworkLog?.id === log.id 
                          ? 'bg-muted border-primary text-foreground' 
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <span className="text-muted-foreground shrink-0 tabular-nums">{new Date(log.timestamp).toISOString().split('T')[1].split('.')[0]}</span>
                      <span className={`shrink-0 w-[50px] font-semibold text-center rounded px-1 py-0.5 text-[9px] ${
                        meta.status >= 400 ? 'bg-error/20 text-error border border-error/30' : 'bg-success/20 text-success border border-success/30'
                      }`}>
                        {meta.method || 'GET'}
                      </span>
                      <span className={`shrink-0 w-[35px] font-semibold ${
                        meta.status >= 400 ? 'text-error' : 'text-success'
                      }`}>
                        {meta.status || '200'}
                      </span>
                      <span className="truncate flex-1 font-medium">{meta.url || log.message}</span>
                      <span className="text-muted-foreground shrink-0 font-semibold">{meta.duration ? `${meta.duration}ms` : ''}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="px-6 py-3 border-t border-border bg-muted flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <div>
                <span className="text-foreground">{networkTotal}</span> Requests Recorded
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setNetworkPage(p => Math.max(1, p - 1))} disabled={networkPage === 1} className="github-btn github-btn-secondary h-8 px-4 text-[10px] font-semibold">
                  Previous
                </Button>
                <Button onClick={() => setNetworkPage(p => p + 1)} disabled={networkPage * 50 >= networkTotal} className="github-btn github-btn-secondary h-8 px-4 text-[10px] font-semibold">
                  Next Page
                </Button>
              </div>
            </div>
          </div>

          {/* Network Details Pane */}
          <AnimatePresence>
            {selectedNetworkLog && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '33.333333%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-card flex flex-col overflow-hidden border-l border-border"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center border border-success/20">
                      <Activity className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Request Details</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setSelectedNetworkLog(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {(() => {
                      let meta: any = {};
                      try { meta = JSON.parse(selectedNetworkLog.metadata || '{}'); } catch { /* ignore */ }
                      return (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                              meta.status >= 400 ? 'bg-error/20 text-error border-error/30' : 'bg-success/20 text-success border-success/30'
                            }`}>
                              {meta.method || 'UNKNOWN'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${
                              meta.status >= 400 ? 'bg-error/20 text-error border-error/30' : 'bg-success/20 text-success border-success/30'
                            }`}>
                              {meta.status || '---'}
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">{meta.duration ? `${meta.duration}ms` : ''}</span>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">Endpoint URL</h4>
                            <div className="bg-muted/50 rounded-md p-3 border border-border font-mono text-xs text-primary break-all leading-relaxed">
                              {meta.url || selectedNetworkLog.message}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">Timestamp</h4>
                            <div className="bg-muted/50 rounded-lg p-3 border border-border font-mono text-xs text-foreground">
                              {new Date(selectedNetworkLog.timestamp).toLocaleString()}
                            </div>
                          </div>

                          {meta.ip && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-3">Client IP Address</h4>
                              <div className="bg-muted/50 rounded-lg p-3 border border-border font-mono text-xs text-foreground">
                                {meta.ip}
                              </div>
                            </div>
                          )}
                          
                          {meta.userAgent && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-3">User Agent String</h4>
                              <div className="bg-muted/50 rounded-md p-3 border border-border font-mono text-[10px] text-muted-foreground break-all leading-relaxed">
                                {meta.userAgent}
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t border-border">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3">Full Metadata Payload</h4>
                            <pre className="bg-muted/50 rounded-md p-4 border border-border font-mono text-[10px] text-success overflow-x-auto">
                              {JSON.stringify(meta, null, 2)}
                            </pre>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TabsContent>
  );
}
