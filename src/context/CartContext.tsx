import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, CartItem, Coupon, GameEditionCategory, getGameTierPrice } from '../types/game';
import { INITIAL_COUPONS } from '../data/initialGames';
import { subscribeToCoupons } from '../services/gameService';

interface CartContextType {
  items: CartItem[];
  addToCart: (game: Game, category?: GameEditionCategory) => void;
  updateItemCategory: (gameId: string, category: GameEditionCategory) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  availableCoupons: Coupon[];
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
      if (!saved) return [];
      const parsed: any[] = JSON.parse(saved);
      // Ensure selectedCategory and categoryPrice are populated
      return parsed.map((item) => {
        const cat = item.selectedCategory || 'offline_sharing';
        const price = item.categoryPrice || getGameTierPrice(item.game, cat);
        return {
          ...item,
          selectedCategory: cat,
          categoryPrice: price
        };
      });
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
  
  // Available Coupons: default to INITIAL_COUPONS, seamlessly enriched by Firestore
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(() => {
    return INITIAL_COUPONS.map((c) => ({
      id: c.code,
      code: c.code,
      discountPercent: c.discountPercent,
      minSpend: c.minSpend,
      isActive: c.isActive,
      createdAt: new Date().toISOString()
    }));
  });

  useEffect(() => {
    const unsub = subscribeToCoupons((firestoreCoupons) => {
      if (firestoreCoupons && firestoreCoupons.length > 0) {
        const map = new Map<string, Coupon>();
        INITIAL_COUPONS.forEach((c) => {
          map.set(c.code.toUpperCase(), {
            id: c.code,
            code: c.code,
            discountPercent: c.discountPercent,
            minSpend: c.minSpend,
            isActive: c.isActive,
            createdAt: new Date().toISOString()
          });
        });
        firestoreCoupons.forEach((c) => {
          if (c.isActive) {
            map.set(c.code.toUpperCase(), c);
          }
        });
        setAvailableCoupons(Array.from(map.values()));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('cheap_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cheap_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (game: Game, category: GameEditionCategory = 'offline_sharing') => {
    const tierPrice = getGameTierPrice(game, category);
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.game.id === game.id);
      if (existingIndex > -1) {
        // Update category and price if already in cart
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          selectedCategory: category,
          categoryPrice: tierPrice
        };
        return updated;
      }
      return [
        ...prev, 
        { 
          game, 
          quantity: 1, 
          selectedCategory: category, 
          categoryPrice: tierPrice 
        }
      ];
    });
    setIsCartOpen(true);
  };

  const updateItemCategory = (gameId: string, category: GameEditionCategory) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.game.id === gameId) {
          return {
            ...item,
            selectedCategory: category,
            categoryPrice: getGameTierPrice(item.game, category)
          };
        }
        return item;
      })
    );
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

  const subtotal = items.reduce(
    (sum, item) => sum + (item.categoryPrice ?? getGameTierPrice(item.game, item.selectedCategory || 'offline_sharing')) * item.quantity, 
    0
  );

  const discountAmount = appliedCoupon
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyCoupon = (coupon: Coupon) => {
    if (subtotal < (coupon.minSpend || 0)) {
      alert(`Minimum spend of ₹${coupon.minSpend} required for coupon ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
  };

  const applyCouponCode = (rawCode: string): { success: boolean; message: string } => {
    const cleanCode = rawCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (items.length === 0) {
      return { success: false, message: 'Add at least one game to your cart first.' };
    }

    // Check if code was explicitly deleted by admin
    let isDeletedByAdmin = false;
    try {
      const raw = localStorage.getItem('aaa_deleted_coupons');
      if (raw) {
        const set: string[] = JSON.parse(raw);
        isDeletedByAdmin = set.includes(cleanCode);
      }
    } catch {
      // ignore
    }

    if (isDeletedByAdmin) {
      return { success: false, message: `Coupon "${cleanCode}" is invalid or has expired.` };
    }

    // Check available coupons from live admin sync
    const match = availableCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (!match) {
      return { success: false, message: `Coupon code "${cleanCode}" is invalid or expired.` };
    }

    if (match.isActive === false) {
      return { success: false, message: `Coupon "${match.code}" is currently disabled by store admin.` };
    }

    if (subtotal < (match.minSpend || 0)) {
      return { 
        success: false, 
        message: `Cart total of ₹${subtotal} is less than minimum requirement of ₹${match.minSpend}.` 
      };
    }

    setAppliedCoupon(match);
    return { 
      success: true, 
      message: `Coupon "${match.code}" applied! You saved ${match.discountPercent}%.` 
    };
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
        updateItemCategory,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        appliedCoupon,
        applyCoupon,
        applyCouponCode,
        removeCoupon,
        availableCoupons,
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
