import React, { createContext, useContext, useState, useEffect } from 'react';
export const DARK = {
    bg: '#080A0F',
    surface1: '#11141D',
    surface2: '#151A24',
    glass: 'rgba(255,255,255,0.04)',
    glassStrong: 'rgba(255,255,255,0.06)',
    accent: '#6366F1',
    violet: '#A855F7',
    emerald: '#10B981',
    amber: '#F59E0B',
    text: '#F8FAFC',
    textSec: '#CBD5E1',
    textMuted: '#94A3B8',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.14)',
    borderAccent: 'rgba(99,102,241,0.4)',
    sidebarBg: '#0C0F1A',
};
export const LIGHT = {
    bg: '#F8FAFC',
    surface1: '#FFFFFF',
    surface2: '#EEF2FF',
    glass: 'rgba(255,255,255,0.75)',
    glassStrong: 'rgba(255,255,255,0.95)',
    accent: '#6366F1',
    violet: '#A855F7',
    emerald: '#10B981',
    amber: '#F59E0B',
    text: '#0F172A',
    textSec: '#334155',
    textMuted: '#64748B',
    border: 'rgba(0,0,0,0.07)',
    borderHover: 'rgba(0,0,0,0.12)',
    borderAccent: 'rgba(99,102,241,0.3)',
    sidebarBg: '#FFFFFF',
};
const ThemeContext = createContext({
    isDark: true,
    toggleTheme: () => { },
    colors: DARK,
});
function getInitialTheme() {
    try {
        const stored = localStorage.getItem('smarttime-theme');
        if (stored !== null)
            return stored === 'dark';
    }
    catch { }
    return true; // default dark
}
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(getInitialTheme);
    useEffect(() => {
        try {
            localStorage.setItem('smarttime-theme', isDark ? 'dark' : 'light');
        }
        catch { }
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);
    const toggleTheme = () => setIsDark(prev => !prev);
    const colors = isDark ? DARK : LIGHT;
    return (<ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>);
}
export const useTheme = () => useContext(ThemeContext);
