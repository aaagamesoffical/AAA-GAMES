import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, CartItem, Coupon } from '../types/game';

interface CartContextType {
  items: CartItem[];
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
  currency: 'INR' | 'USD';
  setCurrency: (cur: 'INR' | 'USD') => void;
  formatPrice: (inrAmount: number) => string;
  wishlist: string[];
  toggleWishlist: (gameId: string) => void;
  isInWishlist: (gameId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const EXCHANGE_RATE_INR_TO_USD = 0.012; // ~83.3 INR = 1 USD

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cheap_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cheap_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cheap_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cheap_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (game: Game) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.game.id === game.id);
      if (existing) {
        return prev; // Digital items are 1 per order per game
      }
      return [...prev, { game, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (gameId: string) => {
    setItems((prev) => prev.filter((i) => i.game.id !== gameId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (gameId: string) => {
    setWishlist((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const isInWishlist = (gameId: string) => wishlist.includes(gameId);

  const subtotal = items.reduce((sum, item) => sum + item.game.price * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyCoupon = (coupon: Coupon) => {
    if (subtotal < coupon.minSpend) {
      alert(`Minimum spend of ₹${coupon.minSpend} required for coupon ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const formatPrice = (inrAmount: number) => {
    if (currency === 'USD') {
      const usdVal = inrAmount * EXCHANGE_RATE_INR_TO_USD;
      return `$${usdVal.toFixed(2)}`;
    }
    return `₹${inrAmount.toLocaleString('en-IN')}`;
  };

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal,
        currency,
        setCurrency,
        formatPrice,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
