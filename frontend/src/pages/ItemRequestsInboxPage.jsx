import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    maintenanceStepItemRequestService,
    roomService,
    stockItemService,
    consumableService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const ItemRequestsInboxPage = () => {
    const { user } = useAuth();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [submittingId, setSubmittingId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [requests, setRequests] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [fulfillFormsById, setFulfillFormsById] = useState({});
    const [eligibleItemsByRequestId, setEligibleItemsByRequestId] = useState({});
    const [eligibleLoadingByRequestId, setEligibleLoadingByRequestId] = useState({});

    const pendingRequests = useMemo(() => {
        return (requests || []).filter((r) => (r.status || '').toLowerCase() === 'pending');
    }, [requests]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const [reqData, roomsData] = await Promise.all([
                maintenanceStepItemRequestService.getAll(),
                roomService.getAll(),
            ]);

            const reqList = reqData?.results || reqData || [];
            setRequests(Array.isArray(reqList) ? reqList : []);
            setRooms(Array.isArray(roomsData) ? roomsData : []);

            const defaults = {};
            (Array.isArray(reqList) ? reqList : []).forEach((r) => {
                defaults[r.maintenance_step_item_request_id] = {
                    source_room_id: '',
                    destination_room_id: '',
                    stock_item_id: '',
                    consumable_id: '',
                };
            });
            setFulfillFormsById(defaults);
        } catch (e) {
            setError('Failed to fetch item requests inbox');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (req) => {
        const id = req.maintenance_step_item_request_id;
        setSubmittingId(id);
        setError(null);
        setSuccess(null);

        try {
            const note = window.prompt('Rejection note (optional):', '') ?? '';
            const payload = {};
            if (note !== '') payload.note = note;
            await maintenanceStepItemRequestService.reject(id, payload);
            setSuccess(`Request #${id} rejected successfully`);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject request');
        } finally {
            setSubmittingId(null);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible]);

    const updateForm = (id, patch) => {
        setFulfillFormsById((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                ...patch,
            },
        }));
    };

    const autoFillSourceRoomForStockItem = async (requestId, stockItemIdValue) => {
        try {
            const stockItemId = Number(stockItemIdValue);
            if (!stockItemId || Number.isNaN(stockItemId)) return;
            const data = await stockItemService.getCurrentRoom(stockItemId);
            if (data && Object.prototype.hasOwnProperty.call(data, 'room_id')) {
                updateForm(requestId, { source_room_id: data.room_id || '' });
            }
        } catch {
            // Ignore; user can still pick rooms for destination and fulfill will validate.
        }
    };

    const autoFillSourceRoomForConsumable = async (requestId, consumableIdValue) => {
        try {
            const consumableId = Number(consumableIdValue);
            if (!consumableId || Number.isNaN(consumableId)) return;
            const data = await consumableService.getCurrentRoom(consumableId);
            if (data && Object.prototype.hasOwnProperty.call(data, 'room_id')) {
                updateForm(requestId, { source_room_id: data.room_id || '' });
            }
        } catch {
            // Ignore
        }
    };

    const loadCandidates = async (req) => {
        // Minimal approach:
        // - Let responsible type an ID manually OR choose from a filtered list.
        // We provide a basic list of items filtered by model if the backend supports it.
        // If the backend doesn't support filtering, user can still type ID.
        try {
            const data = await maintenanceStepItemRequestService.eligibleItems(req.maintenance_step_item_request_id);
            return Array.isArray(data?.results) ? data.results : [];
        } catch {
            return [];
        }
        return [];
    };

    const fetchEligibleItems = async (req) => {
        const id = req.maintenance_step_item_request_id;
        setEligibleLoadingByRequestId((prev) => ({ ...prev, [id]: true }));
        try {
            const data = await maintenanceStepItemRequestService.eligibleItems(id);
            const list = Array.isArray(data?.results) ? data.results : [];
            setEligibleItemsByRequestId((prev) => ({ ...prev, [id]: list }));
        } catch {
            setEligibleItemsByRequestId((prev) => ({ ...prev, [id]: [] }));
        } finally {
            setEligibleLoadingByRequestId((prev) => ({ ...prev, [id]: false }));
        }
    };

    const ensureEligibleItemsLoaded = async (req) => {
        const id = req.maintenance_step_item_request_id;
        if (eligibleLoadingByRequestId[id]) return;
        if (Array.isArray(eligibleItemsByRequestId[id])) return;
        await fetchEligibleItems(req);
    };

    const getRoomLabel = (roomId) => {
        const rid = Number(roomId);
        if (!rid || Number.isNaN(rid)) return '';
        const r = rooms.find((x) => Number(x.room_id) === rid);
        if (!r) return `#${rid}`;
        return `${r.room_name} (#${r.room_id})`;
    };

    const handleFulfill = async (req) => {
        const id = req.maintenance_step_item_request_id;
        const form = fulfillFormsById[id] || {};

        setSubmittingId(id);
        setError(null);
        setSuccess(null);

        try {
            if (!form.source_room_id || !form.destination_room_id) {
                setError('Source room and destination room are required');
                return;
            }

            const payload = {
                source_room_id: Number(form.source_room_id),
                destination_room_id: Number(form.destination_room_id),
            };

            if (req.request_type === 'stock_item') {
                if (!form.stock_item_id) {
                    setError('stock_item_id is required');
                    return;
                }
                payload.stock_item_id = Number(form.stock_item_id);
            } else if (req.request_type === 'consumable') {
                if (!form.consumable_id) {
                    setError('consumable_id is required');
                    return;
                }
                payload.consumable_id = Number(form.consumable_id);
            } else {
                setError('Invalid request type');
                return;
            }

            await maintenanceStepItemRequestService.fulfill(id, payload);
            setSuccess(`Request #${id} fulfilled successfully`);
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fulfill request');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleSelectRandom = async (req) => {
        const id = req.maintenance_step_item_request_id;
        setSubmittingId(id);
        setError(null);
        setSuccess(null);

        try {
            const data = await maintenanceStepItemRequestService.selectRandom(id);
            if (data.request_type === 'stock_item') {
                updateForm(id, {
                    stock_item_id: data.stock_item_id ? String(data.stock_item_id) : '',
                    source_room_id: data.source_room_id || '',
                });
            } else if (data.request_type === 'consumable') {
                updateForm(id, {
                    consumable_id: data.consumable_id ? String(data.consumable_id) : '',
                    source_room_id: data.source_room_id || '',
                });
            } else {
                setError('Invalid selection response');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to select randomly');
        } finally {
            setSubmittingId(null);
        }
    };

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Item Requests Inbox</h1>
                    <p className="page-subtitle">Fulfill maintenance step requests for stock items and consumables</p>
                </div>
                <div>
                    <button className="btn btn-secondary" onClick={fetchData}>
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div
                    className="badge badge-success"
                    style={{
                        padding: 'var(--space-4)',
                        width: '100%',
                        marginBottom: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    {success}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Pending Requests</h2>
                </div>
                <div className="card-body">
                    {pendingRequests.length === 0 ? (
                        <div style={{ opacity: 0.8 }}>No pending requests</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {pendingRequests.map((req) => {
                                const id = req.maintenance_step_item_request_id;
                                const form = fulfillFormsById[id] || {};

                                const requestedModelId =
                                    req.request_type === 'stock_item'
                                        ? req.requested_stock_item_model
                                        : req.requested_consumable_model;

                                return (
                                    <div
                                        key={id}
                                        className="card"
                                        style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)' }}
                                    >
                                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div className="card-title" style={{ marginBottom: 4 }}>
                                                    Request #{id}
                                                </div>
                                                <div style={{ fontSize: 12, opacity: 0.85 }}>
                                                    Type: <b>{req.request_type}</b> | Step: <b>{req.maintenance_step}</b> | Requested model id:{' '}
                                                    <b>{requestedModelId || '-'}</b>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 12, opacity: 0.85 }}>
                                                Status: <b>{req.status}</b>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                                    gap: 'var(--space-4)',
                                                    marginBottom: 'var(--space-4)',
                                                }}
                                            >
                                                {req.request_type === 'stock_item' ? (
                                                    <div className="form-group">
                                                        <label className="form-label">Stock Item</label>
                                                        <select
                                                            className="form-input"
                                                            value={form.stock_item_id}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const items = eligibleItemsByRequestId[id] || [];
                                                                const selected = items.find((x) => String(x.stock_item_id) === String(value));
                                                                updateForm(id, {
                                                                    stock_item_id: value,
                                                                    source_room_id: selected?.current_room_id || '',
                                                                });
                                                            }}
                                                            onFocus={() => ensureEligibleItemsLoaded(req)}
                                                        >
                                                            <option value="">Select stock item</option>
                                                            {(eligibleItemsByRequestId[id] || []).map((x) => (
                                                                <option key={x.stock_item_id} value={x.stock_item_id}>
                                                                    {x.stock_item_id}{x.stock_item_inventory_number ? ` (${x.stock_item_inventory_number})` : ''} - {getRoomLabel(x.current_room_id)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                                                            {eligibleLoadingByRequestId[id]
                                                                ? 'Loading available items...'
                                                                : 'Choose an available item that matches the requested model.'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="form-group">
                                                        <label className="form-label">Consumable</label>
                                                        <select
                                                            className="form-input"
                                                            value={form.consumable_id}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const items = eligibleItemsByRequestId[id] || [];
                                                                const selected = items.find((x) => String(x.consumable_id) === String(value));
                                                                updateForm(id, {
                                                                    consumable_id: value,
                                                                    source_room_id: selected?.current_room_id || '',
                                                                });
                                                            }}
                                                            onFocus={() => ensureEligibleItemsLoaded(req)}
                                                        >
                                                            <option value="">Select consumable</option>
                                                            {(eligibleItemsByRequestId[id] || []).map((x) => (
                                                                <option key={x.consumable_id} value={x.consumable_id}>
                                                                    {x.consumable_id}{x.consumable_inventory_number ? ` (${x.consumable_inventory_number})` : ''} - {getRoomLabel(x.current_room_id)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                                                            {eligibleLoadingByRequestId[id]
                                                                ? 'Loading available items...'
                                                                : 'Choose an available item that matches the requested model.'}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="form-group">
                                                    <label className="form-label">Source Room</label>
                                                    <select
                                                        className="form-input"
                                                        value={form.source_room_id}
                                                        onChange={() => {}}
                                                        disabled
                                                    >
                                                        <option value="">Source room (auto)</option>
                                                        {rooms.map((r) => (
                                                            <option key={r.room_id} value={r.room_id}>
                                                                {r.room_name} (#{r.room_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Destination Room</label>
                                                    <select
                                                        className="form-input"
                                                        value={form.destination_room_id}
                                                        onChange={(e) => updateForm(id, { destination_room_id: e.target.value })}
                                                    >
                                                        <option value="">Select destination room</option>
                                                        {rooms.map((r) => (
                                                            <option key={r.room_id} value={r.room_id}>
                                                                {r.room_name} (#{r.room_id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    disabled={submittingId === id}
                                                    onClick={() => handleFulfill(req)}
                                                >
                                                    {submittingId === id ? 'Fulfilling...' : 'Fulfill'}
                                                </button>

                                                <button
                                                    className="btn btn-secondary"
                                                    disabled={submittingId === id}
                                                    onClick={() => handleReject(req)}
                                                >
                                                    {submittingId === id ? 'Rejecting...' : 'Reject'}
                                                </button>

                                                <button
                                                    className="btn btn-secondary"
                                                    disabled={submittingId === id}
                                                    onClick={() => handleSelectRandom(req)}
                                                >
                                                    Select randomly
                                                </button>

                                                <button
                                                    className="btn btn-secondary"
                                                    disabled={submittingId === id}
                                                    onClick={async () => {
                                                        const candidates = await loadCandidates(req);
                                                        const list = candidates
                                                            .slice(0, 20)
                                                            .map((c) => {
                                                                if (req.request_type === 'stock_item') {
                                                                    return `${c.stock_item_id} - ${c.stock_item_name || ''} (model ${c.stock_item_model_id})`;
                                                                }
                                                                return `${c.consumable_id} - ${c.consumable_name || ''} (model ${c.consumable_model_id})`;
                                                            })
                                                            .join('\n');
                                                        window.alert(list || 'No candidates found (or backend filtering not available).');
                                                    }}
                                                >
                                                    Show candidates (top 20)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ItemRequestsInboxPage;
