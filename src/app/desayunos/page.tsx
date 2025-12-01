'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Coffee, Heart, Star, Clock, Truck, Gift, Sparkles, Filter, X, ShoppingCart, Users, Loader2, Search, UtensilsCrossed, Cake, Briefcase, Leaf, MessageCircle } from 'lucide-react';
import { breakfastsAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get correct image URL
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=400';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `${API_BASE.replace('/api/v1', '')}/storage/${imagePath}`;
};

interface Breakfast {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  images: string[];
  items_included: string[];
  is_featured: boolean;
  stock: number;
  preparation_time: number;
  serves: number;
}

// Tipos de desayuno para filtros (con iconos reales en lugar de emojis)
const breakfastTypes = [
  { id: 'all', name: 'Todos', icon: Sparkles },
  { id: 'romantic', name: 'Románticos', icon: Heart },
  { id: 'premium', name: 'Premium', icon: Star },
  { id: 'classic', name: 'Clásicos', icon: Coffee },
  { id: 'healthy', name: 'Saludables', icon: Leaf },
  { id: 'birthday', name: 'Cumpleaños', icon: Cake },
  { id: 'corporate', name: 'Corporativos', icon: Briefcase },
];

// Rangos de precio
const priceRanges = [
  { id: 'all', label: 'Todos los precios' },
  { id: 'under150', label: 'Menos de S/150' },
  { id: '150to200', label: 'S/150 - S/200' },
  { id: 'over200', label: 'Más de S/200' },
];

