import React, { useState } from 'react';
import { BsInstagram, BsTelegram } from 'react-icons/bs';
import { FaFacebook, FaGithub, FaTwitter } from 'react-icons/fa';

const Contact = () => {
    const [formData, setformData] = useState({ name: "", contact: "", message: "" });
    const chatId = "6276000412"; // Telegram chat ID
    const telegramBotId = "7838971341:AAE6kW-r2amzCGS4Mukh43InQoSa77y3z0I"; // Telegram bot token
    const url = `https://api.telegram.org/bot${telegramBotId}/sendMessage`;
  
    const handleChange = (e) => {
      setformData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const message = `👤 Name: ${formData.name}\n📞 Contact: ${formData.contact}\n💬 Message: ${formData.message}`;
  
      try {
        await axios.post(url, { chat_id: chatId, text: message });
        SetOpenPanel(true);
        setformData({ name: "", contact: "", message: "" });
      } catch (error) {
        SetOpenWarning(true);
      }
    };
  
  return (
    <section id="contact" className="py-16 text-gray-800 font-main">
      <div className="w-full max-w-[1420px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white border border-gray-300 rounded-2xl p-10 shadow-lg">

        {/* Chap blok: Tarmoqlar va matn */}
        <div>
          <h1 className="text-5xl font-bold mb-6 text-mainRed">Bog‘lanish</h1>
          <p className="mb-8 text-gray-600">
            Savollaringiz, takliflaringiz yoki hamkorlik istagingiz bo‘lsa — marhamat, quyidagi tarmoqlarda biz bilan bog‘laning yoki forma orqali yozib yuboring.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-mainBlue">Ijtimoiy tarmoqlar:</h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Instagram */}
            <a href="https://instagram.com/yourhandle" target="_blank" className="group p-5 bg-white border border-gray-300 rounded-xl hover:shadow-md hover:scale-105 transition">
              <div className="flex justify-center mb-3">
                <BsInstagram size={48} className="text-mainBlue group-hover:text-mainRed" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed">Instagram</h3>
            </a>

            {/* Telegram */}
            <a href="https://t.me/yourhandle" target="_blank" className="group p-5 border-gray-300 bg-white border rounded-xl hover:shadow-md hover:scale-105 transition">
              <div className="flex justify-center mb-3">
                <BsTelegram size={48} className="text-mainBlue group-hover:text-mainRed" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed">Telegram</h3>
            </a>

            {/* Twitter */}
            <a href="https://facebook.com" target="_blank" className="group border-gray-300 col-span-2 p-5 bg-white border rounded-xl hover:shadow-md hover:scale-105 transition">
              <div className="flex justify-center mb-3">
                <FaFacebook size={48} className="text-mainBlue group-hover:text-mainRed" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed">Facebook</h3>
            </a>

            {/* GitHub */}
          </div>
        </div>

        {/* O'ng blok: Forma */}
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-300 shadow">
          <h2 className="text-3xl font-bold mb-6 text-mainBlue">Xabar yuboring</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ism */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">Ismingiz:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ismingizni kiriting"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                required
              />
            </div>
            {/* Email yoki telefon */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">Email yoki telefon:</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email yoki telefon raqamingiz"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                required
              />
            </div>
            {/* Xabar */}
            <div>
              <label className="block font-medium mb-1 text-gray-700">Xabaringiz:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Xabaringizni yozing..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue"
                required
              ></textarea>
            </div>
            {/* Yuborish */}
            <button type="submit" className="w-full py-3 bg-mainRed text-white font-semibold rounded-lg hover:bg-red-600 transition">
              Yuborish
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default Contact;
