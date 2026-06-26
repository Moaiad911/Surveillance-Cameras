const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/graduation_project';
    
    if (!uri.includes('/graduation_project')) {
      uri = uri + '/graduation_project';
    }
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB -', mongoose.connection.db.databaseName);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
