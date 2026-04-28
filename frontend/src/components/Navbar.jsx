import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const menuItems = [
    {
      title: 'Layanan',
      submenus: [
        { name: 'Landing Page', path: '/#packages' },
        { name: 'Company Profile', path: '/#packages' },
        { name: 'E-Commerce', path: '/#packages' }
      ]
    },
    {
      title: 'Portofolio',
      submenus: [
        { name: 'Proyek Terbaru', path: '/proyek-terbaru' }
      ]
    },
    {
      title: 'Tentang',
      submenus: [
        { name: 'Visi Misi', path: '/visi-misi' },
        { name: 'Tim Kami', path: '/tim-kami' },
        { name: 'Kontak', path: '/kontak' }
      ]
    }
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 h-20 flex items-center" style={{ borderRadius: '0 0 20px 20px', margin: '0 10px' }}>
      <div className="container flex justify-between items-center h-full">
        <Link to="/" className="text-2xl font-bold gradient-text">GRADASIWEB</Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              className="relative group py-2"
              onMouseEnter={() => setActiveSubmenu(idx)}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button className="flex items-center gap-1 font-medium hover:text-accent-primary transition-colors">
                {item.title} <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {activeSubmenu === idx && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-bg-secondary shadow-xl border border-glass-border rounded-xl p-2"
                  >
                    {item.submenus.map((sub, sIdx) => (
                      <Link 
                        key={sIdx} 
                        to={sub.path} 
                        onClick={() => setActiveSubmenu(null)}
                        className="block px-4 py-2 hover:bg-accent-primary hover:text-white rounded-lg transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <button onClick={toggleTheme} className="p-2 rounded-full glass hover:scale-110 transition-transform">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
           <button onClick={toggleTheme} className="p-2 rounded-full glass">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-secondary z-40 p-8 md:hidden"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex flex-col gap-6 mt-12">
              {menuItems.map((item, idx) => (
                <div key={idx}>
                  <div className="text-xl font-bold mb-2">{item.title}</div>
                  <div className="flex flex-col gap-2 pl-4 border-l border-accent-primary">
                    {item.submenus.map((sub, sIdx) => (
                      <Link 
                        key={sIdx} 
                        to={sub.path} 
                        onClick={() => setIsOpen(false)}
                        className="text-secondary hover:text-accent-primary"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

