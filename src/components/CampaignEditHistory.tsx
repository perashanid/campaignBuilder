import { useState, useEffect } from 'react';
import type { CampaignEditHistory as EditHistoryType } from '../types/campaign';
import { apiService } from '../services/api';
import styles from './CampaignEditHistory.module.css';

interface CampaignEditHistoryProps {
  campaignId: string;
}

const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'None';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length > 0 ? `${value.length} items` : 'None';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const CampaignEditHistory: React.FC<CampaignEditHistoryProps> = ({ campaignId }) => {
  const [history, setHistory] = useState<EditHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [campaignId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCampaignEditHistory(campaignId);
      setHistory(data);
    } catch (err) {
      setError('Failed to load edit history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading edit history...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (history.length === 0) {
    return <div className={styles.empty}>No edits have been made to this campaign yet.</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Edit History</h3>
      <div className={styles.timeline}>
        {history.map((edit) => (
          <div key={edit.id} className={styles.editEntry}>
            <div className={styles.editHeader}>
              <span className={styles.editor}>{edit.editedBy.name}</span>
              <span className={styles.date}>
                {new Date(edit.editedAt).toLocaleString()}
              </span>
            </div>
            <div className={styles.changes}>
              {edit.changes.map((change, idx) => (
                <div key={idx} className={styles.change}>
                  <div className={styles.fieldName}>{formatFieldName(change.field)}</div>
                  <div className={styles.valueChange}>
                    <span className={styles.oldValue}>{formatValue(change.old_value)}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.newValue}>{formatValue(change.new_value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
