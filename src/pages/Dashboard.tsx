import React, { useMemo } from 'react';
import { useEvents } from '../context/EventsContext';
import { formatDistanceToNow } from 'date-fns';
import { Activity, TrendingUp, Target, Zap } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { events: allEvents } = useEvents();

    // Filter based on privacy level
    const showExtraPrivate = localStorage.getItem('showExtraPrivate') === 'true';
    const events = useMemo(() => {
        return allEvents.filter(e => {
            if (e.privacyLevel === 'extra_private' && !showExtraPrivate) return false;
            // Legacy compatibility
            if (e.isSensitive && !showExtraPrivate) return false;
            return true;
        });
    }, [allEvents, showExtraPrivate]);

    // Stats calculations
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonthEvents = events.filter(e =>
            new Date(e.date).getMonth() === now.getMonth() &&
            new Date(e.date).getFullYear() === now.getFullYear()
        );

        const soloCount = events.filter(e => e.soloOrPartner === 'solo').length;
        const partneredCount = events.filter(e => e.soloOrPartner === 'partnered').length;

        // Calculate streak (days with at least one event)
        const sortedDates = [...new Set(events.map(e => new Date(e.date).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
        let currentStreak = 0;
        let daysSinceLast = 0;

        if (sortedDates.length > 0) {
            const today = new Date().setHours(0, 0, 0, 0);
            const lastDate = sortedDates[0];
            const diffTime = Math.abs(today - lastDate);
            daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Check for streak (consecutive days)
            if (daysSinceLast <= 1) {
                currentStreak = 1;
                for (let i = 0; i < sortedDates.length - 1; i++) {
                    const curr = sortedDates[i];
                    const next = sortedDates[i + 1];
                    const diff = (curr - next) / (1000 * 60 * 60 * 24);
                    if (diff === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        return {
            total: events.length,
            thisMonth: thisMonthEvents.length,
            solo: soloCount,
            partnered: partneredCount,
            streak: currentStreak,
            daysSince: daysSinceLast
        };
    }, [events]);

    // Top sources
    const topSources = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const key = e.sourceLabel || e.sourceType;
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, [events]);

    if (events.length === 0) {
        return (
            <div className="pb-20 p-4">
                <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Data Yet</h3>
                    <p className="text-gray-400">Log your first load to see insights</p>
                </div>
            </div>
        );
    }

    const lastEvent = events[0];
    const hoursSince = (Date.now() - lastEvent.date) / (1000 * 60 * 60);

    return (
        <div className="pb-20 p-4 space-y-6">
            <h2 className="text-2xl font-bold text-white">Insights</h2>

            {/* Last Load Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 rounded-xl border border-blue-800">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm uppercase text-blue-300 font-semibold">Last Load</h3>
                    <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                    {hoursSince < 1
                        ? 'Just now'
                        : hoursSince < 24
                            ? `${Math.floor(hoursSince)}h ago`
                            : `${Math.floor(hoursSince / 24)}d ago`}
                </div>
                <div className="text-sm text-blue-200">
                    {lastEvent.sourceLabel || lastEvent.sourceType} • {lastEvent.loadSize || 'medium'}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Logs</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.thisMonth}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Streak</div>
                    <div className="text-2xl font-bold text-green-400">{stats.streak} days</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Solo/Partner</div>
                    <div className="text-2xl font-bold text-purple-400">{stats.solo}/{stats.partnered}</div>
                </div>
            </div>

            {/* Top Sources */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                    <Target className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-bold text-white">Top Sources</h3>
                </div>
                <div className="space-y-3">
                    {topSources.map((source, i) => (
                        <div key={source.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-3">
                                    {i + 1}
                                </div>
                                <span className="text-gray-300 capitalize">{source.name}</span>
                            </div>
                            <span className="text-gray-500 font-medium">{source.count}x</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Frequency */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-bold text-white">Frequency</h3>
                </div>
                <p className="text-gray-400 text-sm">
                    Avg: {stats.thisMonth > 0 ? (stats.thisMonth / (new Date().getDate())).toFixed(1) : '0'} per day this month
                </p>
            </div>
        </div>
    );
};
