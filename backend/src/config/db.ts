import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/securax';

  try {
    console.log(`[SecuraX DB] Attempting connection to MongoDB: ${uri}`);
    mongoose.set('strictQuery', false);

    // Try connecting with a short 3-second server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[SecuraX DB] Connected successfully to external MongoDB instance.`);
  } catch (error) {
    console.warn(`[SecuraX DB] External MongoDB connection failed. Initializing In-Memory MongoDB server for instant zero-config demonstration...`);
    try {
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'securax'
        }
      });
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[SecuraX DB] In-Memory MongoDB running at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error(`[SecuraX DB] Fatal: Failed to initialize in-memory MongoDB:`, memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error closing DB:', err);
  }
};
