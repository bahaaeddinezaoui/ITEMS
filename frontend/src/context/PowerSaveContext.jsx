import { useState, useEffect, useCallback } from 'react';
import { PowerSaveContext, STORAGE_KEY, getInitialPowerSave } from './power-save-constants';

export const PowerSaveProvider = ({ children }) => {
    const [enabled, setEnabledState] = useState(getInitialPowerSave);

    const applyPowerSave = useCallback((isOn) => {
        const root = document.documentElement;
        if (isOn) {
            root.classList.add('power-save');
        } else {
            root.classList.remove('power-save');
        }
    }, []);

    const setEnabled = useCallback((value) => {
        setEnabledState((prev) => {
            const newValue = typeof value === 'function' ? value(prev) : value;
            try {
                localStorage.setItem(STORAGE_KEY, String(newValue));
            } catch {
                // ignore
            }
            applyPowerSave(newValue);
            return newValue;
        });
    }, [applyPowerSave]);

    useEffect(() => {
        applyPowerSave(getInitialPowerSave());
    }, [applyPowerSave]);

    const value = {
        enabled,
        setEnabled,
    };

    return (
        <PowerSaveContext.Provider value={value}>
            {children}
        </PowerSaveContext.Provider>
    );
};
