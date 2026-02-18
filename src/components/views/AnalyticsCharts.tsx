import React, { useMemo } from 'react';
import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';
import { subWeeks, startOfWeek, endOfWeek } from 'date-fns';

/**
 * AnalyticsCharts Component
 * Industrial-grade data visualization for Load_Log.
 * Built with Recharts and styled via theme-aware CSS variables.
 */
const AnalyticsCharts: React.FC = () => {
    const { events } = useEvents();

    // --- Data Transformation Logic ---

    // 1. Weekly Frequency (Last 4 Weeks)
    const weeklyData = useMemo(() => {
        return [3, 2, 1, 0].map(offset => {
            const start = startOfWeek(subWeeks(new Date(), offset));
            const end = endOfWeek(start);
            const count = events.filter(e => {
                const d = new Date(e.date); // Assuming DecryptedEvent uses 'date' (timestamp)
                return d >= start && d <= end;
            }).length;
            return { name: `W-${offset}`, count };
        });
    }, [events]);

    // 2. Source Breakdown
    const sourceData = useMemo(() => {
        const counts = events.reduce((acc: Record<string, number>, curr) => {
            const key = curr.soloOrPartner === 'solo' ? 'Unitary' : 'Relational';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(name => ({ name, value: counts[name] }));
    }, [events]);

    // 3. Intensity Trend (Last 10 Events)
    const trendData = useMemo(() => {
        return [...events]
            .sort((a, b) => a.date - b.date)
            .slice(-10)
            .map((e, i) => ({ index: i + 1, intensity: e.intensity || 0 }));
    }, [events]);

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
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Analytics</h1>
                    <span className="text-[10px] font-mono opacity-50 uppercase mb-1">Encrypted Insights</span>
                </div>

                {/* Tactical Tabs */}
                <div className="flex border" style={{ borderColor: 'var(--border-color)' }}>
                    {['7D', '30D', 'ALL'].map((tab, i) => (
                        <button key={tab}
                            className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-widest border-r last:border-r-0 ${i === 0 ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'opacity-40'}`}
                            style={{ borderColor: 'var(--border-color)' }}>
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* 1. Bar Chart: Weekly Output */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 opacity-60">
                    <Activity size={16} />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Weekly Frequency</h2>
                </div>
                <div className="h-48 w-full border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
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
        </div>
    );
};

export default AnalyticsCharts;
