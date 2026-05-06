import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { assignmentsService, assetAssignmentService, stockItemAssignmentService, consumableAssignmentService, assetOrgAssignmentService, stockItemOrgAssignmentService, consumableOrgAssignmentService, personService, organizationalStructureService, assetService, stockItemService, consumableService } from '../services/api';
import { ChevronLeft, ChevronRight, UserCheck, UserX, Filter, X, History, ArrowRightLeft, CheckSquare, Box, ShoppingCart, Layers, Hash, Calendar, User, ShieldCheck, PlusCircle, Search, Building2 } from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
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

const getBilingualStructureName = (item, currentLang) => {
    if (!item) return '-';
    const nameAr = item.structure_name_ar;
    const nameEn = item.structure_name_en;
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || item.structure_name;
    }
    if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
    return nameEn || nameAr || item.structure_name;
};

const getStructureName = (org, lang) => {
    if (!org) return '-';
    return getBilingualStructureName(org, lang);
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
    asset_org: 'badge-primary',
    stock_item_org: 'badge-info',
    consumable_org: 'badge-warning',
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

    // Assign modal
    const [assignModal, setAssignModal] = useState({ open: false, loading: false, error: '' });
    const [assignItemType, setAssignItemType] = useState('');
    const [assignTab, setAssignTab] = useState('person'); // 'person' or 'org'
    const [assignItemSearch, setAssignItemSearch] = useState('');
    const [assignItems, setAssignItems] = useState([]);
    const [assignSelectedItem, setAssignSelectedItem] = useState(null);
    const [assignPersonSearch, setAssignPersonSearch] = useState('');
    const [assignPersons, setAssignPersons] = useState([]);
    const [assignSelectedPerson, setAssignSelectedPerson] = useState(null);
    const [assignOrgSearch, setAssignOrgSearch] = useState('');
    const [assignOrgs, setAssignOrgs] = useState([]);
    const [assignSelectedOrg, setAssignSelectedOrg] = useState(null);
    const [assignStartDate, setAssignStartDate] = useState('');

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map(r => r.role_code).filter(Boolean) : [];
    }, [user]);

    const allowedTypes = useMemo(() => {
        if (isSuperuser) return ['asset', 'stock_item', 'consumable', 'asset_org', 'stock_item_org', 'consumable_org'];
        const types = [];
        if (roleCodes.includes('asset_responsible')) { types.push('asset'); types.push('asset_org'); }
        if (roleCodes.includes('stock_consumable_responsible')) { types.push('stock_item'); types.push('consumable'); types.push('stock_item_org'); types.push('consumable_org'); }
        if (roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief')) return ['asset', 'stock_item', 'consumable', 'asset_org', 'stock_item_org', 'consumable_org'];
        return types;
    }, [isSuperuser, roleCodes]);

    const canConfirm = useMemo(() => {
        return isSuperuser || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    }, [isSuperuser, roleCodes]);

    const canDischarge = useCallback((itemType) => {
        if (isSuperuser) return true;
        if (itemType === 'asset' || itemType === 'asset_org') return roleCodes.includes('asset_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
        return roleCodes.includes('stock_consumable_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    }, [isSuperuser, roleCodes]);

    const canAssign = useCallback((itemType) => {
        if (isSuperuser) return true;
        if (itemType === 'asset' || itemType === 'asset_org') return roleCodes.includes('asset_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
        return roleCodes.includes('stock_consumable_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    }, [isSuperuser, roleCodes]);

    const canAssignAny = useMemo(() => {
        if (isSuperuser) return true;
        return roleCodes.includes('asset_responsible') || roleCodes.includes('stock_consumable_responsible') || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
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
            } else if (itemType === 'consumable') {
                await consumableAssignmentService.discharge(assignmentId);
            } else if (itemType === 'asset_org') {
                await assetOrgAssignmentService.discharge(assignmentId);
            } else if (itemType === 'stock_item_org') {
                await stockItemOrgAssignmentService.discharge(assignmentId);
            } else if (itemType === 'consumable_org') {
                await consumableOrgAssignmentService.discharge(assignmentId);
            }
            await fetchAssignments();
        } catch (err) {
            setError(t('assignments.dischargeError'));
        } finally {
            setDischargingId(null);
            setDischargeType('');
        }
    };

    const handleConfirm = async (assignmentId, itemType) => {
        setConfirmingId(assignmentId);
        try {
            if (itemType === 'asset') {
                await assetAssignmentService.confirm(assignmentId);
            } else if (itemType === 'stock_item') {
                await stockItemAssignmentService.confirm(assignmentId);
            } else if (itemType === 'consumable') {
                await consumableAssignmentService.confirm(assignmentId);
            } else if (itemType === 'asset_org') {
                await assetOrgAssignmentService.confirm(assignmentId);
            } else if (itemType === 'stock_item_org') {
                await stockItemOrgAssignmentService.confirm(assignmentId);
            } else if (itemType === 'consumable_org') {
                await consumableOrgAssignmentService.confirm(assignmentId);
            }
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

    // Assign item
    const openAssignModal = () => {
        const now = new Date();
        const startDate = now.toISOString().slice(0, 16);
        setAssignModal({ open: true, loading: false, error: '' });
        setAssignItemType(allowedTypes.includes('asset') ? 'asset' : allowedTypes[0] || '');
        setAssignTab('person');
        setAssignItemSearch('');
        setAssignItems([]);
        setAssignSelectedItem(null);
        setAssignPersonSearch('');
        setAssignPersons([]);
        setAssignSelectedPerson(null);
        setAssignOrgSearch('');
        setAssignOrgs([]);
        setAssignSelectedOrg(null);
        setAssignStartDate(startDate);
    };

    const searchAssignItems = async (query, itemType) => {
        setAssignItemSearch(query);
        if (query.trim().length < 2) { setAssignItems([]); return; }
        try {
            const service = itemType === 'asset' ? assetService : itemType === 'stock_item' ? stockItemService : consumableService;
            const result = await service.getAll({ search: query.trim(), page_size: 20, exclude_status: 'assigned,destroyed,suggested_for_destruction' });
            const items = Array.isArray(result) ? result : result.results || [];
            setAssignItems(items);
        } catch { setAssignItems([]); }
    };

    const searchAssignPersons = async (query) => {
        setAssignPersonSearch(query);
        if (query.trim().length < 2) { setAssignPersons([]); return; }
        try {
            const result = await personService.getAll({ search: query.trim(), is_approved: 'true', page_size: 20 });
            setAssignPersons(Array.isArray(result) ? result : result.results || []);
        } catch { setAssignPersons([]); }
    };

    const searchAssignOrgs = async (query) => {
        setAssignOrgSearch(query);
        if (query.trim().length < 2) { setAssignOrgs([]); return; }
        try {
            const result = await organizationalStructureService.getAll({ search: query.trim(), page_size: 20 });
            const orgs = Array.isArray(result) ? result : result.results || [];
            setAssignOrgs(orgs.filter(s => s.is_active));
        } catch { setAssignOrgs([]); }
    };

    const getAssignItemName = (item, itemType) => {
        if (!item) return '-';
        const nameField = itemType === 'asset' ? 'asset_name' : itemType === 'stock_item' ? 'stock_item_name' : 'consumable_name';
        const nameArField = nameField + '_ar';
        const nameEnField = nameField + '_en';
        return getBilingualName(item[nameArField], item[nameEnField], item[nameField], lang);
    };

    const getAssignItemIdentifier = (item, itemType) => {
        if (!item) return '-';
        const invField = itemType === 'asset' ? 'asset_inventory_number' : itemType === 'stock_item' ? 'stock_item_inventory_number' : 'consumable_inventory_number';
        return item[invField] || '-';
    };

    const handleAssign = async () => {
        if (!assignSelectedItem || !assignItemType) return;
        if (assignTab === 'person' && !assignSelectedPerson) return;
        if (assignTab === 'org' && !assignSelectedOrg) return;
        setAssignModal(prev => ({ ...prev, loading: true, error: '' }));
        try {
            const baseItemType = assignItemType.replace('_org', '');
            const idField = baseItemType === 'asset' ? 'asset_id' : baseItemType === 'stock_item' ? 'stock_item_id' : 'consumable_id';
            if (assignTab === 'org') {
                const orgItemType = baseItemType + '_org';
                await assignmentsService.assign({
                    item_type: orgItemType,
                    item_id: assignSelectedItem[idField],
                    organizational_structure_id: assignSelectedOrg.organizational_structure_id,
                    start_datetime: assignStartDate,
                });
            } else {
                await assignmentsService.assign({
                    item_type: assignItemType,
                    item_id: assignSelectedItem[idField],
                    person_id: assignSelectedPerson.person_id,
                    start_datetime: assignStartDate,
                });
            }
            setAssignModal({ open: false, loading: false, error: '' });
            await fetchAssignments();
        } catch (err) {
            const msg = err?.response?.data?.error || t('assignments.assignError');
            setAssignModal(prev => ({ ...prev, loading: false, error: msg }));
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
        if (type === 'asset_org') return t('assignments.assetOrg');
        if (type === 'stock_item_org') return t('assignments.stockItemOrg');
        if (type === 'consumable_org') return t('assignments.consumableOrg');
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
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <UserCheck size={22} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('assignments.title')}
                    </h1>
                    <p className="page-subtitle">{t('assignments.subtitle')}</p>
                </div>
                {canAssignAny && (
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: 'fit-content' }}
                        onClick={openAssignModal}
                    >
                        <PlusCircle size={18} />
                        {t('assignments.assignItem')}
                    </button>
                )}
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

                                const typeIcon = (itemType === 'asset' || itemType === 'asset_org') ? <Box size={18} /> : (itemType === 'stock_item' || itemType === 'stock_item_org') ? <ShoppingCart size={18} /> : <Layers size={18} />;

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
                                                    {assignment.organizational_structure ? (
                                                        <>
                                                            <Building2 size={14} style={{ flexShrink: 0 }} />
                                                            <span>{getStructureName(assignment.organizational_structure, lang)}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User size={14} style={{ flexShrink: 0 }} />
                                                            <span>{getPersonName(assignment.person, lang)}</span>
                                                            {assignment.person_position?.position_label && (
                                                                <span style={{ fontSize: '0.85em', color: 'var(--color-text-muted)' }}>— {assignment.person_position.position_label}</span>
                                                            )}
                                                        </>
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
                                                {isActive && !isConfirmed && canConfirm && (
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8em', padding: '4px 10px', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                                                        disabled={isConfirming}
                                                        onClick={() => handleConfirm(assignment.assignment_id, itemType)}
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

            {/* Assign Item Modal */}
            {assignModal.open && (
                <ModalPortal>
                <div className="modal-overlay am-modal-overlay" onClick={() => setAssignModal(prev => ({ ...prev, open: false }))}>
                    <div className="am-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                        <div className="am-modal-header">
                            <div className="am-modal-header-left">
                                <span className="am-modal-header-icon"><PlusCircle size={16} /></span>
                                <div>
                                    <h3 className="am-modal-title">{t('assignments.assignTitle')}</h3>
                                </div>
                            </div>
                            <button className="am-modal-close" onClick={() => setAssignModal(prev => ({ ...prev, open: false }))}><X size={16} /></button>
                        </div>

                        <div className="am-modal-body">
                            {assignModal.error && <div className="error-message" style={{ marginBottom: 'var(--space-3)' }}>{assignModal.error}</div>}

                            {/* Item Type */}
                            <div className="form-group">
                                <label className="form-label">{t('assignments.itemType')}</label>
                                <select
                                    className="form-input"
                                    value={assignItemType}
                                    onChange={(e) => {
                                        setAssignItemType(e.target.value);
                                        setAssignItemSearch('');
                                        setAssignItems([]);
                                        setAssignSelectedItem(null);
                                    }}
                                >
                                    {allowedTypes.includes('asset') && <option value="asset">{t('assignments.asset')}</option>}
                                    {allowedTypes.includes('stock_item') && <option value="stock_item">{t('assignments.stockItem')}</option>}
                                    {allowedTypes.includes('consumable') && <option value="consumable">{t('assignments.consumable')}</option>}
                                </select>
                            </div>

                            {/* Item Search */}
                            <div className="form-group">
                                <label className="form-label">{t('assignments.selectItem')}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder={t('assignments.searchItemPlaceholder')}
                                        value={assignSelectedItem ? getAssignItemName(assignSelectedItem, assignItemType) : assignItemSearch}
                                        onChange={(e) => {
                                            if (assignSelectedItem) {
                                                setAssignSelectedItem(null);
                                                setAssignItemSearch(e.target.value);
                                            }
                                            searchAssignItems(e.target.value, assignItemType);
                                        }}
                                        onFocus={() => { if (assignSelectedItem) { setAssignSelectedItem(null); setAssignItemSearch(''); } }}
                                        style={{ paddingLeft: 'var(--space-8)' }}
                                    />
                                    <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                </div>
                                {assignItems.length > 0 && !assignSelectedItem && (
                                    <div style={{ marginTop: 'var(--space-2)', maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                                        {assignItems.map(item => {
                                            const idField = assignItemType === 'asset' ? 'asset_id' : assignItemType === 'stock_item' ? 'stock_item_id' : 'consumable_id';
                                            return (
                                                <div
                                                    key={item[idField]}
                                                    style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                    onClick={() => { setAssignSelectedItem(item); setAssignItems([]); setAssignItemSearch(''); }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-card)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <span>{getAssignItemName(item, assignItemType)}</span>
                                                    <span style={{ fontSize: '0.8em', color: 'var(--color-text-secondary)' }}>{getAssignItemIdentifier(item, assignItemType)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {assignSelectedItem && (
                                    <div style={{ marginTop: 'var(--space-2)', fontSize: '0.9em', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        ✓ {getAssignItemName(assignSelectedItem, assignItemType)}
                                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85em' }}>({getAssignItemIdentifier(assignSelectedItem, assignItemType)})</span>
                                    </div>
                                )}
                            </div>

                            {/* Assign To Tabs: Person / Org Structure */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                <button
                                    type="button"
                                    onClick={() => setAssignTab('person')}
                                    style={{
                                        flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${assignTab === 'person' ? 'rgba(16, 185, 129, 0.5)' : 'var(--glass-border)'}`,
                                        background: assignTab === 'person' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                        color: assignTab === 'person' ? '#10b981' : 'var(--color-text-secondary)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                        fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.15s ease',
                                    }}
                                >
                                    <User size={16} /> {t('assignments.assignToPerson', 'Assign to Person')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAssignTab('org')}
                                    style={{
                                        flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${assignTab === 'org' ? 'rgba(16, 185, 129, 0.5)' : 'var(--glass-border)'}`,
                                        background: assignTab === 'org' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                        color: assignTab === 'org' ? '#10b981' : 'var(--color-text-secondary)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                        fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.15s ease',
                                    }}
                                >
                                    <Building2 size={16} /> {t('assignments.assignToOrg', 'Assign to Org Structure')}
                                </button>
                            </div>

                            {assignTab === 'person' ? (
                                /* Person Search */
                                <div className="form-group">
                                    <label className="form-label">{t('assignments.assignTo')}</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder={t('assignments.searchPerson')}
                                        value={assignSelectedPerson ? getPersonName(assignSelectedPerson, lang) : assignPersonSearch}
                                        onChange={(e) => {
                                            if (assignSelectedPerson) {
                                                setAssignSelectedPerson(null);
                                                setAssignPersonSearch(e.target.value);
                                            }
                                            searchAssignPersons(e.target.value);
                                        }}
                                        onFocus={() => { if (assignSelectedPerson) { setAssignSelectedPerson(null); setAssignPersonSearch(''); } }}
                                    />
                                    {assignPersons.length > 0 && !assignSelectedPerson && (
                                        <div style={{ marginTop: 'var(--space-2)', maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                                            {assignPersons.map(p => (
                                                <div
                                                    key={p.person_id}
                                                    style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
                                                    onClick={() => { setAssignSelectedPerson(p); setAssignPersons([]); setAssignPersonSearch(''); }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-card)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {getPersonName(p, lang)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {assignSelectedPerson && (
                                        <div style={{ marginTop: 'var(--space-2)', fontSize: '0.9em', color: 'var(--color-success)' }}>
                                            ✓ {getPersonName(assignSelectedPerson, lang)}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Org Structure Search */
                                <div className="form-group">
                                    <label className="form-label">{t('assignments.assignToOrg', 'Assign to Org Structure')}</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder={t('assignments.searchOrg', 'Search org structure...')}
                                        value={assignSelectedOrg ? getStructureName(assignSelectedOrg, lang) : assignOrgSearch}
                                        onChange={(e) => {
                                            if (assignSelectedOrg) {
                                                setAssignSelectedOrg(null);
                                                setAssignOrgSearch(e.target.value);
                                            }
                                            searchAssignOrgs(e.target.value);
                                        }}
                                        onFocus={() => { if (assignSelectedOrg) { setAssignSelectedOrg(null); setAssignOrgSearch(''); } }}
                                    />
                                    {assignOrgs.length > 0 && !assignSelectedOrg && (
                                        <div style={{ marginTop: 'var(--space-2)', maxHeight: 180, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                                            {assignOrgs.map(o => (
                                                <div
                                                    key={o.organizational_structure_id}
                                                    style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer' }}
                                                    onClick={() => { setAssignSelectedOrg(o); setAssignOrgs([]); setAssignOrgSearch(''); }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-card)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {getStructureName(o, lang)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {assignSelectedOrg && (
                                        <div style={{ marginTop: 'var(--space-2)', fontSize: '0.9em', color: 'var(--color-success)' }}>
                                            ✓ {getStructureName(assignSelectedOrg, lang)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Start Date */}
                            <div className="form-group">
                                <label className="form-label">{t('assignments.startDate')}</label>
                                <input
                                    className="form-input"
                                    type="datetime-local"
                                    value={assignStartDate}
                                    onChange={(e) => setAssignStartDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="am-modal-footer">
                            <button className="am-btn-cancel" onClick={() => setAssignModal(prev => ({ ...prev, open: false }))}>
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                className="am-btn-assign"
                                disabled={!assignSelectedItem || !assignItemType || (assignTab === 'person' && !assignSelectedPerson) || (assignTab === 'org' && !assignSelectedOrg) || assignModal.loading}
                                onClick={handleAssign}
                            >
                                {assignModal.loading ? '...' : <><UserCheck size={16} /> {t('assignments.assignAction')}</>}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
            <FilterSortFAB hasActiveFilters={hasActiveFilters}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.search')}</label>
                        <input className="form-input" type="text" placeholder={t('assignments.searchPlaceholder')} value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }} />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.itemType')}</label>
                        <select className="form-input" value={itemTypeFilter} onChange={(e) => { setItemTypeFilter(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all')}</option>
                            {allowedTypes.includes('asset') && <option value="asset">{t('assignments.asset')}</option>}
                            {allowedTypes.includes('stock_item') && <option value="stock_item">{t('assignments.stockItem')}</option>}
                            {allowedTypes.includes('consumable') && <option value="consumable">{t('assignments.consumable')}</option>}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.status')}</label>
                        <select className="form-input" value={isActiveFilter} onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('assignments.active')}</option>
                            <option value="false">{t('assignments.inactive')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.dateFrom')}</label>
                        <input className="form-input" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }} />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.dateTo')}</label>
                        <input className="form-input" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }} />
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.confirmed')}</label>
                        <select className="form-input" value={confirmedFilter} onChange={(e) => { setConfirmedFilter(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('common.all')}</option>
                            <option value="true">{t('assignments.confirmedYes')}</option>
                            <option value="false">{t('assignments.confirmedNo')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.sortBy')}</label>
                        <select className="form-input" value={sortField} onChange={(e) => { setSortField(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }}>
                            <option value="-start_datetime">{t('assignments.sortNewestFirst')}</option>
                            <option value="start_datetime">{t('assignments.sortOldestFirst')}</option>
                            <option value="-end_datetime">{t('assignments.sortEndNewest')}</option>
                            <option value="end_datetime">{t('assignments.sortEndOldest')}</option>
                            <option value="-assignment_id">{t('assignments.sortIdDesc')}</option>
                            <option value="assignment_id">{t('assignments.sortIdAsc')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('assignments.position')}</label>
                        <select className="form-input" value={positionFilter} onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }} style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('assignments.allPositions')}</option>
                            {positions.map(p => (
                                <option key={p.position_id} value={p.position_id}>{p.position_label}</option>
                            ))}
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: '500', whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('assignments.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </>
    );
};

export default AssignmentsPage;
