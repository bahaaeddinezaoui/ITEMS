import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { assignmentsService, assetAssignmentService, stockItemAssignmentService, consumableAssignmentService, personService } from '../services/api';
import { ChevronLeft, ChevronRight, UserCheck, UserX, Filter, X, History, ArrowRightLeft, CheckSquare, Box, ShoppingCart, Layers, Hash, Calendar, User, ShieldCheck } from 'lucide-react';
import { SkeletonListRows, SkeletonCardList } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';

const getBilingualName = (nameAr, nameEn, fallbackName, currentLang) => {
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || fallbackName;
    }
    if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
    return nameEn || nameAr || fallbackName;
};

const getPersonName = (person, lang) => {
    if (!person) return '-';
    return getBilingualName(
        person.first_name_ar || person.first_name,
        person.first_name_en || person.first_name,
        person.first_name,
        lang
    ) + ' ' + getBilingualName(
        person.last_name_ar || person.last_name,
        person.last_name_en || person.last_name,
        person.last_name,
        lang
    );
};

const getItemName = (assignment, lang) => {
    const item = assignment.asset || assignment.stock_item || assignment.consumable;
    if (!item) return '-';
    const name = getBilingualName(
        item.asset_name_ar || item.stock_item_name_ar || item.consumable_name_ar,
        item.asset_name_en || item.stock_item_name_en || item.consumable_name_en,
        item.asset_name || item.stock_item_name || item.consumable_name,
        lang
    );
    return name || '-';
};

const getItemIdentifier = (assignment) => {
    const item = assignment.asset || assignment.stock_item || assignment.consumable;
    if (!item) return '-';
    return item.asset_inventory_number || item.stock_item_inventory_number || item.consumable_inventory_number || item.asset_serial_number || item.consumable_serial_number || '-';
};

const ITEM_TYPE_BADGE = {
    asset: 'badge-primary',
    stock_item: 'badge-info',
    consumable: 'badge-warning',
};

