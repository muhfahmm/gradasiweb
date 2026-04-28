import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Packages from './components/Packages';
import Footer from './components/Footer';
import WAButton from './components/WAButton';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <Packages />
        </main>
        <Footer />
        <WAButton />
      </div>
    </ThemeProvider>
  );
}

export default App;
