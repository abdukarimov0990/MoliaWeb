// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push, set, update, remove } from "firebase/database";

// --- Firebase konfiguratsiyasi ---
const firebaseConfig = {
    apiKey: "AIzaSyCX4TqD5CKcvVNrwTY6eU1wd0Gwv-zwJRY",
    authDomain: "moliauz.firebaseapp.com",
    databaseURL: "https://moliauz-default-rtdb.firebaseio.com",
    projectId: "moliauz",
    storageBucket: "moliauz.firebasestorage.app",
    messagingSenderId: "796947800966",
    appId: "1:796947800966:web:99ce095c688d2637904207",
    measurementId: "G-MB022JT8EV"
};

// --- Firebase app va database ---
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// --- Umumiy funksiyalar ---

// Ma'lumot olish
export const fetchFromDB = async (path, returnAsArray = true) => {
    try {
        const dataRef = ref(db, path);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (returnAsArray) {
                // Object bo'lsa arrayga aylantirish
                return typeof data === 'object' && data !== null
                    ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                    : data;
            } else {
                // Object sifatida qaytarish
                return data;
            }
        } else {
            return returnAsArray ? [] : {};
        }
    } catch (err) {
        console.error(`Firebase fetch error [${path}]:`, err);
        return returnAsArray ? [] : {};
    }
};

// Ma'lumot qo'shish
export const pushToDB = async (path, data) => {
    try {
        const newRef = push(ref(db, path));
        await set(newRef, data);
        return { success: true, id: newRef.key };
    } catch (err) {
        console.error(`Firebase push error [${path}]:`, err);
        return { success: false, error: err.message };
    }
};

// Ma'lumot yangilash
export const updateInDB = async (path, data) => {
    try {
        await update(ref(db, path), data);
        return { success: true };
    } catch (err) {
        console.error(`Firebase update error [${path}]:`, err);
        return { success: false, error: err.message };
    }
};

// Ma'lumot o'chirish
export const deleteFromDB = async (path) => {
    try {
        await remove(ref(db, path));
        return { success: true };
    } catch (err) {
        console.error(`Firebase delete error [${path}]:`, err);
        return { success: false, error: err.message };
    }
};

// --- Alohida fetch funksiyalari ---

// Bloglar
export const fetchBlogs = async () => fetchFromDB('blogs');

// Buyurtmalar
export const fetchOrders = async () => fetchFromDB('orders');

// Mahsulotlar
export const fetchProducts = async () => fetchFromDB('products');

// Feedbacklar
export const fetchFeedbacks = async () => fetchFromDB('feedback');

// Kategoriyalar - false parametri bilan obyekt sifatida olish
export const fetchCategories = async () => fetchFromDB('categories', false);

// Sozlamalar (rates)
export const fetchSettings = async () => {
    try {
        const dataRef = ref(db, 'settings');
        const snapshot = await get(dataRef);
        return snapshot.exists() ? snapshot.val() : {};
    } catch (err) {
        console.error('Firebase fetchSettings error:', err);
        return {};
    }
};

// --- Kategoriyalar bilan ishlash ---

// Yangi kategoriya qo'shish
export const addCategory = async (categoryData) => {
    return await pushToDB('categories', {
        ...categoryData,
        createdAt: Date.now()
    });
};

// Kategoriyani yangilash
export const updateCategory = async (categoryId, updates) => {
    return await updateInDB(`categories/${categoryId}`, {
        ...updates,
        updatedAt: Date.now()
    });
};

// Kategoriyani o'chirish
export const deleteCategory = async (categoryId) => {
    return await deleteFromDB(`categories/${categoryId}`);
};

// ID bo'yicha kategoriya o'qish
export const fetchCategoryById = async (categoryId) => {
    try {
        const dataRef = ref(db, `categories/${categoryId}`);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            return { id: categoryId, ...snapshot.val() };
        } else {
            return null;
        }
    } catch (err) {
        console.error(`Firebase fetchCategoryById error [${categoryId}]:`, err);
        return null;
    }
};

// --- Rates funksiyalari ---
export const fetchRates = async () => {
    try {
        const dataRef = ref(db, 'settings/rates');
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            return snapshot.val(); // { usd, eur, gold, updatedAt }
        } else {
            return { usd: null, eur: null, gold: null, updatedAt: null };
        }
    } catch (err) {
        console.error('Firebase fetchRates error:', err);
        return { usd: null, eur: null, gold: null, updatedAt: null };
    }
};

// Rates yangilash
export const updateRates = async (ratesData) => {
    return await updateInDB('settings/rates', {
        ...ratesData,
        updatedAt: Date.now()
    });
};

// --- Mahsulotlar bilan ishlash ---
export const addProduct = async (productData) => {
    return await pushToDB('products', {
        ...productData,
        createdAt: Date.now()
    });
};

export const updateProduct = async (productId, updates) => {
    return await updateInDB(`products/${productId}`, {
        ...updates,
        updatedAt: Date.now()
    });
};

export const deleteProduct = async (productId) => {
    return await deleteFromDB(`products/${productId}`);
};

// --- Bloglar bilan ishlash ---
export const addBlog = async (blogData) => {
    return await pushToDB('blogs', {
        ...blogData,
        createdAt: Date.now()
    });
};

export const updateBlog = async (blogId, updates) => {
    return await updateInDB(`blogs/${blogId}`, {
        ...updates,
        updatedAt: Date.now()
    });
};

export const deleteBlog = async (blogId) => {
    return await deleteFromDB(`blogs/${blogId}`);
};

// --- Feedbacklar bilan ishlash ---
export const addFeedback = async (feedbackData) => {
    return await pushToDB('feedback', {
        ...feedbackData,
        createdAt: Date.now()
    });
};

// --- Export qilingan barcha funksiyalar ---
export {
    ref,
    get,
    push,
    set,
    update,
    remove
};