import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Database, FileText, BookOpen, Activity } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StatusChip } from '../ui-parts/StatusBadge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { SyncRun, SourceMetric } from '../../types/dashboard';

interface OverviewTabProps {
  runs: SyncRun[];
  metrics: SourceMetric[];
  readmeContent: string;
  analytics: any;
  setActiveTab: (tab: string) => void;
  openRunDetails: (run: SyncRun) => void;
  markdownComponents: any;
}

export function OverviewTab({
  runs,
  metrics,
  readmeContent,
  analytics,
  setActiveTab,
  openRunDetails,
  markdownComponents
}: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="mt-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: File List Style */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          <div className="github-card">
            <div className="github-card-header">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">System Pipeline Status</span>
                  <span className="text-[10px] text-muted-foreground">Recent Sync Cycles</span>
                </div>
              </div>
              {runs.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-muted-foreground">Last run: {new Date(runs[0].timestamp).toLocaleTimeString()}</span>
                  <StatusChip status={runs[0].status} />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <table className="github-table">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th>Sync Identifier</th>
                    <th>Throughput</th>
                    <th>Status</th>
                    <th className="text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 8).map((run) => (
                    <tr key={run.id} onClick={() => openRunDetails(run)} className="cursor-pointer group">
                      <td className="w-8 pl-6 pr-1">
                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </td>
                      <td className="font-mono text-[13px] text-foreground group-hover:text-primary transition-colors py-4">
                        {run.triggerType.toLowerCase()}_sync_{run.id.substring(0, 7)}.log
                      </td>
                      <td className="text-[13px] text-muted-foreground py-4">
                        <span className="font-semibold text-foreground">{run.totalItemsParsed}</span> items processed
                      </td>
                      <td className="py-4">
                        <StatusChip status={run.status} />
                      </td>
                      <td className="text-right font-mono text-[12px] text-muted-foreground py-4 pr-6">
                        {new Date(run.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* README Style Section */}
          <div className="github-card">
            <div className="github-card-header sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">System Documentation</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">README.md</Badge>
            </div>
            <div className="p-10 markdown-body bg-transparent">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {readmeContent || 'Loading system documentation...'}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          <div className="github-card p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">About System</h3>
              <p className="text-sm text-foreground leading-relaxed">
                Technical intelligence aggregator. Built for high-density data synthesis and automated cloud architecture insights.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">System Metrics</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-muted/50 rounded-md p-4 border border-border hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Pipeline Health</span>
                    <Activity className="w-3 h-3 text-success" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{analytics?.successRate || 0}%</div>
                </div>
                <div className="bg-muted/50 rounded-md p-4 border border-border hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Total Ingestion</span>
                    <Database className="w-3 h-3 text-primary" />
                  </div>
                  <div className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{analytics?.totalItems ? (analytics.totalItems / 1000).toFixed(1) + 'k' : '0'}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Source Integrity</h3>
              <div className="space-y-3">
                {metrics.slice(0, 6).map(m => (
                  <div key={m.id} className="flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab('sources')}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${m.healthStatus === 'HEALTHY' ? 'bg-success shadow-sm' : 'bg-error shadow-sm'}`} />
                      <span className="text-xs font-semibold text-muted-foreground truncate group-hover:text-primary transition-colors">{m.sourceName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{m.itemsParsedLastSync}</span>
                  </div>
                ))}
              </div>
              {metrics.length > 6 && (
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('sources')} className="w-full text-[11px] text-primary font-semibold justify-center hover:bg-accent rounded-md">
                  View {metrics.length - 6} more sources
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
