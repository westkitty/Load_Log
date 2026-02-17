import React, { useState } from 'react';
import { useEvents } from '../context/EventsContext';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Calendar as CalendarIcon, Clock, Lock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { LOAD_SIZE_LABELS } from '../constants/presets';
import type { DecryptedEvent } from '../context/EventsContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useHaptic } from '../hooks/useHaptic';

export const Timeline: React.FC = () => {
    const { events, loading, deleteEvent } = useEvents();
    const [showExtraPrivate] = useState(() => localStorage.getItem('showExtraPrivate') === 'true');
    const { trigger: haptic } = useHaptic();

    // Filter events
    const filteredEvents = events.filter(e => {
        if (e.privacyLevel === 'extra_private' && !showExtraPrivate) return false;
        if (e.isSensitive && !showExtraPrivate) return false;
        return true;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => b.date - a.date);

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this log?')) {
            haptic('warn');
            await deleteEvent(id);
        }
    };

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
                <h3 className="text-xl font-medium text-white mb-2">No events yet</h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                    Start tracking your stats securely.
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

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {sortedEvents.map((event) => (
                        <SwipeableEventCard key={event.id} event={event} onDelete={() => handleDelete(event.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SwipeableEventCard: React.FC<{ event: DecryptedEvent; onDelete: () => void }> = ({ event, onDelete }) => {
    const x = useMotionValue(0);
    const iconOpacity = useTransform(x, [-60, -20], [1, 0]);

    const { trigger: haptic } = useHaptic();

    return (
        <div className="relative mb-4 group">
            {/* Delete Background */}
            <div className="absolute inset-0 bg-red-600 rounded-lg flex items-center justify-end px-6 z-0">
                <motion.div style={{ opacity: iconOpacity }}>
                    <Trash2 className="text-white w-6 h-6" />
                </motion.div>
            </div>

            {/* Foreground Card */}
            <motion.div
                style={{ x, touchAction: 'pan-y' }}
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -80) {
                        haptic('heavy');
                        onDelete();
                    }
                }}
                className="relative z-10 bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
            >
                <EventCardContent event={event} />
            </motion.div>
        </div>
    );
};

const EventCardContent: React.FC<{ event: DecryptedEvent }> = ({ event }) => (
    <div className="p-4 bg-gray-800">
        <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(event.date, 'MMM d, yyyy')}</span>
                <span className="text-gray-600">•</span>
                <Clock className="w-4 h-4" />
                <span>{format(event.date, 'h:mm a')}</span>
                {event.privacyLevel === 'extra_private' && (
                    <Lock className="w-3 h-3 text-red-400 ml-1" />
                )}
            </div>

            {/* Source Label Badge */}
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800`}>
                {event.sourceLabel || event.sourceType || 'Unknown'}
            </div>
        </div>

        {/* Main Info Row */}
        <div className="flex items-center space-x-4 mt-2 mb-3">
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Load</span>
                <span className="text-white font-medium">
                    {event.loadSize ? LOAD_SIZE_LABELS[event.loadSize] : '-'}
                </span>
            </div>

            {event.intensity && (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Intensity</span>
                    <div className="flex items-center">
                        <span className="text-yellow-400 font-bold mr-1">{event.intensity}</span>
                        <span className="text-gray-600 text-xs">/ 5</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Type</span>
                <span className="text-gray-300 capitalize">
                    {event.soloOrPartner || 'Solo'}
                </span>
            </div>
        </div>

        {/* Notes / Description */}
        {(event.notes || event.bodyNotes) && (
            <p className="text-gray-400 text-sm mt-3 pt-3 border-t border-gray-700/50 line-clamp-2">
                {event.notes || event.bodyNotes}
            </p>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {event.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md border border-gray-600">
                        #{tag}
                    </span>
                ))}
            </div>
        )}
    </div>
);
