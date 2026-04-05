const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the wrongly placed fetchAllData
const fetchAllDataDefinition = `
  const fetchAllData = async () => {
    await Promise.all([
      fetchRuns(),
      fetchMetrics(),
      fetchDataSources(),
      fetchAllDashboardData(),
      fetchDebugLogs(),
      fetchNetworkLogs()
    ]);
  };
`;

content = content.replace(fetchAllDataDefinition, '');

// Insert it inside Dashboard
const dashboardStart = `  const [showResetDialog, setShowResetDialog] = useState(false);`;
content = content.replace(dashboardStart, dashboardStart + '\n' + fetchAllDataDefinition);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully moved fetchAllData inside Dashboard');
