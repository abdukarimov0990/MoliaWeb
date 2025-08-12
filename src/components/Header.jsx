import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FaPhoneAlt, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from "../assets/img/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rates, setRates] = useState({
    usd: null,
    eur: null,
    gold: null,
  });

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const usdRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const usdData = await usdRes.json();
        const usdToUzs = usdData.rates.UZS;
        const eurToUsd = usdData.rates.EUR;

        const goldRes = await fetch("https://www.goldapi.io/api/XAU/USD", {
          headers: {
            "x-access-token": "goldapi-1yqq19me38w2r7-io", // <-- API kalitingizni kiriting
            "Content-Type": "application/json"
          }
        });

        const goldData = await goldRes.json();
        const goldPricePerOzUSD = goldData.price;
        const goldPricePerGramUSD = goldPricePerOzUSD / 31.1035;
        const goldInUZS = goldPricePerGramUSD * usdToUzs;

        setRates({
          usd: usdToUzs,
          eur: eurToUsd * usdToUzs,
          gold: goldInUZS,
        });

      } catch (err) {
        console.error("Kurslarni olishda xatolik:", err);
      }
    };

    fetchRates();
  }, []);

  // Scroll event
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // pastga scroll
        setShowHeader(false);
      } else {
        // tepaga scroll
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { to: "/", label: "Asosiy" },
    { to: "/about", label: "Haqimizda" },
    { to: "/news", label: "Yangiliklar" },
    { to: "/products", label: "Mahsulotlar" },
    { to: "/contact", label: "Bog‘lanish" },
  ];

  return (
    <>
      {/* Valyuta kurslari paneli (faqat scroll bo‘lmaganda ko‘rinadi) */}
      <AnimatePresence>
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 text-sm text-gray-700 py-2 px-4 font-medium flex justify-center gap-6 fixed top-0 w-full z-50"
          >
            <span>1 USD = {rates.usd ? rates.usd.toFixed(2) : "..."} so'm</span>
            <span>1 EUR = {rates.eur ? rates.eur.toFixed(2) : "..."} so'm</span>
            <span>1g TILLA = {rates.gold ? Math.round(rates.gold).toLocaleString() : "..."} so'm</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asosiy header */}
      <AnimatePresence>
        {showHeader && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="py-6 fixed w-full font-main border-b border-gray-100 bg-white z-40 top-[32px] md:top-[32px]"
          >
            <div className="container mx-auto px-4 flex items-center justify-between">
              {/* Logo */}
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
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-8 px-6 py-10 text-lg font-medium text-gray-800"
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-mainBlue hover:text-mainRed transition"
            >
              <FaTimes size={28} />
            </button>

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
    </>
  );
};

export default Header;
