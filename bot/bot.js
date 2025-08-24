import { Telegraf, Markup } from "telegraf";
import { db } from "./firebase.js";
import { ref, get, push, set, update } from "firebase/database";
import dotenv from "dotenv";
import FormData from "form-data";
import fetch from "node-fetch";

dotenv.config();

// ---------- CONFIG ----------
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const rawChannel = process.env.CHANNEL_ID ?? "";
const channelId = rawChannel.trim();
const admins = process.env.ADMIN_ID
  ? process.env.ADMIN_ID.split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n))
  : [];

let channelAvailable = false;

// ---------- SESSIONS ----------
const sessions = new Map();
const getSession = (id) => {
  if (!sessions.has(id))
    sessions.set(id, { 
      type: null, 
      step: null, 
      data: {}, 
      createdAt: Date.now(),
      messageIds: [] // Xabarlarni saqlash uchun
    });
  return sessions.get(id);
};

const resetSession = (id) => {
  const session = getSession(id);
  // Oldingi xabarlarni o'chirish
  session.messageIds.forEach(msgId => {
    try {
      bot.telegram.deleteMessage(id, msgId);
    } catch (e) {
      console.log("Xabarni o'chirishda xato:", e.message);
    }
  });
  sessions.set(id, { type: null, step: null, data: {}, createdAt: Date.now(), messageIds: [] });
};

const isAdmin = (id) => admins.includes(Number(id));

// ---------- FIREBASE HELPERS ----------
const fetchData = async (path) => {
  try {
    const snap = await get(ref(db, path));
    return snap.val() || {};
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return {};
  }
};

const pushData = async (path, data) => {
  try {
    const newRef = push(ref(db, path));
    await set(newRef, data);
    return { ok: true, key: newRef.key };
  } catch (err) {
    console.error("Firebase push error:", err);
    return { ok: false, error: err };
  }
};

const setData = async (path, data) => {
  try {
    // Agar data null yoki undefined bo'lsa, uni o'chiramiz
    if (data === null || data === undefined) {
      await set(ref(db, path), null);
      return true;
    }
    
    // Agar data object bo'lsa, update qilamiz
    if (typeof data === 'object' && !Array.isArray(data)) {
      await update(ref(db, path), data);
      return true;
    }
    
    // Boshqa holatda set qilamiz
    await set(ref(db, path), data);
    return true;
  } catch (err) {
    console.error("Firebase set/update error:", err);
    return false;
  }
};
// ---------- UTILS ----------
const parseNumber = (txt) => {
  if (typeof txt !== "string") return Number(txt);
  const clean = txt.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
  const num = Number(clean);
  return Number.isNaN(num) ? null : num;
};

const formatUZS = (n) => {
  if (n == null) return "...";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return `${Math.round(num).toLocaleString()} UZS`;
};

const safeTruncate = (str, max = 3500) =>
  str?.length > max ? `${str.slice(0, max)}…` : str || "";

// Render preview string for blocks (Telegram text)
const renderBlocksPreview = (blocks = []) => {
  const parts = [];
  for (const b of blocks) {
    switch (b.type) {
      case "h1":
      case "h2":
        parts.push(`\n<b>${b.text}</b>`);
        break;
      case "p":
        parts.push(`\n${b.text}`);
        break;
      case "quote":
        parts.push(`\n"${b.text}"`);
        break;
      case "divider":
        parts.push("\n────────────");
        break;
      case "img":
        parts.push(`\n🖼 Rasm: ${b.url}${b.caption ? `\n${b.caption}` : ""}`);
        break;
      case "ul":
        if (Array.isArray(b.items))
          parts.push("\n" + b.items.map((it) => `• ${it}`).join("\n"));
        break;
    }
  }
  return safeTruncate(parts.join("\n"), 3500);
};

// ---------- UI HELPERS ----------
const mainMenu = (admin = false) => {
  const buttons = [
    [Markup.button.callback("🛍 Mahsulotlar", "MENU_PRODUCTS")],
    [Markup.button.callback("📰 Bloglar", "MENU_BLOGS")],
    [Markup.button.callback("💱 Kurslar (bugun)", "MENU_RATES")],
    [Markup.button.callback("💬 Feedback", "MENU_FEEDBACK")],
    [Markup.button.callback("🧾 Buyurtma berish", "MENU_PURCHASE")],
  ];
  if (admin) {
    buttons.push(
      [Markup.button.callback("➕ Admin: Mahsulot qo'shish", "ADMIN_ADD_PRODUCT")],
      [Markup.button.callback("✍️ Admin: Blog qo'shish", "ADMIN_ADD_BLOG")],
      [Markup.button.callback("💱 Admin: Kurslarni yangilash", "ADMIN_RATES")],
      [Markup.button.callback("🔎 Admin: Feedbacklar", "ADMIN_LIST_FEEDBACK")],
      [Markup.button.callback("📂 Admin: Kategoriyalar", "ADMIN_CATEGORIES")]
    );
  }
  return Markup.inlineKeyboard(buttons);
};

const builderKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("➕ H1", "BLOG_ADD_H1"), Markup.button.callback("➕ H2", "BLOG_ADD_H2")],
    [Markup.button.callback("➕ Matn", "BLOG_ADD_P"), Markup.button.callback("➕ Iqtibos", "BLOG_ADD_QUOTE")],
    [Markup.button.callback("🖼 Rasm", "BLOG_ADD_IMG")],
    [Markup.button.callback("• Ro'yxat", "BLOG_ADD_UL")],
    [Markup.button.callback("➖ Oxirgisini o'chirish", "BLOG_REMOVE_LAST")],
    [Markup.button.callback("👀 Preview", "BLOG_PREVIEW")],
    [Markup.button.callback("✅ E'lon qilish", "BLOG_PUBLISH")],
    [Markup.button.callback("🔙 Orqaga", "MENU_BACK")],
  ]);

const cancelButton = () =>
  Markup.inlineKeyboard([[Markup.button.callback("❌ Bekor qilish", "CANCEL_ACTION")]]);

const backButton = () =>
  Markup.inlineKeyboard([[Markup.button.callback("🔙 Orqaga", "MENU_BACK")]]);

const yesNoKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("✅ Ha", "YES_ACTION"), Markup.button.callback("❌ Yo'q", "NO_ACTION")]
  ]);

const getCategoriesKeyboard = async (actionPrefix = "CATEGORY_", includeAddNew = true) => {
  const categories = await fetchData("categories");
  const rows = Object.entries(categories).map(([key, name]) => 
    [Markup.button.callback(name, `${actionPrefix}${key}`)]
  );
  
  if (includeAddNew) {
    rows.push([Markup.button.callback("➕ Yangi kategoriya qo'shish", "ADD_NEW_CATEGORY")]);
  }
  
  rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
  return Markup.inlineKeyboard(rows);
};

const getRatingKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("⭐ 1", "RATING_1"), Markup.button.callback("⭐ 2", "RATING_2"), Markup.button.callback("⭐ 3", "RATING_3")],
    [Markup.button.callback("⭐ 4", "RATING_4"), Markup.button.callback("⭐ 5", "RATING_5")],
    [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
  ]);

