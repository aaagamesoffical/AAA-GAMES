import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppSupportProps {
  whatsappNumber?: string;
}

export const WhatsAppSupport: React.FC<WhatsAppSupportProps> = ({ whatsappNumber = '+919442964232' }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-20 md:bottom-5 right-3 sm:right-5 z-40 flex flex-col items-end">
      {showTooltip && (
        <div className="relative mb-2 p-3 bg-zinc-900 border border-emerald-500/40 rounded-2xl shadow-2xl max-w-[270px] sm:max-w-xs text-xs text-zinc-200 animate-bounce-subtle">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-1.5 right-1.5 p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-emerald-400 font-bold">AAA GAMES Live WhatsApp (+91 9442964232)</strong>
          </div>
          <p className="text-[11px] text-zinc-300 leading-tight">
            Need payment confirmation, key dispatch, or game setup help? Chat directly with store owner!
          </p>
        </div>
      )}

      <a
        href={`https://wa.me/${cleanPhone}?text=Hello%20AAA%20GAMES%2C%20I%20have%20a%20question%20about%20a%20game%20purchase.`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-5 h-5 fill-current text-zinc-950" />
        <span className="font-extrabold tracking-wide hidden sm:inline">WhatsApp Fast Support</span>
        <span className="sm:hidden font-extrabold">Chat</span>
      </a>
    </div>
  );
};
