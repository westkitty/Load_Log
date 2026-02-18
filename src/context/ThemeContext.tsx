import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme =
    | 'industrial-steel'
    | 'neon-performance'
    | 'minimal-tactical'
    | 'premium-black-gold'
    | 'retro-gym';

export interface ThemeDefinition {
    id: Theme;
    name: string;
    colors: {
        bg: string;
        accent: string;
    };
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('app-theme') as Theme;
        return saved || 'industrial-steel';
    });

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const availableThemes: ThemeDefinition[] = [
        { id: 'industrial-steel', name: 'Industrial Steel', colors: { bg: '#0a0a0a', accent: '#3b82f6' } },
        { id: 'neon-performance', name: 'Neon Performance', colors: { bg: '#050510', accent: '#00ff9d' } },
        { id: 'minimal-tactical', name: 'Minimal Tactical', colors: { bg: '#e5e5e5', accent: '#171717' } },
        { id: 'premium-black-gold', name: 'Black Gold', colors: { bg: '#000000', accent: '#fbbf24' } },
        { id: 'retro-gym', name: 'Retro Gym', colors: { bg: '#f0f0f0', accent: '#ef4444' } },
    ];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
