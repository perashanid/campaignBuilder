// Re-export all types for easy importing
export * from './campaign';
export * from './theme';
export * from './form';

// Common utility types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}