export default function DesayunosPage() {
  const [breakfasts, setBreakfasts] = useState<Breakfast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { addBreakfast, openCart } = useCart();

  useEffect(() => {
    loadBreakfasts();
  }, [selectedPrice, searchQuery]);

  const loadBreakfasts = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {};
      
      if (searchQuery) params.search = searchQuery;
      
      if (selectedPrice !== 'all') {
        if (selectedPrice === 'under150') {
          params.max_price = '150';
        } else if (selectedPrice === '150to200') {
          params.min_price = '150';
          params.max_price = '200';
        } else if (selectedPrice === 'over200') {
          params.min_price = '200';
        }
      }

      const response = await breakfastsAPI.getAll(params);
      setBreakfasts(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading breakfasts:', err);
      setError('No se pudieron cargar los desayunos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (breakfast: Breakfast) => {
    addBreakfast({
      id: breakfast.id,
      name: breakfast.name,
      price: breakfast.price,
      image_url: getImageUrl(breakfast.images?.[0]),
      quantity: 1,
    });
    openCart();
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedPrice('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedType !== 'all' || selectedPrice !== 'all' || searchQuery !== '';

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[75vh] min-h-[550px] max-h-[750px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=2000&auto=format&fit=crop"
            alt="Desayuno sorpresa con flores"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 via-amber-800/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        <div className="relative h-full flex items-center">
          <div className="container-wide">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full mb-6 border border-white/30">
                <Coffee className="w-4 h-4" />
                <span className="text-sm font-medium">Desayunos a Domicilio</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Despierta con
                <span className="block text-amber-300">una Sorpresa</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Combina el encanto de las flores con un delicioso desayuno. 
                La forma perfecta de decir &quot;te quiero&quot;.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="#menu" 
                  className="px-8 py-4 bg-white text-amber-700 font-semibold rounded-full hover:bg-amber-50 transition-all shadow-lg hover:shadow-xl"
                >
                  Ver Menú
                </a>
                <a
                  href="https://wa.me/51999888777?text=Hola, quisiera personalizar un desayuno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all"
                >
                  Personalizar
                </a>
              </div>

              <div className="flex gap-8 mt-10 pt-8 border-t border-white/20">
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-white/70 text-sm">Clientes felices</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">4.9</p>
                  <p className="text-white/70 text-sm">Calificación</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">24h</p>
                  <p className="text-white/70 text-sm">Anticipación mín.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section id="menu" className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="container-wide">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {breakfastTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedType === type.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{type.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {priceRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>

              <span className="text-sm text-gray-500">
                {breakfasts.length} {breakfasts.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden py-3 flex items-center justify-between gap-3">
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
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              Filtrar
              {hasActiveFilters && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
            </button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">Filtros</span>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Tipo de desayuno</label>
                <div className="flex flex-wrap gap-2">
                  {breakfastTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                          selectedType === type.id
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Precio</label>
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="text-amber-600 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Grid de Desayunos */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-wide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Coffee className="w-12 h-12 text-amber-500" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Preparando el menú...</h3>
              <p className="text-gray-500">Cargando los mejores desayunos para ti</p>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={loadBreakfasts}
                className="px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : breakfasts.length === 0 ? (
            <div className="text-center py-24">
              <div className="max-w-md mx-auto">
                {/* Ilustración decorativa */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <Coffee className="w-16 h-16 text-amber-400" />
                  </div>
                  <div className="absolute top-0 right-1/4 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <Heart className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="absolute bottom-2 left-1/4 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-display font-bold text-gray-800 mb-3">
                  {hasActiveFilters ? 'No hay coincidencias' : 'Próximamente'}
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  {hasActiveFilters 
                    ? 'No encontramos desayunos con esos filtros. Prueba con otras opciones o explora todo nuestro menú.'
                    : 'Estamos preparando los desayunos más deliciosos para ti. ¡Muy pronto podrás ordenarlos!'
                  }
                </p>
                
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    Ver todo el menú
                  </button>
                ) : (
                  <a
                    href="https://wa.me/51999888777?text=Hola, quisiera saber cuándo estarán disponibles los desayunos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Avísame cuando estén listos
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {breakfasts.map((breakfast) => (
                <BreakfastCard 
                  key={breakfast.id} 
                  breakfast={breakfast} 
                  onAddToCart={() => handleAddToCart(breakfast)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Puntualidad</h3>
              <p className="text-sm text-gray-600">Entrega a la hora exacta que elijas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Envío Cuidadoso</h3>
              <p className="text-sm text-gray-600">Todo llega perfecto y fresco</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Ingredientes Frescos</h3>
              <p className="text-sm text-gray-600">Calidad premium garantizada</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Personalizable</h3>
              <p className="text-sm text-gray-600">Añade complementos especiales</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container-wide">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
            ¿Cómo Funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Elige tu Desayuno', description: 'Selecciona el que más te guste', icon: UtensilsCrossed },
              { step: 2, title: 'Personaliza', description: 'Añade flores o complementos extra', icon: Sparkles },
              { step: 3, title: 'Programa la Entrega', description: 'Elige fecha, hora y dirección', icon: Clock },
              { step: 4, title: 'Sorprende', description: 'Nosotros nos encargamos del resto', icon: Gift },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center relative">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  {item.step < 4 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-amber-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=2000"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container-wide text-center relative">
          <Heart className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿Quieres algo único?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Personalizamos tu desayuno con los ingredientes y flores que prefieras
          </p>
          <a
            href="https://wa.me/51999888777?text=Hola, quisiera pedir un desayuno personalizado"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Crear Desayuno Personalizado
          </a>
        </div>
      </section>
    </main>
  );
}

function BreakfastCard({ breakfast, onAddToCart }: { breakfast: Breakfast; onAddToCart: () => void }) {
  const imageUrl = getImageUrl(breakfast.images?.[0]);
  
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={breakfast.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {breakfast.is_featured && (
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-md">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </div>
          )}
          {breakfast.discount_percentage > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{breakfast.discount_percentage}%
            </span>
          )}
        </div>

        {/* Quick add overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onAddToCart}
            className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 shadow-lg hover:bg-amber-50"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 group-hover:text-amber-600 transition-colors">
          {breakfast.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {breakfast.short_description || breakfast.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{breakfast.serves} {breakfast.serves > 1 ? 'personas' : 'persona'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{breakfast.preparation_time} min</span>
          </div>
        </div>

        {/* Includes preview */}
        {breakfast.items_included && breakfast.items_included.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {breakfast.items_included.slice(0, 3).map((item, i) => (
                <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                  {item}
                </span>
              ))}
              {breakfast.items_included.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{breakfast.items_included.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">S/ {breakfast.price}</span>
            {breakfast.original_price && breakfast.original_price > breakfast.price && (
              <span className="text-sm text-gray-400 line-through">S/ {breakfast.original_price}</span>
            )}
          </div>
          <Link
            href={`/checkout?breakfast=${breakfast.id}`}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Ordenar
          </Link>
        </div>
      </div>
    </div>
  );
}
