import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import listingService from '../services/listingService';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiPlusCircle,
  FiList,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const HostDashboardPage = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchHostData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        listingService.getMyListings(),
        bookingService.getHostBookings(),
      ]);

      if (listingsRes.success && listingsRes.data?.listings) {
        setListings(listingsRes.data.listings);
      }
      if (bookingsRes.success && bookingsRes.data?.bookings) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load host dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this guest reservation?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await bookingService.cancelBooking(bookingId);
      if (res.success) {
        toast.success('Reservation cancelled');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading host dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState message={error} onRetry={fetchHostData} />
      </div>
    );
  }

  // Calculate detailed metrics
  const totalProperties = listings.length;
  const totalBookings = bookings.length;
  const now = new Date();

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.checkOut) < now)
  );
  const upcomingBookings = confirmedBookings.filter((b) => new Date(b.checkIn) >= now);
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  // Revenue calculation clearly distinguishing paid vs unpaid
  const collectedPaidRevenue = bookings
    .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  const pendingUnpaidRevenue = bookings
    .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'unpaid')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // Filter bookings table
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              Host Dashboard
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Monitor portfolio metrics, check incoming guest arrivals, and track payouts
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/host/listings"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-md shadow-brand-500/25"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>Add New Listing</span>
            </Link>
          </div>
        </div>

        {/* 1. Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Listings
            </span>
            <div className="text-2xl font-extrabold text-neutral-900">{totalProperties}</div>
            <p className="text-[11px] text-neutral-400">Total properties</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Total Bookings
            </span>
            <div className="text-2xl font-extrabold text-neutral-900">{totalBookings}</div>
            <p className="text-[11px] text-neutral-400">All reservations</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Upcoming
            </span>
            <div className="text-2xl font-extrabold text-amber-600">{upcomingBookings.length}</div>
            <p className="text-[11px] text-neutral-400">Future arrivals</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Completed
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{completedBookings.length}</div>
            <p className="text-[11px] text-neutral-400">Concluded stays</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Cancelled
            </span>
            <div className="text-2xl font-extrabold text-rose-600">{cancelledBookings.length}</div>
            <p className="text-[11px] text-neutral-400">Cancelled bookings</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Collected
            </span>
            <div className="text-2xl font-extrabold text-brand-600">
              ${collectedPaidRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-400">Paid earnings</p>
          </div>
        </div>

        {/* Revenue Breakdown Callout */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">
                Revenue & Payment Accounting
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                StayScape strictly distinguishes between confirmed paid payouts and unpaid reservations that guests settle at check-in.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm shrink-0">
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Paid (Confirmed)</span>
              <span className="text-lg font-bold text-emerald-600">
                ${collectedPaidRevenue.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div>
              <span className="text-xs text-neutral-400 block font-medium">Unpaid (Arrival)</span>
              <span className="text-lg font-bold text-amber-600">
                ${pendingUnpaidRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Management Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/host/listings"
            className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-card transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-base group-hover:text-brand-600 transition-colors">
                Manage Properties ({totalProperties})
              </h3>
              <p className="text-xs text-neutral-500">
                Add, edit, or remove listings and manage photos
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <FiArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/listings"
            className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-card transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-base group-hover:text-brand-600 transition-colors">
                Marketplace Explorer
              </h3>
              <p className="text-xs text-neutral-500">
                View other stays and compare competitive pricing
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <FiArrowRight className="w-5 h-5" />
            </div>
          </Link>

          <Link
            to="/profile"
            className="group bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm hover:shadow-card transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900 text-base group-hover:text-brand-600 transition-colors">
                Host Profile & Avatar
              </h3>
              <p className="text-xs text-neutral-500">
                Update avatar and host details shown to guests
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
              <FiArrowRight className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* 3. Bookings Table with Status Filter */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Incoming Reservations
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage guest arrivals, check-in dates, and booking status
              </p>
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto text-xs font-semibold">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              <FiCalendar className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-700">No reservations found</p>
              <p className="text-xs text-neutral-400 mt-1">
                There are no bookings matching the selected status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="py-3.5 px-6">Property</th>
                    <th className="py-3.5 px-6">Guest Info</th>
                    <th className="py-3.5 px-6">Check-In / Out</th>
                    <th className="py-3.5 px-6">Booking Status</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6 text-right">Total Price</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredBookings.map((b) => {
                    const listing = b.listing || {};
                    const guest = b.guest || {};
                    const canCancel = b.status === 'confirmed' || b.status === 'pending';

                    return (
                      <tr key={b._id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 px-6 font-semibold text-neutral-900 max-w-xs truncate">
                          {listing.title || 'Property'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-neutral-900">{guest.name || 'Guest'}</div>
                          <div className="text-xs text-neutral-400">{guest.email}</div>
                          {guest.phone && (
                            <div className="text-xs text-neutral-400">{guest.phone}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-neutral-600">
                          <div>
                            {new Date(b.checkIn).toLocaleDateString()} -{' '}
                            {new Date(b.checkOut).toLocaleDateString()}
                          </div>
                          <div className="text-neutral-400 mt-0.5">
                            {b.totalNights} nights · {b.guests} guests
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : b.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700'
                                : b.status === 'completed'
                                ? 'bg-neutral-100 text-neutral-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-[10px] ${
                              b.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.paymentStatus === 'refunded'
                                ? 'bg-neutral-100 text-neutral-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-neutral-900">
                          ${b.totalPrice?.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {canCancel ? (
                            <button
                              type="button"
                              disabled={cancellingId === b._id}
                              onClick={() => handleCancelBooking(b._id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
