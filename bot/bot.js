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
    sessions.set(id, { type: null, step: null, data: {}, createdAt: Date.now() });
  return sessions.get(id);
};
const resetSession = (id) =>
  sessions.set(id, { type: null, step: null, data: {}, createdAt: Date.now() });
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
    await update(ref(db, path), data);
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
        parts.push(`\n“${b.text}”`);
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
      [Markup.button.callback("🔎 Admin: Feedbacklar", "ADMIN_LIST_FEEDBACK")]
    );
  }
  return Markup.inlineKeyboard(buttons);
};

// ---------- IMGBB UPLOAD (YAXSHILANGAN) ----------
const uploadToImgBB = async (fileId, telegram) => {
  let retryCount = 0;
  const maxRetries = 2;
  const timeoutMs = 10000; // 10 soniya timeout

  while (retryCount <= maxRetries) {
    try {
      console.log(`ImgBB ga rasm yuklash urinishi ${retryCount + 1}/${maxRetries + 1}`);
      
      // Telegramdan fayl haqida ma'lumot olish
      const fileLink = await telegram.getFileLink(fileId);
      
      // AbortController bilan timeout qo'shamiz
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      // Rasmni yuklab olish
      const response = await fetch(fileLink, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`Telegramdan fayl yuklab olinmadi: ${response.status}`);
      }
      
      const buffer = await response.buffer();
      
      // Agar ImgBB API kaliti bo'lmasa, Telegram linkini qaytarish
      if (!process.env.IMGBB_API_KEY) {
        console.warn("IMGBB_API_KEY yo'q. Fallback sifatida Telegram fileLink ishlatiladi.");
        return fileLink.toString();
      }

      // FormData-ni to'g'ri tayyorlash
      const form = new FormData();
      form.append("image", buffer, {
        filename: `image_${Date.now()}.jpg`,
        contentType: 'image/jpeg'
      });
      
      // ImgBB ga so'rov yuborish (yana bir timeout bilan)
      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(() => uploadController.abort(), timeoutMs);
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
        signal: uploadController.signal
      });
      
      clearTimeout(uploadTimeout);
      
      // Javobni tekshirish
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
        // Fallback - Telegram fayl linkini qaytarish
        try {
          const fallback = await telegram.getFileLink(fileId);
          console.warn("Barcha urinishlar muvaffaqiyatsiz. Telegram linki ishlatilmoqda:", fallback.toString());
          return fallback.toString();
        } catch (fallbackError) {
          console.error("Fallback ham ishlamadi:", fallbackError.message);
          return null;
        }
      }
      
      // Keyingi urinish oldin kutish
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

