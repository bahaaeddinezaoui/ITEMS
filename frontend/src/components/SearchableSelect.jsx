import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A searchable dropdown select component
 * @param {Object} props
 * @param {string} props.value - The currently selected value
 * @param {function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of options with { value, label, searchText? } shape.
 *   - searchText: optional string used for filtering; if omitted, label is used
 * @param {string} props.placeholder - Placeholder text when no value selected
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.renderOption - Optional custom renderer: (option, isSelected) => ReactNode
 * @param {string} props.searchPlaceholder - Placeholder for the search input
 */
const SearchableSelect = ({
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    required = false,
    className = '',
    renderOption,
    searchPlaceholder,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const filteredOptions = options.filter(opt => {
        const text = opt.searchText || opt.label || '';
        return text.toLowerCase().includes(search.toLowerCase());
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [search]);

    const handleSelect = useCallback((option) => {
        onChange({ target: { value: option.value } });
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
    }, [onChange]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
            setHighlightedIndex(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightedIndex]);
            } else if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => Math.max(prev - 1, 0));
        }
    };

    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark style={{ backgroundColor: 'var(--color-warning)', color: 'var(--color-text-primary)', borderRadius: 2, padding: '0 1px' }}>
                    {text.slice(idx, idx + query.length)}
                </mark>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <div
            ref={containerRef}
            className={`searchable-select ${className}`}
            style={{ position: 'relative' }}
        >
            <div
                className="form-input"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '40px',
                    opacity: disabled ? 0.7 : 1,
                    backgroundColor: 'var(--color-bg-primary)',
                    border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.75rem',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: isOpen ? '0 0 0 3px rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)' : 'none',
                    outline: 'none',
                }}
            >
                <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    flex: 1,
                }}>
                    {selectedOption ? selectedOption.label : (placeholder || t('common.select'))}
                </span>
                <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                        marginLeft: 8,
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 2000,
                        marginTop: 4,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
                        maxHeight: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'fadeIn 0.15s ease-out',
                    }}
                >
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ position: 'relative' }}>
                            <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="var(--color-text-secondary)"
                                strokeWidth="2"
                                style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder || t('common.search')}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.45rem 0.6rem 0.45rem 2rem',
                                    fontSize: 14,
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--color-bg-primary)',
                                    color: 'var(--color-text-primary)',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>
                    {filteredOptions.length > 0 && (
                        <div style={{ padding: '0.25rem 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', borderTop: 'none', paddingLeft: '0.75rem' }}>
                            {filteredOptions.length} {filteredOptions.length === 1 ? 'result' : 'results'}
                        </div>
                    )}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filteredOptions.length === 0 ? (
                            <div style={{ padding: '1rem', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.5 }}>
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                {t('common.noResults')}
                            </div>
                        ) : (
                            filteredOptions.map((option, idx) => {
                                const isSelected = String(option.value) === String(value);
                                const isHighlighted = idx === highlightedIndex;
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            cursor: 'pointer',
                                            backgroundColor: isSelected
                                                ? 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)'
                                                : isHighlighted
                                                    ? 'var(--color-bg-secondary)'
                                                    : 'transparent',
                                            color: 'var(--color-text-primary)',
                                            borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                                            transition: 'background-color 0.1s, border-color 0.1s',
                                        }}
                                    >
                                        {renderOption ? renderOption(option, isSelected) : highlightText(option.label, search)}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input for form validation */}
            {required && (
                <input
                    type="hidden"
                    value={value}
                    required
                    tabIndex={-1}
                />
            )}
        </div>
    );
};

export default SearchableSelect;
