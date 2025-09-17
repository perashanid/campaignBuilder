import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Campaign } from '../types/campaign';
import { CampaignGrid } from '../components/CampaignGrid';
import { FilterButton } from '../components/FilterButton';
import { useCampaignFilter } from '../hooks/useCampaignFilter';
import styles from './CampaignsList.module.css';

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { filter, setFilter, filteredCampaigns, getCampaignCount } = useCampaignFilter(campaigns);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const allCampaigns = await apiService.getAllCampaigns();
        setCampaigns(allCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  return (
    <div className={styles.campaignsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Campaigns</h1>
        <p className={styles.description}>
          Browse and support campaigns in your community
        </p>
      </div>

      <div className={styles.filters}>
        <FilterButton
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
          className={styles.filterButton}
        >
          All Campaigns ({getCampaignCount('all')})
        </FilterButton>
        <FilterButton
          isActive={filter === 'fundraising'}
          onClick={() => setFilter('fundraising')}
          className={styles.filterButton}
        >
          Fundraising ({getCampaignCount('fundraising')})
        </FilterButton>
        <FilterButton
          isActive={filter === 'blood-donation'}
          onClick={() => setFilter('blood-donation')}
          className={styles.filterButton}
        >
          Blood Donation ({getCampaignCount('blood-donation')})
        </FilterButton>
      </div>

      <div className={styles.content}>
        <CampaignGrid campaigns={filteredCampaigns} loading={loading} />
      </div>
    </div>
  );
}