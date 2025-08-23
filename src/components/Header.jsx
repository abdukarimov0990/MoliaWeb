import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router';
import { FaPhoneAlt, FaBars, FaTimes, FaDollarSign, FaEuroSign, FaCoins } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/img/result.png';
import { fetchRates } from '../../bot/firebase'; // Firebase rates fetch

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

  // --- Firebase rates fetch ---
  useEffect(() => {
    const getRates = async () => {
      const data = await fetchRates();
      setRates(data);
    };

    getRates();

    // Har 60 sekund yangilash
    const interval = setInterval(getRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- Scroll bilan header ko‘rinishi ---
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
  ];
  const [today, setToday] = useState("");
  useEffect(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");   // kun
    const month = String(date.getMonth() + 1).padStart(2, "0"); // oy (0-indexed)
    const year = date.getFullYear();

    setToday(`${day}/${month}/${year}`);
  }, []);

  return (
    <>
      {/* Currency rates bar */}
      <AnimatePresence>
        {showHeader && (
          <div className="">
          <motion.div
            key="rates-bar"
            className=" lg:fixed top-0 left-0 right-0 bg-gray-100 py-2 z-30 overflow-hidden"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <motion.div 
              className=" gap-3 w-full px-4 text-gray-800 dark:text-gray-200"
              variants={scrollVariants} 
              animate="animate" 
            >
Ushbu valyuta va oltin narxlari bugungi {today} sana bilan yangilanmoqda!  
1 USD = {rates.usd ? rates.usd.toLocaleString() + " so'm" : "..."} |{" "} 
1 EUR = {rates.eur ? rates.eur.toLocaleString() + " so'm" : "..."} |{" "} 
1 gr OLTIN = {rates.gold ? rates.gold.toLocaleString() + " so'm" : "..."}
            </motion.div>
          </motion.div>
                    <motion.div
                    key="rates-bar"
                    className="fixed lg:hidden top-0 left-0 right-0 bg-gray-100 py-2 z-30 overflow-hidden"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className=" gap-3 w-full px-4 text-gray-800 dark:text-gray-200"
                      variants={scrollVariants} 
                      animate="animate" 
                    >
                      1 USD = {rates.usd ? rates.usd.toLocaleString() + " so'm " : "..." }
                      | 1 EUR = {rates.eur ? rates.eur.toLocaleString() + " so'm " : "..."}
                      | 1 gr OLTIN = {rates.gold ? rates.gold.toLocaleString() + " so'm " : "..."}
                    </motion.div>
                  </motion.div>
</div>        
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
            className="fixed w-full font-main border-b border-white/20 dark:border-gray-700/30 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md shadow-lg z-40 top-[40px] sm:top-[40px] transition-colors duration-300"
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
              <nav className="hidden md:flex gap-4 lg:gap-6 text-gray-800 dark:text-gray-200 text-base font-medium">
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
                  <button className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-mainBlue dark:bg-mainBlueLight text-white text-sm sm:text-base shadow-md hover:bg-mainRed dark:hover:bg-mainRedLight transition-colors">
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
