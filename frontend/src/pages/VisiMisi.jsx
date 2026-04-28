import React from 'react';
import { motion } from 'framer-motion';

const VisiMisi = () => {
  return (
    <div className="pt-32 pb-20 container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-12 text-center gradient-text">Visi & Misi</h1>
        
        <div className="grid gap-12">
          <div className="glass p-10 rounded-[2.5rem] border-white/5">
            <h2 className="text-3xl font-bold mb-6 text-accent-primary">Visi</h2>
            <p className="text-xl leading-relaxed text-secondary" style={{ color: 'var(--text-secondary)' }}>
              Menjadi mitra transformasi digital terdepan yang memberdayakan bisnis untuk berkembang pesat melalui inovasi teknologi dan desain yang berpusat pada manusia.
            </p>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border-white/5">
            <h2 className="text-3xl font-bold mb-6 text-accent-secondary">Misi</h2>
            <ul className="space-y-6 text-lg text-secondary" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary font-bold">1</span>
                <span>Membangun solusi digital berkualitas tinggi yang fungsional, estetis, dan skalabel.</span>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary font-bold">2</span>
                <span>Memberikan layanan konsultasi strategis untuk membantu klien mencapai target bisnis mereka.</span>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0 text-accent-primary font-bold">3</span>
                <span>Terus berinovasi mengikuti perkembangan teknologi terbaru untuk memberikan keunggulan kompetitif bagi klien.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VisiMisi;
