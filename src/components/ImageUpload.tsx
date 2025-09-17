import { useState } from 'react';
import { validateImageUrl } from '../utils/validation';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  error, 
  placeholder = 'Enter image URL (https://...)',
  required = false,
  disabled = false
}: ImageUploadProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewError(false);
    
    if (url && validateImageUrl(url)) {
      setIsValidating(true);
      // Test if image loads
      const img = new Image();
      img.onload = () => {
        setIsValidating(false);
        setPreviewError(false);
      };
      img.onerror = () => {
        setIsValidating(false);
        setPreviewError(true);
      };
      img.src = url;
    }
  };

  const handleImageError = () => {
    setPreviewError(true);
  };

  const handleImageLoad = () => {
    setPreviewError(false);
  };

  return (
    <div className={styles.imageUpload}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.inputContainer}>
        <input
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
        />
        
        {isValidating && (
          <div className={styles.validating}>
            <span className={styles.spinner}></span>
            Validating image...
          </div>
        )}
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {value && validateImageUrl(value) && !isValidating && (
        <div className={styles.preview}>
          {previewError ? (
            <div className={styles.previewError}>
              <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Failed to load image</span>
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className={styles.previewImage}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          )}
        </div>
      )}
      
      <div className={styles.hint}>
        Supported formats: JPG, JPEG, PNG, WebP. Image must be hosted online.
      </div>
    </div>
  );
}