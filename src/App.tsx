import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Sparkles, 
  Filter, 
  Layers, 
  ArrowUpDown, 
  Gamepad2, 
  Check, 
  Search,
  Tag,
  ShieldCheck,
  Zap,
  TrendingDown,
  Gift
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Banner } from './components/Banner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { UserOrdersModal } from './components/UserOrdersModal';
import { WishlistModal } from './components/WishlistModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { WhatsAppSupport } from './components/WhatsAppSupport';
import { CustomerReviews } from './components/CustomerReviews';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { Game, Platform, StoreSettings } from './types/game';
import { subscribeToGames, subscribeToStoreSettings, DEFAULT_STORE_SETTINGS } from './services/gameService';
import { INITIAL_GAMES } from './data/initialGames';

function MainStore() {
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Modals state
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Subscribe to Firestore games catalog and store settings
  useEffect(() => {
    const unsubGames = subscribeToGames((loadedGames) => {
      if (loadedGames && loadedGames.length > 0) {
        setGames(loadedGames);
      }
    });
    const unsubSettings = subscribeToStoreSettings((loadedSettings) => {
      setStoreSettings(loadedSettings);
    });
    return () => {
      unsubGames();
      unsubSettings();
    };
  }, []);

  // Unique genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    games.forEach((g) => {
      if (g.genre) {
        g.genre.split('/').forEach((part) => set.add(part.trim()));
      }
    });
    return ['all', ...Array.from(set)];
  }, [games]);

  // Filtered and sorted games
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Platform filter
    if (selectedPlatform !== 'all') {
      result = result.filter((g) => g.platform === selectedPlatform);
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((g) =>
        g.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          g.platform.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      );
    }

    // In Stock filter
    if (inStockOnly) {
      result = result.filter((g) => g.inStock);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [games, selectedPlatform, selectedGenre, searchQuery, inStockOnly, sortBy]);

  const dealsOfTheDay = useMemo(() => {
    return games.filter((g) => g.isDealOfTheDay || g.discountPercent >= 85).slice(0, 4);
  }, [games]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Top Banner */}
      <Banner 
        announcementText={storeSettings.announcementText}
        whatsappNumber={storeSettings.whatsappNumber}
      />

      {/* Main Navbar */}
      <Navbar
        selectedPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        storeName={storeSettings.storeName}
      />

      {/* Hero Showcase */}
      <Hero
        onSelectPlatform={(plat) => {
          setSelectedPlatform(plat);
          scrollToCatalog();
        }}
        onExploreDeals={scrollToCatalog}
        storeName={storeSettings.storeName}
      />

      {/* Deals of the Day Flash Strip */}
      {dealsOfTheDay.length > 0 && selectedPlatform === 'all' && !searchQuery && (
        <section className="py-8 bg-zinc-900/40 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Flash Deals of the Day
                  </h2>
                  <p className="text-xs text-zinc-400">Limited quantities at maximum discounts up to 90%</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-400 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Updated Daily
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {dealsOfTheDay.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelectGame={setSelectedGameForModal}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Games Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        {/* Catalog Filter & Sort Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left title & count */}
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>
                  {selectedPlatform === 'all'
                    ? 'Explore All Digital Games'
                    : `${selectedPlatform.toUpperCase()} Games Collection`}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {filteredGames.length} titles
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Instant delivery keys, offline activation accounts &amp; console primary IDs
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              
              {/* Genre Filter */}
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none capitalize text-xs"
                >
                  <option value="all" className="bg-zinc-900">All Genres</option>
                  {availableGenres.filter((g) => g !== 'all').map((genre) => (
                    <option key={genre} value={genre} className="bg-zinc-900">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white font-semibold focus:outline-none text-xs"
                >
                  <option value="featured" className="bg-zinc-900">Featured First</option>
                  <option value="price-asc" className="bg-zinc-900">Price: Low to High</option>
                  <option value="price-desc" className="bg-zinc-900">Price: High to Low</option>
                  <option value="rating" className="bg-zinc-900">Highest Rated</option>
                  <option value="discount" className="bg-zinc-900">Biggest Discount</option>
                </select>
              </div>

              {/* In Stock toggle */}
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  inStockOnly
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                In Stock Only
              </button>
            </div>
          </div>

          {/* Quick Platform Tabs on mobile */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {(['all', 'steam', 'epic', 'ps5', 'ps4'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedPlatform === plat
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-950 text-zinc-400'
                }`}
              >
                {plat === 'all' ? 'All Platforms' : plat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={setSelectedGameForModal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">No games matched your filters</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Try searching for something else or reset the platform and genre filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPlatform('all');
                setSelectedGenre('all');
                setSearchQuery('');
                setInStockOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Verified Customer Reviews & Trust Pilot Section */}
      <CustomerReviews games={games} />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer
        onSelectPlatform={(plat) => {
          setSelectedPlatform(plat);
          scrollToCatalog();
        }}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        whatsappNumber={storeSettings.whatsappNumber}
        storeName={storeSettings.storeName}
      />

      {/* WhatsApp Floating Button */}
      <WhatsAppSupport 
        whatsappNumber={storeSettings.whatsappNumber} 
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGameForModal}
        onClose={() => setSelectedGameForModal(null)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Checkout Modal with Real UPI Scanner and WhatsApp */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        storeSettings={storeSettings}
      />

      {/* User Orders / My Game Vault Modal */}
      <UserOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        allGames={games}
        onSelectGame={(g) => setSelectedGameForModal(g)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        storeName={storeSettings.storeName}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        games={games}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStore />
      </CartProvider>
    </AuthProvider>
  );
}
