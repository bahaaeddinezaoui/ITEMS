import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ModalFeedback = ({ type, message, onClose, duration = 4000 }) => {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (type && message) {
            setVisible(true);
            setLeaving(false);
            if (duration > 0) {
                const timer = setTimeout(() => {
                    setLeaving(true);
                    setTimeout(() => {
                        setVisible(false);
                        setLeaving(false);
                        onClose?.();
                    }, 300);
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            setVisible(false);
            setLeaving(false);
        }
    }, [type, message, duration, onClose]);

    const handleClose = useCallback(() => {
        setLeaving(true);
        setTimeout(() => {
            setVisible(false);
            setLeaving(false);
            onClose?.();
        }, 300);
    }, [onClose]);

    if (!visible || !type) return null;

    const isSuccess = type === 'success';
    const bgColor = isSuccess
        ? 'rgba(16, 185, 129, 0.12)'
        : 'rgba(239, 68, 68, 0.12)';
    const borderColor = isSuccess
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(239, 68, 68, 0.3)';
    const textColor = isSuccess
        ? 'var(--color-success)'
        : 'var(--color-error)';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                color: textColor,
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                animation: leaving
                    ? 'modalFeedbackSlideOut 300ms ease forwards'
                    : 'modalFeedbackSlideIn 300ms ease forwards',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>
            <button
                onClick={handleClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    opacity: 0.7,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default ModalFeedback;
