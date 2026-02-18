import React from 'react';
import { Calendar, User, Users, Flame, Info, MoreVertical } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';
import type { DecryptedEvent } from '../../types';

/**
 * StandardTimeline Component
 * A high-fidelity, industrial/minimalist feed for the Load_Log application.
 * Styles are driven by CSS variables to support dynamic theme switching 
 * (Industrial Steel, Minimal Tactical, etc.).
 */
const StandardTimeline: React.FC = () => {
    const { events, loading, deleteEvent } = useEvents();

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
                {loading ? (
                    <div className="flex items-center justify-center h-64 opacity-50 font-mono italic">
                        Initialising encrypted volume...
                    </div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg p-8"
                        style={{ borderColor: 'var(--border-color)' }}>
                        <Info className="mb-4 opacity-20" size={48} />
                        <p className="font-mono text-sm opacity-50 uppercase italic">No records found in local IDB.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event: DecryptedEvent) => (
                            <div
                                key={event.id}
                                className="group relative border p-4 transition-all duration-200"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderColor: 'var(--border-color)',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)'
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
                                        className="opacity-30 cursor-pointer hover:opacity-100 hover:text-red-500 transition-colors"
                                        onClick={() => handleDelete(event.id)}
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
                                            <span className="text-lg font-bold tracking-tight uppercase leading-none">
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
                        ))}
                    </div>
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
