import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'campaign_platform';

let client: MongoClient | null = null;
let db: Db | null = null;
let connecting: Promise<Db> | null = null;

export async function connectDB(): Promise<Db> {
  // If already connected, return the db
  if (db && client) {
    return db;
  }

  // If connection is in progress, wait for it
  if (connecting) {
    return connecting;
  }

  // Start new connection
  connecting = (async () => {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
      
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      
      db = client.db(DB_NAME);
      console.log(`✅ Connected to MongoDB database: ${DB_NAME}`);
      
      connecting = null;
      return db;
    } catch (error) {
      connecting = null;
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  })();

  return connecting;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

export * from './schema.js';
