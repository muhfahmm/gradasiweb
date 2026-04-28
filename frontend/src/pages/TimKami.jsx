import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const TimKami = () => {
  const [team, setTeam] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get('/api/team');
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="pt-32 pb-20 container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 gradient-text">Tim Kami</h1>
        <p className="text-secondary max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Kumpulan talenta kreatif dan teknis yang berdedikasi untuk mewujudkan visi digital Anda.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="col-span-1 md:col-span-3 text-center py-20 text-slate-400 animate-pulse font-bold uppercase tracking-widest">Memuat tim kami...</div>
        ) : team.length === 0 ? (
          <div className="col-span-1 md:col-span-3 text-center text-slate-400 py-20 border-2 border-dashed border-slate-700 rounded-[3rem]">
            Tim kami sedang dalam proses pembaruan.
          </div>
        ) : team.map((member, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-[2rem] text-center group"
          >
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden">
              <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            </div>
            <h3 className="text-xl font-bold mb-1">{member.name}</h3>
            <p className="text-accent-primary font-medium text-sm">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TimKami;
