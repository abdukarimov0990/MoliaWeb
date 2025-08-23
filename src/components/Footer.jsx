import React from 'react'
import { Link } from 'react-router'
import logo from '../assets/img/result.png'
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa'
import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-200 border-t border-gray-100 dark:border-gray-800 font-main transition-colors duration-300">
      <div className="container px-6 md:px-12 py-16 flex flex-col lg:flex-row justify-between items-start gap-12">
        
        {/* Logo & Tagline */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={logo}
              alt="Molia Logo"
              className="w-16"
              whileHover={{
                rotate: [0, 10, -10, 5, -5, 0],
                scale: 1.1,
                transition: { duration: 0.8, ease: "easeInOut" }
              }}
              whileTap={{
                scale: 0.95,
                rotate: 0
              }}
            />
          </Link>

          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            Moliyaviy savodxonlik – bu zamonaviy hayotda mustahkam poydevor. Biz siz bilan birgamiz.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">Tezkor linklar</h3>
          <ul className="flex flex-col gap-2 text-base font-light">
            <li>
              <Link to="/" className="hover:text-black dark:hover:text-white transition-colors duration-300">
                Asosiy
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-black dark:hover:text-white transition-colors duration-300">
                Loyiha haqida
              </Link>
            </li>
            <li>
              <Link to="/news" className="hover:text-black dark:hover:text-white transition-colors duration-300">
                Yangiliklar
              </Link>
            </li>
            <li>
              <Link to="/game" className="hover:text-black dark:hover:text-white transition-colors duration-300">
                Mahsulotlar
              </Link>
            </li>
          </ul>
        </div>

        {/* Social / Subscribe */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400">Bizni kuzatib boring</h3>
          <div className="flex gap-4 text-xl text-gray-500 dark:text-gray-400">
            <a href="http://www.youtube.com/@moliauz" className="hover:text-black dark:hover:text-white transition-colors duration-300">
              <FaYoutube />
            </a>
            <a href="https://www.instagram.com/molia.uz" className="hover:text-black dark:hover:text-white transition-colors duration-300">
              <FaInstagram />
            </a>
            <a href="https://t.me/moliauz" className="hover:text-black dark:hover:text-white transition-colors duration-300">
              <FaTelegramPlane />
            </a>
          </div>

          {/* Email Subscription */}
          <form className="mt-6">
            <label className="text-sm mb-2 block text-gray-600 dark:text-gray-400">
              Yangiliklarga obuna bo'ling
            </label>
            <div className="flex">
              <input
                type="email"
                placeholder="Emailingiz"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-full focus:outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
              />
              <button className="px-5 py-2 bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-r-full text-sm hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-300">
                Yuborish
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom section */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-6 border-t border-gray-100 dark:border-gray-800">
        © {new Date().getFullYear()} Molia. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  )
}

export default Footer