import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderDetailsPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await purchaseOrderService.getById(orderId);
            setOrder(data || null);
        } catch (e) {
            setOrder(null);
            setError(e?.response?.data?.error || t('purchaseOrderDetails.loadError'));
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

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">{t('purchaseOrderDetails.title')}</h1>
                    <p className="page-subtitle">{t('purchaseOrderDetails.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        {t('common.back')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.loading')}</div>
            ) : !order ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.notFound')}</div>
            ) : (
                <>
                    {(() => {
                        const hasRemaining = [...(order.stock_item_models || []), ...(order.consumable_models || [])].some((l) => {
                            const ordered = Number(l.quantity_ordered ?? 0);
                            const received = Number(l.quantity_received ?? 0);
                            return ordered > received;
                        });

                        return (
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderDetails.header')}</h2>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                {hasRemaining && (
                                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/dashboard/purchase-orders/${order.purchase_order_id}/receive`)}>
                                        {t('purchaseOrderDetails.receiveItems')}
                                    </button>
                                )}
                                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/dashboard/purchase-orders/${order.purchase_order_id}/backorder-reports`)}>
                                    {t('purchaseOrderDetails.backorderReports')}
                                </button>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{t('purchaseOrderDetails.order')} #{order.purchase_order_id}</div>
                                <div style={{ color: 'var(--color-text-secondary)' }}>{order.purchase_order_code || ''}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{t('purchaseOrderDetails.supplier')}</div>
                                <div style={{ color: 'var(--color-text-secondary)' }}>{order.supplier_name ? order.supplier_name : (order.supplier_id ? `${t('purchaseOrderDetails.supplier')} #${order.supplier_id}` : '')}</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{t('purchaseOrderDetails.signedByFinance')}</div>
                                <div style={{ color: 'var(--color-text-secondary)' }}>{order.is_signed_by_finance ? t('common.yes') : t('common.no')}</div>
                            </div>
                        </div>
                    </div>
                        );
                    })()}

                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderDetails.stockItemModelLines')}</h2>
                        </div>
                        <div className="card-body">
                            {(order.stock_item_models || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>{t('common.id')}</th>
                                                <th>{t('purchaseOrderDetails.model')}</th>
                                                <th>{t('purchaseOrderDetails.ordered')}</th>
                                                <th>{t('purchaseOrderDetails.received')}</th>
                                                <th>{t('purchaseOrderDetails.unitPrice')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.stock_item_models.map((r) => (
                                                <tr key={`s-${r.stock_item_model_id}`}>
                                                    <td>{r.stock_item_model_id}</td>
                                                    <td>{r.model_name || ''}</td>
                                                    <td>{r.quantity_ordered ?? ''}</td>
                                                    <td>{r.quantity_received ?? ''}</td>
                                                    <td>{r.unit_price ?? ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>{t('purchaseOrderDetails.consumableModelLines')}</h2>
                        </div>
                        <div className="card-body">
                            {(order.consumable_models || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>{t('common.none')}</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>{t('common.id')}</th>
                                                <th>{t('purchaseOrderDetails.model')}</th>
                                                <th>{t('purchaseOrderDetails.ordered')}</th>
                                                <th>{t('purchaseOrderDetails.received')}</th>
                                                <th>{t('purchaseOrderDetails.unitPrice')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.consumable_models.map((r) => (
                                                <tr key={`c-${r.consumable_model_id}`}>
                                                    <td>{r.consumable_model_id}</td>
                                                    <td>{r.model_name || ''}</td>
                                                    <td>{r.quantity_ordered ?? ''}</td>
                                                    <td>{r.quantity_received ?? ''}</td>
                                                    <td>{r.unit_price ?? ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PurchaseOrderDetailsPage;
