import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { consumableModelService, consumableService } from '../services/api';
import { useTranslation } from 'react-i18next';

const ConsumableInstanceCreatePage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const modelIdParam = searchParams.get('modelId');
    const qtyParam = searchParams.get('qty');
    const lineIndexParam = searchParams.get('lineIndex');
    const lineTypeParam = searchParams.get('lineType');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [model, setModel] = useState(null);

    const [lines, setLines] = useState([]);

    const qty = (() => {
        const n = Number(qtyParam);
        if (!Number.isFinite(n)) return 1;
        if (n <= 0) return 1;
        return Math.min(500, Math.floor(n));
    })();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            setSuccess('');
            try {
                if (!modelIdParam) {
                    setModel(null);
                    setError(t('consumableInstanceCreate.modelIdRequired'));
                    return;
                }
                const m = await consumableModelService.getById(modelIdParam);
                setModel(m || null);
            } catch (e) {
                setModel(null);
                setError(e?.response?.data?.error || t('consumableInstanceCreate.loadModelError'));
            } finally {
                setLoading(false);
            }
        };

        if (!isStockConsumableResponsible) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible, modelIdParam]);

    useEffect(() => {
        setLines((prev) => {
            const next = [];
            for (let i = 0; i < qty; i += 1) {
                next.push(prev[i] || {
                    consumable_name: '',
                    consumable_inventory_number: '',
                    consumable_status: 'not_delivered_to_company',
                    consumable_warranty_expiry_in_months: '',
                    consumable_name_in_administrative_certificate: '',
                });
            }
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qty]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    const updateLine = (index, patch) => {
        setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (!modelIdParam) {
                setError(t('consumableInstanceCreate.modelIdRequired'));
                return;
            }

            let createdCount = 0;
            for (let i = 0; i < lines.length; i += 1) {
                const l = lines[i] || {};
                const payload = {
                    consumable_model: Number(modelIdParam),
                    consumable_name: l.consumable_name || '',
                    consumable_inventory_number: l.consumable_inventory_number || '',
                    consumable_status: l.consumable_status || 'not_delivered_to_company',
                    consumable_warranty_expiry_in_months: l.consumable_warranty_expiry_in_months === '' ? '' : Number(l.consumable_warranty_expiry_in_months),
                    consumable_name_in_administrative_certificate: l.consumable_name_in_administrative_certificate || '',
                    destruction_certificate_id: null,
                    maintenance_step_id: null,
                };

                await consumableService.create(payload);
                createdCount += 1;
            }

            setSuccess(createdCount === 1 ? t('consumableInstanceCreate.oneCreated') : t('consumableInstanceCreate.countCreated', { count: createdCount }));
            setLines((prev) => prev.map(() => ({
                consumable_name: '',
                consumable_inventory_number: '',
                consumable_status: 'in_stock',
                consumable_warranty_expiry_in_months: '',
                consumable_name_in_administrative_certificate: '',
            })));

            if (lineIndexParam !== null && lineTypeParam === 'consumable') {
                setTimeout(() => {
                    navigate(`/dashboard/purchase-orders/create?completedIndex=${lineIndexParam}&completedType=consumable`);
                }, 1500);
            }
        } catch (e2) {
            setError(e2?.response?.data?.error || t('consumableInstanceCreate.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">{t('consumableInstanceCreate.title')}</h1>
                    <p className="page-subtitle">{t('consumableInstanceCreate.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders/create')}>
                        {t('common.back')}
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

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>{t('consumableInstanceCreate.model')}</h2>
                </div>
                <div className="card-body" style={{ color: 'var(--color-text-secondary)' }}>
                    {loading ? t('common.loading') : model ? `${model.model_name || ''} (#${model.consumable_model_id})` : t('consumableInstanceCreate.notFound')}
                </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>{t('consumableInstanceCreate.coreInformation')}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={submit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {lines.map((l, idx) => (
                                <div key={`line-${idx}`} className="card" style={{ background: 'var(--color-bg-primary)' }}>
                                    <div
                                        className="card-body"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.2fr 0.8fr 1fr 0.8fr 1.6fr',
                                            gap: 'var(--space-4)',
                                            alignItems: 'end',
                                        }}
                                    >
                                        <div className="form-group">
                                            <label className="form-label">{t('consumableInstanceCreate.nameItem', { index: idx + 1 })}</label>
                                            <input
                                                className="form-input"
                                                value={l.consumable_name}
                                                onChange={(e) => updateLine(idx, { consumable_name: e.target.value })}
                                                disabled={submitting}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">{t('common.status')}</label>
                                            <select
                                                className="form-input"
                                                value={l.consumable_status}
                                                onChange={(e) => updateLine(idx, { consumable_status: e.target.value })}
                                                disabled={submitting}
                                            >
                                                <option value="not_delivered_to_company">{t('consumableInstanceCreate.notDeliveredToCompany')}</option>
                                                <option value="in_stock">{t('consumableInstanceCreate.inStock')}</option>
                                                <option value="in_use">{t('consumableInstanceCreate.inUse')}</option>
                                                <option value="reserved">{t('consumableInstanceCreate.reserved')}</option>
                                                <option value="expired">{t('consumableInstanceCreate.expired')}</option>
                                                <option value="failed">{t('consumableInstanceCreate.failed')}</option>
                                                <option value="lost">{t('consumableInstanceCreate.lost')}</option>
                                                <option value="stolen">{t('consumableInstanceCreate.stolen')}</option>
                                                <option value="irrecoverably_damaged">{t('consumableInstanceCreate.irrecoverablyDamaged')}</option>
                                                <option value="destroyed">{t('consumableInstanceCreate.destroyed')}</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">{t('consumableInstanceCreate.inventoryNumber')}</label>
                                            <input
                                                className="form-input"
                                                value={l.consumable_inventory_number}
                                                onChange={(e) => updateLine(idx, { consumable_inventory_number: e.target.value })}
                                                disabled={submitting}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">{t('consumableInstanceCreate.warrantyMonths')}</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                min="0"
                                                value={l.consumable_warranty_expiry_in_months}
                                                onChange={(e) => updateLine(idx, { consumable_warranty_expiry_in_months: e.target.value })}
                                                disabled={submitting}
                                            />
                                        </div>

                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">{t('consumableInstanceCreate.nameInAdminCert')}</label>
                                            <input
                                                className="form-input"
                                                value={l.consumable_name_in_administrative_certificate}
                                                onChange={(e) => updateLine(idx, { consumable_name_in_administrative_certificate: e.target.value })}
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting || loading || !modelIdParam || lines.length === 0}>
                                {submitting ? t('common.saving') : (lines.length === 1 ? t('consumableInstanceCreate.createConsumable') : t('consumableInstanceCreate.createCountConsumables', { count: lines.length }))}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConsumableInstanceCreatePage;
