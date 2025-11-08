import React, { useState } from 'react';
import { validateImageUrl } from '../utils/validation';
import styles from './MultipleImageUpload.module.css';

interface MultipleImageUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  error?: string;
}

export function MultipleImageUpload({ 
  label, 
  values, 
  onChange, 
  maxImages = 5,
  error 
}: MultipleImageUploadProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState<string>('');

  const validateImageInput = (url: string): string | null => {
    if (!url.trim()) return 'Image URL is required';
    if (!validateImageUrl(url)) return 'Please enter a valid image URL';
    if (values.includes(url)) return 'This image has already been added';
    if (values.length >= maxImages) return `Maximum ${maxImages} images allowed`;
    return null;
  };

  const handleAddImage = async () => {
    const validationError = validateImageInput(newImageUrl);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError('');
    
    // Skip image loading test - just add the URL
    onChange([...values, newImageUrl]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  const canAddMore = values.length < maxImages;

  return (
    <div className={styles.multipleImageUpload}>
      <label className={styles.label}>
        {label}
        <span className={styles.count}>({values.length}/{maxImages})</span>
      </label>
      
      {canAddMore && (
        <div className={styles.addContainer}>
          <div className={styles.inputContainer}>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter image URL and press Enter"
              className={styles.input}
            />
            <button
              type="button"
              onClick={handleAddImage}
              disabled={!newImageUrl.trim() || !validateImageUrl(newImageUrl)}
              className={styles.addButton}
            >
              <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      {imageError && <div className={styles.error}>{imageError}</div>}
      
      {values.length > 0 && (
        <div className={styles.imageGrid}>
          {values.map((url, index) => (
            <div key={index} className={styles.imageItem}>
              <img
                src={url}
                alt={`Additional image ${index + 1}`}
                className={styles.image}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className={styles.removeButton}
                aria-label="Remove image"
              >
                <svg className={styles.removeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.hint}>
        Add up to {maxImages} additional images. Enter any image URL.
      </div>
    </div>
  );
}