import { connectDB, closeDB } from './index.js';

async function migrate() {
  try {
    console.log('🔄 Running MongoDB setup...');
    const db = await connectDB();
    
    // Create collections with validation
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Users collection
    if (!collectionNames.includes('users')) {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'name', 'password_hash'],
            properties: {
              email: { bsonType: 'string' },
              name: { bsonType: 'string' },
              password_hash: { bsonType: 'string' },
              created_at: { bsonType: 'date' },
              updated_at: { bsonType: 'date' }
            }
          }
        }
      });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created users collection');
    }
    
    // Sessions collection
    if (!collectionNames.includes('sessions')) {
      await db.createCollection('sessions');
      await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
      await db.collection('sessions').createIndex({ user_id: 1 });
      await db.collection('sessions').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
      console.log('✅ Created sessions collection');
    }
    
    // Campaigns collection
    if (!collectionNames.includes('campaigns')) {
      await db.createCollection('campaigns', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['user_id', 'title', 'description', 'type'],
            properties: {
              user_id: { bsonType: 'string' },
              title: { bsonType: 'string' },
              description: { bsonType: 'string' },
              type: { enum: ['fundraising', 'blood-donation'] },
              view_count: { bsonType: ['int', 'double'] },
              is_hidden: { bsonType: 'bool' },
              target_amount: { bsonType: ['int', 'double', 'null'] },
              current_amount: { bsonType: ['int', 'double', 'null'] },
              urgency_level: { enum: ['low', 'medium', 'high', null] }
            }
          }
        }
      });
      await db.collection('campaigns').createIndex({ user_id: 1 });
      await db.collection('campaigns').createIndex({ type: 1 });
      await db.collection('campaigns').createIndex({ created_at: -1 });
      await db.collection('campaigns').createIndex({ view_count: -1 });
      console.log('✅ Created campaigns collection');
    } else {
      // Update validator for existing collection
      try {
        await db.command({
          collMod: 'campaigns',
          validator: {
            $jsonSchema: {
              bsonType: 'object',
              required: ['user_id', 'title', 'description', 'type'],
              properties: {
                user_id: { bsonType: 'string' },
                title: { bsonType: 'string' },
                description: { bsonType: 'string' },
                type: { enum: ['fundraising', 'blood-donation'] },
                view_count: { bsonType: ['int', 'double'] },
                is_hidden: { bsonType: 'bool' },
                target_amount: { bsonType: ['int', 'double', 'null'] },
                current_amount: { bsonType: ['int', 'double', 'null'] },
                urgency_level: { enum: ['low', 'medium', 'high', null] }
              }
            }
          }
        });
        console.log('✅ Updated campaigns collection validator');
      } catch (error) {
        console.log('⚠️ Could not update validator (collection may have existing data)');
      }
    }
    
    // Payment details collection
    if (!collectionNames.includes('payment_details')) {
      await db.createCollection('payment_details');
      await db.collection('payment_details').createIndex({ campaign_id: 1 });
      console.log('✅ Created payment_details collection');
    }
    
    console.log('✅ MongoDB setup completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closeDB();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(console.error);
}

export { migrate };
