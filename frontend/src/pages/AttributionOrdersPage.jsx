import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SkeletonListRows } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import ModalFeedback from '../components/ModalFeedback';
import BackButton from '../components/BackButton';
import {
    Search,
    X,
    ClipboardList,
    Hash,
    Calendar,
    MapPin,
    Barcode,
    Layers,
    Plus,
    Box,
    Tag,
    Monitor,
    Shield,
    PenLine,
    Package,
    Droplets,
    Paperclip,
    Trash2,
    Loader2
} from 'lucide-react';
import FilterSortFAB from '../components/FilterSortFAB';
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
                
                const includedStockItems = Array.isArray(draftForRow?.stock_items) ? draftForRow.stock_items : [];
                const includedConsumables = Array.isArray(draftForRow?.consumables) ? draftForRow.consumables : [];
                console.log(`[handleSubmit] Asset ${id} - includedStockItems (${includedStockItems.length}):`, includedStockItems);
                console.log(`[handleSubmit] Asset ${id} - includedConsumables (${includedConsumables.length}):`, includedConsumables);

                const payload = {
                    ...assetCleanData,
                    attribution_order: orderId,
                    asset_status: 'not_delivered_to_company',
                    included_stock_items: includedStockItems,
                    included_consumables: includedConsumables,
                };
                console.log(`[handleSubmit] Sending payload for asset ${id}:`, payload);
                console.log(`[handleSubmit] Payload included_stock_items count:`, payload.included_stock_items?.length);
                console.log(`[handleSubmit] Payload included_consumables count:`, payload.included_consumables?.length);

                const createdAsset = await assetService.create(payload);
                const createdAssetId = createdAsset?.asset_id;
                console.log(`[handleSubmit] Asset created: id=${createdAssetId}`, createdAsset);

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

    const iconBox = (Icon, color, size = 16) => (
        <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon size={size} style={{ color }} />
        </div>
    );

    const iconBoxLg = (Icon, color, size = 24) => (
        <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-lg)',
            background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon size={size} style={{ color }} />
        </div>
    );

    const sectionHeader = (Icon, color, title, subtitle) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {iconBox(Icon, color)}
            <div>
                <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{title}</h2>
                {subtitle && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{subtitle}</span>}
            </div>
        </div>
    );

    const backBtn = (onClick, label) => (
        <BackButton onClick={onClick} label={label} />
    );

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <ClipboardList size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            {t('attributionOrders.title')}
                        </h1>
                        <p className="page-subtitle">{t('attributionOrders.subtitle')}</p>
                    </div>
                </div>
                <SkeletonListRows count={6} />
            </div>
        );
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                        background: 'var(--gradient-primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                    }}>
                        <ClipboardList size={22} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: 'var(--space-1)' }}>
                            {viewMode === 'list' ? t('attributionOrders.title') : viewMode === 'detail' ? `${t('attributionOrders.orderDetails')}: ${selectedOrder?.attribution_order_full_code || ''}` : t('attributionOrders.createTitle')}
                        </h1>
                        <p className="page-subtitle">
                            {viewMode === 'list' ? t('attributionOrders.subtitle') : viewMode === 'detail' ? t('attributionOrders.detailSubtitle') : t('attributionOrders.createSubtitle')}
                        </p>
                        {viewMode === 'detail' && backBtn(() => setViewMode('list'), t('common.back'))}
                    </div>
                </div>
                {viewMode !== 'list' && viewMode !== 'detail' && backBtn(() => setViewMode('list'), t('attributionOrders.backToList'))}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="badge badge-success" style={{
                    padding: 'var(--space-4)', width: '100%', marginBottom: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    {success}
                </div>
            )}

            {viewMode === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Toolbar */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-4) var(--space-5)',
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)', backdropFilter: 'var(--glass-backdrop)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {iconBox(ClipboardList, 'var(--color-accent-primary)')}
                            <div>
                                <h2 className="card-title" style={{ margin: 0 }}>{t('attributionOrders.allOrders')}</h2>
                                {!loading && ordersList.length > 0 && (
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {t('attributionOrders.resultCount', { count: filteredOrders.length })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: 'auto', gap: 'var(--space-2)' }} onClick={() => setViewMode('create')}>
                            <Plus size={16} />
                            {t('attributionOrders.newOrder')}
                        </button>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 'var(--radius-full)',
                                background: 'var(--color-bg-card)', margin: '0 auto var(--space-4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ClipboardList size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-2)' }}>
                                {hasActiveFilters ? t('attributionOrders.noResultsFound') : t('attributionOrders.noOrders')}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: 'var(--color-accent-primary)', cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)', textDecoration: 'underline',
                                    }}
                                >
                                    {t('attributionOrders.clearFilters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                            gap: 'var(--space-5)'
                        }}>
                            {filteredOrders.map(order => (
                                <div
                                    key={order.attribution_order_id}
                                    className="card"
                                    onClick={() => handleRowClick(order)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: 0,
                                        overflow: 'hidden',
                                        borderLeft: '4px solid var(--color-accent-primary)',
                                    }}
                                >
                                    <div style={{
                                        padding: 'var(--space-5) var(--space-5) var(--space-4)',
                                        display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                {iconBox(Hash, 'var(--color-accent-primary)')}
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                                                        {order.attribution_order_full_code}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                        #{order.attribution_order_id}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                padding: 'var(--space-1) var(--space-3)',
                                                background: 'var(--color-bg-card)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-full)',
                                                fontWeight: '500', color: 'var(--color-text-secondary)',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {new Date(order.attribution_order_date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {order.attribution_order_barcode && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                                <Barcode size={14} style={{ opacity: 0.6 }} />
                                                {order.attribution_order_barcode}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        padding: 'var(--space-3) var(--space-5)',
                                        borderTop: '1px solid var(--color-border)',
                                        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                                    }}>
                                        <span style={{
                                            color: 'var(--color-accent-primary)',
                                            fontSize: 'var(--font-size-sm)', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                                        }}>
                                            {t('attributionOrders.viewDetails')}
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : viewMode === 'detail' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Create Receipt Report Button */}
                    {selectedOrder && !orderReceipt && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowReceiptForm(true)}
                                style={{ width: 'auto', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-6)' }}
                            >
                                <Plus size={16} />
                                {t('attributionOrders.createReceiptReport')}
                            </button>
                        </div>
                    )}

                    {/* Create Receipt Report Modal */}
                    {showReceiptForm && (
                        <ModalPortal>
                            <div className="modal-overlay" onClick={() => setShowReceiptForm(false)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                                    <div className="modal-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            {iconBox(ClipboardList, 'var(--color-accent-primary)')}
                                            <h3 className="modal-title">{t('attributionOrders.newReceiptReport')}</h3>
                                        </div>
                                        <button className="modal-close" onClick={() => setShowReceiptForm(false)}>&times;</button>
                                    </div>
                                    <div className="modal-body">
                                        <ModalFeedback
                                            type={error ? 'error' : success ? 'success' : null}
                                            message={error || success}
                                            onClose={() => { setError(null); setSuccess(null); }}
                                        />
                                        <form onSubmit={handleReceiptSubmit} className="form">
                                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                                    {t('attributionOrders.reportFullCode')}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    value={receiptData.report_full_code}
                                                    onChange={(e) => setReceiptData({ ...receiptData, report_full_code: e.target.value })}
                                                    placeholder={t('attributionOrders.fullCodePlaceholder')}
                                                    required
                                                    style={{ height: '44px' }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                                                <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                                    {t('attributionOrders.digitalCopyAttachment')}
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-input"
                                                    onChange={(e) => setReceiptData({ ...receiptData, digital_copy: e.target.files[0] })}
                                                    accept="image/*,application/pdf"
                                                    style={{ height: '44px', padding: 'var(--space-2)' }}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            onClick={() => setShowReceiptForm(false)}
                                            className="btn btn-secondary"
                                            style={{ padding: 'var(--space-3) var(--space-6)' }}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReceiptSubmit}
                                            disabled={submitting}
                                            className="btn btn-primary"
                                            style={{ padding: 'var(--space-3) var(--space-6)' }}
                                        >
                                            {submitting ? t('common.submitting') : t('attributionOrders.saveReceiptReport')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ModalPortal>
                    )}

                    {/* Order Information Card */}
                    <div className="card" style={{ overflow: 'hidden', borderLeft: '4px solid var(--color-accent-primary)' }}>
                        <div style={{
                            padding: 'var(--space-6)',
                            background: 'var(--gradient-primary)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <ClipboardList size={24} style={{ color: '#fff' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', margin: 0, color: '#fff' }}>
                                        {selectedOrder?.attribution_order_full_code}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.75)', margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                                        {t('attributionOrders.orderId', { id: selectedOrder?.attribution_order_id })}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {t('attributionOrders.orderDate')}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: '#fff' }}>
                                    {selectedOrder ? new Date(selectedOrder.attribution_order_date).toLocaleDateString() : ''}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                {iconBoxLg(MapPin, 'var(--color-accent-primary)')}
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('attributionOrders.warehouse')}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                        {selectedOrder && warehouses.find(w => w.warehouse_id === selectedOrder.warehouse)?.warehouse_name || t('common.na')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                {iconBoxLg(Barcode, 'var(--color-accent-primary)')}
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('attributionOrders.barcode')}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                        {selectedOrder?.attribution_order_barcode || t('attributionOrders.noBarcode')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Report Card */}
                    {orderReceipt && (
                        <div className="card" style={{ overflow: 'hidden', borderLeft: '4px solid var(--color-success)' }}>
                            <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {sectionHeader(ClipboardList, 'var(--color-success)', t('attributionOrders.receiptReport'))}
                                {orderReceipt.digital_copy ? (
                                    <button
                                        type="button"
                                        onClick={() => setPreviewReceipt(true)}
                                        className="btn btn-primary"
                                        style={{ padding: 'var(--space-2) var(--space-5)', width: 'auto', gap: 'var(--space-2)' }}
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        {t('attributionOrders.consultDocument')}
                                    </button>
                                ) : (
                                    <span className="badge" style={{ opacity: 0.7 }}>{t('attributionOrders.noAttachment')}</span>
                                )}
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('attributionOrders.reportCode')}</div>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-text-primary)' }}>{orderReceipt.report_full_code || '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('attributionOrders.submissionDate')}</div>
                                        <div style={{ fontSize: 'var(--font-size-base)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                            {orderReceipt.report_datetime ? new Date(orderReceipt.report_datetime).toLocaleString() : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Associated Assets Card */}
                    {selectedOrder && (
                        <div
                            className="card"
                            onClick={() => {
                                if (selectedOrder?.attribution_order_id) {
                                    navigate(`/dashboard/attribution-orders/${selectedOrder.attribution_order_id}/assets`);
                                }
                            }}
                            style={{
                                cursor: 'pointer',
                                overflow: 'hidden',
                                borderLeft: '4px solid #3b82f6',
                            }}
                        >
                            <div style={{ padding: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                                    {iconBoxLg(Monitor, '#3b82f6', 28)}
                                    <div>
                                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', margin: 0, color: 'var(--color-text-primary)' }}>
                                            {t('attributionOrders.associatedAssets')}
                                        </h3>
                                        <p style={{ color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0', fontSize: 'var(--font-size-sm)' }}>
                                            {orderAssets.length === 0 ? t('attributionOrders.noAssetsLinked') : t('attributionOrders.assetsLinked', { count: orderAssets.length })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    {orderAssets.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('attributionOrders.firstAsset')}</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                                {orderAssets[0].asset_name || orderAssets[0].asset_inventory_number || t('attributionOrders.assetFallback', { id: orderAssets[0].asset_id })}
                                            </div>
                                        </div>
                                    )}
                                    <span style={{
                                        color: 'var(--color-accent-primary)', fontWeight: '600',
                                        fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap',
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                                    }}>
                                        {t('attributionOrders.viewAll')}
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Included Stock Items */}
                    {includedItems.stock_items.length > 0 && (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {sectionHeader(Package, '#3b82f6', t('attributionOrders.includedStockItems'), `${includedItems.stock_items.length} item(s)`)}
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {includedItems.stock_items.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                            }}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                                background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: '#3b82f6',
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('attributionOrders.itemName')}</div>
                                                    <div style={{ fontWeight: '500' }}>{item.name || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('common.type')}</div>
                                                    <div>{item.model || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('attributionOrders.assets')}</div>
                                                    <div>{item.asset_name || t('attributionOrders.assetFallback', { id: item.asset_id })}</div>
                                                </div>
                                                <span className={`status-badge status-${item.status?.replace(/\s+/g, '-').toLowerCase()}`}>{item.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Included Consumables */}
                    {includedItems.consumables.length > 0 && (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                {sectionHeader(Droplets, '#f59e0b', t('attributionOrders.includedConsumables'), `${includedItems.consumables.length} item(s)`)}
                            </div>
                            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {includedItems.consumables.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                            }}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                                background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: '#f59e0b',
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('attributionOrders.itemName')}</div>
                                                    <div style={{ fontWeight: '500' }}>{item.name || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('common.type')}</div>
                                                    <div>{item.model || '-'}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{t('attributionOrders.assets')}</div>
                                                    <div>{item.asset_name || t('attributionOrders.assetFallback', { id: item.asset_id })}</div>
                                                </div>
                                                <span className={`status-badge status-${item.status?.replace(/\s+/g, '-').toLowerCase()}`}>{item.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Order Information Card */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                            {sectionHeader(ClipboardList, 'var(--color-accent-primary)', t('attributionOrders.orderInformation'), t('attributionOrders.createSubtitle'))}
                        </div>
                        <div className="card-body" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Hash size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.fullCode')}
                                    </label>
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
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Calendar size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.date')}
                                    </label>
                                    <input
                                        type="date"
                                        name="attribution_order_date"
                                        className="form-input"
                                        value={orderData.attribution_order_date}
                                        onChange={handleOrderChange}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.warehouse')}
                                    </label>
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
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Barcode size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.barcode')}
                                    </label>
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

                    {/* Bulk Add Card */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                            {sectionHeader(Layers, 'var(--color-success)', t('attributionOrders.addQuantity'), `${t('attributionOrders.bulkType')} / ${t('attributionOrders.bulkModel')}`)}
                        </div>
                        <div className="card-body" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr minmax(100px, 140px) auto',
                                gap: 'var(--space-4)',
                                alignItems: 'end',
                            }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Box size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.bulkType')}
                                    </label>
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

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Tag size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.bulkModel')}
                                    </label>
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

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <Hash size={12} style={{ color: 'var(--color-text-muted)' }} />
                                        {t('attributionOrders.quantity')}
                                    </label>
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
                                    style={{ width: 'auto', padding: 'var(--space-3) var(--space-6)', height: '44px', gap: 'var(--space-2)' }}
                                >
                                    <Plus size={16} />
                                    {t('attributionOrders.addQuantity')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Assets Card */}
                    <div className="card" style={{ marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
                        <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                {sectionHeader(Monitor, '#a78bfa', t('attributionOrders.assets'), assets.length === 0 ? t('attributionOrders.noAssetsLinked') : t('attributionOrders.assetsLinked', { count: assets.length }))}
                                <button type="button" onClick={addAssetRow} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)', width: 'auto' }}>
                                    <Plus size={14} />
                                    {t('attributionOrders.addAsset')}
                                </button>
                            </div>
                        </div>
                        <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                            {assets.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: 'var(--space-10) var(--space-6)',
                                    color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
                                }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-bg-card)', margin: '0 auto var(--space-3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Monitor size={24} style={{ opacity: 0.4 }} />
                                    </div>
                                    <p>{t('attributionOrders.noAssetsLinked')}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {assets.map((asset, index) => (
                                        <div
                                            key={asset.id}
                                            style={{
                                                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                                transition: 'all var(--transition-fast)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                                                {/* Numbered Badge */}
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                                    background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, color: '#a78bfa',
                                                    marginTop: 'var(--space-1)',
                                                }}>
                                                    {index + 1}
                                                </div>

                                                {/* Asset Fields */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr 0.7fr 1fr', gap: 'var(--space-4)', alignItems: 'end', flex: 1 }}>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <Box size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('common.type')}
                                                        </label>
                                                        <select
                                                            className="form-input"
                                                            value={asset.asset_type}
                                                            onChange={(e) => handleAssetChange(index, 'asset_type', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">{t('attributionOrders.selectType')}</option>
                                                            {assetTypes.map(at => (
                                                                <option key={at.asset_type_id} value={at.asset_type_id}>{at.asset_type_label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <Tag size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('attributionOrders.selectModel')}
                                                        </label>
                                                        <select
                                                            className="form-input"
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
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <Hash size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('attributionOrders.serialNumber')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={asset.asset_serial_number}
                                                            onChange={(e) => handleAssetChange(index, 'asset_serial_number', e.target.value)}
                                                            placeholder={t('attributionOrders.snPlaceholder')}
                                                        />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <Shield size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('attributionOrders.inventoryId')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={asset.asset_inventory_number}
                                                            onChange={(e) => handleAssetChange(index, 'asset_inventory_number', e.target.value)}
                                                            placeholder={t('attributionOrders.invPlaceholder')}
                                                            maxLength="6"
                                                        />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <PenLine size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            {t('common.name')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={asset.asset_name}
                                                            onChange={(e) => handleAssetChange(index, 'asset_name', e.target.value)}
                                                            placeholder={t('attributionOrders.assetName')}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flexShrink: 0 }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => configureIncludedItemsForRow(asset, 'stock')}
                                                        className="btn btn-ghost"
                                                        disabled={!asset.asset_model}
                                                        title={!asset.asset_model ? t('attributionOrders.selectModelFirst') : t('attributionOrders.configureIncludedStockItems')}
                                                        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', width: 'auto', minHeight: '28px' }}
                                                    >
                                                        <Package size={13} />
                                                        <span>{t('attributionOrders.includedStockItems')}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => configureIncludedItemsForRow(asset, 'consumables')}
                                                        className="btn btn-ghost"
                                                        disabled={!asset.asset_model}
                                                        title={!asset.asset_model ? t('attributionOrders.selectModelFirst') : t('attributionOrders.configureIncludedConsumables')}
                                                        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', width: 'auto', minHeight: '28px' }}
                                                    >
                                                        <Droplets size={13} />
                                                        <span>{t('attributionOrders.includedConsumables')}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => configureAccessoriesForRow(asset)}
                                                        className="btn btn-ghost"
                                                        title={t('attributionOrders.accessories')}
                                                        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', width: 'auto', minHeight: '28px' }}
                                                    >
                                                        <Paperclip size={13} />
                                                        <span>{t('attributionOrders.accessories')}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAssetRow(index)}
                                                        className="btn btn-danger"
                                                        title={t('attributionOrders.removeRow')}
                                                        disabled={assets.length === 0}
                                                        style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)', width: 'auto', minHeight: '28px' }}
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>{t('attributionOrders.removeRow')}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-5) var(--space-6)',
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-xl)', backdropFilter: 'var(--glass-backdrop)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            {iconBox(Monitor, '#a78bfa')}
                            <span>{assets.length === 0 ? t('attributionOrders.noAssetsLinked') : t('attributionOrders.assetsLinked', { count: assets.length })}</span>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || assets.length === 0}
                            style={{ width: 'auto', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-8)' }}
                        >
                            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ClipboardList size={18} />}
                            {submitting ? t('common.creating') : t('attributionOrders.createOrderAndAssets')}
                        </button>
                    </div>
                </form>
            )}

            {previewReceipt && orderReceipt?.digital_copy && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'var(--overlay-bg)', backdropFilter: 'var(--overlay-backdrop)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 'var(--space-6)',
                }} onClick={() => setPreviewReceipt(false)}>
                    <div className="card" style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                {iconBox(ClipboardList, 'var(--color-success)')}
                                <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{t('attributionOrders.consultReceiptReport', { code: orderReceipt.report_full_code || t('attributionOrders.attachment') })}</h2>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setPreviewReceipt(false)} style={{ width: 'auto', gap: 'var(--space-2)' }}>
                                <X size={16} />
                                {t('common.close')}
                            </button>
                        </div>
                        {getMimeType(orderReceipt.digital_copy) === 'application/pdf' ? (
                            <iframe
                                title={t('attributionOrders.receiptReportPreview')}
                                src={`data:application/pdf;base64,${orderReceipt.digital_copy}`}
                                style={{ flexGrow: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div style={{ flexGrow: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)' }}>
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
            <FilterSortFAB hasActiveFilters={hasActiveFilters}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('attributionOrders.searchPlaceholder')} className="form-input" style={{ width: '100%', height: '40px', paddingLeft: 'var(--space-10)', paddingRight: searchQuery ? 'var(--space-10)' : 'var(--space-4)' }} />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}><X size={16} /></button>
                        )}
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('attributionOrders.allWarehouses')}</label>
                        <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} className="form-input" style={{ height: '40px', width: '100%' }}>
                            <option value="">{t('attributionOrders.allWarehouses')}</option>
                            {warehouses.map(w => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>{t('common.sortBy')}</label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <select className="form-input" value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ height: '40px', flex: 1 }}>
                                <option value="date">{t('attributionOrders.sortByDate')}</option>
                                <option value="code">{t('attributionOrders.sortByCode')}</option>
                                <option value="id">{t('attributionOrders.sortById')}</option>
                            </select>
                            <select className="form-input" value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} style={{ height: '40px', width: '100px' }}>
                                <option value="asc">↑ {t('attributionOrders.ascending')}</option>
                                <option value="desc">↓ {t('attributionOrders.descending')}</option>
                            </select>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', height: '40px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', width: '100%', justifyContent: 'center' }}>
                            <X size={14} /> {t('attributionOrders.clearFilters')}
                        </button>
                    )}
                </div>
            </FilterSortFAB>
        </>
    );
};

export default AttributionOrdersPage;
