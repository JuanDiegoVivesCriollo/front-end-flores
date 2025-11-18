'use client';

import { useState, useMemo, useEffect, useRef } from "react";
import { Grid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import ProductDetailModal from "./ProductDetailModal";
import SkeletonLoader from "@/components/SkeletonLoader";
import ModernFilters from "@/components/ModernFilters";
import FlowerCard from "@/components/FlowerCard";
import CondolenciasNavigation from "@/components/CondolenciasNavigation";
import type { FlowerCardData } from "@/components/FlowerCard";
import { useCategories, useFlowers } from "@/hooks/useCatalog";
import { occasionMapping } from '@/config/occasions';
import type { Flower } from '@/types';

// Títulos con frases románticas y elegantes para cada ocasión
const occasionTitles: { [key: string]: string } = {
  'cumpleanos': '"Cada año merece flores que celebren tu luz"',
  'aniversario': '"El amor verdadero florece con el tiempo"',
  'amor': '"Porque algunas palabras solo se dicen con flores"',
  'para-el': '"Elegancia que habla sin palabras"',
  'pedida-mano': '"El momento donde dos corazones se vuelven uno"',
  'felicitaciones': '"Tus logros merecen flores tan especiales como tú"',
  'graduacion': '"El futuro florece en tus manos"',
  'mejorate-pronto': '"Flores que abrazan el alma y sanan el corazón"',
  'boda': '"Donde los sueños se visten de pétalos"',
  'san-valentin': '"El amor más puro se expresa en flores"',
  'dia-madre': '"Para quien nos enseñó que el amor no tiene límites"',
  'condolencias': 'Acompañamiento en momentos difíciles',
  'solo-porque-si': '"Los gestos más hermosos no necesitan ocasión"'
};

// Tipo para las flores mapeadas que incluye metadata
interface MappedFlowerData {
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
  isOnSale: boolean;
  isFavorite: boolean;
  description: string;
  short_description: string;
  popular: boolean;
  new: boolean;
  discount: number;
  stock: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  originalFlower: Flower; // Referencia al objeto original de la API
}

// Colores específicos para cada ocasión
const occasionColors: { [key: string]: string } = {
  'cumpleanos': 'from-yellow-500 to-orange-500',
  'aniversario': 'from-rose-500 to-pink-500',
  'amor': 'from-red-500 to-rose-600',
  'para-el': 'from-blue-600 to-indigo-600',
  'pedida-mano': 'from-purple-500 to-pink-500',
  'felicitaciones': 'from-green-500 to-emerald-500',
  'graduacion': 'from-blue-500 to-purple-500',
  'mejorate-pronto': 'from-cyan-500 to-blue-500',
  'boda': 'from-pink-400 to-rose-500',
  'san-valentin': 'from-red-600 to-pink-600',
  'dia-madre': 'from-pink-500 to-rose-400',
  'condolencias': 'from-gray-600 to-gray-700',
  'solo-porque-si': 'from-purple-400 to-pink-400'
};

const sortOptions = [
  { label: "Más populares", value: "popular" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
  { label: "Mejor calificado", value: "rating" },
  { label: "Más reciente", value: "newest" }
];

interface FlowerCatalogRealProps {
  initialOccasion?: string;
  hideFilters?: boolean;
}

export default function FlowerCatalogReal({ initialOccasion = "", hideFilters = false }: FlowerCatalogRealProps) {
  const router = useRouter();
  
  // Filtros y estado
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedColor, setSelectedColor] = useState<string>("Todos");
  const [selectedOccasion, setSelectedOccasion] = useState<string>(() => {
    if (initialOccasion === "all-condolencias") {
      return "all-condolencias";
    } else if (initialOccasion && occasionMapping[initialOccasion]) {
      return occasionMapping[initialOccasion];
    } else {
      return "Todas";
    }
  });
  const [selectedSubfilter, setSelectedSubfilter] = useState<string>("Todos"); // Simplificado
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2500]);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // 20 flores por página para mejor rendimiento

  // Ref para scroll al catálogo
  const catalogRef = useRef<HTMLDivElement>(null);
  const flowersGridRef = useRef<HTMLDivElement>(null); // Referencia específica para el grid de flores

  // Define Product type for modal compatibility
  interface Product {
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
    new?: boolean;
    popular?: boolean;
    discount?: number;
  }

  // Hooks para datos de la API
  const { categories } = useCategories();
  
  // Calcular category_id de forma estable
  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === "Todas") return undefined;
    return categories.find(cat => cat.name === selectedCategory)?.id;
  }, [selectedCategory, categories]);
  
  // Memoizar parámetros para evitar rerenders infinitos
  const flowersParams = useMemo(() => {
    const params: {
      category_id?: number;
      search?: string;
      per_page: number;
      page: number;
      occasion?: string;
    } = {
      category_id: selectedCategoryId,
      search: searchTerm || undefined,
      per_page: 100, // Obtener todas las flores para filtrar en frontend
      page: 1
    };

    // SIMPLIFICADO: Aplicar filtro de ocasión si existe
    if (selectedOccasion && selectedOccasion !== "Todas") {
      params.occasion = selectedOccasion;
    }

    return params;
  }, [selectedCategoryId, searchTerm, selectedOccasion]);
  
  const { 
    flowers, 
    loading: flowersLoading, 
    error: flowersError
  } = useFlowers(flowersParams);

  const { addToCart } = useCart();

  // Debug logs
  // console.log('🌸 FlowerCatalogReal render:', {
  //   flowersLoading,
  //   flowersError,
  //   flowersCount: flowers?.length || 0,
  //   categoriesCount: categories?.length || 0
  // });

  // Categorías dinámicas de la API
  const flowerCategories = useMemo(() => {
    const categoryNames = categories.map(cat => cat.name);
    return ["Todas", ...categoryNames];
  }, [categories]);

  // Helper para procesar URLs de imágenes (CORREGIDO)
  const processImageUrl = (imageUrl: string | null | undefined): string => {
    // console.log('🔧 processImageUrl llamada con:', imageUrl);
    
    if (!imageUrl || imageUrl.trim() === '') {
      // console.log('🔧 processImageUrl: URL vacía, devolviendo placeholder');
      return '/img/placeholder.jpg';
    }
    
    // Si ya es una URL completa (http/https), úsala directamente
    if (imageUrl.startsWith('http')) {
      // console.log('🔧 processImageUrl: URL completa, usando directamente');
      return imageUrl;
    }
    
    // Si es solo un filename (sin /storage/), construir la ruta completa
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      // console.log('🔧 processImageUrl: Solo filename, construyendo ruta /storage/img/flores/');
      imageUrl = `/storage/img/flores/${imageUrl}`;
    }
    
    // Si comienza con /storage/, construir la URL correcta para producción
    if (imageUrl.startsWith('/storage/')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // CORREGIDO: Extraer correctamente la base URL
      // Si apiUrl es https://floresydetalleslima.com/api/public/api/v1
      // queremos obtener https://floresydetalleslima.com
      let baseUrl = apiUrl;
      
      // Remover /api/public/api/v1, /api/public, /api/v1, etc.
      baseUrl = baseUrl.replace(/\/api\/public\/api\/v1$/, '');
      baseUrl = baseUrl.replace(/\/api\/public$/, '');
      baseUrl = baseUrl.replace(/\/api\/v1$/, '');
      
      // Construir URL final: baseUrl + /api/public + imageUrl
      const finalUrl = `${baseUrl}/api/public${imageUrl}`;
      
      // console.log('🔧 processImageUrl: Procesando /storage/', {
      //   input: imageUrl,
      //   apiUrl,
      //   baseUrl,
      //   finalUrl
      // });
      return finalUrl;
    }
    
    // Para rutas que empiezan con slash, asumir que son del frontend
    if (imageUrl.startsWith('/')) {
      // console.log('🔧 processImageUrl: Ruta local frontend');
      return imageUrl;
    }
    
    // Para otros casos, usar placeholder
    // console.log('🔧 processImageUrl: Caso no manejado, usando placeholder');
    return '/img/placeholder.jpg';
  };

  // Mapear datos de la API al formato del componente
  const mappedFlowers = useMemo((): MappedFlowerData[] => {
    if (!flowers) return [];
    
    return flowers.map(flower => {
      // Priorizar URLs del backend que ya están procesadas
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
      
      // Debug: Log detallado de la flor para verificar URLs
      const processedImageUrl = processImageUrl(imageUrl);
      // console.log('🌸 DEBUG FlowerCatalogReal - Procesando flor:', {
      //   id: flower.id,
      //   name: flower.name,
      //   short_description: flower.short_description,
      //   has_short_description: !!flower.short_description,
      //   description: flower.description,
      //   all_fields: Object.keys(flower)
      // });
      
      return {
        id: flower.id,
        name: flower.name,
        price: parseFloat(flower.price.toString()) || 0,
        originalPrice: flower.original_price ? parseFloat(flower.original_price.toString()) : undefined,
        image: processedImageUrl, // Usar URL ya procesada
        category: flower.category?.name || 'Sin categoría',
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
        is_active: flower.is_active,
        metadata: flower.metadata || {}, // Agregar metadata al objeto mapeado
        originalFlower: flower // Mantener referencia al objeto original para casos especiales
      };
    });
  }, [flowers, favorites]);

  // Filtros aplicados - LÓGICA UNIFICADA PARA TODAS LAS OCASIONES
  const filteredFlowers = useMemo(() => {
    return mappedFlowers.filter((flower) => {
      // Filtro por color
      if (selectedColor !== "Todos" && !flower.color.toLowerCase().includes(selectedColor.toLowerCase())) {
        return false;
      }
      
      // Filtro por ocasión - TODAS las ocasiones funcionan igual
      if (selectedOccasion !== "Todas") {
        if (selectedOccasion === "all-condolencias") {
          // Caso especial: mostrar todas las flores de condolencias (las 4 ocasiones específicas)
          const condolenciasOccasions = ['Lágrimas de Piso', 'Mantos Especiales', 'Coronas', 'Trípodes'];
          const hasCondolenciasOccasion = condolenciasOccasions.some(occasion =>
            flower.occasion.toLowerCase().includes(occasion.toLowerCase())
          );
          if (!hasCondolenciasOccasion) {
            return false;
          }
        } else {
          // Filtro normal por ocasión específica
          if (!flower.occasion.toLowerCase().includes(selectedOccasion.toLowerCase())) {
            return false;
          }
        }
      }
      
      // Filtro por rango de precio
      const flowerPrice = parseFloat(flower.price.toString()) || 0;
      if (flowerPrice < priceRange[0] || flowerPrice > priceRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [mappedFlowers, selectedColor, selectedOccasion, priceRange]);

  // Flores ordenadas
  const sortedFlowers = useMemo(() => {
    const sorted = [...filteredFlowers];
    
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
  }, [filteredFlowers, sortBy]);

  // Paginación local
  const totalPages = Math.ceil(sortedFlowers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFlowers = sortedFlowers.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedColor, selectedOccasion, searchTerm, sortBy]);

  // Función para cambiar página con scroll al catálogo
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll suave al inicio del catálogo
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Sincronizar filtro de ocasión cuando cambia la prop initialOccasion
  useEffect(() => {
    // Solo sincronizar cuando initialOccasion cambie, NO cuando selectedOccasion cambie
    // Esto previene el reset automático cuando el usuario selecciona un filtro
    if (initialOccasion && occasionMapping[initialOccasion]) {
      const newOccasion = occasionMapping[initialOccasion];
      // Solo cambiar si es diferente al actual para evitar loops
      if (newOccasion !== selectedOccasion) {
        setSelectedOccasion(newOccasion);
      }
    }
    // REMOVIDO: El reset automático a "Todas" que causaba el problema
    // El usuario debe poder mantener sus selecciones de filtro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOccasion]); // CORREGIDO: Solo depender de initialOccasion, no de selectedOccasion

  const toggleFavorite = (flowerId: number) => {
    setFavorites(prev => 
      prev.includes(flowerId) 
        ? prev.filter(id => id !== flowerId)
        : [...prev, flowerId]
    );
  };

  const resetFilters = () => {
    setSelectedCategory("Todas");
    setSelectedColor("Todos");
    setSelectedOccasion("Todas");
    setSelectedSubfilter("Todos");
    setPriceRange([0, 2500]);
    setSearchTerm("");
  };

  const handleOccasionChange = (occasion: string) => {
    setSelectedOccasion(occasion);
    // Simplificado: resetear subfiltro siempre
    setSelectedSubfilter("Todos");
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

  return (
    <section id="catalogo" ref={catalogRef} className="py-16 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-200/30 to-rose-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-gradient-to-r from-orange-200/25 to-rose-200/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Verificar si es página de condolencias */}
          {(initialOccasion === 'lagrimas-piso' || 
            initialOccasion === 'mantos-especiales' || 
            initialOccasion === 'coronas' || 
            initialOccasion === 'tripodes' || 
            initialOccasion === 'all-condolencias') ? (
            
            /* Navegación especial para condolencias */
            <CondolenciasNavigation 
              currentOccasion={initialOccasion || selectedOccasion}
            />
            
          ) : initialOccasion && occasionTitles[initialOccasion] ? (
            <div className="space-y-6">
              {/* Título eliminado para páginas específicas de ocasiones */}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Decorative header con gradientes y elementos cute */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-rose-50/80 to-pink-50/60 rounded-3xl transform rotate-1 shadow-xl"></div>
                <div className="relative bg-gradient-to-r from-white/90 via-rose-50/90 to-pink-50/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-200/30 shadow-2xl">
                  
                  {/* Elementos decorativos flotantes */}
                  <div className="absolute top-4 left-6 text-pink-400/80 animate-bounce">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.045 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/>
                    </svg>
                  </div>
                  <div className="absolute top-6 right-8 text-purple-400/80 animate-pulse">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-4 left-8 text-orange-400/80 animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.061l-1.061 1.06a.75.75 0 001.06 1.061l1.061-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.061l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.061z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-6 right-6 text-rose-400/80 animate-pulse" style={{ animationDelay: '1s' }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd"/>
                    </svg>
                  </div>

                  {/* Contenido principal */}
                  <div className="relative z-10">
                    {/* Badge cute en la parte superior */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold mb-6 shadow-lg transform hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.045 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/>
                      </svg>
                      Flores que enamoran
                    </div>

                    {/* Título principal con gradiente */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                      <span className="bg-gradient-to-r from-pink-700 via-rose-600 to-purple-700 bg-clip-text text-transparent drop-shadow-sm">
                        Nuestro Mundo
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
                        de Flores Mágicas
                      </span>
                    </h2>

                    {/* Descripción con estilo cute */}
                    <div className="space-y-4">
                      <p className="text-lg text-gray-800 max-w-2xl mx-auto font-semibold leading-relaxed">
                        Cada flor cuenta una historia única
                      </p>
                      <p className="text-base text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                        Descubre arreglos florales que transforman momentos ordinarios en recuerdos extraordinarios. 
                        Desde ramos que susurran &ldquo;te amo&rdquo; hasta bouquets que gritan &ldquo;¡felicidades!&rdquo;, 
                        aquí encontrarás la flor perfecta para cada latido de tu corazón.
                      </p>
                    </div>

                    {/* Estadísticas cute */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8">
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-pink-200/50 hover:shadow-xl transition-shadow">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.045 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">100+ Diseños únicos</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-purple-200/50 hover:shadow-xl transition-shadow">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Flores frescas diarias</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-orange-200/50 hover:shadow-xl transition-shadow">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.53 10.96a.75.75 0 00-1.06 1.061l1.5 1.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">Entrega garantizada</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de búsqueda y controles */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Solo mostrar si no hay ocasión específica o si no están ocultos */}
          {!initialOccasion && !hideFilters && (
            <div className="lg:w-1/4">
              <ModernFilters
                categories={flowerCategories}
                selectedCategory={selectedCategory}
                selectedColor={selectedColor}
                selectedOccasion={selectedOccasion}
                selectedSubfilter={selectedSubfilter}
                priceRange={priceRange}
                sortBy={sortBy}
                searchTerm={searchTerm}
                onCategoryChange={setSelectedCategory}
                onColorChange={setSelectedColor}
                onOccasionChange={handleOccasionChange}
                onSubfilterChange={setSelectedSubfilter}
                onPriceRangeChange={setPriceRange}
                onSortChange={setSortBy}
                onSearchChange={setSearchTerm}
              />
            </div>
          )}

          {/* Contenido principal */}
          <div className={initialOccasion || hideFilters ? "w-full" : "lg:w-3/4"}>
            {/* Controles superiores */}
            <div ref={flowersGridRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {/* Resultados */}
              <div>
                <p className="text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, sortedFlowers.length)} de {sortedFlowers.length} flores
                  {initialOccasion && occasionMapping[initialOccasion] && (
                    <span className="ml-2 px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full text-sm font-medium">
                      {occasionMapping[initialOccasion]}
                    </span>
                  )}
                  {selectedCategory !== "Todas" && !initialOccasion && (
                    <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                      {selectedCategory}
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

            {/* Grid/Lista de flores */}
            {flowersLoading ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
                : "flex flex-col gap-4"
              }>
                {[...Array(8)].map((_, index) => (
                  <SkeletonLoader 
                    key={index} 
                    type="card" 
                    className={viewMode === 'grid' ? "rounded-xl" : "rounded-xl h-48 flex"} 
                  />
                ))}
              </div>
            ) : flowersError ? (
              <div className="text-center py-20">
                <p className="text-red-500">Error al cargar las flores: {flowersError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Reintentar
                </button>
              </div>
            ) : sortedFlowers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">
                  No se encontraron flores con los filtros aplicados
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Ver todas las flores
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  : "space-y-4"
                }>
                  {paginatedFlowers.map((flower) => {
                    // Preparar datos para el FlowerCard
                    const flowerData = {
                      ...flower,
                      isFavorite: favorites.includes(flower.id),
                      reviews: flower.reviews || 0
                    };
                    
                    return (
                      <FlowerCard
                        key={flower.id}
                        flower={flowerData}
                        viewMode={viewMode}
                        onFavoriteToggle={toggleFavorite}
                        onAddToCart={handleAddToCart}
                        onViewDetails={(flowerItem) => {
                          const product: Product = {
                            id: flowerItem.id,
                            name: flowerItem.name,
                            price: flowerItem.price,
                            originalPrice: flowerItem.originalPrice || flowerItem.original_price,
                            image: flowerItem.image || flowerItem.first_image || '/img/placeholder.jpg',
                            category: typeof flowerItem.category === 'string' ? flowerItem.category : flowerItem.category?.name || 'Flores',
                            color: flower.color,
                            occasion: flower.occasion,
                            rating: flowerItem.rating,
                            reviews: flowerItem.reviews || flowerItem.reviews_count,
                            description: flower.description,
                            short_description: flowerItem.short_description,
                            new: flowerItem.new,
                            popular: flowerItem.popular,
                            discount: flowerItem.discount || flowerItem.discount_percentage
                          };
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>

              {/* Controles de Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar solo páginas relevantes
                    const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                    
                    if (!showPage && page !== currentPage - 3 && page !== currentPage + 3) {
                      return null;
                    }
                    
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-pink-bright text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    →
                  </button>
                  
                  <div className="ml-4 text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>
              )}
              
              {/* Contenido adicional cuando hay pocas flores */}
              {sortedFlowers.length > 0 && sortedFlowers.length <= 8 && (
                <div className="mt-16 space-y-12">
                  {/* Sección de sugerencias */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        ¿No encontraste lo que buscabas?
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Explora nuestras otras categorías o descubre más opciones
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-pink-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6h6v10H9V6z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Arreglos Personalizados</h4>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Crea un arreglo único según tus preferencias y presupuesto
                        </p>
                        <button 
                          onClick={() => router.push('/contacto')}
                          className="text-pink-600 font-medium hover:text-pink-700 flex items-center gap-2"
                        >
                          Solicitar personalización
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-purple-100 p-3 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Complementos</h4>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Añade chocolates, peluches o tarjetas para hacer tu regalo más especial
                        </p>
                        <button 
                          onClick={() => router.push('/complementos')}
                          className="text-purple-600 font-medium hover:text-purple-700 flex items-center gap-2"
                        >
                          Ver complementos
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sección de consejos */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Tips para tu ocasión especial
                      </h3>
                      <p className="text-gray-600">
                        Consejos útiles para hacer de tu regalo algo memorable
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Timing perfecto</h4>
                        <p className="text-gray-600 text-sm">
                          Programa tu entrega para momentos especiales del día
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mensaje personal</h4>
                        <p className="text-gray-600 text-sm">
                          Incluye una tarjeta con un mensaje desde el corazón
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Presentación especial</h4>
                        <p className="text-gray-600 text-sm">
                          Nuestros arreglos vienen en hermosas presentaciones
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Call to action */}
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">¿Necesitas ayuda para decidir?</h3>
                    <p className="text-pink-100 mb-6 text-lg">
                      Nuestro equipo está listo para ayudarte a encontrar el regalo perfecto
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => router.push('/contacto')}
                        className="bg-white text-pink-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Contactar asesor
                      </button>
                      <button 
                        onClick={() => {
                          resetFilters();
                          router.push('/flores');
                        }}
                        className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-pink-600 transition-colors"
                      >
                        Ver todas las flores
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
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
