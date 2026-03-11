import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrderService, locationService, stockItemService, consumableService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrderMoveItemsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { orderId } = useParams();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [order, setOrder] = useState(null);
    const [acceptanceReport, setAcceptanceReport] = useState(null);
    const [locations, setLocations] = useState([]);

    const [stockItems, setStockItems] = useState([]);
    const [consumables, setConsumables] = useState([]);

    const [destinationsByKey, setDestinationsByKey] = useState({});
    const [submittingKey, setSubmittingKey] = useState(null);

    const [bulkDestinationId, setBulkDestinationId] = useState('');
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
    const [bulkErrors, setBulkErrors] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const [orderData, arData, locs, included] = await Promise.all([
                purchaseOrderService.getById(orderId),
                purchaseOrderService.getAcceptanceReport(orderId),
                locationService.getAll(),
                purchaseOrderService.includedItems(orderId),
            ]);
            setOrder(orderData || null);
            setAcceptanceReport(arData || null);

            const locList = Array.isArray(locs?.results) ? locs.results : Array.isArray(locs) ? locs : [];
            setLocations(locList);

            const stockList = Array.isArray(included?.stock_items) ? included.stock_items : [];
            const consList = Array.isArray(included?.consumables) ? included.consumables : [];

            const uniqStock = [];
            const seenStock = new Set();
            stockList.forEach((s) => {
                const sid = Number(s.stock_item_id);
                if (!sid || Number.isNaN(sid)) return;
                if (seenStock.has(sid)) return;
                seenStock.add(sid);
                uniqStock.push(s);
            });

            const uniqCons = [];
            const seenCons = new Set();
            consList.forEach((c) => {
                const cid = Number(c.consumable_id);
                if (!cid || Number.isNaN(cid)) return;
                if (seenCons.has(cid)) return;
                seenCons.add(cid);
                uniqCons.push(c);
            });

            setStockItems(uniqStock);
            setConsumables(uniqCons);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to load purchase order data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible, orderId]);

    const isFullySigned = useMemo(() => {
        const a = acceptanceReport;
        if (!a || !a.exists) return false;
        return !!(
            a.is_signed_by_director_of_administration_and_support
            && a.is_signed_by_protection_and_security_bureau_chief
            && a.is_signed_by_school_headquarter
            && a.is_signed_by_information_technilogy_bureau_chief
            && a.acceptance_report_is_stock_item_and_consumable_responsible
        );
    }, [acceptanceReport]);

    const allLocationOptions = useMemo(() => {
        return (locations || []).map((l) => ({ id: l.location_id, name: l.location_name }));
    }, [locations]);

    const setDestination = (key, value) => {
        setDestinationsByKey((prev) => ({ ...prev, [key]: value }));
    };

    const enrichCurrentLocations = async () => {
        try {
            const stockIds = (stockItems || []).map((s) => Number(s.stock_item_id)).filter((x) => x && !Number.isNaN(x));
            const consIds = (consumables || []).map((c) => Number(c.consumable_id)).filter((x) => x && !Number.isNaN(x));

            const [stockLocs, consLocs] = await Promise.all([
                Promise.all(stockIds.map((id) => stockItemService.getCurrentLocation(id).then((d) => [id, d]).catch(() => [id, null]))),
                Promise.all(consIds.map((id) => consumableService.getCurrentLocation(id).then((d) => [id, d]).catch(() => [id, null]))),
            ]);

            const stockLocMap = new Map(stockLocs.map(([id, d]) => [id, d?.location_id ?? null]));
            const consLocMap = new Map(consLocs.map(([id, d]) => [id, d?.location_id ?? null]));

            setStockItems((prev) => prev.map((s) => ({ ...s, current_location_id: stockLocMap.get(Number(s.stock_item_id)) ?? s.current_location_id ?? null })));
            setConsumables((prev) => prev.map((c) => ({ ...c, current_location_id: consLocMap.get(Number(c.consumable_id)) ?? c.current_location_id ?? null })));
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        if (loading) return;
        enrichCurrentLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, isStockConsumableResponsible]);

    const bulkItems = useMemo(() => {
        const list = [];
        (stockItems || []).forEach((s) => list.push({ kind: 'stock_item', id: s.stock_item_id }));
        (consumables || []).forEach((c) => list.push({ kind: 'consumable', id: c.consumable_id }));
        return list;
    }, [stockItems, consumables]);

    const handleBulkMove = async () => {
        if (!isFullySigned) return;
        if (!bulkDestinationId) return;

        const destination_location_id = bulkDestinationId;
        const items = bulkItems;

        setBulkSubmitting(true);
        setBulkErrors([]);
        setError('');
        setSuccess('');
        setBulkProgress({ done: 0, total: items.length });

        let anySuccess = false;

        try {
            for (let i = 0; i < items.length; i += 1) {
                const it = items[i];
                try {
                    if (it.kind === 'stock_item') {
                        await stockItemService.move(it.id, { destination_location_id });
                        anySuccess = true;
                    } else if (it.kind === 'consumable') {
                        await consumableService.move(it.id, { destination_location_id });
                        anySuccess = true;
                    }
                } catch (e) {
                    const msg = e?.response?.data?.error || 'Failed';
                    setBulkErrors((prev) => [...prev, `${it.kind} #${it.id}: ${msg}`]);
                } finally {
                    setBulkProgress({ done: i + 1, total: items.length });
                }
            }

            if (anySuccess) {
                setSuccess('Bulk move finished');
            }
        } finally {
            setBulkSubmitting(false);
        }
    };

    useEffect(() => {
        if (!orderId) return;
        if (!success) return;
        if (bulkSubmitting) return;
        if (bulkErrors.length > 0) return;
        if (bulkItems.length === 0) return;

        try {
            localStorage.setItem(`po_items_moved_${orderId}`, '1');
        } catch {
            // ignore
        }

        navigate('/dashboard/purchase-orders');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success, bulkSubmitting, bulkErrors.length, orderId]);

    const doMove = async ({ kind, id }) => {
        const key = `${kind}:${id}`;
        const destination_location_id = destinationsByKey[key];
        if (!destination_location_id) return;

        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            if (kind === 'stock_item') {
                await stockItemService.move(id, { destination_location_id });
            } else if (kind === 'consumable') {
                await consumableService.move(id, { destination_location_id });
            }

            setSuccess(`${kind} #${id} moved`);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to move item');
        } finally {
            setSubmittingKey(null);
        }
    };

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!loading && !isFullySigned) {
        return (
            <div className="page-container">
                <div className="card">
                    <div className="card-body">
                        <div className="alert alert-error">
                            All signatories must sign the acceptance report before moving items.
                        </div>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                            Back to Purchase Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Move Items (Purchase Order)</h1>
                    <p className="page-subtitle">Purchase order #{orderId}{order?.purchase_order_code ? ` | ${order.purchase_order_code}` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/purchase-orders')}>
                        Back
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={loadAll}>
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
                <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Bulk Move</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select
                                    className="form-input"
                                    value={bulkDestinationId}
                                    onChange={(e) => setBulkDestinationId(e.target.value)}
                                    style={{ minWidth: 280 }}
                                >
                                    <option value="">Select destination location</option>
                                    {allLocationOptions.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name || `#${l.id}`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    disabled={!isFullySigned || bulkSubmitting || !bulkDestinationId || bulkItems.length === 0}
                                    onClick={handleBulkMove}
                                >
                                    {bulkSubmitting ? `Moving... (${bulkProgress.done}/${bulkProgress.total})` : 'Move All Items'}
                                </button>
                                <div style={{ color: 'var(--color-text-secondary)' }}>Total items: {bulkItems.length}</div>
                            </div>

                            {bulkErrors.length > 0 && (
                                <div className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Some items failed to move</div>
                                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                        {bulkErrors.map((m, idx) => (
                                            <div key={idx}>{m}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Stock Items</h2>
                        </div>
                        <div className="card-body">
                            {(stockItems || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>No stock items added.</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Current location</th>
                                                <th>Destination</th>
                                                <th style={{ textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockItems.map((s) => {
                                                const key = `stock_item:${s.stock_item_id}`;
                                                return (
                                                    <tr key={key}>
                                                        <td>#{s.stock_item_id}</td>
                                                        <td>{s.stock_item_name || '-'}</td>
                                                        <td>{s.stock_item_status || '-'}</td>
                                                        <td>{s.current_location_id ? `#${s.current_location_id}` : '-'}</td>
                                                        <td>
                                                            <select
                                                                className="form-input"
                                                                value={destinationsByKey[key] || ''}
                                                                onChange={(e) => setDestination(key, e.target.value)}
                                                            >
                                                                <option value="">Select location</option>
                                                                {allLocationOptions.map((l) => (
                                                                    <option key={l.id} value={l.id}>
                                                                        {l.name || `#${l.id}`}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary"
                                                                disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                onClick={() => doMove({ kind: 'stock_item', id: s.stock_item_id })}
                                                            >
                                                                {submittingKey === key ? 'Moving...' : 'Move'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title" style={{ margin: 0 }}>Consumables</h2>
                        </div>
                        <div className="card-body">
                            {(consumables || []).length === 0 ? (
                                <div style={{ color: 'var(--color-text-secondary)' }}>No consumables added.</div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table" style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Current location</th>
                                                <th>Destination</th>
                                                <th style={{ textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {consumables.map((c) => {
                                                const key = `consumable:${c.consumable_id}`;
                                                return (
                                                    <tr key={key}>
                                                        <td>#{c.consumable_id}</td>
                                                        <td>{c.consumable_name || '-'}</td>
                                                        <td>{c.consumable_status || '-'}</td>
                                                        <td>{c.current_location_id ? `#${c.current_location_id}` : '-'}</td>
                                                        <td>
                                                            <select
                                                                className="form-input"
                                                                value={destinationsByKey[key] || ''}
                                                                onChange={(e) => setDestination(key, e.target.value)}
                                                            >
                                                                <option value="">Select location</option>
                                                                {allLocationOptions.map((l) => (
                                                                    <option key={l.id} value={l.id}>
                                                                        {l.name || `#${l.id}`}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary"
                                                                disabled={!isFullySigned || submittingKey === key || !destinationsByKey[key]}
                                                                onClick={() => doMove({ kind: 'consumable', id: c.consumable_id })}
                                                            >
                                                                {submittingKey === key ? 'Moving...' : 'Move'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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

export default PurchaseOrderMoveItemsPage;
