import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { assetIncidentReportService, assetService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const REASONS = [
    { value: 'stolen', label: 'Stolen' },
    { value: 'lost', label: 'Lost' },
    { value: 'irrecoverably_damaged', label: 'Irrecoverably Damaged' },
];

const REVIEW_ROLE_CONFIG = {
    it_bureau_chief: {
        label: 'IT Bureau Chief',
        noteField: 'it_bureau_chief_note',
        signField: 'is_signed_by_it_bureau_chief',
    },
    exploitation_chief: {
        label: 'Exploitation Chief',
        noteField: 'exploitation_chief_note',
        signField: 'is_signed_by_exploitation_chief',
    },
    protection_and_security_bureau_chief: {
        label: 'Protection & Security Bureau Chief',
        noteField: 'protection_and_security_bureau_chief_note',
        signField: 'is_signed_by_protection_and_security_bureau_chief',
    },
    school_headquarter: {
        label: 'School Headquarter',
        noteField: 'school_headquarter_note',
        signField: 'is_signed_by_school_headquarter',
    },
};

const REVIEW_ROLE_ORDER = [
    'it_bureau_chief',
    'exploitation_chief',
    'protection_and_security_bureau_chief',
    'school_headquarter',
];

const AssetIncidentReportsPage = () => {
    const { user, isSuperuser } = useAuth();

    const roleCodes = useMemo(
        () => (Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : []),
        [user]
    );
    const canView = isSuperuser || REVIEW_ROLE_ORDER.some((roleCode) => roleCodes.includes(roleCode));
    const canCreate = isSuperuser || roleCodes.includes('exploitation_chief') || roleCodes.includes('it_bureau_chief');
    const availableReviewRoles = useMemo(
        () => (isSuperuser ? REVIEW_ROLE_ORDER : REVIEW_ROLE_ORDER.filter((roleCode) => roleCodes.includes(roleCode))),
        [isSuperuser, roleCodes]
    );

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [assets, setAssets] = useState([]);
    const [reports, setReports] = useState([]);
    const [serialSearch, setSerialSearch] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [reviewingReport, setReviewingReport] = useState(null);
    const [reviewRole, setReviewRole] = useState('');
    const [reviewDraft, setReviewDraft] = useState({ note: '', signed: false });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const [form, setForm] = useState({
        asset: '',
        reason: 'stolen',
        owner_note: '',
        is_signed_by_exploitation_chief: true,
        exploitation_chief_note: '',
        digital_copy: null,
    });

    const loadData = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const [reportResult, assetResult] = await Promise.allSettled([
            assetIncidentReportService.getAll(),
            assetService.getAll(),
        ]);

        if (reportResult.status === 'fulfilled') {
            const reportData = reportResult.value;
            const reportList = reportData?.results || reportData || [];
            setReports(Array.isArray(reportList) ? reportList : []);
        } else {
            setReports([]);
            setError(reportResult.reason?.response?.data?.error || 'Failed to load incident reports');
        }

        if (assetResult.status === 'fulfilled') {
            const assetData = assetResult.value;
            const assetList = assetData?.results || assetData || [];
            setAssets(Array.isArray(assetList) ? assetList : []);
        } else {
            setAssets([]);
            if (reportResult.status === 'fulfilled') {
                setError('Incident reports loaded, but asset search is unavailable');
            }
        }

        if (reportResult.status === 'fulfilled' && assetResult.status === 'fulfilled') {
            setError('');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!canView) return;
        loadData();
    }, [canView]);

    const filteredAssets = useMemo(() => {
        const query = serialSearch.trim().toLowerCase();
        if (!query) return assets.slice(0, 20);
        return assets
            .filter((a) => ((a?.asset_serial_number || '').toString().toLowerCase().includes(query)))
            .slice(0, 30);
    }, [assets, serialSearch]);

    const selectedAsset = useMemo(
        () => assets.find((a) => Number(a?.asset_id) === Number(form.asset)),
        [assets, form.asset]
    );

    useEffect(() => {
        if (!reviewingReport || !reviewRole) return;
        const roleConfig = REVIEW_ROLE_CONFIG[reviewRole];
        if (!roleConfig) return;
        setReviewDraft({
            note: reviewingReport?.[roleConfig.noteField] || '',
            signed: !!reviewingReport?.[roleConfig.signField],
        });
    }, [reviewingReport, reviewRole]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.asset) {
            setError('Select an asset first');
            return;
        }
        if (!form.reason) {
            setError('Reason is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('asset', form.asset);
            payload.append('reason', form.reason);
            payload.append('owner_note', form.owner_note || '');
            payload.append('status', 'submitted');
            payload.append('is_signed_by_exploitation_chief', !!form.is_signed_by_exploitation_chief);
            payload.append('exploitation_chief_note', form.exploitation_chief_note || '');
            if (form.digital_copy) {
                payload.append('digital_copy', form.digital_copy);
            }

            await assetIncidentReportService.create(payload);
            await loadData();
            setShowCreateForm(false);
            setForm({
                asset: '',
                reason: 'stolen',
                owner_note: '',
                is_signed_by_exploitation_chief: true,
                exploitation_chief_note: '',
                digital_copy: null,
            });
            setSerialSearch('');
            setSuccess('Incident report created successfully');
        } catch (e) {
            setError(e?.response?.data?.error || 'Failed to create incident report');
        } finally {
            setSubmitting(false);
        }
    };

    const openReviewModal = (report) => {
        if (!Array.isArray(availableReviewRoles) || availableReviewRoles.length === 0) return;
        setReviewingReport(report);
        setReviewRole(availableReviewRoles[0]);
        setReviewDraft({ note: '', signed: false });
        setError('');
        setSuccess('');
    };

    const closeReviewModal = () => {
        setReviewingReport(null);
        setReviewRole('');
        setReviewDraft({ note: '', signed: false });
    };

    const submitRoleReview = async (e) => {
        e.preventDefault();
        if (!reviewingReport || !reviewRole) return;
        const roleConfig = REVIEW_ROLE_CONFIG[reviewRole];
        if (!roleConfig) return;

        setReviewSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const payload = {
                [roleConfig.noteField]: reviewDraft.note || '',
                [roleConfig.signField]: !!reviewDraft.signed,
            };
            await assetIncidentReportService.update(reviewingReport.asset_incident_report_id, payload);
            await loadData();
            setSuccess(`${roleConfig.label} review saved`);
            closeReviewModal();
        } catch (e2) {
            setError(e2?.response?.data?.error || 'Failed to save review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Incident Reports</h1>
                    <p className="page-subtitle">Consult incident reports and sign them with role-specific notes</p>
                </div>
                {canCreate && (
                    <button
                        className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                        onClick={() => setShowCreateForm((prev) => !prev)}
                    >
                        {showCreateForm ? 'Cancel' : '+ New Incident Report'}
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
                <div className="badge badge-success" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    {success}
                </div>
            )}

            {canCreate && showCreateForm && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h2 className="card-title">Create Incident Report</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Search asset by serial number</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={serialSearch}
                                    onChange={(e) => setSerialSearch(e.target.value)}
                                    placeholder="Type full or partial serial number"
                                />
                            </div>

                            <div className="table-container" style={{ marginBottom: 'var(--space-4)' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Asset ID</th>
                                            <th>Serial Number</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Select</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssets.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>No assets found for this serial search.</td>
                                            </tr>
                                        ) : (
                                            filteredAssets.map((asset) => (
                                                <tr key={asset.asset_id}>
                                                    <td>{asset.asset_id}</td>
                                                    <td>{asset.asset_serial_number || '-'}</td>
                                                    <td>{asset.asset_name || '-'}</td>
                                                    <td>{asset.asset_status || '-'}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-${Number(form.asset) === Number(asset.asset_id) ? 'secondary' : 'primary'}`}
                                                            onClick={() => setForm((prev) => ({ ...prev, asset: asset.asset_id }))}
                                                        >
                                                            {Number(form.asset) === Number(asset.asset_id) ? 'Selected' : 'Select'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {selectedAsset && (
                                <div className="badge badge-info" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                                    Selected Asset: #{selectedAsset.asset_id} - {selectedAsset.asset_name || 'Unnamed'} ({selectedAsset.asset_serial_number || 'No serial'})
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <select
                                        className="form-select"
                                        value={form.reason}
                                        onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                                    >
                                        {REASONS.map((reason) => (
                                            <option key={reason.value} value={reason.value}>{reason.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Digital Copy (PDF)</label>
                                    <input
                                        className="form-input"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setForm((prev) => ({ ...prev, digital_copy: e.target.files?.[0] || null }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Owner Note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={form.owner_note}
                                    onChange={(e) => setForm((prev) => ({ ...prev, owner_note: e.target.value }))}
                                    placeholder="Describe what happened according to the owner"
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!form.is_signed_by_exploitation_chief}
                                        onChange={(e) => setForm((prev) => ({ ...prev, is_signed_by_exploitation_chief: e.target.checked }))}
                                    />
                                    <span>Signed by exploitation chief</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Exploitation Chief Note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={form.exploitation_chief_note}
                                    onChange={(e) => setForm((prev) => ({ ...prev, exploitation_chief_note: e.target.value }))}
                                    placeholder="Optional note from exploitation chief"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Create Incident Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">All Incident Reports</h2>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Asset</th>
                                <th>Serial</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>IT Chief</th>
                                <th>Exploitation Chief</th>
                                <th>Protection Chief</th>
                                <th>School HQ</th>
                                {availableReviewRoles.length > 0 && <th style={{ textAlign: 'right' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={availableReviewRoles.length > 0 ? 10 : 9} style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                                        No incident reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.asset_incident_report_id}>
                                        <td>{report.asset_incident_report_id}</td>
                                        <td>{report.asset_name || `Asset #${report.asset}`}</td>
                                        <td>{report.asset_serial_number || '-'}</td>
                                        <td>{report.reason || '-'}</td>
                                        <td>{report.status || '-'}</td>
                                        <td>{report.is_signed_by_it_bureau_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_exploitation_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_protection_and_security_bureau_chief ? 'Signed' : 'Pending'}</td>
                                        <td>{report.is_signed_by_school_headquarter ? 'Signed' : 'Pending'}</td>
                                        {availableReviewRoles.length > 0 && (
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => openReviewModal(report)}
                                                >
                                                    Review / Sign
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reviewingReport && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Review Incident Report #{reviewingReport.asset_incident_report_id}</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeReviewModal}
                                disabled={reviewSubmitting}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={submitRoleReview} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Signing as</label>
                                <select
                                    className="form-select"
                                    value={reviewRole}
                                    onChange={(e) => setReviewRole(e.target.value)}
                                    disabled={reviewSubmitting}
                                >
                                    {availableReviewRoles.map((roleCode) => (
                                        <option key={roleCode} value={roleCode}>
                                            {REVIEW_ROLE_CONFIG[roleCode]?.label || roleCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Your note</label>
                                <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={reviewDraft.note}
                                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, note: e.target.value }))}
                                    placeholder="Add your note"
                                    disabled={reviewSubmitting}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!reviewDraft.signed}
                                        onChange={(e) => setReviewDraft((prev) => ({ ...prev, signed: e.target.checked }))}
                                        disabled={reviewSubmitting}
                                    />
                                    <span>Sign this report as {REVIEW_ROLE_CONFIG[reviewRole]?.label || reviewRole}</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                                <button type="button" className="btn btn-secondary" onClick={closeReviewModal} disabled={reviewSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting || !reviewRole}>
                                    {reviewSubmitting ? 'Saving...' : 'Save Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssetIncidentReportsPage;
