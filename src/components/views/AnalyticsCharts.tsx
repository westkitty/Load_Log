import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, PieChart as PieIcon, TrendingUp, Share2, X } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';
import { subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * AnalyticsCharts Component
 * Industrial-grade data visualization for Load_Log.
 * Built with Recharts and styled via theme-aware CSS variables.
 */
const AnalyticsCharts: React.FC = () => {
    const { events } = useEvents();

    const [timeRange, setTimeRange] = useState<'30D' | '1Y' | 'ALL'>('30D');
    const [showShareCard, setShowShareCard] = useState(false);

    // Filter events based on timeRange for the pie/trend charts
    const filteredEvents = useMemo(() => {
        if (timeRange === 'ALL') return events;
        const now = new Date();
        const cutoff = new Date();
        if (timeRange === '30D') cutoff.setDate(now.getDate() - 30);
        if (timeRange === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
        return events.filter(e => new Date(e.date) >= cutoff);
    }, [events, timeRange]);

    // 1. Time Series Output (Dynamic Buckets)
    const timeSeriesData = useMemo(() => {
        if (timeRange === '30D') {
            return [4, 3, 2, 1, 0].map(offset => {
                const start = startOfWeek(subWeeks(new Date(), offset));
                const end = endOfWeek(start);
                const count = filteredEvents.filter(e => {
                    const d = new Date(e.date);
                    return d >= start && d <= end;
                }).length;
                return { name: `W-${offset}`, count };
            });
        }
        if (timeRange === '1Y') {
            return [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(offset => {
                const start = startOfMonth(subMonths(new Date(), offset));
                const end = endOfMonth(start);
                const count = filteredEvents.filter(e => {
                    const d = new Date(e.date);
                    return d >= start && d <= end;
                }).length;
                return { name: start.toLocaleString('default', { month: 'short' }).toUpperCase(), count };
            });
        }

        // ALL -> Group by Year
        if (filteredEvents.length === 0) return [];
        const currentYear = new Date().getFullYear();
        const earliestDate = Math.min(...filteredEvents.map(e => e.date));
        const earliestYear = new Date(earliestDate).getFullYear();

        const yearsData = [];
        for (let y = earliestYear; y <= currentYear; y++) {
            const start = new Date(y, 0, 1);
            const end = new Date(y, 11, 31, 23, 59, 59);
            const count = filteredEvents.filter(e => {
                const d = new Date(e.date);
                return d >= start && d <= end;
            }).length;
            yearsData.push({ name: y.toString(), count });
        }
        return yearsData;
    }, [filteredEvents, timeRange]);

    // Derived Statistics Snapshot for Share Card
    const statsSnapshot = useMemo(() => {
        if (filteredEvents.length === 0) return { total: 0, avgInt: '0.0', topSource: 'N/A' };

        const avgInt = (filteredEvents.reduce((acc, e) => acc + (e.intensity || 0), 0) / filteredEvents.length).toFixed(1);

        // Compute top source by finding the most frequent 'tags' or just primary soloOrPartner logic
        // Since sourceData is already computed, let's just grab from it
        let topSource = 'N/A';
        const counts = filteredEvents.reduce((acc: Record<string, number>, curr) => {
            const key = curr.soloOrPartner === 'solo' ? 'Unitary' : 'Relational';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        if (Object.keys(counts).length > 0) {
            topSource = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        }

        return { total: filteredEvents.length, avgInt, topSource };
    }, [filteredEvents]);

    // 2. Source Breakdown
    const sourceData = useMemo(() => {
        const counts = filteredEvents.reduce((acc: Record<string, number>, curr) => {
            const key = curr.soloOrPartner === 'solo' ? 'Unitary' : 'Relational';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(name => ({ name, value: counts[name] }));
    }, [filteredEvents]);

    // 3. Intensity Trend (Last 10 Events of Filtered Set)
    const trendData = useMemo(() => {
        return [...filteredEvents]
            .sort((a, b) => a.date - b.date)
            .slice(-10)
            .map((e, i) => ({ index: i + 1, intensity: e.intensity || 0 }));
    }, [filteredEvents]);

    // --- Chart Theming Props ---
    const chartTheme = {
        tooltip: {
            contentStyle: {
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '12px',
                textTransform: 'uppercase' as const
            },
            itemStyle: { color: 'var(--accent-primary)' }
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto p-6 space-y-8"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Header */}
            <header className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Analytics</h1>
                        <span className="text-[10px] font-mono opacity-50 uppercase mb-1">Encrypted Insights</span>
                    </div>
                    <button
                        onClick={() => setShowShareCard(true)}
                        className="p-3 border rounded-xl hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex items-center space-x-2"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                        <Share2 size={16} />
                        <span className="text-[10px] font-mono font-bold uppercase hidden sm:block">Share</span>
                    </button>
                </div>

                {/* Tactical Tabs */}
                <div className="flex border" style={{ borderColor: 'var(--border-color)' }}>
                    {(['30D', '1Y', 'ALL'] as const).map((tab) => (
                        <button key={tab}
                            onClick={() => setTimeRange(tab)}
                            className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest border-r last:border-r-0 transition-colors ${timeRange === tab ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'opacity-40 hover:opacity-100'}`}
                            style={{ borderColor: 'var(--border-color)' }}>
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* 1. Bar Chart: Action Frequency */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 opacity-60">
                    <Activity size={16} />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Action Frequency</h2>
                </div>
                <div className="h-48 w-full border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-primary)" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} {...chartTheme.tooltip} />
                            <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 0, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 2. Pie Chart: Source Breakdown */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 opacity-60">
                    <PieIcon size={16} />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Source Allocation</h2>
                </div>
                <div className="h-48 w-full border flex items-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sourceData}
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {sourceData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                                ))}
                            </Pie>
                            <Tooltip {...chartTheme.tooltip} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pr-8 space-y-2">
                        {sourceData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center space-x-2">
                                <div className="w-2 h-2" style={{ backgroundColor: index === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}></div>
                                <span className="text-[10px] font-mono uppercase">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Line Chart: Intensity Trend */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 opacity-60">
                    <TrendingUp size={16} />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Intensity Trajectory</h2>
                </div>
                <div className="h-48 w-full border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="2 2" stroke="var(--border-color)" vertical={false} />
                            <XAxis dataKey="index" hide />
                            <YAxis stroke="var(--text-primary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} />
                            <Tooltip {...chartTheme.tooltip} />
                            <Line
                                type="stepAfter"
                                dataKey="intensity"
                                stroke="var(--accent-primary)"
                                strokeWidth={3}
                                dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 0 }}
                                activeDot={{ r: 6, stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <footer className="pt-8 pb-4 text-center">
                <p className="text-[9px] font-mono opacity-30 uppercase tracking-[0.3em]">
                    End-to-End Local Computation Only
                </p>
            </footer>

            {/* Share Stats Modal Overlay */}
            {showShareCard && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div
                        className="relative w-full max-w-sm border-2 p-8 shadow-2xl flex flex-col space-y-6"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--accent-primary)',
                            color: 'var(--text-primary)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px var(--accent-primary) inset'
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowShareCard(false)}
                            className="absolute top-3 right-3 p-1 opacity-50 hover:opacity-100"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center space-y-1">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter" style={{ color: 'var(--accent-primary)' }}>
                                LOAD LOG
                            </h2>
                            <p className="text-[10px] font-mono opacity-50 uppercase tracking-[0.2em] border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                                Cryptographic Vault Stats
                            </p>
                        </div>

                        <div className="py-2 space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Timeframe</span>
                                <span className="text-sm font-black font-mono">{timeRange === 'ALL' ? 'LIFETIME' : timeRange}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Total Logs</span>
                                <span className="text-sm font-black font-mono">{statsSnapshot.total}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Avg Intensity</span>
                                <span className="text-sm font-black font-mono">{statsSnapshot.avgInt} / 5.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-60">Top Origin</span>
                                <span className="text-sm font-black font-mono">{statsSnapshot.topSource}</span>
                            </div>
                        </div>

                        <div className="text-center pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            <p className="text-[8px] font-mono opacity-40 uppercase tracking-widest break-all">
                                {new Date().toISOString()}
                            </p>
                            <div className="mt-2 inline-block px-3 py-1 border border-dashed" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                                <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em]">
                                    SCREENSHOT TO SHARE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsCharts;
