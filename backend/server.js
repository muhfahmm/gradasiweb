const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });
const port = process.env.PORT || 1000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = process.env.JWT_SECRET || 'gradasiweb_super_secret_key';

// Auth Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Silakan login.' });

  try {
    const verified = jwt.verify(token.startsWith('Bearer ') ? token.slice(7) : token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token tidak valid.' });
  }
};

// DB Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'db_gradasiweb',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Mock Data Fallback
let mockProyekUnggulan = [];
let mockProyekTerbaru = [];
let mockPackages = [];
let mockTeam = [];
let mockAdmins = [];
let mockMessages = [];

// Nodemailer Config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify Transporter
transporter.verify((error, success) => {
  if (error) console.error("Email Config Error:", error.message);
  else console.log("Email System Ready - Sending from:", process.env.EMAIL_USER);
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.warn("DB Offline - Registering to Mock Storage");
    const newUser = { id: Date.now(), username, password: hashedPassword, avatar_url: null };
    mockAdmins.push(newUser);
    res.status(201).json({ id: newUser.id, username: newUser.username });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  let user;
  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    user = result.rows[0];
  } catch (err) {
    console.warn("DB Offline - Checking Mock Storage");
    user = mockAdmins.find(u => u.username === username);
  }

  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).json({ message: 'Password salah' });

  const token = jwt.sign({ id: user.id, username: user.username, avatar_url: user.avatar_url }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.json({ token, user: { id: user.id, username: user.username, avatar_url: user.avatar_url } });
});

// Profile Pic API
app.post('/api/auth/profile-pic', verifyToken, upload.single('avatar'), async (req, res) => {
  const avatar_url = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.avatar_url;
  try {
    await pool.query('UPDATE admins SET avatar_url = $1 WHERE id = $2', [avatar_url, req.user.id]);
    res.json({ avatar_url });
  } catch (err) {
    res.status(500).json({ message: 'DB Error' });
  }
});

app.delete('/api/auth/profile-pic', verifyToken, async (req, res) => {
  try {
    await pool.query('UPDATE admins SET avatar_url = NULL WHERE id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'DB Error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/projects/featured', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyek_unggulan ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockProyekUnggulan);
  }
});

app.post('/api/projects/featured', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, link, category } = req.body;
  const image_url = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image_url || '';
  try {
    const result = await pool.query(
      'INSERT INTO proyek_unggulan (title, description, image_url, link, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, link, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newItem = { id: Date.now(), title, description, image_url, link, category };
    mockProyekUnggulan.push(newItem);
    res.status(201).json(newItem);
  }
});

app.delete('/api/projects/featured/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proyek_unggulan WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    mockProyekUnggulan = mockProyekUnggulan.filter(i => i.id != id);
    res.status(204).send();
  }
});

// Projects API (Terbaru)
app.get('/api/projects/latest', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyek_terbaru ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/projects/latest', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, link, category } = req.body;
  const image_url = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image_url || '';
  try {
    const result = await pool.query(
      'INSERT INTO proyek_terbaru (title, description, image_url, link, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, link, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB Error' });
  }
});

app.delete('/api/projects/latest/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proyek_terbaru WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).send();
  }
});

// Messages API
app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockMessages);
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO messages (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, message]
    );

    // Kirim notifikasi ke email admin jika kredensial sudah diatur
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter.sendMail({
        from: `"GRADASIWEB SYSTEM" <${process.env.EMAIL_USER}>`,
        to: 'gradasiweb@gmail.com', // Email tujuan admin
        subject: `[PESAN BARU] ${name} - ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2563eb;">Pesan Baru dari Website!</h2>
            <p>Seseorang telah mengirim pesan melalui formulir kontak:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="font-weight: bold; padding: 5px 0;">Nama:</td><td>${name}</td></tr>
              <tr><td style="font-weight: bold; padding: 5px 0;">Email:</td><td>${email}</td></tr>
              <tr><td style="font-weight: bold; padding: 5px 0;">Subjek:</td><td>${subject}</td></tr>
            </table>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 0; font-style: italic;">"${message}"</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="http://localhost:1001/admin" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Buka Admin Dashboard</a>
            </p>
          </div>
        `
      }).catch(e => console.log("Notif Admin Error:", e.message));
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newMessage = { id: Date.now(), name, email, subject, message, is_read: false, created_at: new Date() };
    mockMessages.push(newMessage);
    res.status(201).json(newMessage);
  }
});

