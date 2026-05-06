import { createContext } from 'react';

export const PowerSaveContext = createContext(null);

export const STORAGE_KEY = 'ems-power-save';

export function getInitialPowerSave() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return stored === 'true';
    } catch {
        // ignore
    }
    return true;
}
