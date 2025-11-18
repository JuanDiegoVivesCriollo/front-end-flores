'use client';

import { useState } from 'react';
import { X, Heart, ShoppingCart, Star, Badge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import ImageWithLoader from '@/components/ImageWithLoader';

interface SpecialOfferProduct {
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

interface SpecialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SpecialOfferProduct | null;
}

export default function SpecialOfferModal({ isOpen, onClose, product }: SpecialOfferModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { showCartNotification } = useNotification();

  if (!product) return null;

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
        color: product.color || 'Variado',
        occasion: product.occasion || 'Cualquier ocasión',
        description: product.description || `Hermoso arreglo de ${product.name}`,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        originalPrice: product.originalPrice || product.price,
        discount: product.discount || 0,
        type: 'flower'
      });
      
      // Mostrar notificación de éxito sin cerrar el modal
      showCartNotification(product.name);
      
      // Pequeña pausa para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const discountPercentage = product.discount || 0;
  const hasDiscount = discountPercentage > 0;
  const productStock = product.stock || 0;
  const isActive = product.is_active !== false; // Default to true if undefined

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-[9000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con botón cerrar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <Badge className="w-5 h-5 text-pink-500" />
                <span className="text-lg font-semibold text-gray-900">Oferta Especial</span>
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Imagen del producto - MISMO TAMAÑO QUE CATÁLOGO NORMAL */}
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group">
                    <ImageWithLoader
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={true}
                    />
                    
                    {/* Badge de oferta especial */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ¡OFERTA!
                      </div>
                    </div>

                    {/* Botón favorito */}
                    <button
                      onClick={toggleFavorite}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Overlay de descuento */}
                    {hasDiscount && (
                      <div className="absolute bottom-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        -{discountPercentage}%
                      </div>
                    )}
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600">Categoría:</span>
                      <p className="font-medium text-gray-900">{product.category}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600">Color:</span>
                      <p className="font-medium text-gray-900">{product.color}</p>
                    </div>
                  </div>
                </div>

                {/* Información del producto */}
                <div className="space-y-6">
                  {/* Título y rating */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h2>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (product.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.reviews || 0} reseñas)
                      </span>
                    </div>
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-pink-600">
                        S/. {product.price.toFixed(2)}
                      </span>
                      {hasDiscount && product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          S/. {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-green-600 font-medium">
                        ¡Ahorras S/. {((product.originalPrice || product.price) - product.price).toFixed(2)}!
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-3">
                    {product.short_description && (
                      <p className="text-gray-600 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                    
                    {product.description && product.description !== product.short_description && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">Descripción completa:</h4>
                        <div className="text-gray-600 leading-relaxed text-sm">
                          {(() => {
                            const description = product.description;
                            
                            // Verificar si la descripción tiene formato de puntos
                            const lines = description.split('\n').filter(line => line.trim());
                            const hasListFormat = lines.some(line => 
                              line.trim().startsWith('-') || 
                              line.trim().startsWith('•') || 
                              line.trim().startsWith('*')
                            );

                            if (hasListFormat) {
                              return (
                                <ul className="space-y-2">
                                  {lines.map((line, index) => {
                                    const trimmedLine = line.trim();
                                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
                                      // Remover el marcador y mostrar como punto de lista
                                      const content = trimmedLine.substring(1).trim();
                                      return (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                          <span>{content}</span>
                                        </li>
                                      );
                                    } else if (trimmedLine) {
                                      // Línea sin marcador, mostrar como punto también
                                      return (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                                          <span>{trimmedLine}</span>
                                        </li>
                                      );
                                    }
                                    return null;
                                  })}
                                </ul>
                              );
                            } else {
                              // Mostrar como párrafo normal si no tiene formato de lista
                              return <p>{description}</p>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-700 font-medium">
                        {productStock > 0 
                          ? `${productStock} disponibles` 
                          : 'Disponible'
                        }
                      </span>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      ¡Oferta por tiempo limitado!
                    </p>
                  </div>

                  {/* Ocasión */}
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-900 mb-2">Perfecto para:</h4>
                    <p className="text-pink-700">{product.occasion}</p>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || !isActive || productStock === 0}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                        isAddingToCart || !isActive || productStock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Agregando...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {!isActive || productStock === 0 
                            ? 'No disponible' 
                            : 'Agregar al carrito'
                          }
                        </>
                      )}
                    </button>

                    <button
                      onClick={toggleFavorite}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-pink-300 text-pink-600 rounded-xl font-medium hover:bg-pink-50 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite ? 'fill-pink-500' : ''
                        }`}
                      />
                      {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
