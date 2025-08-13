import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router';
import { FaPhoneAlt, FaBars, FaTimes, FaMoon, FaSun, FaDollarSign, FaEuroSign, FaCoins } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/img/result.png';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rates, setRates] = useState({
    usd: null,
    eur: null,
    gold: null,
  });

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const usdRes = await fetch("https://open.er-api.com/v6/latest/USD");
        const usdData = await usdRes.json();
        const usdToUzs = usdData.rates.UZS;
        const eurToUsd = usdData.rates.EUR;

        const goldRes = await fetch("https://www.goldapi.io/api/XAU/USD", {
          headers: {
            "x-access-token": "goldapi-1yqq19me38w2r7-io",
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const navLinks = [
    { to: "/", label: "Asosiy" },
    { to: "/about", label: "Haqimizda" },
    { to: "/news", label: "Yangiliklar" },
    { to: "/products", label: "Mahsulotlar" },
    { to: "/contact", label: "Bog'lanish" },
  ];

  return (
    <>
      {/* Currency rates bar */}
      <AnimatePresence>
        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 dark:bg-gray-900 text-xs sm:text-sm text-gray-700 dark:text-gray-200 
                       py-2 px-4 font-medium flex items-center justify-between fixed top-0 w-full z-50 
                       border-b border-gray-200 dark:border-gray-700 shadow-sm"
          >
            {/* Currency rates with responsive layout */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-1 scrollbar-hide">
                <span className="whitespace-nowrap flex items-center">
                  <FaDollarSign className='hidden lg:block'></FaDollarSign>
                  <span className="hidden lg:block">1 USD = </span>
                  <span>{rates.usd ? rates.usd.toFixed(2) : "..."} so'm</span>
                </span>
                <span className="whitespace-nowrap flex items-center">
                <FaEuroSign className='hidden lg:block'></FaEuroSign>
                  <span className="hidden lg:block">1 EUR = </span>
                  <span>{rates.eur ? rates.eur.toFixed(2) : "..."} so'm</span>
                </span>
                <span className="whitespace-nowrap flex items-center">
                  <FaCoins className='hidden lg:block'></FaCoins>
                  <span className="hidden lg:block">1g OLTIN = </span>
                  <span>{rates.gold ? Math.round(rates.gold).toLocaleString() : "..."} so'm</span>
                </span>
              </div>
            </div>

            {/* Dark mode toggle - visible on all screens */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 ml-2 sm:ml-4
                         flex items-center justify-center rounded-full 
                         bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                         transition-colors duration-200 shadow-sm cursor-pointer"
              aria-label={darkMode ? "Light mode" : "Dark mode"}
            >
              <motion.div
                key={darkMode ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? (
                  <FaMoon className="text-yellow-300 text-sm sm:text-base" />
                ) : (
                  <FaSun className="text-yellow-500 text-sm sm:text-base" />
                )}
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header */}
      <AnimatePresence>
        {showHeader && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="py-4 fixed w-full font-main border-b border-gray-100 dark:border-gray-700 
                       bg-white dark:bg-gray-800 z-40 top-[55px] sm:top-[45px] transition-colors duration-300"
          >
            <div className="container mx-auto px-4 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 z-50 group">
                <motion.img
                  src={logo}
                  alt="Molia Logo"
                  className="w-12 sm:w-16"
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

              {/* Desktop navigation */}
              <nav className="hidden md:flex gap-4 lg:gap-6 text-gray-700 dark:text-gray-300 text-base font-medium">
                {navLinks.slice(0, 4).map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => 
                      `hover:text-mainBlue dark:hover:text-mainBlueLight transition-colors ${
                        isActive ? "text-mainRed dark:text-mainRedLight font-semibold" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/contact">
                  <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full 
                                    bg-mainBlue dark:bg-mainBlueLight text-white text-sm sm:text-base 
                                    shadow-sm hover:bg-mainRed dark:hover:bg-mainRedLight transition-colors">
                    <FaPhoneAlt size={16} className="sm:size-5" />
                    <span>Bog'lanish</span>
                  </button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center gap-3">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)} 
                  className="text-mainBlue dark:text-mainBlueLight"
                  aria-label="Menu"
                >
                  {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              </div>
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
            className="fixed inset-0 z-50 bg-white dark:bg-gray-800 flex flex-col items-center justify-center gap-6 px-6 py-10 text-lg font-medium transition-colors duration-300"
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-mainBlue dark:text-mainBlueLight hover:text-mainRed dark:hover:text-mainRedLight transition"
              aria-label="Close menu"
            >
              <FaTimes size={24} />
            </button>

            {/* Mobile nav links */}
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => 
                  `hover:text-mainBlue dark:hover:text-mainBlueLight transition-colors text-xl ${
                    isActive ? "text-mainRed dark:text-mainRedLight font-semibold" : "text-gray-800 dark:text-gray-200"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile CTA button */}
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              <button className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full 
                                bg-mainBlue dark:bg-mainBlueLight text-white shadow 
                                hover:bg-mainRed dark:hover:bg-mainRedLight transition-colors">
                <FaPhoneAlt size={18} />
                Bog'lanish
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;