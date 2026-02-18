const fs = require('fs');
const path = require('path');

// Basic static analysis to verify logic existence

const SRC_DIR = path.join(__dirname, '../src');

function scanFile(filePath, checks) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const results = [];
    checks.forEach(check => {
        if (!content.includes(check.str) && !check.regex?.test(content)) {
            results.push(`Missing: ${check.desc}`);
        }
    });
    return results;
}

const audits = [
    {
        file: 'context/EventsContext.tsx',
        checks: [
            { str: 'encryptData(', desc: 'Encryption logic' },
            { str: 'decryptData(', desc: 'Decryption logic' },
            { str: 'db.events.add(', desc: 'Database add' },
            { str: 'db.events.put(', desc: 'Database update' },
            { str: 'db.events.delete(', desc: 'Database delete' }
        ]
    },
    {
        file: 'components/views/EventEditor.tsx',
        checks: [
            { str: 'addEvent(', desc: 'addEvent call' },
            { str: 'updateEvent(', desc: 'updateEvent call' },
            { str: 'handleSubmit', desc: 'Form submission handler' }
        ]
    },
    {
        file: 'components/views/SettingsMain.tsx',
        checks: [
            { str: 'handleExport', desc: 'Export handler' },
            { str: 'handleWipe', desc: 'Wipe handler' }
        ]
    }
];

console.log("--- Logic Audit Report ---");
let totalErrors = 0;

audits.forEach(audit => {
    const fullPath = path.join(SRC_DIR, audit.file);
    if (!fs.existsSync(fullPath)) {
        console.error(`[FAIL] File not found: ${audit.file}`);
        totalErrors++;
        return;
    }

    const errors = scanFile(fullPath, audit.checks);
    if (errors.length > 0) {
        console.error(`[FAIL] ${audit.file}:`);
        errors.forEach(e => console.error(`  - ${e}`));
        totalErrors += errors.length;
    } else {
        console.log(`[PASS] ${audit.file}`);
    }
});

if (totalErrors === 0) {
    console.log("All logic checks passed.");
} else {
    process.exit(1);
}
