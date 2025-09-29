import { Hono } from 'hono';
import { pool } from '../db/index.js';
import { User } from '../db/schema.js';
import { authenticateUser } from './auth.js';
import { Variables } from '../types/hono.js';

// Simple ID generator (no external dependency needed)
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

// Generate unique slug with collision handling
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = createSlugFromTitle(title);
  
  // Check if base slug exists
  const existingResult = await pool.query('SELECT id FROM campaigns WHERE id = $1', [baseSlug]);
  
  if (existingResult.rows.length === 0) {
    return baseSlug;
  }
  
  // Handle collisions by adding a number suffix
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (true) {
    const result = await pool.query('SELECT id FROM campaigns WHERE id = $1', [uniqueSlug]);
    if (result.rows.length === 0) {
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
    
    const result = await pool.query(`
      SELECT 
        id, title, description, type, main_image_url, created_at, is_hidden,
        target_amount, current_amount, hospital_name, hospital_address, urgency_level,
        view_count
      FROM campaigns 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);
    
    const formattedCampaigns = result.rows.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      isHidden: campaign.is_hidden || false,
      targetAmount: campaign.target_amount ? parseFloat(campaign.target_amount) : undefined,
      currentAmount: campaign.current_amount ? parseFloat(campaign.current_amount) : undefined,
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
  const client = await pool.connect();
  
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.type) {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Missing required fields: title, description, type' 
        } 
      }, 400);
    }

    const campaignId = await generateUniqueSlug(body.title);
    
    await client.query('BEGIN');

    const user = c.get('user');

    // Insert campaign
    const campaignResult = await client.query(`
      INSERT INTO campaigns (
        id, user_id, title, description, type, target_amount, current_amount,
        hospital_name, hospital_address, hospital_contact, hospital_email,
        blood_type, urgency_level, main_image_url, additional_images, is_hidden
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      campaignId,
      user.id,
      body.title,
      body.description,
      body.type,
      body.type === 'fundraising' ? body.targetAmount : null,
      body.type === 'fundraising' ? 0 : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.name : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.address : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.contactNumber : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.email : null,
      body.type === 'blood-donation' ? body.bloodType : null,
      body.type === 'blood-donation' ? (body.urgencyLevel || 'medium') : null,
      body.mainImage || null,
      JSON.stringify(body.additionalImages || []),
      false
    ]);

    // Insert payment details if fundraising
    let paymentInfo = null;
    if (body.type === 'fundraising' && body.paymentDetails) {
      const paymentId = createId();
      await client.query(`
        INSERT INTO payment_details (
          id, campaign_id, mobile_banking, bank_account_number, bank_name, account_holder
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        paymentId,
        campaignId,
        body.paymentDetails.mobileBanking,
        body.paymentDetails.bankAccount?.accountNumber,
        body.paymentDetails.bankAccount?.bankName,
        body.paymentDetails.bankAccount?.accountHolder
      ]);
      
      paymentInfo = body.paymentDetails;
    }

    await client.query('COMMIT');

    // Generate shareable URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/campaign/${campaignId}`;

    const campaign = campaignResult.rows[0];
    
    return c.json({
      id: campaignId,
      shareUrl,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        type: campaign.type,
        mainImage: campaign.main_image_url,
        additionalImages: campaign.additional_images,
        createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
        updatedAt: campaign.updated_at ? new Date(campaign.updated_at).toISOString() : new Date().toISOString(),
        targetAmount: campaign.target_amount,
        currentAmount: campaign.current_amount,
        paymentDetails: paymentInfo,
        hospitalInfo: body.type === 'blood-donation' ? body.hospitalInfo : undefined,
        bloodType: campaign.blood_type,
        urgencyLevel: campaign.urgency_level,
      }
    }, 201);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating campaign:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to create campaign' 
      } 
    }, 500);
  } finally {
    client.release();
  }
});

