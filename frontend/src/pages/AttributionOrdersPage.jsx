import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    X,
    ChevronDown,
    ClipboardList
} from 'lucide-react';
import {
    attributionOrderService,
    warehouseService,
    assetTypeService,
    assetModelService,
    assetService,
    attributionOrderAssetStockItemAccessoryService,
    attributionOrderAssetConsumableAccessoryService,
    receiptReportService,
    administrativeCertificateService
} from '../services/api';

const AttributionOrdersPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [warehouses, setWarehouses] = useState([]);
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetModels, setAssetModels] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [orderData, setOrderData] = useState({
        attribution_order_full_code: '',
        attribution_order_date: new Date().toISOString().split('T')[0],
        warehouse: '',
        attribution_order_barcode: ''
    });

    const [assets, setAssets] = useState([]);

    const [bulkAdd, setBulkAdd] = useState({
        asset_type: '',
        asset_model: '',
        quantity: 1,
    });

    const [viewMode, setViewMode] = useState('list');
    const [ordersList, setOrdersList] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderAssets, setOrderAssets] = useState([]);
    const [showReceiptForm, setShowReceiptForm] = useState(false);
    const [receiptData, setReceiptData] = useState({ report_full_code: '', digital_copy: null });
    const [orderReceipt, setOrderReceipt] = useState(null);
    const [previewReceipt, setPreviewReceipt] = useState(false);
    const [includedItems, setIncludedItems] = useState({ stock_items: [], consumables: [] });

    const [searchParams, setSearchParams] = useSearchParams();

    // Search, filter, sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState('');
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const getMimeType = (b64) => {
        if (!b64) return 'application/octet-stream';
        if (b64.startsWith('JVBERi0')) return 'application/pdf';
        if (b64.startsWith('/9j/')) return 'image/jpeg';
        if (b64.startsWith('iVBORw0K')) return 'image/png';
        return 'application/octet-stream';
    };

    useEffect(() => {
        // Load draft data first, then handle URL params
        try {
            const draftAssets = JSON.parse(sessionStorage.getItem('attribution_order_create_draft_assets') || '[]');
            if (Array.isArray(draftAssets) && draftAssets.length > 0) {
                setAssets(draftAssets);
                // Pre-fetch models for asset types in draft
                const typeIds = [...new Set(draftAssets.map(a => a.asset_type).filter(Boolean))];
                typeIds.forEach(async (typeId) => {
                    try {
                        const models = await assetModelService.getByAssetType(typeId);
                        setAssetModels(prev => ({ ...prev, [typeId]: models }));
                    } catch (err) {
                        console.error('Failed to fetch models for type', typeId);
                    }
                });
            }
        } catch (e) {
            // ignore
        }
        try {
            const draftOrderData = JSON.parse(sessionStorage.getItem('attribution_order_create_draft_order_data') || 'null');
            if (draftOrderData) {
                setOrderData(draftOrderData);
            }
        } catch (e) {
            // ignore
        }

        // Handle URL params for mode switching
        const mode = searchParams.get('mode');
        const orderId = searchParams.get('orderId');
        
        if (mode === 'create') {
            setViewMode('create');
            searchParams.delete('mode');
            setSearchParams(searchParams);
        } else if (orderId) {
            const loadOrder = async () => {
                try {
                    const order = await attributionOrderService.getById(orderId);
                    if (order) {
                        setSelectedOrder(order);
                        setViewMode('detail');
                        const assetsData = await assetService.getAll({ attribution_order: order.attribution_order_id });
                        setOrderAssets(assetsData.results || assetsData || []);
                    }
                } catch (err) {
                    console.error('Failed to load order:', err);
                }
            };
            loadOrder();
            searchParams.delete('orderId');
            setSearchParams(searchParams);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Only fetch list if we're in list mode AND not about to switch to create/detail mode
        const mode = searchParams.get('mode');
        const orderId = searchParams.get('orderId');
        if (viewMode === 'list' && !mode && !orderId) {
            fetchOrdersList();
            setSelectedOrder(null);
            setOrderAssets([]);
            setOrderReceipt(null);
            setShowReceiptForm(false);
            setIncludedItems({ stock_items: [], consumables: [] });
        }
    }, [viewMode]);

    const persistDraftAssets = (nextAssets) => {
        try {
            sessionStorage.setItem('attribution_order_create_draft_assets', JSON.stringify(nextAssets));
        } catch (e) {
            // ignore
        }
    };

    const persistDraftOrderData = (data) => {
        try {
            sessionStorage.setItem('attribution_order_create_draft_order_data', JSON.stringify(data));
        } catch (e) {
            // ignore
        }
    };

    const filteredOrders = useMemo(() => {
        let result = [...ordersList];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(order => {
                const code = (order.attribution_order_full_code || '').toLowerCase();
                const barcode = (order.attribution_order_barcode || '').toLowerCase();
                const id = `#${order.attribution_order_id}`;
                return code.includes(q) || barcode.includes(q) || id.includes(q);
            });
        }

        // Filter by warehouse
        if (filterWarehouse) {
            result = result.filter(order => String(order.warehouse) === String(filterWarehouse));
        }

        // Sort
        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'code') {
                const codeA = (a.attribution_order_full_code || '').toLowerCase();
                const codeB = (b.attribution_order_full_code || '').toLowerCase();
                cmp = codeA.localeCompare(codeB);
            } else if (sortField === 'date') {
                const dateA = new Date(a.attribution_order_date || 0).getTime();
                const dateB = new Date(b.attribution_order_date || 0).getTime();
                cmp = dateA - dateB;
            } else if (sortField === 'id') {
                cmp = (a.attribution_order_id || 0) - (b.attribution_order_id || 0);
            }
            return sortDirection === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [ordersList, searchQuery, filterWarehouse, sortField, sortDirection]);

    const hasActiveFilters = searchQuery.trim() || filterWarehouse;

    const clearAllFilters = () => {
        setSearchQuery('');
        setFilterWarehouse('');
        setSortField('date');
        setSortDirection('desc');
    };

    // Close sort menu on outside click
    useEffect(() => {
        if (!showSortMenu) return;
        const handler = (e) => setShowSortMenu(false);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [showSortMenu]);

    const handleRowClick = async (order) => {
        setSelectedOrder(order);
        setViewMode('detail');
        setLoading(true);
        setOrderReceipt(null);
        try {
            const assetsData = await assetService.getAll({ attribution_order: order.attribution_order_id });
            setOrderAssets(assetsData.results || assetsData || []);

            const certData = await administrativeCertificateService.getAll({ attribution_order: order.attribution_order_id });
            const certificates = certData.results || certData || [];
            if (certificates.length > 0 && certificates[0].receipt_report) {
                const receiptId = certificates[0].receipt_report;
                const receiptInfo = await receiptReportService.getById(receiptId);
                setOrderReceipt(receiptInfo);
            }

            // Fetch included items (stock items and consumables)
            const itemsData = await attributionOrderService.getIncludedItems(order.attribution_order_id);
            setIncludedItems(itemsData);
        } catch (err) {
            setError(t('attributionOrders.fetchAssetsOrReceiptError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdersList = async () => {
        setLoading(true);
        try {
            const data = await attributionOrderService.getAll();
            setOrdersList(data);
        } catch (err) {
            setError(t('attributionOrders.fetchOrdersError'));
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [wData, tData] = await Promise.all([
                warehouseService.getAll(),
                assetTypeService.getAll()
            ]);
            setWarehouses(wData);
            setAssetTypes(tData);
            setLoading(false);
        } catch (err) {
            setError(t('attributionOrders.fetchInitialDataError'));
            setLoading(false);
        }
    };

    const handleOrderChange = (e) => {
        const newData = { ...orderData, [e.target.name]: e.target.value };
        setOrderData(newData);
        persistDraftOrderData(newData);
    };

    const handleAssetChange = async (index, field, value) => {
        const newAssets = [...assets];
        newAssets[index][field] = value;

        if (field === 'asset_type') {
            newAssets[index].asset_model = '';
            if (value && !assetModels[value]) {
                try {
                    const models = await assetModelService.getByAssetType(value);
                    setAssetModels(prev => ({ ...prev, [value]: models }));
                } catch (err) {
                    console.error('Failed to fetch models for type', value);
                }
            }
        }
        setAssets(newAssets);
        persistDraftAssets(newAssets);
    };

    const handleBulkTypeChange = async (value) => {
        setBulkAdd((prev) => ({ ...prev, asset_type: value, asset_model: '' }));
        if (value && !assetModels[value]) {
            try {
                const models = await assetModelService.getByAssetType(value);
                setAssetModels(prev => ({ ...prev, [value]: models }));
            } catch (err) {
                console.error('Failed to fetch models for type', value);
            }
        }
    };

    const addBulkAssets = () => {
        const qty = Number(bulkAdd.quantity);
        if (!bulkAdd.asset_type || !bulkAdd.asset_model || !Number.isFinite(qty) || qty < 1) return;

        const now = Date.now();
        const newRows = Array.from({ length: qty }, (_, i) => ({
            id: now + i,
            asset_type: bulkAdd.asset_type,
            asset_model: bulkAdd.asset_model,
            asset_serial_number: '',
            asset_inventory_number: '',
            asset_name: ''
        }));

        setAssets((prev) => {
            const merged = [...prev, ...newRows];
            persistDraftAssets(merged);
            return merged;
        });
        setBulkAdd((prev) => ({ ...prev, quantity: 1 }));
    };

    const addAssetRow = () => {
        const next = [...assets, { id: Date.now(), asset_type: '', asset_model: '', asset_serial_number: '', asset_inventory_number: '', asset_name: '' }];
        setAssets(next);
        persistDraftAssets(next);
    };

    const removeAssetRow = (index) => {
        if (assets.length > 0) {
            const next = assets.filter((_, i) => i !== index);
            setAssets(next);
            persistDraftAssets(next);
        }
    };

    const configureIncludedItemsForRow = (asset, itemKind) => {
        // Ensure latest draft is persisted before navigating
        persistDraftAssets(assets);
        const context = viewMode === 'create' ? 'create' : selectedOrder?.attribution_order_id;
        navigate(`/dashboard/attribution-orders/assets/${asset.id}/included-items/${itemKind}?context=${context}`);
    };

    const configureAccessoriesForRow = (asset) => {
        persistDraftAssets(assets);
        const context = viewMode === 'create' ? 'create' : selectedOrder?.attribution_order_id;
        navigate(`/dashboard/attribution-orders/assets/${asset.id}/accessories?context=${context}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            let draftIncluded = {};
            try {
                draftIncluded = JSON.parse(sessionStorage.getItem('attribution_order_create_draft_included_items') || '{}');
            } catch (e) {
                draftIncluded = {};
            }

            // 1. Create the Attribution Order
            const orderResponse = await attributionOrderService.create(orderData);
            const orderId = orderResponse.attribution_order_id;

            // 2. Create all Assets linked to this order sequentially to avoid DB unique constraint conflicts
            console.log('[handleSubmit] draftIncluded:', draftIncluded);
            console.log('[handleSubmit] assets:', assets);

            let draftAccessories = {};
            try {
                draftAccessories = JSON.parse(sessionStorage.getItem('attribution_order_create_draft_accessories') || '{}');
            } catch (e) {
                draftAccessories = {};
            }
            
            for (const asset of assets) {
                const { id, ...assetCleanData } = asset;
                const draftForRow = draftIncluded?.[String(id)] || draftIncluded?.[id] || null;
                console.log(`[handleSubmit] Asset id: ${id}, String(id): ${String(id)}`);
                console.log(`[handleSubmit] draftForRow for asset ${id}:`, draftForRow);
                
                const payload = {
                    ...assetCleanData,
                    attribution_order: orderId,
                    asset_status: 'not_delivered_to_company',
                    included_stock_items: Array.isArray(draftForRow?.stock_items) ? draftForRow.stock_items : [],
                    included_consumables: Array.isArray(draftForRow?.consumables) ? draftForRow.consumables : [],
                };
                console.log(`[handleSubmit] Sending payload for asset ${id}:`, payload);

                const createdAsset = await assetService.create(payload);
                const createdAssetId = createdAsset?.asset_id;

                const accDraft = draftAccessories?.[String(id)] || draftAccessories?.[id] || null;
                const draftAccessoryStockItems = Array.isArray(accDraft?.stock_items) ? accDraft.stock_items : [];
                const draftAccessoryConsumables = Array.isArray(accDraft?.consumables) ? accDraft.consumables : [];

                if (createdAssetId) {
                    for (const draftStockItem of draftAccessoryStockItems) {
                        const stockItemModelId = Number(draftStockItem?.stock_item_model);
                        if (!stockItemModelId) continue;

                        await attributionOrderAssetStockItemAccessoryService.create({
                            attribution_order: orderId,
                            asset: createdAssetId,
                            stock_item_data: {
                                stock_item_model: stockItemModelId,
                                stock_item_inventory_number: draftStockItem?.stock_item_inventory_number || null,
                                stock_item_name: draftStockItem?.stock_item_name || null,
                                stock_item_status: draftStockItem?.stock_item_status || 'active',
                            },
                        });
                    }
                    for (const draftConsumable of draftAccessoryConsumables) {
                        const consumableModelId = Number(draftConsumable?.consumable_model);
                        if (!consumableModelId) continue;

                        await attributionOrderAssetConsumableAccessoryService.create({
                            attribution_order: orderId,
                            asset: createdAssetId,
                            consumable_data: {
                                consumable_model: consumableModelId,
                                consumable_serial_number: draftConsumable?.consumable_serial_number || null,
                                consumable_inventory_number: draftConsumable?.consumable_inventory_number || null,
                                consumable_name: draftConsumable?.consumable_name || null,
                                consumable_status: draftConsumable?.consumable_status || 'active',
                            },
                        });
                    }
                }
            }

            setSuccess(t('attributionOrders.createSuccess'));
            // Reset form
            setOrderData({
                attribution_order_full_code: '',
                attribution_order_date: new Date().toISOString().split('T')[0],
                warehouse: '',
                attribution_order_barcode: ''
            });
            setAssets([]);

            try {
                sessionStorage.removeItem('attribution_order_create_draft_assets');
                sessionStorage.removeItem('attribution_order_create_draft_order_data');
                sessionStorage.removeItem('attribution_order_create_draft_included_items');
                sessionStorage.removeItem('attribution_order_create_draft_accessories');
            } catch (e) {
                // ignore
            }

            // Go back to list mode after 2 seconds
            setTimeout(() => setViewMode('list'), 2000);
        } catch (err) {
            console.error(err);
            const apiData = err?.response?.data;
            const apiError = apiData?.error;
            setError(
                apiError || (apiData ? JSON.stringify(apiData) : null) || t('attributionOrders.createError')
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('report_full_code', receiptData.report_full_code);
            if (receiptData.digital_copy) {
                formData.append('digital_copy', receiptData.digital_copy);
            }

            const receipt = await receiptReportService.create(formData);

            await administrativeCertificateService.create({
                warehouse: selectedOrder.warehouse,
                attribution_order: selectedOrder.attribution_order_id,
                receipt_report: receipt.receipt_report_id,
                operation: 'entry'
            });

            setSuccess(t('attributionOrders.receiptCreatedSuccess'));
            setShowReceiptForm(false);
            setReceiptData({ report_full_code: '', digital_copy: null });
            setOrderReceipt(receipt);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('attributionOrders.receiptCreateError'))
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><ClipboardList size={22} style={{ color: 'var(--color-accent-primary)' }} />{viewMode === 'list' ? t('attributionOrders.title') : viewMode === 'detail' ? `${t('attributionOrders.orderDetails')}: ${selectedOrder?.attribution_order_full_code || ''}` : t('attributionOrders.createTitle')}</h1>
                    <p className="page-subtitle">
                        {viewMode === 'list' ? t('attributionOrders.subtitle') : viewMode === 'detail' ? t('attributionOrders.detailSubtitle') : t('attributionOrders.createSubtitle')}
                    </p>
                    {viewMode === 'detail' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setViewMode('list')}
                            style={{ marginTop: 'var(--space-2)' }}
                            title={t('common.back')}
                            aria-label={t('common.back')}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                    )}
                </div>
                {viewMode !== 'list' && viewMode !== 'detail' && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => setViewMode('list')}
                        title={t('attributionOrders.backToList')}
                        aria-label={t('attributionOrders.backToList')}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="badge badge-success" style={{ padding: 'var(--space-4)', width: '100%', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>{success}</div>}

            {viewMode === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>{t('attributionOrders.allOrders')}</h2>
                        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setViewMode('create')}>
                            + {t('attributionOrders.newOrder')}
                        </button>
                    </div>

                    {/* Search / Filter / Sort Toolbar */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-3)',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {/* Search */}
                        <div style={{
                            flex: 1,
                            minWidth: '240px',
                            position: 'relative'
                        }}>
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('attributionOrders.searchPlaceholder')}
                                className="form-input"
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    paddingLeft: 'var(--space-10)',
                                    paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
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

                        {/* Filter by Warehouse */}
                        <div style={{ position: 'relative', minWidth: '180px' }}>
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
                                value={filterWarehouse}
                                onChange={(e) => setFilterWarehouse(e.target.value)}
                                className="form-input"
                                style={{
                                    width: '100%',
                                    height: '42px',
                                    paddingLeft: 'var(--space-10)',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">{t('attributionOrders.allWarehouses')}</option>
                                {warehouses.map(w => (
                                    <option key={w.warehouse_id} value={w.warehouse_id}>
                                        {w.warehouse_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSortMenu(!showSortMenu);
                                }}
                                className="btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    padding: 'var(--space-2) var(--space-4)',
                                    height: '42px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                    color: 'var(--color-text-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: 'var(--font-size-sm)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <ArrowUpDown size={16} />
                                <span>{sortField === 'code' ? t('attributionOrders.sortByCode') : sortField === 'id' ? t('attributionOrders.sortById') : t('attributionOrders.sortByDate')}</span>
                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                    {sortDirection === 'asc' ? t('attributionOrders.ascending') : t('attributionOrders.descending')}
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
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-lg)',
                                        padding: 'var(--space-2)',
                                        zIndex: 100,
                                        minWidth: '200px'
                                    }}
                                >
                                    <div style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('common.sortBy')}
                                    </div>
                                    {[
                                        { field: 'date', dir: 'desc', label: `${t('attributionOrders.sortByDate')} — ${t('attributionOrders.descending')}` },
                                        { field: 'date', dir: 'asc', label: `${t('attributionOrders.sortByDate')} — ${t('attributionOrders.ascending')}` },
                                        { field: 'code', dir: 'asc', label: `${t('attributionOrders.sortByCode')} — ${t('attributionOrders.ascending')}` },
                                        { field: 'code', dir: 'desc', label: `${t('attributionOrders.sortByCode')} — ${t('attributionOrders.descending')}` },
                                        { field: 'id', dir: 'asc', label: `${t('attributionOrders.sortById')} — ${t('attributionOrders.ascending')}` },
                                        { field: 'id', dir: 'desc', label: `${t('attributionOrders.sortById')} — ${t('attributionOrders.descending')}` },
                                    ].map(opt => (
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
                                                textAlign: 'left',
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

                        {/* Clear Filters */}
                        {hasActiveFilters && (
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
                                    whiteSpace: 'nowrap',
                                    transition: 'all var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                }}
                            >
                                <X size={14} />
                                {t('attributionOrders.clearFilters')}
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    {!loading && ordersList.length > 0 && (
                        <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                        }}>
                            <span>{t('attributionOrders.resultCount', { count: filteredOrders.length })}</span>
                        </div>
                    )}

                    {filteredOrders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                            <p style={{ color: 'var(--color-text-light)' }}>
                                {hasActiveFilters ? t('attributionOrders.noResultsFound') : t('attributionOrders.noOrders')}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-accent-primary)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)',
                                        textDecoration: 'underline',
                                        marginTop: 'var(--space-2)'
                                    }}
                                >
                                    {t('attributionOrders.clearFilters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                            gap: 'var(--space-6)'
                        }}>
                            {filteredOrders.map(order => (
                                <div
                                    key={order.attribution_order_id}
                                    className="card hover-row"
                                    onClick={() => handleRowClick(order)}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        padding: 'var(--space-6)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--space-4)',
                                        borderLeft: '4px solid var(--color-primary)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: '700',
                                                color: 'var(--color-primary)',
                                                marginBottom: 'var(--space-1)'
                                            }}>
                                                {order.attribution_order_full_code}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                #{order.attribution_order_id}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-size-sm)',
                                            padding: 'var(--space-1) var(--space-3)',
                                            backgroundColor: 'var(--color-bg-alt)',
                                            borderRadius: 'var(--radius-full)',
                                            fontWeight: '500'
                                        }}>
                                            {new Date(order.attribution_order_date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {order.attribution_order_barcode && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                                <line x1="6" y1="8" x2="6" y2="16" />
                                                <line x1="9" y1="8" x2="9" y2="16" />
                                                <line x1="12" y1="8" x2="12" y2="16" />
                                                <line x1="15" y1="8" x2="15" y2="16" />
                                                <line x1="18" y1="8" x2="18" y2="16" />
                                            </svg>
                                            {order.attribution_order_barcode}
                                        </div>
                                    )}

                                    <div style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        color: 'var(--color-primary)',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: '600'
                                    }}>
                                        {t('attributionOrders.viewDetails')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : viewMode === 'detail' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Create Receipt Report Button - Above Order Info */}
                    {selectedOrder && !orderReceipt && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                className={`btn btn-${showReceiptForm ? 'secondary' : 'primary'}`} 
                                onClick={() => setShowReceiptForm(!showReceiptForm)}
                                style={{ 
                                    width: 'auto', 
                                    padding: 'var(--space-3) var(--space-6)',
                                    minWidth: '180px'
                                }}
                            >
                                {showReceiptForm ? (
                                    <>{t('attributionOrders.cancelReceiptReport')}</>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)', verticalAlign: 'middle' }}>
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                        {t('attributionOrders.createReceiptReport')}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                    {showReceiptForm && (
                        <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
                            <div className="card-header">
                                <h2 className="card-title">{t('attributionOrders.newReceiptReport')}</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleReceiptSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                                        <div className="form-group">
                                            <label className="form-label">{t('attributionOrders.reportFullCode')}</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={receiptData.report_full_code}
                                                onChange={(e) => setReceiptData({ ...receiptData, report_full_code: e.target.value })}
                                                placeholder={t('attributionOrders.fullCodePlaceholder')}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('attributionOrders.digitalCopyAttachment')}</label>
                                            <input
                                                type="file"
                                                className="form-input"
                                                onChange={(e) => setReceiptData({ ...receiptData, digital_copy: e.target.files[0] })}
                                                accept="image/*,application/pdf"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? t('common.submitting') : t('attributionOrders.saveReceiptReport')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Large Div Card for Order Information */}
                    <div className="card" style={{ padding: 'var(--space-8)', borderLeft: '6px solid var(--color-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', margin: 0, color: 'var(--color-text)' }}>
                                    {selectedOrder?.attribution_order_full_code}
                                </h2>
                                <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
                                    {t('attributionOrders.orderId', { id: selectedOrder?.attribution_order_id })}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('attributionOrders.orderDate')}</div>
                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
                                    {selectedOrder ? new Date(selectedOrder.attribution_order_date).toLocaleDateString() : ''}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: 'var(--radius-md)', 
                                    backgroundColor: 'var(--color-bg-alt)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('attributionOrders.warehouse')}</div>
                                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '600' }}>
                                        {selectedOrder && warehouses.find(w => w.warehouse_id === selectedOrder.warehouse)?.warehouse_name || t('common.na')}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: 'var(--radius-md)', 
                                    backgroundColor: 'var(--color-bg-alt)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                        <line x1="6" y1="8" x2="6" y2="16" />
                                        <line x1="9" y1="8" x2="9" y2="16" />
                                        <line x1="12" y1="8" x2="12" y2="16" />
                                        <line x1="15" y1="8" x2="15" y2="16" />
                                        <line x1="18" y1="8" x2="18" y2="16" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('attributionOrders.barcode')}</div>
                                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '600' }}>
                                        {selectedOrder?.attribution_order_barcode || t('attributionOrders.noBarcode')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {orderReceipt && (
                        <div className="card" style={{ padding: 'var(--space-8)', borderLeft: '6px solid var(--color-success)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', margin: 0 }}>{t('attributionOrders.receiptReport')}</h3>
                                {orderReceipt.digital_copy ? (
                                    <button
                                        type="button"
                                        onClick={() => setPreviewReceipt(true)}
                                        className="btn btn-primary"
                                        style={{ padding: 'var(--space-2) var(--space-6)' }}
                                    >
                                        {t('attributionOrders.consultDocument')}
                                    </button>
                                ) : (
                                    <span className="badge">{t('attributionOrders.noAttachment')}</span>
                                )}
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('attributionOrders.reportCode')}</div>
                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>{orderReceipt.report_full_code || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{t('attributionOrders.submissionDate')}</div>
                                    <div style={{ fontSize: 'var(--font-size-md)' }}>
                                        {orderReceipt.report_datetime ? new Date(orderReceipt.report_datetime).toLocaleString() : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Associated Assets - Clickable Card */}
                    {selectedOrder && (
                        <div
                            className="card"
                            onClick={() => {
                                console.log('Card clicked! Order ID:', selectedOrder?.attribution_order_id);
                                if (selectedOrder?.attribution_order_id) {
                                    navigate(`/dashboard/attribution-orders/${selectedOrder.attribution_order_id}/assets`);
                                }
                            }}
                            style={{
                                cursor: 'pointer',
                                padding: 'var(--space-8)',
                                borderLeft: '6px solid var(--color-info)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'var(--color-surface)',
                                minHeight: '120px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: 'var(--radius-lg)', 
                                    backgroundColor: 'var(--color-bg-alt)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-info)'
                                }}>
                                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', margin: 0 }}>{t('attributionOrders.associatedAssets')}</h3>
                                    <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
                                        {orderAssets.length === 0 ? t('attributionOrders.noAssetsLinked') : t('attributionOrders.assetsLinked', { count: orderAssets.length })}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                {orderAssets.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 'var(--space-4)' }}>
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{t('attributionOrders.firstAsset')}</div>
                                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '600' }}>
                                            {orderAssets[0].asset_name || orderAssets[0].asset_inventory_number || t('attributionOrders.assetFallback', { id: orderAssets[0].asset_id })}
                                        </div>
                                    </div>
                                )}
                                <div style={{ 
                                    color: 'var(--color-primary)', 
                                    fontWeight: '600', 
                                    fontSize: 'var(--font-size-lg)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {t('attributionOrders.viewAll')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Included Stock Items */}
                    {includedItems.stock_items.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">{t('attributionOrders.includedStockItems')}</h2>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>{t('attributionOrders.itemName')}</th>
                                            <th>{t('common.type')}</th>
                                            <th>{t('attributionOrders.assets')}</th>
                                            <th>{t('common.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {includedItems.stock_items.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '500' }}>{item.name || '-'}</td>
                                                <td>{item.model || '-'}</td>
                                                <td>{item.asset_name || t('attributionOrders.assetFallback', { id: item.asset_id })}</td>
                                                <td><span className={`status-badge status-${item.status?.replace(/\s+/g, '-').toLowerCase()}`}>{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Included Consumables */}
                    {includedItems.consumables.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">{t('attributionOrders.includedConsumables')}</h2>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>{t('attributionOrders.itemName')}</th>
                                            <th>{t('common.type')}</th>
                                            <th>{t('attributionOrders.assets')}</th>
                                            <th>{t('common.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {includedItems.consumables.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '500' }}>{item.name || '-'}</td>
                                                <td>{item.model || '-'}</td>
                                                <td>{item.asset_name || t('attributionOrders.assetFallback', { id: item.asset_id })}</td>
                                                <td><span className={`status-badge status-${item.status?.replace(/\s+/g, '-').toLowerCase()}`}>{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                        <div className="card-header">
                            <h2 className="card-title">{t('attributionOrders.orderInformation')}</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.fullCode')}</label>
                                    <input
                                        type="text"
                                        name="attribution_order_full_code"
                                        className="form-input"
                                        value={orderData.attribution_order_full_code}
                                        onChange={handleOrderChange}
                                        placeholder={t('attributionOrders.fullCodePlaceholder')}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.date')}</label>
                                    <input
                                        type="date"
                                        name="attribution_order_date"
                                        className="form-input"
                                        value={orderData.attribution_order_date}
                                        onChange={handleOrderChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.warehouse')}</label>
                                    <select
                                        name="warehouse"
                                        className="form-input"
                                        value={orderData.warehouse}
                                        onChange={handleOrderChange}
                                        required
                                    >
                                        <option value="">{t('attributionOrders.selectWarehouse')}</option>
                                        {warehouses.map(w => (
                                            <option key={w.warehouse_id} value={w.warehouse_id}>
                                                {w.warehouse_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.barcode')}</label>
                                    <input
                                        type="text"
                                        name="attribution_order_barcode"
                                        className="form-input"
                                        value={orderData.attribution_order_barcode}
                                        onChange={handleOrderChange}
                                        placeholder={t('attributionOrders.scanBarcode')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">{t('attributionOrders.assets')}</h2>
                            <button type="button" onClick={addAssetRow} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                {t('attributionOrders.addAsset')}
                            </button>
                        </div>

                        <div className="card-body" style={{ paddingTop: 0 }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(180px, 1fr) minmax(180px, 1fr) minmax(120px, 180px) auto',
                                gap: 'var(--space-4)',
                                alignItems: 'end',
                                marginBottom: 'var(--space-6)'
                            }}>
                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.bulkType')}</label>
                                    <select
                                        className="form-input"
                                        value={bulkAdd.asset_type}
                                        onChange={(e) => handleBulkTypeChange(e.target.value)}
                                    >
                                        <option value="">{t('attributionOrders.selectType')}</option>
                                        {assetTypes.map(at => (
                                            <option key={at.asset_type_id} value={at.asset_type_id}>{at.asset_type_label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.bulkModel')}</label>
                                    <select
                                        className="form-input"
                                        value={bulkAdd.asset_model}
                                        onChange={(e) => setBulkAdd((prev) => ({ ...prev, asset_model: e.target.value }))}
                                        disabled={!bulkAdd.asset_type}
                                    >
                                        <option value="">{t('attributionOrders.selectModel')}</option>
                                        {(assetModels[bulkAdd.asset_type] || []).map(m => (
                                            <option key={m.asset_model_id} value={m.asset_model_id}>{m.model_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('attributionOrders.quantity')}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="1"
                                        value={bulkAdd.quantity}
                                        onChange={(e) => setBulkAdd((prev) => ({ ...prev, quantity: e.target.value }))}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={addBulkAssets}
                                    disabled={!bulkAdd.asset_type || !bulkAdd.asset_model || Number(bulkAdd.quantity) < 1}
                                    style={{ padding: 'var(--space-2) var(--space-4)', height: '40px' }}
                                >
                                    {t('attributionOrders.addQuantity')}
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('common.type')}</th>
                                        <th>{t('attributionOrders.selectModel')}</th>
                                        <th>{t('attributionOrders.serialNumber')}</th>
                                        <th>{t('attributionOrders.inventoryId')}</th>
                                        <th>{t('common.name')}</th>
                                        <th style={{ textAlign: 'center' }}>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset, index) => (
                                        <tr key={asset.id}>
                                            <td>
                                                <select
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)', minWidth: '140px' }}
                                                    value={asset.asset_type}
                                                    onChange={(e) => handleAssetChange(index, 'asset_type', e.target.value)}
                                                    required
                                                >
                                                    <option value="">{t('attributionOrders.selectType')}</option>
                                                    {assetTypes.map(at => (
                                                        <option key={at.asset_type_id} value={at.asset_type_id}>{at.asset_type_label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)', minWidth: '140px' }}
                                                    value={asset.asset_model}
                                                    onChange={(e) => handleAssetChange(index, 'asset_model', e.target.value)}
                                                    required
                                                    disabled={!asset.asset_type}
                                                >
                                                    <option value="">{t('attributionOrders.selectModel')}</option>
                                                    {(assetModels[asset.asset_type] || []).map(m => (
                                                        <option key={m.asset_model_id} value={m.asset_model_id}>{m.model_name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)' }}
                                                    value={asset.asset_serial_number}
                                                    onChange={(e) => handleAssetChange(index, 'asset_serial_number', e.target.value)}
                                                    placeholder={t('attributionOrders.snPlaceholder')}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)' }}
                                                    value={asset.asset_inventory_number}
                                                    onChange={(e) => handleAssetChange(index, 'asset_inventory_number', e.target.value)}
                                                    placeholder={t('attributionOrders.invPlaceholder')}
                                                    maxLength="6"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)' }}
                                                    value={asset.asset_name}
                                                    onChange={(e) => handleAssetChange(index, 'asset_name', e.target.value)}
                                                    placeholder={t('attributionOrders.assetName')}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => configureIncludedItemsForRow(asset, 'stock')}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px', marginRight: '8px' }}
                                                    disabled={!asset.asset_model}
                                                    title={!asset.asset_model ? t('attributionOrders.selectModelFirst') : t('attributionOrders.configureIncludedStockItems')}
                                                >
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => configureIncludedItemsForRow(asset, 'consumables')}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px', marginRight: '8px' }}
                                                    disabled={!asset.asset_model}
                                                    title={!asset.asset_model ? t('attributionOrders.selectModelFirst') : t('attributionOrders.configureIncludedConsumables')}
                                                >
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2v6m0 0v14m0-14c-2 0-6 1-6 5s4 5 6 5 6-1 6-5-4-5-6-5z"/>
                                                        <path d="M6 12c0 4 2.5 8 6 10 3.5-2 6-6 6-10" fill="none"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => configureAccessoriesForRow(asset)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px', marginRight: '8px' }}
                                                    title={t('attributionOrders.accessories')}
                                                >
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.19 9.19a2 2 0 1 1-2.83-2.83l8.48-8.48" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAssetRow(index)}
                                                    className="logout-btn"
                                                    title={t('attributionOrders.removeRow')}
                                                    disabled={assets.length === 0}
                                                >
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: 'auto', minWidth: '200px' }} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <div className="loading-spinner" style={{ marginRight: 'var(--space-2)' }}></div>
                                    {t('common.creating')}
                                </>
                            ) : t('attributionOrders.createOrderAndAssets')}
                        </button>
                    </div>
                </form>
            )}

            {previewReceipt && orderReceipt?.digital_copy && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }} onClick={() => setPreviewReceipt(false)}>
                    <div className="card" style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h2 style={{ margin: 0 }}>{t('attributionOrders.consultReceiptReport', { code: orderReceipt.report_full_code || t('attributionOrders.attachment') })}</h2>
                            <button className="btn btn-secondary" onClick={() => setPreviewReceipt(false)}>{t('common.close')}</button>
                        </div>
                        {getMimeType(orderReceipt.digital_copy) === 'application/pdf' ? (
                            <iframe
                                title={t('attributionOrders.receiptReportPreview')}
                                src={`data:application/pdf;base64,${orderReceipt.digital_copy}`}
                                style={{ flexGrow: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div style={{ flexGrow: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                <img
                                    src={`data:${getMimeType(orderReceipt.digital_copy)};base64,${orderReceipt.digital_copy}`}
                                    alt={t('attributionOrders.receiptReportPreview')}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AttributionOrdersPage;