app.post('/api/messages/:id/reply', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { reply_content } = req.body;

  const hasEnv = process.env.EMAIL_USER && 
                 process.env.EMAIL_PASS && 
                 process.env.EMAIL_USER !== 'emailanda@gmail.com';

  try {
    let msg;
    try {
      const msgResult = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
      msg = msgResult.rows[0];
    } catch (dbErr) {
      console.warn("DB Error, falling back to Mock:", dbErr.message);
      msg = mockMessages.find(m => m.id == id);
    }
    
    if (msg) {
      if (hasEnv) {
        console.log(`Attempting to send reply to ${msg.email}...`);
        await transporter.sendMail({
          from: `"GRADASIWEB Admin" <${process.env.EMAIL_USER}>`,
          to: msg.email,
          subject: `Re: ${msg.subject || 'Kontak Gradasiweb'}`,
          text: reply_content
        });
        console.log("Reply sent successfully!");
        
        try {
          await pool.query('UPDATE messages SET reply_content = $1, is_read = true WHERE id = $2', [reply_content, id]);
        } catch(e) {}

        return res.json({ message: 'Reply sent via Gmail!' });
      } else {
        return res.json({ 
          message: 'Reply saved to dashboard!', 
          warning: 'Sent via Mock (Email tidak terkirim karena .env belum diisi)' 
        });
      }
    }
    res.status(404).json({ message: 'Message not found' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

app.delete('/api/messages/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    mockMessages = mockMessages.filter(m => m.id != id);
    res.status(204).send();
  }
});
app.get('/api/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockPackages);
  }
});

app.post('/api/packages', verifyToken, async (req, res) => {
  const { name, price, features, recommended } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO packages (name, price, features, recommended) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, features, recommended]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newItem = { id: Date.now(), name, price, features, recommended };
    mockPackages.push(newItem);
    res.status(201).json(newItem);
  }
});

app.delete('/api/packages/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM packages WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    mockPackages = mockPackages.filter(i => i.id != id);
    res.status(204).send();
  }
});

// Team API
app.get('/api/team', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/team', verifyToken, upload.single('image'), async (req, res) => {
  const { name, role } = req.body;
  const image = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image || '';
  try {
    const result = await pool.query(
      'INSERT INTO team (name, role, image) VALUES ($1, $2, $3) RETURNING *',
      [name, role, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'DB Error' });
  }
});

app.delete('/api/team/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM team WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).send();
  }
});

