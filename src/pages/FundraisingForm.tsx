import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types/campaign';
import { ImageUpload } from '../components/ImageUpload';
import { MultipleImageUpload } from '../components/MultipleImageUpload';
import { AIWritingAssistant } from '../components/AIWritingAssistant';
import { useCampaignForm } from '../hooks/useCampaignForm';
import { copyCampaignUrl } from '../utils/clipboard';
import styles from './FundraisingForm.module.css';

const defaultFormData = {
  title: '',
  description: '',
  mainImage: '',
  additionalImages: [],
  type: 'fundraising' as const,
  targetAmount: 0,
  paymentDetails: {
    mobileBanking: '',
    bankAccount: {
      accountNumber: '',
      bankName: '',
      accountHolder: ''
    }
  }
};

interface FundraisingFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function FundraisingForm({ 
  initialData, 
  onSubmit, 
  isSubmitting: externalSubmitting, 
  isEditing = false 
}: FundraisingFormProps) {
  const navigate = useNavigate();
  const initialFormData = initialData || defaultFormData;
  
  const handleSuccess = async (campaign: Campaign, campaignUrl: string) => {
    if (isEditing) {
      return; // Don't copy URL when editing
    }
    const clipboardResult = await copyCampaignUrl(campaign.id);
    
    if (clipboardResult.success) {
      // For now, still using alert but with better messaging
      // In a real app, you'd use a toast notification system
      alert(`Campaign created successfully!\n\nThe campaign link has been copied to your clipboard. You can now share it with others to start receiving donations.`);
    } else {
      alert(`Campaign created successfully!\n\nYour campaign link:\n${campaignUrl}\n\nPlease copy this link manually to share with others.`);
    }
  };

  const {
    formData,
    errors,
    isSubmitting: formSubmitting,
    updateField,
    updateNestedField,
    handleSubmit: formHandleSubmit,
  } = useCampaignForm({
    initialData: initialFormData,
    campaignType: 'fundraising',
    onSuccess: isEditing ? undefined : handleSuccess,
    onSubmit: isEditing ? onSubmit : undefined
  });

  const isSubmitting = externalSubmitting || formSubmitting;
  const handleSubmit = isEditing && onSubmit ? 
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    } : 
    formHandleSubmit;

  const handlePaymentDetailsChange = (field: string, value: string) => {
    if (field === 'mobileBanking') {
      updateNestedField('paymentDetails', 'mobileBanking', value);
    } else {
      updateNestedField('paymentDetails', 'bankAccount', {
        ...formData.paymentDetails?.bankAccount,
        [field]: value
      });
    }
  };

  return (
    <div className={styles.fundraisingForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEditing ? 'Edit Fundraising Campaign' : 'Create Fundraising Campaign'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing 
            ? 'Update your campaign details' 
            : 'Fill in the details for your fundraising campaign'
          }
        </p>
      </div>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Campaign Information</h2>
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Campaign Title *
            </label>
            <input
              id="title"
              type="text"
              className={`${styles.input} ${errors.title ? styles.error : ''}`}
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter a compelling campaign title"
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            <AIWritingAssistant
              text={formData.title}
              fieldType="title"
              campaignType="fundraising"
              onApply={(text) => updateField('title', text)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your campaign, why you need funds, and how they will be used"
              rows={6}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            <AIWritingAssistant
              text={formData.description}
              fieldType="description"
              campaignType="fundraising"
              onApply={(text) => updateField('description', text)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="targetAmount">
              Target Amount (USD) *
            </label>
            <input
              id="targetAmount"
              type="number"
              className={`${styles.input} ${errors.targetAmount ? styles.error : ''}`}
              value={formData.targetAmount || ''}
              onChange={(e) => updateField('targetAmount', Number(e.target.value))}
              placeholder="Enter target amount"
              min="100"
              max="1000000"
            />
            {errors.targetAmount && <span className={styles.errorText}>{errors.targetAmount}</span>}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Images</h2>
          
          <div className={styles.field}>
            <ImageUpload
              label="Main Campaign Image"
              value={formData.mainImage}
              onChange={(url) => updateField('mainImage', url)}
              error={errors.mainImage}
              required={true}
            />
          </div>

          <div className={styles.field}>
            <MultipleImageUpload
              label="Additional Images (Optional)"
              values={formData.additionalImages}
              onChange={(urls) => updateField('additionalImages', urls)}
              maxImages={5}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Payment Details</h2>
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="mobileBanking">
              Mobile Banking Number
            </label>
            <input
              id="mobileBanking"
              type="tel"
              className={`${styles.input} ${errors.mobileBanking ? styles.error : ''}`}
              value={formData.paymentDetails?.mobileBanking || ''}
              onChange={(e) => handlePaymentDetailsChange('mobileBanking', e.target.value)}
              placeholder="+1234567890"
            />
            {errors.mobileBanking && <span className={styles.errorText}>{errors.mobileBanking}</span>}
          </div>

          <div className={styles.bankDetails}>
            <h3 className={styles.subSectionTitle}>Bank Account Details</h3>
            
            <div className={styles.field}>
              <label className={styles.label} htmlFor="accountNumber">
                Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                className={`${styles.input} ${errors.bankAccountNumber ? styles.error : ''}`}
                value={formData.paymentDetails?.bankAccount?.accountNumber || ''}
                onChange={(e) => handlePaymentDetailsChange('accountNumber', e.target.value)}
                placeholder="Enter bank account number"
              />
              {errors.bankAccountNumber && <span className={styles.errorText}>{errors.bankAccountNumber}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bankName">
                Bank Name
              </label>
              <input
                id="bankName"
                type="text"
                className={`${styles.input} ${errors.bankName ? styles.error : ''}`}
                value={formData.paymentDetails?.bankAccount?.bankName || ''}
                onChange={(e) => handlePaymentDetailsChange('bankName', e.target.value)}
                placeholder="Enter bank name"
              />
              {errors.bankName && <span className={styles.errorText}>{errors.bankName}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="accountHolder">
                Account Holder Name
              </label>
              <input
                id="accountHolder"
                type="text"
                className={`${styles.input} ${errors.accountHolder ? styles.error : ''}`}
                value={formData.paymentDetails?.bankAccount?.accountHolder || ''}
                onChange={(e) => handlePaymentDetailsChange('accountHolder', e.target.value)}
                placeholder="Enter account holder name"
              />
              {errors.accountHolder && <span className={styles.errorText}>{errors.accountHolder}</span>}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className={styles.submitError}>
            {errors.submit}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(isEditing ? '/dashboard' : '/create')}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating Campaign...' : 'Creating Campaign...') 
              : (isEditing ? 'Update Campaign' : 'Create Campaign')
            }
          </button>
        </div>
      </form>
    </div>
  );
}