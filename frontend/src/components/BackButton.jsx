import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const BackButton = ({ onClick, label }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const ariaLabel = label || t('common.back');

    return (
        <button
            className="btn btn-secondary"
            onClick={onClick}
            title={ariaLabel}
            aria-label={ariaLabel}
            style={{ padding: 'var(--space-2) var(--space-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {isRTL ? <ChevronRight size={18} /> : <ArrowLeft size={18} />}
        </button>
    );
};

export default BackButton;
