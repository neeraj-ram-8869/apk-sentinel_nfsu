const fs = require('fs');

let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Imports to add
const imports = [
  'import VirusTotalView from "@/components/VirusTotalView";',
  'import DynamicAnalysisView from "@/components/DynamicAnalysisView";',
  'import ScanHistoryView from "@/components/ScanHistoryView";',
  'import PolicyEngineView from "@/components/PolicyEngineView";',
  'import SettingsView from "@/components/SettingsView";'
];

for (const imp of imports) {
  if (!code.includes(imp)) {
    code = code.replace('"use client";', `"use client";\n${imp}`);
  }
}

// Remove the inline functions
const funcsToRemove = [
  'VirusTotalView',
  'DynamicAnalysisView',
  'ScanHistoryView',
  'PolicyEngineView',
  'SettingsView'
];

for (const fn of funcsToRemove) {
  // A simple regex to remove the function block.
  // Since the blocks are large and contain nested brackets, regex is hard.
  // Let's use simple string slicing:
  const searchStr = `function ${fn}(`;
  let idx = code.indexOf(searchStr);
  if (idx !== -1) {
    let bracketCount = 0;
    let started = false;
    let endIdx = idx;
    
    for (let i = idx; i < code.length; i++) {
      if (code[i] === '{') {
        bracketCount++;
        started = true;
      } else if (code[i] === '}') {
        bracketCount--;
      }
      
      if (started && bracketCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
    
    // Also remove the "──────────────────────────" comment blocks right above it
    let startIdx = idx;
    let linesBefore = code.slice(Math.max(0, idx - 200), idx).split('\n');
    let backpedal = 0;
    for (let i = linesBefore.length - 1; i >= 0; i--) {
      if (linesBefore[i].includes('// ─────') || linesBefore[i].includes('// ' + fn.replace('View', '').toUpperCase())) {
        backpedal += linesBefore[i].length + 1;
      } else if (linesBefore[i].trim() === '') {
        backpedal += 1;
      } else {
        break;
      }
    }
    
    code = code.substring(0, startIdx - backpedal) + code.substring(endIdx);
  }
}

fs.writeFileSync('src/app/page.tsx', code);
console.log('Cleanup completed!');
