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
   * Load URL configuration with environment variables
   */
  private loadConfiguration(): UrlConfig {
    // Get environment variables
    const envBaseUrl = import.meta.env.VITE_BASE_URL;
    const envApiUrl = import.meta.env.VITE_API_URL;
    const envEnvironment = import.meta.env.VITE_ENVIRONMENT;

    // Auto-detect production environment if not specified
    const isProduction = envEnvironment === 'production' || 
                        (typeof window !== 'undefined' && 
                         window.location.hostname.includes('onrender.com'));

    // Use environment variables with fallbacks
    const finalBaseUrl = envBaseUrl || 
                        (isProduction 
                          ? 'https://campaignbuilder.onrender.com'
                          : 'http://localhost:3000');

    const finalApiUrl = envApiUrl || 
                       (isProduction
                         ? 'https://campaignbuilder-backend.onrender.com'
                         : 'http://localhost:3001');

    return {
      baseUrl: finalBaseUrl,
      apiUrl: finalApiUrl,
      environment: isProduction ? 'production' : 'development',
      allowLocalOverride: !isProduction
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
    // Generate URL with hash prefix for HashRouter
    return `${baseUrl}/#/campaign/${campaignId}`;
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