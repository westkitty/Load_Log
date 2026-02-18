import React from 'react';
import {

    Database,
    Lock,
    Download,
    Upload,
    Trash2,
    ShieldAlert,
    ChevronRight,
    Palette
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * SettingsMain Component
 * The central configuration console for Load_Log.
 * Handles tactical theme switching, local data management, and security locks.
 */
const SettingsMain: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();

    // Simulated data actions
    const handleExport = () => alert('Preparing local encrypted JSON export...');
    const handleWipe = () => {
        if (window.confirm('PERMANENT DATA PURGE: This will wipe all local logs and keys. Proceed?')) {
            alert('Local volume purged.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto pb-24"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Header */}
            <header className="px-6 py-10 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] font-mono opacity-40 uppercase tracking-[0.5em] block mb-1">
                    System Config
                </span>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Settings</h1>
            </header>

            <main className="flex-1 overflow-y-auto">

                {/* Appearance: Tactical Theme Switcher */}
                <section className="p-6 space-y-4">
                    <div className="flex items-center space-x-2 opacity-50">
                        <Palette size={14} />
                        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Appearance_Tactical</h2>
                    </div>

                    <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
                        {availableThemes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className="flex-shrink-0 w-32 border-2 p-3 transition-all active:scale-95"
                                style={{
                                    borderColor: theme === t.id ? 'var(--accent-primary)' : 'var(--border-color)',
                                    backgroundColor: 'var(--bg-secondary)'
                                }}
                            >
                                <div className="flex flex-col items-start space-y-3">
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3" style={{ backgroundColor: t.colors.accent }}></div>
                                        <div className="w-3 h-3" style={{ backgroundColor: t.colors.bg }}></div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold uppercase leading-tight text-left">
                                        {t.name.replace(' ', '\n')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Data Management */}
                <section className="p-6 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center space-x-2 opacity-50">
                        <Database size={14} />
                        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Data_Management</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <button onClick={handleExport} className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:border-[var(--accent-primary)] transition-colors">
                            <div className="flex items-center space-x-3">
                                <Download size={18} className="opacity-50" />
                                <span className="text-xs font-bold uppercase">Export Vault (JSON)</span>
                            </div>
                            <ChevronRight size={14} className="opacity-20" />
                        </button>

                        <button className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-50 cursor-not-allowed">
                            <div className="flex items-center space-x-3">
                                <Upload size={18} />
                                <span className="text-xs font-bold uppercase">Import Vault</span>
                            </div>
                            <Lock size={12} />
                        </button>
                    </div>
                </section>

                {/* Security Zone */}
                <section className="p-6 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center space-x-2 opacity-50">
                        <Lock size={14} />
                        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Security_Protocol</h2>
                    </div>

                    <button className="w-full flex justify-between items-center p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                        <span className="text-xs font-bold uppercase">Rotate Access Key</span>
                        <ChevronRight size={14} className="opacity-20" />
                    </button>

                    <button className="w-full py-4 border-2 border-dashed font-black uppercase text-xs tracking-widest hover:bg-red-950/20 transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}>
                        Force Session Lock
                    </button>
                </section>

                {/* Danger Zone */}
                <section className="p-6 border-t space-y-4" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center space-x-2 text-red-500">
                        <ShieldAlert size={14} />
                        <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest">Danger_Zone</h2>
                    </div>

                    <button
                        onClick={handleWipe}
                        className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-red-900 bg-red-900/10 text-red-500 hover:bg-red-900 hover:text-white transition-all"
                    >
                        <Trash2 size={18} />
                        <span className="text-xs font-black uppercase tracking-tighter">Purge All Local Records</span>
                    </button>
                </section>

            </main>

            {/* Footer System Info */}
            <footer className="p-8 text-center space-y-2 opacity-20">
                <p className="text-[9px] font-mono uppercase tracking-[0.4em]">Load_Log v2.4.0</p>
                <p className="text-[8px] font-mono uppercase">Node: Local_Auth_Module // Build: 10.22.23</p>
            </footer>
        </div>
    );
};

export default SettingsMain;
