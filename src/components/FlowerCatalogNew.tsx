'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Filter, Grid3X3, List, Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCategories, useFlowers } from "@/hooks/useCatalog";
import { Flower } from '@/types';
import { getFlowerImageUrl, prepareFlowerForCart } from '@/utils/flowerImageUtils';
import ImageWithLoader from '@/components/ImageWithLoader';
import ModernFilters from "@/components/ModernFilters";

const sortOptions = [
  { label: "Más populares", value: "popular" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
  { label: "Mejor calificado", value: "rating" },
  { label: "Más reciente", value: "newest" }
];

interface FlowerCatalogProps {
  initialOccasion?: string;
}

interface MappedFlower {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  color: string;
  occasion: string;
  rating: number;
  reviews: number;
  stock: number;
  isOnSale: boolean;
  discount: number;
  isActive: boolean;
  isFavorite: boolean;
  popular: boolean;
  new: boolean;
  flowerData: Flower;
}

export default function FlowerCatalogNew({ initialOccasion = "" }: FlowerCatalogProps) {
  const { addToCart } = useCart();
  
  // Estados del componente
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(() => {
    return initialOccasion ? [initialOccasion] : [];
  });
  const [selectedSubfilter, setSelectedSubfilter] = useState<string>("Todos");

  // Hooks de datos
  const { categories } = useCategories();
  const flowersParams = useMemo(() => ({
    category_id: selectedCategoryId,
    search: searchTerm || undefined,
    per_page: 100,
    page: 1
  }), [selectedCategoryId, searchTerm]);
  
  const { 
    flowers, 
    loading: flowersLoading, 
    error: flowersError
  } = useFlowers(flowersParams);

  console.log('🌸 FlowerCatalogNew - Datos recibidos:', {
    flowersCount: flowers?.length || 0,
    firstFlower: flowers?.[0] ? {
      id: flowers[0].id,
      name: flowers[0].name,
      images: flowers[0].images,
      image_urls: flowers[0].image_urls,
      first_image: flowers[0].first_image
    } : null,
    loading: flowersLoading,
    error: flowersError
  });

  // Debug para todas las flores
  if (flowers && flowers.length > 0) {
    console.log('🌸 Procesando todas las flores:');
    flowers.slice(0, 5).forEach((flower, index) => {
      console.log(`  [${index}] ${flower.name}:`, {
        id: flower.id,
        first_image: flower.first_image,
        image_urls: flower.image_urls,
        images: flower.images
      });
    });
  }

  // Categorías dinámicas
  const flowerCategories = useMemo(() => {
    const categoryNames = categories.map(cat => cat.name);
    return ["Todas", ...categoryNames];
  }, [categories]);

  // Mapear flores con URLs de imágenes correctas
  const mappedFlowers = useMemo(() => {
    if (!flowers) return [];
    
    return flowers.map(flower => {
      const imageUrl = getFlowerImageUrl(flower);
      
      console.log('🖼️ Procesando imagen para flor:', {
        id: flower.id,
        name: flower.name,
        first_image: flower.first_image,
        image_urls: flower.image_urls,
        images: flower.images,
        final_url: imageUrl
      });
      
      return {
        id: flower.id,
        name: flower.name,
        price: parseFloat(flower.price.toString()) || 0,
        originalPrice: flower.original_price ? parseFloat(flower.original_price.toString()) : undefined,
        image: imageUrl,
        category: flower.category?.name || 'Sin categoría',
        color: flower.color || 'Multicolor',
        occasion: flower.occasion || 'Todas las ocasiones',
        rating: flower.rating || 5,
        reviews: flower.reviews_count || 0,
        stock: flower.stock || 0,
        isOnSale: flower.is_on_sale || false,
        discount: flower.discount_percentage || 0,
        isActive: flower.is_active !== false,
        isFavorite: favorites.includes(flower.id),
        popular: flower.views > 50,
        new: false,
        flowerData: flower
      };
    });
  }, [flowers, favorites]);

  // Filtros aplicados
  const filteredFlowers = useMemo(() => {
    let filtered = mappedFlowers.filter(flower => flower.isActive);

    // Filtro por categoría
    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(flower => flower.category === selectedCategory);
    }

    // Filtro por precio
    filtered = filtered.filter(flower => 
      flower.price >= priceRange[0] && flower.price <= priceRange[1]
    );

    // Filtro por colores
    if (selectedColors.length > 0) {
      filtered = filtered.filter(flower => 
        selectedColors.some(color => 
          flower.color.toLowerCase().includes(color.toLowerCase())
        )
      );
    }

    // Filtro por ocasiones
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter(flower =>
        selectedOccasions.some(occasion =>
          flower.occasion.toLowerCase().includes(occasion.toLowerCase())
        )
      );
    }

    return filtered;
  }, [mappedFlowers, selectedCategory, priceRange, selectedColors, selectedOccasions]);

  // Ordenamiento
  const sortedFlowers = useMemo(() => {
    const sorted = [...filteredFlowers];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.reviews + b.rating * 10) - (a.reviews + a.rating * 10));
    }
  }, [filteredFlowers, sortBy]);

  // Handlers
  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSelectedCategoryId(category === "Todas" ? undefined : 
      categories.find(cat => cat.name === category)?.id
    );
  }, [categories]);

  const handleAddToCart = useCallback((flower: MappedFlower) => {
    if (!flower.isActive || flower.stock <= 0) return;
    
    const cartItem = prepareFlowerForCart(flower.flowerData);
    addToCart(cartItem);
  }, [addToCart]);

  const resetFilters = useCallback(() => {
    setSelectedCategory("Todas");
    setSelectedCategoryId(undefined);
    setSortBy("popular");
    setPriceRange([0, 2500]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setSelectedSubfilter("Todos");
    setSearchTerm("");
  }, []);

  // Render loading state
  if (flowersLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(20)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (flowersError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 text-lg mb-4">Error al cargar las flores: {flowersError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Catálogo de Flores</h1>
        <p className="text-gray-600">Descubre nuestra colección de {sortedFlowers.length} flores frescas</p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar flores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>

          {/* Vista */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Ordenamiento */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros desplegables */}
      {showFilters && (
        <div className="mb-6">
          <ModernFilters
            categories={flowerCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            selectedColor={selectedColors.length > 0 ? selectedColors[0] : "Todos"}
            onColorChange={(color) => setSelectedColors(color === "Todos" ? [] : [color])}
            selectedOccasion={selectedOccasions.length > 0 ? selectedOccasions[0] : "Todas las ocasiones"}
            onOccasionChange={(occasion) => setSelectedOccasions(occasion === "Todas las ocasiones" ? [] : [occasion])}
            selectedSubfilter={selectedSubfilter}
            onSubfilterChange={setSelectedSubfilter}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      )}

      {/* Grid/Lista de flores */}
      {sortedFlowers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No se encontraron flores con los filtros seleccionados</p>
          <button
            onClick={resetFilters}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
            : "flex flex-col gap-4"
          }
        >
          {sortedFlowers.map((flower) => (
            <motion.div
              key={flower.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={viewMode === 'grid' 
                ? "bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-200"
                : "bg-white rounded-xl shadow-md overflow-hidden flex group hover:shadow-lg transition-shadow duration-200"
              }
            >
              {/* Imagen */}
              <div className={viewMode === 'grid' ? "relative h-48 overflow-hidden" : "relative w-32 h-32 flex-shrink-0 overflow-hidden"}>
                <div className="absolute inset-0 bg-pink-light" style={{ backgroundColor: '#F89ACE' }}></div>
                
                <ImageWithLoader
                  src={flower.image}
                  alt={flower.name}
                  width={viewMode === 'grid' ? 300 : 128}
                  height={viewMode === 'grid' ? 200 : 128}
                  quality={60}
                  loading="lazy"
                  className="relative z-10 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                  {flower.isOnSale && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      -{flower.discount}%
                    </span>
                  )}
                  {flower.popular && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                {/* Botones superpuestos */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                  <button
                    onClick={() => toggleFavorite(flower.id)}
                    className={`p-1.5 rounded-full text-xs ${
                      flower.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-red-50'
                    } shadow-sm transition-colors duration-200`}
                  >
                    <Heart className={`h-3 w-3 ${flower.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>              {/* Contenido */}
              <div className={viewMode === 'grid' ? "p-4" : "flex-1 p-4 flex flex-col justify-between"}>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                    {flower.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{flower.category}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < flower.rating ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({flower.reviews})</span>
                  </div>
                </div>

                {/* Precio y botón */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {flower.originalPrice && flower.originalPrice > flower.price && (
                        <span className="text-xs text-gray-500 line-through">
                          S/ {flower.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="font-bold text-pink-600">
                        S/ {flower.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Stock: {flower.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(flower)}
                    disabled={!flower.isActive || flower.stock <= 0}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors duration-200"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {flower.stock > 0 ? 'Agregar' : 'Sin Stock'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
