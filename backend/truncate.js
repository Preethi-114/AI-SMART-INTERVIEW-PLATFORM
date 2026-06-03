// truncate.js
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/interview-platform";

const truncateDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n📊 Found collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Ask for confirmation (if running in interactive mode)
    console.log('\n⚠️  This will DELETE ALL DATA from all collections!');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete all documents from each collection
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}: ${result.deletedCount} documents removed`);
    }

    console.log('\n🎉 All collections truncated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the truncate function
truncateDatabase();