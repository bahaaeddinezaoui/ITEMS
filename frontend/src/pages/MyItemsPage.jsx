import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { myItemsService, problemReportService, roomService } from '../services/api';

const MyItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assets');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [myItems, setMyItems] = useState(null);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportObservation, setReportObservation] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportModalError, setReportModalError] = useState('');
    const [eligibleItems, setEligibleItems] = useState({ stock_items: [], consumables: [] });
    const [selectedStockItems, setSelectedStockItems] = useState([]);
    const [selectedConsumables, setSelectedConsumables] = useState([]);
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [maintenanceRooms, setMaintenanceRooms] = useState([]);
    const [destinationRoomId, setDestinationRoomId] = useState('');
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some((r) => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief') || false;
    }, [isSuperuser, user]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await myItemsService.get();
                setMyItems(data);
            } catch {
                setError('Failed to load your items');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const renderCurrentTable = (rows, columns) => {
        if (!rows || rows.length === 0) {
            return (
                <div className="empty-state">
                    <h3 className="empty-state-title">No items</h3>
                    <p className="empty-state-text">You don't currently own any items in this category.</p>
                </div>
            );
        }

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key}>{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id}>
                            {columns.map((c) => (
                                <td key={c.key}>{c.render(r)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const openReportModal = async (target) => {
        setSuccessMessage('');
        setError('');
        setReportModalError('');
        setReportTarget(target);
        setReportObservation('');
        setSelectedStockItems([]);
        setSelectedConsumables([]);
        setDestinationRoomId('');
        setShowReportModal(true);

        if (target.item_type === 'asset') {
            try {
                setLoadingEligible(true);
                const data = await problemReportService.getEligibleItems(target.item_id);
                setEligibleItems(data);
            } catch (err) {
                const msg = err?.response?.data?.error || err?.message || 'Failed to load eligible items';
                setReportModalError(typeof msg === 'string' ? msg : 'Failed to load eligible items');
                setEligibleItems({ stock_items: [], consumables: [] });
            } finally {
                setLoadingEligible(false);
            }

            try {
                setLoadingRooms(true);
                const rooms = await roomService.getByRoomType(2);
                setMaintenanceRooms(Array.isArray(rooms) ? rooms : []);
            } catch (err) {
                console.error('Failed to load maintenance rooms:', err);
                setMaintenanceRooms([]);
            } finally {
                setLoadingRooms(false);
            }
        } else {
            setEligibleItems({ stock_items: [], consumables: [] });
            setMaintenanceRooms([]);
        }
    };

    const toggleItemSelection = (id, type) => {
        if (type === 'stock_item') {
            setSelectedStockItems(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        } else {
            setSelectedConsumables(prev => 
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        }
    };

    const submitReport = async () => {
        if (!reportTarget) return;
        if (!reportObservation.trim()) {
            setReportModalError('Please enter an observation');
            return;
        }

        const hasIncludedItems = selectedStockItems.length > 0 || selectedConsumables.length > 0;
        if (reportTarget.item_type === 'asset' && hasIncludedItems && !destinationRoomId) {
            setReportModalError('Please select a destination maintenance room for the included items');
            return;
        }

        try {
            setReportSubmitting(true);
            setError('');
            setReportModalError('');
            setSuccessMessage('');
            await problemReportService.create({
                item_type: reportTarget.item_type,
                item_id: reportTarget.item_id,
                owner_observation: reportObservation.trim(),
                included_stock_item_ids: selectedStockItems,
                included_consumable_ids: selectedConsumables,
                destination_room_id: destinationRoomId || null,
            });
            setShowReportModal(false);
            setReportTarget(null);
            setReportObservation('');
            setSuccessMessage('Report submitted successfully');

            if (isChief && activeTab === 'reports') {
                const data = await problemReportService.getAll();
                void data;
            }
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || 'Failed to submit report';
            setReportModalError(typeof msg === 'string' ? msg : 'Failed to submit report');
        } finally {
            setReportSubmitting(false);
        }
    };

    const renderHistoryTable = (rows, columns) => {
        if (!rows || rows.length === 0) {
            return (
                <div className="empty-state">
                    <h3 className="empty-state-title">No history</h3>
                    <p className="empty-state-text">No previous ownership records found.</p>
                </div>
            );
        }

        return (
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key}>{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.assignment_id}>
                            {columns.map((c) => (
                                <td key={c.key}>{c.render(r)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const assetCurrentRows = (myItems?.assets?.current || []).map((a) => ({
        id: a.asset_id,
        name: a.asset_name || `Asset ${a.asset_id}`,
        status: a.asset_status,
        inventory: a.asset_inventory_number,
        serial: a.asset_serial_number,
    }));

    const assetHistoryRows = myItems?.assets?.history || [];

    const stockCurrentRows = (myItems?.stock_items?.current || []).map((s) => ({
        id: s.stock_item_id,
        name: s.stock_item_name || `Stock Item ${s.stock_item_id}`,
        status: s.stock_item_status,
        inventory: s.stock_item_inventory_number,
    }));

    const stockHistoryRows = myItems?.stock_items?.history || [];

    const consumableCurrentRows = (myItems?.consumables?.current || []).map((c) => ({
        id: c.consumable_id,
        name: c.consumable_name || `Consumable ${c.consumable_id}`,
        status: c.consumable_status,
        inventory: c.consumable_inventory_number,
        serial: c.consumable_serial_number,
    }));

    const consumableHistoryRows = myItems?.consumables?.history || [];

    const currentColumnsByTab = {
        assets: [
            { key: 'id', label: 'ID', render: (r) => r.id },
            { key: 'name', label: 'Name', render: (r) => r.name },
            { key: 'inventory', label: 'Inventory #', render: (r) => r.inventory || '-' },
            { key: 'serial', label: 'Serial #', render: (r) => r.serial || '-' },
            { key: 'status', label: 'Status', render: (r) => r.status || '-' },
            {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/dashboard/my-items/assets/${r.id}/maintenance-timeline`)}
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            View Maintenance
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => openReportModal({ item_type: 'asset', item_id: r.id, item_label: r.name })}
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            Report problem
                        </button>
                    </div>
                ),
            },
        ],
        stock_items: [
            { key: 'id', label: 'ID', render: (r) => r.id },
            { key: 'name', label: 'Name', render: (r) => r.name },
            { key: 'inventory', label: 'Inventory #', render: (r) => r.inventory || '-' },
            { key: 'status', label: 'Status', render: (r) => r.status || '-' },
            {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                    <button
                        className="btn btn-secondary"
                        onClick={() => openReportModal({ item_type: 'stock_item', item_id: r.id, item_label: r.name })}
                        style={{ padding: '0.25rem 0.5rem' }}
                    >
                        Report problem
                    </button>
                ),
            },
        ],
        consumables: [
            { key: 'id', label: 'ID', render: (r) => r.id },
            { key: 'name', label: 'Name', render: (r) => r.name },
            { key: 'inventory', label: 'Inventory #', render: (r) => r.inventory || '-' },
            { key: 'serial', label: 'Serial #', render: (r) => r.serial || '-' },
            { key: 'status', label: 'Status', render: (r) => r.status || '-' },
            {
                key: 'actions',
                label: 'Actions',
                render: (r) => (
                    <button
                        className="btn btn-secondary"
                        onClick={() => openReportModal({ item_type: 'consumable', item_id: r.id, item_label: r.name })}
                        style={{ padding: '0.25rem 0.5rem' }}
                    >
                        Report problem
                    </button>
                ),
            },
        ],
    };

    const historyColumnsByTab = {
        assets: [
            { key: 'assignment_id', label: 'Assignment ID', render: (r) => r.assignment_id },
            { key: 'asset_id', label: 'Asset ID', render: (r) => r.asset?.asset_id },
            { key: 'name', label: 'Name', render: (r) => r.asset?.asset_name || `Asset ${r.asset?.asset_id}` },
            { key: 'start', label: 'Start', render: (r) => (r.start_datetime ? new Date(r.start_datetime).toLocaleString() : '-') },
            { key: 'end', label: 'End', render: (r) => (r.end_datetime ? new Date(r.end_datetime).toLocaleString() : '-') },
            { key: 'condition', label: 'Condition', render: (r) => r.condition_on_assignment || '-' },
        ],
        stock_items: [
            { key: 'assignment_id', label: 'Assignment ID', render: (r) => r.assignment_id },
            { key: 'stock_item_id', label: 'Stock Item ID', render: (r) => r.stock_item?.stock_item_id },
            { key: 'name', label: 'Name', render: (r) => r.stock_item?.stock_item_name || `Stock Item ${r.stock_item?.stock_item_id}` },
            { key: 'start', label: 'Start', render: (r) => (r.start_datetime ? new Date(r.start_datetime).toLocaleString() : '-') },
            { key: 'end', label: 'End', render: (r) => (r.end_datetime ? new Date(r.end_datetime).toLocaleString() : '-') },
            { key: 'condition', label: 'Condition', render: (r) => r.condition_on_assignment || '-' },
        ],
        consumables: [
            { key: 'assignment_id', label: 'Assignment ID', render: (r) => r.assignment_id },
            { key: 'consumable_id', label: 'Consumable ID', render: (r) => r.consumable?.consumable_id },
            { key: 'name', label: 'Name', render: (r) => r.consumable?.consumable_name || `Consumable ${r.consumable?.consumable_id}` },
            { key: 'start', label: 'Start', render: (r) => (r.start_datetime ? new Date(r.start_datetime).toLocaleString() : '-') },
            { key: 'end', label: 'End', render: (r) => (r.end_datetime ? new Date(r.end_datetime).toLocaleString() : '-') },
            { key: 'condition', label: 'Condition', render: (r) => r.condition_on_assignment || '-' },
        ],
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">My Items</h1>
                <p className="page-subtitle">View what you currently own and your ownership history</p>
            </div>

            {successMessage && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-success)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-success)' }}>{successMessage}</div>
                </div>
            )}

            {error && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', borderColor: 'var(--color-error)' }}>
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>{error}</div>
                </div>
            )}

            <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button className={`btn ${activeTab === 'assets' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('assets')} style={{ flex: 1, whiteSpace: 'nowrap' }}>
                        Assets
                    </button>
                    <button className={`btn ${activeTab === 'stock_items' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stock_items')} style={{ flex: 1, whiteSpace: 'nowrap' }}>
                        Stock Items
                    </button>
                    <button className={`btn ${activeTab === 'consumables' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('consumables')} style={{ flex: 1, whiteSpace: 'nowrap' }}>
                        Consumables
                    </button>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-spinner" style={{ margin: '0 auto' }} />
                            <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                                <h2 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>Currently Owned</h2>
                            </div>
                            {activeTab === 'assets' && renderCurrentTable(assetCurrentRows, currentColumnsByTab.assets)}
                            {activeTab === 'stock_items' && renderCurrentTable(stockCurrentRows, currentColumnsByTab.stock_items)}
                            {activeTab === 'consumables' && renderCurrentTable(consumableCurrentRows, currentColumnsByTab.consumables)}

                            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                                <h2 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>Ownership History</h2>
                            </div>
                            {activeTab === 'assets' && renderHistoryTable(assetHistoryRows, historyColumnsByTab.assets)}
                            {activeTab === 'stock_items' && renderHistoryTable(stockHistoryRows, historyColumnsByTab.stock_items)}
                            {activeTab === 'consumables' && renderHistoryTable(consumableHistoryRows, historyColumnsByTab.consumables)}
                        </>
                    )}
                </div>
            </div>

            {showReportModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--space-6)',
                        zIndex: 50,
                    }}
                    onClick={() => {
                        if (!reportSubmitting) {
                            setShowReportModal(false);
                            setReportTarget(null);
                        }
                    }}
                >
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: 600 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>Report a problem</h2>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    if (!reportSubmitting) {
                                        setShowReportModal(false);
                                        setReportTarget(null);
                                    }
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{ padding: 'var(--space-4)' }}>
                            <div style={{ marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                                {reportTarget ? `${reportTarget.item_label} (${reportTarget.item_type} #${reportTarget.item_id})` : ''}
                            </div>

                            {reportModalError ? (
                                <div
                                    style={{
                                        marginBottom: 'var(--space-3)',
                                        padding: 'var(--space-3)',
                                        border: '1px solid var(--color-danger)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--color-danger)',
                                        background: 'rgba(220, 38, 38, 0.08)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {reportModalError}
                                </div>
                            ) : null}

                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Observation
                            </label>
                            <textarea
                                value={reportObservation}
                                onChange={(e) => setReportObservation(e.target.value)}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    fontSize: 'var(--font-size-sm)',
                                    boxSizing: 'border-box',
                                    marginBottom: 'var(--space-4)',
                                }}
                            />

                            {reportTarget?.item_type === 'asset' && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>Include other items you own</h3>
                                    <div style={{ marginBottom: 'var(--space-3)' }}>
                                        <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
                                            Destination maintenance room
                                        </label>
                                        <select
                                            value={destinationRoomId}
                                            onChange={(e) => setDestinationRoomId(e.target.value)}
                                            disabled={loadingRooms}
                                            style={{
                                                width: '100%',
                                                padding: 'var(--space-2)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                            }}
                                        >
                                            <option value="">{loadingRooms ? 'Loading rooms...' : 'Select a maintenance room'}</option>
                                            {maintenanceRooms.map((r) => (
                                                <option key={r.room_id} value={String(r.room_id)}>
                                                    {r.room_name} (#{r.room_id})
                                                </option>
                                            ))}
                                        </select>
                                        <div style={{ marginTop: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            Only maintenance rooms are shown.
                                        </div>
                                    </div>

                                    {loadingEligible ? (
                                        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>Loading eligible items...</div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                                                    <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Stock Items</h4>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedStockItems(eligibleItems.stock_items.map((s) => s.stock_item_id))}
                                                            disabled={eligibleItems.stock_items.length === 0}
                                                        >
                                                            Select all
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedStockItems([])}
                                                            disabled={selectedStockItems.length === 0}
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>
                                                {eligibleItems.stock_items.length === 0 ? (
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>None available</div>
                                                ) : (
                                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                        {eligibleItems.stock_items.map(s => (
                                                            <label key={s.stock_item_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)', cursor: 'pointer' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedStockItems.includes(s.stock_item_id)}
                                                                    onChange={() => toggleItemSelection(s.stock_item_id, 'stock_item')}
                                                                />
                                                                <span>{s.stock_item_name} ({s.stock_item_inventory_number})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                                                    <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>Consumables</h4>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedConsumables(eligibleItems.consumables.map((c) => c.consumable_id))}
                                                            disabled={eligibleItems.consumables.length === 0}
                                                        >
                                                            Select all
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.15rem 0.4rem', fontSize: 'var(--font-size-xs)' }}
                                                            onClick={() => setSelectedConsumables([])}
                                                            disabled={selectedConsumables.length === 0}
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>
                                                {eligibleItems.consumables.length === 0 ? (
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>None available</div>
                                                ) : (
                                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                                        {eligibleItems.consumables.map(c => (
                                                            <label key={c.consumable_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-1)', cursor: 'pointer' }}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedConsumables.includes(c.consumable_id)}
                                                                    onChange={() => toggleItemSelection(c.consumable_id, 'consumable')}
                                                                />
                                                                <span>{c.consumable_name} ({c.consumable_inventory_number})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        if (!reportSubmitting) {
                                            setShowReportModal(false);
                                            setReportTarget(null);
                                        }
                                    }}
                                    disabled={reportSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={submitReport}
                                    disabled={reportSubmitting}
                                >
                                    {reportSubmitting ? 'Submitting...' : 'Submit report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyItemsPage;
