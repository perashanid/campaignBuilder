import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiDollarSign, FiDroplet } from 'react-icons/fi';
import { apiService } from '../services/api';
import { Campaign } from '../types/campaign';
import { CampaignGrid } from '../components/CampaignGrid';
import { FilterButton } from '../components/FilterButton';
import { useCampaignFilter } from '../hooks/useCampaignFilter';
import { AnimatedSection } from '../components/AnimatedSection';
import { TypewriterText } from '../components/TypewriterText';
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
      <AnimatedSection className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          All Campaigns
        </motion.h1>
        <TypewriterText 
          text="Browse and support campaigns in your community"
          className={styles.description}
          delay={0.3}
        />
      </AnimatedSection>

      <motion.div 
        className={styles.filters}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <FilterButton
            isActive={filter === 'all'}
            onClick={() => setFilter('all')}
            className={styles.filterButton}
          >
            <FiGrid className={styles.filterIcon} />
            All Campaigns ({getCampaignCount('all')})
          </FilterButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <FilterButton
            isActive={filter === 'fundraising'}
            onClick={() => setFilter('fundraising')}
            className={styles.filterButton}
          >
            <FiDollarSign className={styles.filterIcon} />
            Fundraising ({getCampaignCount('fundraising')})
          </FilterButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <FilterButton
            isActive={filter === 'blood-donation'}
            onClick={() => setFilter('blood-donation')}
            className={styles.filterButton}
          >
            <FiDroplet className={styles.filterIcon} />
            Blood Donation ({getCampaignCount('blood-donation')})
          </FilterButton>
        </motion.div>
      </motion.div>

      <AnimatedSection className={styles.content} delay={0.2}>
        <CampaignGrid campaigns={filteredCampaigns} loading={loading} />
      </AnimatedSection>
    </div>
  );
}