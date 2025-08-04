import React from 'react';
import {
  FaUsers, FaClock, FaCubes, FaChartBar, FaRocket, FaGift,
  FaCalendarAlt, FaTicketAlt, FaBoxOpen, FaDice
} from 'react-icons/fa';
import { GiMoneyStack, GiCardExchange } from 'react-icons/gi';

const Game = () => {
  return (
    <div className="bg-white text-gray-800 font-main">

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50 text-center px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight flex justify-center items-center gap-3">
            <span>MOLIA GAME — Moliya ilmini o'ynab o'rganing!</span>
          </h1>
          <p className="text-lg text-gray-600">
            Bu nafaqat o‘yin, bu hayotingizni moliyaviy jihatdan o‘zgartiruvchi <strong>real tajriba</strong>. Siz unda ishlaysiz, investitsiya qilasiz, qarorlar qabul qilasiz... ammo bu safar xatolaringiz sizga nimanidir <span className="text-mainBlue font-semibold">o‘rgatadi</span>!
          </p>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">O‘yinning asosiy tarkibi</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              O‘yin orqali siz moliyaviy hayotning barcha bosqichlarini his qilasiz. Har bir kartochka sizga yangi saboq bo‘ladi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
            {[{
              icon: <GiMoneyStack className="text-4xl text-mainRed" />, title: 'Kasb kartochkalari', desc: 'Mutaxassis sifatida o‘ynaysiz va daromadlar shakllantirasiz.'
            }, {
              icon: <GiCardExchange className="text-4xl text-mainRed" />, title: 'Investitsiya imkoniyatlari', desc: 'Imkoniyat kartalari orqali biznes va passiv daromadlarni rivojlantirasiz.'
            }, {
              icon: <FaChartBar className="text-4xl text-mainRed" />, title: 'Xavf va xarajatlar', desc: 'Real hayotdagi muammolarni aks ettiruvchi kartalar mavjud.'
            }, {
              icon: <FaUsers className="text-4xl text-mainRed" />, title: '3-6 ishtirokchi', desc: 'Do‘stlaringiz bilan o‘ynab, bir-biringizni boylik sari yetaklaysiz.'
            }, {
              icon: <FaClock className="text-4xl text-mainRed" />, title: '3-4 soat davom etadi', desc: 'Tezlik bilan 20 yillik hayotni sinab ko‘rasiz.'
            }, {
              icon: <FaCubes className="text-4xl text-mainRed" />, title: 'Moliyaviy blankalar', desc: 'O‘z hisob-kitoblaringizni yuritish uchun.'
            }].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform hover:translate-y-[-5px] text-center">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-mainRed mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Structure Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">O‘yin strukturasining 3 bosqichi</h2>
            <p className="text-gray-600 text-lg mt-4 max-w-2xl mx-auto">
              O‘yin sizni oddiy mutaxassislikdan to boylik sari olib boradi. Har bir bosqichda moliyaviy qarorlar muhim ahamiyatga ega.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[{
              title: 'Mutaxassislar aylanasidan boshlang',
              icon: <FaRocket className="text-4xl text-mainRed mx-auto" />,
              desc: 'Oddiy kasb va maoshdan boshlaysiz. Daromad va xarajatni boshqarishni o‘rganasiz.'
            }, {
              title: 'Tadbirkorlar doirasiga o‘ting',
              icon: <FaChartBar className="text-4xl text-mainRed mx-auto" />,
              desc: 'Yig‘gan kapitalingiz bilan biznes boshlaysiz va passiv daromad manbalarini yaratishga urinib ko‘rasiz.'
            }, {
              title: 'Millionerlar doirasiga yeting',
              icon: <FaGift className="text-4xl text-mainRed mx-auto" />,
              desc: 'Maqsad — moliyaviy erkinlik. Bu bosqichga faqat to‘g‘ri strategiya orqali yetib borasiz.'
            }].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-lg transition-transform hover:scale-[1.03]">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-mainBlue mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-100 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 flex justify-center items-center gap-2">
            <FaCalendarAlt className="text-mainRed" /> Sotuv 2025-yil sentabrda boshlanadi!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            <span className="flex justify-center items-center gap-2"><FaTicketAlt className="text-mainBlue" /> O‘yin klublarida o‘ynash narxi — <strong>25 900 so‘m</strong></span>
            <br />
            <span className="flex justify-center items-center gap-2"><FaBoxOpen className="text-mainBlue" /> To‘liq stol o‘yini versiyasi — <strong>1 275 000 so‘m</strong></span>
          </p>
          <p className="text-mainRed font-semibold text-md max-w-xl mx-auto">
            *O‘yin real hayotga moslashtirilgan, O‘zbekiston sharoitidan kelib chiqqan. Monopoliya emas — undan bir necha barobar foydaliroq!
          </p>
        </div>
      </section>

    </div>
  );
};

export default Game;
