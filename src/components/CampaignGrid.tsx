
import { Campaign } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import styles from './CampaignGrid.module.css';

interface CampaignGridProps {
  campaigns: Campaign[];
  loading?: boolean;
}

export function CampaignGrid({ campaigns, loading = false }: CampaignGridProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No campaigns yet</h3>
        <p className={styles.emptyDescription}>
          Be the first to create a campaign and make a difference!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}