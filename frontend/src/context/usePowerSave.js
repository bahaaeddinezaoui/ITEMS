import { useContext } from 'react';
import { PowerSaveContext } from './power-save-constants';

export const usePowerSave = () => {
    const context = useContext(PowerSaveContext);
    if (!context) {
        throw new Error('usePowerSave must be used within a PowerSaveProvider');
    }
    return context;
};
