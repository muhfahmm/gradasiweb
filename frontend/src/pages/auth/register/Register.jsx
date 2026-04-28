import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Konfirmasi password tidak cocok');
    }
    
    try {
      await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[3rem] w-full max-w-md border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2 text-white">Buat Akun Admin</h2>
          <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>Daftarkan akun untuk mengelola Gradasiweb</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-2xl text-[10px] font-bold mb-6 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-2xl text-[10px] font-bold mb-6 text-center">
            Registrasi berhasil! Mengalihkan ke login...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-primary transition-colors" size={18} />
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-accent-primary outline-none transition-all"
                placeholder="admin_gradasi"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-primary transition-colors" size={18} />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-accent-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Konfirmasi Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-primary transition-colors" size={18} />
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-accent-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full gradient-bg text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-blue-500/20 transition-all mt-4"
          >
            Daftar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-secondary text-xs" style={{ color: 'var(--text-secondary)' }}>
            Sudah punya akun? <Link to="/login" className="text-accent-primary font-bold hover:underline inline-flex items-center gap-1">Login Admin <LogIn size={14} /></Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
