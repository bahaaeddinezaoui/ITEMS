import { useEffect, useMemo, useState } from 'react';
import { problemReportService } from '../services/api';
import { SkeletonCardList } from '../components/SkeletonCard';
import { useTranslation } from 'react-i18next';
import { FileText, Clock, MapPin, Search, X } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';

const TYPE_COLORS = {
    asset: { border: 'rgba(99, 102, 241, 0.4)', bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', accent: '#6366f1' },
    stock_item: { border: 'rgba(14, 165, 233, 0.4)', bg: 'rgba(14, 165, 233, 0.12)', text: '#38bdf8', accent: '#0ea5e9' },
    consumable: { border: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.12)', text: '#c084fc', accent: '#a855f7' },
};

const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(8px)',
};

const typeChipStyle = (type) => {
    const c = TYPE_COLORS[type] || TYPE_COLORS.asset;
    return { ...chipStyle, border: `1px solid ${c.border}`, background: c.bg, color: c.text, fontWeight: 600 };
};

const getTypeAccent = (type) => (TYPE_COLORS[type] || TYPE_COLORS.asset).accent;

const TYPE_KEY_MAP = {
    asset: 'reports.asset',
    stock_item: 'reports.stockItem',
    consumable: 'reports.consumable',
};

const getTypeLabel = (type, t) => {
    const key = TYPE_KEY_MAP[type];
    return key ? t(key) : (type || '').replace('_', ' ');
};

const formatRelativeTime = (iso, t) => {
    if (!iso) return '';
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return '';
    const diff = Date.now() - ts;
    const mins = Math.round(diff / 60000);
    if (mins < 1) return t('common.justNow');
    if (mins < 60) return `${mins}m`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.round(hours / 24);
    if (days < 14) return `${days}d`;
    return new Date(iso).toLocaleDateString();
};

