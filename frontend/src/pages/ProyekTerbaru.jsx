import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';

const ProyekTerbaru = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects/latest');
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 pb-20 container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 gradient-text">Proyek Terbaru</h1>
        <p className="text-secondary max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Jelajahi karya-karya terbaru kami yang menggabungkan desain inovatif dengan teknologi terkini.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass h-[400px] rounded-3xl animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.length === 0 ? (
             <div className="col-span-1 md:col-span-3 text-center text-slate-400 py-20 border-2 border-dashed border-slate-700 rounded-[3rem]">
               Belum ada proyek terbaru tersedia.
             </div>
          ) : projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-[2.5rem] overflow-hidden group border-white/5 hover:border-accent-primary/30 transition-all duration-500"
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={project.image_url || 'https://via.placeholder.com/800x600'} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-accent-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                    Kunjungi Situs <ExternalLink size={18} />
                  </a>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-accent-primary transition-colors">{project.title}</h3>
                <p className="text-secondary text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
                <a href={project.link} className="inline-flex items-center gap-2 text-accent-primary font-bold text-xs uppercase tracking-widest hover:gap-4 transition-all">
                  Detail Proyek <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProyekTerbaru;
