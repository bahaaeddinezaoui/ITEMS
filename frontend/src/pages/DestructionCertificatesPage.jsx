import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    consumableService,
    stockItemConsumableDestructionCertificateService,
    stockItemService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const DestructionCertificatesPage = () => {
    const { user, isSuperuser } = useAuth();

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    }, [user]);

    const isExploitationChief = isSuperuser || roleCodes.includes('exploitation_chief');
    const isItBureauChief = isSuperuser || roleCodes.includes('it_bureau_chief');
    const isStockConsumableResponsible = isSuperuser || roleCodes.includes('stock_consumable_responsible');

    const canView = isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible;
    const canCreate = isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible;
    const canValidate = isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible;
    const canUploadDigitalCopy = isSuperuser || isExploitationChief || isItBureauChief || isStockConsumableResponsible;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [certificates, setCertificates] = useState([]);
    const [failedStockItems, setFailedStockItems] = useState([]);
    const [failedConsumables, setFailedConsumables] = useState([]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [createForm, setCreateForm] = useState({
        stock_item_ids: [],
        consumable_ids: [],
    });

    const uploadFileInputRef = useRef(null);
    const [showMissingPdfModal, setShowMissingPdfModal] = useState(false);
    const [missingPdfCertId, setMissingPdfCertId] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const [certData, stockData, consData] = await Promise.all([
                stockItemConsumableDestructionCertificateService.getAll(),
                stockItemService.getAll({ stock_item_status: 'suggested_for_destruction' }),
                consumableService.getAll({ consumable_status: 'suggested_for_destruction' }),
            ]);

            const certList = certData?.results || certData || [];
            setCertificates(certList);

            const stockItems = stockData?.results || stockData || [];
            setFailedStockItems(Array.isArray(stockItems) ? stockItems : []);

            const consumables = consData?.results || consData || [];
            setFailedConsumables(Array.isArray(consumables) ? consumables : []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to load destruction certificates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canView) return;
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canView]);

    const toggleIdInList = (list, id) => {
        if (list.includes(id)) return list.filter((x) => x !== id);
        return [...list, id];
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const hasAny =
                createForm.stock_item_ids.length > 0 ||
                createForm.consumable_ids.length > 0;

            if (!hasAny) {
                setError('Select at least one item');
                return;
            }

            const formData = new FormData();
            formData.append('stock_item_ids', JSON.stringify(createForm.stock_item_ids));
            formData.append('consumable_ids', JSON.stringify(createForm.consumable_ids));

            await stockItemConsumableDestructionCertificateService.create(formData);
            await fetchAll();

            setSuccess('Destruction certificate created successfully');
            setShowCreateForm(false);
            setCreateForm({ stock_item_ids: [], consumable_ids: [] });
        } catch (err) {
            const msg = err?.response?.data?.error || (typeof err?.response?.data === 'object' ? JSON.stringify(err.response.data) : '') || 'Failed to create destruction certificate';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleValidate = async (id) => {
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await stockItemConsumableDestructionCertificateService.validate(id);
            await fetchAll();
            setSuccess(`Certificate #${id} validated. Linked items were set to destroyed.`);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to validate certificate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConsultPdf = async (id) => {
        setError('');
        setSuccess('');
        try {
            const existsResp = await stockItemConsumableDestructionCertificateService.digitalCopyExists(id);
            if (existsResp?.exists) {
                const blob = await stockItemConsumableDestructionCertificateService.getDigitalCopyBlob(id);
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank', 'noopener,noreferrer');
                setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
                return;
            }
            setMissingPdfCertId(id);
            setShowMissingPdfModal(true);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                setMissingPdfCertId(id);
                setShowMissingPdfModal(true);
                return;
            }
            setError(err?.response?.data?.error || 'Failed to consult PDF');
        }
    };

    const startUploadMissingPdf = () => {
        if (!missingPdfCertId) return;
        if (uploadFileInputRef.current) {
            uploadFileInputRef.current.value = '';
            uploadFileInputRef.current.click();
        }
    };

    const onUploadFileSelected = async (e) => {
        const file = e.target.files?.[0] || null;
        const id = missingPdfCertId;
        setShowMissingPdfModal(false);
        setMissingPdfCertId(null);
        if (!id || !file) return;

        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            formData.append('digital_copy', file);
            await stockItemConsumableDestructionCertificateService.uploadDigitalCopy(id, formData);
            await fetchAll();
            const blob = await stockItemConsumableDestructionCertificateService.getDigitalCopyBlob(id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to upload PDF');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    const selectableStockItems = failedStockItems.filter(
        (s) =>
            (s?.stock_item_status || '').toLowerCase() === 'suggested_for_destruction' &&
            !s.stock_item_consumable_destruction_certificate_id
    );
    const selectableConsumables = failedConsumables.filter(
        (c) =>
            (c?.consumable_status || '').toLowerCase() === 'suggested_for_destruction' &&
            !c.stock_item_consumable_destruction_certificate_id
    );

    return (
        <>
            <input
                ref={uploadFileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={onUploadFileSelected}
            />
            <div className="page-header">
                <div>
                    <h1 className="page-title">Destruction Certificates (Stock Items & Consumables)</h1>
                    <p className="page-subtitle">Create and validate destruction certificates for suggested stock items and consumables</p>
                </div>
                {canCreate && (
                    <div>
                        <button
                            className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                            onClick={() => setShowCreateForm((v) => !v)}
                        >
                            {showCreateForm ? 'Cancel' : '+ New Destruction Certificate'}
                        </button>
                    </div>
                )}

            {showMissingPdfModal && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card" style={{ width: 'min(520px, 92vw)' }}>
                        <div className="card-header">
                            <h2 className="card-title">PDF not found</h2>
                        </div>
                        <div className="card-body">
                            <p style={{ marginBottom: 'var(--space-4)' }}>
                                The PDF file for this destruction certificate does not exist. Do you want to upload it now?
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => { setShowMissingPdfModal(false); setMissingPdfCertId(null); }} disabled={submitting}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={startUploadMissingPdf} disabled={submitting}>
                                    Upload PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

            {showCreateForm && canCreate && (
                <div className="card" style={{ marginBottom: 'var(--space-6)', border: '2px solid var(--color-primary)' }}>
                    <div className="card-header">
                        <h2 className="card-title">New Destruction Certificate</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
                                <div>
                                    <div className="form-group">
                                        <label className="form-label">Stock items (suggested for destruction)</label>
                                        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                            {selectableStockItems.length === 0 && (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No eligible suggested stock items</div>
                                            )}
                                            {selectableStockItems.map((s) => (
                                                <label key={s.stock_item_id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: '4px 0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={createForm.stock_item_ids.includes(s.stock_item_id)}
                                                        onChange={() =>
                                                            setCreateForm((prev) => ({
                                                                ...prev,
                                                                stock_item_ids: toggleIdInList(prev.stock_item_ids, s.stock_item_id),
                                                            }))
                                                        }
                                                    />
                                                    <span>{s.stock_item_name || `Stock Item #${s.stock_item_id}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="form-group">
                                        <label className="form-label">Consumables (suggested for destruction)</label>
                                        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-2)' }}>
                                            {selectableConsumables.length === 0 && (
                                                <div style={{ color: 'var(--color-text-secondary)' }}>No eligible suggested consumables</div>
                                            )}
                                            {selectableConsumables.map((c) => (
                                                <label key={c.consumable_id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: '4px 0' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={createForm.consumable_ids.includes(c.consumable_id)}
                                                        onChange={() =>
                                                            setCreateForm((prev) => ({
                                                                ...prev,
                                                                consumable_ids: toggleIdInList(prev.consumable_ids, c.consumable_id),
                                                            }))
                                                        }
                                                    />
                                                    <span>{c.consumable_name || `Consumable #${c.consumable_id}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div style={{ marginTop: 'var(--space-6)' }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Certificate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Destruction Certificates</h2>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Validated</th>
                                <th>Digital Copy</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                        No destruction certificates found.
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((c) => {
                                    const validated = !!c.destruction_datetime;
                                    return (
                                        <tr key={c.destruction_certificate_id} className="hover-row">
                                            <td>#{c.destruction_certificate_id}</td>
                                            <td>{validated ? 'Yes' : 'No'}</td>
                                            <td>{c.digital_copy ? 'Yes' : 'No'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {(canValidate) && !validated ? (
                                                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleValidate(c.destruction_certificate_id)}
                                                            disabled={submitting}
                                                        >
                                                            Validate
                                                        </button>
                                                    </div>
                                                ) : validated ? (
                                                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => handleConsultPdf(c.destruction_certificate_id)}
                                                            disabled={submitting}
                                                        >
                                                            Consult PDF
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DestructionCertificatesPage;
