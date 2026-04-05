const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

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

// Insert fetchAllData before the first useEffect
content = content.replace('  useEffect(() => {', fetchAllDataDefinition + '\n  useEffect(() => {');

// Replace all occurrences of fetchData with fetchAllData
content = content.replace(/fetchData\(\)/g, 'fetchAllData()');
content = content.replace(/refreshSources=\{fetchData\}/g, 'refreshSources={fetchAllData}');
content = content.replace(/refreshFiles=\{fetchData\}/g, 'refreshFiles={fetchAllData}');
content = content.replace(/refreshNetworkLogs=\{fetchData\}/g, 'refreshNetworkLogs={fetchAllData}');
content = content.replace(/setInterval\(fetchData,/g, 'setInterval(fetchAllData,');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced fetchData with fetchAllData');
