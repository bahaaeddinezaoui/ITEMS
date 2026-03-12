import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    RefreshCw, 
    ArrowRightLeft, 
    Layers, 
    ShoppingCart, 
    MapPin, 
    Calendar,
    Check,
    X
} from 'lucide-react';
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

    const renderMovementCard = (m, kind) => {
        const id = kind === 'stock_item' ? m.stock_item_movement_id : m.consumable_movement_id;
        const itemId = kind === 'stock_item' ? m.stock_item_id : m.consumable_id;
        const pendingKeyAccept = `${kind}:${id}:accepted`;
        const pendingKeyReject = `${kind}:${id}:rejected`;
        const isSubmitting = submittingKey === pendingKeyAccept || submittingKey === pendingKeyReject;

        return (
            <div key={`${kind}-${id}`} className="card" style={{ transition: 'all 0.2s ease' }}>
                <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            background: 'var(--color-bg-secondary)', 
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-accent-primary)'
                        }}>
                            {kind === 'stock_item' ? <ShoppingCart size={20} /> : <Layers size={20} />}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '36px', height: '36px' }}
                                onClick={() => handleDecision({ kind, id, decision: 'accepted' })}
                                disabled={isSubmitting}
                                title="Accept Movement"
                            >
                                <Check size={18} />
                            </button>
                            <button 
                                className="btn btn-danger" 
                                style={{ padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)', width: '36px', height: '36px' }}
                                onClick={() => handleDecision({ kind, id, decision: 'rejected' })}
                                disabled={isSubmitting}
                                title="Reject Movement"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
                        {kind === 'stock_item' ? 'Stock Item' : 'Consumable'} #{itemId}
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)', fontWeight: 'normal' }}>
                            Move #{id}
                        </span>
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>From</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text)' }}>
                                    <MapPin size={14} className="text-accent" />
                                    <span style={{ fontWeight: '500' }}>Location #{m.source_location_id}</span>
                                </div>
                            </div>
                            <ArrowRightLeft size={16} className="text-muted" style={{ marginTop: 'var(--font-size-xs)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>To</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text)' }}>
                                    <MapPin size={14} className="text-success" />
                                    <span style={{ fontWeight: '500' }}>Location #{m.destination_location_id}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                <Calendar size={14} />
                                <span>{m.movement_datetime ? new Date(m.movement_datetime).toLocaleString() : 'N/A'}</span>
                            </div>
                            <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>{m.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)' }}>Included Items Movements Approval</h1>
                    <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                        Review and decide on pending equipment movements requested in problem reports.
                    </p>
                </div>
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={loadPending} 
                    disabled={loading}
                    style={{ padding: 'var(--space-3) var(--space-4)' }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {success && (
                <div className="success-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CheckCircle2 size={20} />
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="loading-state" style={{ padding: 'var(--space-16)' }}>
                    <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
                    <span style={{ fontSize: 'var(--font-size-lg)' }}>Loading pending approvals...</span>
                </div>
            ) : totalPending === 0 ? (
                <div className="empty-state" style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-16)' }}>
                    <div className="empty-state-icon">
                        <CheckCircle2 size={64} className="text-success" />
                    </div>
                    <h3 className="empty-state-title">All caught up!</h3>
                    <p className="empty-state-text">There are no pending movements requiring your approval at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
                    {pendingStockMoves.length > 0 && (
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <ShoppingCart size={20} className="text-accent" />
                                Pending Stock Item Movements
                                <span className="badge badge-secondary" style={{ marginLeft: 'var(--space-2)' }}>{pendingStockMoves.length}</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
                                {pendingStockMoves.map(m => renderMovementCard(m, 'stock_item'))}
                            </div>
                        </section>
                    )}

                    {pendingConsumableMoves.length > 0 && (
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Layers size={20} className="text-accent" />
                                Pending Consumable Movements
                                <span className="badge badge-secondary" style={{ marginLeft: 'var(--space-2)' }}>{pendingConsumableMoves.length}</span>
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
                                {pendingConsumableMoves.map(m => renderMovementCard(m, 'consumable'))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default IncludedItemMovementsApprovalPage;
