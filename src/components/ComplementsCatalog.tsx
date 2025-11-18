'use client';

import { useState, useMemo } from "react";
import { Heart, ShoppingCart, Star, Search, Grid, List, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import ProductDetailModal from "./ProductDetailModal";
import Image from "next/image";
import { useComplementTypes, useComplements } from "@/hooks/useComplements";

// Helper para normalizar URLs de imágenes de complementos
const normalizeComplementImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl || imageUrl.trim() === '') {
    return '/placeholder-flower.jpg'; // Usar placeholder por defecto
  }
  
  // Si ya es una URL completa (http/https), úsala directamente
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si es un path que comienza con /storage/, construir URL completa con la API STORAGE
  if (imageUrl.startsWith('/storage/')) {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://xn--floresdejazmnflorera-04bh.com/api/public/storage';
    // Remover el /storage/ del inicio ya que STORAGE_URL ya termina en /storage
    const pathWithoutStorage = imageUrl.replace('/storage/', '/');
    return `${storageUrl}${pathWithoutStorage}`;
  }
  
  // Si es un path relativo, asumir que es del storage de complementos
  if (!imageUrl.startsWith('/')) {
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://xn--floresdejazmnflorera-04bh.com/api/public/storage';
    return `${storageUrl}/img/complementos/${imageUrl}`;
  }
  
  return imageUrl;
};

const complementColors = [
  "Todos", "Rojo", "Blanco", "Rosa", "Amarillo", "Morado", "Naranja", "Azul", "Verde", "Negro", "Dorado", "Plateado", "Multicolor"
];

const complementSizes = [
  "Todos", "Pequeño", "Mediano", "Grande", "Extra Grande", "Set"
];

const complementBrands = [
  "Todas", "Chocolatería Premium", "Belgian Delights", "Amor Dulce", "Cacao Noir", "Dulces Tradición"
];

