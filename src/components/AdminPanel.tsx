import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Tag, 
  Package, 
  DollarSign, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  TrendingUp,
  Search,
  Check,
  Percent,
  Gamepad2,
  Clock,
  Phone,
  Mail,
  QrCode,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  Copy,
  Users,
  Star,
  MessageSquare,
  LogOut,
  Upload,
  Wand2,
  Send,
  Smartphone,
  Terminal,
  Bot,
  Zap
} from 'lucide-react';
import { Game, Coupon, Order, Platform, ProductType, StoreSettings, NewsletterSubscriber, Review } from '../types/game';
import { 
  saveGame, 
  deleteGame, 
  seedInitialGames, 
  subscribeToCoupons, 
  saveCoupon, 
  deleteCoupon,
  subscribeToAllOrders,
  updateOrderStatus,
  subscribeToStoreSettings,
  saveStoreSettings,
  subscribeToNewsletterSubscribers,
  subscribeToAllReviews,
  deleteReview,
  addReview,
  updateReview,
  clearAllReviews,
  DEFAULT_STORE_SETTINGS
} from '../services/gameService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
}

const PRESET_GAME_COVERS = [
  { label: 'GTA V (Steam App 271590)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900_2x.jpg' },
  { label: 'Black Myth: Wukong (Steam 2358720)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2358720/library_600x900_2x.jpg' },
  { label: 'God of War Ragnarök (Steam 2322010)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2322010/library_600x900_2x.jpg' },
  { label: 'Spider-Man Remastered (Steam 1817070)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1817070/library_600x900_2x.jpg' },
  { label: 'Red Dead Redemption 2 (Steam 1174180)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900_2x.jpg' },
  { label: 'Cyberpunk 2077 (Steam 1091500)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900_2x.jpg' },
  { label: 'Elden Ring Erdtree (Steam 1245620)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900_2x.jpg' },
  { label: 'EA SPORTS FC 25 (Steam 2669320)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2669320/library_600x900_2x.jpg' },
  { label: 'Ghost of Tsushima (Steam 2215430)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2215430/library_600x900_2x.jpg' },
  { label: 'Forza Horizon 5 (Steam 1551360)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1551360/library_600x900_2x.jpg' },
  { label: 'The Last of Us Part I (Steam 1888930)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900_2x.jpg' },
  { label: 'Hogwarts Legacy (Steam 990080)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/990080/library_600x900_2x.jpg' },
  { label: 'Resident Evil 4 Remake (Steam 2050650)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/2050650/library_600x900_2x.jpg' },
  { label: 'Tekken 8 (Steam 1778820)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1778820/library_600x900_2x.jpg' },
  { label: 'Helldivers 2 (Steam 553850)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/553850/library_600x900_2x.jpg' },
  { label: 'Call of Duty MW3 (Steam 1938090)', url: 'https://shared.steamstatic.com/store_item_assets/steam/apps/1938090/library_600x900_2x.jpg' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, games }) => {
  const { formatPrice } = useCart();
  const { logoutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'games' | 'whatsapp' | 'settings' | 'coupons' | 'orders' | 'newsletter' | 'reviews' | 'analytics'>('games');
  
  // Games state
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isNewGame, setIsNewGame] = useState(false);
  const [gameSearch, setGameSearch] = useState('');
  const [savingGame, setSavingGame] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [generatingCopy, setGeneratingCopy] = useState(false);

  // WhatsApp Bot Direct Command State
  const [waCommandInput, setWaCommandInput] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [waWebhookTesting, setWaWebhookTesting] = useState(false);
  const [waWebhookStatus, setWaWebhookStatus] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [waLogs, setWaLogs] = useState<Array<{ sender: 'admin' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '🤖 *AAA GAMES WHATSAPP COMMAND ENGINE ONLINE*\nAuthorized Admin Phone: +91 9442964232\n\nYou can control the entire store by sending WhatsApp text messages from +91 9442964232 or typing commands directly into this terminal.\n\nType *HELP* or click quick action buttons below to test commands!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
  const [newCouponMinSpend, setNewCouponMinSpend] = useState<number>(300);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivered' | 'paid' | 'processing'>('all');

  // Store Settings (Real UPI & WhatsApp)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  // Newsletter Subscribers
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [copiedEmails, setCopiedEmails] = useState(false);

  // Customer Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEditingReviewModal, setIsEditingReviewModal] = useState(false);
  const [reviewFormState, setReviewFormState] = useState<{
    id?: string;
    gameId: string;
    gameTitle: string;
    userName: string;
    rating: number;
    comment: string;
    verifiedPurchase: boolean;
    images: string[];
  }>({
    gameId: '',
    gameTitle: '',
    userName: '',
    rating: 5,
    comment: '',
    verifiedPurchase: true,
    images: []
  });
  const [reviewImageUrlInput, setReviewImageUrlInput] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [previewAdminModalImg, setPreviewAdminModalImg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsubCoupons = subscribeToCoupons((loadedCoupons) => setCoupons(loadedCoupons));
    const unsubOrders = subscribeToAllOrders((loadedOrders) => setOrders(loadedOrders));
    const unsubSettings = subscribeToStoreSettings((settings) => setStoreSettings(settings));
    const unsubSubscribers = subscribeToNewsletterSubscribers((subs) => setSubscribers(subs));
    const unsubReviews = subscribeToAllReviews((loadedReviews) => setReviews(loadedReviews));

    return () => {
      unsubCoupons();
      unsubOrders();
      unsubSettings();
      unsubSubscribers();
      unsubReviews();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // WhatsApp Command Sender
  const handleSendWhatsAppCommand = async (customCmd?: string) => {
    const cmd = (customCmd || waCommandInput).trim();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaLogs(prev => [...prev, { sender: 'admin', text: cmd, time: timeStr }]);
    if (!customCmd) setWaCommandInput('');
    setWaSending(true);

    try {
      const res = await fetch('/api/whatsapp/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          sender: '9442964232'
        })
      });
      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setWaLogs(prev => [...prev, {
        sender: 'bot',
        text: data.reply || (data.success ? 'Command executed successfully.' : `Error: ${data.error}`),
        time: replyTime
      }]);
      showNotification('WhatsApp command executed!');
    } catch (err: any) {
      setWaLogs(prev => [...prev, {
        sender: 'bot',
        text: `⚠️ Network error: ${err.message || 'Failed to reach command server'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setWaSending(false);
    }
  };

  const handleTestWebhook = async () => {
    setWaWebhookTesting(true);
    setWaWebhookStatus(null);
    try {
      const res = await fetch('/api/whatsapp/webhook');
      const data = await res.json();
      setWaWebhookStatus(`✅ Webhook verified: ${data.status} | Authorized: ${data.authorizedPhone}`);
      showNotification('Webhook verified online!');
    } catch (err: any) {
      setWaWebhookStatus(`❌ Webhook check failed: ${err.message}`);
    } finally {
      setWaWebhookTesting(false);
    }
  };

  // File Upload to DataURL for instantaneous cover/banner images
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'bannerImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && editingGame) {
        setEditingGame({
          ...editingGame,
          [field]: dataUrl,
          ...(field === 'coverImage' && !editingGame.bannerImage ? { bannerImage: dataUrl } : {})
        });
        showNotification(`${field === 'coverImage' ? 'Cover Art' : 'Banner Art'} successfully loaded!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Game Copy Generator using backend Gemini
  const handleGenerateAiCopy = async () => {
    if (!editingGame?.title?.trim()) {
      alert('Please fill in the Game Title first so AI can generate accurate information.');
      return;
    }

    setGeneratingCopy(true);
    try {
      const res = await fetch('/api/ai/generate-game-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingGame.title,
          platform: editingGame.platform || 'steam',
          genre: editingGame.genre || 'Action'
        })
      });
      const data = await res.json();
      if (editingGame) {
        setEditingGame({
          ...editingGame,
          description: data.description || editingGame.description,
          activationGuide: data.activationGuide || editingGame.activationGuide,
          systemRequirements: data.systemRequirements || editingGame.systemRequirements
        });
        showNotification('✨ AI generated game synopsis and activation guide!');
      }
    } catch {
      showNotification('AI generation failed, using standard template.');
    } finally {
      setGeneratingCopy(false);
    }
  };

  // Handle Game Form Save
  const handleSaveGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame || !editingGame.title || !editingGame.platform) return;

    setSavingGame(true);
    try {
      const gameId = editingGame.id || `${editingGame.platform}-${Date.now()}`;
      const calculatedDiscount = editingGame.originalPrice && editingGame.price
        ? Math.round(((editingGame.originalPrice - editingGame.price) / editingGame.originalPrice) * 100)
        : editingGame.discountPercent || 0;

      const basePrice = Number(editingGame.tierPricing?.offlineSharing) || Number(editingGame.price) || 299;
      const tierPricing = {
        offlineSharing: basePrice,
        offlinePrivate: Number(editingGame.tierPricing?.offlinePrivate) || Math.round(basePrice * 1.5),
        onlineSharing: Number(editingGame.tierPricing?.onlineSharing) || Math.round(basePrice * 2.2),
        onlinePrivate: Number(editingGame.tierPricing?.onlinePrivate) || Math.round(basePrice * 3.2),
      };

      await saveGame({
        ...editingGame,
        id: gameId,
        slug: editingGame.slug || editingGame.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: editingGame.title,
        platform: editingGame.platform as Platform,
        type: (editingGame.type || 'offline_account') as ProductType,
        genre: editingGame.genre || 'Action',
        price: basePrice,
        originalPrice: Number(editingGame.originalPrice) || 2499,
        discountPercent: calculatedDiscount,
        tierPricing,
        description: editingGame.description || 'Digital game with instant activation.',
        coverImage: editingGame.coverImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        bannerImage: editingGame.bannerImage || editingGame.coverImage,
        edition: editingGame.edition || 'Standard Edition',
        deliveryType: editingGame.deliveryType || 'Instant Digital Delivery',
        activationGuide: editingGame.activationGuide || '1. Sign in to provided credentials.\n2. Download game from library.\n3. Enjoy!',
        systemRequirements: editingGame.systemRequirements || 'Windows 10/11 or Console Compatible',
        inStock: editingGame.inStock ?? true,
        stockCount: Number(editingGame.stockCount) || 20,
        isFeatured: Boolean(editingGame.isFeatured),
        isDealOfTheDay: Boolean(editingGame.isDealOfTheDay),
        rating: editingGame.rating || 4.9,
        reviewCount: editingGame.reviewCount || 10,
        createdAt: editingGame.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setEditingGame(null);
      setIsNewGame(false);
      showNotification('Game & Image successfully saved to store database!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving game: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingGame(false);
    }
  };

  const handleDeleteGame = async (gameId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the store catalog?`)) return;
    try {
      await deleteGame(gameId);
      showNotification(`"${title}" deleted successfully.`);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('This will seed the database with 20 official AAA games with high-res Steam DB covers. Continue?')) return;
    setSeeding(true);
    try {
      await seedInitialGames();
      showNotification('Catalog seeded successfully!');
    } catch (err: any) {
      alert('Seed failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveStoreSettings(storeSettings);
      showNotification('Real UPI Scanner and WhatsApp Number updated live!');
    } catch (err: any) {
      alert('Failed to update settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Copy Subscribers List
  const handleCopySubscribers = () => {
    const emails = subscribers.map((s) => s.email).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  // Handle Coupon Create
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    try {
      await saveCoupon({
        id: newCouponCode.trim().toUpperCase(),
        code: newCouponCode.trim().toUpperCase(),
        discountPercent: Number(newCouponDiscount),
        minSpend: Number(newCouponMinSpend),
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setNewCouponCode('');
      showNotification('Discount coupon created!');
    } catch (err: any) {
      alert('Failed to create coupon: ' + err.message);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteCoupon(code);
      showNotification(`Coupon ${code} deleted.`);
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDeleteReviewItem = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await deleteReview(reviewId);
      showNotification('Customer review deleted.');
    } catch (err: any) {
      alert('Delete review failed: ' + err.message);
    }
  };

  const handleOpenAddReview = () => {
    const defaultGame = games[0];
    setReviewFormState({
      gameId: defaultGame?.id || '',
      gameTitle: defaultGame?.title || 'Grand Theft Auto V: Premium Edition',
      userName: 'Verified Buyer (WhatsApp)',
      rating: 5,
      comment: 'Super fast delivery on WhatsApp (+91 9442964232). Switched to offline mode and game campaign works 100%!',
      verifiedPurchase: true,
      images: []
    });
    setReviewImageUrlInput('');
    setIsEditingReviewModal(true);
  };

  const handleOpenEditReview = (rev: Review) => {
    setReviewFormState({
      id: rev.id,
      gameId: rev.gameId,
      gameTitle: rev.gameTitle || '',
      userName: rev.userName,
      rating: rev.rating,
      comment: rev.comment,
      verifiedPurchase: rev.verifiedPurchase ?? true,
      images: rev.images || []
    });
    setReviewImageUrlInput('');
    setIsEditingReviewModal(true);
  };

  const handleReviewScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setReviewFormState(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddReviewImageUrl = () => {
    if (!reviewImageUrlInput.trim()) return;
    setReviewFormState(prev => ({
      ...prev,
      images: [...prev.images, reviewImageUrlInput.trim()]
    }));
    setReviewImageUrlInput('');
  };

  const handleRemoveReviewImage = (idxToRemove: number) => {
    setReviewFormState(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFormState.userName.trim() || !reviewFormState.comment.trim()) {
      alert('Please fill in customer name and comment.');
      return;
    }

    setIsSavingReview(true);
    try {
      const selectedGame = games.find(g => g.id === reviewFormState.gameId);
      const title = selectedGame?.title || reviewFormState.gameTitle || 'Digital Game';

      if (reviewFormState.id) {
        // Edit existing review
        await updateReview(reviewFormState.id, {
          gameId: reviewFormState.gameId,
          gameTitle: title,
          userName: reviewFormState.userName.trim(),
          rating: Number(reviewFormState.rating),
          comment: reviewFormState.comment.trim(),
          verifiedPurchase: reviewFormState.verifiedPurchase,
          images: reviewFormState.images,
        });
        showNotification('Review updated successfully with proof images!');
      } else {
        // Create new proof review
        await addReview({
          gameId: reviewFormState.gameId,
          gameTitle: title,
          userId: 'owner_sakthi_' + Date.now(),
          userName: reviewFormState.userName.trim(),
          rating: Number(reviewFormState.rating),
          comment: reviewFormState.comment.trim(),
          verifiedPurchase: reviewFormState.verifiedPurchase,
          images: reviewFormState.images,
        });
        showNotification('New customer proof review added live to store!');
      }
      setIsEditingReviewModal(false);
    } catch (err: any) {
      alert('Failed to save review: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleClearAllReviewsAction = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL customer reviews? This will remove all existing reviews so you can upload your genuine screenshot proofs. This cannot be undone.')) {
      return;
    }
    try {
      await clearAllReviews();
      showNotification('All reviews cleared! You can now upload your customer proof screenshots.');
    } catch (err: any) {
      alert('Failed to clear reviews: ' + err.message);
    }
  };

  // Filter games
  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(gameSearch.toLowerCase()) ||
    g.platform.toLowerCase().includes(gameSearch.toLowerCase()) ||
    Boolean(g.genre?.toLowerCase().includes(gameSearch.toLowerCase()))
  );

  // Analytics calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const platformStats = {
    steam: games.filter((g) => g.platform === 'steam').length,
    epic: games.filter((g) => g.platform === 'epic').length,
    ps5: games.filter((g) => g.platform === 'ps5').length,
    ps4: games.filter((g) => g.platform === 'ps4').length,
  };

  // UPI Scannable QR URL
  const generatedUpiQrUrl = storeSettings.upiQrImage?.trim() 
    ? storeSettings.upiQrImage.trim()
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
        `upi://pay?pa=${storeSettings.upiId.trim()}&pn=${encodeURIComponent(storeSettings.upiPayeeName.trim())}&cu=INR`
      )}`;

  const cleanWhatsApp = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white my-auto max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">Admin Control Center</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Verified Admin
                </span>
              </div>
              <p className="text-xs text-zinc-400">Edit games &amp; images, live UPI scanner, WhatsApp number &amp; promo offers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
              title="Populate store with default AAA catalog"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{seeding ? 'Seeding...' : 'Seed Catalog'}</span>
            </button>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-xs font-semibold text-red-300 border border-red-500/30 transition-colors"
              title="End admin session and lock access"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-zinc-950 px-4 py-2 text-xs font-black flex items-center gap-2 shadow-lg animate-fade-in flex-shrink-0">
            <CheckCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-950/60 flex-shrink-0 overflow-x-auto no-scrollbar text-xs sm:text-sm font-bold">
          <button
            onClick={() => {
              setActiveTab('games');
              setEditingGame(null);
            }}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'games'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manage Games ({games.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="flex items-center gap-1.5">
              <span>📱 WhatsApp Control</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                9442964232
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Real UPI &amp; WhatsApp Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Offers &amp; Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('newsletter')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'newsletter'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Subscribers ({subscribers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: GAMES MANAGEMENT (WITH PROMINENT IMAGE EDITING) */}
          {activeTab === 'games' && (
            <div className="space-y-5">
              
              {/* If Editing/Adding Game Form is Active */}
              {editingGame ? (
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        {isNewGame ? 'Add New Game to Store' : `Edit Game: ${editingGame.title}`}
                      </h4>
                      <p className="text-xs text-zinc-400">Edit titles, pricing, and live game cover &amp; banner art</p>
                    </div>
                    <button
                      onClick={() => setEditingGame(null)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white"
                    >
                      Back to List
                    </button>
                  </div>

                  <form onSubmit={handleSaveGameSubmit} className="space-y-5">
                    
                    {/* DEDICATED GAME IMAGE EDITOR SECTION */}
                    <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-sm text-white">Game Cover &amp; Banner Image Studio</h5>
                        </div>
                        <span className="text-[11px] text-zinc-400">Live Visual Preview</span>
                      </div>

                      {/* Image Preview & URL Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        
                        {/* Cover Image Preview */}
                        <div className="md:col-span-3 space-y-2">
                          <span className="text-xs text-zinc-400 font-semibold block">Cover Art Preview</span>
                          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md flex items-center justify-center">
                            {editingGame.coverImage ? (
                              <img
                                src={editingGame.coverImage}
                                alt="Game Cover Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                            ) : (
                              <div className="text-center p-3 text-zinc-500 text-xs">
                                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                <span>No Cover URL</span>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-center text-emerald-300 font-bold truncate">
                              Card Aspect (3:4)
                            </div>
                          </div>
                        </div>

                        {/* Banner Preview & Inputs */}
                        <div className="md:col-span-9 space-y-3.5">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs text-zinc-300 font-bold">
                                Cover Image (Direct Link or Upload from Device) *
                              </label>
                              <label className="cursor-pointer flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                                <Upload className="w-3 h-3" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, 'coverImage')}
                                />
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                required
                                value={editingGame.coverImage || ''}
                                onChange={(e) => setEditingGame({ ...editingGame, coverImage: e.target.value })}
                                placeholder="Paste image link: https://images.unsplash.com/... or https://..."
                                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                              />
                              {editingGame.coverImage && (
                                <button
                                  type="button"
                                  onClick={() => setEditingGame({ ...editingGame, coverImage: '' })}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 hover:text-white"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs text-zinc-300 font-bold">
                                Banner Image (Landscape Background Art)
                              </label>
                              <label className="cursor-pointer flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                                <Upload className="w-3 h-3" />
                                <span>Upload Banner</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileUpload(e, 'bannerImage')}
                                />
                              </label>
                            </div>
                            <input
                              type="url"
                              value={editingGame.bannerImage || ''}
                              onChange={(e) => setEditingGame({ ...editingGame, bannerImage: e.target.value })}
                              placeholder="Wide banner link: https://images.unsplash.com/..."
                              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                            />
                            {editingGame.bannerImage && (
                              <div className="mt-2 h-20 w-full rounded-xl overflow-hidden border border-zinc-800">
                                <img
                                  src={editingGame.bannerImage}
                                  alt="Banner preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>

                          {/* Quick 1-Click Preset Covers Picker */}
                          <div>
                            <span className="block text-[11px] text-zinc-400 font-semibold mb-1.5">
                              Or click a verified high-resolution gaming cover preset:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {PRESET_GAME_COVERS.map((preset) => (
                                <button
                                  type="button"
                                  key={preset.label}
                                  onClick={() => setEditingGame({ ...editingGame, coverImage: preset.url, bannerImage: preset.url })}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500 text-[11px] text-zinc-300 hover:text-white transition-colors"
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* GENERAL DETAILS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={editingGame.title || ''}
                          onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                          placeholder="e.g. Grand Theft Auto V"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Platform *</label>
                        <select
                          value={editingGame.platform || 'steam'}
                          onChange={(e) => setEditingGame({ ...editingGame, platform: e.target.value as Platform })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
                        >
                          <option value="steam">Steam (PC)</option>
                          <option value="epic">Epic Games (PC)</option>
                          <option value="ps5">PlayStation 5</option>
                          <option value="ps4">PlayStation 4</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Product Type *</label>
                        <select
                          value={editingGame.type || 'offline_account'}
                          onChange={(e) => setEditingGame({ ...editingGame, type: e.target.value as ProductType })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="offline_account">Offline Activation Account</option>
                          <option value="cd_key">Digital CD-Key</option>
                          <option value="full_account">Console Primary Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Discounted Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={editingGame.price ?? 299}
                          onChange={(e) => setEditingGame({ ...editingGame, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Original Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={editingGame.originalPrice ?? 2499}
                          onChange={(e) => setEditingGame({ ...editingGame, originalPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      {/* 4-CATEGORY TIER PRICING CONTROLS */}
                      <div className="col-span-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-white">
                              4 Category Pricing Tiers (₹)
                            </h4>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Edit individual price for each edition tier
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Offline Sharing */}
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                ⚡ Offline Sharing
                              </label>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Tier 1</span>
                            </div>
                            <input
                              type="number"
                              value={editingGame.tierPricing?.offlineSharing ?? editingGame.price ?? 299}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditingGame({
                                  ...editingGame,
                                  price: val,
                                  tierPricing: {
                                    offlineSharing: val,
                                    offlinePrivate: editingGame.tierPricing?.offlinePrivate ?? Math.round(val * 1.5),
                                    onlineSharing: editingGame.tierPricing?.onlineSharing ?? Math.round(val * 2.2),
                                    onlinePrivate: editingGame.tierPricing?.onlinePrivate ?? Math.round(val * 3.2),
                                  }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-[10px] text-zinc-500 block">Shared Steam/Epic Offline</span>
                          </div>

                          {/* 2. Offline Private */}
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                                🔒 Offline Private
                              </label>
                              <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded font-mono">Tier 2</span>
                            </div>
                            <input
                              type="number"
                              value={editingGame.tierPricing?.offlinePrivate ?? Math.round((editingGame.price || 299) * 1.5)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditingGame({
                                  ...editingGame,
                                  tierPricing: {
                                    offlineSharing: editingGame.tierPricing?.offlineSharing ?? editingGame.price ?? 299,
                                    offlinePrivate: val,
                                    onlineSharing: editingGame.tierPricing?.onlineSharing ?? Math.round((editingGame.price || 299) * 2.2),
                                    onlinePrivate: editingGame.tierPricing?.onlinePrivate ?? Math.round((editingGame.price || 299) * 3.2),
                                  }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                            />
                            <span className="text-[10px] text-zinc-500 block">Single User Private Offline</span>
                          </div>

                          {/* 3. Online Sharing */}
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                                🌐 Online Sharing
                              </label>
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono">Tier 3</span>
                            </div>
                            <input
                              type="number"
                              value={editingGame.tierPricing?.onlineSharing ?? Math.round((editingGame.price || 299) * 2.2)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditingGame({
                                  ...editingGame,
                                  tierPricing: {
                                    offlineSharing: editingGame.tierPricing?.offlineSharing ?? editingGame.price ?? 299,
                                    offlinePrivate: editingGame.tierPricing?.offlinePrivate ?? Math.round((editingGame.price || 299) * 1.5),
                                    onlineSharing: val,
                                    onlinePrivate: editingGame.tierPricing?.onlinePrivate ?? Math.round((editingGame.price || 299) * 3.2),
                                  }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] text-zinc-500 block">Shared Online Multiplayer</span>
                          </div>

                          {/* 4. Online Private */}
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                👑 Online Private
                              </label>
                              <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded font-mono">Tier 4</span>
                            </div>
                            <input
                              type="number"
                              value={editingGame.tierPricing?.onlinePrivate ?? Math.round((editingGame.price || 299) * 3.2)}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditingGame({
                                  ...editingGame,
                                  tierPricing: {
                                    offlineSharing: editingGame.tierPricing?.offlineSharing ?? editingGame.price ?? 299,
                                    offlinePrivate: editingGame.tierPricing?.offlinePrivate ?? Math.round((editingGame.price || 299) * 1.5),
                                    onlineSharing: editingGame.tierPricing?.onlineSharing ?? Math.round((editingGame.price || 299) * 2.2),
                                    onlinePrivate: val,
                                  }
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-[10px] text-zinc-500 block">Full Private / CD Key VIP</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Genre</label>
                        <input
                          type="text"
                          value={editingGame.genre || ''}
                          onChange={(e) => setEditingGame({ ...editingGame, genre: e.target.value })}
                          placeholder="Action / RPG / Open World"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Edition</label>
                        <input
                          type="text"
                          value={editingGame.edition || ''}
                          onChange={(e) => setEditingGame({ ...editingGame, edition: e.target.value })}
                          placeholder="Standard / Deluxe / Ultimate"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Delivery Format Label</label>
                        <input
                          type="text"
                          value={editingGame.deliveryType || ''}
                          onChange={(e) => setEditingGame({ ...editingGame, deliveryType: e.target.value })}
                          placeholder="Instant Steam Offline Account"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 font-semibold mb-1">Stock Count</label>
                        <input
                          type="number"
                          value={editingGame.stockCount ?? 20}
                          onChange={(e) => setEditingGame({ ...editingGame, stockCount: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-zinc-400 font-semibold">Description</label>
                        <button
                          type="button"
                          onClick={handleGenerateAiCopy}
                          disabled={generatingCopy}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Wand2 className={`w-3.5 h-3.5 ${generatingCopy ? 'animate-spin' : ''}`} />
                          <span>{generatingCopy ? 'Generating with AI...' : '✨ AI Generate Description & Guide'}</span>
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={editingGame.description || ''}
                        onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                        placeholder="Game synopsis, features, and story..."
                        className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 font-semibold mb-1">Step-by-Step Activation Guide</label>
                      <textarea
                        rows={3}
                        value={editingGame.activationGuide || ''}
                        onChange={(e) => setEditingGame({ ...editingGame, activationGuide: e.target.value })}
                        placeholder="1. Login to Steam...\n2. Download game..."
                        className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap items-center gap-5 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingGame.inStock ?? true}
                          onChange={(e) => setEditingGame({ ...editingGame, inStock: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>In Stock</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingGame.isFeatured)}
                          onChange={(e) => setEditingGame({ ...editingGame, isFeatured: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span>Featured Deal</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editingGame.isDealOfTheDay)}
                          onChange={(e) => setEditingGame({ ...editingGame, isDealOfTheDay: e.target.checked })}
                          className="rounded text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-rose-400 font-semibold">Deal of the Day 🔥</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setEditingGame(null)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingGame}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingGame ? 'Saving Game & Cover...' : 'Save Game & Cover'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Games Table / List */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Filter games in catalog..."
                        value={gameSearch}
                        onChange={(e) => setGameSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setIsNewGame(true);
                        setEditingGame({
                          platform: 'steam',
                          type: 'offline_account',
                          price: 100,
                          originalPrice: 2499,
                          tierPricing: {
                            offlineSharing: 100,
                            offlinePrivate: 200,
                            onlineSharing: 289,
                            onlinePrivate: 400
                          },
                          coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
                          inStock: true,
                          stockCount: 20,
                          rating: 4.9,
                          reviewCount: 15,
                        });
                      }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Game</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                        <tr>
                          <th className="py-3 px-4">Game &amp; Image</th>
                          <th className="py-3 px-3">Platform</th>
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Price</th>
                          <th className="py-3 px-3">Stock</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {filteredGames.map((game) => (
                          <tr key={game.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={game.coverImage}
                                alt={game.title}
                                className="w-10 h-12 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                              />
                              <div>
                                <span className="font-bold text-white block truncate max-w-xs">{game.title}</span>
                                <span className="text-[11px] text-zinc-400">{game.genre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                {game.platform}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-400 capitalize">
                              {game.type.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-3">
                              <div className="space-y-0.5 text-[10px] font-mono leading-tight">
                                <div className="flex items-center gap-1"><span className="text-zinc-500">⚡ Off.Share:</span><span className="font-bold text-emerald-400">₹{game.tierPricing?.offlineSharing ?? game.price}</span></div>
                                <div className="flex items-center gap-1"><span className="text-zinc-500">🔒 Off.Priv:</span><span className="font-bold text-cyan-400">₹{game.tierPricing?.offlinePrivate ?? Math.round(game.price * 1.5)}</span></div>
                                <div className="flex items-center gap-1"><span className="text-zinc-500">🌐 Onl.Share:</span><span className="font-bold text-indigo-400">₹{game.tierPricing?.onlineSharing ?? Math.round(game.price * 2.2)}</span></div>
                                <div className="flex items-center gap-1"><span className="text-zinc-500">👑 Onl.Priv:</span><span className="font-bold text-amber-400">₹{game.tierPricing?.onlinePrivate ?? Math.round(game.price * 3.2)}</span></div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                game.inStock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {game.inStock ? `${game.stockCount} in stock` : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsNewGame(false);
                                    setEditingGame(game);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors"
                                  title="Edit Game, Price & Cover Image"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteGame(game.id, game.title)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                                  title="Delete Game"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: DIRECT WHATSAPP BOT & COMMAND TERMINAL */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              {/* WhatsApp Active Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/10">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-white">Direct WhatsApp Store Control Center</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-zinc-950 uppercase tracking-wider">
                        LIVE &amp; CONNECTED
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Authorized Admin Number: <span className="font-mono text-emerald-400 font-bold">+91 9442964232</span> (Any WhatsApp text from this number directly controls your store)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <a
                    href="https://wa.me/919442964232?text=STATUS"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp (+91 9442964232)</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>

                  <button
                    onClick={handleTestWebhook}
                    disabled={waWebhookTesting}
                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs transition-colors"
                  >
                    <Zap className={`w-3.5 h-3.5 text-amber-400 ${waWebhookTesting ? 'animate-spin' : ''}`} />
                    <span>{waWebhookTesting ? 'Testing...' : 'Test Webhook'}</span>
                  </button>
                </div>
              </div>

              {/* Webhook Status Alert if tested */}
              {waWebhookStatus && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span>{waWebhookStatus}</span>
                  <button onClick={() => setWaWebhookStatus(null)} className="text-zinc-500 hover:text-zinc-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Two Column Layout: Command Terminal & Setup/Cheat-Sheet */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Interactive WhatsApp Console / Simulator */}
                <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 sm:p-5 flex flex-col h-[580px]">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm text-white">Live WhatsApp Chat &amp; Command Console</span>
                    </div>
                    <button
                      onClick={() => setWaLogs([])}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Clear Log
                    </button>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-2 font-sans text-xs pr-1">
                    {waLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${
                          log.sender === 'admin' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed ${
                            log.sender === 'admin'
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none font-mono text-[11px]'
                          }`}
                        >
                          {log.text}
                        </div>
                        <span className="text-[9px] text-zinc-500 mt-1 px-1">
                          {log.sender === 'admin' ? 'Admin (+91 9442964232)' : 'AAA Store Bot'} • {log.time}
                        </span>
                      </div>
                    ))}
                    {waSending && (
                      <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2 bg-zinc-900/50 rounded-xl max-w-fit border border-zinc-800">
                        <Bot className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Processing command via Gemini AI &amp; updating Firestore...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Command Buttons */}
                  <div className="pt-3 border-t border-zinc-800/80 mb-3">
                    <span className="text-[10px] text-zinc-400 uppercase font-black block mb-2 tracking-wider">
                      Quick Command Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '📊 STATUS', cmd: 'STATUS' },
                        { label: '📦 ORDERS', cmd: 'ORDERS' },
                        { label: '💰 PRICE GTA 249', cmd: 'PRICE GTA 249' },
                        { label: '📦 STOCK WUKONG 30', cmd: 'STOCK WUKONG 30' },
                        { label: '📢 ANNOUNCE SALE', cmd: 'ANNOUNCE 🔥 FLASH SALE: 50% OFF ALL STEAM & PS5 GAMES!' },
                        { label: '🎟️ COUPON SAKTHI25', cmd: 'COUPON SAKTHI25 25' },
                        { label: '❓ HELP', cmd: 'HELP' },
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendWhatsAppCommand(preset.cmd)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-mono text-zinc-300 hover:text-emerald-400 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendWhatsAppCommand();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={waCommandInput}
                      onChange={(e) => setWaCommandInput(e.target.value)}
                      placeholder='Type command or plain English (e.g. "Change GTA 5 price to 199")...'
                      disabled={waSending}
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
                    />
                    <button
                      type="submit"
                      disabled={waSending || !waCommandInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>

                {/* Right: Setup Instructions & Supported Commands */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Webhook Connection Details */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <h5 className="font-bold text-sm text-white">Meta / Twilio / Zapier Webhook URL</h5>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Connect your WhatsApp Business Cloud API or Twilio WhatsApp number to forward incoming messages from <span className="text-emerald-400 font-bold">+91 9442964232</span> directly to this server:
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold">Callback URL:</span>
                          <span className="text-xs text-emerald-400 font-mono break-all select-all">
                            {window.location.origin}/api/whatsapp/webhook
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                            setCopiedWebhook(true);
                            setTimeout(() => setCopiedWebhook(false), 2000);
                          }}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex-shrink-0"
                          title="Copy Webhook URL"
                        >
                          {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">Verify Token:</span>
                        <code className="text-zinc-200 font-mono font-bold">aaagames_secret</code>
                        <span className="text-zinc-500 mx-1.5">or</span>
                        <code className="text-emerald-400 font-mono font-bold">9442964232</code>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Command Reference Guide */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <h5 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-amber-400" />
                      Supported WhatsApp Text Commands
                    </h5>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">STATUS</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Returns live revenue, total orders placed, pending deliveries, and active games.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">ORDERS or PENDING</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Lists latest 5 orders with customer name, phone number, games purchased, and UTR reference.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">PRICE &lt;game&gt; &lt;newPrice&gt;</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Example: <code className="text-zinc-200">PRICE GTA 249</code>. Immediately updates store price and discount %.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">STOCK &lt;game&gt; &lt;units&gt;</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Example: <code className="text-zinc-200">STOCK WUKONG 50</code>. Sets stock count and in-stock status.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">ANNOUNCE &lt;text&gt;</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Example: <code className="text-zinc-200">ANNOUNCE Weekend Deal: Flat 40% OFF!</code>. Updates the top store banner.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">COUPON &lt;code&gt; &lt;discount%&gt;</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Example: <code className="text-zinc-200">COUPON HERO20 20</code>. Creates a valid discount coupon code for checkout.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                        <div className="font-mono font-bold text-emerald-400">DELIVER &lt;orderId&gt;</div>
                        <div className="text-zinc-400 text-[11px] mt-0.5">Example: <code className="text-zinc-200">DELIVER ORD-J8DGBBB</code>. Marks order as delivered in database.</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
                        <div className="font-mono font-bold text-purple-300">✨ AI Natural Language</div>
                        <div className="text-zinc-300 text-[11px] mt-0.5">You can also write conversational messages! Gemini 3.8 Flash parses sentences like <i>"Change GTA 5 price to 199"</i> or <i>"Show me pending orders"</i>.</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STORE BRANDING, REAL UPI SCANNER & WHATSAPP SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5">
                <div className="border-b border-zinc-800 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-400" />
                      Configure Store Branding, Real UPI Scanner &amp; WhatsApp Support
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Change the store title, announcement banner, merchant UPI scanner, and WhatsApp contact number in real-time.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono font-bold">
                    Live Firestore Sync
                  </span>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Form Inputs */}
                    <div className="lg:col-span-7 space-y-4">
                      
                      {/* SECTION A: STORE BRANDING */}
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                        <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Store Branding &amp; Announcements
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-zinc-300 font-bold mb-1">
                              Store / Website Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={storeSettings.storeName}
                              onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                              placeholder="AAA GAMES"
                              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-zinc-300 font-bold mb-1">
                              Store Tagline / Slogan
                            </label>
                            <input
                              type="text"
                              value={storeSettings.storeTagline || ''}
                              onChange={(e) => setStoreSettings({ ...storeSettings, storeTagline: e.target.value })}
                              placeholder="Premier Digital Gaming Store • Steam, Epic, PS4 & PS5"
                              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-300 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-zinc-300 font-bold mb-1">
                            Top Announcement Bar Message
                          </label>
                          <input
                            type="text"
                            value={storeSettings.announcementText || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                            placeholder="🔥 MEGA SALE: Use coupon CHEAPGAMER for 10% instant discount!"
                            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* SECTION B: REAL UPI PAYMENT SETTINGS */}
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                        <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          Real UPI Merchant Setup
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-zinc-300 font-bold mb-1">
                              Real UPI ID (VPA) *
                            </label>
                            <input
                              type="text"
                              required
                              value={storeSettings.upiId}
                              onChange={(e) => setStoreSettings({ ...storeSettings, upiId: e.target.value })}
                              placeholder="9442964232@upi"
                              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">Google Pay, PhonePe, Paytm, BHIM</p>
                          </div>

                          <div>
                            <label className="block text-xs text-zinc-300 font-bold mb-1">
                              Payee / Business Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={storeSettings.upiPayeeName}
                              onChange={(e) => setStoreSettings({ ...storeSettings, upiPayeeName: e.target.value })}
                              placeholder="AAA GAMES"
                              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs text-zinc-300 font-bold">
                              UPI Scanner QR Code Image Path or URL
                            </label>
                            <button
                              type="button"
                              onClick={() => setStoreSettings({
                                ...storeSettings,
                                upiQrImage: '/assets/aistudio/WhatsApp_Image_2026-11-02_at_8.42.24_PM_08b9aa99.jpeg'
                              })}
                              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold"
                            >
                              Use Uploaded Google Pay QR
                            </button>
                          </div>
                          <input
                            type="text"
                            value={storeSettings.upiQrImage || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, upiQrImage: e.target.value })}
                            placeholder="/assets/aistudio/WhatsApp_Image_2026-11-02_at_8.42.24_PM_08b9aa99.jpeg"
                            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* SECTION C: WHATSAPP NUMBER */}
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                        <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          Official Customer Support WhatsApp
                        </h5>

                        <div>
                          <label className="block text-xs text-zinc-300 font-bold mb-1">
                            WhatsApp Mobile Number *
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              value={storeSettings.whatsappNumber}
                              onChange={(e) => setStoreSettings({ ...storeSettings, whatsappNumber: e.target.value })}
                              placeholder="+919442964232"
                              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                            />
                            <a
                              href={`https://wa.me/${cleanWhatsApp}?text=Hello%20testing%20AAA%20GAMES%20WhatsApp%20configuration`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Test Link</span>
                            </a>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Updates the floating WhatsApp bubble, checkout support button, and footer contact.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Right Live Real UPI Scanner Preview */}
                    <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center space-y-3 sticky top-4">
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                        <span className="font-bold text-white uppercase tracking-wider text-[11px]">Real UPI Scanner Preview</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Live Active
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl w-52 h-52 mx-auto shadow-xl flex items-center justify-center overflow-hidden border border-zinc-300">
                        <img
                          src={generatedUpiQrUrl}
                          alt="Real UPI Scanner"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
                              `upi://pay?pa=${storeSettings.upiId.trim()}&pn=${encodeURIComponent(storeSettings.upiPayeeName.trim())}&cu=INR`
                            )}`;
                          }}
                        />
                      </div>

                      <div>
                        <span className="text-xs text-zinc-400 block">Scan to Pay VPA:</span>
                        <span className="font-mono text-sm font-black text-emerald-400 break-all">
                          {storeSettings.upiId}
                        </span>
                        <span className="text-[11px] text-zinc-300 font-semibold block mt-0.5">
                          Payee: {storeSettings.upiPayeeName}
                        </span>
                      </div>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-left text-xs space-y-1">
                        <div className="flex justify-between text-zinc-400">
                          <span>Store Name:</span>
                          <span className="font-bold text-white">{storeSettings.storeName}</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Support WhatsApp:</span>
                          <span className="font-mono font-bold text-emerald-400">{storeSettings.whatsappNumber}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Customers can scan this exact QR code with Google Pay, PhonePe, Paytm, or BHIM during checkout!
                      </p>
                    </div>

                  </div>

                  <div className="flex justify-end pt-3 border-t border-zinc-800">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSettings ? 'Saving Settings...' : 'Save All Store Settings'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: OFFERS & COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Create Coupon Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Create Promotional Offer Voucher
                </h4>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FLASH20"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Discount (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 font-semibold mb-1">Min Spend (₹)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMinSpend}
                      onChange={(e) => setNewCouponMinSpend(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Coupon</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-emerald-400">{coupon.code}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          {coupon.discountPercent}% OFF
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Min. Order: ₹{coupon.minSpend}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(coupon.code)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Live Customer Orders</h4>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-zinc-500 mr-1">Filter:</span>
                  {(['all', 'delivered', 'paid', 'processing'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors ${
                        orderFilter === st
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  No customer orders placed yet. Customer orders with WhatsApp contact and payment UTR will appear here in real time.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => (orderFilter === 'all' ? true : o.status === orderFilter))
                    .map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-400">{order.id}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {order.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-3">
                              <span>Customer: <strong className="text-white">{order.customerName}</strong></span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-400" />
                                <strong>{order.customerPhone}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-zinc-500" />
                                {order.userEmail}
                              </span>
                            </div>

                            {/* Live UTR Reference Number */}
                            {order.utrNumber && (
                              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                                <span className="font-semibold text-[10px] text-zinc-400 uppercase tracking-wider">UPI UTR / Ref:</span>
                                <span className="font-mono font-bold">{order.utrNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.utrNumber || '');
                                    showNotification('UTR Reference Copied!');
                                  }}
                                  className="text-zinc-400 hover:text-white"
                                  title="Copy UTR Number"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-zinc-500 block">Total Paid</span>
                              <span className="font-black text-sm text-white">{formatPrice(order.totalAmount)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.customerPhone && (
                                <a
                                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hello ${order.customerName}! Thank you for purchasing from AAA GAMES. Your Order #${order.id} is confirmed. Here are your digital game activation credentials:`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                                  title="Send Game Credentials to Customer on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Deliver on WhatsApp</span>
                                </a>
                              )}

                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 capitalize font-medium"
                              >
                                <option value="delivered">Delivered</option>
                                <option value="paid">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="space-y-1.5 text-xs">
                          {order.items.map((item, i) => (
                            <div key={i} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                              <span className="text-white font-medium">{item.title} ({item.platform.toUpperCase()})</span>
                              <span className="font-mono text-emerald-400">{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'newsletter' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Captured Newsletter Email Subscribers ({subscribers.length})
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Emails collected from the footer newsletter form for promotional game drops
                  </p>
                </div>

                {subscribers.length > 0 && (
                  <button
                    onClick={handleCopySubscribers}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
                  >
                    {copiedEmails ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEmails ? 'Copied Emails!' : 'Copy All Emails (CSV)'}</span>
                  </button>
                )}
              </div>

              {subscribers.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs">
                  No subscribers yet. When users submit their email via the Footer newsletter, they will appear here!
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-2xl bg-zinc-950 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">Subscriber Email</th>
                        <th className="py-3 px-4">Subscribed Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-zinc-900/50">
                          <td className="py-3 px-4 font-mono font-medium text-white">{sub.email}</td>
                          <td className="py-3 px-4 text-zinc-400">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMER REVIEWS & PROOF MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Customer Reviews &amp; Screenshot Proofs ({reviews.length})
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Upload real WhatsApp delivery screenshots, edit reviews, or purge old test reviews.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllReviewsAction}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Reviews</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddReview}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Proof Review</span>
                  </button>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-3">
                  <p className="text-zinc-300 font-semibold">No reviews currently listed.</p>
                  <p className="text-zinc-500 max-w-sm mx-auto">
                    All old pre-seeded reviews have been removed. Click "Add Proof Review" above to upload your customer WhatsApp chats, delivery confirmations, and genuine buyer feedback!
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddReview}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Post First Image Proof Review
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-xs">{rev.userName}</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.gameTitle && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono truncate max-w-xs">
                              {rev.gameTitle}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                            Verified Purchase
                          </span>
                          {rev.images && rev.images.length > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              📸 {rev.images.length} Image Proof{rev.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">"{rev.comment}"</p>

                        {/* Image Thumbnails Gallery */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {rev.images.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => setPreviewAdminModalImg(img)}
                                className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 hover:border-emerald-500 transition-all cursor-pointer group"
                              >
                                <img src={img} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-[10px] text-zinc-500 font-mono block">
                          Posted: {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditReview(rev)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Edit &amp; Add Images</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReviewItem(rev.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: STORE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Gross Revenue</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    {formatPrice(totalRevenue)}
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">From verified digital sales</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Total Orders</span>
                  <span className="text-2xl font-black text-white mt-1 block">{orders.length}</span>
                  <span className="text-[11px] text-emerald-400 mt-1 block">Instant fulfillment</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Active Titles In Store</span>
                  <span className="text-2xl font-black text-cyan-400 mt-1 block">{games.length}</span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">Catalog inventory</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Active Promo Vouchers</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">{coupons.length}</span>
                  <span className="text-[11px] text-zinc-500 mt-1 block">Discounts enabled</span>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h4 className="font-bold text-sm text-white">Catalog Platform Distribution</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                    <span className="text-blue-300 font-bold block">Steam PC Games</span>
                    <span className="text-xl font-black text-white mt-1 block">{platformStats.steam} titles</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700">
                    <span className="text-zinc-300 font-bold block">Epic Games</span>
                    <span className="text-xl font-black text-white mt-1 block">{platformStats.epic} titles</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <span className="text-indigo-300 font-bold block">PlayStation 5</span>
                    <span className="text-xl font-black text-white mt-1 block">{platformStats.ps5} titles</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30">
                    <span className="text-sky-300 font-bold block">PlayStation 4</span>
                    <span className="text-xl font-black text-white mt-1 block">{platformStats.ps4} titles</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD / EDIT CUSTOMER REVIEW WITH PROOF MODAL */}
      {isEditingReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {reviewFormState.id ? 'Edit Customer Review & Proofs' : 'Add Verified Proof Review'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Upload customer WhatsApp screenshots, delivery proof &amp; verified rating
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingReviewModal(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Select Game:</label>
                <select
                  value={reviewFormState.gameId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const matched = games.find(g => g.id === selId);
                    setReviewFormState(prev => ({
                      ...prev,
                      gameId: selId,
                      gameTitle: matched?.title || prev.gameTitle
                    }));
                  }}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  {games.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.platform.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Customer / Buyer Name:</label>
                  <input
                    type="text"
                    required
                    value={reviewFormState.userName}
                    onChange={(e) => setReviewFormState(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="e.g. Rahul Sharma (Delhi)"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Star Rating (1 to 5):</label>
                  <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-700 rounded-xl">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormState(prev => ({ ...prev, rating: star }))}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${star <= reviewFormState.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-white font-mono">{reviewFormState.rating} / 5 Stars</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Customer Testimonial Comment:</label>
                <textarea
                  required
                  rows={3}
                  value={reviewFormState.comment}
                  onChange={(e) => setReviewFormState(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="e.g. Paid ₹100 via GPay QR, received login details on WhatsApp within 3 minutes. Game works smoothly offline!"
                  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>

              {/* SCREENSHOT PROOF UPLOADER */}
              <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      Proof Screenshots (WhatsApp Chats, Steam Library, Downloads)
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Upload screenshot proofs from your device or paste image URLs
                    </p>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Proofs</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleReviewScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct URL Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={reviewImageUrlInput}
                    onChange={(e) => setReviewImageUrlInput(e.target.value)}
                    placeholder="Or paste screenshot image URL (https://...)"
                    className="flex-1 p-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddReviewImageUrl}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Proof Thumbnails Grid */}
                {reviewFormState.images.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-emerald-400 font-bold block">
                      Attached Proofs ({reviewFormState.images.length} photos):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {reviewFormState.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-500/50 group">
                          <img src={img} alt="Proof" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">
                    No images attached yet. Uploading screenshot proof makes this testimonial 100% verified!
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditingReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingReview ? 'Saving...' : 'Save Review with Proofs'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LIGHTBOX MODAL */}
      {previewAdminModalImg && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewAdminModalImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={previewAdminModalImg} alt="Screenshot Proof" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="flex items-center justify-between p-3 border-t border-zinc-800 text-xs">
              <span className="font-bold text-emerald-400">Verified Screenshot Proof</span>
              <button
                type="button"
                onClick={() => setPreviewAdminModalImg(null)}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPreviewAdminModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-black text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
