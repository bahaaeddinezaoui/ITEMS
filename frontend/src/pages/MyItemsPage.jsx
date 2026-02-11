import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { myItemsService, problemReportService } from '../services/api';

const MyItemsPage = () => {
    const { user, isSuperuser } = useAuth();
    const [activeTab, setActiveTab] = useState('assets');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [myItems, setMyItems] = useState(null);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportObservation, setReportObservation] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
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

    const openReportModal = (target) => {
        setSuccessMessage('');
        setError('');
        setReportTarget(target);
        setReportObservation('');
        setShowReportModal(true);
    };

    const submitReport = async () => {
        if (!reportTarget) return;
        if (!reportObservation.trim()) {
            setError('Please enter an observation');
            return;
        }

        try {
            setReportSubmitting(true);
            setError('');
            setSuccessMessage('');
            await problemReportService.create({
                item_type: reportTarget.item_type,
                item_id: reportTarget.item_id,
                owner_observation: reportObservation.trim(),
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
            setError(typeof msg === 'string' ? msg : 'Failed to submit report');
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
                    <button
                        className="btn btn-secondary"
                        onClick={() => openReportModal({ item_type: 'asset', item_id: r.id, item_label: r.name })}
                        style={{ padding: '0.25rem 0.5rem' }}
                    >
                        Report problem
                    </button>
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
                    <button className={`btn ${activeTab === 'assets' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('assets')}>
                        Assets
                    </button>
                    <button className={`btn ${activeTab === 'stock_items' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('stock_items')}>
                        Stock Items
                    </button>
                    <button className={`btn ${activeTab === 'consumables' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('consumables')}>
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
                                }}
                            />

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
