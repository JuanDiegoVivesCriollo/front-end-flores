'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Sun, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import FlowerCard from '@/components/FlowerCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import SpecialOfferModal from '@/components/SpecialOfferModal';
import { apiClient } from '@/services/api';

// Tipos para las flores
interface Flower {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  first_image?: string;
  image_urls?: string[];
  images?: string | string[];
  category?: string | { name: string };
  color?: string;
  occasion?: string;
  rating?: number;
  reviews_count?: number;
  description?: string;
  short_description?: string;
  discount_percentage?: number;
  is_on_sale?: boolean;
  is_featured?: boolean;
  stock?: number;
  is_active?: boolean;
}

// Hook para flores amarillas (USANDO APICLIENT COMO FLOWERCATALOGREAL)
const useYellowFlowers = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        // Usar apiClient igual que FlowerCatalogReal
        const response = await apiClient.getFlowers({ per_page: 100 });
        
        // Verificar si la respuesta es exitosa y tiene datos
        if (!response.success || !response.data) {
          throw new Error(response.message || 'No se pudieron cargar las flores');
        }
        
        // Extraer las flores de la estructura paginada
        const allFlowers = response.data.data || [];
        
        // Filtrar por flores EN OFERTA ESPECIAL (is_on_sale = true)
        const specialOfferFlowers = allFlowers.filter((flower: Flower) => 
          // Filtro principal: flores con oferta especial activada
          flower.is_on_sale === true || 
          // También incluir flores con descuento
          (flower.discount_percentage && flower.discount_percentage > 0)
        );
        
        console.log('Flores en OFERTA ESPECIAL encontradas:', specialOfferFlowers.length, 'de', allFlowers.length, 'total');
        console.log('Respuesta completa:', response);
        setFlowers(specialOfferFlowers);
      } catch (err) {
        console.error('Error fetching yellow flowers:', err);
        setError('Error al cargar las flores amarillas');
      } finally {
        setLoading(false);
      }
    };

    fetchFlowers();
  }, []);

  return { flowers, loading, error };
};

// Helper para procesar URLs de imágenes (IGUAL QUE EN FlowerCatalogReal)
const processImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/img/placeholder.jpg';
  }
  
  // Si ya es una URL completa (http/https), úsala directamente
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si es solo un filename (sin /storage/), construir la ruta completa
  if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
    imageUrl = `/storage/img/flores/${imageUrl}`;
  }
  
  // Si comienza con /storage/, construir la URL correcta para producción
  if (imageUrl.startsWith('/storage/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    // CORREGIDO: Extraer correctamente la base URL
    // Si apiUrl es https://floresydetalleslima.com/api/public/api/v1
    // queremos obtener https://floresydetalleslima.com
    let baseUrl = apiUrl;
    
    // Remover /api/public/api/v1, /api/public, /api/v1, etc.
    baseUrl = baseUrl.replace(/\/api\/public\/api\/v1$/, '');
    baseUrl = baseUrl.replace(/\/api\/public$/, '');
    baseUrl = baseUrl.replace(/\/api\/v1$/, '');
    
    // Construir URL final: baseUrl + /api/public + imageUrl
    const finalUrl = `${baseUrl}/api/public${imageUrl}`;
    return finalUrl;
  }
  
  // Para rutas que empiezan con slash, asumir que son del frontend
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // Para otros casos, usar placeholder
  return '/img/placeholder.jpg';
};

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

