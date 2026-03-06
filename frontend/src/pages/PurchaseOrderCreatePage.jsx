import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    purchaseOrderService,
    stockItemModelService,
    stockItemTypeService,
    consumableModelService,
    consumableTypeService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderCreatePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const DRAFT_KEY = 'purchase_order_create_draft_v1';

    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

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

    const [draftHydrated, setDraftHydrated] = useState(false);

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

        setDraftHydrated(true);

        if (completedIndex !== null) {
            navigate('/dashboard/purchase-orders/create', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                setError(e?.response?.data?.error || 'Failed to load suppliers');
            } finally {
                setSuppliersLoading(false);
            }
        };
        loadSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                setError(e?.response?.data?.error || 'Failed to load stock item types');
            } finally {
                setStockTypesLoading(false);
            }

            setConsumableTypesLoading(true);
            try {
                const data = await consumableTypeService.getAll();
                setConsumableTypes(Array.isArray(data) ? data : (data?.results || []));
            } catch (e) {
                setConsumableTypes([]);
                setError(e?.response?.data?.error || 'Failed to load consumable types');
            } finally {
                setConsumableTypesLoading(false);
            }
        };

        loadTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, stockLines, consumableLines]);

    useEffect(() => {
        const typeIds = Array.from(
            new Set((stockLines || []).map((l) => String(l.stock_item_type_id || '')).filter(Boolean))
        );
        typeIds.forEach((id) => {
            ensureStockModelsLoaded(id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stockLines]);

    useEffect(() => {
        const typeIds = Array.from(
            new Set((consumableLines || []).map((l) => String(l.consumable_type_id || '')).filter(Boolean))
        );
        typeIds.forEach((id) => {
            ensureConsumableModelsLoaded(id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setError(e?.response?.data?.error || 'Failed to load stock item models');
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
            setError(e?.response?.data?.error || 'Failed to load consumable models');
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
                        setError('Duplicate stock item line (same Type + Model). Please keep each tuple unique.');
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
                        setError('Duplicate consumable line (same Type + Model). Please keep each tuple unique.');
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
            setSuccess(newId ? `Purchase order #${newId} created` : 'Purchase order created');

            clearDraft();

            if (newId) {
                navigate(`/dashboard/purchase-orders/${newId}`);
            } else {
                navigate('/dashboard/purchase-orders');
            }
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to create purchase order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 'var(--space-4)' }}>
                <div>
                    <h1 className="page-title">Create Purchase Order</h1>
                    <p className="page-subtitle">Create a new purchase order with stock item/consumable model lines.</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            clearDraft();
                            setForm({ supplier_id: '', purchase_order_code: '', is_signed_by_finance: false });
                            setStockLines([]);
                            setConsumableLines([]);
                        }}
                        disabled={submitting}
                    >
                        Clear draft
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')} disabled={submitting}>
                        Back
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

            <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="card-header">
                    <h2 className="card-title" style={{ margin: 0 }}>Header</h2>
                </div>
                <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Supplier</label>
                        <select
                            className="form-input"
                            value={form.supplier_id}
                            onChange={(e) => updateForm({ supplier_id: e.target.value })}
                            disabled={submitting || suppliersLoading}
                        >
                            <option value="">{suppliersLoading ? 'Loading...' : 'Select supplier'}</option>
                            {suppliers.map((s) => (
                                <option key={s.supplier_id} value={s.supplier_id}>
                                    {s.supplier_name} (#{s.supplier_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Purchase order code</label>
                        <input
                            className="form-input"
                            value={form.purchase_order_code}
                            onChange={(e) => updateForm({ purchase_order_code: e.target.value })}
                            placeholder="e.g. PO-2026-001"
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <input
                                type="checkbox"
                                checked={!!form.is_signed_by_finance}
                                onChange={(e) => updateForm({ is_signed_by_finance: e.target.checked })}
                            />
                            Signed by finance
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>Stock item model lines</h2>
                        <button type="button" className="btn btn-secondary" onClick={addStockLine} disabled={submitting}>
                            Add line
                        </button>
                    </div>
                    <div className="card-body">
                        {stockLines.length === 0 ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>No lines.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {stockLines.map((l, idx) => (
                                    <div key={`stock-${idx}`} className="card" style={{ background: 'var(--color-bg-primary)' }}>
                                        <div
                                            className="card-body"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.2fr 1.4fr 0.7fr 0.8fr auto auto',
                                                gap: 'var(--space-3)',
                                                alignItems: 'end',
                                            }}
                                        >
                                            <div className="form-group">
                                                <label className="form-label">Type</label>
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
                                                    <option value="">{stockTypesLoading ? 'Loading...' : 'Select type'}</option>
                                                    {stockTypes
                                                        .filter((t) => {
                                                            const tid = t.stock_item_type_id;
                                                            if (String(l.stock_item_type_id || '') === String(tid)) return true;
                                                            return stockTypeHasAvailableModels(tid, idx);
                                                        })
                                                        .map((t) => (
                                                            <option key={t.stock_item_type_id} value={t.stock_item_type_id}>
                                                                {t.stock_item_type_label}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Model</label>
                                                <select
                                                    className="form-input"
                                                    value={l.stock_item_model_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (isDuplicateStockTuple(stockLines, idx, l.stock_item_type_id, v)) {
                                                            setError('Duplicate stock item line (same Type + Model).');
                                                            updateStockLine(idx, { stock_item_model_id: '' });
                                                            return;
                                                        }
                                                        updateStockLine(idx, { stock_item_model_id: v });
                                                    }}
                                                    onFocus={() => ensureStockModelsLoaded(l.stock_item_type_id)}
                                                    disabled={submitting || !l.stock_item_type_id || l.instances_added}
                                                >
                                                    <option value="">Select model</option>
                                                    {(stockModelsByType[String(l.stock_item_type_id)] || [])
                                                        .filter((m) => {
                                                            const used = usedStockModelIdsForType(stockLines, idx, l.stock_item_type_id);
                                                            return !used.has(String(m.stock_item_model_id)) || String(m.stock_item_model_id) === String(l.stock_item_model_id || '');
                                                        })
                                                        .map((m) => (
                                                            <option key={m.stock_item_model_id} value={m.stock_item_model_id}>
                                                                {m.model_name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Qty ordered</label>
                                                <input className="form-input" value={l.quantity_ordered} onChange={(e) => updateStockLine(idx, { quantity_ordered: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Unit price</label>
                                                <input className="form-input" value={l.unit_price} onChange={(e) => updateStockLine(idx, { unit_price: e.target.value })} disabled={l.instances_added} />
                                            </div>

                                            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'end', margin: 0 }}>
                                                {!l.instances_added && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => openStockInstances(l.stock_item_type_id, l.stock_item_model_id, l.quantity_ordered, idx)}
                                                        disabled={submitting || !l.stock_item_type_id || !l.stock_item_model_id}
                                                        title={!l.stock_item_type_id || !l.stock_item_model_id ? 'Select type and model first' : undefined}
                                                    >
                                                        Add instances
                                                    </button>
                                                )}
                                                {l.instances_added && (
                                                    <div style={{ color: 'var(--color-success)', fontWeight: 600, padding: 'var(--space-2) 0' }}>Instances added</div>
                                                )}
                                            </div>
                                            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'end', margin: 0 }}>
                                                <button type="button" className="btn btn-secondary" onClick={() => removeStockLine(idx)} disabled={submitting || l.instances_added}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="card-title" style={{ margin: 0 }}>Consumable model lines</h2>
                        <button type="button" className="btn btn-secondary" onClick={addConsumableLine} disabled={submitting}>
                            Add line
                        </button>
                    </div>
                    <div className="card-body">
                        {consumableLines.length === 0 ? (
                            <div style={{ color: 'var(--color-text-secondary)' }}>No lines.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {consumableLines.map((l, idx) => (
                                    <div key={`cons-${idx}`} className="card" style={{ background: 'var(--color-bg-primary)' }}>
                                        <div
                                            className="card-body"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1.2fr 1.4fr 0.7fr 0.8fr auto auto',
                                                gap: 'var(--space-3)',
                                                alignItems: 'end',
                                            }}
                                        >
                                            <div className="form-group">
                                                <label className="form-label">Type</label>
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
                                                    <option value="">{consumableTypesLoading ? 'Loading...' : 'Select type'}</option>
                                                    {consumableTypes
                                                        .filter((t) => {
                                                            const tid = t.consumable_type_id;
                                                            if (String(l.consumable_type_id || '') === String(tid)) return true;
                                                            return consumableTypeHasAvailableModels(tid, idx);
                                                        })
                                                        .map((t) => (
                                                            <option key={t.consumable_type_id} value={t.consumable_type_id}>
                                                                {t.consumable_type_label}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Model</label>
                                                <select
                                                    className="form-input"
                                                    value={l.consumable_model_id || ''}
                                                    onChange={(e) => {
                                                        const v = e.target.value;
                                                        if (isDuplicateConsumableTuple(consumableLines, idx, l.consumable_type_id, v)) {
                                                            setError('Duplicate consumable line (same Type + Model).');
                                                            updateConsumableLine(idx, { consumable_model_id: '' });
                                                            return;
                                                        }
                                                        updateConsumableLine(idx, { consumable_model_id: v });
                                                    }}
                                                    onFocus={() => ensureConsumableModelsLoaded(l.consumable_type_id)}
                                                    disabled={submitting || !l.consumable_type_id || l.instances_added}
                                                >
                                                    <option value="">Select model</option>
                                                    {(consumableModelsByType[String(l.consumable_type_id)] || [])
                                                        .filter((m) => {
                                                            const used = usedConsumableModelIdsForType(consumableLines, idx, l.consumable_type_id);
                                                            return !used.has(String(m.consumable_model_id)) || String(m.consumable_model_id) === String(l.consumable_model_id || '');
                                                        })
                                                        .map((m) => (
                                                            <option key={m.consumable_model_id} value={m.consumable_model_id}>
                                                                {m.model_name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Qty ordered</label>
                                                <input className="form-input" value={l.quantity_ordered} onChange={(e) => updateConsumableLine(idx, { quantity_ordered: e.target.value })} disabled={l.instances_added} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Unit price</label>
                                                <input className="form-input" value={l.unit_price} onChange={(e) => updateConsumableLine(idx, { unit_price: e.target.value })} disabled={l.instances_added} />
                                            </div>

                                            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'end', margin: 0 }}>
                                                {!l.instances_added && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => openConsumableInstances(l.consumable_type_id, l.consumable_model_id, l.quantity_ordered, idx)}
                                                        disabled={submitting || !l.consumable_type_id || !l.consumable_model_id}
                                                        title={!l.consumable_type_id || !l.consumable_model_id ? 'Select type and model first' : undefined}
                                                    >
                                                        Add instances
                                                    </button>
                                                )}
                                                {l.instances_added && (
                                                    <div style={{ color: 'var(--color-success)', fontWeight: 600, padding: 'var(--space-2) 0' }}>Instances added</div>
                                                )}
                                            </div>
                                            <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'end', margin: 0 }}>
                                                <button type="button" className="btn btn-secondary" onClick={() => removeConsumableLine(idx)} disabled={submitting || l.instances_added}>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
                <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Purchase Order'}
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrderCreatePage;
