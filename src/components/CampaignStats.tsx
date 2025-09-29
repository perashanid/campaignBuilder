import { useEffect, useState } from 'react';
import { apiService, PlatformStats } from '../services/api';
import styles from './CampaignStats.module.css';

const STATS_UPDATE_INTERVAL = 30000; // 30 seconds

export function CampaignStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const platformStats = await apiService.getPlatformStats();
        setStats(platformStats);
      } catch (error) {
        console.error('Failed to load platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, STATS_UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className={styles.statsContainer}>
        <h2 className={styles.title}>Platform Statistics</h2>
        <div className={styles.loading}>Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.title}>Platform Statistics</h2>
      
      {/* Main Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard 
          number={stats.campaigns.total} 
          label="Total Campaigns" 
          subtitle={`${stats.campaigns.active} active`}
        />
        <StatCard 
          number={stats.users.total} 
          label="Registered Users" 
          subtitle={`+${stats.users.newThisMonth} this month`}
        />
        <StatCard 
          number={formatNumber(stats.engagement.totalViews)} 
          label="Total Views" 
          subtitle="Platform engagement"
        />
        <StatCard 
          number={stats.campaigns.completed} 
          label="Campaigns Completed" 
          subtitle="Successfully funded"
        />
      </div>

      {/* Secondary Stats */}
      <div className={styles.secondaryStats}>
        <div className={styles.statSection}>
          <h3>Campaign Types</h3>
          <div className={styles.miniStatsGrid}>
            <StatCard number={stats.campaigns.fundraising} label="Fundraising" />
            <StatCard number={stats.campaigns.bloodDonation} label="Blood Donation" />
          </div>
        </div>
        
        <div className={styles.statSection}>
          <h3>Financial Impact</h3>
          <div className={styles.miniStatsGrid}>
            <StatCard 
              number={formatCurrency(stats.engagement.totalFundsRaised)} 
              label="Total Raised" 
            />
            <StatCard 
              number={`${stats.engagement.averageFundingProgress.toFixed(1)}%`} 
              label="Avg Progress" 
            />
          </div>
        </div>

        <div className={styles.statSection}>
          <h3>Recent Activity</h3>
          <div className={styles.miniStatsGrid}>
            <StatCard number={stats.campaigns.thisWeek} label="This Week" />
            <StatCard number={stats.campaigns.thisMonth} label="This Month" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Enhanced StatCard component
interface StatCardProps {
  number: string | number;
  label: string;
  subtitle?: string;
}

function StatCard({ number, label, subtitle }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statNumber}>{number}</div>
      <div className={styles.statLabel}>{label}</div>
      {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
    </div>
  );
}