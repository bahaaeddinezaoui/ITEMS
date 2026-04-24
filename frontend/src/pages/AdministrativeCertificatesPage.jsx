import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    administrativeCertificateService,
    attributionOrderService,
    receiptReportService,
    warehouseService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const getSignatureFields = (t) => [
    { key: 'is_signed_by_warehouse_storage_magaziner', label: t('adminCertificates.magaziner'), short: 'M' },
    { key: 'is_signed_by_warehouse_storage_accountant', label: t('adminCertificates.accountant'), short: 'A' },
    { key: 'is_signed_by_warehouse_storage_marketer', label: t('adminCertificates.marketer'), short: 'Mk' },
    { key: 'is_signed_by_warehouse_it_chief', label: t('adminCertificates.itChief'), short: 'IT' },
    { key: 'is_signed_by_warehouse_leader', label: t('adminCertificates.leader'), short: 'L' },
];

const AdministrativeCertificatesPage = () => {
    const { t } = useTranslation();
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();

    const isAssetResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'asset_responsible' || role.role_code === 'exploitation_chief' || role.role_code === 'it_bureau_chief');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [certificates, setCertificates] = useState([]);
    const [ordersById, setOrdersById] = useState({});
    const [warehousesById, setWarehousesById] = useState({});
    const [reportsById, setReportsById] = useState({});

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        warehouse: '',
        attribution_order: '',
        interested_organization: 'ESAM/2RM',
        operation: '',
        format: '21x27',
        is_signed_by_warehouse_storage_magaziner: false,
        is_signed_by_warehouse_storage_accountant: false,
        is_signed_by_warehouse_storage_marketer: false,
        is_signed_by_warehouse_it_chief: false,
        is_signed_by_warehouse_leader: false,
        digital_copy: null,
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const [certData, ordersData, warehousesData] = await Promise.all([
                administrativeCertificateService.getAll(),
                attributionOrderService.getAll(),
                warehouseService.getAll(),
            ]);

            const certList = certData?.results || certData || [];
            setCertificates(certList);

            const orders = ordersData?.results || ordersData || [];
            const ordersMap = {};
            orders.forEach((o) => {
                ordersMap[o.attribution_order_id] = o;
            });
            setOrdersById(ordersMap);

            const warehouses = warehousesData?.results || warehousesData || [];
            const warehousesMap = {};
            warehouses.forEach((w) => {
                warehousesMap[w.warehouse_id] = w;
            });
            setWarehousesById(warehousesMap);

            const uniqueReportIds = Array.from(
                new Set(certList.map((c) => c.receipt_report).filter((id) => !!id))
            );

            if (uniqueReportIds.length === 0) {
                setReportsById({});
            } else {
                const reportPairs = await Promise.all(
                    uniqueReportIds.map(async (id) => {
                        try {
                            const rr = await receiptReportService.getById(id);
                            return [id, rr];
                        } catch {
                            return [id, null];
                        }
                    })
                );

                const reportsMap = {};
                reportPairs.forEach(([id, rr]) => {
                    if (rr) reportsMap[id] = rr;
                });
                setReportsById(reportsMap);
            }
        } catch {
            setError(t('adminCertificates.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const eligibleAttributionOrderIds = useMemo(() => {
        const list = Array.isArray(certificates) ? certificates : [];
        return new Set(
            list
                .filter((c) => c?.attribution_order && c?.receipt_report)
                .map((c) => Number(c.attribution_order))
                .filter((id) => Number.isFinite(id) && id > 0)
        );
    }, [certificates]);

    const deducedReceiptReportId = useMemo(() => {
        const orderIdNum = Number(createForm.attribution_order);
        if (!Number.isFinite(orderIdNum) || orderIdNum <= 0) return null;

        const list = Array.isArray(certificates) ? certificates : [];
        const found = list.find((c) => Number(c.attribution_order) === orderIdNum && c.receipt_report);
        return found?.receipt_report ?? null;
    }, [certificates, createForm.attribution_order]);

    const certificateStats = useMemo(() => {
        const list = Array.isArray(certificates) ? certificates : [];
        let fullySignedCount = 0;
        let readyToMoveCount = 0;
        let movedCount = 0;

        list.forEach((c) => {
            const fullySigned = getSignatureFields(t).every((field) => !!c?.[field.key]);
            if (fullySigned) fullySignedCount += 1;
            if (fullySigned && !c?.are_items_moved) readyToMoveCount += 1;
            if (c?.are_items_moved) movedCount += 1;
        });

        return {
            total: list.length,
            fullySignedCount,
            readyToMoveCount,
            movedCount,
        };
    }, [certificates]);

    useEffect(() => {
        if (!isAssetResponsible) return;
        fetchData();
    }, [isAssetResponsible]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            if (!createForm.warehouse) {
                setError(t('adminCertificates.warehouseRequired'));
                return;
            }
            if (!createForm.attribution_order) {
                setError(t('adminCertificates.attributionOrderRequired'));
                return;
            }
            if (!deducedReceiptReportId) {
                setError(t('adminCertificates.receiptReportNotFound'));
                return;
            }

            if (createForm.operation && !['entry', 'exit', 'transfer'].includes(createForm.operation)) {
                setError(t('adminCertificates.operationInvalid'));
                return;
            }

            const formData = new FormData();
            if (createForm.warehouse) formData.append('warehouse', createForm.warehouse);
            if (createForm.attribution_order) formData.append('attribution_order', createForm.attribution_order);
            formData.append('receipt_report', String(deducedReceiptReportId));
            if (createForm.interested_organization) formData.append('interested_organization', createForm.interested_organization);
            if (createForm.operation) formData.append('operation', createForm.operation);
            if (createForm.format) formData.append('format', createForm.format);

            formData.append('is_signed_by_warehouse_storage_magaziner', !!createForm.is_signed_by_warehouse_storage_magaziner);
            formData.append('is_signed_by_warehouse_storage_accountant', !!createForm.is_signed_by_warehouse_storage_accountant);
            formData.append('is_signed_by_warehouse_storage_marketer', !!createForm.is_signed_by_warehouse_storage_marketer);
            formData.append('is_signed_by_warehouse_it_chief', !!createForm.is_signed_by_warehouse_it_chief);
            formData.append('is_signed_by_warehouse_leader', !!createForm.is_signed_by_warehouse_leader);

            if (createForm.digital_copy) formData.append('digital_copy', createForm.digital_copy);

            const created = await administrativeCertificateService.create(formData);

            await fetchData();

            setSuccess(t('adminCertificates.createSuccess'));
            setShowCreateForm(false);
            setCreateForm({
                warehouse: '',
                attribution_order: '',
                interested_organization: 'ESAM/2RM',
                operation: '',
                format: '21x27',
                is_signed_by_warehouse_storage_magaziner: false,
                is_signed_by_warehouse_storage_accountant: false,
                is_signed_by_warehouse_storage_marketer: false,
                is_signed_by_warehouse_it_chief: false,
                is_signed_by_warehouse_leader: false,
                digital_copy: null,
            });

            const fullySigned = !!(
                created?.is_signed_by_warehouse_storage_magaziner &&
                created?.is_signed_by_warehouse_storage_accountant &&
                created?.is_signed_by_warehouse_storage_marketer &&
                created?.is_signed_by_warehouse_it_chief &&
                created?.is_signed_by_warehouse_leader
            );
            if (fullySigned && created?.administrative_certificate_id) {
                navigate(`/dashboard/administrative-certificates/${created.administrative_certificate_id}/move-items`);
            }
        } catch (err) {
            const data = err?.response?.data;
            if (data?.error) {
                setError(data.error);
            } else if (data && typeof data === 'object') {
                const firstField = Object.keys(data)[0];
                const firstValue = firstField ? data[firstField] : null;
                const message = Array.isArray(firstValue)
                    ? `${firstField}: ${firstValue.join(', ')}`
                    : JSON.stringify(data);
                setError(message);
            } else {
                setError(t('adminCertificates.createError'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="administrative-certificates-page">
            <div className="card administrative-certificates-hero">
                <div className="administrative-certificates-header">
                    <div>
                        <h1 className="page-title">{t('adminCertificates.title')}</h1>
                        <p className="page-subtitle">{t('adminCertificates.subtitle')}</p>
                    </div>
                    <button
                        className="btn btn-primary administrative-certificates-create-btn"
                        onClick={() => setShowCreateForm(true)}
                    >
                        + {t('adminCertificates.newCertificate')}
                    </button>
                </div>
                <div className="administrative-certificates-hero-foot">
                    <span className="badge badge-info">{t('adminCertificates.centralizedOverview')}</span>
                    <span className="badge badge-warning">{t('adminCertificates.moveItemsUnlocks')}</span>
                </div>
            </div>

            <div className="stat-grid administrative-certificates-stat-grid">
                <div className="stat-card">
                    <div className="stat-value">{certificateStats.total}</div>
                    <div className="stat-label">{t('adminCertificates.totalCertificates')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{certificateStats.fullySignedCount}</div>
                    <div className="stat-label">{t('adminCertificates.fullySigned')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{certificateStats.readyToMoveCount}</div>
                    <div className="stat-label">{t('adminCertificates.readyToMove')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{certificateStats.movedCount}</div>
                    <div className="stat-label">{t('adminCertificates.itemsMoved')}</div>
                </div>
            </div>

            {error && <div className="error-message administrative-certificates-alert">{error}</div>}
            {success && <div className="success-message administrative-certificates-alert">{success}</div>}

            <div className="card administrative-certificates-list-card">
                <div className="card-header">
                    <h2 className="card-title">{t('adminCertificates.allCertificates')}</h2>
                    <div className="administrative-certificates-subtle-text">{certificates.length} {t('adminCertificates.records')}</div>
                </div>

                <div className="card-body">
                    {certificates.length === 0 ? (
                        <div className="administrative-certificates-empty-state">{t('adminCertificates.noCertificates')}</div>
                    ) : (
                        <div className="administrative-certificates-list">
                            {certificates.map((c) => {
                                const w = warehousesById[c.warehouse];
                                const o = ordersById[c.attribution_order];
                                const rr = reportsById[c.receipt_report];
                                const fullySigned = getSignatureFields(t).every((field) => !!c?.[field.key]);
                                const canMoveItems = fullySigned && !c.are_items_moved;

                                return (
                                    <div key={c.administrative_certificate_id} className="administrative-certificates-item">
                                        <div className="administrative-certificates-item-head">
                                            <div>
                                                <div className="administrative-certificates-item-title">{t('adminCertificates.certificateId', { id: c.administrative_certificate_id })}</div>
                                                <div className="administrative-certificates-item-subtitle">
                                                    {w?.warehouse_name || (c.warehouse ? `#${c.warehouse}` : '-')}
                                                </div>
                                            </div>
                                            <div className="administrative-certificates-badges">
                                                <span className={`badge ${fullySigned ? 'badge-success' : 'badge-warning'}`}>
                                                    {fullySigned ? t('adminCertificates.fullySigned') : t('adminCertificates.pendingSignatures')}
                                                </span>
                                                <span className={`badge ${c.are_items_moved ? 'badge-info' : 'badge-warning'}`}>
                                                    {c.are_items_moved ? t('adminCertificates.itemsMoved') : t('adminCertificates.itemsNotMoved')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="administrative-certificates-item-grid">
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.orderField')}</div>
                                                <div className="administrative-certificates-field-value">
                                                    {o?.attribution_order_full_code || (c.attribution_order ? `#${c.attribution_order}` : '-')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.reportField')}</div>
                                                <div className="administrative-certificates-field-value">
                                                    {rr?.report_full_code || (c.receipt_report ? `#${c.receipt_report}` : '-')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.orgField')}</div>
                                                <div className="administrative-certificates-field-value">{c.interested_organization || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.opField')}</div>
                                                <div className="administrative-certificates-field-value">{c.operation || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.formatField')}</div>
                                                <div className="administrative-certificates-field-value">{c.format || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="administrative-certificates-field-label">{t('adminCertificates.copyField')}</div>
                                                <div className="administrative-certificates-field-value">{c.digital_copy ? t('common.yes') : t('common.no')}</div>
                                            </div>
                                        </div>

                                        <div className="administrative-certificates-footer">
                                            <div className="administrative-certificates-signature-pill-list">
                                                {getSignatureFields(t).map((field) => (
                                                    <span
                                                        key={`${c.administrative_certificate_id}-${field.key}`}
                                                        className={`badge ${c?.[field.key] ? 'badge-success' : 'badge-error'}`}
                                                    >
                                                        {field.short}: {c?.[field.key] ? t('common.yes') : t('common.no')}
                                                    </span>
                                                ))}
                                            </div>
                                            {canMoveItems ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    style={{ width: 'auto' }}
                                                    onClick={() => navigate(`/dashboard/administrative-certificates/${c.administrative_certificate_id}/move-items`)}
                                                >
                                                    {t('adminCertificates.moveItems')}
                                                </button>
                                            ) : (
                                                <span className="administrative-certificates-subtle-text">{t('adminCertificates.moveUnavailable')}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showCreateForm && (
                <div
                    className="modal-overlay administrative-certificates-modal-overlay"
                    onClick={() => {
                        if (!submitting) setShowCreateForm(false);
                    }}
                >
                    <div
                        className="modal administrative-certificates-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header administrative-certificates-modal-header">
                            <div>
                                <div className="modal-title">{t('adminCertificates.newAdminCertificate')}</div>
                                <div className="administrative-certificates-subtle-text">{t('adminCertificates.fillAllFields')}</div>
                            </div>
                            <button
                                type="button"
                                className="modal-close"
                                disabled={submitting}
                                onClick={() => setShowCreateForm(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body administrative-certificates-modal-body">
                            <form onSubmit={handleCreate}>
                                {eligibleAttributionOrderIds.size === 0 && (
                                    <div className="administrative-certificates-modal-warning">
                                        {t('adminCertificates.noEligibleOrders')}
                                    </div>
                                )}

                                <div className="administrative-certificates-form-grid">
                                    <div className="form-group">
                                        <select
                                            className="form-input"
                                            value={createForm.warehouse}
                                            onChange={(e) => setCreateForm({ ...createForm, warehouse: e.target.value })}
                                            aria-label={t('adminCertificates.warehouse')}
                                        >
                                            <option value="">{t('adminCertificates.warehouse')}</option>
                                            {Object.values(warehousesById).map((w) => (
                                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                                    {w.warehouse_name || `#${w.warehouse_id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <select
                                            className="form-input"
                                            value={createForm.attribution_order}
                                            onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
                                            aria-label={t('adminCertificates.attributionOrder')}
                                        >
                                            <option value="">{t('adminCertificates.attributionOrder')}</option>
                                            {Object.values(ordersById)
                                                .filter((o) => eligibleAttributionOrderIds.has(Number(o.attribution_order_id)))
                                                .map((o) => (
                                                    <option key={o.attribution_order_id} value={o.attribution_order_id}>
                                                        {o.attribution_order_full_code || `#${o.attribution_order_id}`}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={
                                                deducedReceiptReportId
                                                    ? (reportsById?.[deducedReceiptReportId]?.report_full_code || `#${deducedReceiptReportId}`)
                                                    : ''
                                            }
                                            readOnly
                                            placeholder={t('adminCertificates.receiptReportAuto')}
                                            aria-label={t('adminCertificates.receiptReport')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.interested_organization}
                                            onChange={(e) => setCreateForm({ ...createForm, interested_organization: e.target.value })}
                                            placeholder={t('adminCertificates.interestedOrganization')}
                                            aria-label={t('adminCertificates.interestedOrganization')}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <select
                                            className="form-input"
                                            value={createForm.operation}
                                            onChange={(e) => setCreateForm({ ...createForm, operation: e.target.value })}
                                            aria-label={t('adminCertificates.operation')}
                                        >
                                            <option value="">{t('adminCertificates.operation')}</option>
                                            <option value="entry">{t('adminCertificates.entry')}</option>
                                            <option value="exit">{t('adminCertificates.exit')}</option>
                                            <option value="transfer">{t('adminCertificates.transfer')}</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={createForm.format}
                                            onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                                            placeholder={t('adminCertificates.format')}
                                            aria-label={t('adminCertificates.format')}
                                        />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <input
                                            type="file"
                                            className="form-input"
                                            onChange={(e) => setCreateForm({ ...createForm, digital_copy: e.target.files[0] })}
                                            accept="image/*,application/pdf"
                                            aria-label={t('adminCertificates.digitalCopyAttachment')}
                                        />
                                    </div>
                                </div>

                                <div className="administrative-certificates-modal-signatures">
                                    {getSignatureFields(t).map((field) => (
                                        <label key={field.key} className="administrative-certificates-signature-chip">
                                            <input
                                                type="checkbox"
                                                checked={!!createForm[field.key]}
                                                onChange={(e) =>
                                                    setCreateForm({
                                                        ...createForm,
                                                        [field.key]: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span>{field.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="administrative-certificates-modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ width: 'auto' }}
                                        disabled={submitting}
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary administrative-certificates-submit-btn" disabled={submitting}>
                                        {submitting ? t('common.creating') : t('adminCertificates.createCertificate')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdministrativeCertificatesPage;
