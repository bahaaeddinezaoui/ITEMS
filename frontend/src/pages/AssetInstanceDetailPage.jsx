import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Tag, Sliders, Pencil, X, XCircle, Clock, UserPlus, Layers,
    ShoppingCart, AlertTriangle, MapPin, Hash, Shield, FileText, Trash2, Building2
} from 'lucide-react';
import {
    assetService,
    assetAttributeValueService,
    assetAttributeDefinitionService,
    assetTypeAttributeService,
    assetModelAttributeService,
    assetAssignmentService,
    assetOrgAssignmentService,
    locationService,
    personService,
    organizationalStructureService,
} from '../services/api';
import { SkeletonBlock } from '../components/SkeletonCard';
import ModalPortal from '../components/ModalPortal';
import SearchableSelect from '../components/SearchableSelect';
import useModalFeedback from '../components/useModalFeedback';
import ModalFeedback from '../components/ModalFeedback';
import TranslatableInput from '../components/TranslatableInput';
import BackButton from '../components/BackButton';

const getBilingualPersonName = (person, currentLang) => {
    const firstEn = person.first_name_en || person.first_name || '';
    const firstAr = person.first_name_ar || '';
    const lastEn = person.last_name_en || person.last_name || '';
    const lastAr = person.last_name_ar || '';
    const nameEn = [firstEn, lastEn].filter(Boolean).join(' ');
    const nameAr = [firstAr, lastAr].filter(Boolean).join(' ');
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || `Person ${person.person_id}`;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || `Person ${person.person_id}`;
    }
};

const getBilingualAttrDescription = (def, currentLang) => {
    const descAr = def?.description_ar;
    const descEn = def?.description_en || def?.description;
    if (currentLang === 'ar') {
        if (descAr && descEn && descAr !== descEn) return `${descAr} (${descEn})`;
        return descAr || descEn || '';
    } else {
        if (descEn && descAr && descEn !== descAr) return `${descEn} (${descAr})`;
        return descEn || descAr || '';
    }
};

const getBilingualAttrUnit = (def, currentLang) => {
    const unitAr = def?.unit_ar;
    const unitEn = def?.unit_en || def?.unit;
    if (currentLang === 'ar') {
        if (unitAr && unitEn && unitAr !== unitEn) return `${unitAr} (${unitEn})`;
        return unitAr || unitEn || '';
    } else {
        if (unitEn && unitAr && unitEn !== unitAr) return `${unitEn} (${unitAr})`;
        return unitEn || unitAr || '';
    }
};

const getBilingualStructureName = (item, currentLang) => {
    const nameAr = item.structure_name_ar;
    const nameEn = item.structure_name_en;
    if (currentLang === 'ar') {
        if (nameAr && nameEn && nameAr !== nameEn) return `${nameAr} (${nameEn})`;
        return nameAr || nameEn || item.structure_name;
    } else {
        if (nameEn && nameAr && nameEn !== nameAr) return `${nameEn} (${nameAr})`;
        return nameEn || nameAr || item.structure_name;
    }
};

const STATUS_OPTIONS = [
    { value: 'not_delivered_to_company', labelKey: 'assets.notDelivered' },
    { value: 'in_stock', labelKey: 'assets.inStock' },
    { value: 'assigned', labelKey: 'assets.assigned' },
    { value: 'under_internal_maintenance', labelKey: 'assets.underInternalMaintenance' },
    { value: 'failed', labelKey: 'assets.failed' },
    { value: 'lost', labelKey: 'assets.lost' },
    { value: 'stolen', labelKey: 'assets.stolen' },
    { value: 'irrecoverably_damaged', labelKey: 'assets.irrecoverablyDamaged' },
    { value: 'destroyed', labelKey: 'assets.destroyed' },
];

