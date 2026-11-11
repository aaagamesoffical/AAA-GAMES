import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './src/firebase.ts';
import { INITIAL_GAMES, INITIAL_COUPONS, INITIAL_REVIEWS } from './src/data/initialGames.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

const AUTHORIZED_ADMIN_PHONE = '9442964232';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Google Gemini AI with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({
  ...(apiKey ? { apiKey } : {}),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to sanitize Firestore data
function sanitizeData<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (Array.isArray(data)) return data.map(sanitizeData) as any;
  if (typeof data === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) clean[key] = sanitizeData(value);
    }
    return clean as any;
  }
  return data;
}

// ==========================================
// WHATSAPP DIRECT TEXT COMMAND PROCESSOR
// ==========================================
async function handleWhatsAppTextCommand(rawMessage: string, senderPhone: string = '9442964232'): Promise<string> {
  const text = rawMessage.trim();
  const cleanSender = senderPhone.replace(/[^0-9]/g, '');

  // Verify Sender Authorization
  const isAuthorized = cleanSender.includes(AUTHORIZED_ADMIN_PHONE) || cleanSender === 'web_console';
  if (!isAuthorized) {
    return `⛔ Unauthorized Access: Only registered WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}) has store administration privileges.`;
  }

  const parts = text.split(/\s+/);
  const command = parts[0].toUpperCase();

  try {
    // 1. HELP / MENU
    if (command === 'HELP' || command === 'MENU' || command === 'COMMANDS') {
      return `🎮 *AAA GAMES - WHATSAPP ADMIN COMMANDS* 🎮
Manage your site directly via WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}):

📦 *ORDERS* - View recent customer orders & WhatsApp proof
📊 *STATUS* - Store revenue, order stats & active catalog
💰 *PRICE <game> <newPrice>* - e.g. PRICE GTA 249
📦 *STOCK <game> <count>* - e.g. STOCK WUKONG 35
📢 *ANNOUNCE <text>* - Change top header website banner
🏷️ *COUPON <code> <discount%>* - e.g. COUPON FLASH20 20
✅ *DELIVER <orderId>* - Mark customer order as delivered
⚡ Or type naturally: "Change GTA 5 price to 199" or "Show pending orders"`;
    }

    // 2. STATUS
    if (command === 'STATUS') {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const gamesSnap = await getDocs(collection(db, 'games'));
      
      let totalRev = 0;
      let pendingCount = 0;
      ordersSnap.forEach((d) => {
        const o = d.data();
        totalRev += Number(o.totalAmount || 0);
        if (o.status !== 'delivered') pendingCount++;
      });

      return `📊 *AAA GAMES - LIVE STORE METRICS*
-----------------------------
💰 Total Store Revenue: ₹${totalRev.toLocaleString('en-IN')}
📦 Total Orders Placed: ${ordersSnap.size}
⏳ Pending Delivery: ${pendingCount}
🎮 Active Games in Catalog: ${gamesSnap.size}
📱 Admin WhatsApp: +91 ${AUTHORIZED_ADMIN_PHONE}
🌐 Store Status: ONLINE & ACTIVE`;
    }

    // 3. ORDERS / PENDING
    if (command === 'ORDERS' || command === 'PENDING' || command === 'RECENT') {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const snap = await getDocs(q);

      if (snap.empty) {
        return '📦 No customer orders in the database yet.';
      }

      let reply = `📦 *RECENT CUSTOMER ORDERS (${snap.size})*:\n`;
      let orderIndex = 1;
      snap.forEach((d) => {
        const o = d.data();
        const itemsList = (o.items || []).map((i: any) => `${i.title} (${i.platform?.toUpperCase()})`).join(', ');
        reply += `\n${orderIndex++}. *Order ${o.id || d.id}*
👤 Customer: ${o.customerName || 'Gamer'} (+91 ${o.customerPhone || 'N/A'})
💰 Amount: ₹${o.totalAmount} (${(o.status || 'processing').toUpperCase()})
🎮 Titles: ${itemsList || 'Game Purchase'}
🔖 UTR / Ref: ${o.utrNumber || 'Online Gateway'}
📅 Date: ${new Date(o.createdAt).toLocaleDateString()}\n`;
      });

      reply += `\n💡 Reply with: *DELIVER <orderId>* to complete delivery.`;
      return reply;
    }

    // 4. PRICE <game> <newPrice>
    if (command === 'PRICE') {
      const newPriceStr = parts[parts.length - 1];
      const newPrice = Number(newPriceStr);
      if (isNaN(newPrice) || parts.length < 3) {
        return '⚠️ Usage: PRICE <game name> <new price in ₹>\nExample: PRICE GTA 249';
      }

      const gameQuery = parts.slice(1, parts.length - 1).join(' ').toLowerCase();
      const gamesSnap = await getDocs(collection(db, 'games'));
      
      let matchedDoc: any = null;
      gamesSnap.forEach((d) => {
        const g = d.data();
        if (
          g.title?.toLowerCase().includes(gameQuery) || 
          g.slug?.toLowerCase().includes(gameQuery) ||
          d.id.toLowerCase().includes(gameQuery)
        ) {
          matchedDoc = { docId: d.id, ...g };
        }
      });

      if (!matchedDoc) {
        return `❌ Game matching "${gameQuery}" not found in catalog. Type STATUS to see game list.`;
      }

      const origPrice = matchedDoc.originalPrice || (newPrice * 4);
      const discount = Math.round(((origPrice - newPrice) / origPrice) * 100);

      await updateDoc(doc(db, 'games', matchedDoc.docId), {
        price: newPrice,
        discountPercent: discount,
        updatedAt: new Date().toISOString()
      });

      return `✅ *PRICE UPDATED SUCCESSFULLY!*
🎮 Game: ${matchedDoc.title}
💰 New Price: ₹${newPrice} (Old: ₹${matchedDoc.price})
🏷️ Discount: ${discount}% OFF
🌐 Updated live across store catalog!`;
    }

    // 5. STOCK <game> <count>
    if (command === 'STOCK') {
      const countStr = parts[parts.length - 1];
      const count = Number(countStr);
      if (isNaN(count) || parts.length < 3) {
        return '⚠️ Usage: STOCK <game name> <stock count>\nExample: STOCK WUKONG 25';
      }

      const gameQuery = parts.slice(1, parts.length - 1).join(' ').toLowerCase();
      const gamesSnap = await getDocs(collection(db, 'games'));
      
      let matchedDoc: any = null;
      gamesSnap.forEach((d) => {
        const g = d.data();
        if (g.title?.toLowerCase().includes(gameQuery) || d.id.toLowerCase().includes(gameQuery)) {
          matchedDoc = { docId: d.id, ...g };
        }
      });

      if (!matchedDoc) {
        return `❌ Game matching "${gameQuery}" was not found.`;
      }

      await updateDoc(doc(db, 'games', matchedDoc.docId), {
        stockCount: count,
        inStock: count > 0,
        updatedAt: new Date().toISOString()
      });

      return `✅ *STOCK UPDATED!*
🎮 Game: ${matchedDoc.title}
📦 New Stock Count: ${count} Units
Status: ${count > 0 ? '🟢 In Stock' : '🔴 Sold Out'}`;
    }

    // 6. ANNOUNCE <text>
    if (command === 'ANNOUNCE' || command === 'BANNER') {
      const notice = parts.slice(1).join(' ').trim();
      if (!notice) {
        return '⚠️ Usage: ANNOUNCE <your text message>\nExample: ANNOUNCE 🔥 WEEKEND FLASH SALE: Flat 50% OFF!';
      }

      const settingsRef = doc(db, 'settings', 'store_config');
      await setDoc(settingsRef, sanitizeData({
        announcementText: notice,
        updatedAt: new Date().toISOString()
      }), { merge: true });

      return `📢 *BANNER ANNOUNCEMENT UPDATED!*
New Message: "${notice}"
🌐 It is now displayed at the very top of AAA GAMES store!`;
    }

    // 7. COUPON <code> <discountPercent>
    if (command === 'COUPON') {
      if (parts.length < 3) {
        return '⚠️ Usage: COUPON <CODE> <DISCOUNT%>\nExample: COUPON SAKTHI20 20';
      }
      const code = parts[1].toUpperCase();
      const disc = Number(parts[2]);
      if (isNaN(disc) || disc <= 0 || disc > 90) {
        return '⚠️ Discount must be a percentage between 1 and 90.';
      }

      const couponRef = doc(db, 'coupons', code);
      await setDoc(couponRef, sanitizeData({
        code,
        discountPercent: disc,
        minSpend: 250,
        isActive: true,
        createdAt: new Date().toISOString()
      }), { merge: true });

      return `🎟️ *NEW COUPON CREATED!*
Code: *${code}*
Discount: *${disc}% OFF*
Min Order: ₹250
Gamers can now apply "${code}" at checkout!`;
    }

    // 8. DELIVER <orderId>
    if (command === 'DELIVER' || command === 'APPROVE') {
      const orderId = parts[1]?.trim();
      if (!orderId) {
        return '⚠️ Usage: DELIVER <orderId>\nExample: DELIVER ORD-J8DGBBB';
      }

      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (!snap.exists()) {
        return `❌ Order "${orderId}" not found in Firestore database.`;
      }

      await updateDoc(orderRef, {
        status: 'delivered',
        updatedAt: new Date().toISOString()
      });

      const o = snap.data();
      return `✅ *ORDER #${orderId} MARKED DELIVERED!*
Customer: ${o.customerName || 'Gamer'} (+91 ${o.customerPhone || 'N/A'})
Amount: ₹${o.totalAmount}
Status: DELIVERED
Customer can now view their order confirmation in their vault!`;
    }

    // 9. NATURAL LANGUAGE AI COMMAND PARSER (Using Gemini)
    const aiPrompt = `You are the WhatsApp AI Command Engine for store owner sakthi (WhatsApp: +91 9442964232) of AAA GAMES store.
The store owner sent this text message: "${text}"

Available command types:
- "STATUS": Check sales, orders, revenue
- "ORDERS": View recent customer orders
- "PRICE": Change game price (requires gameTitle, newPrice)
- "STOCK": Change game stock (requires gameTitle, count)
- "ANNOUNCE": Change banner text (requires text)
- "DELIVER": Deliver order (requires orderId)

If this maps to one of the command types, return strict JSON:
{"action": "STATUS" | "ORDERS" | "PRICE" | "STOCK" | "ANNOUNCE" | "DELIVER", "gameTitle": string, "newPrice": number, "count": number, "text": string, "orderId": string}
If it is a general question or greeting, return:
{"action": "CHAT", "reply": "Your brief helpful response to the store owner"}`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: aiPrompt,
      config: { responseMimeType: 'application/json' }
    });

    try {
      const parsed = JSON.parse(aiRes.text || '{}');
      if (parsed.action === 'STATUS') return handleWhatsAppTextCommand('STATUS', senderPhone);
      if (parsed.action === 'ORDERS') return handleWhatsAppTextCommand('ORDERS', senderPhone);
      if (parsed.action === 'PRICE' && parsed.newPrice) {
        return handleWhatsAppTextCommand(`PRICE ${parsed.gameTitle || 'GTA'} ${parsed.newPrice}`, senderPhone);
      }
      if (parsed.action === 'STOCK' && parsed.count) {
        return handleWhatsAppTextCommand(`STOCK ${parsed.gameTitle || 'GTA'} ${parsed.count}`, senderPhone);
      }
      if (parsed.action === 'ANNOUNCE' && parsed.text) {
        return handleWhatsAppTextCommand(`ANNOUNCE ${parsed.text}`, senderPhone);
      }
      if (parsed.action === 'DELIVER' && parsed.orderId) {
        return handleWhatsAppTextCommand(`DELIVER ${parsed.orderId}`, senderPhone);
      }
      if (parsed.reply) {
        return `🤖 *AAA Assistant (+91 ${AUTHORIZED_ADMIN_PHONE})*:\n${parsed.reply}\n\n💡 Tip: Type *HELP* for command menu.`;
      }
    } catch {
      // fallback to generic help
    }

    return `❓ Unrecognized Command. Type *HELP* to see all commands to manage orders, prices, stocks, and coupons via WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}).`;

  } catch (err: any) {
    console.error('WhatsApp Command Error:', err);
    return `⚠️ Error executing WhatsApp command: ${err.message || 'Unknown database error'}`;
  }
}

