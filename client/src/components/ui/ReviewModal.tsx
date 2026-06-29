import { useState } from 'react';
import axios from 'axios';
import { Star, X, Send, Loader2 } from 'lucide-react';
import { showToast } from './Toast';

interface ReviewModalProps {
  booking: any;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ReviewModal({ booking, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const techName = booking.technician?.user?.name || 'the technician';

  const handleSubmit = async () => {
    if (rating === 0) { showToast.error('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/reviews', {
        bookingId: booking._id,
        rating,
        comment,
      });
      showToast.success('Review submitted! Thank you 🎉');
      onSubmitted();
      onClose();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent!',
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star size={26} className="text-amber-500 fill-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Rate Your Experience</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            How was your service with <span className="font-semibold text-[var(--text-primary)]">{techName}</span>?
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  star <= (hovered || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-[var(--border-primary)]'
                }`}
              />
            </button>
          ))}
        </div>
        {(hovered || rating) > 0 && (
          <p className="text-center text-sm font-semibold text-amber-500 mb-4 h-5">
            {labels[hovered || rating]}
          </p>
        )}
        {!(hovered || rating) && <div className="mb-4 h-5" />}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Tell others about your experience... (optional)`}
          rows={3}
          maxLength={500}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-amber-500/50 resize-none transition-colors mb-1"
        />
        <p className="text-xs text-[var(--text-tertiary)] text-right mb-4">{comment.length}/500</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-semibold transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
