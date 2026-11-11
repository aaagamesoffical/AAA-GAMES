import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, ShieldCheck, Flame, Zap, Eye, Check } from 'lucide-react';
import { Game, GameEditionCategory, getGameTierPrice, GAME_CATEGORIES } from '../types/game';
import { useCart } from '../context/CartContext';

interface GameCardProps {
  game: Game;
  onSelectGame: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  const { addToCart, isInWishlist, toggleWishlist, formatPrice } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<GameEditionCategory>('offline_sharing');
  const inWishlist = isInWishlist(game.id);

  const getPlatformBadge = (platform: Game['platform']) => {
    switch (platform) {
      case 'steam':
        return {
          label: 'STEAM',
          color: 'bg-blue-600/90 text-white border-blue-400/40',
          dot: 'bg-blue-400',
        };
      case 'epic':
        return {
          label: 'EPIC GAMES',
          color: 'bg-zinc-700/90 text-white border-zinc-500/40',
          dot: 'bg-zinc-300',
        };
      case 'ps5':
        return {
          label: 'PS5 CONSOLE',
          color: 'bg-indigo-600/90 text-white border-indigo-400/40',
          dot: 'bg-indigo-400',
        };
      case 'ps4':
        return {
          label: 'PS4 CONSOLE',
          color: 'bg-sky-600/90 text-white border-sky-400/40',
          dot: 'bg-sky-300',
        };
    }
  };

  const badge = getPlatformBadge(game.platform);
  const activePrice = getGameTierPrice(game, selectedCategory);

  return (
    <div className="group relative bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between">
      
      {/* Top Media Container */}
      <div 
        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
        onClick={() => onSelectGame(game)}
      >
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (game.steamAppId) {
              target.src = `https://shared.steamstatic.com/store_item_assets/steam/apps/${game.steamAppId}/header.jpg`;
            } else if (game.bannerImage) {
              target.src = game.bannerImage;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-sm ${badge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
          {game.isDealOfTheDay && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider shadow-sm animate-pulse">
              <Flame className="w-2.5 h-2.5" />
              HOT DEAL
            </span>
          )}
        </div>

        {/* Wishlist Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(game.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom overlay in image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-zinc-300 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
            {GAME_CATEGORIES.find((c) => c.id === selectedCategory)?.shortLabel}
          </span>
          <span className="bg-emerald-500 text-zinc-950 font-black px-2 py-0.5 rounded-md text-xs shadow-md">
            -{game.discountPercent}%
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div onClick={() => onSelectGame(game)} className="cursor-pointer">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
            <span className="truncate">{game.genre}</span>
            <span>•</span>
            <div className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
              <span>{game.rating.toFixed(1)}</span>
              <span className="text-zinc-500 ml-1">({game.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {game.title}
          </h3>

          <p className="text-zinc-400 text-xs line-clamp-2 mt-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Offline & Online Edition Selector */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              <span>Offline / Online Edition:</span>
            </span>
            <span className="text-zinc-300 font-mono text-[9px] font-bold">
              {GAME_CATEGORIES.find((c) => c.id === selectedCategory)?.shortLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
            {GAME_CATEGORIES.map((cat) => {
              const tierPrice = getGameTierPrice(game, cat.id);
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/25 border-emerald-400 text-white font-extrabold shadow-sm'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                  title={`${cat.label} - ₹${tierPrice}`}
                >
                  <span className="truncate">{cat.shortLabel}</span>
                  <span className={`font-mono text-[10px] font-black ml-1 ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
                    ₹{tierPrice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price & Actions */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-zinc-500 line-through">
              {formatPrice(game.originalPrice)}
            </div>
            <div className="text-lg font-black text-emerald-400 tracking-tight leading-none font-mono">
              {formatPrice(activePrice)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectGame(game)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="View Game Details & Activation Steps"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => addToCart(game, selectedCategory)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buy ({formatPrice(activePrice)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
