export interface BaseCampaign {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  additionalImages: string[];
  createdAt: Date;
  updatedAt: Date;
  type: 'fundraising' | 'blood-donation';
  userId?: string;
  isHidden?: boolean;
}

export interface PaymentDetails {
  mobileBanking?: string;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
}

export interface HospitalInfo {
  name: string;
  address: string;
  contactNumber?: string;
  email?: string;
}

export interface FundraisingCampaign extends BaseCampaign {
  type: 'fundraising';
  targetAmount: number;
  currentAmount: number;
  paymentDetails: PaymentDetails;
}

export interface BloodDonationCampaign extends BaseCampaign {
  type: 'blood-donation';
  hospitalInfo: HospitalInfo;
  bloodType?: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  targetBloodUnits?: number;
  currentBloodUnits?: number;
}

export type Campaign = FundraisingCampaign | BloodDonationCampaign;

export type CampaignType = 'fundraising' | 'blood-donation';

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  type: 'progress' | 'milestone' | 'general';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignUpdateFormData {
  title: string;
  description: string;
  type: 'progress' | 'milestone' | 'general';
  imageUrl?: string;
}

export interface CampaignFormData {
  title: string;
  description: string;
  mainImage: string;
  additionalImages: string[];
  type: CampaignType;
  
  // Fundraising specific
  targetAmount?: number;
  paymentDetails?: PaymentDetails;
  
  // Blood donation specific
  hospitalInfo?: HospitalInfo;
  bloodType?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
  targetBloodUnits?: number;
}