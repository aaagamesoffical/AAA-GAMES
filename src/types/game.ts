export type Platform = 'steam' | 'epic' | 'ps4' | 'ps5';
export type ProductType = 'cd_key' | 'offline_account' | 'full_account';

export type GameEditionCategory = 
  | 'offline_sharing' 
  | 'offline_private' 
  | 'online_sharing' 
  | 'online_private';

export interface GameTierPricing {
  offlineSharing: number;
  offlinePrivate: number;
  onlineSharing: number;
  onlinePrivate: number;
}

export const GAME_CATEGORIES: {
  id: GameEditionCategory;
  name: string;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  features: string[];
}[] = [
  {
    id: 'offline_sharing',
    name: 'Offline Sharing',
    label: 'Offline Sharing',
    shortLabel: 'Offline Share',
    badge: '⚡ Most Popular',
    description: 'Shared official account with lifetime offline story mode access and cloud saves.',
    features: [
      'Instant WhatsApp Delivery',
      'Lifetime Offline Access',
      'Local & Cloud Save Backups',
      '100% Replacement Warranty'
    ]
  },
  {
    id: 'offline_private',
    name: 'Offline Private',
    label: 'Offline Private',
    shortLabel: 'Offline Private',
    badge: '🔒 Exclusive Access',
    description: '100% Private single-user account in offline mode. Zero queue, personal save files.',
    features: [
      'Dedicated Single-User Account',
      'No Queue / Direct One-Click Launch',
      'Private Save File Directory',
      'Full Story Mode Forever'
    ]
  },
  {
    id: 'online_sharing',
    name: 'Online Sharing',
    label: 'Online Sharing',
    shortLabel: 'Online Share',
    badge: '🌐 Online Enabled',
    description: 'Shared credentials with live online multiplayer lobbies, cloud syncing & updates.',
    features: [
      'Online Multiplayer Supported',
      'Official Game Servers & Lobbies',
      'Automatic Cloud Save Sync',
      'Live Steam Community Features'
    ]
  },
  {
    id: 'online_private',
    name: 'Online Private',
    label: 'Online Private',
    shortLabel: 'Online Private (VIP)',
    badge: '👑 Full Ownership',
    description: '100% Private personal account or digital key with full ownership, email change & VIP support.',
    features: [
      'Full Personal Ownership',
      'Email & Password Change Allowed',
      'Unrestricted Online Multiplayer',
      '24/7 Priority VIP WhatsApp Support'
    ]
  }
];

export function getGameTierPrice(game: Game, category: GameEditionCategory = 'offline_sharing'): number {
  if (game.tierPricing && typeof game.tierPricing[category === 'offline_sharing' ? 'offlineSharing' : category === 'offline_private' ? 'offlinePrivate' : category === 'online_sharing' ? 'onlineSharing' : 'onlinePrivate'] === 'number') {
    return game.tierPricing[category === 'offline_sharing' ? 'offlineSharing' : category === 'offline_private' ? 'offlinePrivate' : category === 'online_sharing' ? 'onlineSharing' : 'onlinePrivate'];
  }
  
  // Explicit tier pricing: offline sharing 100, offline private 200, online sharing 289, online private 400
  switch (category) {
    case 'offline_sharing':
      return 100;
    case 'offline_private':
      return 200;
    case 'online_sharing':
      return 289;
    case 'online_private':
      return 400;
    default:
      return 100;
  }
}

export function getCategoryMeta(category: GameEditionCategory) {
  return GAME_CATEGORIES.find((c) => c.id === category) || GAME_CATEGORIES[0];
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  platform: Platform;
  type: ProductType;
  genre?: string;
  tierPricing?: GameTierPricing;
  selectedCategory?: GameEditionCategory;
  price: number; // Base price (matches offline_sharing)
  originalPrice: number;
  discountPercent: number;
  description: string;
  coverImage: string;
  bannerImage?: string;
  steamAppId?: number;
  edition: string;
  deliveryType: string;
  activationGuide: string;
  systemRequirements?: string;
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  isDealOfTheDay: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  game: Game;
  quantity: number;
  selectedCategory: GameEditionCategory;
  categoryPrice: number;
}

export interface OrderItem {
  gameId: string;
  title: string;
  platform: Platform;
  type: ProductType;
  category?: GameEditionCategory;
  categoryLabel?: string;
  price: number;
  deliveryType: string;
  digitalKeyOrAccount?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  originalAmount: number;
  discountAmount: number;
  appliedCoupon?: string;
  status: 'paid' | 'delivered' | 'processing' | 'cancelled';
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentId: string;
  utrNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minSpend: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  gameId: string;
  gameTitle?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[]; // Proof images/screenshots (WhatsApp chat, download progress, game library)
  verifiedPurchase?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'customer' | 'admin';
  wishlist: string[];
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  announcementText: string;
  upiId: string;
  upiPayeeName: string;
  upiQrImage?: string;
  whatsappNumber: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}
