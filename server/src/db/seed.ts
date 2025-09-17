import { pool } from './index.js';

// Simple ID generator
function createId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create URL-friendly slug from campaign title
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 50 characters
    .substring(0, 50)
    // Remove trailing hyphen if created by substring
    .replace(/-+$/, '');
}

const seedData = [
  {
    id: createSlugFromTitle('Emergency Medical Fund for Sarah'),
    title: 'Emergency Medical Fund for Sarah',
    description: 'Sarah needs urgent medical treatment for a rare condition. Every contribution helps save her life and gives her family hope during this difficult time.',
    type: 'fundraising',
    target_amount: 50000,
    current_amount: 12500,
    main_image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    additional_images: JSON.stringify([
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]),
    payment_details: {
      mobile_banking: '+1-555-0123',
      bank_account_number: '1234567890',
      bank_name: 'First National Bank',
      account_holder: 'Sarah Johnson'
    }
  },
  {
    id: createSlugFromTitle('Urgent: O- Blood Needed at City Hospital'),
    title: 'Urgent: O- Blood Needed at City Hospital',
    description: 'City Hospital is critically low on O- blood type. Multiple patients in the ICU need immediate transfusions. Your donation can save lives today.',
    type: 'blood-donation',
    hospital_name: 'City General Hospital',
    hospital_address: '123 Medical Center Drive, Downtown',
    hospital_contact: '+1-555-0199',
    hospital_email: 'bloodbank@citygeneral.org',
    blood_type: 'O-',
    urgency_level: 'high',
    main_image_url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: createSlugFromTitle('Help Build Clean Water Wells in Rural Communities'),
    title: 'Help Build Clean Water Wells in Rural Communities',
    description: 'Join us in bringing clean, safe drinking water to remote villages. Each well serves 500+ families and transforms entire communities for generations.',
    type: 'fundraising',
    target_amount: 25000,
    current_amount: 8750,
    main_image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additional_images: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]),
    payment_details: {
      mobile_banking: '+1-555-0156',
      bank_account_number: '9876543210',
      bank_name: 'Community Trust Bank',
      account_holder: 'Water for All Foundation'
    }
  },
  {
    id: createSlugFromTitle('Support Local Food Bank Initiative'),
    title: 'Support Local Food Bank Initiative',
    description: 'Help us provide nutritious meals to families in need. Our food bank serves over 200 families weekly and needs your support to continue this vital service.',
    type: 'fundraising',
    target_amount: 15000,
    current_amount: 4200,
    main_image_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additional_images: JSON.stringify([
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]),
    payment_details: {
      mobile_banking: '+1-555-0178',
      bank_account_number: '5555666677',
      bank_name: 'Community Bank',
      account_holder: 'Local Food Bank'
    }
  },
  {
    id: createSlugFromTitle('AB+ Blood Donors Needed - Children\'s Hospital'),
    title: 'AB+ Blood Donors Needed - Children\'s Hospital',
    description: 'Children\'s Hospital urgently needs AB+ blood donors for pediatric surgeries scheduled this week. Your donation could save a child\'s life.',
    type: 'blood-donation',
    hospital_name: 'Children\'s Medical Center',
    hospital_address: '456 Pediatric Way, Medical District',
    hospital_contact: '+1-555-0234',
    hospital_email: 'donations@childrensmedical.org',
    blood_type: 'AB+',
    urgency_level: 'high',
    main_image_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: createSlugFromTitle('Disaster Relief Fund - Hurricane Recovery'),
    title: 'Disaster Relief Fund - Hurricane Recovery',
    description: 'Communities affected by recent hurricanes need immediate assistance. Help us provide emergency supplies, temporary shelter, and rebuilding support.',
    type: 'fundraising',
    target_amount: 75000,
    current_amount: 23400,
    main_image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    additional_images: JSON.stringify([
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]),
    payment_details: {
      mobile_banking: '+1-555-0299',
      bank_account_number: '9988776655',
      bank_name: 'Relief Fund Bank',
      account_holder: 'Disaster Relief Organization'
    }
  }
];

async function seed() {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Clear existing data
    await pool.query('DELETE FROM payment_details');
    await pool.query('DELETE FROM campaigns');
    
    // Insert campaigns and payment details
    for (const campaign of seedData) {
      const campaignId = campaign.id;
      
      // Insert campaign
      await pool.query(`
        INSERT INTO campaigns (
          id, title, description, type, target_amount, current_amount,
          hospital_name, hospital_address, hospital_contact, hospital_email,
          blood_type, urgency_level, main_image_url, additional_images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        campaignId,
        campaign.title,
        campaign.description,
        campaign.type,
        campaign.target_amount || null,
        campaign.current_amount || null,
        campaign.hospital_name || null,
        campaign.hospital_address || null,
        campaign.hospital_contact || null,
        campaign.hospital_email || null,
        campaign.blood_type || null,
        campaign.urgency_level || null,
        campaign.main_image_url || null,
        campaign.additional_images || '[]'
      ]);
      
      // Insert payment details if fundraising
      if (campaign.type === 'fundraising' && campaign.payment_details) {
        const paymentId = createId();
        await pool.query(`
          INSERT INTO payment_details (
            id, campaign_id, mobile_banking, bank_account_number, bank_name, account_holder
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          paymentId,
          campaignId,
          campaign.payment_details.mobile_banking,
          campaign.payment_details.bank_account_number,
          campaign.payment_details.bank_name,
          campaign.payment_details.account_holder
        ]);
      }
    }
    
    console.log(`✅ Successfully seeded ${seedData.length} campaigns`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seed();