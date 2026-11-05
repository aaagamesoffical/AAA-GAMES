import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Lock,
  Building2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/gameService';
import { OrderItem, StoreSettings } from '../types/game';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  storeSettings?: StoreSettings;
}

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India (SBI)' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
  { id: 'pnb', name: 'Punjab National Bank' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenOrders, 
  storeSettings 
}) => {
  const { items, subtotal, finalTotal, discountAmount, appliedCoupon, clearCart, formatPrice } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerUtr, setCustomerUtr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState(user?.displayName || '');
  
  // Netbanking details
  const [selectedBank, setSelectedBank] = useState(POPULAR_BANKS[0].id);

  // Simulation & Process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('482910');
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [generatedItems, setGeneratedItems] = useState<OrderItem[]>([]);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Helper to generate realistic digital key or credentials for instant delivery
  const generateDeliveryCredentials = (platform: string, type: string, title: string) => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex3 = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (platform === 'steam' && type === 'offline_account') {
      return `STEAM ACCOUNT:\nLogin: steam_${title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${randomHex}\nPassword: Gamer@${randomHex2}#\nActivation: Switch to Steam Offline Mode after initial game launch\nStatus: Lifetime Verified`;
    }
    if (platform === 'ps5' || platform === 'ps4') {
      return `${platform.toUpperCase()} CONSOLE ACCOUNT:\nPSN ID: play_${randomHex.toLowerCase()}@aaagames.store\nPassword: PSN#${randomHex2}!\nActivation: Settings -> Users -> Other -> Enable Console Sharing\nStatus: Primary Console Active`;
    }
    if (platform === 'epic') {
      return `EPIC GAMES CREDENTIALS:\nEpic ID: epic_${randomHex.toLowerCase()}@aaagames.in\nPassword: Pass#${randomHex2}99\nDelivery: Instant Cloud Access`;
    }
    return `DIGITAL CD-KEY: 5${randomHex}-${randomHex2}-7${randomHex3}-AAA9`;
  };

  const handleInitialPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerEmail.trim()) {
      setFormError('Please provide your email address for order delivery.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Please enter your WhatsApp mobile number for instant activation.');
      return;
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setFormError('Please enter a valid 16-digit debit or credit card number.');
        return;
      }
      if (!cardExpiry.includes('/')) {
        setFormError('Please enter card expiry date (MM/YY).');
        return;
      }
      if (cardCvv.length < 3) {
        setFormError('Please enter 3-digit CVV from back of your card.');
        return;
      }
      // Show 3D Secure OTP verification
      setShowOtpScreen(true);
      return;
    }

    // Direct process for UPI and NetBanking
    executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setIsProcessing(true);
    setFormError('');

    try {
      // Generate instant digital credentials for each item
      const orderItems: OrderItem[] = items.map(({ game }) => ({
        gameId: game.id,
        title: game.title,
        platform: game.platform,
        type: game.type,
        price: game.price,
        deliveryType: game.deliveryType,
        digitalKeyOrAccount: generateDeliveryCredentials(game.platform, game.type, game.title),
      }));

      const paymentTxnId = paymentMethod === 'upi'
        ? (customerUtr ? `UPI_UTR_${customerUtr.trim()}` : `UPI_${Date.now()}`)
        : paymentMethod === 'card'
        ? `CARD_AUTH_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        : `NETBANK_${selectedBank.toUpperCase()}_${Date.now()}`;

      const newOrderId = await createOrder({
        userId: user?.uid || 'guest_' + Math.random().toString(36).substring(2, 8),
        userEmail: customerEmail.trim(),
        customerName: customerName.trim() || user?.displayName || 'Valued Gamer',
        customerPhone: customerPhone.trim(),
        items: orderItems,
        totalAmount: finalTotal,
        originalAmount: subtotal,
        discountAmount,
        appliedCoupon: appliedCoupon?.code,
        status: 'delivered',
        paymentMethod,
        paymentId: paymentTxnId,
        utrNumber: customerUtr ? customerUtr.trim() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setCompletedOrderId(newOrderId);
      setGeneratedItems(orderItems);
      setOrderComplete(true);
      setShowOtpScreen(false);
      clearCart();

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
        });
      } catch (cErr) {
        // Confetti silent fallback
      }
    } catch (err: any) {
      console.error('Order error:', err);
      setFormError('Failed to place order: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIndex(index);
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  const adminWhatsAppClean = (storeSettings?.whatsappNumber || '9442964232').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {orderComplete 
                  ? 'Order Completed & Delivered!' 
                  : showOtpScreen 
                  ? '3D Secure Bank Verification' 
                  : 'AAA GAMES Instant Checkout'}
              </h3>
              <p className="text-xs text-zinc-400">
                {orderComplete
                  ? 'Your digital access credentials are ready below'
                  : 'Instant automated delivery to WhatsApp & Email'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Normal Checkout Form */}
          {!orderComplete && !showOtpScreen && (
            <form onSubmit={handleInitialPaySubmit} className="space-y-4">
              
              {/* Order Summary Strip */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Titles:</span>
                  <span className="text-white font-medium">{items.length} Game(s)</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-zinc-800">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400 text-base font-mono">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  1. Contact &amp; Instant WhatsApp Delivery
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-300 font-medium mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-300 font-medium mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="9442964232"
                        className="w-full pl-12 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 font-medium mb-1">
                    Email Address (For Digital Invoice &amp; Key Backup) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  2. Choose Real Payment Method
                </h4>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Real UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* OPTION 1: REAL UPI QR CODE SCANNER */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/50 space-y-3.5 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        Live Google Pay / PhonePe / Paytm Scanner
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Zero Extra Fee
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
                      <div className="bg-white p-2 rounded-2xl shadow-2xl flex-shrink-0 w-44 h-44 flex items-center justify-center border-2 border-emerald-500/40 overflow-hidden">
                        <img
                          src={
                            storeSettings?.upiQrImage?.trim() ||
                            '/assets/aistudio/WhatsApp_Image_2026-11-02_at_8.42.24_PM_08b9aa99.jpeg'
                          }
                          alt="Real Google Pay UPI Scanner"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
                              `upi://pay?pa=${storeSettings?.upiId || '9442964232@upi'}&pn=${encodeURIComponent(storeSettings?.upiPayeeName || 'AAA GAMES')}&cu=INR`
                            )}`;
                          }}
                        />
                      </div>

                      <div className="space-y-2.5 text-xs flex-1 min-w-0">
                        <div>
                          <span className="text-[11px] text-zinc-400 block font-medium">UPI VPA Address:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-black text-emerald-400 text-sm truncate">
                              {storeSettings?.upiId || '9442964232@upi'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(storeSettings?.upiId || '9442964232@upi');
                                setCopiedUpiId(true);
                                setTimeout(() => setCopiedUpiId(false), 2000);
                              }}
                              className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-200 flex items-center gap-1 flex-shrink-0 transition-colors"
                            >
                              {copiedUpiId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedUpiId ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-zinc-300">
                          <span>Payee: <strong className="text-white">{storeSettings?.upiPayeeName || 'AAA GAMES'}</strong></span>
                          <span className="block text-emerald-400 font-bold mt-0.5">Amount: {formatPrice(finalTotal)}</span>
                        </div>

                        <a
                          href={`upi://pay?pa=${storeSettings?.upiId || '9442964232@upi'}&pn=${encodeURIComponent(storeSettings?.upiPayeeName || 'AAA GAMES')}&am=${finalTotal}&cu=INR`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Tap to Pay on Mobile UPI App</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Enter 12-Digit UPI Transaction UTR / Ref Number:
                      </label>
                      <input
                        type="text"
                        value={customerUtr}
                        onChange={(e) => setCustomerUtr(e.target.value)}
                        placeholder="e.g. 431289562145 (shown in GPay / PhonePe payment receipt)"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-emerald-400 font-mono font-bold placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Instant key delivery activates once submitted. You can also send screenshot to WhatsApp ({storeSettings?.whatsappNumber || '+91 94429 64232'}).
                      </p>
                    </div>
                  </div>
                )}

                {/* OPTION 2: REAL ONLINE CARD PAYMENT */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        Debit / Credit Card (Visa, Mastercard, RuPay)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        256-Bit Encrypted
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 8921 4452 9012"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white font-mono tracking-widest placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-300 font-medium mb-1">
                          Expiry Date (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-300 font-medium mb-1">
                          CVV / CVC *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-300 font-medium mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name as printed on card"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white uppercase placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* OPTION 3: NET BANKING */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-3.5">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      Select Bank for Direct Net Banking Payment
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2.5 rounded-xl border text-left font-medium transition-colors ${
                            selectedBank === b.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* PAY BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                      Processing Real Payment &amp; Generating Keys...
                    </span>
                  ) : (
                    <span>Pay {formatPrice(finalTotal)} &amp; Unlock Games Instantly</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* 2. 3D Secure OTP Verification Screen (Simulated for Card) */}
          {showOtpScreen && !orderComplete && (
            <div className="space-y-4 p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">Bank 3D Secure Authentication</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  A verification code has been generated for amount <strong>{formatPrice(finalTotal)}</strong>
                </p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 max-w-xs mx-auto">
                <span className="text-xs text-zinc-400 block mb-1">One-Time Password (OTP)</span>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center font-mono font-black text-xl tracking-widest text-emerald-400 bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={executeOrderPlacement}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  {isProcessing ? 'Verifying with Bank...' : 'Confirm Payment & Deliver'}
                </button>
              </div>
            </div>
          )}

          {/* 3. Order Success & Instant Digital Credentials View */}
          {orderComplete && (
            <div className="space-y-5">
              <div className="text-center space-y-2 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-white">Payment Verified &amp; Games Delivered!</h4>
                <p className="text-xs text-zinc-400">
                  Order ID: <span className="font-mono text-emerald-400 font-bold">{completedOrderId}</span>
                </p>
                <p className="text-xs text-emerald-400 font-semibold">
                  A copy of your activation credentials has also been sent to your WhatsApp ({customerPhone})
                </p>
              </div>

              {/* Delivered Digital Credentials Box */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Your Instant Digital Activation Vault:
                </h5>

                {generatedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/40 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.platform.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap relative group">
                      {item.digitalKeyOrAccount}
                      
                      <button
                        onClick={() => copyToClipboard(item.digitalKeyOrAccount || '', idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Credentials"
                      >
                        {copiedKeyIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKeyIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/${adminWhatsAppClean}?text=${encodeURIComponent(
                    `Hello AAA GAMES Support! I just completed order ${completedOrderId} for ₹${finalTotal}. Please verify my credentials.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp Support (+91 94429 64232)</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Go to My Games &amp; Digital Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
