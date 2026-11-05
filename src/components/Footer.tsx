import React from 'react';
import { Gamepad2, ShieldCheck, Zap, Heart, MessageCircle, Mail, Phone } from 'lucide-react';
import { Platform } from '../types/game';
import { Newsletter } from './Newsletter';

interface FooterProps {
  onSelectPlatform: (platform: Platform | 'all') => void;
  onOpenOrders: () => void;
  onOpenAdmin?: () => void;
  whatsappNumber?: string;
  storeName?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectPlatform, 
  onOpenOrders, 
  onOpenAdmin,
  whatsappNumber = '+919442964232',
  storeName = 'AAA GAMES'
}) => {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Newsletter Subscription Card in Footer */}
        <Newsletter />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                {storeName.split(' ')[0]} <span className="text-emerald-400">{storeName.split(' ').slice(1).join(' ') || 'GAMES'}</span>
              </span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Official digital gaming marketplace. Providing genuine Steam keys, Epic Games accounts, and PlayStation 4 / 5 console activations at unmatched discounted rates with instant 5-minute WhatsApp delivery and lifetime warranty.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-300">
              <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Genuine Games
              </span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Instant Delivery
              </span>
            </div>
          </div>

          {/* Platforms */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Gaming Platforms</h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectPlatform('steam')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Steam PC Games
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectPlatform('epic')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Epic Games Store
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectPlatform('ps5')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  PlayStation 5 (PS5)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectPlatform('ps4')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  PlayStation 4 (PS4)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectPlatform('all')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  All Hot Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={onOpenOrders} className="hover:text-emerald-400 transition-colors">
                  My Game Vault &amp; Keys
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20CheapPCGames%20Support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp: {whatsappNumber}</span>
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Live Support: 10 AM - 11 PM IST</span>
              </li>
              <li>
                <span className="text-zinc-500">Lifetime Replacement Policy</span>
              </li>
              {onOpenAdmin && (
                <li>
                  <button
                    onClick={onOpenAdmin}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold flex items-center gap-1 mt-1"
                  >
                    <span>⚡ Admin Control Panel</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Secure Payments Accepted */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Secure Payments</h4>
            <p className="text-[11px] text-zinc-400">
              Zero surcharge via all major Indian &amp; international gateways:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                BHIM UPI
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                Google Pay
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                PhonePe
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                Paytm
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                Visa / MC
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-200">
                RuPay
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <p>
            © {new Date().getFullYear()} {storeName}. All rights reserved. Dedicated to budget-conscious gamers.
          </p>
          <p className="text-zinc-400 max-w-md text-center sm:text-right">
            Disclaimer: Steam is a registered trademark of Valve Corporation. Epic Games is a trademark of Epic Games, Inc. PlayStation is a trademark of Sony Interactive Entertainment Inc. All product names, logos, and brands are property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};
