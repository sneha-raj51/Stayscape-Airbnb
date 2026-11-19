const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Booking must be associated with a listing'],
      index: true
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a guest'],
      index: true
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be associated with a host'],
      index: true
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required']
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function (value) {
          return this.checkIn ? value > this.checkIn : true;
        },
        message: 'Check-out date must be after check-in date'
      }
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1']
    },
    totalNights: {
      type: Number,
      required: [true, 'Total nights count is required'],
      min: [1, 'Total nights must be at least 1']
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price per night cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid booking status'
      },
      default: 'confirmed',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: '{VALUE} is not a valid payment status'
      },
      default: 'unpaid'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to optimize booking availability and overlap checks
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, createdAt: -1 });
bookingSchema.index({ host: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
