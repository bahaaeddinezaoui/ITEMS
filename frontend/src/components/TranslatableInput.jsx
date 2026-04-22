import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Plus, X } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'ar', label: 'العربية', dir: 'rtl' },
];

/**
 * TranslatableInput - A reusable component for entering data in multiple languages.
 *
 * Props:
 *   - label: The field label (e.g., "Type Name")
 *   - baseFieldName: The base model field name (e.g., "asset_type_label")
 *   - value: The current value for the base field
 *   - onChange: Handler for the base field change: (e.g., (name, value) => ...)
 *   - translations: Object of { language_code: value } for translations (e.g., { ar: "حاسوب" })
 *   - onTranslationChange: Handler for translation changes: (langCode, value) => ...
 *   - placeholder: Placeholder text for the base field
 *   - required: Whether the base field is required
 *   - inputType: Input type (default: "text", or "select" for dropdown)
 *   - options: Array of { value, label } for select mode
 *   - className: Additional CSS class for inputs
 *   - style: Additional style for the wrapper
 */
const TranslatableInput = ({
    label,
    baseFieldName,
    value,
    onChange,
    translations = {},
    onTranslationChange,
    placeholder,
    required = false,
    inputType = 'text',
    options = [],
    className = 'form-input',
    style,
}) => {
    const { t } = useTranslation();
    const [showTranslations, setShowTranslations] = useState(false);
    const [activeLang, setActiveLang] = useState(null);

    // Determine which languages already have values
    const existingLangs = SUPPORTED_LANGUAGES.filter(
        (lang) => lang.code !== 'en' && translations[lang.code]
    );

    const handleAddLanguage = (langCode) => {
        setActiveLang(langCode);
        setShowTranslations(true);
    };

    const handleRemoveTranslation = (langCode) => {
        if (onTranslationChange) {
            onTranslationChange(langCode, '');
        }
    };

    const toggleTranslationsPanel = () => {
        setShowTranslations(!showTranslations);
    };

    return (
        <div className="form-group" style={style}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: inputType === 'select' ? '2px' : 'var(--space-2)' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: '600', fontSize: inputType === 'select' ? '12px' : undefined }}>{label}</label>
                    <button
                        type="button"
                        onClick={toggleTranslationsPanel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            background: showTranslations ? 'var(--color-accent-primary)' : 'transparent',
                            color: showTranslations ? '#fff' : 'var(--color-text-secondary)',
                            border: `1px solid ${showTranslations ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.15s ease',
                        }}
                        title={t('translations.addTranslation', 'Add translation')}
                    >
                        <Globe size={10} />
                        <span>{t('translations.translate', 'Translate')}</span>
                    </button>
                </div>
            )}

            {/* Base language input */}
            <div style={{ position: 'relative' }}>
                {inputType === 'select' ? (
                    <select
                        name={baseFieldName}
                        value={value || ''}
                        onChange={(e) => onChange && onChange(baseFieldName, e.target.value)}
                        required={required}
                        className={className}
                        style={{ height: '32px', appearance: 'auto', fontSize: '13px', padding: '0 0.5rem' }}
                    >
                        <option value="">{placeholder || `-- ${label || ''} --`}</option>
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={inputType}
                        name={baseFieldName}
                        value={value || ''}
                        onChange={(e) => onChange && onChange(baseFieldName, e.target.value)}
                        placeholder={placeholder}
                        required={required}
                        className={className}
                        style={{ height: '44px' }}
                    />
                )}
                {inputType !== 'select' && (
                <span
                    style={{
                        position: 'absolute',
                        right: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--color-text-muted)',
                        background: 'var(--color-bg-secondary)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                    }}
                >
                    EN
                </span>
                )}
            </div>

            {/* Translation inputs panel */}
            {showTranslations && (
                <div
                    style={{
                        marginTop: 'var(--space-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        padding: 'var(--space-3)',
                        background: 'var(--color-bg-secondary)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <Globe size={14} style={{ color: 'var(--color-accent-primary)' }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                            {t('translations.translations', 'Translations')}
                        </span>
                    </div>

                    {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en').map((lang) => {
                        const isActive = activeLang === lang.code || translations[lang.code];
                        return (
                            <div key={lang.code} style={{ marginBottom: 'var(--space-2)' }}>
                                {isActive ? (
                                    <div style={{ position: 'relative' }}>
                                        {inputType === 'select' ? (
                                            <select
                                                value={translations[lang.code] || ''}
                                                onChange={(e) => onTranslationChange && onTranslationChange(lang.code, e.target.value)}
                                                className={className}
                                                dir={lang.dir}
                                                style={{ height: '32px', appearance: 'auto', fontSize: '13px', padding: '0 0.5rem' }}
                                            >
                                                <option value="">{placeholder || `-- ${label || ''} --`}</option>
                                                {options.map((opt) => (
                                                    <option key={opt.value} value={opt.label_ar || opt.label}>{opt.label_ar || opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={inputType}
                                                value={translations[lang.code] || ''}
                                                onChange={(e) => onTranslationChange && onTranslationChange(lang.code, e.target.value)}
                                                placeholder={`${label || ''} (${lang.label})`}
                                                className={className}
                                                dir={lang.dir}
                                                style={{
                                                    height: '44px',
                                                    paddingLeft: 'var(--space-3)',
                                                    paddingRight: 'var(--space-8)',
                                                }}
                                            />
                                        )}
                                        <span
                                            style={{
                                                position: 'absolute',
                                                right: lang.dir === 'rtl' ? 'auto' : 'var(--space-3)',
                                                left: lang.dir === 'rtl' ? 'var(--space-3)' : 'auto',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: 'var(--color-text-muted)',
                                                background: 'var(--color-bg-card)',
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {lang.code.toUpperCase()}
                                        </span>
                                        {translations[lang.code] && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTranslation(lang.code)}
                                                style={{
                                                    position: 'absolute',
                                                    left: lang.dir === 'rtl' ? 'auto' : 'var(--space-1)',
                                                    right: lang.dir === 'rtl' ? 'var(--space-1)' : 'auto',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--color-text-muted)',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                                title={t('translations.remove', 'Remove translation')}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleAddLanguage(lang.code)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            width: '100%',
                                            padding: 'var(--space-2) var(--space-3)',
                                            background: 'transparent',
                                            border: `1px dashed var(--color-border)`,
                                            borderRadius: '6px',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <Plus size={14} />
                                        <span>{t('translations.addIn', 'Add in {{lang}}', { lang: lang.label })}</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TranslatableInput;
