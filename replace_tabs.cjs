const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<TabsContent value="overview" className="mt-0">';
const endMarker = '</TabsContent>\n              </motion.div>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + '</TabsContent>'.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `
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
                refreshSources={fetchData} 
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
                refreshFiles={fetchData} 
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
                refreshNetworkLogs={fetchData} 
              />
              <SettingsTab 
                settings={settings} 
                updateSetting={updateSetting} 
                systemStatus={systemStatus} 
                purging={purging} 
                setShowPurgeDialog={setShowPurgeDialog} 
                setShowResetDialog={setShowResetDialog} 
                appVersion={__APP_VERSION__} 
              />`;
              
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced tabs content.');
} else {
  console.log('Could not find markers.');
  console.log('Start index:', startIndex);
  console.log('End index:', endIndex);
}
