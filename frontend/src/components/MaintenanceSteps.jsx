import { useState, useEffect, useMemo } from 'react';
import SearchableSelect from './SearchableSelect';
import {
    maintenanceStepService,
    maintenanceTypicalStepService,
    maintenanceService,
    personService,
    externalMaintenanceService,
    externalMaintenanceStepService,
    externalMaintenanceProviderService,
    externalMaintenanceTypicalStepService,
    stockItemTypeService,
    stockItemModelService,
    consumableTypeService,
    consumableModelService,
    locationService,
    physicalConditionService,
    assetAttributeDefinitionService,
    stockItemAttributeDefinitionService,
    consumableAttributeDefinitionService,
    assetAttributeValueService,
    stockItemAttributeValueService,
    consumableAttributeValueService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ModalPortal from './ModalPortal';
import {
    Power,
    Box,
    PlusSquare,
    Plus,
    FileText,
    Pencil,
    ListChecks,
    Lightbulb,
    Trash2,
    User,
    Clock,
    Calendar,
    ArrowRightLeft,
    X,
} from 'lucide-react';

const MaintenanceSteps = ({
    maintenanceId,
    maintenancePerformedBy,
    maintenanceEnded,
    isChief,
    maintenanceDomain,
    onStepsChange,
    canShowEndMaintenanceButton,
    endMaintenanceDisabled,
    onEndMaintenance,
    triggerReturnModalAfterEnd,
    onTriggerReturnModalAfterEndHandled,
}) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [steps, setSteps] = useState([]);
    const [externalSteps, setExternalSteps] = useState([]);
    const [typicalSteps, setTypicalSteps] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingStep, setAddingStep] = useState(false);

    const [externalMaintenanceModalOpen, setExternalMaintenanceModalOpen] = useState(false);
    const [externalMaintenanceSubmitting, setExternalMaintenanceSubmitting] = useState(false);
    const [externalMaintenanceMessage, setExternalMaintenanceMessage] = useState(null);
    const [externalMaintenanceCreated, setExternalMaintenanceCreated] = useState(false);

    const [externalMaintenances, setExternalMaintenances] = useState([]);
    const [externalStepModalOpen, setExternalStepModalOpen] = useState(false);
    const [externalStepSubmitting, setExternalStepSubmitting] = useState(false);
    const [externalStepMessage, setExternalStepMessage] = useState(null);
    const [externalStepTypicalStepId, setExternalStepTypicalStepId] = useState('');
    const [externalMaintenanceTypicalSteps, setExternalMaintenanceTypicalSteps] = useState([]);

    const [statusEditorStepId, setStatusEditorStepId] = useState(null);
    const [statusEditorValue, setStatusEditorValue] = useState('');
    const [statusSaving, setStatusSaving] = useState(false);

    const [requestEditorOpen, setRequestEditorOpen] = useState(false);
    const [requestEditorType, setRequestEditorType] = useState(null);
    const [requestEditorStep, setRequestEditorStep] = useState(null);
    const [requestTypeId, setRequestTypeId] = useState('');
    const [requestModelId, setRequestModelId] = useState('');
    const [requestModels, setRequestModels] = useState([]);
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requestMessage, setRequestMessage] = useState(null);

    const [stepsWithItemRequest, setStepsWithItemRequest] = useState([]);

    const [removeEditorOpen, setRemoveEditorOpen] = useState(false);
    const [removeEditorStep, setRemoveEditorStep] = useState(null);
    const [removeComponents, setRemoveComponents] = useState({ stock_items: [], consumables: [] });
    const [removeSelectedType, setRemoveSelectedType] = useState('');
    const [removeSelectedId, setRemoveSelectedId] = useState('');
    const [removeLocations, setRemoveLocations] = useState([]);
    const [removeDestinationLocationId, setRemoveDestinationLocationId] = useState('');
    const [removeLoading, setRemoveLoading] = useState(false);
    const [removeSubmitting, setRemoveSubmitting] = useState(false);

    const [returnMaintenanceOpen, setReturnMaintenanceOpen] = useState(false);
    const [returnMaintenancePendingExists, setReturnMaintenancePendingExists] = useState(false);
    const [returnMaintenanceDestinationLocationId, setReturnMaintenanceDestinationLocationId] = useState('');
    const [returnMaintenanceLocations, setReturnMaintenanceLocations] = useState([]);
    const [returnMaintenanceLoading, setReturnMaintenanceLoading] = useState(false);
    const [returnMaintenanceSubmitting, setReturnMaintenanceSubmitting] = useState(false);

    const [assetConditionEditorOpen, setAssetConditionEditorOpen] = useState(false);
    const [assetConditionEditorStep, setAssetConditionEditorStep] = useState(null);
    const [physicalConditions, setPhysicalConditions] = useState([]);
    const [selectedConditionId, setSelectedConditionId] = useState('');
    const [assetConditionNotes, setAssetConditionNotes] = useState('');
    const [assetConditionCosmeticIssues, setAssetConditionCosmeticIssues] = useState('');
    const [assetConditionFunctionalIssues, setAssetConditionFunctionalIssues] = useState('');
    const [assetConditionRecommendation, setAssetConditionRecommendation] = useState('');
    const [assetConditionSubmitting, setAssetConditionSubmitting] = useState(false);

    const [attributeEditorOpen, setAttributeEditorOpen] = useState(false);
    const [attributeEditorStep, setAttributeEditorStep] = useState(null);
    const [attributeEditorComponents, setAttributeEditorComponents] = useState({ stock_items: [], consumables: [] });
    const [assetAttributeDefinitions, setAssetAttributeDefinitions] = useState([]);
    const [stockItemAttributeDefinitions, setStockItemAttributeDefinitions] = useState([]);
    const [consumableAttributeDefinitions, setConsumableAttributeDefinitions] = useState([]);

    const [attributeTargetValue, setAttributeTargetValue] = useState('asset');
    const [attributeComponentValue, setAttributeComponentValue] = useState('');
    const [attributeDefinitionId, setAttributeDefinitionId] = useState('');
    const [attributeValueString, setAttributeValueString] = useState('');
    const [attributeValueBool, setAttributeValueBool] = useState(false);
    const [attributeValueNumber, setAttributeValueNumber] = useState('');
    const [attributeValueDate, setAttributeValueDate] = useState('');
    const [attributePendingChanges, setAttributePendingChanges] = useState([]);
    const [attributeSubmitting, setAttributeSubmitting] = useState(false);
    const [attributeMessage, setAttributeMessage] = useState(null);
    const [attributeCurrentValue, setAttributeCurrentValue] = useState(null);
    const [attributeCurrentValueLoading, setAttributeCurrentValueLoading] = useState(false);

    const [returnEditorOpen, setReturnEditorOpen] = useState(false);
    const [returnEditorStep, setReturnEditorStep] = useState(null);
    const [returnComponents, setReturnComponents] = useState({ stock_items: [], consumables: [] });
    const [returnSelectedType, setReturnSelectedType] = useState('');
    const [returnSelectedId, setReturnSelectedId] = useState('');
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnSubmitting, setReturnSubmitting] = useState(false);

    // New Step Form State
    const [newStepTypicalId, setNewStepTypicalId] = useState('');
    const [newStepPersonId, setNewStepPersonId] = useState('');
    const [newStepNote, setNewStepNote] = useState('');

    const stepStatusOptions = useMemo(() => (
        [
            'pending',
            'started',
            'pending (waiting for stock item)',
            'pending (waiting for consumable)',
            'In Progress',
            'done',
            'failed (to be sent to a higher level)',
            'cancelled',
        ]
    ), []);

    const stepStatusOrder = useMemo(() => (
        {
            'pending': 10,
            'started': 20,
            'pending (waiting for stock item)': 30,
            'pending (waiting for consumable)': 30,
            'In Progress': 40,
            'done': 50,
            'failed (to be sent to a higher level)': 50,
            'cancelled': 50,
        }
    ), []);

    const getAllowedStepStatusOptions = (currentStatusRaw) => {
        const currentStatus = currentStatusRaw === 'in progress' ? 'In Progress' : currentStatusRaw;
        const currentRank = stepStatusOrder[currentStatus] ?? stepStatusOrder['pending'];

        const allowed = stepStatusOptions.filter((s) => {
            const rank = stepStatusOrder[s];
            if (rank == null) return false;
            return rank >= currentRank;
        });

        if (currentStatus === 'started') {
            return allowed.filter((s) => s !== 'started');
        }

        if (currentStatus === 'In Progress') {
            for (const s of ['pending (waiting for stock item)', 'pending (waiting for consumable)']) {
                if (!allowed.includes(s)) allowed.unshift(s);
            }
        }

        if (currentStatus && !allowed.includes(currentStatus) && stepStatusOrder[currentStatus] != null) {
            return [currentStatus, ...allowed];
        }

        return allowed;
    };

    const isMainTechnician = useMemo(() => {
        return user?.person?.person_id === maintenancePerformedBy;
    }, [user, maintenancePerformedBy]);

    const isItMaintenanceTechnician = useMemo(() => {
        return user?.roles?.some(role => role.role_code === 'it_maintenance_technician');
    }, [user]);

    const isNetworkMaintenanceTechnician = useMemo(() => {
        return user?.roles?.some(role => role.role_code === 'network_maintenance_technician');
    }, [user]);

    const isAssignedTechnician = useMemo(() => {
        if (isChief || isMainTechnician) return true;
        const myPersonId = user?.person?.person_id;
        if (!myPersonId) return false;
        return steps.some(step => step.person?.person_id === myPersonId);
    }, [isChief, isMainTechnician, user, steps]);

    const canOperateStep = (step) => {
        if (isChief) return true;
        if (isMainTechnician) {
            const stepDomain = step.maintenance_typical_step?.maintenance_domain;
            if (isNetworkMaintenanceTechnician) {
                return stepDomain === 'network';
            }
            if (isItMaintenanceTechnician) {
                return stepDomain === 'it';
            }
            return true;
        }
        // Assigned technician can operate steps matching their domain
        if (isAssignedTechnician) {
            const stepDomain = step.maintenance_typical_step?.maintenance_domain;
            if (isNetworkMaintenanceTechnician) {
                return stepDomain === 'network';
            }
            if (isItMaintenanceTechnician) {
                return stepDomain === 'it';
            }
        }
        return false;
    };

    const canManageSteps = isChief || isAssignedTechnician;

    const canAddStep = useMemo(() => {
        if (isChief) return true;
        if (isAssignedTechnician) return true;
        return false;
    }, [isChief, isAssignedTechnician]);

    // Only the main technician (performed_by_person) and chiefs can create external maintenances/steps
    const canCreateExternalMaintenance = isChief || isMainTechnician;

    const hasOngoingExternalMaintenance = useMemo(() => {
        if (!Array.isArray(externalMaintenances) || externalMaintenances.length === 0) return false;
        return externalMaintenances.some((em) => {
            const status = em?.external_maintenance_status;
            if (status) {
                return status !== 'DRAFT' && status !== 'RECEIVED_BY_COMPANY';
            }

            const sent = em?.item_sent_to_external_maintenance_datetime;
            const receivedByCompany = em?.item_received_by_company_datetime;
            return Boolean(sent) && !receivedByCompany;
        });
    }, [externalMaintenances]);

    const hasOpenExternalMaintenance = useMemo(() => {
        if (!Array.isArray(externalMaintenances) || externalMaintenances.length === 0) return false;
        return externalMaintenances.some((em) => {
            const status = em?.external_maintenance_status;
            if (status) {
                return status !== 'RECEIVED_BY_COMPANY';
            }

            const receivedByCompany = em?.item_received_by_company_datetime;
            return !receivedByCompany;
        });
    }, [externalMaintenances]);

    const openExternalMaintenanceModal = () => {
        setExternalMaintenanceMessage(null);
        setExternalMaintenanceCreated(false);
        setExternalMaintenanceSubmitting(false);
        setExternalMaintenanceModalOpen(true);
    };

    const openExternalStepModal = () => {
        setExternalStepMessage(null);
        setExternalStepTypicalStepId('');
        setExternalStepSubmitting(false);
        setExternalStepModalOpen(true);
    };

    const closeExternalMaintenanceModal = () => {
        setExternalMaintenanceModalOpen(false);
        setExternalMaintenanceSubmitting(false);
        setExternalMaintenanceMessage(null);
        setExternalMaintenanceCreated(false);
    };

    const submitCreateExternalStep = async (e) => {
        e.preventDefault();

        const em = Array.isArray(externalMaintenances) ? externalMaintenances[0] : null;
        if (!em?.external_maintenance_id) {
            setExternalStepMessage({ type: 'error', text: t('mSteps.noExternalMaintenance') });
            return;
        }
        if (!externalStepTypicalStepId) {
            setExternalStepMessage({ type: 'error', text: t('mSteps.selectTypicalStep') });
            return;
        }

        try {
            setExternalStepSubmitting(true);
            setExternalStepMessage(null);
            await externalMaintenanceService.createStep(
                Number(em.external_maintenance_id),
                Number(externalStepTypicalStepId),
            );
            setExternalStepMessage({ type: 'success', text: t('mSteps.extStepCreated') });
            await loadData();
        } catch (err) {
            console.error(err);
            setExternalStepMessage({ type: 'error', text: err.response?.data?.error || t('mSteps.createExtStepError') });
        } finally {
            setExternalStepSubmitting(false);
        }
    };

    const closeAddStepModal = () => {
        setAddingStep(false);
        setNewStepTypicalId('');
        setNewStepPersonId('');
        setNewStepNote('');
    };

    const closeExternalStepModal = () => {
        setExternalStepModalOpen(false);
        setExternalStepSubmitting(false);
        setExternalStepMessage(null);
        setExternalStepTypicalStepId('');
    };

    const closeReturnEditor = () => {
        setReturnEditorOpen(false);
        setReturnEditorStep(null);
        setReturnComponents({ stock_items: [], consumables: [] });
        setReturnSelectedType('');
        setReturnSelectedId('');
        setReturnLoading(false);
        setReturnSubmitting(false);
    };

    const openReturnEditor = async (step) => {
        if (maintenanceEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }
        setReturnEditorOpen(true);
        setReturnEditorStep(step);
        setReturnComponents({ stock_items: [], consumables: [] });
        setReturnSelectedType('');
        setReturnSelectedId('');

        try {
            setReturnLoading(true);
            const data = await maintenanceStepService.getComponents(step.maintenance_step_id);
            setReturnComponents({
                stock_items: Array.isArray(data?.stock_items) ? data.stock_items : [],
                consumables: Array.isArray(data?.consumables) ? data.consumables : [],
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.loadComponentsError'));
            closeReturnEditor();
        } finally {
            setReturnLoading(false);
        }
    };

    const submitReturnEditor = async () => {
        if (!returnEditorStep) return;
        if (!returnSelectedType || !returnSelectedId) {
            setError(t('mSteps.selectComponentToReturn'));
            return;
        }
        try {
            setReturnSubmitting(true);
            await maintenanceStepService.returnToOwner(returnEditorStep.maintenance_step_id, {
                component_type: returnSelectedType,
                component_id: Number(returnSelectedId),
            });
            await loadData();
            closeReturnEditor();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.returnComponentError'));
        } finally {
            setReturnSubmitting(false);
        }
    };

    useEffect(() => {
        closeExternalMaintenanceModal();
        closeExternalStepModal();
        closeAddStepModal();
        loadData();
    }, [maintenanceId]);

    useEffect(() => {
        if (!maintenanceEnded) return;
        closeStatusEditor();
        closeAddStepModal();
        closeRequestEditor();
        closeRemoveEditor();
        closeAssetConditionEditor();
        closeAttributeEditor();
        closeReturnEditor();
    }, [maintenanceEnded]);

    useEffect(() => {
        if (!triggerReturnModalAfterEnd) return;
        openReturnMaintenance({ ignoreMaintenanceEnded: true });
        if (typeof onTriggerReturnModalAfterEndHandled === 'function') {
            onTriggerReturnModalAfterEndHandled();
        }
    }, [triggerReturnModalAfterEnd]);

    const openAttributeEditor = async (step) => {
        if (maintenanceEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }

        setAttributeEditorOpen(true);
        setAttributeEditorStep(step);
        setAttributeEditorComponents({ stock_items: [], consumables: [] });
        setAssetAttributeDefinitions([]);
        setStockItemAttributeDefinitions([]);
        setConsumableAttributeDefinitions([]);

        setAttributeTargetValue('asset');
        setAttributeComponentValue('');
        setAttributeDefinitionId('');
        setAttributeValueString('');
        setAttributeValueBool(false);
        setAttributeValueNumber('');
        setAttributeValueDate('');
        setAttributePendingChanges([]);
        setAttributeMessage(null);

        try {
            const stepDomain = step.maintenance_typical_step?.maintenance_domain;
            const [componentsData, assetDefs, stockDefs, consDefs] = await Promise.all([
                maintenanceStepService.getComponents(step.maintenance_step_id).catch(() => ({ stock_items: [], consumables: [] })),
                assetAttributeDefinitionService.getAll(stepDomain ? { maintenance_domain: stepDomain } : {}).catch(() => []),
                stockItemAttributeDefinitionService.getAll(stepDomain ? { maintenance_domain: stepDomain } : {}).catch(() => []),
                consumableAttributeDefinitionService.getAll(stepDomain ? { maintenance_domain: stepDomain } : {}).catch(() => []),
            ]);

            setAttributeEditorComponents({
                stock_items: Array.isArray(componentsData?.stock_items) ? componentsData.stock_items : [],
                consumables: Array.isArray(componentsData?.consumables) ? componentsData.consumables : [],
            });
            setAssetAttributeDefinitions(Array.isArray(assetDefs) ? assetDefs : []);
            setStockItemAttributeDefinitions(Array.isArray(stockDefs) ? stockDefs : []);
            setConsumableAttributeDefinitions(Array.isArray(consDefs) ? consDefs : []);
        } catch (err) {
            console.error(err);
        }
    };

    const getSelectedAttributeDefinition = () => {
        const rawId = Number(attributeDefinitionId);
        if (!rawId || Number.isNaN(rawId)) return null;

        if (attributeTargetValue === 'asset') {
            return assetAttributeDefinitions.find((d) => Number(d.asset_attribute_definition_id) === rawId) || null;
        }
        if (attributeTargetValue === 'stock_item') {
            return stockItemAttributeDefinitions.find((d) => Number(d.stock_item_attribute_definition_id) === rawId) || null;
        }
        return consumableAttributeDefinitions.find((d) => Number(d.consumable_attribute_definition_id) === rawId) || null;
    };

    const inferAttributeDataType = (def) => {
        const raw = (def?.data_type || '').toString().trim().toLowerCase();
        if (raw === 'bool' || raw === 'boolean') return 'bool';
        if (raw === 'date') return 'date';
        if (raw === 'number' || raw === 'numeric' || raw === 'decimal' || raw === 'int' || raw === 'integer' || raw === 'float' || raw === 'double') return 'number';
        return 'string';
    };

    const addPendingAttributeChange = () => {
        const def = getSelectedAttributeDefinition();
        if (!def) {
            setAttributeMessage({ type: 'error', text: t('mSteps.selectAttribute') });
            return;
        }

        let targetId = null;
        if (attributeTargetValue === 'stock_item' || attributeTargetValue === 'consumable') {
            if (!attributeComponentValue) {
                setAttributeMessage({ type: 'error', text: t('mSteps.selectComponent') });
                return;
            }
            targetId = Number(attributeComponentValue);
            if (!targetId || Number.isNaN(targetId)) {
                setAttributeMessage({ type: 'error', text: t('mSteps.invalidComponent') });
                return;
            }
        }

        const dt = inferAttributeDataType(def);
        const attributeDefinitionIdNumber = attributeTargetValue === 'asset'
            ? Number(def.asset_attribute_definition_id)
            : attributeTargetValue === 'stock_item'
                ? Number(def.stock_item_attribute_definition_id)
                : Number(def.consumable_attribute_definition_id);

        const change = {
            target_type: attributeTargetValue,
            target_id: targetId,
            attribute_definition_id: attributeDefinitionIdNumber,
        };

        if (dt === 'bool') {
            change.value_bool = Boolean(attributeValueBool);
        } else if (dt === 'date') {
            if (!attributeValueDate) {
                setAttributeMessage({ type: 'error', text: t('mSteps.selectDate') });
                return;
            }
            change.value_date = attributeValueDate;
        } else if (dt === 'number') {
            if (attributeValueNumber === '' || attributeValueNumber == null) {
                setAttributeMessage({ type: 'error', text: t('mSteps.enterNumber') });
                return;
            }
            const n = Number(attributeValueNumber);
            if (Number.isNaN(n)) {
                setAttributeMessage({ type: 'error', text: t('mSteps.invalidNumber') });
                return;
            }
            change.value_number = n;
        } else {
            if (!attributeValueString) {
                setAttributeMessage({ type: 'error', text: t('mSteps.enterValue') });
                return;
            }
            change.value_string = attributeValueString;
        }

        setAttributePendingChanges((prev) => [...prev, change]);
        setAttributeMessage({ type: 'success', text: t('mSteps.changeAddedToQueue') });
    };

    const submitAttributeEditorChanges = async () => {
        if (!attributeEditorStep) return;
        if (!Array.isArray(attributePendingChanges) || attributePendingChanges.length === 0) {
            setAttributeMessage({ type: 'error', text: t('mSteps.noChangesToSubmit') });
            return;
        }

        try {
            setAttributeSubmitting(true);
            setAttributeMessage(null);
            await maintenanceStepService.addAttributeChanges(attributeEditorStep.maintenance_step_id, attributePendingChanges);
            setAttributeMessage({ type: 'success', text: t('mSteps.attrChangesQueued') });
            setAttributePendingChanges([]);
        } catch (err) {
            console.error(err);
            setAttributeMessage({ type: 'error', text: err.response?.data?.error || t('mSteps.queueAttrChangesError') });
        } finally {
            setAttributeSubmitting(false);
        }
    };

    const loadCurrentAttributeValue = async () => {
        const defId = Number(attributeDefinitionId);
        if (!defId || Number.isNaN(defId)) {
            setAttributeCurrentValue(null);
            return;
        }
        try {
            setAttributeCurrentValueLoading(true);
            let val = null;
            const maintenance = attributeEditorStep?.maintenance;
            const asset = maintenance?.asset;
            if (attributeTargetValue === 'asset') {
                if (asset?.asset_id) {
                    const rows = await assetAttributeValueService.getByAsset(asset.asset_id);
                    val = rows?.find(r => Number(r.attribute_definition_id || r.asset_attribute_definition_id) === defId) || null;
                }
            } else if (attributeTargetValue === 'stock_item') {
                const sid = Number(attributeComponentValue);
                if (sid && !Number.isNaN(sid)) {
                    const rows = await stockItemAttributeValueService.getByStockItem(sid);
                    val = rows?.find(r => Number(r.attribute_definition_id || r.stock_item_attribute_definition_id) === defId) || null;
                }
            } else if (attributeTargetValue === 'consumable') {
                const cid = Number(attributeComponentValue);
                if (cid && !Number.isNaN(cid)) {
                    const rows = await consumableAttributeValueService.getByConsumable(cid);
                    val = rows?.find(r => Number(r.attribute_definition_id || r.consumable_attribute_definition_id) === defId) || null;
                }
            }
            setAttributeCurrentValue(val);
        } catch (err) {
            console.error('Failed to load current attribute value:', err);
            setAttributeCurrentValue(null);
        } finally {
            setAttributeCurrentValueLoading(false);
        }
    };

    const submitExternalMaintenance = async (e) => {
        e.preventDefault();
        if (externalMaintenanceCreated) return;

        try {
            setExternalMaintenanceSubmitting(true);
            setExternalMaintenanceMessage(null);
            await externalMaintenanceService.createForMaintenance(Number(maintenanceId));
            setExternalMaintenanceMessage({ type: 'success', text: t('mSteps.extMaintenanceCreated') });
            setExternalMaintenanceCreated(true);
        } catch (err) {
            console.error(err);
            setExternalMaintenanceMessage({ type: 'error', text: err.response?.data?.error || t('mSteps.createExtMaintenanceError') });
        } finally {
            setExternalMaintenanceSubmitting(false);
        }
    };

    const combinedSteps = useMemo(() => {
        const internal = (Array.isArray(steps) ? steps : []).map((s) => ({
            ...s,
            __step_type: 'internal',
            __key: `internal-${s.maintenance_step_id}`,
        }));
        const external = (Array.isArray(externalSteps) ? externalSteps : []).map((s) => ({
            ...s,
            __step_type: 'external',
            __key: `external-${s.external_maintenance_step_id}`,
        }));

        return [...internal, ...external];
    }, [steps, externalSteps]);

    const translateStepStatus = (status) => {
        if (!status) return '';
        const s = status.toLowerCase().trim();
        const map = {
            'pending': 'mSteps.statusPending',
            'started': 'mSteps.statusStarted',
            'in_progress': 'mSteps.statusInProgress',
            'in progress': 'mSteps.statusInProgress',
            'done': 'mSteps.statusDone',
            'failed': 'mSteps.statusFailed',
            'failed (to be sent to a higher level)': 'mSteps.statusFailedHigherLevel',
            'cancelled': 'mSteps.statusCancelled',
            'pending (waiting for stock item)': 'mSteps.statusWaitingStock',
            'pending (waiting for consumable)': 'mSteps.statusWaitingConsumable',
        };
        const key = map[s];
        if (key) return t(key);
        if (s.includes('progress')) return t('mSteps.statusInProgress');
        if (s.includes('pending') || s.includes('wait')) return t('mSteps.statusPending');
        if (s.includes('fail')) return t('mSteps.statusFailed');
        if (s.includes('cancel')) return t('mSteps.statusCancelled');
        if (s.includes('done') || s.includes('complet')) return t('mSteps.statusDone');
        return status;
    };

    const getExternalStatusLabel = (step) => {
        if (!step) return '-';
        if (!step.end_datetime) return t('mSteps.statusInProgress');
        if (step.is_successful === true) return t('mSteps.statusDone');
        if (step.is_successful === false) return t('mSteps.statusFailed');
        return t('mSteps.statusDone');
    };

    const getExternalStatusLabelRaw = (step) => {
        if (!step) return '-';
        if (!step.end_datetime) return 'in progress';
        if (step.is_successful === true) return 'done';
        if (step.is_successful === false) return 'failed';
        return 'done';
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

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const locale = i18n.language === 'ar' ? 'ar-DZ' : 'en-US';
        return new Date(dateString).toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getLocalizedField = (obj, fieldName) => {
        const lang = i18n.language;
        if (lang === 'ar') {
            return obj?.[fieldName + '_ar'] || obj?.[fieldName] || '';
        }
        return obj?.[fieldName + '_en'] || obj?.[fieldName] || '';
    };

    const getLocalizedPersonName = (person) => {
        if (!person) return '';
        const lang = i18n.language;
        const fnAr = person.first_name_ar || person.first_name || '';
        const lnAr = person.last_name_ar || person.last_name || '';
        const fnEn = person.first_name_en || person.first_name || '';
        const lnEn = person.last_name_en || person.last_name || '';
        const nameAr = `${fnAr} ${lnAr}`.trim();
        const nameEn = `${fnEn} ${lnEn}`.trim();
        if (lang === 'ar') {
            return nameAr === nameEn ? nameAr : `${nameAr} (${nameEn})`;
        }
        return nameEn === nameAr ? nameEn : `${nameEn} (${nameAr})`;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch both IT technicians and network maintenance technicians
            const [stepsData, externalStepsData, typicalStepsData, techniciansData, chiefsData, networkTechsData, externalMaintenancesData, externalTypicalStepsData, pendingReturn] = await Promise.all([
                maintenanceStepService.getAll({ maintenance: maintenanceId }),
                externalMaintenanceStepService.getAll({ maintenance: maintenanceId }),
                maintenanceTypicalStepService.getAll(),
                personService.getAll({ role: 'it_maintenance_technician' }),
                isChief ? personService.getAll({ role: 'maintenance_chief' }) : Promise.resolve([]),
                personService.getAll({ role: 'network_maintenance_technician' }),
                externalMaintenanceService.getAll({ maintenance: maintenanceId }),
                externalMaintenanceTypicalStepService.getAll(),
                isMainTechnician ? maintenanceService.pendingReturnToOwnerExists(Number(maintenanceId)).catch(() => ({ exists: false })) : Promise.resolve({ exists: false }),
            ]);
            setSteps(stepsData);
            setStepsWithItemRequest((prev) => {
                const terminal = new Set(['done', 'failed (to be sent to a higher level)', 'cancelled']);
                const stepIds = new Set(
                    (Array.isArray(stepsData) ? stepsData : [])
                        .filter((s) => s?.maintenance_step_id && !terminal.has(s.maintenance_step_status))
                        .map((s) => s.maintenance_step_id)
                );
                return prev.filter((id) => stepIds.has(id));
            });
            if (typeof onStepsChange === 'function') {
                onStepsChange(Array.isArray(stepsData) ? stepsData : []);
            }
            setExternalSteps(Array.isArray(externalStepsData) ? externalStepsData : []);
            setTypicalSteps(typicalStepsData);
            // Combine technicians, network technicians, and chiefs, removing duplicates
            const combinedPeople = [...(Array.isArray(techniciansData) ? techniciansData : [])];
            if (Array.isArray(networkTechsData)) {
                networkTechsData.forEach(tech => {
                    if (!combinedPeople.some(p => p.person_id === tech.person_id)) {
                        combinedPeople.push(tech);
                    }
                });
            }
            if (Array.isArray(chiefsData)) {
                chiefsData.forEach(chief => {
                    if (!combinedPeople.some(p => p.person_id === chief.person_id)) {
                        combinedPeople.push(chief);
                    }
                });
            }
            setTechnicians(combinedPeople);
            setExternalMaintenances(Array.isArray(externalMaintenancesData) ? externalMaintenancesData : []);
            setExternalMaintenanceTypicalSteps(Array.isArray(externalTypicalStepsData) ? externalTypicalStepsData : []);
            setReturnMaintenancePendingExists(Boolean(pendingReturn?.exists));

            try {
                const conds = await physicalConditionService.getAll();
                setPhysicalConditions(Array.isArray(conds) ? conds : []);
            } catch (err) {
                console.error(err);
                setPhysicalConditions([]);
            }

            const [stockTypes, consumableTypesData] = await Promise.all([
                stockItemTypeService.getAll(),
                consumableTypeService.getAll(),
            ]);
            setStockItemTypes(Array.isArray(stockTypes) ? stockTypes : []);
            setConsumableTypes(Array.isArray(consumableTypesData) ? consumableTypesData : []);
        } catch (err) {
            console.error(err);
            setError(t('mSteps.loadStepsError'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddStep = async (e) => {
        e.preventDefault();
        if (hasOngoingExternalMaintenance) {
            setError('Cannot create maintenance steps while the asset has an ongoing external maintenance.');
            return;
        }
        if (!newStepTypicalId) return;

        try {
            await maintenanceStepService.create({
                maintenance: maintenanceId,
                maintenance_typical_step_id: newStepTypicalId,
                person_id: newStepPersonId || (isMainTechnician ? user.person.person_id : null),
                note: newStepNote || undefined,
                // Default to current user if they are the main tech and didn't select anyone?
                // Actually, if it's main tech adding, they might assign themselves or someone else.
                // If person_id is empty, backend might complain or we should handle it.
                // Let's enforce selection if we can, or default to unassigned if allowed (but backend model has Person NOT NULL usually?)
                // Checking models... MaintenanceStep.person is NOT NULL.
                // So we MUST send a person_id.
            });
            closeAddStepModal();
            loadData();
        } catch (err) {
            console.error(err);
            const apiMsg = err?.response?.data?.error;
            setError(apiMsg || t('mSteps.addStepError'));
        }
    };

    const handleUpdateStatus = async (step, statusValue) => {
        try {
            if (maintenanceEnded) {
                setError(t('mSteps.maintenanceEnded'));
                return;
            }
            await maintenanceStepService.patch(step.maintenance_step_id, {
                maintenance_step_status: statusValue,
            });
            loadData();
        } catch (err) {
            console.error(err);
            setError(t('mSteps.updateStatusError'));
        }
    };

    const openStatusEditor = (step) => {
        if (maintenanceEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }
        setStatusEditorStepId(step.maintenance_step_id);
        if (step.maintenance_step_status === 'started') {
            setStatusEditorValue('');
        } else {
            setStatusEditorValue(step.maintenance_step_status || '');
        }
    };

    const closeStatusEditor = () => {
        setStatusEditorStepId(null);
        setStatusEditorValue('');
        setStatusSaving(false);
    };

    const closeRequestEditor = () => {
        setRequestEditorOpen(false);
        setRequestEditorType(null);
        setRequestEditorStep(null);
        setRequestTypeId('');
        setRequestModelId('');
        setRequestModels([]);
        setRequestSubmitting(false);
        setRequestMessage(null);
    };

    const closeRemoveEditor = () => {
        setRemoveEditorOpen(false);
        setRemoveEditorStep(null);
        setRemoveComponents({ stock_items: [], consumables: [] });
        setRemoveSelectedType('');
        setRemoveSelectedId('');
        setRemoveLocations([]);
        setRemoveDestinationLocationId('');
        setRemoveLoading(false);
        setRemoveSubmitting(false);
    };

    const closeReturnMaintenance = () => {
        setReturnMaintenanceOpen(false);
        setReturnMaintenanceDestinationLocationId('');
        setReturnMaintenanceLocations([]);
        setReturnMaintenanceLoading(false);
        setReturnMaintenanceSubmitting(false);
    };

    const openReturnMaintenance = async (opts = {}) => {
        const ignoreEnded = Boolean(opts.ignoreMaintenanceEnded);
        if (maintenanceEnded && !ignoreEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }
        setReturnMaintenanceOpen(true);
        setReturnMaintenanceDestinationLocationId('');
        setReturnMaintenanceLocations([]);
        try {
            setReturnMaintenanceLoading(true);
            const [locations, defaultLocation] = await Promise.all([
                locationService.getAll(),
                maintenanceService.returnToOwnerDefaultLocation(Number(maintenanceId)).catch(() => ({ destination_location_id: null })),
            ]);
            setReturnMaintenanceLocations(Array.isArray(locations) ? locations : []);
            const suggestedId = defaultLocation?.destination_location_id;
            if (suggestedId != null && suggestedId !== '') {
                setReturnMaintenanceDestinationLocationId(String(suggestedId));
            }
        } catch (err) {
            console.error(err);
            setError(t('mSteps.loadLocationsError'));
            closeReturnMaintenance();
        } finally {
            setReturnMaintenanceLoading(false);
        }
    };

    const submitReturnMaintenance = async () => {
        if (!maintenanceId) return;
        if (!returnMaintenanceDestinationLocationId) {
            setError(t('mSteps.selectDestinationLocation'));
            return;
        }
        try {
            setReturnMaintenanceSubmitting(true);
            setError('');
            await maintenanceService.requestReturnToOwner(Number(maintenanceId), {
                destination_location_id: Number(returnMaintenanceDestinationLocationId),
            });
            await loadData();
            closeReturnMaintenance();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.requestReturnError'));
        } finally {
            setReturnMaintenanceSubmitting(false);
        }
    };

    const closeAssetConditionEditor = () => {
        setAssetConditionEditorOpen(false);
        setAssetConditionEditorStep(null);
        setSelectedConditionId('');
        setAssetConditionNotes('');
        setAssetConditionCosmeticIssues('');
        setAssetConditionFunctionalIssues('');
        setAssetConditionRecommendation('');
        setAssetConditionSubmitting(false);
    };

    const closeAttributeEditor = () => {
        setAttributeEditorOpen(false);
        setAttributeEditorStep(null);
        setAttributeEditorComponents({ stock_items: [], consumables: [] });
        setAttributeTargetValue('asset');
        setAttributeComponentValue('');
        setAttributeDefinitionId('');
        setAttributeValueString('');
        setAttributeValueBool(false);
        setAttributeValueNumber('');
        setAttributeValueDate('');
        setAttributePendingChanges([]);
        setAttributeSubmitting(false);
        setAttributeMessage(null);
        setAttributeCurrentValue(null);
        setAttributeCurrentValueLoading(false);
    };

    useEffect(() => {
        if (!attributeEditorOpen) return;
        loadCurrentAttributeValue();
    }, [attributeDefinitionId, attributeTargetValue, attributeComponentValue, attributeEditorStep]);

    const openAssetConditionEditor = (step) => {
        if (maintenanceEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }
        setAssetConditionEditorOpen(true);
        setAssetConditionEditorStep(step);
        setSelectedConditionId('');
        setAssetConditionNotes('');
        setAssetConditionCosmeticIssues('');
        setAssetConditionFunctionalIssues('');
        setAssetConditionRecommendation('');
        setAssetConditionSubmitting(false);
    };

    const submitAssetConditionEditor = async () => {
        if (!assetConditionEditorStep) return;
        if (!selectedConditionId) {
            setError(t('mSteps.selectCondition'));
            return;
        }
        try {
            setAssetConditionSubmitting(true);
            await maintenanceStepService.updateAssetCondition(assetConditionEditorStep.maintenance_step_id, {
                condition_id: Number(selectedConditionId),
                notes: assetConditionNotes || null,
                cosmetic_issues: assetConditionCosmeticIssues || null,
                functional_issues: assetConditionFunctionalIssues || null,
                recommendation: assetConditionRecommendation || null,
            });
            await loadData();
            closeAssetConditionEditor();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.updateConditionError'));
        } finally {
            setAssetConditionSubmitting(false);
        }
    };

    const openRemoveEditor = async (step) => {
        if (maintenanceEnded) {
            setError(t('mSteps.maintenanceEnded'));
            return;
        }
        setRemoveEditorOpen(true);
        setRemoveEditorStep(step);
        setRemoveComponents({ stock_items: [], consumables: [] });
        setRemoveSelectedType('');
        setRemoveSelectedId('');
        setRemoveLocations([]);
        setRemoveDestinationLocationId('');

        try {
            setRemoveLoading(true);
            await handleUpdateStatus(step, 'In Progress');
            const [data, locations] = await Promise.all([
                maintenanceStepService.getComponents(step.maintenance_step_id),
                locationService.getAll(),
            ]);
            setRemoveComponents({
                stock_items: Array.isArray(data?.stock_items) ? data.stock_items : [],
                consumables: Array.isArray(data?.consumables) ? data.consumables : [],
            });
            setRemoveLocations(Array.isArray(locations) ? locations : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.loadComponentsError'));
            closeRemoveEditor();
        } finally {
            setRemoveLoading(false);
        }
    };

    const submitRemoveEditor = async () => {
        if (!removeEditorStep) return;
        if (!removeSelectedType || !removeSelectedId) {
            setError(t('mSteps.selectComponentToRemove'));
            return;
        }
        try {
            setRemoveSubmitting(true);
            const payload = {
                component_type: removeSelectedType,
                component_id: Number(removeSelectedId),
            };
            if (removeDestinationLocationId) {
                payload.destination_location_id = Number(removeDestinationLocationId);
            }
            await maintenanceStepService.removeComponent(removeEditorStep.maintenance_step_id, payload);
            await loadData();
            closeRemoveEditor();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.removeComponentError'));
        } finally {
            setRemoveSubmitting(false);
        }
    };

    const openRequestEditor = (step, requestType) => {
        if (stepsWithItemRequest.includes(step?.maintenance_step_id)) {
            setError(t('mSteps.alreadyHasItemRequest'));
            return;
        }
        setRequestEditorOpen(true);
        setRequestEditorType(requestType);
        setRequestEditorStep(step);
        setRequestTypeId('');
        setRequestModelId('');
        setRequestModels([]);
        setRequestSubmitting(false);
        setRequestMessage(null);
    };

    const saveStatusEditor = async (step) => {
        try {
            setStatusSaving(true);
            if (statusEditorValue === 'pending (waiting for stock item)') {
                closeStatusEditor();
                openRequestEditor(step, 'stock_item');
                return;
            }
            if (statusEditorValue === 'pending (waiting for consumable)') {
                closeStatusEditor();
                openRequestEditor(step, 'consumable');
                return;
            }

            await handleUpdateStatus(step, statusEditorValue);
            closeStatusEditor();
        } finally {
            setStatusSaving(false);
        }
    };

    const loadModelsForRequestType = async (requestType, typeIdValue) => {
        try {
            const typeId = Number(typeIdValue);
            if (!typeId || Number.isNaN(typeId)) {
                setRequestModels([]);
                return;
            }
            if (requestType === 'stock_item') {
                const models = await stockItemModelService.getByStockItemType(typeId);
                setRequestModels(Array.isArray(models) ? models : []);
                return;
            }
            if (requestType === 'consumable') {
                const models = await consumableModelService.getByConsumableType(typeId);
                setRequestModels(Array.isArray(models) ? models : []);
            }
        } catch (err) {
            console.error(err);
            setRequestModels([]);
        }
    };

    const submitRequestEditor = async () => {
        if (!requestEditorStep || !requestEditorType) return;
        if (stepsWithItemRequest.includes(requestEditorStep.maintenance_step_id)) {
            setRequestMessage({ type: 'error', text: t('mSteps.alreadyHasItemRequest') });
            return;
        }
        if (!requestModelId) {
            setRequestMessage({ type: 'error', text: t('mSteps.selectModel') });
            return;
        }

        try {
            setRequestSubmitting(true);
            setRequestMessage(null);

            if (requestEditorType === 'stock_item') {
                await maintenanceStepService.requestStockItem(requestEditorStep.maintenance_step_id, {
                    requested_stock_item_model_id: Number(requestModelId),
                });
            } else if (requestEditorType === 'consumable') {
                await maintenanceStepService.requestConsumable(requestEditorStep.maintenance_step_id, {
                    requested_consumable_model_id: Number(requestModelId),
                });
            } else {
                setRequestMessage({ type: 'error', text: t('mSteps.invalidRequestType') });
                return;
            }

            setRequestMessage({ type: 'success', text: t('mSteps.requestCreated') });
            setStepsWithItemRequest((prev) => {
                const stepId = requestEditorStep.maintenance_step_id;
                if (!stepId) return prev;
                if (prev.includes(stepId)) return prev;
                return [...prev, stepId];
            });
            await loadData();
        } catch (err) {
            console.error(err);
            setRequestMessage({ type: 'error', text: err.response?.data?.error || t('mSteps.createRequestError') });
        } finally {
            setRequestSubmitting(false);
        }
    };

    const promptFromList = (label, items, getId, getLabel) => {
        if (!items || items.length === 0) {
            return window.prompt(`${label} id:`);
        }

        const options = items
            .map(it => `${getId(it)}: ${getLabel(it)}`)
            .join('\n');
        return window.prompt(`${label} id:\n${options}`);
    };

    const requestStockItem = async (step) => {
        if (stepsWithItemRequest.includes(step?.maintenance_step_id)) {
            setError(t('mSteps.alreadyHasItemRequest'));
            return;
        }
        try {
            const stockItemTypeId = promptFromList(
                t('mSteps.stockItemTypePrompt'),
                stockItemTypes,
                (t) => t.stock_item_type_id,
                (t) => getLocalizedField(t, 'stock_item_type_label'),
            );
            if (!stockItemTypeId) return;

            const models = await stockItemModelService.getByStockItemType(Number(stockItemTypeId));
            const requestedModelId = promptFromList(
                t('mSteps.stockItemModelPrompt'),
                Array.isArray(models) ? models : [],
                (m) => m.stock_item_model_id,
                (m) => `${m.model_name}${m.model_code ? ` (${m.model_code})` : ''}`,
            );
            if (!requestedModelId) return;

            await maintenanceStepService.requestStockItem(step.maintenance_step_id, {
                requested_stock_item_model_id: Number(requestedModelId),
            });
            loadData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.requestStockItemError'));
        }
    };

    const requestConsumable = async (step) => {
        if (stepsWithItemRequest.includes(step?.maintenance_step_id)) {
            setError(t('mSteps.alreadyHasItemRequest'));
            return;
        }
        try {
            const consumableTypeId = promptFromList(
                t('mSteps.consumableTypePrompt'),
                consumableTypes,
                (t) => t.consumable_type_id,
                (t) => getLocalizedField(t, 'consumable_type_label'),
            );
            if (!consumableTypeId) return;

            const models = await consumableModelService.getByConsumableType(Number(consumableTypeId));
            const requestedModelId = promptFromList(
                t('mSteps.consumableModelPrompt'),
                Array.isArray(models) ? models : [],
                (m) => m.consumable_model_id,
                (m) => `${m.model_name}${m.model_code ? ` (${m.model_code})` : ''}`,
            );
            if (!requestedModelId) return;

            await maintenanceStepService.requestConsumable(step.maintenance_step_id, {
                requested_consumable_model_id: Number(requestedModelId),
            });
            loadData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('mSteps.requestConsumableError'));
        }
    };

    const handleAssignPerson = async (step, personId) => {
        try {
            await maintenanceStepService.patch(step.maintenance_step_id, {
                person_id: personId
            });
            loadData();
        } catch (err) {
            console.error(err);
            setError(t('mSteps.reassignStepError'));
        }
    };

    return (
        <div className="maintenance-steps-container p-4 border-t" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
            <div className="card" style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)', boxShadow: 'var(--glass-shadow)' }}>
                <div className="card-body p-3">
                    <div
                        className="d-flex justify-content-between align-items-center mb-3"
                        style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <h3 className="text-lg font-bold mb-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ListChecks size={18} style={{ color: 'var(--color-primary)' }} />
                            {t('mSteps.title')}
                        </h3>
                        <div style={{ display: 'flex', gap: 6, marginInlineStart: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {!!canShowEndMaintenanceButton && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        if (typeof onEndMaintenance === 'function') {
                                            onEndMaintenance();
                                        }
                                    }}
                                    disabled={!!endMaintenanceDisabled}
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    title={t('mSteps.endMaintenance')}
                                    aria-label={t('mSteps.endMaintenance')}
                                >
                                    <Power size={14} />
                                </button>
                            )}

                            {canCreateExternalMaintenance && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        if (hasOpenExternalMaintenance) {
                                            setError(t('mSteps.cannotCreateOpenExt'));
                                            return;
                                        }
                                        openExternalMaintenanceModal();
                                    }}
                                    disabled={loading || hasOpenExternalMaintenance}
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    title={t('mSteps.createExtMaintenance')}
                                    aria-label={t('mSteps.createExtMaintenance')}
                                >
                                    <Box size={14} />
                                </button>
                            )}
                            {canCreateExternalMaintenance && Array.isArray(externalMaintenances) && externalMaintenances.length > 0 && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => openExternalStepModal()}
                                    disabled={loading}
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    title={t('mSteps.createExtStep')}
                                    aria-label={t('mSteps.createExtStep')}
                                >
                                    <PlusSquare size={14} />
                                </button>
                            )}
                            {canManageSteps && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        if (maintenanceEnded) {
                                            setError(t('mSteps.maintenanceEnded'));
                                            return;
                                        }
                                        if (hasOngoingExternalMaintenance) {
                                            setError(t('mSteps.cannotCreateStepOngoingExt'));
                                            return;
                                        }
                                        setAddingStep(true);
                                    }}
                                    disabled={loading || hasOngoingExternalMaintenance || maintenanceEnded}
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    title={t('mSteps.createStep')}
                                    aria-label={t('mSteps.createStep')}
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {externalMaintenanceModalOpen && canCreateExternalMaintenance && (
                        <ModalPortal>
                            <div className="modal-overlay" onClick={() => closeExternalMaintenanceModal()}>
                                <div
                                    className="modal"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        maxHeight: '95vh',
                                        width: '90%',
                                        maxWidth: '480px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <div className="modal-header">
                                        <h3 className="modal-title">{t('mSteps.createExtMaintenance')}</h3>
                                        <button className="modal-close" onClick={() => closeExternalMaintenanceModal()}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitExternalMaintenance} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                        <div className="modal-body" style={{ overflowY: 'visible', flex: 1 }}>
                                            {externalMaintenanceMessage && (
                                                <div className={`alert ${externalMaintenanceMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
                                                    {externalMaintenanceMessage.text}
                                                </div>
                                            )}
                                            <div className="alert alert-info mb-0">
                                                {t('mSteps.extMaintenanceInfo')}
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => closeExternalMaintenanceModal()}>
                                                {t('mSteps.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={externalMaintenanceSubmitting || externalMaintenanceCreated}
                                            >
                                                {t('mSteps.create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </ModalPortal>
                    )}

                    {externalStepModalOpen && canCreateExternalMaintenance && (
                        <ModalPortal>
                            <div className="modal-overlay" onClick={() => closeExternalStepModal()}>
                                <div
                                    className="modal"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        maxHeight: '95vh',
                                        width: '90%',
                                        maxWidth: '480px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <div className="modal-header">
                                        <h3 className="modal-title">{t('mSteps.createExtStep')}</h3>
                                        <button className="modal-close" onClick={() => closeExternalStepModal()}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitCreateExternalStep} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                        <div className="modal-body" style={{ overflowY: 'visible', flex: 1 }}>
                                            {externalStepMessage && (
                                                <div className={`alert ${externalStepMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
                                                    {externalStepMessage.text}
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <label className="form-label">{t('mSteps.typicalStep')}</label>
                                                <select
                                                    className="form-input"
                                                    value={externalStepTypicalStepId}
                                                    onChange={(e) => setExternalStepTypicalStepId(e.target.value)}
                                                    disabled={externalStepSubmitting}
                                                    required
                                                >
                                                    <option value="">{t('mSteps.selectTypicalStepPlaceholder')}</option>
                                                    {externalMaintenanceTypicalSteps.map((ts) => (
                                                        <option key={ts.external_maintenance_typical_step_id} value={ts.external_maintenance_typical_step_id}>
                                                            {getLocalizedField(ts, 'description')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => closeExternalStepModal()}>
                                                {t('mSteps.cancel')}
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={externalStepSubmitting}>
                                                {externalStepSubmitting ? t('mSteps.creating') : t('mSteps.create')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </ModalPortal>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}

            {addingStep && canManageSteps && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => closeAddStepModal()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '95vh',
                                width: '90%',
                                maxWidth: '560px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">{t('mSteps.createStep')}</h3>
                                <button className="modal-close" onClick={() => closeAddStepModal()}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddStep} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: 'visible', flex: 1 }}>
                                    <div className="form-group">
                                        <label className="form-label">{t('mSteps.typicalStep')}</label>
                                        <SearchableSelect
                                            value={newStepTypicalId}
                                            onChange={(e) => setNewStepTypicalId(e.target.value)}
                                            options={typicalSteps
                                                .filter(ts => {
                                                    if (isChief) return true;
                                                    if (isNetworkMaintenanceTechnician) return ts.maintenance_domain === 'network';
                                                    if (isItMaintenanceTechnician) return ts.maintenance_domain === 'it';
                                                    return false;
                                                })
                                                .map((ts) => ({
                                                    value: ts.maintenance_typical_step_id,
                                                    label: getLocalizedField(ts, 'description'),
                                                }))}
                                            placeholder={t('mSteps.selectTask')}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('mSteps.assignTo')}</label>
                                        <select
                                            className="form-input"
                                            value={newStepPersonId}
                                            onChange={(e) => setNewStepPersonId(e.target.value)}
                                            required
                                        >
                                            <option value="">{t('mSteps.selectPerson')}</option>
                                            {technicians
                                                .filter(tech => {
                                                    if (isChief) return true;
                                                    
                                                    const techRole = tech.role_code;
                                                    if (isNetworkMaintenanceTechnician) {
                                                        return techRole === 'network_maintenance_technician';
                                                    }
                                                    if (isItMaintenanceTechnician) {
                                                        return techRole === 'it_maintenance_technician';
                                                    }
                                                    return false;
                                                })
                                                .map((tech) => (
                                                    <option key={tech.person_id} value={tech.person_id}>
                                                        {getLocalizedPersonName(tech)}
                                                        {tech.role_code === 'maintenance_chief' ? ` (${t('mSteps.chief')})` : ''}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">{t('mSteps.note')}</label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={newStepNote}
                                            onChange={(e) => setNewStepNote(e.target.value)}
                                            maxLength={1024}
                                            placeholder={t('mSteps.notePlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => closeAddStepModal()}>
                                        {t('mSteps.cancel')}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {t('mSteps.create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}

                    {/* Steps List - Compact Row View */}
                    {loading && combinedSteps.length === 0 ? (
                        <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>{t('mSteps.loadingSteps')}</div>
                    ) : combinedSteps.length === 0 ? (
                        <div className="empty-state p-4 text-center rounded border" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', marginTop: 12, backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
                            <p>{t('mSteps.noStepsYet')}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}>
                            {combinedSteps.map((step, idx) => {
                                const isInternal = step.__step_type === 'internal';
                                const description = isInternal
                                    ? (getLocalizedField(step.maintenance_typical_step, 'description') || `${t('mSteps.step')} ${step.maintenance_step_id}`)
                                    : (getLocalizedField(step, 'external_maintenance_typical_step_description') || `${t('mSteps.externalStep')} ${step.external_maintenance_step_id}`);
                                const assignedTo = isInternal
                                    ? (getLocalizedPersonName(step.person) || t('mSteps.noPerson'))
                                    : (step.external_maintenance_provider_name || t('mSteps.externalProvider'));
                                const statusRaw = isInternal
                                    ? (step.maintenance_step_status || '-')
                                    : getExternalStatusLabelRaw(step);
                                const status = isInternal
                                    ? translateStepStatus(step.maintenance_step_status)
                                    : getExternalStatusLabel(step);
                                const statusColor = isInternal
                                    ? getStatusColor(step.maintenance_step_status)
                                    : getStatusColor(getExternalStatusLabelRaw(step));
                                const isActive = ['in_progress', 'started', 'pending', 'waiting'].some(s => (statusRaw || '').toLowerCase().includes(s));
                                const typeColor = isInternal ? 'var(--color-info)' : 'var(--color-warning)';

                                return (
                                    <div
                                        key={step.__key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '0.75rem',
                                            padding: '0.75rem 0.75rem',
                                            borderBottom: idx < combinedSteps.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            borderInlineStart: `3px solid ${statusColor}`,
                                            transition: 'background 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        {/* Status dot + type indicator */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.15rem', minWidth: 32, gap: '0.2rem' }}>
                                            <div style={{
                                                width: 10, height: 10, borderRadius: '50%',
                                                background: statusColor,
                                                boxShadow: isActive ? `0 0 0 3px ${statusColor}33` : 'none',
                                                flexShrink: 0,
                                            }} />
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                color: typeColor, lineHeight: 1,
                                            }}>
                                                {isInternal ? t('mSteps.intLabel') : t('mSteps.extLabel')}
                                            </span>
                                        </div>

                                        {/* Main content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Row 1: Description + Status pill */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>
                                                    {description}
                                                </span>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                                    padding: '0.1rem 0.5rem', borderRadius: '9999px',
                                                    fontSize: 'var(--font-size-xs)', fontWeight: 600,
                                                    color: statusColor, background: `${statusColor}18`,
                                                }}>
                                                    {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusColor, animation: 'pulse 2s infinite' }} />}
                                                    {status}
                                                </span>
                                            </div>

                                            {/* Row 2: Icon-based inline meta */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                    <User size={13} style={{ opacity: 0.6 }} />
                                                    {assignedTo || '-'}
                                                </span>
                                                {isInternal && step.start_datetime && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                        <Calendar size={13} style={{ opacity: 0.6 }} />
                                                        {formatDateTime(step.start_datetime)}
                                                        {step.end_datetime && (
                                                            <>
                                                                <span style={{ opacity: 0.4, margin: '0 0.1rem' }}>→</span>
                                                                {formatDateTime(step.end_datetime)}
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Row 3: Note (if present) */}
                                            {step.note && (
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', marginTop: '0.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', opacity: 0.85 }}>
                                                    <FileText size={13} style={{ flexShrink: 0, marginTop: '0.1rem', opacity: 0.6 }} />
                                                    <span style={{ overflowWrap: 'break-word' }}>{step.note}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {isInternal && !maintenanceEnded && (isAssignedTechnician || isChief) && canOperateStep(step) && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                                                {step.maintenance_step_status !== 'done' && (
                                                    <>
                                                        <button
                                                            className="btn btn-xs btn-secondary"
                                                            style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
                                                            onClick={() => openStatusEditor(step)}
                                                            title={t('mSteps.updateStatus')}
                                                            aria-label={t('mSteps.updateStatus')}
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-secondary"
                                                            style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
                                                            onClick={() => openAttributeEditor(step)}
                                                            title={t('mSteps.queueAttrChanges')}
                                                            aria-label={t('mSteps.queueAttrChanges')}
                                                        >
                                                            <ListChecks size={15} />
                                                        </button>
                                                        <button
                                                            className="btn btn-xs btn-secondary"
                                                            style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--color-text-secondary)' }}
                                                            onClick={() => openAssetConditionEditor(step)}
                                                            title={t('mSteps.updateAssetCondition')}
                                                            aria-label={t('mSteps.updateAssetCondition')}
                                                        >
                                                            <Lightbulb size={15} />
                                                        </button>
                                                    </>
                                                )}
                                                {step.maintenance_step_status !== 'done' && step.maintenance_typical_step?.operation_type === 'remove' && (
                                                    <button
                                                        className="btn btn-xs btn-danger"
                                                        style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: 'var(--color-error)' }}
                                                        onClick={() => openRemoveEditor(step)}
                                                        disabled={removeLoading || removeSubmitting}
                                                        title={t('mSteps.removeComponent')}
                                                        aria-label={t('mSteps.removeComponent')}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {requestEditorOpen && requestEditorStep && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        insetInlineEnd: 20,
                        bottom: 20,
                        zIndex: 50,
                        width: 420,
                        padding: 'var(--space-4)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-backdrop)',
                        WebkitBackdropFilter: 'var(--glass-backdrop)',
                        boxShadow: 'var(--glass-shadow)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>
                            {requestEditorType === 'stock_item' ? t('mSteps.requestStockItem') : t('mSteps.requestConsumable')}
                        </div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeRequestEditor}
                            disabled={requestSubmitting}
                        >
                            {t('mSteps.close')}
                        </button>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                        {t('mSteps.step')}: <b>{requestEditorStep.maintenance_step_id}</b>
                    </div>

                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label">{t('mSteps.type')}</label>
                        <select
                            className="form-input"
                            value={requestTypeId}
                            onChange={async (e) => {
                                const value = e.target.value;
                                setRequestTypeId(value);
                                setRequestModelId('');
                                setRequestMessage(null);
                                await loadModelsForRequestType(requestEditorType, value);
                            }}
                            disabled={requestSubmitting}
                        >
                            <option value="">{t('mSteps.selectType')}</option>
                            {(requestEditorType === 'stock_item' ? stockItemTypes : consumableTypes).map((t) => (
                                <option
                                    key={requestEditorType === 'stock_item' ? t.stock_item_type_id : t.consumable_type_id}
                                    value={requestEditorType === 'stock_item' ? t.stock_item_type_id : t.consumable_type_id}
                                >
                                    {requestEditorType === 'stock_item' ? getLocalizedField(t, 'stock_item_type_label') : getLocalizedField(t, 'consumable_type_label')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label">{t('mSteps.model')}</label>
                        <select
                            className="form-input"
                            value={requestModelId}
                            onChange={(e) => {
                                setRequestModelId(e.target.value);
                                setRequestMessage(null);
                            }}
                            disabled={requestSubmitting || !requestTypeId}
                        >
                            <option value="">{t('mSteps.selectModelPlaceholder')}</option>
                            {requestModels.map((m) => (
                                <option
                                    key={requestEditorType === 'stock_item' ? m.stock_item_model_id : m.consumable_model_id}
                                    value={requestEditorType === 'stock_item' ? m.stock_item_model_id : m.consumable_model_id}
                                >
                                    {m.model_name}{m.model_code ? ` (${m.model_code})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {requestMessage && (
                        <div
                            className={requestMessage.type === 'success' ? 'badge badge-success' : 'badge badge-danger'}
                            style={{
                                padding: 'var(--space-3)',
                                width: '100%',
                                marginBottom: 10,
                                borderRadius: 'var(--radius-md)',
                                display: 'block',
                            }}
                        >
                            {requestMessage.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 10 }}>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={submitRequestEditor}
                            disabled={requestSubmitting || !requestModelId}
                        >
                            {requestSubmitting ? t('mSteps.requesting') : t('mSteps.submitRequest')}
                        </button>
                    </div>
                </div>
            )}

            {statusEditorStepId && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => closeStatusEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '95vh',
                                width: '90%',
                                maxWidth: '480px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">{t('mSteps.updateStatus')}</h3>
                                <button className="modal-close" onClick={() => closeStatusEditor()} disabled={statusSaving}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'visible', flex: 1 }}>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.status')}</label>
                                    <select
                                        className="form-input"
                                        value={statusEditorValue}
                                        onChange={(e) => setStatusEditorValue(e.target.value)}
                                        disabled={statusSaving}
                                    >
                                        <option value="">{t('mSteps.selectStatus')}</option>
                                        {getAllowedStepStatusOptions(
                                            steps.find((s) => s.maintenance_step_id === statusEditorStepId)?.maintenance_step_status,
                                        ).map((s) => (
                                            <option key={s} value={s}>
                                                {translateStepStatus(s)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => closeStatusEditor()} disabled={statusSaving}>
                                    {t('mSteps.cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        const step = steps.find((s) => s.maintenance_step_id === statusEditorStepId);
                                        if (step) saveStatusEditor(step);
                                    }}
                                    disabled={statusSaving || !statusEditorValue}
                                >
                                    {statusSaving ? t('mSteps.saving') : t('mSteps.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {returnEditorOpen && returnEditorStep && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        insetInlineEnd: 20,
                        bottom: 20,
                        zIndex: 50,
                        width: 520,
                        padding: 'var(--space-4)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-backdrop)',
                        WebkitBackdropFilter: 'var(--glass-backdrop)',
                        boxShadow: 'var(--glass-shadow)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>{t('mSteps.returnComponentToOwner')}</div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeReturnEditor}
                            disabled={returnSubmitting}
                        >
                            {t('mSteps.close')}
                        </button>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                        {t('mSteps.step')}: <b>{returnEditorStep.maintenance_step_id}</b>
                    </div>

                    {returnLoading ? (
                        <div style={{ fontSize: 13, opacity: 0.85 }}>{t('mSteps.loadingComponents')}</div>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">{t('mSteps.component')}</label>
                                <select
                                    className="form-input"
                                    value={returnSelectedType && returnSelectedId ? `${returnSelectedType}:${returnSelectedId}` : ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value) {
                                            setReturnSelectedType('');
                                            setReturnSelectedId('');
                                            return;
                                        }
                                        const [t, id] = value.split(':');
                                        setReturnSelectedType(t);
                                        setReturnSelectedId(id);
                                    }}
                                >
                                    <option value="">{t('mSteps.selectComponentPlaceholder')}</option>

                                    {returnComponents.stock_items?.length > 0 && (
                                        <optgroup label={t('mSteps.stockItems')}>
                                            {returnComponents.stock_items.map((it) => (
                                                <option key={`stock_item:${it.stock_item_id}`} value={`stock_item:${it.stock_item_id}`}>
                                                    {it.stock_item_inventory_number ? `${it.stock_item_inventory_number} - ` : ''}{it.stock_item_name || `${t('mSteps.stockItem')} ${it.stock_item_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {returnComponents.consumables?.length > 0 && (
                                        <optgroup label={t('mSteps.consumables')}>
                                            {returnComponents.consumables.map((it) => (
                                                <option key={`consumable:${it.consumable_id}`} value={`consumable:${it.consumable_id}`}>
                                                    {it.consumable_inventory_number ? `${it.consumable_inventory_number} - ` : ''}{it.consumable_name || `${t('mSteps.consumable')} ${it.consumable_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div className="alert alert-info" style={{ fontSize: 12, marginBottom: 10 }}>
                                {t('mSteps.returnComponentInfo')}
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                                <button
                                    className="btn btn-xs btn-secondary"
                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                    onClick={closeReturnEditor}
                                    disabled={returnSubmitting}
                                >
                                    {t('mSteps.cancel')}
                                </button>
                                <button
                                    className="btn btn-xs btn-primary"
                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                    onClick={submitReturnEditor}
                                    disabled={returnSubmitting || !returnSelectedType || !returnSelectedId}
                                >
                                    {returnSubmitting ? t('mSteps.submitting') : t('mSteps.requestReturn')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {returnMaintenanceOpen && (
                <ModalPortal>
                <div className="modal-overlay" onClick={() => (returnMaintenanceSubmitting ? null : closeReturnMaintenance())}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 620,
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--glass-shadow)',
                            backdropFilter: 'var(--glass-backdrop)',
                            WebkitBackdropFilter: 'var(--glass-backdrop)',
                        }}
                    >
                        <div
                            className="modal-header"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                padding: '1rem 1.15rem',
                                background: 'linear-gradient(180deg, var(--color-bg-secondary), var(--color-bg-primary))',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                <div
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--color-bg-primary)',
                                        border: '1px solid var(--color-border)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <ArrowRightLeft size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 className="modal-title" style={{ margin: 0, lineHeight: 1.25 }}>
                                        {t('mSteps.returnMaintenanceToOwner')}
                                    </h3>
                                    <div style={{ marginTop: 2, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                        #{maintenanceId}
                                    </div>
                                </div>
                            </div>
                            <button
                                className="modal-close"
                                onClick={() => (returnMaintenanceSubmitting ? null : closeReturnMaintenance())}
                                disabled={returnMaintenanceSubmitting}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-primary)',
                                }}
                                aria-label={t('mSteps.close')}
                                title={t('mSteps.close')}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {returnMaintenanceLoading ? (
                                <div style={{ fontSize: 13, opacity: 0.85 }}>{t('mSteps.loadingRooms')}</div>
                            ) : (
                                <>
                                    <div className="form-group" style={{ marginBottom: 6 }}>
                                        <label className="form-label">{t('mSteps.destinationLocation')}</label>
                                        <select
                                            className="form-input"
                                            value={returnMaintenanceDestinationLocationId}
                                            onChange={(e) => setReturnMaintenanceDestinationLocationId(e.target.value)}
                                            disabled={returnMaintenanceSubmitting}
                                            style={{ padding: '0.7rem 0.75rem' }}
                                        >
                                            <option value="">{t('mSteps.selectLocation')}</option>
                                            {returnMaintenanceLocations.map((r) => (
                                                <option key={r.location_id} value={r.location_id}>
                                                    {r.location_name}{(r.location_type_label_ar || r.location_type_label) ? ` (${getLocalizedField(r, 'location_type_label')})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="alert alert-info" style={{ fontSize: 12, marginBottom: 0 }}>
                                        {t('mSteps.returnMaintenanceInfo')}
                                    </div>
                                </>
                            )}
                        </div>

                        <div
                            className="modal-footer"
                            style={{
                                padding: '1.15rem',
                                borderTop: '1px solid var(--color-border)',
                                background: 'var(--color-bg-primary)',
                                display: 'flex',
                                gap: 12,
                                justifyContent: 'flex-end',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                className="btn btn-secondary"
                                onClick={closeReturnMaintenance}
                                disabled={returnMaintenanceSubmitting}
                                style={{ width: 'auto', minWidth: 120, padding: '0.6rem 0.9rem' }}
                            >
                                {t('mSteps.cancel')}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={submitReturnMaintenance}
                                disabled={returnMaintenanceSubmitting || !returnMaintenanceDestinationLocationId}
                                style={{ width: 'auto', minWidth: 160, padding: '0.6rem 0.9rem' }}
                            >
                                {returnMaintenanceSubmitting ? t('mSteps.submitting') : t('mSteps.requestReturn')}
                            </button>
                        </div>
                    </div>
                </div>
                </ModalPortal>
            )}

            {removeEditorOpen && removeEditorStep && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        insetInlineEnd: 20,
                        bottom: 20,
                        zIndex: 50,
                        width: 520,
                        padding: 'var(--space-4)',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-backdrop)',
                        WebkitBackdropFilter: 'var(--glass-backdrop)',
                        boxShadow: 'var(--glass-shadow)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>{t('mSteps.removeComponent')}</div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeRemoveEditor}
                            disabled={removeSubmitting}
                        >
                            {t('mSteps.close')}
                        </button>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                        {t('mSteps.step')}: <b>{removeEditorStep.maintenance_step_id}</b>
                    </div>

                    {removeLoading ? (
                        <div style={{ fontSize: 13, opacity: 0.85 }}>{t('mSteps.loadingComponents')}</div>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">{t('mSteps.component')}</label>
                                <select
                                    className="form-input"
                                    value={removeSelectedType && removeSelectedId ? `${removeSelectedType}:${removeSelectedId}` : ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!value) {
                                            setRemoveSelectedType('');
                                            setRemoveSelectedId('');
                                            return;
                                        }
                                        const [t, id] = value.split(':');
                                        setRemoveSelectedType(t);
                                        setRemoveSelectedId(id);
                                    }}
                                >
                                    <option value="">{t('mSteps.selectComponentPlaceholder')}</option>

                                    {removeComponents.stock_items?.length > 0 && (
                                        <optgroup label={t('mSteps.stockItems')}>
                                            {removeComponents.stock_items.map((it) => (
                                                <option key={`stock_item:${it.stock_item_id}`} value={`stock_item:${it.stock_item_id}`}>
                                                    {it.stock_item_inventory_number ? `${it.stock_item_inventory_number} - ` : ''}{it.stock_item_name || `${t('mSteps.stockItem')} ${it.stock_item_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {removeComponents.consumables?.length > 0 && (
                                        <optgroup label={t('mSteps.consumables')}>
                                            {removeComponents.consumables.map((it) => (
                                                <option key={`consumable:${it.consumable_id}`} value={`consumable:${it.consumable_id}`}>
                                                    {it.consumable_inventory_number ? `${it.consumable_inventory_number} - ` : ''}{it.consumable_name || `${t('mSteps.consumable')} ${it.consumable_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">{t('mSteps.moveRemovedComponentTo')}</label>
                                <select
                                    className="form-input"
                                    value={removeDestinationLocationId}
                                    onChange={(e) => setRemoveDestinationLocationId(e.target.value)}
                                >
                                    <option value="">{t('mSteps.selectLocation')}</option>
                                    {removeLocations.map((r) => (
                                        <option key={r.location_id} value={r.location_id}>
                                            {r.location_name}{(r.location_type_label_ar || r.location_type_label) ? ` (${getLocalizedField(r, 'location_type_label')})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                                <button
                                    className="btn btn-xs btn-secondary"
                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                    onClick={closeRemoveEditor}
                                    disabled={removeSubmitting}
                                >
                                    {t('mSteps.cancel')}
                                </button>
                                <button
                                    className="btn btn-xs btn-danger"
                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                    onClick={submitRemoveEditor}
                                    disabled={removeSubmitting || !removeSelectedType || !removeSelectedId}
                                >
                                    {removeSubmitting ? t('mSteps.removing') : t('mSteps.remove')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {assetConditionEditorOpen && assetConditionEditorStep && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => closeAssetConditionEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '95vh',
                                width: '90%',
                                maxWidth: '600px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">{t('mSteps.updateAssetCondition')}</h3>
                                <button className="modal-close" onClick={() => closeAssetConditionEditor()} disabled={assetConditionSubmitting}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                                    {t('mSteps.step')}: <b>{assetConditionEditorStep.maintenance_step_id}</b>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.condition')}</label>
                                    <select
                                        className="form-input"
                                        value={selectedConditionId}
                                        onChange={(e) => setSelectedConditionId(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    >
                                        <option value="">{t('mSteps.selectCondition')}</option>
                                        {physicalConditions
                                            .filter((c) => {
                                                const code = String(c?.condition_code || '').trim().toLowerCase();
                                                const label = String(c?.condition_label || '').trim().toLowerCase();
                                                return code !== 'failed' && label !== 'failed';
                                            })
                                            .map((c) => (
                                            <option key={c.condition_id} value={c.condition_id}>
                                                {getLocalizedField(c, 'condition_label') || c.condition_code || c.condition_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.notes')}</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={assetConditionNotes}
                                        onChange={(e) => setAssetConditionNotes(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.cosmeticIssues')}</label>
                                    <input
                                        className="form-input"
                                        value={assetConditionCosmeticIssues}
                                        onChange={(e) => setAssetConditionCosmeticIssues(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.functionalIssues')}</label>
                                    <input
                                        className="form-input"
                                        value={assetConditionFunctionalIssues}
                                        onChange={(e) => setAssetConditionFunctionalIssues(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.recommendation')}</label>
                                    <input
                                        className="form-input"
                                        value={assetConditionRecommendation}
                                        onChange={(e) => setAssetConditionRecommendation(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeAssetConditionEditor} disabled={assetConditionSubmitting}>
                                    {t('mSteps.cancel')}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={submitAssetConditionEditor}
                                    disabled={assetConditionSubmitting || !selectedConditionId}
                                >
                                    {assetConditionSubmitting ? t('mSteps.saving') : t('mSteps.save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {attributeEditorOpen && attributeEditorStep && (
                <ModalPortal>
                    <div className="modal-overlay" onClick={() => closeAttributeEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '95vh',
                                width: '90%',
                                maxWidth: '720px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">{t('mSteps.queueAttrChanges')}</h3>
                                <button className="modal-close" onClick={() => closeAttributeEditor()} disabled={attributeSubmitting}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                                    {t('mSteps.step')}: <b>{attributeEditorStep.maintenance_step_id}</b>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.target')}</label>
                                    <select
                                        className="form-input"
                                        value={attributeTargetValue}
                                        onChange={(e) => {
                                            setAttributeTargetValue(e.target.value);
                                            setAttributeComponentValue('');
                                            setAttributeDefinitionId('');
                                            setAttributeMessage(null);
                                        }}
                                        disabled={attributeSubmitting}
                                    >
                                        <option value="asset">{t('mSteps.asset')}</option>
                                        <option value="stock_item">{t('mSteps.stockItemComposing')}</option>
                                        <option value="consumable">{t('mSteps.consumableComposing')}</option>
                                    </select>
                                </div>

                                {(attributeTargetValue === 'stock_item' || attributeTargetValue === 'consumable') && (
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label">{t('mSteps.component')}</label>
                                        <select
                                            className="form-input"
                                            value={attributeComponentValue}
                                            onChange={(e) => {
                                                setAttributeComponentValue(e.target.value);
                                                setAttributeMessage(null);
                                            }}
                                            disabled={attributeSubmitting}
                                        >
                                            <option value="">{t('mSteps.selectComponentPlaceholder')}</option>
                                            {(attributeTargetValue === 'stock_item'
                                                ? attributeEditorComponents.stock_items
                                                : attributeEditorComponents.consumables
                                            ).map((it) => (
                                                <option
                                                    key={attributeTargetValue === 'stock_item' ? it.stock_item_id : it.consumable_id}
                                                    value={attributeTargetValue === 'stock_item' ? it.stock_item_id : it.consumable_id}
                                                >
                                                    {attributeTargetValue === 'stock_item'
                                                        ? `${it.stock_item_inventory_number ? `${it.stock_item_inventory_number} - ` : ''}${it.stock_item_name || `${t('mSteps.stockItem')} ${it.stock_item_id}`}`
                                                        : `${it.consumable_inventory_number ? `${it.consumable_inventory_number} - ` : ''}${it.consumable_name || `${t('mSteps.consumable')} ${it.consumable_id}`}`
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">{t('mSteps.attribute')}</label>
                                        <select
                                            className="form-input"
                                            value={attributeDefinitionId}
                                            onChange={(e) => {
                                                setAttributeDefinitionId(e.target.value);
                                                setAttributeMessage(null);
                                            }}
                                            disabled={attributeSubmitting}
                                        >
                                            <option value="">{t('mSteps.selectAttribute')}</option>
                                            {(attributeTargetValue === 'asset'
                                                ? assetAttributeDefinitions
                                                : attributeTargetValue === 'stock_item'
                                                    ? stockItemAttributeDefinitions
                                                    : consumableAttributeDefinitions
                                            )
                                            .filter(d => {
                                                const stepDomain = attributeEditorStep?.maintenance_typical_step?.maintenance_domain;
                                                if (!stepDomain) return true;
                                                return d.maintenance_domain === stepDomain;
                                            })
                                            .map((d) => {
                                                const id = attributeTargetValue === 'asset'
                                                    ? d.asset_attribute_definition_id
                                                    : attributeTargetValue === 'stock_item'
                                                        ? d.stock_item_attribute_definition_id
                                                        : d.consumable_attribute_definition_id;
                                                return (
                                                    <option key={id} value={id}>
                                                        {getLocalizedField(d, 'description') || `${t('mSteps.attribute')} ${id}`}{d.unit ? ` (${d.unit})` : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    {attributeDefinitionId && (
                                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                                            <b>{t('mSteps.currentValue')}:</b>{' '}
                                            {attributeCurrentValueLoading ? (
                                                t('mSteps.loading')
                                            ) : attributeCurrentValue ? (
                                                (() => {
                                                    const v = attributeCurrentValue;
                                                    if (v.value_string != null) return v.value_string;
                                                    if (v.value_number != null) return String(v.value_number);
                                                    if (v.value_date != null) return v.value_date;
                                                    if (v.value_bool != null) return String(v.value_bool);
                                                    return '-';
                                                })()
                                            ) : (
                                                <span style={{ opacity: 0.6 }}>{t('mSteps.notSet')}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    const def = getSelectedAttributeDefinition();
                                    const dt = inferAttributeDataType(def);
                                    if (dt === 'bool') {
                                        return (
                                            <div className="form-group" style={{ marginBottom: 10 }}>
                                                <label className="form-label">{t('mSteps.value')}</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!attributeValueBool}
                                                        onChange={(e) => setAttributeValueBool(e.target.checked)}
                                                        disabled={attributeSubmitting}
                                                    />
                                                    <div style={{ fontSize: 12, opacity: 0.85 }}>{t('mSteps.setToTrueFalse')}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (dt === 'date') {
                                        return (
                                            <div className="form-group" style={{ marginBottom: 10 }}>
                                                <label className="form-label">{t('mSteps.value')}</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={attributeValueDate}
                                                    onChange={(e) => setAttributeValueDate(e.target.value)}
                                                    disabled={attributeSubmitting}
                                                />
                                            </div>
                                        );
                                    }
                                    if (dt === 'number') {
                                        return (
                                            <div className="form-group" style={{ marginBottom: 10 }}>
                                                <label className="form-label">{t('mSteps.value')}</label>
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    value={attributeValueNumber}
                                                    onChange={(e) => setAttributeValueNumber(e.target.value)}
                                                    disabled={attributeSubmitting}
                                                />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="form-group" style={{ marginBottom: 10 }}>
                                            <label className="form-label">{t('mSteps.value')}</label>
                                            <input
                                                className="form-input"
                                                value={attributeValueString}
                                                onChange={(e) => setAttributeValueString(e.target.value)}
                                                disabled={attributeSubmitting}
                                            />
                                        </div>
                                    );
                                })()}

                                {attributeMessage && (
                                    <div
                                        className={attributeMessage.type === 'success' ? 'badge badge-success' : 'badge badge-danger'}
                                        style={{
                                            padding: 'var(--space-3)',
                                            width: '100%',
                                            marginBottom: 10,
                                            borderRadius: 'var(--radius-md)',
                                            display: 'block',
                                        }}
                                    >
                                        {attributeMessage.text}
                                    </div>
                                )}

                                {Array.isArray(attributePendingChanges) && attributePendingChanges.length > 0 && (
                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{t('mSteps.queuedLocal')}</div>
                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                                            {t('mSteps.queuedLocalInfo')}
                                        </div>
                                        <div className="table-container rounded border overflow-hidden" style={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
                                            <table className="data-table mb-0">
                                                <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                                    <tr>
                                                        <th className="px-4 py-2">{t('mSteps.target')}</th>
                                                        <th className="px-4 py-2">{t('mSteps.definition')}</th>
                                                        <th className="px-4 py-2">{t('mSteps.value')}</th>
                                                        <th className="px-4 py-2 text-right">{t('mSteps.action')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attributePendingChanges.map((c, idx) => (
                                                        <tr key={`chg-${idx}`} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                                            <td className="px-4 py-2">
                                                                {c.target_type === 'asset' ? t('mSteps.asset') : c.target_type === 'stock_item' ? t('mSteps.stockItem') : c.target_type === 'consumable' ? t('mSteps.consumable') : c.target_type}{c.target_id ? ` #${c.target_id}` : ''}
                                                            </td>
                                                            <td className="px-4 py-2">{c.attribute_definition_id}</td>
                                                            <td className="px-4 py-2">
                                                                {c.value_string != null ? c.value_string : c.value_number != null ? String(c.value_number) : c.value_date != null ? c.value_date : String(!!c.value_bool)}
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <button
                                                                    className="btn btn-xs btn-danger"
                                                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                    onClick={() => setAttributePendingChanges((prev) => prev.filter((_, i) => i !== idx))}
                                                                    disabled={attributeSubmitting}
                                                                >
                                                                    {t('mSteps.remove')}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button type="button" className="btn btn-secondary" onClick={closeAttributeEditor} disabled={attributeSubmitting}>
                                    {t('mSteps.close')}
                                </button>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={addPendingAttributeChange}
                                        disabled={attributeSubmitting}
                                    >
                                        {t('mSteps.addToQueue')}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={submitAttributeEditorChanges}
                                        disabled={attributeSubmitting}
                                    >
                                        {attributeSubmitting ? t('mSteps.submitting') : t('mSteps.submit')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

        </div>
    );
};

export default MaintenanceSteps;
