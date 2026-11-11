import React from 'react';
import { 
  Gamepad2, 
  ShoppingCart, 
  Star, 
  MessageCircle, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Platform } from '../types/game';

interface MobileBottomNavProps {
  onOpenCart: () => void;
  onScrollToCatalog: () => void;
  onScrollToReviews: () => void;
  onOpenAdmin: () => void;
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  whatsappNumber?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCart,
  onScrollToCatalog,
  onScrollToReviews,
  onOpenAdmin,
  selectedPlatform,
  onSelectPlatform,
  whatsappNumber = '9442964232'
}) => {
  const { totalItemsCount } = useCart();
  const { isAdmin } = useAuth();
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-15 items-center px-1">
        
        {/* Store / Games */}
        <button
          onClick={onScrollToCatalog}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Games</span>
        </button>

        {/* Platforms Dropdown / Toggle */}
        <button
          onClick={() => {
            const sequence: (Platform | 'all')[] = ['all', 'steam', 'ps5', 'ps4', 'epic'];
            const currentIndex = sequence.indexOf(selectedPlatform);
            const nextPlatform = sequence[(currentIndex + 1) % sequence.length];
            onSelectPlatform(nextPlatform);
            onScrollToCatalog();
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all active:scale-95 cursor-pointer ${
            selectedPlatform !== 'all' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
          }`}
          title="Switch Platform (Steam, PS5, PS4, Epic)"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5 truncate max-w-[60px]">
            {selectedPlatform === 'all' ? 'Platforms' : selectedPlatform.toUpperCase()}
          </span>
        </button>

        {/* Cart with Live Badge */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:scale-95 transition-all relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-zinc-950 font-black text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-0.5 shadow-md shadow-emerald-500/40 animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold text-emerald-400 tracking-tight mt-0.5">Cart</span>
        </button>

        {/* Customer Proof Reviews */}
        <button
          onClick={onScrollToReviews}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <Star className="w-5 h-5 fill-amber-400/20 text-amber-400" />
          <span className="text-[10px] font-bold tracking-tight mt-0.5">Reviews</span>
        </button>

        {/* Support WhatsApp or Admin */}
        {isAdmin ? (
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-emerald-400 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-emerald-400" />
            <span className="text-[10px] font-extrabold tracking-tight mt-0.5 text-emerald-400">Admin</span>
          </button>
        ) : (
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20AAA%20GAMES%2C%20I%20need%20assistance%20with%20a%20game%20purchase.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center min-h-[48px] py-1 text-zinc-400 hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Support</span>
          </a>
        )}

      </div>
    </nav>
  );
};
