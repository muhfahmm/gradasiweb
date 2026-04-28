import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative overflow-hidden flex items-center justify-center text-center min-h-screen">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent-primary rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-secondary rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.05] rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full"></div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-1.5 glass rounded-full text-xs font-semibold tracking-wider uppercase mb-6 text-accent-primary border border-accent-primary/20">
            Agency Kreatif Digital #1
          </div>
          <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-[1.1]">
            Transformasi Digital <br />
            Bersama <span className="gradient-text">GRADASIWEB</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Kami membantu bisnis Anda tampil profesional di dunia digital dengan desain website modern, fungsional, dan berbasis data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-accent-primary text-white rounded-full font-bold hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/30 transition-all duration-300">
              Mulai Konsultasi
            </button>
            <button className="px-10 py-4 glass rounded-full font-bold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10">
              Lihat Project
            </button>
          </div>
        </motion.div>

        {/* Floating cards for visual flair */}
        <div className="mt-24 hidden lg:flex justify-center gap-8">
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass p-6 rounded-3xl w-52 -rotate-6 border border-white/5"
            >
                <div className="text-3xl font-extrabold text-accent-primary mb-1">99%</div>
                <div className="text-xs font-medium uppercase tracking-widest opacity-60">Client Satisfied</div>
            </motion.div>
            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="glass p-6 rounded-3xl w-52 rotate-3 translate-y-12 border border-white/5"
            >
                <div className="text-3xl font-extrabold text-accent-secondary mb-1">150+</div>
                <div className="text-xs font-medium uppercase tracking-widest opacity-60">Success Projects</div>
            </motion.div>
            <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="glass p-6 rounded-3xl w-52 -rotate-2 border border-white/5"
            >
                <div className="text-3xl font-extrabold text-accent-primary mb-1">24/7</div>
                <div className="text-xs font-medium uppercase tracking-widest opacity-60">Expert Support</div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
