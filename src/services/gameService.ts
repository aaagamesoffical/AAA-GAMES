import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Game, Order, Coupon, Review, StoreSettings, NewsletterSubscriber } from '../types/game';
import { INITIAL_GAMES, INITIAL_COUPONS, INITIAL_REVIEWS } from '../data/initialGames';

const GAMES_COLLECTION = 'games';
const ORDERS_COLLECTION = 'orders';
const COUPONS_COLLECTION = 'coupons';
const REVIEWS_COLLECTION = 'reviews';
const SETTINGS_COLLECTION = 'settings';
const NEWSLETTER_COLLECTION = 'newsletter';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'AAA GAMES',
  storeTagline: 'Premier Digital Gaming Store • Steam, Epic, PS4 & PS5',
  announcementText: '🔥 MEGA SALE: Use coupon CHEAPGAMER for 10% instant discount! Instant WhatsApp Delivery to +91 94429 64232',
  upiId: '9442964232@upi',
  upiPayeeName: 'AAA GAMES',
  upiQrImage: '/assets/aistudio/WhatsApp_Image_2026-11-02_at_8.42.24_PM_08b9aa99.jpeg',
  whatsappNumber: '+919442964232',
};

// Seed initial games, coupons, and reviews
export async function seedInitialGames(): Promise<void> {
  try {
    for (const game of INITIAL_GAMES) {
      const gameRef = doc(db, GAMES_COLLECTION, game.id);
      await setDoc(gameRef, {
        ...game,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    for (const coupon of INITIAL_COUPONS) {
      const couponRef = doc(db, COUPONS_COLLECTION, coupon.code);
      await setDoc(couponRef, {
        ...coupon,
        id: coupon.code,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
    for (const rev of INITIAL_REVIEWS) {
      const revRef = doc(db, REVIEWS_COLLECTION, rev.id);
      await setDoc(revRef, {
        ...rev,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, GAMES_COLLECTION);
  }
}

// Subscribe to games real-time
export function subscribeToGames(callback: (games: Game[]) => void): () => void {
  const q = collection(db, GAMES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // If collection is not yet populated, return initial games
      callback(INITIAL_GAMES);
    } else {
      const games: Game[] = [];
      snapshot.forEach((d) => {
        games.push({ id: d.id, ...d.data() } as Game);
      });
      callback(games);
    }
  }, (err) => {
    console.error('Error listening to games:', err);
    // Fallback to initial games on read error or offline
    callback(INITIAL_GAMES);
  });
}

// Add or Update Game (Admin)
export async function saveGame(game: Partial<Game> & { id: string }): Promise<void> {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, game.id);
    const existing = await getDoc(gameRef);
    const now = new Date().toISOString();
    
    if (existing.exists()) {
      await updateDoc(gameRef, {
        ...game,
        updatedAt: now
      });
    } else {
      await setDoc(gameRef, {
        ...game,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${GAMES_COLLECTION}/${game.id}`);
  }
}

// Delete Game (Admin)
export async function deleteGame(gameId: string): Promise<void> {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    await deleteDoc(gameRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${GAMES_COLLECTION}/${gameId}`);
  }
}

// Subscribe to Coupons
export function subscribeToCoupons(callback: (coupons: Coupon[]) => void): () => void {
  const q = collection(db, COUPONS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_COUPONS.map(c => ({ ...c, id: c.code, createdAt: new Date().toISOString() })));
    } else {
      const coupons: Coupon[] = [];
      snapshot.forEach((d) => {
        coupons.push({ id: d.id, ...d.data() } as Coupon);
      });
      callback(coupons);
    }
  }, (err) => {
    console.error('Error listening to coupons:', err);
    callback(INITIAL_COUPONS.map(c => ({ ...c, id: c.code, createdAt: new Date().toISOString() })));
  });
}

// Save Coupon (Admin)
export async function saveCoupon(coupon: Coupon): Promise<void> {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, coupon.code.toUpperCase());
    await setDoc(couponRef, {
      ...coupon,
      code: coupon.code.toUpperCase(),
      createdAt: coupon.createdAt || new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COUPONS_COLLECTION}/${coupon.code}`);
  }
}

// Delete Coupon (Admin)
export async function deleteCoupon(couponId: string): Promise<void> {
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, couponId);
    await deleteDoc(couponRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COUPONS_COLLECTION}/${couponId}`);
  }
}

// Create Order (Checkout)
export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(orderRef, {
      ...order,
      id: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return orderId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${ORDERS_COLLECTION}/${orderId}`);
    return orderId;
  }
}

// Subscribe to User Orders (Matches by userId or email)
export function subscribeToUserOrders(userId: string, userEmail: string | undefined, callback: (orders: Order[]) => void): () => void {
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const orders: Order[] = [];
    const normalizedEmail = userEmail?.toLowerCase().trim();
    snapshot.forEach((d) => {
      const data = d.data() as Order;
      if (
        data.userId === userId || 
        (normalizedEmail && data.userEmail?.toLowerCase().trim() === normalizedEmail)
      ) {
        orders.push({ ...data, id: d.id });
      }
    });
    // Sort descending by creation
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (err) => {
    console.error('Error listening to user orders:', err);
    callback([]);
  });
}

// Subscribe to All Orders (Admin)
export function subscribeToAllOrders(callback: (orders: Order[]) => void): () => void {
  const q = collection(db, ORDERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      orders.push({ id: d.id, ...d.data() } as Order);
    });
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(orders);
  }, (err) => {
    console.error('Error listening to all orders:', err);
    callback([]);
  });
}

// Update Order Status (Admin)
export async function updateOrderStatus(orderId: string, status: Order['status'], assignedCredentials?: Record<string, string>): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (assignedCredentials) {
      updateData.assignedCredentials = assignedCredentials;
    }
    await updateDoc(orderRef, updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Subscribe to Game Reviews
export function subscribeToGameReviews(gameId: string, callback: (reviews: Review[]) => void): () => void {
  const q = query(collection(db, REVIEWS_COLLECTION), where('gameId', '==', gameId));
  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = [];
    snapshot.forEach((d) => {
      reviews.push({ id: d.id, ...d.data() } as Review);
    });
    callback(reviews);
  }, (err) => {
    console.error('Error listening to reviews:', err);
    callback([]);
  });
}

// Add Review
export async function addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<void> {
  const reviewId = 'rev-' + Math.random().toString(36).substring(2, 9);
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await setDoc(reviewRef, {
      ...review,
      id: reviewId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

// Subscribe to All Customer Reviews (Storewide & Admin)
export function subscribeToAllReviews(callback: (reviews: Review[]) => void): () => void {
  const reviewsCol = collection(db, REVIEWS_COLLECTION);
  return onSnapshot(reviewsCol, (snapshot) => {
    const reviews: Review[] = [];
    snapshot.forEach((d) => {
      reviews.push({ id: d.id, ...d.data() } as Review);
    });
    // Sort latest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(reviews.length > 0 ? reviews : (INITIAL_REVIEWS as Review[]));
  }, (err) => {
    console.error('Error listening to all reviews:', err);
    callback(INITIAL_REVIEWS as Review[]);
  });
}

// Delete Review (Admin)
export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

// Subscribe to Store Settings (UPI Scanner, WhatsApp Number)
export function subscribeToStoreSettings(callback: (settings: StoreSettings) => void): () => void {
  const settingsRef = doc(db, SETTINGS_COLLECTION, 'store_config');
  return onSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...DEFAULT_STORE_SETTINGS, ...snapshot.data() } as StoreSettings);
    } else {
      callback(DEFAULT_STORE_SETTINGS);
    }
  }, (err) => {
    console.error('Error reading store settings:', err);
    callback(DEFAULT_STORE_SETTINGS);
  });
}

// Save Store Settings (Admin)
export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'store_config');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLLECTION}/store_config`);
  }
}

// Subscribe email to Newsletter
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const subscriberId = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  try {
    const subRef = doc(db, NEWSLETTER_COLLECTION, subscriberId);
    await setDoc(subRef, {
      email: email.toLowerCase().trim(),
      subscribedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true, message: 'Successfully subscribed to promotional updates & game deals!' };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${NEWSLETTER_COLLECTION}/${subscriberId}`);
    return { success: false, message: 'Subscription failed. Please try again.' };
  }
}

// Subscribe to Newsletter Subscribers (Admin)
export function subscribeToNewsletterSubscribers(callback: (subscribers: NewsletterSubscriber[]) => void): () => void {
  const q = collection(db, NEWSLETTER_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const list: NewsletterSubscriber[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as NewsletterSubscriber);
    });
    list.sort((a, b) => new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime());
    callback(list);
  }, (err) => {
    console.error('Error fetching subscribers:', err);
    callback([]);
  });
}

