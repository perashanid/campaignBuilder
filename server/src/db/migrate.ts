import { pool } from './index.js';

const createTables = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('fundraising', 'blood-donation')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) DEFAULT 0,
  hospital_name VARCHAR(255),
  hospital_address TEXT,
  hospital_contact VARCHAR(50),
  hospital_email VARCHAR(255),
  blood_type VARCHAR(10),
  urgency_level VARCHAR(20) CHECK (urgency_level IN ('low', 'medium', 'high')),
  main_image_url TEXT,
  additional_images JSONB DEFAULT '[]'::jsonb
);

-- Add view_count column if it doesn't exist (for existing databases)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create payment_details table
CREATE TABLE IF NOT EXISTS payment_details (
  id VARCHAR(255) PRIMARY KEY,
  campaign_id VARCHAR(255) REFERENCES campaigns(id) ON DELETE CASCADE,
  mobile_banking VARCHAR(50),
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(255),
  account_holder VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_view_count ON campaigns(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_payment_details_campaign_id ON payment_details(campaign_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  let client;
  
  try {
    console.log('🔄 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected to database');
    
    console.log('🔄 Running database migrations...');
    await client.query(createTables);
    console.log('✅ Database migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    // Only end the pool if this is run as a standalone script
    if (import.meta.url === `file://${process.argv[1]}`) {
      await pool.end();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error);
}

export { migrate };