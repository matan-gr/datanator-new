import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Terminal, Search, ListFilter, Activity, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import type { AppLog } from '../../types/dashboard';

interface ConsoleTabProps {
  debugLogs: AppLog[];
  debugPage: number;
  setDebugPage: React.Dispatch<React.SetStateAction<number>>;
  debugTotal: number;
  debugLevel: string;
  setDebugLevel: (val: string) => void;
  debugSearch: string;
  setDebugSearch: (val: string) => void;
  selectedLog: AppLog | null;
  setSelectedLog: (log: AppLog | null) => void;
  autoScroll: boolean;
  setAutoScroll: (val: boolean) => void;
  debugScrollRef: React.RefObject<HTMLDivElement>;
}

export function ConsoleTab({
  debugLogs,
  debugPage,
  setDebugPage,
  debugTotal,
  debugLevel,
  setDebugLevel,
  debugSearch,
  setDebugSearch,
  selectedLog,
  setSelectedLog,
  autoScroll,
  setAutoScroll,
  debugScrollRef
}: ConsoleTabProps) {
  return (
    <TabsContent value="debug" className="mt-0 h-[700px] flex flex-col">
      <div className="github-card flex-1 flex flex-col overflow-hidden">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
              <Terminal className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">System Logs</span>
              <span className="text-[10px] text-muted-foreground">Real-time Execution Stream</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mr-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Live Stream
            </div>
            <Button 
              onClick={() => setAutoScroll(!autoScroll)}
              className={`github-btn h-8 px-3 text-[11px] font-semibold ${autoScroll ? 'github-btn-primary' : 'github-btn-secondary'}`}
            >
              Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 p-4 border-b border-border bg-muted/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter log stream..."
              className="github-input pl-9 h-9 text-sm"
              value={debugSearch}
              onChange={(e) => { setDebugSearch(e.target.value); setDebugPage(1); }}
            />
          </div>
          <Select value={debugLevel} onValueChange={(val) => { setDebugLevel(val); setDebugPage(1); }}>
            <SelectTrigger className="github-input w-[160px] h-9 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <ListFilter className="w-3 h-3" />
                <SelectValue placeholder="Level" />
              </div>
            </SelectTrigger>
            <SelectContent className="github-card border-border">
              <SelectItem value="ALL">ALL LEVELS</SelectItem>
              <SelectItem value="INFO">INFO ONLY</SelectItem>
              <SelectItem value="WARN">WARNINGS</SelectItem>
              <SelectItem value="ERROR">ERRORS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${selectedLog ? 'w-2/3 border-r border-border' : 'w-full'}`}>
            <ScrollArea className="flex-1 overflow-hidden min-h-0 bg-card text-foreground" ref={debugScrollRef}>
              <div className="p-4 font-mono text-[11px] leading-relaxed">
                {debugLogs.map((log) => (
                  <div 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className={`flex gap-4 px-3 py-1.5 cursor-pointer hover:bg-muted/50 border-l-2 transition-all ${
                      selectedLog?.id === log.id 
                        ? 'bg-muted border-primary text-foreground' 
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <span className="text-muted-foreground shrink-0 tabular-nums">{new Date(log.timestamp).toISOString().split('T')[1].split('.')[0]}</span>
                    <span className={`shrink-0 w-[50px] font-semibold text-center rounded px-1 py-0.5 text-[9px] ${
                      log.level === 'ERROR' ? 'bg-error/20 text-error border border-error/30' : 
                      log.level === 'WARN' ? 'bg-warning/20 text-warning border border-warning/30' : 
                      'bg-primary/20 text-primary border border-primary/30'
                    }`}>
                      {log.level}
                    </span>
                    <span className="truncate flex-1 font-medium">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="px-6 py-3 border-t border-border bg-muted flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <div>
                <span className="text-foreground">{debugTotal}</span> Events Found
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setDebugPage(p => Math.max(1, p - 1))} disabled={debugPage === 1} className="github-btn github-btn-secondary h-8 px-4 text-[10px] font-semibold">
                  Previous
                </Button>
                <Button onClick={() => setDebugPage(p => p + 1)} disabled={debugPage * 50 >= debugTotal} className="github-btn github-btn-secondary h-8 px-4 text-[10px] font-semibold">
                  Next Page
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedLog && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '33.333333%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-card flex flex-col overflow-hidden border-l border-border"
              >
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Activity className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Event Details</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setSelectedLog(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Timestamp</h4>
                      <div className="bg-muted/50 rounded-lg p-3 border border-border font-mono text-xs text-foreground">
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Severity Level</h4>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold border ${
                        selectedLog.level === 'ERROR' ? 'bg-error/20 text-error border-error/30' : 
                        selectedLog.level === 'WARN' ? 'bg-warning/20 text-warning border-warning/30' : 
                        'bg-primary/20 text-primary border-primary/30'
                      }`}>
                        {selectedLog.level}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">Message Payload</h4>
                      <div className="bg-muted/50 rounded-md p-4 border border-border font-mono text-xs text-foreground leading-relaxed break-words">
                        {selectedLog.message}
                      </div>
                    </div>
                    {selectedLog.metadata && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Extended Metadata</h4>
                        <pre className="bg-muted/50 rounded-md p-4 border border-border font-mono text-[10px] text-primary overflow-x-auto">
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(selectedLog.metadata), null, 2);
                            } catch {
                              return selectedLog.metadata;
                            }
                          })()}
                        </pre>
                      </div>
                    )}
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
