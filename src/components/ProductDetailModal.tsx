'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  Plus, 
  Minus,
  Truck,
  Shield,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { getWhatsAppUrl, WHATSAPP_NUMBERS } from '@/utils/whatsapp';

interface Product {
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
  new?: boolean;
  popular?: boolean;
  discount?: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { showCartNotification } = useNotification();

  if (!product) return null;

  // Simulated product images (en un proyecto real vendrían del producto)
  const productImages = [
    product.image,
    product.image, // Duplicated for demo
    product.image,
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/img/placeholder.jpg',
        category: product.category,
        color: product.color,
        occasion: product.occasion,
        description: product.description || `Hermoso arreglo de ${product.name.toLowerCase()} perfecto para ${product.occasion.toLowerCase()}. Flores frescas de la mejor calidad.`,
        rating: product.rating || 4.8,
        reviews: product.reviews || 127,
        originalPrice: product.originalPrice,
        discount: product.discount
      });
    }
    
    // Mostrar notificación de éxito sin cerrar el modal
    showCartNotification(`${product.name} (${quantity} ${quantity === 1 ? 'unidad' : 'unidades'})`);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9000] overflow-y-auto">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Galería de imágenes */}
                <div className="relative bg-gradient-to-br from-pink-light/30 to-pink-bright/30">
                  <div className="aspect-square relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImage}
                        src={productImages[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      />
                    </AnimatePresence>

                    {/* Navegación de imágenes */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === selectedImage ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.new && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Nuevo
                        </span>
                      )}
                      {product.popular && (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Popular
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del producto */}
                <div className="p-6 md:p-8 flex flex-col">
                  {/* Título y precio */}
                  <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                      {product.name}
                    </h1>

                    {/* Precio */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        S/. {product.price.toFixed(2)} PEN
                      </span>
                      {/* Solo mostrar precio original tachado si hay descuento */}
                      {product.originalPrice && product.discount && product.discount > 0 && product.originalPrice > product.price && (
                        <span className="text-xl text-gray-400 line-through">
                          S/. {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Descripción breve */}
                    {product.short_description && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}

                    {/* Botón de WhatsApp */}
                    <div className="mb-6">
                      <a
                        href={getWhatsAppUrl({ 
                          phoneNumber: WHATSAPP_NUMBERS.MAIN, 
                          message: `¡Hola! Estoy interesado en el ramo "${product.name}" que vi en su catálogo. ¿Podrían darme más información sobre disponibilidad y precio? Gracias.`
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        Resolvemos todas tus consultas aquí!
                      </a>
                    </div>

                    {/* Descripción ordenada por puntos */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
                      <div className="text-gray-600 text-sm leading-relaxed">
                        {(() => {
                          const description = product.description || `Hermoso arreglo de ${product.name.toLowerCase()} perfecto para ${product.occasion.toLowerCase()}. Flores frescas de la mejor calidad, cuidadosamente seleccionadas y arregladas por nuestros floristas expertos.`;
                          
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
                                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span>{content}</span>
                                      </li>
                                    );
                                  } else if (trimmedLine) {
                                    // Línea sin marcador, mostrar como punto también
                                    return (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
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
                  </div>

                  {/* Beneficios */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <Truck className="w-4 h-4" />
                        <span>Consulta envío por WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>Garantía de frescura</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600">
                        <Clock className="w-4 h-4" />
                        <span>Entrega el mismo día</span>
                      </div>
                    </div>
                  </div>

                  {/* Controles de cantidad y acciones */}
                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-3 rounded-lg border transition-colors ${
                          isFavorite 
                            ? 'bg-pink-50 border-pink-200 text-pink-600' 
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-pink-bright to-green-accent text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Añadir al carrito - S/. {(product.price * quantity).toFixed(2)}
                    </button>
                  </div>

                  {/* Características - Movido al final */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Características</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-accent rounded-full"></span>
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-bright rounded-full"></span>
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium">{product.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-accent rounded-full"></span>
                        <span className="text-gray-600">Ocasión:</span>
                        <span className="font-medium">{product.occasion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-bright rounded-full"></span>
                        <span className="text-gray-600">Frescura:</span>
                        <span className="font-medium">7 días</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
