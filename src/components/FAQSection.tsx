import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does Steam Offline Activation work?',
    answer: 'Steam Offline Activation allows you to play the complete single-player story campaign of AAA games at a fraction of the cost. After purchase, you receive verified Steam credentials. You download the game directly through official Steam client, start it once to verify, and then switch Steam to Offline Mode. Your save files and progress stay on your local PC with cloud backups.'
  },
  {
    question: 'How do PS4 & PS5 Console Accounts work?',
    answer: 'For PlayStation titles, we provide a digital account containing the purchased game. You add this account to your PS4 or PS5 and enable "Console Sharing and Offline Play" (or Primary PS4). You download the game from the library and then switch back to your personal PSN profile. You can play on your own profile, unlock PlayStation trophies, and save game progress under your personal gamertag!'
  },
  {
    question: 'How fast is the delivery after payment?',
    answer: 'Instant delivery! As soon as your UPI, Card, or NetBanking payment is completed, your game license or credentials appear immediately in your on-screen Game Vault. They are also sent directly to your registered WhatsApp mobile number and email address within 2-5 minutes.'
  },
  {
    question: 'Is it safe? Will my personal Steam or PlayStation account be banned?',
    answer: '100% safe. You never provide your personal Steam or PSN password to us. You either activate an official CD-Key directly on your personal account or log into our separate clean account, which is completely isolated from your personal profile. There is zero risk of ban or penalty.'
  },
  {
    question: 'What is your Lifetime Replacement Warranty?',
    answer: 'We provide a lifetime replacement guarantee on all games and accounts purchased from AAA GAMES. If you ever face password changes, Steam guards, or setup issues, simply message our 24/7 WhatsApp customer care (+91 9442964232) with your Order ID for an immediate free replacement or fix.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We support all popular Indian and international payment methods with 0% surcharge, including UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay), NetBanking, and Digital Wallets.'
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Everything you need to know about digital keys, accounts, activation and warranty
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-100 hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
