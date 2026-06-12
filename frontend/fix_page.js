const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf8');
const lines = c.split('\n');
c = [...lines.slice(0, 859), ...lines.slice(897)].join('\n');
if (!c.includes('import CodeForensicsView')) {
  c = 'import CodeForensicsView from "@/components/CodeForensicsView";\n' + c;
}
fs.writeFileSync('src/app/page.tsx', c);
console.log('Fixed page.tsx');
