import { Notification } from '../hooks/useNotification';
import styles from './NotificationToast.module.css';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const handleClose = () => {
    onClose(notification.id);
  };

  return (
    <div className={`${styles.toast} ${styles[notification.type]}`}>
      <div className={styles.content}>
        <div className={styles.message}>{notification.message}</div>
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}