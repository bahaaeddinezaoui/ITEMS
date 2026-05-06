import { usePowerSave } from '../context/usePowerSave';
import { useTranslation } from 'react-i18next';

const PowerSaveButton = ({ size = 16, style: customStyle }) => {
    const { enabled, setEnabled } = usePowerSave();
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            title={enabled ? t('options.powerSaveOff') : t('options.powerSaveMode')}
            aria-label={enabled ? t('options.powerSaveOff') : t('options.powerSaveMode')}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: enabled ? 'var(--color-accent-primary)' : 'var(--color-border)',
                background: enabled ? 'var(--color-accent-glow)' : 'transparent',
                color: enabled ? 'var(--color-accent-tertiary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 0,
                ...customStyle,
            }}
        >
            {enabled
                ? <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                : <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>
            }
        </button>
    );
};

export default PowerSaveButton;
