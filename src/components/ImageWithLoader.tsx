'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageWithLoaderProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  containerClassName?: string;
  loaderClassName?: string;
  showSkeleton?: boolean;
}

export default function ImageWithLoader({ 
  containerClassName = "", 
  loaderClassName = "",
  showSkeleton = true,
  ...imageProps 
}: ImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 flex items-center justify-center ${
              showSkeleton 
                ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse' 
                : 'bg-gray-100'
            } ${loaderClassName}`}
          >
            {showSkeleton ? (
              <div className="space-y-2 w-full p-4">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-pink-bright border-t-transparent rounded-full"
                />
                <span className="text-xs text-gray-500">Cargando...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center space-y-2">
            <div className="text-2xl">🌸</div>
            <p className="text-xs text-gray-500">Imagen no disponible</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            {...imageProps}
            alt={imageProps.alt || "Imagen"}
            quality={imageProps.quality || 75}
            sizes={imageProps.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            placeholder={imageProps.placeholder || "empty"}
            loading={imageProps.loading || "lazy"}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
