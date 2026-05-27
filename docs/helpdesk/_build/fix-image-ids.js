/**
 * Fix duplicate docPr IDs in docx (post-unzip).
 * Reads /tmp/docx-fix/word/document.xml, renumbers IDs, writes back.
 */
const fs = require('fs');

const docPath = process.argv[2];
if (!docPath) { console.error('Usage: node fix-image-ids.js <path-to-document.xml>'); process.exit(1); }

let xml = fs.readFileSync(docPath, 'utf8');

let counter = 1;
const matches = xml.match(/<wp:docPr id="\d+"/g) || [];
xml = xml.replace(/<wp:docPr id="\d+"/g, () => `<wp:docPr id="${counter++}"`);

let picCounter = 1;
xml = xml.replace(/<pic:cNvPr id="\d+"/g, () => `<pic:cNvPr id="${picCounter++}"`);

fs.writeFileSync(docPath, xml);
console.log(`✓ Renumbered ${matches.length} <wp:docPr id> + ${picCounter - 1} <pic:cNvPr id>`);
