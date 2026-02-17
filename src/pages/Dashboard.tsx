import React, { useMemo } from 'react';
import { useEvents } from '../context/EventsContext';
import { format, differenceInDays } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Activity } from 'lucide-react';
import { LOAD_SIZE_LABELS } from '../constants/presets';
import { AnimatedCounter } from '../components/AnimatedCounter';

export const Dashboard: React.FC = () => {
    const { events: allEvents } = useEvents();
    const showExtraPrivate = localStorage.getItem('showExtraPrivate') === 'true';

    const events = useMemo(() => {
        return allEvents.filter(e => {
            if (e.privacyLevel === 'extra_private' && !showExtraPrivate) return false;
            if (e.isSensitive && !showExtraPrivate) return false; // Legacy
            return true;
        });
    }, [allEvents, showExtraPrivate]);

    // Stats Calculation
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonthEvents = events.filter(e =>
            new Date(e.date).getMonth() === now.getMonth() &&
            new Date(e.date).getFullYear() === now.getFullYear()
        );

        const lastEvent = events.length > 0 ? events[0] : null;
        const daysSince = lastEvent ? differenceInDays(now, new Date(lastEvent.date)) : -1;

        // Streak logic (daily usage)
        // Simplified: Consecutive days with at least one event
        // We'll just count total events for now as "Load Count"

        return {
            total: events.length,
            thisMonth: thisMonthEvents.length,
            daysSince,
            lastEvent
        };
    }, [events]);

    // Charts Data
    const typeData = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const type = e.sourceType || 'other';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [events]);

    const soloVsPartnerData = useMemo(() => {
        let solo = 0;
        let partner = 0;
        events.forEach(e => {
            if (e.soloOrPartner === 'partnered') partner++;
            else solo++;
        });
        return [
            { name: 'Solo', value: solo },
            { name: 'Partner', value: partner }
        ];
    }, [events]);

    const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

    return (
        <div className="pb-24 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard</h2>

            {/* 1. Last Load Card (Phase 3.2) */}
            {stats.lastEvent ? (
                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 p-5 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock className="w-24 h-24 text-blue-400" />
                    </div>

                    <div className="relative z-10">
                        <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                            <Activity className="w-3 h-3 mr-1" /> Last Load
                        </div>
                        <div className="text-3xl font-bold text-white mb-4">
                            {stats.daysSince === 0 ? 'Today' : stats.daysSince === 1 ? 'Yesterday' : `${stats.daysSince} days ago`}
                        </div>

                        <div className="flex items-center space-x-4 bg-gray-900/50 p-3 rounded-xl backdrop-blur-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase">Time</span>
                                <span className="text-sm font-medium text-white">
                                    {format(stats.lastEvent.date, 'h:mm a')}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-700/50" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase">Src</span>
                                <span className="text-sm font-medium text-white capitalize">
                                    {stats.lastEvent.sourceType}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-gray-700/50" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase">Size</span>
                                <span className="text-sm font-medium text-blue-300 capitalize">
                                    {stats.lastEvent.loadSize ? LOAD_SIZE_LABELS[stats.lastEvent.loadSize] : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 text-center">
                    <p className="text-gray-400 mb-2">No loads logged yet.</p>
                    <p className="text-sm text-gray-600">Start tracking to see stats.</p>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Logs</div>
                    <div className="text-2xl font-bold text-white">
                        <AnimatedCounter value={stats.total} />
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-bold text-blue-400">
                        <AnimatedCounter value={stats.thisMonth} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {events.length > 0 && (
                <div className="space-y-6">
                    {/* Solo vs Partner */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Solo vs Partner</h3>
                        <div className="h-40 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={soloVsPartnerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#3b82f6" /> {/* Solo - Blue */}
                                        <Cell fill="#ec4899" /> {/* Partner - Pink */}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center text-xs text-gray-400">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                                Solo ({soloVsPartnerData[0].value})
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <div className="w-3 h-3 rounded-full bg-pink-500 mr-2" />
                                Partner ({soloVsPartnerData[1].value})
                            </div>
                        </div>
                    </div>

                    {/* Source Breakdown */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Top Sources</h3>
                        <div className="space-y-3">
                            {typeData.sort((a, b) => b.value - a.value).map((item, idx) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                        <span className="text-sm text-gray-300 capitalize">{item.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${(item.value / stats.total) * 100}%`,
                                                    backgroundColor: COLORS[idx % COLORS.length]
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 w-6 text-right">{item.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
