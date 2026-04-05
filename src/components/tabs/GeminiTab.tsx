import React from 'react';
import { TabsContent } from '../ui/tabs';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface GeminiTabProps {
  geminiLoading: boolean;
  geminiError: string | null;
  geminiBrief: string | null;
  analytics: any;
  metricsLength: number;
  fetchGeminiBrief: () => void;
}

export function GeminiTab({
  geminiLoading,
  geminiError,
  geminiBrief,
  analytics,
  metricsLength,
  fetchGeminiBrief
}: GeminiTabProps) {
  return (
    <TabsContent value="gemini" className="mt-0">
      <div className="github-card">
        <div className="github-card-header">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Intelligence Synthesis</span>
              <span className="text-[10px] text-muted-foreground">Gemini 1.5 Flash Analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchGeminiBrief}
              disabled={geminiLoading}
              className="github-btn github-btn-secondary h-9 px-4"
            >
              {geminiLoading ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <RefreshCw className="w-3 h-3 mr-2" />}
              Regenerate Analysis
            </Button>
          </div>
        </div>
        <div className="p-0 bg-transparent">
          {geminiLoading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <RefreshCw className="w-12 h-12 text-primary animate-spin relative z-10" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-foreground">Synthesizing Intelligence...</p>
                <p className="text-sm text-muted-foreground font-mono">Analyzing {analytics?.totalItems || 0} data points across {metricsLength} sources</p>
              </div>
            </div>
          ) : geminiError ? (
            <div className="flex flex-col items-center justify-center py-40 text-center px-4">
              <div className="w-16 h-16 rounded-md bg-error/10 flex items-center justify-center mb-6 border border-error/20">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Synthesis Interrupted</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">{geminiError}</p>
              <Button onClick={fetchGeminiBrief} className="github-btn github-btn-primary">
                Retry Analysis
              </Button>
            </div>
          ) : geminiBrief ? (
            <div className="p-8 sm:p-12 lg:p-16 relative">
              <div className="absolute inset-0 pointer-events-none" />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="markdown-body bg-card border border-border rounded-md p-8 sm:p-12 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                
                <div className="relative z-10">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: ({ node, ...props }) => (
                        <img 
                          {...props} 
                          referrerPolicy="no-referrer" 
                          className="max-w-full rounded-md border border-border shadow-sm my-6"
                        />
                      )
                    }}
                  >
                    {geminiBrief}
                  </ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Synthesis Engine Active</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    Generated {new Date().toLocaleTimeString()} • {geminiBrief.length} tokens processed
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-40 px-4">
              <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center mx-auto mb-8 border border-border group hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No Intelligence Brief</h3>
              <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                Trigger a synchronization cycle to provide Gemini with fresh technical data for multi-source synthesis and architectural analysis.
              </p>
              <Button onClick={fetchGeminiBrief} className="github-btn github-btn-primary">
                Generate Intelligence Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
