/**
 * URL Configuration Service
 * Provides centralized URL generation with environment-aware configuration
 */

export interface UrlConfig {
  baseUrl: string;
  apiUrl: string;
  environment: 'development' | 'production' | 'staging';
  allowLocalOverride: boolean;
}

export interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
  fallbackOptions?: string[];
}

class UrlService {
  private config: UrlConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Load URL configuration from environment variables with fallbacks
   */
  private loadConfiguration(): UrlConfig {
    // Get environment variables
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const apiUrl = import.meta.env.VITE_API_URL;
    const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
    const devMode = import.meta.env.VITE_DEV_MODE === 'true';

    // Determine base URL with fallback logic
    let finalBaseUrl: string;
    
    if (baseUrl) {
      // Use configured base URL
      finalBaseUrl = baseUrl;
    } else if (environment === 'production') {
      // In production, try to use current origin but warn if it looks like localhost
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
        console.warn('⚠️ Production environment detected but using localhost URL. Please configure VITE_BASE_URL.');
      }
      finalBaseUrl = currentOrigin;
    } else {
      // Development fallback - use current origin
      finalBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    }

    return {
      baseUrl: finalBaseUrl,
      apiUrl: apiUrl || 'https://campaignbuilder-backend.onrender.com/api',
      environment: environment as 'development' | 'production' | 'staging',
      allowLocalOverride: devMode
    };
  }

  /**
   * Generate a campaign URL using configured base URL
   */
  generateCampaignUrl(campaignId: string): string {
    if (!campaignId || typeof campaignId !== 'string') {
      throw new Error('Invalid campaign ID provided');
    }

    // Validate campaign ID format (basic validation)
    if (!this.validateCampaignId(campaignId)) {
      throw new Error('Campaign ID format is invalid');
    }

    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/campaign/${campaignId}`;
  }

  /**
   * Get the configured base URL
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get the current environment
   */
  getEnvironment(): string {
    return this.config.environment;
  }

  /**
   * Validate a URL format
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate campaign ID format
   */
  private validateCampaignId(campaignId: string): boolean {
    // Basic validation - not empty, reasonable length, alphanumeric with hyphens
    return /^[a-zA-Z0-9-_]{1,100}$/.test(campaignId);
  }

  /**
   * Get configuration for debugging
   */
  getConfig(): UrlConfig {
    return { ...this.config };
  }

  /**
   * Update base URL (for testing purposes)
   */
  updateBaseUrl(newBaseUrl: string): void {
    if (!this.config.allowLocalOverride && this.config.environment === 'production') {
      console.warn('⚠️ Base URL override not allowed in production environment');
      return;
    }

    if (!this.validateUrl(newBaseUrl)) {
      throw new Error('Invalid base URL format');
    }

    this.config.baseUrl = newBaseUrl;
  }
}

// Export singleton instance
export const urlService = new UrlService();