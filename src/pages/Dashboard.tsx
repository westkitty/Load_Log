import React, { useMemo, useState, useEffect } from 'react';
import { useEvents } from '../context/EventsContext';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, startOfWeek, subWeeks } from 'date-fns';

export const Dashboard: React.FC = () => {
    const { events: allEvents } = useEvents();
    const showSensitive = localStorage.getItem('showSensitive') === 'true';

    const events = useMemo(() => {
        return allEvents.filter(e => showSensitive || !e.isSensitive);
    }, [allEvents, showSensitive]);

    // 1. Activity by Type (Pie)
    const typeData = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            counts[e.type] = (counts[e.type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [events]);

    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        partnered: 0,
        solo: 0,
        streak: 0,
        daysSince: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            const allEvents = await db.events.toArray();
            const now = new Date();
            const thisMonthEvents = allEvents.filter(e =>
                new Date(e.date).getMonth() === now.getMonth() &&
                new Date(e.date).getFullYear() === now.getFullYear()
            );

            // Streak Calculation
            const sortedDates = [...new Set(allEvents.map(e => new Date(e.date).setHours(0, 0, 0, 0)))].sort((a, b) => b - a);
            let currentStreak = 0;
            let daysSince = 0;

            if (sortedDates.length > 0) {
                const today = new Date().setHours(0, 0, 0, 0);
                const lastDate = sortedDates[0];
                const diffTime = Math.abs(today - lastDate);
                daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Check for streak (consecutive days)
                // If last event was today or yesterday, streak is active
                if (daysSince <= 1) {
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

            setStats({
                total: allEvents.length,
                thisMonth: thisMonthEvents.length,
                partnered: allEvents.filter(e => e.type === 'partnered').length,
                solo: allEvents.filter(e => e.type === 'solo').length,
                streak: currentStreak,
                daysSince: sortedDates.length > 0 ? daysSince : -1 // -1 means no events
            });
        };
        loadStats();
    }, [events]);

    // 3. Mood Distribution
    const moodData = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            if (e.mood) {
                counts[e.mood] = (counts[e.mood] || 0) + 1;
            }
        });
        // Sort by logical order
        const order = ['great', 'good', 'neutral', 'bad', 'awful'];
        return order
            .filter(mood => counts[mood])
            .map(mood => ({ name: mood, value: counts[mood] }));
    }, [events]);

    const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Log some events to see insights.
            </div>
        );
    }

    return (
        <div className="pb-20 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-4">Insights</h2>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Entries</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-bold text-blue-400">{stats.thisMonth}</div>
                </div>
                {stats.daysSince > 1 ? (
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 col-span-2 flex items-center justify-between">
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Days Since Last</div>
                            <div className="text-2xl font-bold text-orange-400">{stats.daysSince} Days</div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            Time to log?
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 col-span-2 flex items-center justify-between">
                        <div>
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Streak</div>
                            <div className="text-2xl font-bold text-green-400">{stats.streak} Days 🔥</div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            Keep it up!
                        </div>
                    </div>
                )}
            </div>

            {/* Type Distribution */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Activity Types</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={typeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {typeData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {typeData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center text-xs text-gray-400">
                            <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="capitalize">{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Frequency */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Weekly Frequency</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={frequencyData}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#374151' }}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Mood Distribution */}
            {moodData.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-300 mb-4">Moods</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={moodData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={50} />
                                <Tooltip
                                    cursor={{ fill: '#374151' }}
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Random Memory & Yearly Summary */}
            <div className="grid grid-cols-1 gap-4">
                {events.length > 5 && (
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-4 rounded-xl border border-indigo-500/30">
                        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2">Random Memory</h3>
                        {(() => {
                            const randomEvent = events[Math.floor(Math.random() * events.length)];
                            return (
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">{format(randomEvent.date, 'MMMM d, yyyy')}</div>
                                    <div className="text-white font-medium mb-1 capitalize">{randomEvent.type}</div>
                                    {randomEvent.notes && <div className="text-sm text-gray-300 italic">"{randomEvent.notes.substring(0, 80)}{randomEvent.notes.length > 80 ? '...' : ''}"</div>}
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-medium text-gray-300 mb-4">{new Date().getFullYear()} Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Total Events</div>
                            <div className="text-xl font-bold text-white">
                                {events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear()).length}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Top Partner</div>
                            <div className="text-xl font-bold text-white capitalize">
                                {(() => {
                                    const thisYear = events.filter(e => new Date(e.date).getFullYear() === new Date().getFullYear());
                                    const partners: Record<string, number> = {};
                                    thisYear.forEach(e => e.partners?.forEach(p => partners[p] = (partners[p] || 0) + 1));
                                    const top = Object.entries(partners).sort((a, b) => b[1] - a[1])[0];
                                    return top ? top[0] : '-';
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
