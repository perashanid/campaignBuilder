import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiEye, FiDollarSign, FiActivity, FiBarChart2, FiPieChart } from 'react-icons/fi';
import { apiService } from '../services/api';
import styles from './AnalyticsPage.module.css';

interface CampaignAnalytics {
  id: string;
  title: string;
  type: string;
  viewCount: number;
  createdAt: string;
  targetAmount?: number;
  currentAmount?: number;
  progress?: number;
  dailyViews?: { date: string; views: number }[];
  conversionRate?: number;
}

interface PlatformStats {
  totalCampaigns: number;
  totalViews: number;
  totalFundsRaised: number;
  activeCampaigns: number;
  completedCampaigns: number;
  averageProgress: number;
}

export function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignAnalytics[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [userCampaigns, stats] = await Promise.all([
        apiService.getUserCampaigns(),
        apiService.getPlatformStats()
      ]);

      const analyticsData = userCampaigns.map((campaign: any) => ({
        id: campaign.id,
        title: campaign.title,
        type: campaign.type,
        viewCount: campaign.viewCount || 0,
        createdAt: campaign.createdAt,
        targetAmount: campaign.targetAmount,
        currentAmount: campaign.currentAmount,
        progress: campaign.targetAmount 
          ? Math.round((campaign.currentAmount / campaign.targetAmount) * 100)
          : 0,
        conversionRate: campaign.viewCount > 0 
          ? Math.round((campaign.currentAmount || 0) / campaign.viewCount * 100)
          : 0
      }));

      setCampaigns(analyticsData);
      setPlatformStats({
        totalCampaigns: stats.campaigns?.total || 0,
        totalViews: stats.engagement?.totalViews || 0,
        totalFundsRaised: stats.engagement?.totalFundsRaised || 0,
        activeCampaigns: stats.campaigns?.active || 0,
        completedCampaigns: stats.campaigns?.completed || 0,
        averageProgress: stats.engagement?.averageFundingProgress || 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = campaigns.reduce((sum, c) => sum + c.viewCount, 0);
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
  const avgProgress = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + (c.progress || 0), 0) / campaigns.length)
    : 0;

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Campaign Analytics</h1>
        <p className={styles.subtitle}>Get detailed insights and reports to optimize your campaign performance</p>
        
        <div className={styles.timeRangeSelector}>
          <button 
            className={timeRange === '7d' ? styles.active : ''}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button 
            className={timeRange === '30d' ? styles.active : ''}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button 
            className={timeRange === 'all' ? styles.active : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading analytics...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.statIcon}>
                <FiBarChart2 />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{campaigns.length}</div>
                <div className={styles.statLabel}>Total Campaigns</div>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.statIcon}>
                <FiEye />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalViews.toLocaleString()}</div>
                <div className={styles.statLabel}>Total Views</div>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.statIcon}>
                <FiDollarSign />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>${totalRaised.toLocaleString()}</div>
                <div className={styles.statLabel}>Total Raised</div>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.statIcon}>
                <FiTrendingUp />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{avgProgress}%</div>
                <div className={styles.statLabel}>Avg Progress</div>
              </div>
            </motion.div>
          </div>

          <div className={styles.chartsSection}>
            <motion.div 
              className={styles.chartCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className={styles.chartTitle}>
                <FiPieChart /> Campaign Performance
              </h3>
              <div className={styles.campaignsList}>
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className={styles.campaignItem}>
                    <div className={styles.campaignInfo}>
                      <div className={styles.campaignName}>{campaign.title}</div>
                      <div className={styles.campaignMeta}>
                        <span className={styles.campaignType}>{campaign.type}</span>
                        <span className={styles.campaignViews}>
                          <FiEye /> {campaign.viewCount} views
                        </span>
                      </div>
                    </div>
                    {campaign.type === 'fundraising' && (
                      <div className={styles.campaignProgress}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill}
                            style={{ width: `${Math.min(campaign.progress || 0, 100)}%` }}
                          />
                        </div>
                        <div className={styles.progressText}>
                          ${campaign.currentAmount?.toLocaleString()} / ${campaign.targetAmount?.toLocaleString()} ({campaign.progress}%)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <div className={styles.emptyState}>
                    <FiBarChart2 />
                    <p>No campaigns yet. Create your first campaign to see analytics!</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              className={styles.chartCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className={styles.chartTitle}>
                <FiActivity /> Platform Insights
              </h3>
              {platformStats && (
                <div className={styles.insightsList}>
                  <div className={styles.insightItem}>
                    <div className={styles.insightLabel}>Active Campaigns</div>
                    <div className={styles.insightValue}>{platformStats.activeCampaigns}</div>
                  </div>
                  <div className={styles.insightItem}>
                    <div className={styles.insightLabel}>Completed Campaigns</div>
                    <div className={styles.insightValue}>{platformStats.completedCampaigns}</div>
                  </div>
                  <div className={styles.insightItem}>
                    <div className={styles.insightLabel}>Platform Total Views</div>
                    <div className={styles.insightValue}>{platformStats.totalViews.toLocaleString()}</div>
                  </div>
                  <div className={styles.insightItem}>
                    <div className={styles.insightLabel}>Platform Total Raised</div>
                    <div className={styles.insightValue}>${platformStats.totalFundsRaised.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div 
            className={styles.recommendationsCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className={styles.recommendationsTitle}>
              <FiTrendingUp /> Optimization Recommendations
            </h3>
            <div className={styles.recommendations}>
              {totalViews < 100 && (
                <div className={styles.recommendation}>
                  <div className={styles.recommendationIcon}>
                    <FiActivity />
                  </div>
                  <div className={styles.recommendationContent}>
                    <div className={styles.recommendationTitle}>Increase Visibility</div>
                    <div className={styles.recommendationText}>
                      Share your campaigns on social media to reach more people
                    </div>
                  </div>
                </div>
              )}
              {avgProgress < 50 && campaigns.length > 0 && (
                <div className={styles.recommendation}>
                  <div className={styles.recommendationIcon}>
                    <FiTrendingUp />
                  </div>
                  <div className={styles.recommendationContent}>
                    <div className={styles.recommendationTitle}>Boost Engagement</div>
                    <div className={styles.recommendationText}>
                      Add more images and updates to your campaigns to increase donations
                    </div>
                  </div>
                </div>
              )}
              {campaigns.length === 0 && (
                <div className={styles.recommendation}>
                  <div className={styles.recommendationIcon}>
                    <FiActivity />
                  </div>
                  <div className={styles.recommendationContent}>
                    <div className={styles.recommendationTitle}>Get Started</div>
                    <div className={styles.recommendationText}>
                      Create your first campaign to start making an impact
                    </div>
                  </div>
                </div>
              )}
              {campaigns.length > 0 && avgProgress >= 50 && totalViews >= 100 && (
                <div className={styles.recommendation}>
                  <div className={styles.recommendationIcon}>
                    <FiBarChart2 />
                  </div>
                  <div className={styles.recommendationContent}>
                    <div className={styles.recommendationTitle}>Great Performance!</div>
                    <div className={styles.recommendationText}>
                      Your campaigns are performing well. Keep up the great work!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
