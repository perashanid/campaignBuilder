import { urlService, ShareResult } from '../services/urlService';

/**
 * Generate campaign URL using centralized URL service
 */
export function generateCampaignUrl(campaignId: string): string {
  try {
    return urlService.generateCampaignUrl(campaignId);
  } catch (error) {
    console.error('❌ Failed to generate campaign URL:', error);
    // Fallback using environment variable or current origin
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    return `${baseUrl}/campaign/${campaignId}`;
  }
}

/**
 * Copy text to clipboard with enhanced error handling
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text || typeof text !== 'string') {
    console.error('❌ Invalid text provided for clipboard copy');
    return false;
  }

  try {
    // Modern clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      return await fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.error('❌ Clipboard copy failed:', error);
    // Try fallback method
    return await fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback clipboard copy method for older browsers
 */
async function fallbackCopyToClipboard(text: string): Promise<boolean> {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    // Note: execCommand is deprecated but still needed for fallback
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('❌ Fallback clipboard copy failed:', error);
    return false;
  }
}

/**
 * Copy campaign URL to clipboard with comprehensive error handling
 */
export async function copyCampaignUrl(campaignId: string): Promise<ShareResult> {
  try {
    // Generate URL using centralized service
    const url = urlService.generateCampaignUrl(campaignId);
    
    // Attempt to copy to clipboard
    const copySuccess = await copyToClipboard(url);
    
    if (copySuccess) {
      return { 
        success: true, 
        url 
      };
    } else {
      return {
        success: false,
        url,
        error: 'Failed to copy to clipboard',
        fallbackOptions: [
          'Select and copy the URL manually from the text field below',
          'Use the social sharing buttons instead',
          'Right-click and select "Copy" from the context menu'
        ]
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Campaign URL copy failed:', error);
    
    // Try to generate URL with fallback method using environment variable
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    const fallbackUrl = `${baseUrl}/campaign/${campaignId}`;
    
    return {
      success: false,
      url: fallbackUrl,
      error: `URL generation failed: ${errorMessage}`,
      fallbackOptions: [
        'Try refreshing the page and copying again',
        'Use the URL displayed in the text field below',
        'Contact support if the issue persists'
      ]
    };
  }
}