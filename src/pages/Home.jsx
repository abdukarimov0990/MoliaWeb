import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FaArrowRight, FaWallet, FaSearchDollar, FaClock, FaRegStickyNote, FaTimesCircle, FaLightbulb, FaCheckCircle, FaPiggyBank, FaChartLine, FaCoins } from 'react-icons/fa';
import hero from '../assets/img/hero.png';
import oyin1 from '../assets/img/oyin1.jpg';
import oyin2 from '../assets/img/oyin2.jpg';
import oyin3 from '../assets/img/oyin3.jpg';
import patternRight from '../assets/img/rightPattern.png';
import patternLeft from '../assets/img/leftPattern.png';
import { fetchBlogs } from '../../bot/firebase';
import uploadImageToImgBB from '../../bot/uploadImageToImgBB';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { RiBankLine } from 'react-icons/ri';
import { MdAttachMoney } from 'react-icons/md';
import { motion } from 'framer-motion';
import Typed from 'typed.js';

const tips = [
  {
    title: "Pullarim qayerga ketdi?",
    text: "Kuyinmang, bu hammada bo'ladi, lekin...",
    icon: <FaWallet className="text-mainRed dark:text-mainRedLight text-3xl" />
  },
  {
    title: "Aslida",
    text: "Pul o'z-o'zidan yo'qolmaydi, siz yozmagansiz.",
    icon: <FaSearchDollar className="text-mainBlue dark:text-mainBlueLight text-3xl" />
  },
  {
    title: "Ha!",
    text: "Yozsangiz kuzatasiz, kuzatsangiz nazorat qilasiz.",
    icon: <FaRegStickyNote className="text-mainRed dark:text-mainRedLight text-3xl" />
  },
  {
    title: "Xa, bo'ldi!",
    text: "+/- larni yozish 5-10 daqiqa vaqt oladi xolos.",
    icon: <FaClock className="text-mainBlue dark:text-mainBlueLight text-3xl" />
  },
  {
    title: "Ko'p vaqt oladi!",
    text: "Bajarib ko'rmaganingiz uchun bu fikrdasiz.",
    icon: <FaTimesCircle className="text-mainRed dark:text-mainRedLight text-3xl" />
  },
  {
    title: "Tavsiya",
    text: "MoliaUz siz uchun tayyor dastur.",
    icon: <FaLightbulb className="text-mainBlue dark:text-mainBlueLight text-3xl" />
  },
];

