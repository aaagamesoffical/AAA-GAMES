import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  CheckCircle, 
  MessageSquare, 
  Plus, 
  X, 
  Sparkles, 
  ThumbsUp, 
  Gamepad2,
  Send,
  Zap,
  Users
} from 'lucide-react';
import { Review, Game } from '../types/game';
import { subscribeToAllReviews, addReview } from '../services/gameService';
import { useAuth } from '../context/AuthContext';

interface CustomerReviewsProps {
  games: Game[];
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ games }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id || 'store-general');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState(user?.displayName || '');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const unsub = subscribeToAllReviews((loadedReviews) => {
      setReviews(loadedReviews);
    });
    return () => unsub();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const selectedGame = games.find((g) => g.id === selectedGameId);
      const gameTitle = selectedGame ? selectedGame.title : 'AAA GAMES Store';

      await addReview({
        gameId: selectedGameId,
        gameTitle,
        userId: user?.uid || 'guest_' + Math.random().toString(36).substring(2, 8),
        userName: userName.trim() || user?.displayName || 'Verified Gamer',
        rating,
        comment: comment.trim(),
        verifiedPurchase: true,
      });

      setComment('');
      setIsWriteModalOpen(false);
      setSuccessToast('Thank you! Your verified review has been published.');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      alert('Failed to post review: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'all') return true;
    return r.rating === filterRating;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <section id="reviews-section" className="py-12 sm:py-16 bg-zinc-950 border-t border-b border-zinc-800/80 relative overflow-hidden">
      {/* Background cyber accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle className="w-5 h-5 text-zinc-950" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Genuine Gamer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Customer Reviews &amp; Trust Pilot
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Over 1,280+ satisfied gamers across India trust AAA GAMES for high-speed Steam offline activations, instant CD-keys, and PlayStation accounts.
            </p>
          </div>

          {/* Rating Summary & Action Button */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl">
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  {averageRating}
                </div>
                <div className="flex text-amber-400 justify-center mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 block font-medium mt-0.5">
                  {reviews.length} Verified Reviews
                </span>
              </div>

              {/* Star breakdown bars */}
              <div className="border-l border-zinc-800 pl-3.5 space-y-1 text-[11px] font-mono">
                {[5, 4, 3].map((starVal) => {
                  const count = reviews.filter((r) => r.rating === starVal).length;
                  const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={starVal} className="flex items-center gap-2">
                      <span className="w-3 text-zinc-400">{starVal}★</span>
                      <div className="w-20 sm:w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 w-7 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                if (user?.displayName && !userName) {
                  setUserName(user.displayName);
                }
                setIsWriteModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-zinc-500 font-semibold mr-1">Filter by Rating:</span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterRating === 'all'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {[5, 4, 3].map((r) => {
            const count = reviews.filter((rev) => rev.rating === r).length;
            return (
              <button
                key={r}
                onClick={() => setFilterRating(r)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  filterRating === r
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{r} Stars ({count})</span>
                <Star className={`w-3.5 h-3.5 ${filterRating === r ? 'fill-zinc-950' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/40 transition-all space-y-3.5 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Verified Purchase</span>
                  </span>
                </div>

                {/* Comment */}
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Reviewer Details and Game tag */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{rev.userName}</span>
                  {rev.gameTitle && (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate max-w-[190px]">
                      <Gamepad2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{rev.gameTitle}</span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Write Review */}
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Share Your Gaming Experience</h3>
                    <p className="text-xs text-zinc-400">Tell other gamers about your delivery and game performance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWriteModalOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                
                {/* Game Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Select Purchased Game
                  </label>
                  <select
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="store-general">AAA GAMES Overall Store &amp; Delivery</option>
                    {games.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({g.platform.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-zinc-600 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">
                      {hoverRating || rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* User Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Gamer Tag / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. ApexTitan99 or Rahul K."
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Review Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the QR payment, delivery speed on WhatsApp, and game activation?..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Publishing Review...' : 'Publish Verified Review'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
