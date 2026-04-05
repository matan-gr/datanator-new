const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports for hooks
const hookImports = `
import { useSyncRuns } from '../hooks/useSyncRuns';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { useDataSources } from '../hooks/useDataSources';
import { useMetrics } from '../hooks/useMetrics';
`;

content = content.replace("import { StatusBadge, StatusChip } from './ui-parts/StatusBadge';", "import { StatusBadge, StatusChip } from './ui-parts/StatusBadge';\n" + hookImports);

// Replace state declarations
const stateDeclarationsToReplace = ` const [runs, setRuns] = useState<SyncRun[]>([]);
 const [syncRunsPage, setSyncRunsPage] = useState(1);
 const [syncRunsTotal, setSyncRunsTotal] = useState(0);
 const [metrics, setMetrics] = useState<SourceMetric[]>([]);
 const [dataSources, setDataSources] = useState<any[]>([]);
 const [files, setFiles] = useState<OutputFile[]>([]);
 const [loading, setLoading] = useState(true);
 const [syncing, setSyncing] = useState(false);
 const [activeTab, setActiveTab] = useState('overview');
 const [readmeContent, setReadmeContent] = useState<string>('');

 // Debug Console State
 const [debugLogs, setDebugLogs] = useState<AppLog[]>([]);
 const [debugPage, setDebugPage] = useState(1);
 const [debugTotal, setDebugTotal] = useState(0);
 const [debugLevel, setDebugLevel] = useState('ALL');
 const [debugSearch, setDebugSearch] = useState('');
 const [debugLoading, setDebugLoading] = useState(false);
 const [selectedLog, setSelectedLog] = useState<AppLog | null>(null);
 const [autoScroll, setAutoScroll] = useState(true);
 const debugScrollRef = useRef<HTMLDivElement>(null);

 // Network Console State
 const [networkLogs, setNetworkLogs] = useState<AppLog[]>([]);
 const [networkPage, setNetworkPage] = useState(1);
 const [networkTotal, setNetworkTotal] = useState(0);
 const [networkSearch, setNetworkSearch] = useState('');
 const [networkLoading, setNetworkLoading] = useState(false);
 const [selectedNetworkLog, setSelectedNetworkLog] = useState<AppLog | null>(null);

 // Run Details State
 const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);
 const [runLogs, setRunLogs] = useState<AppLog[]>([]);
 const [runLogsLoading, setRunLogsLoading] = useState(false);

 // Gemini Brief State
 const [geminiBrief, setGeminiBrief] = useState<string | null>(null);
 const [geminiLoading, setGeminiLoading] = useState(false);
 const [geminiError, setGeminiError] = useState<string | null>(null);

 // Settings State
 const [settings, setSettings] = useState<Record<string, string>>({});
 const [settingsLoading, setSettingsLoading] = useState(false);
 const [purging, setPurging] = useState(false);
 const [showPurgeDialog, setShowPurgeDialog] = useState(false);
 const [showResetDialog, setShowResetDialog] = useState(false);
 const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
 const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
 const [showEditSourceDialog, setShowEditSourceDialog] = useState(false);
 const [newSource, setNewSource] = useState({ name: '', url: '', type: 'rss' });
 const [editingSource, setEditingSource] = useState<any>(null);
 const [systemStatus, setSystemStatus] = useState<any>(null);`;

const hookCalls = `
  const { runs, syncRunsPage, setSyncRunsPage, syncRunsTotal, loading, syncing, triggerSync, fetchRuns } = useSyncRuns();
  const { debugLogs, debugPage, setDebugPage, debugTotal, debugLevel, setDebugLevel, debugSearch, setDebugSearch, debugLoading, selectedLog, setSelectedLog, autoScroll, setAutoScroll, debugScrollRef, networkLogs, networkPage, setNetworkPage, networkTotal, networkSearch, setNetworkSearch, networkLoading, selectedNetworkLog, setSelectedNetworkLog, fetchDebugLogs, fetchNetworkLogs } = useSystemLogs();
  const { dataSources, sourceToDelete, setSourceToDelete, showAddSourceDialog, setShowAddSourceDialog, showEditSourceDialog, setShowEditSourceDialog, newSource, setNewSource, editingSource, setEditingSource, fetchDataSources, testConnection, addSource, updateSource, deleteSource, toggleSourceActive } = useDataSources();
  const { metrics, fetchMetrics } = useMetrics();

  const [files, setFiles] = useState<OutputFile[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [readmeContent, setReadmeContent] = useState<string>('');

  // Run Details State
  const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);
  const [runLogs, setRunLogs] = useState<AppLog[]>([]);
  const [runLogsLoading, setRunLogsLoading] = useState(false);

  // Gemini Brief State
  const [geminiBrief, setGeminiBrief] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [purging, setPurging] = useState(false);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
`;

content = content.replace(stateDeclarationsToReplace, hookCalls);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced state with hooks');
