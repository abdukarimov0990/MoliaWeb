import React, { useState } from 'react';
import { Link } from 'react-router';
import { FaPhoneAlt, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "../assets/img/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Asosiy" },
    { to: "/about", label: "Haqimizda" },
    { to: "/news", label: "Yangiliklar" },
    { to: "/game", label: "Stol o'yini" },
    { to: "/contact", label: "Bog‘lanish" },
  ];

  return (
    <header className="py-6 font-main border-b border-gray-100 bg-white relative z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <img src={logo} alt="Molia Logo" className="w-16 transition-transform hover:rotate-6" />
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            moli<span className="text-mainRed">a</span>
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-gray-700 text-base font-medium">
          {navLinks.slice(0, 4).map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-mainBlue hover:font-semibold transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link to="/contact" className="hidden md:flex">
          <button className="items-center gap-3 px-5 py-2.5 rounded-full bg-mainBlue text-white text-base shadow-sm hover:bg-mainRed transition-colors flex">
            <FaPhoneAlt size={20} />
            Bog‘lanish
          </button>
        </Link>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden z-50 text-mainBlue">
          {menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
        </button>
      </div>

      {/* Mobile menu (slide from top) */}
      <AnimatePresence>
  {menuOpen && (
    <motion.div
      initial={{ y: -300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -300, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-8 px-6 py-10 text-lg font-medium text-gray-800"
    >
      {/* Yopish tugmasi yuqoriga qo'shamiz */}
      <button
        onClick={() => setMenuOpen(false)}
        className="absolute top-6 right-6 text-mainBlue hover:text-mainRed transition"
      >
        <FaTimes size={28} />
      </button>

      {/* Logo */}
    {/* Nav links */}
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setMenuOpen(false)}
          className="hover:text-mainBlue transition-colors text-2xl"
        >
          {link.label}
        </Link>
      ))}

      {/* CTA button */}
      <Link to="/contact" onClick={() => setMenuOpen(false)}>
        <button className="mt-6 flex items-center gap-3 px-6 py-3 rounded-full bg-mainBlue text-white shadow hover:bg-mainRed transition-colors text-lg">
          <FaPhoneAlt size={20} />
          Bog‘lanish
        </button>
      </Link>
    </motion.div>
  )}
</AnimatePresence>
    </header>
  );
};

export default Header;
