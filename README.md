<div align="center">
  <img src="https://raw.githubusercontent.com/westkitty/Load_Log/main/public/banner.webp" alt="Load Log Banner" width="100%" />
  
  <br />
  <br />

  <img src="https://raw.githubusercontent.com/westkitty/Load_Log/main/public/icon.png" alt="Load Log Icon" width="80" />

  # Load Log

  **Private. Encrypted. Local.**
  
  [![Governance](https://img.shields.io/badge/GOVERNANCE-UNGOVERNABLE-red?style=for-the-badge)](https://github.com/westkitty/Load_Log)
  [![License](https://img.shields.io/badge/LICENSE-PUBLIC_DOMAIN-black?style=for-the-badge)](https://unlicense.org)
  
  <br />
  
  [![Support](https://img.shields.io/badge/Support_My_Work-KO--FI-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/westkitty)
  [![Sponsor](https://img.shields.io/badge/Sponsor_Me-GITHUB-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/westkitty)
</div>

<br />

## 🚀 Zero-Friction Access

1.  Download the file `Load_Log_v1.html` from the **Releases** tab on the right.
2.  Save it to your device.
3.  Open the file.

*That’s it. No installation, no internet, no accounts. The app lives entirely inside that one file.*

## 📱 The 'App' Experience

For a fast, native-feeling experience on iOS or Android, use the hosted version (if available) or open the HTML file, then select **"Add to Home Screen"**. This installs it as a standalone app on your device.

## ☢️ The Bate Bunker

**Initialize Protocol.**

Upon first launch, you will encounter the **Bate Bunker Onboarding Protocol**. This CRT-style terminal enforces the core tenets of the system:
1.  **NO LEAKS**: Data stays local.
2.  **LOCK IT UP**: Encryption is mandatory.
3.  **FEED THE LOG**: Tracking is discipline.

*System status: 50% EDGING // 50% UNGOVERNABLE*

## 🔒 Overview

**Load Log** is a privacy-first Progressive Web App (PWA) designed for tracking intimate health metrics with military-grade encryption. It operates on a strict **Local-First** philosophy: your data never leaves your device. There are no accounts, no cloud servers, and no telemetry.

> **"Your Data. Your Business."**

## ✨ Features

- **🛡️ Military-Grade Security**: AES-256-GCM encryption with PBKDF2 key derivation (500k iterations).
- **📵 100% Offline**: Zero external network calls. Assets are cached for offline reliability.
- **📱 PWA Ready**: Installable on iOS and Android.
- **⚡ "Bunker" Mode**: Custom `AuthLock` gateway with biometric-style unlock and panic triggers.
- **🎨 Tactile UI**: Industrial/Tactical aesthetic with glassmorphism, haptics, and smooth transitions.
- **📊 Analytics**: Interactive charts for frequency, intensity distribution, and temporal patterns.
- **⚙️ Theming**: Multiple tactical themes (Industrial Steel, Neon Performance, Black Gold, etc.).
- **💾 Data Sovereignty**: Encrypted import/export functionality. You own your backup files.

## 🔐 Security Architecture

1.  **Key Derivation**: When you set a specific password, it is run through `PBKDF2` with a random salt to derive the AES-GCM key.
2.  **Encryption**: Every event record is encrypted individually with a unique Initialization Vector (IV).
3.  **Storage**: The encrypted blobs (ciphertext + IV) are stored in IndexedDB.
4.  **Session**: The decryption key is held in memory *only* while the app is unlocked. Reloading the page or clicking "Lock" wipes the key from memory immediately.

## ⚠️ Disclaimer

This application is provided "as is", without warranty of any kind. While we use standard, strong cryptographic primitives, the security of your data ultimately depends on the strength of your passphrase and the physical security of your device.

## 🏴 Governance: Remain Ungovernable

**Public Domain / Unlicensed**

This project is dedicated to the public domain. You are free and encouraged to use, modify, and distribute this software without any attribution required. You could even sell it if you're a capitalist pig. Fuck the state.

---

## 🛠️ For Developers / Building form Source

### Technology Stack

*   **Logic**: React 18, TypeScript, Vite
*   **State**: Context API + Custom Hooks
*   **Storage**: Dexie.js (IndexedDB wrapper)
*   **Security**: Web Crypto API (SubtleCrypto)
*   **Styling**: Tailwind CSS, Lucide React
*   **Visuals**: Recharts (Analytics)

### Prerequisites
*   Node.js 18+
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/westkitty/Load_Log.git
    cd Load_Log
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

5.  **Build Single-File (Portable)**
    ```bash
    npm run build:single
    ```
    This generates `dist-single/Load_Log_v1.html`.

<div align="center">
  <sub>Built with 🖤 by WestKitty</sub>
</div>
