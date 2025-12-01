'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, ArrowUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FloatingCartButton() {
  const { getItemCount, openCart, getSubtotal } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  // Show button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-show preview when items are added
  useEffect(() => {
    if (itemCount > 0) {
      setShowPreview(true);
      const timer = setTimeout(() => setShowPreview(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  if (!isVisible || itemCount === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 md:hidden">
      {/* Preview Tooltip */}
      {showPreview && (
        <div className="absolute bottom-full right-0 mb-2 animate-slide-up">
          <div className="bg-white rounded-xl shadow-lg p-3 border border-gray-100 min-w-[180px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </span>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            <div className="font-bold text-primary-600">
              S/ {subtotal.toFixed(2)}
            </div>
          </div>
          <div className="w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45 absolute -bottom-1.5 right-6" />
        </div>
      )}

      {/* Cart Button */}
      <button
        onClick={openCart}
        className="relative w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all hover:scale-105 flex items-center justify-center"
      >
        <ShoppingCart className="w-6 h-6" />
        
        {/* Badge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-primary-600 text-xs font-bold rounded-full flex items-center justify-center border-2 border-primary-500">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      </button>
    </div>
  );
}

// Scroll to top button component (optional, can be combined)
export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center border border-gray-200"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