const statusColor = (status) => {
    switch (status) {
        case 'in_stock': return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' };
        case 'not_delivered_to_company': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' };
        case 'assigned': return { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' };
        case 'under_internal_maintenance': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' };
        case 'sent_to_external_maintenance': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' };
        case 'received_by_maintenance_provider': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' };
        case 'sent_to_company_after_external_maintenance': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' };
        case 'received_by_company_after_external_maintenance': return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' };
        case 'failed': return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-error)' };
        case 'destroyed': return { bg: 'rgba(107, 114, 128, 0.15)', color: 'var(--color-text-muted)' };
        default: return { bg: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' };
    }
};

const AssetInstanceDetailPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const typeIdParam = searchParams.get('typeId');
    const modelIdParam = searchParams.get('modelId');

    const [asset, setAsset] = useState(null);
    const [assetAttributes, setAssetAttributes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
    const [assetTypeAttributes, setAssetTypeAttributes] = useState([]);
    const [assetModelAttributes, setAssetModelAttributes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [persons, setPersons] = useState([]);
    const [orgStructures, setOrgStructures] = useState([]);
    const [locations, setLocations] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit modal
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [formTranslations, setFormTranslations] = useState({});
    const [saving, setSaving] = useState(false);

    // Attribute form
    const [showAttrForm, setShowAttrForm] = useState(false);
    const [attrFormData, setAttrFormData] = useState({
        asset_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });

    // Assign modal
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignTab, setAssignTab] = useState('person'); // 'person' or 'org'
    const [assignFormData, setAssignFormData] = useState({ person: '', organizational_structure: '', start_datetime: '' });

    // Move modal
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [selectedMoveLocationId, setSelectedMoveLocationId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);
    const [movementReasonAr, setMovementReasonAr] = useState('');

    // Discharge
    const [dischargingAssignment, setDischargingAssignment] = useState(null);

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

    const definitionLookup = useMemo(() => {
        const map = new Map();
        attributeDefinitions.forEach((def) => {
            map.set(def.asset_attribute_definition_id, def);
        });
        return map;
    }, [attributeDefinitions]);

    const assetAttributesByDefinitionId = useMemo(() => {
        const map = new Map();
        assetAttributes.forEach((attr) => {
            map.set(Number(attr.asset_attribute_definition), attr);
        });
        return map;
    }, [assetAttributes]);

    const applicableAttributeDefinitions = useMemo(() => {
        const defIds = new Set();
        assetTypeAttributes.forEach((a) => defIds.add(Number(a.asset_attribute_definition)));
        assetModelAttributes.forEach((a) => defIds.add(Number(a.asset_attribute_definition)));

        const defs = Array.from(defIds)
            .map((id) => definitionLookup.get(id) || null)
            .filter(Boolean);

        defs.sort((a, b) => {
            const aLabel = getBilingualAttrDescription(a, i18n.language) || '';
            const bLabel = getBilingualAttrDescription(b, i18n.language) || '';
            return aLabel.localeCompare(bLabel, undefined, { sensitivity: 'base' });
        });
        return defs;
    }, [assetTypeAttributes, assetModelAttributes, definitionLookup, i18n.language]);

    const activeAssignment = useMemo(() => {
        if (!asset || !assignments.length) return null;
        return assignments.find(a => {
            const assetId = typeof a.asset === 'object' ? a.asset?.asset_id : a.asset;
            return assetId === asset.asset_id && a.is_active;
        }) || null;
    }, [asset, assignments]);

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [assetData, defsData, personsData, locationsData, assignmentsData, orgStructuresData, orgAssignmentsData] = await Promise.all([
                    assetService.getById(itemId),
                    assetAttributeDefinitionService.getAll(),
                    personService.getAll(),
                    locationService.getAll(),
                    assetAssignmentService.getAll({ asset: itemId }),
                    organizationalStructureService.getAll(),
                    assetOrgAssignmentService.getAll({ asset: itemId }),
                ]);
                setAsset(assetData);
                setAttributeDefinitions(Array.isArray(defsData) ? defsData : []);
                setPersons(Array.isArray(personsData) ? personsData : []);
                setLocations(Array.isArray(locationsData) ? locationsData : []);
                setAssignments([...(Array.isArray(assignmentsData) ? assignmentsData : []), ...(Array.isArray(orgAssignmentsData) ? orgAssignmentsData : [])]);
                setOrgStructures(Array.isArray(orgStructuresData) ? orgStructuresData : []);

                // Fetch attributes and location in parallel
                const [attrsData, locData] = await Promise.all([
                    assetAttributeValueService.getByAsset(itemId),
                    assetService.getCurrentLocation(itemId).catch(() => null),
                ]);
                setAssetAttributes(Array.isArray(attrsData) ? attrsData : []);
                setCurrentLocation(locData);
            } catch (err) {
                setError(t('assets.assetDetails') + ': ' + (err?.response?.data?.detail || err?.message || 'Failed to load asset'));
            } finally {
                setLoading(false);
            }
        };
        if (itemId) fetchData();
    }, [itemId]);

    useEffect(() => {
        const fetchApplicableAttributes = async () => {
            try {
                if (typeIdParam) {
                    const typeAttrs = await assetTypeAttributeService.getByAssetType(typeIdParam);
                    setAssetTypeAttributes(Array.isArray(typeAttrs) ? typeAttrs : []);
                } else {
                    setAssetTypeAttributes([]);
                }
            } catch {
                setAssetTypeAttributes([]);
            }

            try {
                if (modelIdParam) {
                    const modelAttrs = await assetModelAttributeService.getByAssetModel(modelIdParam);
                    setAssetModelAttributes(Array.isArray(modelAttrs) ? modelAttrs : []);
                } else {
                    setAssetModelAttributes([]);
                }
            } catch {
                setAssetModelAttributes([]);
            }
        };

        fetchApplicableAttributes();
    }, [typeIdParam, modelIdParam]);

    const formatStatus = (status) => {
        const opt = STATUS_OPTIONS.find(o => o.value === status);
        if (opt) return t(opt.labelKey);
        const statusAr = asset?.asset_status_ar;
        const statusEn = asset?.asset_status_en;
        if (i18n.language === 'ar' && statusAr) return statusAr;
        if (statusEn) return statusEn;
        return String(status).split('_').map(p => p ? p[0].toUpperCase() + p.slice(1) : '').join(' ');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (lang, field, value) => {
        setFormTranslations(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [field]: value }
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...editFormData };
            if (formTranslations && Object.keys(formTranslations).length > 0) {
                payload.translations = formTranslations;
            }
            const updated = await assetService.update(asset.asset_id, payload);
            setAsset(updated);
            setShowEditForm(false);
            setFormTranslations({});
            showSuccess(t('assets.assetDetails') + ' updated');
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to update asset');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAsset = async () => {
        if (!window.confirm(t('assets.assetDetails') + ': Delete this asset?')) return;
        try {
            await assetService.delete(asset.asset_id);
            navigate(-1);
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to delete asset');
        }
    };

    const openEditForm = () => {
        setEditFormData({
            asset_name: asset.asset_name || '',
            asset_serial_number: asset.asset_serial_number || '',
            asset_inventory_number: asset.asset_inventory_number || '',
            asset_service_tag: asset.asset_service_tag || '',
            asset_status: asset.asset_status || 'not_delivered_to_company',
        });
        setFormTranslations({});
        setShowEditForm(true);
    };

    // Attribute handlers
    const handleAttrInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAttrFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAttrSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await assetAttributeValueService.create({
                asset: asset.asset_id,
                ...attrFormData,
            });
            const attrsData = await assetAttributeValueService.getByAsset(asset.asset_id);
            setAssetAttributes(Array.isArray(attrsData) ? attrsData : []);
            setShowAttrForm(false);
            setAttrFormData({ asset_attribute_definition: '', value_string: '', value_number: '', value_bool: false, value_date: '' });
            showSuccess('Attribute added');
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to add attribute');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttr = async (assetId, defId) => {
        try {
            await assetAttributeValueService.delete(assetId, defId);
            setAssetAttributes(prev => prev.filter(a => !(a.asset === assetId && a.asset_attribute_definition === defId)));
        } catch (err) {
            showError('Failed to delete attribute');
        }
    };

    // Assign handlers
    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (assignTab === 'org') {
                await assetOrgAssignmentService.create({
                    asset: asset.asset_id,
                    organizational_structure: assignFormData.organizational_structure,
                    start_datetime: assignFormData.start_datetime,
                });
            } else {
                await assetAssignmentService.create({
                    asset: asset.asset_id,
                    person: assignFormData.person,
                    start_datetime: assignFormData.start_datetime,
                });
            }
            const [assignmentsData, orgAssignmentsData] = await Promise.all([
                assetAssignmentService.getAll({ asset: asset.asset_id }),
                assetOrgAssignmentService.getAll({ asset: asset.asset_id }),
            ]);
            setAssignments([...(Array.isArray(assignmentsData) ? assignmentsData : []), ...(Array.isArray(orgAssignmentsData) ? orgAssignmentsData : [])]);
            setShowAssignForm(false);
            showSuccess(t('assets.assignAsset'));
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to assign');
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = async (assignmentId) => {
        setSaving(true);
        try {
            await assetAssignmentService.discharge(assignmentId);
            const assignmentsData = await assetAssignmentService.getAll({ asset: asset.asset_id });
            setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
            setDischargingAssignment(null);
            showSuccess('Discharged successfully');
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to discharge');
        } finally {
            setSaving(false);
        }
    };

    // Move handler
    const handleMoveSubmit = async (e) => {
        e.preventDefault();
        setMoveSubmitting(true);
        try {
            await assetService.move(asset.asset_id, {
                location: selectedMoveLocationId,
                movement_reason_ar: movementReasonAr || undefined,
            });
            const locData = await assetService.getCurrentLocation(asset.asset_id).catch(() => null);
            setCurrentLocation(locData);
            setShowMoveModal(false);
            setSelectedMoveLocationId('');
            setMovementReasonAr('');
            showSuccess(t('assets.move'));
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to move');
        } finally {
            setMoveSubmitting(false);
        }
    };

    const suggestForDestruction = async () => {
        setSaving(true);
        try {
            await assetService.suggestForDestruction(asset.asset_id);
            showSuccess(t('assets.suggestForDestruction'));
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
                <SkeletonBlock height="40px" width="300px" style={{ marginBottom: 'var(--space-6)' }} />
                <SkeletonBlock height="200px" style={{ marginBottom: 'var(--space-4)' }} />
                <SkeletonBlock height="150px" />
            </div>
        );
    }

    if (error && !asset) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} />
                    <span>{error}</span>
                </div>
                <BackButton onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-4)' }} />
            </div>
        );
    }

    if (!asset) return null;

    const sc = statusColor(asset.asset_status);
    const currentLocationObj = locations.find(l => l.location_id === currentLocation?.location_id);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <BackButton onClick={() => {
                        const params = typeIdParam && modelIdParam ? `?typeId=${typeIdParam}&modelId=${modelIdParam}` : '';
                        navigate(`/dashboard/assets/instances${params}`);
                    }} />
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Box size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            {asset.asset_name || t('assets.assetWithId', { id: asset.asset_id })}
                        </h1>
                        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Tag size={14} />
                            {asset.type_label || `Type #${typeIdParam || ''}`} • {asset.brand_name || ''} {asset.model_name || `Model #${modelIdParam || ''}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <button onClick={openEditForm} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                        <Pencil size={16} /> <span>{t('common.edit')}</span>
                    </button>
                    <button onClick={() => setShowMoveModal(true)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                        <MapPin size={16} /> <span>{t('assets.move')}</span>
                    </button>
                    {activeAssignment ? (
                        <button onClick={() => setDischargingAssignment(activeAssignment)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}>
                            <X size={16} /> <span>{t('assets.discharge')}</span>
                        </button>
                    ) : (
                        <button onClick={() => {
                            const now = new Date();
                            const tzOffset = now.getTimezoneOffset() * 60000;
                            const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
                            setAssignFormData({ person: '', organizational_structure: '', start_datetime: localISOTime });
                            setAssignTab('person');
                            setShowAssignForm(true);
                        }} className="btn btn-primary" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                            <UserPlus size={16} /> <span>{t('assets.assign')}</span>
                        </button>
                    )}
                    <button onClick={handleDeleteAsset} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} /><span>{error}</span>
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={18} /></button>
                </div>
            )}

            {/* Main content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                {/* Left: General Info */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Box size={16} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('assets.assetDetails')}
                    </div>
                    <div style={{ padding: 'var(--space-5)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.assetName')}</div>
                                <div style={{ fontWeight: 600 }}>{asset.asset_name || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.status')}</div>
                                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--font-size-sm)', backgroundColor: sc.bg, color: sc.color }}>
                                    {formatStatus(asset.asset_status)}
                                </span>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.serialNumber')}</div>
                                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{asset.asset_serial_number || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.inventoryNumber')}</div>
                                <div style={{ fontWeight: 600 }}>{asset.asset_inventory_number || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.serviceTag')}</div>
                                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{asset.asset_service_tag || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.assetId')}</div>
                                <div style={{ fontWeight: 600 }}>{asset.asset_id}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.assignedTo')}</div>
                                <div style={{ fontWeight: 600 }}>{activeAssignment?.person ? getBilingualPersonName(activeAssignment.person, i18n.language) : '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('assets.location')}</div>
                                <div style={{ fontWeight: 600 }}>{currentLocationObj?.location_name || currentLocation?.location_name || '—'}</div>
                            </div>
                        </div>

                        {/* Suggest for destruction */}
                        {(asset.asset_status || '').toLowerCase() === 'failed' && (
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <button type="button" onClick={suggestForDestruction} disabled={saving} className="btn btn-secondary">
                                    {saving ? t('assets.saving') : t('assets.suggestForDestruction')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Composition */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Layers size={16} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('assets.compositionHistory').replace(' History', '')}
                    </div>
                    <div style={{ padding: 'var(--space-5)' }}>
                        {/* Stock Items Composition */}
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <Box size={14} style={{ color: 'var(--color-info)' }} />
                                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t('assets.stockItems')}</span>
                            </div>
                            {(asset.stock_item_composition || []).length === 0 ? (
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>—</div>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                                    {asset.stock_item_composition.map(si => (
                                        <li key={si.stock_item_id} style={{ padding: '2px 0' }}>{si.stock_item_name || `Stock Item ${si.stock_item_id}`}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* Consumables Composition */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <ShoppingCart size={14} style={{ color: 'var(--color-warning)' }} />
                                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t('assets.consumables')}</span>
                            </div>
                            {(asset.consumable_composition || []).length === 0 ? (
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>—</div>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                                    {asset.consumable_composition.map(c => (
                                        <li key={c.consumable_id} style={{ padding: '2px 0' }}>{c.consumable_name || `Consumable ${c.consumable_id}`}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* Composition History Link */}
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <button
                                onClick={() => navigate(`/dashboard/assets/instances/${asset.asset_id}/composition-history?typeId=${typeIdParam || ''}&modelId=${modelIdParam || ''}`)}
                                className="btn btn-secondary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                            >
                                <Clock size={16} />
                                {t('assets.compositionHistory')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attributes Section */}
            <div className="card" style={{ overflow: 'hidden', marginTop: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Sliders size={16} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('assets.assetAttributes')}
                    </div>
                    <button onClick={() => setShowAttrForm(true)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>
                        + {t('assets.addValue')}
                    </button>
                </div>
                <div style={{ padding: 'var(--space-5)' }}>
                    {applicableAttributeDefinitions.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('assets.noAttrValues')}</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            {applicableAttributeDefinitions.map((definition) => {
                                const defId = Number(definition.asset_attribute_definition_id);
                                const attr = assetAttributesByDefinitionId.get(defId) || null;
                                const value = attr ? (attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '') : '';
                                const unitLabel = getBilingualAttrUnit(definition, i18n.language);
                                return (
                                    <div key={defId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>{getBilingualAttrDescription(definition, i18n.language) || t('assets.attributeWithId', { id: defId })}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? t('assets.noValue') : (unitLabel ? `${String(value)} ${unitLabel}` : String(value))}</div>
                                        </div>
                                        {attr ? (
                                            <button onClick={() => handleDeleteAttr(attr.asset, attr.asset_attribute_definition)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer', fontSize: 'var(--font-size-lg)' }}>&times;</button>
                                        ) : (
                                            <span style={{ width: 18 }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Attribute Value Modal */}
            {showAttrForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowAttrForm(false)}>
                        <div className="modal" style={{ maxWidth: '560px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.addValue')}</h3>
                                <button className="modal-close" onClick={() => setShowAttrForm(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleAttrSubmit}>
                                    <select name="asset_attribute_definition" value={attrFormData.asset_attribute_definition} onChange={handleAttrInputChange} required className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }}>
                                        <option value="">{t('assets.selectAttrDefPlaceholder')}</option>
                                        {applicableAttributeDefinitions.map((def) => (
                                            <option key={def.asset_attribute_definition_id} value={def.asset_attribute_definition_id}>
                                                {getBilingualAttrDescription(def, i18n.language) || t('assets.attributeWithId', { id: def.asset_attribute_definition_id })}
                                            </option>
                                        ))}
                                    </select>
                                    {(() => {
                                        const selectedDef = definitionLookup.get(Number(attrFormData.asset_attribute_definition));
                                        const dataType = selectedDef?.data_type?.toLowerCase();
                                        if (dataType === 'number') return <input type="number" name="value_number" placeholder={t('assets.numberValue')} value={attrFormData.value_number} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                        if (dataType === 'bool' || dataType === 'boolean') return <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}><input type="checkbox" name="value_bool" checked={attrFormData.value_bool} onChange={handleAttrInputChange} />{t('assets.true')}</label>;
                                        if (dataType === 'date') return <input type="date" name="value_date" value={attrFormData.value_date} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                        return <input type="text" name="value_string" placeholder={t('assets.stringValue')} value={attrFormData.value_string} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                    })()}
                                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                                        <button type="button" onClick={() => setShowAttrForm(false)} className="btn btn-secondary">{t('assets.cancel')}</button>
                                        <button type="submit" disabled={saving} className="btn btn-primary">{t('assets.save')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Assignment History */}
            <div className="card" style={{ overflow: 'hidden', marginTop: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <UserPlus size={16} style={{ color: 'var(--color-accent-primary)' }} />
                    Assignment History
                </div>
                <div style={{ padding: 'var(--space-5)' }}>
                    {assignments.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>No assignment history.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {assignments.map(a => (
                                <div key={a.assignment_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                    <div>
                                        <div style={{ fontWeight: '500' }}>{getBilingualPersonName(a.person, i18n.language)}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                            {a.start_datetime ? new Date(a.start_datetime).toLocaleDateString() : '—'} → {a.end_datetime ? new Date(a.end_datetime).toLocaleDateString() : 'Present'}
                                        </div>
                                    </div>
                                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--font-size-xs)', backgroundColor: a.is_active ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-secondary)', color: a.is_active ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                        {a.is_active ? 'Active' : 'Ended'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
                        <div className="modal" style={{ maxWidth: '560px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.editAsset')}</h3>
                                <button className="modal-close" onClick={() => setShowEditForm(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleEditSubmit} className="form">
                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('assets.assetName')}
                                            baseFieldName="asset_name"
                                            value={editFormData.asset_name}
                                            onChange={(name, value) => handleEditInputChange({ target: { name, value } })}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.asset_name]))}
                                            onTranslationChange={handleFormTranslationChange}
                                            placeholder={t('assets.assetName')}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input type="text" name="asset_serial_number" value={editFormData.asset_serial_number} onChange={handleEditInputChange} placeholder={t('assets.serialNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" name="asset_inventory_number" value={editFormData.asset_inventory_number} onChange={handleEditInputChange} placeholder={t('assets.inventoryNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input type="text" name="asset_service_tag" value={editFormData.asset_service_tag} onChange={handleEditInputChange} placeholder={t('assets.serviceTag')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                        <div className="form-group">
                                            <select name="asset_status" value={editFormData.asset_status} onChange={handleEditInputChange} className="form-input" style={{ height: '44px' }}>
                                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>{saving ? t('assets.saving') : t('common.update')}</button>
                                        <button type="button" onClick={() => setShowEditForm(false)} className="btn btn-secondary" style={{ padding: 'var(--space-3) var(--space-6)' }}>{t('common.cancel')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Assign Modal */}
            {showAssignForm && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setShowAssignForm(false)}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.assignAsset')}</h3>
                                <button className="modal-close" onClick={() => setShowAssignForm(false)}><X size={18} /></button>
                            </div>
                            <form onSubmit={handleAssignSubmit}>
                                <div className="modal-body">
                                    <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                    {/* Assign Tabs */}
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                        <button
                                            type="button"
                                            onClick={() => setAssignTab('person')}
                                            style={{
                                                flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                                                border: `1px solid ${assignTab === 'person' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                background: assignTab === 'person' ? 'var(--color-primary)' : 'transparent',
                                                color: assignTab === 'person' ? '#fff' : 'var(--color-text-secondary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                                fontWeight: 500, fontSize: '0.875rem',
                                            }}
                                        >
                                            <UserPlus size={16} /> {t('assets.person')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAssignTab('org')}
                                            style={{
                                                flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                                                border: `1px solid ${assignTab === 'org' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                background: assignTab === 'org' ? 'var(--color-primary)' : 'transparent',
                                                color: assignTab === 'org' ? '#fff' : 'var(--color-text-secondary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                                                fontWeight: 500, fontSize: '0.875rem',
                                            }}
                                        >
                                            <Building2 size={16} /> {t('assets.orgStructure')}
                                        </button>
                                    </div>
                                    {assignTab === 'person' ? (
                                        <div className="form-group">
                                            <label className="form-label">{t('assets.person')}</label>
                                            <SearchableSelect
                                                value={assignFormData.person}
                                                onChange={(e) => setAssignFormData(prev => ({ ...prev, person: e.target.value }))}
                                                options={persons.map(p => ({
                                                    value: p.person_id,
                                                    label: getBilingualPersonName(p, i18n.language),
                                                    searchText: [p.first_name_en, p.first_name_ar, p.last_name_en, p.last_name_ar].filter(Boolean).join(' ')
                                                }))}
                                                placeholder={t('assets.selectPerson')}
                                                required
                                                disabled={saving}
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label className="form-label">{t('assets.orgStructure')}</label>
                                            <SearchableSelect
                                                value={assignFormData.organizational_structure}
                                                onChange={(e) => setAssignFormData(prev => ({ ...prev, organizational_structure: e.target.value }))}
                                                options={orgStructures.filter(s => s.is_active).map(s => ({
                                                    value: s.organizational_structure_id,
                                                    label: getBilingualStructureName(s, i18n.language),
                                                    searchText: [s.structure_name, s.structure_name_en, s.structure_name_ar, s.structure_code].filter(Boolean).join(' ')
                                                }))}
                                                placeholder={t('assets.selectOrgStructure')}
                                                required
                                                disabled={saving}
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.startDatetime')}</label>
                                        <input type="datetime-local" name="start_datetime" value={assignFormData.start_datetime} onChange={(e) => setAssignFormData(prev => ({ ...prev, start_datetime: e.target.value }))} required className="form-input" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowAssignForm(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">{saving ? t('assets.assigning') : t('assets.assign')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Discharge Modal */}
            {dischargingAssignment && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => setDischargingAssignment(null)}>
                        <div className="modal" style={{ maxWidth: '480px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.discharge')}</h3>
                                <button className="modal-close" onClick={() => setDischargingAssignment(null)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <p>{t('assets.dischargeConfirm')}</p>
                                <div className="form-actions">
                                    <button onClick={() => handleDischarge(dischargingAssignment.assignment_id)} disabled={saving} className="btn btn-primary">{t('assets.discharge')}</button>
                                    <button onClick={() => setDischargingAssignment(null)} className="btn btn-secondary">{t('common.cancel')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Move Modal */}
            {showMoveModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => !moveSubmitting && setShowMoveModal(false)}>
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('assets.moveAssetTitle')}: {asset.asset_name || t('assets.assetWithId', { id: asset.asset_id })}</h3>
                                <button className="modal-close" onClick={() => setShowMoveModal(false)} disabled={moveSubmitting}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleMoveSubmit}>
                                    <div className="form-group">
                                        <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-secondary)' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{t('assets.currentLocation')}</div>
                                            <div style={{ fontWeight: 600 }}>{currentLocationObj?.location_name || t('assets.unknown')}</div>
                                        </div>
                                        <label className="form-label">{t('assets.location')}</label>
                                        <select value={selectedMoveLocationId} onChange={(e) => setSelectedMoveLocationId(e.target.value)} required disabled={moveSubmitting} className="form-input" style={{ height: '44px' }}>
                                            <option value="">{t('assets.selectLocation')}</option>
                                            {locations.map((r) => (
                                                <option key={r.location_id} value={r.location_id}>{r.location_name || `Location ${r.location_id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('assets.movementReasonAr')}</label>
                                        <input type="text" value={movementReasonAr} onChange={(e) => setMovementReasonAr(e.target.value)} disabled={moveSubmitting} className="form-input" placeholder={t('assets.movementReasonArPlaceholder')} dir="rtl" />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={moveSubmitting || !selectedMoveLocationId} className="btn btn-primary">{moveSubmitting ? t('assets.moving') : t('assets.move')}</button>
                                        <button type="button" onClick={() => setShowMoveModal(false)} disabled={moveSubmitting} className="btn btn-secondary">{t('common.cancel')}</button>
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

export default AssetInstanceDetailPage;
