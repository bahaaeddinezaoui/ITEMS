import { useState, useEffect } from 'react';
import {
    attributionOrderService,
    warehouseService,
    assetTypeService,
    assetModelService,
    assetService
} from '../services/api';

const AttributionOrdersPage = () => {
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

    const [assets, setAssets] = useState([
        { id: Date.now(), asset_type: '', asset_model: '', asset_serial_number: '', asset_inventory_number: '', asset_name: '' }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
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
        setOrderData({ ...orderData, [e.target.name]: e.target.value });
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
    };

    const addAssetRow = () => {
        setAssets([...assets, { id: Date.now(), asset_type: '', asset_model: '', asset_serial_number: '', asset_inventory_number: '', asset_name: '' }]);
    };

    const removeAssetRow = (index) => {
        if (assets.length > 1) {
            setAssets(assets.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. Create the Attribution Order
            const orderResponse = await attributionOrderService.create(orderData);
            const orderId = orderResponse.attribution_order_id;

            // 2. Create all Assets linked to this order
            const assetPromises = assets.map(asset => {
                const { id, ...assetCleanData } = asset;
                return assetService.create({
                    ...assetCleanData,
                    attribution_order: orderId,
                    asset_status: 'In Stock' // Default status
                });
            });

            await Promise.all(assetPromises);

            setSuccess('Attribution Order and Assets created successfully!');
            // Reset form
            setOrderData({
                attribution_order_full_code: '',
                attribution_order_date: new Date().toISOString().split('T')[0],
                warehouse: '',
                attribution_order_barcode: ''
            });
            setAssets([{ id: Date.now(), asset_type: '', asset_model: '', asset_serial_number: '', asset_inventory_number: '', asset_name: '' }]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create Attribution Order');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Create Attribution Order</h1>
                <p className="page-subtitle">Register new equipment and link them to an attribution order</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="badge badge-success" style={{ padding: 'var(--space-4)', width: '100%', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>{success}</div>}

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
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => removeAssetRow(index)}
                                                className="logout-btn"
                                                title="Remove row"
                                                disabled={assets.length === 1}
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
        </>
    );
};

export default AttributionOrdersPage;
