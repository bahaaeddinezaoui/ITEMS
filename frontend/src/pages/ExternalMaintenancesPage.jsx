import { useEffect, useMemo, useState } from 'react';
import { externalMaintenanceProviderService, externalMaintenanceService, roomService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ExternalMaintenancesPage = () => {
    const { user, isSuperuser } = useAuth();

    const TimelineItem = ({ label, date }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: date ? 'var(--color-success)' : 'var(--color-border)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: date ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>{date || 'Pending'}</span>
            </div>
        </div>
    );

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [sendSubmitting, setSendSubmitting] = useState(false);
    const [sendMessage, setSendMessage] = useState(null);
    const [providers, setProviders] = useState([]);
    const [externalCenterRooms, setExternalCenterRooms] = useState([]);
    const [allRooms, setAllRooms] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [selectedDestinationRoomId, setSelectedDestinationRoomId] = useState('');

    const [confirmSubmitting, setConfirmSubmitting] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState(null);

    const [sentToCompanySubmitting, setSentToCompanySubmitting] = useState(false);
    const [sentToCompanyMessage, setSentToCompanyMessage] = useState(null);

    const [receiveCompanyModalOpen, setReceiveCompanyModalOpen] = useState(false);
    const [receiveCompanySubmitting, setReceiveCompanySubmitting] = useState(false);
    const [receiveCompanyMessage, setReceiveCompanyMessage] = useState(null);
    const [receiveCompanyRoomId, setReceiveCompanyRoomId] = useState('');

    const isAssetResponsible = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'asset_responsible') || false;
    }, [isSuperuser, user]);

    const load = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await externalMaintenanceService.getAll();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load external maintenances');
        } finally {
            setLoading(false);
        }
    };

    const submitConfirmReceivedByCompany = async () => {
        if (!selectedItem) return;
        if (!receiveCompanyRoomId) {
            setReceiveCompanyMessage({ type: 'error', text: 'Please select a destination room.' });
            return;
        }

        try {
            setReceiveCompanySubmitting(true);
            setReceiveCompanyMessage(null);
            const updated = await externalMaintenanceService.confirmReceivedByCompany(
                selectedItem.external_maintenance_id,
                Number(receiveCompanyRoomId),
            );
            setReceiveCompanyMessage({ type: 'success', text: 'Confirmed as received by company.' });
            setSelectedItem(updated);
            setReceiveCompanyModalOpen(false);
            await load();
        } catch (err) {
            console.error(err);
            setReceiveCompanyMessage({ type: 'error', text: err.response?.data?.error || 'Failed to confirm received by company.' });
        } finally {
            setReceiveCompanySubmitting(false);
        }
    };

    const submitConfirmSentToCompany = async () => {
        if (!selectedItem) return;

        try {
            setSentToCompanySubmitting(true);
            setSentToCompanyMessage(null);
            const updated = await externalMaintenanceService.confirmSentToCompany(selectedItem.external_maintenance_id);
            setSentToCompanyMessage({ type: 'success', text: 'Confirmed as sent to company.' });
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setSentToCompanyMessage({ type: 'error', text: err.response?.data?.error || 'Failed to confirm sent to company.' });
        } finally {
            setSentToCompanySubmitting(false);
        }
    };

    const submitConfirmReceivedByProvider = async () => {
        if (!selectedItem) return;

        try {
            setConfirmSubmitting(true);
            setConfirmMessage(null);
            const updated = await externalMaintenanceService.confirmReceivedByProvider(selectedItem.external_maintenance_id);
            setConfirmMessage({ type: 'success', text: 'Confirmed as received by maintenance provider.' });
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setConfirmMessage({ type: 'error', text: err.response?.data?.error || 'Failed to confirm receipt.' });
        } finally {
            setConfirmSubmitting(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openDetails = (item) => {
        setSelectedItem(item);
        setSendMessage(null);
        setConfirmMessage(null);
        setSentToCompanyMessage(null);
        setSelectedProviderId('');
        setSelectedDestinationRoomId('');
        setReceiveCompanyModalOpen(false);
        setReceiveCompanySubmitting(false);
        setReceiveCompanyMessage(null);
        setReceiveCompanyRoomId('');
        setDetailsOpen(true);
    };

    const closeDetails = () => {
        setSelectedItem(null);
        setDetailsOpen(false);
        setSendSubmitting(false);
        setSendMessage(null);
        setConfirmSubmitting(false);
        setConfirmMessage(null);
        setSentToCompanySubmitting(false);
        setSentToCompanyMessage(null);
        setSelectedProviderId('');
        setSelectedDestinationRoomId('');
        setReceiveCompanyModalOpen(false);
        setReceiveCompanySubmitting(false);
        setReceiveCompanyMessage(null);
        setReceiveCompanyRoomId('');
    };

    useEffect(() => {
        const loadSendFormData = async () => {
            try {
                if (!detailsOpen) return;
                const [prov, rooms] = await Promise.all([
                    externalMaintenanceProviderService.getAll(),
                    roomService.getAll(),
                ]);
                setProviders(Array.isArray(prov) ? prov : []);
                const all = Array.isArray(rooms) ? rooms : [];
                setAllRooms(all);
                const filteredRooms = all.filter(
                    (r) => r?.room_type_label === 'External Maintenance Center'
                );
                setExternalCenterRooms(filteredRooms);
            } catch (err) {
                console.error(err);
                setProviders([]);
                setExternalCenterRooms([]);
                setAllRooms([]);
            }
        };

        loadSendFormData();
    }, [detailsOpen]);

    const submitSendToProvider = async () => {
        if (!selectedItem) return;
        if (!selectedProviderId) {
            setSendMessage({ type: 'error', text: 'Please select provider.' });
            return;
        }
        if (!selectedDestinationRoomId) {
            setSendMessage({ type: 'error', text: 'Please select destination room.' });
            return;
        }

        try {
            setSendSubmitting(true);
            setSendMessage(null);
            const updated = await externalMaintenanceService.sendToProvider(
                selectedItem.external_maintenance_id,
                Number(selectedProviderId),
                Number(selectedDestinationRoomId),
            );
            setSendMessage({ type: 'success', text: 'Asset sent to external maintenance provider.' });
            setSelectedItem(updated);
            await load();
        } catch (err) {
            console.error(err);
            setSendMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send to provider.' });
        } finally {
            setSendSubmitting(false);
        }
    };

    if (!isAssetResponsible) {
        return (
            <div className="empty-state">
                <p>You are not allowed to view external maintenances.</p>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="page-title">External Maintenances</h1>
                        <p className="page-subtitle">Consult external maintenance records</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => load()} disabled={loading}>
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    <div className="loading-spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>Loading external maintenances...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <p>No external maintenances found.</p>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>External Maintenance</th>
                                        <th>Maintenance</th>
                                        <th>Asset</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it) => (
                                        <tr key={it.external_maintenance_id}>
                                            <td>#{it.external_maintenance_id}</td>
                                            <td>#{it.maintenance}</td>
                                            <td>{it.maintenance_asset_name || it.maintenance_asset_id || '-'}</td>
                                            <td className="text-right">
                                                <button className="btn btn-sm btn-secondary" onClick={() => openDetails(it)}>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {detailsOpen && selectedItem && (
                <div className="modal-overlay" onClick={() => closeDetails()}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">External Maintenance Details</h3>
                            <button className="modal-close" onClick={() => closeDetails()}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>Asset Information</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>External Maintenance ID</div>
                                            <div style={{ fontWeight: 500 }}>#{selectedItem.external_maintenance_id}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Maintenance ID</div>
                                            <div style={{ fontWeight: 500 }}>#{selectedItem.maintenance}</div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>Asset</div>
                                            <div style={{ fontWeight: 500 }}>{selectedItem.maintenance_asset_name || selectedItem.maintenance_asset_id || '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-3)' }}>Timeline</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        <TimelineItem label="Sent to external maintenance" date={selectedItem.item_sent_to_external_maintenance_datetime} />
                                        <TimelineItem label="Received by maintenance provider" date={selectedItem.item_received_by_maintenance_provider_datetime} />
                                        <TimelineItem label="Sent to company" date={selectedItem.item_sent_to_company_datetime} />
                                        <TimelineItem label="Received by company" date={selectedItem.item_received_by_company_datetime} />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div style={{ padding: '0 var(--space-5) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {isAssetResponsible && !selectedItem.item_sent_to_external_maintenance_datetime && (
                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Send to External Maintenance Provider</div>

                                    {sendMessage && (
                                        <div className={`alert ${sendMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                                            {sendMessage.text}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Provider</label>
                                            <select
                                                className="form-input"
                                                value={selectedProviderId}
                                                onChange={(e) => setSelectedProviderId(e.target.value)}
                                                disabled={sendSubmitting || !!selectedItem.item_sent_to_external_maintenance_datetime}
                                            >
                                                <option value="">Select provider...</option>
                                                {providers.map((p) => (
                                                    <option key={p.external_maintenance_provider_id} value={p.external_maintenance_provider_id}>
                                                        {p.external_maintenance_provider_name || `Provider ${p.external_maintenance_provider_id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Destination Room</label>
                                            <select
                                                className="form-input"
                                                value={selectedDestinationRoomId}
                                                onChange={(e) => setSelectedDestinationRoomId(e.target.value)}
                                                disabled={sendSubmitting || !!selectedItem.item_sent_to_external_maintenance_datetime}
                                            >
                                                <option value="">Select room...</option>
                                                {externalCenterRooms.map((r) => (
                                                    <option key={r.room_id} value={r.room_id}>
                                                        {r.room_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => submitSendToProvider()}
                                        disabled={sendSubmitting || !selectedProviderId || !selectedDestinationRoomId}
                                        style={{ marginTop: 'var(--space-3)' }}
                                    >
                                        {sendSubmitting ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_sent_to_external_maintenance_datetime && !selectedItem.item_received_by_maintenance_provider_datetime && (
                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Confirm Received by Maintenance Provider</div>
                                    {confirmMessage && (
                                        <div className={`alert ${confirmMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                                            {confirmMessage.text}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => submitConfirmReceivedByProvider()}
                                        disabled={confirmSubmitting}
                                    >
                                        {confirmSubmitting ? 'Confirming...' : 'Confirm Received'}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_received_by_maintenance_provider_datetime && !selectedItem.item_sent_to_company_datetime && (
                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Confirm Asset Sent by External Maintenance Provider</div>
                                    {sentToCompanyMessage && (
                                        <div className={`alert ${sentToCompanyMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                                            {sentToCompanyMessage.text}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => submitConfirmSentToCompany()}
                                        disabled={sentToCompanySubmitting}
                                    >
                                        {sentToCompanySubmitting ? 'Confirming...' : 'Confirm Asset Sent'}
                                    </button>
                                </div>
                            )}

                            {isAssetResponsible && selectedItem.item_sent_to_company_datetime && !selectedItem.item_received_by_company_datetime && (
                                <div className="card" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Confirm Asset Received by Company</div>
                                    {receiveCompanyMessage && (
                                        <div className={`alert ${receiveCompanyMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                                            {receiveCompanyMessage.text}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setReceiveCompanyMessage(null);
                                            setReceiveCompanyRoomId('');
                                            setReceiveCompanyModalOpen(true);
                                        }}
                                        disabled={receiveCompanySubmitting}
                                    >
                                        Confirm Asset Received
                                    </button>
                                </div>
                            )}
                        </div>

                        {receiveCompanyModalOpen && (
                            <div className="modal-overlay" onClick={() => setReceiveCompanyModalOpen(false)}>
                                <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                                    <div className="modal-header">
                                        <h3 className="modal-title">Move Asset to Room</h3>
                                        <button className="modal-close" onClick={() => setReceiveCompanyModalOpen(false)}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        {receiveCompanyMessage && (
                                            <div className={`alert ${receiveCompanyMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                                                {receiveCompanyMessage.text}
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label className="form-label">Destination Room</label>
                                            <select
                                                className="form-input"
                                                value={receiveCompanyRoomId}
                                                onChange={(e) => setReceiveCompanyRoomId(e.target.value)}
                                                disabled={receiveCompanySubmitting}
                                            >
                                                <option value="">Select room...</option>
                                                {allRooms.map((r) => (
                                                    <option key={r.room_id} value={r.room_id}>
                                                        {r.room_name}{r.room_type_label ? ` - ${r.room_type_label}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setReceiveCompanyModalOpen(false)} disabled={receiveCompanySubmitting}>
                                            Cancel
                                        </button>
                                        <button className="btn btn-primary" onClick={() => submitConfirmReceivedByCompany()} disabled={receiveCompanySubmitting || !receiveCompanyRoomId}>
                                            {receiveCompanySubmitting ? 'Confirming...' : 'Confirm & Move'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => closeDetails()}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExternalMaintenancesPage;
