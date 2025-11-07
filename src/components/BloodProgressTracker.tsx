import { FaTint, FaCheckCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BloodDonationCampaign } from '../types/campaign';
import styles from './BloodProgressTracker.module.css';

interface BloodProgressTrackerProps {
  campaign: BloodDonationCampaign;
}

export function BloodProgressTracker({ campaign }: BloodProgressTrackerProps) {
  const targetUnits = campaign.targetBloodUnits || 0;
  const currentUnits = campaign.currentBloodUnits || 0;

  if (targetUnits === 0) {
    return null;
  }

  const getProgressPercentage = () => {
    return Math.min((currentUnits / targetUnits) * 100, 100);
  };

  const getRemainingUnits = () => {
    return Math.max(targetUnits - currentUnits, 0);
  };

  const isCompleted = currentUnits >= targetUnits;

  return (
    <div className={styles.progressTracker}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FaTint /> Blood Collection Progress
        </h3>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isCompleted ? styles.completed : ''}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className={styles.progressLabels}>
          <span className={styles.percentage}>
            {Math.round(getProgressPercentage())}%
          </span>
          {isCompleted && (
            <span className={styles.completedBadge}>
              <FaCheckCircle /> Goal Reached!
            </span>
          )}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {currentUnits}
          </span>
          <span className={styles.statLabel}>Units Collected</span>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {targetUnits}
          </span>
          <span className={styles.statLabel}>Target</span>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {getRemainingUnits()}
          </span>
          <span className={styles.statLabel}>
            {isCompleted ? 'Exceeded by' : 'Remaining'}
          </span>
        </div>
      </div>

      {isCompleted && (
        <div className={styles.completionMessage}>
          <HiSparkles /> This campaign has reached its blood collection goal! Thank you to all donors who made this possible.
        </div>
      )}
    </div>
  );
}
