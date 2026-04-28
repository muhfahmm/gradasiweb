import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Kontak = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
    setShowModal(true);
  };

  return (
    <div className="pt-32 pb-20 container relative">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1 opacity-60">Nama</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" 
                  placeholder="Nama lengkap" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1 opacity-60">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" 
                  placeholder="Alamat email" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 opacity-60">Subjek</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" 
                placeholder="Apa yang ingin dibahas?" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 opacity-60">Pesan</label>
              <textarea 
                rows="4" 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-accent-primary outline-none transition-colors" 
                placeholder="Tuliskan detail proyek atau pertanyaan Anda"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-accent-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-accent-primary/20"
            >
              {status === 'loading' ? (
                <>Mohon Tunggu... <Loader2 size={18} className="animate-spin" /></>
              ) : (
                <>Kirim Pesan <Send size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass max-w-sm w-full p-10 rounded-[3rem] relative text-center"
            >
              <div className={`w-20 h-20 rounded-[2rem] mx-auto mb-6 flex items-center justify-center ${status === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {status === 'success' ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {status === 'success' ? 'Pesan Terkirim!' : 'Gagal Mengirim'}
              </h3>
              <p className="text-secondary mb-8 leading-relaxed">
                {status === 'success' 
                  ? 'Terima kasih! Pesan Anda telah kami terima dan akan segera kami balas melalui email.' 
                  : 'Mohon maaf, terjadi kendala saat mengirim pesan. Silakan coba beberapa saat lagi.'}
              </p>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold transition-all"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Kontak;
