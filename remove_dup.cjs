const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Dashboard.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
// lines 920 to 937 are indices 919 to 936
lines.splice(919, 18);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully removed duplicated imports');
