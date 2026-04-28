import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WAButton from './components/WAButton';

// Pages
import Home from './pages/Home';
import VisiMisi from './pages/VisiMisi';
import TimKami from './pages/TimKami';
import Kontak from './pages/Kontak';
import ProyekTerbaru from './pages/ProyekTerbaru';

function App() {
  return (
    <ThemeProvider>
      <Router basename="/gradasiweb">
        <div className="min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/visi-misi" element={<VisiMisi />} />
              <Route path="/tim-kami" element={<TimKami />} />
              <Route path="/kontak" element={<Kontak />} />
              <Route path="/proyek-terbaru" element={<ProyekTerbaru />} />
            </Routes>
          </main>
          <Footer />
          <WAButton />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

