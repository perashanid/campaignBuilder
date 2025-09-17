import React, { useState } from 'react';
import { CampaignUpdateFormData } from '../types/campaign';
import { useNotification } from '../hooks/useNotification';
import { ImageUpload } from './ImageUpload';
import styles from './UpdateForm.module.css';

interface UpdateFormProps {
  onSubmit: (data: CampaignUpdateFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UpdateForm({ onSubmit, onCancel, isSubmitting = false }: UpdateFormProps) {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<CampaignUpdateFormData>({
    title: '',
    description: '',
    type: 'general',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification({ message: 'Please fix the errors in the form', type: 'error' });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to create update',
        type: 'error'
      });
    }
  };

  const handleInputChange = (field: keyof CampaignUpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Add Campaign Update</h2>
        <p>Share progress and milestones with your supporters</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title" className={styles.label}>
            Update Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`${styles.input} ${errors.title ? styles.error : ''}`}
            placeholder="Enter update title..."
            disabled={isSubmitting}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="type" className={styles.label}>
            Update Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className={styles.select}
            disabled={isSubmitting}
          >
            <option value="general">General Update</option>
            <option value="progress">Progress Update</option>
            <option value="milestone">Milestone Reached</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
            placeholder="Share details about this update..."
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Update Image (Optional)
          </label>
          <ImageUpload
            label="Update Image (Optional)"
            value={formData.imageUrl || ''}
            onChange={(url) => handleInputChange('imageUrl', url)}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Update'}
          </button>
        </div>
      </form>
    </div>
  );
}