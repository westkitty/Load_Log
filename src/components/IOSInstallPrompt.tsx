import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';

export const IOSInstallPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        // Check if not standalone (browser mode)
        const isStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;

        // Show only if iOS and not installed
        if (isIOS && !isStandalone) {
            // Delay to not be annoying immediately
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-gray-800/95 border border-blue-500/50 p-4 rounded-xl shadow-2xl z-50 backdrop-blur-md animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold">Install App</h3>
                <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <p className="text-sm text-gray-300 mb-4">
                Install <strong>Load Log</strong> for the best experience (fullscreen, biometric lock).
            </p>
            <div className="flex items-center space-x-3 text-sm text-blue-300">
                <span>1. Tap</span>
                <Share className="w-5 h-5" />
                <span>2. Select <strong>Add to Home Screen</strong></span>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 bg-gray-800 border-r border-b border-blue-500/50"></div>
        </div>
    );
};
