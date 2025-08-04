import React from 'react'
import { Link } from 'react-router'
import { FaArrowRight, FaWallet, FaSearchDollar, FaClock, FaRegStickyNote, FaTimesCircle, FaLightbulb, FaCheckCircle, FaPiggyBank, FaChartLine, FaCoins, } from 'react-icons/fa'
import hero from '../assets/img/hero.png'
import oyin1 from '../assets/img/oyin1.jpg';
import oyin2 from '../assets/img/oyin2.jpg';
import oyin3 from '../assets/img/oyin3.jpg';
import pattern from '../assets/img/pattern.svg'
// Top of component
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { RiBankLine } from 'react-icons/ri';
import { MdAttachMoney } from 'react-icons/md';




const tips = [
    {
        title: "Pullarim qayerga ketdi?",
        text: "Kuyinmang, bu hammada bo‘ladi, lekin...",
        icon: <FaWallet className="text-mainRed text-3xl" />
    },
    {
        title: "Aslida",
        text: "Pul o‘z-o‘zidan yo‘qolmaydi, siz yozmagansiz.",
        icon: <FaSearchDollar className="text-mainBlue text-3xl" />
    },
    {
        title: "Ha!",
        text: "Yozsangiz kuzatasiz, kuzatsangiz nazorat qilasiz.",
        icon: <FaRegStickyNote className="text-mainRed text-3xl" />
    },
    {
        title: "Xa, bo‘ldi!",
        text: "+/- larni yozish 5-10 daqiqa vaqt oladi xolos.",
        icon: <FaClock className="text-mainBlue text-3xl" />
    },
    {
        title: "Ko'p vaqt oladi!",
        text: "Bajarib ko‘rmaganingiz uchun bu fikrdasiz.",
        icon: <FaTimesCircle className="text-mainRed text-3xl" />
    },
    {
        title: "Tavsiya",
        text: "MoliaUz siz uchun tayyor dastur.",
        icon: <FaLightbulb className="text-mainBlue text-3xl" />
    },
]
const newsList = [
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
]