const sortOptions = [
  { label: "Más populares", value: "popular" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
  { label: "Mejor calificado", value: "rating" },
  { label: "Más reciente", value: "newest" }
];

export default function ComplementsCatalog() {
  // Filtros y estado
  const [selectedType, setSelectedType] = useState<string>("Todos");
  const [selectedColor, setSelectedColor] = useState<string>("Todos");
  const [selectedSize, setSelectedSize] = useState<string>("Todos");
  const [selectedBrand, setSelectedBrand] = useState<string>("Todas");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define Product type for modal compatibility
  interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    color: string;
    occasion: string; // Requerido para el modal
    rating?: number;
    reviews?: number;
    description?: string;
    new?: boolean;
    popular?: boolean;
    discount?: number;
    type?: string;
    size?: string;
    brand?: string;
  }

  // Hooks para datos de la API
  const { types } = useComplementTypes();
  
  // Calcular type_id de forma estable
  const selectedTypeParam = useMemo(() => {
    if (selectedType === "Todos") return undefined;
    return types.find(type => type.name === selectedType)?.id;
  }, [selectedType, types]);
  
  // Memoizar parámetros para evitar rerenders infinitos
  const complementsParams = useMemo(() => ({
    type: selectedTypeParam,
    search: searchTerm || undefined,
    per_page: 12,
    page: 1
  }), [selectedTypeParam, searchTerm]);
  
  const { 
    complements, 
    loading: complementsLoading, 
    error: complementsError
  } = useComplements(complementsParams);

  const { addToCart } = useCart();

  // Debug logs
  console.log('🎁 ComplementsCatalog render:', {
    complementsLoading,
    complementsError,
    complementsCount: complements?.length || 0,
    typesCount: types?.length || 0
  });

  // Tipos dinámicos de la API
  const complementTypes = useMemo(() => {
    const typeNames = types.map(type => type.name);
    return ["Todos", ...typeNames];
  }, [types]);

  // Mapear datos de la API al formato del componente
  const mappedComplements = useMemo(() => {
    if (!complements) return [];
    
    return complements.map(complement => {
      // Obtener la URL de imagen usando la función helper
      let imageUrl = '';
      
      // Priorizar first_image si está disponible (viene del backend procesado)
      if (complement.first_image) {
        imageUrl = complement.first_image;
      } else if (complement.image_urls && complement.image_urls.length > 0) {
        imageUrl = complement.image_urls[0];
      } else if (complement.images) {
        // Manejar diferentes formatos de images
        if (Array.isArray(complement.images) && complement.images.length > 0) {
          imageUrl = complement.images[0];
        } else if (typeof complement.images === 'string') {
          try {
            const parsedImages = JSON.parse(complement.images);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              imageUrl = parsedImages[0];
            } else {
              imageUrl = complement.images;
            }
          } catch {
            imageUrl = complement.images;
          }
        }
      }
      
      // Normalizar la URL con la función helper
      const normalizedImageUrl = normalizeComplementImageUrl(imageUrl);
      
      return {
        id: complement.id,
        name: complement.name,
        price: parseFloat(complement.price.toString()) || 0,
        originalPrice: complement.original_price ? parseFloat(complement.original_price.toString()) : undefined,
        image: normalizedImageUrl,
        category: complement.type || 'Sin categoría',
        color: complement.color || 'Multicolor',
        size: complement.size || 'Estándar',
        brand: complement.brand || 'Sin marca',
        rating: complement.rating || 5,
        reviews: complement.reviews_count || 0,
        isOnSale: complement.is_on_sale || (complement.discount_percentage > 0),
        isFavorite: favorites.includes(complement.id),
        description: complement.description || complement.short_description || '',
        popular: complement.is_featured,
        new: false,
        discount: complement.discount_percentage || 0,
        stock: complement.stock || 0,
        is_active: complement.is_active,
        type: complement.type
      };
    });
  }, [complements, favorites]);

  // Filtros aplicados
  const filteredComplements = useMemo(() => {
    return mappedComplements.filter(complement => {
      // Filtro por color
      if (selectedColor !== "Todos" && complement.color && !complement.color.toLowerCase().includes(selectedColor.toLowerCase())) {
        return false;
      }
      
      // Filtro por tamaño
      if (selectedSize !== "Todos" && complement.size && !complement.size.toLowerCase().includes(selectedSize.toLowerCase())) {
        return false;
      }
      
      // Filtro por marca
      if (selectedBrand !== "Todas" && complement.brand && !complement.brand.toLowerCase().includes(selectedBrand.toLowerCase())) {
        return false;
      }
      
      // Filtro por rango de precio
      const complementPrice = parseFloat(complement.price.toString()) || 0;
      if (complementPrice < priceRange[0] || complementPrice > priceRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [mappedComplements, selectedColor, selectedSize, selectedBrand, priceRange]);

  // Complementos ordenados
  const sortedComplements = useMemo(() => {
    const sorted = [...filteredComplements];
    
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price.toString()) || 0;
          const priceB = parseFloat(b.price.toString()) || 0;
          return priceA - priceB;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price.toString()) || 0;
          const priceB = parseFloat(b.price.toString()) || 0;
          return priceB - priceA;
        });
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      case "popular":
      default:
        return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }
  }, [filteredComplements, sortBy]);

  const toggleFavorite = (complementId: number) => {
    setFavorites(prev => 
      prev.includes(complementId) 
        ? prev.filter(id => id !== complementId)
        : [...prev, complementId]
    );
  };

  const resetFilters = () => {
    setSelectedType("Todos");
    setSelectedColor("Todos");
    setSelectedSize("Todos");
    setSelectedBrand("Todas");
    setPriceRange([0, 200]);
    setSearchTerm("");
  };

  const handleAddToCart = (complement: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    color: string;
    size: string;
    brand: string;
    description: string;
    rating: number;
    reviews: number;
    originalPrice?: number;
    discount?: number;
    stock: number;
    is_active: boolean;
    type: string;
  }) => {
    // No permitir agregar al carrito complementos inactivos o sin stock
    if (!complement.is_active || complement.stock <= 0) {
      return;
    }
    
    addToCart({
      id: complement.id,
      name: complement.name,
      price: complement.price,
      image: complement.image || normalizeComplementImageUrl(''),
      category: complement.category,
      color: complement.color,
      occasion: `${complement.type} - ${complement.size}`,
      description: complement.description,
      rating: complement.rating,
      reviews: complement.reviews,
      originalPrice: complement.originalPrice,
      discount: complement.discount,
      type: 'complement',
      complementType: complement.type as 'globos' | 'peluches' | 'chocolates',
      size: complement.size,
      brand: complement.brand
    });
  };

  // Función para renderizar la grilla de complementos
  const renderComplementsGrid = () => {
    return (
      <>
        {/* Controles superiores */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Resultados */}
          <div>
            <p className="text-gray-600">
              Mostrando {sortedComplements.length} de {mappedComplements.length} complementos
              {selectedType !== "Todos" && (
                <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                  {selectedType}
                </span>
              )}
            </p>
          </div>

          {/* Controles de vista y orden */}
          <div className="flex gap-4">
            {/* Vista */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Ordenar */}
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

        {/* Grid/Lista de complementos */}
        {sortedComplements.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              No se encontraron complementos con los filtros aplicados
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Ver todos los complementos
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {sortedComplements.map((complement) => (
              <motion.div
                key={complement.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className={viewMode === 'grid' 
                  ? "bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300"
                  : "bg-white rounded-xl shadow-md overflow-hidden flex group hover:shadow-xl transition-all duration-300"
                }
              >
                {/* Imagen */}
                <div className={viewMode === 'grid' ? "relative h-80 overflow-hidden" : "relative w-48 h-48 flex-shrink-0 overflow-hidden"}>
                  <div className="w-full h-full bg-pink-light flex items-center justify-center">
                    <Image
                      src={complement.image}
                      alt={complement.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-flower.jpg';
                      }}
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {complement.isOnSale && complement.discount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{complement.discount}%
                      </span>
                    )}
                    {complement.popular && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Popular
                      </span>
                    )}
                    {complement.new && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Nuevo
                      </span>
                    )}
                  </div>

                  {/* Botón favorito */}
                  <button
                    onClick={() => toggleFavorite(complement.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-pink-50 transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        complement.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Botón de vista rápida */}
                  <button
                    onClick={() => {
                      setSelectedProduct({
                        ...complement,
                        occasion: `${complement.type} - ${complement.size}`,
                        type: complement.type,
                        size: complement.size,
                        brand: complement.brand
                      });
                      setIsModalOpen(true);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-pink-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* Contenido */}
                <div className={viewMode === 'grid' ? "p-6" : "p-6 flex-1"}>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {complement.name}
                    </h3>
                    <p className="text-sm text-gray-600">{complement.category}</p>
                    {complement.size && (
                      <p className="text-xs text-gray-500">Tamaño: {complement.size}</p>
                    )}
                    {complement.brand && (
                      <p className="text-xs text-gray-500">Marca: {complement.brand}</p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < complement.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600">({complement.reviews})</span>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      S/ {complement.price.toFixed(2)}
                    </span>
                    {complement.originalPrice && complement.originalPrice > complement.price && (
                      <span className="text-sm text-gray-500 line-through">
                        S/ {complement.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Botón de agregar al carrito */}
                  <button
                    onClick={() => handleAddToCart(complement)}
                    disabled={complement.stock <= 0 || !complement.is_active}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                      complement.stock <= 0 || !complement.is_active
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {!complement.is_active ? 'Sin Stock' : complement.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </>
    );
  };

  // Estados de carga y error - mantenemos los filtros visibles siempre
  const renderComplementsContent = () => {
    if (complementsLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando catálogo de complementos...</p>
          </div>
        </div>
      );
    }

    if (complementsError) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500">Error al cargar los complementos: {complementsError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Reintentar
          </button>
        </div>
      );
    }

    // Contenido normal de complementos
    return renderComplementsGrid();
  };

  return (
    <section id="complementos" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complementos Especiales
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agrega un toque especial a tu regalo con nuestros hermosos complementos: globos, peluches y chocolates de la mejor calidad.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Siempre visibles */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar complementos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Tipos */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="space-y-2">
                  {complementTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="mr-2 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Colores */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {complementColors.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tamaños */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {complementSizes.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marcas */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {complementBrands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rango de precio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio: S/ {priceRange[0]} - S/ {priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-4 py-2 text-pink-600 hover:text-pink-800 border border-pink-300 rounded-lg hover:bg-pink-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:w-3/4">
            {renderComplementsContent()}
          </div>
        </div>

        {/* Modal de detalle del producto */}
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </section>
  );
}
