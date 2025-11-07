import { useState } from 'react';
import { FaTimes, FaDollarSign, FaTint } from 'react-icons/fa';
import { Campaign } from '../types/campaign';
import { apiService } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import styles from './UpdateProgressModal.module.css';

interface UpdateProgressModalProps {
  campaign: Campaign;
  onClose: () => void;
  onUpdate: (updatedCampaign: Campaign) => void;
}

export function UpdateProgressModal({ campaign, onClose, onUpdate }: UpdateProgressModalProps) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  const isFundraising = campaign.type === 'fundraising';
  const currentValue = isFundraising 
    ? (campaign as any).currentAmount || 0
    : (campaign as any).currentBloodUnits || 0;
  
  const [value, setValue] = useState(currentValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (value < 0) {
      showNotification({ message: 'Value cannot be negative', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const updateData = isFundraising 
        ? { currentAmount: value }
        : { currentBloodUnits: value };
      
      const updated = await apiService.updateCampaignProgress(campaign.id, updateData);
      showNotification({ 
        message: `Progress updated successfully!`, 
        type: 'success' 
      });
      onUpdate(updated);
      onClose();
    } catch (error) {
      showNotification({ 
        message: 'Failed to update progress', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {isFundraising ? <FaDollarSign /> : <FaTint />}
            Update Progress
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="value">
              {isFundraising ? 'Current Amount Raised ($)' : 'Blood Units Collected'}
            </label>
            <input
              id="value"
              type="number"
              min="0"
              step={isFundraising ? "0.01" : "1"}
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              required
            />
            {isFundraising && (campaign as any).targetAmount && (
              <p className={styles.hint}>
                Target: ${(campaign as any).targetAmount.toLocaleString()}
              </p>
            )}
            {!isFundraising && (campaign as any).targetBloodUnits && (
              <p className={styles.hint}>
                Target: {(campaign as any).targetBloodUnits} units
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
