import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderReceivePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();

    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [order, setOrder] = useState(null);
    const [receiveStock, setReceiveStock] = useState([]);
    const [receiveConsumable, setReceiveConsumable] = useState([]);

    const allLinesCount = useMemo(() => (receiveStock.length + receiveConsumable.length), [receiveStock.length, receiveConsumable.length]);

    const load = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);

            setReceiveStock(
                (data?.stock_item_models || []).map((l) => ({
                    stock_item_model_id: l.stock_item_model_id,
                    model_name: l.model_name,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                }))
            );
            setReceiveConsumable(
                (data?.consumable_models || []).map((l) => ({
                    consumable_model_id: l.consumable_model_id,
                    model_name: l.model_name,
                    quantity_ordered: l.quantity_ordered,
                    quantity_received: l.quantity_received ?? 0,
                    newly_received: '',
                }))
            );
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || 'Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible, orderId]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    const submit = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const willHaveRemaining = [...receiveStock, ...receiveConsumable].some((l) => {
                const ordered = Number(l.quantity_ordered ?? 0);
                const alreadyReceived = Number(l.quantity_received ?? 0);
                const newly = Number(l.newly_received === '' ? 0 : l.newly_received);
                return (alreadyReceived + newly) < ordered;
            });

            if (willHaveRemaining) {
                const ok = window.confirm(
                    'Some items are still not fully received. A backorder report will be created. Do you want to continue?'
                );
                if (!ok) {
                    setSubmitting(false);
                    return;
                }
            }

            const payload = {
                stock_item_models: receiveStock.map((l) => ({
                    stock_item_model_id: Number(l.stock_item_model_id),
                    quantity_received: l.newly_received === '' ? 0 : Number(l.newly_received),
                })),
                consumable_models: receiveConsumable.map((l) => ({
                    consumable_model_id: Number(l.consumable_model_id),
                    quantity_received: l.newly_received === '' ? 0 : Number(l.newly_received),
                })),
            };

            const res = await purchaseOrderService.receive(orderId, payload);
            const createdBr = res?.backorder_report_id;

            if (createdBr) {
                setSuccess(`Received quantities saved. Backorder report #${createdBr} created.`);
            } else {
                setSuccess('Received quantities saved.');
            }

            navigate(`/dashboard/purchase-orders/${orderId}/backorder-reports`);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to submit received quantities');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Receive items</h1>
                    <p className="page-subtitle">Enter quantities received for each line.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${orderId}`)} disabled={submitting}>
                        Back
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={load} disabled={loading || submitting}>
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>
                    {success}
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
            ) : !order ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>Not found.</div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Order #{order.purchase_order_id}</h2>
                        </div>
                        <div className="card-body" style={{ color: 'var(--color-text-secondary)' }}>
                            {order.purchase_order_code || ''}
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Stock item models</h2>
                        </div>
                        <div className="card-body">
                            {(receiveStock || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>None</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Model</th>
                                                <th>Ordered</th>
                                                <th>Already received</th>
                                                <th>Newly received</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiveStock.map((l, idx) => (
                                                <tr key={`rs-${l.stock_item_model_id}`}>
                                                    <td>{l.stock_item_model_id}</td>
                                                    <td>{l.model_name || ''}</td>
                                                    <td>{l.quantity_ordered ?? ''}</td>
                                                    <td>{l.quantity_received ?? 0}</td>
                                                    <td style={{ minWidth: 180 }}>
                                                        <input
                                                            className="form-input"
                                                            type="number"
                                                            min="0"
                                                            value={l.newly_received}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setReceiveStock((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v } : x)));
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Consumable models</h2>
                        </div>
                        <div className="card-body">
                            {(receiveConsumable || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>None</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Model</th>
                                                <th>Ordered</th>
                                                <th>Already received</th>
                                                <th>Newly received</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiveConsumable.map((l, idx) => (
                                                <tr key={`rc-${l.consumable_model_id}`}>
                                                    <td>{l.consumable_model_id}</td>
                                                    <td>{l.model_name || ''}</td>
                                                    <td>{l.quantity_ordered ?? ''}</td>
                                                    <td>{l.quantity_received ?? 0}</td>
                                                    <td style={{ minWidth: 180 }}>
                                                        <input
                                                            className="form-input"
                                                            type="number"
                                                            min="0"
                                                            value={l.newly_received}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setReceiveConsumable((prev) => prev.map((x, i) => (i === idx ? { ...x, newly_received: v } : x)));
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: 'var(--color-text-secondary)' }}>{allLinesCount} lines</div>
                        <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderReceivePage;
