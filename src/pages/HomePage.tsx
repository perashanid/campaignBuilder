import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiTrendingUp, FiUsers, FiZap, FiShield, FiAward, FiShare2, FiBarChart2 } from 'react-icons/fi';
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
import { TestimonialCarousel } from '../components/TestimonialCarousel';
import { StatsCounter } from '../components/StatsCounter';
import { HowItWorks } from '../components/HowItWorks';
import { FloatingCTA } from '../components/FloatingCTA';
import { BackgroundPattern } from '../components/BackgroundPattern';
import { ScrollProgress } from '../components/ScrollProgress';
import { FeatureShowcase } from '../components/FeatureShowcase';
import { AnalyticsPreview } from '../components/AnalyticsPreview';
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
    },
    {
      icon: <FiShield />,
      title: 'Secure & Trusted',
      description: 'Your data is protected with enterprise-grade security measures'
    },
    {
      icon: <FiAward />,
      title: 'Proven Results',
      description: 'Join thousands of successful campaigns with 98% success rate'
    },
    {
      icon: <FiShare2 />,
      title: 'Easy Sharing',
      description: 'Share your campaigns across social media platforms with one click'
    },
    {
      icon: <FiBarChart2 />,
      title: 'Smart Analytics',
      description: 'Get detailed insights and reports to optimize your campaign performance'
    }
  ];

  return (
    <div className={styles.homePage}>
      <ScrollProgress />
      <BackgroundPattern />
      <FloatingCTA />
      <ParallaxSection className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.title}>
              Empower Change,
              <span className={styles.titleAccent}> One Campaign at a Time</span>
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TypewriterText 
              text="Create impactful campaigns for blood donation and fundraising. Connect with your community and make a real difference."
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
                Start Your Campaign
              </AnimatedButton>
            </Link>
            <Link to="/campaigns">
              <AnimatedButton variant="outline" size="large">
                Explore Campaigns
              </AnimatedButton>
            </Link>
          </motion.div>

          <motion.div
            className={styles.heroTrust}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className={styles.trustBadge}>
              <FiShield />
              <span>Trusted by 5,000+ organizers</span>
            </div>
            <div className={styles.trustBadge}>
              <FiAward />
              <span>98% success rate</span>
            </div>
          </motion.div>
        </div>
        
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>
      </ParallaxSection>
      
      <div className={styles.content}>
        <AnimatedSection delay={0.1}>
          <StatsCounter />
        </AnimatedSection>

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

        <AnimatedSection delay={0.2} className={styles.fullWidth}>
          <HowItWorks />
        </AnimatedSection>

        <AnimatedSection delay={0.25} className={styles.fullWidth}>
          <FeatureShowcase />
        </AnimatedSection>

        <AnimatedSection delay={0.26} className={styles.fullWidth}>
          <AnalyticsPreview />
        </AnimatedSection>

        <AnimatedSection delay={0.27} className={styles.imageShowcase}>
          <div className={styles.imageShowcaseContent}>
            <motion.div 
              className={styles.imageShowcaseText}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={styles.imageShowcaseTitle}>Making a Difference Together</h2>
              <p className={styles.imageShowcaseDescription}>
                Join thousands of organizers and volunteers who are creating positive change in their communities. 
                Every campaign tells a story of hope, compassion, and collective action.
              </p>
              <div className={styles.imageShowcaseStats}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>10K+</div>
                  <div className={styles.statLabel}>Lives Impacted</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>500+</div>
                  <div className={styles.statLabel}>Active Campaigns</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>$2M+</div>
                  <div className={styles.statLabel}>Funds Raised</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className={styles.imageShowcaseImage}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop" 
                alt="Community volunteers working together"
              />
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.28} className={styles.bloodDonationSection}>
          <div className={styles.bloodDonationContent}>
            <motion.div 
              className={styles.bloodDonationImage}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=2016&auto=format&fit=crop" 
                alt="Blood donation drive"
              />
            </motion.div>
            <motion.div 
              className={styles.bloodDonationText}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={styles.bloodDonationTitle}>Save Lives Through Blood Donation</h2>
              <p className={styles.bloodDonationDescription}>
                Every donation can save up to three lives. Our platform makes it easy to organize blood donation drives, 
                connect with donors, and track your impact in real-time.
              </p>
              <Link to="/create">
                <AnimatedButton size="large">
                  Start a Blood Drive
                </AnimatedButton>
              </Link>
            </motion.div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection delay={0.3}>
          <CampaignStats />
        </AnimatedSection>
        
        <AnimatedSection delay={0.4}>
          <MostVisited />
        </AnimatedSection>
        
        <AnimatedSection className={styles.campaignsSection} delay={0.5}>
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

        <AnimatedSection delay={0.58} className={styles.imageGallery}>
          <div className={styles.galleryHeader}>
            <h2 className={styles.galleryTitle}>Our Community in Action</h2>
            <p className={styles.galleryDescription}>
              See the real impact of campaigns across communities
            </p>
          </div>
          <div className={styles.galleryGrid}>
            <motion.div 
              className={styles.galleryItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" alt="Volunteers helping" />
              <div className={styles.galleryOverlay}>
                <h3>Community Outreach</h3>
              </div>
            </motion.div>
            <motion.div 
              className={styles.galleryItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" alt="Fundraising event" />
              <div className={styles.galleryOverlay}>
                <h3>Fundraising Events</h3>
              </div>
            </motion.div>
            <motion.div 
              className={styles.galleryItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop" alt="Medical support" />
              <div className={styles.galleryOverlay}>
                <h3>Medical Support</h3>
              </div>
            </motion.div>
            <motion.div 
              className={styles.galleryItem}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop" alt="Team collaboration" />
              <div className={styles.galleryOverlay}>
                <h3>Team Collaboration</h3>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className={styles.testimonialsSection} delay={0.6}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Users Say</h2>
            <TypewriterText 
              text="Real stories from real people making a difference"
              className={styles.sectionDescription}
            />
          </div>
          
          <TestimonialCarousel />
        </AnimatedSection>

        <AnimatedSection className={styles.ctaSection} delay={0.7}>
          <motion.div 
            className={styles.ctaCard}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.ctaTitle}>Ready to Make an Impact?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of organizers who are changing lives through our platform
            </p>
            <div className={styles.ctaActions}>
              <Link to="/create">
                <AnimatedButton size="large">
                  Create Your Campaign
                </AnimatedButton>
              </Link>
              <Link to="/register">
                <AnimatedButton variant="outline" size="large">
                  Sign Up Free
                </AnimatedButton>
              </Link>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}