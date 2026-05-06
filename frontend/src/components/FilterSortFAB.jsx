import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import PropTypes from 'prop-types';

const FilterSortFAB = ({ children, hasActiveFilters = false }) => {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const fabRef = useRef(null);

    const toggle = useCallback(() => setOpen(prev => !prev), []);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (
                panelRef.current && !panelRef.current.contains(e.target) &&
                fabRef.current && !fabRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    return createPortal(
        <>
            {/* Floating Action Button */}
            <button
                ref={fabRef}
                onClick={toggle}
                aria-label={open ? 'Close filters' : 'Open filters'}
                style={{
                    position: 'fixed',
                    bottom: 'var(--space-10)',
                    right: 'var(--space-10)',
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: open
                        ? 'var(--color-accent-primary)'
                        : hasActiveFilters
                            ? 'var(--gradient-primary)'
                            : 'var(--color-bg-secondary)',
                    color: open || hasActiveFilters ? '#fff' : 'var(--color-text-secondary)',
                    boxShadow: open
                        ? 'var(--shadow-glow)'
                        : hasActiveFilters
                            ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                            : 'var(--shadow-lg)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050,
                    transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                    if (!open) {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!open) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = hasActiveFilters
                            ? '0 4px 20px rgba(99, 102, 241, 0.4)'
                            : 'var(--shadow-lg)';
                    }
                }}
            >
                {open ? <X size={22} /> : <SlidersHorizontal size={22} />}
                {/* Active filter indicator dot */}
                {hasActiveFilters && !open && (
                    <span style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--color-accent-primary)',
                        border: '2px solid var(--color-bg-primary)',
                        animation: 'pulse-dot 2s ease-in-out infinite',
                    }} />
                )}
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'var(--overlay-bg)',
                        backdropFilter: 'var(--overlay-backdrop)',
                        WebkitBackdropFilter: 'var(--overlay-backdrop)',
                        zIndex: 1040,
                        animation: 'fab-backdrop-in var(--transition-fast) ease forwards',
                    }}
                />
            )}

            {/* Panel */}
            <div
                ref={panelRef}
                style={{
                    position: 'fixed',
                    bottom: 100,
                    right: 'var(--space-10)',
                    width: 'min(420px, calc(100vw - var(--space-12))',
                    maxHeight: 'calc(100vh - 120px)',
                    overflowY: 'auto',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1050,
                    transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'auto' : 'none',
                    transition: 'all var(--transition-base)',
                    padding: 'var(--space-5)',
                }}
            >
                {open && children}
            </div>

            {/* Keyframes injected once */}
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }
                @keyframes fab-backdrop-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>,
        document.body
    );
};

FilterSortFAB.propTypes = {
    children: PropTypes.node,
    hasActiveFilters: PropTypes.bool,
};

export default FilterSortFAB;
