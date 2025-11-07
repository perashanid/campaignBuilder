/**
 * Development setup utilities
 */
export class DevSetup {
  /**
   * Initialize development environment
   */
  static init(): void {
    console.log('🚀 Initializing development environment...');
    
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('✅ Development mode - using API backend');
      
      // Check AI feature availability
      if (import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        console.log('✨ AI Writing Assistant is enabled');
      } else {
        console.log('💡 AI Writing Assistant available! Add VITE_GEMINI_API_KEY to .env.local');
        console.log('   Get your key at: https://aistudio.google.com/app/apikey');
      }
      
      // Add development helpers to window object
      if (typeof window !== 'undefined') {
        (window as any).devUtils = {
          showConfig: () => DevSetup.showConfig(),
          checkEnv: () => DevSetup.checkEnvironment()
        };
        
        console.log('🛠️  Development utilities available at window.devUtils');
        console.log('   - devUtils.showConfig() - Show current configuration');
        console.log('   - devUtils.checkEnv() - Check environment variables');
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
    console.log('  - API URL:', import.meta.env.VITE_API_URL || 'Not set');
    console.log('  - AI Assistant:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured');
  }
}