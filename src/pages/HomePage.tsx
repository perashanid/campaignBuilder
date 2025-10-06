import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';
import { apiService } from '../services/api';
import { Campaign } from '../types/campaign';
import { CampaignStats } from '../components/CampaignStats';
import { CampaignGrid } from '../components/CampaignGrid';
import { MostVisited } from '../components/MostVisited';
import { AnimatedSection } from '../components/AnimatedSection';
import { ParallaxSection } from '../components/ParallaxSection';
import { TypewriterText } from '../components/TypewriterText';
import { AnimatedButton } from '../components/AnimatedButton';
import { AnimatedCard } from '../components/AnimatedCard';
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

  const features = [
    {
      icon: <FiHeart />,
      title: 'Blood Donation',
      description: 'Organize and manage blood donation drives to save lives in your community'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Fundraising',
      description: 'Launch fundraising campaigns and reach your financial goals with ease'
    },
    {
      icon: <FiUsers />,
      title: 'Community Impact',
      description: 'Connect with supporters and make a real difference together'
    },
    {
      icon: <FiZap />,
      title: 'Real-time Updates',
      description: 'Track progress and engage with your audience in real-time'
    }
  ];

  return (
    <div className={styles.homePage}>
      <ParallaxSection className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.title}>Campaign Platform</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TypewriterText 
              text="Create and share campaigns for blood donation and fundraising"
              className={styles.subtitle}
              delay={0.3}
            />
          </motion.div>
          
          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/create">
              <AnimatedButton size="large">
                Create Campaign
              </AnimatedButton>
            </Link>
            <Link to="/campaigns">
              <AnimatedButton variant="outline" size="large">
                Browse Campaigns
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
        
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
        </div>
      </ParallaxSection>
      
      <div className={styles.content}>
        <AnimatedSection className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose Us</h2>
            <TypewriterText 
              text="Powerful tools to amplify your impact and reach your goals"
              className={styles.sectionDescription}
            />
          </div>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <AnimatedCard key={index}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.2}>
          <CampaignStats />
        </AnimatedSection>
        
        <AnimatedSection delay={0.3}>
          <MostVisited />
        </AnimatedSection>
        
        <AnimatedSection className={styles.campaignsSection} delay={0.4}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Campaigns</h2>
            <TypewriterText 
              text="Discover and support ongoing campaigns in your community"
              className={styles.sectionDescription}
            />
          </div>
          
          <CampaignGrid campaigns={campaigns} loading={loading} />
          
          {campaigns.length > 0 && (
            <motion.div 
              className={styles.viewAllContainer}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/campaigns">
                <AnimatedButton variant="outline">
                  View All Campaigns
                </AnimatedButton>
              </Link>
            </motion.div>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}