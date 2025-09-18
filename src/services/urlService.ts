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
   * Load URL configuration with auto-detection
   */
  private loadConfiguration(): UrlConfig {
    // Auto-detect production environment
    const isProduction = typeof window !== 'undefined' && 
                        (window.location.hostname.includes('onrender.com') || 
                         window.location.hostname.includes('campaignbuilder-frontend'));

    // Set URLs based on environment
    const finalBaseUrl = isProduction 
      ? 'https://campaignbuilder-frontend.onrender.com'
      : 'http://localhost:3000';

    const finalApiUrl = isProduction
      ? 'https://campaignbuilder-backend.onrender.com/api'
      : 'http://localhost:3001/api';

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