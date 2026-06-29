import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  booking:    Types.ObjectId;
  customer:   Types.ObjectId;
  technician: Types.ObjectId; // TechnicianProfile _id
  rating:     number;
  comment:    string;
  createdAt:  Date;
  updatedAt:  Date;
}

const reviewSchema = new Schema<IReview>(
  {
    booking: {
      type:     Schema.Types.ObjectId,
      ref:      'Booking',
      required: true,
      unique:   true, // one review per booking
    },
    customer: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    technician: {
      type:     Schema.Types.ObjectId,
      ref:      'TechnicianProfile',
      required: true,
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    comment: {
      type:      String,
      trim:      true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default:   '',
    },
  },
  { timestamps: true }
);

// After saving a review, recalculate the technician's average rating
reviewSchema.post('save', async function () {
  try {
    const TechnicianProfile = mongoose.model('TechnicianProfile');
    const reviews = await mongoose.model('Review').find({ technician: this.technician });
    const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
    await TechnicianProfile.findByIdAndUpdate(this.technician, {
      rating:      Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    });
  } catch (err) {
    console.error('[Review] Failed to update technician rating:', err);
  }
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
