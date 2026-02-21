import React, { useRef } from 'react';
import { Calendar, User, Users, Flame, MoreVertical, Trash2, Lock } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { useSwipeable } from 'react-swipeable';
import { useLocation, useNavigate } from 'react-router-dom';
import { haptics } from '../../utils/haptics';
import { useEvents } from '../../context/EventsContext';
import type { DecryptedEvent } from '../../types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * StandardTimeline Component
 * A high-fidelity, industrial/minimalist feed for the Load_Log application.
 * Enhanced with GSAP animations and tactical glassmorphism.
 */

// Custom Swipeable wrapper for individual event cards
const SwipeableEventCard = ({ event, isEnabled, onDelete, formatDate, index }: { event: DecryptedEvent; isEnabled: boolean; onDelete: () => void; formatDate: (ts: number) => string; index: number }) => {
    const [swiped, setSwiped] = React.useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Staggered entry animation via GSAP
    useGSAP(() => {
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 30, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)', delay: Math.min(index * 0.05, 0.5) }
            );
        }
    }, { scope: cardRef });

    const handlers = useSwipeable({
        onSwipedLeft: () => isEnabled && (setSwiped(true), haptics.light()),
        onSwipedRight: () => isEnabled && (setSwiped(false), haptics.light()),
        trackMouse: true
    });

    const { ref: swipeRef, ...swipeHandlers } = handlers;

    return (
        <div
            ref={(el) => {
                cardRef.current = el;
                swipeRef(el);
            }}
            className="relative overflow-hidden mb-4 rounded-xl"
            {...swipeHandlers}
        >
            {/* Delete Background (Revealed on Swipe) */}
            <div
                className={`absolute inset-0 flex items-center justify-end pr-8 cursor-pointer transition-opacity duration-300 rounded-xl ${swiped ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }}
                onClick={() => {
                    if (swiped) {
                        haptics.heavy();
                        onDelete();
                    }
                }}
            >
                <div className="flex items-center space-x-3 bg-red-950/50 px-4 py-2 rounded-full border border-red-500/30">
                    <Trash2 size={20} className="text-red-300" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-200">Purge</span>
                </div>
            </div>

            {/* Foreground Card */}
            <div
                className={`group relative glass p-5 transition-transform duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] rounded-xl ${swiped ? '-translate-x-32 shadow-2xl' : 'translate-x-0 cursor-grab active:cursor-grabbing'}`}
            >
                {/* Visual Indicator: Solo vs Partner */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                        {event.soloOrPartner === 'solo' ? (
                            <User size={14} style={{ color: 'var(--accent-primary)' }} className="drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]" />
                        ) : (
                            <Users size={14} style={{ color: 'var(--accent-secondary)' }} className="drop-shadow-[0_0_5px_rgba(255,179,0,0.8)]" />
                        )}
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]"
                            style={{ color: 'var(--text-secondary)' }}>
                            {event.soloOrPartner === 'solo' ? 'Unitary' : 'Relational'}
                        </span>
                    </div>
                    <MoreVertical
                        size={16}
                        className="opacity-20 cursor-pointer hover:opacity-100 transition-colors"
                        style={{ color: swiped ? 'var(--accent-primary)' : 'inherit' }}
                        onClick={() => {
                            if (!isEnabled) onDelete();
                            else setSwiped(!swiped); // toggle if swipe is enabled
                        }}
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 text-[var(--accent-primary)] opacity-80">
                        <Calendar size={12} />
                        <span className="text-xs font-mono tracking-widest">{formatDate(event.date)}</span>
                    </div>

                    <div className="pt-2 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono opacity-40 uppercase tracking-[0.3em] mb-1">Source ID</span>
                            <span className="text-2xl font-black tracking-tight uppercase leading-none truncate max-w-[180px] drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ color: 'var(--text-primary)' }}>
                                {event.sourceLabel || 'Unspec'}
                            </span>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono opacity-40 uppercase tracking-[0.2em] mb-2">Intensity</span>
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <Flame
                                        key={i}
                                        size={16}
                                        fill={i < (event.intensity || 0) ? 'var(--accent-secondary)' : 'transparent'}
                                        stroke={i < (event.intensity || 0) ? 'var(--accent-secondary)' : 'var(--border-color)'}
                                        className={i < (event.intensity || 0) ? 'drop-shadow-[0_0_8px_rgba(255,179,0,0.8)]' : 'opacity-20'}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local Encryption Tag */}
                <div className="mt-5 pt-3 border-t flex justify-between items-center opacity-30 text-[8px] font-mono uppercase tracking-[0.2em]"
                    style={{ borderColor: 'var(--border-color)' }}>
                    <span>Hash: {event.id.substring(0, 8)}</span>
                    <span className="italic flex items-center gap-1"><Lock size={8} /> AES-GCM</span>
                </div>
            </div>
        </div>
    );
};

const StandardTimeline: React.FC = () => {
    const { events, loading, deleteEvent } = useEvents();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const filterDay = searchParams.get('day');
    const filterHour = searchParams.get('hour');
    const filterQuery = searchParams.get('q');

    const displayEvents = React.useMemo(() => {
        let result = events;
        if (filterQuery) {
            result = result.filter(e => e.sourceLabel?.toLowerCase().includes(filterQuery.toLowerCase()));
        }
        if (filterDay !== null && filterHour !== null) {
            result = result.filter(e => {
                const d = new Date(e.date);
                const day = (d.getDay() + 6) % 7;
                const hour = d.getHours();
                return day.toString() === filterDay && hour.toString() === filterHour;
            });
        }
        return result;
    }, [events, filterDay, filterHour, filterQuery]);

    // Formatting helper for date display
    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(timestamp)).toUpperCase();
    };

    const isSwipeEnabled = localStorage.getItem('load_log_swipe_delete') === 'true';

    const handleDelete = async (id: string) => {
        if (window.confirm('PURGE RECORD? // ACTION IS IRREVERSIBLE')) {
            await deleteEvent(id);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto"
            style={{ color: 'var(--text-primary)' }}>

            {/* Industrial Header */}
            <header className="sticky top-0 z-10 px-6 py-6 border-b glass-dark rounded-b-3xl mb-6 shadow-xl"
                style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black tracking-[0.15em] uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        style={{ color: 'var(--text-primary)' }}>
                        Telemetry
                    </h1>
                    <div className="flex items-center space-x-3 bg-black/50 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest text-cyan-400">Local Array</span>
                        <div className="w-2 h-2 rounded-full shadow-[0_0_10px_var(--accent-primary)] animate-pulse"
                            style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-2 relative z-0">
                {(filterQuery || (filterDay && filterHour)) && (
                    <div className="glass text-[var(--text-primary)] p-4 mb-6 flex justify-between items-center rounded-2xl border-[var(--accent-primary)] border-opacity-30">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest truncate mr-4 text-cyan-400">
                            {filterQuery ? `Tracking Sector: ${filterQuery}` : `Temporal Lock: Day ${parseInt(filterDay!) + 1}, ${filterHour}:00`}
                        </span>
                        <button
                            onClick={() => { haptics.light(); navigate('/'); }}
                            className="text-[9px] font-mono border border-cyan-500/30 px-3 py-1.5 rounded-full uppercase hover:bg-cyan-900/40 hover:border-cyan-400 transition-all text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                            Reset
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 font-mono space-y-4">
                        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[var(--accent-primary)] animate-spin"></div>
                        <span className="text-[10px] uppercase tracking-widest opacity-60 animate-pulse text-cyan-400">Initialising Array...</span>
                    </div>
                ) : displayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-20 font-mono text-[10px] space-y-6 container-gsap-empty">
                        <pre className="leading-none text-[8px] sm:text-[10px] text-cyan-500 font-bold drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]">
                            {`
    ___  _  _  ___  ____  ___  ____ 
   / _ \\/ \\/ \\/ _ \\/  _ \\/ _ \\/  _ \\
   | | || || || _ <| | \\|| | || | \\|
   \\_| |\\___/\\___/\\____/\\_| |\\____/
       \\_\\                  \\_\\    
`}
                        </pre>
                        <div className="text-center space-y-2">
                            <p className="uppercase tracking-[0.3em] font-bold text-white">LOCAL VOLUME EMPTY</p>
                            <p className="uppercase tracking-wide opacity-50">AWAITING TELEMETRY INPUT</p>
                        </div>
                    </div>
                ) : (
                    <Virtuoso
                        useWindowScroll
                        data={displayEvents}
                        itemContent={(index: number, event: DecryptedEvent) => (
                            <SwipeableEventCard
                                key={event.id}
                                index={index}
                                event={event}
                                isEnabled={isSwipeEnabled}
                                onDelete={() => handleDelete(event.id)}
                                formatDate={formatDate}
                            />
                        )}
                    />
                )}
            </main>
        </div>
    );
};

export default StandardTimeline;
