import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { movementApprovalService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IncludedItemMovementsApprovalPage = () => {
    const { user } = useAuth();
    const isStockConsumableResponsible = user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible');

    const [loading, setLoading] = useState(true);
    const [submittingKey, setSubmittingKey] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [pendingStockMoves, setPendingStockMoves] = useState([]);
    const [pendingConsumableMoves, setPendingConsumableMoves] = useState([]);

    const loadPending = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const [stock, consumables] = await Promise.all([
                movementApprovalService.getPendingStockItemMovements(),
                movementApprovalService.getPendingConsumableMovements(),
            ]);
            setPendingStockMoves(Array.isArray(stock) ? stock : []);
            setPendingConsumableMoves(Array.isArray(consumables) ? consumables : []);
        } catch (e) {
            setError('Failed to load pending movements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isStockConsumableResponsible) return;
        loadPending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStockConsumableResponsible]);

    const handleDecision = async ({ kind, id, decision }) => {
        const key = `${kind}:${id}:${decision}`;
        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            if (kind === 'stock_item') {
                await movementApprovalService.decideStockItemMovement(id, decision);
            } else if (kind === 'consumable') {
                await movementApprovalService.decideConsumableMovement(id, decision);
            } else {
                setError('Invalid movement type');
                return;
            }
            setSuccess(`Movement #${id} ${decision}`);
            await loadPending();
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to update movement');
        } finally {
            setSubmittingKey(null);
        }
    };

    const totalPending = useMemo(() => {
        return (pendingStockMoves?.length || 0) + (pendingConsumableMoves?.length || 0);
    }, [pendingStockMoves, pendingConsumableMoves]);

    if (!isStockConsumableResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Included Items Movements Approval</h1>
                <p className="page-subtitle">Approve/reject pending stock items and consumables movements requested in problem reports.</p>
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
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Pending Movements</h2>
                    <button type="button" className="btn btn-secondary" onClick={loadPending} disabled={loading}>
                        Refresh
                    </button>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
                    ) : totalPending === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No pending movements.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <h3 style={{ marginTop: 0 }}>Stock Items</h3>
                                {(pendingStockMoves || []).length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>No pending stock item movements.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 var(--space-2)' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>ID</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Stock Item</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>From Room</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>To Room</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                                                    <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingStockMoves.map((m) => {
                                                    const id = m.stock_item_movement_id;
                                                    const pendingKeyAccept = `stock_item:${id}:accepted`;
                                                    const pendingKeyReject = `stock_item:${id}:rejected`;
                                                    return (
                                                        <tr key={id}>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.stock_item_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.source_room_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.destination_room_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{m.movement_datetime ? String(m.movement_datetime) : ''}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{m.status}</td>
                                                            <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-3) var(--space-4)' }}>
                                                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'nowrap', minWidth: 'max-content' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-primary"
                                                                        disabled={submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject}
                                                                        onClick={() => handleDecision({ kind: 'stock_item', id, decision: 'accepted' })}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger"
                                                                        disabled={submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject}
                                                                        onClick={() => handleDecision({ kind: 'stock_item', id, decision: 'rejected' })}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 style={{ marginTop: 0 }}>Consumables</h3>
                                {(pendingConsumableMoves || []).length === 0 ? (
                                    <div style={{ color: 'var(--color-text-secondary)' }}>No pending consumable movements.</div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 var(--space-2)' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>ID</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Consumable</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>From Room</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>To Room</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                                                    <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                                                    <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingConsumableMoves.map((m) => {
                                                    const id = m.consumable_movement_id;
                                                    const pendingKeyAccept = `consumable:${id}:accepted`;
                                                    const pendingKeyReject = `consumable:${id}:rejected`;
                                                    return (
                                                        <tr key={id}>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.consumable_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.source_room_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.destination_room_id}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{m.movement_datetime ? String(m.movement_datetime) : ''}</td>
                                                            <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{m.status}</td>
                                                            <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-3) var(--space-4)' }}>
                                                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'nowrap', minWidth: 'max-content' }}>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-primary"
                                                                        disabled={submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject}
                                                                        onClick={() => handleDecision({ kind: 'consumable', id, decision: 'accepted' })}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-danger"
                                                                        disabled={submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject}
                                                                        onClick={() => handleDecision({ kind: 'consumable', id, decision: 'rejected' })}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncludedItemMovementsApprovalPage;
