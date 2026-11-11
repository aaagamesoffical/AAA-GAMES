import React, { useState } from 'react';
import { 
  Gamepad2, 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  Package, 
  Menu, 
  X, 
  Flame, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Platform } from '../types/game';

interface NavbarProps {
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenWishlist: () => void;
  storeName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedPlatform,
  onSelectPlatform,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  onOpenAdmin,
  onOpenOrders,
  onOpenWishlist,
  storeName = 'AAA GAMES',
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen, currency, setCurrency, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const platforms: { id: Platform | 'all'; label: string; badge?: string }[] = [
    { id: 'all', label: 'All Games' },
    { id: 'steam', label: 'Steam PC', badge: 'Hot' },
    { id: 'epic', label: 'Epic Games' },
    { id: 'ps5', label: 'PlayStation 5', badge: 'Popular' },
    { id: 'ps4', label: 'PlayStation 4' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-emerald-500/20 text-white shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo - Futuristic Cyber Style */}
          <div 
            onClick={() => onSelectPlatform('all')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-indigo-500 p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-3xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  {storeName.split(' ')[0]} <span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">{storeName.split(' ').slice(1).join(' ') || 'GAMES'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 tracking-wider">
                  STORE
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block tracking-widest uppercase font-mono font-semibold">
                STEAM • EPIC • PS4 • PS5
              </p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Steam, Epic, PS5 games (e.g. GTA V, Wukong, Spider-Man)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3 text-xs text-zinc-500 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Currency Switcher (Visible on tablet and desktop) */}
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 sm:py-1 rounded-md transition-colors ${
                  currency === 'INR' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 sm:py-1 rounded-md transition-colors ${
                  currency === 'USD' ? 'bg-emerald-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Admin Dashboard Button (Desktop) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold shadow-sm shadow-emerald-500/10"
                title="Admin Control Panel"
              >
                <Sparkles className="w-3 h-3 animate-pulse text-emerald-300" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-1.5 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 relative transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="bg-zinc-950 text-emerald-400 text-[10px] sm:text-xs px-1.5 py-0.2 sm:py-0.5 rounded-full font-extrabold min-w-[18px] text-center">
                {totalItemsCount}
              </span>
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-emerald-500/50"
                      />
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-xs font-medium text-zinc-200 hidden md:inline max-w-[100px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-sm">
                      <div className="px-4 py-2 border-b border-zinc-800">
                        <p className="font-semibold text-white truncate">{user.displayName || 'Gamer Account'}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Verified Admin
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenOrders();
                        }}
                        className="w-full px-4 py-2.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span>My Games &amp; Digital Keys</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full px-4 py-2.5 text-left text-emerald-400 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors font-semibold"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}

                      <div className="border-t border-zinc-800 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-rose-400 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 hover:text-white text-xs font-semibold transition-all"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Platform Filter Navigation Bar */}
        <div className="hidden lg:flex items-center gap-1 py-2.5 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
          {platforms.map((p) => {
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPlatform(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {p.id === 'steam' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                {p.id === 'epic' && <span className="w-2 h-2 rounded-full bg-neutral-400" />}
                {p.id === 'ps5' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                {p.id === 'ps4' && <span className="w-2 h-2 rounded-full bg-sky-500" />}
                {p.id === 'all' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                <span>{p.label}</span>
                {p.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold uppercase">
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Search and Platform Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPlatform(p.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-colors ${
                    selectedPlatform === p.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Mobile Currency Switcher */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <span className="text-zinc-400 font-semibold">Store Currency:</span>
              <div className="flex items-center bg-zinc-950 border border-zinc-700/80 rounded-lg p-0.5 font-bold">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    currency === 'INR' ? 'bg-emerald-500 text-black font-extrabold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    currency === 'USD' ? 'bg-emerald-500 text-black font-extrabold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <button
                onClick={() => {
                  onOpenOrders();
                  setMobileMenuOpen(false);
                }}
                className="text-emerald-400 font-semibold"
              >
                📦 My Games &amp; Digital Keys
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="text-emerald-400 font-bold"
                >
                  ⚙️ Admin Panel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
