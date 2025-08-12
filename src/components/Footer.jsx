import React from 'react'
import { Link } from 'react-router'
import logo from "../assets/img/logo.png"
import { FaFacebookF, FaInstagram, FaTelegramPlane } from 'react-icons/fa'
import {motion} from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-100 font-main">
      <div className="container px-6 md:px-12 py-16 flex flex-col lg:flex-row justify-between items-start gap-12">
        
        {/* Logo & Tagline */}
        <div className="flex flex-col gap-4">
        <Link to="/" className="flex items-center gap-2 z-50 group">
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

          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Moliyaviy savodxonlik – bu zamonaviy hayotda mustahkam poydevor. Biz siz bilan birgamiz.
          </p>
        </div>

        {/* Navigatsiya */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600">Tezkor linklar</h3>
          <ul className="flex flex-col gap-2 text-base font-light">
            <li><Link to="/" className="hover:text-black transition">Asosiy</Link></li>
            <li><Link to="/about" className="hover:text-black transition">Loyiha haqida</Link></li>
            <li><Link to="/news" className="hover:text-black transition">Yangiliklar</Link></li>
            <li><Link to="/game" className="hover:text-black transition">Mahsulotlar</Link></li>
          </ul>
        </div>

        {/* Social / Subscribe */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-600">Biz bilan</h3>
          <div className="flex gap-4 text-xl text-gray-500">
            <a href="#" className="hover:text-black transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-black transition"><FaInstagram /></a>
            <a href="#" className="hover:text-black transition"><FaTelegramPlane /></a>
          </div>

          {/* Optional CTA */}
          <form className="mt-6">
            <label className="text-sm mb-2 block text-gray-600">Yangiliklarga obuna bo‘ling</label>
            <div className="flex">
              <input
                type="email"
                placeholder="Emailingiz"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none text-sm"
              />
              <button className="px-5 py-2 bg-black text-white rounded-r-full text-sm hover:bg-gray-800 transition">
                Yuborish
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pastki qism */}
      <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
        © {new Date().getFullYear()} Molia. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  )
}

export default Footer