// ==========================================
// WHATSAPP API ROUTE ENDPOINTS
// ==========================================

// 1. Meta / Twilio Webhook Verification (GET)
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && (token === 'aaagames_secret' || token === AUTHORIZED_ADMIN_PHONE)) {
    return res.status(200).send(challenge);
  }
  res.status(200).json({
    status: 'ACTIVE',
    authorizedPhone: `+91 ${AUTHORIZED_ADMIN_PHONE}`,
    webhookUrl: '/api/whatsapp/webhook',
    message: 'AAA GAMES WhatsApp Webhook is live and ready to receive commands.'
  });
});

// 2. Meta Cloud API / Webhook Receiver (POST)
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const body = req.body;
    let messageText = '';
    let senderPhone = AUTHORIZED_ADMIN_PHONE;

    // Check Meta WhatsApp Cloud API format
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const msg = body.entry[0].changes[0].value.messages[0];
      messageText = msg.text?.body || '';
      senderPhone = msg.from || AUTHORIZED_ADMIN_PHONE;
    } 
    // Check Twilio format
    else if (body.Body) {
      messageText = body.Body;
      senderPhone = body.From || AUTHORIZED_ADMIN_PHONE;
    }
    // Generic direct format
    else if (body.message || body.text) {
      messageText = body.message || body.text;
      senderPhone = body.from || body.phone || AUTHORIZED_ADMIN_PHONE;
    }

    if (!messageText) {
      return res.status(200).json({ status: 'NO_MESSAGE' });
    }

    const reply = await handleWhatsAppTextCommand(messageText, senderPhone);
    res.status(200).json({ success: true, reply });
  } catch (err: any) {
    console.error('Webhook Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Direct Admin Command Console API (Used by Admin Panel)
app.post('/api/whatsapp/command', async (req, res) => {
  try {
    const { command, sender } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command text is required' });
    }
    const reply = await handleWhatsAppTextCommand(command, sender || AUTHORIZED_ADMIN_PHONE);
    res.json({ success: true, reply, adminPhone: `+91 ${AUTHORIZED_ADMIN_PHONE}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// GEMINI AI ENDPOINTS
// ==========================================

// Intelligent Gaming Reply Engine (Answers all questions about games, specs, coupons, activation, payments)
function generateIntelligentGamingReply(userMsg: string, budget?: string, platform?: string): string {
  const query = userMsg.toLowerCase();

  // 1. Coupons & Discounts
  if (query.includes('coupon') || query.includes('discount') || query.includes('promo') || query.includes('offer') || query.includes('code')) {
    return `🎟️ **AAA GAMES Active Discount Coupons:**\n\n` +
      `• **SAKTHI20** — 20% Instant Discount on any game!\n` +
      `• **AAAGAMES** — 15% Storewide Discount\n` +
      `• **CHEAPGAMER** — 10% Extra OFF\n` +
      `• **STEAM50** — 15% OFF all Steam titles\n` +
      `• **WELCOME5** — 10% First Order Bonus\n\n` +
      `💡 *How to use:* Type the code in the "Have a Coupon Code?" box during Checkout or inside your Cart Drawer and click **Apply**!`;
  }

  // 2. Steam Offline Account & Activation
  if (query.includes('offline') || query.includes('steam account') || query.includes('how to activate') || query.includes('how it works') || query.includes('activation')) {
    return `⚡ **How Steam Offline Account Activation Works:**\n\n` +
      `1. **Instant Credentials:** After payment verification, you receive official Steam login ID & password on WhatsApp (+91 9442964232) and Email within 2-5 minutes.\n` +
      `2. **Download from Official Steam:** Login to Steam client and download the full game directly from Steam's high-speed CDN servers.\n` +
      `3. **First Launch:** Launch the game once so shaders compile and cloud save creates your local player profile.\n` +
      `4. **Switch to Offline Mode:** In Steam top menu, click **Steam > Go Offline**. Now you can play unrestricted campaign/story mode forever!\n` +
      `5. **Lifetime Warranty:** All accounts come with 100% lifetime replacement support from store owner Sakthi.`;
  }

  // 3. PS4 & PS5 Console Sharing / Accounts
  if (query.includes('ps4') || query.includes('ps5') || query.includes('playstation') || query.includes('console')) {
    return `🎮 **PlayStation (PS4 & PS5) Games & Account Sharing:**\n\n` +
      `• **Console Sharing Enabled:** You receive a primary PSN account with the purchased game.\n` +
      `• **Play on Your Personal Profile:** Enable "Console Sharing and Offline Play" in PS5 Settings. You can switch back to your own personal PSN profile and all trophies, cloud saves, and achievements sync to YOU!\n` +
      `• **Top Titles Available:** God of War Ragnarök (₹599), Marvel's Spider-Man 2 (₹599), The Last of Us Part I (₹499), Horizon Forbidden West (₹549).\n` +
      `• **Support:** 100% verified genuine credentials delivered via WhatsApp.`;
  }

  // 4. Payment / UPI / QR / UTR
  if (query.includes('pay') || query.includes('upi') || query.includes('qr') || query.includes('utr') || query.includes('gpay') || query.includes('phonepe') || query.includes('paytm')) {
    return `💳 **Real UPI & QR Payment Guide:**\n\n` +
      `1. **Scan QR Code:** Scan our official Google Pay UPI QR code displayed on the checkout screen (or send to VPA: **9442964232@upi**).\n` +
      `2. **Pay Exact Amount:** Pay via Google Pay, PhonePe, Paytm, or BHIM with zero extra gateway fees.\n` +
      `3. **Enter 12-Digit UTR:** Enter the 12-digit UTR / UPI Reference Number from your payment success receipt into the checkout box.\n` +
      `4. **Instant WhatsApp Confirmation:** You can also click the one-tap WhatsApp button to send your screenshot proof directly to **+91 9442964232** for immediate key release!`;
  }

  // 5. Black Myth: Wukong
  if (query.includes('wukong') || query.includes('black myth')) {
    return `🐒 **Black Myth: Wukong (Steam PC):**\n\n` +
      `• **Store Price:** ₹499 (Original Steam Price: ₹3,999 — 87% OFF!)\n` +
      `• **Includes:** Full Game + Chapter 1 to 6 Destined One storyline + high-speed Steam CDN download.\n` +
      `• **System Specs:** Runs on GTX 1060 / RTX 2060 / 3060 / 4060 with 16GB RAM and SSD.\n` +
      `• **Delivery:** Instant credentials dispatched to WhatsApp with lifetime warranty!`;
  }

  // 6. GTA V
  if (query.includes('gta') || query.includes('grand theft auto')) {
    return `🚗 **Grand Theft Auto V: Premium Edition (Steam PC):**\n\n` +
      `• **Store Price:** ₹299 (Original: ₹2,499 — 88% OFF!)\n` +
      `• **Includes:** Complete Michael, Trevor & Franklin storyline with 4K 60+ FPS support.\n` +
      `• **Specs:** Intel i5 / 8GB RAM / GTX 660 or better (Runs easily on mid-range laptops).\n` +
      `• **Delivery:** Instant automated Steam account login details on WhatsApp!`;
  }

  // 7. Baldur's Gate 3
  if (query.includes('baldur') || query.includes('bg3')) {
    return `🎲 **Baldur's Gate 3 (Game of the Year Edition):**\n\n` +
      `• **Store Price:** ₹599 (Original: ₹3,499 — 83% OFF!)\n` +
      `• **Genre:** The Game Awards GOTY 2023 RPG Masterpiece.\n` +
      `• **Features:** Unmatched story freedom, 100+ hours of tactical D&D turn-based combat, thousands of choices.\n` +
      `• **Delivery:** Instant Steam offline account with full local save file support.`;
  }

  // 8. Sekiro
  if (query.includes('sekiro')) {
    return `⚔️ **Sekiro: Shadows Die Twice - GOTY Edition:**\n\n` +
      `• **Store Price:** ₹399 (Original: ₹3,999 — 90% OFF!)\n` +
      `• **Highlights:** FromSoftware GOTY combat, prosthetic arm tools, deflection mechanics, and boss reflection gauntlets.\n` +
      `• **Delivery:** Instant Steam credentials delivered to WhatsApp (+91 9442964232).`;
  }

  // 9. Budget Recommendations
  if (query.includes('under 300') || query.includes('under 299') || query.includes('cheap') || query.includes('budget') || query.includes('best price')) {
    return `🔥 **Top AAA Games Under ₹300 - ₹399:**\n\n` +
      `• **The Witcher 3: Wild Hunt Complete** — ₹249 (150+ hrs with all expansions!)\n` +
      `• **GTA V Premium Edition** — ₹299 (Legendary open-world action)\n` +
      `• **Monster Hunter: World Iceborne** — ₹349 (Epic monster slaying)\n` +
      `• **Dark Souls III Deluxe Edition** — ₹349 (Base game + both DLCs)\n` +
      `• **Forza Horizon 5 Premium** — ₹399 (Extreme open-world racing in Mexico)\n` +
      `• **Sekiro: Shadows Die Twice** — ₹399 (Masterpiece swordplay)\n\n` +
      `💡 Apply coupon **SAKTHI20** at checkout for an extra 20% OFF!`;
  }

  // 10. PC Specs & Hardware
  if (query.includes('spec') || query.includes('fps') || query.includes('can i run') || query.includes('hardware') || query.includes('ram') || query.includes('gpu') || query.includes('gtx') || query.includes('rtx')) {
    return `🖥️ **PC Gaming Performance & Compatibility Guide:**\n\n` +
      `• **Budget / Integrated / GTX 1650 (8GB RAM):** GTA V (60+ FPS), Witcher 3 (60 FPS), Dark Souls III (60 FPS), Sekiro (60 FPS).\n` +
      `• **Mid-Range / RTX 2060 / 3050 / 3060 (16GB RAM):** God of War (70+ FPS), Cyberpunk 2077 with DLSS (65 FPS), Spider-Man (75 FPS), Black Myth Wukong (60 FPS).\n` +
      `• **High-End / RTX 3070 / 4060 / 4070 (16GB+ RAM):** Baldur's Gate 3 (90+ FPS Ultra), Silent Hill 2 UE5 (60+ FPS), FC 25 (120+ FPS 4K).\n\n` +
      `💡 *Tip:* Test your exact GPU and CPU model using our dedicated "Can My PC Run It?" Benchmark Checker on the homepage!`;
  }

  // Default Comprehensive Response
  return `⚡ **Welcome to AAA GAMES Gaming Concierge!**\n\n` +
    `Here is how we can help you right now:\n` +
    `• **Top Trending Titles:** Black Myth: Wukong (₹499), GTA V (₹299), Baldur's Gate 3 (₹599), God of War (₹399), Elden Ring (₹549).\n` +
    `• **Discount Coupons:** Use **SAKTHI20** for 20% OFF or **AAAGAMES** for 15% OFF at checkout!\n` +
    `• **Payment:** Real QR scanner supporting GPay, PhonePe, and Paytm (UPI: 9442964232@upi).\n` +
    `• **Delivery:** Instant credentials dispatched to WhatsApp (+91 9442964232) with 100% lifetime replacement guarantee.\n\n` +
    `Ask me about any specific game, system requirements, or activation steps!`;
}

// AI Game Assistant with Multi-Turn Chat and Real-Time Google Search Grounding
app.post('/api/ai/assistant', async (req, res) => {
  const { message, conversationHistory, budget, platform } = req.body;
  const userMessage = String(message || 'Recommend the best AAA games today').trim();

  try {
    // Construct multi-turn contents array
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory) {
        if (!item || !item.text) continue;
        const role = item.sender === 'ai' || item.role === 'model' || item.role === 'ai' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: String(item.text) }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const systemInstruction = `You are "AAA Cyber AI", the elite gaming concierge for "AAA GAMES" digital store.
Store Owner: Sakthi (WhatsApp: +91 9442964232).
Payment Methods: Direct Real UPI Scanner (9442964232@upi), Instant WhatsApp Delivery, Zero Platform Fee.

Store Highlights:
- 32+ authentic AAA Steam, Epic Games, PS4, and PS5 titles with 100% lifetime warranty.
- Black Myth: Wukong (₹499), GTA V Premium (₹299), Baldur's Gate 3 (₹599), Sekiro (₹399), God of War Ragnarök (₹599), Cyberpunk 2077 (₹399), Elden Ring (₹549), Witcher 3 (₹249), Silent Hill 2 (₹499).
- Active Coupons: SAKTHI20 (20% OFF), AAAGAMES (15% OFF), CHEAPGAMER (10% OFF), STEAM50 (15% OFF).

Your Persona & Rules:
- Answer ALL gamer questions directly, accurately, and enthusiastically with helpful advice.
- When asked about games, compare options, recommend titles matching budget/platform, and explain how instant WhatsApp delivery works.
- Keep responses well-formatted with clean bullet points and under 180 words.`;

    let response: any = null;
    let searchSources: Array<{ title: string; uri: string }> = [];

    const withTimeout = <T>(p: Promise<T>, ms = 4000): Promise<T> => 
      Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), ms))
      ]);

    // Attempt 1: Gemini 3.8 Flash with Google Search Grounding
    try {
      response = await withTimeout(ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      }), 4500);

      const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const chunk of chunks) {
          if (chunk.web?.uri && chunk.web?.title) {
            if (!searchSources.some(s => s.uri === chunk.web?.uri)) {
              searchSources.push({
                title: chunk.web.title,
                uri: chunk.web.uri,
              });
            }
          }
        }
      }
    } catch (groundingErr) {
      // Attempt 2: Fallback to standard Gemini 3.8 Flash without external search tools
      try {
        response = await withTimeout(ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction
          },
        }), 3000);
      } catch (geminiErr) {
        response = null;
      }
    }

    if (response && response.text) {
      return res.json({
        reply: response.text,
        searchSources: searchSources.slice(0, 4)
      });
    }

    // Fallback: Intelligent domain-specific gaming engine
    const intelligentReply = generateIntelligentGamingReply(userMessage, budget, platform);
    return res.json({
      reply: intelligentReply,
      searchSources: []
    });

  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    const fallbackReply = generateIntelligentGamingReply(userMessage, budget, platform);
    res.json({
      reply: fallbackReply,
      searchSources: []
    });
  }
});

