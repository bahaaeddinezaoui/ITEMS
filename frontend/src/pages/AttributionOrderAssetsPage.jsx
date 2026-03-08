import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    attributionOrderService,
    assetService,
    warehouseService
} from '../services/api';

const AttributionOrderAssetsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [assets, setAssets] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [orderId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [orderData, assetsData, warehousesData] = await Promise.all([
                attributionOrderService.getById(orderId),
                assetService.getAll({ attribution_order: orderId }),
                warehouseService.getAll()
            ]);

            setOrder(orderData);
            setAssets(assetsData.results || assetsData || []);
            setWarehouses(warehousesData);
        } catch (err) {
            setError('Failed to fetch order assets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const normalized = status?.replace(/\s+/g, '-').toLowerCase() || 'unknown';
        return `status-badge status-${normalized}`;
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Associated Assets</h1>
                    <p className="page-subtitle">
                        {order?.attribution_order_full_code 
                            ? `Order: ${order.attribution_order_full_code}` 
                            : 'View all assets linked to this attribution order'}
                    </p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/dashboard/attribution-orders?orderId=${orderId}`)}
                    title="Back to Order"
                    aria-label="Back to Order"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Order Summary Card */}
            {order && (
                <div className="card" style={{ padding: 'var(--space-6)', borderLeft: '4px solid var(--color-primary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Order Code</div>
                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>{order.attribution_order_full_code}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Date</div>
                            <div style={{ fontSize: 'var(--font-size-md)' }}>{new Date(order.attribution_order_date).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Warehouse</div>
                            <div style={{ fontSize: 'var(--font-size-md)' }}>
                                {warehouses.find(w => w.warehouse_id === order.warehouse)?.warehouse_name || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Total Assets</div>
                            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', color: 'var(--color-primary)' }}>{assets.length}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assets List */}
            {assets.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--color-text-light)" strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                    </div>
                    <h3 style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>No Assets Found</h3>
                    <p style={{ color: 'var(--color-text-light)' }}>This attribution order has no linked assets.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {assets.map((asset) => (
                        <div
                            key={asset.asset_id}
                            className="card hover-row"
                            style={{
                                padding: 'var(--space-6)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onClick={() => navigate(`/dashboard/attribution-orders/${orderId}/assets/${asset.asset_id}/accessories`)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--color-bg-alt)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                                        {asset.asset_name || 'Unnamed Asset'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                        <span>ID: #{asset.asset_id}</span>
                                        {asset.asset_inventory_number && <span>• Inv: {asset.asset_inventory_number}</span>}
                                        {asset.asset_serial_number && <span>• S/N: {asset.asset_serial_number}</span>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <span className={getStatusBadgeClass(asset.asset_status)}>
                                    {asset.asset_status}
                                </span>
                                <div style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                                    Accessories →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttributionOrderAssetsPage;
