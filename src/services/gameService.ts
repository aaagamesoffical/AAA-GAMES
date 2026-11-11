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

// Recursively strips any keys with 'undefined' values so Firestore setDoc/updateDoc never fails
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeFirestoreData(item)) as any;
  }
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeFirestoreData(value);
      }
    }
    return clean as any;
  }
  return data;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'AAA GAMES',
  storeTagline: 'Premier Digital Gaming Store • Steam, Epic, PS4 & PS5',
  announcementText: '🔥 MEGA SALE: Use coupon AAAGAMES for 10% instant discount! Instant WhatsApp Delivery to +91 94429 64232',
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
  const now = new Date().toISOString();
  const payload = sanitizeFirestoreData({
    ...game,
    updatedAt: now,
    createdAt: game.createdAt || now
  });

  let clientSuccess = false;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, game.id);
    const existing = await getDoc(gameRef);
    if (existing.exists()) {
      await updateDoc(gameRef, payload);
    } else {
      await setDoc(gameRef, payload);
    }
    clientSuccess = true;
  } catch (err) {
    console.warn('Client Firestore saveGame warning, syncing via server:', err);
  }

  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server saveGame sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to save game'), OperationType.WRITE, `${GAMES_COLLECTION}/${game.id}`);
  }
}

// Delete Game (Admin)
export async function deleteGame(gameId: string): Promise<void> {
  let clientSuccess = false;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    await deleteDoc(gameRef);
    clientSuccess = true;
  } catch (err) {
    console.warn('Client deleteGame warning, syncing via server:', err);
  }

  try {
    const res = await fetch(`/api/games/${encodeURIComponent(gameId)}`, {
      method: 'DELETE'
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server deleteGame sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to delete game'), OperationType.DELETE, `${GAMES_COLLECTION}/${gameId}`);
  }
}

// Local set of deleted coupons to ensure they never reappear on fallback
function getDeletedCouponCodes(): Set<string> {
  try {
    const raw = localStorage.getItem('aaa_deleted_coupons');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markCouponDeleted(code: string) {
  try {
    const set = getDeletedCouponCodes();
    set.add(code.toUpperCase());
    localStorage.setItem('aaa_deleted_coupons', JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn(e);
  }
}

function unmarkCouponDeleted(code: string) {
  try {
    const set = getDeletedCouponCodes();
    set.delete(code.toUpperCase());
    localStorage.setItem('aaa_deleted_coupons', JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn(e);
  }
}

// Subscribe to Coupons with instant local & server synchronization
export function subscribeToCoupons(callback: (coupons: Coupon[]) => void): () => void {
  const q = collection(db, COUPONS_COLLECTION);
  let seeded = false;

  return onSnapshot(q, async (snapshot) => {
    const deletedCodes = getDeletedCouponCodes();

    if (snapshot.empty) {
      const activeInitials = INITIAL_COUPONS
        .filter(c => !deletedCodes.has(c.code.toUpperCase()))
        .map(c => ({ ...c, id: c.code, createdAt: new Date().toISOString() }));
      
      callback(activeInitials);

      // Auto-seed into real Firestore docs once so they can be deleted
      if (!seeded && activeInitials.length > 0) {
        seeded = true;
        for (const coupon of activeInitials) {
          try {
            await setDoc(doc(db, COUPONS_COLLECTION, coupon.code.toUpperCase()), sanitizeFirestoreData({
              ...coupon,
              id: coupon.code.toUpperCase(),
              code: coupon.code.toUpperCase(),
              isActive: true,
              createdAt: new Date().toISOString()
            }), { merge: true });
          } catch {
            // ignore initial seed error
          }
        }
      }
    } else {
      const coupons: Coupon[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Coupon;
        const code = (data.code || d.id).toUpperCase();
        if (!deletedCodes.has(code)) {
          coupons.push({ ...data, id: d.id, code } as Coupon);
        }
      });
      callback(coupons);
    }
  }, (err) => {
    console.error('Error listening to coupons:', err);
    const deletedCodes = getDeletedCouponCodes();
    const fallback = INITIAL_COUPONS
      .filter(c => !deletedCodes.has(c.code.toUpperCase()))
      .map(c => ({ ...c, id: c.code, createdAt: new Date().toISOString() }));
    callback(fallback);
  });
}

// Save Coupon (Admin)
export async function saveCoupon(coupon: Coupon): Promise<void> {
  const cleanCode = coupon.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  unmarkCouponDeleted(cleanCode);

  const payload = sanitizeFirestoreData({
    ...coupon,
    id: cleanCode,
    code: cleanCode,
    discountPercent: Number(coupon.discountPercent),
    minSpend: Number(coupon.minSpend) || 0,
    isActive: coupon.isActive !== false,
    updatedAt: new Date().toISOString(),
    createdAt: coupon.createdAt || new Date().toISOString()
  });

  // Client-side Firestore write
  let clientSuccess = false;
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, cleanCode);
    await setDoc(couponRef, payload, { merge: true });
    clientSuccess = true;
  } catch (err) {
    console.warn('Client Firestore coupon write failed, falling back to server API:', err);
  }

  // Server API proxy sync (guaranteed admin permission bypass)
  try {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server API coupon sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to save coupon in both client and server'), OperationType.WRITE, `${COUPONS_COLLECTION}/${cleanCode}`);
  }
}

// Delete Coupon (Admin)
export async function deleteCoupon(couponId: string): Promise<void> {
  const cleanCode = couponId.trim().toUpperCase();
  markCouponDeleted(cleanCode);

  let clientSuccess = false;
  try {
    const couponRef = doc(db, COUPONS_COLLECTION, cleanCode);
    await deleteDoc(couponRef);
    if (cleanCode !== couponId) {
      await deleteDoc(doc(db, COUPONS_COLLECTION, couponId));
    }
    clientSuccess = true;
  } catch (err) {
    console.warn('Client delete coupon failed, attempting server proxy:', err);
  }

  try {
    const res = await fetch(`/api/coupons/${encodeURIComponent(cleanCode)}`, {
      method: 'DELETE'
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server delete coupon proxy failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to delete coupon'), OperationType.DELETE, `${COUPONS_COLLECTION}/${cleanCode}`);
  }
}

// Create Order (Checkout)
export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const sanitizedOrder = sanitizeFirestoreData({
      ...order,
      id: orderId,
      appliedCoupon: order.appliedCoupon || null,
      utrNumber: order.utrNumber || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await setDoc(orderRef, sanitizedOrder);
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
  const updateData: Record<string, any> = {
    status,
    updatedAt: new Date().toISOString()
  };
  if (assignedCredentials) {
    updateData.assignedCredentials = assignedCredentials;
  }

  let clientSuccess = false;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, updateData);
    clientSuccess = true;
  } catch (err) {
    console.warn('Client updateOrderStatus warning, syncing via server:', err);
  }

  try {
    const res = await fetch('/api/orders/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, assignedCredentials })
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server order status sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to update order status'), OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
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
  const data = sanitizeFirestoreData({
    ...review,
    id: reviewId,
    createdAt: new Date().toISOString()
  });

  let clientSuccess = false;
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await setDoc(reviewRef, data);
    clientSuccess = true;
  } catch (err) {
    console.warn('Client addReview warning, syncing via server:', err);
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server addReview failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to create review'), OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewId}`);
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
  let clientSuccess = false;
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await deleteDoc(reviewRef);
    clientSuccess = true;
  } catch (err) {
    console.warn('Client deleteReview warning, syncing via server:', err);
  }

  try {
    const res = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE'
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server deleteReview sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to delete review'), OperationType.DELETE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

// Update Review (Admin)
export async function updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
  const payload = sanitizeFirestoreData({
    ...updates,
    id: reviewId,
    updatedAt: new Date().toISOString()
  });

  let clientSuccess = false;
  try {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, payload);
    clientSuccess = true;
  } catch (err) {
    console.warn('Client updateReview warning, syncing via server:', err);
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server updateReview sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to update review'), OperationType.UPDATE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

// Clear All Reviews (Admin Purge)
export async function clearAllReviews(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Client clearAllReviews failed, syncing via server:', err);
  }

  try {
    await fetch('/api/reviews/clear', { method: 'POST' });
  } catch (serverErr) {
    console.warn('Server clear reviews failed:', serverErr);
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
  const payload = sanitizeFirestoreData({
    ...settings,
    updatedAt: new Date().toISOString()
  });

  let clientSuccess = false;
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, 'store_config');
    await setDoc(settingsRef, payload, { merge: true });
    clientSuccess = true;
  } catch (err) {
    console.warn('Client saveStoreSettings warning, syncing via server:', err);
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return;
  } catch (serverErr) {
    console.warn('Server saveStoreSettings sync failed:', serverErr);
  }

  if (!clientSuccess) {
    handleFirestoreError(new Error('Failed to save store settings'), OperationType.WRITE, `${SETTINGS_COLLECTION}/store_config`);
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

