import React from 'react';
import { Zap, ShieldCheck, Clock, Tag } from 'lucide-react';

interface BannerProps {
  announcementText?: string;
  whatsappNumber?: string;
}

export const Banner: React.FC<BannerProps> = ({ 
  announcementText = '🔥 SPECIAL OFFER: Use code AAAGAMES for 10% instant discount! Instant WhatsApp Delivery to +91 94429 64232',
  whatsappNumber = '+919442964232'
}) => {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-xs sm:text-sm py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="bg-black/25 px-2 py-0.5 rounded text-yellow-300 font-bold uppercase text-[11px] tracking-wider">
            AAA GAMES
          </span>
          <span>{announcementText}</span>
        </div>
        <div className="hidden md:flex items-center gap-5 text-xs text-white/90">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-yellow-300" />
            <span>Instant 5-Min Delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
            <span>100% Lifetime Warranty</span>
          </div>
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20AAA%20GAMES%20Support`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-yellow-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>WhatsApp: {whatsappNumber}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
