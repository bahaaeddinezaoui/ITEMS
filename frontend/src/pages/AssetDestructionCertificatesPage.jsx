import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { assetDestructionCertificateService, assetService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssetDestructionCertificatesPage = () => {
    const { user, isSuperuser } = useAuth();

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    }, [user]);

    const isAssetResponsible = isSuperuser || roleCodes.includes('asset_responsible');
    const isExploitationChief = isSuperuser || roleCodes.includes('exploitation_chief');
    const isItBureauChief = isSuperuser || roleCodes.includes('it_bureau_chief');

    const canView = isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief;
    const canCreate = isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief;
    const canValidate = isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief;
    const canUploadDigitalCopy = isSuperuser || isAssetResponsible || isExploitationChief || isItBureauChief;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [certificates, setCertificates] = useState([]);
    const [failedAssets, setFailedAssets] = useState([]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [createForm, setCreateForm] = useState({
        asset_ids: [],
    });

    const uploadFileInputRef = useRef(null);
    const [showMissingPdfModal, setShowMissingPdfModal] = useState(false);
    const [missingPdfCertId, setMissingPdfCertId] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const [certData, assetData] = await Promise.all([
                assetDestructionCertificateService.getAll(),
                assetService.getAll({ asset_status: 'failed', failed_via_external_maintenance: 'true' }),
            ]);

            const certList = certData?.results || certData || [];
            setCertificates(Array.isArray(certList) ? certList : []);

            const assets = assetData?.results || assetData || [];
            setFailedAssets(Array.isArray(assets) ? assets : []);
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to load asset destruction certificates');
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
            if (createForm.asset_ids.length === 0) {
                setError('Select at least one asset');
                return;
            }

            const formData = new FormData();
            formData.append('asset_ids', JSON.stringify(createForm.asset_ids));

            await assetDestructionCertificateService.create(formData);
            await fetchAll();

            setSuccess('Asset destruction certificate created successfully');
            setShowCreateForm(false);
            setCreateForm({ asset_ids: [] });
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                (typeof err?.response?.data === 'object' ? JSON.stringify(err.response.data) : '') ||
                'Failed to create asset destruction certificate';
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
            await assetDestructionCertificateService.validate(id);
            await fetchAll();
            setSuccess(`Certificate #${id} validated. Linked assets were set to destroyed.`);
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
            const existsResp = await assetDestructionCertificateService.digitalCopyExists(id);
            if (existsResp?.exists) {
                const blob = await assetDestructionCertificateService.getDigitalCopyBlob(id);
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
            await assetDestructionCertificateService.uploadDigitalCopy(id, formData);
            await fetchAll();
            const blob = await assetDestructionCertificateService.getDigitalCopyBlob(id);
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

    const selectableAssets = failedAssets.filter(
        (a) =>
            (a?.asset_status || '').toLowerCase() === 'failed' &&
            !a.destruction_certificate_id &&
            !!a.failed_external_maintenance_id
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
                    <h1 className="page-title">Destruction Certificates (Assets)</h1>
                    <p className="page-subtitle">Create and validate destruction certificates for failed assets (external maintenance)</p>
                </div>
                {canCreate && (
                    <div>
                        <button
                            className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                            onClick={() => setShowCreateForm((v) => !v)}
                        >
                            {showCreateForm ? 'Cancel' : '+ New Asset Destruction Certificate'}
                        </button>
                    </div>
                )}

                {showMissingPdfModal && (
                    <div
                        className="modal-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                        }}
                    >
                        <div className="card" style={{ width: 'min(520px, 92vw)' }}>
                            <div className="card-header">
                                <h2 className="card-title">PDF not found</h2>
                            </div>
                            <div className="card-body">
                                <p style={{ marginBottom: 'var(--space-4)' }}>
                                    The PDF file for this asset destruction certificate does not exist. Do you want to upload it now?
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowMissingPdfModal(false);
                                            setMissingPdfCertId(null);
                                        }}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={startUploadMissingPdf}
                                        disabled={submitting || !canUploadDigitalCopy}
                                        title={!canUploadDigitalCopy ? 'Not allowed' : ''}
                                    >
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
                <div
                    className="card"
                    style={{ marginBottom: 'var(--space-6)', border: '2px solid var(--color-primary)' }}
                >
                    <div className="card-header">
                        <h2 className="card-title">New Asset Destruction Certificate</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Assets (failed)</label>
                                <div
                                    style={{
                                        maxHeight: 260,
                                        overflow: 'auto',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: 'var(--space-2)',
                                    }}
                                >
                                    {selectableAssets.length === 0 && (
                                        <div style={{ color: 'var(--color-text-secondary)' }}>No eligible failed assets</div>
                                    )}
                                    {selectableAssets.map((a) => (
                                        <label
                                            key={a.asset_id}
                                            style={{
                                                display: 'flex',
                                                gap: 'var(--space-3)',
                                                alignItems: 'center',
                                                padding: '4px 0',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={createForm.asset_ids.includes(a.asset_id)}
                                                onChange={() =>
                                                    setCreateForm((prev) => ({
                                                        ...prev,
                                                        asset_ids: toggleIdInList(prev.asset_ids, a.asset_id),
                                                    }))
                                                }
                                            />
                                            <span>{a.asset_name || `Asset #${a.asset_id}`}</span>
                                        </label>
                                    ))}
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
                    <h2 className="card-title">All Asset Destruction Certificates</h2>
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
                                        No asset destruction certificates found.
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((c) => {
                                    const validated = !!c.destruction_datetime;
                                    return (
                                        <tr key={c.asset_destruction_certificate_id} className="hover-row">
                                            <td>#{c.asset_destruction_certificate_id}</td>
                                            <td>{validated ? 'Yes' : 'No'}</td>
                                            <td>{c.digital_copy ? 'Yes' : 'No'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                {canValidate && !validated ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: 'var(--space-3)',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end',
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => handleValidate(c.asset_destruction_certificate_id)}
                                                            disabled={submitting}
                                                        >
                                                            Validate
                                                        </button>
                                                    </div>
                                                ) : validated ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: 'var(--space-3)',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-end',
                                                        }}
                                                    >
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => handleConsultPdf(c.asset_destruction_certificate_id)}
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

export default AssetDestructionCertificatesPage;