const Home = () => {
    return (
        <div className="bg-white font-main">

            {/* HERO SECTION */}
            <section className="py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-16">
          {/* Text */}
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug">
              Moliyaviy barqarorlik <br className='hidden lg:block' /> uchun <span className="text-mainBlue">aqlli</span>{' '}
              <span className="text-mainRed">yechimlar</span>
            </h1>
            <p className="text-gray-500 text-base">
              <span className="text-mainRed font-medium">MoliaUz</span> sizga byudjet nazorati, stol o‘yinlari orqali
              <span className="text-mainBlue"> moliya savodxonligi</span> va innovatsion vositalarni taklif etadi.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-mainBlue text-white px-6 py-3 rounded-full text-sm md:text-base shadow-md hover:shadow-lg hover:bg-blue-800 transition"
              >
                Bog‘lanish <FaArrowRight size={16} />
              </Link>
              <Link
                to="/game"
                className="inline-flex items-center gap-2 border border-mainRed text-mainRed px-6 py-3 rounded-full text-sm md:text-base hover:bg-mainRed hover:text-white transition"
              >
                Stol o‘yini
              </Link>
            </div>
          </div>

          {/* Image */}
          <div>
            <img src={hero} alt="MoliaUz Hero" className="w-full hidden lg:block max-w-md mx-auto" />
          </div>
        </div>
      </section>

      {/* TIPS SECTION */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Pattern */}
          <img src={pattern} alt="" className="w-32 absolute right-20 rotate-45 top-0" />

          {/* Decorative Icons */}
          <FaPiggyBank className="text-mainBlue text-6xl absolute top-10 left-10 rotate-12" />
          <FaChartLine className="text-mainBlue text-7xl absolute bottom-16 right-10 -rotate-45" />
          <RiBankLine className="text-mainRed text-5xl absolute top-1/2 left-4 -translate-y-1/2 -rotate-6" />
          <MdAttachMoney className="text-mainBlue text-8xl absolute bottom-10 left-1/3 rotate-45" />
          <FaCoins className="text-mainRed text-6xl absolute top-10 right-1/4 -rotate-12" />

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md flex flex-col items-center p-6 rounded-2xl shadow-lg hover:translate-y-[-10px] transition group"
              >
                <div className="mb-4 scale-150 group-hover:scale-[1.7] transition-transform">
                  {tip.icon}
                </div>
                <h3 className="text-2xl text-center font-semibold text-mainBlue mb-2">
                  {tip.title}
                </h3>
                <p className="text-base text-center text-gray-600">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
            <section className="bg-gradient-to-br from-white to-gray-50 py-24 font-main">
                <div className="container mx-auto px-4 max-w-5xl text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                        Moliyani <span className="text-mainRed">tushunish</span> — bu <span className="text-mainBlue">hotirjam yashash</span> san’ati
                    </h2>

                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-12">
                        <strong className="text-mainBlue">Molia</strong> — bu zamonaviy FinTech startap.
                        Biz foydalanuvchilarga moliyaviy savodxonlikni oshirish, daromad/xarajatni kuzatish va ongli boshqarish vositalarini taqdim etamiz.
                    </p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition group">
                            <FaLightbulb className="text-mainBlue text-4xl mb-4 mx-auto group-hover:scale-110 transition" />
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Innovatsion yondashuv</h4>
                            <p className="text-gray-500 text-sm">Foydalanuvchilar uchun qulay va zamonaviy texnologiyalarga asoslangan echimlar.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition group">
                            <FaCheckCircle className="text-mainRed text-4xl mb-4 mx-auto group-hover:scale-110 transition" />
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Savodxonlik usullari</h4>
                            <p className="text-gray-500 text-sm">Stol o‘yinlari, maslahatlar va kundalik mashqlar orqali moliyaviy madaniyatni oshiring.</p>
                        </div>
                        <div className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition group">
                            <FaWallet className="text-mainBlue text-4xl mb-4 mx-auto group-hover:scale-110 transition" />
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Byudjet nazorati</h4>
                            <p className="text-gray-500 text-sm">Xarajat va daromadlar ustidan to‘liq nazorat uchun sizga mos interfeys.</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <img
                            src="/images/about-illustration.png"
                            alt="Molia FinTech Illustration"
                            className="w-full max-w-xl mx-auto drop-shadow-xl rounded-xl"
                        />
                    </div>
                </div>
            </section>
            <section className="py-24 bg-white font-main">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            So‘nggi <span className="text-mainBlue">yangiliklar</span> va <span className="text-mainRed">postlar</span>
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
                            Moliyaviy savodxonlik, innovatsiyalar va kundalik maslahatlar bilan tanishing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {newsList.map((news) => (
                            <div
                                key={news.id}
                                className="group  bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                            >
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className="flex items-center justify-center pt-10">
                        <Link to="/news" ><button className='py-3 px-6 rounded-4xl bg-white text-mainBlue border border-mainBlue hover:bg-mainBlue hover:text-white ease-in-out transition-all'>Ko'proq ko'rish</button></Link>
                    </div>
                </div>
            </section>
            <section className="bg-gray-50 py-24">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Matn */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Moliyani o‘yin <span className="text-mainRed">bilan o‘rganing</span>
                        </h2>
                        <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
                            MoliaUz’ning maxsus stol o‘yini orqali moliyani o‘rganish endi qiziqarli va interaktiv.
                        </p>
                    </div>

                    {/* Rasm Kompozitsiyasi */}
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1.2}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop={true}
                        className="rounded-2xl shadow-lg"
                    >
                        {[oyin1, oyin2, oyin3].map((img, idx) => (
                            <SwiperSlide key={idx}>
                                <img
                                    src={img}
                                    alt={`O‘yin rasmi ${idx + 1}`}
                                    className="rounded-xl w-full h-[500px] object-cover hover:scale-[1.03] transition duration-300 shadow-md"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
                        
        </div>
    )
}

export default Home
