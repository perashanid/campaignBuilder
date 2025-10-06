import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { Campaign, FundraisingCampaign } from '../types/campaign';
import styles from './CampaignCard.module.css';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (campaign: FundraisingCampaign) => {
    return Math.min((campaign.currentAmount / campaign.targetAmount) * 100, 100);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown date';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Unknown date';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const getFallbackImage = (type: string) => {
    return type === 'fundraising' 
      ? 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = getFallbackImage(campaign.type);
  };

  return (
    <Link to={`/campaign/${campaign.id}`} className={styles.cardLink}>
      <motion.article 
        className={styles.card}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.imageContainer}>
          <motion.img
            src={campaign.mainImage}
            alt={campaign.title}
            className={styles.image}
            loading="lazy"
            onError={handleImageError}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div 
            className={`${styles.badge} ${styles[campaign.type]}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {campaign.type === 'fundraising' ? 'Fundraising' : 'Blood Donation'}
          </motion.div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{campaign.title}</h3>
          <p className={styles.description}>
            {campaign.description.length > 120
              ? `${campaign.description.substring(0, 120)}...`
              : campaign.description}
          </p>
          
          {campaign.type === 'fundraising' && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${getProgressPercentage(campaign)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className={styles.progressText}>
                <span className={styles.raised}>
                  <FiTrendingUp className={styles.icon} />
                  {formatAmount(campaign.currentAmount)} raised
                </span>
                <span className={styles.target}>
                  of {formatAmount(campaign.targetAmount)}
                </span>
              </div>
            </div>
          )}
          
          {campaign.type === 'blood-donation' && (
            <div className={styles.hospitalInfo}>
              <div className={styles.hospitalName}>
                <FiMapPin className={styles.icon} />
                {campaign.hospitalInfo.name}
              </div>
              <div className={`${styles.urgency} ${styles[campaign.urgencyLevel]}`}>
                {campaign.urgencyLevel.charAt(0).toUpperCase() + campaign.urgencyLevel.slice(1)} Priority
              </div>
            </div>
          )}
          
          <div className={styles.footer}>
            <span className={styles.date}>
              <FiCalendar className={styles.icon} />
              {formatDate(campaign.createdAt)}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}