import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

/**
 * Hook for managing user notifications
 * This is a simple implementation - in a real app you'd use a toast library
 */
export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return showNotification({ type: 'success', message, duration });
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    return showNotification({ type: 'error', message, duration });
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return showNotification({ type: 'info', message, duration });
  }, [showNotification]);

  return {
    notifications,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
  };
}