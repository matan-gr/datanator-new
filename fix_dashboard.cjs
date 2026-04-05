const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find where the replacement started
const replacementStartIndex = lines.findIndex(line => line.includes('<OverviewTab'));

// Find where the duplicated content started (it starts with "import { GoogleGenAI }")
const duplicatedStartIndex = lines.findIndex((line, index) => index > replacementStartIndex && line.includes('import { OverviewTab }'));

// Find the end of the settings tab in the duplicated content
const settingsTabEndIndex = lines.findIndex((line, index) => index > duplicatedStartIndex && line.includes('</TabsContent>') && lines[index + 1].includes('</motion.div>'));

if (replacementStartIndex !== -1 && duplicatedStartIndex !== -1 && settingsTabEndIndex !== -1) {
  const correctLines = [
    ...lines.slice(0, duplicatedStartIndex),
    ...lines.slice(settingsTabEndIndex + 1)
  ];
  
  fs.writeFileSync(filePath, correctLines.join('\n'), 'utf8');
  console.log('Successfully fixed Dashboard.tsx');
} else {
  console.log('Could not find markers to fix.');
  console.log('replacementStartIndex:', replacementStartIndex);
  console.log('duplicatedStartIndex:', duplicatedStartIndex);
  console.log('settingsTabEndIndex:', settingsTabEndIndex);
}
