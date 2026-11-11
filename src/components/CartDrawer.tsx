import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingCart, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle,
  Percent
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { subscribeToCoupons } from '../services/gameService';
import { Coupon, GAME_CATEGORIES, GameEditionCategory } from '../types/game';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { 
    items, 
    removeFromCart, 
    clearCart, 
    isCartOpen, 
    setIsCartOpen, 
    subtotal, 
    formatPrice, 
    appliedCoupon, 
    applyCoupon,
    applyCouponCode,
    availableCoupons, 
    removeCoupon, 
    discountAmount, 
    finalTotal,
    updateItemCategory
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyInputCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const result = applyCouponCode(couponCodeInput);
    setCouponStatus({ text: result.message, isError: !result.success });
    if (result.success) {
      setCouponCodeInput('');
    }
    setTimeout(() => {
      setCouponStatus(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Your Gaming Cart</h3>
                <p className="text-xs text-zinc-400">{items.length} digital game{items.length === 1 ? '' : 's'}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Your cart is empty</h4>
                  <p className="text-xs text-zinc-400 mt-1">Browse our catalog to add Steam, Epic, PS4 or PS5 games!</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 transition-colors"
                >
                  Explore Top Deals
                </button>
              </div>
            ) : (
              items.map(({ game, selectedCategory, categoryPrice }) => {
                const currentCategory = selectedCategory || 'offline_sharing';
                const itemPrice = categoryPrice || game.price;
                const catMeta = GAME_CATEGORIES.find((c) => c.id === currentCategory);

                return (
                  <div
                    key={game.id}
                    className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-3 relative group"
                  >
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-16 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (game.steamAppId) {
                          target.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {game.platform.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {game.edition}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {game.title}
                      </h4>

                      {/* Category Switcher Pill */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <select
                          value={currentCategory}
                          onChange={(e) => updateItemCategory(game.id, e.target.value as GameEditionCategory)}
                          className="text-[10px] font-bold bg-zinc-950 border border-emerald-500/40 text-emerald-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {GAME_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-zinc-500 line-through">
                          {formatPrice(game.originalPrice)}
                        </span>
                        <span className="text-sm font-black text-emerald-400">
                          {formatPrice(itemPrice)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(game.id)}
                      className="p-2 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Calculations */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90 space-y-4">
              
              {/* Promo Coupon Section */}
              <div className="space-y-2">
                <form onSubmit={handleApplyInputCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Enter promo coupon code..."
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponStatus && (
                  <p className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${couponStatus.isError ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}`}>
                    {couponStatus.text}
                  </p>
                )}

                {/* Available Quick Coupons */}
                {availableCoupons.filter(c => c.isActive !== false).length > 0 && !appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-emerald-400" />
                      Coupons:
                    </span>
                    {availableCoupons.filter(c => c.isActive !== false).slice(0, 4).map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => applyCoupon(c)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                      >
                        {c.code} ({c.discountPercent}% OFF)
                      </button>
                    ))}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Applied: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-zinc-400 hover:text-rose-400 text-xs underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount:</span>
                    <span className="font-bold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Instant Delivery Fee:</span>
                  <span className="text-emerald-400 font-bold uppercase">FREE</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-zinc-800">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <span>Proceed to Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted &amp; Verified Digital Purchase</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
