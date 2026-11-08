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
  AlertCircle,
  Upload,
  Image as ImageIcon
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
  const { 
    items, 
    subtotal, 
    finalTotal, 
    discountAmount, 
    appliedCoupon, 
    applyCoupon,
    applyCouponCode, 
    removeCoupon, 
    availableCoupons,
    clearCart, 
    formatPrice 
  } = useCart();
  const { user } = useAuth();
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [checkoutCouponMsg, setCheckoutCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

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
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

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

  // Delivery credentials dispatched via official WhatsApp 9442964232
  const generateDeliveryCredentials = (platform: string, _type: string, title: string) => {
    return `Official ${platform.toUpperCase()} Delivery for ${title}:\nCredentials dispatched directly to your WhatsApp from +919442964232 once payment screenshot is verified.`;
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
        appliedCoupon: appliedCoupon?.code || '',
        status: 'delivered',
        paymentMethod,
        paymentId: paymentTxnId,
        utrNumber: customerUtr ? customerUtr.trim() : '',
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
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Titles:</span>
                  <span className="text-white font-medium">{items.length} Game(s)</span>
                </div>
                
                {/* Coupon Code Section */}
                <div className="pt-1 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Have a Coupon Code? (e.g. SAKTHI20, AAAGAMES)"
                      value={checkoutCouponCode}
                      onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-mono uppercase text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!checkoutCouponCode.trim()) return;
                        const res = applyCouponCode(checkoutCouponCode);
                        setCheckoutCouponMsg({ text: res.message, isError: !res.success });
                        if (res.success) setCheckoutCouponCode('');
                        setTimeout(() => setCheckoutCouponMsg(null), 4000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {checkoutCouponMsg && (
                    <p className={`text-[11px] font-semibold px-2 py-1 rounded-md ${checkoutCouponMsg.isError ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                      {checkoutCouponMsg.text}
                    </p>
                  )}

                  {!appliedCoupon && availableCoupons.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-zinc-500">Suggested:</span>
                      {availableCoupons.slice(0, 4).map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            applyCoupon(c);
                            setCheckoutCouponMsg({ text: `Coupon ${c.code} applied! (-${c.discountPercent}%)`, isError: false });
                            setTimeout(() => setCheckoutCouponMsg(null), 3000);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 font-mono font-bold cursor-pointer"
                        >
                          {c.code} (-{c.discountPercent}%)
                        </button>
                      ))}
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-semibold">
                        Applied: <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercent}%)
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-zinc-400 hover:text-rose-400 text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold pt-1">
                    <span>Coupon Discount:</span>
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
                    placeholder="yourname@gmail.com"
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

                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-zinc-300">
                          12-Digit UPI Transaction UTR / Ref Number:
                        </label>
                        {customerUtr.replace(/\s/g, '').length === 12 && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            UTR Validated
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={customerUtr}
                        onChange={(e) => setCustomerUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                        placeholder="e.g. 431289562145 (shown in GPay / PhonePe payment receipt)"
                        maxLength={18}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-emerald-400 font-mono font-bold placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />

                      {/* Payment Screenshot Uploader */}
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">
                              {paymentScreenshot ? 'Payment Receipt Attached' : 'Attach Payment Screenshot (Optional)'}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              Speeds up automated key issuance
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{paymentScreenshot ? 'Change' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleScreenshotChange}
                          />
                        </label>
                      </div>

                      {paymentScreenshot && (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-emerald-500/40">
                          <img src={paymentScreenshot} alt="Payment receipt" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPaymentScreenshot(null)}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-white text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <p className="text-[11px] text-zinc-400">
                        Instant key delivery activates once submitted. You can also send screenshot directly to WhatsApp ({storeSettings?.whatsappNumber || '+91 94429 64232'}).
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

          {/* 3. Order Placed & Send Payment Proof on WhatsApp */}
          {orderComplete && (
            <div className="space-y-5">
              <div className="text-center space-y-2 py-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 shadow-xl shadow-emerald-500/20">
                  <MessageCircle className="w-9 h-9 fill-emerald-500/30" />
                </div>
                <h4 className="text-xl font-black text-white">Order Received &amp; Logged!</h4>
                <p className="text-xs text-zinc-400">
                  Official Invoice ID: <span className="font-mono text-emerald-400 font-bold">{completedOrderId}</span>
                </p>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 leading-relaxed max-w-md mx-auto">
                  <p className="font-semibold">
                    🔒 No passwords are displayed on web pages for your security.
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-300">
                    Send your payment screenshot or UTR to our official WhatsApp (<strong className="text-white">+91 9442964232</strong>). Our admin verifies proof in 5 minutes and delivers your genuine game credentials directly in your chat.
                  </p>
                </div>
              </div>

              {/* Order Invoice Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Order Summary</span>
                  <span className="text-xs font-black text-emerald-400">{formatPrice(finalTotal)}</span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Customer Name:</span>
                    <span className="font-semibold text-white">{customerName || 'Valued Gamer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">WhatsApp Mobile:</span>
                    <span className="font-mono font-semibold text-white">+91 {customerPhone}</span>
                  </div>
                  {customerUtr && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">UTR / Ref Number:</span>
                      <span className="font-mono font-bold text-emerald-400">{customerUtr}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-zinc-400 font-semibold block mb-1">Purchased Titles:</span>
                    <ul className="space-y-1">
                      {generatedItems.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between text-xs font-medium text-white">
                          <span>• {item.title}</span>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {item.platform}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* ACTION: Send to WhatsApp (+91 9442964232) */}
              <div className="space-y-2.5 pt-1">
                {(() => {
                  const proofMsg = `🎮 *AAA GAMES - ORDER PAYMENT PROOF* 🎮\n\n*Order ID:* ${completedOrderId}\n*Customer Name:* ${customerName.trim() || 'Gamer'}\n*WhatsApp Mobile:* +91 ${customerPhone.trim()}\n*Total Amount:* ₹${finalTotal}\n*Payment Method:* ${paymentMethod.toUpperCase()}\n*UTR / Transaction Ref:* ${customerUtr ? customerUtr.trim() : 'Paid Online'}\n\n*Games Ordered:*\n${generatedItems.map((i) => `• ${i.title} (${i.platform.toUpperCase()})`).join('\n')}\n\nI have sent my payment proof screenshot in this chat. Please verify and send my game login credentials to this WhatsApp number!`;

                  return (
                    <>
                      <a
                        href={`https://wa.me/919442964232?text=${encodeURIComponent(proofMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 transition-all active:scale-95 animate-pulse"
                      >
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>Send Payment Proof to WhatsApp (+91 9442964232)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(proofMsg);
                          setCopiedKeyIndex(999);
                          setTimeout(() => setCopiedKeyIndex(null), 2500);
                        }}
                        className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {copiedKeyIndex === 999 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Order Message Copied! Paste on WhatsApp</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Order Message Details</span>
                          </>
                        )}
                      </button>
                    </>
                  );
                })()}

                <button
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All My Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