const newsList = [
  {
    id: 1,
    title: "Moliyani boshqarishdagi 3 ta keng tarqalgan xato",
    category: "Maslahat",
    desc: "Ko'pchilik daromad oshgan sari xarajatni ham orttiradi - bu eng keng tarqalgan xatolardan biri.",
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
];

const Home = () => {
  const [allNews, setAllNews] = useState([]);

  useEffect(() => {
    // Typing animatsiyasi uchun
    const typed = new Typed('.typing-animation', {
      strings: ['aqlli', 'innovatsion', 'samarali', 'zamonaviy'],
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
  useEffect(() => {
    const getNews = async () => {
      try {
        const news = await fetchBlogs();

        const newsWithImgBB = await Promise.all(
          news.map(async (item) => {
            if (item.imageFile) {
              try {
                const url = await uploadImageToImgBB(item.imageFile);
                return { ...item, cover: url };
              } catch (err) {
                console.error("Rasm yuklanmadi:", err);
                return { ...item, cover: '' };
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

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl font-main overflow-x-hidden transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="py-24 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-16">
          {/* Text */}
          <motion.div
            className="text-center md:text-left space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
              Moliyaviy barqarorlik <br className='hidden lg:block' /> uchun{' '}
              <span className="text-mainBlue dark:text-mainBlueLight typing-animation"></span>{' '} <br />
              <motion.span
                className="text-mainRed dark:text-mainRedLight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                yechimlar
              </motion.span>
            </h1>
            <motion.p
              className="text-gray-500 dark:text-gray-400 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <span className="text-mainRed dark:text-mainRedLight font-medium">MoliaUz</span> sizga byudjet nazorati, stol o'yinlari orqali
              <span className="text-mainBlue dark:text-mainBlueLight"> moliya savodxonligi</span> va innovatsion vositalarni taklif etadi.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center md:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to="/news"
                className="inline-flex items-center gap-2 bg-mainBlue dark:bg-mainBlueLight text-white px-6 py-3 rounded-full text-sm md:text-base shadow-md hover:shadow-lg hover:bg-mainRed dark:hover:bg-mainRedLight transition-all duration-300 hover:-translate-y-1"
              >
                Postlar <FaArrowRight size={16} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 border border-mainRed dark:border-mainRedLight text-mainRed dark:text-mainRedLight px-6 py-3 rounded-full text-sm md:text-base hover:bg-mainBlue dark:hover:bg-mainBlueLight hover:text-white transition-all duration-300 hover:-translate-y-1"
              >
                Mahsulotlar
              </Link>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src={hero}
              alt="MoliaUz Hero"
              className="w-full hidden lg:block max-w-md mx-auto transition-transform duration-500 hover:rotate-1 hover:scale-105"
            />
          </motion.div>
        </div>
      </section>

      {/* TIPS SECTION */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden transition-colors duration-300">
        <div className="container mx-auto px-4">
          {/* Floating elements */}
          <motion.img
            src={patternRight}
            alt=""
            className="w-32 absolute right-0 lg:right-20  rotate-90 top-0  dark:opacity-30"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
            <motion.img
            src={patternLeft}
            alt=""
            className="w-32 absolute left-0 lg:left-20 rotate-90 bottom-0  dark:opacity-30"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="text-mainBlue dark:text-mainBlueLight text-6xl absolute top-10 left-10 rotate-12 opacity-20 dark:opacity-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <FaPiggyBank />
          </motion.div>

          <motion.div
            className="text-mainBlue dark:text-mainBlueLight text-7xl absolute bottom-16 right-10 -rotate-45 opacity-20 dark:opacity-10"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.3 }}
          >
            <FaChartLine />
          </motion.div>

          <motion.div
            className="text-mainRed dark:text-mainRedLight text-5xl absolute top-1/2 left-4 -translate-y-1/2 -rotate-6 opacity-20 dark:opacity-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.7 }}
          >
            <RiBankLine />
          </motion.div>

          <motion.div
            className="text-mainBlue dark:text-mainBlueLight text-8xl absolute bottom-10 left-1/3 rotate-45 opacity-20 dark:opacity-10"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: 0.2 }}
          >
            <MdAttachMoney />
          </motion.div>

          <motion.div
            className="text-mainRed dark:text-mainRedLight text-6xl absolute top-10 right-1/4 -rotate-12 opacity-20 dark:opacity-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.4 }}
          >
            <FaCoins />
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
  {tips.map((tip, index) => (
    <motion.div
      key={index}
      className="relative flex flex-col items-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 group bg-white dark:bg-gray-700"
      style={{
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
      initial={{ opacity: 0, x: -50 }}      // chap tomondan boshlash
      whileInView={{ opacity: 1, x: 0 }}    // o‘z joyiga kelish
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Stroke effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all duration-500 pointer-events-none" />

      <div className="mb-4 scale-150 group-hover:scale-[1.7] transition-transform duration-500">
        {tip.icon}
      </div>
      <h3 className="text-2xl text-center font-semibold text-mainBlue dark:text-mainBlueLight group-hover:text-mainRed dark:group-hover:text-mainRedLight transition-colors duration-300">
        {tip.title}
      </h3>
      <p className="text-base text-center text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
        {tip.text}
      </p>
    </motion.div>
  ))}
</div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-24 font-main transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Moliyani <span className="text-mainRed dark:text-mainRedLight">tushunish</span> — bu{' '}
            <TypingText text="hotirjam yashash san'ati" />
          </motion.h2>

          <motion.p
            className="text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <strong className="text-mainBlue dark:text-mainBlueLight">Molia</strong> — bu zamonaviy FinTech startap.
            Biz foydalanuvchilarga moliyaviy savodxonlikni oshirish, daromad/xarajatni kuzatish va ongli boshqarish vositalarini taqdim etamiz.
          </motion.p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaLightbulb className="text-mainBlue dark:text-mainBlueLight text-4xl mb-4 mx-auto" />,
                title: "Innovatsion yondashuv",
                text: "Foydalanuvchilar uchun qulay va zamonaviy texnologiyalarga asoslangan echimlar."
              },
              {
                icon: <FaCheckCircle className="text-mainRed dark:text-mainRedLight text-4xl mb-4 mx-auto" />,
                title: "Savodxonlik usullari",
                text: "Stol o'yinlari, maslahatlar va kundalik mashqlar orqali moliyaviy madaniyatni oshiring."
              },
              {
                icon: <FaWallet className="text-mainBlue dark:text-mainBlueLight text-4xl mb-4 mx-auto" />,
                title: "Byudjet nazorati",
                text: "Xarajat va daromadlar ustidan to'liq nazorat uchun sizga mos interfeys."
              }
            ].map((feature, index) => (
<motion.div
  key={index}
  className="bg-white dark:bg-gray-700 shadow-md rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
  initial={{ opacity: 0, y: -30, scale: 0.8 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true }}
  transition={{
    type: "spring", // tabiiy sakrash effekti
    stiffness: 120,
    damping: 10,
    mass: 0.8,
  }}
  whileHover={{
    scale: 1.05,
    rotate: [0, 2, -2, 0], // yumshoq aylanma
    transition: { duration: 0.6, ease: "easeInOut" }
  }}
>
  <motion.div
    className="mb-4"
    initial={{ rotate: 0 }}
    whileHover={{ rotate: 10 }}
    transition={{ duration: 0.5 }}
  >
    {feature.icon}
  </motion.div>

  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-mainBlue dark:group-hover:text-mainBlueLight transition-colors duration-300">
    {feature.title}
  </h4>

  <p className="text-gray-500 dark:text-gray-300 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
    {feature.text}
  </p>
</motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="py-24 bg-white dark:bg-gray-900 font-main transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              So'nggi <TypingText text="yangiliklar" /> va <span className="text-mainRed dark:text-mainRedLight">postlar</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto text-lg">
              Moliyaviy savodxonlik, innovatsiyalar va kundalik maslahatlar bilan tanishing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {allNews.slice(0,3).map((news, index) => (
              <motion.div
                key={news.id}
                className="group bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {news.cover && (
                  <motion.img
                    src={news.cover}
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
to={`/news/${news.id}`}                      className="inline-flex items-center gap-1 text-mainBlue dark:text-mainBlueLight font-medium hover:underline transition group-hover:text-mainRed dark:group-hover:text-mainRedLight duration-300"
                    >
                      Batafsil o'qish <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="flex items-center justify-center pt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link to="/news">
              <motion.button
                className="py-3 px-6 rounded-full bg-white dark:bg-gray-700 text-mainBlue dark:text-mainBlueLight border border-mainBlue dark:border-mainBlueLight hover:bg-mainBlue hover:text-white dark:hover:bg-mainBlueLight dark:hover:text-gray-900 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ko'proq ko'rish
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SWIPER SECTION */}
      <section className="bg-gray-50 dark:bg-gray-800 py-24 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Moliyani <TypingText text="o'yin bilan o'rganing" />
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-4 max-w-2xl mx-auto">
              MoliaUz'ning maxsus stol o'yini orqali moliyani o'rganish endi qiziqarli va interaktiv.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1.2}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop={true}
              className="rounded-2xl shadow-lg dark:shadow-gray-700/50"
            >
              {[oyin1, oyin2, oyin3].map((img, idx) => (
                <SwiperSlide key={idx}>
                  <motion.div
                    className="overflow-hidden rounded-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={img}
                      alt={`O'yin rasmi ${idx + 1}`}
                      className="w-full h-[500px] object-cover shadow-md"
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Typing animatsiyasi uchun komponent
const TypingText = ({ text }) => {
  return (
    <motion.span
      className="text-mainBlue dark:text-mainBlueLight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: index * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default Home;