import React from 'react';
import { FaBolt, FaProjectDiagram, FaUserGraduate, FaMoneyBillWave, FaChartLine, FaRocket } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="bg-white text-gray-800 font-main">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          <span className="text-mainRed">Molia</span> — bu oddiy pul emas, <br /> bu <span className="text-mainBlue">hotirjam yashash san’ati</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
          2025-yil 25-may kuni O'zbekistonda yangi FinTech startap — <strong>molia.uz</strong> taqdim etildi. Bu loyiha moliyaviy savodxonlik, daromad va xarajatni boshqarish, shaxsiy moliyani rejalash bo‘yicha zamonaviy yechimlarni taklif etadi.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">Bizning maqsadimiz</h2>
          <div className="grid md:grid-cols-2 gap-10 text-base sm:text-lg text-gray-700">
            <div>
              <p className="mb-6">
                <span className="text-mainRed font-bold">Molia</span> — bu nafaqat platforma, balki <strong>fikrlash tarzi</strong>. Biz moliyaviy savodxonlikni boy bo‘lish vositasi emas, balki <strong>hotirjam yashash san’ati</strong> deb bilamiz.
              </p>
              <p>
                Startapimiz foydalanuvchilarga:
                <ul className="list-disc list-inside mt-2">
                  <li>daromad va xarajatni boshqarish,</li>
                  <li>ko‘proq emas, to‘g‘ri yashash,</li>
                  <li>qarzga tushmaslik,</li>
                  <li>o‘zini moliyaviy erkin his qilish</li>
                </ul>
                imkonini beradi.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-2xl sm:text-3xl text-center font-semibold text-gray-800 mb-6 sm:mb-8">"ZanjirSikli" — <span className='text-mainRed'>nima bu?</span></h3>
              <p className="text-gray-600 text-center text-base sm:text-xl">
                Bu — xarajat va daromadlar orasidagi uzilmas aloqa. Har bir inson xarajatlarini to‘g‘ri nazorat qilishi, bu zanjirni boshqarishi mumkin. Biz aynan shu ongni rivojlantiramiz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Models */}
      <section className="py-24 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">5 ta moliyaviy modelimiz</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
            {[
              { name: 'molia MINI', desc: 'Minimal daromadlar uchun optimallashtirilgan.' },
              { name: 'molia CLASSIC', desc: 'O‘rtacha daromadga ega foydalanuvchilar uchun.' },
              { name: 'molia BALANCE', desc: 'Xarajat va daromadni muvozanatga keltiradi.' },
              { name: 'molia SPECIAL', desc: 'Maxsus ehtiyojlarga moslashtirilgan strategiya.' },
              { name: 'molia START', desc: 'Boshlovchilar uchun tayyor moliyaviy yo‘riqnomalar.' },
            ].map((model, index) => (
              <div key={index} className="bg-gray-50 hover:bg-gray-100 transition duration-300 p-6 rounded-2xl shadow-md">
                <h3 className="text-lg sm:text-xl font-bold text-mainRed mb-2">{model.name}</h3>
                <p className="text-gray-700 text-sm sm:text-base">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline & Roadmap */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">Loyihamizning 6 bosqichi</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="bg-white p-5 rounded-xl shadow flex items-start gap-4">
                <FaProjectDiagram className="text-mainRed text-2xl mt-1 shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Bosqich {i + 1}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{i === 0 ? 'Hozirda faoliyatda - asosiy kontent, model va savodxonlik targ‘iboti.' : 'Rejalashtirilgan bosqich — moliyaviy vositalar, mobil ilova va keng qamrovli xizmatlar.'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing Note */}
      <section className="py-20 text-center bg-gradient-to-tr from-white to-gray-50">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Brendimiz o‘ziga xos va original</h2>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          <span className="text-mainRed font-semibold">Molia</span> — boshqa loyihalarning nusxasi emas. Logotipimiz, brend strategiyamiz va xizmatlarimiz siz uchun maxsus ishlab chiqilgan. Agar sizga brend yoqqan bo‘lsa, eng ko‘p talab qilinadigan mahsulotni bizga yozing!
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
