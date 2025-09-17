import { useEffect } from 'react';
import { apiService } from '../services/api';

/**
 * Hook to track campaign views
 */
export function useViewTracking(campaignId: string | undefined) {
  useEffect(() => {
    if (!campaignId) return;

    // Debounce view tracking to prevent multiple calls
    const timeoutId = setTimeout(async () => {
      try {
        await apiService.incrementCampaignView(campaignId);
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.debug('Failed to track campaign view:', error);
      }
    }, 1000); // Wait 1 second before tracking

    return () => clearTimeout(timeoutId);
  }, [campaignId]);
}