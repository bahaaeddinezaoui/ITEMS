import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Package,
    Wrench,
    FileCheck,
    Building2,
    Hash,
    CheckCircle2,
    Lock,
    RotateCcw,
    ShoppingCart,
    Box,
    AlertCircle,
    Loader2,
    ChevronRight,
    CircleDot,
} from 'lucide-react';
import {
    purchaseOrderService,
    stockItemModelService,
    stockItemTypeService,
    stockItemService,
    consumableModelService,
    consumableTypeService,
    consumableService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const PurchaseOrderCreatePage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const currentLang = i18n.language;

    const getLocalizedLabel = (labelAr, labelEn, fallback) => {
        if (currentLang === 'ar') {
            if (labelAr && labelEn && labelAr !== labelEn) return `${labelAr} (${labelEn})`;
            return labelAr || labelEn || fallback;
        }
        if (labelEn && labelAr && labelEn !== labelAr) return `${labelEn} (${labelAr})`;
        return labelEn || labelAr || fallback;
    };

    const DRAFT_KEY = 'purchase_order_create_draft_v1';

    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [suppliersLoading, setSuppliersLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);

    const [stockTypesLoading, setStockTypesLoading] = useState(true);
    const [stockTypes, setStockTypes] = useState([]);
    const [stockModelsByType, setStockModelsByType] = useState({});

    const [consumableTypesLoading, setConsumableTypesLoading] = useState(true);
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [consumableModelsByType, setConsumableModelsByType] = useState({});

    const [form, setForm] = useState({
        supplier_id: '',
        purchase_order_code: '',
        is_signed_by_finance: false,
    });
    const [stockLines, setStockLines] = useState([]);
    const [consumableLines, setConsumableLines] = useState([]);

    const [createdStockItemIds, setCreatedStockItemIds] = useState([]);
    const [createdConsumableIds, setCreatedConsumableIds] = useState([]);

    const [draftHydrated, setDraftHydrated] = useState(false);
    const [clearing, setClearing] = useState(false);

    const loadDraft = () => {
        try {
            const raw = window.localStorage.getItem(DRAFT_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            return parsed;
        } catch {
            return null;
        }
    };

    const saveDraft = (draft) => {
        try {
            window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {
            // ignore
        }
    };

    const clearDraft = () => {
        try {
            window.localStorage.removeItem(DRAFT_KEY);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        const draft = loadDraft();
        const searchParams = new URLSearchParams(window.location.search);
        const completedIndex = searchParams.get('completedIndex');
        const completedType = searchParams.get('completedType');

        if (!draft) {
            setDraftHydrated(true);
            return;
        }

        if (draft.form && typeof draft.form === 'object') {
            setForm((prev) => ({
                ...prev,
                supplier_id: draft.form.supplier_id ?? prev.supplier_id,
                purchase_order_code: draft.form.purchase_order_code ?? prev.purchase_order_code,
                is_signed_by_finance: !!draft.form.is_signed_by_finance,
            }));
        }

        if (Array.isArray(draft.stockLines)) {
            const updatedStockLines = draft.stockLines.map((l, idx) => ({
                stock_item_type_id: l?.stock_item_type_id ?? '',
                stock_item_model_id: l?.stock_item_model_id ?? '',
                quantity_ordered: l?.quantity_ordered ?? '',
                unit_price: l?.unit_price ?? '',
                instances_added: (completedType === 'stock' && String(completedIndex) === String(idx)) ? true : (!!l?.instances_added),
            }));
            setStockLines(updatedStockLines);
            // Explicitly save draft before navigating to ensure instances_added is persisted
            if (completedType === 'stock' && completedIndex !== null) {
                saveDraft({
                    saved_at: new Date().toISOString(),
                    form: draft.form,
                    stockLines: updatedStockLines,
                    consumableLines: draft.consumableLines || [],
                });
            }
        }
        if (Array.isArray(draft.consumableLines)) {
            const updatedConsumableLines = draft.consumableLines.map((l, idx) => ({
                consumable_type_id: l?.consumable_type_id ?? '',
                consumable_model_id: l?.consumable_model_id ?? '',
                quantity_ordered: l?.quantity_ordered ?? '',
                unit_price: l?.unit_price ?? '',
                instances_added: (completedType === 'consumable' && String(completedIndex) === String(idx)) ? true : (!!l?.instances_added),
            }));
            setConsumableLines(updatedConsumableLines);
            // Explicitly save draft before navigating to ensure instances_added is persisted
            if (completedType === 'consumable' && completedIndex !== null) {
                saveDraft({
                    saved_at: new Date().toISOString(),
                    form: draft.form,
                    stockLines: draft.stockLines || [],
                    consumableLines: updatedConsumableLines,
                });
            }
        }

        if (Array.isArray(draft.createdStockItemIds)) {
            setCreatedStockItemIds(draft.createdStockItemIds);
        }
        if (Array.isArray(draft.createdConsumableIds)) {
            setCreatedConsumableIds(draft.createdConsumableIds);
        }

        setDraftHydrated(true);

        if (completedIndex !== null) {
            navigate('/dashboard/purchase-orders/create', { replace: true });
        }
    }, []);

    useEffect(() => {
        const loadSuppliers = async () => {
            setSuppliersLoading(true);
            setError('');
            try {
                const data = await purchaseOrderService.getSuppliers();
                setSuppliers(Array.isArray(data) ? data : (data?.results || []));
            } catch (e) {
                setSuppliers([]);
                setError(e?.response?.data?.error || t('poCreate.loadSuppliersError'));
            } finally {
                setSuppliersLoading(false);
            }
        };
        loadSuppliers();
    }, []);

    useEffect(() => {
        const loadTypes = async () => {
            setError('');

            setStockTypesLoading(true);
            try {
                const data = await stockItemTypeService.getAll();
                setStockTypes(Array.isArray(data) ? data : (data?.results || []));
            } catch (e) {
                setStockTypes([]);
                setError(e?.response?.data?.error || t('poCreate.loadStockTypesError'));
            } finally {
                setStockTypesLoading(false);
            }

            setConsumableTypesLoading(true);
            try {
                const data = await consumableTypeService.getAll();
                setConsumableTypes(Array.isArray(data) ? data : (data?.results || []));
            } catch (e) {
                setConsumableTypes([]);
                setError(e?.response?.data?.error || t('poCreate.loadConsumableTypesError'));
            } finally {
                setConsumableTypesLoading(false);
            }
        };

        loadTypes();
    }, []);

    useEffect(() => {
        if (!draftHydrated) return;
        const draft = {
            saved_at: new Date().toISOString(),
            form,
            stockLines,
            consumableLines,
        };
        saveDraft(draft);
    }, [form, stockLines, consumableLines]);

    useEffect(() => {
        const typeIds = Array.from(
            new Set((stockLines || []).map((l) => String(l.stock_item_type_id || '')).filter(Boolean))
        );
        typeIds.forEach((id) => {
            ensureStockModelsLoaded(id);
        });
    }, [stockLines]);

    useEffect(() => {
        const typeIds = Array.from(
            new Set((consumableLines || []).map((l) => String(l.consumable_type_id || '')).filter(Boolean))
        );
        typeIds.forEach((id) => {
            ensureConsumableModelsLoaded(id);
        });
    }, [consumableLines]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    const updateForm = (patch) => {
        setForm((prev) => ({
            ...prev,
            ...patch,
        }));
    };

    const addStockLine = () => {
        setStockLines((prev) => ([
            ...prev,
            {
                stock_item_type_id: '',
                stock_item_model_id: '',
                quantity_ordered: '',
                unit_price: '',
                instances_added: false,
            },
        ]));
    };

    const addConsumableLine = () => {
        setConsumableLines((prev) => ([
            ...prev,
            {
                consumable_type_id: '',
                consumable_model_id: '',
                quantity_ordered: '',
                unit_price: '',
                instances_added: false,
            },
        ]));
    };

    const ensureStockModelsLoaded = async (stockItemTypeId) => {
        if (!stockItemTypeId) return;
        if (stockModelsByType[String(stockItemTypeId)]) return;
        try {
            const data = await stockItemModelService.getByStockItemType(stockItemTypeId);
            const list = Array.isArray(data) ? data : (data?.results || []);
            setStockModelsByType((prev) => ({ ...prev, [String(stockItemTypeId)]: list }));
        } catch (e) {
            setStockModelsByType((prev) => ({ ...prev, [String(stockItemTypeId)]: [] }));
            setError(e?.response?.data?.error || t('poCreate.loadStockModelsError'));
        }
    };

    const openStockInstances = (typeId, modelId, qty, index) => {
        if (!typeId || !modelId) return;
        const qtyInt = Number(qty === '' || qty == null ? 1 : qty);
        const url = `/dashboard/stock-items/instances/create?typeId=${encodeURIComponent(typeId)}&modelId=${encodeURIComponent(modelId)}&qty=${encodeURIComponent(Number.isFinite(qtyInt) && qtyInt > 0 ? qtyInt : 1)}&lineIndex=${index}&lineType=stock`;
        window.location.assign(url);
    };

    const openConsumableInstances = (typeId, modelId, qty, index) => {
        if (!typeId || !modelId) return;
        const qtyInt = Number(qty === '' || qty == null ? 1 : qty);
        const url = `/dashboard/consumables/instances/create?typeId=${encodeURIComponent(typeId)}&modelId=${encodeURIComponent(modelId)}&qty=${encodeURIComponent(Number.isFinite(qtyInt) && qtyInt > 0 ? qtyInt : 1)}&lineIndex=${index}&lineType=consumable`;
        window.location.assign(url);
    };

    const ensureConsumableModelsLoaded = async (consumableTypeId) => {
        if (!consumableTypeId) return;
        if (consumableModelsByType[String(consumableTypeId)]) return;
        try {
            const data = await consumableModelService.getByConsumableType(consumableTypeId);
            const list = Array.isArray(data) ? data : (data?.results || []);
            setConsumableModelsByType((prev) => ({ ...prev, [String(consumableTypeId)]: list }));
        } catch (e) {
            setConsumableModelsByType((prev) => ({ ...prev, [String(consumableTypeId)]: [] }));
            setError(e?.response?.data?.error || t('poCreate.loadConsumableModelsError'));
        }
    };

    const updateStockLine = (index, patch) => {
        setStockLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };

    const updateConsumableLine = (index, patch) => {
        setConsumableLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };

    const isDuplicateStockTuple = (lines, index, typeId, modelId) => {
        if (!typeId || !modelId) return false;
        return (lines || []).some(
            (l, i) =>
                i !== index &&
                String(l?.stock_item_type_id || '') === String(typeId) &&
                String(l?.stock_item_model_id || '') === String(modelId)
        );
    };

    const isDuplicateConsumableTuple = (lines, index, typeId, modelId) => {
        if (!typeId || !modelId) return false;
        return (lines || []).some(
            (l, i) =>
                i !== index &&
                String(l?.consumable_type_id || '') === String(typeId) &&
                String(l?.consumable_model_id || '') === String(modelId)
        );
    };

    const usedStockModelIdsForType = (lines, index, typeId) => {
        if (!typeId) return new Set();
        const set = new Set();
        (lines || []).forEach((l, i) => {
            if (i === index) return;
            if (String(l?.stock_item_type_id || '') !== String(typeId)) return;
            if (!l?.stock_item_model_id) return;
            set.add(String(l.stock_item_model_id));
        });
        return set;
    };

    const usedConsumableModelIdsForType = (lines, index, typeId) => {
        if (!typeId) return new Set();
        const set = new Set();
        (lines || []).forEach((l, i) => {
            if (i === index) return;
            if (String(l?.consumable_type_id || '') !== String(typeId)) return;
            if (!l?.consumable_model_id) return;
            set.add(String(l.consumable_model_id));
        });
        return set;
    };

    const stockTypeHasAvailableModels = (typeId, index) => {
        const list = stockModelsByType[String(typeId)];
        if (!Array.isArray(list)) return true;
        const used = usedStockModelIdsForType(stockLines, index, typeId);
        const currentLine = (stockLines || [])[index] || {};
        const currentTypeId = currentLine?.stock_item_type_id;
        const currentModelId = currentLine?.stock_item_model_id;
        const available = list.filter((m) => {
            const mid = String(m.stock_item_model_id);
            if (String(currentTypeId || '') === String(typeId) && String(currentModelId || '') === mid) return true;
            return !used.has(mid);
        });
        return available.length > 0;
    };

    const consumableTypeHasAvailableModels = (typeId, index) => {
        const list = consumableModelsByType[String(typeId)];
        if (!Array.isArray(list)) return true;
        const used = usedConsumableModelIdsForType(consumableLines, index, typeId);
        const currentLine = (consumableLines || [])[index] || {};
        const currentTypeId = currentLine?.consumable_type_id;
        const currentModelId = currentLine?.consumable_model_id;
        const available = list.filter((m) => {
            const mid = String(m.consumable_model_id);
            if (String(currentTypeId || '') === String(typeId) && String(currentModelId || '') === mid) return true;
            return !used.has(mid);
        });
        return available.length > 0;
    };

    const removeStockLine = (index) => {
        setStockLines((prev) => prev.filter((_, i) => i !== index));
    };

    const removeConsumableLine = (index) => {
        setConsumableLines((prev) => prev.filter((_, i) => i !== index));
    };

    const submit = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            {
                const seen = new Set();
                for (const l of stockLines || []) {
                    if (!l?.stock_item_type_id || !l?.stock_item_model_id) continue;
                    const k = `${String(l.stock_item_type_id)}::${String(l.stock_item_model_id)}`;
                    if (seen.has(k)) {
                        setError(t('poCreate.duplicateStockLine'));
                        return;
                    }
                    seen.add(k);
                }
            }

            {
                const seen = new Set();
                for (const l of consumableLines || []) {
                    if (!l?.consumable_type_id || !l?.consumable_model_id) continue;
                    const k = `${String(l.consumable_type_id)}::${String(l.consumable_model_id)}`;
                    if (seen.has(k)) {
                        setError(t('poCreate.duplicateConsumableLine'));
                        return;
                    }
                    seen.add(k);
                }
            }

            const payload = {
                supplier_id: form.supplier_id ? Number(form.supplier_id) : '',
                purchase_order_code: form.purchase_order_code || null,
                is_signed_by_finance: !!form.is_signed_by_finance,
                stock_item_models: stockLines
                    .filter((l) => l.stock_item_model_id)
                    .map((l) => ({
                        stock_item_model_id: Number(l.stock_item_model_id),
                        quantity_ordered: l.quantity_ordered === '' ? null : Number(l.quantity_ordered),
                        unit_price: l.unit_price === '' ? null : l.unit_price,
                    })),
                consumable_models: consumableLines
                    .filter((l) => l.consumable_model_id)
                    .map((l) => ({
                        consumable_model_id: Number(l.consumable_model_id),
                        quantity_ordered: l.quantity_ordered === '' ? null : Number(l.quantity_ordered),
                        unit_price: l.unit_price === '' ? null : l.unit_price,
                    })),
            };

            const res = await purchaseOrderService.create(payload);
            const newId = res?.purchase_order_id;
            setSuccess(newId ? t('poCreate.createdWithId', { id: newId }) : t('poCreate.created'));

            clearDraft();

            if (newId) {
                navigate(`/dashboard/purchase-orders/${newId}`);
            } else {
                navigate('/dashboard/purchase-orders');
            }
        } catch (e) {
            setError(e?.response?.data?.error || t('poCreate.createError'));
        } finally {
            setSubmitting(false);
        }
    };

    const totalLines = (stockLines?.length || 0) + (consumableLines?.length || 0);
    const committedLines = (stockLines?.filter(l => l.instances_added).length || 0) + (consumableLines?.filter(l => l.instances_added).length || 0);

    return (
        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/purchase-orders')}
                        disabled={submitting}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                            background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
                            cursor: 'pointer', padding: 0, fontSize: 'var(--font-size-sm)', fontWeight: 500,
                            transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                    >
                        <ArrowLeft size={16} />
                        {t('common.back')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', boxShadow: 'var(--shadow-glow)', flexShrink: 0,
                        }}>
                            <ShoppingCart size={24} style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)' }}>
                                {t('poCreate.title')}
                            </h1>
                            <p className="page-subtitle" style={{ fontSize: 'var(--font-size-base)' }}>
                                {t('poCreate.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={async () => {
                        setClearing(true);
                        try {
                            for (const id of createdStockItemIds) {
                                try { await stockItemService.delete(id); } catch { /* already deleted */ }
                            }
                            for (const id of createdConsumableIds) {
                                try { await consumableService.delete(id); } catch { /* already deleted */ }
                            }
                        } finally {
                            clearDraft();
                            setForm({ supplier_id: '', purchase_order_code: '', is_signed_by_finance: false });
                            setStockLines([]);
                            setConsumableLines([]);
                            setCreatedStockItemIds([]);
                            setCreatedConsumableIds([]);
                            setClearing(false);
                        }
                    }}
                    disabled={submitting || clearing}
                    style={{ gap: 'var(--space-2)' }}
                >
                    {clearing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={16} />}
                    {clearing ? t('poCreate.clearingDraft') : t('poCreate.clearDraft')}
                </button>
            </div>

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

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <FileCheck size={18} style={{ color: 'var(--color-accent-secondary)' }} />
                        <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('poCreate.header')}</h2>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--space-6)', alignItems: 'start' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                                {t('poCreate.supplier')}
                            </label>
                            <select
                                className="form-input"
                                value={form.supplier_id}
                                onChange={(e) => updateForm({ supplier_id: e.target.value })}
                                disabled={submitting || suppliersLoading}
                                style={{ height: 44 }}
                            >
                                <option value="">{suppliersLoading ? t('common.loading') : t('poCreate.selectSupplier')}</option>
                                {suppliers.map((s) => (
                                    <option key={s.supplier_id} value={s.supplier_id}>
                                        {s.supplier_name} (#{s.supplier_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Hash size={14} style={{ color: 'var(--color-text-muted)' }} />
                                {t('poCreate.purchaseOrderCode')}
                            </label>
                            <input
                                className="form-input"
                                value={form.purchase_order_code}
                                onChange={(e) => updateForm({ purchase_order_code: e.target.value })}
                                placeholder={t('poCreate.codePlaceholder')}
                                style={{ height: 44 }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 'var(--space-7)' }}>
                            <button
                                type="button"
                                onClick={() => updateForm({ is_signed_by_finance: !form.is_signed_by_finance })}
                                disabled={submitting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    padding: 'var(--space-2) 0', color: form.is_signed_by_finance ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                    transition: 'color var(--transition-fast)',
                                }}
                            >
                                <div style={{
                                    width: 40, height: 22, borderRadius: 11, position: 'relative',
                                    background: form.is_signed_by_finance ? 'var(--color-success)' : 'var(--color-bg-secondary)',
                                    border: form.is_signed_by_finance ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                                    transition: 'all var(--transition-fast)', flexShrink: 0,
                                }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                                        position: 'absolute', top: 2,
                                        left: form.is_signed_by_finance ? 20 : 2,
                                        transition: 'left var(--transition-fast)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    }} />
                                </div>
                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                    {t('poCreate.signedByFinance')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Stock Item Lines */}
                <div className="card">
                    <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Package size={16} style={{ color: 'var(--color-accent-secondary)' }} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('poCreate.stockModelLines')}</h2>
                                    {stockLines.length > 0 && (
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {stockLines.length === 1 ? t('poCreate.oneItem') : t('poCreate.countItems', { count: stockLines.length })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addStockLine}
                                disabled={submitting}
                                style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                            >
                                <Plus size={16} />
                                {t('poCreate.addLine')}
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: stockLines.length === 0 ? 'var(--space-10) var(--space-6)' : 'var(--space-4) var(--space-6)' }}>
                        {stockLines.length === 0 ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)',
                                color: 'var(--color-text-muted)', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 'var(--radius-xl)',
                                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Package size={24} style={{ opacity: 0.5 }} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>{t('poCreate.noLines')}</p>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={addStockLine}
                                    disabled={submitting}
                                    style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}
                                >
                                    <Plus size={14} />
                                    {t('poCreate.addLine')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {stockLines.map((l, idx) => (
                                    <div
                                        key={`stock-${idx}`}
                                        style={{
                                            display: 'flex', gap: 'var(--space-4)', alignItems: 'stretch',
                                            background: l.instances_added ? 'rgba(16, 185, 129, 0.03)' : 'var(--color-bg-secondary)',
                                            border: l.instances_added ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                            transition: 'all var(--transition-fast)',
                                            opacity: l.instances_added ? 0.85 : 1,
                                        }}
                                    >
                                        {/* Line Number Badge */}
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                            background: l.instances_added ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                                            border: l.instances_added ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start',
                                            color: l.instances_added ? 'var(--color-success)' : 'var(--color-accent-secondary)',
                                            marginTop: 'var(--space-1)',
                                        }}>
                                            {idx + 1}
                                        </div>

                                        {/* Line Fields */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.2fr 1.4fr 0.7fr 0.8fr',
                                            gap: 'var(--space-4)', alignItems: 'end', flex: 1,
                                        }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.type')}</label>
                                                <select
                                                    className="form-input"
                                                    value={l.stock_item_type_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        updateStockLine(idx, { stock_item_type_id: v, stock_item_model_id: '' });
                                                        ensureStockModelsLoaded(v);
                                                    }}
                                                    disabled={submitting || stockTypesLoading || l.instances_added}
                                                >
                                                    <option value="">{stockTypesLoading ? t('common.loading') : t('poCreate.selectType')}</option>
                                                    {stockTypes
                                                        .filter((t) => {
                                                            const tid = t.stock_item_type_id;
                                                            if (String(l.stock_item_type_id || '') === String(tid)) return true;
                                                            return stockTypeHasAvailableModels(tid, idx);
                                                        })
                                                        .map((t) => (
                                                            <option key={t.stock_item_type_id} value={t.stock_item_type_id}>
                                                                {getLocalizedLabel(t.stock_item_type_label_ar, t.stock_item_type_label_en, t.stock_item_type_label)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.model')}</label>
                                                <select
                                                    className="form-input"
                                                    value={l.stock_item_model_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (isDuplicateStockTuple(stockLines, idx, l.stock_item_type_id, v)) {
                                                            setError(t('poCreate.duplicateStockLineShort'));
                                                            updateStockLine(idx, { stock_item_model_id: '' });
                                                            return;
                                                        }
                                                        updateStockLine(idx, { stock_item_model_id: v });
                                                    }}
                                                    onFocus={() => ensureStockModelsLoaded(l.stock_item_type_id)}
                                                    disabled={submitting || !l.stock_item_type_id || l.instances_added}
                                                >
                                                    <option value="">{t('poCreate.selectModel')}</option>
                                                    {(stockModelsByType[String(l.stock_item_type_id)] || [])
                                                        .filter((m) => {
                                                            const used = usedStockModelIdsForType(stockLines, idx, l.stock_item_type_id);
                                                            return !used.has(String(m.stock_item_model_id)) || String(m.stock_item_model_id) === String(l.stock_item_model_id || '');
                                                        })
                                                        .map((m) => (
                                                            <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                                {getLocalizedLabel(m.model_name_ar, m.model_name_en, m.model_name)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.qtyOrdered')}</label>
                                                <input className="form-input" value={l.quantity_ordered} onChange={(e) => updateStockLine(idx, { quantity_ordered: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.unitPrice')}</label>
                                                <input className="form-input" value={l.unit_price} onChange={(e) => updateStockLine(idx, { unit_price: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                        </div>

                                        {/* Line Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', justifyContent: 'center', flexShrink: 0 }}>
                                            {!l.instances_added && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => openStockInstances(l.stock_item_type_id, l.stock_item_model_id, l.quantity_ordered, idx)}
                                                    disabled={submitting || !l.stock_item_type_id || !l.stock_item_model_id}
                                                    title={!l.stock_item_type_id || !l.stock_item_model_id ? t('poCreate.selectTypeModelFirst') : undefined}
                                                    style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) var(--space-3)' }}
                                                >
                                                    <ChevronRight size={14} />
                                                    {t('poCreate.addInstances')}
                                                </button>
                                            )}
                                            {l.instances_added && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                    color: 'var(--color-success)', fontWeight: 600,
                                                    fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) 0',
                                                }}>
                                                    <CheckCircle2 size={14} />
                                                    {t('poCreate.instancesAdded')}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeStockLine(idx)}
                                                disabled={submitting || l.instances_added}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                                                    padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                    borderRadius: 'var(--radius-md)', cursor: (submitting || l.instances_added) ? 'not-allowed' : 'pointer',
                                                    background: 'transparent',
                                                    border: (submitting || l.instances_added) ? '1px solid transparent' : '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: (submitting || l.instances_added) ? 'var(--color-text-muted)' : 'var(--color-error)',
                                                    transition: 'all var(--transition-fast)',
                                                    opacity: (submitting || l.instances_added) ? 0.4 : 1,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                {t('common.remove')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Consumable Lines */}
                <div className="card">
                    <div className="card-header" style={{ padding: 'var(--space-4) var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Wrench size={16} style={{ color: '#a78bfa' }} />
                                </div>
                                <div>
                                    <h2 className="card-title" style={{ margin: 0, fontSize: 'var(--font-size-base)' }}>{t('poCreate.consumableModelLines')}</h2>
                                    {consumableLines.length > 0 && (
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {consumableLines.length === 1 ? t('poCreate.oneItem') : t('poCreate.countItems', { count: consumableLines.length })}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addConsumableLine}
                                disabled={submitting}
                                style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}
                            >
                                <Plus size={16} />
                                {t('poCreate.addLine')}
                            </button>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: consumableLines.length === 0 ? 'var(--space-10) var(--space-6)' : 'var(--space-4) var(--space-6)' }}>
                        {consumableLines.length === 0 ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)',
                                color: 'var(--color-text-muted)', textAlign: 'center',
                            }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 'var(--radius-xl)',
                                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Wrench size={24} style={{ opacity: 0.5 }} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>{t('poCreate.noLines')}</p>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={addConsumableLine}
                                    disabled={submitting}
                                    style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}
                                >
                                    <Plus size={14} />
                                    {t('poCreate.addLine')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {consumableLines.map((l, idx) => (
                                    <div
                                        key={`cons-${idx}`}
                                        style={{
                                            display: 'flex', gap: 'var(--space-4)', alignItems: 'stretch',
                                            background: l.instances_added ? 'rgba(16, 185, 129, 0.03)' : 'var(--color-bg-secondary)',
                                            border: l.instances_added ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)',
                                            transition: 'all var(--transition-fast)',
                                            opacity: l.instances_added ? 0.85 : 1,
                                        }}
                                    >
                                        {/* Line Number Badge */}
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 'var(--radius-full)',
                                            background: l.instances_added ? 'rgba(16, 185, 129, 0.12)' : 'rgba(139, 92, 246, 0.12)',
                                            border: l.instances_added ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(139, 92, 246, 0.25)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-xs)', fontWeight: 700, flexShrink: 0, alignSelf: 'flex-start',
                                            color: l.instances_added ? 'var(--color-success)' : '#a78bfa',
                                            marginTop: 'var(--space-1)',
                                        }}>
                                            {idx + 1}
                                        </div>

                                        {/* Line Fields */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.2fr 1.4fr 0.7fr 0.8fr',
                                            gap: 'var(--space-4)', alignItems: 'end', flex: 1,
                                        }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.type')}</label>
                                                <select
                                                    className="form-input"
                                                    value={l.consumable_type_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        updateConsumableLine(idx, { consumable_type_id: v, consumable_model_id: '' });
                                                        ensureConsumableModelsLoaded(v);
                                                    }}
                                                    disabled={submitting || consumableTypesLoading || l.instances_added}
                                                >
                                                    <option value="">{consumableTypesLoading ? t('common.loading') : t('poCreate.selectType')}</option>
                                                    {consumableTypes
                                                        .filter((t) => {
                                                            const tid = t.consumable_type_id;
                                                            if (String(l.consumable_type_id || '') === String(tid)) return true;
                                                            return consumableTypeHasAvailableModels(tid, idx);
                                                        })
                                                        .map((t) => (
                                                            <option key={t.consumable_type_id} value={t.consumable_type_id}>
                                                                {getLocalizedLabel(t.consumable_type_label_ar, t.consumable_type_label_en, t.consumable_type_label)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.model')}</label>
                                                <select
                                                    className="form-input"
                                                    value={l.consumable_model_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (isDuplicateConsumableTuple(consumableLines, idx, l.consumable_type_id, v)) {
                                                            setError(t('poCreate.duplicateConsumableLineShort'));
                                                            updateConsumableLine(idx, { consumable_model_id: '' });
                                                            return;
                                                        }
                                                        updateConsumableLine(idx, { consumable_model_id: v });
                                                    }}
                                                    onFocus={() => ensureConsumableModelsLoaded(l.consumable_type_id)}
                                                    disabled={submitting || !l.consumable_type_id || l.instances_added}
                                                >
                                                    <option value="">{t('poCreate.selectModel')}</option>
                                                    {(consumableModelsByType[String(l.consumable_type_id)] || [])
                                                        .filter((m) => {
                                                            const used = usedConsumableModelIdsForType(consumableLines, idx, l.consumable_type_id);
                                                            return !used.has(String(m.consumable_model_id)) || String(m.consumable_model_id) === String(l.consumable_model_id || '');
                                                        })
                                                        .map((m) => (
                                                            <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                                {getLocalizedLabel(m.model_name_ar, m.model_name_en, m.model_name)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.qtyOrdered')}</label>
                                                <input className="form-input" value={l.quantity_ordered} onChange={(e) => updateConsumableLine(idx, { quantity_ordered: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label">{t('poCreate.unitPrice')}</label>
                                                <input className="form-input" value={l.unit_price} onChange={(e) => updateConsumableLine(idx, { unit_price: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                        </div>

                                        {/* Line Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', justifyContent: 'center', flexShrink: 0 }}>
                                            {!l.instances_added && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => openConsumableInstances(l.consumable_type_id, l.consumable_model_id, l.quantity_ordered, idx)}
                                                    disabled={submitting || !l.consumable_type_id || !l.consumable_model_id}
                                                    title={!l.consumable_type_id || !l.consumable_model_id ? t('poCreate.selectTypeModelFirst') : undefined}
                                                    style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) var(--space-3)' }}
                                                >
                                                    <ChevronRight size={14} />
                                                    {t('poCreate.addInstances')}
                                                </button>
                                            )}
                                            {l.instances_added && (
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                                    color: 'var(--color-success)', fontWeight: 600,
                                                    fontSize: 'var(--font-size-xs)', padding: 'var(--space-2) 0',
                                                }}>
                                                    <CheckCircle2 size={14} />
                                                    {t('poCreate.instancesAdded')}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeConsumableLine(idx)}
                                                disabled={submitting || l.instances_added}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
                                                    padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                    borderRadius: 'var(--radius-md)', cursor: (submitting || l.instances_added) ? 'not-allowed' : 'pointer',
                                                    background: 'transparent',
                                                    border: (submitting || l.instances_added) ? '1px solid transparent' : '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: (submitting || l.instances_added) ? 'var(--color-text-muted)' : 'var(--color-error)',
                                                    transition: 'all var(--transition-fast)',
                                                    opacity: (submitting || l.instances_added) ? 0.4 : 1,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                {t('common.remove')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Bar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 'var(--space-8)', padding: 'var(--space-5) var(--space-6)',
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(10px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <Box size={16} />
                        <span>{totalLines === 1 ? t('poCreate.oneLine') : t('poCreate.countLines', { count: totalLines })}</span>
                    </div>
                    {committedLines > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>
                            <CheckCircle2 size={16} />
                            <span>{committedLines === 1 ? t('poCreate.committed_one') : t('poCreate.committed_other', { count: committedLines })}</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submit}
                    disabled={submitting}
                    style={{ width: 'auto', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-8)' }}
                >
                    {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={18} />}
                    {submitting ? t('poCreate.creating') : t('poCreate.createOrder')}
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrderCreatePage;
