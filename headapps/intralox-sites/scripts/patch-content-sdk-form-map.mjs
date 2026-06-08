/**
 * After `sitecore-tools project component generate-map`, the server map resets
 * `['Form', Form]` which breaks the App Router RSC boundary for the SDK Form.
 * Re-apply Content SDK app-router registration (see content-sdk generate-map.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, '..', '.sitecore', 'component-map.ts');

let text = fs.readFileSync(mapPath, 'utf8');
const before = text;
text = text.replace(
  /(\['Form', )Form(\],)/,
  "$1{ ...Form, componentType: 'client' }$2"
);
if (text === before) {
  console.warn(
    'patch-content-sdk-form-map: no Form entry matched; skip (map may already be patched or format changed)'
  );
} else {
  fs.writeFileSync(mapPath, text, 'utf8');
  console.log('patch-content-sdk-form-map: Form registered with componentType client');
}
