const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gradasiweb',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Mock Data Fallback
let mockProjects = [
  { id: 1, title: 'Company Profile', description: 'Modern company profile website for a law firm.', image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', link: '#', category: 'Web Development' },
  { id: 2, title: 'E-Commerce App', description: 'Full-featured online store with payment integration.', image_url: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80', link: '#', category: 'Mobile App' },
  { id: 3, title: 'Landing Page', description: 'High-converting landing page for a SaaS product.', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', link: '#', category: 'UI/UX Design' }
];

let mockPackages = [
  { id: 1, name: 'Lite Showcase', price: 'Rp 300rb', features: 'Single Landing Page, Desain Modern, Responsive Mobile, Integrasi WhatsApp, Hosting Gratis, Revisi 1x', recommended: false },
  { id: 2, name: 'Business Pro', price: 'Rp 1jt', features: 'Hingga 5 Halaman, Custom Domain .com, Email Bisnis, SEO Optimized, Panel Admin Lite, Support 3 Bulan', recommended: true },
  { id: 3, name: 'Elite Enterprise', price: 'Rp 5-10jt', features: 'Sistem Kustom (E-Commerce/ERP), High-Speed Hosting, Keamanan SSL Premium, Maintenance 6 Bulan, Full Source Code, Konsultasi Gratis', recommended: false }
];

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockProjects);
  }
});

app.post('/api/projects', upload.single('image'), async (req, res) => {
  const { title, description, link, category } = req.body;
  const image_url = req.file ? `http://localhost:${port}/uploads/${req.file.filename}` : req.body.image_url || '';
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, image_url, link, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, image_url, link, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newProj = { id: Date.now(), title, description, image_url, link, category };
    mockProjects.push(newProj);
    res.status(201).json(newProj);
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    mockProjects = mockProjects.filter(p => p.id != id);
    res.status(204).send();
  }
});

// Packages API
app.get('/api/packages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.json(mockPackages);
  }
});

app.post('/api/packages', async (req, res) => {
  const { name, price, features, recommended } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO packages (name, price, features, recommended) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, features, recommended]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    const newPkg = { id: Date.now(), name, price, features, recommended };
    mockPackages.push(newPkg);
    res.status(201).json(newPkg);
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM packages WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    mockPackages = mockPackages.filter(p => p.id != id);
    res.status(204).send();
  }
});

