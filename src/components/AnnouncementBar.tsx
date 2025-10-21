'use client';

import { Phone, Mail, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  const announcements = [
    {
      icon: <Phone className="w-4 h-4 text-pink-600" />,
      text: "📞 Contáctanos: +51 919 642 610",
    },
    {
      icon: <Mail className="w-4 h-4 text-pink-600" />,
      text: "✉️ floresydetalleslima1@gmail.com",
    },
    {
      icon: <Truck className="w-4 h-4 text-pink-600" />,
      text: "🚚 Envío GRATIS a Canto Rey y zonas aledañas",
    },
    {
      icon: null,
      text: "🕐 Horario: Lun - Dom 8:00 AM - 10:00 PM",
    },
    {
      icon: null,
      text: "🌹 Flores frescas diarias - Calidad garantizada",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-pink-200 via-pink-100 to-purple-200 text-gray-700 py-2 relative overflow-hidden shadow-sm">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{
          x: [0, -100 * announcements.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
        style={{
          width: `${200 * announcements.length}%`,
        }}
      >
        {[...announcements, ...announcements].map((announcement, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm font-medium px-4"
          >
            {announcement.icon}
            <span>{announcement.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Bordes suaves tipo “fade” */}
      <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-pink-200 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-purple-200 to-transparent pointer-events-none" />
    </div>
  );
}