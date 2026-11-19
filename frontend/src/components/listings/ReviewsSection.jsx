import React, { useState, useEffect } from 'react';
import { FiStar, FiUser, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';

const ReviewsSection = ({ listingId, averageRating = 0, totalReviews = 0, onReviewAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews for this listing
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewService.getListingReviews(listingId);
        if (response.success && response.data?.reviews) {
          setReviews(response.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  // Check if current user has any completed bookings for this listing
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkEligibleBookings = async () => {
      try {
        const response = await bookingService.getMyBookings();
        if (response.success && response.data?.bookings) {
          const now = new Date();
          // Find bookings for this listing that are either completed or checkOut has passed
          const eligible = response.data.bookings.filter((b) => {
            const matchesListing =
              (b.listing?._id || b.listing) === listingId;
            const isCompleted =
              b.status === 'completed' ||
              (b.status === 'confirmed' && new Date(b.checkOut) <= now);
            return matchesListing && isCompleted;
          });

          setEligibleBookings(eligible);
          if (eligible.length > 0) {
            setSelectedBookingId(eligible[0]._id);
          }
        }
      } catch (err) {
        // Guest may not have bookings
      }
    };

    checkEligibleBookings();
  }, [isAuthenticated, listingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!selectedBookingId) {
      toast.error('You need a completed stay to review this listing');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reviewService.createReview({
        listing: listingId,
        booking: selectedBookingId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (response.success) {
        toast.success('Review submitted successfully!');
        setReviews([response.data.review, ...reviews]);
        setComment('');
        setShowReviewForm(false);
        // Remove this booking from eligible bookings (one review per booking)
        setEligibleBookings((prev) => prev.filter((b) => b._id !== selectedBookingId));
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await reviewService.deleteReview(reviewId);
      if (response.success) {
        toast.success('Review deleted');
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="py-8 border-t border-neutral-200">
      {/* Reviews Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <FiStar className="w-6 h-6 fill-neutral-900 text-neutral-900" />
          <h3 className="text-2xl font-bold text-neutral-900">
            {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews yet'}
          </h3>
          <span className="text-neutral-400 font-bold">·</span>
          <span className="text-lg font-semibold text-neutral-700">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Leave Review Action (for eligible guests) */}
        {isAuthenticated && eligibleBookings.length > 0 && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full border border-neutral-800 text-neutral-900 font-semibold text-sm hover:bg-neutral-50 transition-colors"
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-10 p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-900 text-base">Write a Review</h4>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="text-xs text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Rating (1 to 5 stars)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <FiStar
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-brand-500 text-brand-500'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-neutral-700 ml-2">
                {rating} / 5
              </span>
            </div>
          </div>

          {eligibleBookings.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Your Stay
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {eligibleBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    Stay from {new Date(b.checkIn).toLocaleDateString()} to{' '}
                    {new Date(b.checkOut).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Your Feedback
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this property..."
              maxLength={1000}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />
            <p className="text-[11px] text-neutral-400 text-right mt-1">
              {comment.length} / 1000 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-200 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-3 p-4 bg-neutral-50 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200" />
                <div className="space-y-1">
                  <div className="w-24 h-4 bg-neutral-200 rounded" />
                  <div className="w-16 h-3 bg-neutral-200 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-neutral-500 text-sm">
          No reviews for this property yet. Be the first guest to leave a review after your stay!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((rev) => {
            const guest = rev.guest;
            const isAuthorOrAdmin =
              isAuthenticated &&
              (user?._id === guest?._id || user?.role === 'admin');

            return (
              <div key={rev._id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {guest?.avatar ? (
                      <img
                        src={guest.avatar}
                        alt={guest.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-sm">
                        {guest?.name ? guest.name.charAt(0).toUpperCase() : <FiUser />}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm">
                        {guest?.name || 'Guest'}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {isAuthorOrAdmin && (
                    <button
                      onClick={() => handleDeleteReview(rev._id)}
                      title="Delete review"
                      className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'fill-neutral-900 text-neutral-900'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-neutral-700 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
