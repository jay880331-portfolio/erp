import mongoose from 'mongoose';

export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-system',
  options: {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 10000,
  },
};

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};