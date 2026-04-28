import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WAButton = () => {
  const phoneNumber = '6288983514206';
  const message = encodeURIComponent('Halo GRADASIWEB, saya tertarik untuk berkonsultasi mengenai jasa pembuatan website.');
  
  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl flex items-center gap-2"
    >
      <MessageCircle size={32} />
      <span className="hidden md:block font-bold">Chat WhatsApp</span>
    </motion.a>
  );
};

export default WAButton;
