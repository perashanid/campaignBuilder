import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { Campaign, CampaignFormData } from '../types/campaign';
import { apiService } from '../services/api';
import { FundraisingForm } from './FundraisingForm';
import { BloodDonationForm } from './BloodDonationForm';
import styles from './EditCampaign.module.css';

export function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id) {
      navigate('/dashboard');
      return;
    }

    loadCampaign();
  }, [id, isAuthenticated]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      const campaignData = await apiService.getCampaign(id!);
      setCampaign(campaignData);
    } catch (error) {
      showNotification({ message: 'Campaign not found or access denied', type: 'error' });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: CampaignFormData) => {
    if (!campaign) return;

    setIsSubmitting(true);
    try {
      await apiService.updateCampaign(campaign.id, formData);
      showNotification({ message: 'Campaign updated successfully!', type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Failed to update campaign',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Campaign not found</div>
      </div>
    );
  }

  // Convert campaign to form data
  const initialFormData: CampaignFormData = {
    title: campaign.title,
    description: campaign.description,
    mainImage: campaign.mainImage,
    additionalImages: campaign.additionalImages,
    type: campaign.type,
    ...(campaign.type === 'fundraising' && {
      targetAmount: (campaign as any).targetAmount,
      paymentDetails: (campaign as any).paymentDetails,
    }),
    ...(campaign.type === 'blood-donation' && {
      hospitalInfo: (campaign as any).hospitalInfo,
      bloodType: (campaign as any).bloodType,
      urgencyLevel: (campaign as any).urgencyLevel,
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Campaign</h1>
        <p>Update your campaign details</p>
      </div>

      {campaign.type === 'fundraising' ? (
        <FundraisingForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      ) : (
        <BloodDonationForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      )}
    </div>
  );
}