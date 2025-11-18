'use client';

import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function FloatingCartButton() {
  const { itemCount, toggleCart } = useCart();

  // Mostrar el botón flotante solo en móvil y cuando hay items en el carrito
  const shouldShow = itemCount > 0;

  const handleCartToggle = () => {
    toggleCart();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          className="fixed bottom-24 right-6 z-[9998]" // Z-index alto pero menor que notificaciones
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCartToggle}
            className="relative bg-pink-bright hover:bg-pink-dark text-white p-4 rounded-full shadow-lg transition-all duration-300"
          >
            <ShoppingCart className="w-6 h-6" />
            
            {/* Badge con el número de items */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-green-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
            >
              {itemCount}
            </motion.div>

            {/* Efecto de pulso cuando se agregan items */}
            <motion.div
              className="absolute inset-0 bg-pink-bright rounded-full"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