export default function YellowFlowersCatalog2025() {
  const { flowers, loading, error } = useYellowFlowers();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<YellowFlowerProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFavoriteToggle = (flowerId: number) => {
    setFavorites(prev =>
      prev.includes(flowerId)
        ? prev.filter(id => id !== flowerId)
        : [...prev, flowerId]
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddToCart = (flower: any) => {
    if (!flower.is_active || flower.stock === 0) return;
    
    addToCart({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      image: flower.image || flower.first_image || '/img/placeholder.jpg', // Usar lógica del "o" como FlowerCatalogReal
      category: typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores',
      color: flower.color || 'Amarillo',
      description: flower.description || '',
      rating: flower.rating || 5,
      reviews: flower.reviews_count || 0
    });
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg mb-6">
              <Sun className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">
              Catálogo Flores Amarillas 2025
            </h2>
            <div className="h-2 w-24 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <SkeletonLoader key={index} type="card" className="rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg mb-6">
              <Sun className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-6">
              Catálogo Flores Amarillas 2025
            </h2>
            <p className="text-xl text-gray-600">Error al cargar el catálogo de flores amarillas. Por favor, intenta de nuevo más tarde.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header con tema amarillo 2025 */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full shadow-xl mb-6 relative">
              <Sun className="w-12 h-12 text-white" />
              {/* Efecto de rayos de sol */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 animate-ping opacity-20"></div>
            </div>
            <div className="absolute -top-3 -right-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-amber-400" />
              </motion.div>
            </div>
            <div className="absolute -bottom-2 -left-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-6 h-6 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-8 tracking-tight font-serif leading-relaxed pb-2"
          >
            Catálogo Flores Amarillas
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-8 py-3 rounded-full font-bold text-xl mb-8 shadow-xl transform hover:scale-105 transition-transform duration-300 tracking-wide"
          >
            <Sparkles className="w-5 h-5" />
            EDICIÓN 2025
            <Sparkles className="w-5 h-5" />
          </motion.div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '10rem' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full mx-auto mb-10"
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-5xl mx-auto text-center space-y-6"
          >
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light tracking-wide">
              Este 21 de septiembre{' '}
              <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg mx-1">
                celebra la llegada de la primavera
              </span>{' '}
              con flores que llenan de{' '}
              <span className="text-yellow-600 font-medium">vida</span>,{' '}
              <span className="text-amber-600 font-medium">color</span> y{' '}
              <span className="text-orange-600 font-medium">alegría cada momento</span>
            </p>
            
            <p className="text-lg text-gray-600 italic font-light leading-relaxed tracking-wide">
              Un detalle que{' '}
              <span className="text-amber-700 font-semibold not-italic">ilumina corazones</span>{' '}
              y llena de vida cada momento especial
            </p>
            
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </motion.div>
        </div>

        {flowers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-4">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <p className="text-xl text-gray-600 mb-2">Próximamente disponible</p>
            <p className="text-gray-500">Estamos preparando una hermosa selección de flores amarillas para ti</p>
          </div>
        ) : (
          <>
            {/* Grid de flores amarillas con diseño mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`grid gap-6 ${
                flowers.filter(flower => flower.is_active).length === 1 
                  ? 'grid-cols-1 justify-center max-w-sm mx-auto'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}
            >
              {flowers
                .filter(flower => flower.is_active)
                .map((flower: Flower, index: number) => {
                // Procesamiento de imágenes IGUAL QUE EN FlowerCatalogReal
                let imageUrl = null;
                
                // 1. Usar first_image del backend si está disponible
                if (flower.first_image) {
                  imageUrl = flower.first_image;
                }
                // 2. Usar primer elemento de image_urls del backend
                else if (flower.image_urls && Array.isArray(flower.image_urls) && flower.image_urls.length > 0) {
                  imageUrl = flower.image_urls[0];
                }
                // 3. Procesar images field como fallback
                else if (flower.images) {
                  try {
                    const images = Array.isArray(flower.images) ? flower.images : JSON.parse(flower.images || '[]');
                    if (images.length > 0) {
                      imageUrl = images[0]; // Use URL directly from backend
                    }
                  } catch (e) {
                    console.warn('Error parsing flower images:', e);
                  }
                }
                
                const processedImageUrl = processImageUrl(imageUrl);
                const categoryName = typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores Amarillas';

                // Datos para FlowerCard con tema amarillo (USANDO URL PROCESADA + FIRST_IMAGE ORIGINAL)
                const flowerData = {
                  ...flower,
                  image: processedImageUrl, // Usar URL ya procesada
                  first_image: flower.first_image, // Mantener original para fallback
                  category: categoryName,
                  color: flower.color || 'Amarillo',
                  occasion: flower.occasion || 'Año Nuevo 2025',
                  rating: flower.rating || 5,
                  reviews: flower.reviews_count || 0,
                  isOnSale: flower.is_on_sale || ((flower.discount_percentage || 0) > 0),
                  isFavorite: favorites.includes(flower.id),
                  description: flower.description || '',
                  short_description: flower.short_description || `Hermoso arreglo floral amarillo de ${categoryName} perfecto para iluminar el 2025.`,
                  popular: flower.is_featured,
                  new: true, // Marcar como nuevo para la campaña 2025
                  discount: flower.discount_percentage || 0,
                  stock: flower.stock || 0,
                  is_active: flower.is_active
                };

                return (
                  <motion.div 
                    key={flower.id}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ y: -5 }}
                    className="relative"
                  >
                    {/* Badge especial para flores amarillas 2025 */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform duration-200 border border-yellow-300">
                        2025 ✨
                      </div>
                    </div>
                    
                    <FlowerCard
                      flower={flowerData}
                      viewMode="grid"
                      onFavoriteToggle={handleFavoriteToggle}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(flowerItem) => {
                        const product: YellowFlowerProduct = {
                          id: flowerItem.id,
                          name: flowerItem.name,
                          price: typeof flowerItem.price === 'string' ? parseFloat(flowerItem.price) : (flowerItem.price || 0),
                          originalPrice: (() => {
                            const originalPriceValue = flowerItem.originalPrice || flowerItem.original_price;
                            if (!originalPriceValue) return undefined;
                            return typeof originalPriceValue === 'string' ? parseFloat(originalPriceValue) : originalPriceValue;
                          })(),
                          image: flowerItem.image || flowerItem.first_image || '/img/placeholder.jpg', // Lógica del "o" como FlowerCatalogReal
                          category: typeof flowerItem.category === 'string' ? flowerItem.category : flowerItem.category?.name || 'Flores Amarillas',
                          color: flowerItem.color || 'Amarillo',
                          occasion: flowerItem.occasion || 'Año Nuevo 2025',
                          rating: flowerItem.rating,
                          reviews: flowerItem.reviews || flowerItem.reviews_count,
                          description: flowerItem.description,
                          short_description: flowerItem.short_description,
                          discount: flowerItem.discount || flowerItem.discount_percentage,
                          stock: flowerItem.stock,
                          is_active: flowerItem.is_active
                        };
                        setSelectedProduct(product);
                        setIsModalOpen(true);
                      }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Mensaje motivacional y botón de acción */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-8 mb-8 border-2 border-yellow-200 shadow-lg">
                <h3 className="text-2xl font-bold text-amber-800 mb-4 tracking-wide">
                  ¡Celebra la primavera con flores amarillas!
                </h3>
                <p className="text-amber-700 text-lg mb-4 leading-relaxed tracking-wide">
                  Este 21 de septiembre celebra la llegada de la primavera con flores que llenan de vida, color y alegría cada momento.{' '}
                  Un detalle que ilumina corazones y llena de vida cada momento especial.
                </p>
                <div className="flex justify-center items-center gap-4 text-amber-600">
                  <span className="flex items-center gap-1">
                    <Sun className="w-5 h-5" />
                    Prosperidad
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-5 h-5" />
                    Felicidad
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-5 h-5" />
                    Nuevos inicios
                  </span>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/catalog"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white font-bold px-10 py-5 rounded-full text-xl transition-all shadow-xl hover:shadow-2xl"
                >
                  <Sun className="w-6 h-6" />
                  Explorar todo el catálogo
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* Modal específico para flores amarillas */}
      <SpecialOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </section>
  );
}
