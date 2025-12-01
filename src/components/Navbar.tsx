'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Search, 
  MapPin, 
  Phone,
  Heart,
  ChevronDown,
  Flame,
  Sparkles,
  User,
  LogOut,
  Settings,
  Package,
  ChevronRight,
  LayoutDashboard,
  Eye
} from "lucide-react";
import { usePathname } from 'next/navigation';
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductDetailModal, { Product } from '@/components/ProductDetailModal';

// Types
interface FlowerType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

interface Flower {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  images?: string[];
  category?: { name: string; slug: string };
  flower_types?: FlowerType[];
  color?: string;
  description?: string;
}

// API y Storage URLs
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://xn--floresdejazmnflorera-04bh.com/api/public/api/v1';
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://xn--floresdejazmnflorera-04bh.com/api/public/storage';

const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return '/img/placeholder-flower.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  const cleanPath = imagePath.replace(/^\/?(storage\/)?/, '');
  return `${STORAGE_URL}/${cleanPath}`;
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [flowersLoading, setFlowersLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Flower | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { getItemCount, toggleCart } = useCart();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  
  const itemCount = getItemCount();

  // Fetch flowers for search suggestions
  const fetchFlowers = useCallback(async () => {
    try {
      setFlowersLoading(true);
      const res = await fetch(`${API_BASE}/catalog/flowers`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const flowersData = data.data || data || [];
        setFlowers(flowersData);
      }
    } catch (err) {
      console.error('Error fetching flowers:', err);
    } finally {
      setFlowersLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchFlowers();
  }, [fetchFlowers]);

  // Refetch when window gains focus (user returns from admin)
  useEffect(() => {
    const handleFocus = () => {
      fetchFlowers();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchFlowers();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchFlowers]);

  // Search suggestions - fuzzy matching with max 8 results
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const words = query.split(/\s+/);
    
    const matches = flowers.filter(flower => {
      const name = flower.name.toLowerCase();
      const description = (flower.description || '').toLowerCase();
      const category = flower.category?.name?.toLowerCase() || '';
      const color = (flower.color || '').toLowerCase();
      
      return words.every(word => 
        name.includes(word) ||
        description.includes(word) ||
        category.includes(word) ||
        color.includes(word)
      );
    });
    
    matches.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(query);
      const bNameMatch = b.name.toLowerCase().includes(query);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return 0;
    });
    
    return matches.slice(0, 8);
  }, [searchQuery, flowers]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (flower: Flower) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setIsSearchOpen(false);
    setSelectedProduct(flower);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Todos los links de navegación (van a la izquierda)
  const navItems = [
    { href: '/ramos', label: 'Ramos' },
    { href: '/ofertas', label: 'Ofertas' },
    { href: '/desayunos', label: 'Desayunos' },
    { href: '/ocasiones', label: 'Ocasiones' },
    { href: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Bar - Delivery Info */}
      <div className="bg-primary-600 text-white py-2 text-center text-sm">
        <div className="container-wide flex items-center justify-center gap-2">
          <span className="animate-pulse">🚚</span>
          <span className="font-medium">¡Envío GRATIS a Canto Rey!</span>
          <span className="hidden sm:inline text-primary-200">|</span>
          <span className="hidden sm:inline text-primary-100">Entregas en todo Lima y Callao</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-soft'
      }`}>
        <div className="container-wide relative">
          <div className="flex items-center justify-between h-24">
            
            {/* Left - Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive(item.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Center - Logo (Absolute positioned) */}
            <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group z-10">
              <div className="relative w-44 h-28 group-hover:scale-105 transition-transform">
                <Image
                  src="/img/logojazminwa.webp"
                  alt="Flores D'Jazmin"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Right - Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Button */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden xl:block max-w-[100px] truncate">
                        {user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn">
                        {/* Header con nombre */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-primary-600 font-medium mb-1">
                            {isAdmin ? '👑 Administrador' : '👤 Cliente'}
                          </p>
                          <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                        
                        {/* Admin Panel Link */}
                        {isAdmin && (
                          <div className="py-2 border-b border-gray-100">
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-50 to-pink-50 text-primary-700 hover:from-primary-100 hover:to-pink-100 transition-colors mx-2 rounded-xl"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <span className="font-semibold block">Panel de Admin</span>
                                <span className="text-xs text-primary-600">Gestionar tienda</span>
                              </div>
                              <ChevronRight className="w-5 h-5 ml-auto" />
                            </Link>
                          </div>
                        )}
                        
                        <div className="py-2">
                          <Link
                            href="/mis-pedidos"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="w-5 h-5 text-gray-400" />
                            <span>Mis Pedidos</span>
                          </Link>
                          <Link
                            href="/favoritos"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Heart className="w-5 h-5 text-gray-400" />
                            <span>Favoritos</span>
                          </Link>
                          <Link
                            href="/configuracion"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span>Configuración</span>
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors text-sm font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span>Ingresar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile - Left side with menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile - Right side actions */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => isAuthenticated ? setIsUserMenuOpen(!isUserMenuOpen) : openAuthModal('login')}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Expandable with Suggestions */}
        <div className={`transition-all duration-300 border-t border-gray-100 ${
          isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible h-0 overflow-hidden'
        }`}>
          <div className="container-wide py-4">
            <div className="relative max-w-2xl mx-auto" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Buscar flores, ramos, ocasiones..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    // Siempre mostrar sugerencias si hay 2+ caracteres
                    if (value.length >= 2) {
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setShowSuggestions(true);
                  }}
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-gray-200 bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                  autoFocus={isSearchOpen}
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions Dropdown - Con resultados */}
              {showSuggestions && searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {searchSuggestions.length} resultado{searchSuggestions.length !== 1 ? 's' : ''} encontrado{searchSuggestions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {searchSuggestions.map((flower) => (
                      <button
                        key={flower.id}
                        onClick={() => handleSuggestionClick(flower)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-pink-50 transition-colors text-left group"
                      >
                        {/* Product Image */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                          <img
                            src={getImageUrl(flower.images?.[0])}
                            alt={flower.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate group-hover:text-pink-600 transition-colors">
                            {flower.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Mostrar tipos de flores si existen */}
                            {flower.flower_types && flower.flower_types.length > 0 ? (
                              <>
                                {flower.flower_types.slice(0, 2).map((type) => (
                                  <span 
                                    key={type.id}
                                    className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full"
                                  >
                                    {type.icon && <span className="mr-1">{type.icon}</span>}
                                    {type.name}
                                  </span>
                                ))}
                                {flower.flower_types.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{flower.flower_types.length - 2}
                                  </span>
                                )}
                              </>
                            ) : flower.category ? (
                              <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                                {flower.category.name}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            S/ {Number(flower.price).toFixed(2)}
                            {flower.original_price && Number(flower.original_price) > Number(flower.price) && (
                              <span className="text-xs text-gray-400 line-through ml-2 font-normal">
                                S/ {Number(flower.original_price).toFixed(2)}
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-pink-600" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Loading state */}
              {showSuggestions && searchQuery.length >= 2 && flowersLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] p-6 text-center">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Buscando...</p>
                </div>
              )}
              
              {/* No results message */}
              {showSuggestions && searchQuery.length >= 2 && !flowersLoading && searchSuggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100] p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No encontramos resultados</p>
                  <p className="text-sm text-gray-400 mt-1">Intenta con otras palabras clave</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-[500px] border-t border-gray-100' : 'max-h-0'
        }`}>
          <div className="container-wide py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile Quick Actions */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {/* User Section Mobile */}
              {isAuthenticated ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {isAdmin ? '👑 Administrador' : user?.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Admin Link Mobile */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 w-full mb-3 py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <div className="flex-1">
                        <span className="font-semibold block">Panel de Admin</span>
                        <span className="text-xs text-white/80">Gestionar tienda</span>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/mis-pedidos"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2 bg-white rounded-lg text-gray-700 text-sm"
                    >
                      <Package className="w-4 h-4" />
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg text-red-600 text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Salir
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium"
                >
                  <User className="w-5 h-5" />
                  Iniciar Sesión
                </button>
              )}

              <div className="flex gap-3">
                <Link
                  href="/favoritos"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favoritos</span>
                </Link>
                <a
                  href="https://wa.me/51919642610"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 text-green-600"
                >
                  <Phone className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Modal from Search - Reutilizando el mismo modal del catálogo */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={closeProductModal}
        product={selectedProduct as Product | null}
        allProducts={flowers as Product[]}
      />
    </>
  );
}
