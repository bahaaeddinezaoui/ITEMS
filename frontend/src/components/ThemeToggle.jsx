import { useTheme } from '../context/useTheme';
import { useTranslation } from 'react-i18next';

const ThemeToggle = () => {
    const { preference, setPreference } = useTheme();
    const { t } = useTranslation();

    const options = [
        { value: 'light', label: t('common.themeLight', 'Light'), icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
        )},
        { value: 'dark', label: t('common.themeDark', 'Dark'), icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
        )},
        { value: 'system', label: t('common.themeSystem', 'System'), icon: (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        )},
    ];

    return (
        <div className="theme-toggle" role="radiogroup" aria-label={t('common.theme', 'Theme')}>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    className={`theme-toggle-btn${preference === opt.value ? ' theme-toggle-btn--active' : ''}`}
                    role="radio"
                    aria-checked={preference === opt.value}
                    aria-label={opt.label}
                    title={opt.label}
                    onClick={() => setPreference(opt.value)}
                >
                    {opt.icon}
                </button>
            ))}
        </div>
    );
};

export default ThemeToggle;
