import { ValidationRules, FormError } from '../types/form';

/**
 * Check if a value is empty (null, undefined, empty string, or whitespace-only string)
 */
function isEmpty(value: unknown): boolean {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

/**
 * Validate a single field against its validation rules
 */
export function validateField<T = unknown>(
  fieldName: string,
  value: T,
  rules: ValidationRules
): string | null {
  const rule = rules[fieldName as keyof typeof rules];
  if (!rule) return null;

  const displayName = formatFieldName(fieldName);

  // Required validation
  if (rule.required && isEmpty(value)) {
    return `${displayName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (isEmpty(value)) {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${displayName} must be at least ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${displayName} must be no more than ${rule.maxLength} characters`;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      return `${displayName} must be at least ${rule.min}`;
    }
    if (rule.max !== undefined && value > rule.max) {
      return `${displayName} must be no more than ${rule.max}`;
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return `${displayName} format is invalid`;
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}

/**
 * Validate an entire form object
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules
): FormError[] {
  const errors: FormError[] = [];

  Object.keys(rules).forEach(fieldName => {
    const error = validateField(fieldName, data[fieldName], rules);
    if (error) {
      errors.push({ field: fieldName, message: error });
    }
  });

  return errors;
}

/**
 * Campaign-specific validation rules
 */
export const campaignValidationRules: ValidationRules = {
  title: {
    required: true,
    minLength: 3, // Reduced from 5
    maxLength: 100,
  },
  description: {
    required: true,
    minLength: 10, // Reduced from 20
    maxLength: 1000,
  },
  targetAmount: {
    required: true,
    min: 1, // Reduced from 100
    max: 1000000,
  },
  mainImage: {
    required: false, // Made optional for testing
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i,
    custom: (value: any) => {
      if (typeof value === 'string' && value && !value.startsWith('http')) {
        return 'Image URL must start with http:// or https://';
      }
      return null;
    },
  },
  hospitalName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  hospitalAddress: {
    required: true,
    minLength: 5, // Reduced from 10
    maxLength: 200,
  },
  hospitalContact: {
    required: false, // Made optional
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: any) => {
      if (typeof value === 'string' && value && value.length < 10) {
        return 'Phone number must be at least 10 digits';
      }
      return null;
    },
  },
  hospitalEmail: {
    required: false, // Made optional
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  mobileBanking: {
    required: false, // Made optional
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: any) => {
      if (typeof value === 'string' && value && value.length < 10) {
        return 'Mobile banking number must be at least 10 digits';
      }
      return null;
    },
  },
  bankAccountNumber: {
    required: false, // Made optional
    minLength: 5, // Reduced from 8
    maxLength: 20,
    pattern: /^[0-9]+$/,
  },
  bankName: {
    required: false, // Made optional
    minLength: 2,
    maxLength: 50,
  },
  accountHolder: {
    required: false, // Made optional
    minLength: 2,
    maxLength: 50,
  },
};

/**
 * Validate image URL
 */
export function validateImageUrl(url: string): boolean {
  const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i;
  return imageUrlPattern.test(url);
}

/**
 * Format validation error messages for display
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}