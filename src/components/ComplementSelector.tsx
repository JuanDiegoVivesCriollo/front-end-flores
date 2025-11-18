'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useCart, type CartItem } from '@/context/CartContext';
import { apiClient } from '@/services/api';

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

interface Complement {
  id: number;
  name: string;
  price: number;
  image: string;
  type: 'globos' | 'peluches' | 'chocolates';
  description: string;
  brand?: string;
  size?: string;
  stock: number;
  is_active: boolean;
}

interface ComplementSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComplementSelector({ isOpen, onClose }: ComplementSelectorProps) {
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'globos' | 'peluches' | 'chocolates'>('all');
  const { addToCart } = useCart();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComplements();
    }
  }, [isOpen]);

  const fetchComplements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplements();
      if (response.success && response.data) {
        // Los datos están en response.data.data debido a la paginación
        const complementsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setComplements(complementsData.filter((comp: Complement) => comp.is_active && comp.stock > 0));
      } else {
        setError('Error al cargar complementos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching complements:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplements = selectedType === 'all' 
    ? complements 
    : complements.filter(comp => comp.type === selectedType);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handleAddComplement = (complement: Complement) => {
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: complement.id,
      name: complement.name,
      price: complement.price,
      image: normalizeComplementImageUrl(complement.image),
      category: 'Complementos',
      color: 'Varios',
      description: complement.description,
      rating: 4.5, // Default rating for complements
      reviews: 0,
      type: 'complement',
      complementType: complement.type,
      size: complement.size,
      brand: complement.brand,
    };

    addToCart(cartItem);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'globos':
        return '🎈';
      case 'peluches':
        return '🧸';
      case 'chocolates':
        return '🍫';
      default:
        return '🎁';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'globos':
        return 'Globos';
      case 'peluches':
        return 'Peluches';
      case 'chocolates':
        return 'Chocolates';
      default:
        return 'Todos';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full bg-white rounded-t-2xl max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Agregar Complementos
            </h3>
            <p className="text-sm text-gray-500">
              Haz tu regalo aún más especial
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-100 overflow-x-auto">
          {(['all', 'globos', 'peluches', 'chocolates'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedType === type
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{getTypeIcon(type)}</span>
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-gray-500 mb-2">{error}</p>
                <button
                  onClick={fetchComplements}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredComplements.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <p className="text-gray-500">No hay complementos disponibles</p>
            </div>
          ) : (
            <div className="relative p-4">
              {/* Scroll Buttons */}
              <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Horizontal Scroll Container */}
              <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              >
                {filteredComplements.map((complement) => (
                  <motion.div
                    key={complement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                      {complement.image && complement.image !== '' ? (
                        <Image
                          src={normalizeComplementImageUrl(complement.image)}
                          alt={complement.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl">{getTypeIcon(complement.type)}</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-xs font-medium text-gray-600">
                          {getTypeIcon(complement.type)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-2">
                        {complement.name}
                      </h4>
                      
                      {complement.brand && (
                        <p className="text-xs text-gray-500 mb-1">{complement.brand}</p>
                      )}
                      
                      {complement.size && (
                        <p className="text-xs text-gray-500 mb-2">{complement.size}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-pink-600">
                          S/. {complement.price}
                        </span>
                        <button
                          onClick={() => handleAddComplement(complement)}
                          className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
