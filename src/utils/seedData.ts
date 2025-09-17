import { Campaign, FundraisingCampaign, BloodDonationCampaign } from '../types/campaign';
import { generateCampaignSlug } from './uuid';

/**
 * Sample campaigns for development and testing
 */
export const sampleCampaigns: Campaign[] = [
  {
    id: generateCampaignSlug('Emergency Medical Fund for Sarah'),
    title: 'Emergency Medical Fund for Sarah',
    description: 'Sarah needs urgent medical treatment for a rare condition. Every contribution helps save her life and gives her family hope during this difficult time. The treatment requires specialized equipment and expert medical care that is not covered by insurance.',
    type: 'fundraising',
    targetAmount: 50000,
    currentAmount: 12500,
    mainImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    paymentDetails: {
      mobileBanking: '+1-555-0123',
      bankAccount: {
        accountNumber: '1234567890',
        bankName: 'First National Bank',
        accountHolder: 'Sarah Johnson'
      }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  } as FundraisingCampaign,
  
  {
    id: generateCampaignSlug('Urgent: O- Blood Needed at City Hospital'),
    title: 'Urgent: O- Blood Needed at City Hospital',
    description: 'City Hospital is critically low on O- blood type. Multiple patients in the ICU need immediate transfusions. Your donation can save lives today. The hospital serves over 10,000 patients monthly and maintains a critical blood supply.',
    type: 'blood-donation',
    hospitalInfo: {
      name: 'City General Hospital',
      address: '123 Medical Center Drive, Downtown',
      contactNumber: '+1-555-0199',
      email: 'bloodbank@citygeneral.org'
    },
    bloodType: 'O-',
    urgencyLevel: 'high',
    mainImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  } as BloodDonationCampaign,
  
  {
    id: generateCampaignSlug('Help Build Clean Water Wells in Rural Communities'),
    title: 'Help Build Clean Water Wells in Rural Communities',
    description: 'Join us in bringing clean, safe drinking water to remote villages. Each well serves 500+ families and transforms entire communities for generations. Our project includes water purification systems and maintenance training for local communities.',
    type: 'fundraising',
    targetAmount: 25000,
    currentAmount: 8750,
    mainImage: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    paymentDetails: {
      mobileBanking: '+1-555-0156',
      bankAccount: {
        accountNumber: '9876543210',
        bankName: 'Community Trust Bank',
        accountHolder: 'Water for All Foundation'
      }
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19')
  } as FundraisingCampaign,
  
  {
    id: generateCampaignSlug('Support Local Food Bank Initiative'),
    title: 'Support Local Food Bank Initiative',
    description: 'Help us provide nutritious meals to families in need. Our food bank serves over 200 families weekly and needs your support to continue this vital service. We distribute fresh produce, canned goods, and prepared meals to those facing food insecurity.',
    type: 'fundraising',
    targetAmount: 15000,
    currentAmount: 4200,
    mainImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    paymentDetails: {
      mobileBanking: '+1-555-0178',
      bankAccount: {
        accountNumber: '5555666677',
        bankName: 'Community Bank',
        accountHolder: 'Local Food Bank'
      }
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-17')
  } as FundraisingCampaign,
  
  {
    id: generateCampaignSlug('AB+ Blood Donors Needed - Children\'s Hospital'),
    title: 'AB+ Blood Donors Needed - Children\'s Hospital',
    description: 'Children\'s Hospital urgently needs AB+ blood donors for pediatric surgeries scheduled this week. Your donation could save a child\'s life. We specialize in complex pediatric procedures and maintain the highest standards of care.',
    type: 'blood-donation',
    hospitalInfo: {
      name: 'Children\'s Medical Center',
      address: '456 Pediatric Way, Medical District',
      contactNumber: '+1-555-0234',
      email: 'donations@childrensmedical.org'
    },
    bloodType: 'AB+',
    urgencyLevel: 'high',
    mainImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  } as BloodDonationCampaign,
  
  {
    id: generateCampaignSlug('Disaster Relief Fund - Hurricane Recovery'),
    title: 'Disaster Relief Fund - Hurricane Recovery',
    description: 'Communities affected by recent hurricanes need immediate assistance. Help us provide emergency supplies, temporary shelter, and rebuilding support. Our relief efforts include food distribution, medical aid, and long-term reconstruction planning.',
    type: 'fundraising',
    targetAmount: 75000,
    currentAmount: 23400,
    mainImage: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    paymentDetails: {
      mobileBanking: '+1-555-0299',
      bankAccount: {
        accountNumber: '9988776655',
        bankName: 'Relief Fund Bank',
        accountHolder: 'Disaster Relief Organization'
      }
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-21')
  } as FundraisingCampaign,
  
  {
    id: generateCampaignSlug('A+ Blood Drive - University Medical Center'),
    title: 'A+ Blood Drive - University Medical Center',
    description: 'University Medical Center is organizing a blood drive to replenish our A+ blood supply. Students, faculty, and community members are encouraged to participate in this life-saving initiative.',
    type: 'blood-donation',
    hospitalInfo: {
      name: 'University Medical Center',
      address: '789 Campus Drive, University District',
      contactNumber: '+1-555-0345',
      email: 'blooddrive@universitymed.edu'
    },
    bloodType: 'A+',
    urgencyLevel: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  } as BloodDonationCampaign,
  
  {
    id: generateCampaignSlug('Education Fund for Underprivileged Children'),
    title: 'Education Fund for Underprivileged Children',
    description: 'Help provide quality education and school supplies to children from low-income families. Your contribution will fund textbooks, uniforms, and educational technology to ensure every child has access to learning opportunities.',
    type: 'fundraising',
    targetAmount: 30000,
    currentAmount: 11200,
    mainImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    paymentDetails: {
      mobileBanking: '+1-555-0456',
      bankAccount: {
        accountNumber: '1122334455',
        bankName: 'Education Trust Bank',
        accountHolder: 'Children Education Foundation'
      }
    },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-20')
  } as FundraisingCampaign
];

/**
 * Seed localStorage with sample data for development
 */
export function seedLocalStorage(): void {
  try {
    localStorage.setItem('campaigns', JSON.stringify(sampleCampaigns));
    
    // Add some sample view counts
    const viewCounts = {
      [sampleCampaigns[0].id]: 45,
      [sampleCampaigns[1].id]: 32,
      [sampleCampaigns[2].id]: 28,
      [sampleCampaigns[3].id]: 19,
      [sampleCampaigns[4].id]: 15,
      [sampleCampaigns[5].id]: 12,
    };
    localStorage.setItem('campaign_views', JSON.stringify(viewCounts));
    
    console.log('✅ Sample data seeded to localStorage');
  } catch (error) {
    console.error('❌ Failed to seed localStorage:', error);
  }
}

/**
 * Clear all localStorage data
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem('campaigns');
    localStorage.removeItem('campaign_views');
    console.log('✅ localStorage cleared');
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error);
  }
}