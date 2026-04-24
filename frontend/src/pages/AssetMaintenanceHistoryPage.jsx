import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react';
import { assetService, maintenanceService, maintenanceStepService } from '../services/api';

const AssetMaintenanceHistoryPage = () => {
    const { t, i18n } = useTranslation();
    const [assets, setAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [stepsByMaintenance, setStepsByMaintenance] = useState({});
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState('');
    const [historyQuery, setHistoryQuery] = useState('');
    const [debouncedHistoryQuery, setDebouncedHistoryQuery] = useState('');
    const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState('');
    const [stepStatusFilter, setStepStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortKey, setSortKey] = useState('start_datetime');
    const [sortDir, setSortDir] = useState('desc');
    const [openMaintenanceIds, setOpenMaintenanceIds] = useState({});

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedHistoryQuery(historyQuery);
        }, 350);
        return () => clearTimeout(handle);
    }, [historyQuery]);

    useEffect(() => {
        const loadAssets = async () => {
            setLoadingAssets(true);
            setError('');
            try {
                const data = await assetService.getAll({ page_size: 1000 });
                setAssets(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(t('assetMaintenanceHistory.loadAssetsError') + ': ' + (err?.message || 'unknown error'));
                setAssets([]);
            } finally {
                setLoadingAssets(false);
            }
        };
        loadAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return [];
        return (assets || []).filter(a => {
            const name = (a.asset_name || '').toLowerCase();
            const inv = (a.asset_inventory_number || '').toLowerCase();
            const sn = (a.asset_serial_number || '').toLowerCase();
            return name.includes(q) || inv.includes(q) || sn.includes(q);
        }).slice(0, 20);
    }, [assets, searchQuery]);

    const loadHistory = async (asset) => {
        if (!asset) return;
        setLoadingHistory(true);
        setError('');
        setMaintenances([]);
        setStepsByMaintenance({});
        setHistoryQuery('');
        setDebouncedHistoryQuery('');
        setMaintenanceStatusFilter('');
        setStepStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setSortKey('start_datetime');
        setSortDir('desc');
        setOpenMaintenanceIds({});
        try {
            const allMaintenances = await maintenanceService.getAll();
            const forAsset = (Array.isArray(allMaintenances) ? allMaintenances : []).filter(
                m => String(m.asset) === String(asset.asset_id) || String(m.asset_id) === String(asset.asset_id)
            );
            // Fetch steps per maintenance
            const stepsEntries = await Promise.all(
                forAsset.map(async (m) => {
                    try {
                        const steps = await maintenanceStepService.getAll({ maintenance: m.maintenance_id });
                        return [m.maintenance_id, Array.isArray(steps) ? steps : []];
                    } catch {
                        return [m.maintenance_id, []];
                    }
                })
            );
            const stepsMap = {};
            stepsEntries.forEach(([mid, steps]) => { stepsMap[mid] = steps; });
            setMaintenances(forAsset);
            setStepsByMaintenance(stepsMap);
            const initialOpen = {};
            forAsset.slice(0, 3).forEach((m) => { initialOpen[m.maintenance_id] = true; });
            setOpenMaintenanceIds(initialOpen);
        } catch (err) {
            setError(t('assetMaintenanceHistory.loadHistoryError') + ': ' + (err?.message || 'unknown error'));
        } finally {
            setLoadingHistory(false);
        }
    };

    const formatDateTime = (dt) => {
        if (!dt) return '-';
        const d = new Date(dt);
        if (Number.isNaN(d.getTime())) return String(dt);
        const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
        return d.toLocaleString(locale);
    };

    const normalize = (v) => String(v ?? '').trim().toLowerCase();

    const getAssetStatusLabel = (a) => {
        const lang = i18n.language;
        const sAr = a?.asset_status_ar;
        const sEn = a?.asset_status_en;
        if (lang === 'ar') return sAr || sEn || a?.asset_status || '-';
        return sEn || sAr || a?.asset_status || '-';
    };

    const getMaintenanceStatusLabel = (m) => {
        const lang = i18n.language;
        const sAr = m?.maintenance_status_ar;
        const sEn = m?.maintenance_status_en;
        if (lang === 'ar') return sAr || sEn || m?.maintenance_status || t('common.unknown');
        return sEn || sAr || m?.maintenance_status || t('common.unknown');
    };

    const getStepStatusLabel = (s) => {
        const lang = i18n.language;
        const sAr = s?.maintenance_step_status_ar;
        const sEn = s?.maintenance_step_status_en;
        if (lang === 'ar') return sAr || sEn || s?.maintenance_step_status || '-';
        return sEn || sAr || s?.maintenance_step_status || '-';
    };

    const getStepDescription = (s) => (
        s?.maintenance_typical_step_label
        || (s?.maintenance_typical_step && typeof s.maintenance_typical_step === 'object'
            ? (s.maintenance_typical_step.description || s.maintenance_typical_step.label || null)
            : (typeof s?.maintenance_typical_step === 'string' ? s.maintenance_typical_step : null))
        || '-'
    );

    const getPersonLabel = (s) => (
        s?.person_name
        || (s?.person && typeof s.person === 'object'
            ? [s.person.first_name, s.person.last_name].filter(Boolean).join(' ').trim() || null
            : (typeof s?.person === 'string' ? s.person : null))
        || '-'
    );

    const maintenanceStatusMatches = (m, filter) => {
        const f = normalize(filter);
        if (!f) return true;
        const raw = [m?.maintenance_status, m?.maintenance_status_en, m?.maintenance_status_ar]
            .map(normalize)
            .filter(Boolean)
            .join(' ');
        const label = normalize(getMaintenanceStatusLabel(m));
        return (raw + ' ' + label).includes(f);
    };

    const stepStatusMatches = (s, filter) => {
        const f = normalize(filter);
        if (!f) return true;
        const raw = [s?.maintenance_step_status, s?.maintenance_step_status_en, s?.maintenance_step_status_ar]
            .map(normalize)
            .filter(Boolean)
            .join(' ');
        const label = normalize(getStepStatusLabel(s));
        return (raw + ' ' + label).includes(f);
    };

    const maintenanceStatuses = useMemo(() => {
        const set = new Set();
        (maintenances || []).forEach((m) => {
            if (m?.maintenance_status) set.add(String(m.maintenance_status));
            if (m?.maintenance_status_en) set.add(String(m.maintenance_status_en));
            if (m?.maintenance_status_ar) set.add(String(m.maintenance_status_ar));
        });
        return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }, [maintenances]);

    const stepStatuses = useMemo(() => {
        const set = new Set();
        Object.values(stepsByMaintenance || {}).forEach((steps) => {
            (Array.isArray(steps) ? steps : []).forEach((s) => {
                if (s?.maintenance_step_status) set.add(String(s.maintenance_step_status));
                if (s?.maintenance_step_status_en) set.add(String(s.maintenance_step_status_en));
                if (s?.maintenance_step_status_ar) set.add(String(s.maintenance_step_status_ar));
            });
        });
        return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }, [stepsByMaintenance]);

    const clearHistoryFilters = () => {
        setHistoryQuery('');
        setDebouncedHistoryQuery('');
        setMaintenanceStatusFilter('');
        setStepStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setSortKey('start_datetime');
        setSortDir('desc');
    };

    const maintenanceOverlapsDateRange = (m, fromYmd, toYmd) => {
        if (!fromYmd && !toYmd) return true;

        const parseDateTime = (v) => {
            const d = v ? new Date(v) : null;
            return d && !Number.isNaN(d.getTime()) ? d : null;
        };

        const start = parseDateTime(m?.start_datetime);
        const end = parseDateTime(m?.end_datetime) || start;

        if (!start && !end) return false;

        const from = fromYmd ? new Date(`${fromYmd}T00:00:00`) : null;
        const to = toYmd ? new Date(`${toYmd}T23:59:59`) : null;

        const startMs = start ? start.getTime() : 0;
        const endMs = end ? end.getTime() : startMs;
        const fromMs = from ? from.getTime() : Number.NEGATIVE_INFINITY;
        const toMs = to ? to.getTime() : Number.POSITIVE_INFINITY;

        return startMs <= toMs && endMs >= fromMs;
    };

    const filteredSortedMaintenances = useMemo(() => {
        const q = normalize(debouncedHistoryQuery);
        const mStatus = maintenanceStatusFilter;
        const sStatus = stepStatusFilter;
        const from = (dateFrom || '').trim();
        const to = (dateTo || '').trim();

        const result = (maintenances || []).filter((m) => {
            if (!maintenanceStatusMatches(m, mStatus)) return false;
            if (!maintenanceOverlapsDateRange(m, from, to)) return false;

            const steps = stepsByMaintenance?.[m.maintenance_id] || [];
            const hasStepStatus = (Array.isArray(steps) ? steps : []).some((s) => stepStatusMatches(s, sStatus));
            if (!hasStepStatus) return false;

            if (!q) return true;
            const maintText = [
                m?.maintenance_id,
                getMaintenanceStatusLabel(m),
                m?.notes,
                m?.description,
                m?.maintenance_type,
                m?.maintenance_type_en,
                m?.maintenance_type_ar,
                m?.start_datetime,
                m?.end_datetime,
            ].map(normalize).join(' ');

            const stepText = (Array.isArray(steps) ? steps : []).map((s) => [
                getStepDescription(s),
                getStepStatusLabel(s),
                getPersonLabel(s),
                s?.notes,
            ].map(normalize).join(' ')).join(' ');

            return (maintText + ' ' + stepText).includes(q);
        });

        const toDate = (v) => {
            const d = v ? new Date(v) : null;
            return d && !Number.isNaN(d.getTime()) ? d : null;
        };

        const sorted = [...result].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortKey === 'end_datetime') {
                const da = toDate(a?.end_datetime) || toDate(a?.start_datetime);
                const db = toDate(b?.end_datetime) || toDate(b?.start_datetime);
                const ta = da ? da.getTime() : 0;
                const tb = db ? db.getTime() : 0;
                return (ta - tb) * dir;
            }
            if (sortKey === 'start_datetime') {
                const da = toDate(a?.start_datetime);
                const db = toDate(b?.start_datetime);
                const ta = da ? da.getTime() : 0;
                const tb = db ? db.getTime() : 0;
                return (ta - tb) * dir;
            }
            if (sortKey === 'maintenance_id') {
                const ia = Number(a?.maintenance_id ?? 0);
                const ib = Number(b?.maintenance_id ?? 0);
                return (ia - ib) * dir;
            }
            return 0;
        });

        return sorted;
    }, [maintenances, stepsByMaintenance, debouncedHistoryQuery, maintenanceStatusFilter, stepStatusFilter, dateFrom, dateTo, sortKey, sortDir, i18n.language]);

    const getStatusBadge = (status) => {
        if (!status) return 'badge';
        const s = status.toLowerCase();
        if (s.includes('done') || s.includes('completed') || s === 'closed') return 'badge badge-success';
        if (s.includes('fail') || s.includes('cancel')) return 'badge badge-error';
        if (s.includes('progress') || s.includes('start')) return 'badge badge-info';
        if (s.includes('pending') || s.includes('wait')) return 'badge badge-warning';
        return 'badge';
    };

    const toggleMaintenanceOpen = (maintenanceId) => {
        setOpenMaintenanceIds((prev) => ({
            ...(prev || {}),
            [maintenanceId]: !prev?.[maintenanceId],
        }));
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><History size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('assetMaintenanceHistory.title')}</h1>
                <p className="page-subtitle">{t('assetMaintenanceHistory.subtitle')}</p>
            </div>

            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">{t('assetMaintenanceHistory.searchAsset')}</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder={t('assetMaintenanceHistory.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loadingAssets ? (
                <div className="loading-state">
                    <div className="loading-spinner" />
                    <span>{t('assetMaintenanceHistory.loadingAssets')}</span>
                </div>
            ) : null}

            {!selectedAsset && filteredAssets.length > 0 && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                        <h2 className="card-title">{t('assetMaintenanceHistory.matchingAssets')}</h2>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            {t('common.total')}: {filteredAssets.length}
                        </div>
                    </div>
                    <div className="card-body" style={{ paddingTop: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                            {filteredAssets.map((a) => (
                                <button
                                    key={a.asset_id}
                                    type="button"
                                    className="card"
                                    onClick={() => { setSelectedAsset(a); loadHistory(a); }}
                                    style={{
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                    }}
                                >
                                    <div className="card-header" style={{ paddingBottom: 'var(--space-3)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="card-title" style={{ marginBottom: 'var(--space-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {a.asset_name || t('assets.unnamedAsset')}
                                                </div>
                                                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                    <span style={{ fontFamily: 'monospace' }}>{a.asset_inventory_number || '-'}</span>
                                                    {' • '}
                                                    <span style={{ fontFamily: 'monospace' }}>{a.asset_serial_number || '-'}</span>
                                                </div>
                                            </div>
                                            <span className={getStatusBadge(a.asset_status)} style={{ flex: '0 0 auto' }}>
                                                {getAssetStatusLabel(a)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body" style={{ paddingTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            {t('common.view')}
                                        </div>
                                        <span className="btn btn-primary" style={{ pointerEvents: 'none' }}>{t('assetMaintenanceHistory.viewHistory')}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedAsset && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 className="card-title">
                            {t('assetMaintenanceHistory.historyFor')}: {selectedAsset.asset_name || `${t('assets.asset')} ${selectedAsset.asset_id}`}
                            {selectedAsset.asset_inventory_number ? (
                                <span style={{ marginLeft: 'var(--space-3)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                                    ({selectedAsset.asset_inventory_number})
                                </span>
                            ) : null}
                        </h2>
                        <button className="btn" onClick={() => { setSelectedAsset(null); setMaintenances([]); setStepsByMaintenance({}); }}>
                            {t('assetMaintenanceHistory.changeAsset')}
                        </button>
                    </div>
                    {loadingHistory ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <span>{t('assetMaintenanceHistory.loadingHistory')}</span>
                        </div>
                    ) : error ? (
                        <div className="card-body">
                            <div className="error-message">{error}</div>
                        </div>
                    ) : maintenances.length === 0 ? (
                        <div className="card-body">
                            <div className="empty-state">{t('assetMaintenanceHistory.noMaintenances')}</div>
                        </div>
                    ) : (
                        <div className="card-body">
                            <div className="filters-bar" style={{ marginBottom: 'var(--space-4)' }}>
                                <div className="filter-item" style={{ flex: 2, minWidth: 260 }}>
                                    <label className="form-label">{t('common.search')}</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={historyQuery}
                                        placeholder={t('common.search')}
                                        onChange={(e) => setHistoryQuery(e.target.value)}
                                    />
                                </div>

                                <div className="filter-item" style={{ minWidth: 200 }}>
                                    <label className="form-label">{t('maintenances.startDate')}</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>

                                <div className="filter-item" style={{ minWidth: 200 }}>
                                    <label className="form-label">{t('maintenances.endDate')}</label>
                                    <input
                                        className="form-input"
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>

                                <div className="filter-item" style={{ minWidth: 220 }}>
                                    <label className="form-label">{t('common.status')}</label>
                                    <select
                                        className="form-input"
                                        value={maintenanceStatusFilter}
                                        onChange={(e) => setMaintenanceStatusFilter(e.target.value)}
                                    >
                                        <option value="">{t('common.all')}</option>
                                        {maintenanceStatuses.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-item" style={{ minWidth: 220 }}>
                                    <label className="form-label">{t('maintenances.steps')} {t('common.status')}</label>
                                    <select
                                        className="form-input"
                                        value={stepStatusFilter}
                                        onChange={(e) => setStepStatusFilter(e.target.value)}
                                    >
                                        <option value="">{t('common.all')}</option>
                                        {stepStatuses.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="filter-item" style={{ minWidth: 200 }}>
                                    <label className="form-label">{t('common.sortBy')}</label>
                                    <select
                                        className="form-input"
                                        value={sortKey}
                                        onChange={(e) => setSortKey(e.target.value)}
                                    >
                                        <option value="start_datetime">{t('maintenances.startDate')}</option>
                                        <option value="end_datetime">{t('maintenances.endDate')}</option>
                                        <option value="maintenance_id">{t('common.id')}</option>
                                    </select>
                                </div>

                                <div className="filter-item" style={{ minWidth: 160 }}>
                                    <label className="form-label">{t('common.sortBy')}</label>
                                    <select
                                        className="form-input"
                                        value={sortDir}
                                        onChange={(e) => setSortDir(e.target.value)}
                                    >
                                        <option value="asc">{t('common.ascending')}</option>
                                        <option value="desc">{t('common.descending')}</option>
                                    </select>
                                </div>

                                <div className="filter-item" style={{ alignSelf: 'flex-end' }}>
                                    <button className="btn" onClick={clearHistoryFilters}>
                                        {t('common.clearFilters')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                <div className="card" style={{ border: '1px solid var(--color-border)' }}>
                                    <div className="card-body">
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{t('maintenances.title')}</div>
                                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{filteredSortedMaintenances.length}</div>
                                    </div>
                                </div>
                                <div className="card" style={{ border: '1px solid var(--color-border)' }}>
                                    <div className="card-body">
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{t('maintenances.steps')}</div>
                                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                                            {filteredSortedMaintenances.reduce((acc, m) => acc + ((stepsByMaintenance?.[m.maintenance_id] || []).length), 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filteredSortedMaintenances.length === 0 ? (
                                <div className="empty-state">{t('common.noResults')}</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    {filteredSortedMaintenances.map((m) => {
                                        const steps = stepsByMaintenance[m.maintenance_id] || [];
                                        const isOpen = !!openMaintenanceIds?.[m.maintenance_id];
                                        const statusLabel = getMaintenanceStatusLabel(m);
                                        return (
                                            <div key={m.maintenance_id} className="card" style={{ border: '1px solid var(--color-border)' }}>
                                                <button
                                                    type="button"
                                                    className="card-header"
                                                    onClick={() => toggleMaintenanceOpen(m.maintenance_id)}
                                                    aria-expanded={isOpen}
                                                    aria-controls={`maintenance-${m.maintenance_id}-steps`}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        background: 'transparent',
                                                        border: 'none',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: 'var(--space-3)' }}>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div className="card-title" style={{ marginBottom: 'var(--space-1)' }}>
                                                                {t('common.id')}: {m.maintenance_id}
                                                            </div>
                                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                {t('maintenances.startDate')}: {formatDateTime(m.start_datetime)}
                                                                {' • '}
                                                                {t('maintenances.endDate')}: {formatDateTime(m.end_datetime)}
                                                                {' • '}
                                                                {t('maintenances.steps')}: {(Array.isArray(steps) ? steps : []).length}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '0 0 auto' }}>
                                                            <span className={getStatusBadge(m.maintenance_status)}>{statusLabel}</span>
                                                            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', minWidth: 20, textAlign: 'right' }}>
                                                                {isOpen ? '−' : '+'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>

                                                {isOpen ? (
                                                    <div id={`maintenance-${m.maintenance_id}-steps`} className="card-body" style={{ paddingTop: 0 }}>
                                                        {Array.isArray(steps) && steps.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                                                {steps.map((s, idx) => {
                                                                    const stepDesc = getStepDescription(s);
                                                                    const personLabel = getPersonLabel(s);
                                                                    return (
                                                                        <div
                                                                            key={s.maintenance_step_id || idx}
                                                                            style={{
                                                                                display: 'flex',
                                                                                gap: 'var(--space-3)',
                                                                                padding: 'var(--space-3)',
                                                                                border: '1px solid var(--color-border)',
                                                                                borderRadius: 'var(--radius-md)',
                                                                                background: 'var(--color-surface-2, var(--color-surface))',
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    width: 28,
                                                                                    height: 28,
                                                                                    borderRadius: 999,
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontWeight: 700,
                                                                                    background: 'var(--color-surface)',
                                                                                    border: '1px solid var(--color-border)',
                                                                                    flex: '0 0 auto',
                                                                                }}
                                                                            >
                                                                                {idx + 1}
                                                                            </div>

                                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                                                                                    <div style={{ minWidth: 0 }}>
                                                                                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                            {stepDesc}
                                                                                        </div>
                                                                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                                            {t('maintenances.technician')}: {personLabel}
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className={getStatusBadge(s.maintenance_step_status)} style={{ flex: '0 0 auto' }}>
                                                                                        {getStepStatusLabel(s)}
                                                                                    </span>
                                                                                </div>

                                                                                {s?.notes ? (
                                                                                    <div style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                                                        {t('assets.notes')}: {s.notes}
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="empty-state">{t('common.noData')}</div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AssetMaintenanceHistoryPage;
