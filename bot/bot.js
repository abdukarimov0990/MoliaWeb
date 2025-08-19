// bot.js (ES module)
import { Telegraf, Markup } from "telegraf";
import { db } from "./firebase.js";
import { ref, get, push, set } from "firebase/database";
import dotenv from "dotenv";
import FormData from "form-data";
import fetch from "node-fetch";

dotenv.config();

// ---------- CONFIG ----------
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const rawChannel = process.env.CHANNEL_ID ?? "";
const channelId = rawChannel.trim();
const admins = process.env.ADMIN_ID
  ? process.env.ADMIN_ID
      .split(",")                  // vergul bo'yicha ajratish
      .map((s) => Number(s.trim())) // har birini raqamga aylantirish
      .filter(n => !Number.isNaN(n)) // NaNlarni olib tashlash
  : [];

let channelAvailable = false;

// ---------- SESSIONS ----------
const sessions = new Map();
const getSession = (id) => {
  if (!sessions.has(id)) sessions.set(id, { type: null, step: null, data: {}, createdAt: Date.now() });
  return sessions.get(id);
};
const resetSession = (id) => sessions.set(id, { type: null, step: null, data: {}, createdAt: Date.now() });
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
    return true;
  } catch (err) {
    console.error("Firebase push error:", err);
    return false;
  }
};

// ---------- IMGBB UPLOAD (optional) ----------
const uploadToImgBB = async (fileId, telegram) => {
  try {
    // get file URL from Telegram
    const fileLink = await telegram.getFileLink(fileId);
    const response = await fetch(fileLink);
    const buffer = await response.buffer();

    if (!process.env.IMGBB_API_KEY) {
      // fallback: return telegram file link if no IMGBB key
      return fileLink;
    }

    const form = new FormData();
    form.append("image", buffer.toString("base64"));
    form.append("key", process.env.IMGBB_API_KEY);

    const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data && data.success && data.data && data.data.url) return data.data.url;
    throw new Error("imgBB upload failed");
  } catch (err) {
    console.error("imgBB upload error:", err.message || err);
    try {
      // last resort: try returning telegram file link
      const fallbackLink = await telegram.getFileLink(fileId);
      return fallbackLink;
    } catch (e) {
      return null;
    }
  }
};

// ---------- UI HELPERS ----------
const formatUZS = (n) => {
  if (n == null) return "...";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return `${Math.round(num).toLocaleString()} UZS`;
};

const mainMenu = (admin = false) => {
  const buttons = [
    [Markup.button.callback("🛍 Mahsulotlar", "MENU_PRODUCTS")],
    [Markup.button.callback("📰 Bloglar", "MENU_BLOGS")],
    [Markup.button.callback("💬 Feedback", "MENU_FEEDBACK")],
    [Markup.button.callback("🧾 Buyurtma berish", "MENU_PURCHASE")],
  ];
  if (admin) {
    buttons.push(
      [Markup.button.callback("➕ Admin: Mahsulot qo'shish", "ADMIN_ADD_PRODUCT")],
      [Markup.button.callback("✍️ Admin: Blog qo'shish", "ADMIN_ADD_BLOG")],
      [Markup.button.callback("🔎 Admin: Feedbacklar", "ADMIN_LIST_FEEDBACK")]
    );
  }
  return Markup.inlineKeyboard(buttons);
};

// ---------- START ----------
bot.start(async (ctx) => {
  const id = ctx.from.id;
  resetSession(id);
  ctx.reply(`Salom, ${ctx.from.first_name || "Foydalanuvchi"}! Botga xush kelibsiz.`, mainMenu(isAdmin(id)));
});

