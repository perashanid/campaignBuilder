import { Link } from 'react-router-dom';
import { FaDollarSign, FaTint } from 'react-icons/fa';
import styles from './CampaignCreation.module.css';

export function CampaignCreation() {
  return (
    <div className={styles.campaignCreation}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create a Campaign</h1>
        <p className={styles.subtitle}>
          Choose the type of campaign you want to create
        </p>
      </div>
      
      <div className={styles.options}>
        <Link to="/create/fundraising" className={styles.option}>
          <div className={styles.optionIcon}>
            <FaDollarSign />
          </div>
          <h2 className={styles.optionTitle}>Fundraising Campaign</h2>
          <p className={styles.optionDescription}>
            Raise money for medical expenses, emergencies, or charitable causes
          </p>
        </Link>
        
        <Link to="/create/blood-donation" className={styles.option}>
          <div className={styles.optionIcon}>
            <FaTint />
          </div>
          <h2 className={styles.optionTitle}>Blood Donation Campaign</h2>
          <p className={styles.optionDescription}>
            Connect with donors to help save lives through blood donation
          </p>
        </Link>
      </div>
    </div>
  );
}