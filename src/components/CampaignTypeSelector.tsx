import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignType } from '../types';
import styles from './CampaignTypeSelector.module.css';

interface CampaignTypeOption {
  type: CampaignType;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

export function CampaignTypeSelector() {
  const navigate = useNavigate();

  const campaignTypes: CampaignTypeOption[] = [
    {
      type: 'fundraising',
      title: 'Fundraising Campaign',
      description: 'Raise money for medical expenses, emergencies, or community projects',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      features: [
        'Set fundraising goals',
        'Track progress in real-time',
        'Multiple payment methods',
        'Share with social media'
      ]
    },
    {
      type: 'blood-donation',
      title: 'Blood Donation Campaign',
      description: 'Organize blood drives and connect donors with hospitals in need',
      icon: (
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      features: [
        'Hospital information',
        'Blood type requirements',
        'Urgency levels',
        'Contact details for donors'
      ]
    }
  ];

  const handleTypeSelect = (type: CampaignType) => {
    navigate(`/create/${type}`);
  };

  return (
    <div className={styles.campaignTypeSelector}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Campaign Type</h2>
        <p className={styles.subtitle}>
          Select the type of campaign you want to create
        </p>
      </div>

      <div className={styles.optionsGrid}>
        {campaignTypes.map((option) => (
          <button
            key={option.type}
            className={styles.optionCard}
            onClick={() => handleTypeSelect(option.type)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                {option.icon}
              </div>
              <h3 className={styles.cardTitle}>{option.title}</h3>
            </div>
            
            <p className={styles.cardDescription}>
              {option.description}
            </p>
            
            <ul className={styles.featureList}>
              {option.features.map((feature, index) => (
                <li key={index} className={styles.feature}>
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className={styles.cardFooter}>
              <span className={styles.selectText}>Select this type</span>
              <svg className={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}