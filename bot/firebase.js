// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push, set } from "firebase/database";

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
export const fetchFromDB = async (path) => {
    try {
        const dataRef = ref(db, path);
        const snapshot = await get(dataRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Object bo'lsa arrayga aylantirish
            return typeof data === 'object'
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : data;
        } else {
            return [];
        }
    } catch (err) {
        console.error(`Firebase fetch error [${path}]:`, err);
        return [];
    }
};

// Ma'lumot qo'shish
export const pushToDB = async (path, data) => {
    try {
        const newRef = push(ref(db, path));
        await set(newRef, data);
        return true;
    } catch (err) {
        console.error(`Firebase push error [${path}]:`, err);
        return false;
    }
};

// --- Alohida fetch funksiyalari ---
export const fetchBlogs = async () => fetchFromDB('blogs');
export const fetchOrders = async () => fetchFromDB('orders');
export const fetchProducts = async () => fetchFromDB('products');
export const fetchFeedbacks = async () => fetchFromDB('feedback'); // Feedbacklar

// --- Rates fetch funksiyasi ---
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
