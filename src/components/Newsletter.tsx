import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Sparkles, Shield, Gift } from 'lucide-react';
import { subscribeToNewsletter } from '../services/gameService';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setFeedbackMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setFeedbackMsg('');

    try {
      const res = await subscribeToNewsletter(email.trim());
      if (res.success) {
        setStatus('success');
        setFeedbackMsg(res.message);
        setEmail('');
      } else {
        setStatus('error');
        setFeedbackMsg(res.message);
      }
    } catch (err: any) {
      setStatus('error');
      setFeedbackMsg(err.message || 'Could not subscribe. Please try again.');
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background neon ambient effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left text */}
        <div className="lg:col-span-7 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
            <Gift className="w-3.5 h-3.5" />
            <span>VIP Gamer Newsletter</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Get Secret Flash Deals &amp; <span className="text-emerald-400">90% OFF</span> Drops
          </h3>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed">
            Join 15,000+ Indian gamers. Receive instant alerts on Steam key sales, PS5 primary account discounts, and exclusive VIP promo vouchers before they sell out.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Shield className="w-3.5 h-3.5" /> Zero spam
            </span>
            <span>•</span>
            <span>Unsubscribe anytime</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">Bonus: 10% Welcome Coupon on Signup</span>
          </div>
        </div>

        {/* Right input form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubscribe} className="space-y-2.5">
            <div className="relative">
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="Enter your email (e.g. gamer@gmail.com)..."
                className="w-full pl-11 pr-28 py-3.5 bg-zinc-950 border border-zinc-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Feedback message */}
            {status === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{feedbackMsg} Use code <strong>AAAGAMES</strong> for 10% OFF!</span>
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {feedbackMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
