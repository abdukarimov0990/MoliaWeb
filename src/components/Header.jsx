import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router';
import { FaPhoneAlt, FaBars, FaTimes, FaDollarSign, FaEuroSign, FaCoins } from 'react-icons/fa';
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
const fetchGoldPrice = async () => {
  try {
    const response = await fetch("https://goldpricez.com/api/v1/latest?currency=UZS");
    const data = await response.json();
    return data.price_per_gram; // yoki kerakli qiymat
  } catch (error) {
    console.error("Oltin narxini olishda xatolik:", error);
  }
};
  
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
        const goldPricePerGramUSD = goldData.price / 31.1035;
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
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setShowHeader(true);
        return;
      }

      timeoutId = setTimeout(() => {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowHeader(false);
        } else if (currentScrollY < lastScrollY) {
          setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [lastScrollY]);


  const scrollVariants = {
    animate: {
      x: ["100%", "-100%"],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 20,
          ease: "linear",
        },
      },
    },
  };

  const navLinks = [
    { to: "/", label: "Asosiy" },
    { to: "/about", label: "Haqimizda" },
    { to: "/news", label: "Yangiliklar" },
    { to: "/products", label: "Mahsulotlar" },
    { to: "/contact", label: "Bog'lanish" },
  ];

  const ratesArray = [
    { icon: <FaDollarSign />, label: "1 USD", value: rates.usd ? `${rates.usd.toFixed(2)} so'm` : "..." },
    { icon: <FaEuroSign />, label: "1 EUR", value: rates.eur ? `${rates.eur.toFixed(2)} so'm` : "..." },
    { icon: <FaCoins />, label: "1g OLTIN", value: rates.gold ? `${Math.round(rates.gold).toLocaleString()} so'm` : "..." },
  ];

  return (
    <>
      {/* Currency rates bar */}
      <AnimatePresence>
        {showHeader && (
          <motion.div
            key="rates-bar"
            className="fixed top-0 left-0 right-0 bg-gray-100 dark:bg-gray-700 py-2 z-30 overflow-hidden"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.div className="flex gap-3 sm:gap-4 md:gap-6 px-4" variants={scrollVariants} animate="animate">
              {ratesArray.map((rate, idx) => (
                <span key={idx} className="whitespace-nowrap flex items-center text-sm sm:text-base">
                  {rate.icon}
                  <span className="hidden lg:inline ml-1">{rate.label} = </span>
                  <span className="ml-1">{rate.value}</span>
                </span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header */}
      <AnimatePresence>
        {showHeader && (
          <motion.header
            key="main-header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed w-full font-main border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-40 top-[40px] sm:top-[40px] transition-colors duration-300"
          >
            <div className="container mx-auto px-4 flex items-center justify-between py-3">
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
                  whileTap={{ scale: 0.95, rotate: 0 }}
                />
              </Link>

              {/* Desktop navigation */}
              <nav className="hidden md:flex gap-4 lg:gap-6 text-gray-700 dark:text-gray-300 text-base font-medium">
                {navLinks.map((link) => (
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
                  <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-mainBlue dark:bg-mainBlueLight text-white text-sm sm:text-base shadow-sm hover:bg-mainRed dark:hover:bg-mainRedLight transition-colors">
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
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 w-full h-full flex flex-col items-center justify-between py-5 px-5 z-50 bg-white dark:bg-gray-800"
          >
            <div className="w-full flex items-start">
              <button 
                className="ml-auto text-mainBlue dark:text-mainBlueLight"
                onClick={() => setMenuOpen(false)}
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <motion.nav 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ staggerChildren: 0.1 }}
              className="flex flex-col text-center gap-6 text-gray-700 dark:text-gray-300 text-2xl font-medium"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.to}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                >
                  <NavLink
                    onClick={() => setMenuOpen(false)}
                    to={link.to}
                    className={({ isActive }) =>
                      `block py-2 hover:text-mainBlue dark:hover:text-mainBlueLight transition-colors ${
                        isActive ? "text-mainRed dark:text-mainRedLight font-semibold" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="mb-8"
            >
              <Link to="/contact">
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-6 py-3 text-xl rounded-full bg-mainBlue dark:bg-mainBlueLight text-white shadow-sm hover:bg-mainRed dark:hover:bg-mainRedLight transition-colors"
                >
                  <FaPhoneAlt size={20} />
                  <span>Bog'lanish</span>
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
