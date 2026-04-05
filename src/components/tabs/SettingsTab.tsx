import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Settings, Clock, ShieldCheck, Database, FileText, Activity, Server, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface SettingsTabProps {
  settings: any;
  updateSetting: (key: string, value: any) => void;
  systemStatus: any;
  purging: boolean;
  setShowPurgeDialog: (show: boolean) => void;
  setShowResetDialog: (show: boolean) => void;
  appVersion: string;
}

export function SettingsTab({
  settings,
  updateSetting,
  systemStatus,
  purging,
  setShowPurgeDialog,
  setShowResetDialog,
  appVersion
}: SettingsTabProps) {
  return (
    <TabsContent value="settings" className="mt-0">
      <div className="github-card">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">System Settings</span>
              <span className="text-[10px] text-muted-foreground">Configuration & Control</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col min-h-[700px]">
          {/* Settings Content */}
          <div className="flex-1 p-8 space-y-12">
            <section className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">General Configuration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">Manage your core system preferences, data retention policies, and global environment variables.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary">
                  System v{appVersion}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-semibold text-foreground">Log Retention Policy</Label>
                  </div>
                  <Select 
                    value={settings.logRetentionDays || '0'} 
                    onValueChange={(val) => updateSetting('logRetentionDays', val)}
                  >
                    <SelectTrigger className="github-input h-11 text-sm">
                      <SelectValue placeholder="Select retention" />
                    </SelectTrigger>
                    <SelectContent className="github-card border-border">
                      <SelectItem value="0">Forever (No Purge)</SelectItem>
                      <SelectItem value="7">7 Days Retention</SelectItem>
                      <SelectItem value="30">30 Days Retention</SelectItem>
                      <SelectItem value="90">90 Days Retention</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    Determines how long system and network telemetry logs are stored before being automatically purged from the database.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <Label className="text-sm font-semibold text-foreground">Security Level</Label>
                  </div>
                  <div className="h-11 bg-muted border border-border rounded-md flex items-center px-4 text-sm text-muted-foreground italic">
                    Standard Protection Enabled
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    Your system is currently running with standard security protocols. Advanced RBAC controls are managed via IAM.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">System Health & Metrics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">Real-time performance metrics of the underlying database, file system, and application runtime.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-muted/50 border border-border rounded-md hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <Database className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-muted-foreground">Storage</span>
                  </div>
                  <div className="text-2xl font-mono font-semibold text-foreground">{(systemStatus?.dbSize / 1024).toFixed(1)} <span className="text-xs text-muted-foreground">KB</span></div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-medium">Database Payload Size</div>
                </div>
                
                <div className="p-6 bg-muted/50 border border-border rounded-md hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-muted-foreground">Artifacts</span>
                  </div>
                  <div className="text-2xl font-mono font-semibold text-foreground">{systemStatus?.fileCount || 0} <span className="text-xs text-muted-foreground">Objects</span></div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-medium">Total Files Stored</div>
                </div>

                <div className="p-6 bg-muted/50 border border-border rounded-md hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-muted-foreground">Uptime</span>
                  </div>
                  <div className="text-2xl font-mono font-semibold text-foreground">
                    {systemStatus?.uptime ? (
                      systemStatus.uptime > 86400 
                        ? `${Math.floor(systemStatus.uptime / 86400)}d ${Math.floor((systemStatus.uptime % 86400) / 3600)}h`
                        : systemStatus.uptime > 3600
                        ? `${Math.floor(systemStatus.uptime / 3600)}h ${Math.floor((systemStatus.uptime % 3600) / 60)}m`
                        : `${Math.floor(systemStatus.uptime / 60)}m`
                    ) : '0m'}
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-medium">Continuous Runtime</div>
                </div>

                <div className="p-6 bg-muted/50 border border-border rounded-md hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <Server className="w-4 h-4 text-warning group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-muted-foreground">Environment</span>
                  </div>
                  <div className="text-2xl font-mono font-semibold text-foreground">Production</div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-medium">Deployment Context</div>
                </div>
              </div>
            </section>

            <section className="pt-10">
              <div className="bg-error/5 border border-error/20 rounded-md overflow-hidden">
                <div className="bg-error/10 px-6 py-4 border-b border-error/20 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-error" />
                  <h3 className="text-xs font-semibold text-error">Critical Operations Zone</h3>
                </div>
                <div className="p-8 space-y-8 bg-card/40">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="text-base font-semibold text-foreground">Purge All System Data</div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                        Permanently delete all synchronization runs, telemetry logs, and generated artifacts. This action is <span className="text-error font-semibold underline">irreversible</span>.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPurgeDialog(true)}
                      disabled={purging}
                      className="h-11 px-8 text-xs font-semibold text-error border-error/30 hover:bg-error hover:text-white transition-all shrink-0"
                    >
                      {purging ? 'Purging Data...' : 'Execute Full Purge'}
                    </Button>
                  </div>

                  <div className="h-px bg-border w-full" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="text-base font-semibold text-foreground">Factory Reset Configuration</div>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                        Reset all system configuration settings to their default values. This will not delete your data but will reset retention policies.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowResetDialog(true)}
                      className="h-11 px-8 text-xs font-semibold text-muted-foreground border-border hover:bg-muted hover:text-foreground transition-all shrink-0"
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
