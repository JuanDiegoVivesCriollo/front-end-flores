'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Heart,
  Shield,
  CreditCard,
  ArrowRight,
  Tag,
  MapPin,
  Gift
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart, type CartItem } from '@/context/CartContext';
import ComplementSelector from './ComplementSelector';

export default function ShoppingCartSidebar() {
  const { items, total, itemCount, isOpen, removeFromCart, updateQuantity, toggleCart } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const [showComplementSelector, setShowComplementSelector] = useState(false);

  const hasFlowers = items.some(item => item.type !== 'complement');
  const hasComplements = items.some(item => item.type === 'complement');

  const handleCheckout = () => {
    // No proceder si aún se está cargando el estado de autenticación
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      // Usuario autenticado - ir directo al checkout
      toggleCart();
      window.location.href = '/checkout';
    } else {
      // Usuario no autenticado - guardar carrito y ir al login
      localStorage.setItem('checkout-pending', 'true');
      localStorage.setItem('checkout-cart', JSON.stringify(items));
      localStorage.setItem('checkout-total', total.toString());
      
      toggleCart();
      window.location.href = '/login?redirect=checkout';
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={toggleCart}
          />
        )}
      </AnimatePresence>

      {/* Sidebar del carrito */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] md:w-[650px] lg:w-[750px] xl:w-[800px] sm:max-w-none bg-white z-[70] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-pink-bright to-pink-dark p-4 sm:p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-lg sm:text-xl font-bold">Mi Carrito</h2>
                </div>
                <button
                  onClick={toggleCart}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
                <span className="text-pink-light">
                  Subtotal: S/. {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Contenido del carrito - Scrollable */}
            <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
              {items.length === 0 ? (
                // Carrito vacío
                <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    ¡Agrega algunas flores hermosas a tu carrito!
                  </p>
                  <button
                    onClick={toggleCart}
                    className="bg-pink-bright text-white px-6 py-3 rounded-full hover:bg-pink-dark transition-colors text-sm"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                // Layout con scroll unificado
                <div className="flex-1 overflow-y-auto">
                  {/* Layout responsivo: Una columna en móvil, dos columnas en tablets/laptops */}
                  <div className="flex flex-col md:flex-row">
                    {/* Columna izquierda: Items del carrito */}
                    <div className="flex-1 md:flex-[2] p-3 sm:p-4 space-y-3 sm:space-y-4 md:border-r md:border-gray-200">
                      <div className="md:pr-4 space-y-3 sm:space-y-4">
                        {items.map((item: CartItem) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm"
                          >
                            <div className="flex gap-3 md:gap-4">
                              {/* Imagen del producto */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-light to-pink-bright rounded-lg flex items-center justify-center flex-shrink-0">
                                {item.image && item.image !== '' ? (
                                  <Image 
                                    src={item.image} 
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="object-contain opacity-80"
                                  />
                                ) : (
                                  <div className="text-white text-lg sm:text-xl font-bold">
                                    {item.name.charAt(0)}
                                  </div>
                                )}
                              </div>

                              {/* Información del producto */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-1 truncate">
                                  {item.name}
                                </h4>
                                
                                {item.description && (
                                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-tight md:text-sm">
                                    {item.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-pink-bright text-sm md:text-base">
                                    S/. {item.price}
                                  </span>
                                  
                                  {/* Controles de cantidad */}
                                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:text-pink-bright rounded-md hover:bg-white transition-colors"
                                    >
                                      <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium md:text-base">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:text-pink-bright rounded-md hover:bg-white transition-colors"
                                    >
                                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Eliminar
                                  </button>
                                  <button className="flex items-center gap-1 text-gray-500 hover:text-pink-bright text-xs transition-colors">
                                    <Heart className="w-3 h-3" />
                                    Guardar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Columna derecha: Beneficios y Complementos */}
                    <div className="md:flex-[1] md:max-w-[320px] p-3 sm:p-4 md:pl-4 space-y-3 sm:space-y-4 bg-gray-50 md:bg-white">
                      {/* Beneficios */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center gap-2 text-green-800 mb-2 sm:mb-3">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-semibold">Beneficios incluidos</span>
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700">
                            <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                            <span>Garantía de frescura</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700">
                            <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                            <span>Atención personalizada</span>
                          </div>
                        </div>
                      </div>

                      {/* Complementos Section - Solo mostrar si hay flores en el carrito */}
                      {hasFlowers && (
                        <div>
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
                              <span className="text-xs sm:text-sm">Haz tu regalo especial</span>
                            </h4>
                            <button
                              onClick={() => setShowComplementSelector(true)}
                              className="text-pink-600 hover:text-pink-700 text-xs sm:text-sm font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pink-50"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Agregar</span>
                              <span className="xs:hidden">+</span>
                            </button>
                          </div>

                          {/* Mostrar complementos añadidos */}
                          {hasComplements && (
                            <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                              {items
                                .filter(item => item.type === 'complement')
                                .map((complement) => (
                                  <div
                                    key={complement.id}
                                    className="flex items-center gap-2 sm:gap-3 p-2 bg-pink-50 border border-pink-200 rounded-lg"
                                  >
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                      {complement.image && complement.image !== '' ? (
                                        <Image 
                                          src={complement.image} 
                                          alt={complement.name}
                                          width={16}
                                          height={16}
                                          className="object-contain sm:w-[24px] sm:h-[24px]"
                                        />
                                      ) : (
                                        <span className="text-pink-600 text-sm sm:text-lg">
                                          {complement.complementType === 'globos' ? '🎈' : 
                                           complement.complementType === 'peluches' ? '🧸' : 
                                           complement.complementType === 'chocolates' ? '🍫' : '🎁'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-xs sm:text-sm font-medium text-gray-800 truncate">{complement.name}</h5>
                                      <p className="text-[10px] sm:text-xs text-pink-600">S/. {complement.price}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                      <button
                                        onClick={() => updateQuantity(complement.id, Math.max(1, complement.quantity - 1))}
                                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-pink-500 hover:bg-pink-100 rounded"
                                      >
                                        <Minus className="w-2 h-2" />
                                      </button>
                                      <span className="w-4 sm:w-6 text-center text-[10px] sm:text-xs font-medium">{complement.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(complement.id, complement.quantity + 1)}
                                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-pink-500 hover:bg-pink-100 rounded"
                                      >
                                        <Plus className="w-2 h-2" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-2 sm:p-3">
                            <p className="text-xs sm:text-sm text-pink-800 font-medium mb-0.5 sm:mb-1">
                              💝 Complementa tu regalo
                            </p>
                            <p className="text-[10px] sm:text-xs text-pink-600">
                              Globos, peluches y chocolates disponibles
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer - Resumen y checkout (inmediatamente después del contenido) */}
                  <div className="mt-4 p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
                    {/* Cupón de descuento */}
                    <div className="mb-3 sm:mb-4">
                      <button className="w-full flex items-center justify-between p-2 sm:p-3 border border-dashed border-pink-bright rounded-lg text-pink-bright hover:bg-pink-light/20 transition-colors">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">¿Tienes un cupón?</span>
                        </div>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* Resumen de precios */}
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Subtotal ({itemCount} productos)</span>
                        <span>S/. {total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                        <span>Envío</span>
                        <span className="text-[10px] sm:text-xs">Calculado en checkout</span>
                      </div>
                      <div className="border-t border-gray-200 pt-1.5 sm:pt-2">
                        <div className="flex justify-between font-bold text-sm sm:text-base">
                          <span>Total</span>
                          <span className="text-pink-bright">S/. {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Información de envío */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-green-800 mb-1.5 sm:mb-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-semibold">Opciones de entrega</span>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-green-700">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></div>
                          <span>Recojo en tienda - GRATIS</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></div>
                          <span>Delivery - Consultar por WhatsApp</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de checkout */}
                    <button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className={`w-full font-bold py-3 sm:py-4 rounded-xl transition-all transform hover:scale-[0.98] active:scale-[0.96] flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[56px] touch-manipulation text-sm sm:text-base ${
                        isLoading 
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-pink-bright to-pink-dark text-white hover:from-pink-dark hover:to-pink-bright'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      {isLoading ? 'Verificando...' : 'Continuar compra'}
                    </button>

                    <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1.5 sm:mt-2">
                      Al continuar, aceptas nuestros términos y condiciones
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complement Selector Modal */}
      <ComplementSelector 
        isOpen={showComplementSelector}
        onClose={() => setShowComplementSelector(false)}
      />
    </>
  );
}
