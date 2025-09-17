
import { Link } from 'react-router-dom';
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
      <article className={styles.card}>
        <div className={styles.imageContainer}>
          <img
            src={campaign.mainImage}
            alt={campaign.title}
            className={styles.image}
            loading="lazy"
            onError={handleImageError}
          />
          <div className={`${styles.badge} ${styles[campaign.type]}`}>
            {campaign.type === 'fundraising' ? 'Fundraising' : 'Blood Donation'}
          </div>
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
                <div
                  className={styles.progressFill}
                  style={{ width: `${getProgressPercentage(campaign)}%` }}
                />
              </div>
              <div className={styles.progressText}>
                <span className={styles.raised}>
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
                {campaign.hospitalInfo.name}
              </div>
              <div className={`${styles.urgency} ${styles[campaign.urgencyLevel]}`}>
                {campaign.urgencyLevel.charAt(0).toUpperCase() + campaign.urgencyLevel.slice(1)} Priority
              </div>
            </div>
          )}
          
          <div className={styles.footer}>
            <span className={styles.date}>
              Created {formatDate(campaign.createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}