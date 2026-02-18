import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, PlusCircle, Calendar, Settings as SettingsIcon, Search, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import { OfflineIndicator } from './OfflineIndicator';
import { IOSInstallPrompt } from './IOSInstallPrompt';

export const Layout: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const handlePanic = () => {
        logout(); // Instantly clears key and state
    };

    const navItems = [
        { path: '/', icon: Calendar, label: 'Feed' },
        { path: '/calendar', icon: Calendar, label: 'Month' }, // Using Calendar icon for both for now, maybe distinguish later
        { path: '/punch', icon: BarChart2, label: 'Dist' },
        { path: '/insights', icon: BarChart2, label: 'Stats' },
        { path: '/search', icon: Search, label: 'Find' },
        { path: '/settings', icon: SettingsIcon, label: 'Cfg' },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <OfflineIndicator />
            <IOSInstallPrompt />
            {/* Top Bar with immediate functions */}
            <header className="h-16 px-4 glass-dark flex items-center justify-between sticky top-0 z-10 w-full max-w-2xl mx-auto shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="Load Log" className="w-8 h-8 rounded-lg shadow-lg" />
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Load Log
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    <Link to="/search" className="p-2 text-gray-400 hover:text-white">
                        <Search className="w-5 h-5" />
                    </Link>
                    <Link to="/new" className="p-2 text-gray-400 hover:text-white">
                        <PlusCircle className="w-5 h-5" />
                    </Link>
                    <Link to="/settings" className="p-2 text-gray-400 hover:text-white">
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <button
                        onClick={handlePanic}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-900/30 text-red-400 rounded-full border border-red-800 hover:bg-red-900/50 transition-colors text-sm font-medium"
                        aria-label="Panic Lock"
                    >
                        <ShieldAlert className="h-4 w-4" />
                        <span className="hidden sm:inline">Lock</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-20">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 glass-dark pb-safe z-20 border-t border-white/10">
                <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                    isActive ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div >
    );
};
