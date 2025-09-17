import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Campaign } from '../types/campaign';
import { CampaignStats } from '../components/CampaignStats';
import { CampaignGrid } from '../components/CampaignGrid';
import { MostVisited } from '../components/MostVisited';
import styles from './HomePage.module.css';

export function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const allCampaigns = await apiService.getAllCampaigns();
        setCampaigns(allCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        // Fallback to empty array on error
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  return (
    <div className={styles.homePage}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Campaign Platform</h1>
        <p className={styles.subtitle}>
          Create and share campaigns for blood donation and fundraising
        </p>
        <div className={styles.heroActions}>
          <Link to="/create" className={styles.createButton}>
            Create Campaign
          </Link>
        </div>
      </div>
      
      <div className={styles.content}>
        <CampaignStats />
        
        <MostVisited />
        
        <section className={styles.campaignsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Campaigns</h2>
            <p className={styles.sectionDescription}>
              Discover and support ongoing campaigns in your community
            </p>
          </div>
          
          <CampaignGrid campaigns={campaigns} loading={loading} />
          
          {campaigns.length > 0 && (
            <div className={styles.viewAllContainer}>
              <Link to="/campaigns" className={styles.viewAllButton}>
                View All Campaigns
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}