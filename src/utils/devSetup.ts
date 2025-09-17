import { seedLocalStorage, clearLocalStorage } from './seedData';

/**
 * Development setup utilities
 */
export class DevSetup {
  /**
   * Initialize development environment with sample data
   */
  static init(): void {
    console.log('🚀 Initializing development environment...');
    
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      // Check if localStorage already has data
      const existingCampaigns = localStorage.getItem('campaigns');
      
      if (!existingCampaigns) {
        console.log('📦 No existing data found, seeding with sample campaigns...');
        seedLocalStorage();
      } else {
        console.log('✅ Existing campaign data found in localStorage');
      }
      
      // Add development helpers to window object
      if (typeof window !== 'undefined') {
        (window as any).devUtils = {
          seedData: seedLocalStorage,
          clearData: clearLocalStorage,
          showData: () => {
            console.log('Campaigns:', JSON.parse(localStorage.getItem('campaigns') || '[]'));
            console.log('Views:', JSON.parse(localStorage.getItem('campaign_views') || '{}'));
          }
        };
        
        console.log('🛠️  Development utilities available at window.devUtils');
        console.log('   - devUtils.seedData() - Add sample campaigns');
        console.log('   - devUtils.clearData() - Clear all data');
        console.log('   - devUtils.showData() - Show current data');
      }
    }
  }
  
  /**
   * Check if all required environment variables are set
   */
  static checkEnvironment(): boolean {
    const requiredVars: string[] = [];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️  Missing environment variables:', missingVars);
      return false;
    }
    
    return true;
  }
  
  /**
   * Display current configuration
   */
  static showConfig(): void {
    console.log('🔧 Current Configuration:');
    console.log('  - Mode:', import.meta.env.MODE);
    console.log('  - Dev:', import.meta.env.DEV);
    console.log('  - Prod:', import.meta.env.PROD);
    console.log('  - API URL:', import.meta.env.VITE_API_URL || 'Not set (using localStorage)');
    console.log('  - Use Local Storage:', import.meta.env.VITE_USE_LOCAL_STORAGE || 'true');
  }
}