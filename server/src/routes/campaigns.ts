import { Hono } from 'hono';
import { getDB } from '../db/index.js';
import { Campaign, PaymentDetails, CampaignUpdate, CampaignEditHistory } from '../db/schema.js';
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
    
    // Get contributor counts for each campaign
    const campaignIds = campaigns.map(c => c._id!.toString());
    const contributorCounts = await Promise.all(
      campaignIds.map(async (id) => {
        const count = await db.collection('contributions').countDocuments({ campaign_id: id });
        return { id, count };
      })
    );
    
    const contributorMap = Object.fromEntries(
      contributorCounts.map(({ id, count }) => [id, count])
    );
    
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
      contributorCount: contributorMap[campaign._id!.toString()] || 0,
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
      campaign.target_blood_units = body.targetBloodUnits || 0;
      campaign.current_blood_units = 0;
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
        targetBloodUnits: campaign.target_blood_units,
        currentBloodUnits: campaign.current_blood_units,
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

// Get campaign updates (must come before /:id route)
app.get('/:id/updates', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDB();
    
    // Verify campaign exists
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

    const campaignId = campaign._id!.toString();
    const updates = await db.collection<CampaignUpdate>('campaign_updates')
      .find({ campaign_id: campaignId })
      .sort({ created_at: -1 })
      .toArray();
    
    const formattedUpdates = updates.map((update) => ({
      id: update._id!.toString(),
      campaignId: update.campaign_id,
      title: update.title,
      description: update.description,
      type: update.type,
      imageUrl: update.image_url,
      createdAt: update.created_at.toISOString(),
      updatedAt: update.updated_at.toISOString(),
    }));

    return c.json(formattedUpdates);
  } catch (error) {
    console.error('Error fetching campaign updates:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch campaign updates' 
      } 
    }, 500);
  }
});

// Create campaign update (must come before /:id route)
app.post('/:id/updates', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const db = getDB();
    
    // Verify campaign exists and belongs to user
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
          message: 'You can only create updates for your own campaigns' 
        } 
      }, 403);
    }

    if (!body.title || !body.description || !body.type) {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Missing required fields: title, description, type' 
        } 
      }, 400);
    }

    const now = new Date();
    const campaignUpdate: Partial<CampaignUpdate> = {
      campaign_id: campaign._id!.toString(),
      title: body.title,
      description: body.description,
      type: body.type,
      image_url: body.imageUrl || null,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection('campaign_updates').insertOne(campaignUpdate);

    return c.json({
      id: result.insertedId.toString(),
      campaignId: campaignUpdate.campaign_id,
      title: campaignUpdate.title,
      description: campaignUpdate.description,
      type: campaignUpdate.type,
      imageUrl: campaignUpdate.image_url,
      createdAt: campaignUpdate.created_at!.toISOString(),
      updatedAt: campaignUpdate.updated_at!.toISOString(),
    }, 201);

  } catch (error) {
    console.error('Error creating campaign update:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to create campaign update' 
      } 
    }, 500);
  }
});

