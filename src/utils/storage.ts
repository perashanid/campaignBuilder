/**
 * localStorage utilities for campaign persistence
 */

import { Campaign, CampaignFormData } from '../types/campaign';
import { generateUniqueSlug } from './uuid';
import { authService } from '../services/authService';

const CAMPAIGNS_KEY = 'campaigns';
const CAMPAIGN_VIEWS_KEY = 'campaign_views';
const USER_CAMPAIGNS_KEY = 'user_campaigns';
const CAMPAIGN_UPDATES_KEY = 'campaign_updates';

/**
 * Get all campaigns from localStorage
 */
export function getAllCampaigns(): Campaign[] {
  try {
    const stored = localStorage.getItem(CAMPAIGNS_KEY);
    if (!stored) return [];
    
    const campaigns = JSON.parse(stored);
    return campaigns.map((campaign: any) => ({
      ...campaign,
      createdAt: new Date(campaign.createdAt),
      updatedAt: new Date(campaign.updatedAt),
    }));
  } catch (error) {
    console.error('Error loading campaigns from localStorage:', error);
    return [];
  }
}

/**
 * Get a single campaign by ID
 */
export function getCampaignById(id: string): Campaign | null {
  const campaigns = getAllCampaigns();
  return campaigns.find(campaign => campaign.id === id) || null;
}

/**
 * Save a campaign to localStorage
 */
export async function saveCampaign(campaignData: CampaignFormData): Promise<Campaign> {
  const campaigns = getAllCampaigns();
  
  // Generate unique slug based on title
  const existingSlugs = campaigns.map(c => c.id);
  const campaignId = generateUniqueSlug(campaignData.title, existingSlugs);
  
  const campaign: Campaign = {
    id: campaignId,
    ...campaignData,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentAmount: campaignData.type === 'fundraising' ? 0 : undefined,
    isHidden: false,
  } as Campaign & { isHidden: boolean };

  campaigns.push(campaign);
  
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
    
    // Also save to user-specific campaigns
    const user = await authService.getCurrentUser();
    if (user) {
      saveUserCampaign(user.id, campaignId);
    }
    
    return campaign;
  } catch (error) {
    console.error('Error saving campaign to localStorage:', error);
    throw new Error('Failed to save campaign');
  }
}

/**
 * Update an existing campaign
 */
export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
  const campaigns = getAllCampaigns();
  const index = campaigns.findIndex(campaign => campaign.id === id);
  
  if (index === -1) return null;
  
  const updatedCampaign: Campaign = {
    ...campaigns[index],
    ...updates,
    updatedAt: new Date(),
  } as Campaign;
  
  campaigns[index] = updatedCampaign;
  
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
    return updatedCampaign;
  } catch (error) {
    console.error('Error updating campaign in localStorage:', error);
    throw new Error('Failed to update campaign');
  }
}

/**
 * Delete a campaign
 */
export function deleteCampaign(id: string): boolean {
  const campaigns = getAllCampaigns();
  const filteredCampaigns = campaigns.filter(campaign => campaign.id !== id);
  
  if (filteredCampaigns.length === campaigns.length) {
    return false; // Campaign not found
  }
  
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(filteredCampaigns));
    return true;
  } catch (error) {
    console.error('Error deleting campaign from localStorage:', error);
    throw new Error('Failed to delete campaign');
  }
}

/**
 * Update campaign progress (for fundraising campaigns)
 */
export function updateCampaignProgress(id: string, newAmount: number): Campaign | null {
  return updateCampaign(id, { currentAmount: newAmount });
}

/**
 * Get campaign view counts
 */
