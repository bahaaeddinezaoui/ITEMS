import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Package, Tag, Sliders, Pencil, X, XCircle, Clock, UserPlus,
    Scissors, Box, MapPin, Hash, Trash2, Building2
} from 'lucide-react';
import {
    stockItemService,
    stockItemAttributeValueService,
    stockItemAttributeDefinitionService,
    stockItemAssignmentService,
    stockItemOrgAssignmentService,
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
    { value: 'not_delivered_to_company', labelKey: 'stockItems.statusNotDelivered' },
    { value: 'in_stock', labelKey: 'stockItems.statusInStock' },
    { value: 'assigned', labelKey: 'stockItems.statusAssigned' },
    { value: 'under_internal_maintenance', labelKey: 'stockItems.statusUnderInternalMaintenance' },
    { value: 'failed', labelKey: 'stockItems.statusFailed' },
    { value: 'lost', labelKey: 'stockItems.statusLost' },
    { value: 'stolen', labelKey: 'stockItems.statusStolen' },
    { value: 'irrecoverably_damaged', labelKey: 'stockItems.statusIrrecoverablyDamaged' },
    { value: 'destroyed', labelKey: 'stockItems.statusDestroyed' },
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

const StockItemInstanceDetailPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const typeIdParam = searchParams.get('typeId');
    const modelIdParam = searchParams.get('modelId');

    const [item, setItem] = useState(null);
    const [itemAttributes, setItemAttributes] = useState([]);
    const [attributeDefinitions, setAttributeDefinitions] = useState([]);
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
        stock_item_attribute_definition: '',
        value_string: '',
        value_number: '',
        value_bool: false,
        value_date: ''
    });

    // Assign modal
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [assignTab, setAssignTab] = useState('person');
    const [assignFormData, setAssignFormData] = useState({ person: '', organizational_structure: '', start_datetime: '' });

    // Move modal
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [selectedMoveLocationId, setSelectedMoveLocationId] = useState('');
    const [moveSubmitting, setMoveSubmitting] = useState(false);
    const [movementReasonAr, setMovementReasonAr] = useState('');

    // Split modal
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitAttributeOptions, setSplitAttributeOptions] = useState([]);
    const [splitSubmitting, setSplitSubmitting] = useState(false);
    const [splitFormData, setSplitFormData] = useState({
        attribute_definition_id: '',
        split_value: '',
        new_item_name: '',
        new_item_inventory_number: '',
        new_item_status: 'in_stock',
        destination_location_id: '',
    });

    // Discharge
    const [dischargingAssignment, setDischargingAssignment] = useState(null);

    const { feedbackType, feedbackMessage, showSuccess, showError, clearFeedback } = useModalFeedback();

    const definitionLookup = useMemo(() => {
        const map = new Map();
        attributeDefinitions.forEach((def) => {
            map.set(def.stock_item_attribute_definition_id, def);
        });
        return map;
    }, [attributeDefinitions]);

    const activeAssignment = useMemo(() => {
        if (!item || !assignments.length) return null;
        return assignments.find(a => {
            const itemId = typeof a.stock_item === 'object' ? a.stock_item?.stock_item_id : a.stock_item;
            return itemId === item.stock_item_id && a.is_active;
        }) || null;
    }, [item, assignments]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [itemData, defsData, personsData, locationsData, assignmentsData, orgStructuresData, orgAssignmentsData] = await Promise.all([
                    stockItemService.getById(itemId),
                    stockItemAttributeDefinitionService.getAll(),
                    personService.getAll(),
                    locationService.getAll(),
                    stockItemAssignmentService.getAll({ stock_item: itemId }),
                    organizationalStructureService.getAll(),
                    stockItemOrgAssignmentService.getAll({ stock_item: itemId }),
                ]);
                setItem(itemData);
                setAttributeDefinitions(Array.isArray(defsData) ? defsData : []);
                setPersons(Array.isArray(personsData) ? personsData : []);
                setLocations(Array.isArray(locationsData) ? locationsData : []);
                setAssignments([...(Array.isArray(assignmentsData) ? assignmentsData : []), ...(Array.isArray(orgAssignmentsData) ? orgAssignmentsData : [])]);
                setOrgStructures(Array.isArray(orgStructuresData) ? orgStructuresData : []);

                const [attrsData, locData] = await Promise.all([
                    stockItemAttributeValueService.getByStockItem(itemId),
                    stockItemService.getCurrentLocation(itemId).catch(() => null),
                ]);
                setItemAttributes(Array.isArray(attrsData) ? attrsData : []);
                setCurrentLocation(locData);
            } catch (err) {
                setError(t('stockItems.itemDetails') + ': ' + (err?.response?.data?.detail || err?.message || 'Failed to load item'));
            } finally {
                setLoading(false);
            }
        };
        if (itemId) fetchData();
    }, [itemId]);

    const formatStatus = (status) => {
        const opt = STATUS_OPTIONS.find(o => o.value === status);
        if (opt) return t(opt.labelKey);
        const statusAr = item?.stock_item_status_ar;
        const statusEn = item?.stock_item_status_en;
        if (i18n.language === 'ar' && statusAr) return statusAr;
        if (statusEn) return statusEn;
        return String(status).split('_').map(p => p ? p[0].toUpperCase() + p.slice(1) : '').join(' ');
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormTranslationChange = (lang, field, value) => {
        setFormTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...editFormData };
            if (formTranslations && Object.keys(formTranslations).length > 0) payload.translations = formTranslations;
            const updated = await stockItemService.update(item.stock_item_id, payload);
            setItem(updated);
            setShowEditForm(false);
            setFormTranslations({});
            showSuccess('Updated');
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!window.confirm('Delete this stock item?')) return;
        try {
            await stockItemService.delete(item.stock_item_id);
            navigate(-1);
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to delete');
        }
    };

    const openEditForm = () => {
        setEditFormData({
            stock_item_name: item.stock_item_name || '',
            stock_item_inventory_number: item.stock_item_inventory_number || '',
            stock_item_status: item.stock_item_status || 'not_delivered_to_company',
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
            await stockItemAttributeValueService.create({
                stock_item: item.stock_item_id,
                ...attrFormData,
            });
            const attrsData = await stockItemAttributeValueService.getByStockItem(item.stock_item_id);
            setItemAttributes(Array.isArray(attrsData) ? attrsData : []);
            setShowAttrForm(false);
            setAttrFormData({ stock_item_attribute_definition: '', value_string: '', value_number: '', value_bool: false, value_date: '' });
            showSuccess('Attribute added');
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to add attribute');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAttr = async (stockItemId, defId) => {
        try {
            await stockItemAttributeValueService.delete(stockItemId, defId);
            setItemAttributes(prev => prev.filter(a => !(a.stock_item === stockItemId && a.stock_item_attribute_definition === defId)));
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
                await stockItemOrgAssignmentService.create({
                    stock_item: item.stock_item_id,
                    organizational_structure: assignFormData.organizational_structure,
                    start_datetime: assignFormData.start_datetime,
                });
            } else {
                await stockItemAssignmentService.create({ stock_item: item.stock_item_id, person: assignFormData.person, start_datetime: assignFormData.start_datetime });
            }
            const [assignmentsData, orgAssignmentsData] = await Promise.all([
                stockItemAssignmentService.getAll({ stock_item: item.stock_item_id }),
                stockItemOrgAssignmentService.getAll({ stock_item: item.stock_item_id }),
            ]);
            setAssignments([...(Array.isArray(assignmentsData) ? assignmentsData : []), ...(Array.isArray(orgAssignmentsData) ? orgAssignmentsData : [])]);
            setShowAssignForm(false);
            showSuccess(t('stockItems.assignItem'));
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to assign');
        } finally {
            setSaving(false);
        }
    };

    const handleDischarge = async (assignmentId) => {
        setSaving(true);
        try {
            await stockItemAssignmentService.discharge(assignmentId);
            const assignmentsData = await stockItemAssignmentService.getAll({ stock_item: item.stock_item_id });
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
            await stockItemService.move(item.stock_item_id, {
                location: selectedMoveLocationId,
                movement_reason_ar: movementReasonAr || undefined,
            });
            const locData = await stockItemService.getCurrentLocation(item.stock_item_id).catch(() => null);
            setCurrentLocation(locData);
            setShowMoveModal(false);
            setSelectedMoveLocationId('');
            setMovementReasonAr('');
            showSuccess(t('stockItems.move'));
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || 'Failed to move');
        } finally {
            setMoveSubmitting(false);
        }
    };

    // Split handlers
    const openSplitModal = () => {
        const numericAttrs = itemAttributes.filter(a => {
            const def = a.definition || definitionLookup.get(a.stock_item_attribute_definition);
            return def?.data_type?.toLowerCase() === 'number' && a.value_number != null;
        }).map(a => ({
            definitionId: a.stock_item_attribute_definition,
            definition: a.definition || definitionLookup.get(a.stock_item_attribute_definition),
            attr: a,
        }));
        setSplitAttributeOptions(numericAttrs);
        setSplitFormData({
            attribute_definition_id: numericAttrs.length > 0 ? numericAttrs[0].definitionId : '',
            split_value: '',
            new_item_name: '',
            new_item_inventory_number: '',
            new_item_status: 'in_stock',
            destination_location_id: '',
        });
        setShowSplitModal(true);
    };

    const handleSplitSubmit = async (e) => {
        e.preventDefault();
        setSplitSubmitting(true);
        try {
            const result = await stockItemService.split(item.stock_item_id, splitFormData);
            setShowSplitModal(false);
            showSuccess(t('stockItems.splitDone', { sourceVal: result?.source_remaining_value ?? '?', newVal: result?.new_item_value ?? '?' }));
            // Refresh data
            const [itemData, attrsData] = await Promise.all([
                stockItemService.getById(itemId),
                stockItemAttributeValueService.getByStockItem(itemId),
            ]);
            setItem(itemData);
            setItemAttributes(Array.isArray(attrsData) ? attrsData : []);
        } catch (err) {
            showError(err?.response?.data?.detail || err?.message || t('stockItems.splitError'));
        } finally {
            setSplitSubmitting(false);
        }
    };

    const suggestForDestruction = async () => {
        setSaving(true);
        try {
            await stockItemService.suggestForDestruction(item.stock_item_id);
            showSuccess(t('stockItems.suggestForDestruction'));
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

    if (error && !item) {
        return (
            <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <XCircle size={20} /><span>{error}</span>
                </div>
                <BackButton onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-4)' }} />
            </div>
        );
    }

    if (!item) return null;

    const sc = statusColor(item.stock_item_status);
    const currentLocationObj = locations.find(l => l.location_id === currentLocation?.location_id);

    return (
        <div className="page-container" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <BackButton onClick={() => {
                        const params = typeIdParam && modelIdParam ? `?typeId=${typeIdParam}&modelId=${modelIdParam}` : '';
                        navigate(`/dashboard/stock-items/instances${params}`);
                    }} />
                    <div>
                        <h1 className="page-title" style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Package size={22} style={{ color: 'var(--color-accent-primary)' }} />
                            {item.stock_item_name || t('stockItems.itemWithId', { id: item.stock_item_id })}
                        </h1>
                        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <Tag size={14} />
                            {item.type_label || `Type #${typeIdParam || ''}`} • {item.brand_name || ''} {item.model_name || `Model #${modelIdParam || ''}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <button onClick={openEditForm} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                        <Pencil size={16} /> <span>{t('common.edit')}</span>
                    </button>
                    <button onClick={() => setShowMoveModal(true)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>
                        <MapPin size={16} /> <span>{t('stockItems.move')}</span>
                    </button>
                    <button onClick={openSplitModal} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', color: '#0ea5e9' }}>
                        <Scissors size={16} /> <span>{t('stockItems.split')}</span>
                    </button>
                    {activeAssignment ? (
                        <button onClick={() => setDischargingAssignment(activeAssignment)} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}>
                            <X size={16} /> <span>{t('stockItems.discharge')}</span>
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
                            <UserPlus size={16} /> <span>{t('stockItems.assign')}</span>
                        </button>
                    )}
                    <button onClick={handleDeleteItem} className="btn btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--color-error)' }}>
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
                        <Package size={16} style={{ color: 'var(--color-accent-primary)' }} />
                        {t('stockItems.itemDetails')}
                    </div>
                    <div style={{ padding: 'var(--space-5)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.name')}</div>
                                <div style={{ fontWeight: 600 }}>{item.stock_item_name || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.status')}</div>
                                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: 'var(--font-size-sm)', backgroundColor: sc.bg, color: sc.color }}>
                                    {formatStatus(item.stock_item_status)}
                                </span>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.inventoryNo')}</div>
                                <div style={{ fontWeight: 600 }}>{item.stock_item_inventory_number || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>Serial Number</div>
                                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.stock_item_serial_number || '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.assignedTo')}</div>
                                <div style={{ fontWeight: 600 }}>{activeAssignment?.person ? getBilingualPersonName(activeAssignment.person, i18n.language) : '—'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{t('stockItems.currentLocation')}</div>
                                <div style={{ fontWeight: 600 }}>{currentLocationObj?.location_name || currentLocation?.location_name || '—'}</div>
                            </div>
                        </div>

                        {(item.stock_item_status || '').toLowerCase() === 'failed' && (
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <button type="button" onClick={suggestForDestruction} disabled={saving} className="btn btn-secondary">
                                    {saving ? t('stockItems.saving') : t('stockItems.suggestForDestruction')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Composition */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Box size={16} style={{ color: 'var(--color-accent-primary)' }} />
                        Composition
                    </div>
                    <div style={{ padding: 'var(--space-5)' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{t('stockItems.consumables')}</span>
                            </div>
                            {(item.consumable_composition || []).length === 0 ? (
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{t('stockItems.noConsumablesInUse')}</div>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
                                    {item.consumable_composition.map(c => (
                                        <li key={c.consumable_id} style={{ padding: '2px 0' }}>{c.consumable_name || `Consumable ${c.consumable_id}`}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div style={{ marginTop: 'var(--space-4)' }}>
                            <button
                                onClick={() => navigate(`/dashboard/stock-items/instances/${item.stock_item_id}/composition-history?typeId=${typeIdParam || ''}&modelId=${modelIdParam || ''}`)}
                                className="btn btn-secondary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                            >
                                <Clock size={16} />
                                {t('stockItems.compositionHistory')}
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
                        {t('stockItems.stockItemAttributes')}
                    </div>
                    <button onClick={() => setShowAttrForm(!showAttrForm)} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>
                        + {t('stockItems.addValue')}
                    </button>
                </div>
                <div style={{ padding: 'var(--space-5)' }}>
                    {showAttrForm && (
                        <form onSubmit={handleAttrSubmit} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-secondary)' }}>
                            <select name="stock_item_attribute_definition" value={attrFormData.stock_item_attribute_definition} onChange={handleAttrInputChange} required className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }}>
                                <option value="">{t('stockItems.selectAttrDefPlaceholder')}</option>
                                {attributeDefinitions.map((def) => (
                                    <option key={def.stock_item_attribute_definition_id} value={def.stock_item_attribute_definition_id}>
                                        {def.description || t('stockItems.attributeWithId', { id: def.stock_item_attribute_definition_id })}
                                    </option>
                                ))}
                            </select>
                            {(() => {
                                const selectedDef = definitionLookup.get(Number(attrFormData.stock_item_attribute_definition));
                                const dataType = selectedDef?.data_type?.toLowerCase();
                                if (dataType === 'number') return <input type="number" name="value_number" placeholder={t('stockItems.numberValue')} value={attrFormData.value_number} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                if (dataType === 'bool' || dataType === 'boolean') return <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}><input type="checkbox" name="value_bool" checked={attrFormData.value_bool} onChange={handleAttrInputChange} />{t('stockItems.true')}</label>;
                                if (dataType === 'date') return <input type="date" name="value_date" value={attrFormData.value_date} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                                return <input type="text" name="value_string" placeholder={t('stockItems.stringValue')} value={attrFormData.value_string} onChange={handleAttrInputChange} className="form-input" style={{ width: '100%', marginBottom: 'var(--space-2)', height: '44px' }} />;
                            })()}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{t('stockItems.save')}</button>
                                <button type="button" onClick={() => setShowAttrForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>{t('stockItems.cancel')}</button>
                            </div>
                        </form>
                    )}
                    {itemAttributes.length === 0 ? (
                        <div style={{ color: 'var(--color-text-secondary)' }}>{t('stockItems.noAttrValues')}</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            {itemAttributes.map((attr) => {
                                const definition = attr.definition || definitionLookup.get(attr.stock_item_attribute_definition);
                                const value = attr.value_string ?? attr.value_number ?? attr.value_bool ?? attr.value_date ?? '';
                                return (
                                    <div key={`${attr.stock_item}-${attr.stock_item_attribute_definition}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: 'var(--font-size-sm)' }}>{definition?.description || t('stockItems.attributeWithId', { id: attr.stock_item_attribute_definition })}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{value === '' ? t('stockItems.noValue') : String(value)}</div>
                                        </div>
                                        <button onClick={() => handleDeleteAttr(attr.stock_item, attr.stock_item_attribute_definition)} style={{ border: 'none', background: 'none', color: '#c33', cursor: 'pointer', fontSize: 'var(--font-size-lg)' }}>&times;</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

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
                        <div className="modal" style={{ maxWidth: '520px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.editItem')}</h3>
                                <button className="modal-close" onClick={() => setShowEditForm(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleEditSubmit} className="form">
                                    <div className="form-group">
                                        <TranslatableInput
                                            label={t('stockItems.name')}
                                            baseFieldName="stock_item_name"
                                            value={editFormData.stock_item_name}
                                            onChange={(name, value) => handleEditInputChange({ target: { name, value } })}
                                            translations={Object.fromEntries(Object.entries(formTranslations).map(([k, v]) => [k, v.stock_item_name]))}
                                            onTranslationChange={handleFormTranslationChange}
                                            placeholder={t('stockItems.itemNamePlaceholder')}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('common.status')}</label>
                                            <select name="stock_item_status" value={editFormData.stock_item_status} onChange={handleEditInputChange} className="form-input" style={{ height: '44px' }}>
                                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.inventoryNumber')}</label>
                                            <input type="text" name="stock_item_inventory_number" value={editFormData.stock_item_inventory_number} onChange={handleEditInputChange} placeholder={t('stockItems.inventoryNumber')} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: 'var(--space-3) var(--space-6)' }}>{saving ? t('stockItems.saving') : t('common.update')}</button>
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
                                <h3 className="modal-title">{t('stockItems.assignItem')}</h3>
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
                                            <UserPlus size={16} /> {t('stockItems.assignToPerson')}
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
                                            <Building2 size={16} /> {t('stockItems.orgStructure')}
                                        </button>
                                    </div>
                                    {assignTab === 'person' ? (
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.assignToPerson')}</label>
                                            <SearchableSelect
                                                value={assignFormData.person}
                                                onChange={(e) => setAssignFormData(prev => ({ ...prev, person: e.target.value }))}
                                                options={persons.map(p => ({
                                                    value: p.person_id,
                                                    label: getBilingualPersonName(p, i18n.language),
                                                    searchText: [p.first_name_en, p.first_name_ar, p.last_name_en, p.last_name_ar].filter(Boolean).join(' ')
                                                }))}
                                                placeholder={t('stockItems.selectPerson')}
                                                required
                                                disabled={saving}
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.orgStructure')}</label>
                                            <SearchableSelect
                                                value={assignFormData.organizational_structure}
                                                onChange={(e) => setAssignFormData(prev => ({ ...prev, organizational_structure: e.target.value }))}
                                                options={orgStructures.filter(s => s.is_active).map(s => ({
                                                    value: s.organizational_structure_id,
                                                    label: getBilingualStructureName(s, i18n.language),
                                                    searchText: [s.structure_name, s.structure_name_en, s.structure_name_ar, s.structure_code].filter(Boolean).join(' ')
                                                }))}
                                                placeholder={t('stockItems.selectOrgStructure')}
                                                required
                                                disabled={saving}
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.startDateAuto')}</label>
                                        <input type="datetime-local" name="start_datetime" value={assignFormData.start_datetime} onChange={(e) => setAssignFormData(prev => ({ ...prev, start_datetime: e.target.value }))} required className="form-input" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowAssignForm(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                    <button type="submit" disabled={saving} className="btn btn-primary">{saving ? t('stockItems.assigning') : t('stockItems.assign')}</button>
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
                                <h3 className="modal-title">{t('stockItems.discharge')}</h3>
                                <button className="modal-close" onClick={() => setDischargingAssignment(null)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <p>{t('stockItems.confirmDischarge')}</p>
                                <div className="form-actions">
                                    <button onClick={() => handleDischarge(dischargingAssignment.assignment_id)} disabled={saving} className="btn btn-primary">{t('stockItems.discharge')}</button>
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
                                <h3 className="modal-title">{t('stockItems.moveItemTitle')}: {item.stock_item_name || t('stockItems.itemWithId', { id: item.stock_item_id })}</h3>
                                <button className="modal-close" onClick={() => setShowMoveModal(false)} disabled={moveSubmitting}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleMoveSubmit}>
                                    <div className="form-group">
                                        <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-secondary)' }}>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>{t('stockItems.currentLocation')}</div>
                                            <div style={{ fontWeight: 600 }}>{currentLocationObj?.location_name || t('stockItems.unknown')}</div>
                                        </div>
                                        <label className="form-label">{t('stockItems.destinationLocation')}</label>
                                        <select value={selectedMoveLocationId} onChange={(e) => setSelectedMoveLocationId(e.target.value)} required disabled={moveSubmitting} className="form-input" style={{ height: '44px' }}>
                                            <option value="">{t('stockItems.selectLocation')}</option>
                                            {locations.map((r) => (
                                                <option key={r.location_id} value={r.location_id}>{r.location_name || `Location ${r.location_id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={moveSubmitting || !selectedMoveLocationId} className="btn btn-primary">{moveSubmitting ? t('stockItems.moving') : t('stockItems.move')}</button>
                                        <button type="button" onClick={() => setShowMoveModal(false)} disabled={moveSubmitting} className="btn btn-secondary">{t('common.cancel')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Split Modal */}
            {showSplitModal && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => !splitSubmitting && setShowSplitModal(false)}>
                        <div className="modal" style={{ maxWidth: '640px', width: '90vw' }} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">{t('stockItems.splitItemTitle')}: {item.stock_item_name || t('stockItems.itemWithId', { id: item.stock_item_id })}</h3>
                                <button className="modal-close" onClick={() => setShowSplitModal(false)} disabled={splitSubmitting}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={clearFeedback} />
                                <form onSubmit={handleSplitSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.numericAttribute')}</label>
                                        <select value={splitFormData.attribute_definition_id} onChange={(e) => setSplitFormData(prev => ({ ...prev, attribute_definition_id: e.target.value }))} className="form-input" style={{ height: '44px' }} required>
                                            {splitAttributeOptions.length === 0 && <option value="">{t('stockItems.noNumericAttr')}</option>}
                                            {splitAttributeOptions.map(x => (
                                                <option key={x.definitionId} value={x.definitionId}>
                                                    {x.definition?.description || t('stockItems.attributeWithId', { id: x.definitionId })} ({t('stockItems.current')}: {String(x.attr.value_number)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">{t('stockItems.splitValue')}</label>
                                        <input type="number" step="0.000001" min="0.000001" value={splitFormData.split_value} onChange={(e) => setSplitFormData(prev => ({ ...prev, split_value: e.target.value }))} className="form-input" style={{ height: '44px' }} required />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newItemName')}</label>
                                            <input type="text" value={splitFormData.new_item_name} onChange={(e) => setSplitFormData(prev => ({ ...prev, new_item_name: e.target.value }))} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newInventoryNumber')}</label>
                                            <input type="text" value={splitFormData.new_item_inventory_number} onChange={(e) => setSplitFormData(prev => ({ ...prev, new_item_inventory_number: e.target.value }))} className="form-input" style={{ height: '44px' }} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.newItemStatus')}</label>
                                            <select value={splitFormData.new_item_status} onChange={(e) => setSplitFormData(prev => ({ ...prev, new_item_status: e.target.value }))} className="form-input" style={{ height: '44px' }}>
                                                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">{t('stockItems.destinationLocation')}</label>
                                            <select value={splitFormData.destination_location_id} onChange={(e) => setSplitFormData(prev => ({ ...prev, destination_location_id: e.target.value }))} className="form-input" style={{ height: '44px' }}>
                                                <option value="">{t('stockItems.sameAsSourceLocation')}</option>
                                                {locations.map(r => (
                                                    <option key={r.location_id} value={r.location_id}>{r.location_name || `Location ${r.location_id}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" disabled={splitSubmitting} className="btn btn-primary">{splitSubmitting ? t('stockItems.splitting') : t('stockItems.split')}</button>
                                        <button type="button" onClick={() => setShowSplitModal(false)} disabled={splitSubmitting} className="btn btn-secondary">{t('common.cancel')}</button>
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

export default StockItemInstanceDetailPage;
