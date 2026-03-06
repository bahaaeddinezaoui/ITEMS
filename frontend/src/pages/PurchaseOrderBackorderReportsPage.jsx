import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { backorderReportService, purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderBackorderReportsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();

    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [order, setOrder] = useState(null);
    const [remaining, setRemaining] = useState(null);
    const [remainingLoading, setRemainingLoading] = useState(false);

    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [selectedReportId, setSelectedReportId] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedLoading, setSelectedLoading] = useState(false);

    const loadHeader = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || 'Failed to load purchase order');
        } finally {
            setLoading(false);
        }
    };

    const loadRemaining = async () => {
        setRemainingLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getRemaining(orderId);
            setRemaining(data || null);
        } catch (e) {
            setRemaining(null);
            setError(e?.response?.data?.error || 'Failed to load remaining items');
        } finally {
            setRemainingLoading(false);
        }
    };

    const loadReports = async () => {
        setReportsLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getAll({ purchase_order_id: orderId });
            const items = Array.isArray(data) ? data : (data?.results || []);
            setReports(items);
            if (items.length > 0 && !selectedReportId) {
                setSelectedReportId(items[0].backorder_report_id);
            }
        } catch (e) {
            setReports([]);
            setError(e?.response?.data?.error || 'Failed to load backorder reports');
        } finally {
            setReportsLoading(false);
        }
    };

    const loadSelectedReport = async (reportId) => {
        if (!reportId) {
            setSelectedReport(null);
            return;
        }

        setSelectedLoading(true);
        setError('');
        try {
            const data = await backorderReportService.getById(reportId);
            setSelectedReport(data || null);
        } catch (e) {
            setSelectedReport(null);
            setError(e?.response?.data?.error || 'Failed to load backorder report details');
        } finally {
            setSelectedLoading(false);
        }
    };

    const refreshAll = async () => {
        await Promise.all([loadHeader(), loadRemaining(), loadReports()]);
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible, orderId]);

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        if (!selectedReportId) return;
        loadSelectedReport(selectedReportId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible, selectedReportId]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Backorder reports</h1>
                    <p className="page-subtitle">Track remaining quantities and generate reports.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        Back
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={refreshAll} disabled={loading || remainingLoading || reportsLoading}>
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
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title" style={{ margin: 0 }}>Order #{order.purchase_order_id}</h2>
                            {(remaining && ((remaining.stock_item_models || []).some((l) => Number(l.quantity_remaining ?? 0) > 0) || (remaining.consumable_models || []).some((l) => Number(l.quantity_remaining ?? 0) > 0))) && (
                                <button type="button" className="btn btn-primary" onClick={() => navigate(`/dashboard/purchase-orders/${orderId}/receive`)}>
                                    Receive items
                                </button>
                            )}
                        </div>
                        <div className="card-body" style={{ color: 'var(--color-text-secondary)' }}>
                            {order.purchase_order_code || ''}
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Remaining to deliver</h2>
                        </div>
                        <div className="card-body">
                            {remainingLoading ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                            ) : !remaining ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>No remaining data.</div>
                            ) : ((remaining.stock_item_models || []).length === 0 && (remaining.consumable_models || []).length === 0) ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>All items have been received.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    {(remaining.stock_item_models || []).length > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Stock item models</div>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Model</th>
                                                            <th>Ordered</th>
                                                            <th>Received</th>
                                                            <th>Remaining</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(remaining.stock_item_models || []).map((r) => (
                                                            <tr key={`rem-s-${r.stock_item_model_id}`}>
                                                                <td>{r.stock_item_model_id}</td>
                                                                <td>{r.model_name || ''}</td>
                                                                <td>{r.quantity_ordered ?? ''}</td>
                                                                <td>{r.quantity_received ?? ''}</td>
                                                                <td style={{ fontWeight: 600 }}>{r.quantity_remaining ?? ''}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {(remaining.consumable_models || []).length > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Consumable models</div>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table className="table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Model</th>
                                                            <th>Ordered</th>
                                                            <th>Received</th>
                                                            <th>Remaining</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(remaining.consumable_models || []).map((r) => (
                                                            <tr key={`rem-c-${r.consumable_model_id}`}>
                                                                <td>{r.consumable_model_id}</td>
                                                                <td>{r.model_name || ''}</td>
                                                                <td>{r.quantity_ordered ?? ''}</td>
                                                                <td>{r.quantity_received ?? ''}</td>
                                                                <td style={{ fontWeight: 600 }}>{r.quantity_remaining ?? ''}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Reports history</h2>
                        </div>
                        <div className="card-body">
                            {reportsLoading ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                            ) : (reports || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>No backorder reports yet.</div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'var(--space-4)' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reports.map((r) => {
                                                    const isActive = Number(selectedReportId) === Number(r.backorder_report_id);
                                                    return (
                                                        <tr
                                                            key={`br-${r.backorder_report_id}`}
                                                            style={{ cursor: 'pointer', background: isActive ? 'rgba(99, 102, 241, 0.10)' : undefined }}
                                                            onClick={() => setSelectedReportId(r.backorder_report_id)}
                                                        >
                                                            <td style={{ fontWeight: isActive ? 700 : 400 }}>#{r.backorder_report_id}</td>
                                                            <td>{r.backorder_report_date || ''}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Remaining snapshot (selected report)</div>
                                        {selectedLoading ? (
                                            <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                                        ) : !selectedReport ? (
                                            <div style={{ color: 'var(--color-text-secondary)' }}>Select a report to view its snapshot.</div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                                {(selectedReport.stock_item_models || []).length > 0 && (
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Stock item models</div>
                                                        <div style={{ overflowX: 'auto' }}>
                                                            <table className="table" style={{ width: '100%' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>ID</th>
                                                                        <th>Model</th>
                                                                        <th>Ordered</th>
                                                                        <th>Received</th>
                                                                        <th>Remaining</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(selectedReport.stock_item_models || []).map((r) => (
                                                                        <tr key={`snap-s-${r.stock_item_model_id}`}>
                                                                            <td>{r.stock_item_model_id}</td>
                                                                            <td>{r.model_name || ''}</td>
                                                                            <td>{r.quantity_ordered ?? ''}</td>
                                                                            <td>{r.quantity_received ?? ''}</td>
                                                                            <td style={{ fontWeight: 600 }}>{r.quantity_remaining ?? ''}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {(selectedReport.consumable_models || []).length > 0 && (
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Consumable models</div>
                                                        <div style={{ overflowX: 'auto' }}>
                                                            <table className="table" style={{ width: '100%' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>ID</th>
                                                                        <th>Model</th>
                                                                        <th>Ordered</th>
                                                                        <th>Received</th>
                                                                        <th>Remaining</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(selectedReport.consumable_models || []).map((r) => (
                                                                        <tr key={`snap-c-${r.consumable_model_id}`}>
                                                                            <td>{r.consumable_model_id}</td>
                                                                            <td>{r.model_name || ''}</td>
                                                                            <td>{r.quantity_ordered ?? ''}</td>
                                                                            <td>{r.quantity_received ?? ''}</td>
                                                                            <td style={{ fontWeight: 600 }}>{r.quantity_remaining ?? ''}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {(selectedReport.stock_item_models || []).length === 0 && (selectedReport.consumable_models || []).length === 0 && (
                                                    <div style={{ color: 'var(--color-text-secondary)' }}>No snapshot lines stored for this report.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderBackorderReportsPage;
