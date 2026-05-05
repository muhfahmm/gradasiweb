import { Github, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass mt-20 pt-16 pb-8" style={{ borderRadius: '40px 40px 0 0' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold gradient-text">GRADASIWEB</div>
            <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
              Solusi digital terpercaya untuk membangun identitas bisnis Anda secara profesional dan inovatif.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/mufacode/" target="_blank" rel="noopener noreferrer" className="p-2.5 glass rounded-xl hover:text-accent-primary hover:scale-110 transition-all duration-300 text-xl flex items-center justify-center w-11 h-11">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://www.tiktok.com/@mufacode" target="_blank" rel="noopener noreferrer" className="p-2.5 glass rounded-xl hover:text-accent-primary hover:scale-110 transition-all duration-300 text-xl flex items-center justify-center w-11 h-11">
                <i className="bi bi-tiktok"></i>
              </a>
              <a href="https://github.com/muhfahmm" target="_blank" rel="noopener noreferrer" className="p-2.5 glass rounded-xl hover:text-accent-primary hover:scale-110 transition-all duration-300">
                <Github size={20} />
              </a>
            </div>
          </div>



          {/* Services */}
          <div>
            <h4 className="font-bold mb-6">Layanan</h4>
            <ul className="space-y-3 text-secondary text-sm">
              <li><a href="#" className="hover:text-accent-primary transition-colors">Landing Page</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors">Company Profile</a></li>
              <li><a href="#" className="hover:text-accent-primary transition-colors">E-Commerce</a></li>

            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-secondary text-sm">
              <li className="flex gap-3"><Mail size={18} className="text-accent-primary" /> gradasiweb@gmail.com</li>
              <li className="flex gap-3"><Phone size={18} className="text-accent-primary" /> +62 889 8351 4206</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-glass-border pt-8 text-center text-secondary text-xs">
          <p>© {new Date().getFullYear()} GRADASIWEB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
