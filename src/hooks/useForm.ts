import { useState, useCallback } from 'react';
import { FormState, ValidationRules, ValidationError } from '../types/form';
import { validateField, validateForm } from '../utils/validation';

export interface UseFormOptions<T> {
  initialData: T;
  validationRules?: ValidationRules;
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
  validationRules = {} as ValidationRules,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [formState, setFormState] = useState<FormState<T>>({
    fields: {},
    values: { ...initialData },
    errors: [],
    isSubmitting: false,
    isValid: true,
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState((prev: FormState<T>) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      // Clear field error when user starts typing
      errors: prev.errors.filter((error: ValidationError) => error.field !== field as string),
    }));
  }, []);

  const validateSingleField = useCallback((field: keyof T) => {
    const fieldName = field as string;
    const value = formState.values[field];
    const error = validateField(fieldName, value, validationRules);
    
    setFormState((prev: FormState<T>) => {
      const newErrors = prev.errors.filter((e: ValidationError) => e.field !== fieldName);
      if (error) {
        newErrors.push({ field: fieldName, message: error });
      }
      
      return {
        ...prev,
        errors: newErrors,
        isValid: newErrors.length === 0,
      };
    });
  }, [formState.values, validationRules]);

  const validateEntireForm = useCallback((): boolean => {
    const errors = validateForm(formState.values, validationRules);
    const isValid = errors.length === 0;
    
    setFormState((prev: FormState<T>) => ({
      ...prev,
      errors,
      isValid,
    }));
    
    return isValid;
  }, [formState.values, validationRules]);

  const resetForm = useCallback(() => {
    setFormState({
      fields: {},
      values: { ...initialData },
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

    setFormState((prev: FormState<T>) => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(formState.values);
    } catch (error) {
      console.error('Form submission error:', error);
      // You could add error handling here
    } finally {
      setFormState((prev: FormState<T>) => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, onSubmit, validateEntireForm]);

  const getFieldError = useCallback((field: keyof T): string | undefined => {
    const error = formState.errors.find((e: ValidationError) => e.field === field as string);
    return error?.message;
  }, [formState.errors]);

  const isFieldValid = useCallback((field: keyof T): boolean => {
    return !formState.errors.some((e: ValidationError) => e.field === field as string);
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