const AssignmentsPage = () => {
    const { t, i18n } = useTranslation();
    const { user, isSuperuser } = useAuth();
    const lang = i18n.language;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    // Filters
    const [itemTypeFilter, setItemTypeFilter] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [confirmedFilter, setConfirmedFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('-start_datetime');

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);

    // Discharge action
    const [dischargingId, setDischargingId] = useState(null);
    const [dischargeType, setDischargeType] = useState('');

    // Confirm action
    const [confirmingId, setConfirmingId] = useState(null);

    // Show filters panel
    const [showFilters, setShowFilters] = useState(false);

    // Position filter
    const [positionFilter, setPositionFilter] = useState('');
    const [positions, setPositions] = useState([]);

    // Bulk discharge
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkDischarging, setBulkDischarging] = useState(false);

    // Item history modal
    const [historyModal, setHistoryModal] = useState({ open: false, loading: false, data: null, error: '', item: null });

    // Quick reassign modal
    const [reassignModal, setReassignModal] = useState({ open: false, loading: false, error: '', assignment: null });
    const [reassignPersonSearch, setReassignPersonSearch] = useState('');
    const [reassignPersons, setReassignPersons] = useState([]);
    const [reassignSelectedPerson, setReassignSelectedPerson] = useState(null);
    const [reassignStartDate, setReassignStartDate] = useState('');
    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map(r => r.role_code).filter(Boolean) : [];
    }, [user]);

    const allowedTypes = useMemo(() => {
        if (isSuperuser) return ['asset', 'stock_item', 'consumable'];
        const types = [];
        if (roleCodes.includes('asset_responsible')) types.push('asset');
        if (roleCodes.includes('stock_consumable_responsible')) { types.push('stock_item'); types.push('consumable'); }
        if (roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief')) return ['asset', 'stock_item', 'consumable'];
        return types;
    }, [isSuperuser, roleCodes]);

    const canConfirm = useMemo(() => {
        return isSuperuser || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    }, [isSuperuser, roleCodes]);

    const canDischarge = useCallback((itemType) => {
        if (isSuperuser) return true;
        if (itemType === 'asset') return roleCodes.includes('asset_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
        return roleCodes.includes('stock_consumable_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    }, [isSuperuser, roleCodes]);

    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (itemTypeFilter) params.item_type = itemTypeFilter;
            if (isActiveFilter) params.is_active = isActiveFilter;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (confirmedFilter) params.confirmed = confirmedFilter;
            if (positionFilter) params.position = positionFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (sortField) params.sort = sortField;
            params.page = page;
            params.page_size = pageSize;

            const result = await assignmentsService.getAll(params);
            setData(result);
            if (result.positions) setPositions(result.positions);
        } catch (err) {
            setError(t('assignments.loadError'));
        } finally {
            setLoading(false);
        }
    }, [itemTypeFilter, isActiveFilter, dateFrom, dateTo, confirmedFilter, positionFilter, searchQuery, sortField, page, pageSize, t]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleDischarge = async (assignmentId, itemType) => {
        setDischargingId(assignmentId);
        setDischargeType(itemType);
        try {
            if (itemType === 'asset') {
                await assetAssignmentService.discharge(assignmentId);
            } else if (itemType === 'stock_item') {
                await stockItemAssignmentService.discharge(assignmentId);
            } else {
                await consumableAssignmentService.discharge(assignmentId);
            }
            await fetchAssignments();
        } catch (err) {
            setError(t('assignments.dischargeError'));
        } finally {
            setDischargingId(null);
            setDischargeType('');
        }
    };

    const handleConfirm = async (assignmentId) => {
        setConfirmingId(assignmentId);
        try {
            await assetAssignmentService.confirm(assignmentId);
            await fetchAssignments();
        } catch (err) {
            setError(t('assignments.confirmError'));
        } finally {
            setConfirmingId(null);
        }
    };

    const resetFilters = () => {
        setItemTypeFilter('');
        setIsActiveFilter('');
        setDateFrom('');
        setDateTo('');
        setConfirmedFilter('');
        setPositionFilter('');
        setSearchQuery('');
        setSortField('-start_datetime');
        setPage(1);
    };

    const hasActiveFilters = itemTypeFilter || isActiveFilter || dateFrom || dateTo || confirmedFilter || positionFilter;

    // Bulk discharge
    const toggleSelect = (key) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === results.filter(a => a.is_active).length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(results.filter(a => a.is_active).map(a => `${a.item_type}-${a.assignment_id}`)));
        }
    };

    const handleBulkDischarge = async () => {
        const items = [];
        for (const key of selectedIds) {
            const [itemType, assignmentId] = key.split('-');
            if (canDischarge(itemType)) {
                items.push({ assignment_id: parseInt(assignmentId), item_type: itemType });
            }
        }
        if (items.length === 0) return;
        setBulkDischarging(true);
        try {
            const result = await assignmentsService.bulkDischarge(items);
            if (result.errors && result.errors.length > 0) {
                setError(t('assignments.bulkDischargePartialError', { count: result.errors.length }));
            }
            setSelectedIds(new Set());
            await fetchAssignments();
        } catch (err) {
            setError(t('assignments.dischargeError'));
        } finally {
            setBulkDischarging(false);
        }
    };

    // Item history
    const openHistoryModal = async (assignment) => {
        const item = assignment.asset || assignment.stock_item || assignment.consumable;
        const itemId = item?.asset_id || item?.stock_item_id || item?.consumable_id;
        const itemType = assignment.item_type;
        if (!itemId) return;
        setHistoryModal({ open: true, loading: true, data: null, error: '', item: { name: getItemName(assignment, lang), type: itemType, id: itemId } });
        try {
            const result = await assignmentsService.itemHistory(itemType, itemId);
            setHistoryModal(prev => ({ ...prev, loading: false, data: result.history || [] }));
        } catch (err) {
            setHistoryModal(prev => ({ ...prev, loading: false, error: t('assignments.historyError') }));
        }
    };

    // Quick reassign
    const openReassignModal = (assignment) => {
        const now = new Date();
        const startDate = now.toISOString().slice(0, 16);
        setReassignModal({ open: true, loading: false, error: '', assignment });
        setReassignPersonSearch('');
        setReassignPersons([]);
        setReassignSelectedPerson(null);
        setReassignStartDate(startDate);
    };

    const searchPersons = async (query) => {
        setReassignPersonSearch(query);
        if (query.trim().length < 2) { setReassignPersons([]); return; }
        try {
            const result = await personService.getAll({ search: query.trim(), is_approved: 'true', page_size: 20 });
            setReassignPersons(Array.isArray(result) ? result : result.results || []);
        } catch { setReassignPersons([]); }
    };

    const handleQuickReassign = async () => {
        if (!reassignSelectedPerson || !reassignModal.assignment) return;
        setReassignModal(prev => ({ ...prev, loading: true, error: '' }));
        try {
            await assignmentsService.quickReassign({
                assignment_id: reassignModal.assignment.assignment_id,
                item_type: reassignModal.assignment.item_type,
                new_person_id: reassignSelectedPerson.person_id,
                start_datetime: reassignStartDate,
            });
            setReassignModal({ open: false, loading: false, error: '', assignment: null });
            await fetchAssignments();
        } catch (err) {
            const msg = err?.response?.data?.error || t('assignments.reassignError');
            setReassignModal(prev => ({ ...prev, loading: false, error: msg }));
        }
    };

    const formatDatetime = (dt) => {
        if (!dt) return '-';
        try {
            return new Date(dt).toLocaleString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dt;
        }
    };

    const getItemTypeLabel = (type) => {
        if (type === 'asset') return t('assignments.asset');
        if (type === 'stock_item') return t('assignments.stockItem');
        if (type === 'consumable') return t('assignments.consumable');
        return type;
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortField(`-${field}`);
        } else if (sortField === `-${field}`) {
            setSortField(field);
        } else {
            setSortField(`-${field}`);
        }
        setPage(1);
    };

    const getSortIcon = (field) => {
        if (sortField === field) return ' ↑';
        if (sortField === `-${field}`) return ' ↓';
        return '';
    };

    const results = data?.results || [];
    const stats = data?.stats || {};
    const totalPages = data?.total_pages || 1;
    const count = data?.count || 0;

    return (
        <>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <UserCheck size={22} style={{ color: 'var(--color-accent-primary)' }} />
                    {t('assignments.title')}
                </h1>
                <p className="page-subtitle">{t('assignments.subtitle')}</p>
            </div>

            {/* Stats */}
            {stats && (stats.total > 0 || !loading) && (
                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.total || 0}</div>
                        <div className="stat-label">{t('assignments.totalAssignments')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.active || 0}</div>
                        <div className="stat-label">{t('assignments.activeAssignments')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ color: 'var(--color-text-secondary)' }}>{stats.inactive || 0}</div>
                        <div className="stat-label">{t('assignments.inactiveAssignments')}</div>
                    </div>
                    {stats.by_type && Object.entries(stats.by_type).map(([typeKey, typeStats]) => (
                        <div className="stat-card" key={typeKey}>
                            <div className="stat-value">{typeStats.total}</div>
                            <div className="stat-label">{getItemTypeLabel(typeKey)}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search + Filters Bar */}
            <div className="filters-bar">
                <div className="filter-item" style={{ maxWidth: 520 }}>
                    <label className="form-label">{t('assignments.search')}</label>
                    <input
                        className="form-input"
                        type="text"
                        placeholder={t('assignments.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="filter-item" style={{ maxWidth: 200 }}>
                    <label className="form-label">{t('assignments.itemType')}</label>
                    <select
                        className="form-input"
                        value={itemTypeFilter}
                        onChange={(e) => { setItemTypeFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">{t('common.all')}</option>
                        {allowedTypes.includes('asset') && <option value="asset">{t('assignments.asset')}</option>}
                        {allowedTypes.includes('stock_item') && <option value="stock_item">{t('assignments.stockItem')}</option>}
                        {allowedTypes.includes('consumable') && <option value="consumable">{t('assignments.consumable')}</option>}
                    </select>
                </div>

                <div className="filter-item" style={{ maxWidth: 180 }}>
                    <label className="form-label">{t('assignments.status')}</label>
                    <select
                        className="form-input"
                        value={isActiveFilter}
                        onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">{t('common.all')}</option>
                        <option value="true">{t('assignments.active')}</option>
                        <option value="false">{t('assignments.inactive')}</option>
                    </select>
                </div>

                <button
                    className="btn btn-outline"
                    style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={16} />
                    {t('assignments.moreFilters')}
                    {hasActiveFilters && <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 6px' }}>!</span>}
                </button>

                {hasActiveFilters && (
                    <button
                        className="btn btn-outline"
                        style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        onClick={resetFilters}
                    >
                        <X size={16} />
                        {t('assignments.clearFilters')}
                    </button>
                )}
            </div>

            {/* Extended Filters Panel */}
            {showFilters && (
                <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                            <div className="filter-item">
                                <label className="form-label">{t('assignments.dateFrom')}</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div className="filter-item">
                                <label className="form-label">{t('assignments.dateTo')}</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                />
                            </div>

                            <div className="filter-item">
                                <label className="form-label">{t('assignments.confirmed')}</label>
                                <select
                                    className="form-input"
                                    value={confirmedFilter}
                                    onChange={(e) => { setConfirmedFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">{t('common.all')}</option>
                                    <option value="true">{t('assignments.confirmedYes')}</option>
                                    <option value="false">{t('assignments.confirmedNo')}</option>
                                </select>
                            </div>

                            <div className="filter-item">
                                <label className="form-label">{t('assignments.sortBy')}</label>
                                <select
                                    className="form-input"
                                    value={sortField}
                                    onChange={(e) => { setSortField(e.target.value); setPage(1); }}
                                >
                                    <option value="-start_datetime">{t('assignments.sortNewestFirst')}</option>
                                    <option value="start_datetime">{t('assignments.sortOldestFirst')}</option>
                                    <option value="-end_datetime">{t('assignments.sortEndNewest')}</option>
                                    <option value="end_datetime">{t('assignments.sortEndOldest')}</option>
                                    <option value="-assignment_id">{t('assignments.sortIdDesc')}</option>
                                    <option value="assignment_id">{t('assignments.sortIdAsc')}</option>
                                </select>
                            </div>

                            <div className="filter-item">
                                <label className="form-label">{t('assignments.position')}</label>
                                <select
                                    className="form-input"
                                    value={positionFilter}
                                    onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }}
                                >
                                    <option value="">{t('assignments.allPositions')}</option>
                                    {positions.map(p => (
                                        <option key={p.position_id} value={p.position_id}>{p.position_label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <h2 className="card-title">
                        {t('assignments.assignmentsList')}
                        {count > 0 && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 'var(--space-2)' }}>({count})</span>}
                    </h2>
                    {selectedIds.size > 0 && (
                        <button
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                            disabled={bulkDischarging}
                            onClick={handleBulkDischarge}
                        >
                            <UserX size={16} />
                            {bulkDischarging ? t('assignments.discharging') : t('assignments.bulkDischarge', { count: selectedIds.size })}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                            <SkeletonCardList count={8} cardLines={4} gap="var(--space-4)" bodyPadding="var(--space-5)" style={{ display: 'contents' }} />
                        </div>
                    </div>
                ) : error ? (
                    <div className="card-body">
                        <div className="error-message">{error}</div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-title">{t('assignments.noAssignments')}</div>
                        <div className="empty-state-text">{t('assignments.noAssignmentsMatch')}</div>
                    </div>
                ) : (
                    <div className="card-body">
                        {/* Select all bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.9em' }}>
                            <input
                                type="checkbox"
                                checked={selectedIds.size > 0 && selectedIds.size === results.filter(a => a.is_active).length}
                                onChange={toggleSelectAll}
                                title={t('assignments.selectAll')}
                            />
                            <span style={{ color: 'var(--color-text-secondary)' }}>{t('assignments.selectAll')}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                            {results.map((assignment) => {
                                const itemType = assignment.item_type;
                                const isActive = assignment.is_active;
                                const isConfirmed = !!assignment.is_confirmed_by_exploitation_chief;
                                const isDischarging = dischargingId === assignment.assignment_id && dischargeType === itemType;
                                const isConfirming = confirmingId === assignment.assignment_id;
                                const rowKey = `${itemType}-${assignment.assignment_id}`;
                                const isSelected = selectedIds.has(rowKey);

                                const typeIcon = itemType === 'asset' ? <Box size={18} /> : itemType === 'stock_item' ? <ShoppingCart size={18} /> : <Layers size={18} />;

                                return (
                                    <div key={rowKey} className="card" style={{ transition: 'all 0.2s ease', ...(isSelected ? { borderColor: 'var(--color-accent-primary)', boxShadow: '0 0 0 1px var(--color-accent-primary)' } : {}) }}>
                                        <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                            {/* Header: type icon + ID + checkbox + status */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                    <div style={{
                                                        width: '38px', height: '38px',
                                                        background: 'var(--glass-bg)',
                                                        borderRadius: 'var(--radius-md)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'var(--color-accent-primary)'
                                                    }}>
                                                        {typeIcon}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <span className={`badge ${ITEM_TYPE_BADGE[itemType] || 'badge-info'}`}>
                                                                {getItemTypeLabel(itemType)}
                                                            </span>
                                                            <span style={{ fontWeight: 600, fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>#{assignment.assignment_id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    {isActive && canDischarge(itemType) && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(rowKey)}
                                                            title={t('assignments.selectAll')}
                                                        />
                                                    )}
                                                    <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
                                                        {isActive ? t('assignments.active') : t('assignments.inactive')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Item name */}
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-3)', lineHeight: 1.3 }}>
                                                {getItemName(assignment, lang)}
                                            </h3>

                                            {/* Details grid */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Hash size={14} style={{ flexShrink: 0 }} />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getItemIdentifier(assignment)}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <User size={14} style={{ flexShrink: 0 }} />
                                                    <span>{getPersonName(assignment.person, lang)}</span>
                                                    {assignment.person_position?.position_label && (
                                                        <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>— {assignment.person_position.position_label}</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                                                    <span>{t('assignments.assignedBy')}: {getPersonName(assignment.assigned_by_person, lang)}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        <Calendar size={14} style={{ flexShrink: 0 }} />
                                                        <span style={{ whiteSpace: 'nowrap' }}>{formatDatetime(assignment.start_datetime)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                        <Calendar size={14} style={{ flexShrink: 0 }} />
                                                        <span style={{ whiteSpace: 'nowrap' }}>{formatDatetime(assignment.end_datetime)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                                    {isConfirmed ? (
                                                        <span className="badge badge-success" style={{ fontSize: '0.75em' }}>{t('assignments.confirmedYes')}</span>
                                                    ) : (
                                                        <span className="badge badge-warning" style={{ fontSize: '0.75em' }}>{t('assignments.confirmedNo')}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8em', padding: '4px 8px' }}
                                                    onClick={() => openHistoryModal(assignment)}
                                                    title={t('assignments.history')}
                                                >
                                                    <History size={14} />
                                                </button>
                                                {isActive && canDischarge(itemType) && (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8em', padding: '4px 10px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                                        disabled={isDischarging}
                                                        onClick={() => handleDischarge(assignment.assignment_id, itemType)}
                                                        title={t('assignments.discharge')}
                                                    >
                                                        {isDischarging ? '...' : <><UserX size={14} /> {t('assignments.discharge')}</>}
                                                    </button>
                                                )}
                                                {isActive && canDischarge(itemType) && (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8em', padding: '4px 10px', color: 'var(--color-accent-primary)', borderColor: 'var(--color-accent-primary)' }}
                                                        onClick={() => openReassignModal(assignment)}
                                                        title={t('assignments.reassign')}
                                                    >
                                                        <ArrowRightLeft size={14} />
                                                    </button>
                                                )}
                                                {isActive && !isConfirmed && canConfirm && itemType === 'asset' && (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8em', padding: '4px 10px', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                                                        disabled={isConfirming}
                                                        onClick={() => handleConfirm(assignment.assignment_id)}
                                                        title={t('assignments.confirm')}
                                                    >
                                                        {isConfirming ? '...' : <><UserCheck size={14} /> {t('assignments.confirm')}</>}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {!loading && count > 0 && (
                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <button
                            className="btn btn-outline"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{ padding: '4px 10px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            className="btn btn-outline"
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            style={{ padding: '4px 10px' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Item History Timeline Modal */}
            {historyModal.open && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setHistoryModal(prev => ({ ...prev, open: false }))}>
                    <div className="modal" style={{ maxWidth: 700, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <History size={20} />
                                {t('assignments.historyTitle')} — {historyModal.item?.name}
                            </h3>
                            <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setHistoryModal(prev => ({ ...prev, open: false }))}><X size={16} /></button>
                        </div>

                        {historyModal.loading ? (
                            <SkeletonListRows count={4} />
                        ) : historyModal.error ? (
                            <div className="error-message">{historyModal.error}</div>
                        ) : (historyModal.data || []).length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)' }}>{t('assignments.noHistory')}</p>
                        ) : (
                            <div style={{ position: 'relative', paddingLeft: 'var(--space-6)' }}>
                                <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: 'var(--color-border)' }} />
                                {(historyModal.data || []).map((entry, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                                        <div style={{ position: 'absolute', left: -20, top: 6, width: 12, height: 12, borderRadius: '50%', background: entry.is_active ? 'var(--color-success)' : 'var(--color-text-secondary)', border: '2px solid var(--color-surface)' }} />
                                        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                                <strong>{getPersonName(entry.person, lang)}</strong>
                                                <span className={`badge ${entry.is_active ? 'badge-success' : 'badge-error'}`}>
                                                    {entry.is_active ? t('assignments.active') : t('assignments.inactive')}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                                <div>{t('assignments.startDate')}: {formatDatetime(entry.start_datetime)}</div>
                                                <div>{t('assignments.endDate')}: {formatDatetime(entry.end_datetime)}</div>
                                                <div>{t('assignments.assignedBy')}: {getPersonName(entry.assigned_by_person, lang)}</div>
                                                {entry.person_position && <div>{t('assignments.position')}: {entry.person_position.position_label}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </ModalPortal>
            )}

            {/* Quick Reassign Modal */}
            {reassignModal.open && reassignModal.assignment && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => setReassignModal(prev => ({ ...prev, open: false }))}>
                    <div className="modal" style={{ maxWidth: 500, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <ArrowRightLeft size={20} />
                                {t('assignments.reassignTitle')}
                            </h3>
                            <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setReassignModal(prev => ({ ...prev, open: false }))}><X size={16} /></button>
                        </div>

                        {reassignModal.error && <div className="error-message" style={{ marginBottom: 'var(--space-3)' }}>{reassignModal.error}</div>}

                        <div style={{ marginBottom: 'var(--space-3)', fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
                            <strong>{getItemName(reassignModal.assignment, lang)}</strong> — {t('assignments.currentlyAssignedTo')} <strong>{getPersonName(reassignModal.assignment.person, lang)}</strong>
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                            <label className="form-label">{t('assignments.newPerson')}</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder={t('assignments.searchPerson')}
                                value={reassignPersonSearch}
                                onChange={(e) => searchPersons(e.target.value)}
                            />
                            {reassignPersons.length > 0 && (
                                <div style={{ marginTop: 'var(--space-2)', maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                    {reassignPersons.map(p => (
                                        <div
                                            key={p.person_id}
                                            style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', background: reassignSelectedPerson?.person_id === p.person_id ? 'var(--color-accent-primary-alpha, rgba(59,130,246,0.1))' : 'transparent' }}
                                            onClick={() => { setReassignSelectedPerson(p); setReassignPersons([]); setReassignPersonSearch(getPersonName(p, lang)); }}
                                        >
                                            {getPersonName(p, lang)}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {reassignSelectedPerson && (
                                <div style={{ marginTop: 'var(--space-2)', fontSize: '0.9em', color: 'var(--color-success)' }}>
                                    ✓ {getPersonName(reassignSelectedPerson, lang)}
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                            <label className="form-label">{t('assignments.startDate')}</label>
                            <input
                                className="form-input"
                                type="datetime-local"
                                value={reassignStartDate}
                                onChange={(e) => setReassignStartDate(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" onClick={() => setReassignModal(prev => ({ ...prev, open: false }))}>
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!reassignSelectedPerson || reassignModal.loading}
                                onClick={handleQuickReassign}
                            >
                                {reassignModal.loading ? '...' : <><ArrowRightLeft size={16} /> {t('assignments.reassign')}</>}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
        </>
    );
};

export default AssignmentsPage;
