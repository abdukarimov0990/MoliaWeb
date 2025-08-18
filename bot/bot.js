// bot.js (ES module)
import { Telegraf, Markup } from "telegraf";
import { db } from "./firebase.js";
import { ref, get, push, set } from "firebase/database";
import dotenv from "dotenv";
import FormData from "form-data";
import fetch from "node-fetch";

dotenv.config();

// --- CONFIG ---
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const rawChannel = process.env.CHANNEL_ID ?? "";
const channelId = rawChannel.trim();
const admins = process.env.ADMIN_ID
  ? process.env.ADMIN_ID.split(",").map((s) => Number(s.trim())).filter(n => !Number.isNaN(n))
  : [];

let channelAvailable = false;

// --- Sessions ---
const sessions = new Map();
const getSession = (id) => {
  if (!sessions.has(id)) sessions.set(id, { type: null, step: null, data: {} });
  return sessions.get(id);
};
const resetSession = (id) => sessions.set(id, { type: null, step: null, data: {} });
const isAdmin = (id) => admins.includes(Number(id));

// --- Firebase helpers ---
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

// --- imgBB upload ---
const uploadToImgBB = async (fileId, telegram) => {
  try {
    const fileLink = await telegram.getFileLink(fileId);
    const response = await fetch(fileLink);
    const buffer = await response.buffer();

    const form = new FormData();
    form.append("image", buffer.toString("base64"));
    form.append("key", process.env.IMGBB_API_KEY);

    const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.success) return data.data.url;
    throw new Error("imgBB upload failed");
  } catch (err) {
    console.error("imgBB upload error:", err.message);
    return null;
  }
};

// --- Menyu helpers ---
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

// --- Start ---
bot.start(async (ctx) => {
  const id = ctx.from.id;
  resetSession(id);
  ctx.reply(`Salom, ${ctx.from.first_name || "Foydalanuvchi"}! Botga xush kelibsiz.`, mainMenu(isAdmin(id)));
});

// --- Validate channel ---
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

