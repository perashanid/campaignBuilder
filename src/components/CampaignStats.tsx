import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { FundraisingCampaign } from '../types/campaign';
import styles from './CampaignStats.module.css';

interface CampaignStatistics {
  totalCampaigns: number;
  fundraisingCampaigns: number;
  bloodDonationCampaigns: number;
  totalFundsRaised: number;
  averageFundingProgress: number;
}

const STATS_UPDATE_INTERVAL = 30000; // 30 seconds

export function CampaignStats() {
  const [stats, setStats] = useState<CampaignStatistics>({
    totalCampaigns: 0,
    fundraisingCampaigns: 0,
    bloodDonationCampaigns: 0,
    totalFundsRaised: 0,
    averageFundingProgress: 0,
  });

  useEffect(() => {
    const calculateStats = async () => {
      try {
        const campaigns = await apiService.getAllCampaigns();
      
      const fundraisingCampaigns = campaigns.filter(c => c.type === 'fundraising') as FundraisingCampaign[];
      const bloodDonationCampaigns = campaigns.filter(c => c.type === 'blood-donation');
      
      const totalFundsRaised = calculateTotalFundsRaised(fundraisingCampaigns);
      const averageFundingProgress = calculateAverageFundingProgress(fundraisingCampaigns);

        setStats({
          totalCampaigns: campaigns.length,
          fundraisingCampaigns: fundraisingCampaigns.length,
          bloodDonationCampaigns: bloodDonationCampaigns.length,
          totalFundsRaised,
          averageFundingProgress,
        });
      } catch (error) {
        console.error('Failed to load campaign stats:', error);
      }
    };

    calculateStats();
    const interval = setInterval(calculateStats, STATS_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.title}>Platform Statistics</h2>
      <div className={styles.statsGrid}>
        <StatCard number={stats.totalCampaigns} label="Total Campaigns" />
        <StatCard number={stats.fundraisingCampaigns} label="Fundraising Campaigns" />
        <StatCard number={stats.bloodDonationCampaigns} label="Blood Donation Campaigns" />
        <StatCard number={formatCurrency(stats.totalFundsRaised)} label="Total Funds Raised" />
        <StatCard number={`${stats.averageFundingProgress.toFixed(1)}%`} label="Average Progress" />
      </div>
    </div>
  );
}

// Helper functions moved outside component for better testability
function calculateTotalFundsRaised(fundraisingCampaigns: FundraisingCampaign[]): number {
  return fundraisingCampaigns.reduce((total, campaign) => {
    return total + (campaign.currentAmount || 0);
  }, 0);
}

function calculateAverageFundingProgress(fundraisingCampaigns: FundraisingCampaign[]): number {
  if (fundraisingCampaigns.length === 0) return 0;
  
  const totalProgress = fundraisingCampaigns.reduce((total, campaign) => {
    const progress = ((campaign.currentAmount || 0) / campaign.targetAmount) * 100;
    return total + progress;
  }, 0);
  
  return totalProgress / fundraisingCampaigns.length;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Extracted StatCard component for better reusability
interface StatCardProps {
  number: string | number;
  label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statNumber}>{number}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}