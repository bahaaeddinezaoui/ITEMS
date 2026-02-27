import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    attributionOrderService,
    warehouseService,
    assetTypeService,
    assetModelService,
    assetService,
    receiptReportService,
    administrativeCertificateService
} from '../services/api';

const AttributionOrdersPage = () => {
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
            setError('Failed to fetch assets or receipt for this order');
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
            setError('Failed to fetch attribution orders');
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
            setError('Failed to fetch initial data');
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
            
            for (const asset of assets) {
                const { id, ...assetCleanData } = asset;
                const draftForRow = draftIncluded?.[String(id)] || draftIncluded?.[id] || null;
                console.log(`[handleSubmit] Asset id: ${id}, String(id): ${String(id)}`);
                console.log(`[handleSubmit] draftForRow for asset ${id}:`, draftForRow);
                
                const payload = {
                    ...assetCleanData,
                    attribution_order: orderId,
                    asset_status: 'In Stock',
                    included_stock_items: Array.isArray(draftForRow?.stock_items) ? draftForRow.stock_items : [],
                    included_consumables: Array.isArray(draftForRow?.consumables) ? draftForRow.consumables : [],
                };
                console.log(`[handleSubmit] Sending payload for asset ${id}:`, payload);
                
                await assetService.create(payload);
            }

            setSuccess('Attribution Order and Assets created successfully!');
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
            } catch (e) {
                // ignore
            }

            // Go back to list mode after 2 seconds
            setTimeout(() => setViewMode('list'), 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create Attribution Order and Assets');
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

            setSuccess('Receipt Report successfully created and linked to this order.');
            setShowReceiptForm(false);
            setReceiptData({ report_full_code: '', digital_copy: null });
            setOrderReceipt(receipt);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create Receipt Report');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">{viewMode === 'list' ? 'Attribution Orders' : viewMode === 'detail' ? `Order Details: ${selectedOrder?.attribution_order_full_code || ''}` : 'Create Attribution Order'}</h1>
                    <p className="page-subtitle">
                        {viewMode === 'list' ? 'Consult and manage your attribution orders' : viewMode === 'detail' ? 'Consult associated order details and assets' : 'Register new equipment and link them to an attribution order'}
                    </p>
                    {viewMode === 'detail' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setViewMode('list')}
                            style={{ marginTop: 'var(--space-2)' }}
                            title="Back"
                            aria-label="Back"
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
                        title="Back to List"
                        aria-label="Back to List"
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
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">All Attribution Orders</h2>
                        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setViewMode('create')}>
                            + New Order
                        </button>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Full Code</th>
                                    <th>Date</th>
                                    <th>Barcode</th>
                                    <th>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersList.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No attribution orders found.</td>
                                    </tr>
                                ) : (
                                    ordersList.map(order => (
                                        <tr key={order.attribution_order_id} onClick={() => handleRowClick(order)} style={{ cursor: 'pointer' }} className="hover-row">
                                            <td style={{ fontWeight: '500', color: 'var(--color-primary)' }}>{order.attribution_order_full_code}</td>
                                            <td>{new Date(order.attribution_order_date).toLocaleDateString()}</td>
                                            <td>{order.attribution_order_barcode || '-'}</td>
                                            <td>#{order.attribution_order_id}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : viewMode === 'detail' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Order Information</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                <div>
                                    <label className="form-label">Full Code</label>
                                    <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '500' }}>{selectedOrder?.attribution_order_full_code}</div>
                                </div>
                                <div>
                                    <label className="form-label">Date</label>
                                    <div style={{ fontSize: 'var(--font-size-md)' }}>{selectedOrder ? new Date(selectedOrder.attribution_order_date).toLocaleDateString() : ''}</div>
                                </div>
                                <div>
                                    <label className="form-label">Warehouse</label>
                                    <div style={{ fontSize: 'var(--font-size-md)' }}>
                                        {selectedOrder && warehouses.find(w => w.warehouse_id === selectedOrder.warehouse)?.warehouse_name || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Barcode</label>
                                    <div style={{ fontSize: 'var(--font-size-md)' }}>{selectedOrder?.attribution_order_barcode || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {orderReceipt && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Receipt Report</h2>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                    <div>
                                        <label className="form-label">Report Code</label>
                                        <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '500' }}>{orderReceipt.report_full_code || '-'}</div>
                                    </div>
                                    <div>
                                        <label className="form-label">Report Date</label>
                                        <div style={{ fontSize: 'var(--font-size-md)' }}>{orderReceipt.report_datetime ? new Date(orderReceipt.report_datetime).toLocaleString() : '-'}</div>
                                    </div>
                                    <div>
                                        <label className="form-label">Digital Copy</label>
                                        <div style={{ fontSize: 'var(--font-size-md)' }}>
                                            {orderReceipt.digital_copy ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewReceipt(true)}
                                                    className="btn btn-primary"
                                                    style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
                                                >
                                                    Consult Report
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-light)' }}>No file attached</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedOrder && !orderReceipt && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className={`btn btn-${showReceiptForm ? 'secondary' : 'primary'}`} onClick={() => setShowReceiptForm(!showReceiptForm)}>
                                {showReceiptForm ? 'Cancel Receipt Report' : 'Create Receipt Report'}
                            </button>
                        </div>
                    )}
                    {showReceiptForm && (
                        <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
                            <div className="card-header">
                                <h2 className="card-title">New Receipt Report</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleReceiptSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Report Full Code</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={receiptData.report_full_code}
                                                onChange={(e) => setReceiptData({ ...receiptData, report_full_code: e.target.value })}
                                                placeholder="e.g. PV-2024-001"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Digital Copy (Attachment)</label>
                                            <input
                                                type="file"
                                                className="form-input"
                                                onChange={(e) => setReceiptData({ ...receiptData, digital_copy: e.target.files[0] })}
                                                accept="image/*,application/pdf"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Save Receipt Report'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Associated Assets</h2>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Asset Name</th>
                                        <th>Inventory #</th>
                                        <th>Serial #</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderAssets.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>No assets linked to this order.</td>
                                        </tr>
                                    ) : (
                                        orderAssets.map(asset => (
                                            <tr key={asset.asset_id}>
                                                <td style={{ fontWeight: '500' }}>{asset.asset_name || '-'}</td>
                                                <td>{asset.asset_inventory_number || '-'}</td>
                                                <td>{asset.asset_serial_number || '-'}</td>
                                                <td><span className={`status-badge status-${asset.asset_status?.replace(/\s+/g, '-').toLowerCase()}`}>{asset.asset_status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Included Stock Items */}
                    {includedItems.stock_items.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Included Stock Items</h2>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Model</th>
                                            <th>Asset</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {includedItems.stock_items.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '500' }}>{item.name || '-'}</td>
                                                <td>{item.model || '-'}</td>
                                                <td>{item.asset_name || `Asset #${item.asset_id}`}</td>
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
                                <h2 className="card-title">Included Consumables</h2>
                            </div>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Model</th>
                                            <th>Asset</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {includedItems.consumables.map(item => (
                                            <tr key={item.id}>
                                                <td style={{ fontWeight: '500' }}>{item.name || '-'}</td>
                                                <td>{item.model || '-'}</td>
                                                <td>{item.asset_name || `Asset #${item.asset_id}`}</td>
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
                            <h2 className="card-title">Order Information</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Code</label>
                                    <input
                                        type="text"
                                        name="attribution_order_full_code"
                                        className="form-input"
                                        value={orderData.attribution_order_full_code}
                                        onChange={handleOrderChange}
                                        placeholder="e.g. ORD-2024-001"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
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
                                    <label className="form-label">Warehouse</label>
                                    <select
                                        name="warehouse"
                                        className="form-input"
                                        value={orderData.warehouse}
                                        onChange={handleOrderChange}
                                        required
                                    >
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map(w => (
                                            <option key={w.warehouse_id} value={w.warehouse_id}>
                                                {w.warehouse_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Barcode</label>
                                    <input
                                        type="text"
                                        name="attribution_order_barcode"
                                        className="form-input"
                                        value={orderData.attribution_order_barcode}
                                        onChange={handleOrderChange}
                                        placeholder="Scan barcode..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">Assets</h2>
                            <button type="button" onClick={addAssetRow} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 'var(--space-2)' }}>
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Asset
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
                                    <label className="form-label">Bulk Type</label>
                                    <select
                                        className="form-input"
                                        value={bulkAdd.asset_type}
                                        onChange={(e) => handleBulkTypeChange(e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        {assetTypes.map(t => (
                                            <option key={t.asset_type_id} value={t.asset_type_id}>{t.asset_type_label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Bulk Model</label>
                                    <select
                                        className="form-input"
                                        value={bulkAdd.asset_model}
                                        onChange={(e) => setBulkAdd((prev) => ({ ...prev, asset_model: e.target.value }))}
                                        disabled={!bulkAdd.asset_type}
                                    >
                                        <option value="">Select Model</option>
                                        {(assetModels[bulkAdd.asset_type] || []).map(m => (
                                            <option key={m.asset_model_id} value={m.asset_model_id}>{m.model_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
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
                                    Add Quantity
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Model</th>
                                        <th>Serial Number</th>
                                        <th>Inventory ID</th>
                                        <th>Name</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
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
                                                    <option value="">Select Type</option>
                                                    {assetTypes.map(t => (
                                                        <option key={t.asset_type_id} value={t.asset_type_id}>{t.asset_type_label}</option>
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
                                                    <option value="">Select Model</option>
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
                                                    placeholder="S/N"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ padding: 'var(--space-2)' }}
                                                    value={asset.asset_inventory_number}
                                                    onChange={(e) => handleAssetChange(index, 'asset_inventory_number', e.target.value)}
                                                    placeholder="Inv #"
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
                                                    placeholder="Asset Name"
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => configureIncludedItemsForRow(asset, 'stock')}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px', marginRight: '8px' }}
                                                    disabled={!asset.asset_model}
                                                    title={!asset.asset_model ? 'Select a model first' : 'Configure included stock items'}
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
                                                    title={!asset.asset_model ? 'Select a model first' : 'Configure included consumables'}
                                                >
                                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2v6m0 0v14m0-14c-2 0-6 1-6 5s4 5 6 5 6-1 6-5-4-5-6-5z"/>
                                                        <path d="M6 12c0 4 2.5 8 6 10 3.5-2 6-6 6-10" fill="none"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAssetRow(index)}
                                                    className="logout-btn"
                                                    title="Remove row"
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
                                    Creating...
                                </>
                            ) : 'Create Attribution Order & Assets'}
                        </button>
                    </div>
                </form>
            )}

            {previewReceipt && orderReceipt?.digital_copy && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }} onClick={() => setPreviewReceipt(false)}>
                    <div className="card" style={{ width: '100%', maxWidth: '900px', height: '90vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h2 style={{ margin: 0 }}>Consult Receipt Report: {orderReceipt.report_full_code || 'Attachment'}</h2>
                            <button className="btn btn-secondary" onClick={() => setPreviewReceipt(false)}>Close</button>
                        </div>
                        {getMimeType(orderReceipt.digital_copy) === 'application/pdf' ? (
                            <iframe
                                title="Receipt Report Preview"
                                src={`data:application/pdf;base64,${orderReceipt.digital_copy}`}
                                style={{ flexGrow: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div style={{ flexGrow: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                                <img
                                    src={`data:${getMimeType(orderReceipt.digital_copy)};base64,${orderReceipt.digital_copy}`}
                                    alt="Receipt Report Preview"
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