// ---------- START ----------
bot.start(async (ctx) => {
  const id = ctx.from.id;
  resetSession(id);
  await ctx.reply(
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

    // ---------- SHOW PRODUCTS (info) ----------
    if (data === "MENU_PRODUCTS") {
      const products = await fetchData("products");
      if (!products || Object.keys(products).length === 0)
        return ctx.reply("Mahsulotlar mavjud emas.");

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
      if (!products || Object.keys(products).length === 0)
        return ctx.reply("Mahsulotlar mavjud emas.");

      const rows = Object.entries(products).map(([key, p]) => {
        const title = `${p.name} (${formatUZS(p.price)})`;
        return [Markup.button.callback(title, `BUY_${key}`)];
      });
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);

      session.type = "purchase";
      session.step = "choose_product";
      session.data = {};
      return ctx.reply(
        "Buyurtma berish — mahsulotni tanlang:",
        Markup.inlineKeyboard(rows)
      );
    }

    // ---------- PRODUCT DETAILS ----------
    if (data && data.startsWith("PRODUCT_")) {
      const key = data.replace("PRODUCT_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return ctx.reply("Mahsulot topilmadi yoki o'chirilgan.");

      const caption = `🛒 <b>${p.name}</b>\n\n📄 ${p.description || "Tavsif mavjud emas."}\n💰 Narx: ${formatUZS(
        p.price
      )}`;
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
      return ctx.replyWithHTML(caption, buttons);
    }

    // ---------- BUY selected product ----------
    if (data && data.startsWith("BUY_")) {
      const key = data.replace("BUY_", "");
      const products = await fetchData("products");
      const p = products[key];
      if (!p) return ctx.reply("Mahsulot topilmadi yoki o'chirilgan.");

      session.type = "purchase";
      session.step = "name";
      session.data = {
        productId: key,
        productName: p.name,
        price_each: Number(p.price),
      };

      return ctx.reply(
        `Siz: ${p.name}\nNarx: ${formatUZS(p.price)}\n\nIltimos, ismingizni kiriting:`
      );
    }

    // ---------- BLOGS LIST ----------
    if (data === "MENU_BLOGS") {
      const blogs = await fetchData("blogs");
      if (!blogs || Object.keys(blogs).length === 0)
        return ctx.reply("Bloglar hali qo'shilmagan.");

      const sorted = Object.entries(blogs)
        .map(([key, v]) => ({ key, ...(v || {}) }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 20);

      const rows = sorted.map((b) => [
        Markup.button.callback(b.title || "(sarlavhasiz)", `BLOGVIEW_${b.key}`),
      ]);
      rows.push([Markup.button.callback("🔙 Orqaga", "MENU_BACK")]);
      return ctx.reply("Bloglar ro'yxati:", Markup.inlineKeyboard(rows));
    }

    // ---------- BLOG DETAILS (separate safe prefix) ----------
    if (data && data.startsWith("BLOGVIEW_")) {
      const key = data.replace("BLOGVIEW_", "");
      const blogs = await fetchData("blogs");
      const b = blogs[key];
      if (!b) return ctx.reply("Blog topilmadi yoki o'chirilgan.");

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
          await ctx.replyWithHTML(text);
        }
      } else {
        await ctx.replyWithHTML(text);
      }
      return;
    }

    // ---------- RATES (PUBLIC VIEW) ----------
    if (data === "MENU_RATES") {
      const { usd, eur, gold, updatedAt } = await getCurrentRates();
      const updated = updatedAt ? new Date(updatedAt).toLocaleString("uz-UZ") : "—";
      return ctx.reply(
        `💱 Bugungi kurslar:\n\n$ 1 USD = ${formatUZS(usd)}\n€ 1 EUR = ${formatUZS(
          eur
        )}\n🪙 1g OLTIN = ${formatUZS(gold)}\n\nYangilangan: ${updated}`,
        Markup.inlineKeyboard([[Markup.button.callback("🔙 Orqaga", "MENU_BACK")]])
      );
    }

    // ---------- FEEDBACK START ----------
    if (data === "MENU_FEEDBACK") {
      session.type = "feedback";
      session.step = "name";
      session.data = {};
      return ctx.reply("Ismingizni kiriting (yoki 'cancel' bilan bekor qiling):");
    }

    // ---------- BACK ----------
    if (data === "MENU_BACK") {
      try {
        await ctx.editMessageText("Bosh menyu:", mainMenu(isAdmin(id)));
      } catch {
        await ctx.reply("Bosh menyu:", mainMenu(isAdmin(id)));
      }
      return;
    }

    // ---------- CANCEL PURCHASE ----------
    if (data === "CANCEL_PURCHASE") {
      resetSession(id);
      return ctx.reply("Buyurtma bekor qilindi.", mainMenu(isAdmin(id)));
    }

    // ---------- USER CONFIRMS PAYMENT & READY TO UPLOAD RECEIPT ----------
    if (data === "UPLOAD_RECEIPT") {
      if (session.type !== "purchase") {
        return ctx.reply(
          "Hech qanday buyurtma topilmadi. Yangi buyurtma bering.",
          mainMenu(isAdmin(id))
        );
      }
      session.step = "await_receipt";
      return ctx.reply(
        "Iltimos, to'lov chekini rasm (photo) sifatida yuboring. (Yuborishdan avval qayta tekshiring.)"
      );
    }

    // ---------- ADMIN ACTIONS ----------
    if (data === "ADMIN_ADD_PRODUCT") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_product";
      session.step = "name";
      session.data = {};
      return ctx.reply("Mahsulot nomini kiriting (yoki 'cancel' bilan bekor qilish):");
    }

    // ----- ADMIN BLOG: start enhanced flow -----
    if (data === "ADMIN_ADD_BLOG") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_blog";
      session.step = "title";
      session.data = { blocks: [] };
      return ctx.reply("Blog sarlavhasini kiriting (yoki 'cancel' bilan bekor qilish):");
    }

    // ----- ADMIN LIST FEEDBACK -----
    if (data === "ADMIN_LIST_FEEDBACK") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      const feedbacks = await fetchData("feedback");
      if (!feedbacks || Object.keys(feedbacks).length === 0)
        return ctx.reply("Feedbacklar mavjud emas.");

      const text = safeTruncate(
        Object.values(feedbacks)
          .map((f) => `👤 ${f.name || "Noma'lum"} (${(f.rating ?? "—")}/5)\n${f.text || ""}`)
          .join("\n\n"),
        3800
      );
      return ctx.reply(text);
    }

    // ----- ADMIN RATES MENU -----
    if (data === "ADMIN_RATES") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
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
      return ctx.reply(
        `Hozirgi kurslar:\n\n$ USD: ${formatUZS(usd)}\n€ EUR: ${formatUZS(
          eur
        )}\n🪙 OLTIN (1g): ${formatUZS(gold)}\n\nYangilangan: ${updated}\n\nYangi qiymatlarni kiriting yoki darhol "Saqlash" bosing.`,
        kb
      );
    }

    if (data === "ADMIN_RATES_SET_USD") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_rates";
      session.step = "usd";
      return ctx.reply("USD kursini kiriting (UZS, faqat son):");
    }
    if (data === "ADMIN_RATES_SET_EUR") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_rates";
      session.step = "eur";
      return ctx.reply("EUR kursini kiriting (UZS, faqat son):");
    }
    if (data === "ADMIN_RATES_SET_GOLD") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      session.type = "admin_rates";
      session.step = "gold";
      return ctx.reply("1 gram OLTIN narxini kiriting (UZS, faqat son):");
    }
    if (data === "ADMIN_RATES_SAVE") {
      if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
      const { usd, eur, gold } = session.data;
      if (usd == null && eur == null && gold == null) {
        return ctx.reply(
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
        return ctx.reply(
          `✅ Kurslar yangilandi:\n\n$ USD: ${formatUZS(payload.usd)}\n€ EUR: ${formatUZS(
            payload.eur
          )}\n🪙 OLTIN (1g): ${formatUZS(payload.gold)}`,
          mainMenu(true)
        );
      } else {
        return ctx.reply("Xatolik: Kurslarni saqlab bo'lmadi.");
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
      return ctx.reply(`Matnni kiriting (${map[data].toUpperCase()}):`);
    }

    if (data === "BLOG_ADD_UL") {
      if (session.type !== "admin_blog") return;
      session.step = "await_block_ul";
      return ctx.reply(
        "Ro'yxat elementlarini yuboring (har bir satr — alohida element). Tugatgach 'done' deb yozing:"
      );
    }

    if (data === "BLOG_ADD_IMG") {
      if (session.type !== "admin_blog") return;
      session.step = "await_block_image";
      return ctx.reply("Rasmni PHOTO sifatida yuboring (keyin ixtiyoriy sarlavha/izoh berasiz).");
    }

    if (data === "BLOG_REMOVE_LAST") {
      if (session.type !== "admin_blog") return;
      const blocks = session.data.blocks || [];
      if (!blocks.length) return ctx.reply("O'chirish uchun blok yo'q.");
      const removed = blocks.pop();
      session.data.blocks = blocks;
      return ctx.reply(`Oxirgi blok o'chirildi: ${removed.type}`);
    }

    if (data === "BLOG_PREVIEW") {
      if (session.type !== "admin_blog") return;
      const preview = renderBlocksPreview(session.data.blocks || []);
      return ctx.replyWithHTML(`👀 <b>Preview</b>\n${preview}`);
    }

    if (data === "BLOG_PUBLISH") {
      if (session.type !== "admin_blog") return;
      const d = session.data || {};
      if (!d.title || !d.description || !d.read_time) {
        return ctx.reply("Iltimos, sarlavha, tavsif va o'qish vaqtini kiriting.");
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
        return ctx.reply(`✅ Blog saqlandi. ID: ${res.key}`, mainMenu(isAdmin(id)));
      } else {
        return ctx.reply("Xatolik: blogni saqlab bo'lmadi.");
      }
    }

    // ---------- DEFAULT ----------
    return ctx.reply("Noma'lum tugma bosildi.");
  } catch (err) {
    console.error("callback_query xatosi:", err);
    ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
});

