'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Truck, Shield, Heart, Star, ShoppingCart, Filter, X, Search, Loader2 } from 'lucide-react';
import { flowersAPI, categoriesAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';

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
  short_description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  color: string;
  occasion: string;
  images: string[];
  rating: number;
  reviews_count: number;
  stock: number;
  is_featured: boolean;
  is_on_sale: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  flowers_count: number;
}

export default function RamosPage() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { addFlower, openCart } = useCart();

  // Colores disponibles
  const colors = ['Rojo', 'Rosa', 'Blanco', 'Amarillo', 'Morado', 'Naranja', 'Mixto'];
  
  // Ocasiones disponibles
  const occasions = ['Cumpleaños', 'Aniversario', 'Amor', 'Condolencias', 'Graduación', 'Día de la Madre', 'San Valentín'];

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedColor, selectedOccasion, priceRange, sortBy, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Construir parámetros de búsqueda
      const params: Record<string, string> = {
        sort_by: sortBy,
      };
      
      if (selectedCategory !== 'all') params.category_id = selectedCategory;
      if (selectedColor !== 'all') params.color = selectedColor;
      if (selectedOccasion !== 'all') params.occasion = selectedOccasion;
      if (searchQuery) params.search = searchQuery;
      
      if (priceRange !== 'all') {
        if (priceRange === 'under100') {
          params.max_price = '100';
        } else if (priceRange === '100to200') {
          params.min_price = '100';
          params.max_price = '200';
        } else if (priceRange === 'over200') {
          params.min_price = '200';
        }
      }

      const [flowersRes, categoriesRes] = await Promise.all([
        flowersAPI.getAll(params),
        categoriesAPI.getAll(),
      ]);

      setFlowers(flowersRes.data || []);
      setCategories(categoriesRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (flower: Flower) => {
    addFlower({
      id: flower.id,
      name: flower.name,
      price: flower.price,
      image_url: getImageUrl(flower.images?.[0]),
      quantity: 1,
      discount_percentage: flower.discount_percentage,
      final_price: flower.price,
    });
    openCart();
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedOccasion('all');
    setPriceRange('all');
    setSortBy('popular');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedColor !== 'all' || 
    selectedOccasion !== 'all' || priceRange !== 'all' || searchQuery !== '';

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=2000&auto=format&fit=crop"
            alt="Hermoso ramo de flores frescas"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container-wide">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full mb-6 border border-white/30">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Arreglos Artesanales</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Ramos que 
                <span className="block text-pink-300">Enamoran</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Cada ramo cuenta una historia. Flores frescas seleccionadas con amor 
                para los momentos que importan.
              </p>
              
              <div className="flex flex-wrap gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Envío mismo día</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Frescura garantizada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Hechos con amor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Filtros y Búsqueda */}
      <section className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="container-wide py-4">
          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ramos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Color</option>
                {colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>

              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Ocasión</option>
                {occasions.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Precio</option>
                <option value="under100">Menos de S/100</option>
                <option value="100to200">S/100 - S/200</option>
                <option value="over200">Más de S/200</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="popular">Más populares</option>
                <option value="newest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="rating">Mejor valorados</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar
                </button>
              )}
            </div>

            <span className="text-sm text-gray-500">
              {flowers.length} {flowers.length === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
            </button>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtros</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">Todas</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">Todos</option>
                    {colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ocasión</label>
                  <select
                    value={selectedOccasion}
                    onChange={(e) => setSelectedOccasion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">Todas</option>
                    {occasions.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="all">Todos los precios</option>
                    <option value="under100">Menos de S/100</option>
                    <option value="100to200">S/100 - S/200</option>
                    <option value="over200">Más de S/200</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="popular">Más populares</option>
                    <option value="newest">Más recientes</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                    <option value="rating">Mejor valorados</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg font-medium"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Grid de Productos */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-wide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="px-6 py-2 bg-primary-500 text-white rounded-full"
              >
                Reintentar
              </button>
            </div>
          ) : flowers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No encontramos productos
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? 'Intenta con otros filtros o explora todas nuestras opciones'
                  : 'Aún no hay productos disponibles'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary-500 text-white rounded-full font-medium"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flowers.map((flower) => (
                <FlowerCard 
                  key={flower.id} 
                  flower={flower} 
                  onAddToCart={() => handleAddToCart(flower)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function FlowerCard({ flower, onAddToCart }: { flower: Flower; onAddToCart: () => void }) {
  const imageUrl = getImageUrl(flower.images?.[0]);
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={flower.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {flower.is_on_sale && flower.discount_percentage > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{flower.discount_percentage}%
            </span>
          )}
          {flower.is_featured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Destacado
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onAddToCart}
            className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 shadow-lg hover:bg-primary-50"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {flower.category && (
          <span className="text-xs text-primary-600 font-medium">{flower.category.name}</span>
        )}
        <h3 className="font-semibold text-gray-800 mt-1 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {flower.name}
        </h3>
        
        {/* Rating */}
        {flower.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-sm text-gray-600">{flower.rating}</span>
            {flower.reviews_count > 0 && (
              <span className="text-xs text-gray-400">({flower.reviews_count})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">S/ {flower.price}</span>
          {flower.original_price && flower.original_price > flower.price && (
            <span className="text-sm text-gray-400 line-through">S/ {flower.original_price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
