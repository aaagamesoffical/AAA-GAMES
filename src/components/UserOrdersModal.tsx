import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Copy, 
  Check, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { subscribeToUserOrders } from '../services/gameService';
import { Order } from '../types/game';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user } = useAuth();
  const { formatPrice } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;
    const unsub = subscribeToUserOrders(user.uid, user.email || undefined, (loadedOrders) => {
      setOrders(loadedOrders);
    });
    return () => unsub();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(txt);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">My Game Vault &amp; License Keys</h3>
              <p className="text-xs text-zinc-400">Access all your purchased games, accounts and activation codes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {!user ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Sign In to View Your Games</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Log into your account to securely access purchased Steam, Epic, PS4 and PS5 game credentials.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Sign In with Google or Email
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">No Purchased Games Yet</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Games purchased from our catalog will automatically appear here with your activation keys and credentials.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Explore Cheap Games Catalog
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{order.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Total Paid:</span>
                    <span className="text-base font-black text-white">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{item.title}</span>
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                            {item.platform}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">{formatPrice(item.price)}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap relative">
                        {item.digitalKeyOrAccount || 'Processing credentials... please check WhatsApp or refresh'}
                        {item.digitalKeyOrAccount && (
                          <button
                            onClick={() => copyText(item.digitalKeyOrAccount || '')}
                            className="absolute top-2 right-2 p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
                          >
                            {copiedKey === item.digitalKeyOrAccount ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="text-[10px]">
                              {copiedKey === item.digitalKeyOrAccount ? 'Copied' : 'Copy'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Protected with Lifetime Replacement Warranty</span>
                  </div>
                  <a
                    href={`https://wa.me/919876543210?text=Hello%20CheapPCGames%20Support%2C%20need%20assistance%20with%20Order%20${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Support for this Order</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
