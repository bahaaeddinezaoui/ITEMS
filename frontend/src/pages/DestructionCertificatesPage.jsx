import { useEffect, useMemo, useRef, useState } from 'react';
import { SkeletonListRows } from '../components/SkeletonCard';
import {
    Shield,
    FileText,
    CheckCircle2,
    Clock,
    Upload,
    Plus,
    X,
    AlertCircle,
    FileCheck,
    FileX2,
    Hash,
    XCircle,
    Loader2,
    Package,
    Droplets,
} from 'lucide-react';
import {
    consumableService,
    stockItemConsumableDestructionCertificateService,
    stockItemService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SkeletonCardList } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';

const DestructionCertificatesPage = () => {
    const { user, isSuperuser } = useAuth();
    const { t } = useTranslation();

    const roleCodes = useMemo(() => {
        return Array.isArray(user?.roles) ? user.roles.map((r) => r.role_code).filter(Boolean) : [];
    }, [user]);

    const isExploitationChief = isSuperuser || roleCodes.includes('exploitation_chief');
    const isItBureauChief = isSuperuser || roleCodes.includes('it_bureau_chief');
    const isStockConsumableResponsible = isSuperuser || user?.roles?.some((role) => role.role_code === 'stock_consumable_responsible' || role.role_code === 'exploitation_chief');

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
            setError(e?.response?.data?.error || t('destructionCertificates.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!canView) return;
        fetchAll();
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
                setError(t('destructionCertificates.selectAtLeastOne'));
                return;
            }

            const formData = new FormData();
            formData.append('stock_item_ids', JSON.stringify(createForm.stock_item_ids));
            formData.append('consumable_ids', JSON.stringify(createForm.consumable_ids));

            await stockItemConsumableDestructionCertificateService.create(formData);
            await fetchAll();

            setSuccess(t('destructionCertificates.createSuccess'));
            setShowCreateForm(false);
            setCreateForm({ stock_item_ids: [], consumable_ids: [] });
        } catch (err) {
            const msg = err?.response?.data?.error || (typeof err?.response?.data === 'object' ? JSON.stringify(err.response.data) : '') || t('destructionCertificates.createError');
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
            setSuccess(t('destructionCertificates.validatedSuccess', { id }))
        } catch (err) {
            setError(err?.response?.data?.error || t('destructionCertificates.validateError'));
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
                const rawBlob = await stockItemConsumableDestructionCertificateService.getDigitalCopyBlob(id);
                const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(pdfBlob);
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
            setError(err?.response?.data?.error || t('destructionCertificates.consultPdfError'));
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
            const rawBlob = await stockItemConsumableDestructionCertificateService.getDigitalCopyBlob(id);
            const pdfBlob = new Blob([rawBlob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
        } catch (err) {
            setError(err?.response?.data?.error || t('destructionCertificates.uploadPdfError'));
        } finally {
            setSubmitting(false);
        }
    };

    const stats = useMemo(() => {
        const total = certificates.length;
        const validated = certificates.filter((c) => !!c.destruction_datetime).length;
        const pending = total - validated;
        const withPdf = certificates.filter((c) => !!c.digital_copy).length;
        return { total, validated, pending, withPdf };
    }, [certificates]);

    if (!canView) {
        return <Navigate to="/dashboard" replace />;
    }

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)' }}>
                <div className="page-header">
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Shield size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('destructionCertificates.title')}</h1>
                    <p className="page-subtitle">{t('destructionCertificates.subtitle')}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
                    <SkeletonListRows count={6} />
                </div>
            </div>
        );
    }

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

    const stockByCert = {};
    failedStockItems.forEach((s) => {
        const certId = s.stock_item_consumable_destruction_certificate_id;
        if (certId) {
            if (!stockByCert[certId]) stockByCert[certId] = [];
            stockByCert[certId].push(s);
        }
    });

    const consumablesByCert = {};
    failedConsumables.forEach((c) => {
        const certId = c.stock_item_consumable_destruction_certificate_id;
        if (certId) {
            if (!consumablesByCert[certId]) consumablesByCert[certId] = [];
            consumablesByCert[certId].push(c);
        }
    });

    return (
        <>
            <input
                ref={uploadFileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={onUploadFileSelected}
            />

            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Shield size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('destructionCertificates.title')}</h1>
                        <p className="page-subtitle" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                            {t('destructionCertificates.subtitle')}
                        </p>
                    </div>
                    {canCreate && (
                        <button
                            className={`btn btn-${showCreateForm ? 'secondary' : 'primary'}`}
                            onClick={() => setShowCreateForm((v) => !v)}
                            style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', width: 'auto' }}
                        >
                            {showCreateForm ? <X size={18} /> : <Plus size={18} />}
                            {showCreateForm ? t('common.cancel') : t('destructionCertificates.newCertificate')}
                        </button>
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="error-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <XCircle size={20} />
                        <span>{error}</span>
                        <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                )}
                {success && (
                    <div className="success-message" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <CheckCircle2 size={20} />
                        <span>{success}</span>
                        <button onClick={() => setSuccess('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Stats Row */}
                <div className="metric-grid" style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="metric-card color-violet">
                        <div className="metric-info">
                            <span className="metric-title">{t('destructionCertificates.totalCertificates')}</span>
                            <span className="metric-value">{stats.total}</span>
                        </div>
                        <div className="metric-icon-box">
                            <Shield size={22} />
                        </div>
                    </div>
                    <div className="metric-card color-amber">
                        <div className="metric-info">
                            <span className="metric-title">{t('destructionCertificates.pendingValidation')}</span>
                            <span className="metric-value">{stats.pending}</span>
                        </div>
                        <div className="metric-icon-box">
                            <Clock size={22} />
                        </div>
                    </div>
                    <div className="metric-card color-emerald">
                        <div className="metric-info">
                            <span className="metric-title">{t('destructionCertificates.validated')}</span>
                            <span className="metric-value">{stats.validated}</span>
                        </div>
                        <div className="metric-icon-box">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                    <div className="metric-card color-blue">
                        <div className="metric-info">
                            <span className="metric-title">{t('destructionCertificates.withDigitalCopy')}</span>
                            <span className="metric-value">{stats.withPdf}</span>
                        </div>
                        <div className="metric-icon-box">
                            <FileText size={22} />
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && canCreate && (
                    <div className="card" style={{ marginBottom: 'var(--space-8)', border: '1px solid var(--color-accent-primary)', boxShadow: '0 0 20px var(--color-accent-glow)' }}>
                        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-accent-glow)', border: '1px solid var(--color-accent-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-tertiary)'
                                }}>
                                    <Plus size={18} />
                                </div>
                                <h2 className="card-title">{t('destructionCertificates.newCertificateTitle')}</h2>
                            </div>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleCreate}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                                    {/* Stock Items */}
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                            <Package size={14} style={{ opacity: 0.7 }} />
                                            {t('destructionCertificates.stockItemsSuggested')}
                                        </label>
                                        <div style={{
                                            maxHeight: 260, overflow: 'auto',
                                            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-3)', background: 'var(--color-bg-secondary)'
                                        }}>
                                            {selectableStockItems.length === 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                                                    <AlertCircle size={18} />
                                                    <span>{t('destructionCertificates.noEligibleStockItems')}</span>
                                                </div>
                                            )}
                                            {selectableStockItems.map((s) => {
                                                const isSelected = createForm.stock_item_ids.includes(s.stock_item_id);
                                                return (
                                                    <label
                                                        key={s.stock_item_id}
                                                        style={{
                                                            display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                                            padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)',
                                                            cursor: 'pointer', transition: 'background 0.15s',
                                                            background: isSelected ? 'var(--color-accent-glow)' : 'transparent',
                                                            border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                                            marginBottom: 'var(--space-1)'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                setCreateForm((prev) => ({
                                                                    ...prev,
                                                                    stock_item_ids: toggleIdInList(prev.stock_item_ids, s.stock_item_id),
                                                                }))
                                                            }
                                                            style={{ accentColor: 'var(--color-accent-primary)' }}
                                                        />
                                                        <span style={{ flex: 1, fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)' }}>
                                                            {s.stock_item_name || `Stock Item #${s.stock_item_id}`}
                                                        </span>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                            <Hash size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {s.stock_item_id}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {createForm.stock_item_ids.length > 0 && (
                                            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-accent-tertiary)', fontWeight: 600 }}>
                                                {createForm.stock_item_ids.length} {createForm.stock_item_ids.length === 1 ? t('destructionCertificates.stockItemSelected') : t('destructionCertificates.stockItemsSelected')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Consumables */}
                                    <div className="form-group">
                                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                            <Droplets size={14} style={{ opacity: 0.7 }} />
                                            {t('destructionCertificates.consumablesSuggested')}
                                        </label>
                                        <div style={{
                                            maxHeight: 260, overflow: 'auto',
                                            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                                            padding: 'var(--space-3)', background: 'var(--color-bg-secondary)'
                                        }}>
                                            {selectableConsumables.length === 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                                                    <AlertCircle size={18} />
                                                    <span>{t('destructionCertificates.noEligibleConsumables')}</span>
                                                </div>
                                            )}
                                            {selectableConsumables.map((c) => {
                                                const isSelected = createForm.consumable_ids.includes(c.consumable_id);
                                                return (
                                                    <label
                                                        key={c.consumable_id}
                                                        style={{
                                                            display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                                                            padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)',
                                                            cursor: 'pointer', transition: 'background 0.15s',
                                                            background: isSelected ? 'var(--color-accent-glow)' : 'transparent',
                                                            border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                                            marginBottom: 'var(--space-1)'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                setCreateForm((prev) => ({
                                                                    ...prev,
                                                                    consumable_ids: toggleIdInList(prev.consumable_ids, c.consumable_id),
                                                                }))
                                                            }
                                                            style={{ accentColor: 'var(--color-accent-primary)' }}
                                                        />
                                                        <span style={{ flex: 1, fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-accent-tertiary)' : 'var(--color-text-primary)' }}>
                                                            {c.consumable_name || `Consumable #${c.consumable_id}`}
                                                        </span>
                                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                            <Hash size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.consumable_id}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {createForm.consumable_ids.length > 0 && (
                                            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-accent-tertiary)', fontWeight: 600 }}>
                                                {createForm.consumable_ids.length} {createForm.consumable_ids.length === 1 ? t('destructionCertificates.consumableSelected') : t('destructionCertificates.consumablesSelected')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
                                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileCheck size={18} />}
                                        {submitting ? t('destructionCertificates.creating') : t('destructionCertificates.createCertificate')}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateForm(false); setCreateForm({ stock_item_ids: [], consumable_ids: [] }); }}>
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
                            <Shield size={48} strokeWidth={1.2} />
                            <h3 style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>{t('destructionCertificates.noCertificates')}</h3>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
                        {certificates.map((c) => {
                            const validated = !!c.destruction_datetime;
                            const linkedStock = stockByCert[c.destruction_certificate_id] || [];
                            const linkedConsumables = consumablesByCert[c.destruction_certificate_id] || [];
                            const totalLinked = linkedStock.length + linkedConsumables.length;
                            return (
                                <div
                                    key={c.destruction_certificate_id}
                                    className="card"
                                    style={{ transition: 'all 0.2s ease', cursor: 'default' }}
                                >
                                    <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                                        {/* Card top row: icon + id + status */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                                    background: validated ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                                    border: validated ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: validated ? 'var(--color-success)' : 'var(--color-warning)'
                                                }}>
                                                    {validated ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', letterSpacing: '-0.01em' }}>
                                                        #{c.destruction_certificate_id}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                                                        {validated
                                                            ? (c.destruction_datetime ? new Date(c.destruction_datetime).toLocaleDateString() : '')
                                                            : t('destructionCertificates.pendingValidation')
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                                {/* PDF indicator */}
                                                <span
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                                                        padding: '3px 8px', borderRadius: 'var(--radius-full)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                        background: c.digital_copy ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                                                        color: c.digital_copy ? 'var(--color-accent-tertiary)' : 'var(--color-text-muted)',
                                                        border: c.digital_copy ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    {c.digital_copy ? <FileCheck size={12} /> : <FileX2 size={12} />}
                                                    PDF
                                                </span>
                                                {/* Status badge */}
                                                <span
                                                    className={`badge badge-${validated ? 'success' : 'warning'}`}
                                                    style={{ fontSize: 'var(--font-size-xs)' }}
                                                >
                                                    {validated ? t('destructionCertificates.validated') : t('destructionCertificates.pending')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Linked items */}
                                        {totalLinked > 0 && (
                                            <div style={{
                                                display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)',
                                                marginBottom: 'var(--space-4)', padding: 'var(--space-2) var(--space-3)',
                                                background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--color-border)'
                                            }}>
                                                {linkedStock.slice(0, 2).map((s) => (
                                                    <span key={`s-${s.stock_item_id}`} style={{
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                                                        padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                                                        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                        display: 'inline-flex', alignItems: 'center', gap: '2px'
                                                    }}>
                                                        <Package size={10} /> {s.stock_item_name || `#${s.stock_item_id}`}
                                                    </span>
                                                ))}
                                                {linkedConsumables.slice(0, 2).map((c2) => (
                                                    <span key={`c-${c2.consumable_id}`} style={{
                                                        fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)',
                                                        padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                                                        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                                                        display: 'inline-flex', alignItems: 'center', gap: '2px'
                                                    }}>
                                                        <Droplets size={10} /> {c2.consumable_name || `#${c2.consumable_id}`}
                                                    </span>
                                                ))}
                                                {totalLinked > 4 && (
                                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: '2px 6px' }}>
                                                        +{totalLinked - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
                                            {canValidate && !validated && (
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleValidate(c.destruction_certificate_id)}
                                                    disabled={submitting}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    {t('destructionCertificates.validate')}
                                                </button>
                                            )}
                                            {validated && (
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleConsultPdf(c.destruction_certificate_id)}
                                                    disabled={submitting}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                                >
                                                    <FileText size={16} />
                                                    {t('destructionCertificates.consultPdf')}
                                                </button>
                                            )}
                                            {!canValidate && !validated && (
                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Missing PDF Modal */}
            {showMissingPdfModal && (
                <ModalPortal>
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)'
                                }}>
                                    <FileX2 size={18} />
                                </div>
                                <h3 className="modal-title">{t('destructionCertificates.pdfNotFound')}</h3>
                            </div>
                            <button className="modal-close" onClick={() => { setShowMissingPdfModal(false); setMissingPdfCertId(null); }}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                {t('destructionCertificates.pdfNotFoundDesc')}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setShowMissingPdfModal(false); setMissingPdfCertId(null); }}
                                disabled={submitting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={startUploadMissingPdf}
                                disabled={submitting || !canUploadDigitalCopy}
                                title={!canUploadDigitalCopy ? t('common.notAllowed') : ''}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                            >
                                <Upload size={16} />
                                {t('destructionCertificates.uploadPdf')}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}
        </>
    );
};

export default DestructionCertificatesPage;
