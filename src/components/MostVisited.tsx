import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Campaign } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import styles from './MostVisited.module.css';

export function MostVisited() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMostVisited = async () => {
      try {
        const data = await apiService.getMostVisitedCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error loading most visited campaigns:', error);
        // Fallback to regular campaigns if most visited fails
        try {
          const fallbackData = await apiService.getAllCampaigns();
          setCampaigns(fallbackData.slice(0, 6));
        } catch (fallbackError) {
          console.error('Error loading fallback campaigns:', fallbackError);
          setCampaigns([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMostVisited();
  }, []);

  if (loading) {
    return (
      <section className={styles.mostVisited}>
        <div className={styles.header}>
          <h2 className={styles.title}>Most Visited Campaigns</h2>
          <p className={styles.subtitle}>Discover popular campaigns in your community</p>
        </div>
        <div className={styles.loading}>Loading popular campaigns...</div>
      </section>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <section className={styles.mostVisited}>
      <div className={styles.header}>
        <h2 className={styles.title}>Most Visited Campaigns</h2>
        <p className={styles.subtitle}>Discover popular campaigns in your community</p>
      </div>
      
      <div className={styles.campaignGrid}>
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}