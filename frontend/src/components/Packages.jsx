import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map(pkg => ({
          ...pkg,
          features: typeof pkg.features === 'string' ? pkg.features.split(',').map(f => f.trim()) : pkg.features
        }));
        setPackages(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch packages", err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="packages" className="container">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Pilih Paket Anda</h2>
        <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>Harga transparan tanpa biaya tersembunyi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-1 md:col-span-3 text-center text-slate-400 py-10 animate-pulse">Memuat paket harga...</div>
        ) : packages.length === 0 ? (
          <div className="col-span-1 md:col-span-3 text-center text-slate-400 py-10 border-2 border-dashed border-slate-700 rounded-3xl">Belum ada paket tersedia.</div>
        ) : packages.map((pkg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className={`glass p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col group transition-all duration-500 ${pkg.recommended ? 'border-2 border-accent-primary shadow-[0_20px_50px_rgba(96,165,250,0.15)]' : 'border-white/5 hover:border-white/20'}`}
          >
            {pkg.recommended && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-accent-primary to-accent-secondary text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest shadow-lg">
                Recommended
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-1 group-hover:text-accent-primary transition-colors">{pkg.name}</h3>
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold opacity-50">Professional Tier</p>
            </div>

            <div className="mb-8">
              <span className="text-xs font-bold text-accent-primary block mb-1 opacity-80 italic">Mulai dari</span>
              <div className="text-5xl font-black gradient-text tracking-tighter">{pkg.price}</div>
            </div>
            
            <ul className="space-y-5 mb-10 flex-grow">
              {pkg.features.map((feat, fIdx) => (
                <li key={fIdx} className="flex items-start gap-4 text-sm font-medium leading-tight">
                  <div className="w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-accent-primary" strokeWidth={3} />
                  </div>
                  <span className="text-slate-300">{feat}</span>
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${pkg.recommended ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-xl shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:scale-[1.02]' : 'glass hover:bg-white/10 hover:border-white/20'}`}>
              Ambil Paket Ini
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Packages;
