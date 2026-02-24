import { useState, useEffect, useMemo } from 'react';
import {
    maintenanceStepService,
    maintenanceTypicalStepService,
    personService,
    stockItemTypeService,
    stockItemModelService,
    consumableTypeService,
    consumableModelService,
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
            setAddingStep(false);
            setNewStepTypicalId('');
            setNewStepPersonId('');
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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-lg font-bold">Maintenance Steps</h3>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error mb-4">
                    {error}
                </div>
            )}

            {/* Add Step Form */}
            {canManageSteps && (
                <div className="card mb-4" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
                    <div className="card-body p-3">
                        <h4 className="card-title text-sm mb-3">Add New Step</h4>
                        <form onSubmit={handleAddStep} className="d-flex gap-3 align-items-end">
                            <div className="form-group mb-0 flex-grow-1">
                                <label className="form-label text-xs mb-1">Typical Step</label>
                                <select
                                    className="form-input text-sm"
                                    value={newStepTypicalId}
                                    onChange={e => setNewStepTypicalId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Task...</option>
                                    {typicalSteps.map(ts => (
                                        <option key={ts.maintenance_typical_step_id} value={ts.maintenance_typical_step_id}>
                                            {ts.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mb-0 flex-grow-1">
                                <label className="form-label text-xs mb-1">Assign To</label>
                                <select
                                    className="form-input text-sm"
                                    value={newStepPersonId}
                                    onChange={e => setNewStepPersonId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Technician...</option>
                                    {technicians.map(tech => (
                                        <option key={tech.person_id} value={tech.person_id}>
                                            {tech.first_name} {tech.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                                Add Step
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Steps List */}
            {loading && steps.length === 0 ? (
                <div className="text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>Loading steps...</div>
            ) : steps.length === 0 ? (
                <div className="empty-state p-4 text-center rounded border" style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
                    <p>No steps added yet.</p>
                </div>
            ) : (
                <div className="table-container rounded border overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderColor: 'var(--color-border)' }}>
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
                                            <div className="d-flex gap-2 justify-content-end" style={{ flexWrap: 'wrap' }}>
                                                <select
                                                    className="form-input"
                                                    style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                                                    value={step.maintenance_step_status || ''}
                                                    onChange={(e) => handleUpdateStatus(step, e.target.value)}
                                                >
                                                    <option value="">Change status...</option>
                                                    {stepStatusOptions.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    className="btn btn-xs btn-secondary"
                                                    onClick={() => requestStockItem(step)}
                                                >
                                                    Request Stock Item
                                                </button>
                                                <button
                                                    className="btn btn-xs btn-secondary"
                                                    onClick={() => requestConsumable(step)}
                                                >
                                                    Request Consumable
                                                </button>
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
    );
};

export default MaintenanceSteps;