// ---------- VALIDATE CHANNEL ----------
(async () => {
  if (!channelId) {
    console.warn("CHANNEL_ID .env da yarim yoki bo'sh. Kanalga pochta yuborilmaydi.");
    channelAvailable = false;
  } else {
    try {
      await bot.telegram.getChat(channelId);
      channelAvailable = true;
      console.log("Kanal mavjud va tekshirildi:", channelId);
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

    // ---------- SHOW PRODUCTS (info) ----------
    if (data === "MENU_PRODUCTS") {
      const products = await fetchData("products");
      if (!products || Object.keys(products).length === 0) return ctx.reply("Mahsulotlar mavjud emas.");

      const rows = Object.entries(products).map(([key, p]) => {
        const title = `${p.name} (${formatUZS(p.price)})`;
        return [Markup.button.callback(title, `PRODUCT_${key}`)];
      });
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
      return ctx.reply("Mahsulotlar ro'yxati:", Markup.inlineKeyboard(rows));
    }

    // ---------- PURCHASE: show products as BUY buttons ----------
    if (data === "MENU_PURCHASE") {
      const products = await fetchData("products");
      if (!products || Object.keys(products).length === 0) return ctx.reply("Mahsulotlar mavjud emas.");

      const rows = Object.entries(products).map(([key, p]) => {
        const title = `${p.name} (${formatUZS(p.price)})`;
        return [Markup.button.callback(title, `BUY_${key}`)];
      });
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);

      // set session to purchase mode
      session.type = "purchase";
      session.step = "choose_product";
      session.data = {};
      return ctx.reply("Buyurtma berish — mahsulotni tanlang:", Markup.inlineKeyboard(rows));
    }

    // ---------- PRODUCT DETAILS ----------
    if (data && data.startsWith("PRODUCT_")) {
      const key = data.replace("PRODUCT_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return ctx.reply("Mahsulot topilmadi yoki o'chirilgan.");

      const caption = `🛒 <b>${p.name}</b>\n\n📄 ${p.description || "Tavsif mavjud emas."}\n💰 Narx: ${formatUZS(p.price)}`;
      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback("🧾 Buyurtma berish", `BUY_${key}`)],
        [Markup.button.callback("🔙 Mahsulotlar ro'yxatiga qaytish", "MENU_PRODUCTS")]
      ]);

      if (p.photo) {
        return ctx.replyWithPhoto(p.photo, { caption, parse_mode: "HTML", ...buttons });
      } else {
        return ctx.replyWithHTML(caption, buttons);
      }
    }

    // ---------- BUY selected product (start purchase flow) ----------
    if (data && data.startsWith("BUY_")) {
      const key = data.replace("BUY_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return ctx.reply("Mahsulot topilmadi yoki o'chirilgan.");

      // initialize purchase session with product info
      session.type = "purchase";
      session.step = "name"; // first ask buyer name
      session.data = {
        productId: key,
        productName: p.name,
        price_each: Number(p.price)
      };

      return ctx.reply(`Siz: ${p.name}\nNarx: ${formatUZS(p.price)}\n\nIltimos, ismingizni kiriting:`);
    }

    // ---------- BACK ----------
    if (data === "MENU_BACK") {
      return ctx.editMessageText("Bosh menyu:", mainMenu(isAdmin(id)));
    }

    // ---------- CANCEL PURCHASE ----------
    if (data === "CANCEL_PURCHASE") {
      resetSession(id);
      return ctx.reply("Buyurtma bekor qilindi.", mainMenu(isAdmin(id)));
    }

    // ---------- USER CONFIRMS PAYMENT & READY TO UPLOAD RECEIPT ----------
    if (data === "UPLOAD_RECEIPT") {
      if (session.type !== "purchase") {
        return ctx.reply("Hech qanday buyurtma topilmadi. Yangi buyurtma bering.", mainMenu(isAdmin(id)));
      }
      session.step = "await_receipt";
      return ctx.reply("Iltimos, to'lov chekini rasm (photo) sifatida yuboring. (Yuborishdan avval qayta tekshiring.)");
    }

    // ---------- ADMIN ACTIONS ----------
    if (data === "ADMIN_ADD_PRODUCT") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_product";
      session.step = "name";
      session.data = {};
      return ctx.reply("Mahsulot nomini kiriting (yoki 'cancel' bilan bekor qilish):");
    }
    if (data === "ADMIN_ADD_BLOG") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_blog";
      session.step = "title";
      session.data = {};
      return ctx.reply("Blog sarlavhasini kiriting (yoki 'cancel' bilan bekor qilish):");
    }
    if (data === "ADMIN_LIST_FEEDBACK") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      const feedbacks = await fetchData("feedback");
      if (Object.keys(feedbacks).length === 0) return ctx.reply("Feedbacklar mavjud emas.");
      return ctx.reply(
        Object.values(feedbacks).map(f => `👤 ${f.name} (${f.rating}/5)\n${f.text}`).join("\n\n")
      );
    }

    // ---------- FEEDBACK MENU ----------
    if (data === "MENU_FEEDBACK") {
      session.type = "feedback";
      session.step = "name";
      session.data = {};
      return ctx.reply("Ismingizni kiriting (yoki 'cancel' bilan bekor qilish):");
    }

    return ctx.reply("Noma'lum tugma bosildi.");
  } catch (err) {
    console.error("callback_query xatosi:", err);
    ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
});

