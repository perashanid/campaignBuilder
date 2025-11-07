import { useState, useEffect } from 'react';
import { CampaignUpdate, CampaignUpdateFormData } from '../types/campaign';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { UpdateForm } from './UpdateForm';
import { apiService } from '../services/api';
import styles from './CampaignUpdates.module.css';

interface CampaignUpdatesProps {
  campaignId: string;
  isOwner?: boolean;
}

export function CampaignUpdates({ campaignId, isOwner = false }: CampaignUpdatesProps) {
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    try {
      setIsLoading(true);
      const campaignUpdates = await apiService.getCampaignUpdates(campaignId);
      setUpdates(campaignUpdates);
    } catch (error) {
      console.error('Failed to load updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUpdate = async (formData: CampaignUpdateFormData) => {
    setIsSubmitting(true);
    try {
      const newUpdate = await apiService.createCampaignUpdate(campaignId, formData);
      setUpdates(prev => [newUpdate, ...prev]);
      setShowForm(false);
      showNotification({ message: 'Update created successfully!', type: 'success' });
    } catch (error) {
      throw error; // Let UpdateForm handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUpdateTypeIcon = (type: CampaignUpdate['type']) => {
    switch (type) {
      case 'progress':
        return (
          <svg className={styles.typeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'milestone':
        return (
          <svg className={styles.typeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      default:
        return (
          <svg className={styles.typeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getUpdateTypeLabel = (type: CampaignUpdate['type']) => {
    switch (type) {
      case 'progress':
        return 'Progress Update';
      case 'milestone':
        return 'Milestone';
      default:
        return 'General Update';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading updates...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Campaign Updates</h2>
        {isOwner && isAuthenticated && (
          <button
            onClick={() => setShowForm(true)}
            className={styles.addButton}
            disabled={showForm}
          >
            Add Update
          </button>
        )}
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <UpdateForm
            onSubmit={handleCreateUpdate}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {updates.length === 0 ? (
        <div className={styles.empty}>
          <p>No updates yet.</p>
          {isOwner && isAuthenticated && (
            <p>Be the first to share an update with your supporters!</p>
          )}
        </div>
      ) : (
        <div className={styles.timeline}>
          {updates.map((update, index) => (
            <div key={update.id} className={styles.updateItem}>
              <div className={styles.updateIcon}>
                {getUpdateTypeIcon(update.type)}
              </div>
              <div className={styles.updateContent}>
                <div className={styles.updateHeader}>
                  <div className={styles.updateMeta}>
                    <span className={styles.updateType}>
                      {getUpdateTypeLabel(update.type)}
                    </span>
                    <span className={styles.updateDate}>
                      {formatDate(update.createdAt)}
                    </span>
                  </div>
                </div>
                <h3 className={styles.updateTitle}>{update.title}</h3>
                <p className={styles.updateDescription}>{update.description}</p>
                {update.imageUrl && (
                  <div className={styles.updateImage}>
                    <img src={update.imageUrl} alt={update.title} />
                  </div>
                )}
              </div>
              {index < updates.length - 1 && <div className={styles.timelineConnector} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}