export function getCampaignViews(): Record<string, number> {
  try {
    const stored = localStorage.getItem(CAMPAIGN_VIEWS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading campaign views:', error);
    return {};
  }
}

/**
 * Increment campaign view count
 */
export function incrementCampaignViews(campaignId: string): number {
  const views = getCampaignViews();
  views[campaignId] = (views[campaignId] || 0) + 1;
  
  try {
    localStorage.setItem(CAMPAIGN_VIEWS_KEY, JSON.stringify(views));
    return views[campaignId];
  } catch (error) {
    console.error('Error updating campaign views:', error);
    return views[campaignId] || 1;
  }
}

/**
 * Get most viewed campaigns
 */
export function getMostViewedCampaigns(limit: number = 6): Campaign[] {
  const campaigns = getAllCampaigns();
  const views = getCampaignViews();
  
  return campaigns
    .map(campaign => ({
      ...campaign,
      viewCount: views[campaign.id] || 0,
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

/**
 * Get user-campaign mapping
 */
function getUserCampaignMapping(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(USER_CAMPAIGNS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading user campaigns mapping:', error);
    return {};
  }
}

/**
 * Save user-campaign mapping
 */
function saveUserCampaign(userId: string, campaignId: string): void {
  const mapping = getUserCampaignMapping();
  if (!mapping[userId]) {
    mapping[userId] = [];
  }
  if (!mapping[userId].includes(campaignId)) {
    mapping[userId].push(campaignId);
  }
  
  try {
    localStorage.setItem(USER_CAMPAIGNS_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.error('Error saving user campaign mapping:', error);
  }
}

/**
 * Get campaigns for current user
 */
export async function getUserCampaigns(): Promise<Campaign[]> {
  const user = await authService.getCurrentUser();
  if (!user) return [];
  
  const mapping = getUserCampaignMapping();
  const userCampaignIds = mapping[user.id] || [];
  const allCampaigns = getAllCampaigns();
  
  return allCampaigns.filter(campaign => userCampaignIds.includes(campaign.id));
}

/**
 * Update campaign visibility
 */
export function updateCampaignVisibility(id: string, isHidden: boolean): Campaign | null {
  return updateCampaign(id, { isHidden } as any);
}

/**
 * Clear all campaign data (for development/testing)
 */
export function clearAllCampaigns(): void {
  try {
    localStorage.removeItem(CAMPAIGNS_KEY);
    localStorage.removeItem(CAMPAIGN_VIEWS_KEY);
    localStorage.removeItem(USER_CAMPAIGNS_KEY);
    localStorage.removeItem(CAMPAIGN_UPDATES_KEY);
  } catch (error) {
    console.error('Error clearing campaign data:', error);
  }
}

/**
 * Get campaign updates from localStorage
 */
export function getCampaignUpdates(campaignId: string): import('../types/campaign').CampaignUpdate[] {
  try {
    const stored = localStorage.getItem(CAMPAIGN_UPDATES_KEY);
    if (!stored) return [];
    
    const allUpdates = JSON.parse(stored);
    const campaignUpdates = allUpdates[campaignId] || [];
    
    return campaignUpdates
      .map((update: any) => ({
        ...update,
        createdAt: new Date(update.createdAt),
        updatedAt: new Date(update.updatedAt),
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error loading campaign updates:', error);
    return [];
  }
}

/**
 * Create a new campaign update
 */
export function createCampaignUpdate(campaignId: string, updateData: import('../types/campaign').CampaignUpdateFormData): import('../types/campaign').CampaignUpdate {
  try {
    const stored = localStorage.getItem(CAMPAIGN_UPDATES_KEY);
    const allUpdates = stored ? JSON.parse(stored) : {};
    
    if (!allUpdates[campaignId]) {
      allUpdates[campaignId] = [];
    }
    
    const newUpdate: import('../types/campaign').CampaignUpdate = {
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId,
      ...updateData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    allUpdates[campaignId].unshift(newUpdate);
    localStorage.setItem(CAMPAIGN_UPDATES_KEY, JSON.stringify(allUpdates));
    
    return newUpdate;
  } catch (error) {
    console.error('Error creating campaign update:', error);
    throw new Error('Failed to create campaign update');
  }
}