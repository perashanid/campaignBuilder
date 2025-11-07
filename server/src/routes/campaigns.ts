import { Hono } from 'hono';
import { getDB } from '../db/index.js';
import { Campaign, PaymentDetails } from '../db/schema.js';
import { authenticateUser } from './auth.js';
import { Variables } from '../types/hono.js';
import { ObjectId } from 'mongodb';

// Simple ID generator
function createId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Create URL-friendly slug from campaign title
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
    .replace(/-+$/, '');
}

// Generate unique slug with collision handling
async function generateUniqueSlug(title: string): Promise<string> {
  const db = getDB();
  const baseSlug = createSlugFromTitle(title);
  
  const existing = await db.collection('campaigns').findOne({ id: baseSlug });
  
  if (!existing) {
    return baseSlug;
  }
  
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (true) {
    const exists = await db.collection('campaigns').findOne({ id: uniqueSlug });
    if (!exists) {
      return uniqueSlug;
    }
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

const app = new Hono<{ Variables: Variables }>();

// Get user's campaigns (protected)
app.get('/user', authenticateUser, async (c) => {
  try {
    const user = c.get('user');
    const db = getDB();
    
    const campaigns = await db.collection<Campaign>('campaigns')
      .find({ user_id: user.id })
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign._id?.toString(),
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at.toISOString(),
      isHidden: campaign.is_hidden || false,
      targetAmount: campaign.target_amount,
      currentAmount: campaign.current_amount,
      hospitalInfo: campaign.type === 'blood-donation' ? {
        name: campaign.hospital_name,
        address: campaign.hospital_address,
      } : undefined,
      urgencyLevel: campaign.urgency_level,
      viewCount: campaign.view_count || 0,
    }));

    return c.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch user campaigns' 
      } 
    }, 500);
  }
});

