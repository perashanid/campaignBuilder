import { useState, useCallback } from 'react';
import { FormState, FormValidation } from '../types/form';
import { validateField, validateForm } from '../utils/validation';

export interface UseFormOptions<T> {
  initialData: T;
  validationRules?: FormValidation;
  onSubmit?: (data: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
  formState: FormState<T>;
  updateField: (field: keyof T, value: any) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  getFieldError: (field: keyof T) => string | undefined;
  isFieldValid: (field: keyof T) => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialData,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [formState, setFormState] = useState<FormState<T>>({
    data: { ...initialData },
    errors: [],
    isSubmitting: false,
    isValid: true,
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      // Clear field error when user starts typing
      errors: prev.errors.filter(error => error.field !== field as string),
    }));
  }, []);

  const validateSingleField = useCallback((field: keyof T) => {
    const fieldName = field as string;
    const value = formState.data[field];
    const error = validateField(fieldName, value, validationRules);
    
    setFormState(prev => {
      const newErrors = prev.errors.filter(e => e.field !== fieldName);
      if (error) {
        newErrors.push({ field: fieldName, message: error });
      }
      
      return {
        ...prev,
        errors: newErrors,
        isValid: newErrors.length === 0,
      };
    });
  }, [formState.data, validationRules]);

  const validateEntireForm = useCallback((): boolean => {
    const errors = validateForm(formState.data, validationRules);
    const isValid = errors.length === 0;
    
    setFormState(prev => ({
      ...prev,
      errors,
      isValid,
    }));
    
    return isValid;
  }, [formState.data, validationRules]);

  const resetForm = useCallback(() => {
    setFormState({
      data: { ...initialData },
      errors: [],
      isSubmitting: false,
      isValid: true,
    });
  }, [initialData]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateEntireForm()) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(formState.data);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add error handling here
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.data, onSubmit, validateEntireForm]);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    const error = formState.errors.find(e => e.field === field as string);
    return error?.message;
  }, [formState.errors]);

  const isFieldValid = useCallback((field: keyof T): boolean => {
    return !formState.errors.some(e => e.field === field as string);
  }, [formState.errors]);

  return {
    formState,
    updateField,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    resetForm,
    handleSubmit,
    getFieldError,
    isFieldValid,
  };
}