import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { pool } from './db/index.js';
import campaignsRouter from './routes/campaigns.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = new Hono();

// CORS middleware
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use('*', cors({
  origin: corsOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', async (c) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT 1');
    return c.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// API routes
app.route('/api/auth', authRouter);
app.route('/api/campaigns', campaignsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: { 
      code: 'NOT_FOUND', 
      message: 'Endpoint not found' 
    } 
  }, 404);
});

// Error handler
app.onError((err: Error, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    error: { 
      code: 'INTERNAL_ERROR', 
      message: 'Internal server error' 
    } 
  }, 500);
});

const port = parseInt(process.env.PORT || '3001');

// Auto-setup database on first run
async function setupDatabase() {
  try {
    // Check if campaigns table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('🔄 Setting up database for first time...');
      const { migrate } = await import('./db/migrate.js');
      await migrate();
      
      // Only seed if no campaigns exist
      const campaignCount = await pool.query('SELECT COUNT(*) FROM campaigns');
      if (parseInt(campaignCount.rows[0].count) === 0) {
        console.log('🌱 Adding sample data...');
        // Import and run seed function here if needed
      }
    }
  } catch (error) {
    console.log('⚠️ Database setup skipped:', error instanceof Error ? error.message : 'Unknown error');
  }
}

console.log(`🚀 Server starting on http://localhost:${port}`);

// Setup database then start server
setupDatabase().then(() => {
  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`✅ Server running on http://localhost:${port}`);
}).catch(console.error);