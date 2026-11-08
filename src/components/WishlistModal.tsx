import React from 'react';
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Game } from '../types/game';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGames: Game[];
  onSelectGame: (game: Game) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  allGames,
  onSelectGame,
}) => {
  const { wishlist, toggleWishlist, addToCart, formatPrice } = useCart();

  if (!isOpen) return null;

  const wishlistedGames = allGames.filter((g) => wishlist.includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Your Wishlist</h3>
              <p className="text-xs text-zinc-400">{wishlistedGames.length} saved games</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {wishlistedGames.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-white text-base">Your Wishlist is Empty</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Click the heart icon on any Steam, Epic, or PS5 game to save it for later.
              </p>
            </div>
          ) : (
            wishlistedGames.map((game) => (
              <div
                key={game.id}
                className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 group"
              >
                <div 
                  onClick={() => {
                    onClose();
                    onSelectGame(game);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-14 h-18 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (game.steamAppId) {
                        target.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`;
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      {game.platform}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                      {game.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 line-through">
                        {formatPrice(game.originalPrice)}
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        {formatPrice(game.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addToCart(game);
                      toggleWishlist(game.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(game.id)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
