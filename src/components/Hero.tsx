import React from 'react';
import { ShieldCheck, Zap, DownloadCloud, Sparkles, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { Platform } from '../types/game';

interface HeroProps {
  onSelectPlatform: (platform: Platform | 'all') => void;
  onExploreDeals: () => void;
  storeName?: string;
}

export const Hero: React.FC<HeroProps> = ({ 
  onSelectPlatform, 
  onExploreDeals,
  storeName = 'AAA GAMES'
}) => {
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

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Play Top <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Steam, Epic, PS4 &amp; PS5</span> Titles at 90% OFF
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Official digital hub for blockbusters: <strong>Black Myth: Wukong, GTA V, God of War Ragnarök, Marvel's Spider-Man 2 &amp; Elden Ring</strong>. Automated 5-minute WhatsApp delivery with 100% lifetime replacement guarantee.
            </p>

            {/* Quick Platform Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onSelectPlatform('steam')}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-blue-500 text-xs font-bold text-zinc-200 transition-all shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                <span>Steam PC Deals</span>
              </button>

              <button
                onClick={() => onSelectPlatform('epic')}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-gray-400 text-xs font-bold text-zinc-200 transition-all shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 group-hover:scale-125 transition-transform" />
                <span>Epic Games</span>
              </button>

              <button
                onClick={() => onSelectPlatform('ps5')}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-indigo-500 text-xs font-bold text-zinc-200 transition-all shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                <span>PlayStation 5</span>
              </button>

              <button
                onClick={() => onSelectPlatform('ps4')}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-sky-500 text-xs font-bold text-zinc-200 transition-all shadow-sm"
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
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
                  alt="GTA V Deal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                    <span className="text-xs line-through text-zinc-400 block">₹2,499</span>
                    <span className="text-xl font-black text-emerald-400">₹299</span>
                  </div>
                </div>
              </div>

              {/* Quick Perks grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[11px]">Delivery Type</span>
                  <span className="text-white font-semibold">Instant Steam Account</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                  <span className="text-zinc-400 block text-[11px]">Warranty</span>
                  <span className="text-emerald-400 font-semibold">100% Lifetime Cover</span>
                </div>
              </div>

              <button
                onClick={onExploreDeals}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <span>Browse All Available Games</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
