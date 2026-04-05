const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// We need to remove fetchData, fetchDebugLogs, fetchNetworkLogs, testConnection, addSource, updateSource, deleteSource, toggleSourceActive, triggerSync

// Let's just use regex or string replacement to remove them.

const functionsToRemove = [
  'const fetchData = async () => {',
  'const fetchDebugLogs = async () => {',
  'const fetchNetworkLogs = async () => {',
  'const testConnection = async (url: string) => {',
  'const addSource = async () => {',
  'const updateSource = async () => {',
  'const deleteSource = async () => {',
  'const toggleSourceActive = async (id: string, currentStatus: string) => {',
  'const triggerSync = async (sourceId?: string) => {'
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
  
  // also remove trailing newline/semicolon
  while (content[endIndex] === ';' || content[endIndex] === '\n' || content[endIndex] === '\r') {
    endIndex++;
  }
  
  return content.substring(0, startIndex) + content.substring(endIndex);
}

for (const func of functionsToRemove) {
  content = removeFunction(content, func);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed duplicated functions');
