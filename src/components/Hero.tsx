import React, { useState } from 'react';
import { ShieldCheck, Zap, DownloadCloud, Sparkles, Flame, CheckCircle, ArrowRight, ShoppingCart } from 'lucide-react';
import { Platform, GameEditionCategory, GAME_CATEGORIES } from '../types/game';
import { useCart } from '../context/CartContext';

interface HeroProps {
  onSelectPlatform: (platform: Platform | 'all') => void;
  onExploreDeals: () => void;
  storeName?: string;
  onSelectGame?: (game: any) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onSelectPlatform, 
  onExploreDeals,
  storeName = 'AAA GAMES',
  onSelectGame
}) => {
  const { addToCart, formatPrice, setIsCartOpen } = useCart();
  const [selectedEdition, setSelectedEdition] = useState<GameEditionCategory>('offline_sharing');

  const gtaTierPrices: Record<GameEditionCategory, number> = {
    offline_sharing: 100,
    offline_private: 200,
    online_sharing: 289,
    online_private: 400,
  };

  const activePrice = gtaTierPrices[selectedEdition];
  return (
    <section className="relative overflow-hidden pt-8 pb-12 bg-gradient-to-b from-zinc-950 via-zinc-900/80 to-zinc-950 border-b border-emerald-500/20">
      {/* Futuristic cyber grid and ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text Pitch */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{storeName} • NEXT-GEN DIGITAL GAMING MARKETPLACE</span>
            </div>

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Play Top <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Steam, Epic, PS4 &amp; PS5</span> Titles at 90% OFF
            </h1>

            <p className="text-zinc-300 text-xs sm:text-base max-w-xl leading-relaxed">
              Official digital hub for blockbusters: <strong>Black Myth: Wukong, GTA V, God of War Ragnarök, Marvel's Spider-Man 2 &amp; Elden Ring</strong>. Automated 5-minute WhatsApp delivery with 100% lifetime replacement guarantee.
            </p>

            {/* Quick Platform Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => onSelectPlatform('steam')}
                className="group flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-blue-500 text-xs font-bold text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                <span>Steam PC Deals</span>
              </button>

              <button
                onClick={() => onSelectPlatform('epic')}
                className="group flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-gray-400 text-xs font-bold text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 group-hover:scale-125 transition-transform" />
                <span>Epic Games</span>
              </button>

              <button
                onClick={() => onSelectPlatform('ps5')}
                className="group flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500 text-xs font-bold text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                <span>PlayStation 5</span>
              </button>

              <button
                onClick={() => onSelectPlatform('ps4')}
                className="group flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-sky-500 text-xs font-bold text-zinc-200 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                <span>PlayStation 4</span>
              </button>
            </div>

            {/* Trust bullet points */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant 5-Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>UPI / QR &amp; Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>WhatsApp Live Support</span>
              </div>
            </div>
          </div>

          {/* Right Featured Card Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 p-5 border border-zinc-700/80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
                    Deal of the Day
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  85% OFF TODAY
                </span>
              </div>

              {/* Game Banner Highlight */}
              <div className="relative rounded-xl overflow-hidden aspect-video mb-4 group cursor-pointer shadow-lg">
                <img
                  src="https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg"
                  alt="Grand Theft Auto V: Premium Edition"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://shared.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase mb-1">
                      Steam PC
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      Grand Theft Auto V: Premium
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] line-through text-zinc-400 block font-mono">₹2,499</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      {formatPrice(activePrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Edition Categories Selector on Deal of the Day */}
              <div className="mb-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-400 uppercase tracking-wider font-mono text-[10px]">
                    Select Account / Edition Type:
                  </span>
                  <span className="text-zinc-300 font-mono text-[10px]">
                    {GAME_CATEGORIES.find((c) => c.id === selectedEdition)?.shortLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
                  {GAME_CATEGORIES.map((cat) => {
                    const price = gtaTierPrices[cat.id];
                    const isSelected = selectedEdition === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedEdition(cat.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-400 text-white font-extrabold shadow-sm'
                            : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                        title={`${cat.label} - ₹${price}`}
                      >
                        <span className="truncate">{cat.shortLabel}</span>
                        <span className={`font-mono text-[10px] font-black ml-1 ${isSelected ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          ₹{price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Perks grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Delivery Channel</span>
                  <span className="text-white font-bold text-xs">WhatsApp (+91 9442964232)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[10px]">Warranty &amp; Support</span>
                  <span className="text-emerald-400 font-bold text-xs">100% Lifetime Cover</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const gtaGame = {
                      id: 'gta-v-steam',
                      title: 'Grand Theft Auto V: Premium Edition',
                      slug: 'gta-v-premium-edition',
                      platform: 'steam' as const,
                      type: 'offline_account' as const,
                      genre: 'Action / Open World / Heists',
                      price: 100,
                      tierPricing: {
                        offlineSharing: 100,
                        offlinePrivate: 200,
                        onlineSharing: 289,
                        onlinePrivate: 400
                      },
                      originalPrice: 2499,
                      discountPercent: 85,
                      description: 'The Grand Theft Auto V: Premium Edition includes the complete Grand Theft Auto V story experience.',
                      coverImage: 'https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg',
                      bannerImage: 'https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_hero.jpg',
                      edition: 'Premium Edition',
                      deliveryType: 'Instant Steam Credentials',
                      activationGuide: '1. Log into provided Steam Account. 2. Download GTA V. 3. Switch to Steam Offline mode.',
                      inStock: true,
                      stockCount: 50,
                      isFeatured: true,
                      isDealOfTheDay: true,
                      rating: 4.9,
                      reviewCount: 450,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    addToCart(gtaGame, selectedEdition);
                    setIsCartOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy GTA V ({formatPrice(activePrice)})</span>
                </button>

                <button
                  onClick={onExploreDeals}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>All 32 Games</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
