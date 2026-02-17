import React, { useState, useMemo } from 'react';
import { useEvents } from '../context/EventsContext';
import type { DecryptedEvent } from '../context/EventsContext';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Calendar as CalendarIcon, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { LOAD_SIZE_LABELS } from '../constants/presets';

export const Timeline: React.FC = () => {
    const { events: allEvents, loading } = useEvents();
    const showExtraPrivate = localStorage.getItem('showExtraPrivate') === 'true';

    // Filter events based on privacy level
    const events = useMemo(() => {
        return allEvents.filter(e => {
            if (e.privacyLevel === 'extra_private' && !showExtraPrivate) return false;
            // Legacy compatibility
            if (e.isSensitive && !showExtraPrivate) return false;
            return true;
        });
    }, [allEvents, showExtraPrivate]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="mx-auto h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No loads logged yet</h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                    Start tracking your data securely.
                </p>
                <Link
                    to="/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Log First Load
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Timeline</h2>
                <Link
                    to="/new"
                    className="p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition"
                >
                    <Plus className="w-5 h-5" />
                </Link>
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};

const EventCard: React.FC<{ event: DecryptedEvent }> = ({ event }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(event.date, 'MMM d, yyyy')}</span>
                    <span className="text-gray-600">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{format(event.date, 'h:mm a')}</span>
                </div>
                {event.privacyLevel === 'extra_private' && (
                    <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300">
                        Extra Private
                    </div>
                )}
            </div>

            {/* Source info */}
            <div className="mb-2">
                <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium capitalize">
                        {event.sourceLabel || event.sourceType}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm capitalize">
                        {event.soloOrPartner}
                    </span>
                </div>
            </div>

            {event.notes && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                    {event.notes}
                </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                {event.loadSize && (
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                        {LOAD_SIZE_LABELS[event.loadSize]}
                    </span>
                )}
                {event.intensity && (
                    <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                        Intensity: {event.intensity}/5
                    </span>
                )}
                {event.tags?.map(tag => (
                    <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
    );
};