// ---------- IMGBB UPLOAD ----------
const uploadToImgBB = async (fileId, telegram) => {
  let retryCount = 0;
  const maxRetries = 2;
  const timeoutMs = 10000;

  while (retryCount <= maxRetries) {
    try {
      console.log(`ImgBB ga rasm yuklash urinishi ${retryCount + 1}/${maxRetries + 1}`);
      
      const fileLink = await telegram.getFileLink(fileId);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(fileLink, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`Telegramdan fayl yuklab olinmadi: ${response.status}`);
      }
      
      const buffer = await response.buffer();
      
      if (!process.env.IMGBB_API_KEY) {
        console.warn("IMGBB_API_KEY yo'q. Fallback sifatida Telegram fileLink ishlatiladi.");
        return fileLink.toString();
      }

      const form = new FormData();
      form.append("image", buffer, {
        filename: `image_${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });
      
      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(() => uploadController.abort(), timeoutMs);
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
        signal: uploadController.signal
      });
      const getCategoriesKeyboard = async (actionPrefix = "CATEGORY_", includeAddNew = true) => {
        const categories = await fetchData("categories");
        const rows = Object.entries(categories).map(([key, name]) => 
          [Markup.button.callback(name, `${actionPrefix}${key}`)]
        );
        
        if (includeAddNew) {
          rows.push([Markup.button.callback("➕ Yangi kategoriya qo'shish", "ADD_NEW_CATEGORY")]);
        }
        
        rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
        return Markup.inlineKeyboard(rows);
      };
      clearTimeout(uploadTimeout);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ImgBB server xatosi: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      if (data && data.success && data.data && data.data.url) {
        console.log("ImgBB ga rasm muvaffaqiyatli yuklandi");
        return data.data.url;
  } else {
        throw new Error("ImgBB javobida URL topilmadi");
      }
    } catch (err) {
      retryCount++;
      console.error(`ImgBB upload xatosi (urinish ${retryCount}):`, err.message);
      
      if (retryCount > maxRetries) {
        try {
          const fallback = await telegram.getFileLink(fileId);
          console.warn("Barcha urinishlar muvaffaqiyatsiz. Telegram linki ishlatilmoqda:", fallback.toString());
          return fallback.toString();
        } catch (fallbackError) {
          console.error("Fallback ham ishlamadi:", fallbackError.message);
          return null;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
};

// ---------- RATES HELPERS ----------
const getCurrentRates = async () => {
  const data = await fetchData("settings/rates");
  const { usd = null, eur = null, gold = null, updatedAt = null } = data || {};
  return { usd, eur, gold, updatedAt };
};

const setCurrentRates = async ({ usd, eur, gold }) => {
  const payload = {
    usd,
    eur,
    gold,
    updatedAt: Date.now(),
  };
  const ok = await setData("settings/rates", payload);
  if (ok) await pushData("settings/rates_history", payload);
  return ok;
};

// ---------- MESSAGE MANAGEMENT ----------
const sendAndSaveMessage = async (ctx, text, extra = {}) => {
  try {
    const msg = await ctx.reply(text, extra);
    const session = getSession(ctx.from.id);
    session.messageIds.push(msg.message_id);
    return msg;
  } catch (error) {
    console.error("Xabar yuborishda xato:", error);
    return null;
  }
};

const editAndSaveMessage = async (ctx, messageId, text, extra = {}) => {
  try {
    // Agar messageId bo'lmasa yoki undefined bo'lsa
    if (!messageId) {
      return await sendAndSaveMessage(ctx, text, extra);
    }
    
    await ctx.editMessageText(text, { 
      ...extra,
      message_id: messageId
    });
    return true;
  } catch (error) {
    console.error("Xabarni tahrirlashda xato:", error.message);
    
    // Agar xabar topilmasa, yangi xabar yuboramiz
    if (error.response && error.response.error_code === 400 && 
        error.response.description.includes('message to edit not found')) {
      await sendAndSaveMessage(ctx, text, extra);
      return true;
    }
    
    return false;
  }
};
// ---------- START ----------
bot.start(async (ctx) => {
  const id = ctx.from.id;
  resetSession(id);
  await sendAndSaveMessage(
    ctx,
    `Salom, ${ctx.from.first_name || "Foydalanuvchi"}! Botga xush kelibsiz.`,
    mainMenu(isAdmin(id))
  );
});

// ---------- VALIDATE CHANNEL ----------
(async () => {
  if (!channelId) {
    console.warn("CHANNEL_ID .env da yo'q. Kanalga yuborilmaydi.");
    channelAvailable = false;
  } else {
    try {
      await bot.telegram.getChat(channelId);
      channelAvailable = true;
      console.log("Kanal tekshirildi:", channelId);
    } catch (err) {
      channelAvailable = false;
      console.warn("Kanalni tekshirishda muammo:", err.message);
    }
  }
})();

// ---------- CALLBACK HANDLER ----------
bot.on("callback_query", async (ctx) => {
  const id = ctx.from.id;
  const session = getSession(id);
  const data = ctx.callbackQuery?.data;

  try {
    await ctx.answerCbQuery();

    // ---------- CANCEL ACTION ----------
    if (data === "CANCEL_ACTION") {
      resetSession(id);
      await editAndSaveMessage(ctx, ctx.callbackQuery.message.message_id, "Bosh menyu:", mainMenu(isAdmin(id)));
      return;
    }

    // ---------- BACK TO MENU ----------
    if (data === "MENU_BACK") {
      resetSession(id);
      try {
        await ctx.editMessageText("Bosh menyu:", mainMenu(isAdmin(id)));
      } catch {
        await sendAndSaveMessage(ctx, "Bosh menyu:", mainMenu(isAdmin(id)));
      }
      return;
    }

    // ---------- SHOW PRODUCTS ----------
    if (data === "MENU_PRODUCTS") {
      const products = await fetchData("products");
      if (!products || Object.keys(products).length === 0)
        return sendAndSaveMessage(ctx, "Mahsulotlar mavjud emas.", backButton());

      const rows = Object.entries(products).map(([key, p]) => {
        const title = `${p.name} (${formatUZS(p.price)})`;
        return [Markup.button.callback(title, `PRODUCT_${key}`)];
      });
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
      return sendAndSaveMessage(ctx, "Mahsulotlar ro'yxati:", Markup.inlineKeyboard(rows));
    }

    // ---------- PURCHASE: show products as BUY buttons ----------
    if (data === "MENU_PURCHASE") {
      const products = await fetchData("products");
      if (!products || Object.keys(products).length === 0)
        return sendAndSaveMessage(ctx, "Mahsulotlar mavjud emas.", backButton());

      const rows = Object.entries(products).map(([key, p]) => {
        const title = `${p.name} (${formatUZS(p.price)})`;
        return [Markup.button.callback(title, `BUY_${key}`)];
      });
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);

      session.type = "purchase";
      session.step = "choose_product";
      session.data = {};
      return sendAndSaveMessage(
        ctx,
        "Buyurtma berish — mahsulotni tanlang:",
        Markup.inlineKeyboard(rows)
      );
    }

    // ---------- PRODUCT DETAILS ----------
    if (data && data.startsWith("PRODUCT_")) {
      const key = data.replace("PRODUCT_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return sendAndSaveMessage(ctx, "Mahsulot topilmadi yoki o'chirilgan.", backButton());

      const caption = `🛒 <b>${p.name}</b>\n\n📄 ${p.description || "Tavsif mavjud emas."}\n💰 Narx: ${formatUZS(p.price)}`;
      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback("🧾 Buyurtma berish", `BUY_${key}`)],
        [Markup.button.callback("🔙 Mahsulotlar ro'yxatiga qaytish", "MENU_PRODUCTS")],
      ]);

      if (p.photo) {
        try {
          return await ctx.replyWithPhoto(p.photo, {
            caption,
            parse_mode: "HTML",
            ...buttons,
          });
        } catch {
          // Agar rasm xatosi bo'lsa, matn bilan jo'natamiz
        }
      }
      return sendAndSaveMessage(ctx, caption, buttons);
    }

    // ---------- BUY selected product ----------
    if (data && data.startsWith("BUY_")) {
      const key = data.replace("BUY_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return sendAndSaveMessage(ctx, "Mahsulot topilmadi yoki o'chirilgan.", backButton());

      session.type = "purchase";
      session.step = "quantity";
      session.data = {
        productId: key,
        productName: p.name,
        price_each: Number(p.price),
      };

      const quantityKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback("1", "QTY_1"), Markup.button.callback("2", "QTY_2"), Markup.button.callback("3", "QTY_3")],
        [Markup.button.callback("5", "QTY_5"), Markup.button.callback("10", "QTY_10")],
        [Markup.button.callback("Boshqa son", "QTY_OTHER")],
        [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
      ]);

      return sendAndSaveMessage(
        ctx,
        `Siz: ${p.name}\nNarx: ${formatUZS(p.price)}\n\nMahsulot sonini tanlang:`,
        quantityKeyboard
      );
    }

    // ---------- QUANTITY SELECTION ----------
    if (data && data.startsWith("QTY_")) {
      if (session.type !== "purchase") return;
      
      if (data === "QTY_OTHER") {
        session.step = "quantity_other";
        return sendAndSaveMessage(ctx, "Iltimos, mahsulot sonini kiriting:", cancelButton());
      }
      
      const quantity = parseInt(data.replace("QTY_", ""));
      session.data.quantity = quantity;
      session.step = "address";
      
      const addressKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback("Toshkent shahar", "ADDR_TASHKENT")],
        [Markup.button.callback("Toshkent viloyati", "ADDR_TASHKENT_REGION")],
        [Markup.button.callback("Boshqa manzil", "ADDR_OTHER")],
        [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
      ]);
      
      return sendAndSaveMessage(
        ctx,
        `Mahsulot: ${session.data.productName}\nSoni: ${quantity}\n\nManzilingizni tanlang:`,
        addressKeyboard
      );
    }

    // ---------- ADDRESS SELECTION ----------
    if (data && data.startsWith("ADDR_")) {
      if (session.type !== "purchase" || session.step !== "address") return;
      
      let address = "";
      switch (data) {
        case "ADDR_TASHKENT":
          address = "Toshkent shahar";
          break;
        case "ADDR_TASHKENT_REGION":
          address = "Toshkent viloyati";
          break;
        case "ADDR_OTHER":
          session.step = "address_other";
          return sendAndSaveMessage(ctx, "Iltimos, to'liq manzilingizni kiriting:", cancelButton());
      }
      
      session.data.address = address;
      session.step = "phone";
      
      const phoneKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback("📞 Telefon raqamim", "PHONE_MY")],
        [Markup.button.callback("Boshqa raqam", "PHONE_OTHER")],
        [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
      ]);
      
      return sendAndSaveMessage(
        ctx,
        `Manzil: ${address}\n\nTelefon raqamingizni tanlang yoki kiriting:`,
        phoneKeyboard
      );
    }

    // ---------- PHONE SELECTION ----------
    if (data && data.startsWith("PHONE_")) {
      if (session.type !== "purchase" || session.step !== "phone") return;
      
      if (data === "PHONE_MY") {
        session.data.phone = ctx.from.phone_number || "";
        if (!session.data.phone) {
          return sendAndSaveMessage(ctx, "Telefon raqamingiz topilmadi. Iltimos, boshqa raqam kiriting:", cancelButton());
        }
      } else if (data === "PHONE_OTHER") {
        session.step = "phone_other";
        return sendAndSaveMessage(ctx, "Iltimos, telefon raqamingizni kiriting (+998XXXXXXXXX):", cancelButton());
      }
      
      // Final confirmation
      const priceEach = Number(session.data.price_each || 0);
      const qty = Number(session.data.quantity || 0);
      const total = priceEach * qty;
      session.data.total = total;
      
      const summary =
        `✅ Yangi buyurtma (tasdiqlash uchun chek yuboring)\n\n` +
        `Mahsulot: ${session.data.productName}\n` +
        `Soni: ${qty}\n` +
        `Narx (bir dona): ${formatUZS(priceEach)}\n` +
        `Umumiy: ${formatUZS(total)}\n` +
        `Ism: ${ctx.from.first_name || ""} ${ctx.from.last_name || ""}\n` +
        `Telefon: ${session.data.phone}\n` +
        `Manzil: ${session.data.address}\n` +
        `Telegram: ${ctx.from.username ? `@${ctx.from.username}` : "—"}`;
      
      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback("✅ Men to'lov qildim — Chek yuborish", "UPLOAD_RECEIPT")],
        [Markup.button.callback("❌ Bekor qilish", "CANCEL_ACTION")],
      ]);
      
      session.step = "awaiting_confirm_receipt";
      return sendAndSaveMessage(ctx, summary, buttons);
    }

    // ---------- USER CONFIRMS PAYMENT & READY TO UPLOAD RECEIPT ----------
    if (data === "UPLOAD_RECEIPT") {
      if (session.type !== "purchase") {
        return sendAndSaveMessage(ctx, "Hech qanday buyurtma topilmadi. Yangi buyurtma bering.", mainMenu(isAdmin(id)));
      }
      session.step = "await_receipt";
      return sendAndSaveMessage(
        ctx,
        "Iltimos, to'lov chekini rasm (photo) sifatida yuboring. (Yuborishdan avval qayta tekshiring.)",
        cancelButton()
      );
    }

    // ---------- BLOGS LIST ----------
    if (data === "MENU_BLOGS") {
      const blogs = await fetchData("blogs");
      if (!blogs || Object.keys(blogs).length === 0)
        return sendAndSaveMessage(ctx, "Bloglar hali qo'shilmagan.", backButton());

      const sorted = Object.entries(blogs)
        .map(([key, v]) => ({ key, ...(v || {}) }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 20);

      const rows = sorted.map((b) => [
        Markup.button.callback(b.title || "(sarlavhasiz)", `BLOGVIEW_${b.key}`),
      ]);
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
      return sendAndSaveMessage(ctx, "Bloglar ro'yxati:", Markup.inlineKeyboard(rows));
    }

    // ---------- BLOG DETAILS ----------
    if (data && data.startsWith("BLOGVIEW_")) {
      const key = data.replace("BLOGVIEW_", "");
      const blogs = await fetchData("blogs");
      const b = blogs[key];
      if (!b) return sendAndSaveMessage(ctx, "Blog topilmadi yoki o'chirilgan.", backButton());

      const header = `<b>${b.title || "(Sarlavha yo'q)"}</b>`;
      const meta = `\nKategoriya: ${b.category || "—"} | ⏱ ${b.read_time || "—"} min`;
      const desc = b.description ? `\n\n${b.description}` : "";
      const preview = renderBlocksPreview(b.blocks || []);
      const text = safeTruncate(`${header}${meta}${desc}\n\n${preview}`, 3800);

      if (b.cover) {
        try {
          await ctx.replyWithPhoto(b.cover, {
            caption: text,
            parse_mode: "HTML",
          });
        } catch {
          await sendAndSaveMessage(ctx, text);
        }
      } else {
        await sendAndSaveMessage(ctx, text);
      }
      return;
      
    }
    // ---------- ADMIN CATEGORY SELECTION ----------
if (data && data.startsWith("ADMIN_CAT_")) {
  if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
  
  const categoryId = data.replace("ADMIN_CAT_", "");
  const categories = await fetchData("categories");
  const categoryName = categories[categoryId];
  
  if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
  
  session.type = "admin_category_action";
  session.step = "action";
  session.data.categoryId = categoryId;
  session.data.categoryName = categoryName;
  
  return sendAndSaveMessage(
    ctx,
    `Kategoriya: ${categoryName}\n\nNima qilmoqchisiz?`,
    Markup.inlineKeyboard([
      [Markup.button.callback("✏️ Nomini o'zgartirish", `EDIT_CAT_${categoryId}`)],
      [Markup.button.callback("🗑 O'chirish", `DELETE_CAT_${categoryId}`)],
      [Markup.button.callback("🔙 Orqaga", "ADMIN_CATEGORIES")]
    ])
  );
}
// ---------- CATEGORY SELECTION (PRODUCT) ----------
if (data && data.startsWith("PROD_CAT_")) {
  if (session.type === "admin_product" && session.step === "category") {
    const categoryId = data.replace("PROD_CAT_", "");
    const categories = await fetchData("categories");
    const categoryName = categories[categoryId];
    
    if (categoryName) {
      session.data.category = categoryName;
      session.step = "description";
      return sendAndSaveMessage(ctx, "Mahsulot tavsifini kiriting:", cancelButton());
    }
  }
}

// ---------- CATEGORY SELECTION (BLOG) ----------
if (data && data.startsWith("BLOG_CAT_")) {
  if (session.type === "admin_blog" && session.step === "category") {
    const categoryId = data.replace("BLOG_CAT_", "");
    const categories = await fetchData("categories");
    const categoryName = categories[categoryId];
    
    if (categoryName) {
      session.data.category = categoryName;
      session.step = "read_time";
      return sendAndSaveMessage(ctx, "O'qish vaqti (minutlarda):", cancelButton());
    }
  }
}
    // ---------- RATES (PUBLIC VIEW) ----------
    if (data === "MENU_RATES") {
      const { usd, eur, gold, updatedAt } = await getCurrentRates();
      const updated = updatedAt ? new Date(updatedAt).toLocaleString("uz-UZ") : "—";
      return sendAndSaveMessage(
        ctx,
        `💱 Bugungi kurslar:\n\n$ 1 USD = ${formatUZS(usd)}\n€ 1 EUR = ${formatUZS(eur)}\n🪙 1g OLTIN = ${formatUZS(gold)}\n\nYangilangan: ${updated}`,
        backButton()
      );
    }

    // ---------- FEEDBACK START ----------
    if (data === "MENU_FEEDBACK") {
      session.type = "feedback";
      session.step = "rating";
      session.data = {
        name: `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim()
      };
      return sendAndSaveMessage(
        ctx,
        "Iltimos, bahoingizni tanlang:",
        getRatingKeyboard()
      );
    }

    // ---------- RATING SELECTION ----------
    if (data && data.startsWith("RATING_")) {
      if (session.type !== "feedback") return;
      
      const rating = parseInt(data.replace("RATING_", ""));
      session.data.rating = rating;
      session.step = "text";
      
      return sendAndSaveMessage(
        ctx,
        `Bahoyingiz: ${rating} ⭐\n\nSharhingizni kiriting yoki "O'tkazish" tugmasini bosing:`,
        Markup.inlineKeyboard([
          [Markup.button.callback("📝 Matnli sharh", "FEEDBACK_TEXT")],
          [Markup.button.callback("➡️ O'tkazish", "FEEDBACK_SKIP")],
          [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
        ])
      );
    }

    // ---------- FEEDBACK TEXT OPTIONS ----------
    if (data === "FEEDBACK_TEXT") {
      if (session.type !== "feedback") return;
      
      session.step = "text_input";
      return sendAndSaveMessage(
        ctx,
        "Iltimos, sharhingizni matn shaklida kiriting:",
        cancelButton()
      );
    }

    if (data === "FEEDBACK_SKIP") {
      if (session.type !== "feedback") return;
      
      await pushData("feedback", {
        name: session.data.name,
        rating: session.data.rating,
        text: "",
        createdAt: Date.now(),
      });
      
      sendAndSaveMessage(ctx, "✅ Feedback qabul qilindi. Rahmat!", mainMenu(isAdmin(id)));
      resetSession(id);
      return;
    }

    // ---------- ADMIN ACTIONS ----------
    if (data === "ADMIN_ADD_PRODUCT") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_product";
      session.step = "name";
      session.data = {};
      
      return sendAndSaveMessage(
        ctx,
        "Mahsulot nomini kiriting:",
        cancelButton()
      );
    }

    // ---------- ADMIN CATEGORIES MANAGEMENT ----------
    if (data === "ADMIN_CATEGORIES") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      return sendAndSaveMessage(
        ctx,
        "Kategoriyalarni boshqarish:",
        await getCategoriesKeyboard("ADMIN_CAT_", true)
      );
    }

    if (data === "ADD_NEW_CATEGORY") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_category";
      session.step = "name";
      session.data = {};
      
      return sendAndSaveMessage(
        ctx,
        "Yangi kategoriya nomini kiriting:",
        cancelButton()
      );
    }

    if (data && data.startsWith("ADMIN_CAT_")) {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const categoryId = data.replace("ADMIN_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
      
      session.type = "admin_category_action";
      session.step = "action";
      session.data.categoryId = categoryId;
      session.data.categoryName = categoryName;
      
      return sendAndSaveMessage(
        ctx,
        `Kategoriya: ${categoryName}\n\nNima qilmoqchisiz?`,
        Markup.inlineKeyboard([
          [Markup.button.callback("✏️ Nomini o'zgartirish", `EDIT_CAT_${categoryId}`)],
          [Markup.button.callback("🗑 O'chirish", `DELETE_CAT_${categoryId}`)],
          [Markup.button.callback("🔙 Orqaga", "ADMIN_CATEGORIES")]
        ])
      );
    }

    if (data && data.startsWith("EDIT_CAT_")) {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const categoryId = data.replace("EDIT_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
      
      session.type = "admin_category";
      session.step = "edit_name";
      session.data.categoryId = categoryId;
      session.data.oldName = categoryName;
      
      return sendAndSaveMessage(
        ctx,
        `Kategoriya: ${categoryName}\n\nYangi nomini kiriting:`,
        cancelButton()
      );
    }

    if (data && data.startsWith("DELETE_CAT_")) {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const categoryId = data.replace("DELETE_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
      
      session.type = "admin_category";
      session.step = "confirm_delete";
      session.data.categoryId = categoryId;
      session.data.categoryName = categoryName;
      
      return sendAndSaveMessage(
        ctx,
        `Kategoriya: ${categoryName}\n\nRostan ham o'chirmoqchimisiz?`,
        yesNoKeyboard()
      );
    }

    // ----- ADMIN BLOG: start enhanced flow -----
    if (data === "ADMIN_ADD_BLOG") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_blog";
      session.step = "title";
      session.data = { blocks: [] };
      
      return sendAndSaveMessage(
        ctx,
        "Blog sarlavhasini kiriting:",
        cancelButton()
      );
    }

    // ----- ADMIN LIST FEEDBACK -----
    if (data === "ADMIN_LIST_FEEDBACK") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const feedbacks = await fetchData("feedback");
      if (!feedbacks || Object.keys(feedbacks).length === 0)
        return sendAndSaveMessage(ctx, "Feedbacklar mavjud emas.", backButton());

      const text = safeTruncate(
        Object.values(feedbacks)
          .map((f) => `👤 ${f.name || "Noma'lum"} (${(f.rating ?? "—")}/5)\n${f.text || ""}`)
          .join("\n\n"),
        3800
      );
      return sendAndSaveMessage(ctx, text, backButton());
    }

    // ----- ADMIN RATES MENU -----
    if (data === "ADMIN_RATES") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const { usd, eur, gold, updatedAt } = await getCurrentRates();
      const updated = updatedAt ? new Date(updatedAt).toLocaleString("uz-UZ") : "—";
      
      session.type = "admin_rates";
      session.step = null;
      session.data = {};
      
      const kb = Markup.inlineKeyboard([
        [Markup.button.callback("✏️ USD ni kiritish", "ADMIN_RATES_SET_USD")],
        [Markup.button.callback("✏️ EUR ni kiritish", "ADMIN_RATES_SET_EUR")],
        [Markup.button.callback("✏️ OLTIN (1g) kiritish", "ADMIN_RATES_SET_GOLD")],
        [Markup.button.callback("✅ Saqlash", "ADMIN_RATES_SAVE")],
        [Markup.button.callback("🔙 Orqaga", "MENU_BACK")],
      ]);
      
      return sendAndSaveMessage(
        ctx,
        `Hozirgi kurslar:\n\n$ USD: ${formatUZS(usd)}\n€ EUR: ${formatUZS(eur)}\n🪙 OLTIN (1g): ${formatUZS(gold)}\n\nYangilangan: ${updated}\n\nYangi qiymatlarni kiriting yoki darhol "Saqlash" bosing.`,
        kb
      );
    }

    if (data === "ADMIN_RATES_SET_USD") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_rates";
      session.step = "usd";
      
      return sendAndSaveMessage(
        ctx,
        "USD kursini kiriting (UZS, faqat son):",
        cancelButton()
      );
    }
    
    if (data === "ADMIN_RATES_SET_EUR") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_rates";
      session.step = "eur";
      
      return sendAndSaveMessage(
        ctx,
        "EUR kursini kiriting (UZS, faqat son):",
        cancelButton()
      );
    }
    
    if (data === "ADMIN_RATES_SET_GOLD") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      session.type = "admin_rates";
      session.step = "gold";
      
      return sendAndSaveMessage(
        ctx,
        "1 gram OLTIN narxini kiriting (UZS, faqat son):",
        cancelButton()
      );
    }
    
    if (data === "ADMIN_RATES_SAVE") {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const { usd, eur, gold } = session.data;
      if (usd == null && eur == null && gold == null) {
        return sendAndSaveMessage(
          ctx,
          "Hech qanday yangi kurs kiritilmadi. Avval qiymat kiriting yoki orqaga chiqing.",
          mainMenu(true)
        );
      }
      
      const { usd: curU, eur: curE, gold: curG } = await getCurrentRates();
      const payload = {
        usd: usd ?? curU ?? null,
        eur: eur ?? curE ?? null,
        gold: gold ?? curG ?? null,
      };
      
      const ok = await setCurrentRates(payload);
      if (ok) {
        resetSession(id);
        return sendAndSaveMessage(
          ctx,
          `✅ Kurslar yangilandi:\n\n$ USD: ${formatUZS(payload.usd)}\n€ EUR: ${formatUZS(payload.eur)}\n🪙 OLTIN (1g): ${formatUZS(payload.gold)}`,
          mainMenu(true)
        );
      } else {
        return sendAndSaveMessage(ctx, "Xatolik: Kurslarni saqlab bo'lmadi.", backButton());
      }
    }

    // ---------- BLOG BUILDER (callback actions) ----------
    if (
      data === "BLOG_ADD_H1" ||
      data === "BLOG_ADD_H2" ||
      data === "BLOG_ADD_P" ||
      data === "BLOG_ADD_QUOTE"
    ) {
      if (session.type !== "admin_blog") return;
      
      const map = {
        BLOG_ADD_H1: "h1",
        BLOG_ADD_H2: "h2",
        BLOG_ADD_P: "p",
        BLOG_ADD_QUOTE: "quote",
      };
      
      session.step = "await_block_text";
      session.data.pendingBlockType = map[data];
      
      return sendAndSaveMessage(
        ctx,
        `Matnni kiriting (${map[data].toUpperCase()}):`,
        cancelButton()
      );
    }

    if (data === "BLOG_ADD_UL") {
      if (session.type !== "admin_blog") return;
      
      session.step = "await_block_ul";
      
      return sendAndSaveMessage(
        ctx,
        "Ro'yxat elementlarini yuboring (har bir satr — alohida element). Tugatgach 'done' deb yozing:",
        cancelButton()
      );
    }

    if (data === "BLOG_ADD_IMG") {
      if (session.type !== "admin_blog") return;
      
      session.step = "await_block_image";
      
      return sendAndSaveMessage(
        ctx,
        "Rasmni PHOTO sifatida yuboring (keyin ixtiyoriy sarlavha/izoh berasiz).",
        cancelButton()
      );
    }

    if (data === "BLOG_REMOVE_LAST") {
      if (session.type !== "admin_blog") return;
      
      const blocks = session.data.blocks || [];
      if (!blocks.length) return sendAndSaveMessage(ctx, "O'chirish uchun blok yo'q.", builderKeyboard());
      
      const removed = blocks.pop();
      session.data.blocks = blocks;
      
      return sendAndSaveMessage(
        ctx,
        `Oxirgi blok o'chirildi: ${removed.type}`,
        builderKeyboard()
      );
    }

    if (data === "BLOG_PREVIEW") {
      if (session.type !== "admin_blog") return;
      
      const preview = renderBlocksPreview(session.data.blocks || []);
      
      return sendAndSaveMessage(
        ctx,
        `👀 <b>Preview</b>\n${preview}`,
        builderKeyboard()
      );
    }

    if (data === "BLOG_PUBLISH") {
      if (session.type !== "admin_blog") return;
      
      const d = session.data || {};
      if (!d.title || !d.description || !d.read_time) {
        return sendAndSaveMessage(
          ctx,
          "Iltimos, sarlavha, tavsif va o'qish vaqtini kiriting.",
          builderKeyboard()
        );
      }
      
      const payload = {
        title: d.title,
        category: d.category || null,
        read_time: d.read_time,
        description: d.description,
        cover: d.cover || null,
        blocks: d.blocks || [],
        author: d.author || null,
        createdAt: Date.now(),
      };
      
      const res = await pushData("blogs", payload);
      if (res.ok) {
        resetSession(id);
        return sendAndSaveMessage(
          ctx,
          `✅ Blog saqlandi. ID: ${res.key}`,
          mainMenu(isAdmin(id))
        );
      } else {
        return sendAndSaveMessage(
          ctx,
          "Xatolik: blogni saqlab bo'lmadi.",
          builderKeyboard()
        );
      }
    }

    // ---------- YES/NO ACTIONS ----------
    if (data === "YES_ACTION") {
      if (session.type === "admin_category" && session.step === "confirm_delete") {
        const { categoryId } = session.data;
        
        // Kategoriyani o'chirish
        await setData(`categories/${categoryId}`, null);
        
        sendAndSaveMessage(
          ctx,
          "✅ Kategoriya muvaffaqiyatli o'chirildi.",
          await getCategoriesKeyboard("ADMIN_CAT_", true)
        );
        resetSession(id);
        return;
      }
    }

    if (data === "NO_ACTION") {
      if (session.type === "admin_category" && session.step === "confirm_delete") {
        sendAndSaveMessage(
          ctx,
          "Kategoriya o'chirilmadi.",
          await getCategoriesKeyboard("ADMIN_CAT_", true)
        );
        resetSession(id);
        return;
      }
    }

    // ---------- DEFAULT ----------
    return sendAndSaveMessage(ctx, "Noma'lum tugma bosildi.", backButton());
  } catch (err) {
    console.error("callback_query xatosi:", err);
    sendAndSaveMessage(ctx, "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.", backButton());
  }
});