// Serve Admin UI
app.get('/admin', (req, res) => {
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
                        <button onclick="switchTab('projects')" id="tab-projects" class="pb-1 transition-all tab-active hover:text-blue-300">Projects</button>
                        <button onclick="switchTab('packages')" id="tab-packages" class="pb-1 transition-all tab-inactive hover:text-blue-300">Packages</button>
                        <a href="http://localhost:1001/gradasiweb/" target="_blank" class="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                            View Site <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>

                    <div class="flex items-center gap-5">
                        <div class="flex flex-col items-end hidden sm:flex">
                            <span class="text-xs font-bold text-white">Mufacode</span>
                            <span class="text-[10px] text-blue-400 font-medium">Verified Admin</span>
                        </div>
                        <div class="relative">
                            <img src="https://github.com/muhfahmm.png" class="w-10 h-10 rounded-2xl border-2 border-blue-500/30 shadow-lg shadow-blue-500/10" />
                            <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#020617]"></div>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="max-w-7xl mx-auto px-8">
                <!-- Overview Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-blue-500/20 transition-all group">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Live Projects</div>
                        <div class="text-4xl font-bold gradient-text" id="stat-projects">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 hover:border-purple-500/20 transition-all">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Service Tiers</div>
                        <div class="text-4xl font-bold text-white" id="stat-packages">0</div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5 bg-blue-500/5">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Server Status</div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <span class="text-sm font-bold text-green-400 uppercase tracking-widest">Operational</span>
                        </div>
                    </div>
                    <div class="glass p-7 rounded-[2.5rem] border-white/5">
                        <div class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">System Time</div>
                        <div class="text-sm font-bold text-slate-300 uppercase tracking-widest" id="live-clock">00:00:00</div>
                    </div>
                </div>

                <!-- PROJECT VIEW -->
                <div id="view-projects" class="animate-in fade-in duration-500">
                    <div class="flex flex-col xl:flex-row gap-10">
                        <!-- Form Side -->
                        <div class="xl:w-[400px] shrink-0">
                            <div class="glass p-8 rounded-[3rem] sticky top-32">
                                <h3 class="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">+</span>
                                    New Showcase
                                </h3>
                                <form id="projectForm" class="space-y-6">
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                                        <input type="text" id="proj_title" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Modern E-Commerce" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                        <input type="text" id="proj_category" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="Web Development" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Visual Media</label>
                                        <div class="space-y-3">
                                            <input type="file" id="proj_image" accept="image/*" class="w-full rounded-2xl px-4 py-3 text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-bold file:uppercase file:tracking-tighter">
                                            <div class="text-center text-[10px] text-slate-600 font-bold uppercase">or</div>
                                            <input type="text" id="proj_image_url" placeholder="Paste Image URL" class="w-full rounded-2xl px-5 py-4 text-sm">
                                        </div>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Live Link</label>
                                        <input type="text" id="proj_link" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="https://...">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Summary</label>
                                        <textarea id="proj_description" rows="3" class="w-full rounded-2xl px-5 py-4 text-sm resize-none" placeholder="Explain the project impact..." required></textarea>
                                    </div>
                                    <button type="submit" class="w-full btn-primary py-4 rounded-2xl font-bold text-sm text-white shadow-xl">Deploy Project</button>
                                </form>
                            </div>
                        </div>
                        
                        <!-- List Side -->
                        <div class="flex-grow">
                            <div class="glass p-10 rounded-[3rem]">
                                <div class="flex justify-between items-center mb-10">
                                    <h3 class="text-2xl font-bold text-white">Active Portfolio</h3>
                                    <div class="text-xs text-slate-500 font-medium">Sorted by: Newest First</div>
                                </div>
                                <div id="projectList" class="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
                            </div>
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
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price Label</label>
                                        <input type="text" id="pkg_price" class="w-full rounded-2xl px-5 py-4 text-sm" placeholder="e.g. Rp 10jt+" required>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Core Features (CSV)</label>
                                        <textarea id="pkg_features" rows="4" class="w-full rounded-2xl px-5 py-4 text-sm resize-none" placeholder="Feature A, Feature B, Feature C..." required></textarea>
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
            </div>

            <script>
                // Clock
                setInterval(() => {
                    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString();
                }, 1000);

                // Tab Switcher
                function switchTab(tab) {
                    const projects = document.getElementById('view-projects');
                    const packages = document.getElementById('view-packages');
                    const tabP = document.getElementById('tab-projects');
                    const tabPkg = document.getElementById('tab-packages');

                    if (tab === 'projects') {
                        projects.classList.remove('hidden');
                        packages.classList.add('hidden');
                        tabP.className = 'pb-1 transition-all tab-active';
                        tabPkg.className = 'pb-1 transition-all tab-inactive';
                    } else {
                        projects.classList.add('hidden');
                        packages.classList.remove('hidden');
                        tabP.className = 'pb-1 transition-all tab-inactive';
                        tabPkg.className = 'pb-1 transition-all tab-active';
                    }
                }

                // Data Handling
                async function fetchProjects() {
                    try {
                        const res = await fetch('/api/projects');
                        const data = await res.json();
                        document.getElementById('stat-projects').innerText = data.length;
                        document.getElementById('projectList').innerHTML = data.map(p => \`
                            <div class="glass bg-slate-900/30 border border-white/5 p-6 rounded-[2.5rem] group hover:border-blue-500/30 transition-all overflow-hidden relative">
                                <div class="relative h-44 rounded-[1.5rem] bg-slate-800 overflow-hidden mb-5">
                                    <img src="\${p.image_url || 'https://via.placeholder.com/600x400'}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                    <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-blue-400 border border-white/10">\${p.category}</div>
                                </div>
                                <h3 class="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">\${p.title}</h3>
                                <p class="text-slate-500 text-xs line-clamp-2 mb-6 leading-relaxed font-medium">\${p.description}</p>
                                <div class="flex justify-between items-center pt-4 border-t border-white/5">
                                    <a href="\${p.link}" target="_blank" class="text-[9px] font-extrabold text-blue-500 hover:text-white transition-colors tracking-widest uppercase">Live Demo ↗</a>
                                    <button onclick="deleteProject(\${p.id})" class="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                        \`).join('') || '<div class="col-span-full py-20 text-center text-slate-600 font-bold uppercase tracking-widest italic opacity-20">Archive Empty</div>';
                    } catch (e) { console.error(e); }
                }

                document.getElementById('projectForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = new FormData();
                    formData.append('title', document.getElementById('proj_title').value);
                    formData.append('category', document.getElementById('proj_category').value);
                    formData.append('description', document.getElementById('proj_description').value);
                    formData.append('link', document.getElementById('proj_link').value);
                    formData.append('image_url', document.getElementById('proj_image_url').value);
                    const file = document.getElementById('proj_image').files[0];
                    if(file) formData.append('image', file);

                    await fetch('/api/projects', { method: 'POST', body: formData });
                    e.target.reset(); fetchProjects();
                };

                async function deleteProject(id) {
                    if(!confirm('Archive this project permanentely?')) return;
                    await fetch('/api/projects/' + id, { method: 'DELETE' });
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
                    const body = {
                        name: document.getElementById('pkg_name').value,
                        price: document.getElementById('pkg_price').value,
                        features: document.getElementById('pkg_features').value,
                        recommended: document.getElementById('pkg_recommended').checked
                    };
                    await fetch('/api/packages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    e.target.reset(); fetchPackages();
                };

                async function deletePackage(id) {
                    if(!confirm('Remove this tier from production?')) return;
                    await fetch('/api/packages/' + id, { method: 'DELETE' });
                    fetchPackages();
                }

                // Initial Load
                fetchProjects();
                fetchPackages();
            </script>
        </body>
        </html>
    `);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
