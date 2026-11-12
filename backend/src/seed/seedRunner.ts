import dotenv from 'dotenv';
dotenv.config();

import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Seed runner completed successfully.');
  } catch (error) {
    console.error('Seed runner failed:', error);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

run();
