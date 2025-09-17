import { useState, useMemo } from 'react';
import { Campaign, CampaignType } from '../types/campaign';

type FilterType = 'all' | CampaignType;

export function useCampaignFilter(campaigns: Campaign[]) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredCampaigns = useMemo(() => {
    if (filter === 'all') {
      return campaigns;
    }
    return campaigns.filter(campaign => campaign.type === filter);
  }, [campaigns, filter]);

  const getCampaignCount = (filterType: FilterType): number => {
    if (filterType === 'all') {
      return campaigns.length;
    }
    return campaigns.filter(campaign => campaign.type === filterType).length;
  };

  return {
    filter,
    setFilter,
    filteredCampaigns,
    getCampaignCount,
  };
}