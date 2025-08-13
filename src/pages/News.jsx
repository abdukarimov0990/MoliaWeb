import React, { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion, AnimatePresence } from 'framer-motion';
import 'swiper/css';
import Typed from 'typed.js';

const allNews = [
    {
        id: 1,
        title: "Moliyani boshqarishdagi 3 ta keng tarqalgan xato",
        category: "Maslahat",
        desc: "Ko'pchilik daromad oshgan sari xarajatni ham orttiradi — bu eng keng tarqalgan xatolardan biri.",
        image: "/images/news-1.jpg",
        link: "/blog/moliya-xatolar"
    },
    {
        id: 2,
        title: "Pul haqida bilishingiz kerak bo'lgan 5 haqiqat",
        category: "Foydali",
        desc: "Pulni tejash emas, balki qanday ishlatishni bilish muhimroq. Biz buni tahlil qilamiz.",
        image: "/images/news-2.jpg",
        link: "/blog/pul-haqiqat"
    },
    {
        id: 3,
        title: "Moliya o'yini orqali savodxonlikni oshiring",
        category: "O'yin",
        desc: "Stol o'yinlari orqali moliyaviy fikrlashni qanday rivojlantirish mumkin?",
        image: "/images/news-3.jpg",
        link: "/blog/moliya-oyin"
    },
    {
        id: 4,
        title: "Byudjet tuzishda eng ko'p qilinadigan 5 xato",
        category: "Maslahat",
        desc: "Byudjetlashtirish jarayonida qanday xatolarga yo'l qo'ymaslik kerakligini bilib oling.",
        image: "/images/news-4.jpg",
        link: "/blog/byudjet-xatolar"
    },
    {
        id: 5,
        title: "Tejamkorlik: Har kuni 10 ming so'm tejash usullari",
        category: "Foydali",
        desc: "Oddiy kundalik odatlarni o'zgartirib katta miqdorda pul tejash mumkin.",
        image: "/images/news-5.jpg",
        link: "/blog/tejash-usullari"
    },
    {
        id: 6,
        title: "O'yin orqali bolalarga moliya o'rgatish",
        category: "O'yin",
        desc: "Yosh avlodga moliyani interaktiv usullar orqali o'rgatish afzalliklari haqida bilib oling.",
        image: "/images/news-6.jpg",
        link: "/blog/bolalar-oyin"
    },
];

const categories = ["Barchasi", "Maslahat", "Foydali", "O'yin"];

const News = () => {
    const [selectedCategory, setSelectedCategory] = useState("Barchasi");

    useEffect(() => {
        // Typing animatsiyasi uchun
        const typed = new Typed('.typing-animation', {
            strings: ['yangiliklar', 'postlar', 'maslahatlar'],
            typeSpeed: 100,
            backSpeed: 60,
            loop: true,
            showCursor: true,
            cursorChar: '|',
        });

        return () => {
            typed.destroy();
        };
    }, []);

    const filteredNews =
        selectedCategory === "Barchasi"
            ? allNews
            : allNews.filter((item) => item.category === selectedCategory);

    return (
        <section className="py-20 bg-white dark:bg-gray-900 font-main overflow-x-hidden transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                        <span className="typing-animation"></span>{' '}
                        <motion.span 
                            className="text-mainRed dark:text-mainRedLight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                        >
                        </motion.span>
                    </h1>
                    <motion.p 
                        className="text-gray-600 dark:text-gray-400 mt-4 text-lg max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                    >
                        So'nggi moliyaviy maslahatlar, foydali ma'lumotlar va o'yinlar haqidagi yangiliklar.
                    </motion.p>
                </motion.div>

                {/* Category Filter */}
                {/* Kompyuter (lg va undan katta) uchun flex tugmalar */}
                <motion.div 
                    className="hidden lg:flex flex-wrap justify-center gap-4 mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    {categories.map((cat, index) => (
                        <motion.button
                            key={cat}
                            className={`px-6 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                                selectedCategory === cat
                                    ? 'bg-mainBlue dark:bg-mainBlueLight text-white border-mainBlue dark:border-mainBlueLight'
                                    : 'bg-white dark:bg-gray-800 text-mainBlue dark:text-mainBlueLight border-mainBlue dark:border-mainBlueLight hover:bg-mainBlue dark:hover:bg-mainBlueLight hover:text-white'
                            }`}
                            onClick={() => setSelectedCategory(cat)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Mobil (lg dan kichik) uchun Swiper */}
                <motion.div 
                    className="lg:hidden mb-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Swiper
                        spaceBetween={10}
                        slidesPerView="auto"
                        freeMode={true}
                        className="w-full px-2"
                    >
                        {categories.map((cat, index) => (
                            <SwiperSlide key={cat} className="w-auto">
                                <motion.button
                                    className={`px-6 py-2 rounded-full border transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                                        selectedCategory === cat
                                            ? 'bg-mainBlue dark:bg-mainBlueLight text-white border-mainBlue dark:border-mainBlueLight'
                                            : 'bg-white dark:bg-gray-800 text-mainBlue dark:text-mainBlueLight border-mainBlue dark:border-mainBlueLight hover:bg-mainBlue dark:hover:bg-mainBlueLight hover:text-white'
                                    }`}
                                    onClick={() => setSelectedCategory(cat)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                >
                                    {cat}
                                </motion.button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>

                {/* News Cards */}
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
                                <motion.div className="overflow-hidden">
                                    <motion.img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-52 object-cover"
                                        initial={{ scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.div>
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
                                        {news.desc}
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