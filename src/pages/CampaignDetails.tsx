import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaClipboard, FaEdit, FaTrash, FaEye, FaEyeSlash, FaChartLine } from 'react-icons/fa';
import { apiService } from '../services/api';
import { FundraisingCampaign, BloodDonationCampaign } from '../types/campaign';
import { ProgressTracker } from '../components/ProgressTracker';
import { BloodProgressTracker } from '../components/BloodProgressTracker';
import { ImageGallery } from '../components/ImageGallery';
import { ShareSection } from '../components/ShareSection';
import { CampaignUpdates } from '../components/CampaignUpdates';
import { UpdateProgressModal } from '../components/UpdateProgressModal';
import { CampaignEditHistory } from '../components/CampaignEditHistory';
import { useAuth } from '../contexts/AuthContext';
import { useViewTracking } from '../hooks/useViewTracking';
import { copyToClipboard } from '../utils/clipboard';
import { useNotification } from '../hooks/useNotification';
import styles from './CampaignDetails.module.css';

export function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [campaign, setCampaign] = useState<FundraisingCampaign | BloodDonationCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditHistory, setShowEditHistory] = useState(false);
  
  // Track campaign view
  useViewTracking(id);
  
  useEffect(() => {
    if (!id) return;
    
    const loadCampaign = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCampaign(id);
        setCampaign(data);
      } catch (err) {
        console.error('❌ Failed to load campaign:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    
    loadCampaign();
  }, [id]);
  
  if (!id) {
    return <Navigate to="/404" replace />;
  }
  
  if (loading) {
    return <div className={styles.loading}>Loading campaign...</div>;
  }
  
  if (error || !campaign) {
    return (
      <div className={styles.notFound}>
        <div className={styles.content}>
          <h1>Campaign Not Found</h1>
          <p>The campaign you're looking for doesn't exist or has been removed.</p>
          <Link to="/campaigns" className={styles.homeLink}>
            Browse Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const getCampaignTypeLabel = (type: string) => {
    return type === 'fundraising' ? 'Fundraising Campaign' : 'Blood Donation Campaign';
  };

  const isOwner = user && (campaign as any).userId === user.id;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteCampaign(campaign!.id);
      showNotification({ message: 'Campaign deleted successfully', type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      showNotification({ message: 'Failed to delete campaign', type: 'error' });
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const isHidden = (campaign as any).isHidden || false;
      await apiService.updateCampaignVisibility(campaign!.id, !isHidden);
      setCampaign(prev => prev ? { ...prev, isHidden: !isHidden } as any : null);
      showNotification({
        message: `Campaign ${!isHidden ? 'hidden' : 'made visible'} successfully`,
        type: 'success'
      });
    } catch (error) {
      showNotification({ message: 'Failed to update campaign visibility', type: 'error' });
    }
  };
  
  return (
    <div className={styles.campaignDetails}>
      {campaign.mainImage && (
        <div className={styles.imageContainer}>
          <img 
            src={campaign.mainImage} 
            alt={campaign.title}
            className={styles.mainImage}
          />
        </div>
      )}
      
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>{campaign.title}</h1>
            <p className={styles.type}>
              {getCampaignTypeLabel(campaign.type)}
            </p>
          </div>
          
          {isOwner && (
            <div className={styles.ownerActions}>
              <button
                onClick={() => setShowUpdateModal(true)}
                className={styles.updateButton}
                title="Update progress"
              >
                <FaChartLine /> Update Progress
              </button>
              <Link 
                to={`/campaign/${campaign.id}/edit`}
                className={styles.editButton}
                title="Edit campaign"
              >
                <FaEdit /> Edit
              </Link>
              <button
                onClick={handleToggleVisibility}
                className={styles.visibilityButton}
                title={(campaign as any).isHidden ? 'Make visible' : 'Hide campaign'}
              >
                {(campaign as any).isHidden ? <><FaEye /> Show</> : <><FaEyeSlash /> Hide</>}
              </button>
              <button
                onClick={handleDelete}
                className={styles.deleteButton}
                title="Delete campaign"
              >
                <FaTrash /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.description}>
          <h2>About this campaign</h2>
          <p>{campaign.description}</p>
        </div>
        
        {campaign.additionalImages && campaign.additionalImages.length > 0 && (
          <ImageGallery 
            mainImage={campaign.mainImage} 
            additionalImages={campaign.additionalImages}
            title={campaign.title}
          />
        )}
        
        {campaign.type === 'fundraising' && (
          <>
            <FundraisingInfo campaign={campaign} />
            <ProgressTracker campaign={campaign} />
          </>
        )}
        
        {campaign.type === 'blood-donation' && (
          <>
            <BloodDonationInfo campaign={campaign} />
            <BloodProgressTracker campaign={campaign} />
          </>
        )}
        
        <ShareSection campaign={campaign} />
        
        <CampaignUpdates 
          campaignId={campaign.id} 
          isOwner={user?.id === (campaign as any).userId}
        />

        <div className={styles.editHistorySection}>
          <button
            onClick={() => setShowEditHistory(!showEditHistory)}
            className={styles.historyToggleButton}
          >
            {showEditHistory ? 'Hide Edit History' : 'View Edit History'}
          </button>
          {showEditHistory && <CampaignEditHistory campaignId={campaign.id} />}
        </div>
      </div>

      {showUpdateModal && (
        <UpdateProgressModal
          campaign={campaign}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={(updated) => setCampaign(updated as any)}
        />
      )}
    </div>
  );
}

// Helper components for better separation of concerns
function FundraisingInfo({ campaign }: { campaign: FundraisingCampaign }) {
  const { showNotification } = useNotification();

  const handleCopyPaymentInfo = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      showNotification({ message: `${label} copied to clipboard!`, type: 'success' });
    } else {
      showNotification({ message: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  return (
    <div className={styles.fundraisingInfo}>
      <h3>Fundraising Goal</h3>
      <p>Target: ${campaign.targetAmount.toLocaleString()}</p>
      <p>Raised: ${campaign.currentAmount.toLocaleString()}</p>
      
      <div className={styles.paymentSection}>
        <h3>How to Contribute</h3>
        {campaign.paymentDetails?.mobileBanking && (
          <div className={styles.paymentMethod}>
            <h4>Mobile Banking</h4>
            <div className={styles.paymentDetail}>
              <strong>Number:</strong> {campaign.paymentDetails.mobileBanking}
              <button 
                className={styles.copyButton}
                onClick={() => handleCopyPaymentInfo(campaign.paymentDetails.mobileBanking!, 'Mobile banking number')}
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
            </div>
          </div>
        )}
        
        {campaign.paymentDetails?.bankAccount && (
          <div className={styles.paymentMethod}>
            <h4>Bank Transfer</h4>
            <div className={styles.paymentDetail}>
              <strong>Account Number:</strong> {campaign.paymentDetails.bankAccount.accountNumber}
              <button 
                className={styles.copyButton}
                onClick={() => handleCopyPaymentInfo(campaign.paymentDetails.bankAccount!.accountNumber, 'Account number')}
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
            </div>
            <div className={styles.paymentDetail}>
              <strong>Bank Name:</strong> {campaign.paymentDetails.bankAccount.bankName}
              <button 
                className={styles.copyButton}
                onClick={() => handleCopyPaymentInfo(campaign.paymentDetails.bankAccount!.bankName, 'Bank name')}
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
            </div>
            <div className={styles.paymentDetail}>
              <strong>Account Holder:</strong> {campaign.paymentDetails.bankAccount.accountHolder}
              <button 
                className={styles.copyButton}
                onClick={() => handleCopyPaymentInfo(campaign.paymentDetails.bankAccount!.accountHolder, 'Account holder name')}
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
            </div>
          </div>
        )}
        
        {!campaign.paymentDetails?.mobileBanking && !campaign.paymentDetails?.bankAccount && (
          <p className={styles.noPaymentInfo}>
            Payment information not provided by campaign creator.
          </p>
        )}
      </div>
    </div>
  );
}

function BloodDonationInfo({ campaign }: { campaign: BloodDonationCampaign }) {
  return (
    <div className={styles.bloodDonationInfo}>
      <h3>Hospital Information</h3>
      <p><strong>Hospital:</strong> {campaign.hospitalInfo.name}</p>
      <p><strong>Address:</strong> {campaign.hospitalInfo.address}</p>
      {campaign.hospitalInfo.contactNumber && (
        <p><strong>Contact:</strong> {campaign.hospitalInfo.contactNumber}</p>
      )}
      {campaign.bloodType && (
        <p><strong>Blood Type Needed:</strong> {campaign.bloodType}</p>
      )}
      <p><strong>Urgency:</strong> {campaign.urgencyLevel}</p>
    </div>
  );
}