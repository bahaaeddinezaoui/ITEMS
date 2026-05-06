import { useState, useEffect, useCallback } from 'react';
import { ColorPaletteContext, PALETTE_STORAGE_KEY, getInitialPalette } from './palette-constants';

export const ColorPaletteProvider = ({ children }) => {
    const [palette, setPaletteState] = useState(getInitialPalette);

    const applyPalette = useCallback((p) => {
        const root = document.documentElement;
        root.setAttribute('data-palette', p);
    }, []);

    const setPalette = useCallback((newPalette) => {
        setPaletteState(newPalette);
        try {
            localStorage.setItem(PALETTE_STORAGE_KEY, newPalette);
        } catch {
            // ignore
        }
        applyPalette(newPalette);
    }, [applyPalette]);

    useEffect(() => {
        applyPalette(getInitialPalette());
    }, [applyPalette]);

    const value = {
        palette,
        setPalette,
        isPurple: palette === 'purple',
        isRed: palette === 'red',
        isOrange: palette === 'orange',
        isGreen: palette === 'green',
    };

    return (
        <ColorPaletteContext.Provider value={value}>
            {children}
        </ColorPaletteContext.Provider>
    );
};
