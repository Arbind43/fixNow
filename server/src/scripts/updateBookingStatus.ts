import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Booking } from '../models/Booking';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixnow';

const updateAllPendingBookings = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Update ALL pending bookings to accepted so Track Live button shows
    const result = await Booking.updateMany(
      { status: 'pending', paymentStatus: 'completed' },
      { status: 'accepted' }
    );
    console.log(`✅ Updated ${result.modifiedCount} paid-but-pending bookings → ACCEPTED`);

    // Also specifically update any booking that was paid (regardless of old status)
    const result2 = await Booking.updateMany(
      { paymentStatus: 'completed', status: { $nin: ['completed', 'cancelled', 'accepted', 'in_progress'] } },
      { status: 'accepted' }
    );
    console.log(`✅ Updated ${result2.modifiedCount} more paid bookings → ACCEPTED`);

    // List all bookings now 
    const bookings = await Booking.find({}).select('status paymentStatus totalAmount');
    console.log('\nAll bookings:');
    bookings.forEach((b, i) => {
      console.log(`  ${i+1}. Status: ${b.status} | Payment: ${b.paymentStatus} | Amount: ₹${b.totalAmount}`);
    });

    console.log('\n🎉 Done! Refresh "My Bookings" to see the Track Live button on paid bookings!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateAllPendingBookings();