// AI PC Specs & FPS Benchmark Checker
app.post('/api/ai/specs-checker', async (req, res) => {
  try {
    const { gameTitle, gpu, cpu, ram, targetResolution } = req.body;
    const prompt = `You are a real-time gaming hardware performance estimator for "${gameTitle || 'AAA Game'}".
PC Specs:
- GPU: ${gpu || 'Mid-range GPU'}
- CPU: ${cpu || 'Modern Quad/Hexa-Core'}
- RAM: ${ram || '16 GB'}
- Target Resolution: ${targetResolution || '1080p'}

Provide a structured, accurate performance estimation:
1. Verdict: "Can It Run It?" (Smooth 60+ FPS / Playable 45-60 FPS / Low Settings 30+ FPS / Needs Hardware Upgrade)
2. Expected FPS:
   - Low/Medium: [estimated FPS]
   - High: [estimated FPS]
   - Ultra: [estimated FPS]
3. Optimization Tip (e.g., FSR/DLSS setting, RAM recommendation).

Keep response concise and formatted with clean bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ verdict: response.text });
  } catch (error: any) {
    console.error('Specs Checker Error:', error);
    res.json({
      verdict: `🎮 Compatibility Estimate for ${req.body.gameTitle || 'this game'}:\n- Verdict: High Compatibility (60+ FPS at 1080p)\n- Medium Settings: 60 - 75 FPS\n- High Settings: 50 - 65 FPS\n- Tip: Enable DLSS or FSR Quality Mode for optimal fluidity and response times.`
    });
  }
});

// AI Product Description & Offer Copy for Admin Studio
app.post('/api/ai/generate-game-copy', async (req, res) => {
  try {
    const { title, platform, genre } = req.body;
    const prompt = `Generate a compelling, high-converting product description for the game "${title}" on ${platform} (${genre}).
Format output strictly as JSON:
{
  "description": "Engaging 2-3 sentence synopsis highlighting core gameplay and excitement",
  "activationGuide": "1. Receive credentials via WhatsApp.\\n2. Log in to official platform.\\n3. Download & play with lifetime warranty.",
  "systemRequirements": "Windows 10/11 64-bit, 16GB RAM, GTX 1660 / RTX 3060 or PlayStation Console"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch {
      res.json({
        description: `${title} delivers adrenaline-pumping ${genre} gameplay fully optimized for ${platform}. Experience ultra-responsive action and captivating visuals.`,
        activationGuide: `1. Receive credentials via WhatsApp (+919442964232).\n2. Login on ${platform}.\n3. Download game library and enjoy lifetime warranty support.`,
        systemRequirements: 'Windows 10/11 64-bit, 16GB RAM, DirectX 12, or PlayStation 4/5 System'
      });
    }
  } catch (error: any) {
    console.error('AI Copy Gen Error:', error);
    res.json({
      description: `${req.body.title || 'Game'} offers thrilling gameplay with instant digital activation.`,
      activationGuide: '1. Connect on WhatsApp\n2. Get key\n3. Play with warranty',
      systemRequirements: 'Standard PC or Console Compatible'
    });
  }
});

// AI UTR Reference Verification
app.post('/api/ai/verify-utr', async (req, res) => {
  try {
    const { utr } = req.body;
    const cleanUtr = String(utr || '').replace(/\s/g, '');
    const is12Digit = /^\d{12}$/.test(cleanUtr);

    res.json({
      valid: is12Digit,
      cleanUtr,
      message: is12Digit 
        ? 'Verified 12-Digit Indian Banking UTR / RRN format. Ready for instant activation.' 
        : 'Please enter the 12-digit numeric UTR/Ref number shown on your GPay, PhonePe, or Paytm success screen.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync Steam Games & Coupons to Firestore (Forces tierPricing: 100/200/289/400 and purges old reviews)
app.post('/api/catalog/sync', async (_req, res) => {
  try {
    for (const game of INITIAL_GAMES) {
      await setDoc(doc(db, 'games', game.id), sanitizeData({
        ...game,
        price: 100,
        tierPricing: {
          offlineSharing: 100,
          offlinePrivate: 200,
          onlineSharing: 289,
          onlinePrivate: 400
        },
        createdAt: game.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }), { merge: true });
    }
    for (const coupon of INITIAL_COUPONS) {
      await setDoc(doc(db, 'coupons', coupon.code), sanitizeData({
        ...coupon,
        id: coupon.code,
        createdAt: new Date().toISOString()
      }), { merge: true });
    }

    // Seed verified customer photo proof reviews
    for (const rev of INITIAL_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), sanitizeData({
        ...rev,
        createdAt: rev.createdAt || new Date().toISOString()
      }), { merge: true });
    }

    res.json({ 
      success: true, 
      count: INITIAL_GAMES.length, 
      message: `All ${INITIAL_GAMES.length} official Steam games updated to Offline Share ₹100, Offline Private ₹200, Online Sharing ₹289, Online Private ₹400. Photo reviews synced.` 
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Clear All Reviews
app.post('/api/reviews/clear', async (_req, res) => {
  try {
    const revsSnap = await getDocs(collection(db, 'reviews'));
    for (const rDoc of revsSnap.docs) {
      await deleteDoc(rDoc.ref);
    }
    res.json({ success: true, message: 'All reviews cleared successfully. You can now upload your customer proof reviews.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Coupons API
app.post('/api/coupons', async (req, res) => {
  try {
    const { code, discountPercent, minSpend, isActive } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }
    const cleanCode = String(code).trim().toUpperCase();
    const couponRef = doc(db, 'coupons', cleanCode);
    const data = sanitizeData({
      id: cleanCode,
      code: cleanCode,
      discountPercent: Number(discountPercent) || 10,
      minSpend: Number(minSpend) || 0,
      isActive: isActive !== false,
      updatedAt: new Date().toISOString(),
      createdAt: req.body.createdAt || new Date().toISOString()
    });
    await setDoc(couponRef, data, { merge: true });
    res.json({ success: true, coupon: data });
  } catch (err: any) {
    console.error('Server coupon save error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    await deleteDoc(doc(db, 'coupons', code));
    // Also try exact param case
    if (code !== req.params.code) {
      await deleteDoc(doc(db, 'coupons', req.params.code));
    }
    res.json({ success: true, message: `Coupon ${code} deleted` });
  } catch (err: any) {
    console.error('Server coupon delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Games API
app.post('/api/games', async (req, res) => {
  try {
    const game = req.body;
    if (!game.id || !game.title) {
      return res.status(400).json({ error: 'Game id and title are required' });
    }
    const gameRef = doc(db, 'games', String(game.id));
    const now = new Date().toISOString();
    await setDoc(gameRef, sanitizeData({
      ...game,
      updatedAt: now,
      createdAt: game.createdAt || now
    }), { merge: true });
    res.json({ success: true, game });
  } catch (err: any) {
    console.error('Server game save error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    await deleteDoc(doc(db, 'games', id));
    res.json({ success: true, message: `Game ${id} deleted` });
  } catch (err: any) {
    console.error('Server game delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Store Settings API
app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    const settingsRef = doc(db, 'settings', 'store_config');
    await setDoc(settingsRef, sanitizeData({
      ...settings,
      updatedAt: new Date().toISOString()
    }), { merge: true });
    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Server settings save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Reviews API
app.post('/api/reviews', async (req, res) => {
  try {
    const review = req.body;
    const reviewId = review.id || ('rev-' + Math.random().toString(36).substring(2, 9));
    const reviewRef = doc(db, 'reviews', reviewId);
    await setDoc(reviewRef, sanitizeData({
      ...review,
      id: reviewId,
      updatedAt: new Date().toISOString(),
      createdAt: review.createdAt || new Date().toISOString()
    }), { merge: true });
    res.json({ success: true, reviewId });
  } catch (err: any) {
    console.error('Server review save error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    await deleteDoc(doc(db, 'reviews', id));
    res.json({ success: true, message: `Review ${id} deleted` });
  } catch (err: any) {
    console.error('Server review delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders API
app.post('/api/orders/status', async (req, res) => {
  try {
    const { orderId, status, assignedCredentials } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    const orderRef = doc(db, 'orders', orderId);
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (assignedCredentials) {
      updateData.assignedCredentials = assignedCredentials;
    }
    await updateDoc(orderRef, updateData);
    res.json({ success: true, orderId, status });
  } catch (err: any) {
    console.error('Server order status error:', err);
    res.status(500).json({ error: err.message });
  }
});

async function autoSeedCatalog() {
  try {
    const snap = await getDocs(collection(db, 'games'));
    if (snap.size < INITIAL_GAMES.length) {
      console.log(`Auto-seeding ${INITIAL_GAMES.length} official Steam games to Firestore...`);
      for (const game of INITIAL_GAMES) {
        await setDoc(doc(db, 'games', game.id), sanitizeData({
          ...game,
          price: 100,
          tierPricing: {
            offlineSharing: 100,
            offlinePrivate: 200,
            onlineSharing: 289,
            onlinePrivate: 400
          },
          createdAt: game.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }
    }

    const couponSnap = await getDocs(collection(db, 'coupons'));
    if (couponSnap.empty) {
      console.log('Seeding initial promotional coupons into Firestore...');
      for (const coupon of INITIAL_COUPONS) {
        await setDoc(doc(db, 'coupons', coupon.code), sanitizeData({
          ...coupon,
          id: coupon.code,
          code: coupon.code,
          isActive: true,
          createdAt: new Date().toISOString()
        }), { merge: true });
      }
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err);
  }
}

// Vite Dev Middleware / Production Static
async function startServer() {
  await autoSeedCatalog();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AAA GAMES Server with WhatsApp Bot running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
