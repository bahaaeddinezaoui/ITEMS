import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DeliveryNoteConsultPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();

    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!orderId) return;
            setLoading(true);
            setError('');
            try {
                const deliveryInfo = await purchaseOrderService.getDeliveryNote(orderId);
                setInfo(deliveryInfo);
                if (!deliveryInfo?.exists) {
                    setError('Delivery note not found');
                    return;
                }
                if (!deliveryInfo?.has_digital_copy) {
                    setError('No PDF stored for this delivery note');
                    return;
                }

                const resp = await purchaseOrderService.downloadDeliveryNote(orderId);
                const blob = resp?.data;
                const url = window.URL.createObjectURL(blob);
                setPdfUrl((prev) => {
                    if (prev) window.URL.revokeObjectURL(prev);
                    return url;
                });
            } catch (e) {
                setError(e?.response?.data?.error || 'Failed to load delivery note');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Delivery note</h1>
                    <p className="page-subtitle">Purchase order #{orderId}{info?.delivery_note_code ? ` • Code: ${info.delivery_note_code}` : ''}</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                    Back
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
            ) : pdfUrl ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '78vh' }}>
                    <iframe title="Delivery note PDF" src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none', background: 'var(--color-bg-secondary)' }} />
                </div>
            ) : null}
        </div>
    );
};

export default DeliveryNoteConsultPage;
