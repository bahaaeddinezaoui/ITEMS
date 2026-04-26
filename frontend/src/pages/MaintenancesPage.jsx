import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SkeletonListRows } from '../components/SkeletonCard';
import { assetService, assetTypeService, assetBrandService, assetModelService, maintenanceService, personService, locationService, maintenanceTypicalStepService, externalMaintenanceTypicalStepService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';
import TranslatableInput from '../components/TranslatableInput';
import {
    Clock,
    User,
    Coins,
    Wrench,
    Search,
    ChevronDown,
    ChevronUp,
    FileText,
    UserPlus,
    Trash2,
    Plus,
    ArrowUpDown,
    Calendar,
    AlertTriangle,
    Tag,
    Monitor,
    Hash,
    Sticker,
    ListChecks,
    DollarSign,
    Settings2,
    Layers,
    Check,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';
import Stepper, { Step } from '../components/Stepper';

const CREATE_STEPS = [
    { key: 'asset', icon: Monitor },
    { key: 'assignment', icon: UserPlus },
    { key: 'details', icon: FileText },
];

const MaintenancesPage = () => {
    const { t, i18n } = useTranslation();
    const { user, isSuperuser } = useAuth();
    const navigate = useNavigate();
    const [maintenances, setMaintenances] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [assets, setAssets] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(0);
    const [stepperDirection, setStepperDirection] = useState(0);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [createDescription, setCreateDescription] = useState('');

    const [assetCurrentLocation, setAssetCurrentLocation] = useState(null);
    const [maintenanceLocations, setMaintenanceLocations] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [destinationMode, setDestinationMode] = useState('maintenance_room'); // 'maintenance_room' | 'asset_current' | 'other'
    const [selectedMaintenanceLocation, setSelectedMaintenanceLocation] = useState('');
    const [loadingAssetLocation, setLoadingAssetLocation] = useState(false);

    const [sortKey, setSortKey] = useState('maintenance_id');
    const [sortDirection, setSortDirection] = useState('desc');

    const [statusEditingId, setStatusEditingId] = useState(null);
    const [statusSaving, setStatusSaving] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterTechnician, setFilterTechnician] = useState('');
    const [filterStartFrom, setFilterStartFrom] = useState('');
    const [filterStartTo, setFilterStartTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Asset filter states for Create Maintenance modal
    const [assetTypes, setAssetTypes] = useState([]);
    const [assetBrands, setAssetBrands] = useState([]);
    const [assetModels, setAssetModels] = useState([]);
    const [filterAssetType, setFilterAssetType] = useState('');
    const [filterAssetBrand, setFilterAssetBrand] = useState('');
    const [filterAssetModel, setFilterAssetModel] = useState('');
    const [filterAssetStatus, setFilterAssetStatus] = useState('');

    const [showTypicalStepsModal, setShowTypicalStepsModal] = useState(false);
    const [typicalStepsTab, setTypicalStepsTab] = useState('internal');
    const [typicalSteps, setTypicalSteps] = useState([]);
    const [externalTypicalSteps, setExternalTypicalSteps] = useState([]);
    const [loadingTypicalSteps, setLoadingTypicalSteps] = useState(false);

    const [typicalStepForm, setTypicalStepForm] = useState({
        description: '',
        estimated_cost: '',
        maintenance_type: '',
        operation_type: '',
        maintenance_domain: '',
    });
    const [typicalStepTranslations, setTypicalStepTranslations] = useState({});
    const [externalTypicalStepForm, setExternalTypicalStepForm] = useState({
        description: '',
        estimated_cost: '',
        maintenance_type: '',
        operation_type: '',
        maintenance_domain: '',
    });
    const [externalTypicalStepTranslations, setExternalTypicalStepTranslations] = useState({});
    const [typicalStepFieldChoices, setTypicalStepFieldChoices] = useState({ maintenance_type: [], operation_type: [], maintenance_domain: [] });

    const lastReloadTsRef = useRef(0);


    const isChief = useMemo(() => {
        if (isSuperuser) return true;
        return user?.roles?.some(r => r.role_code === 'maintenance_chief' || r.role_code === 'exploitation_chief' || r.role_code === 'it_bureau_chief') || false;
    }, [isSuperuser, user]);

    const isTechnician = useMemo(() => {
        return user?.roles?.some(r => r.role_code === 'it_maintenance_technician' || r.role_code === 'network_maintenance_technician') || false;
    }, [user]);

    const loadMaintenances = async () => {
        setLoading(true);
        try {
            const data = await maintenanceService.getAll();
            const list = Array.isArray(data) ? data : (data?.results || []);
            setMaintenances(list);
        } catch (err) {
            setError(t('maintenances.fetchError') + ': ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const reloadMaintenancesIfStale = async () => {
        const now = Date.now();
        if (now - lastReloadTsRef.current < 1500) return;
        lastReloadTsRef.current = now;
        await loadMaintenances();
    };

    useEffect(() => {
        loadMaintenances();
        if (isChief) {
            loadTechnicians();
            loadAssets();
        }
    }, [isChief]);

    useEffect(() => {
        const onFocus = () => {
            reloadMaintenancesIfStale();
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                reloadMaintenancesIfStale();
            }
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [isChief]);

    const loadTypicalSteps = async () => {
        try {
            setLoadingTypicalSteps(true);
            const [internalData, externalData] = await Promise.all([
                maintenanceTypicalStepService.getAll(),
                externalMaintenanceTypicalStepService.getAll(),
            ]);
            setTypicalSteps(Array.isArray(internalData) ? internalData : (internalData?.results || []));
            setExternalTypicalSteps(Array.isArray(externalData) ? externalData : (externalData?.results || []));
        } catch {
            setTypicalSteps([]);
            setExternalTypicalSteps([]);
        } finally {
            setLoadingTypicalSteps(false);
        }
    };

    const openTypicalStepsModal = async () => {
        setError('');
        setTypicalStepsTab('internal');
        setTypicalStepForm({ description: '', estimated_cost: '', maintenance_type: '', operation_type: '', maintenance_domain: '' });
        setTypicalStepTranslations({});
        setExternalTypicalStepForm({ description: '', estimated_cost: '', maintenance_type: '', operation_type: '', maintenance_domain: '' });
        setExternalTypicalStepTranslations({});
        setShowTypicalStepsModal(true);
        loadTypicalSteps();
        try {
            const choices = await maintenanceTypicalStepService.getFieldChoices();
            setTypicalStepFieldChoices(choices);
        } catch {
            setTypicalStepFieldChoices({ maintenance_type: [], operation_type: [], maintenance_domain: [] });
        }
    };

    const handleTypicalStepTranslationChange = (langCode, value) => {
        setTypicalStepTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    };

    const handleExternalTypicalStepTranslationChange = (langCode, value) => {
        setExternalTypicalStepTranslations((prev) => ({ ...prev, [langCode]: { ...(prev[langCode] || {}), ...value } }));
    };

    const handleTypicalStepCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const translationsPayload = { ...typicalStepTranslations };
            translationsPayload.en = { ...(translationsPayload.en || {}) };
            if (typicalStepForm.description) {
                translationsPayload.en.description = typicalStepForm.description;
            }
            if (typicalStepForm.maintenance_type) {
                translationsPayload.en.maintenance_type = typicalStepForm.maintenance_type;
            }
            if (typicalStepForm.operation_type) {
                translationsPayload.en.operation_type = typicalStepForm.operation_type;
            }
            if (typicalStepForm.maintenance_domain) {
                translationsPayload.en.maintenance_domain = typicalStepForm.maintenance_domain;
            }
            // Remove empty en entry if no fields were set
            if (Object.keys(translationsPayload.en).length === 0) {
                delete translationsPayload.en;
            }
            const payload = {
                description: typicalStepForm.description || null,
                maintenance_type: typicalStepForm.maintenance_type || null,
                operation_type: typicalStepForm.operation_type || null,
                maintenance_domain: typicalStepForm.maintenance_domain || null,
                estimated_cost: typicalStepForm.estimated_cost === '' ? null : Number(typicalStepForm.estimated_cost),
            };
            if (Object.keys(translationsPayload).length > 0) {
                payload.translations = translationsPayload;
            }
            await maintenanceTypicalStepService.create(payload);
            setTypicalStepForm({ description: '', estimated_cost: '', maintenance_type: '', operation_type: '', maintenance_domain: '' });
            setTypicalStepTranslations({});
            loadTypicalSteps();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.detail || t('common.saveFailed', 'Failed to save');
            setError(typeof msg === 'string' ? msg : t('common.saveFailed', 'Failed to save'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleExternalTypicalStepCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const translationsPayload = { ...externalTypicalStepTranslations };
            translationsPayload.en = { ...(translationsPayload.en || {}) };
            if (externalTypicalStepForm.description) {
                translationsPayload.en.description = externalTypicalStepForm.description;
            }
            if (externalTypicalStepForm.maintenance_type) {
                translationsPayload.en.maintenance_type = externalTypicalStepForm.maintenance_type;
            }
            if (externalTypicalStepForm.operation_type) {
                translationsPayload.en.operation_type = externalTypicalStepForm.operation_type;
            }
            if (externalTypicalStepForm.maintenance_domain) {
                translationsPayload.en.maintenance_domain = externalTypicalStepForm.maintenance_domain;
            }
            // Remove empty en entry if no fields were set
            if (Object.keys(translationsPayload.en).length === 0) {
                delete translationsPayload.en;
            }
            const payload = {
                description: externalTypicalStepForm.description || null,
                maintenance_type: externalTypicalStepForm.maintenance_type || null,
                operation_type: externalTypicalStepForm.operation_type || null,
                maintenance_domain: externalTypicalStepForm.maintenance_domain || null,
                estimated_cost: externalTypicalStepForm.estimated_cost === '' ? null : Number(externalTypicalStepForm.estimated_cost),
            };
            if (Object.keys(translationsPayload).length > 0) {
                payload.translations = translationsPayload;
            }
            await externalMaintenanceTypicalStepService.create(payload);
            setExternalTypicalStepForm({ description: '', estimated_cost: '', maintenance_type: '', operation_type: '', maintenance_domain: '' });
            setExternalTypicalStepTranslations({});
            loadTypicalSteps();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.detail || t('common.saveFailed', 'Failed to save');
            setError(typeof msg === 'string' ? msg : t('common.saveFailed', 'Failed to save'));
        } finally {
            setSubmitting(false);
        }
    };

    const loadTechnicians = async () => {
        try {
            // Fetch both IT technicians and network maintenance technicians
            const [itTechs, networkTechs] = await Promise.all([
                personService.getAll({ role: 'it_maintenance_technician' }),
                personService.getAll({ role: 'network_maintenance_technician' })
            ]);
            
            // Combine and remove duplicates based on person_id
            const combined = [...(Array.isArray(itTechs) ? itTechs : [])];
            if (Array.isArray(networkTechs)) {
                networkTechs.forEach(tech => {
                    if (!combined.some(p => p.person_id === tech.person_id)) {
                        combined.push(tech);
                    }
                });
            }
            setTechnicians(combined);
        } catch (err) {
            console.error('Failed to load technicians', err);
        }
    };

    const loadAssets = async () => {
        try {
            const data = await assetService.getAll({ page_size: 1000 });
            const list = Array.isArray(data) ? data : (data?.results || []);
            setAssets(list);
        } catch (err) {
            console.error('Failed to load assets', err);
            setAssets([]);
        }
    };

    const loadAssetFilters = async () => {
        try {
            const [types, brands, models] = await Promise.all([
                assetTypeService.getAll(),
                assetBrandService.getAll(),
                assetModelService.getAll({ page_size: 1000 }),
            ]);
            setAssetTypes(Array.isArray(types) ? types : (types?.results || []));
            setAssetBrands(Array.isArray(brands) ? brands : (brands?.results || []));
            setAssetModels(Array.isArray(models) ? models : (models?.results || []));
        } catch (err) {
            console.error('Failed to load asset filters', err);
        }
    };

    // Build a lookup from asset_model_id -> { asset_type_id, asset_brand_id }
    const assetModelLookup = useMemo(() => {
        const map = {};
        assetModels.forEach((m) => {
            map[m.asset_model_id] = {
                asset_type_id: m.asset_type,
                asset_brand_id: m.asset_brand,
            };
        });
        return map;
    }, [assetModels]);

    // Unique asset statuses extracted from loaded assets
    const assetStatuses = useMemo(() => {
        const set = new Set();
        assets.forEach((a) => {
            if (a.asset_status) set.add(a.asset_status);
        });
        return [...set].sort();
    }, [assets]);

    // Filtered assets based on selected filters
    const filteredAssets = useMemo(() => {
        const result = assets.filter((a) => {
            if (filterAssetType) {
                const modelInfo = assetModelLookup[a.asset_model];
                if (!modelInfo || String(modelInfo.asset_type_id) !== String(filterAssetType)) return false;
            }
            if (filterAssetBrand) {
                const modelInfo = assetModelLookup[a.asset_model];
                if (!modelInfo || String(modelInfo.asset_brand_id) !== String(filterAssetBrand)) return false;
            }
            if (filterAssetModel) {
                if (String(a.asset_model) !== String(filterAssetModel)) return false;
            }
            if (filterAssetStatus) {
                if (String(a.asset_status) !== String(filterAssetStatus)) return false;
            }
            return true;
        });
        return result;
    }, [assets, filterAssetType, filterAssetBrand, filterAssetModel, filterAssetStatus, assetModelLookup]);

    // Filter asset models by selected type/brand for the model dropdown
    const filteredAssetModels = useMemo(() => {
        return assetModels.filter((m) => {
            if (filterAssetType && String(m.asset_type) !== String(filterAssetType)) return false;
            if (filterAssetBrand && String(m.asset_brand) !== String(filterAssetBrand)) return false;
            return true;
        });
    }, [assetModels, filterAssetType, filterAssetBrand]);

    // Filter asset brands by selected type (brands that have models with that type)
    const filteredAssetBrands = useMemo(() => {
        if (!filterAssetType) return assetBrands;
        const brandIdsWithType = new Set(
            assetModels
                .filter((m) => String(m.asset_type) === String(filterAssetType))
                .map((m) => String(m.asset_brand))
        );
        return assetBrands.filter((b) => brandIdsWithType.has(String(b.asset_brand_id)));
    }, [assetBrands, assetModels, filterAssetType]);

    const openCreateMaintenance = () => {
        setError('');
        setSelectedAsset('');
        setSelectedTechnician('');
        setCreateDescription('');
        setAssetCurrentLocation(null);
        setMaintenanceLocations([]);
        setAllLocations([]);
        setSelectedMaintenanceLocation('');
        setFilterAssetType('');
        setFilterAssetBrand('');
        setFilterAssetModel('');
        setFilterAssetStatus('');
        setCreateStep(0);
        setStepperDirection(0);
        try {
            const saved = localStorage.getItem('maintenanceCreateDestinationMode');
            if (saved && ['maintenance_room', 'asset_current', 'other'].includes(saved)) {
                setDestinationMode(saved);
            } else {
                setDestinationMode('maintenance_room');
            }
        } catch {
            setDestinationMode('maintenance_room');
        }
        loadAssetFilters();
        setShowCreateModal(true);
    };

    const isMaintenanceLocation = (location) => {
        if (!location) return false;
        const code = (location?.location_type_code || '').toUpperCase();
        const label = (location?.location_type_label || '').toLowerCase();
        const typeId = location?.location_type;
        
        // Match by type ID (2 = Maintenance Room in project_iguana.sql)
        if (typeId === 2 || typeId === '2') return true;
        
        // Match by code
        if (code && ['MR', 'MAINTENANCE', 'MAINT'].includes(code)) return true;
        
        // Match by label
        return label.includes('maintenance');
    };

    const loadMaintenanceLocations = async () => {
        try {
            const data = await locationService.getAll({ page_size: 1000 });
            const locations = Array.isArray(data) ? data : (data?.results || []);
            const filtered = locations.filter(isMaintenanceLocation);
            setMaintenanceLocations(filtered);
        } catch (err) {
            console.error('Failed to fetch maintenance locations:', err);
            setMaintenanceLocations([]);
        }
    };

    const loadAllLocations = async () => {
        try {
            const data = await locationService.getAll({ page_size: 1000 });
            const locations = Array.isArray(data) ? data : (data?.results || []);
            const filtered = locations.filter((loc) => {
                const label = (loc?.location_type_label || '').toString().toLowerCase();
                return label !== 'external maintenance center';
            });
            setAllLocations(filtered);
        } catch (err) {
            console.error('Failed to fetch locations:', err);
            setAllLocations([]);
        }
    };

    const validateCreateStep = (step) => {
        if (step === 0) {
            if (!selectedAsset) {
                setError(t('maintenances.selectAssetError'));
                return false;
            }
        }
        if (step === 1) {
            if (!selectedTechnician) {
                setError(t('maintenances.selectTechnicianError'));
                return false;
            }
            if (destinationMode === 'maintenance_room' && assetCurrentLocation && !isMaintenanceLocation(assetCurrentLocation) && !selectedMaintenanceLocation) {
                setError(t('maintenances.selectMaintenanceLocationError'));
                return false;
            }
            if (destinationMode === 'other' && !selectedMaintenanceLocation) {
                setError(t('maintenances.selectDestinationError'));
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleCreateNext = () => {
        if (validateCreateStep(createStep)) {
            setStepperDirection(1);
            setCreateStep((prev) => Math.min(prev + 1, CREATE_STEPS.length - 1));
        }
    };

    const handleCreateBack = () => {
        setError('');
        setStepperDirection(-1);
        setCreateStep((prev) => Math.max(prev - 1, 0));
    };

    const handleCreateSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateCreateStep(0) || !validateCreateStep(1)) return;

        setSubmitting(true);
        try {
            const payload = {
                asset_id: selectedAsset,
                technician_person_id: selectedTechnician,
                description: createDescription,
            };
            const mode = destinationMode;
            if (mode === 'maintenance_room') {
                if (assetCurrentLocation && !isMaintenanceLocation(assetCurrentLocation) && selectedMaintenanceLocation) {
                    payload.destination_location_id = Number(selectedMaintenanceLocation);
                }
            } else if (mode === 'other' && selectedMaintenanceLocation) {
                payload.destination_location_id = Number(selectedMaintenanceLocation);
            }
            await maintenanceService.createDirect(payload);
            setShowCreateModal(false);
            loadMaintenances();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || t('maintenances.createFailed');
            setError(typeof msg === 'string' ? msg : t('maintenances.createFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignClick = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setSelectedTechnician(maintenance.performed_by_person || '');
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMaintenance) return;

        setSubmitting(true);
        try {
            await maintenanceService.update(selectedMaintenance.maintenance_id, {
                ...selectedMaintenance,
                performed_by_person: selectedTechnician || null
            });
            setShowAssignModal(false);
            loadMaintenances();
        } catch (err) {
            setError(t('maintenances.assignFailed'));
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelMaintenance = async (maintenanceId) => {
        if (!window.confirm(t('maintenances.confirmCancel'))) {
            return;
        }

        try {
            setLoading(true);
            const updated = await maintenanceService.patch(maintenanceId, { maintenance_status: 'cancelled' });
            setMaintenances((prev) =>
                prev.map((m) => (m.maintenance_id === maintenanceId ? { ...m, ...updated } : m))
            );
            await reloadMaintenancesIfStale();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || t('maintenances.cancelFailed');
            setError(typeof msg === 'string' ? msg : t('maintenances.cancelFailed'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const locale = i18n.language === 'ar' ? 'ar-DZ' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const translateMaintenanceStatus = (status) => {
        if (!status) return '';
        const s = status.toLowerCase().trim();
        const map = {
            'pending': 'maintenances.statusPending',
            'started': 'maintenances.statusStarted',
            'in_progress': 'maintenances.statusInProgress',
            'in progress': 'maintenances.statusInProgress',
            'completed': 'maintenances.statusCompleted',
            'failed': 'maintenances.statusFailed',
            'cancelled': 'maintenances.statusCancelled',
            'pending (waiting for stock item)': 'maintenances.statusWaitingStock',
            'pending (waiting for consumable)': 'maintenances.statusWaitingConsumable',
        };
        const key = map[s];
        if (key) return t(key);
        // Fallback: try partial match
        if (s.includes('progress')) return t('maintenances.statusInProgress');
        if (s.includes('pending') || s.includes('wait')) return t('maintenances.statusPending');
        if (s.includes('fail')) return t('maintenances.statusFailed');
        if (s.includes('cancel')) return t('maintenances.statusCancelled');
        if (s.includes('complet')) return t('maintenances.statusCompleted');
        return status;
    };

    const translateAssetStatus = (status) => {
        if (!status) return '';
        const s = status.toLowerCase().trim();
        const map = {
            'in_stock': 'maintenances.assetStatusInStock',
            'not_delivered_to_company': 'maintenances.assetStatusNotDelivered',
            'in_use': 'maintenances.assetStatusInUse',
            'reserved': 'maintenances.assetStatusReserved',
            'failed': 'maintenances.assetStatusFailed',
            'lost': 'maintenances.assetStatusLost',
            'stolen': 'maintenances.assetStatusStolen',
            'irrecoverably_damaged': 'maintenances.assetStatusIrrecoverablyDamaged',
            'destroyed': 'maintenances.assetStatusDestroyed',
        };
        const key = map[s];
        return key ? t(key) : status;
    };

    const getLocalizedField = (obj, fieldName) => {
        const lang = i18n.language;
        if (lang === 'ar') {
            return obj?.[fieldName + '_ar'] || obj?.[fieldName] || '';
        }
        return obj?.[fieldName + '_en'] || obj?.[fieldName] || '';
    };

    const getStatusColor = (status) => {
        if (!status) return 'var(--color-text-secondary)';
        const s = status.toLowerCase();
        if (s.includes('done') || s === 'completed') return 'var(--color-success)';
        if (s.includes('fail') || s.includes('cancel')) return 'var(--color-error)';
        if (s.includes('progress') || s.includes('start')) return 'var(--color-info)';
        if (s.includes('pending') || s.includes('wait')) return 'var(--color-warning)';
        return 'var(--color-text-secondary)';
    };

    const getAssetLabel = (maintenance) => {
        return (
            maintenance?.asset_name ||
            maintenance?.stock_item_name ||
            maintenance?.consumable_name ||
            (maintenance?.asset
                ? t('maintenances.assetLabel', { id: maintenance.asset })
                : maintenance?.stock_item
                    ? t('maintenances.stockItemLabel', { id: maintenance.stock_item })
                    : maintenance?.consumable
                        ? t('maintenances.consumableLabel', { id: maintenance.consumable })
                        : t('maintenances.unknown'))
        );
    };

    const maintenanceStatusChoices = useMemo(() => [
        'pending',
        'started',
        'in_progress',
        'completed',
        'failed',
        'cancelled',
    ], []);

    const statusOptions = useMemo(() => {
        const set = new Set();
        (Array.isArray(maintenances) ? maintenances : []).forEach((m) => {
            if (m?.maintenance_status) set.add(String(m.maintenance_status));
        });
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [maintenances]);

    const canUpdateMaintenanceStatus = (maintenance) => {
        if (isChief || isSuperuser) return true;
        const userPersonId = user?.person?.person_id;
        if (!userPersonId) return false;
        return Number(userPersonId) === Number(maintenance?.performed_by_person);
    };

    const handleStatusChange = async (maintenanceId, newStatus) => {
        setStatusEditingId(null);
        if (!newStatus) return;
        setStatusSaving(true);
        try {
            const updated = await maintenanceService.patch(maintenanceId, { maintenance_status: newStatus });
            setMaintenances((prev) =>
                prev.map((m) => (m.maintenance_id === maintenanceId ? { ...m, ...updated } : m))
            );
            await reloadMaintenancesIfStale();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.maintenance_status?.[0] || t('common.saveFailed', 'Failed to save');
            setError(typeof msg === 'string' ? msg : t('common.saveFailed', 'Failed to save'));
        } finally {
            setStatusSaving(false);
        }
    };

    const technicianOptions = useMemo(() => {
        const set = new Set();
        (Array.isArray(maintenances) ? maintenances : []).forEach((m) => {
            if (m?.performed_by_person_name) set.add(String(m.performed_by_person_name));
        });
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [maintenances]);

    const filteredMaintenances = useMemo(() => {
        const list = Array.isArray(maintenances) ? maintenances : [];
        const q = (searchQuery || '').trim().toLowerCase();
        const fromTs = filterStartFrom ? new Date(filterStartFrom + 'T00:00:00').getTime() : null;
        const toTs = filterStartTo ? new Date(filterStartTo + 'T23:59:59').getTime() : null;

        return list.filter((m) => {
            if (filterStatus) {
                if (String(m?.maintenance_status || '') !== String(filterStatus)) return false;
            }
            if (filterTechnician) {
                if (String(m?.performed_by_person_name || '') !== String(filterTechnician)) return false;
            }

            if (fromTs != null || toTs != null) {
                const startTs = m?.start_datetime ? new Date(m.start_datetime).getTime() : null;
                if (!Number.isFinite(startTs)) return false;
                if (fromTs != null && startTs < fromTs) return false;
                if (toTs != null && startTs > toTs) return false;
            }

            if (q) {
                const haystack = [
                    m?.maintenance_id != null ? `#${m.maintenance_id}` : null,
                    getAssetLabel(m),
                    m?.description,
                    m?.maintenance_status,
                    m?.performed_by_person_name,
                    m?.asset_serial_number,
                    m?.asset_inventory_number,
                    m?.asset_service_tag,
                    getLocalizedField(m, 'asset_brand_name'),
                    m?.asset_model_name,
                    getLocalizedField(m, 'asset_type_label'),
                ].filter(Boolean).join(' ').toLowerCase();

                if (!haystack.includes(q)) return false;
            }

            return true;
        });
    }, [maintenances, searchQuery, filterStatus, filterTechnician, filterStartFrom, filterStartTo, getLocalizedField]);

    const getSortValue = (maintenance, key) => {
        switch (key) {
            case 'maintenance_id':
                return Number(maintenance?.maintenance_id ?? 0);
            case 'asset':
                return (getAssetLabel(maintenance) || '').toString().toLowerCase();
            case 'description':
                return (maintenance?.description || '').toString().toLowerCase();
            case 'maintenance_status':
                return (maintenance?.maintenance_status || '').toString().toLowerCase();
            case 'start_datetime': {
                const dt = maintenance?.start_datetime ? new Date(maintenance.start_datetime).getTime() : null;
                return Number.isFinite(dt) ? dt : null;
            }
            case 'end_datetime': {
                const dt = maintenance?.end_datetime ? new Date(maintenance.end_datetime).getTime() : null;
                return Number.isFinite(dt) ? dt : null;
            }
            case 'performed_by_person_name':
                return (maintenance?.performed_by_person_name || '').toString().toLowerCase();
            default:
                return '';
        }
    };

    const sortedMaintenances = useMemo(() => {
        const list = Array.isArray(filteredMaintenances) ? filteredMaintenances : [];
        const dir = sortDirection === 'asc' ? 1 : -1;

        return [...list].sort((a, b) => {
            const av = getSortValue(a, sortKey);
            const bv = getSortValue(b, sortKey);

            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            if (typeof av === 'number' && typeof bv === 'number') {
                if (av === bv) return 0;
                return av > bv ? dir : -dir;
            }

            const as = String(av);
            const bs = String(bv);
            const cmp = as.localeCompare(bs);
            return cmp === 0 ? 0 : cmp * dir;
        });
    }, [filteredMaintenances, sortDirection, sortKey]);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}><Wrench size={22} style={{ color: 'var(--color-accent-primary)' }} />{t('nav.maintenances')}</h1>
                <p className="page-subtitle">{t('maintenances.subtitle')}</p>
            </div>

            <div className="card" style={{ overflow: 'visible' }}>
                <div className="card-header" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 220 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Wrench size={16} style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <h2 className="card-title" style={{ margin: 0 }}>
                                    {isChief ? t('maintenances.allMaintenances') : t('maintenances.myMaintenances')}
                                </h2>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {isChief && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={openCreateMaintenance}
                                        style={{ width: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        <Plus size={14} />
                                        {t('maintenances.createMaintenance')}
                                    </button>
                                )}

                                {isSuperuser && (
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={openTypicalStepsModal}
                                        style={{ width: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    >
                                        <Plus size={14} />
                                        {t('maintenances.addTypicalSteps', 'Typical steps')}
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                    {createPortal(
                        <div style={{ position: 'fixed', bottom: '2.5rem', right: '3rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            {showFilters && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'var(--glass-backdrop)',
                                    WebkitBackdropFilter: 'var(--glass-backdrop)',
                                    boxShadow: 'var(--glass-shadow)',
                                    maxWidth: 'calc(100vw - 3rem)',
                                    minWidth: 240,
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('common.search', 'Search')}
                                        </span>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '0.4rem 0.65rem',
                                            minHeight: 38,
                                        }}>
                                            <Search size={14} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={t('common.search', 'Search')}
                                                style={{
                                                    border: 'none',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    fontSize: 'var(--font-size-sm)',
                                                    width: '100%',
                                                    minWidth: 0,
                                                    color: 'var(--color-text-primary)',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('common.status', 'Status')}
                                        </span>
                                        <select
                                            className="form-input"
                                            style={{ padding: '0.45rem 0.6rem', fontSize: 'var(--font-size-sm)', minHeight: 38 }}
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            title={t('common.status', 'Status')}
                                        >
                                            <option value="">{t('common.all', 'All')}</option>
                                            {statusOptions.map((s) => (
                                                <option key={s} value={s}>{translateMaintenanceStatus(s)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('maintenances.technician', 'Technician')}
                                        </span>
                                        <select
                                            className="form-input"
                                            style={{ padding: '0.45rem 0.6rem', fontSize: 'var(--font-size-sm)', minHeight: 38 }}
                                            value={filterTechnician}
                                            onChange={(e) => setFilterTechnician(e.target.value)}
                                            title={t('maintenances.technician', 'Technician')}
                                        >
                                            <option value="">{t('common.all', 'All')}</option>
                                            {technicianOptions.map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('maintenances.startDate', 'Start date')} ({t('common.from', 'From')})
                                        </span>
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ padding: '0.45rem 0.6rem', fontSize: 'var(--font-size-sm)', minHeight: 38 }}
                                            value={filterStartFrom}
                                            onChange={(e) => setFilterStartFrom(e.target.value)}
                                            title={`${t('maintenances.startDate', 'Start date')} (${t('common.from', 'From')})`}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('maintenances.startDate', 'Start date')} ({t('common.to', 'To')})
                                        </span>
                                        <input
                                            type="date"
                                            className="form-input"
                                            style={{ padding: '0.45rem 0.6rem', fontSize: 'var(--font-size-sm)', minHeight: 38 }}
                                            value={filterStartTo}
                                            onChange={(e) => setFilterStartTo(e.target.value)}
                                            title={`${t('maintenances.startDate', 'Start date')} (${t('common.to', 'To')})`}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                            {t('common.sort', 'Sort')}
                                        </span>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            padding: '0.35rem 0.6rem',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-secondary)',
                                            fontWeight: 500,
                                            minHeight: 38,
                                        }}>
                                            <ArrowUpDown size={12} />
                                            <select
                                                style={{ border: 'none', background: 'transparent', fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit', cursor: 'pointer', outline: 'none', padding: 0 }}
                                                value={sortKey}
                                                onChange={(e) => { setSortKey(e.target.value); setSortDirection('desc'); }}
                                            >
                                                <option value="start_datetime">{t('maintenances.startDate')}</option>
                                                <option value="end_datetime">{t('maintenances.endDate')}</option>
                                                <option value="maintenance_id">{t('common.id', 'ID')}</option>
                                                <option value="asset">{t('assets.asset')}</option>
                                                <option value="description">{t('common.description')}</option>
                                                <option value="maintenance_status">{t('common.status')}</option>
                                                <option value="performed_by_person_name">{t('maintenances.technician')}</option>
                                            </select>
                                            <button
                                                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                                title={sortDirection === 'asc' ? t('maintenances.oldestFirst') : t('maintenances.newestFirst')}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: 0 }}
                                            >
                                                {sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    {(searchQuery || filterStatus || filterTechnician || filterStartFrom || filterStartTo) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterStatus('');
                                                setFilterTechnician('');
                                                setFilterStartFrom('');
                                                setFilterStartTo('');
                                            }}
                                            style={{ whiteSpace: 'nowrap', padding: '0.35rem 0.75rem', fontSize: 'var(--font-size-xs)', fontWeight: 500, minHeight: 38 }}
                                            className="btn btn-sm btn-secondary"
                                        >
                                            {t('common.clear', 'Clear')}
                                        </button>
                                    )}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowFilters(v => !v)}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: showFilters ? 'var(--color-accent-primary)' : 'var(--glass-bg)',
                                    color: showFilters ? '#fff' : 'var(--color-text-primary)',
                                    backdropFilter: showFilters ? 'none' : 'var(--glass-backdrop)',
                                    WebkitBackdropFilter: showFilters ? 'none' : 'var(--glass-backdrop)',
                                    boxShadow: 'var(--glass-shadow)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                }}
                                title={t('common.filters', 'Filters')}
                            >
                                <Settings2 size={20} />
                                {(searchQuery || filterStatus || filterTechnician || filterStartFrom || filterStartTo) && !showFilters && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'var(--color-error)',
                                        border: '2px solid var(--color-bg-secondary)',
                                    }} />
                                )}
                            </button>
                        </div>,
                        document.body
                    )}

                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: 'var(--space-12)' }}>
                            <SkeletonListRows count={8} />
                        </div>
                    ) : error ? (
                        <div className="empty-state">
                            <p className="empty-state-title" style={{ color: 'var(--color-error)' }}>{error}</p>
                        </div>
                    ) : maintenances.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('maintenances.noMaintenances')}</h3>
                        </div>
                    ) : sortedMaintenances.length === 0 ? (
                        <div className="empty-state">
                            <h3 className="empty-state-title">{t('common.noResults', 'No results')}</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem' }}>
                            {sortedMaintenances.map((maintenance, idx) => {
                                const statusColor = getStatusColor(maintenance.maintenance_status);
                                const isActive = ['in_progress', 'started', 'pending', 'waiting'].some(s => (maintenance.maintenance_status || '').toLowerCase().includes(s));
                                return (
                                    <div
                                        key={maintenance.maintenance_id}
                                        onClick={() => navigate(`/dashboard/maintenances/${maintenance.maintenance_id}/steps`)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'stretch',
                                            gap: '1rem',
                                            padding: '1rem 1.25rem',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease, box-shadow 0.15s ease',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--glass-border)',
                                            borderInlineStart: `4px solid ${statusColor}`,
                                            background: 'var(--glass-bg)',
                                            backdropFilter: 'var(--glass-backdrop)',
                                            WebkitBackdropFilter: 'var(--glass-backdrop)',
                                            boxShadow: 'var(--glass-shadow)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-hover-bg)'; e.currentTarget.style.borderColor = 'var(--glass-hover-border)'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}
                                    >
                                        {/* Status indicator column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.25rem', minWidth: 44, gap: '0.35rem' }}>
                                            <div style={{
                                                width: 12, height: 12, borderRadius: '50%',
                                                background: statusColor,
                                                boxShadow: isActive ? `0 0 0 3px ${statusColor}33` : 'none',
                                                flexShrink: 0,
                                            }} />
                                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                                #{maintenance.maintenance_id}
                                            </span>
                                        </div>

                                        {/* Main content */}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {/* Row 1: Asset name + Status badge + Description */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                                                    {getAssetLabel(maintenance)}
                                                </span>
                                                {statusEditingId === maintenance.maintenance_id ? (
                                                        <select
                                                            autoFocus
                                                            value={maintenance.maintenance_status || ''}
                                                            onChange={(e) => handleStatusChange(maintenance.maintenance_id, e.target.value)}
                                                            onBlur={() => setStatusEditingId(null)}
                                                            disabled={statusSaving}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                fontSize: 'var(--font-size-xs)',
                                                                fontWeight: 600,
                                                                padding: '0.15rem 0.4rem',
                                                                borderRadius: 'var(--radius-md)',
                                                                border: '1px solid var(--color-border)',
                                                                background: 'var(--color-bg-primary)',
                                                                color: 'var(--color-text-primary)',
                                                                cursor: 'pointer',
                                                                outline: 'none',
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <option value="" disabled>{t('maintenances.selectStatus')}</option>
                                                            {maintenanceStatusChoices.map((s) => (
                                                                <option key={s} value={s}>{translateMaintenanceStatus(s)}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                                padding: '0.15rem 0.6rem', borderRadius: '9999px',
                                                                fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                                color: statusColor, background: `${statusColor}18`,
                                                                cursor: canUpdateMaintenanceStatus(maintenance) && !maintenance.end_datetime ? 'pointer' : 'default',
                                                            }}
                                                            onClick={(e) => {
                                                                if (canUpdateMaintenanceStatus(maintenance) && !maintenance.end_datetime && !statusSaving) {
                                                                    e.stopPropagation();
                                                                    setStatusEditingId(maintenance.maintenance_id);
                                                                }
                                                            }}
                                                            title={canUpdateMaintenanceStatus(maintenance) && !maintenance.end_datetime ? t('maintenances.clickToChangeStatus') : undefined}
                                                        >
                                                            {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, animation: 'pulse 2s infinite' }} />}
                                                            {maintenance.maintenance_status ? translateMaintenanceStatus(maintenance.maintenance_status) : '-'}
                                                        </span>
                                                    )
                                                }
                                                {maintenance.description && (
                                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                                                        — {maintenance.description}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 2: Asset details as pill badges */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                                                {[getLocalizedField(maintenance, 'asset_brand_name'), maintenance.asset_model_name, getLocalizedField(maintenance, 'asset_type_label')].filter(Boolean).length > 0 && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                        background: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.08)',
                                                        color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.15)',
                                                    }}>
                                                        <Monitor size={12} />
                                                        {[getLocalizedField(maintenance, 'asset_brand_name'), maintenance.asset_model_name, getLocalizedField(maintenance, 'asset_type_label')].filter(Boolean).join(' · ')}
                                                    </span>
                                                )}
                                                {maintenance.asset_serial_number && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)',
                                                    }} title={t('assets.serialNumber')}>
                                                        <Tag size={11} style={{ opacity: 0.7 }} />
                                                        {maintenance.asset_serial_number}
                                                    </span>
                                                )}
                                                {maintenance.asset_inventory_number && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)',
                                                    }} title={t('assets.inventoryNumber')}>
                                                        <Hash size={11} style={{ opacity: 0.7 }} />
                                                        {maintenance.asset_inventory_number}
                                                    </span>
                                                )}
                                                {maintenance.asset_service_tag && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 500,
                                                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)',
                                                    }} title={t('assets.serviceTag')}>
                                                        <Sticker size={11} style={{ opacity: 0.7 }} />
                                                        {maintenance.asset_service_tag}
                                                    </span>
                                                )}
                                                {maintenance.asset_status && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                        padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)',
                                                        fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                        background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
                                                        border: '1px solid var(--color-border)',
                                                    }}>
                                                        {translateAssetStatus(maintenance.asset_status)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 3: Maintenance meta (dates, technician, cost) */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', paddingTop: '0.15rem' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    <Calendar size={14} style={{ opacity: 0.55 }} />
                                                    {formatDate(maintenance.start_datetime)}
                                                    {maintenance.end_datetime && (
                                                        <>
                                                            <span style={{ opacity: 0.35, margin: '0 0.15rem' }}>→</span>
                                                            {formatDate(maintenance.end_datetime)}
                                                        </>
                                                    )}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--font-size-sm)', color: maintenance.performed_by_person_name ? 'var(--color-text-secondary)' : 'var(--color-warning)' }}>
                                                    <User size={14} style={{ opacity: 0.55 }} />
                                                    {getLocalizedField(maintenance, 'performed_by_person_name') || t('maintenances.unassigned')}
                                                </span>
                                                {maintenance.total_cost != null && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                        <Coins size={14} style={{ opacity: 0.55 }} />
                                                        {maintenance.total_cost.toLocaleString()} {t('maintenances.currency')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', flexShrink: 0, paddingTop: '0.15rem' }}>
                                            <button
                                                className="btn btn-xs btn-secondary"
                                                style={{ padding: '0.35rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/maintenances/${maintenance.maintenance_id}/steps`);
                                                }}
                                                title={t('maintenances.viewSteps')}
                                            >
                                                <FileText size={15} />
                                            </button>
                                            {!maintenance.performed_by_person && isChief && (
                                                <button
                                                    className="btn btn-xs btn-secondary"
                                                    style={{ padding: '0.35rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAssignClick(maintenance);
                                                    }}
                                                    title={t('maintenances.assignTechnician')}
                                                >
                                                    <UserPlus size={15} />
                                                </button>
                                            )}
                                            {(!maintenance.has_steps && !maintenance.has_external_maintenances) && (isSuperuser || isChief || maintenance.performed_by_person === user?.person?.person_id) && (
                                                <button
                                                    className="btn btn-xs btn-danger"
                                                    style={{ padding: '0.35rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-error)', borderRadius: 'var(--radius-sm)' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelMaintenance(maintenance.maintenance_id);
                                                    }}
                                                    title={t('maintenances.cancelMaintenance')}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Technician Modal */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{t('maintenances.assignTechnicianTitle')}</h3>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAssignSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">{t('maintenances.maintenanceTask')}</label>
                                    <div className="form-input" style={{ backgroundColor: '#f5f5f5' }}>
                                        {selectedMaintenance?.description || t('maintenances.noDescription')}
                                        ({selectedMaintenance?.asset_name})
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="technician" className="form-label">{t('maintenances.technician')}</label>
                                    <select
                                        id="technician"
                                        className="form-input"
                                        value={selectedTechnician}
                                        onChange={(e) => setSelectedTechnician(e.target.value)}
                                    >
                                        <option value="">{t('maintenances.selectTechnicianPlaceholder')}</option>
                                        {technicians.map(tech => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t('maintenances.saving') : t('maintenances.saveAssignment')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Maintenance Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowCreateModal(false)}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 1100,
                            width: '95vw',
                            minHeight: '85vh',
                            maxHeight: '95vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <div className="modal-header" style={{ gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Wrench size={16} style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <h3 className="modal-title" style={{ margin: 0 }}>{t('maintenances.createMaintenance')}</h3>
                            </div>
                            <button className="modal-close" onClick={() => !submitting && setShowCreateModal(false)}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); if (createStep === CREATE_STEPS.length - 1) handleCreateSubmit(e); else handleCreateNext(); }} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                {error && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                                        {error}
                                    </div>
                                )}
                                <Stepper
                                    step={createStep + 1}
                                    direction={stepperDirection}
                                    onStepChange={(newStep, dir) => { setError(''); setStepperDirection(dir); setCreateStep(newStep - 1); }}
                                    onBeforeStepChange={(newStep, oldStep) => {
                                        if (newStep > oldStep) return false;
                                        setError('');
                                        return true;
                                    }}
                                    hideFooter
                                    disableStepIndicators={submitting}
                                    stepCircleContainerClassName="create-maintenance-stepper"
                                    contentClassName="create-maintenance-stepper-content"
                                    renderStepIndicator={({ step, currentStep, onStepClick }) => {
                                        const stepConfig = CREATE_STEPS[step - 1];
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
                                                <span className={`stepper-custom-step-indicator-label ${status}`}>
                                                    {t(`maintenances.createStep${stepConfig.key.charAt(0).toUpperCase()}${stepConfig.key.slice(1)}`)}
                                                </span>
                                            </div>
                                        );
                                    }}
                                >
                                <Step>
                                <div className="wizard-step-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', margin: '0 auto', width: '100%', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
                                    {/* Left Column: Asset Filters */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                        <div style={{ padding: '1rem', backgroundColor: 'rgba(var(--color-primary-rgb, 59, 130, 246), 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--color-primary-rgb, 59, 130, 246), 0.12)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                                </svg>
                                                {t('maintenances.filterAssets')}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', flex: 1, minHeight: 0, gridAutoRows: '1fr', alignContent: 'stretch' }}>
                                                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('maintenances.filterAssetType')}</label>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--font-size-sm)' }}
                                                        value={filterAssetType}
                                                        onChange={(e) => {
                                                            setFilterAssetType(e.target.value);
                                                            setFilterAssetBrand('');
                                                            setFilterAssetModel('');
                                                            setSelectedAsset('');
                                                            setAssetCurrentLocation(null);
                                                        }}
                                                    >
                                                        <option value="">{t('maintenances.allTypes')}</option>
                                                        {assetTypes.map((at) => (
                                                            <option key={at.asset_type_id} value={at.asset_type_id}>
                                                                {i18n.language === 'ar' ? (at.asset_type_label_ar || at.asset_type_label) : (at.asset_type_label_en || at.asset_type_label)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('maintenances.filterAssetBrand')}</label>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--font-size-sm)' }}
                                                        value={filterAssetBrand}
                                                        onChange={(e) => {
                                                            setFilterAssetBrand(e.target.value);
                                                            setFilterAssetModel('');
                                                            setSelectedAsset('');
                                                            setAssetCurrentLocation(null);
                                                        }}
                                                    >
                                                        <option value="">{t('maintenances.allBrands')}</option>
                                                        {filteredAssetBrands.map((b) => (
                                                            <option key={b.asset_brand_id} value={b.asset_brand_id}>
                                                                {i18n.language === 'ar' ? (b.brand_name_ar || b.brand_name) : (b.brand_name_en || b.brand_name)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('maintenances.filterAssetModel')}</label>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--font-size-sm)' }}
                                                        value={filterAssetModel}
                                                        onChange={(e) => {
                                                            setFilterAssetModel(e.target.value);
                                                            setSelectedAsset('');
                                                            setAssetCurrentLocation(null);
                                                        }}
                                                    >
                                                        <option value="">{t('maintenances.allModels')}</option>
                                                        {filteredAssetModels.map((m) => (
                                                            <option key={m.asset_model_id} value={m.asset_model_id}>
                                                                {m.model_name || `Model #${m.asset_model_id}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {assetStatuses.length > 0 && (
                                                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>{t('maintenances.filterAssetStatus')}</label>
                                                    <select
                                                        className="form-input"
                                                        style={{ padding: '0.35rem 0.5rem', fontSize: 'var(--font-size-sm)' }}
                                                        value={filterAssetStatus}
                                                        onChange={(e) => {
                                                            setFilterAssetStatus(e.target.value);
                                                            setSelectedAsset('');
                                                            setAssetCurrentLocation(null);
                                                        }}
                                                    >
                                                        <option value="">{t('maintenances.allStatuses')}</option>
                                                        {assetStatuses.map((s) => (
                                                            <option key={s} value={s}>{translateAssetStatus(s)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Asset Selection + Current Location */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                                        <div className="form-group">
                                            <label htmlFor="asset" className="form-label">{t('assets.asset')}</label>
                                            <SearchableSelect
                                                value={selectedAsset}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    setSelectedAsset(value);
                                                    setAssetCurrentLocation(null);
                                                    setSelectedMaintenanceLocation('');
                                                    if (!value) return;
                                                    try {
                                                        setLoadingAssetLocation(true);
                                                        const data = await assetService.getCurrentLocation(value);
                                                        const location = data?.location || null;
                                                        setAssetCurrentLocation(location);

                                                        if (destinationMode === 'maintenance_room') {
                                                            await loadMaintenanceLocations();
                                                            setSelectedMaintenanceLocation(prev => {
                                                                if (location && !isMaintenanceLocation(location) && Array.isArray(maintenanceLocations) && maintenanceLocations.length === 1) {
                                                                    return String(maintenanceLocations[0].location_id);
                                                                }
                                                                return prev;
                                                            });
                                                        } else if (destinationMode === 'other') {
                                                            await loadAllLocations();
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        setAssetCurrentLocation(null);
                                                    } finally {
                                                        setLoadingAssetLocation(false);
                                                    }
                                                }}
                                                options={filteredAssets.map((a) => {
                                                    const modelInfo = assetModelLookup[a.asset_model];
                                                    const model = assetModels.find(m => m.asset_model_id === a.asset_model);
                                                    const brand = modelInfo ? assetBrands.find(b => b.asset_brand_id === modelInfo.asset_brand_id) : null;
                                                    const lang = i18n.language;
                                                    const brandName = brand ? (lang === 'ar' ? (brand.brand_name_ar || brand.brand_name) : (brand.brand_name_en || brand.brand_name)) : null;
                                                    const modelName = model?.model_name;
                                                    const primaryLabel = a.asset_name || [brandName, modelName].filter(Boolean).join(' ') || `#${a.asset_id}`;
                                                    return {
                                                        value: a.asset_id,
                                                        label: `${primaryLabel} (#${a.asset_id})`,
                                                        searchText: [
                                                            a.asset_name,
                                                            brandName,
                                                            modelName,
                                                            a.asset_serial_number,
                                                            a.asset_inventory_number,
                                                            a.asset_service_tag,
                                                            `#${a.asset_id}`,
                                                        ].filter(Boolean).join(' '),
                                                        asset: a,
                                                    };
                                                })}
                                                renderOption={(option, isSelected) => {
                                                    const a = option.asset;
                                                    const modelInfo = assetModelLookup[a.asset_model];
                                                    const model = assetModels.find(m => m.asset_model_id === a.asset_model);
                                                    const brand = modelInfo ? assetBrands.find(b => b.asset_brand_id === modelInfo.asset_brand_id) : null;
                                                    const lang = i18n.language;
                                                    const brandName = brand ? (lang === 'ar' ? (brand.brand_name_ar || brand.brand_name) : (brand.brand_name_en || brand.brand_name)) : null;
                                                    const modelName = model?.model_name;
                                                    const primaryLabel = a.asset_name || [brandName, modelName].filter(Boolean).join(' ') || `${t('assets.asset')} #${a.asset_id}`;
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span style={{ fontWeight: isSelected ? 600 : 500, fontSize: 'var(--font-size-sm)' }}>
                                                                    {primaryLabel}
                                                                </span>
                                                                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                                                                    #{a.asset_id}
                                                                </span>
                                                                {a.asset_status && (
                                                                    <span style={{
                                                                        fontSize: 'var(--font-size-xs)',
                                                                        padding: '1px 6px',
                                                                        borderRadius: 'var(--radius-sm)',
                                                                        backgroundColor: 'var(--color-bg-secondary)',
                                                                        color: 'var(--color-text-secondary)',
                                                                        marginInlineStart: 'auto',
                                                                    }}>
                                                                        {translateAssetStatus(a.asset_status)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                                                {a.asset_name && brandName && <span>{brandName}</span>}
                                                                {a.asset_name && modelName && <span>· {modelName}</span>}
                                                                {a.asset_serial_number && <span>{a.asset_name ? '· ' : ''}{t('assets.serialNumber')}: {a.asset_serial_number}</span>}
                                                                {a.asset_inventory_number && <span>· {t('assets.inventoryNumber')}: {a.asset_inventory_number}</span>}
                                                                {a.asset_service_tag && <span>· {t('assets.serviceTag')}: {a.asset_service_tag}</span>}
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                                searchPlaceholder={t('maintenances.searchAssetPlaceholder')}
                                                placeholder={t('maintenances.selectAsset')}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">{t('maintenances.currentLocation')}</label>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem',
                                                    backgroundColor: 'var(--color-bg-secondary)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    color: 'var(--color-text-primary)',
                                                    fontSize: 'var(--font-size-sm)',
                                                    minHeight: 40,
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {loadingAssetLocation
                                                    ? <span style={{ color: 'var(--color-text-secondary)' }}>{t('maintenances.loadingLocation')}</span>
                                                    : assetCurrentLocation
                                                        ? <span>{assetCurrentLocation.location_name}{(assetCurrentLocation.location_type_label_ar || assetCurrentLocation.location_type_label) ? ` (${getLocalizedField(assetCurrentLocation, 'location_type_label')})` : ''}</span>
                                                        : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </Step>

                                <Step>
                                <div className="wizard-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 700, margin: '0 auto', width: '100%' }}>
                                    {/* Assignment Section */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <UserPlus size={12} />
                                        {t('maintenances.assignment')}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="technician_create" className="form-label">{t('maintenances.technician')}</label>
                                        <SearchableSelect
                                            value={selectedTechnician}
                                            onChange={(e) => setSelectedTechnician(e.target.value)}
                                            options={technicians.map((tech) => {
                                                const lang = i18n.language;
                                                const fnAr = tech.first_name_ar || tech.first_name;
                                                const lnAr = tech.last_name_ar || tech.last_name;
                                                const fnEn = tech.first_name_en || tech.first_name;
                                                const lnEn = tech.last_name_en || tech.last_name;
                                                const nameAr = `${fnAr} ${lnAr}`;
                                                const nameEn = `${fnEn} ${lnEn}`;
                                                const label = lang === 'ar' ? `${nameAr} (${nameEn})` : `${nameEn} (${nameAr})`;
                                                return {
                                                    value: tech.person_id,
                                                    label,
                                                    searchText: `${nameAr} ${nameEn} ${tech.first_name} ${tech.last_name}`,
                                                };
                                            })}
                                            placeholder={t('maintenances.selectTechnician')}
                                            searchPlaceholder={t('maintenances.searchTechnicianPlaceholder')}
                                            required
                                        />
                                    </div>

                                    {destinationMode === 'maintenance_room' && assetCurrentLocation && !isMaintenanceLocation(assetCurrentLocation) && (
                                        <div className="form-group">
                                            <label className="form-label">{t('maintenances.moveToMaintenanceLocation')}</label>
                                            <SearchableSelect
                                                value={selectedMaintenanceLocation}
                                                onChange={(e) => setSelectedMaintenanceLocation(e.target.value)}
                                                options={maintenanceLocations.map((r) => {
                                                    const lang = i18n.language;
                                                    const nameAr = r.location_name_ar || r.location_name;
                                                    const nameEn = r.location_name_en || r.location_name;
                                                    const typeAr = r.location_type_label_ar || r.location_type_label;
                                                    const typeEn = r.location_type_label_en || r.location_type_label;
                                                    const typeLabel = lang === 'ar' ? typeAr : typeEn;
                                                    const label = lang === 'ar'
                                                        ? `${nameAr} (${nameEn})${typeLabel ? ` - ${typeLabel}` : ''}`
                                                        : `${nameEn} (${nameAr})${typeLabel ? ` - ${typeLabel}` : ''}`;
                                                    return {
                                                        value: r.location_id,
                                                        label,
                                                        searchText: `${nameAr} ${nameEn} ${r.location_name} ${typeAr || ''} ${typeEn || ''}`,
                                                    };
                                                })}
                                                placeholder={t('maintenances.selectMaintenanceLocation')}
                                                searchPlaceholder={t('maintenances.searchLocationPlaceholder')}
                                            />
                                        </div>
                                    )}
                                    
                                    {destinationMode === 'other' && (
                                        <div className="form-group">
                                            <label className="form-label">{t('maintenances.destinationLocation')}</label>
                                            <SearchableSelect
                                                value={selectedMaintenanceLocation}
                                                onChange={(e) => setSelectedMaintenanceLocation(e.target.value)}
                                                options={allLocations.map((r) => {
                                                    const lang = i18n.language;
                                                    const nameAr = r.location_name_ar || r.location_name;
                                                    const nameEn = r.location_name_en || r.location_name;
                                                    const typeAr = r.location_type_label_ar || r.location_type_label;
                                                    const typeEn = r.location_type_label_en || r.location_type_label;
                                                    const typeLabel = lang === 'ar' ? typeAr : typeEn;
                                                    const label = lang === 'ar'
                                                        ? `${nameAr} (${nameEn})${typeLabel ? ` - ${typeLabel}` : ''}`
                                                        : `${nameEn} (${nameAr})${typeLabel ? ` - ${typeLabel}` : ''}`;
                                                    return {
                                                        value: r.location_id,
                                                        label,
                                                        searchText: `${nameAr} ${nameEn} ${r.location_name} ${typeAr || ''} ${typeEn || ''}`,
                                                    };
                                                })}
                                                placeholder={t('maintenances.selectLocation')}
                                                searchPlaceholder={t('maintenances.searchLocationPlaceholder')}
                                            />
                                        </div>
                                    )}
                                </div>
                                </Step>

                                <Step>
                                <div className="wizard-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 700, margin: '0 auto', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <FileText size={12} />
                                        {t('maintenances.createStepDetails')}
                                    </div>
                                    <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <label htmlFor="description_create" className="form-label">{t('maintenances.description')}</label>
                                        <textarea
                                            id="description_create"
                                            className="form-input"
                                            style={{ flex: 1, minHeight: 120 }}
                                            value={createDescription}
                                            onChange={(e) => setCreateDescription(e.target.value)}
                                            placeholder={t('maintenances.descriptionPlaceholder', 'Describe the maintenance issue or task...')}
                                        />
                                    </div>
                                </div>
                                </Step>
                                </Stepper>
                            </div>

                            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => !submitting && setShowCreateModal(false)}
                                    style={{ minWidth: 80 }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {createStep > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleCreateBack}
                                            disabled={submitting}
                                            style={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            {i18n.language === 'ar' ? <><ArrowRight size={14} /> {t('common.back', 'Back')}</> : <><ArrowLeft size={14} /> {t('common.back', 'Back')}</>}
                                        </button>
                                    )}
                                    {createStep < CREATE_STEPS.length - 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleCreateNext}
                                            style={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        >
                                            {i18n.language === 'ar' ? <>{t('common.next', 'Next')} <ArrowLeft size={14} /></> : <>{t('common.next', 'Next')} <ArrowRight size={14} /></>}
                                        </button>
                                    )}
                                    {createStep === CREATE_STEPS.length - 1 && (
                                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 120 }}>
                                            {submitting ? t('maintenances.creating') : t('maintenances.createMaintenance')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Typical Steps Modal */}
            {showTypicalStepsModal && (
                <div className="modal-overlay" onClick={() => !submitting && setShowTypicalStepsModal(false)}>
                    <div
                        className="ts-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="ts-modal-header">
                            <div className="ts-modal-header-left">
                                <div className="ts-modal-icon">
                                    <ListChecks size={20} />
                                </div>
                                <div>
                                    <h3 className="ts-modal-title">{t('maintenances.typicalStepsTitle', 'Maintenance typical steps')}</h3>
                                    <p className="ts-modal-subtitle">
                                        {typicalStepsTab === 'internal'
                                            ? t('maintenances.regularSteps', 'Regular')
                                            : t('maintenances.externalSteps', 'External')}
                                    </p>
                                </div>
                            </div>
                            <button className="ts-modal-close" onClick={() => !submitting && setShowTypicalStepsModal(false)}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Tab Switcher */}
                        <div className="ts-modal-tabs">
                            <button
                                type="button"
                                className={`ts-modal-tab${typicalStepsTab === 'internal' ? ' ts-modal-tab-active' : ''}`}
                                onClick={() => setTypicalStepsTab('internal')}
                            >
                                <Settings2 size={14} />
                                {t('maintenances.regularSteps', 'Regular')}
                            </button>
                            <button
                                type="button"
                                className={`ts-modal-tab${typicalStepsTab === 'external' ? ' ts-modal-tab-active' : ''}`}
                                onClick={() => setTypicalStepsTab('external')}
                            >
                                <Layers size={14} />
                                {t('maintenances.externalSteps', 'External')}
                            </button>
                        </div>

                        {/* Body */}
                        <div className="ts-modal-body">
                            {error && (
                                <div className="ts-modal-error">
                                    <AlertTriangle size={14} />
                                    {error}
                                </div>
                            )}

                            {typicalStepsTab === 'internal' ? (
                                <form onSubmit={handleTypicalStepCreate} className="ts-modal-form">
                                    <div className="ts-form-grid">
                                        <div className="ts-form-section ts-form-section-full">
                                            <div className="ts-form-section-header">
                                                <FileText size={14} />
                                                {t('common.description')}
                                            </div>
                                            <TranslatableInput
                                                label={t('common.description')}
                                                baseFieldName="description"
                                                value={typicalStepForm.description}
                                                onChange={(name, value) => setTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(typicalStepTranslations).map(([k, v]) => [k, v.description || '']))}
                                                onTranslationChange={(langCode, value) => handleTypicalStepTranslationChange(langCode, { description: value })}
                                                required
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <DollarSign size={14} />
                                                {t('maintenances.estimatedCost', 'Estimated cost')}
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-input"
                                                value={typicalStepForm.estimated_cost}
                                                onChange={(e) => setTypicalStepForm((p) => ({ ...p, estimated_cost: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <Wrench size={14} />
                                                {t('maintenances.maintenanceType', 'Maintenance type')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.maintenanceType', 'Maintenance type')}
                                                baseFieldName="maintenance_type"
                                                value={typicalStepForm.maintenance_type}
                                                onChange={(name, value) => setTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(typicalStepTranslations).map(([k, v]) => [k, v.maintenance_type || '']))}
                                                onTranslationChange={(langCode, value) => handleTypicalStepTranslationChange(langCode, { maintenance_type: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.maintenance_type || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <Settings2 size={14} />
                                                {t('maintenances.operationType', 'Operation type')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.operationType', 'Operation type')}
                                                baseFieldName="operation_type"
                                                value={typicalStepForm.operation_type}
                                                onChange={(name, value) => setTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(typicalStepTranslations).map(([k, v]) => [k, v.operation_type || '']))}
                                                onTranslationChange={(langCode, value) => handleTypicalStepTranslationChange(langCode, { operation_type: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.operation_type || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>

                                        <div className="ts-form-section ts-form-section-full">
                                            <div className="ts-form-section-header">
                                                <Layers size={14} />
                                                {t('maintenances.maintenanceDomain', 'Maintenance domain')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.maintenanceDomain', 'Maintenance domain')}
                                                baseFieldName="maintenance_domain"
                                                value={typicalStepForm.maintenance_domain}
                                                onChange={(name, value) => setTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(typicalStepTranslations).map(([k, v]) => [k, v.maintenance_domain || '']))}
                                                onTranslationChange={(langCode, value) => handleTypicalStepTranslationChange(langCode, { maintenance_domain: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.maintenance_domain || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="ts-form-actions">
                                        <button type="submit" className="ts-btn-submit" disabled={submitting}>
                                            {submitting ? t('common.saving') : <><Plus size={16} /> {t('common.add', 'Add')}</>}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleExternalTypicalStepCreate} className="ts-modal-form">
                                    <div className="ts-form-grid">
                                        <div className="ts-form-section ts-form-section-full">
                                            <div className="ts-form-section-header">
                                                <FileText size={14} />
                                                {t('common.description')}
                                            </div>
                                            <TranslatableInput
                                                label={t('common.description')}
                                                baseFieldName="description"
                                                value={externalTypicalStepForm.description}
                                                onChange={(name, value) => setExternalTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(externalTypicalStepTranslations).map(([k, v]) => [k, v.description || '']))}
                                                onTranslationChange={(langCode, value) => handleExternalTypicalStepTranslationChange(langCode, { description: value })}
                                                required
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <DollarSign size={14} />
                                                {t('maintenances.estimatedCost', 'Estimated cost')}
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-input"
                                                value={externalTypicalStepForm.estimated_cost}
                                                onChange={(e) => setExternalTypicalStepForm((p) => ({ ...p, estimated_cost: e.target.value }))}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <Wrench size={14} />
                                                {t('maintenances.maintenanceType', 'Maintenance type')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.maintenanceType', 'Maintenance type')}
                                                baseFieldName="maintenance_type"
                                                value={externalTypicalStepForm.maintenance_type}
                                                onChange={(name, value) => setExternalTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(externalTypicalStepTranslations).map(([k, v]) => [k, v.maintenance_type || '']))}
                                                onTranslationChange={(langCode, value) => handleExternalTypicalStepTranslationChange(langCode, { maintenance_type: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.maintenance_type || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>

                                        <div className="ts-form-section">
                                            <div className="ts-form-section-header">
                                                <Settings2 size={14} />
                                                {t('maintenances.operationType', 'Operation type')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.operationType', 'Operation type')}
                                                baseFieldName="operation_type"
                                                value={externalTypicalStepForm.operation_type}
                                                onChange={(name, value) => setExternalTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(externalTypicalStepTranslations).map(([k, v]) => [k, v.operation_type || '']))}
                                                onTranslationChange={(langCode, value) => handleExternalTypicalStepTranslationChange(langCode, { operation_type: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.operation_type || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>

                                        <div className="ts-form-section ts-form-section-full">
                                            <div className="ts-form-section-header">
                                                <Layers size={14} />
                                                {t('maintenances.maintenanceDomain', 'Maintenance domain')}
                                            </div>
                                            <TranslatableInput
                                                label={t('maintenances.maintenanceDomain', 'Maintenance domain')}
                                                baseFieldName="maintenance_domain"
                                                value={externalTypicalStepForm.maintenance_domain}
                                                onChange={(name, value) => setExternalTypicalStepForm((p) => ({ ...p, [name]: value }))}
                                                translations={Object.fromEntries(Object.entries(externalTypicalStepTranslations).map(([k, v]) => [k, v.maintenance_domain || '']))}
                                                onTranslationChange={(langCode, value) => handleExternalTypicalStepTranslationChange(langCode, { maintenance_domain: value })}
                                                inputType="select"
                                                options={(typicalStepFieldChoices.maintenance_domain || []).map((v) => ({ value: v.value, label: v.value, label_ar: v.label_ar }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="ts-form-actions">
                                        <button type="submit" className="ts-btn-submit" disabled={submitting}>
                                            {submitting ? t('common.saving') : <><Plus size={16} /> {t('common.add', 'Add')}</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default MaintenancesPage;
