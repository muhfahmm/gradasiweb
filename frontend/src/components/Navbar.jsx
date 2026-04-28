import React, { useState } from 'react';
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
      submenus: ['Landing Page', 'Company Profile', 'E-Commerce']
    },
    {
      title: 'Portofolio',
      submenus: ['Proyek Terbaru', 'Klien Kami', 'Studi Kasus']
    },
    {
      title: 'Tentang',
      submenus: ['Visi Misi', 'Tim Kami', 'Kontak']
    }
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 h-20 flex items-center" style={{ borderRadius: '0 0 20px 20px', margin: '0 10px' }}>
      <div className="container flex justify-between items-center h-full">
        <div className="text-2xl font-bold gradient-text">GRADASIWEB</div>

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
                      <a 
                        key={sIdx} 
                        href="#" 
                        className="block px-4 py-2 hover:bg-accent-primary hover:text-white rounded-lg transition-colors"
                      >
                        {sub}
                      </a>
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
                      <a key={sIdx} href="#" className="text-secondary hover:text-accent-primary">{sub}</a>
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
