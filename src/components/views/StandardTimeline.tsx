import React from 'react';
import { Calendar, User, Users, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { useSwipeable } from 'react-swipeable';
import { useLocation, useNavigate } from 'react-router-dom';
import { haptics } from '../../utils/haptics';
import { useEvents } from '../../context/EventsContext';
import type { DecryptedEvent } from '../../types';

/**
 * StandardTimeline Component
 * A high-fidelity, industrial/minimalist feed for the Load_Log application.
 * Styles are driven by CSS variables to support dynamic theme switching 
 * (Industrial Steel, Minimal Tactical, etc.).
 */

// Custom Swipeable wrapper for individual event cards
const SwipeableEventCard = ({ event, isEnabled, onDelete, formatDate }: { event: DecryptedEvent; isEnabled: boolean; onDelete: () => void; formatDate: (ts: number) => string }) => {
    const [swiped, setSwiped] = React.useState(false);

    const handlers = useSwipeable({
        onSwipedLeft: () => isEnabled && (setSwiped(true), haptics.light()),
        onSwipedRight: () => isEnabled && (setSwiped(false), haptics.light()),
        trackMouse: true
    });

    return (
        <div className="relative overflow-hidden mb-4 rounded-sm" {...handlers}>
            {/* Delete Background (Revealed on Swipe) */}
            <div
                className={`absolute inset-0 flex items-center justify-end pr-6 cursor-pointer transition-opacity duration-300 ${swiped ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
                onClick={() => {
                    if (swiped) {
                        haptics.heavy();
                        onDelete();
                    }
                }}
            >
                <div className="flex items-center space-x-2">
                    <Trash2 size={24} />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">Purge</span>
                </div>
            </div>

            {/* Foreground Card */}
            <div
                className={`group relative border p-4 transition-transform duration-300 ${swiped ? '-translate-x-32 shadow-xl' : 'translate-x-0'}`}
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    boxShadow: swiped ? 'none' : '4px 4px 0px 0px rgba(0,0,0,0.1)'
                }}
            >
                {/* Visual Indicator: Solo vs Partner */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                        {event.soloOrPartner === 'solo' ? (
                            <User size={16} style={{ color: 'var(--accent-primary)' }} />
                        ) : (
                            <Users size={16} style={{ color: 'var(--accent-primary)' }} />
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}>
                            {event.soloOrPartner === 'solo' ? 'Unitary' : 'Relational'}
                        </span>
                    </div>
                    <MoreVertical
                        size={16}
                        className="opacity-30 cursor-pointer hover:opacity-100 transition-colors"
                        style={{ color: swiped ? 'var(--accent-primary)' : 'inherit' }}
                        onClick={() => {
                            if (!isEnabled) onDelete();
                            else setSwiped(!swiped); // toggle if swipe is enabled
                        }}
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 opacity-80">
                        <Calendar size={12} />
                        <span className="text-xs font-mono">{formatDate(event.date)}</span>
                    </div>

                    <div className="pt-2 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono opacity-50 uppercase tracking-tighter">Source Identity</span>
                            <span className="text-lg font-bold tracking-tight uppercase leading-none truncate max-w-[150px]">
                                {event.sourceLabel || 'Unspecified'}
                            </span>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono opacity-50 uppercase mb-1">Intensity</span>
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <Flame
                                        key={i}
                                        size={14}
                                        fill={i < (event.intensity || 0) ? 'var(--accent-primary)' : 'transparent'}
                                        stroke={i < (event.intensity || 0) ? 'var(--accent-primary)' : 'var(--border-color)'}
                                        className={i < (event.intensity || 0) ? '' : 'opacity-20'}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Local Encryption Tag */}
                <div className="mt-4 pt-3 border-t flex justify-between items-center opacity-40 text-[9px] font-mono"
                    style={{ borderColor: 'var(--border-color)' }}>
                    <span>HASH: {event.id.substring(0, 8).toUpperCase()}</span>
                    <span className="italic">AES-GCM ENCRYPTED</span>
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
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(timestamp));
    };

    const isSwipeEnabled = localStorage.getItem('load_log_swipe_delete') === 'true';

    const handleDelete = async (id: string) => {
        if (window.confirm('PURGE RECORD? // ACTION IS IRREVERSIBLE')) {
            await deleteEvent(id);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Industrial Header */}
            <header className="sticky top-0 z-10 px-6 py-8 border-b"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tighter uppercase italic"
                        style={{ color: 'var(--text-primary)' }}>
                        Timeline
                    </h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">Local Mode</span>
                        <div className="w-2 h-2 rounded-full shadow-sm animate-pulse"
                            style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6">
                {(filterQuery || (filterDay && filterHour)) && (
                    <div className="bg-[var(--accent-primary)] text-[var(--bg-primary)] p-3 mb-6 flex justify-between items-center rounded-sm">
                        <span className="text-xs font-bold uppercase tracking-widest truncate mr-4">
                            {filterQuery ? `Tracking Sector: ${filterQuery}` : `Temporal Lock: Day ${parseInt(filterDay!) + 1}, ${filterHour}:00`}
                        </span>
                        <button
                            onClick={() => { haptics.light(); navigate('/'); }}
                            className="text-[10px] font-mono border border-[var(--bg-primary)] px-2 py-1 uppercase hover:bg-black/10 transition-colors whitespace-nowrap">
                            Clear Filter
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center h-64 opacity-50 font-mono italic">
                        Initialising encrypted volume...
                    </div>
                ) : displayEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 opacity-30 font-mono text-[10px] space-y-4">
                        <pre className="leading-tight text-[8px] sm:text-[10px]">
                            {`
    ___  _  _  ___  ____  ___  ____ 
   / _ \\/ \\/ \\/ _ \\/  _ \\/ _ \\/  _ \\
   | | || || || _ <| | \\|| | || | \\|
   \\_| |\\___/\\___/\\____/\\_| |\\____/
       \\_\\                  \\_\\    
`}
                        </pre>
                        <p className="uppercase tracking-widest text-center mt-4">
                            LOCAL VOLUME EMPTY<br />
                            NO TACTICAL DATA FOUND
                        </p>
                    </div>
                ) : (
                    <Virtuoso
                        useWindowScroll
                        data={displayEvents}
                        itemContent={(_, event: DecryptedEvent) => (
                            <SwipeableEventCard
                                event={event}
                                isEnabled={isSwipeEnabled}
                                onDelete={() => handleDelete(event.id)}
                                formatDate={formatDate}
                            />
                        )}
                    />
                )}
            </main>

            {/* Persistent CTA Button (Floating Action) 
          Note: This might duplicate the main Fab if navigation is handled elsewhere 
      */}
            {/* 
      <div className="fixed bottom-8 right-8 left-8 flex justify-center pointer-events-none">
        <button className="pointer-events-auto w-full max-w-sm py-4 px-6 font-bold uppercase tracking-widest text-sm transition-transform active:scale-95 shadow-xl border-2"
                style={{ 
                  backgroundColor: 'var(--accent-primary)', 
                  color: 'var(--bg-primary)',
                  borderColor: 'var(--text-primary)'
                }}>
          Log New Load
        </button>
      </div>
      */}
        </div>
    );
};

export default StandardTimeline;
