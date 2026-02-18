import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Fingerprint, ShieldAlert, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthLock Component
 * A high-security, full-screen gateway for local volume decryption.
 * Features a 'Bunker' aesthetic with haptic-ready interactions.
 */
const AuthLock: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const [passphrase, setPassphrase] = useState('');
    const [isError, setIsError] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input for tactical speed
    useEffect(() => {
        if (!isAuthenticated) {
            inputRef.current?.focus();
        }
    }, [isAuthenticated]);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passphrase) return;

        setIsDecrypting(true);
        setIsError(false);

        try {
            const success = await login(passphrase);
            if (!success) {
                throw new Error('Invalid key');
            }
        } catch (err) {
            setIsError(true);
            setIsDecrypting(false);
            setPassphrase('');
            // Trigger haptic failure pattern
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        }
    };

    if (isAuthenticated) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Background Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

            {/* Security Status Header */}
            <header className="absolute top-12 flex flex-col items-center space-y-4">
                <div className={`flex items-center space-x-2 px-4 py-1 border-2 font-mono text-[10px] font-bold tracking-[0.3em] uppercase transition-colors
          ${isError ? 'border-red-600 text-red-600 animate-pulse' : 'border-[var(--border-color)] opacity-60'}`}>
                    <Lock size={12} />
                    <span>Volume_Locked // Encrypted</span>
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter">Load_Log</h1>
            </header>

            {/* Central Input Console */}
            <form onSubmit={handleUnlock} className={`w-full max-w-sm space-y-8 transition-transform ${isError ? 'animate-shake' : ''}`}>
                <div className="space-y-2">
                    <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest block text-center">
                        Enter Decryption Passphrase
                    </label>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="password"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border-2 p-6 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            style={{ borderColor: isError ? '#dc2626' : 'var(--border-color)' }}
                            disabled={isDecrypting}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                            <Key size={20} />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isDecrypting || !passphrase}
                    className="w-full py-5 flex items-center justify-center space-x-3 font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-30"
                    style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--bg-primary)',
                        boxShadow: '0 0 20px rgba(var(--accent-primary-rgb), 0.2)'
                    }}
                >
                    {isDecrypting ? (
                        <span className="animate-pulse">Decrypting...</span>
                    ) : (
                        <>
                            <Unlock size={20} />
                            <span>Unlock Vault</span>
                        </>
                    )}
                </button>

                {/* Biometric Mock */}
                <button type="button" className="w-full flex items-center justify-center space-x-2 opacity-30 hover:opacity-100 transition-opacity">
                    <Fingerprint size={24} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest underline underline-offset-4">
                        Use Biometric Sensor
                    </span>
                </button>
            </form>

            {/* Security Warnings */}
            <footer className="absolute bottom-12 px-8 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-red-600/60">
                    <ShieldAlert size={14} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">Strict Local Privacy Protocol</span>
                </div>
                <p className="text-[8px] font-mono opacity-20 uppercase max-w-[200px]">
                    Data is stored in isolated IndexedDB. No cloud sync. No password recovery.
                </p>
            </footer>

            {/* Shake Animation Style */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
        </div>
    );
};

export default AuthLock;
