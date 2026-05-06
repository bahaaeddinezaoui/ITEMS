import { useContext } from 'react';
import { ColorPaletteContext } from './palette-constants';

export const useColorPalette = () => {
    const context = useContext(ColorPaletteContext);
    if (!context) {
        throw new Error('useColorPalette must be used within a ColorPaletteProvider');
    }
    return context;
};
