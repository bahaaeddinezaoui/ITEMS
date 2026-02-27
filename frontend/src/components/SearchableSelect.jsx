import { useState, useRef, useEffect } from 'react';

/**
 * A searchable dropdown select component
 * @param {Object} props
 * @param {string} props.value - The currently selected value
 * @param {function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of options with { value, label } shape
 * @param {string} props.placeholder - Placeholder text when no value selected
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 */
const SearchableSelect = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    disabled = false,
    required = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const filteredOptions = options.filter(opt =>
        opt.label?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange({ target: { value: option.value } });
        setIsOpen(false);
        setSearch('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
        } else if (e.key === 'Enter' && filteredOptions.length > 0) {
            handleSelect(filteredOptions[0]);
        } else if (e.key === 'ArrowDown' && isOpen) {
            e.preventDefault();
            // Focus next option could be implemented here
        }
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
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '38px',
                    opacity: disabled ? 0.7 : 1,
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.75rem',
                }}
            >
                <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
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
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        marginTop: 4,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        maxHeight: 250,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '0.4rem 0.6rem',
                                fontSize: 14,
                            }}
                        />
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filteredOptions.length === 0 ? (
                            <div style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option)}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        backgroundColor: String(option.value) === String(value) 
                                            ? 'var(--color-bg-secondary)' 
                                            : 'transparent',
                                        color: 'var(--color-text-primary)',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (String(option.value) !== String(value)) {
                                            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (String(option.value) !== String(value)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
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
