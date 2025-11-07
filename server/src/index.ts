import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './db/index.js';
import campaignsRouter from './routes/campaigns.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = new Hono();

// CORS middleware
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use('*', cors({
  origin: corsOrigins,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to ensure DB is connected
app.use('*', async (c, next) => {
  try {
    await connectDB();
    await next();
  } catch (error) {
    console.error('Database connection error:', error);
    return c.json({ 
      error: { 
        code: 'DATABASE_ERROR', 
        message: 'Database connection failed' 
      } 
    }, 500);
  }
});

// Health check
app.get('/health', async (c) => {
  try {
    const db = await connectDB();
    await db.admin().ping();
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

// Setup database and start server
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('🔄 Running database migrations...');
    const { migrate } = await import('./db/migrate.js');
    await migrate();
    
    console.log(`🚀 Starting server on http://localhost:${port}`);
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`✅ Server running on http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔌 Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

startServer();
