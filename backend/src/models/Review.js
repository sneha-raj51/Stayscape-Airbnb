const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Review must be associated with a listing'],
      index: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be associated with a guest'],
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be associated with a completed booking'],
      unique: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate review per booking
reviewSchema.index({ listing: 1, createdAt: -1 });

// Static method to recalculate average rating and total reviews for a listing
reviewSchema.statics.calculateAverageRating = async function (listingId) {
  const stats = await this.aggregate([
    {
      $match: { listing: new mongoose.Types.ObjectId(listingId) }
    },
    {
      $group: {
        _id: '$listing',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Listing').findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await mongoose.model('Listing').findByIdAndUpdate(listingId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

// Call calculateAverageRating after saving review
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.listing);
});

// Call calculateAverageRating after deleting review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.listing);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
