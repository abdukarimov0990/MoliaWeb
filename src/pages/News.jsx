import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';


const allNews = [
    {
        id: 1,
        title: "Moliyani boshqarishdagi 3 ta keng tarqalgan xato",
        category: "Maslahat",
        desc: "Ko‘pchilik daromad oshgan sari xarajatni ham orttiradi — bu eng keng tarqalgan xatolardan biri.",
        image: "/images/news-1.jpg",
        link: "/blog/moliya-xatolar"
    },
    {
        id: 2,
        title: "Pul haqida bilishingiz kerak bo‘lgan 5 haqiqat",
        category: "Foydali",
        desc: "Pulni tejash emas, balki qanday ishlatishni bilish muhimroq. Biz buni tahlil qilamiz.",
        image: "/images/news-2.jpg",
        link: "/blog/pul-haqiqat"
    },
    {
        id: 3,
        title: "Moliya o‘yini orqali savodxonlikni oshiring",
        category: "O‘yin",
        desc: "Stol o‘yinlari orqali moliyaviy fikrlashni qanday rivojlantirish mumkin?",
        image: "/images/news-3.jpg",
        link: "/blog/moliya-oyin"
    },
    {
        id: 4,
        title: "Byudjet tuzishda eng ko‘p qilinadigan 5 xato",
        category: "Maslahat",
        desc: "Byudjetlashtirish jarayonida qanday xatolarga yo‘l qo‘ymaslik kerakligini bilib oling.",
        image: "/images/news-4.jpg",
        link: "/blog/byudjet-xatolar"
    },
    {
        id: 5,
        title: "Tejamkorlik: Har kuni 10 ming so‘m tejash usullari",
        category: "Foydali",
        desc: "Oddiy kundalik odatlarni o‘zgartirib katta miqdorda pul tejash mumkin.",
        image: "/images/news-5.jpg",
        link: "/blog/tejash-usullari"
    },
    {
        id: 6,
        title: "O‘yin orqali bolalarga moliya o‘rgatish",
        category: "O‘yin",
        desc: "Yosh avlodga moliyani interaktiv usullar orqali o‘rgatish afzalliklari haqida bilib oling.",
        image: "/images/news-6.jpg",
        link: "/blog/bolalar-oyin"
    },
];

const categories = ["Barchasi", "Maslahat", "Foydali", "O‘yin"];

const News = () => {
    const [selectedCategory, setSelectedCategory] = useState("Barchasi");

    const filteredNews =
        selectedCategory === "Barchasi"
            ? allNews
            : allNews.filter((item) => item.category === selectedCategory);

    return (
        <section className="py-20 bg-white font-main">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        Yangiliklar va <span className="text-mainRed">Postlar</span>
                    </h1>
                    <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
                        So‘nggi moliyaviy maslahatlar, foydali ma’lumotlar va o‘yinlar haqidagi yangiliklar.
                    </p>
                </div>

                {/* Category Filter */}
                {/* Kompyuter (lg va undan katta) uchun flex tugmalar */}
                <div className="hidden lg:flex flex-wrap justify-center gap-4 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`px-6 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${selectedCategory === cat
                                    ? 'bg-mainBlue text-white border-mainBlue'
                                    : 'bg-white text-mainBlue border-mainBlue hover:bg-mainBlue hover:text-white'
                                }`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Mobil (lg dan kichik) uchun Swiper */}
                <div className="lg:hidden mb-10">
                    <Swiper
                        spaceBetween={0}
                        slidesPerView="3"
                        freeMode={true}
                        className="w-full px-2"
                    >
                        {categories.map((cat) => (
                            <SwiperSlide key={cat} className="w-auto">
                                <button
                                    className={`px-6 py-2 rounded-full border transition-all duration-200 text-sm font-medium whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-mainBlue text-white border-mainBlue'
                                            : 'bg-white text-mainBlue border-mainBlue hover:bg-mainBlue hover:text-white'
                                        }`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* News Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredNews.map((news) => (
                        <div
                            key={news.id}
                            className="group bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                        >
                            <img
                                src={news.image}
                                alt={news.title}
                                className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="p-6 space-y-3">
                                <span className="inline-block text-sm text-mainRed font-medium uppercase tracking-wider">
                                    {news.category}
                                </span>
                                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-mainBlue transition-colors">
                                    {news.title}
                                </h3>
                                <p className="text-gray-600 text-sm">{news.desc}</p>
                                <Link
                                    to={news.link}
                                    className="inline-flex items-center gap-1 text-mainBlue font-medium hover:underline transition"
                                >
                                    Batafsil o‘qish <FaArrowRight className="text-sm" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default News;
