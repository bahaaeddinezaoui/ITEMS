import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import SearchableSelect from './SearchableSelect';
import {
    maintenanceStepService,
    maintenanceTypicalStepService,
    personService,
    externalMaintenanceService,
    externalMaintenanceStepService,
    externalMaintenanceProviderService,
    externalMaintenanceTypicalStepService,
    stockItemTypeService,
    stockItemModelService,
    consumableTypeService,
    consumableModelService,
    roomService,
    physicalConditionService,
    assetAttributeDefinitionService,
    stockItemAttributeDefinitionService,
    consumableAttributeDefinitionService,
    assetAttributeValueService,
    stockItemAttributeValueService,
    consumableAttributeValueService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const MaintenanceSteps = ({
    maintenanceId,
    maintenancePerformedBy,
    maintenanceEnded,
    isChief,
    onStepsChange,
    canShowEndMaintenanceButton,
    endMaintenanceDisabled,
    onEndMaintenance,
}) => {
    const { user } = useAuth();
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

    const [removeEditorOpen, setRemoveEditorOpen] = useState(false);
    const [removeEditorStep, setRemoveEditorStep] = useState(null);
    const [removeComponents, setRemoveComponents] = useState({ stock_items: [], consumables: [] });
    const [removeSelectedType, setRemoveSelectedType] = useState('');
    const [removeSelectedId, setRemoveSelectedId] = useState('');
    const [removeRooms, setRemoveRooms] = useState([]);
    const [removeDestinationRoomId, setRemoveDestinationRoomId] = useState('');
    const [removeLoading, setRemoveLoading] = useState(false);
    const [removeSubmitting, setRemoveSubmitting] = useState(false);

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

    // New Step Form State
    const [newStepTypicalId, setNewStepTypicalId] = useState('');
    const [newStepPersonId, setNewStepPersonId] = useState('');

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

    const canManageSteps = isChief || isMainTechnician;

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
            setExternalStepMessage({ type: 'error', text: 'No external maintenance found for this maintenance.' });
            return;
        }
        if (!externalStepTypicalStepId) {
            setExternalStepMessage({ type: 'error', text: 'Please select typical step.' });
            return;
        }

        try {
            setExternalStepSubmitting(true);
            setExternalStepMessage(null);
            await externalMaintenanceService.createStep(
                Number(em.external_maintenance_id),
                Number(externalStepTypicalStepId),
            );
            setExternalStepMessage({ type: 'success', text: 'External maintenance step created successfully.' });
            await loadData();
        } catch (err) {
            console.error(err);
            setExternalStepMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create external maintenance step.' });
        } finally {
            setExternalStepSubmitting(false);
        }
    };

    const closeAddStepModal = () => {
        setAddingStep(false);
        setNewStepTypicalId('');
        setNewStepPersonId('');
    };

    const closeExternalStepModal = () => {
        setExternalStepModalOpen(false);
        setExternalStepSubmitting(false);
        setExternalStepMessage(null);
        setExternalStepTypicalStepId('');
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
    }, [maintenanceEnded]);

    const openAttributeEditor = async (step) => {
        if (maintenanceEnded) {
            setError('Maintenance is ended');
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
            const [componentsData, assetDefs, stockDefs, consDefs] = await Promise.all([
                maintenanceStepService.getComponents(step.maintenance_step_id).catch(() => ({ stock_items: [], consumables: [] })),
                assetAttributeDefinitionService.getAll().catch(() => []),
                stockItemAttributeDefinitionService.getAll().catch(() => []),
                consumableAttributeDefinitionService.getAll().catch(() => []),
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
            setAttributeMessage({ type: 'error', text: 'Please select an attribute.' });
            return;
        }

        let targetId = null;
        if (attributeTargetValue === 'stock_item' || attributeTargetValue === 'consumable') {
            if (!attributeComponentValue) {
                setAttributeMessage({ type: 'error', text: 'Please select a component.' });
                return;
            }
            targetId = Number(attributeComponentValue);
            if (!targetId || Number.isNaN(targetId)) {
                setAttributeMessage({ type: 'error', text: 'Invalid component.' });
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
                setAttributeMessage({ type: 'error', text: 'Please select a date.' });
                return;
            }
            change.value_date = attributeValueDate;
        } else if (dt === 'number') {
            if (attributeValueNumber === '' || attributeValueNumber == null) {
                setAttributeMessage({ type: 'error', text: 'Please enter a number.' });
                return;
            }
            const n = Number(attributeValueNumber);
            if (Number.isNaN(n)) {
                setAttributeMessage({ type: 'error', text: 'Invalid number.' });
                return;
            }
            change.value_number = n;
        } else {
            if (!attributeValueString) {
                setAttributeMessage({ type: 'error', text: 'Please enter a value.' });
                return;
            }
            change.value_string = attributeValueString;
        }

        setAttributePendingChanges((prev) => [...prev, change]);
        setAttributeMessage({ type: 'success', text: 'Change added to queue.' });
    };

    const submitAttributeEditorChanges = async () => {
        if (!attributeEditorStep) return;
        if (!Array.isArray(attributePendingChanges) || attributePendingChanges.length === 0) {
            setAttributeMessage({ type: 'error', text: 'No changes to submit.' });
            return;
        }

        try {
            setAttributeSubmitting(true);
            setAttributeMessage(null);
            await maintenanceStepService.addAttributeChanges(attributeEditorStep.maintenance_step_id, attributePendingChanges);
            setAttributeMessage({ type: 'success', text: 'Attribute changes queued. They will apply when the step is done.' });
            setAttributePendingChanges([]);
        } catch (err) {
            console.error(err);
            setAttributeMessage({ type: 'error', text: err.response?.data?.error || 'Failed to queue attribute changes.' });
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
            setExternalMaintenanceMessage({ type: 'success', text: 'External maintenance created successfully.' });
            setExternalMaintenanceCreated(true);
        } catch (err) {
            console.error(err);
            setExternalMaintenanceMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create external maintenance.' });
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

    const getExternalStatusLabel = (step) => {
        if (!step) return '-';
        if (!step.end_datetime) return 'In Progress';
        if (step.is_successful === true) return 'done';
        if (step.is_successful === false) return 'failed';
        return 'done';
    };

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch both technicians and chiefs so chiefs can assign themselves
            const [stepsData, externalStepsData, typicalStepsData, techniciansData, chiefsData, externalMaintenancesData, externalTypicalStepsData] = await Promise.all([
                maintenanceStepService.getAll({ maintenance: maintenanceId }),
                externalMaintenanceStepService.getAll({ maintenance: maintenanceId }),
                maintenanceTypicalStepService.getAll(),
                personService.getAll({ role: 'maintenance_technician' }),
                isChief ? personService.getAll({ role: 'maintenance_chief' }) : Promise.resolve([]),
                externalMaintenanceService.getAll({ maintenance: maintenanceId }),
                externalMaintenanceTypicalStepService.getAll(),
            ]);
            setSteps(stepsData);
            if (typeof onStepsChange === 'function') {
                onStepsChange(Array.isArray(stepsData) ? stepsData : []);
            }
            setExternalSteps(Array.isArray(externalStepsData) ? externalStepsData : []);
            setTypicalSteps(typicalStepsData);
            // Combine technicians and chiefs, removing duplicates
            const combinedPeople = [...(Array.isArray(techniciansData) ? techniciansData : [])];
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
            setError('Failed to load steps data');
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
            setError(apiMsg || 'Failed to add step');
        }
    };

    const handleUpdateStatus = async (step, statusValue) => {
        try {
            if (maintenanceEnded) {
                setError('Maintenance is ended');
                return;
            }
            await maintenanceStepService.patch(step.maintenance_step_id, {
                maintenance_step_status: statusValue,
            });
            loadData();
        } catch (err) {
            console.error(err);
            setError('Failed to update step status');
        }
    };

    const openStatusEditor = (step) => {
        if (maintenanceEnded) {
            setError('Maintenance is ended');
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
        setRemoveRooms([]);
        setRemoveDestinationRoomId('');
        setRemoveLoading(false);
        setRemoveSubmitting(false);
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
            setError('Maintenance is ended');
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
            setError('Please select a condition');
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
            setError(err.response?.data?.error || 'Failed to update asset condition');
        } finally {
            setAssetConditionSubmitting(false);
        }
    };

    const openRemoveEditor = async (step) => {
        if (maintenanceEnded) {
            setError('Maintenance is ended');
            return;
        }
        setRemoveEditorOpen(true);
        setRemoveEditorStep(step);
        setRemoveComponents({ stock_items: [], consumables: [] });
        setRemoveSelectedType('');
        setRemoveSelectedId('');
        setRemoveRooms([]);
        setRemoveDestinationRoomId('');

        try {
            setRemoveLoading(true);
            await handleUpdateStatus(step, 'In Progress');
            const [data, rooms] = await Promise.all([
                maintenanceStepService.getComponents(step.maintenance_step_id),
                roomService.getAll(),
            ]);
            setRemoveComponents({
                stock_items: Array.isArray(data?.stock_items) ? data.stock_items : [],
                consumables: Array.isArray(data?.consumables) ? data.consumables : [],
            });
            setRemoveRooms(Array.isArray(rooms) ? rooms : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load components');
            closeRemoveEditor();
        } finally {
            setRemoveLoading(false);
        }
    };

    const submitRemoveEditor = async () => {
        if (!removeEditorStep) return;
        if (!removeSelectedType || !removeSelectedId) {
            setError('Please select a component to remove');
            return;
        }
        try {
            setRemoveSubmitting(true);
            const payload = {
                component_type: removeSelectedType,
                component_id: Number(removeSelectedId),
            };
            if (removeDestinationRoomId) {
                payload.destination_room_id = Number(removeDestinationRoomId);
            }
            await maintenanceStepService.removeComponent(removeEditorStep.maintenance_step_id, payload);
            await loadData();
            closeRemoveEditor();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to remove component');
        } finally {
            setRemoveSubmitting(false);
        }
    };

    const openRequestEditor = (step, requestType) => {
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
        if (!requestModelId) {
            setRequestMessage({ type: 'error', text: 'Please select a model.' });
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
                setRequestMessage({ type: 'error', text: 'Invalid request type.' });
                return;
            }

            setRequestMessage({ type: 'success', text: 'Request created successfully.' });
            await loadData();
        } catch (err) {
            console.error(err);
            setRequestMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create request.' });
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
        try {
            const stockItemTypeId = promptFromList(
                'Stock item type',
                stockItemTypes,
                (t) => t.stock_item_type_id,
                (t) => t.stock_item_type_label,
            );
            if (!stockItemTypeId) return;

            const models = await stockItemModelService.getByStockItemType(Number(stockItemTypeId));
            const requestedModelId = promptFromList(
                'Stock item model',
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
            setError(err.response?.data?.error || 'Failed to request stock item');
        }
    };

    const requestConsumable = async (step) => {
        try {
            const consumableTypeId = promptFromList(
                'Consumable type',
                consumableTypes,
                (t) => t.consumable_type_id,
                (t) => t.consumable_type_label,
            );
            if (!consumableTypeId) return;

            const models = await consumableModelService.getByConsumableType(Number(consumableTypeId));
            const requestedModelId = promptFromList(
                'Consumable model',
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
            setError(err.response?.data?.error || 'Failed to request consumable');
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
            setError('Failed to reassign step');
        }
    };

    return (
        <div className="maintenance-steps-container p-4 border-t" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <div className="card" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-3">
                    <div
                        className="d-flex justify-content-between align-items-center mb-3"
                        style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                        <h3 className="text-lg font-bold mb-0">Maintenance Steps</h3>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {!!canShowEndMaintenanceButton && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => {
                                        if (typeof onEndMaintenance === 'function') {
                                            onEndMaintenance();
                                        }
                                    }}
                                    disabled={!!endMaintenanceDisabled}
                                    style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem' }}
                                    title="End maintenance"
                                    aria-label="End maintenance"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v10" />
                                        <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
                                    </svg>
                                </button>
                            )}

                            {canManageSteps && (
                                <>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => {
                                            if (hasOpenExternalMaintenance) {
                                                setError('Cannot create a new external maintenance while there is an open one.');
                                                return;
                                            }
                                            openExternalMaintenanceModal();
                                        }}
                                        disabled={loading || hasOpenExternalMaintenance}
                                        style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem' }}
                                        title="Create external maintenance"
                                        aria-label="Create external maintenance"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                            <path d="M12 8v8" />
                                            <path d="M8 12h8" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => openExternalStepModal()}
                                        disabled={loading}
                                        style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem' }}
                                        title="Create new external maintenance step"
                                        aria-label="Create new external maintenance step"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <path d="M12 8v8" />
                                            <path d="M8 12h8" />
                                        </svg>
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            if (maintenanceEnded) {
                                                setError('Maintenance is ended');
                                                return;
                                            }
                                            if (hasOngoingExternalMaintenance) {
                                                setError('Cannot create maintenance steps while the asset has an ongoing external maintenance.');
                                                return;
                                            }
                                            setAddingStep(true);
                                        }}
                                        disabled={loading || hasOngoingExternalMaintenance || maintenanceEnded}
                                        style={{ width: 'auto', whiteSpace: 'nowrap', padding: '0.35rem 0.55rem' }}
                                        title="Create new maintenance step"
                                        aria-label="Create new maintenance step"
                                    >
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                            <path d="M12 11v6" />
                                            <path d="M9 14h6" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {externalMaintenanceModalOpen && canManageSteps && (
                        createPortal(
                            <div className="modal-overlay" onClick={() => closeExternalMaintenanceModal()}>
                                <div
                                    className="modal"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        maxHeight: '80vh',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <div className="modal-header">
                                        <h3 className="modal-title">Create external maintenance</h3>
                                        <button className="modal-close" onClick={() => closeExternalMaintenanceModal()}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitExternalMaintenance} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                            {externalMaintenanceMessage && (
                                                <div className={`alert ${externalMaintenanceMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
                                                    {externalMaintenanceMessage.text}
                                                </div>
                                            )}
                                            <div className="alert alert-info mb-0">
                                                This will create the external maintenance record. The asset responsible will later select the external maintenance provider and send the asset.
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => closeExternalMaintenanceModal()}>
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={externalMaintenanceSubmitting || externalMaintenanceCreated}
                                            >
                                                Create
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>,
                            document.body,
                        )
                    )}

                    {externalStepModalOpen && canManageSteps && (
                        createPortal(
                            <div className="modal-overlay" onClick={() => closeExternalStepModal()}>
                                <div
                                    className="modal"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        maxHeight: '80vh',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <div className="modal-header">
                                        <h3 className="modal-title">Create new external maintenance step</h3>
                                        <button className="modal-close" onClick={() => closeExternalStepModal()}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitCreateExternalStep} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                            {externalStepMessage && (
                                                <div className={`alert ${externalStepMessage.type === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
                                                    {externalStepMessage.text}
                                                </div>
                                            )}

                                            <div className="form-group">
                                                <label className="form-label">Typical step</label>
                                                <select
                                                    className="form-input"
                                                    value={externalStepTypicalStepId}
                                                    onChange={(e) => setExternalStepTypicalStepId(e.target.value)}
                                                    disabled={externalStepSubmitting}
                                                    required
                                                >
                                                    <option value="">Select typical step...</option>
                                                    {externalMaintenanceTypicalSteps.map((ts) => (
                                                        <option key={ts.external_maintenance_typical_step_id} value={ts.external_maintenance_typical_step_id}>
                                                            {ts.description}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => closeExternalStepModal()}>
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary" disabled={externalStepSubmitting}>
                                                {externalStepSubmitting ? 'Creating...' : 'Create'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>,
                            document.body,
                        )
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}

            {addingStep && canManageSteps && (
                createPortal(
                    <div className="modal-overlay" onClick={() => closeAddStepModal()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '80vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Create new maintenance step</h3>
                                <button className="modal-close" onClick={() => closeAddStepModal()}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddStep} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                    <div className="form-group">
                                        <label className="form-label">Typical Step</label>
                                        <SearchableSelect
                                            value={newStepTypicalId}
                                            onChange={(e) => setNewStepTypicalId(e.target.value)}
                                            options={typicalSteps.map((ts) => ({
                                                value: ts.maintenance_typical_step_id,
                                                label: ts.description,
                                            }))}
                                            placeholder="Select Task..."
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Assign To</label>
                                        <select
                                            className="form-input"
                                            value={newStepPersonId}
                                            onChange={(e) => setNewStepPersonId(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Person...</option>
                                            {technicians.map((tech) => (
                                                <option key={tech.person_id} value={tech.person_id}>
                                                    {tech.first_name} {tech.last_name}
                                                    {tech.role_code === 'maintenance_chief' ? ' (Chief)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => closeAddStepModal()}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )
            )}

                    {/* Steps List */}
                    {loading && combinedSteps.length === 0 ? (
                        <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>Loading steps...</div>
                    ) : combinedSteps.length === 0 ? (
                        <div className="empty-state p-4 text-center rounded border" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', marginTop: 12 }}>
                            <p>No steps added yet.</p>
                        </div>
                    ) : (
                        <div className="table-container rounded border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', marginTop: 12 }}>
                            <table className="data-table mb-0">
                                <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <tr>
                                        <th className="px-4 py-2">Step</th>
                                        <th className="px-4 py-2">Level</th>
                                        <th className="px-4 py-2">Assigned To</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {combinedSteps.map(step => (
                                        <tr key={step.__key} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <td className="px-4 py-2">
                                                {step.__step_type === 'internal'
                                                    ? (step.maintenance_typical_step?.description || `Step ${step.maintenance_step_id}`)
                                                    : (step.external_maintenance_typical_step_description || `External step ${step.external_maintenance_step_id}`)
                                                }
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="badge badge-info">
                                                    {step.__step_type === 'internal' ? 'Internal' : 'External'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="badge badge-info status-badge">
                                                    {step.__step_type === 'internal'
                                                        ? `${step.person?.first_name || ''} ${step.person?.last_name || ''}`.trim()
                                                        : (step.external_maintenance_provider_name || 'External provider')
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {step.__step_type === 'internal' ? (
                                                    step.maintenance_step_status ? (
                                                        <span className="badge badge-info">{step.maintenance_step_status}</span>
                                                    ) : (
                                                        <span className="badge badge-warning">-</span>
                                                    )
                                                ) : (
                                                    <span className="badge badge-info">{getExternalStatusLabel(step)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {step.__step_type === 'internal' && !maintenanceEnded && (user?.person?.person_id === step.person?.person_id || isChief) && (
                                                    <div className="d-flex gap-2 justify-content-end" style={{ flexWrap: 'wrap', position: 'relative' }}>
                                                        {step.maintenance_step_status !== 'done' && (
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => openStatusEditor(step)}
                                                                title="Update status"
                                                                aria-label="Update status"
                                                            >
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M12 20h9" />
                                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {step.maintenance_step_status !== 'done' && (
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => openAttributeEditor(step)}
                                                                title="Queue attribute changes"
                                                                aria-label="Queue attribute changes"
                                                            >
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M12 20h9" />
                                                                    <path d="M12 4h9" />
                                                                    <path d="M4 9h6" />
                                                                    <path d="M4 15h6" />
                                                                    <path d="M9 7l-2 2 2 2" />
                                                                    <path d="M9 13l-2 2 2 2" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {step.maintenance_step_status !== 'done' && (
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => openAssetConditionEditor(step)}
                                                                title="Update asset condition"
                                                                aria-label="Update asset condition"
                                                            >
                                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M9 18h6" />
                                                                    <path d="M10 22h4" />
                                                                    <path d="M12 2a7 7 0 0 0-4 12.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                {step.maintenance_step_status !== 'done' && step.maintenance_typical_step?.operation_type === 'remove' && (
                                                    <button
                                                        className="btn btn-xs btn-danger"
                                                        style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                        onClick={() => openRemoveEditor(step)}
                                                        disabled={removeLoading || removeSubmitting}
                                                        title="Remove component"
                                                        aria-label="Remove component"
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6" />
                                                            <path d="M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                        </svg>
                                                    </button>
                                                )}

                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                        </div>
                    )}
                </div>
            </div>

            {requestEditorOpen && requestEditorStep && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 20,
                        zIndex: 50,
                        width: 420,
                        padding: 'var(--space-4)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-tertiary)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>
                            {requestEditorType === 'stock_item' ? 'Request stock item' : 'Request consumable'}
                        </div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeRequestEditor}
                            disabled={requestSubmitting}
                        >
                            Close
                        </button>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                        Step: <b>{requestEditorStep.maintenance_step_id}</b>
                    </div>

                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label">Type</label>
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
                            <option value="">Select type...</option>
                            {(requestEditorType === 'stock_item' ? stockItemTypes : consumableTypes).map((t) => (
                                <option
                                    key={requestEditorType === 'stock_item' ? t.stock_item_type_id : t.consumable_type_id}
                                    value={requestEditorType === 'stock_item' ? t.stock_item_type_id : t.consumable_type_id}
                                >
                                    {requestEditorType === 'stock_item' ? t.stock_item_type_label : t.consumable_type_label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 10 }}>
                        <label className="form-label">Model</label>
                        <select
                            className="form-input"
                            value={requestModelId}
                            onChange={(e) => {
                                setRequestModelId(e.target.value);
                                setRequestMessage(null);
                            }}
                            disabled={requestSubmitting || !requestTypeId}
                        >
                            <option value="">Select model...</option>
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
                            {requestSubmitting ? 'Requesting...' : 'Submit request'}
                        </button>
                    </div>
                </div>
            )}

            {statusEditorStepId && (
                createPortal(
                    <div className="modal-overlay" onClick={() => closeStatusEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '80vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Update status</h3>
                                <button className="modal-close" onClick={() => closeStatusEditor()} disabled={statusSaving}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-input"
                                        value={statusEditorValue}
                                        onChange={(e) => setStatusEditorValue(e.target.value)}
                                        disabled={statusSaving}
                                    >
                                        <option value="">Select status...</option>
                                        {getAllowedStepStatusOptions(
                                            steps.find((s) => s.maintenance_step_id === statusEditorStepId)?.maintenance_step_status,
                                        ).map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => closeStatusEditor()} disabled={statusSaving}>
                                    Cancel
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
                                    {statusSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )
            )}

            {removeEditorOpen && removeEditorStep && (
                <div
                    className="card"
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 20,
                        zIndex: 50,
                        width: 520,
                        padding: 'var(--space-4)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-tertiary)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700 }}>Remove component</div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeRemoveEditor}
                            disabled={removeSubmitting}
                        >
                            Close
                        </button>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                        Step: <b>{removeEditorStep.maintenance_step_id}</b>
                    </div>

                    {removeLoading ? (
                        <div style={{ fontSize: 13, opacity: 0.85 }}>Loading components...</div>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Component</label>
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
                                    <option value="">Select component...</option>

                                    {removeComponents.stock_items?.length > 0 && (
                                        <optgroup label="Stock items">
                                            {removeComponents.stock_items.map((it) => (
                                                <option key={`stock_item:${it.stock_item_id}`} value={`stock_item:${it.stock_item_id}`}>
                                                    {it.stock_item_inventory_number ? `${it.stock_item_inventory_number} - ` : ''}{it.stock_item_name || `Stock item ${it.stock_item_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {removeComponents.consumables?.length > 0 && (
                                        <optgroup label="Consumables">
                                            {removeComponents.consumables.map((it) => (
                                                <option key={`consumable:${it.consumable_id}`} value={`consumable:${it.consumable_id}`}>
                                                    {it.consumable_inventory_number ? `${it.consumable_inventory_number} - ` : ''}{it.consumable_name || `Consumable ${it.consumable_id}`}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 10 }}>
                                <label className="form-label">Move removed component to (maintenance room)</label>
                                <select
                                    className="form-input"
                                    value={removeDestinationRoomId}
                                    onChange={(e) => setRemoveDestinationRoomId(e.target.value)}
                                >
                                    <option value="">Select room...</option>
                                    {removeRooms.map((r) => (
                                        <option key={r.room_id} value={r.room_id}>
                                            {r.room_name}{r.room_type_label ? ` (${r.room_type_label})` : ''}
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
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-xs btn-danger"
                                    style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                    onClick={submitRemoveEditor}
                                    disabled={removeSubmitting || !removeSelectedType || !removeSelectedId}
                                >
                                    {removeSubmitting ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {assetConditionEditorOpen && assetConditionEditorStep && (
                createPortal(
                    <div className="modal-overlay" onClick={() => closeAssetConditionEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '80vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Update asset condition</h3>
                                <button className="modal-close" onClick={() => closeAssetConditionEditor()} disabled={assetConditionSubmitting}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                                    Step: <b>{assetConditionEditorStep.maintenance_step_id}</b>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Condition</label>
                                    <select
                                        className="form-input"
                                        value={selectedConditionId}
                                        onChange={(e) => setSelectedConditionId(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    >
                                        <option value="">Select condition...</option>
                                        {physicalConditions.map((c) => (
                                            <option key={c.condition_id} value={c.condition_id}>
                                                {c.condition_label || c.condition_code || c.condition_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={assetConditionNotes}
                                        onChange={(e) => setAssetConditionNotes(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Cosmetic issues</label>
                                    <input
                                        className="form-input"
                                        value={assetConditionCosmeticIssues}
                                        onChange={(e) => setAssetConditionCosmeticIssues(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Functional issues</label>
                                    <input
                                        className="form-input"
                                        value={assetConditionFunctionalIssues}
                                        onChange={(e) => setAssetConditionFunctionalIssues(e.target.value)}
                                        disabled={assetConditionSubmitting}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Recommendation</label>
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
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={submitAssetConditionEditor}
                                    disabled={assetConditionSubmitting || !selectedConditionId}
                                >
                                    {assetConditionSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )
            )}

            {attributeEditorOpen && attributeEditorStep && (
                createPortal(
                    <div className="modal-overlay" onClick={() => closeAttributeEditor()}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: '80vh',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                width: 680,
                            }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Queue attribute changes</h3>
                                <button className="modal-close" onClick={() => closeAttributeEditor()} disabled={attributeSubmitting}>
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                                    Step: <b>{attributeEditorStep.maintenance_step_id}</b>
                                </div>

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Target</label>
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
                                        <option value="asset">Asset</option>
                                        <option value="stock_item">Stock item (composing asset)</option>
                                        <option value="consumable">Consumable (composing asset)</option>
                                    </select>
                                </div>

                                {(attributeTargetValue === 'stock_item' || attributeTargetValue === 'consumable') && (
                                    <div className="form-group" style={{ marginBottom: 10 }}>
                                        <label className="form-label">Component</label>
                                        <select
                                            className="form-input"
                                            value={attributeComponentValue}
                                            onChange={(e) => {
                                                setAttributeComponentValue(e.target.value);
                                                setAttributeMessage(null);
                                            }}
                                            disabled={attributeSubmitting}
                                        >
                                            <option value="">Select component...</option>
                                            {(attributeTargetValue === 'stock_item'
                                                ? attributeEditorComponents.stock_items
                                                : attributeEditorComponents.consumables
                                            ).map((it) => (
                                                <option
                                                    key={attributeTargetValue === 'stock_item' ? it.stock_item_id : it.consumable_id}
                                                    value={attributeTargetValue === 'stock_item' ? it.stock_item_id : it.consumable_id}
                                                >
                                                    {attributeTargetValue === 'stock_item'
                                                        ? `${it.stock_item_inventory_number ? `${it.stock_item_inventory_number} - ` : ''}${it.stock_item_name || `Stock item ${it.stock_item_id}`}`
                                                        : `${it.consumable_inventory_number ? `${it.consumable_inventory_number} - ` : ''}${it.consumable_name || `Consumable ${it.consumable_id}`}`
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: 10 }}>
                                    <label className="form-label">Attribute</label>
                                    <select
                                        className="form-input"
                                        value={attributeDefinitionId}
                                        onChange={(e) => {
                                            setAttributeDefinitionId(e.target.value);
                                            setAttributeMessage(null);
                                        }}
                                        disabled={attributeSubmitting}
                                    >
                                        <option value="">Select attribute...</option>
                                        {(attributeTargetValue === 'asset'
                                            ? assetAttributeDefinitions
                                            : attributeTargetValue === 'stock_item'
                                                ? stockItemAttributeDefinitions
                                                : consumableAttributeDefinitions
                                        ).map((d) => {
                                            const id = attributeTargetValue === 'asset'
                                                ? d.asset_attribute_definition_id
                                                : attributeTargetValue === 'stock_item'
                                                    ? d.stock_item_attribute_definition_id
                                                    : d.consumable_attribute_definition_id;
                                            return (
                                                <option key={id} value={id}>
                                                    {d.description || `Attribute ${id}`}{d.unit ? ` (${d.unit})` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {attributeDefinitionId && (
                                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                                            <b>Current value:</b>{' '}
                                            {attributeCurrentValueLoading ? (
                                                'Loading...'
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
                                                <span style={{ opacity: 0.6 }}>Not set</span>
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
                                                <label className="form-label">Value</label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!attributeValueBool}
                                                        onChange={(e) => setAttributeValueBool(e.target.checked)}
                                                        disabled={attributeSubmitting}
                                                    />
                                                    <div style={{ fontSize: 12, opacity: 0.85 }}>Set to true/false</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (dt === 'date') {
                                        return (
                                            <div className="form-group" style={{ marginBottom: 10 }}>
                                                <label className="form-label">Value</label>
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
                                                <label className="form-label">Value</label>
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
                                            <label className="form-label">Value</label>
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
                                        <div style={{ fontWeight: 700, marginBottom: 6 }}>Queued (local)</div>
                                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                                            These will be sent to the server when you click "Submit".
                                        </div>
                                        <div className="table-container rounded border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                                            <table className="data-table mb-0">
                                                <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                                    <tr>
                                                        <th className="px-4 py-2">Target</th>
                                                        <th className="px-4 py-2">Definition</th>
                                                        <th className="px-4 py-2">Value</th>
                                                        <th className="px-4 py-2 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attributePendingChanges.map((c, idx) => (
                                                        <tr key={`chg-${idx}`} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                                            <td className="px-4 py-2">
                                                                {c.target_type}{c.target_id ? ` #${c.target_id}` : ''}
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
                                                                    Remove
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
                                    Close
                                </button>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={addPendingAttributeChange}
                                        disabled={attributeSubmitting}
                                    >
                                        Add to queue
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={submitAttributeEditorChanges}
                                        disabled={attributeSubmitting}
                                    >
                                        {attributeSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )
            )}

        </div>
    );
};

export default MaintenanceSteps;
