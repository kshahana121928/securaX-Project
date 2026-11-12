import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securax';

  try {
    console.log(`[SecuraX DB] Attempting connection to MongoDB: ${uri}`);
    mongoose.set('strictQuery', false);

    // Try connecting with a short 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    
    console.log('[SecuraX DB] Connected successfully to external MongoDB instance.');
  } catch (error) {
    console.error('[SecuraX DB] Connection failed:', error);
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[SecuraX DB] Disconnected successfully.');
  } catch (error) {
    console.error('[SecuraX DB] Disconnection failed:', error);
  }
};