// Create new campaign (protected)
app.post('/', authenticateUser, async (c) => {
  try {
    const body = await c.req.json();
    console.log('📥 Received campaign data:', JSON.stringify(body, null, 2));
    
    if (!body.title || !body.description || !body.type) {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Missing required fields: title, description, type' 
        } 
      }, 400);
    }

    const campaignId = await generateUniqueSlug(body.title);
    const user = c.get('user');
    const db = getDB();
    const now = new Date();

    const campaign: any = {
      user_id: user.id,
      title: body.title,
      description: body.description,
      type: body.type,
      created_at: now,
      updated_at: now,
      view_count: 0,
      is_hidden: false,
      main_image_url: body.mainImage || null,
      additional_images: body.additionalImages || [],
    };

    if (body.type === 'fundraising') {
      campaign.target_amount = body.targetAmount || 0;
      campaign.current_amount = 0;
      console.log('💰 Fundraising campaign - target:', campaign.target_amount);
    } else {
      campaign.hospital_name = body.hospitalInfo?.name || '';
      campaign.hospital_address = body.hospitalInfo?.address || '';
      campaign.hospital_contact = body.hospitalInfo?.contactNumber || '';
      campaign.hospital_email = body.hospitalInfo?.email || '';
      campaign.blood_type = body.bloodType || '';
      campaign.urgency_level = body.urgencyLevel || 'medium';
      console.log('🏥 Blood donation campaign - hospital:', campaign.hospital_name);
    }

    console.log('💾 Inserting campaign into database...');
    console.log('📋 Campaign object:', JSON.stringify(campaign, null, 2));
    const result = await db.collection('campaigns').insertOne(campaign);
    console.log('✅ Campaign inserted with ID:', result.insertedId.toString());

    // Insert payment details if fundraising
    let paymentInfo = null;
    if (body.type === 'fundraising' && body.paymentDetails) {
      console.log('💳 Inserting payment details:', {
        mobileBanking: body.paymentDetails.mobileBanking,
        hasBankAccount: !!body.paymentDetails.bankAccount
      });
      
      const paymentDetails: Partial<PaymentDetails> = {
        campaign_id: result.insertedId.toString(),
        mobile_banking: body.paymentDetails.mobileBanking || '',
        bank_account_number: body.paymentDetails.bankAccount?.accountNumber || '',
        bank_name: body.paymentDetails.bankAccount?.bankName || '',
        account_holder: body.paymentDetails.bankAccount?.accountHolder || '',
      };
      
      await db.collection('payment_details').insertOne(paymentDetails as PaymentDetails);
      
      console.log('✅ Payment details inserted');
      paymentInfo = body.paymentDetails;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/campaign/${result.insertedId.toString()}`;

    return c.json({
      id: result.insertedId.toString(),
      shareUrl,
      campaign: {
        id: result.insertedId.toString(),
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        mainImage: campaign.main_image_url,
        additionalImages: campaign.additional_images,
        createdAt: campaign.created_at?.toISOString() || now.toISOString(),
        updatedAt: campaign.updated_at?.toISOString() || now.toISOString(),
        targetAmount: campaign.target_amount,
        currentAmount: campaign.current_amount,
        paymentDetails: paymentInfo,
        hospitalInfo: body.type === 'blood-donation' ? body.hospitalInfo : undefined,
        bloodType: campaign.blood_type,
        urgencyLevel: campaign.urgency_level,
      }
    }, 201);

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to create campaign',
        details: error instanceof Error ? error.message : String(error)
      } 
    }, 500);
  }
});

// Get most visited campaigns (must come before /:id route)
app.get('/most-visited', async (c) => {
  try {
    const db = getDB();
    
    const campaigns = await db.collection<Campaign>('campaigns')
      .find({ $or: [{ is_hidden: false }, { is_hidden: { $exists: false } }] })
      .sort({ view_count: -1, created_at: -1 })
      .limit(6)
      .toArray();
    
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign._id!.toString(),
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at.toISOString(),
      viewCount: campaign.view_count || 0,
      targetAmount: campaign.target_amount,
      currentAmount: campaign.current_amount,
      hospitalInfo: campaign.type === 'blood-donation' ? {
        name: campaign.hospital_name,
        address: campaign.hospital_address,
      } : undefined,
      urgencyLevel: campaign.urgency_level,
    }));

    return c.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching most visited campaigns:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch most visited campaigns' 
      } 
    }, 500);
  }
});

// Get platform statistics (must come before /:id route)
app.get('/stats/platform', async (c) => {
  try {
    const db = getDB();
    
    const totalCampaigns = await db.collection('campaigns').countDocuments();
    const fundraisingCampaigns = await db.collection('campaigns').countDocuments({ type: 'fundraising' });
    const bloodDonationCampaigns = await db.collection('campaigns').countDocuments({ type: 'blood-donation' });
    const activeCampaigns = await db.collection('campaigns').countDocuments({ 
      $or: [{ is_hidden: false }, { is_hidden: { $exists: false } }] 
    });
    
    const viewsResult = await db.collection('campaigns').aggregate([
      { $group: { _id: null, total: { $sum: '$view_count' } } }
    ]).toArray();
    const totalViews = viewsResult[0]?.total || 0;
    
    const fundsResult = await db.collection('campaigns').aggregate([
      { $match: { type: 'fundraising' } },
      { $group: { _id: null, total: { $sum: '$current_amount' } } }
    ]).toArray();
    const totalFundsRaised = fundsResult[0]?.total || 0;
    
    const completedCampaigns = await db.collection('campaigns').countDocuments({
      type: 'fundraising',
      $expr: { $gte: ['$current_amount', '$target_amount'] }
    });
    
    const totalUsers = await db.collection('users').countDocuments();
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const campaignsThisWeek = await db.collection('campaigns').countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const campaignsThisMonth = await db.collection('campaigns').countDocuments({ created_at: { $gte: thirtyDaysAgo } });
    const newUsersThisWeek = await db.collection('users').countDocuments({ created_at: { $gte: sevenDaysAgo } });
    const newUsersThisMonth = await db.collection('users').countDocuments({ created_at: { $gte: thirtyDaysAgo } });

    return c.json({
      campaigns: {
        total: totalCampaigns,
        fundraising: fundraisingCampaigns,
        bloodDonation: bloodDonationCampaigns,
        active: activeCampaigns,
        completed: completedCampaigns,
        thisWeek: campaignsThisWeek,
        thisMonth: campaignsThisMonth,
      },
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      engagement: {
        totalViews,
        totalFundsRaised,
        averageFundingProgress: 0,
      }
    });

  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch platform statistics' 
      } 
    }, 500);
  }
});

// Get campaign by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDB();
    
    let campaign;
    if (ObjectId.isValid(id)) {
      campaign = await db.collection<Campaign>('campaigns').findOne({ _id: new ObjectId(id) });
    } else {
      campaign = await db.collection<Campaign>('campaigns').findOne({ id });
    }

    if (!campaign) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }

    let paymentInfo = null;
    if (campaign.type === 'fundraising') {
      const payment = await db.collection<PaymentDetails>('payment_details').findOne({
        campaign_id: campaign._id!.toString()
      });
      
      if (payment) {
        paymentInfo = {
          mobileBanking: payment.mobile_banking,
          bankAccount: {
            accountNumber: payment.bank_account_number,
            bankName: payment.bank_name,
            accountHolder: payment.account_holder,
          }
        };
      }
    }

    const response: any = {
      id: campaign._id!.toString(),
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      additionalImages: campaign.additional_images || [],
      createdAt: campaign.created_at.toISOString(),
      updatedAt: campaign.updated_at.toISOString(),
    };

    if (campaign.type === 'fundraising') {
      response.targetAmount = campaign.target_amount || 0;
      response.currentAmount = campaign.current_amount || 0;
      response.paymentDetails = paymentInfo;
    } else {
      response.hospitalInfo = {
        name: campaign.hospital_name,
        address: campaign.hospital_address,
        contactNumber: campaign.hospital_contact,
        email: campaign.hospital_email,
      };
      response.bloodType = campaign.blood_type;
      response.urgencyLevel = campaign.urgency_level;
    }

    return c.json(response);

  } catch (error) {
    console.error('Error fetching campaign:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch campaign' 
      } 
    }, 500);
  }
});

// Get all campaigns (public, excluding hidden)
app.get('/', async (c) => {
  try {
    const db = getDB();
    
    const campaigns = await db.collection<Campaign>('campaigns')
      .find({ $or: [{ is_hidden: false }, { is_hidden: { $exists: false } }] })
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign._id!.toString(),
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at.toISOString(),
      targetAmount: campaign.target_amount,
      currentAmount: campaign.current_amount,
      hospitalInfo: campaign.type === 'blood-donation' ? {
        name: campaign.hospital_name,
        address: campaign.hospital_address,
      } : undefined,
      urgencyLevel: campaign.urgency_level,
      viewCount: campaign.view_count || 0,
    }));

    return c.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch campaigns' 
      } 
    }, 500);
  }
});

// Increment campaign view count
app.post('/:id/view', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDB();
    
    let result;
    if (ObjectId.isValid(id)) {
      result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { view_count: 1 } },
        { returnDocument: 'after' }
      );
    } else {
      result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
        { id },
        { $inc: { view_count: 1 } },
        { returnDocument: 'after' }
      );
    }

    if (!result) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }

    return c.json({
      success: true,
      viewCount: result.view_count || 0
    });

  } catch (error) {
    console.error('Error incrementing view count:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to increment view count' 
      } 
    }, 500);
  }
});

// Update campaign progress (for fundraising campaigns)
app.patch('/:id/progress', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const db = getDB();
    
    if (!body.currentAmount || typeof body.currentAmount !== 'number') {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid currentAmount provided' 
        } 
      }, 400);
    }

    let result;
    if (ObjectId.isValid(id)) {
      result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
        { _id: new ObjectId(id), type: 'fundraising' },
        { $set: { current_amount: body.currentAmount, updated_at: new Date() } },
        { returnDocument: 'after' }
      );
    } else {
      result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
        { id, type: 'fundraising' },
        { $set: { current_amount: body.currentAmount, updated_at: new Date() } },
        { returnDocument: 'after' }
      );
    }

    if (!result) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Fundraising campaign not found' 
        } 
      }, 404);
    }

    return c.json({
      id: result._id!.toString(),
      title: result.title,
      description: result.description,
      type: result.type,
      mainImage: result.main_image_url,
      additionalImages: result.additional_images || [],
      createdAt: result.created_at.toISOString(),
      updatedAt: result.updated_at.toISOString(),
      targetAmount: result.target_amount || 0,
      currentAmount: result.current_amount || 0,
    });

  } catch (error) {
    console.error('Error updating campaign progress:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to update campaign progress' 
      } 
    }, 500);
  }
});

// Update campaign (protected)
app.put('/:id', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const db = getDB();
    
    // Check if campaign belongs to user
    let campaign;
    if (ObjectId.isValid(id)) {
      campaign = await db.collection<Campaign>('campaigns').findOne({ _id: new ObjectId(id) });
    } else {
      campaign = await db.collection<Campaign>('campaigns').findOne({ id });
    }
    
    if (!campaign) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }
    
    if (campaign.user_id !== user.id) {
      return c.json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'You can only edit your own campaigns' 
        } 
      }, 403);
    }

    const updateData: any = {
      title: body.title,
      description: body.description,
      main_image_url: body.mainImage || null,
      additional_images: body.additionalImages || [],
      updated_at: new Date(),
    };

    if (body.type === 'fundraising') {
      updateData.target_amount = body.targetAmount;
    } else {
      updateData.hospital_name = body.hospitalInfo?.name;
      updateData.hospital_address = body.hospitalInfo?.address;
      updateData.hospital_contact = body.hospitalInfo?.contactNumber;
      updateData.hospital_email = body.hospitalInfo?.email;
      updateData.blood_type = body.bloodType;
      updateData.urgency_level = body.urgencyLevel || 'medium';
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    // Update payment details if fundraising
    if (body.type === 'fundraising' && body.paymentDetails) {
      await db.collection<PaymentDetails>('payment_details').updateOne(
        { campaign_id: campaign._id!.toString() },
        {
          $set: {
            mobile_banking: body.paymentDetails.mobileBanking,
            bank_account_number: body.paymentDetails.bankAccount?.accountNumber,
            bank_name: body.paymentDetails.bankAccount?.bankName,
            account_holder: body.paymentDetails.bankAccount?.accountHolder,
          }
        },
        { upsert: true }
      );
    }

    return c.json({
      id: result!._id!.toString(),
      title: result!.title,
      description: result!.description,
      type: result!.type,
      mainImage: result!.main_image_url,
      additionalImages: result!.additional_images || [],
      createdAt: result!.created_at.toISOString(),
      updatedAt: result!.updated_at.toISOString(),
      targetAmount: result!.target_amount,
      currentAmount: result!.current_amount,
      hospitalInfo: body.type === 'blood-donation' ? body.hospitalInfo : undefined,
      bloodType: result!.blood_type,
      urgencyLevel: result!.urgency_level,
    });

  } catch (error) {
    console.error('Error updating campaign:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to update campaign' 
      } 
    }, 500);
  }
});

// Delete campaign (protected)
app.delete('/:id', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const db = getDB();
    
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id), user_id: user.id }
      : { id, user_id: user.id };
    
    const result = await db.collection<Campaign>('campaigns').deleteOne(filter);

    if (result.deletedCount === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found or access denied' 
        } 
      }, 404);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Error deleting campaign:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to delete campaign' 
      } 
    }, 500);
  }
});

// Update campaign visibility (protected)
app.patch('/:id/visibility', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const db = getDB();
    
    const filter = ObjectId.isValid(id)
      ? { _id: new ObjectId(id), user_id: user.id }
      : { id, user_id: user.id };
    
    const result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
      filter,
      { $set: { is_hidden: body.isHidden, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found or access denied' 
        } 
      }, 404);
    }

    return c.json({
      id: result._id!.toString(),
      title: result.title,
      isHidden: result.is_hidden,
    });

  } catch (error) {
    console.error('Error updating campaign visibility:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to update campaign visibility' 
      } 
    }, 500);
  }
});

export default app;
