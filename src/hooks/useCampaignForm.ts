import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignFormData, Campaign } from '../types/campaign';
import { validateForm, campaignValidationRules } from '../utils/validation';
import { apiService } from '../services/api';

interface UseCampaignFormOptions {
  initialData: CampaignFormData;
  campaignType: 'fundraising' | 'blood-donation';
  onSuccess?: (campaign: Campaign, campaignUrl: string) => void;
  onSubmit?: (formData: CampaignFormData) => Promise<void>;
}

export function useCampaignForm({ initialData, campaignType, onSuccess, onSubmit }: UseCampaignFormOptions) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CampaignFormData>(initialData);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const updateNestedField = useCallback((parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof CampaignFormData] as any,
        [field]: value
      }
    }));
  }, []);

  const validateFormData = useCallback(() => {
    // Base validation for all campaigns
    let validationData: Record<string, any> = {
      title: formData.title,
      description: formData.description,
      mainImage: formData.mainImage,
    };

    // Create campaign-specific validation rules
    let validationRules = { ...campaignValidationRules };

    if (campaignType === 'fundraising') {
      // Add fundraising-specific fields
      validationData = {
        ...validationData,
        targetAmount: formData.targetAmount,
        mobileBanking: formData.paymentDetails?.mobileBanking,
        bankAccountNumber: formData.paymentDetails?.bankAccount?.accountNumber,
        bankName: formData.paymentDetails?.bankAccount?.bankName,
        accountHolder: formData.paymentDetails?.bankAccount?.accountHolder,
      };
      
      // Remove blood donation rules for fundraising
      delete validationRules.hospitalName;
      delete validationRules.hospitalAddress;
      delete validationRules.hospitalContact;
      delete validationRules.hospitalEmail;
    } else {
      // Add blood donation-specific fields
      validationData = {
        ...validationData,
        hospitalName: formData.hospitalInfo?.name,
        hospitalAddress: formData.hospitalInfo?.address,
        hospitalContact: formData.hospitalInfo?.contactNumber,
        hospitalEmail: formData.hospitalInfo?.email,
      };
      
      // Remove fundraising rules for blood donation
      delete validationRules.targetAmount;
      delete validationRules.mobileBanking;
      delete validationRules.bankAccountNumber;
      delete validationRules.bankName;
      delete validationRules.accountHolder;
    }

    console.log('🔍 Validation data:', validationData);
    console.log('📋 Validation rules:', Object.keys(validationRules));

    return validateForm(validationData, validationRules);
  }, [formData, campaignType]);

  const prepareCampaignData = useCallback(() => {
    const baseData = {
      title: formData.title,
      description: formData.description,
      type: campaignType,
      mainImage: formData.mainImage,
      additionalImages: formData.additionalImages,
    };

    if (campaignType === 'fundraising') {
      return {
        ...baseData,
        targetAmount: formData.targetAmount!,
        paymentDetails: formData.paymentDetails!,
      };
    } else {
      return {
        ...baseData,
        hospitalInfo: formData.hospitalInfo!,
        bloodType: formData.bloodType,
        urgencyLevel: formData.urgencyLevel as 'low' | 'medium' | 'high',
      };
    }
  }, [formData, campaignType]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted!');
    setIsSubmitting(true);

    try {
      console.log('📝 Form data:', formData);
      
      // Validate form data
      const validationErrors = validateFormData();
      console.log('✅ Validation errors:', validationErrors);
      
      if (validationErrors.length > 0) {
        const errorMap = validationErrors.reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {} as Record<string, string>);
        console.log('❌ Setting errors:', errorMap);
        setErrors(errorMap);
        return;
      }

      // If custom onSubmit is provided (for editing), use it
      if (onSubmit) {
        const campaignData = prepareCampaignData();
        await onSubmit(campaignData);
        return;
      }

      // Create campaign using the API service
      const campaignData = prepareCampaignData();
      console.log('📤 Sending campaign data:', campaignData);
      
      const result = await apiService.createCampaign(campaignData);
      console.log('✅ Campaign created:', result);
      
      // Handle success
      if (onSuccess) {
        console.log('🎉 Calling onSuccess callback');
        onSuccess(result.campaign, result.shareUrl);
      }
      
      console.log('🔄 Navigating to campaign page');
      navigate(`/campaign/${result.campaign.id}`);
      
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create campaign. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
      console.log('✅ Form submission complete');
    }
  }, [validateFormData, prepareCampaignData, navigate, onSuccess]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateNestedField,
    handleSubmit,
  };
}