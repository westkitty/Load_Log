import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Shield, User, Users, ChevronLeft, Save } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';
import { haptics } from '../../utils/haptics';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * EventEditor Component
 * An industrial-grade form for logging new data locally.
 * Focuses on haptic feedback, accessibility, and high-fidelity masculine aesthetics.
 */
const EventEditor: React.FC = () => {
    const navigate = useNavigate();
    const { addEvent } = useEvents();

    // Form State
    const [sourceType, setSourceType] = useState<'solo' | 'partnered'>('solo');
    const [sourceLabel, setSourceLabel] = useState('');
    const [intensity, setIntensity] = useState(3);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const containerRef = useRef<HTMLFormElement>(null);

    useGSAP(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, { scope: containerRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceLabel) return;

        setIsSubmitting(true);
        haptics.medium(); // Confirmed tactile pattern

        const newEvent = {
            // Context generates ID and timestamp (date)
            sourceType: 'other' as const, // Defaulting to 'other' as UI only has Solo/Partner toggle
            sourceLabel,
            intensity,
            notes,
            soloOrPartner: sourceType // 'solo' | 'partnered'
        };

        try {
            await addEvent(newEvent);

            // Brief delay for tactile satisfaction and out-animation
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in',
                    onComplete: () => { navigate('/'); }
                });
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Encryption/Storage Error:', err);
            haptics.error();
            setIsSubmitting(false);

            // Error shake
            if (containerRef.current) {
                gsap.fromTo(containerRef.current, { x: -10 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto"
            style={{ color: 'var(--text-primary)' }}>

            {/* Tactical Header */}
            <header className="px-6 py-6 flex items-center justify-between z-10 sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-xl">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full glass hover:bg-white/10 transition-colors">
                    <ChevronLeft size={20} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                </button>
                <div className="text-center flex-1 ml-4">
                    <span className="text-[9px] font-mono opacity-60 uppercase tracking-[0.3em] block text-cyan-500">Input Mode</span>
                    <h1 className="text-xl font-black uppercase italic tracking-[0.15em] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Event Entry</h1>
                </div>
                <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
                    <Shield size={20} className="text-cyan-900 drop-shadow-[0_0_5px_rgba(0,229,255,0.2)]" />
                </div>
            </header>

            <form ref={containerRef} onSubmit={handleSubmit} className="flex-1 px-5 pt-8 pb-32 space-y-8 overflow-y-auto">

                {/* Source Toggle */}
                <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60 text-cyan-400">Operation Source</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => { setSourceType('solo'); haptics.light(); }}
                            className={`flex flex-col items-center justify-center py-6 rounded-2xl border transition-all duration-300 ${sourceType === 'solo' ? 'glass border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.2)] text-[var(--accent-primary)] skew-y-[-1deg] scale-105 z-10' : 'bg-black/30 border-[var(--border-color)] opacity-50 hover:bg-black/50 text-[var(--text-secondary)]'}`}
                        >
                            <User size={24} className="mb-2" />
                            <span className="text-xs font-black uppercase tracking-[0.15em]">Solo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSourceType('partnered'); haptics.light(); }}
                            className={`flex flex-col items-center justify-center py-6 rounded-2xl border transition-all duration-300 ${sourceType === 'partnered' ? 'glass border-amber-500 shadow-[0_0_15px_rgba(255,179,0,0.2)] text-[var(--accent-secondary)] skew-y-[1deg] scale-105 z-10' : 'bg-black/30 border-[var(--border-color)] opacity-50 hover:bg-black/50 text-[var(--text-secondary)]'}`}
                        >
                            <Users size={24} className="mb-2" />
                            <span className="text-xs font-black uppercase tracking-[0.15em]">Partners</span>
                        </button>
                    </div>
                </div>

                {/* Source Label */}
                <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60 text-cyan-400">Source Identity / Context</label>
                    <div className="relative group">
                        <input
                            type="text"
                            required
                            value={sourceLabel}
                            onChange={(e) => setSourceLabel(e.target.value)}
                            placeholder="e.g. MORNING_SESSION"
                            className="w-full glass border border-[var(--border-color)] rounded-xl py-5 px-6 text-sm font-mono focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] uppercase tracking-widest transition-all duration-300 placeholder:opacity-30"
                        />
                    </div>
                </div>

                {/* Intensity Selection */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60 text-cyan-400">Load Intensity</label>
                        <span className="text-2xl font-black italic uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,179,0,0.4)] transition-colors duration-300" style={{ color: 'var(--accent-secondary)' }}>
                            LVL_{intensity}
                        </span>
                    </div>
                    <div className="flex justify-between items-center glass rounded-2xl p-6 border border-[var(--border-color)]">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => { setIntensity(lvl); haptics.medium(); }}
                                className={`transition-all duration-300 relative group ${lvl <= intensity ? 'scale-110 -translate-y-1' : 'hover:scale-105'}`}
                            >
                                {lvl <= intensity && (
                                    <div className="absolute inset-0 bg-amber-500 rounded-full blur-md opacity-40 animate-pulse"></div>
                                )}
                                <Flame
                                    size={36}
                                    fill={lvl <= intensity ? 'var(--accent-secondary)' : 'transparent'}
                                    stroke={lvl <= intensity ? 'var(--accent-secondary)' : 'var(--text-secondary)'}
                                    className={`relative z-10 transition-all duration-300 ${lvl <= intensity ? 'drop-shadow-[0_0_10px_rgba(255,179,0,0.8)]' : 'opacity-20 group-hover:opacity-40'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-60 flex items-center text-cyan-400">
                        Operational Notes <span className="text-[8px] bg-[var(--border-color)] px-2 py-0.5 rounded ml-2 text-[var(--text-secondary)]">Encrypted</span>
                    </label>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="ADDITIONAL_DATA..."
                        className="w-full glass border border-[var(--border-color)] rounded-xl py-4 px-6 text-xs font-mono focus:outline-none focus:border-[var(--accent-primary)] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] tracking-wide transition-all duration-300 resize-none placeholder:opacity-30"
                    />
                </div>
            </form>

            {/* Industrial Submit Action */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 max-w-md mx-auto z-20 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-t before:from-black before:to-transparent before:-z-10 before:h-[150%] before:bottom-0">
                <button
                    onClick={handleSubmit}
                    disabled={!sourceLabel || isSubmitting}
                    className="pointer-events-auto w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-black uppercase tracking-[0.3em] transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:shadow-none bg-cyan-950/40 border border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:bg-cyan-900/60 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] backdrop-blur-md"
                >
                    {isSubmitting ? (
                        <span className="animate-pulse tracking-[0.4em]">Processing</span>
                    ) : (
                        <>
                            <Save size={20} className="drop-shadow-md" />
                            <span>Log Load</span>
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
};

export default EventEditor;
