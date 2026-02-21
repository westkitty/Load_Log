import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, PlusCircle, Calendar, Settings as SettingsIcon, Search, BarChart2, Compass } from 'lucide-react';
import clsx from 'clsx';
import { OfflineIndicator } from './OfflineIndicator';
import { IOSInstallPrompt } from './IOSInstallPrompt';
import { WalkthroughOverlay } from './WalkthroughOverlay';

export const Layout: React.FC = () => {
    const { logout, hasAccount } = useAuth();
    const location = useLocation();

    const handlePanic = () => {
        logout(); // Instantly clears key and state
    };

    const navItems = [
        { id: 'nav-feed', path: '/', icon: Calendar, label: 'Feed' },
        { id: 'nav-month', path: '/calendar', icon: Calendar, label: 'Month' },
        { id: 'nav-punch', path: '/punch', icon: BarChart2, label: 'Dist' },
        { id: 'nav-insights', path: '/insights', icon: BarChart2, label: 'Stats' },
        { id: 'nav-map', path: '/map', icon: Compass, label: 'Radar' },
        { id: 'nav-search', path: '/search', icon: Search, label: 'Find' },
        { id: 'nav-settings', path: '/settings', icon: SettingsIcon, label: 'Cfg' },
    ];

    return (
        <div className="min-h-screen flex flex-col cinematic-vignette" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <OfflineIndicator />
            <IOSInstallPrompt />
            <WalkthroughOverlay />

            {/* Top Bar with immediate functions */}
            <header className="h-16 px-4 glass-dark flex items-center justify-between sticky top-0 z-10 w-full max-w-2xl mx-auto shadow-sm border-b-0 border-x-0 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black italic uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" style={{ color: 'var(--accent-primary)' }}>
                        Load_Log
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    <Link to="/search" className="p-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <Search className="w-5 h-5 drop-shadow-md" />
                    </Link>
                    <Link id="nav-new" to="/new" className="p-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <PlusCircle className="w-5 h-5 drop-shadow-md" />
                    </Link>
                    <Link to="/settings" className="p-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <SettingsIcon className="w-5 h-5 drop-shadow-md" />
                    </Link>
                    <div className="w-px h-6 mx-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
                    <button
                        onClick={hasAccount ? handlePanic : () => window.location.hash = '#/settings'}
                        className={clsx(
                            "flex items-center space-x-1 px-4 py-1.5 rounded-full border transition-all duration-300 text-[10px] font-bold uppercase tracking-widest",
                            hasAccount
                                ? "bg-red-950/40 text-red-500 border-red-900 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:bg-red-900/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95"
                                : "bg-cyan-950/40 text-cyan-500 border-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-900/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
                        )}
                        aria-label={hasAccount ? "Panic Lock" : "Setup Lock"}
                    >
                        <ShieldAlert className="h-4 w-4" />
                        <span className="hidden sm:inline">{hasAccount ? "Secure" : "Init"}</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-24 relative z-0">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 glass-dark pb-safe z-20 border-t border-[var(--border-color)]">
                <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                id={item.id}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ease-out py-1 group",
                                    isActive ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
                                )}
                                style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                            >
                                <Icon className={clsx(
                                    "h-5 w-5 transition-transform duration-300",
                                    isActive && "drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                                )} />
                                <span className={clsx(
                                    "text-[9px] font-mono uppercase tracking-[0.2em] font-bold transition-all duration-300 block",
                                    isActive ? "opacity-100 text-[var(--accent-primary)] drop-shadow-[0_0_4px_rgba(0,229,255,0.4)]" : "opacity-0 group-hover:opacity-70 group-hover:text-[var(--text-primary)] -translate-y-1 group-hover:translate-y-0 absolute bottom-1",
                                    isActive && "translate-y-0 relative bottom-0"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
