import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Image } from 'lucide-react';
import TranslatableInput from './TranslatableInput';
import ModalPortal from './ModalPortal';
import ModalFeedback from './ModalFeedback';

const BrandModal = ({
    isOpen,
    onClose,
    onSave,
    editingBrand,
    brandForm,
    brandPhotoPreview,
    formTranslations,
    onFormChange,
    onBrandNameChange,
    onTranslationChange,
    onPhotoChange,
    saving,
    i18nKeyPrefix,
    feedbackType,
    feedbackMessage,
    onClearFeedback,
}) => {
    const { t } = useTranslation();

    const handleInputChange = (e) => {
        const { name, value, type, files, checked } = e.target;
        if (type === 'file' && files && files[0]) {
            onPhotoChange(files[0], URL.createObjectURL(files[0]));
        } else if (type === 'checkbox') {
            onFormChange({ ...brandForm, [name]: checked });
        } else {
            onFormChange({ ...brandForm, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        {editingBrand
                            ? t(`${i18nKeyPrefix}.editBrand`, 'Edit Brand')
                            : t(`${i18nKeyPrefix}.addNewBrand`, 'Add New Brand')}
                    </h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <ModalFeedback type={feedbackType} message={feedbackMessage} onClose={onClearFeedback} />
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <TranslatableInput
                                baseFieldName="brand_name"
                                value={brandForm.brand_name}
                                onChange={onBrandNameChange}
                                translations={Object.fromEntries(
                                    Object.entries(formTranslations).map(([k, v]) => [k, v.brand_name])
                                )}
                                onTranslationChange={onTranslationChange}
                                placeholder={t(`${i18nKeyPrefix}.brandName`, 'Brand Name')}
                                label={t(`${i18nKeyPrefix}.brandName`, 'Brand Name')}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                            <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                {t(`${i18nKeyPrefix}.brandCode`, 'Brand Code')}
                            </label>
                            <input
                                type="text"
                                name="brand_code"
                                value={brandForm.brand_code}
                                onChange={handleInputChange}
                                placeholder={t(`${i18nKeyPrefix}.brandCode`, 'Brand Code')}
                                className="form-input"
                                style={{ height: '44px' }}
                            />
                        </div>

                        <div className="form-row" style={{ marginBottom: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontWeight: '600', marginBottom: 'var(--space-2)', display: 'block' }}>
                                    {t(`${i18nKeyPrefix}.brandPhoto`, 'Brand Photo')}
                                </label>
                                <input
                                    type="file"
                                    name="brand_photo"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="form-input"
                                    style={{ height: '44px', padding: 'var(--space-2)' }}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-6)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                                    <input type="checkbox" name="is_active" checked={brandForm.is_active} onChange={handleInputChange} />
                                    {t(`${i18nKeyPrefix}.active`, 'Active')}
                                </label>
                            </div>
                        </div>

                        {brandPhotoPreview && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <img
                                    src={brandPhotoPreview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '80px',
                                        maxHeight: '80px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}
                                />
                            </div>
                        )}
                    </form>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ padding: 'var(--space-3) var(--space-6)' }}
                    >
                        {saving
                            ? t('common.saving', 'Saving...')
                            : editingBrand
                                ? t('common.update')
                                : t('common.save')}
                    </button>
                </div>
            </div>
        </div>
        </ModalPortal>
    );
};

export default BrandModal;
