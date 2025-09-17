export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'fundraising' | 'blood-donation';
  created_at: Date;
  updated_at: Date;
  view_count: number;
  is_hidden: boolean;
  target_amount?: number;
  current_amount?: number;
  hospital_name?: string;
  hospital_address?: string;
  hospital_contact?: string;
  hospital_email?: string;
  blood_type?: string;
  urgency_level?: 'low' | 'medium' | 'high';
  main_image_url?: string;
  additional_images?: string[];
}

export interface PaymentDetails {
  id: string;
  campaign_id: string;
  mobile_banking?: string;
  bank_account_number?: string;
  bank_name?: string;
  account_holder?: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}