// Get campaign edit history (must come before /:id route)
app.get('/:id/edit-history', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDB();
    
    // Verify campaign exists
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

    const campaignId = campaign._id!.toString();
    const history = await db.collection<CampaignEditHistory>('campaign_edit_history')
      .find({ campaign_id: campaignId })
      .sort({ edited_at: -1 })
      .toArray();
    
    // Get user info for each edit
    const userIds = [...new Set(history.map(h => h.edited_by))];
    const users = await db.collection('users').find({ 
      _id: { $in: userIds.map(id => new ObjectId(id)) } 
    }).toArray();
    
    const userMap = Object.fromEntries(
      users.map(u => [u._id!.toString(), u.name])
    );

    const formattedHistory = history.map((edit) => ({
      id: edit._id!.toString(),
      campaignId: edit.campaign_id,
      editedBy: {
        id: edit.edited_by,
        name: userMap[edit.edited_by] || 'Unknown User',
      },
      changes: edit.changes,
      editedAt: edit.edited_at.toISOString(),
    }));

    return c.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching campaign edit history:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch campaign edit history' 
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
      userId: campaign.user_id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      additionalImages: campaign.additional_images || [],
      createdAt: campaign.created_at.toISOString(),
      updatedAt: campaign.updated_at.toISOString(),
      isHidden: campaign.is_hidden || false,
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
      response.targetBloodUnits = campaign.target_blood_units || 0;
      response.currentBloodUnits = campaign.current_blood_units || 0;
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

// Update campaign progress (protected - owner only)
app.patch('/:id/progress', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const db = getDB();
    
    // First, check if campaign exists and belongs to user
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
          message: 'You can only update your own campaigns' 
        } 
      }, 403);
    }

    const updateData: any = { updated_at: new Date() };

    // Handle fundraising campaign updates
    if (campaign.type === 'fundraising') {
      if (body.currentAmount !== undefined) {
        if (typeof body.currentAmount !== 'number' || body.currentAmount < 0) {
          return c.json({ 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: 'Invalid currentAmount provided' 
            } 
          }, 400);
        }
        updateData.current_amount = body.currentAmount;
      }
    }

    // Handle blood donation campaign updates
    if (campaign.type === 'blood-donation') {
      if (body.currentBloodUnits !== undefined) {
        if (typeof body.currentBloodUnits !== 'number' || body.currentBloodUnits < 0) {
          return c.json({ 
            error: { 
              code: 'VALIDATION_ERROR', 
              message: 'Invalid currentBloodUnits provided' 
            } 
          }, 400);
        }
        updateData.current_blood_units = body.currentBloodUnits;
      }
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }

    const response: any = {
      id: result._id!.toString(),
      title: result.title,
      description: result.description,
      type: result.type,
      mainImage: result.main_image_url,
      additionalImages: result.additional_images || [],
      createdAt: result.created_at.toISOString(),
      updatedAt: result.updated_at.toISOString(),
    };

    if (result.type === 'fundraising') {
      response.targetAmount = result.target_amount || 0;
      response.currentAmount = result.current_amount || 0;
    } else {
      response.targetBloodUnits = result.target_blood_units || 0;
      response.currentBloodUnits = result.current_blood_units || 0;
    }

    return c.json(response);

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

    // Track changes for edit history
    const changes: { field: string; old_value: any; new_value: any }[] = [];

    const updateData: any = {
      updated_at: new Date(),
    };

    // Track title changes
    if (body.title !== campaign.title) {
      changes.push({ field: 'title', old_value: campaign.title, new_value: body.title });
      updateData.title = body.title;
    }

    // Track description changes
    if (body.description !== campaign.description) {
      changes.push({ field: 'description', old_value: campaign.description, new_value: body.description });
      updateData.description = body.description;
    }

    // Track image changes
    if (body.mainImage !== campaign.main_image_url) {
      changes.push({ field: 'main_image', old_value: campaign.main_image_url, new_value: body.mainImage });
      updateData.main_image_url = body.mainImage || null;
    }

    const oldImages = JSON.stringify(campaign.additional_images || []);
    const newImages = JSON.stringify(body.additionalImages || []);
    if (oldImages !== newImages) {
      changes.push({ field: 'additional_images', old_value: campaign.additional_images, new_value: body.additionalImages });
      updateData.additional_images = body.additionalImages || [];
    }

    if (body.type === 'fundraising') {
      if (body.targetAmount !== campaign.target_amount) {
        changes.push({ field: 'target_amount', old_value: campaign.target_amount, new_value: body.targetAmount });
        updateData.target_amount = body.targetAmount;
      }
    } else {
      if (body.hospitalInfo?.name !== campaign.hospital_name) {
        changes.push({ field: 'hospital_name', old_value: campaign.hospital_name, new_value: body.hospitalInfo?.name });
        updateData.hospital_name = body.hospitalInfo?.name;
      }
      if (body.hospitalInfo?.address !== campaign.hospital_address) {
        changes.push({ field: 'hospital_address', old_value: campaign.hospital_address, new_value: body.hospitalInfo?.address });
        updateData.hospital_address = body.hospitalInfo?.address;
      }
      if (body.hospitalInfo?.contactNumber !== campaign.hospital_contact) {
        changes.push({ field: 'hospital_contact', old_value: campaign.hospital_contact, new_value: body.hospitalInfo?.contactNumber });
        updateData.hospital_contact = body.hospitalInfo?.contactNumber;
      }
      if (body.hospitalInfo?.email !== campaign.hospital_email) {
        changes.push({ field: 'hospital_email', old_value: campaign.hospital_email, new_value: body.hospitalInfo?.email });
        updateData.hospital_email = body.hospitalInfo?.email;
      }
      if (body.bloodType !== campaign.blood_type) {
        changes.push({ field: 'blood_type', old_value: campaign.blood_type, new_value: body.bloodType });
        updateData.blood_type = body.bloodType;
      }
      if (body.urgencyLevel !== campaign.urgency_level) {
        changes.push({ field: 'urgency_level', old_value: campaign.urgency_level, new_value: body.urgencyLevel });
        updateData.urgency_level = body.urgencyLevel || 'medium';
      }
      if (body.targetBloodUnits !== campaign.target_blood_units) {
        changes.push({ field: 'target_blood_units', old_value: campaign.target_blood_units, new_value: body.targetBloodUnits });
        updateData.target_blood_units = body.targetBloodUnits || 0;
      }
    }

    // Only update if there are changes
    if (changes.length > 0) {
      const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
      const result = await db.collection<Campaign>('campaigns').findOneAndUpdate(
        filter,
        { $set: updateData },
        { returnDocument: 'after' }
      );

      // Save edit history
      const editHistory: Partial<CampaignEditHistory> = {
        campaign_id: campaign._id!.toString(),
        edited_by: user.id,
        changes,
        edited_at: new Date(),
      };
      await db.collection('campaign_edit_history').insertOne(editHistory);

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
    } else {
      // No changes, return current campaign
      return c.json({
        id: campaign._id!.toString(),
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        mainImage: campaign.main_image_url,
        additionalImages: campaign.additional_images || [],
        createdAt: campaign.created_at.toISOString(),
        updatedAt: campaign.updated_at.toISOString(),
        targetAmount: campaign.target_amount,
        currentAmount: campaign.current_amount,
        hospitalInfo: body.type === 'blood-donation' ? body.hospitalInfo : undefined,
        bloodType: campaign.blood_type,
        urgencyLevel: campaign.urgency_level,
      });
    }

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

// Get campaign edit history (public)
app.get('/:id/edit-history', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDB();
    
    // Check if campaign exists
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

    // Get edit history
    const history = await db.collection<CampaignEditHistory>('campaign_edit_history')
      .find({ campaign_id: campaign._id!.toString() })
      .sort({ edited_at: -1 })
      .toArray();

    // Get user info for each edit
    const userIds = [...new Set(history.map(h => h.edited_by))];
    const users = await db.collection('users')
      .find({ id: { $in: userIds } })
      .toArray();
    
    const userMap = Object.fromEntries(
      users.map(u => [u.id, { id: u.id, name: u.name, email: u.email }])
    );

    const formattedHistory = history.map(h => ({
      id: h._id!.toString(),
      campaignId: h.campaign_id,
      editedBy: userMap[h.edited_by] || { id: h.edited_by, name: 'Unknown User', email: '' },
      changes: h.changes,
      editedAt: h.edited_at.toISOString(),
    }));

    return c.json(formattedHistory);

  } catch (error) {
    console.error('Error fetching edit history:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to fetch edit history' 
      } 
    }, 500);
  }
});

export default app;
