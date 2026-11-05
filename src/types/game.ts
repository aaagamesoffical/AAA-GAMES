export type Platform = 'steam' | 'epic' | 'ps4' | 'ps5';
export type ProductType = 'cd_key' | 'offline_account' | 'full_account';

export interface Game {
  id: string;
  title: string;
  slug: string;
  platform: Platform;
  type: ProductType;
  genre: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  description: string;
  coverImage: string;
  bannerImage?: string;
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
}

export interface OrderItem {
  gameId: string;
  title: string;
  platform: Platform;
  type: ProductType;
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
}

export interface Review {
  id: string;
  gameId: string;
  gameTitle?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
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

