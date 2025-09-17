export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface FormValidation {
  isValid: boolean;
  errors: FormError[];
}

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched: boolean;
  rules?: ValidationRule;
}

export interface FormState<T = any> {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
  values: T;
}

export interface UseFormOptions {
  initialValues: Record<string, any>;
  validationRules?: Record<string, ValidationRule>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
}