'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sparkles, Heart, Calendar, Gift } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import FlowerCard from '@/components/FlowerCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import SpecialOfferModal from '@/components/SpecialOfferModal';
import { apiClient } from '@/services/api';
import PageTransition from '@/components/PageTransition';
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

export default function FloresAmarillasSeptiembrePage() {
  const { flowers, loading, error } = useYellowFlowers();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<YellowFlowerProduct | null>(null);

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

  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* Hero Section con imagen de fondo */}
        <div 
          className="relative text-white py-24 overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("/img/HeroSectionFloresAmarillas/herofloresamarillas.webp")`
          }}
        >
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-xl mb-6">
                <Sun className="w-12 h-12 text-white animate-pulse" />
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                21 de Septiembre
              </span>
              <br />
              <span className="text-white">
                Día de las Flores Amarillas
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 font-light opacity-90 max-w-4xl mx-auto"
            >
              Celebra la llegada de la primavera con flores que simbolizan alegría, amistad y nuevos comienzos
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <span className="font-medium">21 de Septiembre</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Gift className="w-5 h-5 text-yellow-300" />
                <span className="font-medium">Inicio de la Primavera</span>
              </div>
            </motion.div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute top-10 left-10 text-yellow-300/30">
            <Sun className="w-16 h-16 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="absolute top-20 right-20 text-yellow-300/30">
            <Sparkles className="w-12 h-12 animate-pulse" />
          </div>
          <div className="absolute bottom-10 left-1/4 text-yellow-300/30">
            <Heart className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Sección del catálogo */}
        <section className="py-16 bg-gradient-to-b from-yellow-50 via-amber-50 to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header del catálogo */}
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  Flores que despiertan sonrisas
                </span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed italic"
              >
                Descubre nuestra colección especial de flores amarillas, perfectas para celebrar la amistad y la llegada de la primavera
              </motion.p>
            </div>

            {/* Contenido del catálogo */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <SkeletonLoader key={index} type="card" className="rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg mb-6">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Error al cargar las flores</h3>
                <p className="text-gray-600 mb-6">No pudimos cargar el catálogo. Por favor, intenta de nuevo más tarde.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold px-6 py-3 rounded-full transition-all"
                >
                  Reintentar
                </button>
              </div>
            ) : flowers.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-6">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Próximamente disponible</h3>
                <p className="text-gray-600 mb-6">Estamos preparando una hermosa selección de flores amarillas para el 21 de septiembre</p>
                <Link 
                  href="/flores"
                  className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold px-6 py-3 rounded-full transition-all"
                >
                  Ver todo el catálogo
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {flowers
                  .filter(flower => flower.is_active)
                  .map((flower: Flower, index: number) => {
                    // Procesamiento de imágenes
                    let imageUrl = null;
                    
                    if (flower.first_image) {
                      imageUrl = flower.first_image;
                    } else if (flower.image_urls && Array.isArray(flower.image_urls) && flower.image_urls.length > 0) {
                      imageUrl = flower.image_urls[0];
                    } else if (flower.images) {
                      try {
                        const images = Array.isArray(flower.images) ? flower.images : JSON.parse(flower.images || '[]');
                        if (images.length > 0) {
                          imageUrl = images[0];
                        }
                      } catch (e) {
                        console.warn('Error parsing flower images:', e);
                      }
                    }
                    
                    const processedImageUrl = processImageUrl(imageUrl);
                    const categoryName = typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores Amarillas';

                    return (
                      <motion.div 
                        key={flower.id}
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -5 }}
                        className="relative"
                      >
                        {/* Badge especial para el 21 de septiembre */}
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform duration-200 border border-yellow-300">
                            21 Sept ✨
                          </div>
                        </div>

                        <FlowerCard
                          flower={{
                            ...flower,
                            image: processedImageUrl, // Usar URL ya procesada
                            first_image: flower.first_image, // Mantener original para fallback
                            category: categoryName,
                            color: flower.color || 'Amarillo',
                            occasion: flower.occasion || '21 de Septiembre',
                            rating: flower.rating || 5,
                            reviews: flower.reviews_count || 0,
                            isOnSale: flower.is_on_sale || ((flower.discount_percentage || 0) > 0),
                            isFavorite: favorites.includes(flower.id),
                            description: flower.description || '',
                            short_description: flower.short_description || `Hermoso arreglo floral amarillo de ${categoryName} perfecto para el 21 de septiembre.`,
                            popular: flower.is_featured,
                            new: true, // Marcar como nuevo para la campaña 21 Sept
                            discount: flower.discount_percentage || 0,
                            stock: flower.stock || 0,
                            is_active: flower.is_active
                          }}
                          viewMode="grid"
                          onFavoriteToggle={() => handleFavoriteToggle(flower.id)}
                          onAddToCart={() => handleAddToCart(flower)}
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
                              occasion: flowerItem.occasion || '21 de Septiembre',
                              rating: flowerItem.rating || 5,
                              reviews: flowerItem.reviews || flowerItem.reviews_count || 0,
                              description: flowerItem.description,
                              short_description: flowerItem.short_description,
                              discount: flowerItem.discount || flowerItem.discount_percentage,
                              stock: flowerItem.stock || 0,
                              is_active: flowerItem.is_active || true
                            };
                            setSelectedProduct(product);
                            setIsModalOpen(true);
                          }}
                        />
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}

            {/* Sección con la historia */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-20"
            >
              <div className="bg-gradient-to-r from-yellow-100 via-amber-50 to-orange-100 rounded-3xl p-8 md:p-12 shadow-xl border border-yellow-200">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full shadow-lg mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent mb-4">
                    La Historia del 21 de Septiembre
                  </h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mx-auto"></div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg md:text-xl font-light text-center italic text-amber-800">
                    Una tradición que florece cada primavera
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="bg-white/70 rounded-2xl p-6 shadow-md">
                      <h4 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        El Origen
                      </h4>
                      <p className="text-base leading-relaxed">
                        El <strong>21 de septiembre</strong> marca el <strong>Día de la Primavera</strong>, 
                        una fecha que simboliza el renacimiento de la naturaleza y la llegada de días más cálidos. 
                        La tradición de regalar flores amarillas, que tuvo su origen en Argentina, 
                        se ha extendido como una forma de celebrar la amistad 
                        y dar la bienvenida a esta hermosa estación.
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-6 shadow-md">
                      <h4 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <Sun className="w-5 h-5" />
                        El Significado
                      </h4>
                      <p className="text-base leading-relaxed">
                        Las <strong>flores amarillas</strong> representan la <strong>alegría, la amistad sincera 
                        y los nuevos comienzos</strong>. Su color brillante evoca la calidez del sol primaveral 
                        y transmite energía positiva, esperanza y felicidad a quienes las reciben.
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-6 shadow-md">
                      <h4 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        La Tradición
                      </h4>
                      <p className="text-base leading-relaxed">
                        En muchos países, es costumbre que los amigos se regalen flores amarillas el primer día 
                        de primavera. Esta hermosa tradición fortalece los lazos de amistad y celebra 
                        las relaciones importantes en nuestras vidas.
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-6 shadow-md">
                      <h4 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Hoy en Día
                      </h4>
                      <p className="text-base leading-relaxed">
                        La tradición se ha extendido más allá de Argentina, y hoy muchas personas en 
                        Latinoamérica celebran este día regalando flores amarillas como símbolo de 
                        cariño, gratitud y buenos deseos para la nueva estación.
                      </p>
                    </div>
                  </div>

                  <div className="text-center mt-8 p-6 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-2xl">
                    <p className="text-lg md:text-xl font-medium text-amber-900 italic">
                      Cada flor amarilla lleva consigo un mensaje de amistad eterna 
                      y la promesa de días más luminosos por venir
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Call to action final */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mt-16"
            >
              <Link 
                href="/flores"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white font-bold px-10 py-5 rounded-full text-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Sun className="w-6 h-6" />
                Explorar todo el catálogo
                <Sparkles className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Modal para detalles del producto */}
        <SpecialOfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      </main>
    </PageTransition>
  );
}
