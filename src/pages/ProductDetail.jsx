import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { products } from "../data/data";
import { FaInstagram, FaPhoneAlt, FaTelegramPlane, FaTimes } from "react-icons/fa";

// Foydalanuvchi izohlari
const feedbacks = [
  {
    name: "Asadbek Raimbekov",
    rating: 5,
    text: `Kecha o'yin super bo'ldi🔥

4-5 soat qanday o'tkanini bilmay qoldim, o'yin qizg'in bo'lganidan umuman o'yinga to'ymadim🥹
Do'stlar va oila davrasida o'ynash uchun super o'yin bo'libdi!
Yana o'yin bo'lsa, o'ylanmasdan boraman🔥`,
  },
  {
    name: "Elnurbek Axmadaliyev",
    rating: 5,
    text: `O'yin absalyut darajada super!
Kasblar, pul aylanishi, xarajatlar hammasi juda reallikka yaqin. Xohlasangiz oila davrasida, xohlasangiz do'stlaringiz bilan maza qilib o'ynashingiz mumkin. 
Bu faqat o'yin emas, balki moliyaviy bilim berishi ham haqiqat! Qolaversa 5-6 marta o'ynasangiz, o'yindagi voqealarni real hayotga ko'chirishingiz ham hech gap emas!😉`,
  },
  {
    name: "Javohir Igamberdiyev",
    rating: 5,
    text: `Molia Game oddiy o'yin emas, bosh qotiradigan, kulgi va raqobat aralashgan o'yin

Kecha 3 soat qanday o'tganini o'zim ham bilmay qoldim. Vaqt yetmay ham qoldi oxirigacha borishga😅
Zo'r o'tdi, hammaga yoqdi. O'zbekiston iqtisodiyotiga moslashtirilgani esa o'yinga boshqacha zavq qo'shgan.
Do'stlar bilan birga o'ynasa, kayfiyat ham zo'r bo'ladi! O'ynashni tavsiya qilaman!`,
  },
];

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));
  const [showContact, setShowContact] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mahsulot topilmadi</h2>
        <Link to="/" className="text-mainBlue dark:text-mainBlueLight underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-main transition-colors duration-300">

      {/* Mahsulot ma'lumotlari */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10">
          <motion.img
            src={product.image}
            alt={product.name}
            className="rounded-xl shadow-lg object-cover w-full h-[400px] dark:shadow-gray-700/50"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
            <p className="text-mainRed dark:text-mainRedLight text-2xl font-bold mb-4">${product.price}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
            <button
              onClick={() => setShowContact(true)}
              className="bg-mainBlue dark:bg-mainBlueLight text-white py-3 px-6 rounded-lg shadow hover:opacity-90 transition"
            >
              Sotib olish
            </button>
          </motion.div>
        </div>
      </section>

      {/* Foydalanuvchi izohlari */}
      <section className="bg-white dark:bg-gray-800 py-16 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">Foydalanuvchi izohlari</h2>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1.7}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            className="pb-10 custom-swiper"
          >
            {feedbacks.map((fb, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="bg-white/20 dark:bg-gray-700/80 backdrop-blur-md border border-gray-300 dark:border-gray-600 h-[300px] p-8 rounded-xl shadow max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{fb.name}</h3>
                  <div className="text-yellow-400 mb-4">
                    {"⭐".repeat(fb.rating)}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {showAll ? fb.text : fb.text.slice(0, 200) + "... "}
                    {!showAll && (
                      <button
                        className="font-bold text-blue-600 dark:text-blue-400"
                        onClick={() => setShowAll(true)}
                      >
                        Ko'proq
                      </button>
                    )}
                  </p>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Contact Modal */}
      {showContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl w-96 p-8 shadow-2xl flex flex-col items-center gap-6 transition-colors duration-300"
          >
            {/* Close button */}
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition"
              aria-label="Yopish"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300 text-lg" />
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sotib olish uchun</h3>
            <p className="text-base text-gray-500 dark:text-gray-400 text-center">
              Quyidagi kanallar orqali biz bilan bog'laning
            </p>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-4">
              <a
                href="https://t.me/your_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-[#2AABEE] text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaTelegramPlane size={22} />
                <span>Telegram</span>
              </a>

              <a
                href="https://instagram.com/your_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-red-400 to-yellow-400 text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaInstagram size={22} />
                <span>Instagram</span>
              </a>

              <a
                href="tel:+998901234567"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-green-600 text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaPhoneAlt size={22} />
                <span>+998 90 123 45 67</span>
              </a>
            </div>

            {/* Footer text */}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Yoki yozing: @your_username</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}