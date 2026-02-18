import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useEvents } from '../../context/EventsContext';

/**
 * CalendarView Component
 * A high-fidelity monthly grid for the Load_Log application.
 * Highlights local event density using theme-aware CSS variables.
 */
const CalendarView: React.FC = () => {
    const { events } = useEvents();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Navigation Handlers
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Date Logic for Grid Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div className="flex flex-col w-full max-w-md mx-auto min-h-screen"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            {/* Industrial Calendar Header */}
            <header className="px-6 py-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-[0.2em]">Temporal Log</span>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 border transition-colors hover:bg-[var(--bg-secondary)]"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 border transition-colors hover:bg-[var(--bg-secondary)]"
                            style={{ borderColor: 'var(--border-color)' }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Day of Week Labels */}
                <div className="grid grid-cols-7 text-center">
                    {weekDays.map(day => (
                        <span key={day} className="text-[9px] font-mono font-bold opacity-40">
                            {day}
                        </span>
                    ))}
                </div>
            </header>

            {/* Calendar Grid */}
            <main className="flex-1 p-2">
                <div className="grid grid-cols-7 border-t border-l" style={{ borderColor: 'var(--border-color)' }}>
                    {calendarDays.map((day, idx) => {
                        // Find events for this specific day
                        const dayEvents = events.filter(event => isSameDay(new Date(event.date), day));
                        // Note: event.date is likely timestamp. Checking type definition next if this fails.

                        const hasHighIntensity = dayEvents.some(e => (e.intensity || 0) > 3);
                        const hasEvents = dayEvents.length > 0;
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <div
                                key={idx}
                                onClick={() => setSelectedDate(day)}
                                className={`relative aspect-square border-r border-b cursor-pointer transition-all duration-150 flex flex-col items-center justify-center
                  ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                `}
                                style={{
                                    backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                {/* Date Number */}
                                <span className={`text-xs font-mono font-bold mb-1 ${isToday ? 'underline underline-offset-4' : ''}`}
                                    style={{ color: isToday ? 'var(--accent-primary)' : 'inherit' }}>
                                    {format(day, 'd')}
                                </span>

                                {/* Event Indicators */}
                                {hasEvents && (
                                    <div
                                        className={`w-2 h-2 rounded-sm ${hasHighIntensity ? 'animate-pulse' : ''}`}
                                        style={{
                                            backgroundColor: 'var(--accent-primary)',
                                            opacity: hasHighIntensity ? 1 : 0.4,
                                            boxShadow: hasHighIntensity ? '0 0 8px var(--accent-primary)' : 'none'
                                        }}
                                    />
                                )}

                                {/* Counter for Multiple Events */}
                                {dayEvents.length > 1 && (
                                    <span className="absolute bottom-1 right-1 text-[8px] font-mono opacity-60">
                                        x{dayEvents.length}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Selected Day Summary Footer */}
            <footer className="p-6 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex justify-between items-center opacity-80 mb-4">
                    <div className="flex items-center space-x-2">
                        <Lock size={12} />
                        <span className="text-[10px] font-mono uppercase tracking-widest">Local Vault Access</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase italic">
                        {format(selectedDate, 'do MMMM')}
                    </span>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <button className="w-full py-3 px-6 font-bold uppercase tracking-widest text-xs border-2 transition-transform active:scale-95"
                        style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--bg-primary)',
                            borderColor: 'var(--text-primary)'
                        }}>
                        View Daily Records
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CalendarView;
