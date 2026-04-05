const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add new imports
const newImports = `
import { useDashboardData } from '../hooks/useDashboardData';
import { useGeminiBrief } from '../hooks/useGeminiBrief';
import { useRunDetails } from '../hooks/useRunDetails';
`;

content = content.replace("import { useMetrics } from '../hooks/useMetrics';", "import { useMetrics } from '../hooks/useMetrics';\n" + newImports);

// Replace state
const stateToReplace = `  const [files, setFiles] = useState<OutputFile[]>([]);
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
  const [systemStatus, setSystemStatus] = useState<any>(null);`;

const newHooks = `  const { files, analytics, readmeContent, systemStatus, settings, settingsLoading, fetchAllDashboardData, fetchSettings } = useDashboardData();
  const { geminiBrief, geminiLoading, geminiError, fetchGeminiBrief } = useGeminiBrief();
  const { selectedRun, setSelectedRun, runLogs, runLogsLoading, openRunDetails } = useRunDetails();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [purging, setPurging] = useState(false);
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);`;

content = content.replace(stateToReplace, newHooks);

// Now we need to remove the functions that we moved to hooks:
// fetchRunLogs, fetchGeminiBrief

const functionsToRemove = [
  'const fetchRunLogs = async (runId: string) => {',
  'const fetchGeminiBrief = async () => {'
];

function removeFunction(content, startString) {
  const startIndex = content.indexOf(startString);
  if (startIndex === -1) return content;
  
  let braceCount = 0;
  let endIndex = startIndex;
  let foundFirstBrace = false;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundFirstBrace = true;
    } else if (content[i] === '}') {
      braceCount--;
    }
    
    if (foundFirstBrace && braceCount === 0) {
      endIndex = i + 1;
      break;
    }
  }
  
  while (content[endIndex] === ';' || content[endIndex] === '\n' || content[endIndex] === '\r') {
    endIndex++;
  }
  
  return content.substring(0, startIndex) + content.substring(endIndex);
}

for (const func of functionsToRemove) {
  content = removeFunction(content, func);
}

// We also need to update the useEffect that calls fetchData
const oldUseEffect = `  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2s for live refresh
    return () => clearInterval(interval);
  }, [syncRunsPage]);`;

const newUseEffect = `  const fetchAllData = async () => {
    await Promise.all([
      fetchRuns(),
      fetchMetrics(),
      fetchDataSources(),
      fetchAllDashboardData(),
      fetchDebugLogs(),
      fetchNetworkLogs()
    ]);
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2000); // Poll every 2s for live refresh
    return () => clearInterval(interval);
  }, [syncRunsPage]);`;

content = content.replace(oldUseEffect, newUseEffect);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Dashboard.tsx with new hooks');
