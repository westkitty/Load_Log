import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="bg-red-900/80 text-white text-xs py-1 px-4 text-center backdrop-blur-sm animate-pulse sticky top-0 z-50">
            <div className="flex items-center justify-center space-x-2">
                <WifiOff className="w-3 h-3" />
                <span>You are offline. Changes will sync locally.</span>
            </div>
        </div>
    );
};
