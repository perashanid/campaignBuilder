import { connectDB, closeDB } from './index.js';

async function verify() {
  try {
    console.log('🔍 Verifying seeded data...\n');
    const db = await connectDB();
    
    // Count campaigns
    const totalCampaigns = await db.collection('campaigns').countDocuments();
    const fundraisingCount = await db.collection('campaigns').countDocuments({ type: 'fundraising' });
    const bloodDonationCount = await db.collection('campaigns').countDocuments({ type: 'blood-donation' });
    
    console.log('📊 Campaign Statistics:');
    console.log(`   Total Campaigns: ${totalCampaigns}`);
    console.log(`   Fundraising: ${fundraisingCount}`);
    console.log(`   Blood Donation: ${bloodDonationCount}\n`);
    
    // Show sample fundraising campaigns
    console.log('💰 Sample Fundraising Campaigns:');
    const fundraising = await db.collection('campaigns')
      .find({ type: 'fundraising' })
      .limit(3)
      .toArray();
    
    fundraising.forEach((campaign: any) => {
      console.log(`   - ${campaign.title}`);
      console.log(`     Target: ৳${campaign.target_amount} | Raised: ৳${campaign.current_amount}`);
      console.log(`     Views: ${campaign.view_count}`);
    });
    
    // Show sample blood donation campaigns
    console.log('\n🩸 Sample Blood Donation Campaigns:');
    const bloodDonation = await db.collection('campaigns')
      .find({ type: 'blood-donation' })
      .limit(3)
      .toArray();
    
    bloodDonation.forEach((campaign: any) => {
      console.log(`   - ${campaign.title}`);
      console.log(`     Blood Type: ${campaign.blood_type} | Urgency: ${campaign.urgency_level}`);
      console.log(`     Hospital: ${campaign.hospital_name}`);
      console.log(`     Views: ${campaign.view_count}`);
    });
    
    // Count users
    const userCount = await db.collection('users').countDocuments();
    console.log(`\n👤 Total Users: ${userCount}`);
    
    // Count payment details
    const paymentCount = await db.collection('payment_details').countDocuments();
    console.log(`💳 Payment Details: ${paymentCount}`);
    
    console.log('\n✅ Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await closeDB();
  }
}

verify().catch(console.error);
