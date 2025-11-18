'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'hero' | 'list' | 'grid';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  type = 'card', 
  count = 1, 
  className = "" 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
            {/* Imagen del producto */}
            <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse relative">
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Contenido */}
            <div className="p-4 space-y-3">
              {/* Título */}
              <div className="h-5 bg-gray-300 rounded animate-pulse"></div>
              
              {/* Descripción */}
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              
              {/* Precio */}
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-pink-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="relative h-96 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-2xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl opacity-30"
              >
                🌸
              </motion.div>
            </div>
            <div className="absolute bottom-8 left-8 space-y-4">
              <div className="h-8 w-64 bg-white bg-opacity-30 rounded animate-pulse"></div>
              <div className="h-6 w-48 bg-white bg-opacity-20 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-white bg-opacity-40 rounded-full animate-pulse"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 w-20 bg-pink-200 rounded animate-pulse"></div>
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(count).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-5 w-16 bg-pink-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (type === 'grid') {
    return <div className={className}>{renderSkeleton()}</div>;
  }

  return (
    <div className={className}>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
