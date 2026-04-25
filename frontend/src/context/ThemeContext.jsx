import { useState, useEffect, useCallback } from 'react';
import { ThemeContext, STORAGE_KEY, getInitialPreference, resolveTheme } from './theme-constants';

export const ThemeProvider = ({ children }) => {
    const [preference, setPreferenceState] = useState(getInitialPreference);
    const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getInitialPreference()));

    const applyTheme = useCallback((theme) => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
    }, []);

    const setPreference = useCallback((newPref) => {
        setPreferenceState(newPref);
        try {
            localStorage.setItem(STORAGE_KEY, newPref);
        } catch {
            // ignore
        }
        const resolved = resolveTheme(newPref);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, [applyTheme]);

    // Apply theme on mount
    useEffect(() => {
        const resolved = resolveTheme(getInitialPreference());
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, [applyTheme]);

    // Listen for system theme changes when preference is 'system'
    useEffect(() => {
        if (preference !== 'system') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            const resolved = e.matches ? 'dark' : 'light';
            setResolvedTheme(resolved);
            applyTheme(resolved);
        };

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [preference, applyTheme]);

    const value = {
        preference,
        resolvedTheme,
        setPreference,
        isDark: resolvedTheme === 'dark',
        isLight: resolvedTheme === 'light',
        isSystem: preference === 'system',
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
