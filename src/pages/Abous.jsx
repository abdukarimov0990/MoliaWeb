import React, { useEffect } from 'react';
import { FaBolt, FaProjectDiagram, FaUserGraduate, FaMoneyBillWave, FaChartLine, FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Typed from 'typed.js';

const AboutUs = () => {
  useEffect(() => {
    // Typing animatsiyasi uchun
    const typed = new Typed('.typing-animation', {
      strings: ['hotirjam yashash', 'moliyaviy erkinlik', 'pul boshqaruvi', 'savodxonlik'],
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

  return (
    <div className="bg-white text-gray-800 font-main overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 text-center px-6">
        <motion.h1 
          className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="text-mainRed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Molia
          </motion.span> — bu oddiy pul emas, <br /> bu{' '}
          <span className="text-mainBlue typing-animation"></span>
        </motion.h1>
        <motion.p 
          className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          2025-yil 25-may kuni O'zbekistonda yangi FinTech startap — <strong>molia.uz</strong> taqdim etildi. Bu loyiha moliyaviy savodxonlik, daromad va xarajatni boshqarish, shaxsiy moliyani rejalash bo'yicha zamonaviy yechimlarni taklif etadi.
        </motion.p>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Bizning maqsadimiz
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-10 text-base sm:text-lg text-gray-700">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="mb-6">
                <span className="text-mainRed font-bold">Molia</span> — bu nafaqat platforma, balki <strong>fikrlash tarzi</strong>. Biz moliyaviy savodxonlikni boy bo'lish vositasi emas, balki <strong>hotirjam yashash san'ati</strong> deb bilamiz.
              </p>
              <p>
                Startapimiz foydalanuvchilarga:
                <ul className="list-disc list-inside mt-2">
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    daromad va xarajatni boshqarish,
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    ko'proq emas, to'g'ri yashash,
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    qarzga tushmaslik,
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    o'zini moliyaviy erkin his qilish
                  </motion.li>
                </ul>
                imkonini beradi.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-md"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-2xl sm:text-3xl text-center font-semibold text-gray-800 mb-6 sm:mb-8">
                "ZanjirSikli" — <span className='text-mainRed'>nima bu?</span>
              </h3>
              <motion.p 
                className="text-gray-600 text-center text-base sm:text-xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Bu — xarajat va daromadlar orasidagi uzilmas aloqa. Har bir inson xarajatlarini to'g'ri nazorat qilishi, bu zanjirni boshqarishi mumkin. Biz aynan shu ongni rivojlantiramiz.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Models */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            5 ta moliyaviy modelimiz
          </motion.h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
            {[
{ name: 'molia MINI', desc: 'Minimal daromadlar uchun optimallashtirilgan.', icon: <FaBolt className="text-mainRed text-2xl mx-auto mb-3" /> },
{ name: 'molia CLASSIC', desc: "O'rtacha daromadga ega foydalanuvchilar uchun.", icon: <FaUserGraduate className="text-mainRed text-2xl mx-auto mb-3" /> },
{ name: 'molia BALANCE', desc: 'Xarajat va daromadni muvozanatga keltiradi.', icon: <FaMoneyBillWave className="text-mainRed text-2xl mx-auto mb-3" /> },
{ name: 'molia SPECIAL', desc: 'Maxsus ehtiyojlarga moslashtirilgan strategiya.', icon: <FaChartLine className="text-mainRed text-2xl mx-auto mb-3" /> },
{ name: 'molia START', desc: "Boshlovchilar uchun tayyor moliyaviy yo'riqnomalar.", icon: <FaRocket className="text-mainRed text-2xl mx-auto mb-3" /> }            ].map((model, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 hover:bg-gray-100 transition duration-300 p-6 rounded-2xl shadow-md"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {model.icon}
                <h3 className="text-lg sm:text-xl font-bold text-mainRed mb-2">{model.name}</h3>
                <p className="text-gray-700 text-sm sm:text-base">{model.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline & Roadmap */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Loyihamizning 6 bosqichi
          </motion.h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.li 
                key={i} 
                className="bg-white p-5 rounded-xl shadow flex items-start gap-4"
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <FaProjectDiagram className="text-mainRed text-2xl mt-1 shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Bosqich {i + 1}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {i === 0 ? 'Hozirda faoliyatda - asosiy kontent, model va savodxonlik targiboti.' : 'Rejalashtirilgan bosqich — moliyaviy vositalar, mobil ilova va keng qamrovli xizmatlar.'}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing Note */}
      <section className="py-20 text-center bg-gradient-to-tr from-white to-gray-50">
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Brendimiz o'ziga xos va original
        </motion.h2>
        <motion.p 
          className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-mainRed font-semibold">Molia</span> — boshqa loyihalarning nusxasi emas. Logotipimiz, brend strategiyamiz va xizmatlarimiz siz uchun maxsus ishlab chiqilgan. Agar sizga brend yoqqan bo'lsa, eng ko'p talab qilinadigan mahsulotni bizga yozing!
        </motion.p>
      </section>
    </div>
  );
};

export default AboutUs;