// --- CALLBACK handler ---
bot.on("callback_query", async (ctx) => {
  const id = ctx.from.id;
  const session = getSession(id);
  const data = ctx.callbackQuery?.data;

  try {
    await ctx.answerCbQuery();

    switch (data) {
      case "MENU_FEEDBACK":
        session.type = "feedback";
        session.step = "name";
        session.data = {};
        return ctx.reply("Ismingizni kiriting (yoki 'cancel' bilan bekor qilish):");
      case "MENU_PRODUCTS":
        const products = await fetchData("products");
        if (Object.keys(products).length === 0) return ctx.reply("Mahsulotlar mavjud emas.");
        return ctx.reply(
          Object.values(products).map(p => `🛒 ${p.name} - ${p.price} so'm`).join("\n")
        );
      case "MENU_BLOGS":
        const blogs = await fetchData("blogs");
        if (Object.keys(blogs).length === 0) return ctx.reply("Bloglar mavjud emas.");
        return ctx.reply(
          Object.values(blogs).map(b => `📰 ${b.title} (${b.category})`).join("\n")
        );
      case "MENU_PURCHASE":
        session.type = "purchase";
        session.step = "product";
        return ctx.reply("Mahsulot nomini kiriting (yoki 'cancel' bilan bekor qilish):");
      case "ADMIN_ADD_PRODUCT":
        if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
        session.type = "admin_product";
        session.step = "name";
        session.data = {};
        return ctx.reply("Mahsulot nomini kiriting (yoki 'cancel' bilan bekor qilish):");
      case "ADMIN_ADD_BLOG":
        if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
        session.type = "admin_blog";
        session.step = "title";
        session.data = {};
        return ctx.reply("Blog sarlavhasini kiriting (yoki 'cancel' bilan bekor qilish):");
      case "ADMIN_LIST_FEEDBACK":
        if (!isAdmin(id)) return ctx.reply("Siz admin emassiz.");
        const feedbacks = await fetchData("feedback");
        if (Object.keys(feedbacks).length === 0) return ctx.reply("Feedbacklar mavjud emas.");
        return ctx.reply(
          Object.values(feedbacks).map(f => `👤 ${f.name} (${f.rating}/5)\n${f.text}`).join("\n\n")
        );
      default:
        return ctx.reply("Noma'lum tugma bosildi.");
    }
  } catch (err) {
    console.error("callback_query xatosi:", err);
    ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
});

// --- TEXT handler ---
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
    // PURCHASE FLOW
    if (session.type === "purchase") {
      switch (session.step) {
        case "product":
          session.data.productName = txt;
          session.step = "quantity";
          return ctx.reply("Soni kiriting:");
        case "quantity":
          const n = Number(txt);
          if (Number.isNaN(n) || n <= 0) return ctx.reply("Iltimos, to'g'ri son kiriting.");
          session.data.quantity = n;
          session.step = "address";
          return ctx.reply("Manzilni kiriting (ko'cha, bino, shahar):");
        case "address":
          session.data.address = txt;
          session.step = "phone";
          return ctx.reply("Telefon raqamingizni kiriting (masalan: +998901234567):");
        case "phone":
          session.data.phone = txt;
          await pushData("orders", session.data);
          ctx.replyWithHTML(
            `✅ <b>Buyurtma qabul qilindi:</b>\nMahsulot: ${session.data.productName}\nSoni: ${session.data.quantity}\nManzil: ${session.data.address}\nTelefon: ${session.data.phone}`
          );
          resetSession(id);
          return;
      }
    }

    // FEEDBACK FLOW
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
        case "rating":
          const n = Number(txt);
          if (Number.isNaN(n) || n < 1 || n > 5) return ctx.reply("Iltimos 1 dan 5 gacha son kiriting.");
          session.data.rating = n;
          session.step = "text";
          return ctx.reply("Sharhingizni kiriting:");
        case "text":
          session.data.text = txt;
          await pushData("feedback", {
            name: `${session.data.name} ${session.data.surname}`,
            rating: session.data.rating,
            text: session.data.text
          });
          ctx.reply("✅ Feedback qabul qilindi. Rahmat!");
          resetSession(id);
          return;
      }
    }

    // ADMIN PRODUCT FLOW
    if (session.type === "admin_product") {
      switch (session.step) {
        case "name":
          session.data.name = txt;
          session.step = "price";
          return ctx.reply("Mahsulot narxini kiriting (so'mda):");
        case "price":
          const price = Number(txt);
          if (Number.isNaN(price) || price <= 0) return ctx.reply("To'g'ri narx kiriting.");
          session.data.price = price;
          session.step = "description";
          return ctx.reply("Mahsulot tavsifini kiriting:");
        case "description":
          session.data.description = txt;
          session.step = "photo";
          return ctx.reply("Mahsulot rasmini yuboring:");
      }
    }

    // ADMIN BLOG FLOW
    if (session.type === "admin_blog") {
      switch (session.step) {
        case "title":
          session.data.title = txt;
          session.step = "category";
          return ctx.reply("Kategoriya kiriting (masalan: Texnologiya, Umumiy):");
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
          return ctx.reply("Blog rasmni yuboring:");
      }
    }
  } catch (err) {
    console.error("text handler xatosi:", err);
    ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  }
});

// --- PHOTO handler ---
bot.on("photo", async (ctx) => {
  const id = ctx.from.id;
  const session = getSession(id);
  if (!session.type || session.step !== "photo") return;

  if (!ctx.message.photo?.length) return ctx.reply("Iltimos, rasm yuboring.");

  const fileId = ctx.message.photo.at(-1).file_id;
  const url = await uploadToImgBB(fileId, ctx.telegram);
  if (!url) return ctx.reply("Rasmni yuklashda xatolik yuz berdi. Qayta yuboring.");

  session.data.photo = url;

  if (session.type === "admin_product") {
    await pushData("products", session.data);
    ctx.reply(`✅ Mahsulot qo'shildi: ${session.data.name}`, mainMenu(true));
  }
  if (session.type === "admin_blog") {
    await pushData("blogs", session.data);
    ctx.reply(`✅ Blog qo'shildi: ${session.data.title}`, mainMenu(true));
  }
  resetSession(id);
});

// --- Launch bot ---
(async () => {
  try {
    await bot.launch();
    console.log("Bot ishga tushdi...");
  } catch (err) {
    console.error("Bot ishga tushmayapti:", err);
  }
})();
