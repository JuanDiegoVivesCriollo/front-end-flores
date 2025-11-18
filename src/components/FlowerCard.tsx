'use client';

import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import ImageWithLoader from "@/components/ImageWithLoader";

export type FlowerCardData = {
  id: number;
  name: string;
  price: number;
  image?: string;
  first_image?: string;
  image_urls?: string[];
  category?: string | { name: string };
  short_description?: string;
  rating?: number;
  reviews_count?: number;
  reviews?: number;
  stock?: number;
  is_active?: boolean;
  discount_percentage?: number;
  discount?: number;
  original_price?: number;
  originalPrice?: number;
  isFavorite?: boolean;
  new?: boolean;
  popular?: boolean;
  isOnSale?: boolean;
  slug?: string;
  color?: string;
  occasion?: string;
  description?: string;
};

interface FlowerCardProps {
  flower: FlowerCardData;
  viewMode?: 'grid' | 'list';
  onFavoriteToggle: (id: number) => void;
  onAddToCart: (flower: FlowerCardData) => void;
  onViewDetails: (flower: FlowerCardData) => void;
}


export default function FlowerCard({ 
  flower, 
  viewMode = 'grid', 
  onFavoriteToggle, 
  onAddToCart, 
  onViewDetails
}: FlowerCardProps) {
  const isOutOfStock = !flower.stock || flower.stock <= 0 || !flower.is_active;
  const discountPercentage = flower.discount_percentage || flower.discount || 0;
  const originalPrice = flower.original_price || flower.originalPrice || flower.price;
  const categoryName = typeof flower.category === 'string' ? flower.category : flower.category?.name || 'Flores';

  return (
    <div
      onClick={() => onViewDetails(flower)}
      className={viewMode === 'grid' 
        ? "bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        : "bg-white rounded-xl shadow-md overflow-hidden flex group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      }
    >
      {/* Imagen */}
      <div className={viewMode === 'grid' ? "relative h-48 overflow-hidden" : "relative w-32 h-32 flex-shrink-0 overflow-hidden"}>
        {/* Fondo rosa fijo */}
        <div className="absolute inset-0 bg-pink-light" style={{ backgroundColor: '#F89ACE' }}></div>
        
        {/* Imagen optimizada */}
        <ImageWithLoader
          src={flower.image || flower.first_image || flower.image_urls?.[0] || '/img/placeholder.jpg'}
          alt={flower.name}
          width={viewMode === 'grid' ? 300 : 128}
          height={viewMode === 'grid' ? 200 : 128}
          quality={60}
          sizes={viewMode === 'grid' ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" : "128px"}
          loading="lazy"
          className="relative z-10 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundColor: 'transparent'
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {(flower.isOnSale || discountPercentage > 0) && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {flower.popular && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Popular
            </span>
          )}
          {flower.new && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Nuevo
            </span>
          )}
        </div>

        {/* Botones superpuestos */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(flower.id);
            }}
            className={`p-1.5 rounded-full text-xs ${
              flower.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-red-50'
            } shadow-sm transition-colors duration-200`}
          >
            <Heart className={`h-3 w-3 ${flower.isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(flower);
            }}
            className="p-1.5 bg-white text-gray-600 hover:bg-blue-50 rounded-full shadow-sm transition-colors duration-200"
          >
            <Eye className="h-3 w-3" />
          </button>
        </div>

        {/* Stock warning o flor inactiva */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={viewMode === 'grid' ? "p-3" : "p-3 flex-1"}>
        <div className="mb-2">
          <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2">{flower.name}</h3>
          {flower.short_description && (
            <p className="text-xs text-gray-600 mb-1 line-clamp-2">{flower.short_description}</p>
          )}
          <p className="text-xs text-gray-500">{categoryName}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < (flower.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({flower.reviews_count || flower.reviews || 0})</span>
        </div>

        {/* Precio */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-base font-bold text-gray-900">
            S/ {(parseFloat(flower.price?.toString() || '0') || 0).toFixed(2)}
          </span>
          {discountPercentage > 0 && originalPrice > flower.price && (
            <span className="text-xs text-gray-500 line-through">
              S/ {(parseFloat(originalPrice?.toString() || '0') || 0).toFixed(2)}
            </span>
          )}
        </div>

        {/* Botón compacto */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) {
              onAddToCart(flower);
            }
          }}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-pink-500 text-white hover:bg-pink-600'
          }`}
        >
          <ShoppingCart className="h-3 w-3" />
          {isOutOfStock ? 'Sin Stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}
