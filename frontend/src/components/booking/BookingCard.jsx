import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import {
  FiStar,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiClock,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const BookingCard = ({ listing, onBookingSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [payNow, setPayNow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Availability calendar state
  const [bookedIntervals, setBookedIntervals] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  // Fetch booked date intervals from backend availability API
  const fetchAvailability = async () => {
    if (!listing?._id) return;
    setAvailabilityLoading(true);
    try {
      const response = await bookingService.getListingAvailability(listing._id);
      if (response.success && response.data?.bookedRanges) {
        const intervals = response.data.bookedRanges.map((range) => ({
          start: new Date(range.checkIn),
          end: new Date(range.checkOut),
        }));
        setBookedIntervals(intervals);
      }
    } catch (err) {
      console.warn('Could not fetch calendar availability:', err.message);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [listing?._id]);

  // Check if current checkIn / checkOut selection overlaps with any booked intervals
  useEffect(() => {
    if (!checkIn || !checkOut || bookedIntervals.length === 0) {
      setHasConflict(false);
      return;
    }

    const overlap = bookedIntervals.some(
      (interval) => checkIn < interval.end && checkOut > interval.start
    );
    setHasConflict(overlap);
  }, [checkIn, checkOut, bookedIntervals]);

  // Calculate nights
  let totalNights = 0;
  if (checkIn && checkOut && checkOut > checkIn) {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const pricePerNight = listing.pricePerNight || 0;
  const stayCost = totalNights * pricePerNight;
  const serviceFee = Math.round(stayCost * 0.12);
  const cleaningFee = Math.round(pricePerNight * 0.25);
  const totalEstimatedPrice = stayCost > 0 ? stayCost + serviceFee + cleaningFee : 0;

  const isHostOfListing =
    isAuthenticated &&
    listing.host &&
    (listing.host._id === user?._id || listing.host === user?._id);

  const handleReserve = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to make a reservation');
      navigate('/login', { state: { from: `/listings/${listing._id}` } });
      return;
    }

    if (isHostOfListing) {
      toast.error('You cannot reserve your own property');
      return;
    }

    if (!checkIn) {
      toast.error('Please select a check-in date');
      return;
    }

    if (!checkOut) {
      toast.error('Please select a check-out date');
      return;
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be strictly after check-in date');
      return;
    }

    if (hasConflict) {
      toast.error('The selected dates conflict with an existing reservation. Please choose different dates.');
      return;
    }

    if (guests > listing.maxGuests) {
      toast.error(`Maximum guest capacity is ${listing.maxGuests}`);
      return;
    }

    setLoading(true);

    try {
      const bookingPayload = {
        listing: listing._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: parseInt(guests, 10),
        payNow,
      };

      const response = await bookingService.createBooking(bookingPayload);

      if (response.success) {
        toast.success(
          payNow
            ? 'Reservation confirmed and simulated payment processed!'
            : 'Reservation confirmed! Payment status is currently unpaid.'
        );
        setConfirmedBooking(response.data.booking);
        // Refresh availability
        fetchAvailability();
        if (onBookingSuccess) {
          onBookingSuccess(response.data.booking);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete reservation. Please try different dates.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedBooking) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-card">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900">You're All Set!</h3>
            <p className="text-sm text-neutral-500 mt-1">
              Your reservation is confirmed. We have sent the details to your account.
            </p>
          </div>
          <div className="w-full bg-neutral-50 p-4 rounded-2xl text-left text-xs space-y-2.5 border border-neutral-100">
            <div className="flex justify-between">
              <span className="text-neutral-500">Dates</span>
              <span className="font-semibold text-neutral-800">
                {new Date(confirmedBooking.checkIn).toLocaleDateString()} -{' '}
                {new Date(confirmedBooking.checkOut).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Duration</span>
              <span className="font-semibold text-neutral-800">
                {confirmedBooking.totalNights} night{confirmedBooking.totalNights > 1 ? 's' : ''} · {confirmedBooking.guests} guest{confirmedBooking.guests > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Price</span>
              <span className="font-bold text-neutral-900">
                ${confirmedBooking.totalPrice?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Payment Status</span>
              <span
                className={`capitalize font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  confirmedBooking.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {confirmedBooking.paymentStatus}
              </span>
            </div>
          </div>
          <div className="flex w-full space-x-3 pt-2">
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              View My Bookings
            </button>
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setCheckIn(null);
                setCheckOut(null);
              }}
              className="px-4 py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Book Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-card sticky top-28">
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-neutral-900">
            ${listing.pricePerNight?.toLocaleString()}
          </span>
          <span className="text-neutral-500 text-sm font-normal">night</span>
        </div>
        <div className="flex items-center space-x-1 text-sm font-semibold text-neutral-800">
          <FiStar className="w-4 h-4 fill-neutral-900 text-neutral-900" />
          <span>
            {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="text-neutral-400 font-normal">·</span>
          <span className="text-neutral-500 underline text-xs font-normal">
            {listing.totalReviews || 0} reviews
          </span>
        </div>
      </div>

      {/* Overlap Conflict Alert */}
      {hasConflict && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>
            These dates are already booked by another guest. Please select different dates on the calendar.
          </span>
        </div>
      )}

      {/* Reservation Form */}
      <form onSubmit={handleReserve} className="space-y-4">
        {/* Date Selector Box */}
        <div className="border border-neutral-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900 transition-all">
          <div className="grid grid-cols-2 divide-x divide-neutral-300 border-b border-neutral-300">
            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                Check-in
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (checkOut && date && date >= checkOut) {
                    const next = new Date(date);
                    next.setDate(next.getDate() + 1);
                    setCheckOut(next);
                  }
                }}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                excludeDateIntervals={bookedIntervals}
                placeholderText="Add date"
                className="w-full bg-transparent text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="p-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
                Check-out
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                excludeDateIntervals={bookedIntervals}
                placeholderText="Add date"
                className="w-full bg-transparent text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Guests dropdown */}
          <div className="p-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="w-full bg-transparent text-xs font-medium text-neutral-800 focus:outline-none cursor-pointer"
            >
              {[...Array(listing.maxGuests || 6)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment preference */}
        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
          <label className="block font-bold text-neutral-800">
            Payment Option (Simulated)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPayNow(false)}
              className={`p-2 rounded-xl border text-left flex items-center space-x-1.5 transition-colors ${
                !payNow
                  ? 'border-neutral-900 bg-white font-bold text-neutral-900 shadow-sm'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <FiClock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Pay on Arrival</span>
            </button>
            <button
              type="button"
              onClick={() => setPayNow(true)}
              className={`p-2 rounded-xl border text-left flex items-center space-x-1.5 transition-colors ${
                payNow
                  ? 'border-brand-500 bg-brand-50/50 font-bold text-brand-700 shadow-sm'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <FiCreditCard className="w-3.5 h-3.5 text-brand-500" />
              <span>Simulate Pay Now</span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">
            {payNow
              ? 'Marks payment as "Paid" immediately via simulation.'
              : 'Creates a confirmed reservation with "Unpaid" payment status.'}
          </p>
        </div>

        {/* Reserve Button */}
        <button
          type="submit"
          disabled={loading || isHostOfListing || hasConflict}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/25"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Reserving...</span>
            </div>
          ) : isHostOfListing ? (
            'Your Listing'
          ) : hasConflict ? (
            'Dates Unavailable'
          ) : (
            'Reserve'
          )}
        </button>

        <p className="text-center text-xs text-neutral-500 mt-2">
          {payNow ? 'Simulated checkout (no real card charged)' : "You won't be charged yet"}
        </p>

        {/* Pricing Breakdown (Appears when dates are selected) */}
        {totalNights > 0 && !hasConflict && (
          <div className="pt-4 border-t border-neutral-200 space-y-3 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span className="underline">
                ${pricePerNight} × {totalNights} night{totalNights > 1 ? 's' : ''}
              </span>
              <span>${stayCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Cleaning fee</span>
              <span>${cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">StayScape service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-neutral-200 flex justify-between font-bold text-neutral-900 text-base">
              <span>Total before taxes</span>
              <span>${totalEstimatedPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingCard;
