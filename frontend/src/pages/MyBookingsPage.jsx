import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiCreditCard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_BADGES = {
  confirmed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: FiCheckCircle,
    label: 'Confirmed',
  },
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: FiClock,
    label: 'Pending',
  },
  completed: {
    bg: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    icon: FiCheckCircle,
    label: 'Completed',
  },
  cancelled: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: FiXCircle,
    label: 'Cancelled',
  },
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getMyBookings();
      if (response.success && response.data?.bookings) {
        setBookings(response.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayBooking = async (bookingId) => {
    setPayingId(bookingId);
    try {
      const response = await bookingService.payBooking(bookingId);
      if (response.success) {
        toast.success('Simulated payment confirmed successfully!');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, paymentStatus: 'paid' } : b))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to process payment');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        toast.success('Reservation cancelled successfully');
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, status: 'cancelled', paymentStatus: 'refunded' }
              : b
          )
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your bookings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error} onRetry={fetchBookings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            My Bookings
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            View details for past, upcoming, and current property stays
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-neutral-200">
            <EmptyState
              title="No trips booked yet"
              description="When you are ready to start planning your next getaway, browse through our collection of premium homes and apartments."
              actionText="Explore Properties"
              actionLink="/listings"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const listing = booking.listing || {};
              const host = booking.host || {};
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const isPast = checkOutDate < new Date();
              const canCancel =
                booking.status === 'confirmed' || booking.status === 'pending';
              const canPay =
                booking.paymentStatus === 'unpaid' &&
                booking.status !== 'cancelled';

              const badge =
                STATUS_BADGES[booking.status] || STATUS_BADGES.confirmed;
              const StatusIcon = badge.icon;

              const fallbackImg =
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
              const image =
                listing.images && listing.images.length > 0
                  ? listing.images[0]
                  : fallbackImg;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm hover:shadow-card transition-all flex flex-col md:flex-row gap-6 items-stretch"
                >
                  {/* Property Image */}
                  <div className="w-full md:w-56 h-48 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={image}
                      alt={listing.title || 'Listing'}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{badge.label}</span>
                        </div>

                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            booking.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.paymentStatus === 'refunded'
                              ? 'bg-neutral-100 text-neutral-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                        {listing.title || 'Property Stay'}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center space-x-1.5 text-xs text-neutral-500 mt-1">
                        <FiMapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {listing.location?.city
                            ? `${listing.location.city}, ${listing.location.country}`
                            : 'Location provided in details'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Stats / Dates */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-t border-b border-neutral-100 text-xs">
                      <div>
                        <span className="text-neutral-400 block font-medium">Check-In</span>
                        <span className="font-bold text-neutral-800 mt-0.5 block">
                          {checkInDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 block font-medium">Check-Out</span>
                        <span className="font-bold text-neutral-800 mt-0.5 block">
                          {checkOutDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 block font-medium">Duration & Guests</span>
                        <span className="font-bold text-neutral-800 mt-0.5 block">
                          {booking.totalNights} night{booking.totalNights > 1 ? 's' : ''} · {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 block font-medium">Total Price</span>
                        <span className="font-extrabold text-neutral-900 text-sm mt-0.5 block">
                          ${booking.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {listing._id ? (
                        <Link
                          to={`/listings/${listing._id}`}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          <span>View Property Details</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center space-x-2">
                        {canPay && (
                          <button
                            type="button"
                            disabled={payingId === booking._id}
                            onClick={() => handlePayBooking(booking._id)}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                          >
                            <FiCreditCard className="w-3.5 h-3.5" />
                            <span>{payingId === booking._id ? 'Processing...' : 'Simulate Pay'}</span>
                          </button>
                        )}

                        {canCancel && !isPast && (
                          <button
                            type="button"
                            disabled={cancellingId === booking._id}
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
