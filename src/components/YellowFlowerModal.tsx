'use client';

import { useState } from 'react';
import { X, Heart, ShoppingCart, Star, Sun, Sparkles, Tag as PriceTag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import ImageWithLoader from '@/components/ImageWithLoader';

interface YellowFlowerProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  color: string;
  occasion: string;
  rating?: number;
  reviews?: number;
  description?: string;
  short_description?: string;
  discount?: number;
  stock?: number;
  is_active?: boolean;
}

interface YellowFlowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: YellowFlowerProduct | null;
}

export default function YellowFlowerModal({ isOpen, onClose, product }: YellowFlowerModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { showCartNotification } = useNotification();

  if (!product) return null;

  const isActive = product.is_active ?? true;
  const productStock = product.stock ?? 0;
  const discount = product.discount ?? 0;
  const rating = product.rating ?? 5;
  const reviews = product.reviews ?? 0;

  const handleAddToCart = async () => {
    if (!isActive || productStock === 0) return;
    
    setIsAddingToCart(true);
    
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        color: product.color,
        description: product.description || '',
        rating: rating,
        reviews: reviews
      });
      
      // Mostrar notificación de éxito sin cerrar el modal
      showCartNotification(product.name);
      
      // Pequeña pausa para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Aquí puedes agregar lógica para persistir favoritos
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con tema amarillo */}
            <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-orange-500/20"></div>
              
              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Badge 2025 */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Edición 2025
                </div>
              </div>

              {/* Título */}
              <div className="relative z-10 text-center mt-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Sun className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Flores Amarillas 2025</h2>
                <p className="text-white/90 text-sm">Alegría y prosperidad para el nuevo año</p>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Imagen */}
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg relative">
                    <ImageWithLoader
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                        -{discount}%
                      </div>
                    )}
                    {/* Badge "Nuevo 2025" */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                      ¡Nuevo!
                    </div>
                  </div>
                </div>

                {/* Información del producto */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        {product.category}
                      </span>
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {product.color}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({reviews} reseñas)</span>
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        S/ {product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-lg text-gray-500 line-through">
                          S/ {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <PriceTag className="w-4 h-4" />
                        <span className="font-medium">¡Ahorra S/ {((product.originalPrice || 0) - product.price).toFixed(2)}!</span>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description || product.short_description || 
                       `Hermoso arreglo floral amarillo de ${product.category} perfecto para iluminar el 2025 con alegría y positividad.`}
                    </p>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      Significado de las flores amarillas
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Simbolizan alegría y felicidad</li>
                      <li>• Atraen prosperidad y nuevos comienzos</li>
                      <li>• Perfectas para el Año Nuevo 2025</li>
                      <li>• Ideales para expresar amistad sincera</li>
                    </ul>
                  </div>

                  {/* Ocasión */}
                  <div>
                    <span className="text-sm text-gray-500">Perfecta para: </span>
                    <span className="text-sm font-medium text-gray-700">{product.occasion}</span>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${productStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {productStock > 0 ? `${productStock} disponibles` : 'Agotado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleFavoriteToggle}
                  className={`flex-shrink-0 p-3 rounded-full border-2 transition-all duration-200 ${
                    isFavorite
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={!isActive || productStock === 0 || isAddingToCart}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
                    !isActive || productStock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isAddingToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sun className="w-6 h-6" />
                      </motion.div>
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      {!isActive || productStock === 0 ? 'No disponible' : 'Agregar al carrito'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
