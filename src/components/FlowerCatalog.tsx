'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Heart,
  Star,
  Sparkles,
  SlidersHorizontal,
  AlertCircle,
  Eye
} from 'lucide-react';
import ProductDetailModal, { Product } from '@/components/ProductDetailModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get correct image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
};

// Types - Updated to match actual API response
interface FlowerType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

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
  flower_types?: FlowerType[];
  is_featured: boolean;
  is_on_sale?: boolean;
  is_new?: boolean;
  rating?: number;
  average_rating?: number;
  reviews_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  flowers_count?: number;
}

// Filter options
const colorOptions = [
  { value: 'Rojo', label: 'Rojo', color: '#DC2626' },
  { value: 'Blanco', label: 'Blanco', color: '#FFFFFF', border: true },
  { value: 'Rosa', label: 'Rosa', color: '#EC4899' },
  { value: 'Amarillo', label: 'Amarillo', color: '#FBBF24' },
  { value: 'Morado', label: 'Morado', color: '#8B5CF6' },
  { value: 'Naranja', label: 'Naranja', color: '#F97316' },
  { value: 'Azul', label: 'Azul', color: '#3B82F6' },
  { value: 'Multicolor', label: 'Multicolor', color: 'linear-gradient(45deg, #DC2626, #FBBF24, #22C55E, #3B82F6)' },
];

const occasionOptions = [
  'Cumpleaños',
  'Aniversario',
  'Amor y Romance',
  'Agradecimiento',
  'Condolencias',
  'Día de la Madre',
  'San Valentín',
  'Nacimiento',
  'Graduación',
  'Boda',
  'Corporativo',
];

const sortOptions = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más Recientes' },
  { value: 'price_asc', label: 'Precio: Menor a Mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a Menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'rating', label: 'Mejor Valorados' },
];