const MySubmittedReportsPage = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [query, setQuery] = useState('');

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await problemReportService.getMine();
            setReports(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || t('mySubmittedReports.loadError');
            setError(typeof msg === 'string' ? msg : t('mySubmittedReports.loadError'));
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredReports = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const list = Array.isArray(reports) ? reports.slice() : [];
        const filtered = list.filter((report) => {
            if (typeFilter && report.item_type !== typeFilter) {
                return false;
            }
            if (!normalizedQuery) {
                return true;
            }
            const dateText = report.report_datetime ? new Date(report.report_datetime).toLocaleString() : '';
            const haystack = [
                String(report.report_id || ''),
                String(report.item_id || ''),
                String(report.item_type || ''),
                String(report.owner_observation || ''),
                String(dateText || ''),
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedQuery);
        });
        filtered.sort((a, b) => {
            const ad = a?.report_datetime ? new Date(a.report_datetime).getTime() : 0;
            const bd = b?.report_datetime ? new Date(b.report_datetime).getTime() : 0;
            return bd - ad;
        });
        return filtered;
    }, [reports, typeFilter, query]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><FileText size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('mySubmittedReports.title')}</h1>
                <p className="page-subtitle">{t('mySubmittedReports.subtitle')}</p>
            </div>

            {error && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>{error}</div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {t('reports.shown', { count: filteredReports.length })}
                </div>
                <button className="btn btn-secondary" onClick={loadReports} disabled={loading}>
                    {t('common.refresh')}
                </button>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                        <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{t('mySubmittedReports.submittedReports')}</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                            {t('reports.shown', { count: filteredReports.length })}
                        </div>
                    </div>
                </div>

                <div style={{ padding: 'var(--space-4)' }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                            <SkeletonCardList count={6} cardLines={3} gap="var(--space-4)" bodyPadding="var(--space-6)" style={{ display: 'contents' }} />
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('mySubmittedReports.noReports')}</h3>
                            <p className="empty-state-text">{t('mySubmittedReports.noReportsDesc')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                            {filteredReports.map((report) => {
                                const accentColor = getTypeAccent(report.item_type);
                                const typeLabel = getTypeLabel(report.item_type, t);
                                const rel = formatRelativeTime(report.report_datetime, t);
                                const abs = report.report_datetime ? new Date(report.report_datetime).toLocaleString() : '-';
                                const observation = (report.owner_observation || '').trim() || '—';

                                const itemName = report.item_name || null;
                                const itemBrand = report.item_brand_name || null;
                                const itemModel = report.item_model_name || null;
                                const itemInventory = report.item_inventory_number || null;
                                const itemSerial = report.item_serial_number || null;
                                const itemServiceTag = report.item_service_tag || null;
                                const itemStatus = report.item_status || null;
                                const itemLocation = report.item_current_location || null;
                                const itemLocationType = report.item_current_location_type || null;

                                return (
                                    <div
                                        key={`${report.item_type}-${report.report_id}`}
                                        className="card"
                                        style={{ position: 'relative', overflow: 'hidden', borderLeft: `3px solid ${accentColor}` }}
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 50%)`,
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={typeChipStyle(report.item_type)}>
                                                        {typeLabel || t('reports.item')}
                                                    </span>
                                                    <span style={chipStyle}>{t('mySubmittedReports.reportHash', { id: report.report_id })}</span>
                                                </div>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', fontWeight: 500 }} title={abs}>
                                                    {rel || abs}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 'var(--space-4)' }}>
                                                {itemName && (
                                                    <div style={{
                                                        fontSize: 'var(--font-size-lg)',
                                                        fontWeight: 700,
                                                        color: 'var(--color-text-primary)',
                                                        lineHeight: 1.3,
                                                        marginBottom: 'var(--space-2)',
                                                    }}>
                                                        {itemName}
                                                    </div>
                                                )}

                                                {(itemBrand || itemModel) && (
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '0.75rem',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        marginBottom: 'var(--space-2)',
                                                    }}>
                                                        {itemBrand && (
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                                                {itemBrand}
                                                            </span>
                                                        )}
                                                        {itemBrand && itemModel && (
                                                            <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                                                        )}
                                                        {itemModel && (
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                                {itemModel}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span style={{ ...chipStyle, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {t('mySubmittedReports.itemHash', { type: typeLabel, id: report.item_id })}
                                                    </span>
                                                    {itemInventory && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            {t('myItems.inv')}: {itemInventory}
                                                        </span>
                                                    )}
                                                    {itemSerial && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            {t('myItems.sn')}: {itemSerial}
                                                        </span>
                                                    )}
                                                    {itemServiceTag && (
                                                        <span style={{ ...chipStyle, fontSize: '0.7rem' }}>
                                                            {t('mySubmittedReports.tag')}: {itemServiceTag}
                                                        </span>
                                                    )}
                                                    {itemStatus && (
                                                        <span style={{
                                                            ...chipStyle,
                                                            fontSize: '0.7rem',
                                                            border: `1px solid ${accentColor}40`,
                                                            color: accentColor,
                                                        }}>
                                                            {itemStatus}
                                                        </span>
                                                    )}
                                                </div>

                                                {itemLocation && (
                                                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <MapPin size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                            {itemLocation}
                                                            {itemLocationType && (
                                                                <span style={{ color: 'var(--color-text-muted)' }}> ({itemLocationType})</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{
                                                marginTop: 'var(--space-4)',
                                                padding: 'var(--space-3) var(--space-4)',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--glass-border)',
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {t('mySubmittedReports.observation')}
                                                    </div>
                                                </div>
                                                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.5, fontSize: '0.95rem' }}>
                                                    {observation.length > 120 ? `${observation.slice(0, 120)}…` : observation}
                                                </div>
                                            </div>

                                            <div style={{
                                                marginTop: 'var(--space-5)',
                                                paddingTop: 'var(--space-4)',
                                                borderTop: '1px solid var(--glass-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-2)',
                                            }}>
                                                <Clock size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }} title={abs}>
                                                    {abs}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <FilterSortFAB hasActiveFilters={!!query.trim() || !!typeFilter}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('mySubmittedReports.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: query ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {query && (
                            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('mySubmittedReports.type')}</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all')}</option>
                            <option value="asset">{t('reports.asset')}</option>
                            <option value="stock_item">{t('reports.stockItem')}</option>
                            <option value="consumable">{t('reports.consumable')}</option>
                        </select>
                    </div>
                    {(query.trim() || typeFilter) && (
                        <button onClick={() => { setQuery(''); setTypeFilter(''); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </>
    );
};

export default MySubmittedReportsPage;