// Serve Admin UI
app.get('/admin', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.send(`
            <script>
                window.location.href = 'http://localhost:1001/gradasiweb/login';
            </script>
        `);
    }
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return res.send(`
            <script>
                window.location.href = 'http://localhost:1001/gradasiweb/login';
            </script>
        `);
    }
    const username = decoded.username || 'Admin';
    const avatar_url = decoded.avatar_url || '';
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Dashboard - GRADASIWEB</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-primary: #020617;
                    --bg-secondary: #0f172a;
                    --accent-primary: #60a5fa;
                    --accent-secondary: #a78bfa;
                    --glass-bg: rgba(15, 23, 42, 0.7);
                    --glass-border: rgba(255, 255, 255, 0.08);
                    --text-primary: #f8fafc;
                    --text-secondary: #94a3b8;
                }
                body { 
                    font-family: 'Outfit', sans-serif; 
                    background-color: var(--bg-primary); 
                    color: var(--text-primary);
                    background-image: 
                        radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.15) 0%, transparent 25%),
                        radial-gradient(circle at 100% 100%, rgba(167, 139, 250, 0.1) 0%, transparent 25%);
                    background-attachment: fixed;
                }
                .glass {
                    background: var(--glass-bg);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border);
                }
                .gradient-text {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gradient-bg {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                }
                .tab-active { 
                    color: var(--accent-primary); 
                    border-bottom: 2px solid var(--accent-primary);
                }
                .tab-inactive { color: var(--text-secondary); }
                
                input, textarea {
                    background: rgba(15, 23, 42, 0.5) !important;
                    border: 1px solid var(--glass-border) !important;
                    color: white !important;
                    transition: all 0.3s ease;
                }
                input:focus, textarea:focus {
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 0 15px rgba(96, 165, 250, 0.1);
                    outline: none;
                }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: var(--bg-primary); }
                ::-webkit-scrollbar-thumb { background: var(--bg-secondary); border-radius: 10px; border: 2px solid var(--bg-primary); }
                
                .btn-primary {
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px -5px rgba(96, 165, 250, 0.4);
                }
                .btn-primary:active { transform: translateY(0); }
            </style>
        </head>
        <body class="min-h-screen pb-20">
            <!-- Top Navigation -->
            <nav class="glass sticky top-0 z-50 px-8 py-5 mb-10">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="flex items-center gap-4 group cursor-default">
                        <div class="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-blue-500/20 text-white transform group-hover:rotate-6 transition-transform">G</div>
                        <div>
                            <div class="text-2xl font-bold tracking-tight gradient-text">GRADASIWEB</div>
                            <div class="text-[10px] uppercase tracking-[0.3em] text-blue-400/80 font-bold">Administrative Engine</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-10 text-sm font-semibold uppercase tracking-widest">
                        <button onclick="switchTab('unggulan')" id="tab-unggulan" class="pb-1 transition-all tab-active hover:text-blue-300">Unggulan</button>
                        <button onclick="switchTab('terbaru')" id="tab-terbaru" class="pb-1 transition-all tab-inactive hover:text-blue-300">Terbaru</button>
                        <button onclick="switchTab('packages')" id="tab-packages" class="pb-1 transition-all tab-inactive hover:text-blue-300">Packages</button>
                        <button onclick="switchTab('team')" id="tab-team" class="pb-1 transition-all tab-inactive hover:text-blue-300">Team</button>
                        <button onclick="switchTab('messages')" id="tab-messages" class="pb-1 transition-all tab-inactive hover:text-blue-300 flex items-center gap-2">
                            Messages
                            <span id="nav-msg-count" class="hidden w-4 h-4 bg-blue-500 rounded-full text-[8px] flex items-center justify-center text-white">0</span>
                        </button>
                        <a href="http://localhost:1001/gradasiweb/" target="_blank" class="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                            View Site <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>

                    <div class="flex items-center gap-5">
                        <div class="flex flex-col items-end hidden sm:flex">
                            <span class="text-xs font-bold text-white">${username}</span>
                            <span class="text-[10px] text-blue-400 font-medium">Verified Admin</span>
                        </div>
                        <div class="relative cursor-pointer group" onclick="toggleProfileModal()">
                            <div id="nav-avatar" class="w-10 h-10 rounded-2xl border-2 border-blue-500/30 shadow-lg shadow-blue-500/10 flex items-center justify-center overflow-hidden bg-slate-800 transition-transform group-hover:scale-105">
                                ${avatar_url ? '<img src="' + avatar_url + '" class="w-full h-full object-cover" />' : '<span class="text-xs font-bold text-slate-500">' + username.charAt(0).toUpperCase() + '</span>'}
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020617]"></div>
                        </div>
                        <button onclick="handleLogout()" class="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all group" title="Logout">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div class="max-w-7xl mx-auto px-8">
                <!-- Overview Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-amber-500/20 transition-all group">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Unggulan</div>
                        <div class="text-4xl font-bold gradient-text" id="stat-unggulan">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-blue-500/20 transition-all group">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Terbaru</div>
                        <div class="text-4xl font-bold text-white" id="stat-terbaru">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-purple-500/20 transition-all">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Packages</div>
                        <div class="text-4xl font-bold text-white" id="stat-packages">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-emerald-500/20 transition-all">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Team</div>
                        <div class="text-4xl font-bold text-white" id="stat-team">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-blue-500/20 transition-all">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Inbox</div>
                        <div class="text-4xl font-bold text-white" id="stat-messages">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 bg-blue-500/5">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Status</div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <span class="text-[10px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>

                <!-- UNGGULAN VIEW -->
                <div id="view-unggulan" class="animate-in fade-in duration-500">
                    <div class="flex flex-col xl:flex-row gap-10">
                        <div class="xl:w-[400px] shrink-0">
                            <div class="glass p-8 rounded-[3rem] sticky top-32">
                                <h3 class="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">⭐</span>
                                    Proyek Unggulan
                                </h3>
                                <form id="unggulanForm" class="space-y-6">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                        <input type="text" id="u_title" class="w-full rounded-2xl px-5 py-4 text-sm" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                        <input type="text" id="u_category" class="w-full rounded-2xl px-5 py-4 text-sm" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visual Media</label>
                                        <div class="space-y-3">
                                            <input type="file" id="u_image" accept="image/*" class="w-full rounded-2xl px-4 py-3 text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-600 file:text-white file:font-bold file:uppercase file:tracking-tighter">
                                            <div class="text-center text-[10px] text-slate-600 font-bold uppercase">or</div>
                                            <input type="text" id="u_image_url" placeholder="Paste Image URL" class="w-full rounded-2xl px-5 py-4 text-sm">
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full btn-primary py-4 rounded-2xl font-bold text-sm text-white">Save Unggulan</button>
                                </form>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <div id="featuredList" class="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
                        </div>
                    </div>
                </div>

                <!-- TERBARU VIEW -->
                <div id="view-terbaru" class="hidden animate-in fade-in duration-500">
                    <div class="flex flex-col xl:flex-row gap-10">
                        <div class="xl:w-[400px] shrink-0">
                            <div class="glass p-8 rounded-[3rem] sticky top-32">
                                <h3 class="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">✨</span>
                                    Proyek Terbaru
                                </h3>
                                <form id="terbaruForm" class="space-y-6">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                        <input type="text" id="t_title" class="w-full rounded-2xl px-5 py-4 text-sm" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                        <input type="text" id="t_category" class="w-full rounded-2xl px-5 py-4 text-sm" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visual Media</label>
                                        <div class="space-y-3">
                                            <input type="file" id="t_image" accept="image/*" class="w-full rounded-2xl px-4 py-3 text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-bold file:uppercase file:tracking-tighter">
                                            <div class="text-center text-[10px] text-slate-600 font-bold uppercase">or</div>
                                            <input type="text" id="t_image_url" placeholder="Paste Image URL" class="w-full rounded-2xl px-5 py-4 text-sm">
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full btn-primary py-4 rounded-2xl font-bold text-sm text-white">Save Terbaru</button>
                                </form>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <div id="latestList" class="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
                        </div>
                    </div>
                </div>

                <!-- PACKAGES VIEW -->
                <div id="view-packages" class="hidden animate-in fade-in duration-500">
                    <div class="flex flex-col xl:flex-row gap-10">
                        <div class="xl:w-[400px] shrink-0">
                            <div class="glass p-8 rounded-[3rem] sticky top-32">
                                <h3 class="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">⚡</span>
                                    Pricing Tier
                                </h3>
                                <form id="packageForm" class="space-y-6">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Plan Name</label>
                                        <input type="text" id="pkg_name" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Enterprise" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price Range</label>
                                        <div class="flex items-center gap-3">
                                            <input type="number" id="pkg_min_price" class="w-full rounded-2xl px-5 py-4 text-sm bg-slate-900/50 border-white/5" placeholder="Min (e.g. 200000)" required>
                                            <span class="text-slate-600 font-bold">—</span>
                                            <input type="number" id="pkg_max_price" class="w-full rounded-2xl px-5 py-4 text-sm bg-slate-900/50 border-white/5" placeholder="Max (e.g. 1000000)" required>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Core Features</label>
                                        <div class="flex gap-2">
                                            <input type="text" id="feature_input" class="flex-grow rounded-xl px-4 py-3 text-sm" placeholder="Add feature...">
                                            <button type="button" onclick="addFeatureItem()" class="px-4 bg-purple-600 rounded-xl font-bold text-white">+</button>
                                        </div>
                                        <div id="feature_list" class="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-900/50 rounded-xl border border-white/5">
                                            <!-- Items added here -->
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between p-5 bg-slate-900/40 rounded-2xl border border-white/5">
                                        <label for="pkg_recommended" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Highlight as Popular</label>
                                        <input type="checkbox" id="pkg_recommended" class="w-6 h-6 rounded-lg accent-blue-600">
                                    </div>
                                    <button type="submit" class="w-full btn-primary py-4 rounded-2xl font-bold text-sm text-white">Save Tier</button>
                                </form>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <div class="glass p-10 rounded-[3rem]">
                                <h3 class="text-2xl font-bold text-white mb-10">Revenue Packages</h3>
                                <div id="packageList" class="grid grid-cols-1 gap-6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TEAM VIEW -->
                <div id="view-team" class="hidden animate-in fade-in duration-500">
                    <div class="flex flex-col xl:flex-row gap-10">
                        <div class="xl:w-[400px] shrink-0">
                            <div class="glass p-8 rounded-[3rem] sticky top-32">
                                <h3 class="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">👥</span>
                                    New Member
                                </h3>
                                <form id="teamForm" class="space-y-6">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <input type="text" id="member_name" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="John Doe" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Role / Position</label>
                                        <input type="text" id="member_role" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="UI Designer" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Profile Photo</label>
                                        <div class="space-y-3">
                                            <input type="file" id="member_image" accept="image/*" class="w-full rounded-2xl px-4 py-3 text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold file:uppercase file:tracking-tighter">
                                            <div class="text-center text-[10px] text-slate-600 font-bold uppercase">or</div>
                                            <input type="text" id="member_image_url" placeholder="Paste Photo URL" class="w-full rounded-2xl px-5 py-4 text-sm">
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full btn-primary py-4 rounded-2xl font-bold text-sm text-white">Add to Team</button>
                                </form>
                            </div>
                        </div>
                        <div class="flex-grow">
                            <div class="glass p-10 rounded-[3rem]">
                                <h3 class="text-2xl font-bold text-white mb-10">Team Roster</h3>
                                <div id="teamList" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MESSAGES VIEW -->
                <div id="view-messages" class="hidden animate-in fade-in duration-500">
                    <div class="glass p-10 rounded-[3rem]">
                        <div class="flex justify-between items-center mb-10">
                            <h3 class="text-2xl font-bold text-white">Client Inquiries</h3>
                            <div class="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase text-blue-400 tracking-widest">
                                Inbox Real-time
                            </div>
                        </div>
                        <div id="messageList" class="space-y-6"></div>
                    </div>
                </div>
            </div>

            <!-- PROFILE MODAL -->
            <div id="profileModal" class="hidden fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-md" onclick="toggleProfileModal()"></div>
                <div class="glass max-w-sm w-full p-10 rounded-[3rem] relative animate-in zoom-in duration-300">
                    <div class="text-center mb-10">
                        <div id="modal-avatar" class="w-24 h-24 rounded-[2rem] border-4 border-white/5 mx-auto mb-6 flex items-center justify-center overflow-hidden bg-slate-800 shadow-2xl">
                            ${avatar_url ? '<img src="' + avatar_url + '" class="w-full h-full object-cover" />' : '<span class="text-3xl font-bold text-slate-600">' + username.charAt(0).toUpperCase() + '</span>'}
                        </div>
                        <h3 class="text-xl font-bold text-white">${username}</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">${avatar_url ? 'Foto Profil Aktif' : 'Foto Profil Masih Kosong'}</p>
                    </div>
                    <div class="space-y-4">
                        <label class="block">
                            <span class="btn-primary w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-3 cursor-pointer">
                                📷 Ubah Foto
                                <input type="file" id="avatarInput" accept="image/*" class="hidden" onchange="uploadAvatar(this)">
                            </span>
                        </label>
                        <button onclick="deleteAvatar()" class="w-full py-4 rounded-2xl font-bold text-sm text-red-500/80 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all">
                            🗑️ Hapus Foto
                        </button>
                    </div>
                </div>
            </div>

            <!-- REPLY MODAL -->
            <div id="replyModal" class="hidden fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-md" onclick="closeReplyModal()"></div>
                <div class="glass max-w-2xl w-full p-12 rounded-[3.5rem] relative animate-in zoom-in duration-300">
                    <h3 class="text-3xl font-bold text-white mb-2">Reply to Client</h3>
                    <p id="reply-to-email" class="text-xs text-slate-500 font-bold uppercase tracking-widest mb-10"></p>
                    
                    <div class="space-y-8">
                        <div class="p-6 bg-slate-900/40 rounded-3xl border border-white/5">
                            <div class="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">Original Message</div>
                            <p id="original-msg" class="text-sm text-slate-400 italic leading-relaxed"></p>
                        </div>
                        
                        <div class="space-y-3">
                            <textarea id="reply_content" rows="6" class="w-full rounded-3xl px-6 py-5 text-sm" placeholder="Type your professional reply here..."></textarea>
                        </div>

                        <input type="hidden" id="reply-msg-id">
                        
                        <div class="flex gap-4">
                            <button onclick="closeReplyModal()" class="flex-grow py-4 rounded-2xl font-bold text-sm text-slate-400 bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                            <button id="btn-send-reply" onclick="submitReply()" class="flex-[2] py-4 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">Send Reply to Gmail</button>
                        </div>
                    </div>
                </div>
            </div>

            ${fs.readFileSync(path.join(__dirname, 'views', 'modals', 'ReplySuccessModal.html'), 'utf8')}

            <script>
                // Clock
                setInterval(() => {
                    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString();
                }, 1000);

                // Tab Switcher
                function switchTab(tab) {
                    const views = ['unggulan', 'terbaru', 'packages', 'team', 'messages'];
                    views.forEach(v => {
                        const viewEl = document.getElementById('view-' + v);
                        const tabEl = document.getElementById('tab-' + v);
                        if (viewEl) viewEl.classList.add('hidden');
                        if (tabEl) {
                            tabEl.classList.remove('tab-active');
                            tabEl.classList.add('tab-inactive');
                        }
                    });
                    
                    const activeView = document.getElementById('view-' + tab);
                    const activeTab = document.getElementById('tab-' + tab);
                    if (activeView) activeView.classList.remove('hidden');
                    if (activeTab) {
                        activeTab.classList.remove('tab-inactive');
                        activeTab.classList.add('tab-active');
                    }
                }

                let currentFeatures = [];
                function addFeatureItem() {
                    const input = document.getElementById('feature_input');
                    const val = input.value.trim();
                    if(!val) return;
                    currentFeatures.push(val);
                    input.value = '';
                    renderFeatureList();
                }

                function removeFeatureItem(index) {
                    currentFeatures.splice(index, 1);
                    renderFeatureList();
                }

                function renderFeatureList() {
                    const list = document.getElementById('feature_list');
                    list.innerHTML = currentFeatures.map((f, i) => \`
                        <div class="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-xs group">
                            <span class="text-slate-300">\${f}</span>
                            <button type="button" onclick="removeFeatureItem(\${i})" class="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                    \`).join('');
                }

                function toggleProfileModal() {
                    const modal = document.getElementById('profileModal');
                    modal.classList.toggle('hidden');
                }

                async function uploadAvatar(input) {
                    if (!input.files || !input.files[0]) return;
                    const formData = new FormData();
                    formData.append('avatar', input.files[0]);
                    
                    try {
                        const res = await fetch('/api/auth/profile-pic', { method: 'POST', body: formData });
                        const data = await res.json();
                        location.reload(); // Reload to update all avatars and JWT session
                    } catch (e) { alert('Gagal mengunggah foto'); }
                }

                async function deleteAvatar() {
                    if(!confirm('Hapus foto profil?')) return;
                    try {
                        await fetch('/api/auth/profile-pic', { method: 'DELETE' });
                        location.reload();
                    } catch (e) { alert('Gagal menghapus foto'); }
                }

                function handleLogout() {
                    if(!confirm('Anda yakin ingin keluar?')) return;
                    fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => window.location.href = 'http://localhost:1001/gradasiweb/login');
                }

                // Data Handling
                async function fetchProjects() {
                    try {
                        const resF = await fetch('/api/projects/featured');
                        const dataF = await resF.json();
                        const resL = await fetch('/api/projects/latest');
                        const dataL = await resL.json();
                        
                        document.getElementById('stat-unggulan').innerText = dataF.length;
                        document.getElementById('stat-terbaru').innerText = dataL.length;
                        
                        const renderItem = (p, type) => \`
                            <div class="glass bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] group hover:border-blue-500/30 transition-all overflow-hidden relative">
                                <div class="relative h-44 rounded-[1.5rem] bg-slate-800 overflow-hidden mb-5">
                                    <img src="\${p.image_url || 'https://via.placeholder.com/600x400'}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                    <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-blue-400 border border-white/10">\${p.category}</div>
                                </div>
                                <h3 class="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">\${p.title}</h3>
                                <div class="flex justify-between items-center pt-4 border-t border-white/5">
                                    <button onclick="deleteProject(\${p.id}, '\${type}')" class="w-full py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                        Delete Project
                                    </button>
                                </div>
                            </div>
                        \`;

                        document.getElementById('featuredList').innerHTML = dataF.map(p => renderItem(p, 'featured')).join('') || '<div class="col-span-full py-10 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20">No featured projects</div>';
                        document.getElementById('latestList').innerHTML = dataL.map(p => renderItem(p, 'latest')).join('') || '<div class="col-span-full py-10 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20">No latest projects</div>';
                    } catch (e) { console.error(e); }
                }

                document.getElementById('unggulanForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('title', document.getElementById('u_title').value);
                    formData.append('category', document.getElementById('u_category').value);
                    formData.append('image_url', document.getElementById('u_image_url').value);
                    const file = document.getElementById('u_image').files[0];
                    if(file) formData.append('image', file);
                    await fetch('/api/projects/featured', { method: 'POST', body: formData });
                    e.target.reset(); fetchProjects();
                };

                document.getElementById('terbaruForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('title', document.getElementById('t_title').value);
                    formData.append('category', document.getElementById('t_category').value);
                    formData.append('image_url', document.getElementById('t_image_url').value);
                    const file = document.getElementById('t_image').files[0];
                    if(file) formData.append('image', file);
                    await fetch('/api/projects/latest', { method: 'POST', body: formData });
                    e.target.reset(); fetchProjects();
                };

                async function deleteProject(id, type) {
                    if(!confirm('Archive this project permanentely?')) return;
                    await fetch(\`/api/projects/\${type}/\${id}\`, { method: 'DELETE' });
                    fetchProjects();
                }

                async function fetchPackages() {
                    try {
                        const res = await fetch('/api/packages');
                        const data = await res.json();
                        document.getElementById('stat-packages').innerText = data.length;
                        document.getElementById('packageList').innerHTML = data.map(p => \`
                            <div class="glass bg-slate-900/30 \${p.recommended ? 'border-blue-500/30' : 'border-white/5'} p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 group">
                                <div class="flex-grow">
                                    <div class="flex items-center gap-4 mb-2">
                                        <h3 class="text-xl font-bold text-white">\${p.name}</h3>
                                        \${p.recommended ? '<span class="text-[9px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em]">Bestseller</span>' : ''}
                                    </div>
                                    <div class="text-2xl font-bold gradient-text mb-4">\${p.price}</div>
                                    <div class="text-slate-500 text-xs font-medium max-w-2xl leading-relaxed">\${p.features}</div>
                                </div>
                                <button onclick="deletePackage(\${p.id})" class="shrink-0 p-4 rounded-2xl bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white transition-all">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        \`).join('') || '<div class="py-20 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20">No active tiers</div>';
                    } catch (e) { console.error(e); }
                }

                document.getElementById('packageForm').onsubmit = async (e) => {
                    e.preventDefault();
                    if(currentFeatures.length === 0) return alert('Add at least one feature');
                    
                    const min = parseInt(document.getElementById('pkg_min_price').value);
                    const max = parseInt(document.getElementById('pkg_max_price').value);
                    const formattedPrice = \`Rp \${min.toLocaleString('id-ID')} - Rp \${max.toLocaleString('id-ID')}\`;

                    const body = {
                        name: document.getElementById('pkg_name').value,
                        price: formattedPrice,
                        features: currentFeatures.join(', '),
                        recommended: document.getElementById('pkg_recommended').checked
                    };
                    const res = await fetch('/api/packages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    
                    if(!res.ok) {
                        const err = await res.json();
                        alert('Gagal menyimpan: ' + (err.message || 'Error Unknown'));
                        return;
                    }

                    e.target.reset();
                    currentFeatures = [];
                    renderFeatureList();
                    fetchPackages();
                };

                async function deletePackage(id) {
                    if(!confirm('Remove this tier from production?')) return;
                    await fetch('/api/packages/' + id, { method: 'DELETE' });
                    fetchPackages();
                }

                async function fetchTeam() {
                    try {
                        const res = await fetch('/api/team');
                        const data = await res.json();
                        document.getElementById('stat-team').innerText = data.length;
                        document.getElementById('teamList').innerHTML = data.map(m => \`
                            <div class="glass bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-6 group">
                                <div class="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                    <img src="\${m.image || 'https://via.placeholder.com/200'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div class="flex-grow">
                                    <h4 class="font-bold text-white text-lg">\${m.name}</h4>
                                    <p class="text-emerald-400 text-xs font-bold uppercase tracking-widest">\${m.role}</p>
                                </div>
                                <button onclick="deleteMember(\${m.id})" class="p-3 rounded-xl bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        \`).join('') || '<div class="py-10 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20 italic">No members added</div>';
                    } catch (e) { console.error(e); }
                }

                document.getElementById('teamForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('name', document.getElementById('member_name').value);
                    formData.append('role', document.getElementById('member_role').value);
                    formData.append('image', document.getElementById('member_image_url').value);
                    const file = document.getElementById('member_image').files[0];
                    if(file) formData.append('image', file);

                    await fetch('/api/team', { method: 'POST', body: formData });
                    e.target.reset(); fetchTeam();
                };

                async function deleteMember(id) {
                    if(!confirm('Remove this member?')) return;
                    await fetch('/api/team/' + id, { method: 'DELETE' });
                    fetchTeam(); fetchMessages();
                }

                async function fetchMessages() {
                    try {
                        const res = await fetch('/api/messages');
                        const data = await res.json();
                        document.getElementById('stat-messages').innerText = data.length;
                        
                        const unread = data.filter(m => !m.is_read).length;
                        const navCount = document.getElementById('nav-msg-count');
                        if(unread > 0) {
                            navCount.innerText = unread;
                            navCount.classList.remove('hidden');
                        } else {
                            navCount.classList.add('hidden');
                        }

                        document.getElementById('messageList').innerHTML = data.map(m => \`
                            <div class="glass bg-slate-900/30 border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start gap-8 group">
                                <div class="flex-grow">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                            \${m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 class="font-bold text-white">\${m.name}</h4>
                                            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">\${m.email}</p>
                                        </div>
                                        \${m.reply_content ? '<span class="text-[8px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest ml-2">Replied</span>' : ''}
                                    </div>
                                    <div class="text-sm font-bold text-slate-300 mb-2">\${m.subject || 'No Subject'}</div>
                                    <p class="text-sm text-slate-500 leading-relaxed italic">"\${m.message}"</p>
                                    
                                    \${m.reply_content ? \`
                                        <div class="mt-6 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                            <div class="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Your Reply</div>
                                            <p class="text-xs text-slate-400">\${m.reply_content}</p>
                                        </div>
                                    \` : ''}
                                </div>
                                <div class="flex gap-3 shrink-0">
                                    \${!m.reply_content ? \`
                                        <button onclick="openReplyModal(\${m.id}, '\${m.email}', this.dataset.msg)" data-msg="\${m.message.replace(/"/g, '&quot;')}" class="px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:scale-105 transition-all">Reply via Email</button>
                                    \` : ''}
                                    <button onclick="deleteMessage(\${m.id})" class="p-3 rounded-xl bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white transition-all">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        \`).join('') || '<div class="py-20 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20">Your inbox is empty</div>';
                    } catch (e) { console.error(e); }
                }

                function openReplyModal(id, email, message) {
                    document.getElementById('reply-msg-id').value = id;
                    document.getElementById('reply-to-email').innerText = 'To: ' + email;
                    document.getElementById('original-msg').innerText = '"' + message + '"';
                    document.getElementById('replyModal').classList.remove('hidden');
                }

                function closeReplyModal() {
                    document.getElementById('replyModal').classList.add('hidden');
                    document.getElementById('reply_content').value = '';
                }

                async function submitReply() {
                    const id = document.getElementById('reply-msg-id').value;
                    const reply_content = document.getElementById('reply_content').value;
                    if(!reply_content) return alert('Reply content cannot be empty');
                    
                    const btn = document.getElementById('btn-send-reply');
                    btn.disabled = true;
                    btn.innerText = 'Sending to Gmail...';

                    try {
                        const res = await fetch(\`/api/messages/\${id}/reply\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reply_content })
                        });
                        const data = await res.json();
                        closeReplyModal();
                        if(data.warning) alert(data.warning);
                        else openReplySuccessModal();
                        fetchMessages();
                    } catch (e) {
                        alert('Error sending reply');
                    } finally {
                        btn.disabled = false;
                        btn.innerText = 'Send Reply to Gmail';
                    }
                }

                async function deleteMessage(id) {
                    if(!confirm('Delete this message?')) return;
                    await fetch('/api/messages/' + id, { method: 'DELETE' });
                    fetchMessages();
                }

                fetchProjects();
                fetchPackages();
                fetchTeam();
                fetchMessages();
            </script>
        </body>
        </html>
    `);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
