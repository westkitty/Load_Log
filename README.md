# Load Log (Private Intimacy Tracker)

A privacy-focused, offline-first Progressive Web App (PWA) for tracking intimate events. 

**Zero telemetry. Zero backend. Your data is encrypted on your device.**

## Features
- 🔒 **End-to-End Encryption**: All data is encrypted with AES-GCM derived from your passphrase (PBKDF2).
- 📱 **Offline-First PWA**: Works fully offline. Installable on iOS (Safari -> Add to Home Screen) and Android.
- 📊 **Local Analytics**: Insights, charts, and yearly summaries generated locally.
- 🛡️ **Privacy by Default**: No tracking, no external API calls, no third-party scripts.
- ⚡ **Panic Mode**: Instantly lock and hide sensitive data.
- 💾 **Encrypted Exports**: Backup your data safely as JSON.
- 📄 **PDF Reporting**: Generate printable event histories.
- 📥 **CSV Import**: Import data from other sources.
- 👁️ **Hidden Profile**: Flag sensitive events and hide them from the timeline/dashboard.
- 🌗 **Dark/Light Mode**: Customizable themes.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Storage**: Dexie.js (IndexedDB)
- **Encryption**: Web Crypto API
- **Charts**: Recharts
- **PWA**: Vite PWA / Workbox

## Security Model
1. **Key Derivation**: Your passphrase is used to derive a 256-bit encryption key using PBKDF2 (SHA-256, 500k iterations) and a random salt.
2. **Encryption**: Each event record is encrypted separately using AES-GCM with a unique random IV.
3. **Storage**: The encrypted blob and IV are stored in IndexedDB.
4. **Session**: The key is held in memory while unlocked. It is wiped on lock, timeout (5 min inactivity), or page unload.
5. **No Recovery**: There is no password reset. If you lose your passphrase, your data is lost.

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

### Building for Production
**Option 1: PWA (Recommended for Mobile)**
```bash
npm run build
```
Creates a standard PWA in `dist/`. Best for installing on iOS/Android. Requires a static web host (GitHub Pages, Netlify, etc.).

**Option 2: Single HTML File (Portable)**
```bash
npm run build:single
```
Creates a single self-contained `index.html` in `dist-single/`.
- **Pros**: Can be emailed, stored on USB, or opened directly from file system (`file://`). No hosting required.
- **Cons**: No offline caching (Service Worker disabled). "Add to Home Screen" may not work as a full app. Updates require replacing the file.

**Note for Deployment**: Ensure your host serves `index.html` for all unknown routes (SPA fallback).

## User Guide
1. **Onboarding**: Set a strong passphrase. This creates your encryption key.
2. **Logging**: Click "+" to add an event. Select type, partners, protection, etc.
3. **Locking**: Click the "Lock" button in the header or wait 5 minutes for auto-lock.
4. **Backup**: Go to Settings -> Export Backup to save an encrypted JSON file.
5. **PDF Export**: Generate a printable PDF report from Settings.
6. **Hidden Content**: Toggle "Show Sensitive" in Settings to reveal hidden events.

## Data Export Format
The backup file is a JSON containing:
- `version`: Schema version
- `salt`: The salt used for key derivation
- `verifier`: Encrypted token to verify password
- `events`: Array of encrypted event records (id, date, data, iv)

## License
MIT
