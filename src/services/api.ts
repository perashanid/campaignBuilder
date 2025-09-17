import { Campaign, CampaignFormData } from '../types/campaign';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:3001/api');

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateCampaignResponse {
  id: string;
  shareUrl: string;
  campaign: Campaign;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    const token = authService.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createCampaign(campaignData: CampaignFormData): Promise<CreateCampaignResponse> {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.request(`/campaigns/${id}`);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return this.request('/campaigns');
  }

  async updateCampaignProgress(id: string, amount: number): Promise<Campaign> {
    return this.request(`/campaigns/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ currentAmount: amount }),
    });
  }

  async incrementCampaignView(id: string): Promise<{ success: boolean; viewCount: number }> {
    return this.request(`/campaigns/${id}/view`, {
      method: 'POST',
    });
  }

  async getMostVisitedCampaigns(): Promise<Campaign[]> {
    return this.request('/campaigns/most-visited');
  }

  async getUserCampaigns(): Promise<Campaign[]> {
    return this.request('/campaigns/user');
  }

  async updateCampaign(id: string, campaignData: Partial<CampaignFormData>): Promise<Campaign> {
    return this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCampaignVisibility(id: string, isHidden: boolean): Promise<Campaign> {
    return this.request(`/campaigns/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isHidden }),
    });
  }

  async getCampaignUpdates(campaignId: string): Promise<import('../types/campaign').CampaignUpdate[]> {
    return this.request(`/campaigns/${campaignId}/updates`);
  }

  async createCampaignUpdate(campaignId: string, updateData: import('../types/campaign').CampaignUpdateFormData): Promise<import('../types/campaign').CampaignUpdate> {
    return this.request(`/campaigns/${campaignId}/updates`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }
}

export const apiService = new ApiService();