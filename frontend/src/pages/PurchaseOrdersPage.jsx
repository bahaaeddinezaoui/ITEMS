import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getAll();
            setOrders(Array.isArray(data) ? data : (data?.results || []));
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to load purchase orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Purchase orders</h1>
                    <p className="page-subtitle">Create purchase orders, receive items, and track backorders.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard/purchase-orders/create')}>
                        New
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Orders</h2>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                    ) : (orders || []).length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No purchase orders found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Code</th>
                                        <th>Supplier</th>
                                        <th style={{ width: 1 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={`po-${o.purchase_order_id}`}>
                                            <td>#{o.purchase_order_id}</td>
                                            <td>{o.purchase_order_code || ''}</td>
                                            <td>{o.supplier_name ? o.supplier_name : (o.supplier_id ? `Supplier #${o.supplier_id}` : '')}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}`)}>
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/receive`)}
                                                        disabled={o.has_remaining === false}
                                                        title={o.has_remaining === false ? 'All items have been received' : undefined}
                                                    >
                                                        Receive
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${o.purchase_order_id}/backorder-reports`)}>
                                                        Backorders
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrdersPage;
