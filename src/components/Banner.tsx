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
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 shadow-inner overflow-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 font-medium tracking-wide truncate min-w-0 flex-1">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="bg-black/25 px-1.5 py-0.5 rounded text-yellow-300 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider shrink-0">
            AAA GAMES
          </span>
          <span className="truncate text-[10px] sm:text-xs">{announcementText}</span>
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
