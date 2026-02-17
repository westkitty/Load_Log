import React, { useState, useMemo } from 'react';
import { useEvents } from '../context/EventsContext';
import { Search as SearchIcon, X, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { SourceType } from '../types';

export const Search: React.FC = () => {
    const { events } = useEvents();
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<SourceType | 'all'>('all');

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesType = typeFilter === 'all' || event.sourceType === typeFilter;

            if (!query) return matchesType;

            const q = query.toLowerCase();
            const matchesSearch =
                (event.notes && event.notes.toLowerCase().includes(q)) ||
                (event.bodyNotes && event.bodyNotes.toLowerCase().includes(q)) ||
                (event.sourceLabel && event.sourceLabel.toLowerCase().includes(q)) ||
                (event.tags && event.tags.some(t => t.toLowerCase().includes(q))) ||
                event.sourceType.includes(q);

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
                        placeholder="Search notes, source, tags..."
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
                    {(['porn', 'fantasy', 'partner', 'memory', 'media', 'other'] as const).map(t => (
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
                        <Link key={event.id} to="#" className="block"> {/* In real app, go to detail view or expand */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-500 transition-colors">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-400">{format(event.date, 'MMM d, yyyy')}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize bg-gray-700 text-gray-300`}>
                                        {event.sourceType}
                                    </span>
                                </div>

                                {event.sourceLabel && (
                                    <div className="text-white font-medium mb-1">
                                        {highlightText(event.sourceLabel, query)}
                                    </div>
                                )}

                                {(event.notes || event.bodyNotes) && (
                                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                                        {highlightText(event.notes || event.bodyNotes || '', query)}
                                    </p>
                                )}

                                {event.tags && event.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded flex items-center">
                                                <Tag className="w-3 h-3 mr-0.5" />
                                                {highlightText(tag, query)}
                                            </span>
                                        ))}
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
