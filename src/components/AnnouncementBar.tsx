'use client';

import { Phone, Mail, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  const announcements = [
    {
      icon: <Phone className="w-4 h-4" />,
      text: " Contáctanos: +51 919 642 610"
    },
    {
      icon: <Mail className="w-4 h-4" />,
      text: "✉️ floresydetalleslima1@gmail.com"
    },
    {
      icon: <Truck className="w-4 h-4" />,
      text: " Envío GRATIS a Canto Rey y zonas aledañas"
    },
    {
      icon: null,
      text: " Horario: Lun - Dom 8:00 AM - 10:00 PM"
    },
    {
      icon: null,
      text: " Flores frescas diarias - Calidad garantizada"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-pink-bright to-pink-light text-white py-2 relative overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: [0, -100 * announcements.length]
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
        style={{
          width: `${200 * announcements.length}%`
        }}
      >
        
        {[...announcements, ...announcements, ...announcements].map((announcement, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 text-sm font-medium px-4"
          >
            {announcement.icon}
            <span>{announcement.text}</span>
          </div>
        ))}
      </motion.div>
      
     
      <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-pink-bright to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-pink-light to-transparent pointer-events-none" />
    </div>
  );
}
