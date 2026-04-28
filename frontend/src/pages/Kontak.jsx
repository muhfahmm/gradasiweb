import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';

const Kontak = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-12 md:p-20 rounded-[4rem] border-white/10"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Let's Connect.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Punya ide proyek atau sekadar ingin menyapa? Hubungi kami langsung melalui platform di bawah ini. Kami akan merespons secepat mungkin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a 
              href="https://wa.me/6288983514206" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <MessageCircle size={24} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Fast Response</div>
                <div className="text-xl font-bold text-white uppercase tracking-tighter">WhatsApp Us</div>
              </div>
            </a>

            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=gradasiweb@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Official Inquiry</div>
                <div className="text-xl font-bold text-white uppercase tracking-tighter">Email Us</div>
              </div>
            </a>
          </div>

          <div className="mt-16 pt-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Location</div>
                <div className="text-sm text-white font-medium">Sukoharjo, Jawa Tengah</div>
             </div>
             <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Work Hours</div>
                <div className="text-sm text-white font-medium">09:00 - 17:00</div>
             </div>
             <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Socials</div>
                <div className="text-sm text-white font-medium">@gradasiweb</div>
             </div>
             <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Availability</div>
                <div className="text-sm text-emerald-400 font-medium italic">Open for Projects</div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Kontak;
