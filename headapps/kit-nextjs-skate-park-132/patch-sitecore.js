const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '.sitecore', 'import-map.server.ts');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // Replace the broken core/codegen path with the valid nextjs/codegen module path
  if (content.includes("'@sitecore-content-sdk/core/codegen'")) {
    content = content.replace(
      /'@sitecore-content-sdk\/core\/codegen'/g, 
      "'@sitecore-content-sdk/nextjs/codegen'"
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched .sitecore/import-map.server.ts targeting nextjs/codegen!');
  }
} else {
  console.log('No generated import map found to patch yet.');
}
