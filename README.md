# ♂ Load Log - Men-Only Privacy Tracker

**Your loads. Your data. Your business.**

A privacy-first, offline PWA for men to track ejaculation events, patterns, and context. Zero cloud. Zero accounts. Zero judgment.

## Why?

Track frequency, sources, intensity, refractory periods, and streaks—all encrypted on your device. Whether you're tracking NoFap progress, optimizing performance, or just curious about patterns, Load Log keeps it private.

## Features

- 🔐 **Military-Grade Encryption** - AES-256-GCM, PBKDF2 (500k iterations)
- ♂ **Men-Only Design** - Masculine UI, cheeky copy, no fluff
- 📴 **100% Offline** - PWA installable on iOS/Android
- ⚡ **Panic Lock** - Instant lockout on demand
- 📊 **Insights** - Frequency, streaks, top sources, mood patterns
- 🎯 **Quick Log** - One-tap recording
- 🚫 **No Cloud** - Data never leaves your device
- 💾 **Encrypted Backups** - Export/import anytime

## For Men Who Value Privacy

No explicit content stored. Just metadata and patterns. Track what matters without exposing what doesn't. Simple, secure, yours.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **Storage**: Dexie.js (IndexedDB)
- **Encryption**: Web Crypto API (AES-GCM, PBKDF2)
- **Charts**: Recharts
- **PWA**: Vite PWA / Workbox

## Security Model

1. **Key Derivation**: PBKDF2-SHA256 with 500,000 iterations
2. **Encryption**: AES-GCM 256-bit with unique IV per record
3. **Storage**: Encrypted blobs in IndexedDB
4. **Session**: Key held in memory only, wiped on lock/timeout
5. **No Recovery**: Lost passphrase = lost data (by design)

## Getting Started

### Prerequisites
- Node.js 18+

### Installation
```bash
git clone https://github.com/westkitty/Load_Log
cd nice-pwa
npm install
npm run dev
```

### Building for Production

**PWA Build (Recommended)**
```bash
npm run build
```
Deploy `dist/` to any static host. Best for mobile install.

**Portable Build**
```bash
npm run build:single
```
Creates single `index.html` in `dist-single/`. No hosting needed. Open directly from file system.

## Usage

1. **Setup** - Create a strong passphrase (never stored, never recoverable)
2. **Log** - Hit "+" to record an event (quick mode or detailed)
3. **Insights** - View frequency, patterns, streaks
4. **Lock** - Auto-locks after 5 min or manual panic lock
5. **Backup** - Export encrypted backup anytime

## Privacy Guarantee

- **Zero telemetry** - No analytics, no tracking pixels
- **Zero backend** - Everything runs in your browser
- **Zero accounts** - No email, no login, no profile
- **Zero cloud** - Data never transmitted anywhere

Your device. Your rules.

## License

MIT
