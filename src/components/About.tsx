'use client';

import { Flower2, Heart, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="bg-rose-50 py-16 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-12">
      {/* Imagen o ilustración (puedes cambiar por una imagen real luego) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex justify-center"
      >
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center w-72 h-72 justify-center border border-rose-100">
          <Flower2 className="text-rose-400 w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold text-rose-500">Flores & Detalles</h3>
          <p className="text-gray-600 text-center mt-2 text-sm">
            Donde cada flor cuenta una historia, y cada detalle florece con amor.
          </p>
        </div>
      </motion.div>

      {/* Texto descriptivo */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex-1 text-center md:text-left"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-rose-500 mb-4">
          Sobre Nosotros
        </h2>
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
          En <span className="text-rose-400 font-medium">Flores & Detalles</span> creemos que 
          regalar flores es una forma de expresar sentimientos únicos. 
          Nuestra misión es llenar de color, aroma y emoción cada momento especial de tu vida.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="flex flex-col items-center text-center">
            <Heart className="w-10 h-10 text-rose-400 mb-2" />
            <h4 className="font-semibold text-gray-700">Amor en Cada Detalle</h4>
            <p className="text-sm text-gray-600 mt-1">
              Cuidamos cada arreglo con dedicación y cariño.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Leaf className="w-10 h-10 text-green-400 mb-2" />
            <h4 className="font-semibold text-gray-700">Flores Frescas</h4>
            <p className="text-sm text-gray-600 mt-1">
              Seleccionamos solo flores frescas y de alta calidad.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Flower2 className="w-10 h-10 text-pink-400 mb-2" />
            <h4 className="font-semibold text-gray-700">Diseños Únicos</h4>
            <p className="text-sm text-gray-600 mt-1">
              Arreglos originales que reflejan cada emoción.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
