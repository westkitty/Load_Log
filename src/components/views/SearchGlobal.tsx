import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search as SearchIcon, Filter, X, Zap, User, Users } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';

/**
 * SearchGlobal Component
 * High-performance, industrial-grade filtering for the local event vault.
 * Supports keyword search and tactical categorical filters.
 */
const SearchGlobal: React.FC = () => {
    const { events } = useEvents();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'solo' | 'partner' | 'high'>('all');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the search bar on mount for "tactical" speed
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Filter Logic: Keywords + Categories
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesQuery =
                (event.sourceLabel || '').toLowerCase().includes(query.toLowerCase()) ||
                (event.notes?.toLowerCase() || '').includes(query.toLowerCase());

            const matchesCategory =
                activeFilter === 'all' ||
                (activeFilter === 'solo' && event.soloOrPartner === 'solo') ||
                (activeFilter === 'partner' && event.soloOrPartner === 'partnered') ||
                (activeFilter === 'high' && (event.intensity || 0) >= 4);

            return matchesQuery && matchesCategory;
        });
    }, [events, query, activeFilter]);

    // Formatting helper
    const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Top Search Bar */}
            <header className="sticky top-0 z-20 p-4 border-b space-y-4"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
                <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity"
                        size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="FILTER_VAULT..."
                        className="w-full bg-[var(--bg-secondary)] border-2 p-4 pl-12 text-sm font-mono focus:outline-none tracking-wider uppercase"
                        style={{ borderColor: 'var(--border-color)' }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Filter Chips */}
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'all', label: 'All', icon: <Filter size={12} /> },
                        { id: 'solo', label: 'Solo', icon: <User size={12} /> },
                        { id: 'partner', label: 'Partner', icon: <Users size={12} /> },
                        { id: 'high', label: 'High Intensity', icon: <Zap size={12} /> },
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 border whitespace-nowrap text-[10px] font-mono font-bold uppercase tracking-widest transition-all
                ${activeFilter === filter.id ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)] opacity-50'}
              `}
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            {filter.icon}
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Results Feed */}
            <main className="flex-1 p-4">
                {query === '' && activeFilter === 'all' && filteredEvents.length === 0 ? (
                    // Case: Initial empty state or no events at all
                    <div className="flex flex-col items-center justify-center h-64 opacity-20 text-center space-y-4">
                        <SearchIcon size={48} strokeWidth={1} />
                        <p className="font-mono text-xs uppercase tracking-[0.4em]">Vault Empty</p>
                    </div>
                ) : query === '' && activeFilter === 'all' ? (
                    // Case: Default view, show all (maybe limit initially? logic handles all)
                    <div className="space-y-2">
                        <p className="text-[9px] font-mono opacity-40 uppercase mb-4 tracking-widest">
                            Showing All {filteredEvents.length} Encrypted Records
                        </p>
                        {filteredEvents.map(event => (
                            <div
                                key={event.id}
                                className="flex items-center p-3 border hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-secondary)] border mr-4"
                                    style={{ borderColor: 'var(--border-color)' }}>
                                    {event.soloOrPartner === 'solo' ? <User size={16} /> : <Users size={16} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xs font-bold uppercase tracking-tight truncate pr-4">
                                            {event.sourceLabel || 'Unspecified'}
                                        </h3>
                                        <span className="text-[10px] font-mono opacity-40 shrink-0">
                                            {formatDate(event.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="flex space-x-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1 h-3"
                                                    style={{ backgroundColor: i < (event.intensity || 0) ? 'var(--accent-primary)' : 'var(--border-color)', opacity: i < (event.intensity || 0) ? 1 : 0.2 }} />
                                            ))}
                                        </div>
                                        {event.notes && (
                                            <span className="text-[10px] font-mono opacity-30 truncate italic">
                                                - {event.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                        <p className="font-mono text-xs uppercase opacity-40">No Matches in Local IDB</p>
                        <button onClick={() => { setQuery(''); setActiveFilter('all'); }}
                            className="text-[10px] font-mono underline underline-offset-4 uppercase tracking-widest"
                            style={{ color: 'var(--accent-primary)' }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-[9px] font-mono opacity-40 uppercase mb-4 tracking-widest">
                            Showing {filteredEvents.length} Encrypted Records
                        </p>
                        {filteredEvents.map(event => (
                            <div
                                key={event.id}
                                className="flex items-center p-3 border hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg-secondary)] border mr-4"
                                    style={{ borderColor: 'var(--border-color)' }}>
                                    {event.soloOrPartner === 'solo' ? <User size={16} /> : <Users size={16} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xs font-bold uppercase tracking-tight truncate pr-4">
                                            {event.sourceLabel || 'Unspecified'}
                                        </h3>
                                        <span className="text-[10px] font-mono opacity-40 shrink-0">
                                            {formatDate(event.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="flex space-x-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1 h-3"
                                                    style={{ backgroundColor: i < (event.intensity || 0) ? 'var(--accent-primary)' : 'var(--border-color)', opacity: i < (event.intensity || 0) ? 1 : 0.2 }} />
                                            ))}
                                        </div>
                                        {event.notes && (
                                            <span className="text-[10px] font-mono opacity-30 truncate italic">
                                                - {event.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer Branding */}
            <footer className="p-8 text-center opacity-20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-4 h-[1px] bg-current" />
                    <span className="text-[8px] font-mono tracking-[0.5em] uppercase">Private Search</span>
                    <div className="w-4 h-[1px] bg-current" />
                </div>
            </footer>
        </div>
    );
};

export default SearchGlobal;
