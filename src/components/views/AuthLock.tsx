import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Fingerprint, ShieldAlert, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * AuthLock Component
 * A high-security, full-screen gateway for local volume decryption.
 * Features a 'Bunker' aesthetic with haptic-ready interactions and cinematic GSAP animations.
 */
const AuthLock: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const [passphrase, setPassphrase] = useState('');
    const [isError, setIsError] = useState(false);
    const [isDecrypting, setIsDecrypting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Auto-focus input for tactical speed
    useEffect(() => {
        if (!isAuthenticated) {
            inputRef.current?.focus();
        }
    }, [isAuthenticated]);

    // Setup GSAP Animations
    useGSAP(() => {
        // Initial Entry Animation
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }
        );

        // Error Shake Animation triggered by state
        if (isError && formRef.current) {
            gsap.fromTo(formRef.current,
                { x: -10 },
                { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)", onComplete: () => setIsError(false) }
            );
        }
    }, { dependencies: [isError], scope: containerRef });

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

            // Decryption success animation before unmounting
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    opacity: 0, scale: 1.05, duration: 0.4, ease: "power2.inOut"
                });
            }
        } catch {
            setIsError(true);
            setIsDecrypting(false);
            setPassphrase('');
            // Trigger haptic failure pattern
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        }
    };

    if (isAuthenticated) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 overflow-hidden cinematic-vignette"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Background Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), linear-gradient(90deg, rgba(0, 229, 255, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 229, 255, 0.05))', backgroundSize: '100% 3px, 4px 100%' }} />

            {/* Security Status Header */}
            <header className="absolute top-12 flex flex-col items-center space-y-4">
                <div className={`flex items-center space-x-2 px-4 py-1.5 border border-[var(--border-color)] rounded-full font-mono text-[10px] font-bold tracking-[0.3em] uppercase transition-colors glass-dark
          ${isError ? 'text-red-500 border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.1)]'}`}>
                    <Lock size={12} className={isDecrypting ? "animate-pulse" : ""} />
                    <span>{isDecrypting ? 'Decrypting_Volume...' : 'Volume_Locked'}</span>
                </div>
                <h1 className="text-5xl font-black italic uppercase tracking-[0.15em] drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" style={{ color: 'var(--accent-primary)' }}>
                    Load_Log
                </h1>
            </header>

            {/* Central Input Console */}
            <form ref={formRef} onSubmit={handleUnlock} className="w-full max-w-sm space-y-8 glass p-8 rounded-3xl relative z-10">
                <div className="space-y-4">
                    <label className="text-[11px] font-mono opacity-60 uppercase tracking-[0.25em] block text-center" style={{ color: 'var(--accent-primary)' }}>
                        Enter Decryption Key
                    </label>
                    <div className="relative group">
                        <input
                            ref={inputRef}
                            type="password"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="w-full bg-black/50 border border-[var(--border-color)] rounded-xl p-6 text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300"
                            style={{ borderColor: isError ? '#ef4444' : '' }}
                            disabled={isDecrypting}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 transition-opacity group-hover:opacity-100" style={{ color: 'var(--accent-primary)' }}>
                            <Key size={24} />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isDecrypting || !passphrase}
                    className="w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-black uppercase tracking-[0.3em] text-sm transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:scale-100"
                    style={{
                        backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 229, 255, 0.15)',
                        color: isError ? '#ef4444' : 'var(--accent-primary)',
                        border: `1px solid ${isError ? 'rgba(239,68,68,0.4)' : 'rgba(0, 229, 255, 0.4)'}`,
                        boxShadow: `0 0 30px ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(0, 229, 255, 0.15)'}`
                    }}
                >
                    {isDecrypting ? (
                        <span className="animate-pulse tracking-[0.5em]">PROCESSING</span>
                    ) : (
                        <>
                            <Unlock size={18} />
                            <span>Unlock Vault</span>
                        </>
                    )}
                </button>

                {/* Biometric Mock */}
                <button type="button" className="w-full flex items-center justify-center space-x-3 opacity-40 hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--text-secondary)' }}>
                    <Fingerprint size={28} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest underline underline-offset-4">
                        Biometrics
                    </span>
                </button>
            </form>

            {/* Security Warnings */}
            <footer className="absolute bottom-12 px-8 text-center space-y-3 w-full max-w-sm">
                <div className="flex items-center justify-center space-x-2 text-yellow-500/70 border border-yellow-900/50 bg-yellow-950/20 py-2 rounded-lg">
                    <ShieldAlert size={14} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.1em]">Strict Local Privacy Array</span>
                </div>
                <p className="text-[9px] font-mono opacity-30 uppercase tracking-widest leading-relaxed">
                    Data encrypted via AES-GCM in IndexedDB. <br />Zero cloud exhaust. No recovery protocol.
                </p>
            </footer>
        </div>
    );
};

export default AuthLock;
