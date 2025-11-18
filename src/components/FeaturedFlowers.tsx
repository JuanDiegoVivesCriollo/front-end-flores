'use client';

import { motion } from 'framer-motion';
import { useFeaturedFlowers } from '@/hooks/useCatalog';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import Image from 'next/image';
import type { Flower } from '@/types';

export default function FeaturedFlowers() {
  const { flowers, loading, error } = useFeaturedFlowers(6);
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleAddToCart = (flower: Flower) => {
    // Manejar images como array o string JSON
    let images: string[] = [];
    try {
      images = Array.isArray(flower.images) ? flower.images : JSON.parse(flower.images || '[]');
    } catch (e) {
      console.warn('Error parsing flower images, using empty array:', e);
      images = [];
    }
    
    const cartItem = {
      id: flower.id,
      name: flower.name,
      price: flower.original_price && (flower.discount_percentage || 0) > 0 
        ? flower.price 
        : flower.price,
      image: images[0] || '/img/catalogo/placeholder.webp',
      stock: flower.stock || 0,
      category: flower.category?.name || '',
      color: flower.color || 'Varios',
      occasion: flower.occasion || 'General',
      description: flower.short_description || flower.description,
      rating: parseFloat(flower.rating?.toString() || '0') || 0,
      reviews: flower.reviews_count || 0,
      originalPrice: flower.original_price,
      discount: flower.discount_percentage || 0
    };
    addToCart(cartItem);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Flores Destacadas ⭐
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Flores Destacadas ⭐
          </h2>
          <p className="text-red-600">Error al cargar las flores destacadas: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Flores Destacadas ⭐
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nuestras flores más populares, seleccionadas especialmente para ti
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flowers
            .filter(flower => flower.is_active) // Solo mostrar flores activas
            .map((flower, index) => {
            // Manejar images como array o string JSON - usar URLs directamente del backend
            let images: string[] = [];
            try {
              const rawImages = Array.isArray(flower.images) ? flower.images : JSON.parse(flower.images || '[]');
              images = rawImages; // Use URLs directly from backend
            } catch (e) {
              console.warn('Error parsing flower images, using placeholder:', e);
              images = [];
            }
            
            const mainImage = images[0] || '';
            const hasDiscount = flower.original_price && (flower.discount_percentage || 0) > 0;
            
            return (
              <motion.div
                key={flower.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="w-full h-full bg-pink-light flex items-center justify-center p-2" style={{ backgroundColor: '#F89ACE' }}>
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={flower.name}
                        width={300}
                        height={250}
                        className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{flower.discount_percentage}%
                    </div>
                  )}
                  {flower.is_featured && (
                    <div className="absolute top-4 right-4 bg-yellow-500 text-white p-2 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(flower.id)}
                    className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-pink-500 p-2 rounded-full transition-all duration-300 hover:scale-110"
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.includes(flower.id) ? 'fill-current' : ''}`} 
                    />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(parseFloat(flower.rating?.toString() || '0') || 0) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({flower.reviews_count})</span>
                  </div>

                  <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                    {flower.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {flower.short_description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {hasDiscount && (
                        <span className="text-gray-400 line-through text-sm">
                          S/ {flower.original_price}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-pink-600">
                        S/ {flower.price}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Stock: {flower.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(flower)}
                    disabled={flower.stock === 0}
                    className="w-full bg-pink-bright hover:bg-pink-dark text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {(flower.stock || 0) > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-gradient-to-r from-pink-bright to-pink-dark text-white font-bold py-4 px-8 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105">
            Ver Todas las Flores
          </button>
        </motion.div>
      </div>
    </section>
  );
}
