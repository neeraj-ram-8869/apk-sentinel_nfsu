const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const views = [
  'ScannerView',
  'CodeForensicsView', 
  'VirusTotalView',
  'DynamicAnalysisView',
  'ScanHistoryView',
  'PolicyEngineView',
  'SettingsView'
];

function migrateView(viewName) {
  const startIndex = code.indexOf(`function ${viewName}`);
  if (startIndex === -1) return;
  
  let endIndex = code.indexOf(`// ─────────────────────────────────────────────────────────────────`, startIndex + 100);
  if (endIndex === -1) endIndex = code.length;

  let viewCode = code.substring(startIndex, endIndex);

  // Typography
  viewCode = viewCode.replace(/className="font-bold" style={{ fontSize: "1\.1rem" }}/g, 'className="font-headline-sm text-headline-sm text-on-surface"');
  viewCode = viewCode.replace(/className="font-bold" style={{ fontSize: "1rem" }}/g, 'className="font-headline-sm text-headline-sm text-on-surface"');
  viewCode = viewCode.replace(/className="font-bold" style={{ fontSize: "0\.9rem" }}/g, 'className="font-headline-sm text-headline-sm text-on-surface"');
  viewCode = viewCode.replace(/className="font-bold" style={{ fontSize: "0\.85rem" }}/g, 'className="font-headline-sm text-headline-sm text-on-surface"');
  
  viewCode = viewCode.replace(/className="text-muted" style={{ fontSize: "0\.7rem" }}/g, 'className="font-body-md text-body-md text-on-surface-variant mt-xs"');
  viewCode = viewCode.replace(/className="text-muted" style={{ fontSize: "0\.68rem" }}/g, 'className="font-body-md text-body-md text-on-surface-variant"');
  viewCode = viewCode.replace(/className="text-muted" style={{ fontSize: "0\.65rem" }}/g, 'className="font-body-sm text-body-sm text-outline"');

  // Misc old styling
  viewCode = viewCode.replace(/borderBottom: analysisResult \? "1px solid var\(--border-color\)" : undefined/g, 'borderBottom: analysisResult ? "1px solid var(--border-outline-variant)" : undefined');

  code = code.substring(0, startIndex) + viewCode + code.substring(endIndex);
}

views.forEach(migrateView);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Migration script typography phase completed.');
