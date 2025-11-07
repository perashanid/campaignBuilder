import { connectDB, closeDB } from './index.js';
import { seed } from './seed.js';

async function reset() {
  try {
    console.log('🔄 Resetting database...');
    const db = await connectDB();

    // Drop all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`🗑️  Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }

    console.log('✅ All collections dropped');
    await closeDB();

    // Run migration and seed
    console.log('\n🔄 Running migration...');
    const { migrate } = await import('./migrate.js');
    await migrate();

    console.log('\n🌱 Running seed...');
    await seed();

    console.log('\n✅ Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  }
}

// Run reset if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  reset().catch(console.error);
}

export { reset };
