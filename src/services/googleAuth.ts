/**
 * Google OAuth integration service
 */

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthResponse {
  credential: string;
  select_by: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized = false;

  constructor() {
    // Use environment variable or fallback to demo client ID
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-google-client-id';
  }

  /**
   * Initialize Google OAuth
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // In a real app, you would load the Google Identity Services library
    // For demo purposes, we'll simulate the Google login
    if (this.clientId === 'demo-google-client-id') {
      console.log('Google Auth initialized in demo mode');
      this.isInitialized = true;
      return;
    }

    try {
      // Load Google Identity Services
      await this.loadGoogleScript();
      
      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
        });
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      throw new Error('Google authentication is not available');
    }
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Handle Google credential response
   */
  private handleCredentialResponse(response: GoogleAuthResponse) {
    // This would normally decode the JWT token
    // For demo purposes, we'll simulate the user data
    const mockUser: GoogleUser = {
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      picture: 'https://via.placeholder.com/100x100?text=User',
    };

    // Dispatch custom event with user data
    window.dispatchEvent(new CustomEvent('googleLoginSuccess', {
      detail: mockUser
    }));
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(element: HTMLElement, options: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    width?: number;
  } = {}): void {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    if (this.clientId === 'demo-google-client-id') {
      // Render demo button
      this.renderDemoButton(element, options);
      return;
    }

    // Render real Google button
    if (window.google) {
      window.google.accounts.id.renderButton(element, {
        theme: options.theme || 'outline',
        size: options.size || 'large',
        text: options.text || 'signin_with',
        shape: options.shape || 'rectangular',
        width: options.width || 300,
      });
    }
  }

  /**
   * Render demo Google button
   */
  private renderDemoButton(element: HTMLElement, options: any): void {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'google-signin-button';
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
        <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z"/>
      </svg>
      Continue with Google
    `;
    
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dadce0;
      border-radius: 6px;
      background: white;
      color: #3c4043;
      font-family: 'Google Sans', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.boxShadow = 'none';
    });

    button.addEventListener('click', () => {
      // Simulate Google login for demo
      setTimeout(() => {
        this.handleCredentialResponse({
          credential: 'demo-jwt-token',
          select_by: 'btn'
        });
      }, 500);
    });

    element.innerHTML = '';
    element.appendChild(button);
  }

  /**
   * Prompt Google One Tap
   */
  prompt(): void {
    if (!this.isInitialized || this.clientId === 'demo-google-client-id') {
      return;
    }

    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }

  /**
   * Sign out from Google
   */
  signOut(): void {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const googleAuthService = new GoogleAuthService();
export type { GoogleUser };