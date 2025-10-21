'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 py-20 px-6 md:px-20 flex flex-col-reverse md:flex-row items-center justify-between overflow-hidden">
      {/* Texto principal */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 text-center md:text-left z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-rose-600 leading-tight mb-4">
          Flores que hablan <br />
          <span className="text-rose-400">por ti</span>
        </h1>

        <p className="text-gray-700 text-lg mb-6 max-w-md mx-auto md:mx-0">
          Descubre arreglos florales únicos y hechos con amor.  
          Enviamos felicidad a cada rincón de Lima 🌸
        </p>

        <div className="flex justify-center md:justify-start gap-4">
          <a
            href="/flores"
            className="bg-rose-400 text-white px-6 py-3 rounded-full shadow-md hover:bg-rose-500 transition-all"
          >
            Ver Catálogo
          </a>
          <a
            href="/contacto"
            className="border border-rose-400 text-rose-500 px-6 py-3 rounded-full hover:bg-rose-100 transition-all"
          >
            Contáctanos
          </a>
        </div>
      </motion.div>

      {/* Imagen ilustrativa */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 flex justify-center mb-10 md:mb-0"
      >
        <div className="relative w-72 h-72 md:w-96 md:h-96">
          <Image
            src="/flowers-illustration.png" // Puedes reemplazar por una imagen real o ilustración pastel
            alt="Flores decorativas"
            fill
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
      </motion.div>

      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-rose-300/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl -z-10" />
    </section>
  );
}
