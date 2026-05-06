import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Wrench,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Hash,
    Tag,
    ClipboardList,
    Shield,
    FileText,
    Box,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { SkeletonCard } from '../components/SkeletonCard';
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
    }, [isStockConsumableResponsible, modelIdParam]);

    useEffect(() => {
        setLines((prev) => {
            const next = [];
            for (let i = 0; i < qty; i += 1) {
                next.push(prev[i] || {
                    consumable_name: '',
                    consumable_inventory_number: '',
                    consumable_status: 'not_delivered_to_company',
                });
            }
            return next;
        });
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
            const createdIds = [];
            for (let i = 0; i < lines.length; i += 1) {
                const l = lines[i] || {};
                const payload = {
                    consumable_model: Number(modelIdParam),
                    consumable_name: l.consumable_name || '',
                    consumable_inventory_number: l.consumable_inventory_number || '',
                    consumable_status: l.consumable_status || 'not_delivered_to_company',
                    destruction_certificate_id: null,
                    maintenance_step_id: null,
                };

                const res = await consumableService.create(payload);
                createdCount += 1;
                if (res?.consumable_id) {
                    createdIds.push(res.consumable_id);
                }
            }

            // Save created consumable IDs to draft so they can be deleted on clear
            const DRAFT_KEY = 'purchase_order_create_draft_v1';
            try {
                const raw = window.localStorage.getItem(DRAFT_KEY);
                const draft = raw ? JSON.parse(raw) : {};
                const existingIds = draft.createdConsumableIds || [];
                draft.createdConsumableIds = [...existingIds, ...createdIds];
                window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            } catch { /* ignore */ }

            setSuccess(createdCount === 1 ? t('consumableInstanceCreate.oneCreated') : t('consumableInstanceCreate.countCreated', { count: createdCount }));
            setLines((prev) => prev.map(() => ({
                consumable_name: '',
                consumable_inventory_number: '',
                consumable_status: 'in_stock',
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
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <BackButton onClick={() => navigate('/dashboard/purchase-orders/create')} />
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Wrench size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('consumableInstanceCreate.title')}</h1>
                        <p className="page-subtitle" style={{ fontSize: 'var(--font-size-base)' }}>
                            {t('consumableInstanceCreate.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    marginBottom: 'var(--space-6)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)',
                }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}
            {success && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                    marginBottom: 'var(--space-6)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)',
                }}>
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    {success}
                </div>
            )}

            {/* Model Info Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Tag size={18} style={{ color: '#a78bfa' }} />
                        <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('consumableInstanceCreate.model')}</h2>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-5) var(--space-6)' }}>
                    {loading ? (
                        <SkeletonCard header={false} lines={4} />
                    ) : model ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                <Wrench size={18} style={{ color: '#a78bfa' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{model.model_name || ''}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                    <Hash size={12} /> {model.consumable_model_id}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--color-text-muted)' }}>{t('consumableInstanceCreate.notFound')}</div>
                    )}
                </div>
            </div>

            {/* Instance Form */}
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                            background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ClipboardList size={16} style={{ color: '#a78bfa' }} />
                        </div>
                        <div>
                            <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('consumableInstanceCreate.coreInformation')}</h2>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                {lines.length === 1 ? t('consumableInstanceCreate.oneItemToCreate') : t('consumableInstanceCreate.countItemsToCreate', { count: lines.length })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <form onSubmit={submit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {lines.map((l, idx) => (
                                <div
                                    key={`line-${idx}`}
                                    style={{
                                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'stretch' }}>
                                        {/* Line Number Badge */}
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                            background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start',
                                            color: '#a78bfa', marginTop: 'var(--space-1)',
                                        }}>
                                            {idx + 1}
                                        </div>

                                        {/* Line Fields */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: 'var(--space-4)', alignItems: 'end', flex: 1 }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Tag size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                    {t('consumableInstanceCreate.nameItem', { index: idx + 1 })}
                                                </label>
                                                <input
                                                    className="form-input"
                                                    value={l.consumable_name}
                                                    onChange={(e) => updateLine(idx, { consumable_name: e.target.value })}
                                                    disabled={submitting}
                                                />
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Shield size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                    {t('common.status')}
                                                </label>
                                                <select
                                                    className="form-input"
                                                    value={l.consumable_status}
                                                    onChange={(e) => updateLine(idx, { consumable_status: e.target.value })}
                                                    disabled={submitting}
                                                >
                                                    <option value="not_delivered_to_company">{t('consumableInstanceCreate.notDeliveredToCompany')}</option>
                                                    <option value="in_stock">{t('consumableInstanceCreate.inStock')}</option>
                                                    <option value="failed">{t('consumableInstanceCreate.failed')}</option>
                                                    <option value="lost">{t('consumableInstanceCreate.lost')}</option>
                                                    <option value="stolen">{t('consumableInstanceCreate.stolen')}</option>
                                                    <option value="irrecoverably_damaged">{t('consumableInstanceCreate.irrecoverablyDamaged')}</option>
                                                    <option value="destroyed">{t('consumableInstanceCreate.destroyed')}</option>
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <Hash size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                    {t('consumableInstanceCreate.inventoryNumber')}
                                                </label>
                                                <input
                                                    className="form-input"
                                                    value={l.consumable_inventory_number}
                                                    onChange={(e) => updateLine(idx, { consumable_inventory_number: e.target.value })}
                                                    disabled={submitting}
                                                />
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                        {/* Submit Bar */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginTop: 'var(--space-8)', padding: 'var(--space-5) var(--space-6)',
                            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(10px)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                <Box size={16} />
                                <span>{lines.length === 1 ? t('consumableInstanceCreate.oneItem') : t('consumableInstanceCreate.countItems', { count: lines.length })}</span>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || loading || !modelIdParam || lines.length === 0}
                                style={{ width: 'auto', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-8)' }}
                            >
                                {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Wrench size={18} />}
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
