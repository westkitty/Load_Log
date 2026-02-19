import React, { useMemo } from 'react';
import { useEvents } from '../../context/EventsContext';
import { Compass, Crosshair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../../utils/haptics';

const SpatialMap: React.FC = () => {
    const { events } = useEvents();
    const navigate = useNavigate();

    const zones = useMemo(() => {
        const counts = events.reduce((acc: Record<string, number>, curr) => {
            const label = curr.sourceLabel || 'Unspecified';
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([label, count], i) => {
            // Pseudo-random deterministic placement based on string hash or just index
            const angle = (i * 137.5) % 360; // Golden angle approx
            const radius = 20 + Math.min(count * 2, 60); // 20% to 80% from center
            return {
                label,
                count,
                x: 50 + radius * Math.cos((angle * Math.PI) / 180),
                y: 50 + radius * Math.sin((angle * Math.PI) / 180),
                size: Math.max(0.5, Math.min(count / 10, 2)) // Rem scaling
            };
        });
    }, [events]);

    return (
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto p-4 space-y-6 pb-24"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

            <header className="flex flex-col space-y-2 pt-6 px-2">
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Spatial Radar</h1>
                    <Compass className="opacity-50" />
                </div>
                <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Offline Tactical Sector Map</p>
            </header>

            <div className="relative w-full aspect-square rounded-full flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 border-[4px] rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)_inset]"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                </div>

                {/* Crosshairs */}
                <div className="absolute w-full h-px opacity-10" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                <div className="absolute h-full w-px opacity-10" style={{ backgroundColor: 'var(--text-primary)' }}></div>

                {/* Concentric rings */}
                <div className="absolute inset-[20%] rounded-full border border-dashed opacity-10" style={{ borderColor: 'var(--text-primary)' }}></div>
                <div className="absolute inset-[40%] rounded-full border border-dashed opacity-10" style={{ borderColor: 'var(--text-primary)' }}></div>

                <Crosshair size={32} className="absolute opacity-20" />

                {/* Plotted Zones */}
                {zones.map((zone, i) => (
                    <div key={i} className="absolute flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group"
                        style={{
                            left: `${zone.x}%`,
                            top: `${zone.y}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10 + Math.floor(zone.count)
                        }}
                        onClick={() => {
                            haptics.light();
                            // Could link to feed with a search param: `/?q=${zone.label}`
                            navigate(`/?q=${encodeURIComponent(zone.label)}`);
                        }}
                    >
                        <div className="rounded-full absolute inset-0 animate-pulse" style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.2, filter: 'blur(8px)', transform: 'scale(2)' }}></div>
                        <div className="rounded-full border-2 shadow-lg relative z-10 flex items-center justify-center font-bold"
                            style={{
                                width: `${zone.size + 1.5}rem`,
                                height: `${zone.size + 1.5}rem`,
                                backgroundColor: 'var(--bg-primary)',
                                borderColor: 'var(--accent-primary)',
                                color: 'var(--accent-primary)'
                            }}>
                            <span className="text-[10px] font-mono select-none">{zone.count}</span>
                        </div>
                        <span className="text-[9px] font-mono mt-1 font-bold bg-black/80 px-1.5 py-0.5 border rounded-sm absolute top-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ borderColor: 'var(--border-color)' }}>
                            {zone.label}
                        </span>
                    </div>
                ))}

                {zones.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono uppercase opacity-30 text-center p-8">
                        No regional data available.<br />Radar inactive.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpatialMap;