// ---------- TEXT HANDLER ----------
bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const txtRaw = ctx.message.text || "";
  const txt = txtRaw.trim();
  const session = getSession(id);
// ---------- CATEGORY SELECTION (PRODUCT) ----------
if (session.type === "admin_product" && session.step === "category" && txt.startsWith("PROD_CAT_")) {
  const categoryId = txt.replace("PROD_CAT_", "");
  const categories = await fetchData("categories");
  const categoryName = categories[categoryId];
  
  if (categoryName) {
    session.data.category = categoryName;
    session.step = "description";
    return sendAndSaveMessage(ctx, "Mahsulot tavsifini kiriting:", cancelButton());
  }
}

// ---------- CATEGORY SELECTION (BLOG) ----------
if (session.type === "admin_blog" && session.step === "category" && txt.startsWith("BLOG_CAT_")) {
  const categoryId = txt.replace("BLOG_CAT_", "");
  const categories = await fetchData("categories");
  const categoryName = categories[categoryId];
  
  if (categoryName) {
    session.data.category = categoryName;
    session.step = "read_time";
    return sendAndSaveMessage(ctx, "O'qish vaqti (minutlarda):", cancelButton());
  }
}

// ---------- CATEGORY SELECTION (ADMIN) ----------
if (txt.startsWith("ADMIN_CAT_")) {
  if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
  
  const categoryId = txt.replace("ADMIN_CAT_", "");
  const categories = await fetchData("categories");
  const categoryName = categories[categoryId];
  
  if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
  
  session.type = "admin_category_action";
  session.step = "action";
  session.data.categoryId = categoryId;
  session.data.categoryName = categoryName;
  
  return sendAndSaveMessage(
    ctx,
    `Kategoriya: ${categoryName}\n\nNima qilmoqchisiz?`,
    Markup.inlineKeyboard([
      [Markup.button.callback("✏️ Nomini o'zgartirish", `EDIT_CAT_${categoryId}`)],
      [Markup.button.callback("🗑 O'chirish", `DELETE_CAT_${categoryId}`)],
      [Markup.button.callback("🔙 Orqaga", "ADMIN_CATEGORIES")]
    ])
  );
}
  try {
    // ---------- ADMIN CATEGORY FLOW ----------
    if (session.type === "admin_category") {
      switch (session.step) {
        case "name":
          // Yangi kategoriya qo'shish
          const newCategoryId = `cat_${Date.now()}`;
          await setData(`categories/${newCategoryId}`, txt);
          
          sendAndSaveMessage(
            ctx,
            `✅ "${txt}" kategoriyasi qo'shildi.`,
            await getCategoriesKeyboard("ADMIN_CAT_", true)
          );
          resetSession(id);
          return;
          
        case "edit_name":
          // Kategoriya nomini o'zgartirish
          const { categoryId } = session.data;
          await setData(`categories/${categoryId}`, txt);
          
          sendAndSaveMessage(
            ctx,
            `✅ Kategoriya nomi "${session.data.oldName}" dan "${txt}" ga o'zgartirildi.`,
            await getCategoriesKeyboard("ADMIN_CAT_", true)
          );
          resetSession(id);
          return;
      }
    }

    // ---------- PURCHASE FLOW ----------
    if (session.type === "purchase") {
      switch (session.step) {
        case "quantity_other": {
          const n = Number(txt.replace(/\s+/g, ""));
          if (Number.isNaN(n) || n <= 0) {
            return sendAndSaveMessage(ctx, "Iltimos, to'g'ri son kiriting:", cancelButton());
          }
          
          session.data.quantity = n;
          session.step = "address";
          
          const addressKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback("Toshkent shahar", "ADDR_TASHKENT")],
            [Markup.button.callback("Toshkent viloyati", "ADDR_TASHKENT_REGION")],
            [Markup.button.callback("Boshqa manzil", "ADDR_OTHER")],
            [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
          ]);
          
          return sendAndSaveMessage(
            ctx,
            `Mahsulot: ${session.data.productName}\nSoni: ${n}\n\nManzilingizni tanlang:`,
            addressKeyboard
          );
        }
        
        case "address_other":
          session.data.address = txt;
          session.step = "phone";
          
          const phoneKeyboard = Markup.inlineKeyboard([
            [Markup.button.callback("📞 Telefon raqamim", "PHONE_MY")],
            [Markup.button.callback("Boshqa raqam", "PHONE_OTHER")],
            [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
          ]);
          
          return sendAndSaveMessage(
            ctx,
            `Manzil: ${txt}\n\nTelefon raqamingizni tanlang yoki kiriting:`,
            phoneKeyboard
          );
          
        case "phone_other":
          session.data.phone = txt;
          
          // Final confirmation
          const priceEach = Number(session.data.price_each || 0);
          const qty = Number(session.data.quantity || 0);
          const total = priceEach * qty;
          session.data.total = total;
          
          const summary =
            `✅ Yangi buyurtma (tasdiqlash uchun chek yuboring)\n\n` +
            `Mahsulot: ${session.data.productName}\n` +
            `Soni: ${qty}\n` +
            `Narx (bir dona): ${formatUZS(priceEach)}\n` +
            `Umumiy: ${formatUZS(total)}\n` +
            `Ism: ${ctx.from.first_name || ""} ${ctx.from.last_name || ""}\n` +
            `Telefon: ${txt}\n` +
            `Manzil: ${session.data.address}\n` +
            `Telegram: ${ctx.from.username ? `@${ctx.from.username}` : "—"}`;
          
          const buttons = Markup.inlineKeyboard([
            [Markup.button.callback("✅ Men to'lov qildim — Chek yuborish", "UPLOAD_RECEIPT")],
            [Markup.button.callback("❌ Bekor qilish", "CANCEL_ACTION")],
          ]);
          
          session.step = "awaiting_confirm_receipt";
          return sendAndSaveMessage(ctx, summary, buttons);
      }
    }

    // ---------- FEEDBACK FLOW ----------
    if (session.type === "feedback") {
      if (session.step === "text_input") {
        await pushData("feedback", {
          name: session.data.name,
          rating: session.data.rating,
          text: txt,
          createdAt: Date.now(),
        });
        
        sendAndSaveMessage(ctx, "✅ Feedback qabul qilindi. Rahmat!", mainMenu(isAdmin(id)));
        resetSession(id);
        return;
      }
    }

    // ---------- ADMIN PRODUCT FLOW ----------
    if (session.type === "admin_product") {
      switch (session.step) {
        case "name":
          session.data.name = txt;
          session.step = "price";
          return sendAndSaveMessage(ctx, "Mahsulot narxini kiriting (raqam, UZS):", cancelButton());
          
        case "price": {
          const price = Number(txt.replace(/\s+/g, ""));
          if (Number.isNaN(price) || price <= 0) {
            return sendAndSaveMessage(ctx, "To'g'ri narx kiriting:", cancelButton());
          }
          
          session.data.price = price;
          session.step = "category";
          
          return sendAndSaveMessage(
            ctx,
            "Mahsulot kategoriyasini tanlang:",
            await getCategoriesKeyboard("PROD_CAT_", false)
          );
        }
        
        case "description":
          session.data.description = txt;
          session.step = "photo";
          return sendAndSaveMessage(ctx, "Mahsulot rasmini yuboring (photo):", cancelButton());
      }
    }

    // ---------- ADMIN BLOG FLOW ----------
    if (session.type === "admin_blog") {
      switch (session.step) {
        case "title":
          session.data.title = txt;
          session.step = "category";
          
          return sendAndSaveMessage(
            ctx,
            "Blog kategoriyasini tanlang:",
            await getCategoriesKeyboard("BLOG_CAT_", false)
          );
          
        case "read_time": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) {
            return sendAndSaveMessage(ctx, "Raqam kiriting (minut).", cancelButton());
          }
          
          session.data.read_time = n;
          session.step = "description";
          return sendAndSaveMessage(ctx, "Qisqa tavsif (description) kiriting:", cancelButton());
        }
        
        case "description":
          session.data.description = txt;
          session.step = "cover";
          
          return sendAndSaveMessage(
            ctx,
            "Blog uchun cover rasm yuboring (photo) yoki 'skip' tugmasini bosing:",
            Markup.inlineKeyboard([
              [Markup.button.callback("🖼 Rasm yuborish", "BLOG_COVER_UPLOAD")],
              [Markup.button.callback("➡️ O'tkazish", "BLOG_COVER_SKIP")],
              [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
            ])
          );
          
        case "await_block_text": {
          const type = session.data.pendingBlockType || "p";
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type, text: txt });
          session.step = "builder";
          session.data.pendingBlockType = null;
          
          return sendAndSaveMessage(ctx, "Blok qo'shildi.", builderKeyboard());
        }
        
        case "await_block_ul": {
          if (txt.toLowerCase() === "done") {
            session.step = "builder";
            return sendAndSaveMessage(ctx, "Ro'yxat qo'shildi.", builderKeyboard());
          }
          
          const items = txt
            .split(/\n+/)
            .map((s) => s.trim())
            .filter(Boolean);
          
          if (!items.length) {
            return sendAndSaveMessage(
              ctx,
              "Hech bo'lmasa bitta element kiriting yoki 'done' yozing.",
              cancelButton()
            );
          }
          
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type: "ul", items });
          session.step = "builder";
          
          return sendAndSaveMessage(ctx, "Ro'yxat qo'shildi.", builderKeyboard());
        }
        
        case "await_block_image_caption": {
          // optional caption for the last added image
          const blocks = session.data.blocks || [];
          const last = blocks[blocks.length - 1];
          
          if (last && last.type === "img" && !last.caption) {
            last.caption = txt;
            session.data.blocks = blocks;
            session.step = "builder";
            
            return sendAndSaveMessage(ctx, "Rasm sarlavhasi qo'shildi.", builderKeyboard());
          }
          
          session.step = "builder";
          return sendAndSaveMessage(ctx, "Rasm sarlavhasi o'tkazildi.", builderKeyboard());
        }
        
        case "builder":
          // Any stray text while in builder mode -> treat as paragraph
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type: "p", text: txt });
          
          return sendAndSaveMessage(ctx, "Matn parcha sifatida qo'shildi.", builderKeyboard());
      }
    }

    // ---------- ADMIN RATES FLOW ----------
    if (session.type === "admin_rates") {
      switch (session.step) {
        case "usd": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) {
            return sendAndSaveMessage(ctx, "To'g'ri USD qiymatini kiriting.", cancelButton());
          }
          
          session.data.usd = n;
          session.step = null;
          
          return sendAndSaveMessage(
            ctx,
            "USD qabul qilindi. Yana EUR/GOLD kiritishingiz mumkin yoki '✅ Saqlash' tugmasini bosing.",
            Markup.inlineKeyboard([
              [Markup.button.callback("✏️ EUR ni kiritish", "ADMIN_RATES_SET_EUR")],
              [Markup.button.callback("✏️ OLTIN (1g) kiritish", "ADMIN_RATES_SET_GOLD")],
              [Markup.button.callback("✅ Saqlash", "ADMIN_RATES_SAVE")],
              [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
            ])
          );
        }
        
        case "eur": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) {
            return sendAndSaveMessage(ctx, "To'g'ri EUR qiymatini kiriting.", cancelButton());
          }
          
          session.data.eur = n;
          session.step = null;
          
          return sendAndSaveMessage(
            ctx,
            "EUR qabul qilindi. Yana USD/GOLD kiritishingiz mumkin yoki '✅ Saqlash' tugmasini bosing.",
            Markup.inlineKeyboard([
              [Markup.button.callback("✏️ USD ni kiritish", "ADMIN_RATES_SET_USD")],
              [Markup.button.callback("✏️ OLTIN (1g) kiritish", "ADMIN_RATES_SET_GOLD")],
              [Markup.button.callback("✅ Saqlash", "ADMIN_RATES_SAVE")],
              [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
            ])
          );
        }
        
        case "gold": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) {
            return sendAndSaveMessage(ctx, "To'g'ri OLTIN (1g) qiymatini kiriting.", cancelButton());
          }
          
          session.data.gold = n;
          session.step = null;
          
          return sendAndSaveMessage(
            ctx,
            "OLTIN qabul qilindi. Endi '✅ Saqlash' tugmasini bosing.",
            Markup.inlineKeyboard([
              [Markup.button.callback("✅ Saqlash", "ADMIN_RATES_SAVE")],
              [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
            ])
          );
        }
      }
    }

    // ---------- CATEGORY SELECTION (PRODUCT) ----------
    if (session.type === "admin_product" && session.step === "category" && txt.startsWith("PROD_CAT_")) {
      const categoryId = txt.replace("PROD_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (categoryName) {
        session.data.category = categoryName;
        session.step = "description";
        return sendAndSaveMessage(ctx, "Mahsulot tavsifini kiriting:", cancelButton());
      }
    }

    // ---------- CATEGORY SELECTION (BLOG) ----------
    if (session.type === "admin_blog" && session.step === "category" && txt.startsWith("BLOG_CAT_")) {
      const categoryId = txt.replace("BLOG_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (categoryName) {
        session.data.category = categoryName;
        session.step = "read_time";
        return sendAndSaveMessage(ctx, "O'qish vaqti (minutlarda):", cancelButton());
      }
    }

    // ---------- CATEGORY SELECTION (ADMIN) ----------
    if (txt.startsWith("ADMIN_CAT_")) {
      if (!isAdmin(id)) return sendAndSaveMessage(ctx, "Siz admin emassiz.", backButton());
      
      const categoryId = txt.replace("ADMIN_CAT_", "");
      const categories = await fetchData("categories");
      const categoryName = categories[categoryId];
      
      if (!categoryName) return sendAndSaveMessage(ctx, "Kategoriya topilmadi.", backButton());
      
      session.type = "admin_category_action";
      session.step = "action";
      session.data.categoryId = categoryId;
      session.data.categoryName = categoryName;
      
      return sendAndSaveMessage(
        ctx,
        `Kategoriya: ${categoryName}\n\nNima qilmoqchisiz?`,
        Markup.inlineKeyboard([
          [Markup.button.callback("✏️ Nomini o'zgartirish", `EDIT_CAT_${categoryId}`)],
          [Markup.button.callback("🗑 O'chirish", `DELETE_CAT_${categoryId}`)],
          [Markup.button.callback("🔙 Orqaga", "ADMIN_CATEGORIES")]
        ])
      );
    }

    // No active session or unrecognized text
    return sendAndSaveMessage(ctx, "Iltimos menyudan tanlang yoki /start ni bosing.", mainMenu(isAdmin(id)));
  } catch (err) {
    console.error("text handler xatosi:", err);
    sendAndSaveMessage(ctx, "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.", backButton());
  }
});