// ---------- TEXT HANDLER ----------
bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const txt = (ctx.message.text || "").trim();
  const session = getSession(id);

  // Cancel session
  if (txt.toLowerCase() === "cancel") {
    resetSession(id);
    return ctx.reply("Sessiya bekor qilindi.", mainMenu(isAdmin(id)));
  }

  try {
    // ---------- PURCHASE FLOW ----------
    if (session.type === "purchase") {
      switch (session.step) {
        case "name":
          session.data.name = txt;
          session.step = "quantity";
          return ctx.reply("Soni kiriting:");
        case "quantity": {
          const n = Number(txt);
          if (Number.isNaN(n) || n <= 0) return ctx.reply("Iltimos, to'g'ri son kiriting.");
          session.data.quantity = n;
          session.step = "address";
          return ctx.reply("Manzilni kiriting (ko'cha, bino, shahar):");
        }
        case "address":
          session.data.address = txt;
          session.step = "phone";
          return ctx.reply("Telefon raqamingizni kiriting (masalan: +998901234567):");
        case "phone": {
          session.data.phone = txt;
          // optionally get telegram username automatically
          session.data.telegram = ctx.from.username ? `@${ctx.from.username}` : null;

          // prepare summary and ask to upload receipt
          const priceEach = Number(session.data.price_each || 0);
          const qty = Number(session.data.quantity || 0);
          const total = priceEach * qty;

          // store total
          session.data.total = total;

          const summary =
            `✅ Yangi buyurtma (tasdiqlash uchun chek yuboring)\n\n` +
            `Mahsulot: ${session.data.productName}\n` +
            `Soni: ${qty}\n` +
            `Narx (bir dona): ${formatUZS(priceEach)}\n` +
            `Umumiy: ${formatUZS(total)}\n` +
            `Ism: ${session.data.name}\n` +
            `Telefon: ${session.data.phone}\n` +
            `Manzil: ${session.data.address}\n` +
            `Telegram: ${session.data.telegram || "—"}`;

          // buttons: upload receipt or cancel
          const buttons = Markup.inlineKeyboard([
            [Markup.button.callback("✅ Men to'lov qildim — Chek yuborish", "UPLOAD_RECEIPT")],
            [Markup.button.callback("❌ Bekor qilish", "CANCEL_PURCHASE")]
          ]);

          session.step = "awaiting_confirm_receipt";
          return ctx.reply(summary, buttons);
        }
        default:
          return ctx.reply("Iltimos menyudan tanlang yoki /start ni bosing.", mainMenu(isAdmin(id)));
      }
    }

    // ---------- FEEDBACK FLOW ----------
    if (session.type === "feedback") {
      switch (session.step) {
        case "name":
          session.data.name = txt;
          session.step = "surname";
          return ctx.reply("Familiyangizni kiriting:");
        case "surname":
          session.data.surname = txt;
          session.step = "rating";
          return ctx.reply("Bahoni kiriting (1-5):");
        case "rating": {
          const n = Number(txt);
          if (Number.isNaN(n) || n < 1 || n > 5) return ctx.reply("Iltimos 1 dan 5 gacha son kiriting.");
          session.data.rating = n;
          session.step = "text";
          return ctx.reply("Sharhingizni kiriting:");
        }
        case "text":
          session.data.text = txt;
          await pushData("feedback", {
            name: `${session.data.name} ${session.data.surname}`,
            rating: session.data.rating,
            text: session.data.text,
            createdAt: Date.now()
          });
          ctx.reply("✅ Feedback qabul qilindi. Rahmat!", mainMenu(isAdmin(id)));
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
          return ctx.reply("Mahsulot narxini kiriting (raqam, UZS):");
        case "price": {
          const price = Number(txt.replace(/\s+/g, ""));
          if (Number.isNaN(price) || price <= 0) return ctx.reply("To'g'ri narx kiriting.");
          session.data.price = price;
          session.step = "description";
          return ctx.reply("Mahsulot tavsifini kiriting:");
        }
        case "description":
          session.data.description = txt;
          session.step = "photo";
          return ctx.reply("Mahsulot rasmini yuboring (photo):");
      }
    }

    // ---------- ADMIN BLOG FLOW ----------
    if (session.type === "admin_blog") {
      switch (session.step) {
        case "title":
          session.data.title = txt;
          session.step = "category";
          return ctx.reply("Kategoriya kiriting (masalan: Maslahat, Foydali, O'yin):");
        case "category":
          session.data.category = txt;
          session.step = "read_time";
          return ctx.reply("O'qish vaqti (minutlarda):");
        case "read_time":
          session.data.read_time = txt;
          session.step = "description";
          return ctx.reply("Qisqa tavsif kiriting:");
        case "description":
          session.data.description = txt;
          session.step = "photo";
          return ctx.reply("Blog rasmni yuboring (photo):");
      }
    }

    // No active session
    return ctx.reply("Iltimos menyudan tanlang yoki /start ni bosing.", mainMenu(isAdmin(id)));
  } catch (err) {
    console.error("text handler xatosi:", err);
    ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
});

