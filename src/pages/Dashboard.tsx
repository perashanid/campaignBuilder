import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { Campaign } from '../types/campaign';
import { apiService } from '../services/api';
import { CampaignCard } from '../components/CampaignCard';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'fundraising' | 'blood-donation'>('all');

  useEffect(() => {
    loadUserCampaigns();
  }, []);

  const loadUserCampaigns = async () => {
    try {
      setIsLoading(true);
      const allCampaigns = await apiService.getUserCampaigns();
      setCampaigns(allCampaigns);
    } catch (error) {
      showNotification({ message: 'Failed to load campaigns', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      showNotification({ message: 'Campaign deleted successfully', type: 'success' });
    } catch (error) {
      showNotification({ message: 'Failed to delete campaign', type: 'error' });
    }
  };

  const handleToggleVisibility = async (campaignId: string, isHidden: boolean) => {
    try {
      await apiService.updateCampaignVisibility(campaignId, !isHidden);
      setCampaigns(prev => 
        prev.map(c => 
          c.id === campaignId 
            ? { ...c, isHidden: !isHidden }
            : c
        )
      );
      showNotification({
        message: `Campaign ${!isHidden ? 'hidden' : 'made visible'} successfully`,
        type: 'success'
      });
    } catch (error) {
      showNotification({ message: 'Failed to update campaign visibility', type: 'error' });
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true;
    return campaign.type === filter;
  });

  const stats = {
    total: campaigns.length,
    fundraising: campaigns.filter(c => c.type === 'fundraising').length,
    bloodDonation: campaigns.filter(c => c.type === 'blood-donation').length,
    totalRaised: campaigns
      .filter(c => c.type === 'fundraising')
      .reduce((sum, c) => sum + (c as any).currentAmount, 0),
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your campaigns...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your campaigns and track their progress</p>
        </div>
        <Link to="/create" className={styles.createButton}>
          Create New Campaign
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>{stats.total}</h3>
          <p>Total Campaigns</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats.fundraising}</h3>
          <p>Fundraising</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats.bloodDonation}</h3>
          <p>Blood Donation</p>
        </div>
        <div className={styles.statCard}>
          <h3>${stats.totalRaised.toLocaleString()}</h3>
          <p>Total Raised</p>
        </div>
        <Link to="/analytics" className={styles.analyticsCard}>
          <div className={styles.analyticsIcon}>
            <FaChartBar />
          </div>
          <div className={styles.analyticsContent}>
            <h3>View Analytics</h3>
            <p>Get detailed insights and optimize performance</p>
          </div>
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.filters}>
          <h2>Your Campaigns</h2>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'fundraising' ? styles.active : ''}`}
              onClick={() => setFilter('fundraising')}
            >
              Fundraising ({stats.fundraising})
            </button>
            <button
              className={`${styles.filterButton} ${filter === 'blood-donation' ? styles.active : ''}`}
              onClick={() => setFilter('blood-donation')}
            >
              Blood Donation ({stats.bloodDonation})
            </button>
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className={styles.empty}>
            <h3>No campaigns found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't created any campaigns yet."
                : `You don't have any ${filter.replace('-', ' ')} campaigns.`
              }
            </p>
            <Link to="/create" className={styles.createFirstButton}>
              Create Your First Campaign
            </Link>
          </div>
        ) : (
          <div className={styles.campaignGrid}>
            {filteredCampaigns.map(campaign => (
              <div key={campaign.id} className={styles.campaignWrapper}>
                <CampaignCard campaign={campaign} />
                <div className={styles.campaignActions}>
                  <Link 
                    to={`/campaign/${campaign.id}/edit`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleVisibility(campaign.id, (campaign as any).isHidden)}
                    className={styles.visibilityButton}
                  >
                    {(campaign as any).isHidden ? 'Show' : 'Hide'}
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}