import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types/campaign';
import { ImageUpload } from '../components/ImageUpload';
import { MultipleImageUpload } from '../components/MultipleImageUpload';
import { AIWritingAssistant } from '../components/AIWritingAssistant';
import { useCampaignForm } from '../hooks/useCampaignForm';
import { copyCampaignUrl } from '../utils/clipboard';
import styles from './BloodDonationForm.module.css';

const defaultFormData = {
  title: '',
  description: '',
  mainImage: '',
  additionalImages: [],
  type: 'blood-donation' as const,
  hospitalInfo: {
    name: '',
    address: '',
    contactNumber: '',
    email: ''
  },
  bloodType: '',
  urgencyLevel: 'medium' as const
};

interface BloodDonationFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function BloodDonationForm({ 
  initialData, 
  onSubmit, 
  isSubmitting: externalSubmitting, 
  isEditing = false 
}: BloodDonationFormProps) {
  const navigate = useNavigate();
  const initialFormData = initialData || defaultFormData;
  
  const handleSuccess = async (campaign: Campaign, campaignUrl: string) => {
    if (isEditing) {
      return; // Don't copy URL when editing
    }
    const clipboardResult = await copyCampaignUrl(campaign.id);
    
    if (clipboardResult.success) {
      alert(`Blood donation campaign created successfully!\n\nThe campaign link has been copied to your clipboard. Share it with potential donors to help save lives.`);
    } else {
      alert(`Blood donation campaign created successfully!\n\nYour campaign link:\n${campaignUrl}\n\nPlease copy this link manually to share with potential donors.`);
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
    campaignType: 'blood-donation',
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

  const handleHospitalInfoChange = (field: string, value: string) => {
    updateNestedField('hospitalInfo', field, value);
  };

  return (
    <div className={styles.bloodDonationForm}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEditing ? 'Edit Blood Donation Campaign' : 'Create Blood Donation Campaign'}
        </h1>
        <p className={styles.subtitle}>
          {isEditing 
            ? 'Update your campaign details' 
            : 'Fill in the details for your blood donation campaign'
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
              campaignType="blood-donation"
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
              placeholder="Describe the blood donation need, urgency, and how donors can help"
              rows={6}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            <AIWritingAssistant
              text={formData.description}
              fieldType="description"
              campaignType="blood-donation"
              onApply={(text) => updateField('description', text)}
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="bloodType">
                Blood Type Needed
              </label>
              <select
                id="bloodType"
                className={styles.select}
                value={formData.bloodType || ''}
                onChange={(e) => updateField('bloodType', e.target.value)}
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="All Types">All Types</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="urgencyLevel">
                Urgency Level *
              </label>
              <select
                id="urgencyLevel"
                className={styles.select}
                value={formData.urgencyLevel || 'medium'}
                onChange={(e) => updateField('urgencyLevel', e.target.value)}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
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
          <h2 className={styles.sectionTitle}>Hospital Information</h2>
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="hospitalName">
              Hospital Name *
            </label>
            <input
              id="hospitalName"
              type="text"
              className={`${styles.input} ${errors.hospitalName ? styles.error : ''}`}
              value={formData.hospitalInfo?.name || ''}
              onChange={(e) => handleHospitalInfoChange('name', e.target.value)}
              placeholder="Enter hospital name"
            />
            {errors.hospitalName && <span className={styles.errorText}>{errors.hospitalName}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="hospitalAddress">
              Hospital Address *
            </label>
            <textarea
              id="hospitalAddress"
              className={`${styles.textarea} ${errors.hospitalAddress ? styles.error : ''}`}
              value={formData.hospitalInfo?.address || ''}
              onChange={(e) => handleHospitalInfoChange('address', e.target.value)}
              placeholder="Enter complete hospital address"
              rows={3}
            />
            {errors.hospitalAddress && <span className={styles.errorText}>{errors.hospitalAddress}</span>}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="hospitalContact">
                Contact Number
              </label>
              <input
                id="hospitalContact"
                type="tel"
                className={`${styles.input} ${errors.hospitalContact ? styles.error : ''}`}
                value={formData.hospitalInfo?.contactNumber || ''}
                onChange={(e) => handleHospitalInfoChange('contactNumber', e.target.value)}
                placeholder="+1234567890"
              />
              {errors.hospitalContact && <span className={styles.errorText}>{errors.hospitalContact}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="hospitalEmail">
                Email Address
              </label>
              <input
                id="hospitalEmail"
                type="email"
                className={`${styles.input} ${errors.hospitalEmail ? styles.error : ''}`}
                value={formData.hospitalInfo?.email || ''}
                onChange={(e) => handleHospitalInfoChange('email', e.target.value)}
                placeholder="hospital@example.com"
              />
              {errors.hospitalEmail && <span className={styles.errorText}>{errors.hospitalEmail}</span>}
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