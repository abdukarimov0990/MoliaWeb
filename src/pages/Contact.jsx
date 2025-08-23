import React, { useState } from 'react';
import { BsInstagram, BsTelegram } from 'react-icons/bs';
import { FaFacebook, FaGithub, FaTwitter, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
    const [formData, setformData] = useState({ name: "", contact: "", message: "" });
    const [openPanel, setOpenPanel] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
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
        setOpenPanel(true);
        setformData({ name: "", contact: "", message: "" });
        setTimeout(() => setOpenPanel(false), 3000);
      } catch (error) {
        setOpenWarning(true);
        setTimeout(() => setOpenWarning(false), 3000);
      }
    };
  
  return (
    <section id="contact" className="py-16 text-gray-800 dark:text-gray-200 font-main transition-colors duration-300">
      <div className="w-full max-w-[1420px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl p-10 shadow-lg dark:shadow-gray-900/50">

        {/* Chap blok: Tarmoqlar va matn */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl font-bold mb-6 text-mainRed dark:text-mainRedLight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Bog'lanish
          </motion.h1>
          <motion.p 
            className="mb-8 text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Savollaringiz, takliflaringiz yoki hamkorlik istagingiz bo'lsa — marhamat, quyidagi tarmoqlarda biz bilan bog'laning yoki forma orqali yozib yuboring.
          </motion.p>

          <motion.h2 
            className="text-2xl font-semibold mb-4 text-mainBlue dark:text-mainBlueLight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Ijtimoiy tarmoqlar:
          </motion.h2>
          <div className="grid grid-cols-2 gap-5">
            {/* Instagram */}
            <motion.a 
              href="https://www.instagram.com/molia.uz" 
              target="_blank" 
              className="group p-5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:shadow-md transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center mb-3">
                <BsInstagram size={48} className="text-mainBlue dark:text-mainBlueLight group-hover:text-mainRed dark:group-hover:text-mainRedLight transition-colors duration-300" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed dark:text-mainRedLight">Instagram</h3>
            </motion.a>

            {/* Telegram */}
            <motion.a 
              href="https://t.me/moliachi" 
              target="_blank" 
              className="group p-5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:shadow-md transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center mb-3">
                <BsTelegram size={48} className="text-mainBlue dark:text-mainBlueLight group-hover:text-mainRed dark:group-hover:text-mainRedLight transition-colors duration-300" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed dark:text-mainRedLight">Telegram</h3>
            </motion.a>

            {/* Facebook */}
            <motion.a 
              href="http://www.youtube.com/@moliauz" 
              target="_blank" 
              className="group col-span-2 p-5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:shadow-md transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex justify-center mb-3">
                <FaYoutube size={48} className="text-mainBlue dark:text-mainBlueLight group-hover:text-mainRed dark:group-hover:text-mainRedLight transition-colors duration-300" />
              </div>
              <h3 className="text-center text-lg font-semibold text-mainRed dark:text-mainRedLight">Youtube</h3>
            </motion.a>
          </div>
        </motion.div>

        {/* O'ng blok: Forma */}
        <motion.div 
          className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 border border-gray-300 dark:border-gray-600 shadow transition-colors duration-300"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6 text-mainBlue dark:text-mainBlueLight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Xabar yuboring
          </motion.h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ism */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Ismingiz:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ismingizni kiriting"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue dark:focus:ring-mainBlueLight transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                required
              />
            </motion.div>
            
            {/* Email yoki telefon */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Email yoki telefon:</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Email yoki telefon raqamingiz"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue dark:focus:ring-mainBlueLight transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                required
              />
            </motion.div>
            
            {/* Xabar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Xabaringiz:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Xabaringizni yozing..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-mainBlue dark:focus:ring-mainBlueLight transition-all duration-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                required
              ></textarea>
            </motion.div>
            
            {/* Yuborish */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button 
                type="submit" 
                className="w-full py-3 bg-mainRed dark:bg-mainRedLight text-white font-semibold rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Yuborish
              </motion.button>
            </motion.div>
          </form>

          {/* Xabar yuborildi bildirishnomasi */}
          <AnimatePresence>
            {openPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg"
              >
                Xabaringiz muvaffaqiyatli yuborildi!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Xatolik bildirishnomasi */}
          <AnimatePresence>
            {openWarning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg"
              >
                Xatolik yuz berdi, qaytadan urinib ko'ring!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;