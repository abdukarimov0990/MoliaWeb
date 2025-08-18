import React, { useState, useEffect, useRef } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import Typed from 'typed.js';
import { fetchBlogs } from '../../bot/firebase';
import { uploadImageToImgBB } from '../../bot/uploadImageToImgBB';

const categories = ["Barchasi", "Maslahat", "Foydali", "O'yin"];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const typingRef = useRef(null); // Typed.js uchun ref

  // Typed.js init
  useEffect(() => {
    if (!typingRef.current) return;

    const typed = new Typed(typingRef.current, {
      strings: ['yangiliklar', 'postlar', 'maslahatlar'],
      typeSpeed: 100,
      backSpeed: 60,
      loop: true,
      showCursor: true,
      cursorChar: '|',
    });

    return () => typed.destroy();
  }, []);

  // Bloglarni olish va rasmni imgBB orqali yuklash
  useEffect(() => {
    const getNews = async () => {
      try {
        const news = await fetchBlogs();

        const newsWithImgBB = await Promise.all(
          news.map(async (item) => {
            if (item.imageFile) {
              try {
                const url = await uploadImageToImgBB(item.imageFile);
                return { ...item, photo: url };
              } catch (err) {
                console.error("Rasm yuklanmadi:", err);
                return { ...item, photo: '' };
              }
            } else {
              return item; // agar rasm URL allaqachon mavjud bo'lsa
            }
          })
        );

        setAllNews(newsWithImgBB);
      } catch (err) {
        console.error("Bloglarni olishda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  const filteredNews =
    selectedCategory === "Barchasi"
      ? allNews
      : allNews.filter((item) => item.category === selectedCategory);

  if (loading) return <p className="text-center py-20">Yuklanmoqda...</p>;

  return (
    <section className="py-20 bg-white dark:bg-gray-900 font-main overflow-x-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Typed.js */}
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          <span ref={typingRef}></span>
        </h2>

        {/* Kategoriya filter */}
        <div className="flex gap-4 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-colors duration-300 ${
                selectedCategory === cat
                  ? 'bg-mainBlue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bloglar grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {news.photo && (
                  <motion.img
                    src={news.photo}
                    alt={news.title}
                    className="w-full h-52 object-cover"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <div className="p-6 space-y-3">
                  <motion.span
                    className="inline-block text-sm text-mainRed dark:text-mainRedLight font-medium uppercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {news.category}
                  </motion.span>
                  <motion.h3
                    className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-mainBlue dark:group-hover:text-mainBlueLight transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {news.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {news.description}
                  </motion.p>
                  <motion.p
                    className="text-gray-400 dark:text-gray-500 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    O'qish vaqti: {news.read_time} daqiqa
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Link
                      to={news.link}
                      className="inline-flex items-center gap-1 text-mainBlue dark:text-mainBlueLight font-medium hover:underline transition group-hover:text-mainRed dark:group-hover:text-mainRedLight duration-300"
                    >
                      Batafsil o'qish <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default News;
