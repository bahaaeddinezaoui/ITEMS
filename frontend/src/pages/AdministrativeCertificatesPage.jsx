import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { SkeletonListRows } from '../components/SkeletonCard';
import {
    administrativeCertificateService,
    attributionOrderService,
    receiptReportService,
    warehouseService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Warehouse, ClipboardList, PenLine, Upload, Check, PenTool } from 'lucide-react';
import ModalPortal from '../components/ModalPortal';
import Stepper, { Step } from '../components/Stepper';

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
    const [createModalError, setCreateModalError] = useState(null);
    const [createStep, setCreateStep] = useState(0);
    const [stepperDirection, setStepperDirection] = useState(0);

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
        setCreateModalError(null);

        try {
            if (!createForm.warehouse) {
                setCreateModalError(t('adminCertificates.warehouseRequired'));
                return;
            }
            if (!createForm.attribution_order) {
                setCreateModalError(t('adminCertificates.attributionOrderRequired'));
                return;
            }
            if (!deducedReceiptReportId) {
                setCreateModalError(t('adminCertificates.receiptReportNotFound'));
                return;
            }

            if (createForm.operation && !['entry', 'exit', 'transfer'].includes(createForm.operation)) {
                setCreateModalError(t('adminCertificates.operationInvalid'));
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
                setCreateModalError(data.error);
            } else if (data && typeof data === 'object') {
                const firstField = Object.keys(data)[0];
                const firstValue = firstField ? data[firstField] : null;
                const message = Array.isArray(firstValue)
                    ? `${firstField}: ${firstValue.join(', ')}`
                    : JSON.stringify(data);
                setCreateModalError(message);
            } else {
                setCreateModalError(t('adminCertificates.createError'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSign = async (certId, fieldKey) => {
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            await administrativeCertificateService.patch(certId, { [fieldKey]: true });
            setSuccess(t('adminCertificates.signSuccess'));
            await fetchData();
        } catch (err) {
            const data = err?.response?.data;
            setError(data?.error || t('adminCertificates.signError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateNext = () => {
        setCreateModalError(null);
        if (createStep === 0) {
            if (!createForm.warehouse) {
                setCreateModalError(t('adminCertificates.warehouseRequired'));
                return;
            }
            if (!createForm.attribution_order) {
                setCreateModalError(t('adminCertificates.attributionOrderRequired'));
                return;
            }
            if (!deducedReceiptReportId) {
                setCreateModalError(t('adminCertificates.receiptReportNotFound'));
                return;
            }
        }

        setStepperDirection(1);
        setCreateStep((s) => Math.min(s + 1, 3));
    };

    const handleCreateBack = () => {
        setCreateModalError(null);
        setStepperDirection(-1);
        setCreateStep((s) => Math.max(s - 1, 0));
    };

    if (!isAssetResponsible) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    <SkeletonListRows count={6} />
                </div>
            </div>
        );
    }

    return (
        <div className="administrative-certificates-page">
            <div className="card administrative-certificates-hero">
                <div className="administrative-certificates-header">
                    <div>
                        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><FileText size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('adminCertificates.title')}</h1>
                        <p className="page-subtitle">{t('adminCertificates.subtitle')}</p>
                    </div>
                    <button
                        className="btn btn-primary administrative-certificates-create-btn"
                        onClick={() => {
                            setCreateModalError(null);
                            setCreateStep(0);
                            setStepperDirection(0);
                            setShowCreateForm(true);
                        }}
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

                                        <div className="administrative-certificates-item-meta">
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.orderField')}</span>
                                                {o?.attribution_order_full_code || (c.attribution_order ? `#${c.attribution_order}` : '-')}
                                            </span>
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.reportField')}</span>
                                                {rr?.report_full_code || (c.receipt_report ? `#${c.receipt_report}` : '-')}
                                            </span>
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.orgField')}</span>
                                                {c.interested_organization || '-'}
                                            </span>
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.opField')}</span>
                                                {c.operation || '-'}
                                            </span>
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.formatField')}</span>
                                                {c.format || '-'}
                                            </span>
                                            <span className="administrative-certificates-meta-pair">
                                                <span className="administrative-certificates-meta-label">{t('adminCertificates.copyField')}</span>
                                                {c.digital_copy ? t('common.yes') : t('common.no')}
                                            </span>
                                        </div>

                                        <div className="administrative-certificates-footer">
                                            <div className="administrative-certificates-signature-pill-list">
                                                {getSignatureFields(t).map((field) => (
                                                    c?.[field.key] ? (
                                                        <span
                                                            key={`${c.administrative_certificate_id}-${field.key}`}
                                                            className="badge badge-success"
                                                        >
                                                            {field.short}: {t('common.yes')}
                                                        </span>
                                                    ) : isSuperuser ? (
                                                        <button
                                                            key={`${c.administrative_certificate_id}-${field.key}`}
                                                            type="button"
                                                            className="badge badge-error administrative-certificates-sign-btn"
                                                            disabled={submitting}
                                                            onClick={() => handleSign(c.administrative_certificate_id, field.key)}
                                                            title={t('adminCertificates.signAs', { role: field.label })}
                                                        >
                                                            <PenTool size={12} />
                                                            {field.short}: {t('adminCertificates.sign')}
                                                        </button>
                                                    ) : (
                                                        <span
                                                            key={`${c.administrative_certificate_id}-${field.key}`}
                                                            className="badge badge-error"
                                                        >
                                                            {field.short}: {t('common.no')}
                                                        </span>
                                                    )
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
                <ModalPortal>
                    <div
                        className="modal-overlay ac-modal-overlay"
                        onClick={() => {
                            if (!submitting) setShowCreateForm(false);
                        }}
                    >
                        <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ac-modal-header">
                                <div className="ac-modal-header-left">
                                    <div className="ac-modal-icon">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="ac-modal-title">{t('adminCertificates.newAdminCertificate')}</h3>
                                        <p className="ac-modal-subtitle">{t('adminCertificates.fillAllFields')}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="ac-modal-close"
                                    disabled={submitting}
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="ac-modal-body">
                                <form onSubmit={handleCreate}>
                                    {createModalError && (
                                        <div className="error-message" style={{ marginBottom: 'var(--space-4)' }}>
                                            {createModalError}
                                        </div>
                                    )}
                                    {eligibleAttributionOrderIds.size === 0 && (
                                        <div className="ac-modal-warning">
                                            {t('adminCertificates.noEligibleOrders')}
                                        </div>
                                    )}

                                    <Stepper
                                        step={createStep + 1}
                                        direction={stepperDirection}
                                        onStepChange={(newStep, dir) => {
                                            setCreateModalError(null);
                                            setStepperDirection(dir);
                                            setCreateStep(newStep - 1);
                                        }}
                                        onBeforeStepChange={(newStep, oldStep) => {
                                            if (newStep > oldStep) return false;
                                            setCreateModalError(null);
                                            return true;
                                        }}
                                        hideFooter
                                        disableStepIndicators={submitting}
                                        stepCircleContainerClassName="ac-stepper"
                                        contentClassName="ac-stepper-content"
                                        renderStepIndicator={({ step, currentStep, onStepClick }) => {
                                            const steps = [
                                                { key: 'assignment', icon: Warehouse, label: t('adminCertificates.assignmentSection', 'Assignment') },
                                                { key: 'details', icon: ClipboardList, label: t('adminCertificates.detailsSection', 'Details') },
                                                { key: 'attachment', icon: Upload, label: t('adminCertificates.attachmentSection', 'Attachment') },
                                                { key: 'signatures', icon: PenLine, label: t('adminCertificates.signaturesSection', 'Signatures') },
                                            ];
                                            const stepConfig = steps[step - 1];
                                            const StepIcon = stepConfig?.icon;
                                            const isActive = step === currentStep;
                                            const isCompleted = step < currentStep;
                                            const status = isActive ? 'active' : isCompleted ? 'complete' : 'inactive';
                                            return (
                                                <div
                                                    className={`stepper-custom-step-indicator ${status}`}
                                                    onClick={() => !submitting && isCompleted && onStepClick(step)}
                                                    style={{ cursor: isCompleted && !submitting ? 'pointer' : 'default', opacity: (!isActive && !isCompleted) ? 0.5 : 1, pointerEvents: submitting ? 'none' : 'auto' }}
                                                >
                                                    <div className={`stepper-custom-step-indicator-dot ${status}`}>
                                                        {isCompleted ? <Check size={14} strokeWidth={3} /> : StepIcon ? <StepIcon size={14} /> : <span className="stepper-step-number">{step}</span>}
                                                    </div>
                                                    <span className={`stepper-custom-step-indicator-label ${status}`}>{stepConfig?.label}</span>
                                                </div>
                                            );
                                        }}
                                    >
                                        <Step>
                                            <div className="ac-form-section">
                                                <div className="ac-form-section-header">
                                                    <Warehouse size={14} />
                                                    {t('adminCertificates.assignmentSection', 'Assignment')}
                                                </div>
                                                <div className="ac-form-section-fields">
                                                    <div className="form-group">
                                                        <label className="form-label">{t('adminCertificates.warehouse')}</label>
                                                        <select
                                                            className="form-input"
                                                            value={createForm.warehouse}
                                                            onChange={(e) => setCreateForm({ ...createForm, warehouse: e.target.value })}
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
                                                        <label className="form-label">{t('adminCertificates.attributionOrder')}</label>
                                                        <select
                                                            className="form-input"
                                                            value={createForm.attribution_order}
                                                            onChange={(e) => setCreateForm({ ...createForm, attribution_order: e.target.value })}
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
                                                        <label className="form-label">{t('adminCertificates.receiptReport')}</label>
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
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Step>

                                        <Step>
                                            <div className="ac-form-section">
                                                <div className="ac-form-section-header">
                                                    <ClipboardList size={14} />
                                                    {t('adminCertificates.detailsSection', 'Details')}
                                                </div>
                                                <div className="ac-form-section-fields">
                                                    <div className="form-group">
                                                        <label className="form-label">{t('adminCertificates.interestedOrganization')}</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={createForm.interested_organization}
                                                            onChange={(e) => setCreateForm({ ...createForm, interested_organization: e.target.value })}
                                                            placeholder={t('adminCertificates.interestedOrganization')}
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">{t('adminCertificates.operation')}</label>
                                                        <select
                                                            className="form-input"
                                                            value={createForm.operation}
                                                            onChange={(e) => setCreateForm({ ...createForm, operation: e.target.value })}
                                                        >
                                                            <option value="">{t('adminCertificates.operation')}</option>
                                                            <option value="entry">{t('adminCertificates.entry')}</option>
                                                            <option value="exit">{t('adminCertificates.exit')}</option>
                                                            <option value="transfer">{t('adminCertificates.transfer')}</option>
                                                        </select>
                                                    </div>

                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label">{t('adminCertificates.format')}</label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            value={createForm.format}
                                                            onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                                                            placeholder={t('adminCertificates.format')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Step>

                                        <Step>
                                            <div className="ac-form-section">
                                                <div className="ac-form-section-header">
                                                    <Upload size={14} />
                                                    {t('adminCertificates.attachmentSection', 'Attachment')}
                                                </div>
                                                <div className="ac-form-section-fields">
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label">{t('adminCertificates.digitalCopyAttachment')}</label>
                                                        <div className="ac-file-upload">
                                                            <input
                                                                type="file"
                                                                className="ac-file-input"
                                                                id="ac-digital-copy"
                                                                onChange={(e) => setCreateForm({ ...createForm, digital_copy: e.target.files[0] })}
                                                                accept="image/*,application/pdf"
                                                            />
                                                            <label htmlFor="ac-digital-copy" className="ac-file-label">
                                                                <Upload size={16} />
                                                                <span>{createForm.digital_copy ? createForm.digital_copy.name : t('adminCertificates.chooseFile', 'Choose a file')}</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Step>

                                        <Step>
                                            <div className="ac-form-section">
                                                <div className="ac-form-section-header">
                                                    <PenLine size={14} />
                                                    {t('adminCertificates.signaturesSection', 'Signatures')}
                                                </div>
                                                <div className="ac-signature-grid">
                                                    {getSignatureFields(t).map((field) => (
                                                        <label key={field.key} className="ac-signature-chip">
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
                                                            <span className="ac-signature-chip-indicator" />
                                                            <span className="ac-signature-chip-label">{field.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </Step>
                                    </Stepper>

                                    <div className="ac-modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            disabled={submitting}
                                            onClick={() => setShowCreateForm(false)}
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        {createStep > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                disabled={submitting}
                                                onClick={handleCreateBack}
                                            >
                                                {t('common.back', 'Back')}
                                            </button>
                                        )}
                                        {createStep < 3 ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={submitting}
                                                onClick={handleCreateNext}
                                            >
                                                {t('common.next', 'Next')}
                                            </button>
                                        ) : (
                                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                                {submitting ? t('common.creating') : t('adminCertificates.createCertificate')}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
};

export default AdministrativeCertificatesPage;
