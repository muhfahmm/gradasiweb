import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Kontak = () => {
  return (
    <div className="pt-32 pb-20 container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 gradient-text">Hubungi Kami</h1>
        <p className="text-secondary max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Siap untuk memulai proyek Anda? Kami di sini untuk membantu.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1">Email</h4>
              <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>gradasiweb@gmail.com</p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1">Telepon</h4>
              <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>+62 889 8351 4206</p>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1">Lokasi</h4>
              <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>Sukoharjo, Jawa Tengah</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass p-10 rounded-[2.5rem]">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1 opacity-60">Nama</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" placeholder="Nama lengkap" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1 opacity-60">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" placeholder="Alamat email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 opacity-60">Subjek</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" placeholder="Apa yang ingin dibahas?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 opacity-60">Pesan</label>
              <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" placeholder="Tuliskan detail proyek atau pertanyaan Anda"></textarea>
            </div>
            <button className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent-primary/20">
              Kirim Pesan <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
