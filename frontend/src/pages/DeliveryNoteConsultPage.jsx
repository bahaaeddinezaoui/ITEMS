import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService } from '../services/api';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonListRows } from '../components/SkeletonCard';

const DeliveryNoteConsultPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

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
                    setError(t('deliveryNote.notFound'));
                    return;
                }
                if (!deliveryInfo?.has_digital_copy) {
                    setError(t('deliveryNote.noPdf'));
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
                setError(e?.response?.data?.error || t('deliveryNote.loadError'));
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
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><FileText size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('deliveryNote.title')}</h1>
                    <p className="page-subtitle">{t('deliveryNote.purchaseOrder')} #{orderId}{info?.delivery_note_code ? ` • ${t('deliveryNote.code')}: ${info.delivery_note_code}` : ''}</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                    {t('common.back')}
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                        <SkeletonListRows count={6} />
                    </div>
                </div>
            ) : pdfUrl ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '78vh' }}>
                    <iframe title={t('deliveryNote.pdfTitle')} src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none', background: 'var(--color-bg-secondary)' }} />
                </div>
            ) : null}
        </div>
    );
};

export default DeliveryNoteConsultPage;
