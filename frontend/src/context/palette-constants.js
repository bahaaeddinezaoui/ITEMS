import { createContext } from 'react';

export const ColorPaletteContext = createContext(null);

export const PALETTE_STORAGE_KEY = 'ems-color-palette';

export const PALETTE_OPTIONS = ['purple', 'red', 'orange', 'green'];

export const PALETTE_LABELS = {
    purple: { en: 'Purple', ar: 'بنفسجي' },
    red: { en: 'Red', ar: 'أحمر' },
    orange: { en: 'Orange', ar: 'برتقالي' },
    green: { en: 'Green', ar: 'أخضر' },
};

export function getInitialPalette() {
    try {
        const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
        if (stored && PALETTE_OPTIONS.includes(stored)) return stored;
    } catch {
        // ignore
    }
    return 'purple';
}
