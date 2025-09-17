import { FundraisingCampaign } from '../types';

/**
 * Simulate progress updates for fundraising campaigns
 */
export function simulateProgressUpdate(campaign: FundraisingCampaign): number {
  const remainingAmount = campaign.targetAmount - campaign.currentAmount;
  if (remainingAmount <= 0) return campaign.currentAmount;

  // Random donation between $10 and $500
  const donation = Math.floor(Math.random() * 490) + 10;
  const newAmount = Math.min(campaign.currentAmount + donation, campaign.targetAmount);
  
  return newAmount;
}

/**
 * Get random progress update interval (in milliseconds)
 */
export function getRandomUpdateInterval(): number {
  // Random interval between 30 seconds and 2 minutes
  return Math.floor(Math.random() * 90000) + 30000;
}