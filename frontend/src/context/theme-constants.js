import { createContext } from 'react';

export const ThemeContext = createContext(null);

export const STORAGE_KEY = 'ems-theme-preference';

export const THEME_OPTIONS = ['system', 'light', 'dark'];

export function getSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
}

export function getInitialPreference() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && THEME_OPTIONS.includes(stored)) return stored;
    } catch {
        // ignore
    }
    return 'system';
}

export function resolveTheme(preference) {
    if (preference === 'system') return getSystemTheme();
    return preference;
}
