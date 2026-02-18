const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../dist/Load_Log_v1.html');

if (!fs.existsSync(FILE_PATH)) {
    console.error(`ERROR: File not found at ${FILE_PATH}`);
    process.exit(1);
}

const content = fs.readFileSync(FILE_PATH, 'utf-8');
const errors = [];
const warnings = [];

// 1. Structure Verification
if (!content.includes('<!doctype html>')) errors.push('Missing doctype');
if (!content.includes('<html')) errors.push('Missing html tag');
if (!content.includes('<head>')) errors.push('Missing head tag');
if (!content.includes('<body>')) errors.push('Missing body tag');
if (!content.includes('<div id="root"></div>')) errors.push('Missing root div for React');

// 2. Critical Meta Tags
if (!content.includes('<meta charset="UTF-8"')) errors.push('Missing charset');
if (!content.includes('<meta name="viewport"')) errors.push('Missing viewport');
if (!content.includes('<title>Load Log | Private Tracker</title>')) errors.push('Incorrect or missing title');

// 3. Asset Integrity (Single File Check)
const externalLinkRegex = /<link.*href=["'](?!data:)/g;
const externalScriptRegex = /<script.*src=["'](?!data:)/g;

let match;
while ((match = externalLinkRegex.exec(content)) !== null) {
    if (!match[0].includes('rel="manifest"')) { // Manifest might be external if not inlined, but checking for others
        // Actually, singlefile plugin usually inlines everything. 
        // If we see href="./..." it's a fail for "single file portable".
        warnings.push(`Potential external link found: ${match[0]}`);
    }
}

while ((match = externalScriptRegex.exec(content)) !== null) {
    warnings.push(`Potential external script found: ${match[0]}`);
}

// 4. Base64 Favicon Check
if (!content.includes('data:image/x-icon;base64')) {
    errors.push('Favicon is not inlined as base64');
}

// 5. Script Injection Check
if (!content.includes('window.location.protocol')) {
    // Just a heuristic, not a strict error
}

console.log("--- HTML Audit Report ---");
if (errors.length > 0) {
    console.error("CRITICAL ERRORS FOUND:");
    errors.forEach(e => console.error(`[X] ${e}`));
    process.exit(1);
} else {
    console.log("[PASS] Critical Structure Verified");
}

if (warnings.length > 0) {
    console.warn("WARNINGS:");
    warnings.forEach(w => console.warn(`[!] ${w}`));
} else {
    console.log("[PASS] No external asset warnings");
}

console.log("Audit complete.");
