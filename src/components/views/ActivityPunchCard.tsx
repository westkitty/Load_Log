import React, { useMemo } from 'react';
import { useEvents } from '../../context/EventsContext';
import { getDay, getHours } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../../utils/haptics';

/**
 * ActivityPunchCard Component
 * A "Punch Card" heatmap showing the distribution of events 
 * by Day of Week vs. Hour of Day.
 */
const ActivityPunchCard: React.FC = () => {
    const { events } = useEvents();
    const navigate = useNavigate();

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // --- Data Transformation ---
    // Map events into a 2D matrix: [dayIndex][hourIndex]
    const punchData = useMemo(() => {
        // Initialise 7x24 matrix with zeros
        const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));

        events.forEach(event => {
            const date = new Date(event.date); // Assuming DecryptedEvent uses 'date' (timestamp)
            // getDay() is 0 (Sun) to 6 (Sat). We map it to 0 (Mon) to 6 (Sun).
            const day = (getDay(date) + 6) % 7;
            const hour = getHours(date);
            matrix[day][hour] += 1;
        });

        return matrix;
    }, [events]);

    // Determine max count for scaling (for relative opacity/sizing)
    const maxCount = useMemo(() => {
        let max = 1;
        punchData.forEach(row => {
            row.forEach(count => {
                if (count > max) max = count;
            });
        });
        return max;
    }, [punchData]);

    return (
        <div className="flex flex-col min-h-screen w-full p-6 space-y-6 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Header */}
            <header className="flex flex-col">
                <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">
                    Temporal Analysis
                </span>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                    Temporal Distribution
                </h1>
            </header>

            {/* Grid Wrapper with Horizontal Scroll for narrow screens */}
            <div className="flex-1 overflow-x-auto border-t border-b py-8 no-scrollbar"
                style={{ borderColor: 'var(--border-color)' }}>
                <div className="min-w-[700px] flex flex-col space-y-2">

                    {/* Hour Labels (X-Axis) */}
                    <div className="flex pl-12 mb-2">
                        {hours.map(hour => (
                            <div key={hour} className="flex-1 text-center">
                                <span className="text-[8px] font-mono opacity-40">
                                    {hour.toString().padStart(2, '0')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Rows */}
                    {days.map((dayLabel, dayIdx) => (
                        <div key={dayLabel} className="flex items-center">
                            {/* Day Labels (Y-Axis) */}
                            <div className="w-12 text-left">
                                <span className="text-[10px] font-mono font-bold opacity-60">
                                    {dayLabel}
                                </span>
                            </div>

                            {/* Punch Row */}
                            <div className="flex-1 flex items-center h-8">
                                {hours.map(hourIdx => {
                                    const count = punchData[dayIdx][hourIdx];
                                    // Scale logic: Size between 4px and 20px based on frequency
                                    const size = count > 0 ? Math.min(4 + (count / maxCount) * 16, 20) : 0;
                                    const opacity = count > 0 ? 0.2 + (count / maxCount) * 0.8 : 0;

                                    return (
                                        <div
                                            key={hourIdx}
                                            onClick={() => {
                                                if (count > 0) {
                                                    haptics.light();
                                                    navigate(`/?day=${dayIdx}&hour=${hourIdx}`);
                                                }
                                            }}
                                            className={`flex-1 flex justify-center items-center border-l h-full last:border-r group relative ${count > 0 ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
                                            style={{ borderColor: 'var(--border-color)' }}
                                        >
                                            {count > 0 && (
                                                <div
                                                    className="rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        backgroundColor: 'var(--accent-primary)',
                                                        opacity: opacity,
                                                        boxShadow: count === maxCount ? '0 0 10px var(--accent-primary)' : 'none'
                                                    }}
                                                />
                                            )}

                                            {/* Hover Tooltip - Visual Only */}
                                            {count > 0 && (
                                                <div className="absolute -top-8 hidden group-hover:flex bg-[var(--bg-secondary)] px-2 py-1 text-[8px] font-mono border whitespace-nowrap z-10"
                                                    style={{ borderColor: 'var(--border-color)' }}>
                                                    {count} EVENTS @ {hourIdx}:00
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Footer Grid Line */}
                    <div className="flex pl-12">
                        <div className="flex-1 border-b" style={{ borderColor: 'var(--border-color)' }}></div>
                    </div>
                </div>
            </div>

            {/* Legend & Stats */}
            <footer className="flex justify-between items-end pb-8">
                <div className="flex flex-col space-y-2">
                    <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Frequency Scale</span>
                    <div className="flex items-center space-x-3">
                        {[4, 8, 12, 16, 20].map((s, i) => (
                            <div
                                key={i}
                                className="rounded-full"
                                style={{
                                    width: `${s}px`,
                                    height: `${s}px`,
                                    backgroundColor: 'var(--accent-primary)',
                                    opacity: 0.2 + (i * 0.2)
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-mono font-bold uppercase leading-none" style={{ color: 'var(--accent-primary)' }}>
                        Peak Performance detected
                    </p>
                    <p className="text-[9px] font-mono opacity-40 uppercase">
                        Derived from {events.length} local logs
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ActivityPunchCard;
