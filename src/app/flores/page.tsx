'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Search, Filter, X, ChevronDown } from 'lucide-react';
import { useCart, CartFlower } from '@/context/CartContext';
import { getOccasionByValue, occasionMapping, regularOccasions, type Occasion } from '@/config/occasions';

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

function FloresContent() {
  const searchParams = useSearchParams();
  const occasionParam = searchParams.get('ocasion') || '';
  
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  
  const { addFlower } = useCart();

  // Get occasion data
  const currentOccasion = occasionParam ? getOccasionByValue(occasionParam) : null;
  const occasionLabel = currentOccasion?.label || occasionMapping[occasionParam] || '';

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

  // Filter and sort flowers
  const filteredFlowers = useMemo(() => {
    let result = [...flowers];

    // Filter by occasion if set
    if (occasionLabel) {
      result = result.filter(flower => {
        if (!flower.occasion) return false;
        const flowerOccasion = flower.occasion.toLowerCase();
        return flowerOccasion.includes(occasionLabel.toLowerCase()) ||
               flowerOccasion.includes(occasionParam.replace(/-/g, ' '));
      });
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) ||
        (f.description || '').toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'price_asc':
        result.sort((a, b) => {
          const priceA = a.discount_percentage > 0 ? a.price - (a.price * a.discount_percentage / 100) : a.price;
          const priceB = b.discount_percentage > 0 ? b.price - (b.price * b.discount_percentage / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price_desc':
        result.sort((a, b) => {
          const priceA = a.discount_percentage > 0 ? a.price - (a.price * a.discount_percentage / 100) : a.price;
          const priceB = b.discount_percentage > 0 ? b.price - (b.price * b.discount_percentage / 100) : b.price;
          return priceB - priceA;
        });
        break;
      default: // featured
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [flowers, occasionLabel, occasionParam, searchQuery, sortBy]);

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

  // Get hero data based on occasion
  const heroData = currentOccasion ? {
    title: currentOccasion.heroTitle,
    subtitle: currentOccasion.heroSubtitle,
    description: currentOccasion.heroDescription,
    backgroundImage: currentOccasion.backgroundImage,
  } : {
    title: 'Nuestras Flores',
    subtitle: 'Flores frescas para cada ocasión',
    description: 'Descubre nuestra colección de hermosos arreglos florales, seleccionados con amor para ti.',
    backgroundImage: '/img/FondosParaOcasiones/FondoOcasiones.png',
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative py-16 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${heroData.backgroundImage}')`
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {currentOccasion && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <currentOccasion.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
            {heroData.title}
          </h1>
          <p className="text-xl md:text-2xl mb-4 font-light text-white/90 drop-shadow-md">
            {heroData.subtitle}
          </p>
          <p className="text-lg max-w-3xl mx-auto text-white/80 drop-shadow">
            {heroData.description}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar flores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Results count */}
              <span className="text-gray-600 text-sm">
                {filteredFlowers.length} resultado{filteredFlowers.length !== 1 ? 's' : ''}
              </span>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="featured">Destacados</option>
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          {/* Occasion chips */}
          {occasionLabel && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Filtrando por:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                {occasionLabel}
                <Link href="/flores" className="hover:bg-pink-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

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
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No se encontraron flores</h3>
            <p className="text-gray-500 mb-4">
              {occasionLabel 
                ? `No hay flores disponibles para "${occasionLabel}".`
                : 'No hay flores que coincidan con tu búsqueda.'}
            </p>
            <Link 
              href="/flores"
              className="inline-block px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
            >
              Ver todas las flores
            </Link>
          </div>
        ) : (
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
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discountPct > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{discountPct}%
                        </span>
                      )}
                      {flower.is_featured && (
                        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Destacado
                        </span>
                      )}
                    </div>
                    
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
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {flower.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {flower.short_description || flower.description || 'Hermoso arreglo floral'}
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
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-pink-100 to-rose-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¿Buscas algo especial?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nuestro equipo puede ayudarte a crear el arreglo floral perfecto para cualquier ocasión
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Contactar ahora
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function FloresPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    }>
      <FloresContent />
    </Suspense>
  );
}