// ---------- PHOTO HANDLER ----------
bot.on("photo", async (ctx) => {
  const id = ctx.from.id;
  const session = getSession(id);
  if (!session.type) return; // no session

  if (!ctx.message.photo?.length) return sendAndSaveMessage(ctx, "Iltimos, rasm yuboring.", cancelButton());
  const fileId = ctx.message.photo.at(-1).file_id;

  try {
    // --- If admin uploading product photo ---
    if (session.type === "admin_product" && session.step === "photo") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return sendAndSaveMessage(ctx, "Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.", cancelButton());

      await pushData("products", {
        name: session.data.name,
        price: session.data.price,
        category: session.data.category || "",
        description: session.data.description,
        photo: url, // ALWAYS store URL
        createdAt: Date.now(),
      });

      sendAndSaveMessage(ctx, `✅ Mahsulot qo'shildi: ${session.data.name}`, mainMenu(true));
      resetSession(id);
      return;
    }

    // --- ADMIN BLOG: cover upload ---
    if (session.type === "admin_blog" && session.step === "cover") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return sendAndSaveMessage(ctx, "Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.", cancelButton());
      
      session.data.cover = url; // ALWAYS URL
      session.step = "builder";
      
      return sendAndSaveMessage(
        ctx,
        "Cover saqlandi. Endi kontent bloklarini qo'shing:",
        builderKeyboard()
      );
    }

    // --- ADMIN BLOG: image block upload ---
    if (session.type === "admin_blog" && session.step === "await_block_image") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return sendAndSaveMessage(ctx, "Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.", cancelButton());
      
      session.data.blocks = session.data.blocks || [];
      session.data.blocks.push({ type: "img", url }); // ALWAYS URL
      session.step = "await_block_image_caption";
      
      return sendAndSaveMessage(
        ctx,
        "Rasm uchun sarlavha/izoh kiriting (ixtiyoriy). Agar xohlamasangiz 'skip' tugmasini bosing:",
        Markup.inlineKeyboard([
          [Markup.button.callback("➡️ O'tkazish", "BLOG_IMG_SKIP")],
          [Markup.button.callback("🔙 Orqaga", "MENU_BACK")]
        ])
      );
    }

    // --- If buyer uploading payment receipt ---
    if (
      session.type === "purchase" &&
      (session.step === "await_receipt" || session.step === "awaiting_confirm_receipt")
    ) {
      const receiptUrl = await uploadToImgBB(fileId, ctx.telegram);
      if (!receiptUrl) return sendAndSaveMessage(ctx, "Chekni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.", cancelButton());

      const orderData = {
        productId: session.data.productId || null,
        productName: session.data.productName || "Noma'lum",
        price_each: session.data.price_each || null,
        quantity: session.data.quantity || null,
        total:
          session.data.total ||
          Number(session.data.price_each || 0) * Number(session.data.quantity || 0),
        name: `${(session.data.name || ctx.from.first_name || "")} ${(session.data.last_name || ctx.from.last_name || "")}`.trim(),
        phone: session.data.phone || null,
        address: session.data.address || null,
        telegram: session.data.telegram || (ctx.from.username ? `@${ctx.from.username}` : null),
        receipt: receiptUrl, // ALWAYS URL
        user: {
          id: ctx.from.id,
          username: ctx.from.username || null,
        },
        createdAt: Date.now(),
      };

      await pushData("orders", orderData);

      const caption = `✅ Yangi buyurtma\n\nMahsulot: ${orderData.productName}\nSoni: ${orderData.quantity}\nNarx (bir dona): ${formatUZS(orderData.price_each)}\nUmumiy: ${formatUZS(orderData.total)}\nIsm: ${orderData.name}\nTelefon: ${orderData.phone}\nManzil: ${orderData.address}\nTelegram: ${orderData.telegram || "—"}`;

      try {
        if (channelAvailable) {
          await bot.telegram.sendPhoto(channelId, receiptUrl, {
            caption,
            parse_mode: "HTML",
          });
        }
      } catch (err) {
        console.warn("Kanalga yuborishda xato:", err.message || err);
        if (channelAvailable) {
          try {
            await bot.telegram.sendMessage(channelId, caption, { parse_mode: "HTML" });
          } catch (e) {}
        }
      }

      try {
        await ctx.replyWithPhoto(receiptUrl, { caption, parse_mode: "HTML" });
      } catch (e) {
        await sendAndSaveMessage(ctx, caption);
        if (receiptUrl) await sendAndSaveMessage(ctx, `Chek: ${receiptUrl}`);
      }

      resetSession(id);
      return;
    }

    return sendAndSaveMessage(
      ctx,
      "Hozir rasm qabul qilinmaydi. Agar siz blog tuzayotgan bo'lsangiz, mos tugmani bosing yoki buyurtma bo'lsa chek yuborish bosqichiga kiring.",
      backButton()
    );
  } catch (err) {
    console.error("photo handler xatosi:", err);
    sendAndSaveMessage(ctx, "Rasmni qayta yuklashda xato yuz berdi. Iltimos qayta urinib ko'ring.", backButton());
  }
});

// ---------- LAUNCH BOT ----------
(async () => {
  try {
    await bot.launch();
    console.log("Bot ishga tushdi...");
  } catch (err) {
    console.error("Bot ishga tushmayapti:", err);
  }
})();

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));