// ---------- PHOTO HANDLER ----------
bot.on("photo", async (ctx) => {
  const id = ctx.from.id;
  const session = getSession(id);
  if (!session.type) return; // no session

  // Latest photo file_id
  if (!ctx.message.photo?.length) return ctx.reply("Iltimos, rasm yuboring.");
  const fileId = ctx.message.photo.at(-1).file_id;

  try {
    // --- If admin uploading product photo ---
    if (session.type === "admin_product" && session.step === "photo") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return ctx.reply("Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");

      await pushData("products", {
        name: session.data.name,
        price: session.data.price,
        description: session.data.description,
        photo: url,
        createdAt: Date.now()
      });

      ctx.reply(`✅ Mahsulot qo'shildi: ${session.data.name}`, mainMenu(true));
      resetSession(id);
      return;
    }

    // --- If admin uploading blog photo ---
    if (session.type === "admin_blog" && session.step === "photo") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return ctx.reply("Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
    
      await pushData("blogs", {
        title: session.data.title,
        category: session.data.category,
        read_time: session.data.read_time,
        description: session.data.description,
        photo: url,
        createdAt: Date.now()
      });
    
      ctx.reply(`✅ Blog qo'shildi: ${session.data.title}`, mainMenu(true));
      resetSession(id);
      return;
    }
    
    // --- If buyer uploading payment receipt ---
    if (session.type === "purchase" && (session.step === "await_receipt" || session.step === "awaiting_confirm_receipt")) {
      // Accept receipt
      const receiptUrl = await uploadToImgBB(fileId, ctx.telegram);
      if (!receiptUrl) return ctx.reply("Chekni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");

      // finalize order data
      const orderData = {
        productId: session.data.productId || null,
        productName: session.data.productName || "Noma'lum",
        price_each: session.data.price_each || null,
        quantity: session.data.quantity || null,
        total: session.data.total || (Number(session.data.price_each || 0) * Number(session.data.quantity || 0)),
        name: session.data.name || `${ctx.from.first_name || ""} ${ctx.from.last_name || ""}`.trim(),
        phone: session.data.phone || null,
        address: session.data.address || null,
        telegram: session.data.telegram || (ctx.from.username ? `@${ctx.from.username}` : null),
        receipt: receiptUrl,
        user: {
          id: ctx.from.id,
          username: ctx.from.username || null
        },
        createdAt: Date.now()
      };

      // save to firebase
      await pushData("orders", orderData);

      // Build caption text (as you required)
      const caption =
`✅ Yangi buyurtma

Mahsulot: ${orderData.productName}
Soni: ${orderData.quantity}
Narx (bir dona): ${formatUZS(orderData.price_each)}
Umumiy: ${formatUZS(orderData.total)}
Ism: ${orderData.name}
Telefon: ${orderData.phone}
Manzil: ${orderData.address}
Telegram: ${orderData.telegram || "—"}`;

      // send to channel (photo + caption) if available
      try {
        if (channelAvailable) {
          // If receiptUrl is a telegram file link (starts with https://api.telegram.org/file/...), send by URL
          await bot.telegram.sendPhoto(channelId, receiptUrl, { caption, parse_mode: "HTML" });
        }
      } catch (err) {
        console.warn("Kanalga yuborishda xato:", err.message || err);
        // fallback: try send message without photo
        if (channelAvailable) {
          try {
            await bot.telegram.sendMessage(channelId, caption, { parse_mode: "HTML" });
          } catch (e) {}
        }
      }

      // send confirmation to user (photo + caption)
      try {
        await ctx.replyWithPhoto(receiptUrl, { caption, parse_mode: "HTML" });
      } catch (e) {
        // fallback: send text and link
        await ctx.reply(caption);
        if (receiptUrl) await ctx.reply(`Chek: ${receiptUrl}`);
      }

      resetSession(id);
      return;
    }

    // default: not expecting photo
    return ctx.reply("Hozir rasm qabul qilinmaydi. Agar siz buyurtma berayotgan bo'lsangiz, avval 'Buyurtma berish' tugmasini bosing.");
  } catch (err) {
    console.error("photo handler xatosi:", err);
    ctx.reply("Rasmni qayta yuklashda xato yuz berdi. Iltimos qayta urinib ko'ring.");
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
