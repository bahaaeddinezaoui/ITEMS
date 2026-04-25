import PropTypes from 'prop-types';

export const SkeletonBlock = ({ className = '', style }) => {
    return <div className={`skeleton ${className}`.trim()} style={style} />;
};

SkeletonBlock.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
};

export const SkeletonCard = ({
    header = true,
    lines = 3,
    style,
    bodyStyle,
    className = '',
}) => {
    const safeLines = Math.max(0, Math.min(lines, 10));

    return (
        <div className={`card ${className}`.trim()} style={style}>
            <div className="card-body" style={bodyStyle}>
                {header && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <SkeletonBlock className="skeleton--avatar" />
                        <div style={{ flex: 1 }}>
                            <SkeletonBlock className="skeleton--line" style={{ width: '60%' }} />
                            <div style={{ height: 'var(--space-2)' }} />
                            <SkeletonBlock className="skeleton--line" style={{ width: '35%' }} />
                        </div>
                    </div>
                )}

                <div className="skeleton-stack">
                    {Array.from({ length: safeLines }).map((_, idx) => (
                        <SkeletonBlock
                            key={idx}
                            className="skeleton--line"
                            style={{ width: idx === safeLines - 1 ? '55%' : '100%' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

SkeletonCard.propTypes = {
    header: PropTypes.bool,
    lines: PropTypes.number,
    style: PropTypes.object,
    bodyStyle: PropTypes.object,
    className: PropTypes.string,
};

export const SkeletonCardList = ({
    count = 6,
    cardLines = 2,
    gap = 'var(--space-3)',
    bodyPadding = 'var(--space-6)',
    style,
}) => {
    const safeCount = Math.max(1, Math.min(count, 20));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
            {Array.from({ length: safeCount }).map((_, idx) => (
                <SkeletonCard key={idx} header lines={cardLines} bodyStyle={{ padding: bodyPadding }} />
            ))}
        </div>
    );
};

SkeletonCardList.propTypes = {
    count: PropTypes.number,
    cardLines: PropTypes.number,
    gap: PropTypes.string,
    bodyPadding: PropTypes.string,
    style: PropTypes.object,
};

export const SkeletonListRows = ({ count = 8, style, rowHeight = 56 }) => {
    const safeCount = Math.max(1, Math.min(count, 30));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
            {Array.from({ length: safeCount }).map((_, idx) => (
                <div
                    key={idx}
                    style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                        minHeight: rowHeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                    }}
                >
                    <SkeletonBlock className="skeleton--avatar" />
                    <div style={{ flex: 1 }}>
                        <SkeletonBlock className="skeleton--line" style={{ width: '45%' }} />
                        <div style={{ height: 'var(--space-2)' }} />
                        <SkeletonBlock className="skeleton--line" style={{ width: '70%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <SkeletonBlock className="skeleton--chip" />
                        <SkeletonBlock className="skeleton--chip" />
                    </div>
                </div>
            ))}
        </div>
    );
};

SkeletonListRows.propTypes = {
    count: PropTypes.number,
    style: PropTypes.object,
    rowHeight: PropTypes.number,
};

export const SkeletonKanban = ({ columns = 3, cardsPerColumn = 4 }) => {
    const safeCols = Math.max(1, Math.min(columns, 4));
    const safeCards = Math.max(1, Math.min(cardsPerColumn, 8));

    return (
        <div className="skeleton-kanban">
            {Array.from({ length: safeCols }).map((_, colIdx) => (
                <div key={colIdx} style={{ minWidth: 0 }}>
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                        marginBottom: 'var(--space-3)',
                    }}>
                        <SkeletonBlock className="skeleton--line" style={{ width: '55%' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {Array.from({ length: safeCards }).map((_, cardIdx) => (
                            <div key={cardIdx} style={{
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--space-4)',
                                overflow: 'hidden',
                            }}>
                                <SkeletonBlock className="skeleton--line" style={{ width: '40%' }} />
                                <div style={{ height: 'var(--space-2)' }} />
                                <SkeletonBlock className="skeleton--line" style={{ width: '75%' }} />
                                <div style={{ height: 'var(--space-3)' }} />
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <SkeletonBlock className="skeleton--chip" />
                                    <SkeletonBlock className="skeleton--chip" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

SkeletonKanban.propTypes = {
    columns: PropTypes.number,
    cardsPerColumn: PropTypes.number,
};
