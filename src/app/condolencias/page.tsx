'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Ribbon } from 'lucide-react';
import CondolenciasFilters from '@/components/CondolenciasFilters';
import { useCart, CartFlower } from '@/context/CartContext';
import { occasionMapping } from '@/config/occasions';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get correct image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
};

interface Flower {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price?: number | null;
  discount_percentage: number;
  stock: number;
  images?: string[] | null;
  image_url?: string;
  color?: string;
  occasion?: string;
  category_id?: number | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  is_featured: boolean;
  is_on_sale?: boolean;
  is_new?: boolean;
  rating?: number;
  average_rating?: number;
  reviews_count?: number;
}

export default function CondolenciasPage() {
  const [selectedOccasion, setSelectedOccasion] = useState('all-condolencias');
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addFlower } = useCart();

  const handleOccasionSelect = (occasion: string) => {
    setSelectedOccasion(occasion);
  };

  // Fetch flowers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/catalog/flowers`);
        
        if (!response.ok) {
          throw new Error('Error al cargar datos');
        }
        
        const data = await response.json();
        setFlowers(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setFlowers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter flowers for condolencias
  const filteredFlowers = useMemo(() => {
    // Condolencias occasions values
    const condolenciasValues = ['lagrimas-piso', 'mantos-especiales', 'coronas', 'tripodes'];
    const condolenciasLabels = ['Lágrimas de Piso', 'Mantos Especiales', 'Coronas', 'Trípodes', 'Condolencias'];
    
    let result = flowers.filter(flower => {
      if (!flower.occasion) return false;
      const flowerOccasion = flower.occasion.toLowerCase();
      // Check if the flower's occasion matches any condolencias type
      return condolenciasLabels.some(label => 
        flowerOccasion.includes(label.toLowerCase())
      ) || condolenciasValues.some(value => 
        flowerOccasion.includes(value.replace('-', ' '))
      );
    });
    
    // If a specific type is selected, filter further
    if (selectedOccasion !== 'all-condolencias') {
      const selectedLabel = occasionMapping[selectedOccasion] || selectedOccasion;
      result = result.filter(flower => {
        if (!flower.occasion) return false;
        const flowerOccasion = flower.occasion.toLowerCase();
        return flowerOccasion.includes(selectedLabel.toLowerCase()) || 
               flowerOccasion.includes(selectedOccasion.replace('-', ' '));
      });
    }
    
    return result;
  }, [flowers, selectedOccasion]);

  // Add to cart
  const handleAddToCart = useCallback((flower: Flower) => {
    const basePrice = Number(flower.price);
    const discountPct = Number(flower.discount_percentage) || 0;
    
    const finalPrice = discountPct > 0 
      ? basePrice - (basePrice * discountPct / 100)
      : basePrice;
    
    const imageUrl = flower.images?.[0] 
      ? getImageUrl(flower.images[0])
      : flower.image_url 
        ? getImageUrl(flower.image_url)
        : '';
    
    const cartFlower: CartFlower = {
      id: flower.id,
      name: flower.name,
      price: basePrice,
      image_url: imageUrl,
      quantity: 1,
      discount_percentage: discountPct,
      final_price: Number(finalPrice.toFixed(2)),
    };
    addFlower(cartFlower);
  }, [addFlower]);

  return (
    <main className="min-h-screen">
      {/* Hero Section para Condolencias */}
      <div 
        className="relative py-16 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/img/FondosParaOcasiones/FloresCondolencias.webp')`
        }}
      >
        {/* Fondo gris transparente suave para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Ribbon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Flores de Condolencias
          </h1>
          <p className="text-xl md:text-2xl mb-6 font-light text-white/90 drop-shadow-md">
            Acompaña en momentos difíciles
          </p>
          <p className="text-lg max-w-3xl mx-auto text-white/80 drop-shadow">
            Expresa tu solidaridad y apoyo con arreglos florales que transmiten paz y consuelo en momentos de duelo.
          </p>
        </div>
      </div>

      {/* Filtros específicos de condolencias */}
      <CondolenciasFilters 
        onOccasionSelect={handleOccasionSelect}
        selectedOccasion={selectedOccasion}
      />

      {/* Grid de Flores */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredFlowers.length === 0 ? (
          <div className="text-center py-12">
            <Ribbon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No hay flores disponibles</h3>
            <p className="text-gray-500">No se encontraron flores para esta categoría de condolencias.</p>
            <Link 
              href="/contacto"
              className="inline-block mt-4 px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              Contáctanos para pedidos especiales
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Mostrando {filteredFlowers.length} arreglo{filteredFlowers.length !== 1 ? 's' : ''} floral{filteredFlowers.length !== 1 ? 'es' : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFlowers.map((flower) => {
                const basePrice = Number(flower.price);
                const discountPct = Number(flower.discount_percentage) || 0;
                const finalPrice = discountPct > 0 
                  ? basePrice - (basePrice * discountPct / 100)
                  : basePrice;
                const imageUrl = flower.images?.[0] 
                  ? getImageUrl(flower.images[0])
                  : flower.image_url 
                    ? getImageUrl(flower.image_url)
                    : 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400';
                
                return (
                  <div 
                    key={flower.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={flower.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      
                      {/* Discount Badge */}
                      {discountPct > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{discountPct}%
                        </div>
                      )}
                      
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Add to Cart Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAddToCart(flower)}
                          className="w-full py-2.5 bg-white text-gray-900 font-medium rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Agregar
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {flower.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {flower.short_description || flower.description || 'Arreglo floral de condolencias'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          S/ {finalPrice.toFixed(2)}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            S/ {basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¿Necesitas un arreglo personalizado?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nuestro equipo puede ayudarte a crear el arreglo floral ideal para expresar tus condolencias
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Contactar ahora
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.652-.396c-1.081.514-2.362.396-3.311-.102a4.926 4.926 0 01-1.667-1.67c-.498-.949-.616-2.23-.102-3.311A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
