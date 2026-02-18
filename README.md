<div align="center">
  <img src="https://raw.githubusercontent.com/westkitty/Load_Log/main/public/banner.webp" alt="Load Log Banner" width="100%" />
  
  <br />
  <br />

  <img src="https://raw.githubusercontent.com/westkitty/Load_Log/main/public/icon.png" alt="Load Log Icon" width="80" />

  # Load Log

  **Private. Encrypted. Local.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-4.0-646CFF.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC.svg)](https://tailwindcss.com/)
  
  <br />

  [![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/westkitty)
  [![Sponsor](https://img.shields.io/badge/Sponsor-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/westkitty)
</div>

<br />

## 🔒 Overview

**Load Log** is a privacy-first Progressive Web App (PWA) designed for tracking intimate health metrics with military-grade encryption. It operates on a strict **Local-First** philosophy: your data never leaves your device. There are no accounts, no cloud servers, and no telemetry.

> **"Your Data. Your Business."**

The application features a "Bunker" aesthetic with high-fidelity UI interactions, including haptic feedback, fluid animations, and a responsive design optimized for mobile usage.

## ✨ Features

- **🛡️ Military-Grade Security**: AES-256-GCM encryption with PBKDF2 key derivation (500k iterations).
- **📵 100% Offline**: Zero external network calls. Assets are cached for offline reliability.
- **📱 PWA Ready**: Installable on iOS (via Share -> Add to Home Screen) and Android.
- **⚡ "Bunker" Mode**: Custom `AuthLock` gateway with biometric-style unlock and panic triggers.
- **🎨 Tactile UI**: Industrial/Tactical aesthetic with glassmorphism, haptics, and smooth transitions.
- **📊 Analytics**: Interactive charts for frequency, intensity distribution, and temporal patterns.
- **⚙️ Theming**: Multiple tactical themes (Industrial Steel, Neon Performance, Black Gold, etc.).
- **💾 Data Sovereignty**: Encrypted import/export functionality. You own your backup files.

## 🛠️ Technology Stack

*   **Logic**: React 18, TypeScript, Vite
*   **State**: Context API + Custom Hooks
*   **Storage**: Dexie.js (IndexedDB wrapper)
*   **Security**: Web Crypto API (SubtleCrypto)
*   **Styling**: Tailwind CSS, Lucide React
*   **Visuals**: Recharts (Analytics)

## 🚀 Getting Started

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

## 🔐 Security Architecture

1.  **Key Derivation**: When you set a specific password, it is run through `PBKDF2` with a random salt to derive the AES-GCM key.
2.  **Encryption**: Every event record is encrypted individually with a unique Initialization Vector (IV).
3.  **Storage**: The encrypted blobs (ciphertext + IV) are stored in IndexedDB.
4.  **Session**: The decryption key is held in memory *only* while the app is unlocked. Reloading the page or clicking "Lock" wipes the key from memory immediately.

## ⚠️ Disclaimer

This application is provided "as is", without warranty of any kind. While we use standard, strong cryptographic primitives, the security of your data ultimately depends on the strength of your passphrase and the physical security of your device.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with 🖤 by WestKitty</sub>
</div>
