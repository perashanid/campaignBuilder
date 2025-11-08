import { motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';
import { Campaign } from '../types/campaign';
import { CampaignCard } from './CampaignCard';
import styles from './CampaignGrid.module.css';

interface CampaignGridProps {
  campaigns: Campaign[];
  loading?: boolean;
}

export function CampaignGrid({ campaigns, loading = false }: CampaignGridProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <motion.div 
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <motion.div 
        className={styles.empty}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.emptyIcon}>
          <FiInbox />
        </div>
        <h3 className={styles.emptyTitle}>No campaigns yet</h3>
        <p className={styles.emptyDescription}>
          Be the first to create a campaign and make a difference!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.grid}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {campaigns.map((campaign) => (
        <motion.div
          key={campaign.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.5 }}
        >
          <CampaignCard campaign={campaign} />
        </motion.div>
      ))}
    </motion.div>
  );
}