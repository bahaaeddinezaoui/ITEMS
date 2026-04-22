import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { changeLanguage } from '../i18n/index.js';

const LanguageSwitcher = ({ className = '' }) => {
    const { i18n, t } = useTranslation();
    const currentLang = i18n.language;

    const toggleLanguage = () => {
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 text-sm font-medium ${className}`}
            title={t('common.language')}
        >
            <Globe className="w-4 h-4" />
            <span>{t('common.language')}</span>
        </button>
    );
};

export default LanguageSwitcher;