export default function FlowerCatalog() {
  // State
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);
  const [sortBy, setSortBy] = useState('featured');
  
  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    colors: true,
    occasions: false,
    price: true,
  });

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Flower | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProductModal = useCallback((flower: Flower) => {
    setSelectedProduct(flower);
    setIsModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Fetch flowers function - extracted so it can be reused
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [flowersRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE}/catalog/flowers`, { cache: 'no-store' }),
        fetch(`${API_BASE}/catalog/categories`, { cache: 'no-store' }),
      ]);
      
      if (!flowersRes.ok || !categoriesRes.ok) {
        throw new Error('Error al cargar datos');
      }
      
      const flowersData = await flowersRes.json();
      const categoriesData = await categoriesRes.json();
      
      // Ensure we always set an array
      const flowersArray = flowersData.data || flowersData || [];
      const categoriesArray = categoriesData.data || categoriesData || [];
      
      setFlowers(Array.isArray(flowersArray) ? flowersArray : []);
      setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // No mock data - show empty state
      setFlowers([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when window gains focus (user returns from admin)
  useEffect(() => {
    const handleFocus = () => {
      // Refetch without showing loading spinner
      fetchData(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  // Filter and sort flowers
  const filteredFlowers = useMemo(() => {
    if (!flowers || !Array.isArray(flowers)) return [];
    
    let result = [...flowers];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) ||
        (f.description || '').toLowerCase().includes(query)
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      result = result.filter(f => 
        f.category && selectedCategories.includes(f.category.slug)
      );
    }

    // Colors - Updated to work with single color string
    if (selectedColors.length > 0) {
      result = result.filter(f => 
        f.color && selectedColors.includes(f.color)
      );
    }

    // Occasions - Updated to work with single occasion string
    if (selectedOccasions.length > 0) {
      result = result.filter(f => 
        f.occasion && selectedOccasions.includes(f.occasion)
      );
    }

    // Price - Calculate final price on the fly
    result = result.filter(f => {
      const finalPrice = f.discount_percentage > 0 
        ? f.price - (f.price * f.discount_percentage / 100)
        : f.price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

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
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || b.average_rating || 0) - (a.rating || a.average_rating || 0));
        break;
      default: // featured
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [flowers, searchQuery, selectedCategories, selectedColors, selectedOccasions, priceRange, sortBy]);

  // Toggle filter
  const toggleFilter = (type: 'categories' | 'colors' | 'occasions' | 'price') => {
    setExpandedFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Handle filter changes
  const handleCategoryChange = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) 
        ? prev.filter(c => c !== slug)
        : [...prev, slug]
    );
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasions(prev => 
      prev.includes(occasion) 
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setPriceRange([0, 2500]);
    setSortBy('featured');
  };

  // Active filters count
  const activeFiltersCount = selectedCategories.length + selectedColors.length + selectedOccasions.length + 
    (priceRange[0] > 0 || priceRange[1] < 2500 ? 1 : 0);

  return (
    <section className="relative overflow-hidden" id="catalogo">
      {/* Section Header - Franja rosada en todo el ancho */}
      <div className="w-full bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200 py-14 md:py-16">
        <div className="container-wide">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-semibold text-pink-600">Colección Premium</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-5 bg-gradient-to-r from-pink-700 via-rose-600 to-pink-700 bg-clip-text text-transparent">
              Nuestra Colección
            </h2>
            <p className="text-rose-800/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Descubre nuestra exclusiva selección de arreglos florales, cada uno diseñado con 
              <span className="text-pink-700 font-semibold"> amor</span> y 
              <span className="text-rose-700 font-semibold"> dedicación</span> para crear momentos inolvidables
            </p>
            <div className="flex justify-center mt-8">
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm">
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-700 font-medium">Flores Frescas</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                  <span className="text-pink-700 font-medium">Envío Express</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-amber-700 font-medium">Calidad Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del catálogo */}
      <div className="py-12 md:py-16 bg-gradient-to-b from-rose-50 via-pink-50/30 to-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-rose-200/30 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="container-wide relative z-10">

        {/* Search and Sort Bar - Mejorado */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
          {/* Search básico */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el catálogo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200 bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="w-6 h-6 bg-white text-pink-600 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full md:w-52 px-4 py-3.5 pr-10 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all cursor-pointer font-medium text-gray-700"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar (Desktop) - Mejorado */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-6 sticky top-24 border-2 border-gray-200">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-gradient-to-br from-primary-100 to-rose-100 rounded-lg">
                    <Filter className="w-4 h-4 text-primary-600" />
                  </div>
                  Filtros
                </h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-3 py-1.5 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Limpiar
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <button 
                  onClick={() => toggleFilter('categories')}
                  className="flex items-center justify-between w-full text-left font-semibold mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Categorías</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.categories ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.categories && (
                  <div className="space-y-2 pl-2">
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.slug)}
                          onChange={() => handleCategoryChange(category.slug)}
                          className="w-4 h-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors flex-1">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {category.flowers_count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors Filter */}
              <div className="mb-6">
                <button 
                  onClick={() => toggleFilter('colors')}
                  className="flex items-center justify-between w-full text-left font-semibold mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Colores</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.colors ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.colors && (
                  <div className="grid grid-cols-2 gap-2 pl-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border-2 ${
                          selectedColors.includes(color.value) 
                            ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        title={color.label}
                      >
                        <span 
                          className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm ${color.border ? 'border-2 border-gray-200' : ''}`}
                          style={{ 
                            background: color.color.includes('gradient') ? color.color : color.color 
                          }}
                        />
                        <span className="truncate">{color.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Occasions Filter */}
              <div className="mb-6">
                <button 
                  onClick={() => toggleFilter('occasions')}
                  className="flex items-center justify-between w-full text-left font-semibold mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Ocasiones</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.occasions ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.occasions && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    {occasionOptions.map(occasion => (
                      <button
                        key={occasion}
                        onClick={() => handleOccasionChange(occasion)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                          selectedOccasions.includes(occasion)
                            ? 'border-primary-400 bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <button 
                  onClick={() => toggleFilter('price')}
                  className="flex items-center justify-between w-full text-left font-semibold mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Precio</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedFilters.price ? 'rotate-180' : ''}`} />
                </button>
                {expandedFilters.price && (
                  <div className="space-y-4 pl-2 pr-2">
                    <div className="flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-primary-50 to-rose-50 rounded-xl">
                      <div className="text-center">
                        <span className="text-xs text-gray-500 block">Mín</span>
                        <span className="text-sm font-bold text-primary-600">S/ {priceRange[0]}</span>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-primary-200 to-rose-200" />
                      <div className="text-center">
                        <span className="text-xs text-gray-500 block">Máx</span>
                        <span className="text-sm font-bold text-rose-600">S/ {priceRange[1]}</span>
                      </div>
                    </div>
                    <div className="price-slider-container relative h-2">
                      <div className="absolute inset-0 bg-gray-200 rounded-full" />
                      <div 
                        className="absolute h-full bg-gradient-to-r from-primary-400 to-rose-400 rounded-full"
                        style={{
                          left: `${(priceRange[0] / 2500) * 100}%`,
                          right: `${100 - (priceRange[1] / 2500) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={2500}
                        step={50}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="price-slider absolute w-full"
                      />
                      <input
                        type="range"
                        min={0}
                        max={2500}
                        step={50}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="price-slider absolute w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Modal - Mejorado */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsFilterOpen(false)}
              />
              <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
                <div className="sticky top-0 z-10 p-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary-100 to-rose-100 rounded-lg">
                      <Filter className="w-4 h-4 text-primary-600" />
                    </div>
                    Filtros
                  </h3>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                <div className="p-5 space-y-6">
                  {/* Categories */}
                  <div>
                    <h4 className="font-semibold mb-4 text-gray-700">Categorías</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-primary-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.slug)}
                            onChange={() => handleCategoryChange(category.slug)}
                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                          <span className="text-xs text-gray-400 ml-auto bg-white px-2 py-0.5 rounded-full">
                            {category.flowers_count}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="font-semibold mb-4 text-gray-700">Colores</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => handleColorChange(color.value)}
                          className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all border-2 ${
                            selectedColors.includes(color.value) 
                              ? 'border-primary-400 bg-primary-50 text-primary-700' 
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <span 
                            className={`w-5 h-5 rounded-full shadow-sm ${color.border ? 'border-2 border-gray-200' : ''}`}
                            style={{ background: color.color }}
                          />
                          <span className="font-medium">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-semibold mb-4 text-gray-700">Precio</h4>
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-rose-50 rounded-xl mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <span className="text-xs text-gray-500 block">Mínimo</span>
                          <span className="text-lg font-bold text-primary-600">S/ {priceRange[0]}</span>
                        </div>
                        <div className="h-px flex-1 mx-4 bg-gradient-to-r from-primary-200 to-rose-200" />
                        <div className="text-center">
                          <span className="text-xs text-gray-500 block">Máximo</span>
                          <span className="text-lg font-bold text-rose-600">S/ {priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2500}
                      step={50}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-primary-500"
                    />
                  </div>
                </div>
                <div className="sticky bottom-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex gap-3">
                  <button 
                    onClick={clearFilters}
                    className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl hover:from-primary-600 hover:to-rose-600 font-bold transition-all shadow-lg shadow-primary-500/25"
                  >
                    Ver {filteredFlowers.length} productos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count - Mejorado */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 font-medium">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin inline-block" />
                    Cargando productos...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                    <span className="text-gray-800 font-semibold">{filteredFlowers.length}</span> productos encontrados
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-medium rounded-full shadow-sm">
                      {categories.find(c => c.slug === cat)?.name}
                      <button onClick={() => handleCategoryChange(cat)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedColors.map(color => (
                    <span key={color} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-medium rounded-full shadow-sm">
                      {color}
                      <button onClick={() => handleColorChange(color)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Loading State - Mejorado */}
            {loading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-100/50 animate-pulse">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-24" />
                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid - Mejorado */}
            {!loading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                {filteredFlowers.map(flower => (
                  <FlowerCard 
                    key={flower.id} 
                    flower={flower} 
                    onViewDetails={openProductModal}
                  />
                ))}
              </div>
            )}

            {/* Error State - Mejorado */}
            {!loading && error && (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Error de conexión
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo correctamente.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-rose-600 transition-all shadow-lg shadow-primary-500/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </button>
              </div>
            )}

            {/* Empty State - Mejorado */}
            {!loading && !error && filteredFlowers.length === 0 && (
              <div className="text-center py-20 px-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-100 via-rose-100 to-amber-100 rounded-full mb-6 animate-pulse">
                  <Sparkles className="w-12 h-12 text-primary-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No encontramos resultados
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Intenta modificar los filtros o realiza una nueva búsqueda para encontrar lo que buscas
                </p>
                <button 
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white font-medium rounded-xl hover:from-primary-600 hover:to-rose-600 transition-all shadow-lg shadow-primary-500/25"
                >
                  <X className="w-5 h-5" />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={closeProductModal}
        product={selectedProduct as Product | null}
        allProducts={filteredFlowers as Product[]}
      />
      </div>
    </section>
  );
}

// Flower Card Component - Mejorado
function FlowerCard({ flower, onViewDetails }: { 
  flower: Flower; 
  onViewDetails: (flower: Flower) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const hasDiscount = Number(flower.discount_percentage) > 0;
  const price = Number(flower.price) || 0;
  const discountPercentage = Number(flower.discount_percentage) || 0;
  const finalPrice = hasDiscount 
    ? price - (price * discountPercentage / 100)
    : price;
  
  // Get image URL
  const imageUrl = flower.images?.[0] 
    ? getImageUrl(flower.images[0])
    : flower.image_url 
      ? getImageUrl(flower.image_url)
      : null;

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-500 border border-gray-100/50 hover:border-primary-200/50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(flower)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Fondo de flores - expandido para cubrir todo */}
        <div 
          className="absolute -inset-2" 
          style={{ 
            backgroundImage: 'url(/img/fondodeflores.png)', 
            backgroundSize: '120%',
            backgroundPosition: 'center' 
          }}
        />
        
        <div className="w-full h-full flex items-center justify-center relative z-10">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={flower.name}
              className="max-w-[90%] max-h-[90%] object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-xl"
            />
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-rose-200 rounded-full blur-xl opacity-50 animate-pulse" />
              <Sparkles className="w-16 h-16 text-primary-300 relative z-10" />
            </div>
          )}
        </div>
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

        {/* Badges - Mejorados */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
          {flower.is_new && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Nuevo
            </span>
          )}
          {hasDiscount && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/30 animate-pulse">
              -{discountPercentage}%
            </span>
          )}
          {flower.is_featured && !flower.is_new && !hasDiscount && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg shadow-primary-500/30">
              ⭐ Destacado
            </span>
          )}
        </div>

        {/* Quick Actions - Mejorados */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 z-30 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110 shadow-lg'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails(flower); }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm bg-white/90 text-gray-600 hover:bg-primary-500 hover:text-white hover:scale-110 shadow-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* View Details Button */}
        <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 z-30 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails(flower); }}
            className="w-full py-3 backdrop-blur-sm text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl bg-white/95 text-primary-600 hover:bg-primary-500 hover:text-white"
          >
            <Eye className="w-5 h-5" />
            Ver detalles
          </button>
        </div>
      </div>

      {/* Content - Mejorado */}
      <div className="p-5">
        {/* Category & Flower Types Tags */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Mostrar tipos de flores si existen */}
          {flower.flower_types && flower.flower_types.length > 0 ? (
            <>
              {flower.flower_types.slice(0, 2).map((type) => (
                <span 
                  key={type.id}
                  className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full font-medium flex items-center gap-1"
                >
                  {type.icon && <span>{type.icon}</span>}
                  {type.name}
                </span>
              ))}
              {flower.flower_types.length > 2 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                  +{flower.flower_types.length - 2}
                </span>
              )}
            </>
          ) : flower.category?.name ? (
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full font-medium">
              {flower.category.name}
            </span>
          ) : null}
          {(flower.rating || flower.average_rating) && (Number(flower.rating) || Number(flower.average_rating) || 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{(Number(flower.rating) || Number(flower.average_rating) || 0).toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors text-base leading-snug">
          {flower.name}
        </h3>

        {/* Price - Mejorado */}
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-xl font-black bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            S/ {finalPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400/70 line-through font-medium">
              S/ {price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {flower.stock <= 5 && flower.stock > 0 && (
          <p className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
            ¡Solo quedan {flower.stock}!
          </p>
        )}
      </div>
    </div>
  );
}
