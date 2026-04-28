import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects/featured');
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="container">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Proyek Unggulan</h2>
        <div className="w-20 h-1 bg-accent-primary mx-auto rounded-full"></div>
      </div>

      {loading ? (
        <div className="text-center py-20">Memuat data proyek...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-slate-400 py-16 border-2 border-dashed border-slate-700 rounded-[2.5rem]">
          Belum ada proyek unggulan tersedia.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image_url || 'https://via.placeholder.com/800x600'} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <a href={project.link} className="flex items-center gap-2 text-white font-medium">
                    Lihat Proyek <ExternalLink size={18} />
                  </a>
                </div>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-primary mb-2 block">
                  {project.category}
                </span>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
