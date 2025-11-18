'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export default function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
        >
          <div className="text-center">
            {/* Logo estático */}
            <div className="mb-8">
              <Image
                src="/img/logojazmin2.webp"
                alt="Flores y Detalles Lima"
                width={180}
                height={90}
                className="object-contain mx-auto"
                priority
              />
            </div>

            {/* Spinner minimalista */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 border-3 border-pink-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-pink-bright border-t-transparent rounded-full"></div>
            </motion.div>

            {/* Texto de carga */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="space-y-3"
            >
              <p className="text-xl font-medium text-gray-700">Cargando Flores y Detalles Lima</p>
              <p className="text-sm text-gray-500">Preparando las mejores flores para ti</p>
            </motion.div>

            {/* Puntos de carga minimalistas */}
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 rounded-full bg-pink-bright"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
