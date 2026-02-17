import React from 'react';
import { useEvents } from '../context/EventsContext';
import type { DecryptedEvent } from '../context/EventsContext';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const Timeline: React.FC = () => {
    const [showSensitive] = useState(localStorage.getItem('showSensitive') === 'true');

    // Filter events
    const filteredEvents = events.filter(e => {
        if (!showSensitive && e.isSensitive) return false;

        // Simple search filter if query exists (this logic was inside reduce, moving it out for cleaner chain)
        return true;
    });

    const groupedEvents = filteredEvents.reduce((acc, event) => {
        // Search logic needs to be here if we want to filter by search query too
        // Actually let's keep search logic inside reduce or move it here.
        // Original code had no search state in this file?
        // Wait, the original code had NO search logic in the snippet I saw in Step 552.
        // It just had `events.map`.
        // Step 533 shows `Timeline.tsx` has `const { events, loading } = useEvents();` and `if (events.length === 0)`.
        // It does NOT have search.
        // So I just need to filter by sensitive.
        return acc; // dummy return for replacement context match, wait.
    }, {} as any);

    // Actually I should just replace `events.map` with `visibleEvents.map`.
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
            <h3 className="text-xl font-medium text-white mb-2">No events yet</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                Start tracking your intimacy journey securely.
            </p>
            <Link
                to="/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <Plus className="h-5 w-5 mr-1" />
                Log First Event
            </Link>
        </div>
    );
}

return (
    <div className="space-y-6 pb-20">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Timeline</h2>
            <Link
                to="/new"
                className="p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition"
            >
                <Plus className="w-5 h-5" />
            </Link>
        </div>

        {/* Calendar View Placeholder - to be fully implemented */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-300">Calendar</h3>
                <span className="text-xs text-gray-500">{format(new Date(), 'MMMM yyyy')}</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
                {/* Simple current month visualization for immediate visibility */}
                {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2; // Offset for demo
                    const isToday = day === new Date().getDate();
                    const hasEvent = events.some(e => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === new Date().getMonth());

                    return (
                        <div key={i} className={`
                          h-8 rounded-full flex items-center justify-center text-sm
                          ${day > 0 && day <= 31 ? 'text-gray-300' : 'text-gray-700'}
                          ${isToday ? 'bg-blue-600 text-white font-bold' : ''}
                          ${hasEvent && !isToday ? 'bg-gray-700 text-white border border-blue-500/50' : ''}
                      `}>
                            {day > 0 && day <= 31 ? day : ''}
                        </div>
                    )
                })}
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-300">Recent Entries</h3>
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
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(event.date, 'MMM d, yyyy')}</span>
                    <span className="text-gray-600">•</span>
                    <Clock className="w-4 h-4" />
                    <span>{format(event.date, 'h:mm a')}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                    {event.type}
                </div>
            </div>

            {event.partners && event.partners.length > 0 && (
                <div className="text-white font-medium mb-1">
                    With: {event.partners.join(', ')}
                </div>
            )}

            {event.notes && (
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                    {event.notes}
                </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                {event.protection.map(p => (
                    <span key={p} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {p.replace('_', ' ')}
                    </span>
                ))}
                {event.rating && (
                    <span className="text-xs bg-gray-700 text-yellow-300 px-2 py-1 rounded">
                        ★ {event.rating}
                    </span>
                )}
            </div>
        </div>
    );
};

function getTypeColor(type: string): string {
    switch (type) {
        case 'partnered': return 'bg-pink-900/50 text-pink-300';
        case 'solo': return 'bg-blue-900/50 text-blue-300';
        case 'medical': return 'bg-green-900/50 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
    }
}
