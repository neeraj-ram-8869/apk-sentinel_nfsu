const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

function removeComponent(name) {
  const regex = new RegExp(`// ─+[\\r\\n]+// ${name.toUpperCase().replace(/VIEW$/, ' VIEW').trim()}[\\r\\n]+// ─+[\\r\\n]+function ${name}\\([\\s\\S]*?^}$`, 'm');
  const match = code.match(regex);
  if (match) {
    console.log(`Removing ${name}`);
    code = code.replace(regex, '');
  } else {
    // Fallback regex if header didn't match perfectly
    const fb = new RegExp(`function ${name}\\([\\s\\S]*?^}$`, 'm');
    if (code.match(fb)) {
       console.log(`Removing ${name} via fallback`);
       code = code.replace(fb, '');
    } else {
       console.log(`Could not find ${name}`);
    }
  }
}

removeComponent('DashboardView');
removeComponent('AiNarrativeView');
removeComponent('AssetInventoryView');

fs.writeFileSync('src/app/page.tsx', code);
