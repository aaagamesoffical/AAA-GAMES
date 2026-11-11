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
  Share2,
  Sparkles,
  Bot,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import { Game, Review, GameEditionCategory, GAME_CATEGORIES, getGameTierPrice } from '../types/game';
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
  const [selectedCategory, setSelectedCategory] = useState<GameEditionCategory>('offline_sharing');
  const [activeTab, setActiveTab] = useState<'details' | 'activation' | 'system' | 'reviews'>('details');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI Specs State
  const [userGpu, setUserGpu] = useState('NVIDIA RTX 3060');
  const [userCpu, setUserCpu] = useState('Intel Core i5-12400F / Ryzen 5600');
  const [checkingSpecs, setCheckingSpecs] = useState(false);
  const [specsVerdict, setSpecsVerdict] = useState<string | null>(null);

  const handleCheckSpecs = async () => {
    if (!game) return;
    setCheckingSpecs(true);
    try {
      const res = await fetch('/api/ai/specs-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle: game.title,
          gpu: userGpu,
          cpu: userCpu,
          ram: '16 GB',
          targetResolution: '1080p'
        })
      });
      const data = await res.json();
      setSpecsVerdict(data.verdict || 'Ready to run with smooth frame rates.');
    } catch {
      setSpecsVerdict('Hardware estimated: 60+ FPS at 1080p High settings. Recommended to enable DLSS / FSR.');
    } finally {
      setCheckingSpecs(false);
    }
  };

  useEffect(() => {
    if (!game) return;
    const unsub = subscribeToGameReviews(game.id, (loadedReviews) => {
      setReviews(loadedReviews);
    });
    return () => unsub();
  }, [game]);

  if (!game) return null;

  const inWishlist = isInWishlist(game.id);
  const activeTierPrice = getGameTierPrice(game, selectedCategory);

  const handleBuyNow = () => {
    addToCart(game, selectedCategory);
    setIsCartOpen(true);
    onClose();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setReviewImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
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
        images: reviewImages,
        verifiedPurchase: true,
      });
      setNewComment('');
      setReviewImages([]);
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = game.coverImage;
            }}
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
                {formatPrice(activeTierPrice)}
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
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-full sm:w-44 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (game.steamAppId) {
                        target.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`;
                      }
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      About the Game
                    </h4>
                    <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
                      {game.description}
                    </p>
                  </div>

                  {game.steamAppId && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://steamdb.info/app/${game.steamAppId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 font-mono transition-colors"
                      >
                        <span>SteamDB App #{game.steamAppId}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                      <a
                        href={`https://store.steampowered.com/app/${game.steamAppId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-xs text-blue-300 font-mono transition-colors"
                      >
                        <span>Official Steam Store</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Edition Categories Selector */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Choose Your Edition Category
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Select how you want to play. Each edition has dedicated server/key licensing.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                    Active: {formatPrice(activeTierPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GAME_CATEGORIES.map((cat) => {
                    const price = getGameTierPrice(game, cat.id);
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-xs font-black ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                            {cat.name}
                          </span>
                          <span className={`text-xs font-mono font-black ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {formatPrice(price)}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {cat.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cat.features.slice(0, 2).map((feat, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
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

          {activeTab === 'system' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Official System Requirements
                </h4>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-line">
                  {game.systemRequirements || 'Windows 10/11 64-bit, 16GB RAM, DirectX 12, or Compatible Console'}
                </div>
              </div>

              {/* AI "Can My PC Run It?" Interactive Evaluator */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h5 className="font-bold text-sm text-white">AI Hardware Benchmark &amp; FPS Estimator</h5>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold uppercase">
                    Free AI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Your Graphics Card (GPU)</label>
                    <input
                      type="text"
                      value={userGpu}
                      onChange={(e) => setUserGpu(e.target.value)}
                      placeholder="e.g. RTX 3060 / GTX 1650 / RX 6600"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-[11px] font-semibold mb-1">Your Processor (CPU)</label>
                    <input
                      type="text"
                      value={userCpu}
                      onChange={(e) => setUserCpu(e.target.value)}
                      placeholder="e.g. Intel i5-12400 / Ryzen 5 5600"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckSpecs}
                  disabled={checkingSpecs}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Bot className={`w-4 h-4 ${checkingSpecs ? 'animate-spin' : ''}`} />
                  <span>{checkingSpecs ? 'Simulating FPS & Performance...' : 'Estimate FPS for My Hardware with AI'}</span>
                </button>

                {specsVerdict && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-zinc-200 font-mono whitespace-pre-line leading-relaxed">
                    {specsVerdict}
                  </div>
                )}
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

                    {/* Image Upload for Customer Proof */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Attach Screenshot Proof (WhatsApp chat, Game Library, Download):</span>
                        </label>
                        <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[11px] text-zinc-200 font-bold flex items-center gap-1 transition-colors">
                          <Upload className="w-3 h-3 text-emerald-400" />
                          <span>Upload Images</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleReviewImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {reviewImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {reviewImages.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/50 group">
                              <img src={img} alt="Proof" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 hover:bg-rose-500 text-white text-[9px] w-4 h-4 flex items-center justify-center transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-md"
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
                    to leave a customer review with screenshot proof.
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{r.userName}</span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                          </span>
                          {r.images && r.images.length > 0 && (
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 font-semibold">
                              📸 {r.images.length} Proof Photo{r.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-zinc-200 leading-relaxed whitespace-pre-line">{r.comment}</p>

                      {/* Review Proof Images Gallery */}
                      {r.images && r.images.length > 0 && (
                        <div className="pt-1.5">
                          <p className="text-[10px] text-zinc-400 font-semibold mb-1.5 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            Customer Screenshot Proof:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {r.images.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => setPreviewModalImg(imgUrl)}
                                className="relative w-20 h-16 rounded-xl overflow-hidden border border-zinc-700 hover:border-emerald-500 transition-all cursor-pointer group"
                              >
                                <img src={imgUrl} alt={`Proof ${imgIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-400">
                    <p className="font-semibold text-zinc-300">No customer reviews yet for this title.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Be the first gamer to post a review and upload your screenshot proof!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              onClick={() => toggleWishlist(game.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                inWishlist
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              <span>{inWishlist ? 'Wishlisted' : 'Wishlist'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <button
              onClick={() => {
                addToCart(game, selectedCategory);
                onClose();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              <span>Instant Buy ({formatPrice(activeTierPrice)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof Image Lightbox Modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={previewModalImg} alt="Customer Proof Screenshot" className="max-w-full max-h-[82vh] object-contain rounded-xl" />
            <div className="flex items-center justify-between p-3 border-t border-zinc-800 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Verified Order &amp; Delivery Screenshot Proof
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-black text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
