const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a listing title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a listing description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please provide an address'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true,
        index: true
      },
      state: {
        type: String,
        required: [true, 'Please provide a state/province'],
        trim: true
      },
      country: {
        type: String,
        required: [true, 'Please provide a country'],
        trim: true
      },
      latitude: {
        type: Number,
        default: null
      },
      longitude: {
        type: Number,
        default: null
      }
    },
    propertyType: {
      type: String,
      required: [true, 'Please specify the property type'],
      enum: {
        values: [
          'apartment',
          'house',
          'villa',
          'condo',
          'cabin',
          'cottage',
          'studio',
          'loft',
          'chalet',
          'other'
        ],
        message: '{VALUE} is not a valid property type'
      },
      index: true
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide the price per night'],
      min: [0, 'Price per night cannot be negative'],
      index: true
    },
    maxGuests: {
      type: Number,
      required: [true, 'Please provide the maximum number of guests'],
      min: [1, 'Maximum guests must be at least 1'],
      index: true
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please provide the number of bedrooms'],
      min: [0, 'Bedrooms cannot be negative'],
      default: 1
    },
    beds: {
      type: Number,
      required: [true, 'Please provide the number of beds'],
      min: [1, 'Must have at least 1 bed'],
      default: 1
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please provide the number of bathrooms'],
      min: [0, 'Bathrooms cannot be negative'],
      default: 1
    },
    amenities: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A listing must have at least one image'
      }
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Listing must belong to a host'],
      index: true
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10,
      index: true
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for reviews
listingSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'listing'
});

// Compound and text indexes for search performance
listingSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.country': 'text'
});
listingSchema.index({ 'location.city': 1, pricePerNight: 1, maxGuests: 1 });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
