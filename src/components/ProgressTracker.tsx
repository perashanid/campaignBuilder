import { useState, useEffect } from 'react';
import { FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { FundraisingCampaign } from '../types/campaign';
import { simulateProgressUpdate, getRandomUpdateInterval } from '../utils/dummyData';
import { apiService } from '../services/api';
import styles from './ProgressTracker.module.css';

interface ProgressTrackerProps {
  campaign: FundraisingCampaign;
  onUpdate?: (updatedCampaign: FundraisingCampaign) => void;
}

export function ProgressTracker({ campaign, onUpdate }: ProgressTrackerProps) {
  const [currentCampaign, setCurrentCampaign] = useState(campaign);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentCampaign.currentAmount >= currentCampaign.targetAmount) {
      return;
    }

    const interval = setInterval(() => {
      const newAmount = simulateProgressUpdate(currentCampaign);
      
      if (newAmount > currentCampaign.currentAmount) {
        setIsAnimating(true);
        
        const updatedCampaign: FundraisingCampaign = {
          ...currentCampaign,
          currentAmount: newAmount,
          updatedAt: new Date()
        };
        
        // Update campaign progress via API (fire and forget for demo)
        apiService.updateCampaignProgress(currentCampaign.id, newAmount).catch(console.error);
        
        setCurrentCampaign(updatedCampaign);
        onUpdate?.(updatedCampaign);
        
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, getRandomUpdateInterval());

    return () => clearInterval(interval);
  }, [currentCampaign, onUpdate]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = () => {
    return Math.min((currentCampaign.currentAmount / currentCampaign.targetAmount) * 100, 100);
  };

  const getRemainingAmount = () => {
    return Math.max(currentCampaign.targetAmount - currentCampaign.currentAmount, 0);
  };

  const isCompleted = currentCampaign.currentAmount >= currentCampaign.targetAmount;

  return (
    <div className={styles.progressTracker}>
      <div className={styles.header}>
        <h3 className={styles.title}>Fundraising Progress</h3>
        {isAnimating && (
          <span className={styles.updateIndicator}>
            <FaDollarSign /> New donation received!
          </span>
        )}
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isAnimating ? styles.animating : ''} ${isCompleted ? styles.completed : ''}`}
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
            {formatAmount(currentCampaign.currentAmount)}
          </span>
          <span className={styles.statLabel}>Raised</span>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {formatAmount(currentCampaign.targetAmount)}
          </span>
          <span className={styles.statLabel}>Goal</span>
        </div>
        
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {formatAmount(getRemainingAmount())}
          </span>
          <span className={styles.statLabel}>
            {isCompleted ? 'Exceeded by' : 'Remaining'}
          </span>
        </div>
      </div>

      {isCompleted && (
        <div className={styles.completionMessage}>
          <HiSparkles /> This campaign has reached its fundraising goal! Thank you to all donors who made this possible.
        </div>
      )}
    </div>
  );
}