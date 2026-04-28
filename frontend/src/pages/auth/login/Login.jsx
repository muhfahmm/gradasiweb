import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username: email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-[3rem] w-full max-w-md border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 gradient-bg"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 text-white font-bold text-2xl">G</div>
          <h2 className="text-3xl font-bold mb-2 text-white">Selamat Datang</h2>
          <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>Masuk ke Admin Dashboard Gradasiweb</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-2xl text-xs font-bold mb-6 text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username / Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-primary transition-colors" size={18} />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-accent-primary outline-none transition-all"
                placeholder="admin"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-accent-primary outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full gradient-bg text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group hover:shadow-xl hover:shadow-blue-500/20 transition-all"
          >
            Masuk Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-secondary text-xs" style={{ color: 'var(--text-secondary)' }}>
            Belum punya akun? <Link to="/register" className="text-accent-primary font-bold hover:underline inline-flex items-center gap-1">Daftar Admin <UserPlus size={14} /></Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