// ---------- TEXT HANDLER ----------
bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const txtRaw = ctx.message.text || "";
  const txt = txtRaw.trim();
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
          const n = Number(txt.replace(/\s+/g, ""));
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
          session.data.telegram = ctx.from.username ? `@${ctx.from.username}` : null;

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
            `Ism: ${session.data.name}\n` +
            `Telefon: ${session.data.phone}\n` +
            `Manzil: ${session.data.address}\n` +
            `Telegram: ${session.data.telegram || "—"}`;

          const buttons = Markup.inlineKeyboard([
            [Markup.button.callback("✅ Men to'lov qildim — Chek yuborish", "UPLOAD_RECEIPT")],
            [Markup.button.callback("❌ Bekor qilish", "CANCEL_PURCHASE")],
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
            name: `${(session.data.name || "")} ${(session.data.surname || "")}`.trim(),
            rating: session.data.rating,
            text: session.data.text,
            createdAt: Date.now(),
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

    // ---------- ADMIN BLOG FLOW (enhanced) ----------
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
        case "read_time": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) return ctx.reply("Raqam kiriting (minut).");
          session.data.read_time = n;
          session.step = "description";
          return ctx.reply("Qisqa tavsif (description) kiriting:");
        }
        case "description":
          session.data.description = txt;
          session.step = "cover";
          return ctx.reply(
            "Blog uchun cover rasm yuboring (photo) yoki 'skip' deb yozib o'tkazib yuboring:"
          );
        case "await_block_text": {
          const type = session.data.pendingBlockType || "p";
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type, text: txt });
          session.step = "builder";
          session.data.pendingBlockType = null;
          return ctx.reply("Blok qo'shildi.", builderKeyboard());
        }
        case "await_block_ul": {
          if (txt.toLowerCase() === "done") {
            session.step = "builder";
            return ctx.reply("Ro'yxat qo'shildi.", builderKeyboard());
          }
          const items = txt
            .split(/\n+/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (!items.length)
            return ctx.reply("Hech bo'lmasa bitta element kiriting yoki 'done' yozing.");
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type: "ul", items });
          session.step = "builder";
          return ctx.reply("Ro'yxat qo'shildi.", builderKeyboard());
        }
        case "await_block_image_caption": {
          // optional caption for the last added image
          const blocks = session.data.blocks || [];
          const last = blocks[blocks.length - 1];
          if (txt.toLowerCase() !== "skip" && last && last.type === "img" && !last.caption) {
            last.caption = txt;
            session.data.blocks = blocks;
            session.step = "builder";
            return ctx.reply("Rasm sarlavhasi qo'shildi.", builderKeyboard());
          }
          session.step = "builder";
          return ctx.reply("Rasm sarlavhasi o'tkazildi.", builderKeyboard());
        }
        case "builder":
          // Any stray text while in builder mode -> treat as paragraph
          session.data.blocks = session.data.blocks || [];
          session.data.blocks.push({ type: "p", text: txt });
          return ctx.reply("Matn parcha sifatida qo'shildi.", builderKeyboard());
        case "cover":
          if (txt.toLowerCase() === "skip") {
            session.step = "builder";
            return ctx.reply("Cover o'tkazildi. Endi kontent bloklarini qo'shing:", builderKeyboard());
          }
          return ctx.reply("Iltimos cover uchran PHOTO yuboring yoki 'skip' deb yozing.");
        default:
          break;
      }
    }

    // ---------- ADMIN RATES FLOW ----------
    if (session.type === "admin_rates") {
      switch (session.step) {
        case "usd": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) return ctx.reply("To'g'ri USD qiymatini kiriting.");
          session.data.usd = n;
          session.step = null;
          return ctx.reply(
            "USD qabul qilindi. Yana EUR/GOLD kiritishingiz mumkin yoki '✅ Saqlash' tugmasini bosing."
          );
        }
        case "eur": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) return ctx.reply("To'g'ri EUR qiymatini kiriting.");
          session.data.eur = n;
          session.step = null;
          return ctx.reply(
            "EUR qabul qilindi. Yana USD/GOLD kiritishingiz mumkin yoki '✅ Saqlash' tugmasini bosing."
          );
        }
        case "gold": {
          const n = parseNumber(txt);
          if (n == null || n <= 0) return ctx.reply("To'g'ri OLTIN (1g) qiymatini kiriting.");
          session.data.gold = n;
          session.step = null;
          return ctx.reply("OLTIN qabul qilindi. Endi '✅ Saqlash' tugmasini bosing.");
        }
        default:
          return ctx.reply(
            "Kurslarni yangilash menyusidan tugmani tanlang (USD/EUR/OLTIN) yoki '✅ Saqlash' ni bosing."
          );
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
        photo: url, // ALWAYS store URL
        createdAt: Date.now(),
      });

      ctx.reply(`✅ Mahsulot qo'shildi: ${session.data.name}`, mainMenu(true));
      resetSession(id);
      return;
    }

    // --- ADMIN BLOG: cover upload ---
    if (session.type === "admin_blog" && session.step === "cover") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return ctx.reply("Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
      session.data.cover = url; // ALWAYS URL
      session.step = "builder";
      return ctx.reply("Cover saqlandi. Endi kontent bloklarini qo'shing:", builderKeyboard());
    }

    // --- ADMIN BLOG: image block upload ---
    if (session.type === "admin_blog" && session.step === "await_block_image") {
      const url = await uploadToImgBB(fileId, ctx.telegram);
      if (!url) return ctx.reply("Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
      session.data.blocks = session.data.blocks || [];
      session.data.blocks.push({ type: "img", url }); // ALWAYS URL
      session.step = "await_block_image_caption";
      return ctx.reply(
        "Rasm uchun sarlavha/izoh kiriting (ixtiyoriy). Agar xohlamasangiz 'skip' deb yozing."
      );
    }

    // --- If buyer uploading payment receipt ---
    if (
      session.type === "purchase" &&
      (session.step === "await_receipt" || session.step === "awaiting_confirm_receipt")
    ) {
      const receiptUrl = await uploadToImgBB(fileId, ctx.telegram);
      if (!receiptUrl) return ctx.reply("Chekni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");

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

      const caption = `✅ Yangi buyurtma\n\nMahsulot: ${orderData.productName}\nSoni: ${orderData.quantity}\nNarx (bir dona): ${formatUZS(
        orderData.price_each
      )}\nUmumiy: ${formatUZS(orderData.total)}\nIsm: ${orderData.name}\nTelefon: ${orderData.phone}\nManzil: ${orderData.address}\nTelegram: ${orderData.telegram || "—"}`;

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
        await ctx.reply(caption);
        if (receiptUrl) await ctx.reply(`Chek: ${receiptUrl}`);
      }

      resetSession(id);
      return;
    }

    return ctx.reply(
      "Hozir rasm qabul qilinmaydi. Agar siz blog tuzayotgan bo'lsangiz, mos tugmani bosing yoki buyurtma bo'lsa chek yuborish bosqichiga kiring."
    );
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