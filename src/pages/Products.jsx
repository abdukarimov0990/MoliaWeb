import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaPhoneAlt, FaInstagram, FaTelegramPlane, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router';
import { products } from '../data/data';

const ProductCard = ({ product, setShowContact }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -10 }}
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-full shadow transition-colors duration-300"
        >
          {isFavorite ? (
            <FaHeart className="text-mainRed dark:text-mainRedLight text-xl" />
          ) : (
            <FaRegHeart className="text-gray-400 dark:text-gray-300 text-xl" />
          )}
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
          <span className="text-mainRed dark:text-mainRedLight font-bold text-lg">${product.price}</span>
        </div>

        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            i < Math.floor(product.rating) ? (
              <FaStar key={i} className="text-yellow-400" />
            ) : (
              <FaRegStar key={i} className="text-yellow-400" />
            )
          ))}
          <span className="text-gray-600 dark:text-gray-300 text-sm ml-2">({product.reviews})</span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {showFullDescription
            ? product.description
            : `${product.description.substring(0, 80)}...`}
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-mainBlue dark:text-mainBlueLight ml-1 font-medium"
          >
            {showFullDescription ? 'Kamroq' : "Ko'proq"}
          </button>
        </p>

        <div className="flex space-x-3">
          <motion.button
            onClick={() => setShowContact(true)}
            className="flex-1 bg-mainBlue dark:bg-mainBlueLight text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Sotib Olish
          </motion.button>
          <Link to={`/products/${product.id}`}>
            <motion.button
              className="flex-1 border border-mainBlue dark:border-mainBlueLight text-mainBlue dark:text-mainBlueLight py-2 px-4 rounded-lg transition-colors duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Batafsil
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const ProductPage = () => {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-main transition-colors duration-300">
      <section className="py-20 bg-gradient-to-r from-mainBlue to-mainRed dark:from-mainBlueLight dark:to-mainRedLight text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Bizning Mahsulotlar</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Moliyaviy hayotingizni yaxshilash uchun maxsus ishlab chiqilgan yechimlar
          </p>
        </motion.div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              setShowContact={setShowContact}
            />
          ))}
        </motion.div>
      </section>

      {/* Contact Modal */}
      {showContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl w-96 p-8 shadow-2xl flex flex-col items-center gap-6 transition-colors duration-300"
          >
            {/* Close button */}
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-2 transition-colors duration-300"
              aria-label="Yopish"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300 text-lg" />
            </button>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sotib olish uchun</h3>
            <p className="text-base text-gray-500 dark:text-gray-400 text-center">
              Quyidagi kanallar orqali biz bilan bog'laning
            </p>

            {/* Buttons */}
            <div className="w-full flex flex-col gap-4">
              <a
                href="https://t.me/your_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-[#2AABEE] text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaTelegramPlane size={22} />
                <span>Telegram</span>
              </a>

              <a
                href="https://instagram.com/your_username"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-red-400 to-yellow-400 text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaInstagram size={22} />
                <span>Instagram</span>
              </a>

              <a
                href="tel:+998901234567"
                className="flex items-center gap-4 justify-center w-full py-3 rounded-xl bg-green-600 text-white font-medium text-lg shadow hover:scale-105 transition"
              >
                <FaPhoneAlt size={22} />
                <span>+998 90 123 45 67</span>
              </a>
            </div>

            {/* Footer text */}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Yoki yozing: @your_username</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProductPage;