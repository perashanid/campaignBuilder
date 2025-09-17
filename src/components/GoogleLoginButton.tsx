import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { googleAuthService, GoogleUser } from '../services/googleAuth';
import styles from './GoogleLoginButton.module.css';

interface GoogleLoginButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
}

export function GoogleLoginButton({ 
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  disabled = false
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await googleAuthService.initialize();
        
        if (buttonRef.current && !disabled) {
          googleAuthService.renderButton(buttonRef.current, {
            text,
            theme,
            size,
            width: buttonRef.current.offsetWidth || 300,
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    };

    initializeGoogleAuth();

    // Listen for Google login success
    const handleGoogleLoginSuccess = async (event: CustomEvent<GoogleUser>) => {
      try {
        await loginWithGoogle(event.detail);
        showNotification('Login successful!', 'success');
        navigate(from, { replace: true });
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : 'Google login failed',
          'error'
        );
      }
    };

    window.addEventListener('googleLoginSuccess', handleGoogleLoginSuccess as EventListener);

    return () => {
      window.removeEventListener('googleLoginSuccess', handleGoogleLoginSuccess as EventListener);
    };
  }, [text, theme, size, disabled, loginWithGoogle, navigate, from, showNotification]);

  return (
    <div className={styles.container}>
      <div 
        ref={buttonRef} 
        className={`${styles.googleButton} ${disabled ? styles.disabled : ''}`}
      />
    </div>
  );
}