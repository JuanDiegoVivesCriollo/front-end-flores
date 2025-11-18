'use client';

import { useState } from "react";
import Link from "next/link";
import { Heart, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from '@/context/CartContext';
import { useFlowersOnSale } from '@/hooks/useCatalog';
import SkeletonLoader from '@/components/SkeletonLoader';
import FlowerCard, { type FlowerCardData } from '@/components/FlowerCard';
import SpecialOfferModal from '@/components/SpecialOfferModal';
import type { Flower } from '@/types';

export default function FlowersOnSale() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SpecialOfferProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { flowers, loading, error } = useFlowersOnSale();

  // Define SpecialOfferProduct type for the new modal
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

  // Helper para procesar URLs de imágenes (CORREGIDO)
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
      let baseUrl = apiUrl;
      baseUrl = baseUrl.replace(/\/api\/public\/api\/v1$/, '');
      baseUrl = baseUrl.replace(/\/api\/public$/, '');
      baseUrl = baseUrl.replace(/\/api\/v1$/, '');
      
      return `${baseUrl}/api/public${imageUrl}`;
    }
    
    // Para rutas que empiezan con slash, asumir que son del frontend
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Para otros casos, usar placeholder
    return '/img/placeholder.jpg';
  };

  const handleFavoriteToggle = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(favoriteId => favoriteId !== id)
        : [...prev, id]
    );
  };

  const handleAddToCart = (flower: FlowerCardData) => {
    // No permitir agregar al carrito flores inactivas o sin stock
    if (!flower.is_active || !flower.stock || flower.stock <= 0) {
      return;
    }
    
    addToCart({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      image: flower.image || flower.first_image || '/img/placeholder.jpg',
      category: typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores',
      color: flower.color || 'Variado',
      occasion: flower.occasion || 'Cualquier ocasión',
      description: flower.description || `Hermoso arreglo de ${flower.name}`,
      rating: flower.rating || 0,
      reviews: flower.reviews || flower.reviews_count || 0,
      originalPrice: flower.originalPrice || flower.original_price || flower.price,
      discount: flower.discount || flower.discount_percentage || 0,
      type: 'flower' // Añadir tipo para distinguir de complementos
    });
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-pink-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-bright to-purple-500 rounded-full shadow-lg mb-6">
              <Tag className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-dark via-purple-600 to-pink-bright bg-clip-text text-transparent mb-6">
              Flores en Oferta Especial
            </h2>
            <div className="h-2 w-24 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-bright rounded-full mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <SkeletonLoader key={index} type="card" className="rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-pink-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-dark via-purple-600 to-pink-bright bg-clip-text text-transparent mb-6">
              Flores en Oferta Especial
            </h2>
            <p className="text-xl text-gray-600">Error al cargar las flores en oferta. Por favor, intenta de nuevo más tarde.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-bright to-purple-500 rounded-full shadow-lg mb-6">
              <Tag className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-dark via-purple-600 to-pink-bright bg-clip-text text-transparent mb-6"
          >
            Flores en Oferta Especial
          </motion.h2>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '6rem' }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-2 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-bright rounded-full mx-auto mb-6"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Descubre precios únicos en nuestras flores más hermosas. 
            <span className="text-pink-bright font-semibold"> ¡Perfectas para expresar amor y cariño!</span>
          </motion.p>
        </div>

        {flowers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay flores en oferta disponibles en este momento.</p>
          </div>
        ) : (
          <>
            {/* Grid de flores */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`grid gap-4 ${
                flowers.filter(flower => flower.is_active).length === 1 
                  ? 'grid-cols-1 justify-center max-w-sm mx-auto'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              }`}
            >
              {flowers
                .filter(flower => flower.is_active) // Solo mostrar flores activas
                .map((flower: Flower, index: number) => {
                // Priorizar URLs del backend que ya están procesadas (igual que FlowerCatalogReal)
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
                const categoryName = typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores';

                // Preparar datos para el FlowerCard (igual que FlowerCatalogReal)
                const flowerData = {
                  ...flower,
                  image: processedImageUrl, // Usar URL ya procesada
                  category: categoryName,
                  color: flower.color || 'Multicolor',
                  occasion: flower.occasion || 'Todas las ocasiones',
                  rating: flower.rating || 5,
                  reviews: flower.reviews_count || 0,
                  isOnSale: flower.is_on_sale || (flower.discount_percentage > 0),
                  isFavorite: favorites.includes(flower.id),
                  description: flower.description || '',
                  short_description: flower.short_description || `Hermoso arreglo floral de ${flower.category?.name || 'flores'} perfecto para cualquier ocasión especial.`,
                  popular: flower.is_featured,
                  new: false,
                  discount: flower.discount_percentage || 0,
                  stock: flower.stock || 0,
                  is_active: flower.is_active
                };

                return (
                  <motion.div 
                    key={flower.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <FlowerCard
                      flower={flowerData}
                      viewMode="grid"
                      onFavoriteToggle={handleFavoriteToggle}
                      onAddToCart={handleAddToCart}
                      onViewDetails={(flowerItem) => {
                        const product: SpecialOfferProduct = {
                          id: flowerItem.id,
                          name: flowerItem.name,
                          price: flowerItem.price,
                          originalPrice: flowerItem.originalPrice || flowerItem.original_price,
                          image: flowerItem.image || flowerItem.first_image || '/img/placeholder.jpg',
                          category: typeof flowerItem.category === 'string' ? flowerItem.category : flowerItem.category?.name || 'Flores',
                          color: flowerItem.color || 'Multicolor',
                          occasion: flowerItem.occasion || 'Todas las ocasiones',
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

            {/* Botón ver más */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-pink-dark hover:bg-pink-bright text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-lg"
                >
                  Ver todas las flores
                  <Heart className="w-5 h-5 animate-heart-beat" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* Modal de detalle del producto - MODAL ESPECÍFICO PARA OFERTAS */}
      <SpecialOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </section>
  );
}
