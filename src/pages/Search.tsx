import React, { useState, useMemo } from 'react';
import { useEvents } from '../context/EventsContext';
import { Search as SearchIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
// import type { DecryptedEvent } from '../context/EventsContext';

export const Search: React.FC = () => {
    const { events } = useEvents();
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesType = typeFilter === 'all' || event.type === typeFilter;

            if (!query) return matchesType;

            const q = query.toLowerCase();
            const matchesSearch =
                (event.notes && event.notes.toLowerCase().includes(q)) ||
                (event.partners && event.partners.some(p => p.toLowerCase().includes(q))) ||
                (event.location && event.location.toLowerCase().includes(q)) ||
                event.type.includes(q);

            return matchesType && matchesSearch;
        });
    }, [events, query, typeFilter]);

    return (
        <div className="pb-20 space-y-4">
            <div className="sticky top-0 bg-gray-900 pt-2 pb-4 z-10">
                <h2 className="text-2xl font-bold text-white mb-4">Search</h2>

                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notes, partners, location..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="flex space-x-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${typeFilter === 'all'
                            ? 'bg-blue-900/30 border-blue-500 text-blue-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                            }`}
                    >
                        All
                    </button>
                    {['partnered', 'solo', 'medical', 'other'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize whitespace-nowrap ${typeFilter === t
                                ? 'bg-blue-900/30 border-blue-500 text-blue-300'
                                : 'bg-gray-800 border-gray-700 text-gray-400'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No matches found.
                    </div>
                ) : (
                    filteredEvents.map(event => (
                        <Link key={event.id} to="#" className="block"> {/* In real app, go to detail view */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-500 transition-colors">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">{format(event.date, 'MMM d, yyyy')}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize bg-gray-700 text-gray-300`}>
                                        {event.type}
                                    </span>
                                </div>
                                {event.notes && (
                                    <p className="text-gray-300 text-sm line-clamp-2">
                                        {highlightText(event.notes, query)}
                                    </p>
                                )}
                                {event.partners && (
                                    <div className="mt-2 text-xs text-blue-300">
                                        With: {event.partners.join(', ')}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

// Helper to highlight search terms
const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ?
                    <span key={i} className="bg-blue-900/50 text-blue-200 font-medium">{part}</span> : part
            )}
        </span>
    );
};
