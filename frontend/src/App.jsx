import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Login from './pages/auth/login/Login';
import Register from './pages/auth/register/Register';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen">
      {!isAuthPage && <Navbar />}
      <main>{children}</main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <WAButton />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router basename="/gradasiweb">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visi-misi" element={<VisiMisi />} />
            <Route path="/tim-kami" element={<TimKami />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/proyek-terbaru" element={<ProyekTerbaru />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;

