import React from 'react';
import { TabsContent } from '../ui/tabs';
import { FileText, Download, Cloud, RefreshCw, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import type { OutputFile } from '../../types/dashboard';

interface FilesTabProps {
  files: OutputFile[];
  loading: boolean;
  handleDownloadAll: () => void;
  setIsGCSDialogOpen: (show: boolean) => void;
  refreshFiles: () => void;
}

export function FilesTab({
  files,
  loading,
  handleDownloadAll,
  setIsGCSDialogOpen,
  refreshFiles
}: FilesTabProps) {
  return (
    <TabsContent value="files" className="mt-0">
      <div className="github-card">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Artifact Repository</span>
              <span className="text-[10px] text-muted-foreground">Secure Storage Layer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-muted-foreground mr-4">
              <span className="text-foreground">{files.length}</span> Objects Stored
            </div>
            <Button onClick={handleDownloadAll} disabled={files.length === 0} className="github-btn github-btn-secondary">
              <Download className="w-3.5 h-3.5 mr-2" />
              Download All
            </Button>
            <Button onClick={() => setIsGCSDialogOpen(true)} disabled={files.length === 0} className="github-btn github-btn-secondary">
              <Cloud className="w-3.5 h-3.5 mr-2" />
              Export to GCS
            </Button>
            <Button onClick={refreshFiles} className="github-btn github-btn-secondary h-9 px-4">
              <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Repository
            </Button>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="github-table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>File Name</th>
                <th className="text-right">Size</th>
                <th className="text-right">Modified</th>
                <th className="text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.name} className="group hover:bg-muted/50 transition-all duration-300">
                  <td className="w-8 pl-6 pr-1">
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </td>
                  <td className="font-mono text-[13px] text-foreground group-hover:text-primary transition-colors py-4">
                    {file.name}
                  </td>
                  <td className="text-right text-[13px] text-muted-foreground py-4">
                    <span className="font-semibold text-foreground">{(file.size / 1024).toFixed(1)}</span> KB
                  </td>
                  <td className="text-right font-mono text-[12px] text-muted-foreground py-4">
                    {new Date(file.lastModified).toLocaleString()}
                  </td>
                  <td className="text-right py-4 pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => window.open(`/api/v1/files/${file.name}`, '_blank')}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => window.open(`/api/v1/files/${file.name}?download=1`, '_blank')}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p className="text-sm">No output artifacts found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TabsContent>
  );
}
