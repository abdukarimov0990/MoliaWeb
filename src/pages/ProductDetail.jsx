import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaInstagram, FaLongArrowAltLeft, FaLongArrowAltRight, FaPhoneAlt, FaTelegramPlane, FaTimes } from "react-icons/fa";
import { fetchProducts, fetchFeedbacks } from "../../bot/firebase"; // fetchProducts va fetchFeedbacks
import { MdKeyboardArrowLeft } from "react-icons/md";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [showAllFeedback, setShowAllFeedback] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mahsulotlarni olish
        const products = await fetchProducts();
        const selectedProduct = products.find((p) => p.id === id);
        setProduct(selectedProduct || null);
  
        // Feedbacklarni olish (hamma feedbacklar)
        const allFeedbacks = await fetchFeedbacks(); // fetchFeedbacks - barcha feedbacklarni qaytaradigan funksiyangiz
        setFeedbacks(allFeedbacks || []);
        
      } catch (err) {
        console.error("Ma'lumotlarni olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-900 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Yuklanmoqda...</h2>
      </div>
    );
  }

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
        <Link to="/products" className="mb-5 p-5 flex items-center gap-2"> <MdKeyboardArrowLeft size={24}></MdKeyboardArrowLeft>Bosh sahifa </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <motion.img
            src={product.photo} // imgBB link
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
          {feedbacks.length > 0 ? (
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
              {feedbacks.map((fb) => (
                <SwiperSlide key={fb.id}>
                  <motion.div
                    className="bg-white/20 dark:bg-gray-700/80 backdrop-blur-md border border-gray-300 dark:border-gray-600 h-[300px] p-8 rounded-xl shadow max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{fb.name}</h3>
                    <div className="text-yellow-400 mb-4">{"⭐".repeat(fb.rating)}</div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {showAllFeedback[fb.id] ? fb.text : fb.text.slice(0, 200) + "... "}
                      {!showAllFeedback[fb.id] && (
                        <button
                          className="font-bold text-blue-600 dark:text-blue-400"
                          onClick={() =>
                            setShowAllFeedback((prev) => ({ ...prev, [fb.id]: true }))
                          }
                        >
                          Ko'proq
                        </button>
                      )}
                    </p>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">Hali izohlar mavjud emas</p>
          )}
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
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition"
              aria-label="Yopish"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300 text-lg" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sotib olish uchun</h3>
            <p className="text-base text-gray-500 dark:text-gray-400 text-center">
              Quyidagi kanallar orqali biz bilan bog'laning
            </p>
            <div className="w-full flex flex-col gap-4">
              <a
                href="https://t.me/@MoliaUzBot"
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
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Yoki yozing: @your_username</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
