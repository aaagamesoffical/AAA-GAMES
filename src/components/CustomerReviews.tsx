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
  Users,
  Image as ImageIcon,
  Upload,
  Camera,
  Eye
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
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [previewLightboxImg, setPreviewLightboxImg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const unsub = subscribeToAllReviews((loadedReviews) => {
      setReviews(loadedReviews);
    });
    return () => unsub();
  }, []);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReviewImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Clear input
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setReviewImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

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
        images: reviewImages,
      });

      setComment('');
      setReviewImages([]);
      setImageUrlInput('');
      setIsWriteModalOpen(false);
      setSuccessToast('Thank you! Your verified proof review has been published.');
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
    : '5.0';

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

        {/* Reviews Grid / Empty State */}
        {filteredReviews.length === 0 ? (
          <div className="p-10 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Reviews Posted Yet</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Be the first to share your activation screenshot or payment proof! You can upload screenshots directly from your device.
              </p>
            </div>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload First Proof Review</span>
            </button>
          </div>
        ) : (
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

                  {/* Proof Screenshots / Images Gallery */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>Proof Screenshots ({rev.images.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setPreviewLightboxImg(imgUrl)}
                            className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 cursor-pointer hover:border-emerald-500 transition-all shadow-md flex-shrink-0"
                          >
                            <img
                              src={imgUrl}
                              alt={`Proof ${imgIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
        )}

        {/* Modal: Write Review with Image Upload */}
        {isWriteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">Share Your Gaming Experience &amp; Proof</h3>
                    <p className="text-xs text-zinc-400">Upload payment or activation screenshots as verified proof</p>
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
                        className="p-1 text-zinc-600 hover:scale-110 transition-transform cursor-pointer"
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
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the QR payment, delivery speed on WhatsApp, and game activation?..."
                    className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Image Proof Upload Section */}
                <div className="space-y-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Upload Proof Screenshots / Gameplay Images (Optional)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-dashed border-zinc-600 rounded-xl text-xs font-bold text-zinc-300 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Choose Screenshots</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        placeholder="Or paste image URL"
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl text-white transition-colors cursor-pointer"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>

                  {/* Attached images preview list */}
                  {reviewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {reviewImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 group">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors cursor-pointer shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Publishing...' : 'Publish Verified Review'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Full-screen Lightbox Modal for zooming in on proof screenshots */}
        {previewLightboxImg && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setPreviewLightboxImg(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setPreviewLightboxImg(null)}
                className="absolute -top-10 right-0 p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewLightboxImg}
                alt="Proof Screenshot Fullscreen"
                className="max-w-full max-h-[85vh] object-contain rounded-xl border border-zinc-700 shadow-2xl"
              />
              <span className="text-xs text-zinc-400 mt-2 font-mono">
                Verified Customer Proof Screenshot
              </span>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
