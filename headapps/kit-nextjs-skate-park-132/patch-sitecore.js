const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '.sitecore', 'import-map.server.ts');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // Replace the broken codegen path with the base package path
  if (content.includes("'@sitecore-content-sdk/core/codegen'")) {
    content = content.replace(
      /'@sitecore-content-sdk\/core\/codegen'/g, 
      "'@sitecore-content-sdk/nextjs'"
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched .sitecore/import-map.server.ts for version 1.3.2!');
  }
} else {
  console.log('No generated import map found to patch yet.');
}
