import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  BookOpen, 
  CheckCircle2, 
  MessageSquarePlus,
  Send,
  Zap,
  Share2
} from 'lucide-react';
import { Game, Review } from '../types/game';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToGameReviews, addReview } from '../services/gameService';

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, onClose, onOpenAuth }) => {
  const { addToCart, isInWishlist, toggleWishlist, formatPrice, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'activation' | 'system' | 'reviews'>('details');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!game) return;
    const unsub = subscribeToGameReviews(game.id, (loadedReviews) => {
      setReviews(loadedReviews);
    });
    return () => unsub();
  }, [game]);

  if (!game) return null;

  const inWishlist = isInWishlist(game.id);

  const handleBuyNow = () => {
    addToCart(game);
    setIsCartOpen(true);
    onClose();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await addReview({
        gameId: game.id,
        gameTitle: game.title,
        userId: user ? user.uid : 'guest_' + Math.random().toString(36).substring(2, 8),
        userName: user?.displayName || user?.email?.split('@')[0] || 'Verified Gamer',
        rating: newRating,
        comment: newComment.trim(),
        verifiedPurchase: true,
      });
      setNewComment('');
      setActiveTab('reviews');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="relative h-48 sm:h-64 overflow-hidden flex-shrink-0">
          <img
            src={game.bannerImage || game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-16 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors text-xs flex items-center gap-1"
            title="Copy Game Link"
          >
            <Share2 className="w-4 h-4" />
            {copiedLink && <span className="text-[10px] text-emerald-400 font-bold pr-1">Copied!</span>}
          </button>

          {/* Header Title info */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-500 text-zinc-950">
                  {game.platform.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300">
                  {game.edition}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {game.title}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-sm line-through text-zinc-400 block">
                {formatPrice(game.originalPrice)}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatPrice(game.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0 overflow-x-auto no-scrollbar text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Game Overview
          </button>
          <button
            onClick={() => setActiveTab('activation')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'activation'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Activation Guide
          </button>
          {game.systemRequirements && (
            <button
              onClick={() => setActiveTab('system')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'system'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Requirements
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            Reviews ({reviews.length > 0 ? reviews.length : game.reviewCount})
          </button>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  About the Game
                </h4>
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
                  {game.description}
                </p>
              </div>

              {/* Delivery Guarantee Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Instant 5-Minute Delivery</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Automated delivery on WhatsApp &amp; your customer dashboard.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">100% Lifetime Guarantee</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Full replacement warranty on all digital games and accounts.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Complete Story &amp; DLCs</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Enjoy unrestricted offline campaign with lifetime cloud saves.</p>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Platform:</span>
                  <span className="font-semibold text-white capitalize">{game.platform}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Delivery Format:</span>
                  <span className="font-semibold text-emerald-400">{game.deliveryType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Genre:</span>
                  <span className="font-semibold text-white">{game.genre}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Stock Availability:</span>
                  <span className="font-semibold text-emerald-400">
                    {game.inStock ? `In Stock (${game.stockCount} available)` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Official Activation Guide ({game.platform.toUpperCase()})
                </h4>
                <p className="text-xs text-zinc-300 mt-1">
                  Follow these step-by-step instructions after completing your order to activate the game.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-line">
                {game.activationGuide}
              </div>

              <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-xs text-zinc-400">
                <p className="font-semibold text-white mb-1">Need help during setup?</p>
                Our 24/7 technical team is available on WhatsApp to assist you remotely with step-by-step setup!
              </div>
            </div>
          )}

          {activeTab === 'system' && game.systemRequirements && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Hardware &amp; System Specifications
              </h4>
              <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line">
                {game.systemRequirements}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Write Review Form */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                  Leave a Verified Review
                </h4>
                
                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= newRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your experience with delivery speed, game download, and support..."
                      rows={2}
                      className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      required
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs text-zinc-400 py-2">
                    Please{' '}
                    <button onClick={onOpenAuth} className="text-emerald-400 font-bold underline">
                      Login with Google or Email
                    </button>{' '}
                    to leave a customer review.
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.id} className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.userName}</span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    No reviews submitted yet for this title. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => toggleWishlist(game.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
              inWishlist
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{inWishlist ? 'Wishlisted' : 'Add to Wishlist'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                addToCart(game);
                onClose();
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>Instant Buy ({formatPrice(game.price)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
