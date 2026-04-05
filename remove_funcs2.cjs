const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const functionsToRemove = [
  'const testConnection = async (sourceId: string) => {',
  'const triggerSync = async (sourceId?: string, force: boolean = false) => {'
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

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully removed remaining functions');
