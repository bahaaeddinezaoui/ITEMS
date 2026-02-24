import { useState, useEffect, useMemo } from 'react';
import {
    maintenanceStepService,
    maintenanceTypicalStepService,
    personService,
    stockItemTypeService,
    stockItemModelService,
    consumableTypeService,
    consumableModelService,
    roomService,
    physicalConditionService,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const MaintenanceSteps = ({ maintenanceId, maintenancePerformedBy, isChief }) => {
    const { user } = useAuth();
    const [steps, setSteps] = useState([]);
    const [typicalSteps, setTypicalSteps] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [stockItemTypes, setStockItemTypes] = useState([]);
    const [consumableTypes, setConsumableTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingStep, setAddingStep] = useState(false);

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

    // New Step Form State
    const [newStepTypicalId, setNewStepTypicalId] = useState('');
    const [newStepPersonId, setNewStepPersonId] = useState('');

    const stepStatusOptions = useMemo(() => (
        [
            'started',
            'pending (waiting for stock item)',
            'pending (waiting for consumable)',
            'In Progress',
            'done',
            'failed (to be sent to a higher level)',
        ]
    ), []);

    const isMainTechnician = useMemo(() => {
        return user?.person?.person_id === maintenancePerformedBy;
    }, [user, maintenancePerformedBy]);

    const canManageSteps = isChief || isMainTechnician;

    const closeAddStepModal = () => {
        setAddingStep(false);
        setNewStepTypicalId('');
        setNewStepPersonId('');
    };

    useEffect(() => {
        loadData();
    }, [maintenanceId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [stepsData, typicalStepsData, techniciansData] = await Promise.all([
                maintenanceStepService.getAll({ maintenance: maintenanceId }),
                maintenanceTypicalStepService.getAll(),
                personService.getAll({ role: 'maintenance_technician' })
            ]);
            setSteps(stepsData);
            setTypicalSteps(typicalStepsData);
            setTechnicians(techniciansData);

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
            setError('Failed to add step');
        }
    };

    const handleUpdateStatus = async (step, statusValue) => {
        try {
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
        setStatusEditorStepId(step.maintenance_step_id);
        setStatusEditorValue(step.maintenance_step_status || '');
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

    const openAssetConditionEditor = (step) => {
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
                        {canManageSteps && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setAddingStep(true)}
                                disabled={loading}
                                style={{ width: 'auto', whiteSpace: 'nowrap', marginLeft: 'auto' }}
                            >
                                Create new maintenance step
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            {error}
                        </div>
                    )}

            {addingStep && canManageSteps && (
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
                                    <select
                                        className="form-input"
                                        value={newStepTypicalId}
                                        onChange={(e) => setNewStepTypicalId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Task...</option>
                                        {typicalSteps.map((ts) => (
                                            <option key={ts.maintenance_typical_step_id} value={ts.maintenance_typical_step_id}>
                                                {ts.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assign To</label>
                                    <select
                                        className="form-input"
                                        value={newStepPersonId}
                                        onChange={(e) => setNewStepPersonId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Technician...</option>
                                        {technicians.map((tech) => (
                                            <option key={tech.person_id} value={tech.person_id}>
                                                {tech.first_name} {tech.last_name}
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
                </div>
            )}

                    {/* Steps List */}
                    {loading && steps.length === 0 ? (
                        <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)', marginTop: 12 }}>Loading steps...</div>
                    ) : steps.length === 0 ? (
                        <div className="empty-state p-4 text-center rounded border" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', marginTop: 12 }}>
                            <p>No steps added yet.</p>
                        </div>
                    ) : (
                        <div className="table-container rounded border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)', marginTop: 12 }}>
                            <table className="data-table mb-0">
                                <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <tr>
                                        <th className="px-4 py-2">Step</th>
                                        <th className="px-4 py-2">Assigned To</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {steps.map(step => (
                                        <tr key={step.maintenance_step_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <td className="px-4 py-2">
                                                {step.maintenance_typical_step?.description || `Step ${step.maintenance_step_id}`}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="badge badge-info status-badge">
                                                    {step.person?.first_name} {step.person?.last_name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {step.maintenance_step_status ? (
                                                    <span className="badge badge-info">{step.maintenance_step_status}</span>
                                                ) : (
                                                    <span className="badge badge-warning">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {(user?.person?.person_id === step.person?.person_id || isChief) && (
                                                    <div className="d-flex gap-2 justify-content-end" style={{ flexWrap: 'wrap', position: 'relative' }}>
                                                        {step.maintenance_step_status !== 'done' && (
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => openStatusEditor(step)}
                                                            >
                                                                Update status
                                                            </button>
                                                        )}

                                                        {step.maintenance_step_status !== 'done' && (
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => openAssetConditionEditor(step)}
                                                            >
                                                                Update asset condition
                                                            </button>
                                                        )}

                                                {step.maintenance_step_status !== 'done' && step.maintenance_typical_step?.operation_type === 'remove' && (
                                                    <button
                                                        className="btn btn-xs btn-danger"
                                                        style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                        onClick={() => openRemoveEditor(step)}
                                                        disabled={removeLoading || removeSubmitting}
                                                    >
                                                        Remove
                                                    </button>
                                                )}

                                                {step.maintenance_step_status !== 'done' && statusEditorStepId === step.maintenance_step_id && (
                                                    <div
                                                        className="card"
                                                        style={{
                                                            position: 'absolute',
                                                            right: 0,
                                                            top: 'calc(100% + 6px)',
                                                            zIndex: 20,
                                                            width: 280,
                                                            padding: 'var(--space-3)',
                                                            border: '1px solid var(--color-border)',
                                                            background: 'var(--color-bg-tertiary)',
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Update status</div>
                                                        <select
                                                            className="form-input"
                                                            value={statusEditorValue}
                                                            onChange={(e) => setStatusEditorValue(e.target.value)}
                                                        >
                                                            <option value="">Select status...</option>
                                                            {stepStatusOptions.map((s) => (
                                                                <option key={s} value={s}>
                                                                    {s}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
                                                            <button
                                                                className="btn btn-xs btn-secondary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={closeStatusEditor}
                                                                disabled={statusSaving}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="btn btn-xs btn-primary"
                                                                style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                                                                onClick={() => saveStatusEditor(step)}
                                                                disabled={statusSaving || !statusEditorValue}
                                                            >
                                                                {statusSaving ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
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
                        <div style={{ fontWeight: 700 }}>Update asset condition</div>
                        <button
                            className="btn btn-xs btn-secondary"
                            style={{ padding: '0.2rem 0.45rem', fontSize: 12 }}
                            onClick={closeAssetConditionEditor}
                            disabled={assetConditionSubmitting}
                        >
                            Close
                        </button>
                    </div>

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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 10 }}>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={submitAssetConditionEditor}
                            disabled={assetConditionSubmitting || !selectedConditionId}
                        >
                            {assetConditionSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MaintenanceSteps;
