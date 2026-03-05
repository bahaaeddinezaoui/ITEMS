import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { movementApprovalService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssetMovementsApprovalPage = () => {
    const { user } = useAuth();
    const isAssetResponsible = user?.roles?.some((role) => role.role_code === 'asset_responsible');

    const [loading, setLoading] = useState(true);
    const [submittingKey, setSubmittingKey] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [pendingMoves, setPendingMoves] = useState([]);

    const loadPending = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const rows = await movementApprovalService.getPendingAssetMovements();
            setPendingMoves(Array.isArray(rows) ? rows : []);
        } catch (e) {
            setError('Failed to load pending movements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAssetResponsible) return;
        loadPending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAssetResponsible]);

    const handleDecision = async ({ id, decision }) => {
        const key = `${id}:${decision}`;
        setSubmittingKey(key);
        setError('');
        setSuccess('');
        try {
            await movementApprovalService.decideAssetMovement(id, decision);
            setSuccess(`Movement #${id} ${decision}`);
            await loadPending();
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to update movement');
        } finally {
            setSubmittingKey(null);
        }
    };

    const totalPending = useMemo(() => pendingMoves?.length || 0, [pendingMoves]);

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Asset Movements Approval</h1>
                <p className="page-subtitle">Approve/reject pending asset return requests from maintenance.</p>
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
                    <h2 className="card-title" style={{ margin: 0 }}>Pending Asset Movements</h2>
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
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 var(--space-2)' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>ID</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Asset</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>From Room</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>To Room</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Date</th>
                                        <th style={{ padding: 'var(--space-3) var(--space-4)' }}>Status</th>
                                        <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingMoves.map((m) => {
                                        const id = m.asset_movement_id;
                                        const pendingKeyAccept = `${id}:accepted`;
                                        const pendingKeyReject = `${id}:rejected`;
                                        return (
                                            <tr key={id}>
                                                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{id}</td>
                                                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>#{m.asset_id}</td>
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
                                                            onClick={() => handleDecision({ id, decision: 'accepted' })}
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            disabled={submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject}
                                                            onClick={() => handleDecision({ id, decision: 'rejected' })}
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
        </div>
    );
};

export default AssetMovementsApprovalPage;
