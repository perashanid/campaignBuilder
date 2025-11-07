import { connectDB, closeDB } from './index.js';
import { Int32, Double } from 'mongodb';

// Simple password hashing (matching auth.ts)
function hashPassword(password: string): string {
  return `hashed_${password}`;
}

// Helper to ensure double type for MongoDB
function toDouble(value: number): Double {
  return new Double(value);
}

// Mock image URLs from Unsplash (free to use)
const MOCK_IMAGES = {
  fundraising: [
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
    'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
  ],
  bloodDonation: [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    'https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=800',
  ],
  additional: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
  ]
};

async function seed() {
  console.log('🌱 Seed function called...');
  try {
    console.log('🌱 Starting database seeding...');
    const db = await connectDB();
    console.log('✅ Database connected');

    // Create or get demo users
    console.log('👤 Creating/fetching demo users...');
    const userEmails = [
      'john.doe@example.com',
      'sarah.smith@example.com',
      'michael.johnson@example.com'
    ];
    
    const userIds: string[] = [];
    
    for (const email of userEmails) {
      let user = await db.collection('users').findOne({ email });
      
      if (!user) {
        const name = email.split('@')[0].split('.').map(n => 
          n.charAt(0).toUpperCase() + n.slice(1)
        ).join(' ');
        
        const result = await db.collection('users').insertOne({
          email,
          name,
          password_hash: hashPassword('password123'),
          created_at: new Date(),
          updated_at: new Date(),
        });
        
        userIds.push(result.insertedId.toString());
        console.log(`  ✅ Created user: ${email}`);
      } else {
        userIds.push(user._id!.toString());
        console.log(`  ℹ️  User already exists: ${email}`);
      }
    }
    
    console.log(`✅ Ready with ${userIds.length} demo users`);

    // Create fundraising campaigns
    console.log('💰 Creating fundraising campaigns...');
    const fundraisingCampaigns: any[] = [
      {
        user_id: userIds[0],
        title: 'Help Build a School in Rural Bangladesh',
        description: `We are raising funds to build a primary school in a remote village in Bangladesh where children currently have to walk 5km to attend classes. This new school will serve over 200 children and provide them with quality education close to home.

The funds will be used for:
- Construction of 6 classrooms
- Library and computer lab
- Playground equipment
- Furniture and educational materials
- Teacher training programs

Every contribution, no matter how small, brings us closer to giving these children the education they deserve. Join us in making a difference!`,
        type: 'fundraising',
        target_amount: toDouble(50000),
        current_amount: toDouble(32500),
        main_image_url: MOCK_IMAGES.fundraising[0],
        additional_images: [MOCK_IMAGES.additional[0], MOCK_IMAGES.additional[1]],
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        view_count: new Int32(1250),
        urgency_level: null,
        is_hidden: false,
      },
      {
        user_id: userIds[1],
        title: 'Medical Treatment for Cancer Patient',
        description: `My mother has been diagnosed with stage 3 breast cancer and requires immediate chemotherapy and radiation treatment. The medical costs are overwhelming for our family, and we are reaching out for help.

Treatment plan includes:
- 6 cycles of chemotherapy
- Radiation therapy
- Medications and hospital stays
- Post-treatment care

She has always been a pillar of strength for our family, and now it's our turn to fight for her. Your support can help save her life. Please consider donating or sharing this campaign.`,
        type: 'fundraising',
        target_amount: toDouble(80000),
        current_amount: toDouble(45000),
        main_image_url: MOCK_IMAGES.fundraising[1],
        additional_images: [MOCK_IMAGES.additional[2]],
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        view_count: new Int32(2100),
        urgency_level: null,
        is_hidden: false,
      },
      {
        user_id: userIds[2],
        title: 'Clean Water Project for Village Community',
        description: `Our village of 500 families has been struggling with contaminated water sources for years. We are raising funds to install a deep tube well and water purification system that will provide clean drinking water to the entire community.

Project details:
- Deep tube well installation (300 feet)
- Water purification and filtration system
- Storage tanks and distribution network
- Maintenance training for locals

Clean water is a basic human right. Help us bring this essential resource to our community and prevent waterborne diseases that affect our children and elderly.`,
        type: 'fundraising',
        target_amount: toDouble(35000),
        current_amount: toDouble(28000),
        main_image_url: MOCK_IMAGES.fundraising[2],
        additional_images: [MOCK_IMAGES.additional[3], MOCK_IMAGES.additional[0]],
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        view_count: new Int32(890),
        urgency_level: null,
        is_hidden: false,
      },
      {
        user_id: userIds[0],
        title: 'Emergency Relief for Flood Victims',
        description: `Recent floods have devastated our district, leaving hundreds of families homeless and without basic necessities. We are organizing emergency relief efforts and need your support.

Relief package includes:
- Food supplies (rice, lentils, oil)
- Clean drinking water
- Temporary shelter materials
- Medical supplies and first aid
- Clothing and blankets

The situation is critical, and these families need immediate help. Your donation will directly reach those affected and help them rebuild their lives.`,
        type: 'fundraising',
        target_amount: toDouble(60000),
        current_amount: toDouble(15000),
        main_image_url: MOCK_IMAGES.fundraising[3],
        additional_images: [MOCK_IMAGES.additional[1]],
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        view_count: new Int32(1650),
        urgency_level: null,
        is_hidden: false,
      },
      {
        user_id: userIds[1],
        title: 'Support Local Artisans Workshop',
        description: `We are establishing a cooperative workshop for local artisans to preserve traditional crafts and provide sustainable livelihoods. This project will empower 30 artisan families in our community.

Workshop facilities:
- Workspace with proper lighting and ventilation
- Traditional and modern tools
- Raw material storage
- Display and sales area
- Skills training programs

By supporting this project, you're helping preserve cultural heritage while creating economic opportunities for skilled artisans and their families.`,
        type: 'fundraising',
        target_amount: toDouble(40000),
        current_amount: toDouble(38500),
        main_image_url: MOCK_IMAGES.fundraising[4],
        additional_images: [MOCK_IMAGES.additional[2], MOCK_IMAGES.additional[3]],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        view_count: new Int32(750),
        urgency_level: null,
        is_hidden: false,
      },
    ];

    const campaignIds: string[] = [];
    for (let i = 0; i < fundraisingCampaigns.length; i++) {
      try {
        const result = await db.collection('campaigns').insertOne(fundraisingCampaigns[i]);
        campaignIds.push(result.insertedId.toString());
        console.log(`  ✅ Created campaign: ${fundraisingCampaigns[i].title.substring(0, 40)}...`);
      } catch (error: any) {
        console.error(`  ❌ Failed to create campaign: ${fundraisingCampaigns[i].title.substring(0, 40)}...`);
        console.error(`     Error: ${error.message}`);
        if (error.errInfo) {
          console.error(`     Details:`, JSON.stringify(error.errInfo, null, 2));
        }
      }
    }
    console.log(`✅ Created ${campaignIds.length} fundraising campaigns`);

    // Create payment details for fundraising campaigns
    console.log('💳 Creating payment details...');
    const paymentDetails = [
      {
        campaign_id: campaignIds[0],
        mobile_banking: 'bKash: 01712345678',
        bank_account_number: '1234567890',
        bank_name: 'Dutch-Bangla Bank',
        account_holder: 'John Doe',
      },
      {
        campaign_id: campaignIds[1],
        mobile_banking: 'Nagad: 01798765432',
        bank_account_number: '9876543210',
        bank_name: 'BRAC Bank',
        account_holder: 'Sarah Smith',
      },
      {
        campaign_id: campaignIds[2],
        mobile_banking: 'bKash: 01611223344',
        bank_account_number: '5555666677',
        bank_name: 'Islami Bank Bangladesh',
        account_holder: 'Michael Johnson',
      },
      {
        campaign_id: campaignIds[3],
        mobile_banking: 'Rocket: 01722334455',
        bank_account_number: '1111222233',
        bank_name: 'City Bank',
        account_holder: 'John Doe',
      },
      {
        campaign_id: campaignIds[4],
        mobile_banking: 'bKash: 01833445566',
        bank_account_number: '9999888877',
        bank_name: 'Standard Chartered',
        account_holder: 'Sarah Smith',
      },
    ];

    await db.collection('payment_details').insertMany(paymentDetails);
    console.log(`✅ Created ${paymentDetails.length} payment details`);

    // Create blood donation campaigns
    console.log('🩸 Creating blood donation campaigns...');
    const bloodDonationCampaigns = [
      {
        user_id: userIds[0],
        title: 'Urgent: O Negative Blood Needed for Surgery',
        description: `My brother needs emergency surgery tomorrow and requires 4 units of O negative blood. The hospital blood bank is running low on this rare blood type.

Patient details:
- Age: 28 years
- Blood type needed: O Negative
- Units required: 4
- Surgery date: Tomorrow morning
- Hospital: Dhaka Medical College Hospital

O negative is a universal donor type but very rare. If you have O negative blood or know someone who does, please come forward. Your donation can save a life!

Please contact us immediately if you can help. Time is critical.`,
        type: 'blood-donation',
        hospital_name: 'Dhaka Medical College Hospital',
        hospital_address: 'Secretariat Road, Dhaka 1000',
        hospital_contact: '02-8626812',
        hospital_email: 'dmch@health.gov.bd',
        blood_type: 'O-',
        urgency_level: 'high',
        main_image_url: MOCK_IMAGES.bloodDonation[0],
        additional_images: [MOCK_IMAGES.additional[0]],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        view_count: new Int32(3200),
        is_hidden: false,
      },
      {
        user_id: userIds[2],
        title: 'Blood Donation Drive at Square Hospital',
        description: `Square Hospital is organizing a blood donation camp this weekend to replenish their blood bank. We need donors of all blood types to help patients in need.

Event details:
- Date: This Saturday and Sunday
- Time: 9:00 AM - 5:00 PM
- Location: Square Hospital, Panthapath
- All blood types needed
- Free health checkup for donors
- Refreshments provided

Requirements for donors:
- Age: 18-60 years
- Weight: Minimum 50 kg
- Good health condition
- No recent illness or medication

Your one donation can save up to three lives. Please join us and be a hero! Walk-ins are welcome, or you can register in advance.`,
        type: 'blood-donation',
        hospital_name: 'Square Hospital',
        hospital_address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, Panthapath, Dhaka 1205',
        hospital_contact: '10678',
        hospital_email: 'info@squarehospital.com',
        blood_type: 'All Types',
        urgency_level: 'medium',
        main_image_url: MOCK_IMAGES.bloodDonation[1],
        additional_images: [MOCK_IMAGES.additional[1], MOCK_IMAGES.additional[2]],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        view_count: new Int32(1850),
        is_hidden: false,
      },
      {
        user_id: userIds[1],
        title: 'AB Positive Blood Needed for Thalassemia Patient',
        description: `My 12-year-old daughter has thalassemia and requires regular blood transfusions every 3 weeks. We are looking for AB positive blood donors who can help her.

About thalassemia:
- Genetic blood disorder
- Requires lifelong transfusions
- Regular donors make a huge difference

Patient information:
- Age: 12 years
- Blood type: AB Positive
- Frequency: Every 3 weeks
- Hospital: Bangabandhu Sheikh Mujib Medical University

If you have AB positive blood and can become a regular donor, you would be giving my daughter the gift of life. We are also looking to build a network of donors for emergency situations.

Please reach out if you can help. Your kindness means the world to us.`,
        type: 'blood-donation',
        hospital_name: 'Bangabandhu Sheikh Mujib Medical University',
        hospital_address: 'Shahbag, Dhaka 1000',
        hospital_contact: '02-9668690',
        hospital_email: 'info@bsmmu.edu.bd',
        blood_type: 'AB+',
        urgency_level: 'medium',
        main_image_url: MOCK_IMAGES.bloodDonation[2],
        additional_images: [MOCK_IMAGES.additional[3]],
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        view_count: new Int32(980),
        is_hidden: false,
      },
      {
        user_id: userIds[0],
        title: 'Emergency: A Positive Blood for Accident Victim',
        description: `A young man was involved in a serious road accident and is currently in ICU. He has lost a lot of blood and urgently needs A positive blood transfusion.

Critical situation:
- Patient: 25-year-old male
- Blood type: A Positive
- Units needed: 3-4 units
- Location: United Hospital ICU
- Status: Critical condition

The patient is fighting for his life, and immediate blood donation is crucial. If you have A positive blood, please come to United Hospital as soon as possible.

Contact the hospital or me directly. Every minute counts in saving this young life. Please help if you can or share this with others who might be able to donate.`,
        type: 'blood-donation',
        hospital_name: 'United Hospital',
        hospital_address: 'Plot 15, Road 71, Gulshan, Dhaka 1212',
        hospital_contact: '09666710678',
        hospital_email: 'info@uhlbd.com',
        blood_type: 'A+',
        urgency_level: 'high',
        main_image_url: MOCK_IMAGES.bloodDonation[3],
        additional_images: [],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        view_count: new Int32(2750),
        is_hidden: false,
      },
      {
        user_id: userIds[2],
        title: 'B Negative Blood Donors Needed for Cancer Patient',
        description: `My aunt is undergoing chemotherapy for leukemia and frequently needs B negative blood transfusions. We are building a donor network to ensure she always has access to blood when needed.

Patient details:
- Diagnosis: Acute Lymphoblastic Leukemia
- Blood type: B Negative
- Treatment: Ongoing chemotherapy
- Hospital: National Institute of Cancer Research & Hospital

B negative is one of the rarer blood types, making it challenging to find donors. If you have B negative blood, your donation would be invaluable.

We are looking for:
- One-time donors for immediate need
- Regular donors who can help throughout treatment
- People willing to be on-call for emergencies

Your support during this difficult time would mean everything to our family. Please consider donating or sharing this campaign with others.`,
        type: 'blood-donation',
        hospital_name: 'National Institute of Cancer Research & Hospital',
        hospital_address: 'Mohakhali, Dhaka 1212',
        hospital_contact: '02-9884402',
        hospital_email: 'info@nicrh.gov.bd',
        blood_type: 'B-',
        urgency_level: 'medium',
        main_image_url: MOCK_IMAGES.bloodDonation[4],
        additional_images: [MOCK_IMAGES.additional[0], MOCK_IMAGES.additional[1]],
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        view_count: new Int32(1420),
        is_hidden: false,
      },
    ];

    await db.collection('campaigns').insertMany(bloodDonationCampaigns);
    console.log(`✅ Created ${bloodDonationCampaigns.length} blood donation campaigns`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${userIds.length}`);
    console.log(`   Fundraising Campaigns: ${fundraisingCampaigns.length}`);
    console.log(`   Blood Donation Campaigns: ${bloodDonationCampaigns.length}`);
    console.log(`   Total Campaigns: ${fundraisingCampaigns.length + bloodDonationCampaigns.length}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Demo User Credentials:');
    console.log('   Email: john.doe@example.com | Password: password123');
    console.log('   Email: sarah.smith@example.com | Password: password123');
    console.log('   Email: michael.johnson@example.com | Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

export { seed };

// Run seed if called directly
seed().catch(console.error);
