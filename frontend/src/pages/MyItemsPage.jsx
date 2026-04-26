import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    ShoppingCart, 
    Layers, 
    History, 
    AlertCircle, 
    Search, 
    RefreshCw, 
    Clock,
    X,
    CheckCircle2,
    Hash,
    Tag,
    XCircle,
    SlidersHorizontal,
    ArrowUpDown,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { myItemsService, problemReportService, locationService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows, SkeletonCardList } from '../components/SkeletonCard';

const MyItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assets');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const [myItems, setMyItems] = useState(null);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportObservation, setReportObservation] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportModalError, setReportModalError] = useState('');
    const [eligibleItems, setEligibleItems] = useState({ stock_items: [], consumables: [] });
    const [selectedStockItems, setSelectedStockItems] = useState([]);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [maintenanceLocations, setMaintenanceLocations] = useState([]);
    const [destinationLocationId, setDestinationLocationId] = useState('');
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const tabContainerRef = useRef(null);
    const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });

    const updateTabIndicator = () => {
        if (!tabContainerRef.current) return;
        const activeBtn = tabContainerRef.current.querySelector('[data-tab-active="true"]');
        if (activeBtn) {
            const containerRect = tabContainerRef.current.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            setTabIndicator({
                left: btnRect.left - containerRect.left,
                width: btnRect.width,
            });
        }
    };

    useEffect(() => {
        updateTabIndicator();
        window.addEventListener('resize', updateTabIndicator);
        return () => window.removeEventListener('resize', updateTabIndicator);
    }, [activeTab]);

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief' || r.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const filteredCurrentItems = useMemo(() => {
        if (!myItems) return [];
        const current = activeTab === 'assets' ? myItems.assets?.current : 
                       activeTab === 'stock_items' ? myItems.stock_items?.current : 
                       myItems.consumables?.current;
        
        if (!current) return [];
        
        let result = current.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const name = (activeTab === 'assets' ? item.asset_name : 
                         activeTab === 'stock_items' ? item.stock_item_name : 
                         item.consumable_name) || '';
            const id = String(activeTab === 'assets' ? item.asset_id : 
                             activeTab === 'stock_items' ? item.stock_item_id : 
                             item.consumable_id);
            const inventory = (activeTab === 'assets' ? item.asset_inventory_number : 
                              activeTab === 'stock_items' ? item.stock_item_inventory_number : 
                              item.consumable_inventory_number) || '';
            
            const matchesSearch = name.toLowerCase().includes(searchLower) || 
                   id.includes(searchLower) || 
                   inventory.toLowerCase().includes(searchLower);

            const status = activeTab === 'assets' ? item.asset_status : 
                          activeTab === 'stock_items' ? item.stock_item_status : 
                          item.consumable_status;
            const matchesStatus = !filterStatus || 
                (status && status.toLowerCase() === filterStatus.toLowerCase());

            return matchesSearch && matchesStatus;
        });

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                const nameA = (activeTab === 'assets' ? a.asset_name : activeTab === 'stock_items' ? a.stock_item_name : a.consumable_name || '').toLowerCase();
                const nameB = (activeTab === 'assets' ? b.asset_name : activeTab === 'stock_items' ? b.stock_item_name : b.consumable_name || '').toLowerCase();
                cmp = nameA.localeCompare(nameB, i18n.language === 'ar' ? 'ar' : undefined);
            } else if (sortField === 'id') {
                const idA = activeTab === 'assets' ? a.asset_id : activeTab === 'stock_items' ? a.stock_item_id : a.consumable_id;
                const idB = activeTab === 'assets' ? b.asset_id : activeTab === 'stock_items' ? b.stock_item_id : b.consumable_id;
                cmp = idA - idB;
            } else if (sortField === 'inventory') {
                const invA = (activeTab === 'assets' ? a.asset_inventory_number : activeTab === 'stock_items' ? a.stock_item_inventory_number : a.consumable_inventory_number || '').toLowerCase();
                const invB = (activeTab === 'assets' ? b.asset_inventory_number : activeTab === 'stock_items' ? b.stock_item_inventory_number : b.consumable_inventory_number || '').toLowerCase();
                cmp = invA.localeCompare(invB);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [myItems, activeTab, searchTerm, filterStatus, sortField, sortDirection, i18n.language]);

    const sortOptions = [
        { field: 'name', dir: 'asc', label: `${t('myItems.sortByName')} — ${t('myItems.ascending')}` },
        { field: 'name', dir: 'desc', label: `${t('myItems.sortByName')} — ${t('myItems.descending')}` },
        { field: 'id', dir: 'asc', label: `${t('myItems.sortById')} — ${t('myItems.ascending')}` },
        { field: 'id', dir: 'desc', label: `${t('myItems.sortById')} — ${t('myItems.descending')}` },
        { field: 'inventory', dir: 'asc', label: `${t('myItems.sortByInventory')} — ${t('myItems.ascending')}` },
        { field: 'inventory', dir: 'desc', label: `${t('myItems.sortByInventory')} — ${t('myItems.descending')}` },
    ];

    const getTabLabel = (tab) => {
        if (tab === 'assets') return t('myItems.assets');
        if (tab === 'stock_items') return t('myItems.stockItems');
        if (tab === 'consumables') return t('myItems.consumables');
        return tab;
    };

    const hasActiveFilters = searchTerm.trim() || filterStatus;

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilterStatus('');
        setSortField('name');
        setSortDirection('asc');
    };

    const loadMyItems = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await myItemsService.get();
            setMyItems(data);
        } catch {
            setError(t('myItems.failedLoadItems'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyItems();
    }, []);

    useEffect(() => {
        if (!showSortMenu) return;
        const handler = () => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    const openReportModal = async (target) => {
        setSuccessMessage('');
        setError('');
        setReportModalError('');
        setReportTarget(target);
        setReportObservation('');
        setSelectedStockItems([]);
        setSelectedConsumables([]);
        setDestinationLocationId('');
        setShowReportModal(true);

        if (target.item_type === 'asset') {
            try {
                setLoadingEligible(true);
                const data = await problemReportService.getEligibleItems(target.item_id);
                setEligibleItems(data || { stock_items: [], consumables: [] });
            } catch (err) {
                console.error('Failed to load eligible items:', err);
                setEligibleItems({ stock_items: [], consumables: [] });
            }

            try {
                setLoadingLocations(true);
                const locations = await locationService.getByLocationType(2);
                setMaintenanceLocations(Array.isArray(locations) ? locations : []);
            } catch (err) {
                console.error('Failed to load maintenance locations:', err);
                setMaintenanceLocations([]);
            } finally {
                setLoadingLocations(false);
            }
        } else {
            setEligibleItems({ stock_items: [], consumables: [] });
            setMaintenanceLocations([]);
        }
    };

    const toggleItemSelection = (id, type) => {
        if (type === 'stock_item') {
            setSelectedStockItems(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        } else {
            setSelectedConsumables(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        }
    };

    const submitReport = async () => {
        if (!reportTarget) return;
        if (!reportObservation.trim()) {
            setReportModalError(t('myItems.pleaseEnterObservation'));
            return;
        }

        const hasIncludedItems = selectedStockItems.length > 0 || selectedConsumables.length > 0;
        if (reportTarget.item_type === 'asset' && hasIncludedItems && !destinationLocationId) {
            setReportModalError(t('myItems.selectDestForIncluded'));
            return;
        }

        try {
            setReportSubmitting(true);
            setError('');
            setReportModalError('');
            setSuccessMessage('');
            await problemReportService.create({
                item_type: reportTarget.item_type,
                item_id: reportTarget.item_id,
                owner_observation: reportObservation.trim(),
                included_stock_item_ids: selectedStockItems,
                included_consumable_ids: selectedConsumables,
                destination_location_id: hasIncludedItems ? (destinationLocationId || null) : null,
            });
            setShowReportModal(false);
            setReportTarget(null);
            setReportObservation('');
            setSuccessMessage(t('myItems.reportSubmitted'));
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || t('myItems.failedSubmitReport');
            setReportModalError(typeof msg === 'string' ? msg : t('myItems.failedSubmitReport'));
        } finally {
            setReportSubmitting(false);
        }
    };

    const renderItemCard = (item, type) => {
        const id = type === 'asset' ? item.asset_id : type === 'stock_item' ? item.stock_item_id : item.consumable_id;
        const name = type === 'asset' ? item.asset_name : type === 'stock_item' ? item.stock_item_name : item.consumable_name;
        const inventory = type === 'asset' ? item.asset_inventory_number : type === 'stock_item' ? item.stock_item_inventory_number : item.consumable_inventory_number;
        const status = type === 'asset' ? item.asset_status : type === 'stock_item' ? item.stock_item_status : item.consumable_status;
        const statusAr = type === 'asset' ? item.asset_status_ar : type === 'stock_item' ? item.stock_item_status_ar : item.consumable_status_ar;
        const statusEn = type === 'asset' ? item.asset_status_en : type === 'stock_item' ? item.stock_item_status_en : item.consumable_status_en;
        const displayStatus = (() => {
            const lang = i18n.language;
            if (lang === 'ar') {
                if (statusAr && statusEn && statusAr !== statusEn) return `${statusAr} (${statusEn})`;
                return statusAr || statusEn || status;
            }
            if (statusEn && statusAr && statusEn !== statusAr) return `${statusEn} (${statusAr})`;
            return statusEn || statusAr || status;
        })();
        const serial = type === 'asset' ? item.asset_serial_number : type === 'consumable' ? item.consumable_serial_number : null;

        return (
            <div key={`${type}-${id}`} className="card" style={{ transition: 'all 0.2s ease' }}>
                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: 'var(--glass-bg)', 
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-accent-primary)'
                        }}>
                            {type === 'asset' ? <Box size={20} /> : type === 'stock_item' ? <ShoppingCart size={20} /> : <Layers size={20} />}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {type === 'asset' && (
                                <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px' }}
                                    onClick={() => navigate(`/dashboard/my-items/assets/${id}/maintenance-timeline`)}
                                    title={t('myItems.viewMaintenance')}
                                >
                                    <Clock size={16} />
                                </button>
                            )}
                            <button 
                                className="btn btn-secondary" 
                                style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', color: 'var(--color-error)' }}
                                onClick={() => openReportModal({ item_type: type, item_id: id, item_label: name })}
                                title={t('myItems.reportProblem')}
                            >
                                <AlertCircle size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                        {name || `${type === 'asset' ? t('myItems.assetLabel') : type === 'stock_item' ? t('myItems.stockItemLabel') : t('myItems.consumableLabel')} #${id}`}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Hash size={14} />
                            <span>{t('myItems.inv')}: {inventory || t('common.na')}</span>
                        </div>
                        {serial && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Tag size={14} />
                                <span>{t('myItems.sn')}: {serial}</span>
                            </div>
                        )}
                        <div style={{ marginTop: 'var(--space-2)' }}>
                            <span className={`badge badge-${status?.toLowerCase() === 'active' || status?.toLowerCase() === 'assigned' ? 'success' : 'warning'}`}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderHistoryTable = (rows, type) => {
        if (!rows || rows.length === 0) {
            return (
                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                    <div className="empty-state-icon">
                        <History size={48} />
                    </div>
                    <h3 className="empty-state-title">{t('myItems.noHistory')}</h3>
                    <p className="empty-state-text">{t('myItems.noPreviousOwnership')}</p>
                </div>
            );
        }

        return (
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('myItems.itemName')}</th>
                            <th>{t('myItems.startDate')}</th>
                            <th>{t('myItems.endDate')}</th>
                            <th>{t('myItems.condition')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const itemName = type === 'assets' ? r.asset?.asset_name : 
                                           type === 'stock_items' ? r.stock_item?.stock_item_name : 
                                           r.consumable?.consumable_name;
                            const itemId = type === 'assets' ? r.asset?.asset_id : 
                                         type === 'stock_items' ? r.stock_item?.stock_item_id : 
                                         r.consumable?.consumable_id;
                            
                            return (
                                <tr key={r.assignment_id}>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{itemName}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{t('myItems.idLabel')}: #{itemId}</div>
                                    </td>
                                    <td>{r.start_datetime ? new Date(r.start_datetime).toLocaleDateString() : '-'}</td>
                                    <td>{r.end_datetime ? new Date(r.end_datetime).toLocaleDateString() : t('myItems.present')}</td>
                                    <td>
                                        <span className="badge badge-secondary">{r.condition_on_assignment || t('common.na')}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Box size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('myItems.title')}</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        {t('myItems.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={loadMyItems} 
                        disabled={loading}
                        style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>{t('myItems.refresh')}</span>
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="success-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            <div style={{ marginBottom: 'var(--space-5)' }}>
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-backdrop)',
                    WebkitBackdropFilter: 'var(--glass-backdrop)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-2) var(--space-4)',
                    boxShadow: 'var(--glass-shadow)'
                }}>
                    {/* Tab Buttons */}
                    <div ref={tabContainerRef} style={{ padding: '0', display: 'inline-flex', borderRadius: 'var(--radius-md)', alignItems: 'stretch', position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: tabIndicator.left,
                            width: tabIndicator.width,
                            height: '100%',
                            background: 'var(--color-accent-primary)',
                            borderRadius: 'var(--radius-md)',
                            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 0,
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        }} />
                        <button 
                            data-tab-active={activeTab === 'assets' ? 'true' : undefined}
                            onClick={() => setActiveTab('assets')}
                            style={{ 
                                padding: 'var(--space-2) var(--space-6)', 
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                color: activeTab === 'assets' ? '#fff' : 'var(--color-text-secondary)',
                                border: 'none',
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '36px',
                                position: 'relative',
                                zIndex: 1,
                                transition: 'color 0.3s ease',
                                fontWeight: activeTab === 'assets' ? '600' : '400',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            {t('myItems.assets')}
                        </button>
                        <button 
                            data-tab-active={activeTab === 'stock_items' ? 'true' : undefined}
                            onClick={() => setActiveTab('stock_items')}
                            style={{ 
                                padding: 'var(--space-2) var(--space-6)', 
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                color: activeTab === 'stock_items' ? '#fff' : 'var(--color-text-secondary)',
                                border: 'none',
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '36px',
                            textAlign: 'center',
                            lineHeight: '1.2',
                                position: 'relative',
                                zIndex: 1,
                                transition: 'color 0.3s ease',
                                fontWeight: activeTab === 'stock_items' ? '600' : '400',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            {t('myItems.stockItems')}
                        </button>
                        <button 
                            data-tab-active={activeTab === 'consumables' ? 'true' : undefined}
                            onClick={() => setActiveTab('consumables')}
                            style={{ 
                                padding: 'var(--space-2) var(--space-6)', 
                                borderRadius: 'var(--radius-md)',
                                background: 'transparent',
                                color: activeTab === 'consumables' ? '#fff' : 'var(--color-text-secondary)',
                                border: 'none',
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '36px',
                                position: 'relative',
                                zIndex: 1,
                                transition: 'color 0.3s ease',
                                fontWeight: activeTab === 'consumables' ? '600' : '400',
                                fontSize: 'var(--font-size-sm)',
                            }}
                        >
                            {t('myItems.consumables')}
                        </button>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '28px', background: 'var(--glass-border)', flexShrink: 0 }} />

                    {/* Search */}
                    {!loading && !error && myItems && (
                    <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('myItems.searchPlaceholder', { type: getTabLabel(activeTab) })}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                paddingRight: searchTerm ? 'var(--space-10)' : 'var(--space-4)'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--space-3)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    )}

                    {/* Filter by Status */}
                    {!loading && !error && myItems && (
                    <div style={{ position: 'relative', minWidth: '160px' }}>
                        <SlidersHorizontal size={16} style={{
                            position: 'absolute',
                            left: 'var(--space-3)',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none',
                            zIndex: 1
                        }} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="form-input"
                            style={{
                                width: '100%',
                                height: '42px',
                                paddingLeft: 'var(--space-10)',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">{t('myItems.allStatuses')}</option>
                            <option value="not_delivered_to_company">{t('myItems.statusNotDelivered')}</option>
                            <option value="in_stock">{t('myItems.statusInStock')}</option>
                            <option value="assigned">{t('myItems.statusAssigned')}</option>
                            <option value="maintenance">{t('myItems.statusMaintenance')}</option>
                            <option value="failed">{t('myItems.statusFailed')}</option>
                            <option value="lost">{t('myItems.statusLost')}</option>
                            <option value="stolen">{t('myItems.statusStolen')}</option>
                            <option value="irrecoverably_damaged">{t('myItems.statusIrrecoverablyDamaged')}</option>
                            <option value="destroyed">{t('myItems.statusDestroyed')}</option>
                            <option value="suggested_for_destruction">{t('myItems.statusSuggestedForDestruction')}</option>
                        </select>
                    </div>
                    )}

                    {/* Sort */}
                    {!loading && !error && myItems && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowSortMenu(!showSortMenu);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-4)',
                                height: '42px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-backdrop)',
                                WebkitBackdropFilter: 'var(--glass-backdrop)',
                                color: 'var(--color-text-secondary)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: 'var(--font-size-sm)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <ArrowUpDown size={16} />
                            <span>{sortField === 'name' ? t('myItems.sortByName') : sortField === 'inventory' ? t('myItems.sortByInventory') : 'ID'}</span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                {sortDirection === 'asc' ? t('myItems.ascending') : t('myItems.descending')}
                            </span>
                            <ChevronDown size={14} style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>
                        {showSortMenu && (
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    right: 0,
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'var(--glass-backdrop)',
                                    WebkitBackdropFilter: 'var(--glass-backdrop)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--glass-shadow)',
                                    padding: 'var(--space-2)',
                                    zIndex: 100,
                                    minWidth: '200px'
                                }}
                            >
                                <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('common.sortBy')}
                                </div>
                                {sortOptions.map(opt => (
                                    <button
                                        key={`${opt.field}-${opt.dir}`}
                                        onClick={() => {
                                            setSortField(opt.field);
                                            setSortDirection(opt.dir);
                                            setShowSortMenu(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                            padding: 'var(--space-2) var(--space-3)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: sortField === opt.field && sortDirection === opt.dir ? '600' : '400',
                                            color: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)',
                                            background: sortField === opt.field && sortDirection === opt.dir ? 'var(--color-accent-glow)' : 'transparent',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!(sortField === opt.field && sortDirection === opt.dir)) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    )}

                    {/* Clear Filters */}
                    {hasActiveFilters && (!loading && !error && myItems) && (
                        <button
                            onClick={clearAllFilters}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                padding: 'var(--space-2) var(--space-3)',
                                height: '42px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: 'var(--color-error)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '500',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <X size={14} />
                            {t('myItems.clearFilters')}
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {!loading && !error && myItems && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', fontWeight: '600' }}>
                    {t('myItems.resultCount', { count: filteredCurrentItems.length })}
                </div>
            )}

            <div style={{ marginBottom: 'var(--space-12)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Box size={20} className="text-accent" />
                    {t('myItems.currentlyOwned')}
                </h2>
                
                {loading ? (
                    <div style={{ padding: 'var(--space-16)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                            <SkeletonCardList count={6} cardLines={2} gap="var(--space-6)" bodyPadding="var(--space-5)" style={{ display: 'contents' }} />
                        </div>
                    </div>
                ) : filteredCurrentItems.length === 0 ? (
                    <div className="empty-state" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)', boxShadow: 'var(--glass-shadow)' }}>
                        <div className="empty-state-icon">
                            {activeTab === 'assets' ? <Box size={64} /> : activeTab === 'stock_items' ? <ShoppingCart size={64} /> : <Layers size={64} />}
                        </div>
                        <h3 className="empty-state-title">{t('myItems.noItemsFound')}</h3>
                        <p className="empty-state-text">
                            {searchTerm ? t('myItems.noResultsFor', { searchTerm }) : t('myItems.noAssignedItems', { type: getTabLabel(activeTab) })}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                        {filteredCurrentItems.map(item => renderItemCard(item, activeTab.slice(0, -1)))}
                    </div>
                )}
            </div>

            <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <History size={20} className="text-accent" />
                    {t('myItems.ownershipHistory')}
                </h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-8)' }}>
                            <SkeletonListRows count={6} />
                        </div>
                    ) : (
                        renderHistoryTable(
                            activeTab === 'assets' ? myItems?.assets?.history : 
                            activeTab === 'stock_items' ? myItems?.stock_items?.history : 
                            myItems?.consumables?.history,
                            activeTab
                        )
                    )}
                </div>
            </div>

            {showReportModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'var(--overlay-bg)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 50,
                    }}
                    onClick={() => {
                        if (!reportSubmitting) {
                            setShowReportModal(false);
                            setReportTarget(null);
                        }
                    }}
                >
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 600, boxShadow: 'var(--glass-shadow)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{t('myItems.reportProblemTitle')}</h2>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                onClick={() => {
                                    if (!reportSubmitting) {
                                        setShowReportModal(false);
                                        setReportTarget(null);
                                    }
                                }}
                            >
                                {t('common.close')}
                            </button>
                        </div>

                        <div style={{ padding: 'var(--space-4)' }}>
                            <div style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                                {reportTarget ? `${reportTarget.item_label} (${reportTarget.item_type} #${reportTarget.item_id})` : ''}
                            </div>

                            {reportModalError ? (
                                <div
                                    style={{
                                        marginBottom: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--color-error)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-error)',
                                        background: 'rgba(220, 38, 38, 0.08)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {reportModalError}
                                </div>
                            ) : null}

                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                {t('myItems.observation')}
                            </label>
                            <textarea
                                value={reportObservation}
                                onChange={(e) => setReportObservation(e.target.value)}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    fontSize: 'var(--font-size-sm)',
                                    boxSizing: 'border-box',
                                    marginBottom: 'var(--space-4)',
                                }}
                            />

                            {reportTarget?.item_type === 'asset' && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>{t('myItems.includeOtherItems')}</h3>
                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                                            {t('myItems.destinationMaintenanceLocation')}
                                        </label>
                                        <select
                                            value={destinationLocationId}
                                            onChange={(e) => setDestinationLocationId(e.target.value)}
                                            disabled={loadingLocations}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                background: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                            }}
                                        >
                                            <option value="">{loadingLocations ? t('myItems.loadingLocations') : t('myItems.selectMaintenanceLocation')}</option>
                                            {maintenanceLocations.map((r) => (
                                                <option key={r.location_id} value={String(r.location_id)}>
                                                    {r.location_name} (#{r.location_id})
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {t('myItems.onlyMaintenanceLocations')}
                                        </div>
                                    </div>

                                    {loadingEligible ? (
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{t('myItems.loadingEligibleItems')}</div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                                                    <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>{t('myItems.stockItemsLabel')}</h4>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedStockItems(eligibleItems.stock_items.map((s) => s.stock_item_id))}
                                                            disabled={eligibleItems.stock_items.length === 0}
                                                        >
                                                            {t('myItems.selectAll')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedStockItems([])}
                                                            disabled={selectedStockItems.length === 0}
                                                        >
                                                            {t('common.clear')}
                                                        </button>
                                                    </div>
                                                </div>
                                                {eligibleItems.stock_items.length === 0 ? (
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('myItems.noneAvailable')}</div>
                                                ) : (
                                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                        {eligibleItems.stock_items.map(s => (
                                                            <label key={s.stock_item_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)', cursor: 'pointer' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedStockItems.includes(s.stock_item_id)}
                                                                    onChange={() => toggleItemSelection(s.stock_item_id, 'stock_item')}
                                                                />
                                                                <span>{s.stock_item_name} ({s.stock_item_inventory_number})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                                                    <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>{t('myItems.consumablesLabel')}</h4>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedConsumables(eligibleItems.consumables.map((c) => c.consumable_id))}
                                                            disabled={eligibleItems.consumables.length === 0}
                                                        >
                                                            {t('myItems.selectAll')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedConsumables([])}
                                                            disabled={selectedConsumables.length === 0}
                                                        >
                                                            {t('common.clear')}
                                                        </button>
                                                    </div>
                                                </div>
                                                {eligibleItems.consumables.length === 0 ? (
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('myItems.noneAvailable')}</div>
                                                ) : (
                                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                        {eligibleItems.consumables.map(c => (
                                                            <label key={c.consumable_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)', cursor: 'pointer' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedConsumables.includes(c.consumable_id)}
                                                                    onChange={() => toggleItemSelection(c.consumable_id, 'consumable')}
                                                                />
                                                                <span>{c.consumable_name} ({c.consumable_inventory_number})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        if (!reportSubmitting) {
                                            setShowReportModal(false);
                                            setReportTarget(null);
                                        }
                                    }}
                                    disabled={reportSubmitting}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={submitReport}
                                    disabled={reportSubmitting}
                                >
                                    {reportSubmitting ? t('common.saving') : t('myItems.reportProblem')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyItemsPage;
