// Script to delete listings older than 45 days
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from './models/listing.model.js';

dotenv.config();

async function deleteOldListings() {
  await mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  const result = await Listing.deleteMany({ createdAt: { $lt: cutoff } });
  console.log(`Deleted ${result.deletedCount} listings older than 45 days.`);
  await mongoose.disconnect();
}

deleteOldListings().catch(console.error);