// Get campaign by ID
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get campaign with payment details in a single query
    const campaignResult = await pool.query(`
      SELECT 
        c.*,
        pd.mobile_banking,
        pd.bank_account_number,
        pd.bank_name,
        pd.account_holder
      FROM campaigns c
      LEFT JOIN payment_details pd ON c.id = pd.campaign_id
      WHERE c.id = $1
    `, [id]);

    if (campaignResult.rows.length === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }

    const campaign = campaignResult.rows[0];

    // Format payment details if available
    let paymentInfo = null;
    if (campaign.type === 'fundraising' && campaign.mobile_banking) {
      paymentInfo = {
        mobileBanking: campaign.mobile_banking,
        bankAccount: {
          accountNumber: campaign.bank_account_number,
          bankName: campaign.bank_name,
          accountHolder: campaign.account_holder,
        }
      };
    }

    // Format response to match frontend expectations
    const response: any = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      additionalImages: campaign.additional_images || [],
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      updatedAt: campaign.updated_at ? new Date(campaign.updated_at).toISOString() : new Date().toISOString(),
    };

    if (campaign.type === 'fundraising') {
      response.targetAmount = parseFloat(campaign.target_amount) || 0;
      response.currentAmount = parseFloat(campaign.current_amount) || 0;
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
    const result = await pool.query(`
      SELECT 
        id, title, description, type, main_image_url, created_at,
        target_amount, current_amount, hospital_name, hospital_address, urgency_level,
        view_count, is_hidden
      FROM campaigns 
      WHERE is_hidden = FALSE OR is_hidden IS NULL
      ORDER BY created_at DESC
    `);
    
    const formattedCampaigns = result.rows.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      targetAmount: campaign.target_amount ? parseFloat(campaign.target_amount) : undefined,
      currentAmount: campaign.current_amount ? parseFloat(campaign.current_amount) : undefined,
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
    
    const result = await pool.query(`
      UPDATE campaigns 
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = $1
      RETURNING view_count
    `, [id]);

    if (result.rows.length === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }

    return c.json({
      success: true,
      viewCount: result.rows[0].view_count
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

// Get most visited campaigns
app.get('/most-visited', async (c) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, title, description, type, main_image_url, created_at, view_count,
        target_amount, current_amount, hospital_name, hospital_address, urgency_level
      FROM campaigns 
      WHERE is_hidden = FALSE OR is_hidden IS NULL
      ORDER BY COALESCE(view_count, 0) DESC, created_at DESC
      LIMIT 6
    `);
    
    const formattedCampaigns = result.rows.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      viewCount: campaign.view_count || 0,
      targetAmount: campaign.target_amount ? parseFloat(campaign.target_amount) : undefined,
      currentAmount: campaign.current_amount ? parseFloat(campaign.current_amount) : undefined,
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

// Update campaign progress (for fundraising campaigns)
app.patch('/:id/progress', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!body.currentAmount || typeof body.currentAmount !== 'number') {
      return c.json({ 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Invalid currentAmount provided' 
        } 
      }, 400);
    }

    const result = await pool.query(`
      UPDATE campaigns 
      SET current_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND type = 'fundraising'
      RETURNING *
    `, [body.currentAmount, id]);

    if (result.rows.length === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Fundraising campaign not found' 
        } 
      }, 404);
    }

    const campaign = result.rows[0];
    
    return c.json({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      additionalImages: campaign.additional_images || [],
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      updatedAt: campaign.updated_at ? new Date(campaign.updated_at).toISOString() : new Date().toISOString(),
      targetAmount: parseFloat(campaign.target_amount) || 0,
      currentAmount: parseFloat(campaign.current_amount) || 0,
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
  const client = await pool.connect();
  
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    
    // Check if campaign belongs to user
    const ownershipCheck = await client.query(
      'SELECT user_id FROM campaigns WHERE id = $1',
      [id]
    );
    
    if (ownershipCheck.rows.length === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found' 
        } 
      }, 404);
    }
    
    if (ownershipCheck.rows[0].user_id !== user.id) {
      return c.json({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'You can only edit your own campaigns' 
        } 
      }, 403);
    }

    await client.query('BEGIN');

    // Update campaign
    const campaignResult = await client.query(`
      UPDATE campaigns SET
        title = $1, description = $2, target_amount = $3,
        hospital_name = $4, hospital_address = $5, hospital_contact = $6, hospital_email = $7,
        blood_type = $8, urgency_level = $9, main_image_url = $10, additional_images = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `, [
      body.title,
      body.description,
      body.type === 'fundraising' ? body.targetAmount : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.name : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.address : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.contactNumber : null,
      body.type === 'blood-donation' ? body.hospitalInfo?.email : null,
      body.type === 'blood-donation' ? body.bloodType : null,
      body.type === 'blood-donation' ? (body.urgencyLevel || 'medium') : null,
      body.mainImage || null,
      JSON.stringify(body.additionalImages || []),
      id,
      user.id
    ]);

    // Update payment details if fundraising
    if (body.type === 'fundraising' && body.paymentDetails) {
      await client.query(`
        UPDATE payment_details SET
          mobile_banking = $1, bank_account_number = $2, bank_name = $3, account_holder = $4
        WHERE campaign_id = $5
      `, [
        body.paymentDetails.mobileBanking,
        body.paymentDetails.bankAccount?.accountNumber,
        body.paymentDetails.bankAccount?.bankName,
        body.paymentDetails.bankAccount?.accountHolder,
        id
      ]);
    }

    await client.query('COMMIT');

    const campaign = campaignResult.rows[0];
    
    return c.json({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      type: campaign.type,
      mainImage: campaign.main_image_url,
      additionalImages: campaign.additional_images || [],
      createdAt: campaign.created_at ? new Date(campaign.created_at).toISOString() : new Date().toISOString(),
      updatedAt: campaign.updated_at ? new Date(campaign.updated_at).toISOString() : new Date().toISOString(),
      targetAmount: campaign.target_amount ? parseFloat(campaign.target_amount) : undefined,
      currentAmount: campaign.current_amount ? parseFloat(campaign.current_amount) : undefined,
      hospitalInfo: body.type === 'blood-donation' ? body.hospitalInfo : undefined,
      bloodType: campaign.blood_type,
      urgencyLevel: campaign.urgency_level,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating campaign:', error);
    return c.json({ 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: 'Failed to update campaign' 
      } 
    }, 500);
  } finally {
    client.release();
  }
});

// Delete campaign (protected)
app.delete('/:id', authenticateUser, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    
    const result = await pool.query(`
      DELETE FROM campaigns 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, user.id]);

    if (result.rows.length === 0) {
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
    
    const result = await pool.query(`
      UPDATE campaigns 
      SET is_hidden = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [body.isHidden, id, user.id]);

    if (result.rows.length === 0) {
      return c.json({ 
        error: { 
          code: 'NOT_FOUND', 
          message: 'Campaign not found or access denied' 
        } 
      }, 404);
    }

    const campaign = result.rows[0];
    
    return c.json({
      id: campaign.id,
      title: campaign.title,
      isHidden: campaign.is_hidden,
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

// Get platform statistics
app.get('/stats/platform', async (c) => {
  try {
    // Get campaign statistics
    const campaignStats = await pool.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(CASE WHEN type = 'fundraising' THEN 1 END) as fundraising_campaigns,
        COUNT(CASE WHEN type = 'blood-donation' THEN 1 END) as blood_donation_campaigns,
        COUNT(CASE WHEN is_hidden = FALSE OR is_hidden IS NULL THEN 1 END) as active_campaigns,
        COALESCE(SUM(view_count), 0) as total_views,
        COALESCE(SUM(CASE WHEN type = 'fundraising' THEN current_amount ELSE 0 END), 0) as total_funds_raised,
        COALESCE(AVG(CASE WHEN type = 'fundraising' AND target_amount > 0 THEN (current_amount / target_amount) * 100 END), 0) as avg_funding_progress
      FROM campaigns
    `);

    // Get user statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30_days,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7_days
      FROM users
    `);

    // Get campaigns completed (reached 100% funding)
    const completedCampaigns = await pool.query(`
      SELECT COUNT(*) as completed_campaigns
      FROM campaigns 
      WHERE type = 'fundraising' 
        AND target_amount > 0 
        AND current_amount >= target_amount
    `);

    // Get recent activity stats
    const recentActivity = await pool.query(`
      SELECT 
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as campaigns_this_week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as campaigns_this_month
      FROM campaigns
    `);

    const stats = campaignStats.rows[0];
    const users = userStats.rows[0];
    const completed = completedCampaigns.rows[0];
    const activity = recentActivity.rows[0];

    return c.json({
      campaigns: {
        total: parseInt(stats.total_campaigns),
        fundraising: parseInt(stats.fundraising_campaigns),
        bloodDonation: parseInt(stats.blood_donation_campaigns),
        active: parseInt(stats.active_campaigns),
        completed: parseInt(completed.completed_campaigns),
        thisWeek: parseInt(activity.campaigns_this_week),
        thisMonth: parseInt(activity.campaigns_this_month),
      },
      users: {
        total: parseInt(users.total_users),
        newThisWeek: parseInt(users.new_users_7_days),
        newThisMonth: parseInt(users.new_users_30_days),
      },
      engagement: {
        totalViews: parseInt(stats.total_views),
        totalFundsRaised: parseFloat(stats.total_funds_raised) || 0,
        averageFundingProgress: parseFloat(stats.avg_funding_progress) || 0,
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

export default app;