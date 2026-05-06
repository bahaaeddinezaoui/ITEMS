import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Search, Calendar, Wrench, ChevronDown, ChevronUp, X, ArrowUpDown, Filter, Package, Box, Droplets } from 'lucide-react';
import { assetService, stockItemService, consumableService, maintenanceService, maintenanceStepService } from '../services/api';
import { SkeletonCardList } from '../components/SkeletonCard';

const ENTITY_TYPES = [
    { key: 'asset', icon: Package },
    { key: 'stock_item', icon: Box },
    { key: 'consumable', icon: Droplets },
];

const MaintenanceHistoryPage = () => {
    const { t, i18n } = useTranslation();
    const [entityType, setEntityType] = useState('asset');
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [stepsByMaintenance, setStepsByMaintenance] = useState({});
    const [loadingItems, setLoadingItems] = useState(false);
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
    const [showFilters, setShowFilters] = useState(false);
    const [itemStatusFilter, setItemStatusFilter] = useState('');
    const [itemSortKey, setItemSortKey] = useState('name');
    const [itemSortDir, setItemSortDir] = useState('asc');
    const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('');
    const [technicianFilter, setTechnicianFilter] = useState('');

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedHistoryQuery(historyQuery);
        }, 350);
        return () => clearTimeout(handle);
    }, [historyQuery]);

    // Load items when entity type changes
    useEffect(() => {
        const loadItems = async () => {
            setLoadingItems(true);
            setError('');
            setItems([]);
            setSelectedItem(null);
            setMaintenances([]);
            setStepsByMaintenance({});
            setSearchQuery('');
            setItemStatusFilter('');
            try {
                let data;
                if (entityType === 'asset') {
                    data = await assetService.getAll({ page_size: 1000 });
                } else if (entityType === 'stock_item') {
                    data = await stockItemService.getAll({ page_size: 1000 });
                } else {
                    data = await consumableService.getAll({ page_size: 1000 });
                }
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(t('maintenanceHistory.loadItemsError') + ': ' + (err?.message || 'unknown error'));
                setItems([]);
            } finally {
                setLoadingItems(false);
            }
        };
        loadItems();
    }, [entityType]);

    // ── Helpers to abstract field access by entity type ──
    const getId = (item) => {
        if (entityType === 'asset') return item.asset_id;
        if (entityType === 'stock_item') return item.stock_item_id;
        return item.consumable_id;
    };

    const getName = (item) => {
        if (entityType === 'asset') return item.asset_name;
        if (entityType === 'stock_item') return item.stock_item_name;
        return item.consumable_name;
    };

    const getInventoryNumber = (item) => {
        if (entityType === 'asset') return item.asset_inventory_number;
        if (entityType === 'stock_item') return item.stock_item_inventory_number;
        return item.consumable_inventory_number;
    };

    const getSerialNumber = (item) => {
        if (entityType === 'asset') return item.asset_serial_number;
        if (entityType === 'stock_item') return item.stock_item_serial_number;
        return item.consumable_serial_number;
    };

    const getStatus = (item) => {
        if (entityType === 'asset') return item.asset_status;
        if (entityType === 'stock_item') return item.stock_item_status;
        return item.consumable_status;
    };

    const getStatusAr = (item) => {
        if (entityType === 'asset') return item.asset_status_ar;
        if (entityType === 'stock_item') return item.stock_item_status_ar;
        return item.consumable_status_ar;
    };

    const getStatusEn = (item) => {
        if (entityType === 'asset') return item.asset_status_en;
        if (entityType === 'stock_item') return item.stock_item_status_en;
        return item.consumable_status_en;
    };

    const getItemStatusLabel = (item) => {
        const lang = i18n.language;
        const sAr = getStatusAr(item);
        const sEn = getStatusEn(item);
        if (lang === 'ar') return sAr || sEn || getStatus(item) || '-';
        return sEn || sAr || getStatus(item) || '-';
    };

    const itemStatuses = useMemo(() => {
        const set = new Set();
        (items || []).forEach((a) => {
            if (getStatus(a)) set.add(String(getStatus(a)));
            if (getStatusEn(a)) set.add(String(getStatusEn(a)));
            if (getStatusAr(a)) set.add(String(getStatusAr(a)));
        });
        return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }, [items, entityType]);

    const filteredItems = useMemo(() => {
        const q = (searchQuery || '').trim().toLowerCase();
        if (!q) return [];
        let result = (items || []).filter(a => {
            const name = (getName(a) || '').toLowerCase();
            const inv = (getInventoryNumber(a) || '').toLowerCase();
            const sn = (getSerialNumber(a) || '').toLowerCase();
            return name.includes(q) || inv.includes(q) || sn.includes(q);
        });

        if (itemStatusFilter) {
            const f = normalize(itemStatusFilter);
            result = result.filter(a => {
                const raw = [getStatus(a), getStatusEn(a), getStatusAr(a)]
                    .map(normalize)
                    .filter(Boolean)
                    .join(' ');
                const label = normalize(getItemStatusLabel(a));
                return (raw + ' ' + label).includes(f);
            });
        }

        const dir = itemSortDir === 'asc' ? 1 : -1;
        result = [...result].sort((a, b) => {
            if (itemSortKey === 'name') {
                return ((getName(a) || '').localeCompare(getName(b) || '')) * dir;
            }
            if (itemSortKey === 'inventory_number') {
                return ((getInventoryNumber(a) || '').localeCompare(getInventoryNumber(b) || '')) * dir;
            }
            if (itemSortKey === 'serial_number') {
                return ((getSerialNumber(a) || '').localeCompare(getSerialNumber(b) || '')) * dir;
            }
            return 0;
        });

        return result.slice(0, 20);
    }, [items, searchQuery, itemStatusFilter, itemSortKey, itemSortDir, i18n.language, entityType]);

    const loadHistory = async (item) => {
        if (!item) return;
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
        setMaintenanceTypeFilter('');
        setTechnicianFilter('');
        try {
            const id = getId(item);
            const maintParam = { [entityType]: id, page_size: 2000 };
            const stepParamKey = `maintenance__${entityType}`;
            const stepParam = { [stepParamKey]: id, page_size: 2000 };

            const [forItem, allSteps] = await Promise.all([
                maintenanceService.getAll(maintParam),
                maintenanceStepService.getAll(stepParam),
            ]);
            const maints = Array.isArray(forItem) ? forItem : [];
            const steps = Array.isArray(allSteps) ? allSteps : [];
            const stepsMap = {};
            steps.forEach((s) => {
                const mid = s.maintenance || s.maintenance_id;
                if (!stepsMap[mid]) stepsMap[mid] = [];
                stepsMap[mid].push(s);
            });
            setMaintenances(maints);
            setStepsByMaintenance(stepsMap);
            const initialOpen = {};
            maints.slice(0, 3).forEach((m) => { initialOpen[m.maintenance_id] = true; });
            setOpenMaintenanceIds(initialOpen);
        } catch (err) {
            setError(t('maintenanceHistory.loadHistoryError') + ': ' + (err?.message || 'unknown error'));
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

    const maintenanceTypes = useMemo(() => {
        const set = new Set();
        (maintenances || []).forEach((m) => {
            if (m?.maintenance_type) set.add(String(m.maintenance_type));
            if (m?.maintenance_type_en) set.add(String(m.maintenance_type_en));
            if (m?.maintenance_type_ar) set.add(String(m.maintenance_type_ar));
        });
        return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }, [maintenances]);

    const technicians = useMemo(() => {
        const set = new Set();
        Object.values(stepsByMaintenance || {}).forEach((steps) => {
            (Array.isArray(steps) ? steps : []).forEach((s) => {
                const label = getPersonLabel(s);
                if (label && label !== '-') set.add(label);
            });
        });
        return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
    }, [stepsByMaintenance, i18n.language]);

    const clearHistoryFilters = () => {
        setHistoryQuery('');
        setDebouncedHistoryQuery('');
        setMaintenanceStatusFilter('');
        setStepStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setSortKey('start_datetime');
        setSortDir('desc');
        setMaintenanceTypeFilter('');
        setTechnicianFilter('');
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
        const mType = maintenanceTypeFilter;
        const tech = technicianFilter;
        const from = (dateFrom || '').trim();
        const to = (dateTo || '').trim();

        const result = (maintenances || []).filter((m) => {
            if (!maintenanceStatusMatches(m, mStatus)) return false;
            if (!maintenanceOverlapsDateRange(m, from, to)) return false;

            if (mType) {
                const f = normalize(mType);
                const raw = [m?.maintenance_type, m?.maintenance_type_en, m?.maintenance_type_ar]
                    .map(normalize)
                    .filter(Boolean)
                    .join(' ');
                if (!raw.includes(f)) return false;
            }

            const steps = stepsByMaintenance?.[m.maintenance_id] || [];
            const stepsArr = Array.isArray(steps) ? steps : [];

            const hasStepStatus = stepsArr.some((s) => stepStatusMatches(s, sStatus));
            if (sStatus && !hasStepStatus) return false;

            if (tech) {
                const f = normalize(tech);
                const hasTech = stepsArr.some((s) => normalize(getPersonLabel(s)).includes(f));
                if (!hasTech) return false;
            }

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

            const stepText = stepsArr.map((s) => [
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

    const totalSteps = useMemo(() =>
        filteredSortedMaintenances.reduce((acc, m) => acc + ((stepsByMaintenance?.[m.maintenance_id] || []).length), 0),
        [filteredSortedMaintenances, stepsByMaintenance]
    );

    const activeFiltersCount = useMemo(() => {
        let c = 0;
        if (maintenanceStatusFilter) c++;
        if (stepStatusFilter) c++;
        if (dateFrom) c++;
        if (dateTo) c++;
        if (debouncedHistoryQuery) c++;
        if (maintenanceTypeFilter) c++;
        if (technicianFilter) c++;
        return c;
    }, [maintenanceStatusFilter, stepStatusFilter, dateFrom, dateTo, debouncedHistoryQuery, maintenanceTypeFilter, technicianFilter]);

    const activeItemFiltersCount = useMemo(() => {
        let c = 0;
        if (itemStatusFilter) c++;
        if (searchQuery) c++;
        return c;
    }, [itemStatusFilter, searchQuery]);

    const clearItemFilters = () => {
        setSearchQuery('');
        setItemStatusFilter('');
        setItemSortKey('name');
        setItemSortDir('asc');
    };

    const entityLabel = t(`maintenanceHistory.${entityType}`);

    return (
        <div className="page-container">
            {/* ── Hero Section ── */}
            <div className="dashboard-hero">
                <div className="dashboard-hero-main">
                    <div className="dashboard-hero-kicker">
                        <History size={12} />
                        {t('maintenanceHistory.title')}
                    </div>
                    <h1 className="dashboard-hero-title">{t('maintenanceHistory.title')}</h1>
                    <p className="page-subtitle" style={{ maxWidth: 520 }}>{t('maintenanceHistory.subtitle')}</p>

                    {/* Entity Type Tabs */}
                    {!selectedItem && (
                        <div className="amh-entity-tabs">
                            {ENTITY_TYPES.map(({ key, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`amh-entity-tab${entityType === key ? ' amh-entity-tab--active' : ''}`}
                                    onClick={() => setEntityType(key)}
                                >
                                    <Icon size={15} />
                                    {t(`maintenanceHistory.${key}`)}
                                </button>
                            ))}
                        </div>
                    )}

                    {!selectedItem && (
                        <div className="amh-hero-search">
                            <Search size={16} className="amh-hero-search-icon" />
                            <input
                                className="amh-hero-search-input"
                                type="text"
                                placeholder={t('maintenanceHistory.searchPlaceholder', { entity: entityLabel })}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button type="button" className="amh-hero-search-clear" onClick={() => setSearchQuery('')}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {selectedItem && (
                    <div className="dashboard-hero-actions">
                        <button type="button" className="btn" onClick={() => { setSelectedItem(null); setMaintenances([]); setStepsByMaintenance({}); }}>
                            <X size={14} style={{ marginRight: 'var(--space-2)' }} />
                            {t('maintenanceHistory.changeItem', { entity: entityLabel })}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Loading ── */}
            {loadingItems && (
                <div style={{ padding: 'var(--space-8) 0' }}>
                    <SkeletonCardList count={3} cardLines={2} gap="var(--space-4)" />
                </div>
            )}

            {/* ── Item Filters & Sort ── */}
            {!selectedItem && !loadingItems && searchQuery && (
                <div className="amh-filter-bar">
                    <div className="amh-filter-search">
                        <Search size={15} className="amh-filter-search-icon" />
                        <input
                            className="amh-filter-search-input"
                            type="text"
                            value={searchQuery}
                            placeholder={t('maintenanceHistory.searchPlaceholder', { entity: entityLabel })}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button type="button" className="amh-hero-search-clear" onClick={() => setSearchQuery('')}>
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    {itemStatuses.length > 0 && (
                        <div className="amh-filter-sort">
                            <select
                                className="amh-sort-select"
                                value={itemStatusFilter}
                                onChange={(e) => setItemStatusFilter(e.target.value)}
                            >
                                <option value="">{t('common.all')} {t('common.status')}</option>
                                {itemStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="amh-filter-sort">
                        <ArrowUpDown size={14} />
                        <select
                            className="amh-sort-select"
                            value={`${itemSortKey}:${itemSortDir}`}
                            onChange={(e) => {
                                const [k, d] = e.target.value.split(':');
                                setItemSortKey(k);
                                setItemSortDir(d);
                            }}
                        >
                            <option value="name:asc">{t('common.name')} ↑</option>
                            <option value="name:desc">{t('common.name')} ↓</option>
                            <option value="inventory_number:asc">{t('assets.inventoryNumber')} ↑</option>
                            <option value="inventory_number:desc">{t('assets.inventoryNumber')} ↓</option>
                            <option value="serial_number:asc">{t('assets.serialNumber')} ↑</option>
                            <option value="serial_number:desc">{t('assets.serialNumber')} ↓</option>
                        </select>
                    </div>
                    {activeItemFiltersCount > 0 && (
                        <button type="button" className="amh-filter-toggle" onClick={clearItemFilters}>
                            <X size={13} />
                            {t('common.clearFilters')}
                        </button>
                    )}
                </div>
            )}

            {/* ── Item Selection ── */}
            {!selectedItem && filteredItems.length > 0 && (
                <div className="amh-assets-section">
                    <div className="amh-section-head">
                        <h2 className="amh-section-title">
                            {(() => {
                                const Icon = ENTITY_TYPES.find(e => e.key === entityType)?.icon || Package;
                                return <Icon size={18} />;
                            })()}
                            {t('maintenanceHistory.matchingItems', { entity: entityLabel })}
                        </h2>
                        <span className="amh-section-count">{filteredItems.length}</span>
                    </div>
                    <div className="amh-assets-grid">
                        {filteredItems.map((a) => {
                            const Icon = ENTITY_TYPES.find(e => e.key === entityType)?.icon || Package;
                            return (
                                <button
                                    key={getId(a)}
                                    type="button"
                                    className="amh-asset-card"
                                    onClick={() => { setSelectedItem(a); loadHistory(a); }}
                                >
                                    <div className="amh-asset-card-top">
                                        <div className="amh-asset-name">{getName(a) || t('common.unnamed')}</div>
                                        <span className={getStatusBadge(getStatus(a))}>
                                            {getItemStatusLabel(a)}
                                        </span>
                                    </div>
                                    <div className="amh-asset-meta">
                                        <span className="amh-asset-mono">{getInventoryNumber(a) || '-'}</span>
                                        <span className="amh-asset-dot" />
                                        <span className="amh-asset-mono">{getSerialNumber(a) || '-'}</span>
                                    </div>
                                    <div className="amh-asset-card-foot">
                                        <span className="amh-asset-view-label">{t('common.view')}</span>
                                        <span className="amh-asset-view-btn">{t('maintenanceHistory.viewHistory')}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!selectedItem && !loadingItems && searchQuery && filteredItems.length === 0 && (
                <div className="amh-empty-hero">
                    <Search size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
                    <p className="amh-empty-text">{t('common.noResults')}</p>
                </div>
            )}

            {/* ── Selected Item History ── */}
            {selectedItem && (
                <div className="amh-history-section">
                    {/* Item Info Banner */}
                    <div className="amh-asset-banner">
                        <div className="amh-asset-banner-icon">
                            {(() => {
                                const Icon = ENTITY_TYPES.find(e => e.key === entityType)?.icon || Package;
                                return <Icon size={20} />;
                            })()}
                        </div>
                        <div className="amh-asset-banner-info">
                            <div className="amh-asset-banner-name">
                                {getName(selectedItem) || `${entityLabel} ${getId(selectedItem)}`}
                            </div>
                            {getInventoryNumber(selectedItem) && (
                                <div className="amh-asset-banner-inv">
                                    {getInventoryNumber(selectedItem)}
                                    {getSerialNumber(selectedItem) ? ` • ${getSerialNumber(selectedItem)}` : ''}
                                </div>
                            )}
                        </div>
                        <span className={getStatusBadge(getStatus(selectedItem))}>
                            {getItemStatusLabel(selectedItem)}
                        </span>
                    </div>

                    {loadingHistory ? (
                        <div style={{ padding: 'var(--space-8) 0' }}>
                            <SkeletonCardList count={4} cardLines={3} gap="var(--space-4)" />
                        </div>
                    ) : error ? (
                        <div className="amh-error-card">
                            <div className="error-message">{error}</div>
                        </div>
                    ) : maintenances.length === 0 ? (
                        <div className="amh-empty-hero">
                            <Wrench size={32} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }} />
                            <p className="amh-empty-text">{t('maintenanceHistory.noMaintenances', { entity: entityLabel })}</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Row */}
                            <div className="amh-stats-row">
                                <div className="stat-card">
                                    <div className="stat-value">{filteredSortedMaintenances.length}</div>
                                    <div className="stat-label">{t('maintenances.title')}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{totalSteps}</div>
                                    <div className="stat-label">{t('maintenances.steps')}</div>
                                </div>
                            </div>

                            {/* Search + Filter Toggle + Sort */}
                            <div className="amh-filter-bar">
                                <div className="amh-filter-search">
                                    <Search size={15} className="amh-filter-search-icon" />
                                    <input
                                        className="amh-filter-search-input"
                                        type="text"
                                        value={historyQuery}
                                        placeholder={t('common.search')}
                                        onChange={(e) => setHistoryQuery(e.target.value)}
                                    />
                                    {historyQuery && (
                                        <button type="button" className="amh-hero-search-clear" onClick={() => setHistoryQuery('')}>
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className={`amh-filter-toggle${showFilters ? ' amh-filter-toggle--active' : ''}`}
                                    onClick={() => setShowFilters((v) => !v)}
                                >
                                    <Filter size={14} />
                                    {t('common.clearFilters') !== t('common.clearFilters') ? t('common.status') : 'Filters'}
                                    {activeFiltersCount > 0 && <span className="amh-filter-badge">{activeFiltersCount}</span>}
                                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                <div className="amh-filter-sort">
                                    <ArrowUpDown size={14} />
                                    <select
                                        className="amh-sort-select"
                                        value={`${sortKey}:${sortDir}`}
                                        onChange={(e) => {
                                            const [k, d] = e.target.value.split(':');
                                            setSortKey(k);
                                            setSortDir(d);
                                        }}
                                    >
                                        <option value="start_datetime:desc">{t('maintenances.startDate')} ↓</option>
                                        <option value="start_datetime:asc">{t('maintenances.startDate')} ↑</option>
                                        <option value="end_datetime:desc">{t('maintenances.endDate')} ↓</option>
                                        <option value="end_datetime:asc">{t('maintenances.endDate')} ↑</option>
                                        <option value="maintenance_id:desc">{t('common.id')} ↓</option>
                                        <option value="maintenance_id:asc">{t('common.id')} ↑</option>
                                    </select>
                                </div>
                            </div>

                            {/* Collapsible Filters */}
                            {showFilters && (
                                <div className="amh-filter-panel">
                                    <div className="amh-filter-panel-grid">
                                        <div className="filter-item">
                                            <label className="form-label">{t('maintenances.startDate')}</label>
                                            <input className="form-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                        </div>
                                        <div className="filter-item">
                                            <label className="form-label">{t('maintenances.endDate')}</label>
                                            <input className="form-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                        </div>
                                        <div className="filter-item">
                                            <label className="form-label">{t('common.status')}</label>
                                            <select className="form-input" value={maintenanceStatusFilter} onChange={(e) => setMaintenanceStatusFilter(e.target.value)}>
                                                <option value="">{t('common.all')}</option>
                                                {maintenanceStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="filter-item">
                                            <label className="form-label">{t('maintenances.steps')} {t('common.status')}</label>
                                            <select className="form-input" value={stepStatusFilter} onChange={(e) => setStepStatusFilter(e.target.value)}>
                                                <option value="">{t('common.all')}</option>
                                                {stepStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        {maintenanceTypes.length > 0 && (
                                            <div className="filter-item">
                                                <label className="form-label">{t('maintenances.type') || t('maintenances.maintenanceType') || 'Type'}</label>
                                                <select className="form-input" value={maintenanceTypeFilter} onChange={(e) => setMaintenanceTypeFilter(e.target.value)}>
                                                    <option value="">{t('common.all')}</option>
                                                    {maintenanceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        {technicians.length > 0 && (
                                            <div className="filter-item">
                                                <label className="form-label">{t('maintenances.technician')}</label>
                                                <select className="form-input" value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)}>
                                                    <option value="">{t('common.all')}</option>
                                                    {technicians.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" className="btn amh-filter-clear" onClick={clearHistoryFilters}>
                                        <X size={13} style={{ marginRight: 'var(--space-2)' }} />
                                        {t('common.clearFilters')}
                                    </button>
                                </div>
                            )}

                            {/* Active Filter Chips */}
                            {activeFiltersCount > 0 && (
                                <div className="amh-active-chips">
                                    {debouncedHistoryQuery && (
                                        <button type="button" className="amh-chip" onClick={() => { setHistoryQuery(''); setDebouncedHistoryQuery(''); }}>
                                            <Search size={11} />{debouncedHistoryQuery}<X size={11} />
                                        </button>
                                    )}
                                    {maintenanceStatusFilter && (
                                        <button type="button" className="amh-chip" onClick={() => setMaintenanceStatusFilter('')}>
                                            {t('common.status')}: {maintenanceStatusFilter}<X size={11} />
                                        </button>
                                    )}
                                    {stepStatusFilter && (
                                        <button type="button" className="amh-chip" onClick={() => setStepStatusFilter('')}>
                                            {t('maintenances.steps')}: {stepStatusFilter}<X size={11} />
                                        </button>
                                    )}
                                    {maintenanceTypeFilter && (
                                        <button type="button" className="amh-chip" onClick={() => setMaintenanceTypeFilter('')}>
                                            {t('maintenances.type') || 'Type'}: {maintenanceTypeFilter}<X size={11} />
                                        </button>
                                    )}
                                    {technicianFilter && (
                                        <button type="button" className="amh-chip" onClick={() => setTechnicianFilter('')}>
                                            {t('maintenances.technician')}: {technicianFilter}<X size={11} />
                                        </button>
                                    )}
                                    {dateFrom && (
                                        <button type="button" className="amh-chip" onClick={() => setDateFrom('')}>
                                            {t('maintenances.startDate')}: {dateFrom}<X size={11} />
                                        </button>
                                    )}
                                    {dateTo && (
                                        <button type="button" className="amh-chip" onClick={() => setDateTo('')}>
                                            {t('maintenances.endDate')}: {dateTo}<X size={11} />
                                        </button>
                                    )}
                                    <button type="button" className="amh-chip amh-chip--clear" onClick={clearHistoryFilters}>
                                        {t('common.clearFilters')}
                                    </button>
                                </div>
                            )}

                            {/* Maintenance Timeline */}
                            {filteredSortedMaintenances.length === 0 ? (
                                <div className="amh-empty-hero">
                                    <Search size={28} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }} />
                                    <p className="amh-empty-text">{t('common.noResults')}</p>
                                </div>
                            ) : (
                                <div className="amh-timeline">
                                    {filteredSortedMaintenances.map((m) => {
                                        const steps = stepsByMaintenance[m.maintenance_id] || [];
                                        const isOpen = !!openMaintenanceIds?.[m.maintenance_id];
                                        const statusLabel = getMaintenanceStatusLabel(m);
                                        const typeLabel = m?.maintenance_type_en || m?.maintenance_type_ar || m?.maintenance_type || '';
                                        return (
                                            <div key={m.maintenance_id} className={`amh-maint-card${isOpen ? ' amh-maint-card--open' : ''}`}>
                                                <button
                                                    type="button"
                                                    className="amh-maint-header"
                                                    onClick={() => toggleMaintenanceOpen(m.maintenance_id)}
                                                    aria-expanded={isOpen}
                                                    aria-controls={`maintenance-${m.maintenance_id}-steps`}
                                                >
                                                    <div className="amh-maint-header-left">
                                                        <div className="amh-maint-id">
                                                            <Wrench size={13} />
                                                            #{m.maintenance_id}
                                                        </div>
                                                        <div className="amh-maint-dates">
                                                            <Calendar size={12} />
                                                            <span>{formatDateTime(m.start_datetime)}</span>
                                                            <span className="amh-maint-date-sep">→</span>
                                                            <span>{formatDateTime(m.end_datetime)}</span>
                                                        </div>
                                                        {typeLabel && (
                                                            <div className="amh-maint-type">{typeLabel}</div>
                                                        )}
                                                    </div>
                                                    <div className="amh-maint-header-right">
                                                        <span className={getStatusBadge(m.maintenance_status)}>{statusLabel}</span>
                                                        <span className="amh-maint-step-count">
                                                            {Array.isArray(steps) ? steps.length : 0} {t('maintenances.steps')}
                                                        </span>
                                                        <span className="amh-maint-chevron">
                                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </span>
                                                    </div>
                                                </button>

                                                {isOpen && (
                                                    <div id={`maintenance-${m.maintenance_id}-steps`} className="amh-maint-body">
                                                        {Array.isArray(steps) && steps.length > 0 ? (
                                                            <div className="amh-steps-timeline">
                                                                {steps.map((s, idx) => {
                                                                    const stepDesc = getStepDescription(s);
                                                                    const personLabel = getPersonLabel(s);
                                                                    const isLast = idx === steps.length - 1;
                                                                    return (
                                                                        <div key={s.maintenance_step_id || idx} className="amh-step-row">
                                                                            <div className="amh-step-rail">
                                                                                <div className="amh-step-dot" />
                                                                                {!isLast && <div className="amh-step-line" />}
                                                                            </div>
                                                                            <div className="amh-step-content">
                                                                                <div className="amh-step-head">
                                                                                    <div className="amh-step-title">{stepDesc}</div>
                                                                                    <span className={getStatusBadge(s.maintenance_step_status)}>
                                                                                        {getStepStatusLabel(s)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="amh-step-meta">
                                                                                    {t('maintenances.technician')}: {personLabel}
                                                                                </div>
                                                                                {s?.notes && (
                                                                                    <div className="amh-step-notes">
                                                                                        {s.notes}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="amh-empty-inline">{t('common.noData')}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MaintenanceHistoryPage;
